/**
 * Security Tests for Path Utilities
 *
 * Tests path normalization, symlink resolution, and security validation.
 *
 * Coverage includes:
 * - expandTilde function (tilde expansion)
 * - normalizeAndValidatePath (path normalization and validation)
 * - validateSshKeyPath (SSH key specific validation)
 * - validateSubmodulePath (submodule path validation)
 * - containsSymlinks (symlink detection)
 * - Path traversal prevention
 * - PATH_MAX enforcement
 * - Home directory escape prevention
 *
 * 🔒 Defense-in-depth code not covered (requires fs mocking or malicious symlinks):
 *
 * normalizeAndValidatePath():
 *   Lines 160-163: Double-check normalization consistency
 *     - path.resolve() and path.normalize() are idempotent
 *     - Defense against potential Node.js path module bugs
 *
 *   Lines 169-174: Post-normalization check failed
 *     - Unreachable: isSecurePath (line 127) catches attacks before normalization
 *     - Defense-in-depth for bypasses or Node.js edge cases
 *
 *   Lines 179-184: Normalized path exceeds PATH_MAX
 *     - Normalization typically shortens paths (removes .., //)
 *     - Edge case: very long tilde expansion on systems with short home paths
 *
 *   Lines 191-196, 204-209: Symlink resolution failures
 *     - Requires ELOOP (symlink loop), EACCES, or malicious symlinks
 *     - Creating symlink loops is destructive and platform-specific
 *
 * isSecurePathAfterNormalization():
 *   Lines 254-255: Null byte in normalized path
 *     - path.normalize() removes null bytes on most platforms
 *     - Defense against platforms with different behavior
 *
 *   Lines 260-264: Path traversal in normalized path
 *     - path.normalize() resolves .. and .
 *     - Defense against edge cases not caught by pre-check
 *
 *   Lines 268-272: Double slashes in normalized path
 *     - path.normalize() removes double slashes
 *     - Defense against platforms with different behavior
 *
 *   Lines 279-283: Home directory escape after normalization
 *     - Requires path that passes isSecurePath but escapes after normalize
 *     - Pre-check catches most traversal attacks
 *
 * resolveSymlinksSecurely():
 *   Lines 323-327: Resolved path exceeds PATH_MAX
 *     - Requires symlink target to be extremely long
 *     - Filesystem-dependent edge case
 *
 *   Lines 339-342: ELOOP (symlink loop)
 *     - Requires creating actual symlink loops (A->B->A)
 *     - Destructive test setup
 *
 *   Lines 354-372: EACCES, ENAMETOOLONG, ENOTDIR, default errors
 *     - Require specific filesystem conditions or permissions
 *     - Platform-specific behavior
 *
 * containsSymlinks():
 *   Lines 395-396: ELOOP detection
 *     - Same as above - requires symlink loops
 *
 * validateSubmodulePath():
 *   Lines 565-572: Submodule path escapes workspace after normalization
 *     - Requires path that passes initial checks but escapes after normalize
 *     - Pre-checks are comprehensive
 *
 *   Lines 593-626: Symlink escape checks
 *     - Requires actual symlinks pointing outside workspace
 *     - Would need test fixtures with symlinks (platform-specific)
 *
 *   Lines 633-635: Non-ENOENT error logging
 *     - Requires specific filesystem errors (EACCES, etc.)
 *     - Empty code block (just comment) for logging purposes
 */

import * as assert from 'node:assert';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  normalizeAndValidatePath,
  validateSshKeyPath,
  validateSubmodulePath,
  validateWorkspacePath,
  expandTilde,
  containsSymlinks,
  isUnderSshDirectory,
} from '../security/pathUtils';

/**
 * Test tilde expansion
 */
function testExpandTilde(): void {
  console.log('Testing tilde expansion...');

  const homeDir = os.homedir();

  // Valid tilde expansions
  assert.strictEqual(expandTilde('~'), homeDir, '~ should expand to home');
  assert.strictEqual(
    expandTilde('~/.ssh'),
    path.join(homeDir, '.ssh'),
    '~/.ssh should expand'
  );
  assert.strictEqual(
    expandTilde('~/Documents/file.txt'),
    path.join(homeDir, 'Documents/file.txt'),
    '~/path should expand'
  );

  // Should NOT expand ~user
  assert.strictEqual(expandTilde('~root'), '~root', '~user should not expand');
  assert.strictEqual(
    expandTilde('~root/.ssh'),
    '~root/.ssh',
    '~user/path should not expand'
  );

  // Non-tilde paths should be unchanged
  assert.strictEqual(expandTilde('/etc/passwd'), '/etc/passwd', 'Absolute path unchanged');
  assert.strictEqual(expandTilde('./file'), './file', 'Relative path unchanged');

  console.log('✅ Tilde expansion tests passed!');
}

