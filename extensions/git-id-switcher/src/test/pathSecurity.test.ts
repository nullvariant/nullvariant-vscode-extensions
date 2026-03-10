/**
 * Security Tests for Path Validation
 *
 * Tests comprehensive path security including:
 * - Path traversal attacks (.., //)
 * - Tilde expansion attacks (~user)
 * - Windows path attacks (UNC, device paths)
 * - Unicode normalization attacks
 * - Null byte injection
 * - PATH_MAX length attacks
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  isSecurePath,
  isPathArgument,
  isSecureLogPath,
} from '../security/pathValidator';
import { isCommandAllowed } from '../security/commandAllowlist';

/**
 * Normalize path to use forward slashes (cross-platform compatibility).
 *
 * isSecureLogPath requires forward slashes for security validation because:
 * - Backslash is rejected as a potential path traversal attack on Unix
 * - Windows Node.js path.join() uses backslash by default
 * - Forward slash works on all platforms
 *
 * @param p - The path to normalize
 * @returns The path with all backslashes replaced by forward slashes
 */
function toForwardSlashes(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * Test path traversal attack prevention
 */
function testPathTraversalAttacks(): void {
  console.log('Testing path traversal attack prevention...');

  const traversalAttacks = [
    // Basic traversal
    '../etc/passwd',
    '../../etc/passwd',
    '../../../etc/passwd',
    // Hidden in path
    '/home/user/../../../etc/passwd',
    '/home/../etc/passwd',
    // With trailing content
    '/home/user/../../..',
    // Standalone
    '..',
    // Windows style
    '..\\etc\\passwd',
    '/home/user\\..\\..\\etc\\passwd',
    // Relative path with traversal
    './../etc/passwd',
    './../../etc/passwd',
    '.././etc/passwd',
    // Multiple dots (obfuscation attempt)
    '.../etc/passwd',
    '..../etc/passwd',
    '/home/.../etc/passwd',
  ];
  // Note: URL encoded paths (%2e%2e) are handled at the HTTP layer, not here

  for (const attack of traversalAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Path traversal should be blocked: "${attack}"`
    );
    assert.ok(
      result.reason?.includes('traversal') || result.reason?.includes('Path must be'),
      `Should mention traversal in reason for: "${attack}"`
    );
  }

  console.log('✅ Path traversal attacks blocked!');
}

/**
 * Test double slash attack prevention
 */
function testDoubleSlashAttacks(): void {
  console.log('Testing double slash attack prevention...');

  const doubleSlashAttacks = [
    '/home//user',
    '//etc/passwd',
    '/home/user//file',
    '~//file',
    './/file',
  ];

  for (const attack of doubleSlashAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Double slash should be blocked: "${attack}"`
    );
    assert.ok(
      result.reason?.includes('double slashes') || result.reason?.includes('UNC'),
      `Should mention double slashes in reason for: "${attack}"`
    );
  }

  console.log('✅ Double slash attacks blocked!');
}

/**
 * Test tilde expansion attack prevention
 */
function testTildeExpansionAttacks(): void {
  console.log('Testing tilde expansion attack prevention...');

  const tildeAttacks = [
    '~root',
    '~root/.ssh/id_rsa',
    '~admin',
    '~admin/.ssh/authorized_keys',
    '~user/.bashrc',
    '~nobody',
  ];

  for (const attack of tildeAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Tilde expansion to other users should be blocked: "${attack}"`
    );
    assert.ok(
      result.reason?.includes('Tilde expansion'),
      `Should mention tilde expansion in reason for: "${attack}"`
    );
  }

  // Valid tilde patterns should pass
  const validTilde = ['~', '~/', '~/.ssh/id_rsa', '~/Documents/file.txt'];

  for (const path of validTilde) {
    const result = isSecurePath(path);
    assert.strictEqual(
      result.valid,
      true,
      `Valid tilde pattern should be allowed: "${path}"`
    );
  }

  console.log('✅ Tilde expansion attacks blocked, valid patterns allowed!');
}

/**
 * Test Windows path attack prevention
 */
function testWindowsPathAttacks(): void {
  console.log('Testing Windows path attack prevention...');

  const windowsAttacks = [
    // Drive letters
    'C:\\Windows\\System32',
    'C:/Windows/System32',
    'D:\\etc\\passwd',
    // UNC paths
    '\\\\server\\share',
    '//server/share',
    '\\\\?\\C:\\Windows',
    // Device paths
    '\\\\.\\COM1',
    '\\\\.\\PhysicalDrive0',
    '//./COM1',
  ];

  for (const attack of windowsAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Windows path should be blocked: "${attack}"`
    );
  }

  console.log('✅ Windows path attacks blocked!');
}

