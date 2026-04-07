/**
 * Cross-OS getSafeStack() Path Sanitization Tests
 *
 * Verifies that getSafeStack() correctly sanitizes file paths in V8 stack
 * traces across different OS path formats by injecting fake rawStack strings.
 *
 * Coverage:
 * - macOS home directory replacement (/Users/username → ~)
 * - Linux home directory replacement (/home/username → ~)
 * - Linux sensitive directories (.ssh, .aws) and files (id_rsa, .env)
 * - WSL mount paths (/mnt/c/Users/...)
 * - snap package paths (/snap/node/...)
 * - Linux temp directory (/tmp/...)
 * - Windows home directory replacement (HOMEDRIVE+HOMEPATH, USERPROFILE)
 * - Windows sensitive directories (AppData\Roaming, AppData\Local)
 * - UNC path server name redaction (\\server\share → //[REDACTED]/share)
 * - Legacy Windows paths (D: drive)
 * - V8 frame format variants (parenthesized, bare, non-frame lines)
 * - Regex edge cases (file:// URLs, large line:col, deep nesting)
 *
 * Total: 4 test functions, ~20 test cases.
 */

import * as assert from 'node:assert';
import { saveEnv, restoreEnv } from './helpers/envMock';
import { SecurityError, ErrorCategory } from '../core/errors';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a V8-style parenthesized stack frame line.
 * Format: "    at FuncName (filepath:line:col)"
 */
function parenFrame(funcName: string, filePath: string, line: number, col: number): string {
  return `    at ${funcName} (${filePath}:${line}:${col})`;
}

/**
 * Build a V8-style bare stack frame line (no function name).
 * Format: "    at filepath:line:col"
 */
function bareFrame(filePath: string, line: number, col: number): string {
  return `    at ${filePath}:${line}:${col}`;
}

/**
 * Create a SecurityError with an injected rawStack for cross-OS testing.
 *
 * WARNING: This relies on rawStack being a TypeScript-only private field
 * (not an ES private field `#rawStack`). Object.defineProperty can override
 * TS private fields at runtime, but would silently fail if the implementation
 * migrates to ES private fields. If getSafeStack() stops reflecting injected
 * stacks, check whether rawStack was changed to a # private field.
 */
function createErrorWithStack(fakeStack: string): SecurityError {
  const error = new SecurityError({
    category: ErrorCategory.VALIDATION,
    userMessage: 'Test',
    autoLog: false,
  });
  Object.defineProperty(error, 'rawStack', {
    value: fakeStack,
    configurable: true,
  });
  return error;
}

// ─── Test functions ──────────────────────────────────────────────────────────

/**
 * Test getSafeStack with macOS and Linux path patterns
 */
function testGetSafeStackUnixPaths(): void {
  console.log('Testing getSafeStack (Unix cross-OS paths)...');

  const snap = saveEnv();

  try {
    // --- macOS home directory replacement ---
    Object.defineProperty(process, 'platform', { value: 'darwin', writable: true });
    process.env.HOME = '/Users/testuser';
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('Object.<anonymous>', '/Users/testuser/project/src/index.ts', 42, 5),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(!safe.includes('/Users/testuser/'), 'macOS: home dir must be replaced');
      assert.ok(safe.includes('~/project/src/index.ts'), 'macOS: path should start with ~');
    }

    // --- Linux home directory replacement ---
    Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
    process.env.HOME = '/home/testuser';
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('Module._compile', '/home/testuser/app/dist/main.js', 100, 20),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(!safe.includes('/home/testuser/'), 'Linux: home dir must be replaced');
      assert.ok(safe.includes('~/app/dist/main.js'), 'Linux: path should start with ~');
    }

    // --- Linux sensitive .ssh directory ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('readKey', '/home/testuser/.ssh/known_hosts', 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('[REDACTED:SENSITIVE_DIR]'),
        'Linux .ssh: sensitive dir must be redacted'
      );
      assert.ok(!safe.includes('.ssh'), 'Linux .ssh: directory name must not appear');
    }

    // --- Linux sensitive file pattern (id_rsa) ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('loadKey', '/home/testuser/.ssh/id_rsa', 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('[REDACTED:SENSITIVE_FILE]'),
        'Linux id_rsa: sensitive file must be redacted'
      );
      assert.ok(!safe.includes('id_rsa'), 'Linux id_rsa: filename must not appear');
    }

    // --- WSL path (/mnt/c/...) not under HOME ---
    // WSL mounts Windows drives at /mnt/c/. These paths are outside HOME
    // and contain no sensitive directory patterns, so they pass through.
    // The Windows username embedded in /mnt/c/Users/<name>/ is not redacted
    // because sanitizePath only replaces the HOME prefix.
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('Object.<anonymous>', '/mnt/c/Users/someone/project/file.ts', 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('/mnt/c/Users/someone/project/file.ts'),
        'WSL: non-home path should pass through'
      );
    }

    // --- snap package path ---
    {
      const stack = [
        'SecurityError: Test',
        bareFrame('/snap/node/12345/lib/node_modules/npm/bin/file.js', 50, 10),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('/snap/node/12345/'),
        'snap: non-sensitive snap path should pass through'
      );
    }

    // --- Linux /tmp directory ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('tmpHandler', '/tmp/build-12345/output.js', 99, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('/tmp/build-12345/output.js'),
        'Linux temp: /tmp path should pass through'
      );
    }

    // --- Linux sensitive .env file ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('loadConfig', '/home/testuser/project/.env', 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('[REDACTED:SENSITIVE_FILE]'),
        'Linux .env: sensitive file must be redacted'
      );
    }

    console.log('✅ getSafeStack (Unix cross-OS paths) passed!');
  } finally {
    restoreEnv(snap);
  }
}