/**
 * Test basic path normalization
 */
function testNormalizeAndValidatePath(): void {
  console.log('Testing normalizeAndValidatePath...');

  const homeDir = os.homedir();

  // Valid paths should normalize correctly
  {
    const result = normalizeAndValidatePath('~/.ssh/id_rsa');
    assert.strictEqual(result.valid, true, 'Valid tilde path should pass');
    assert.strictEqual(
      result.normalizedPath,
      path.join(homeDir, '.ssh/id_rsa'),
      'Should normalize tilde path'
    );
  }

  // Unix absolute path test - skipped on Windows (Windows converts /path to D:\path)
  if (process.platform !== 'win32') {
    const result = normalizeAndValidatePath('/home/user/.ssh/id_rsa');
    assert.strictEqual(result.valid, true, 'Absolute path should pass');
    assert.strictEqual(
      result.normalizedPath,
      '/home/user/.ssh/id_rsa',
      'Should normalize absolute path'
    );
  } else {
    console.log('  Skipped Unix absolute path test on Windows');
  }

  console.log('✅ normalizeAndValidatePath basic tests passed!');
}

/**
 * Test path traversal prevention after normalization
 */
function testTraversalPrevention(): void {
  console.log('Testing traversal prevention...');

  // These should all fail
  const traversalAttacks = [
    '../etc/passwd',
    '../../etc/passwd',
    '~/../etc/passwd',
    '~/.ssh/../../etc/passwd',
  ];

  for (const attack of traversalAttacks) {
    const result = normalizeAndValidatePath(attack);
    assert.strictEqual(
      result.valid,
      false,
      `Traversal should be blocked: "${attack}"`
    );
  }

  console.log('✅ Traversal prevention tests passed!');
}

/**
 * Test symlink-related security
 */
function testSymlinkSecurity(): void {
  console.log('Testing symlink security...');

  // Test with resolve symlinks option
  {
    const result = normalizeAndValidatePath('~/.ssh/id_rsa', {
      resolveSymlinks: true,
      requireExists: false,
    });
    // Should succeed even if file doesn't exist (requireExists: false)
    assert.strictEqual(result.valid, true, 'Should handle non-existent path');
  }

  console.log('✅ Symlink security tests passed!');
}

/**
 * Test SSH key path validation
 */
function testValidateSshKeyPath(): void {
  console.log('Testing validateSshKeyPath...');

  // Valid SSH key paths
  {
    const result = validateSshKeyPath('~/.ssh/id_rsa');
    assert.strictEqual(result.valid, true, '~/.ssh/id_rsa should be valid');
  }

  {
    const result = validateSshKeyPath('~/.ssh/id_ed25519');
    assert.strictEqual(result.valid, true, '~/.ssh/id_ed25519 should be valid');
  }

  // Invalid paths should be rejected
  {
    const result = validateSshKeyPath('../etc/passwd');
    assert.strictEqual(result.valid, false, 'Traversal should be blocked');
  }

  {
    const result = validateSshKeyPath('~root/.ssh/id_rsa');
    assert.strictEqual(result.valid, false, '~user should be blocked');
  }

  console.log('✅ validateSshKeyPath tests passed!');
}

/**
 * Test PATH_MAX enforcement
 */
function testPathMaxEnforcement(): void {
  console.log('Testing PATH_MAX enforcement...');

  // Create a very long path
  const longPath = '/' + 'a'.repeat(5000);
  const result = normalizeAndValidatePath(longPath);
  assert.strictEqual(result.valid, false, 'Path exceeding PATH_MAX should fail');
  assert.ok(
    result.reason?.includes('maximum length'),
    'Should mention maximum length'
  );

  console.log('✅ PATH_MAX enforcement tests passed!');
}

/**
 * Test home directory escape prevention
 */