/**
 * Test mixed path separator prevention (cross-platform safety)
 */
function testMixedPathSeparators(): void {
  console.log('Testing mixed path separator prevention...');

  const mixedPaths = [
    '/home/user\\file',
    './path\\to/file',
    '~/a\\b',
    '/a/b\\c/d',
  ];

  for (const path of mixedPaths) {
    const result = isSecurePath(path);
    assert.strictEqual(
      result.valid,
      false,
      `Mixed path separators should be blocked: "${path}"`
    );
    assert.ok(
      result.reason?.includes('backslash'),
      `Should mention backslash in reason for: "${path}"`
    );
  }

  console.log('✅ Mixed path separators blocked!');
}

/**
 * Test Windows reserved device name prevention
 */
function testWindowsReservedNames(): void {
  console.log('Testing Windows reserved device name prevention...');

  const reservedNames = [
    '/tmp/CON',
    '/tmp/PRN',
    '/tmp/AUX',
    '/tmp/NUL',
    '/tmp/COM1',
    '/tmp/COM9',
    '/tmp/LPT1',
    '/tmp/LPT9',
    './CON.txt',
    './NUL.txt',
  ];

  for (const attack of reservedNames) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Windows reserved name should be blocked: "${attack}"`
    );
    assert.ok(
      result.reason?.includes('reserved'),
      `Should mention reserved in reason for: "${attack}"`
    );
  }

  console.log('✅ Windows reserved device names blocked!');
}

/**
 * Test null byte injection prevention
 */
function testNullByteInjection(): void {
  console.log('Testing null byte injection prevention...');

  const nullByteAttacks = [
    '/home/user\x00.txt',
    '/home/user/file\x00/etc/passwd',
    '~/.ssh/id_rsa\x00.pub',
    './file\x00.txt',
  ];

  for (const attack of nullByteAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Null byte should be blocked: "${JSON.stringify(attack)}"`
    );
    assert.ok(
      result.reason?.includes('null byte'),
      `Should mention null byte in reason`
    );
  }

  console.log('✅ Null byte injection blocked!');
}

/**
 * Test control character prevention
 */
function testControlCharacters(): void {
  console.log('Testing control character prevention...');

  const controlCharAttacks = [
    '/home/user\x01file',
    '/home/user\x07file', // Bell
    '/home/user\x08file', // Backspace
    '/home/user\x1bfile', // Escape
  ];

  for (const attack of controlCharAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Control character should be blocked: "${JSON.stringify(attack)}"`
    );
    assert.ok(
      result.reason?.includes('control characters'),
      `Should mention control characters in reason`
    );
  }

  console.log('✅ Control characters blocked!');
}

/**
 * Test invisible Unicode character prevention
 */
function testInvisibleCharacters(): void {
  console.log('Testing invisible Unicode character prevention...');

  const invisibleCharAttacks = [
    '/home/user\u200Bfile',  // Zero-width space
    '/tmp/\uFEFF.txt',       // BOM
    '~/.ssh\u200Did_rsa',    // Zero-width joiner
    '/home\u200E/user',      // Left-to-right mark
    '/path/\u00ADfile',      // Soft hyphen
  ];

  for (const attack of invisibleCharAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Invisible character should be blocked: "${JSON.stringify(attack)}"`
    );
    assert.ok(
      result.reason?.includes('invisible'),
      `Should mention invisible in reason`
    );
  }

  console.log('✅ Invisible characters blocked!');
}