/**
 * Test getSafeStack with Windows, UNC, and legacy Windows path patterns
 */
function testGetSafeStackWindowsPaths(): void {
  console.log('Testing getSafeStack (Windows cross-OS paths)...');

  const snap = saveEnv();

  try {
    Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
    process.env.HOMEDRIVE = 'C:';
    process.env.HOMEPATH = String.raw`\Users\testuser`;
    delete process.env.USERPROFILE;

    // --- Windows home directory replacement ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('Object.<anonymous>', String.raw`C:\Users\testuser\project\src\app.ts`, 10, 3),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        !safe.includes(String.raw`C:\Users\testuser`) && !safe.includes('C:/Users/testuser'),
        'Windows: home dir must be replaced'
      );
      assert.ok(safe.includes('~/project/src/app.ts'), 'Windows: path should start with ~');
    }

    // --- Windows AppData\Roaming (sensitive directory) ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('loadConfig', String.raw`C:\Users\testuser\AppData\Roaming\app\config.json`, 5, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('[REDACTED:SENSITIVE_DIR]'),
        String.raw`Windows AppData\Roaming: must be redacted`
      );
    }

    // --- Windows AppData\Local\Temp (sensitive directory) ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('tmpHandler', String.raw`C:\Users\testuser\AppData\Local\Temp\build\file.js`, 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('[REDACTED:SENSITIVE_DIR]'),
        String.raw`Windows AppData\Local\Temp: must be redacted as sensitive dir`
      );
    }

    // --- UNC path ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('readFile', String.raw`\\server\share\project\file.ts`, 20, 10),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(safe.includes('//[REDACTED]'), 'UNC: server name must be redacted');
      assert.ok(!safe.includes('server'), 'UNC: server name must not appear');
    }

    // --- Legacy Windows D: drive ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('require', String.raw`D:\Projects\nodejs\app.js`, 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('D:/Projects/nodejs/app.js'),
        'Legacy Windows: D: drive path should be normalized to forward slashes'
      );
    }

    // --- Windows USERPROFILE fallback ---
    {
      // Explicitly clear HOMEDRIVE/HOMEPATH to trigger USERPROFILE fallback
      delete process.env.HOMEDRIVE;
      delete process.env.HOMEPATH;
      process.env.USERPROFILE = String.raw`C:\Users\testuser`;

      const stack = [
        'SecurityError: Test',
        parenFrame('init', String.raw`C:\Users\testuser\Desktop\script.js`, 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(safe.includes('~/Desktop/script.js'), 'Windows USERPROFILE: home should be replaced');
    }

    console.log('✅ getSafeStack (Windows cross-OS paths) passed!');
  } finally {
    restoreEnv(snap);
  }
}

/**
 * Test getSafeStack frame parsing: bare frames, multiple frames, non-frame lines
 */