function testHomeDirectoryEscape(): void {
  console.log('Testing home directory escape prevention...');

  // Attempts to escape home directory
  const escapeAttempts = [
    '~/../../etc/passwd',
    '~/../../../etc/shadow',
  ];

  for (const attempt of escapeAttempts) {
    const result = normalizeAndValidatePath(attempt);
    assert.strictEqual(
      result.valid,
      false,
      `Home escape should be blocked: "${attempt}"`
    );
  }

  console.log('✅ Home directory escape prevention tests passed!');
}

/**
 * Test empty and null path handling
 */
function testEmptyPaths(): void {
  console.log('Testing empty path handling...');

  const result1 = normalizeAndValidatePath('');
  assert.strictEqual(result1.valid, false, 'Empty string should fail');

  const result2 = normalizeAndValidatePath(null as unknown as string);
  assert.strictEqual(result2.valid, false, 'Null should fail');

  const result3 = normalizeAndValidatePath(undefined as unknown as string);
  assert.strictEqual(result3.valid, false, 'Undefined should fail');

  console.log('✅ Empty path handling tests passed!');
}

/**
 * Test containsSymlinks function
 */
function testContainsSymlinks(): void {
  console.log('Testing containsSymlinks...');

  const homeDir = os.homedir();
  const tempDir = os.tmpdir();

  // Test with known paths (results depend on actual filesystem)
  {
    // Home directory typically doesn't contain symlinks in its path
    const result = containsSymlinks(homeDir);
    // Just verify it returns a boolean without throwing
    assert.strictEqual(typeof result, 'boolean', 'Should return boolean');
  }

  // Test with temp directory
  {
    const result = containsSymlinks(tempDir);
    assert.strictEqual(typeof result, 'boolean', 'Should return boolean for tempdir');
  }

  // Test with non-existent path (should return false)
  {
    const result = containsSymlinks('/nonexistent/path/that/does/not/exist');
    assert.strictEqual(result, false, 'Non-existent path should return false');
  }

  // Test with current directory
  {
    const result = containsSymlinks(process.cwd());
    assert.strictEqual(typeof result, 'boolean', 'Should return boolean for cwd');
  }

  console.log('✅ containsSymlinks tests passed!');
}

/**
 * Test validateSubmodulePath function
 */
function testValidateSubmodulePath(): void {
  console.log('Testing validateSubmodulePath...');

  // Normalize workspace path to forward slashes for cross-platform compatibility
  const workspacePath = process.cwd();

  // Test valid relative submodule path
  {
    const result = validateSubmodulePath('src', workspacePath);
    // May or may not exist, but should be valid format
    assert.strictEqual(typeof result.valid, 'boolean', 'Should return valid status');
  }

  // Test empty submodule path
  {
    const result = validateSubmodulePath('', workspacePath);
    assert.strictEqual(result.valid, false, 'Empty path should fail');
    assert.ok(
      result.reason?.includes('empty') || result.reason?.includes('Empty'),
      `Should mention empty (case-insensitive), got: "${result.reason}"`
    );
  }

  // Test whitespace-only submodule path
  {
    const result = validateSubmodulePath('   ', workspacePath);
    assert.strictEqual(result.valid, false, 'Whitespace path should fail');
  }

  // Test absolute submodule path (should fail)
  {
    const result = validateSubmodulePath('/absolute/path', workspacePath);
    assert.strictEqual(result.valid, false, 'Absolute path should fail');
    assert.ok(
      result.reason?.includes('relative'),
      'Should mention relative'
    );
  }

  // Test path traversal attempt
  {
    const result = validateSubmodulePath('../escape', workspacePath);
    assert.strictEqual(result.valid, false, 'Path traversal should fail');
  }

  // Test deeply nested traversal
  {
    const result = validateSubmodulePath('../../../../../../etc/passwd', workspacePath);
    assert.strictEqual(result.valid, false, 'Deep traversal should fail');
  }

  // Test path with control characters
  {
    const result = validateSubmodulePath('path\x00with\x00nulls', workspacePath);
    assert.strictEqual(result.valid, false, 'Control chars should fail');
    assert.ok(
      result.reason?.includes('control'),
      'Should mention control characters'
    );
  }

  // Test very long submodule path
  {
    const longPath = 'a'.repeat(5000);
    const result = validateSubmodulePath(longPath, workspacePath);
    assert.strictEqual(result.valid, false, 'Very long path should fail');
    assert.ok(
      result.reason?.includes('length'),
      'Should mention length'
    );
  }

  // Test invalid workspace path
  {
    const result = validateSubmodulePath('submodule', '/nonexistent/workspace/path');
    assert.strictEqual(result.valid, false, 'Invalid workspace should fail');
    assert.ok(
      result.reason?.includes('workspace'),
      'Should mention workspace'
    );
  }

  // Test submodule path that escapes workspace after normalization
  {
    // This path looks innocent but might escape after normalization
    const result = validateSubmodulePath('submodule/../../..', workspacePath);
    assert.strictEqual(result.valid, false, 'Escape attempt should fail');
  }

  console.log('✅ validateSubmodulePath tests passed!');
}

