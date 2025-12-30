/**
 * Security Tests for Path Utilities
 *
 * Tests path normalization, symlink resolution, and security validation.
 */

import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import {
  normalizeAndValidatePath,
  validateSshKeyPath,
  expandTilde,
} from '../pathUtils';

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

  {
    const result = normalizeAndValidatePath('/home/user/.ssh/id_rsa');
    assert.strictEqual(result.valid, true, 'Absolute path should pass');
    assert.strictEqual(
      result.normalizedPath,
      '/home/user/.ssh/id_rsa',
      'Should normalize absolute path'
    );
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

    console.log('\n✅ All path utils tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runPathUtilsTests().catch(console.error);
}