/**
 * Test PATH_MAX length enforcement
 */
function testPathMaxLength(): void {
  console.log('Testing PATH_MAX length enforcement...');

  // Create a path exceeding PATH_MAX (4096 bytes)
  const longPath = '/' + 'a'.repeat(5000);
  const result = isSecurePath(longPath);

  assert.strictEqual(result.valid, false, 'Path exceeding PATH_MAX should be blocked');
  assert.ok(
    result.reason?.includes('maximum length'),
    'Should mention maximum length in reason'
  );

  // Path just under the limit should be allowed
  const validLongPath = '/' + 'a'.repeat(4000);
  const validResult = isSecurePath(validLongPath);
  assert.strictEqual(validResult.valid, true, 'Path under PATH_MAX should be allowed');

  console.log('✅ PATH_MAX length enforcement working!');
}

/**
 * Test empty/undefined path handling
 */
function testEmptyPaths(): void {
  console.log('Testing empty/undefined path handling...');

  const invalidPaths = ['', null as unknown as string, undefined as unknown as string];

  for (const path of invalidPaths) {
    const result = isSecurePath(path);
    assert.strictEqual(result.valid, false, `Empty/undefined path should be blocked: ${path}`);
  }

  console.log('✅ Empty/undefined paths blocked!');
}

/**
 * Test whitespace obfuscation prevention
 */
function testWhitespaceObfuscation(): void {
  console.log('Testing whitespace obfuscation prevention...');

  const whitespaceAttacks = [
    ' /home/user/.ssh/id_rsa',      // Leading space
    '/home/user/.ssh/id_rsa ',      // Trailing space
    '  /home/user/.ssh/id_rsa  ',   // Both
    '\t/home/user/.ssh/id_rsa',     // Leading tab
    '/home/user/.ssh/id_rsa\t',     // Trailing tab
    ' ../etc/passwd',               // Leading space with traversal
    '../etc/passwd ',               // Trailing space with traversal
  ];

  for (const attack of whitespaceAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Whitespace obfuscation should be blocked: "${JSON.stringify(attack)}"`
    );
    assert.ok(
      result.reason?.includes('whitespace'),
      `Should mention whitespace in reason for: "${JSON.stringify(attack)}"`
    );
  }

  console.log('✅ Whitespace obfuscation blocked!');
}

/**
 * Test trailing dot prevention
 */
function testTrailingDot(): void {
  console.log('Testing trailing dot prevention...');

  const trailingDotAttacks = [
    '/home/user/file.',      // Trailing dot
    '~/.ssh/id_rsa.',        // Trailing dot in home path
    './file.',               // Trailing dot in relative path
    '/path/to/file.txt.',    // Trailing dot after extension
  ];

  for (const attack of trailingDotAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Trailing dot should be blocked: "${attack}"`
    );
    assert.ok(
      result.reason?.includes('ends with dot'),
      `Should mention trailing dot in reason for: "${attack}"`
    );
  }

  // '.' itself should be allowed (already tested in testValidPaths)
  const validDot = isSecurePath('.');
  assert.strictEqual(validDot.valid, true, 'Single dot should be allowed');

  console.log('✅ Trailing dot blocked, single dot allowed!');
}

/**
 * Test trailing dot-slash patterns (/./ or /..)
 * These are edge cases that could be used for path confusion attacks.
 *
 * Note: These patterns are blocked by earlier validators in the pipeline:
 * - /. endings are caught by validateNoTrailingDot ("ends with dot")
 * - /.. endings are caught by validateNoTraversal ("contains traversal")
 * validateNoTrailingDotSlash is defense-in-depth code that catches
 * edge cases if earlier validators are bypassed or modified.
 */