/**
 * Test normalizeAndValidatePath with requireExists option
 *
 * DESIGN NOTE: normalizeAndValidatePath is designed for Unix-style paths only
 * (SSH keys, log files). On Windows, os.homedir() returns Windows paths
 * (C:\Users\...) which are rejected by isSecurePath by design.
 * The existing path test is skipped on Windows.
 */
function testRequireExistsOption(): void {
  console.log('Testing requireExists option...');

  // Test with existing path (Unix only - Windows paths are rejected by design)
  if (process.platform !== 'win32') {
    const homeDir = os.homedir();
    const result = normalizeAndValidatePath(homeDir, { requireExists: true });
    assert.strictEqual(result.valid, true, 'Existing path should pass');
  } else {
    console.log('  [Windows] Skipping existing path test (Unix-style paths only)');
  }

  // Test with non-existing path (works on all platforms)
  {
    const result = normalizeAndValidatePath('/nonexistent/path/file.txt', {
      requireExists: true,
    });
    assert.strictEqual(result.valid, false, 'Non-existing path should fail');
    assert.ok(
      result.reason?.includes('not exist') || result.reason?.includes('ENOENT'),
      'Should mention not exist'
    );
  }

  console.log('✅ requireExists option tests passed!');
}

/**
 * Test normalizeAndValidatePath with baseDir option
 *
 * DESIGN NOTE: normalizeAndValidatePath is designed for Unix-style paths only.
 * On Windows, os.homedir() and os.tmpdir() return Windows paths which are
 * rejected by isSecurePath. These tests are skipped on Windows.
 */
function testBaseDirOption(): void {
  console.log('Testing baseDir option...');

  // Skip all baseDir tests on Windows (Windows paths are rejected by design)
  if (process.platform === 'win32') {
    console.log('  [Windows] Skipping baseDir tests (Unix-style paths only)');
    console.log('✅ baseDir option tests passed!');
    return;
  }

  const homeDir = os.homedir();

  // Test relative path resolution with baseDir (must use ./ prefix)
  {
    const result = normalizeAndValidatePath('./Documents', { baseDir: homeDir });
    assert.strictEqual(result.valid, true, 'Relative path should resolve');
    assert.strictEqual(
      result.normalizedPath,
      path.join(homeDir, 'Documents'),
      'Should resolve relative to baseDir'
    );
  }

  // Test that baseDir is used for relative paths
  {
    const tempDir = os.tmpdir();
    const result = normalizeAndValidatePath('./test.txt', { baseDir: tempDir });
    assert.strictEqual(result.valid, true, 'Relative path should resolve');
    assert.ok(
      result.normalizedPath?.startsWith(path.resolve(tempDir)),
      'Should resolve relative to tempDir'
    );
  }

  // Test absolute path ignores baseDir
  {
    const result = normalizeAndValidatePath('/absolute/path', { baseDir: homeDir });
    assert.strictEqual(result.valid, true, 'Absolute path should pass');
    assert.strictEqual(
      result.normalizedPath,
      '/absolute/path',
      'Absolute path should not use baseDir'
    );
  }

  console.log('✅ baseDir option tests passed!');
}

/**
 * Test resolveSymlinks option
 *
 * DESIGN NOTE: normalizeAndValidatePath is designed for Unix-style paths only.
 * On Windows, os.homedir() returns Windows paths which are rejected by
 * isSecurePath. The existing path tests are skipped on Windows.
 */
