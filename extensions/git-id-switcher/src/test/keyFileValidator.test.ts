/**
 * Tests for ssh/keyFileValidator.ts
 *
 * Exercises validateKeyFileBeforeAddToAgent against real temporary files so
 * every validation stage (existence, type, size, permissions, format) and the
 * defensive error paths are covered by the unit suite.
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import { validateKeyFileBeforeAddToAgent } from '../ssh/keyFileValidator';
import { securityLogger } from '../security/securityLogger';

const IS_WINDOWS = process.platform === 'win32';
// Root bypasses permission checks, so access-denied scenarios cannot be built.
const IS_ROOT = typeof process.getuid === 'function' && process.getuid() === 0;

const OPENSSH_HEADER = '-----BEGIN OPENSSH PRIVATE KEY-----';
const KEY_CONTENT = `${OPENSSH_HEADER}\nAAAA\n-----END OPENSSH PRIVATE KEY-----\n`;
const OWNER_READ_WRITE = 0o600;
const MAX_FILE_SIZE = 1_048_576;
const MIN_FILE_SIZE = 10;

/**
 * The real (mutable) fs/promises module object. `import * as` yields a
 * read-only namespace copy, while the validator reads through the live module,
 * so patching has to happen on the object obtained from require.
 */
const realFs = createRequire(__filename)('node:fs/promises') as typeof fs;

async function createTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'git-id-switcher-keyvalidator-'));
}