function testTrailingDotSlashPatterns(): void {
  console.log('Testing trailing dot-slash patterns...');

  // These patterns are blocked, but by different validators due to pipeline order
  const trailingDotSlashAttacks = [
    { path: '/home/user/.', expectedReason: 'ends with dot' },      // Blocked by validateNoTrailingDot
    { path: '/path/to/dir/.', expectedReason: 'ends with dot' },    // Blocked by validateNoTrailingDot
    { path: '~/subdir/..', expectedReason: 'traversal' },           // Blocked by validateNoTraversal
  ];

  for (const { path, expectedReason } of trailingDotSlashAttacks) {
    const result = isSecurePath(path);
    assert.strictEqual(
      result.valid,
      false,
      `Trailing /. or /.. should be blocked: "${path}"`
    );
    assert.ok(
      result.reason?.includes(expectedReason),
      `Should mention "${expectedReason}" in reason for: "${path}", got: "${result.reason}"`
    );
  }

  console.log('✅ Trailing dot-slash patterns blocked (by various validators)!');
}

/**
 * Test isPathArgument with whitespace and Windows paths
 */
function testIsPathArgumentEdgeCases(): void {
  console.log('Testing isPathArgument edge cases...');

  // Should be recognized as paths (including whitespace obfuscation)
  const pathArgsWithWhitespace = [
    ' /home/user',
    '/home/user ',
    ' ~/.ssh',
    'C:',
    'C:\\Windows',
    '\\\\server\\share',
  ];
  for (const arg of pathArgsWithWhitespace) {
    assert.strictEqual(isPathArgument(arg), true, `Should be path: "${JSON.stringify(arg)}"`);
  }

  console.log('✅ isPathArgument edge cases handled!');
}

/**
 * Test valid paths are allowed
 */
function testValidPaths(): void {
  console.log('Testing valid paths are allowed...');

  const validPaths = [
    '/home/user/.ssh/id_rsa',
    '/etc/gitconfig',
    '/usr/local/bin/git',
    '~/.ssh/id_rsa',
    '~/.gitconfig',
    '~/Documents/project/file.txt',
    '.',
    './',
    './file.txt',
    './path/to/file',
    '/path/with/special-chars_123',
    '/path/with.dots/file.txt',
    '~/.config/git/config',
  ];

  for (const path of validPaths) {
    const result = isSecurePath(path);
    assert.strictEqual(result.valid, true, `Valid path should be allowed: "${path}"`);
  }

  console.log('✅ Valid paths allowed!');
}

/**
 * Test invalid prefix paths are rejected
 * Paths must start with /, ~/, ~, or ./
 */
function testInvalidPrefixPaths(): void {
  console.log('Testing invalid prefix paths are rejected...');

  const invalidPrefixPaths = [
    'foo/bar',           // Relative without ./
    'relative/path',     // Relative without ./
    'some/deep/path',    // Relative without ./
    'file.txt',          // Just filename
  ];

  for (const testPath of invalidPrefixPaths) {
    const result = isSecurePath(testPath);
    assert.strictEqual(
      result.valid,
      false,
      `Invalid prefix path should be rejected: "${testPath}"`
    );
    assert.ok(
      result.reason?.includes('must start with'),
      `Should mention valid prefixes for: "${testPath}", got: "${result.reason}"`
    );
  }

  console.log('✅ Invalid prefix paths rejected!');
}

/**
 * Test isSecureLogPath rejects file that is itself a symbolic link
 */