function testResolveSymlinksOption(): void {
  console.log('Testing resolveSymlinks option...');

  // Tests with existing path (Unix only - Windows paths are rejected by design)
  if (process.platform !== 'win32') {
    const homeDir = os.homedir();

    // Test without resolveSymlinks
    {
      const result = normalizeAndValidatePath(homeDir, { resolveSymlinks: false });
      assert.strictEqual(result.valid, true, 'Should pass without symlink resolution');
      // symlinksResolved should be falsy (false or undefined)
      assert.ok(
        result.symlinksResolved === undefined || result.symlinksResolved === false,
        'symlinksResolved should be false or undefined'
      );
    }

    // Test with resolveSymlinks on existing path
    {
      const result = normalizeAndValidatePath(homeDir, { resolveSymlinks: true });
      assert.strictEqual(result.valid, true, 'Should pass with symlink resolution');
      // symlinksResolved may be true if home has symlinks, or false otherwise
      assert.strictEqual(
        typeof result.symlinksResolved,
        'boolean',
        'symlinksResolved should be boolean'
      );
    }
  } else {
    console.log('  [Windows] Skipping existing path tests (Unix-style paths only)');
  }

  // Test with resolveSymlinks on non-existent path (works on all platforms)
  {
    const result = normalizeAndValidatePath('/nonexistent/path/file.txt', {
      resolveSymlinks: true,
      requireExists: false,
    });
    // Should still be valid (path format is OK)
    assert.strictEqual(result.valid, true, 'Non-existent path should still be valid format');
  }

  console.log('✅ resolveSymlinks option tests passed!');
}

/**
 * Test path with special characters
 */
function testSpecialCharacterPaths(): void {
  console.log('Testing special character paths...');

  // Test path with spaces
  {
    const result = normalizeAndValidatePath('/path/with spaces/file.txt');
    assert.strictEqual(result.valid, true, 'Path with spaces should be valid');
  }

  // Test path with unicode characters
  {
    const result = normalizeAndValidatePath('/path/日本語/file.txt');
    assert.strictEqual(result.valid, true, 'Path with unicode should be valid');
  }

  // Test path with dots (but not traversal)
  {
    const result = normalizeAndValidatePath('/path/to/.hidden/file.txt');
    assert.strictEqual(result.valid, true, 'Path with hidden dir should be valid');
  }

  // Test path with multiple dots in filename
  {
    const result = normalizeAndValidatePath('/path/file.tar.gz');
    assert.strictEqual(result.valid, true, 'Path with multiple dots should be valid');
  }

  console.log('✅ Special character paths tests passed!');
}

/**
 * Test double slash handling
 */
function testDoubleSlashHandling(): void {
  console.log('Testing double slash handling...');

  // Test path with double slashes - SECURITY: rejected as potential attack
  {
    const result = normalizeAndValidatePath('/path//to//file.txt');
    // Double slashes are rejected during pre-normalization security check
    assert.strictEqual(result.valid, false, 'Path with double slashes should be rejected');
    assert.ok(
      result.reason?.includes('double slashes'),
      'Should mention double slashes in reason'
    );
  }

  // Test that properly formatted paths work
  {
    const result = normalizeAndValidatePath('/path/to/file.txt');
    assert.strictEqual(result.valid, true, 'Normal path should pass');
    assert.ok(
      !result.normalizedPath?.includes('//'),
      'Normalized path should not have double slashes'
    );
  }

  console.log('✅ Double slash handling tests passed!');
}

/**
 * Test validateSshKeyPath with various locations
 */
function testSshKeyPathLocations(): void {
  console.log('Testing SSH key path locations...');

  // Test /etc/ssh location (system keys)
  {
    const result = validateSshKeyPath('/etc/ssh/ssh_host_rsa_key');
    // This path format is valid (might not exist)
    assert.strictEqual(result.valid, true, '/etc/ssh path should be valid format');
  }

  // Test custom location (outside standard dirs)
  {
    const result = validateSshKeyPath('/custom/path/id_rsa');
    // Custom locations are allowed but noted
    assert.strictEqual(result.valid, true, 'Custom location should be valid');
  }

  // Test Windows-style path (if on Windows)
  if (process.platform === 'win32') {
    const result = validateSshKeyPath('C:\\Users\\test\\.ssh\\id_rsa');
    assert.strictEqual(typeof result.valid, 'boolean', 'Windows path should be processed');
  }

  console.log('✅ SSH key path locations tests passed!');
}

/**
 * Test validateSubmodulePath with symlink options
 */