async function cleanupTempDir(tmpDir: string): Promise<void> {
  try {
    // Restore access first so recursive removal works after chmod 000 tests
    await fs.chmod(tmpDir, 0o700);
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

async function writeKey(
  dir: string,
  name: string,
  content: string | Buffer,
  mode: number = OWNER_READ_WRITE,
): Promise<string> {
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, content);
  await fs.chmod(filePath, mode);
  return filePath;
}

async function expectResult(
  filePath: string,
  isValid: boolean,
  reason: string | undefined,
  message: string,
): Promise<void> {
  const result = await validateKeyFileBeforeAddToAgent(filePath);
  assert.strictEqual(result.valid, isValid, `${message}: valid`);
  assert.strictEqual(result.reason, reason, `${message}: reason`);
}

/**
 * Run a callback with securityLogger.logValidationFailure replaced, restoring
 * it afterwards. The replacement receives the original arguments.
 */
async function withPatchedLogger(
  replacement: (field: string, reason: string, value?: unknown) => void,
  run: () => Promise<void>,
): Promise<void> {
  const original = securityLogger.logValidationFailure;
  securityLogger.logValidationFailure = replacement;
  try {
    await run();
  } finally {
    securityLogger.logValidationFailure = original;
  }
}

async function testValidKeys(): Promise<void> {
  console.log('Testing valid key files...');
  const tmpDir = await createTempDir();
  try {
    const headers = [
      '-----BEGIN OPENSSH PRIVATE KEY-----',
      '-----BEGIN RSA PRIVATE KEY-----',
      '-----BEGIN DSA PRIVATE KEY-----',
      '-----BEGIN EC PRIVATE KEY-----',
      '-----BEGIN PRIVATE KEY-----',
      '-----BEGIN ENCRYPTED PRIVATE KEY-----',
      'PuTTY-User-Key-File-2: ssh-rsa',
      'PuTTY-User-Key-File-3: ssh-ed25519',
    ];
    for (const [index, header] of headers.entries()) {
      const filePath = await writeKey(tmpDir, `key_${index}`, `${header}\nbody\n`);
      await expectResult(filePath, true, undefined, `Header "${header}" should be accepted`);
    }

    const leading = await writeKey(tmpDir, 'key_leading_ws', `\n  \t${KEY_CONTENT}`);
    await expectResult(leading, true, undefined, 'Leading whitespace before header should be accepted');

    const readOnly = await writeKey(tmpDir, 'key_0400', KEY_CONTENT, 0o400);
    await expectResult(readOnly, true, undefined, 'Owner read-only (0400) should be accepted');

    const maxSize = await writeKey(
      tmpDir,
      'key_max',
      KEY_CONTENT.padEnd(MAX_FILE_SIZE, 'x'),
    );
    const maxSizeStats = await fs.stat(maxSize);
    assert.strictEqual(maxSizeStats.size, MAX_FILE_SIZE, 'Fixture should be exactly the maximum size');
    await expectResult(maxSize, true, undefined, 'File of exactly the maximum size should be accepted');

    console.log('  valid key tests passed!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

async function testStatErrors(): Promise<void> {
  console.log('Testing stat error handling...');
  const tmpDir = await createTempDir();
  try {
    await expectResult(
      path.join(tmpDir, 'does_not_exist'),
      false,
      'file_not_found',
      'Missing file',
    );

    // A path component that is a regular file yields ENOTDIR on POSIX, which is
    // neither "not found" nor "access denied". Windows reports ENOENT instead.
    const regular = await writeKey(tmpDir, 'regular', KEY_CONTENT);
    await expectResult(
      path.join(regular, 'child'),
      false,
      IS_WINDOWS ? 'file_not_found' : 'stat_error',
      'Path below a regular file (ENOTDIR on POSIX, ENOENT on Windows)',
    );

    // Non-string input rejects without an errno code
    const nonString = null as unknown as string;
    await expectResult(nonString, false, 'stat_error', 'Non-string path');

    // Rejections that are not Error objects (or carry no errno code) are still
    // reported as stat_error with "unknown" placeholders in the log.
    const originalStat = realFs.stat;
    try {
      for (const rejection of ['stat rejected with a string', null]) {
        realFs.stat = (async () => {
          throw rejection;
        });
        const logged: string[] = [];
        await withPatchedLogger(
          (_field, reason) => {
            logged.push(reason);
          },
          async () => {
            await expectResult(regular, false, 'stat_error', `Non-Error rejection (${String(rejection)})`);
          },
        );
        assert.deepStrictEqual(logged, ['File stat failed: unknown (unknown)']);
      }
    } finally {
      realFs.stat = originalStat;
    }

    if (IS_WINDOWS || IS_ROOT) {
      console.log('  (skipping access_denied test: win32 or root)');
    } else {
      const lockedDir = path.join(tmpDir, 'locked');
      await fs.mkdir(lockedDir);
      const hidden = await writeKey(lockedDir, 'key', KEY_CONTENT);
      await fs.chmod(lockedDir, 0o000);
      try {
        await expectResult(hidden, false, 'access_denied', 'File inside unreadable directory (EACCES)');
      } finally {
        await fs.chmod(lockedDir, 0o700);
      }
    }

    console.log('  stat error tests passed!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

async function testFileType(): Promise<void> {
  console.log('Testing file type validation...');
  const tmpDir = await createTempDir();
  try {
    await expectResult(tmpDir, false, 'is_directory', 'Directory');

    if (IS_WINDOWS) {
      console.log('  (skipping device file test on win32)');
    } else {
      await expectResult('/dev/null', false, 'not_regular_file', 'Character device (/dev/null)');
    }

    console.log('  file type tests passed!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

async function testFileSize(): Promise<void> {
  console.log('Testing file size limits...');
  const tmpDir = await createTempDir();
  try {
    const empty = await writeKey(tmpDir, 'empty', '');
    await expectResult(empty, false, 'file_too_small', 'Empty file');

    const belowMin = await writeKey(tmpDir, 'below_min', 'x'.repeat(MIN_FILE_SIZE - 1));
    await expectResult(belowMin, false, 'file_too_small', 'File one byte below minimum');

    // Exactly the minimum passes the size check and fails later at the format check
    const atMin = await writeKey(tmpDir, 'at_min', 'x'.repeat(MIN_FILE_SIZE));
    await expectResult(atMin, false, 'invalid_format', 'File of exactly the minimum size');

    const tooLarge = await writeKey(
      tmpDir,
      'too_large',
      KEY_CONTENT.padEnd(MAX_FILE_SIZE + 1, 'x'),
    );
    await expectResult(tooLarge, false, 'file_too_large', 'File one byte above maximum');

    console.log('  file size tests passed!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

// On win32 the validator skips Unix mode checks (ACL-based permissions), so a
// world-writable and executable key is not rejected for its mode.
async function testPermissionsSkippedOnWindows(): Promise<void> {
  const tmpDir = await createTempDir();
  const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
  assert.ok(originalPlatform, 'process.platform descriptor should exist');
  try {
    const mode = IS_WINDOWS ? OWNER_READ_WRITE : 0o777;
    const filePath = await writeKey(tmpDir, 'win32_mode', KEY_CONTENT, mode);
    Object.defineProperty(process, 'platform', { ...originalPlatform, value: 'win32' });
    await expectResult(filePath, true, undefined, 'Mode checks are skipped on win32');
  } finally {
    Object.defineProperty(process, 'platform', originalPlatform);
    await cleanupTempDir(tmpDir);
  }
}

async function testPermissions(): Promise<void> {
  console.log('Testing permission checks...');
  await testPermissionsSkippedOnWindows();
  if (IS_WINDOWS) {
    console.log('  (skipping permission tests on win32)');
    return;
  }

  const tmpDir = await createTempDir();
  try {
    const insecureModes = [0o644, 0o640, 0o604, 0o660, 0o606, 0o666, 0o777, 0o601];
    for (const mode of insecureModes) {
      const filePath = await writeKey(tmpDir, `insecure_${mode.toString(8)}`, KEY_CONTENT, mode);
      await expectResult(
        filePath,
        false,
        'insecure_permissions',
        `Mode ${mode.toString(8)} (group/others access)`,
      );
    }

    // Owner-execute bit alone, with no group/others access
    const ownerExec = await writeKey(tmpDir, 'owner_exec', KEY_CONTENT, 0o700);
    await expectResult(ownerExec, false, 'insecure_permissions', 'Mode 700 (owner execute bit)');
    const ownerExecRead = await writeKey(tmpDir, 'owner_exec_ro', KEY_CONTENT, 0o500);
    await expectResult(ownerExecRead, false, 'insecure_permissions', 'Mode 500 (owner execute bit)');

    // Permission failures are logged with the octal mode and the specific cause
    const messages: string[] = [];
    await withPatchedLogger(
      (_field, reason) => {
        messages.push(reason);
      },
      async () => {
        await validateKeyFileBeforeAddToAgent(path.join(tmpDir, 'insecure_644'));
        await validateKeyFileBeforeAddToAgent(ownerExec);
      },
    );
    assert.deepStrictEqual(messages, [
      'Insecure permissions: 644 (group/others have access)',
      'Insecure permissions: 700 (owner execute bit set)',
    ]);

    console.log('  permission tests passed!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

async function testFormat(): Promise<void> {
  console.log('Testing key format validation...');
  const tmpDir = await createTempDir();
  try {
    const text = await writeKey(tmpDir, 'plain_text', 'this is definitely not a private key');
    await expectResult(text, false, 'invalid_format', 'Plain text');

    const publicKey = await writeKey(tmpDir, 'public', 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExample user@host\n');
    await expectResult(publicKey, false, 'invalid_format', 'Public key content');

    const whitespace = await writeKey(tmpDir, 'whitespace', ' '.repeat(MIN_FILE_SIZE * 2));
    await expectResult(whitespace, false, 'invalid_format', 'Whitespace-only file');

    const binary = await writeKey(tmpDir, 'binary', Buffer.from([0xFF, 0xFE, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]));
    await expectResult(binary, false, 'invalid_format', 'Binary content');

    // Header must be at the start of the file, not merely present
    const embedded = await writeKey(tmpDir, 'embedded', `garbage\n${KEY_CONTENT}`);
    await expectResult(embedded, false, 'invalid_format', 'Header not at start of file');

    console.log('  format tests passed!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

async function testFormatReadFailure(): Promise<void> {
  console.log('Testing format check read failures...');
  if (IS_WINDOWS || IS_ROOT) {
    console.log('  (skipping unreadable file test: win32 or root)');
  } else {
    const tmpDir = await createTempDir();
    try {
      // Owner write-only (0200): stat and permission checks pass, open(r) fails
      const writeOnly = await writeKey(tmpDir, 'write_only', KEY_CONTENT, 0o200);
      const logged: Array<{ field: string; reason: string; value?: unknown }> = [];
      await withPatchedLogger(
        (field, reason, value) => {
          logged.push({ field, reason, value });
        },
        async () => {
          await expectResult(writeOnly, false, 'invalid_format', 'Unreadable file fails format check');
        },
      );
      assert.deepStrictEqual(logged, [
        { field: 'ssh-key-format', reason: 'Failed to read file for format validation', value: 'Error' },
        { field: 'ssh-key-file', reason: 'File does not have a valid SSH private key format', value: undefined },
      ]);
    } finally {
      await cleanupTempDir(tmpDir);
    }
  }

  // A file that stats as large enough but yields zero bytes (e.g. truncated
  // between stat and read) is rejected without reading a header.
  const tmpDir = await createTempDir();
  const originalOpen = realFs.open;
  try {
    const filePath = await writeKey(tmpDir, 'zero_read', KEY_CONTENT);
    realFs.open = (async (...args: Parameters<typeof originalOpen>) => {
      const handle = await originalOpen(...args);
      handle.read = async () => ({ bytesRead: 0, buffer: Buffer.alloc(0) });
      return handle;
    });
    await expectResult(filePath, false, 'invalid_format', 'Zero bytes read');
  } finally {
    realFs.open = originalOpen;
    await cleanupTempDir(tmpDir);
  }

  // open() rejecting with a non-Error value is logged with an "unknown" name
  const nonErrorDir = await createTempDir();
  try {
    const filePath = await writeKey(nonErrorDir, 'open_rejects', KEY_CONTENT);
    realFs.open = (async () => {
      throw 'open rejected with a string';
    });
    const logged: Array<{ field: string; reason: string; value?: unknown }> = [];
    await withPatchedLogger(
      (field, reason, value) => {
        logged.push({ field, reason, value });
      },
      async () => {
        await expectResult(filePath, false, 'invalid_format', 'open() rejects with a non-Error');
      },
    );
    assert.deepStrictEqual(logged[0], {
      field: 'ssh-key-format',
      reason: 'Failed to read file for format validation',
      value: 'unknown',
    });
  } finally {
    realFs.open = originalOpen;
    await cleanupTempDir(nonErrorDir);
  }

  console.log('  format read failure tests passed!');
}

async function testFileHandleCloseFailure(): Promise<void> {
  console.log('Testing file handle close failures...');
  const tmpDir = await createTempDir();
  const originalOpen = realFs.open;
  try {
    const filePath = await writeKey(tmpDir, 'close_fail', KEY_CONTENT);

    for (const [thrown, expectedName] of [
      [new TypeError('close failed'), 'TypeError'],
      ['not an error object', 'unknown'],
    ] as const) {
      realFs.open = (async (...args: Parameters<typeof originalOpen>) => {
        const handle = await originalOpen(...args);
        const realClose = handle.close.bind(handle);
        handle.close = (async () => {
          await realClose();
          throw thrown;
        });
        return handle;
      });

      const logged: Array<{ field: string; reason: string; value?: unknown }> = [];
      await withPatchedLogger(
        (field, reason, value) => {
          logged.push({ field, reason, value });
        },
        async () => {
          // A failed close during cleanup must not change the verdict
          await expectResult(filePath, true, undefined, `Close failure (${expectedName}) keeps result valid`);
        },
      );
      assert.deepStrictEqual(logged, [
        { field: 'ssh-key-format', reason: 'Failed to close file handle', value: expectedName },
      ]);
    }
  } finally {
    realFs.open = originalOpen;
    await cleanupTempDir(tmpDir);
  }

  console.log('  file handle close failure tests passed!');
}

async function testUnexpectedErrors(): Promise<void> {
  console.log('Testing unexpected error handling...');
  const tmpDir = await createTempDir();
  try {
    const missing = path.join(tmpDir, 'missing');
    const LONG_MESSAGE_LENGTH = 150;
    const TRUNCATE_AT = 100;

    // Make the logger itself throw once so the exception escapes the inner
    // handlers and reaches the outermost catch.
    const scenarios: Array<{
      thrown: unknown;
      expectedName: string;
      expectedMessage: string;
    }> = [
      {
        thrown: new RangeError('boom'),
        expectedName: 'RangeError',
        expectedMessage: 'boom',
      },
      {
        thrown: new Error('y'.repeat(LONG_MESSAGE_LENGTH)),
        expectedName: 'Error',
        expectedMessage: 'y'.repeat(TRUNCATE_AT) + '...[truncated]',
      },
      {
        thrown: new Error('z'.repeat(TRUNCATE_AT)),
        expectedName: 'Error',
        expectedMessage: 'z'.repeat(TRUNCATE_AT),
      },
      {
        thrown: 'plain string failure',
        expectedName: 'unknown',
        expectedMessage: 'plain string failure',
      },
    ];

    for (const { thrown, expectedName, expectedMessage } of scenarios) {
      const logged: Array<{ field: string; reason: string; value?: unknown }> = [];
      let isFirstCall = true;
      await withPatchedLogger(
        (field, reason, value) => {
          if (isFirstCall) {
            isFirstCall = false;
            throw thrown;
          }
          logged.push({ field, reason, value });
        },
        async () => {
          await expectResult(missing, false, 'validation_error', `Unexpected ${expectedName}`);
        },
      );
      assert.deepStrictEqual(logged, [
        {
          field: 'ssh-key-file',
          reason: `Unexpected error during validation: ${expectedName}`,
          value: expectedMessage,
        },
      ]);
    }

    console.log('  unexpected error tests passed!');
  } finally {
    await cleanupTempDir(tmpDir);
  }
}

/**
 * Run all keyFileValidator tests.
 */
export async function runKeyFileValidatorTests(): Promise<void> {
  console.log('\n=== keyFileValidator Tests ===\n');

  await testValidKeys();
  await testStatErrors();
  await testFileType();
  await testFileSize();
  await testPermissions();
  await testFormat();
  await testFormatReadFailure();
  await testFileHandleCloseFailure();
  await testUnexpectedErrors();

  console.log('\n✅ All keyFileValidator tests passed!\n');
}