function testGetSafeStackFrameParsing(): void {
  console.log('Testing getSafeStack (frame format parsing)...');

  const snap = saveEnv();

  try {
    Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
    process.env.HOME = '/home/testuser';

    // --- Bare frame (no function name, no parentheses) ---
    {
      const stack = [
        'SecurityError: Test',
        bareFrame('/home/testuser/project/index.js', 5, 12),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(safe.includes('~/project/index.js'), 'Bare frame: home should be replaced');
      assert.ok(safe.includes(':5:12'), 'Bare frame: line:col should be preserved');
    }

    // --- Multiple frames with mixed paths ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('userCode', '/home/testuser/project/src/app.ts', 10, 5),
        parenFrame('Module._compile', 'node:internal/modules/cjs/loader', 1376, 14),
        bareFrame('/home/testuser/.aws/config.yaml', 1, 1),
        '    at <anonymous>',
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(safe.includes('~/project/src/app.ts'), 'Multi-frame: user path should use ~');
      assert.ok(
        safe.includes('node:internal/modules/cjs/loader'),
        'Multi-frame: node internal path should pass through'
      );
      // .aws is a sensitive directory; config.yaml doesn't match file patterns
      assert.ok(
        safe.includes('[REDACTED:SENSITIVE_DIR]'),
        'Multi-frame: .aws path should be redacted as sensitive dir'
      );
      assert.ok(safe.includes('at <anonymous>'), 'Multi-frame: non-path line should pass through');
    }

    // --- First line (error message) should not be modified ---
    // getSafeStack only processes lines with :line:col suffix.
    // The error message line has no such suffix, so it passes through unchanged.
    {
      const stack = [
        'SecurityError: /home/testuser/project message',
        parenFrame('test', '/tmp/safe.js', 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      const firstLine = safe.split('\n')[0];
      assert.strictEqual(
        firstLine,
        'SecurityError: /home/testuser/project message',
        'Error message line should not be modified (no :line:col suffix)'
      );
    }

    // --- Line with :line:col but no path-like content ---
    {
      const stack = [
        'SecurityError: Test',
        '    at native code:1:1',
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(safe.includes('native code'), 'Non-path :line:col should pass through');
    }

    console.log('✅ getSafeStack (frame format parsing) passed!');
  } finally {
    restoreEnv(snap);
  }
}

/**
 * Test getSafeStack regex edge cases for path extraction
 */
function testGetSafeStackRegexEdgeCases(): void {
  console.log('Testing getSafeStack (regex edge cases)...');

  const snap = saveEnv();

  try {
    Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
    process.env.HOME = '/home/testuser';

    // --- Path with file:/// protocol prefix ---
    // KNOWN LIMITATION: sanitizePath does not strip URL schemes.
    // file:// URLs bypass home directory matching because the scheme prefix
    // prevents the path from starting with the home directory.
    // V8 stack frames rarely use file:// URLs (only in source-mapped frames).
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('fetch', 'file:///home/testuser/project/file.ts', 10, 5),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(
        safe.includes('file:///home/testuser/project/file.ts'),
        'file:// URL: path passes through (scheme prefix prevents home match)'
      );
    }

    // --- Very large line and column numbers ---
    {
      const stack = [
        'SecurityError: Test',
        parenFrame('minified', '/home/testuser/dist/bundle.js', 1, 999_999),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(safe.includes('~/dist/bundle.js'), 'Large col number: path should be sanitized');
      assert.ok(safe.includes(':1:999999'), 'Large col number: should be preserved');
    }

    // --- Deeply nested path ---
    {
      const deepPath = '/home/testuser/' + Array.from({ length: 20 }, (_, i) => `dir${i}`).join('/') + '/file.ts';
      const stack = [
        'SecurityError: Test',
        parenFrame('deep', deepPath, 1, 1),
      ].join('\n');
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.ok(safe.startsWith('SecurityError: Test\n'), 'Deep path: error message preserved');
      assert.ok(safe.includes('~/' + 'dir0/'), 'Deep path: home replaced, structure preserved');
    }

    // --- Empty stack (only error message) ---
    {
      const stack = 'SecurityError: Test';
      const safe = createErrorWithStack(stack).getSafeStack()!;
      assert.strictEqual(safe, 'SecurityError: Test', 'Single-line stack: should pass through');
    }

    console.log('✅ getSafeStack (regex edge cases) passed!');
  } finally {
    restoreEnv(snap);
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

/**
 * Run all getSafeStack cross-OS tests
 */
export async function runGetSafeStackTests(): Promise<void> {
  console.log('\n=== getSafeStack Cross-OS Path Sanitization Tests ===\n');

  try {
    testGetSafeStackUnixPaths();
    testGetSafeStackWindowsPaths();
    testGetSafeStackFrameParsing();
    testGetSafeStackRegexEdgeCases();

    console.log('\n✅ All getSafeStack cross-OS tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runGetSafeStackTests().catch(console.error);
}