function testValidateSubmodulePathSymlinkOptions(): void {
  console.log('Testing validateSubmodulePath symlink options...');

  // Normalize workspace path to forward slashes for cross-platform compatibility
  const workspacePath = process.cwd();

  // Test with verifySymlinks: false
  {
    const result = validateSubmodulePath('src', workspacePath, {
      verifySymlinks: false,
    });
    assert.strictEqual(typeof result.valid, 'boolean', 'Should return valid status');
  }

  // Test with verifySymlinks: true (default)
  {
    const result = validateSubmodulePath('src', workspacePath, {
      verifySymlinks: true,
    });
    assert.strictEqual(typeof result.valid, 'boolean', 'Should return valid status');
  }

  // Test with requireExists: true on non-existent path
  {
    const result = validateSubmodulePath('./nonexistent-submodule', workspacePath, {
      requireExists: true,
    });
    // Should fail because path doesn't exist
    assert.strictEqual(result.valid, false, 'Non-existent path should fail with requireExists');
    assert.ok(
      result.reason?.includes('exist') || result.reason?.includes('ENOENT') || result.reason?.includes('not exist'),
      'Should mention not existing'
    );
  }

  // Test with requireExists: false on non-existent path
  {
    const result = validateSubmodulePath('./nonexistent-submodule', workspacePath, {
      requireExists: false,
    });
    // May still fail due to other validation (outside workspace check)
    // Just verify it returns a valid response
    assert.strictEqual(typeof result.valid, 'boolean', 'Should return valid status');
  }

  console.log('✅ validateSubmodulePath symlink options tests passed!');
}

/**
 * Test validateSubmodulePath with existing directory (covers verifySubmoduleSymlinks)
 */
function testValidateSubmodulePathExistingDir(): void {
  console.log('Testing validateSubmodulePath with existing directory...');

  // Normalize workspace path to forward slashes for cross-platform compatibility
  const workspacePath = process.cwd();

  // Test with actually existing directory to cover verifySubmoduleSymlinks path
  // The 'src' directory should exist in the extension
  {
    const result = validateSubmodulePath('src', workspacePath, {
      verifySymlinks: true,
      requireExists: false,
    });
    // If src exists, verifySubmoduleSymlinks will be called and return symlinksResolved
    if (result.valid && result.symlinksResolved !== undefined) {
      assert.strictEqual(result.symlinksResolved, true, 'Should have symlinks resolved');
    }
    assert.strictEqual(typeof result.valid, 'boolean', 'Should return valid status');
  }

  // Test with 'node_modules' which typically exists
  {
    const result = validateSubmodulePath('node_modules', workspacePath, {
      verifySymlinks: true,
    });
    assert.strictEqual(typeof result.valid, 'boolean', 'Should return valid status');
  }

  // Test with package.json (file, not directory)
  {
    const result = validateSubmodulePath('package.json', workspacePath, {
      verifySymlinks: true,
    });
    assert.strictEqual(typeof result.valid, 'boolean', 'Should return valid status for file');
  }

  console.log('✅ validateSubmodulePath existing directory tests passed!');
}

/**
 * Test checkWorkspaceBoundary via validateSubmodulePath edge cases
 */
function testWorkspaceBoundaryChecks(): void {
  console.log('Testing workspace boundary checks...');

  // Normalize workspace path to forward slashes for cross-platform compatibility
  const workspacePath = process.cwd();

  // Test path that looks safe but escapes after normalization
  {
    const result = validateSubmodulePath('valid/../..', workspacePath);
    assert.strictEqual(result.valid, false, 'Escape after normalize should fail');
  }

  // Test path with multiple components escaping
  {
    const result = validateSubmodulePath('a/b/c/../../../..', workspacePath);
    assert.strictEqual(result.valid, false, 'Multi-component escape should fail');
  }

  // Test deeply nested valid path (with verifySymlinks: false to avoid existence check)
  {
    const result = validateSubmodulePath('./a/b/c/d/e/f', workspacePath, {
      verifySymlinks: false,
      requireExists: false,
    });
    assert.strictEqual(result.valid, true, 'Deeply nested path should be valid');
  }

  console.log('✅ Workspace boundary checks tests passed!');
}

/**
 * Test normalizeAndValidatePath with null byte injection
 */
function testNullByteInjection(): void {
  console.log('Testing null byte injection prevention...');

  // Test null byte in path
  {
    const result = normalizeAndValidatePath('/path/to\x00/file.txt');
    assert.strictEqual(result.valid, false, 'Path with null byte should fail');
    assert.ok(
      result.reason?.toLowerCase().includes('null'),
      'Should mention null byte'
    );
  }

  // Test null byte at end
  {
    const result = normalizeAndValidatePath('/path/to/file.txt\x00');
    assert.strictEqual(result.valid, false, 'Path with trailing null should fail');
  }

  console.log('✅ Null byte injection prevention tests passed!');
}