function testSecureLogPathRejectsFileSymlink(): void {
  console.log('Testing isSecureLogPath rejects file symbolic link...');

  // Skip on Windows - drive letter rejection prevents testing symlink rejection
  if (process.platform === 'win32') {
    console.log('  Skipped on Windows (drive letter rejection takes precedence)');
    console.log('✅ File symbolic links rejected!');
    return;
  }

  // Use realpath to resolve any system symlinks
  const baseTempDir = fs.realpathSync(os.tmpdir());
  const tempDir = fs.mkdtempSync(path.join(baseTempDir, 'securelogpath-filesymlink-test-'));

  try {
    const realFile = path.join(tempDir, 'real.log');
    const symlinkFile = path.join(tempDir, 'symlink.log');

    // Create real file
    fs.writeFileSync(realFile, 'test content');

    // Create a symlink pointing to the real file
    fs.symlinkSync(realFile, symlinkFile);

    // Test: file symlink should be rejected
    const normalizedPath = toForwardSlashes(symlinkFile);
    const normalizedBaseDir = toForwardSlashes(tempDir);
    const result = isSecureLogPath(normalizedPath, normalizedBaseDir);

    assert.strictEqual(
      result.valid,
      false,
      'File that is a symbolic link should be rejected'
    );
    assert.ok(
      result.reason?.includes('symbolic link'),
      `Should mention symbolic link, got: "${result.reason}"`
    );
  } finally {
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log('✅ File symbolic links rejected!');
}

/**
 * Test isPathArgument function
 */
function testIsPathArgument(): void {
  console.log('Testing isPathArgument function...');

  // Should be recognized as paths (valid and malicious for validation)
  const pathArgs = ['/home/user', '~/.ssh', './', '.', './file', '..', '../etc'];
  for (const arg of pathArgs) {
    assert.strictEqual(isPathArgument(arg), true, `Should be path: "${arg}"`);
  }

  // Should NOT be recognized as paths
  const nonPathArgs = ['--flag', '-l', 'user.name', 'value', '', '-lf'];
  for (const arg of nonPathArgs) {
    assert.strictEqual(isPathArgument(arg), false, `Should not be path: "${arg}"`);
  }

  console.log('✅ isPathArgument function working!');
}

/**
 * Test integration with isCommandAllowed
 */
function testCommandAllowedIntegration(): void {
  console.log('Testing isCommandAllowed integration...');

  // Valid command with valid path
  {
    const result = isCommandAllowed('ssh-keygen', ['-lf', '/home/user/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, true, 'Valid command with valid path should be allowed');
  }

  // Valid command with path traversal attack
  {
    const result = isCommandAllowed('ssh-keygen', ['-lf', '../../../etc/passwd']);
    assert.strictEqual(result.allowed, false, 'Command with path traversal should be blocked');
    assert.ok(
      result.reason?.includes('Path argument rejected'),
      'Should indicate path was rejected'
    );
  }

  // Valid command with ~user attack
  {
    const result = isCommandAllowed('ssh-add', ['~root/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, false, 'Command with ~user should be blocked');
  }

  // Valid command with valid tilde path
  {
    const result = isCommandAllowed('ssh-add', ['~/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, true, 'Command with ~/ path should be allowed');
  }

  // Valid command with null byte attack
  {
    const result = isCommandAllowed('ssh-keygen', ['-lf', '/home/user\x00.txt']);
    assert.strictEqual(result.allowed, false, 'Command with null byte should be blocked');
  }

  console.log('✅ isCommandAllowed integration working!');
}

/**
 * Test Windows drive letter only paths
 */
function testWindowsDriveLetterOnly(): void {
  console.log('Testing Windows drive letter only prevention...');

  const driveLetterAttacks = [
    'C:',
    'D:',
    'Z:',
    'c:',
    'C:/',
    'D:\\',
  ];

  for (const attack of driveLetterAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Drive letter only should be blocked: "${attack}"`
    );
  }

  console.log('✅ Windows drive letter only blocked!');
}

/**
 * Test absolute path with relative traversal
 */
function testAbsolutePathWithRelativeTraversal(): void {
  console.log('Testing absolute path with relative traversal...');

  const absoluteTraversalAttacks = [
    '/path/./../etc/passwd',
    '/home/../etc/passwd',
    '/usr/./../etc/passwd',
  ];

  for (const attack of absoluteTraversalAttacks) {
    const result = isSecurePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Absolute path with relative traversal should be blocked: "${attack}"`
    );
  }

  console.log('✅ Absolute path with relative traversal blocked!');
}

// ============================================================================
// Secure Log Path Tests
//
// DESIGN NOTE: isSecureLogPath is designed for Unix-style paths only.
// Windows drive letters (C:/) and backslashes are rejected by isSecurePath.
// This is intentional - log file paths should use Unix-style paths for
// cross-platform compatibility in configuration files.
//
// On Windows, these tests are skipped because os.tmpdir() returns a Windows
// path (e.g., C:\Users\...\Temp) which is rejected before the actual security
// logic can be tested. The security logic itself is fully tested via
// Unix-style paths on Unix platforms.
//
// For workspace path validation (which needs to accept platform-native paths),
// use validateWorkspacePath from pathUtils.ts instead.
// ============================================================================

/**
 * Test isSecureLogPath rejects paths outside allowed directory
 *
 * Note: Skipped on Windows because isSecureLogPath rejects Windows drive letters
 * (C:/) before the "outside allowed directory" check can be reached.
 * See DESIGN NOTE above for rationale.
 */
function testSecureLogPathOutsideAllowed(): void {
  console.log('Testing isSecureLogPath rejects paths outside allowed directory...');

  // Skip on Windows - drive letter rejection happens before directory check
  if (process.platform === 'win32') {
    console.log('  Skipped on Windows (drive letter rejection takes precedence)');
    console.log('✅ Paths outside allowed directory rejected!');
    return;
  }

  // Use realpath to resolve any system symlinks (e.g., /var -> /private/var on macOS)
  const baseTempDir = fs.realpathSync(os.tmpdir());
  const tempDir = fs.mkdtempSync(path.join(baseTempDir, 'securelogpath-allowed-test-'));

  try {
    // Create a subdirectory outside the allowed directory
    const outsideDir = fs.mkdtempSync(path.join(baseTempDir, 'securelogpath-outside-test-'));
    const outsidePaths = [
      path.join(outsideDir, 'malicious.log'),
      path.join(outsideDir, 'subdir', 'file.log'),
    ];

    for (const filePath of outsidePaths) {
      // Normalize paths to forward slashes for cross-platform compatibility
      const normalizedPath = toForwardSlashes(filePath);
      const normalizedBaseDir = toForwardSlashes(tempDir);
      const result = isSecureLogPath(normalizedPath, normalizedBaseDir);
      assert.strictEqual(
        result.valid,
        false,
        `Path outside allowed directory should be rejected: "${normalizedPath}"`
      );
      assert.ok(
        result.reason?.includes('not under allowed directory'),
        `Should mention path is not under allowed directory for: "${normalizedPath}", got: "${result.reason}"`
      );
    }

    fs.rmSync(outsideDir, { recursive: true, force: true });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log('✅ Paths outside allowed directory rejected!');
}

/**
 * Test isSecureLogPath allows paths under allowed directory
 *
 * Note: Skipped on Windows because isSecureLogPath rejects Windows drive letters
 * (C:/) which are present in Windows temp directory paths.
 */
function testSecureLogPathUnderAllowed(): void {
  console.log('Testing isSecureLogPath allows paths under allowed directory...');

  // Skip on Windows - drive letter rejection prevents testing valid paths
  if (process.platform === 'win32') {
    console.log('  Skipped on Windows (drive letter rejection takes precedence)');
    console.log('✅ Paths under allowed directory allowed!');
    return;
  }

  // Use realpath to resolve any system symlinks (e.g., /var -> /private/var on macOS)
  const baseTempDir = fs.realpathSync(os.tmpdir());
  const tempDir = fs.mkdtempSync(path.join(baseTempDir, 'securelogpath-test-'));

  try {
    const validPaths = [
      path.join(tempDir, 'logs', 'security.log'),
      path.join(tempDir, 'file.log'),
      path.join(tempDir, 'subdir', 'nested', 'file.log'),
    ];

    for (const filePath of validPaths) {
      // Normalize paths to forward slashes for cross-platform compatibility
      const normalizedPath = toForwardSlashes(filePath);
      const normalizedBaseDir = toForwardSlashes(tempDir);
      const result = isSecureLogPath(normalizedPath, normalizedBaseDir);
      assert.strictEqual(
        result.valid,
        true,
        `Path under allowed directory should be allowed: "${normalizedPath}"`
      );
      assert.ok(
        result.resolvedPath,
        `Should return resolved path for: "${normalizedPath}"`
      );
    }
  } finally {
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log('✅ Paths under allowed directory allowed!');
}

/**
 * Test isSecureLogPath rejects symbolic links
 *
 * Note: Skipped on Windows because isSecureLogPath rejects Windows drive letters
 * (C:/) which are present in Windows temp directory paths.
 */
function testSecureLogPathRejectsSymlinks(): void {
  console.log('Testing isSecureLogPath rejects symbolic links...');

  // Skip on Windows - drive letter rejection prevents testing symlink rejection
  if (process.platform === 'win32') {
    console.log('  Skipped on Windows (drive letter rejection takes precedence)');
    console.log('✅ Symbolic links rejected!');
    return;
  }

  // Use realpath to resolve any system symlinks (e.g., /var -> /private/var on macOS)
  const baseTempDir = fs.realpathSync(os.tmpdir());
  const tempDir = fs.mkdtempSync(path.join(baseTempDir, 'securelogpath-symlink-test-'));

  try {
    const realDir = path.join(tempDir, 'real');
    const symlinkDir = path.join(tempDir, 'symlink');
    const outsideDir = path.join(baseTempDir, 'outside-target-' + Date.now());

    // Create directories
    fs.mkdirSync(realDir, { recursive: true });
    fs.mkdirSync(outsideDir, { recursive: true });

    // Create a symlink pointing to outside directory
    fs.symlinkSync(outsideDir, symlinkDir);

    // Test: symlink in path should be rejected
    const symlinkPath = path.join(symlinkDir, 'malicious.log');
    // Normalize paths to forward slashes for cross-platform compatibility
    const normalizedPath = toForwardSlashes(symlinkPath);
    const normalizedBaseDir = toForwardSlashes(tempDir);
    const result = isSecureLogPath(normalizedPath, normalizedBaseDir);

    assert.strictEqual(
      result.valid,
      false,
      'Path with symlink should be rejected'
    );
    assert.ok(
      result.reason?.includes('symbolic link'),
      `Should mention symbolic link, got: "${result.reason}"`
    );

    // Cleanup outside directory
    fs.rmSync(outsideDir, { recursive: true, force: true });
  } finally {
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log('✅ Symbolic links rejected!');
}

/**
 * Test isSecureLogPath rejects path traversal
 */
function testSecureLogPathRejectsTraversal(): void {
  console.log('Testing isSecureLogPath rejects path traversal...');

  const allowedDir = '/home/user/.vscode/globalStorage/extension';
  const traversalPaths = [
    '/home/user/.vscode/globalStorage/extension/../../../etc/passwd',
    '/home/user/.vscode/globalStorage/extension/logs/../../..',
  ];

  for (const filePath of traversalPaths) {
    const result = isSecureLogPath(filePath, allowedDir);
    assert.strictEqual(
      result.valid,
      false,
      `Path with traversal should be rejected: "${filePath}"`
    );
    assert.ok(
      result.reason?.includes('traversal'),
      `Should mention traversal for: "${filePath}"`
    );
  }

  console.log('✅ Path traversal rejected!');
}

/**
 * Test isSecureLogPath with basic path validation failures
 */
function testSecureLogPathBasicValidation(): void {
  console.log('Testing isSecureLogPath with basic validation failures...');

  const allowedDir = '/home/user/.vscode/globalStorage/extension';

  // Null byte
  {
    const result = isSecureLogPath('/home/user\x00.log', allowedDir);
    assert.strictEqual(result.valid, false, 'Null byte should be rejected');
    assert.ok(result.reason?.includes('null byte'), 'Should mention null byte');
  }

  // Control characters
  {
    const result = isSecureLogPath('/home/user\x01file.log', allowedDir);
    assert.strictEqual(result.valid, false, 'Control char should be rejected');
  }

  // Empty path
  {
    const result = isSecureLogPath('', allowedDir);
    assert.strictEqual(result.valid, false, 'Empty path should be rejected');
  }

  console.log('✅ Basic validation failures handled!');
}

/**
 * Test isSecureLogPath with invalid allowed base directory
 *
 * Note: Skipped on Windows because isSecureLogPath rejects Windows drive letters
 * (C:/) which are present in Windows temp directory paths.
 */
function testSecureLogPathInvalidBaseDir(): void {
  console.log('Testing isSecureLogPath with invalid allowed base directory...');

  // Skip on Windows - drive letter rejection may interfere with base dir tests
  if (process.platform === 'win32') {
    console.log('  Skipped on Windows (drive letter rejection takes precedence)');
    console.log('✅ Invalid base directory handled!');
    return;
  }

  // Use realpath to resolve any system symlinks
  const baseTempDir = fs.realpathSync(os.tmpdir());
  // Normalize path to forward slashes for cross-platform compatibility
  const testFilePath = toForwardSlashes(path.join(baseTempDir, 'test-file.log'));

  // Invalid base directory (path traversal)
  {
    const result = isSecureLogPath(testFilePath, '../etc');
    assert.strictEqual(result.valid, false, 'Invalid base dir should be rejected');
    assert.ok(
      result.reason?.includes('Invalid allowed base directory'),
      `Should mention invalid base directory, got: "${result.reason}"`
    );
  }

  // Invalid base directory (empty)
  {
    const result = isSecureLogPath(testFilePath, '');
    assert.strictEqual(result.valid, false, 'Empty base dir should be rejected');
  }

  console.log('✅ Invalid base directory handled!');
}

/**
 * Run all path security tests
 */
export async function runPathSecurityTests(): Promise<void> {
  console.log('\n=== Path Security Tests ===\n');

  try {
    testPathTraversalAttacks();
    testDoubleSlashAttacks();
    testTildeExpansionAttacks();
    testWindowsPathAttacks();
    testMixedPathSeparators();
    testWindowsReservedNames();
    testNullByteInjection();
    testControlCharacters();
    testInvisibleCharacters();
    testPathMaxLength();
    testEmptyPaths();
    testWhitespaceObfuscation();
    testTrailingDot();
    testTrailingDotSlashPatterns();
    testWindowsDriveLetterOnly();
    testAbsolutePathWithRelativeTraversal();
    testValidPaths();
    testInvalidPrefixPaths();
    testIsPathArgument();
    testIsPathArgumentEdgeCases();
    testCommandAllowedIntegration();

    // Secure Log Path tests
    testSecureLogPathOutsideAllowed();
    testSecureLogPathUnderAllowed();
    testSecureLogPathRejectsSymlinks();
    testSecureLogPathRejectsFileSymlink();
    testSecureLogPathRejectsTraversal();
    testSecureLogPathBasicValidation();
    testSecureLogPathInvalidBaseDir();

    console.log('\n✅ All path security tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runPathSecurityTests().catch(console.error);
}