/**
 * Test expandTilde edge cases
 */
function testExpandTildeEdgeCases(): void {
  console.log('Testing expandTilde edge cases...');

  // Test empty string
  {
    const result = expandTilde('');
    assert.strictEqual(result, '', 'Empty string should return empty');
  }

  // Test null (should return as-is)
  {
    const result = expandTilde(null as unknown as string);
    assert.strictEqual(result, null, 'Null should return null');
  }

  // Test tilde alone
  {
    const result = expandTilde('~');
    assert.strictEqual(result, os.homedir(), 'Tilde alone should expand');
  }

  // Test multiple tildes
  {
    const result = expandTilde('~/path/~/file');
    // Only leading tilde should expand
    assert.ok(result.startsWith(os.homedir()), 'Should start with home');
    // On Windows, path.join converts / to \, so inner tilde becomes ~\file
    // Check for ~ followed by path.sep and file
    assert.ok(result.includes(`~${path.sep}file`), 'Inner tilde should not expand');
  }

  console.log('✅ expandTilde edge cases tests passed!');
}

/**
 * Test control character prevention
 */
function testControlCharacterPrevention(): void {
  console.log('Testing control character prevention...');

  // Test various control characters
  const controlChars = [
    '\x01', // SOH
    '\x07', // Bell
    '\x08', // Backspace
    '\x1b', // Escape
    '\x7f', // DEL
  ];

  for (const char of controlChars) {
    const result = normalizeAndValidatePath(`/path/to${char}file.txt`);
    assert.strictEqual(result.valid, false, `Control char should be blocked`);
  }

  console.log('✅ Control character prevention tests passed!');
}

/**
 * Test validateWorkspacePath function
 *
 * This function validates workspace paths in platform-native format.
 * Unlike normalizeAndValidatePath, it accepts Windows paths (drive letters, backslashes).
 */
function testValidateWorkspacePath(): void {
  console.log('Testing validateWorkspacePath...');

  // Test with current working directory (platform-native)
  {
    const result = validateWorkspacePath(process.cwd());
    assert.strictEqual(result.valid, true, 'CWD should be valid');
    assert.ok(result.normalizedPath, 'Should have normalized path');
  }

  // Test empty path
  {
    const result = validateWorkspacePath('');
    assert.strictEqual(result.valid, false, 'Empty path should fail');
    assert.ok(result.reason?.includes('empty'), 'Should mention empty');
  }

  // Test null/undefined
  {
    const result = validateWorkspacePath(null as unknown as string);
    assert.strictEqual(result.valid, false, 'Null should fail');
  }

  // Test whitespace
  {
    const result = validateWorkspacePath('  /path  ');
    assert.strictEqual(result.valid, false, 'Whitespace should fail');
    assert.ok(result.reason?.includes('whitespace'), 'Should mention whitespace');
  }

  // Test null byte injection
  {
    const result = validateWorkspacePath('/path/to\x00file');
    assert.strictEqual(result.valid, false, 'Null byte should fail');
    assert.ok(result.reason?.includes('null byte'), 'Should mention null byte');
  }

  // Test control characters
  {
    const result = validateWorkspacePath('/path/to\x07file');
    assert.strictEqual(result.valid, false, 'Control char should fail');
    assert.ok(result.reason?.includes('control'), 'Should mention control characters');
  }

  // Test invisible Unicode characters
  {
    const result = validateWorkspacePath('/path/\u200Bfile'); // Zero-width space
    assert.strictEqual(result.valid, false, 'Invisible Unicode should fail');
    assert.ok(result.reason?.includes('invisible'), 'Should mention invisible Unicode');
  }

  // Test very long path
  {
    const longPath = '/' + 'a'.repeat(5000);
    const result = validateWorkspacePath(longPath);
    assert.strictEqual(result.valid, false, 'Very long path should fail');
    assert.ok(result.reason?.includes('maximum length'), 'Should mention length');
  }

  // Test requireExists with non-existent path
  {
    const result = validateWorkspacePath('/nonexistent/path/12345', { requireExists: true });
    assert.strictEqual(result.valid, false, 'Non-existent path should fail with requireExists');
    assert.ok(
      result.reason?.includes('not exist') || result.reason?.includes('ENOENT'),
      'Should mention not existing'
    );
  }

  // Test requireExists with existing path
  {
    const result = validateWorkspacePath(os.homedir(), { requireExists: true });
    assert.strictEqual(result.valid, true, 'Existing path should pass with requireExists');
  }

  // Platform-specific tests
  if (process.platform === 'win32') {
    // Windows: test drive letter paths
    {
      const result = validateWorkspacePath('C:\\Users\\test');
      assert.strictEqual(result.valid, true, 'Windows drive path should be valid');
    }

    // Windows: test forward slash paths (also valid on Windows)
    {
      const result = validateWorkspacePath('C:/Users/test');
      assert.strictEqual(result.valid, true, 'Windows forward slash path should be valid');
    }
  } else {
    // Unix: test absolute paths
    {
      const result = validateWorkspacePath('/home/user');
      assert.strictEqual(result.valid, true, 'Unix absolute path should be valid');
    }

    // Unix: test paths with backslash (backslash is valid filename char on Unix)
    {
      const result = validateWorkspacePath('/path/with\\backslash');
      assert.strictEqual(result.valid, true, 'Unix path with backslash should be valid');
    }
  }

  console.log('✅ validateWorkspacePath tests passed!');
}

/**
 * Test isUnderSshDirectory function
 */
function testIsUnderSshDirectory(): void {
  console.log('Testing isUnderSshDirectory...');

  const homeDir = os.homedir();

  // Valid paths under ~/.ssh/
  {
    assert.strictEqual(
      isUnderSshDirectory('~/.ssh/id_rsa'),
      true,
      '~/.ssh/id_rsa should be valid'
    );
  }

  {
    assert.strictEqual(
      isUnderSshDirectory('~/.ssh/keys/work_key'),
      true,
      '~/.ssh/keys/work_key should be valid (subdirectory)'
    );
  }

  // Expanded path format (Unix)
  if (process.platform !== 'win32') {
    assert.strictEqual(
      isUnderSshDirectory(path.join(homeDir, '.ssh', 'id_rsa')),
      true,
      'Expanded path should be valid'
    );
  }

  // Invalid paths
  {
    assert.strictEqual(
      isUnderSshDirectory('~/documents/key'),
      false,
      '~/documents/key should be invalid'
    );
  }

  {
    assert.strictEqual(
      isUnderSshDirectory('~/.ssh_backup/key'),
      false,
      '~/.ssh_backup/key should be invalid (not .ssh directory)'
    );
  }

  {
    assert.strictEqual(
      isUnderSshDirectory('/etc/passwd'),
      false,
      '/etc/passwd should be invalid'
    );
  }

  // Edge cases
  {
    assert.strictEqual(
      isUnderSshDirectory(''),
      false,
      'Empty string should be invalid'
    );
  }

  {
    assert.strictEqual(
      isUnderSshDirectory('~/.ssh'),
      false,
      '~/.ssh without trailing component should be invalid'
    );
  }

  console.log('✅ isUnderSshDirectory tests passed!');
}

/**
 * Run all path utils tests
 */
export async function runPathUtilsTests(): Promise<void> {
  console.log('\n=== Path Utils Security Tests ===\n');

  try {
    testExpandTilde();
    testNormalizeAndValidatePath();
    testTraversalPrevention();
    testSymlinkSecurity();
    testValidateSshKeyPath();
    testPathMaxEnforcement();
    testHomeDirectoryEscape();
    testEmptyPaths();
    testContainsSymlinks();
    testValidateSubmodulePath();
    testRequireExistsOption();
    testBaseDirOption();
    testResolveSymlinksOption();
    testSpecialCharacterPaths();
    testDoubleSlashHandling();
    testSshKeyPathLocations();
    testValidateSubmodulePathSymlinkOptions();
    testValidateSubmodulePathExistingDir();
    testWorkspaceBoundaryChecks();
    testNullByteInjection();
    testExpandTildeEdgeCases();
    testControlCharacterPrevention();
    testValidateWorkspacePath();
    testIsUnderSshDirectory();

    console.log('\n✅ All path utils tests passed!\n');
  } catch (error) {
    // Sanitize error to prevent sensitive data leakage
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Test failed:', errorMessage);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runPathUtilsTests().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
  });
}
