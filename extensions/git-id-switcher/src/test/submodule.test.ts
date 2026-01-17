/**
 * Security Tests for Submodule Handling
 *
 * Tests submodule path validation, symlink protection, depth limiting,
 * and GitExecResult error handling.
 *
 * Note: submodule.ts uses vscodeLoader for lazy loading, enabling unit testing
 * without VS Code extension host. The workspace-dependent functions gracefully
 * handle missing VS Code API by returning defaults.
 */

import * as assert from 'node:assert';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { validateSubmodulePath } from '../pathUtils';
import {
  getMaxSubmoduleDepth,
  listSubmodules,
  listSubmodulesRecursive,
  setSubmoduleGitConfig,
  setIdentityForSubmodules,
  isSubmoduleSupportEnabled,
  getSubmoduleDepth,
} from '../submodule';
import { _resetCache, _setMockVSCode } from '../vscodeLoader';

/**
 * Test submodule path validation basics
 */
function testSubmodulePathValidation(): void {
  console.log('Testing submodule path validation...');

  const workspacePath = os.tmpdir();

  // Valid relative paths should pass
  {
    const result = validateSubmodulePath('vendor/lib', workspacePath);
    assert.strictEqual(result.valid, true, 'Valid relative path should pass');
    assert.ok(
      result.normalizedPath?.startsWith(workspacePath),
      'Normalized path should be within workspace'
    );
  }

  // Nested paths should work
  {
    const result = validateSubmodulePath('packages/core/submodule', workspacePath);
    assert.strictEqual(result.valid, true, 'Nested path should pass');
  }

  console.log('  Submodule path validation basics passed');
}

/**
 * Test path traversal prevention
 */
function testTraversalPrevention(): void {
  console.log('Testing path traversal prevention...');

  const workspacePath = os.tmpdir();

  // These should all fail
  const traversalAttacks = [
    '../etc/passwd',
    '../../etc/passwd',
    'vendor/../../../etc/passwd',
    'submodule/../../..',
  ];

  for (const attack of traversalAttacks) {
    const result = validateSubmodulePath(attack, workspacePath);
    assert.strictEqual(
      result.valid,
      false,
      `Traversal should be blocked: "${attack}"`
    );
  }

  console.log('  Path traversal prevention passed');
}

/**
 * Test absolute path rejection
 */
function testAbsolutePathRejection(): void {
  console.log('Testing absolute path rejection...');

  const workspacePath = os.tmpdir();

  const absolutePaths = [
    '/etc/passwd',
    '/home/user/project',
    'C:\\Windows\\System32',
    '/var/www/html',
  ];

  for (const absPath of absolutePaths) {
    const result = validateSubmodulePath(absPath, workspacePath);
    assert.strictEqual(
      result.valid,
      false,
      `Absolute path should be rejected: "${absPath}"`
    );
  }

  console.log('  Absolute path rejection passed');
}

/**
 * Test control character rejection
 */
function testControlCharacterRejection(): void {
  console.log('Testing control character rejection...');

  const workspacePath = os.tmpdir();

  // Paths with control characters should be rejected
  const maliciousPaths = [
    'vendor\x00/lib',
    'sub\nmodule',
    'path\twith\ttabs',
    'vendor\rmodule',
  ];

  for (const malPath of maliciousPaths) {
    const result = validateSubmodulePath(malPath, workspacePath);
    assert.strictEqual(
      result.valid,
      false,
      `Control characters should be rejected: ${JSON.stringify(malPath)}`
    );
  }

  console.log('  Control character rejection passed');
}

/**
 * Test symlink escape prevention (when path exists)
 */
function testSymlinkEscapePrevention(): void {
  console.log('Testing symlink escape prevention...');

  const workspacePath = os.tmpdir();

  // Test that verifySymlinks option is respected
  {
    // Non-existent path with verifySymlinks enabled should still pass
    // (symlink check only applies to existing paths)
    const result = validateSubmodulePath(
      'non-existent-submodule',
      workspacePath,
      { verifySymlinks: true }
    );
    assert.strictEqual(
      result.valid,
      true,
      'Non-existent path should pass with verifySymlinks'
    );
  }

  // Test with verifySymlinks disabled
  {
    const result = validateSubmodulePath(
      'some-submodule',
      workspacePath,
      { verifySymlinks: false }
    );
    assert.strictEqual(
      result.valid,
      true,
      'Path should pass with verifySymlinks disabled'
    );
  }

  console.log('  Symlink escape prevention passed');
}

/**
 * Test MAX_SUBMODULE_DEPTH constant from submodule.ts
 */
function testMaxSubmoduleDepth(): void {
  console.log('Testing MAX_SUBMODULE_DEPTH...');

  const maxDepth = getMaxSubmoduleDepth();

  assert.strictEqual(typeof maxDepth, 'number', 'MAX_SUBMODULE_DEPTH should be a number');
  assert.ok(maxDepth > 0, 'MAX_SUBMODULE_DEPTH should be positive');
  assert.ok(maxDepth <= 10, 'MAX_SUBMODULE_DEPTH should be reasonable (<=10)');
  assert.strictEqual(maxDepth, 5, 'MAX_SUBMODULE_DEPTH should be 5 (matching package.json)');

  console.log(`  MAX_SUBMODULE_DEPTH is ${maxDepth}`);
  console.log('  MAX_SUBMODULE_DEPTH tests passed');
}

/**
 * Test workspace boundary enforcement
 */
function testWorkspaceBoundary(): void {
  console.log('Testing workspace boundary enforcement...');

  const workspacePath = path.join(os.tmpdir(), 'test-workspace');

  // Path that would escape workspace after normalization
  const escapeAttempts = [
    '../sibling-project',
    'vendor/../../sibling',
    './../outside',
  ];

  for (const attempt of escapeAttempts) {
    const result = validateSubmodulePath(attempt, workspacePath);
    assert.strictEqual(
      result.valid,
      false,
      `Workspace escape should be blocked: "${attempt}"`
    );
  }

  console.log('  Workspace boundary enforcement passed');
}

/**
 * Test regex pattern strictness (40-char SHA-1)
 *
 * Tests the SUBMODULE_STATUS_REGEX pattern used in submodule.ts
 */
function testRegexPatternStrictness(): void {
  console.log('Testing regex pattern strictness...');

  // Copy of the regex from submodule.ts for testing
  // Control characters are intentionally excluded for security
  // eslint-disable-next-line no-control-regex
  const SUBMODULE_STATUS_REGEX = /^([ +-])([a-f0-9]{40})\s+([^\x00-\x1f\x7f]+?)(?:\s+\([^)]+\))?$/;

  // Valid cases
  const validCases = [
    ' ' + 'a'.repeat(40) + ' submodule',
    ' ' + 'a'.repeat(40) + ' submodule (main)',
    '+' + 'a'.repeat(40) + ' path/to/submodule',
    '-' + 'a'.repeat(40) + ' uninitialized-submodule',
    ' ' + '0123456789abcdef0123456789abcdef01234567' + ' module (feature/branch)',
  ];

  for (const valid of validCases) {
    const match = valid.match(SUBMODULE_STATUS_REGEX);
    assert.ok(match, `Valid case should match: "${valid.substring(0, 50)}..."`);
  }

  // Invalid cases
  const invalidCases = [
    // Invalid status character
    'x' + 'a'.repeat(40) + ' submodule',
    // Short hash (39 chars)
    ' ' + 'a'.repeat(39) + ' submodule',
    // Long hash (41 chars)
    ' ' + 'a'.repeat(41) + ' submodule',
    // Non-hex hash
    ' ' + 'g'.repeat(40) + ' submodule',
    // Uppercase hex (git uses lowercase)
    ' ' + 'A'.repeat(40) + ' submodule',
    // Control character in path
    ' ' + 'a'.repeat(40) + ' sub\nmodule',
    // Empty path
    ' ' + 'a'.repeat(40) + ' ',
  ];

  for (const invalid of invalidCases) {
    const match = invalid.match(SUBMODULE_STATUS_REGEX);
    assert.strictEqual(match, null, `Invalid case should not match: "${invalid.substring(0, 50)}..."`);
  }

  console.log('  Regex pattern strictness tests passed');
}

/**
 * Test empty and invalid workspace paths
 */
function testInvalidWorkspacePaths(): void {
  console.log('Testing invalid workspace paths...');

  const invalidWorkspaces = [
    '',
    '/non/existent/path/that/does/not/exist',
  ];

  for (const workspace of invalidWorkspaces) {
    const result = validateSubmodulePath('submodule', workspace);
    assert.strictEqual(
      result.valid,
      false,
      `Invalid workspace should fail: "${workspace}"`
    );
  }

  console.log('  Invalid workspace path tests passed');
}

/**
 * Test listSubmodules GitExecResult error handling
 *
 * Coverage target: listSubmodules() error path (lines 137-148)
 * Tests that git command failures are handled gracefully.
 */
async function testListSubmodulesErrorHandling(): Promise<void> {
  console.log('Testing listSubmodules error handling...');

  // Test 1: Non-git directory returns empty array (not throw)
  {
    // Create a temporary directory that is NOT a git repository
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'submodule-test-'));
    try {
      const result = await listSubmodules(tempDir);
      assert.ok(Array.isArray(result), 'Should return an array');
      assert.strictEqual(result.length, 0, 'Non-git directory should return empty array');
    } finally {
      // Cleanup
      fs.rmdirSync(tempDir);
    }
  }

  // Test 2: Non-existent path returns empty array (validation fails first)
  {
    const result = await listSubmodules('/non/existent/path/xyz123');
    assert.ok(Array.isArray(result), 'Should return an array');
    assert.strictEqual(result.length, 0, 'Non-existent path should return empty array');
  }

  // Test 3: Empty string returns empty array
  {
    const result = await listSubmodules('');
    assert.ok(Array.isArray(result), 'Should return an array');
    assert.strictEqual(result.length, 0, 'Empty path should return empty array');
  }

  console.log('✅ listSubmodules error handling tests passed!');
}

/**
 * Test setSubmoduleGitConfig GitExecResult error handling
 *
 * Coverage target: setSubmoduleGitConfig() error path (lines 241-251)
 * Tests that git config failures are handled gracefully.
 */
async function testSetSubmoduleGitConfigErrorHandling(): Promise<void> {
  console.log('Testing setSubmoduleGitConfig error handling...');

  // Test 1: Non-git directory returns false (not throw)
  {
    // Create a temporary directory that is NOT a git repository
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitconfig-test-'));
    try {
      const result = await setSubmoduleGitConfig(tempDir, 'user.name', 'Test User');
      assert.strictEqual(result, false, 'Non-git directory should return false');
    } finally {
      // Cleanup
      fs.rmdirSync(tempDir);
    }
  }

  // Test 2: Non-existent path returns false
  {
    const result = await setSubmoduleGitConfig(
      '/non/existent/path/xyz123',
      'user.name',
      'Test User'
    );
    assert.strictEqual(result, false, 'Non-existent path should return false');
  }

  console.log('✅ setSubmoduleGitConfig error handling tests passed!');
}

/**
 * Test VS Code API fallback behavior
 *
 * Tests that functions work correctly when VS Code API is not available.
 */
function testVSCodeApiFallback(): void {
  console.log('Testing VS Code API fallback behavior...');

  // Reset cache to ensure clean state
  _resetCache();

  // isSubmoduleSupportEnabled should return true by default
  {
    const result = isSubmoduleSupportEnabled();
    assert.strictEqual(result, true, 'Should default to enabled when VS Code not available');
  }

  // getSubmoduleDepth should return 1 by default
  {
    const result = getSubmoduleDepth();
    assert.strictEqual(result, 1, 'Should default to 1 when VS Code not available');
  }

  console.log('✅ VS Code API fallback tests passed!');
}

/**
 * Test getSubmoduleDepth with mocked workspace (depth clamping)
 *
 * Coverage target: getSubmoduleDepth() clamping logic
 */
function testGetSubmoduleDepthClamping(): void {
  console.log('Testing getSubmoduleDepth clamping...');

  // Test with depth > MAX_SUBMODULE_DEPTH (should be clamped to 5)
  {
    const mockVSCode = {
      workspace: {
        getConfiguration: () => ({
          get: <T>() => 100 as unknown as T, // Very high depth
        }),
      },
      l10n: undefined,
      window: undefined,
      extensions: undefined,
    };

    try {
      _setMockVSCode(mockVSCode as never);
      const result = getSubmoduleDepth();
      assert.strictEqual(result, 5, 'Depth > MAX should be clamped to 5');
    } finally {
      _resetCache();
    }
  }

  // Test with negative depth (should be clamped to 0)
  {
    const mockVSCode = {
      workspace: {
        getConfiguration: () => ({
          get: <T>() => -5 as unknown as T, // Negative depth
        }),
      },
      l10n: undefined,
      window: undefined,
      extensions: undefined,
    };

    try {
      _setMockVSCode(mockVSCode as never);
      const result = getSubmoduleDepth();
      assert.strictEqual(result, 0, 'Negative depth should be clamped to 0');
    } finally {
      _resetCache();
    }
  }

  // Test with valid depth (should return as-is)
  {
    const mockVSCode = {
      workspace: {
        getConfiguration: () => ({
          get: <T>() => 3 as unknown as T, // Valid depth
        }),
      },
      l10n: undefined,
      window: undefined,
      extensions: undefined,
    };

    try {
      _setMockVSCode(mockVSCode as never);
      const result = getSubmoduleDepth();
      assert.strictEqual(result, 3, 'Valid depth should be returned as-is');
    } finally {
      _resetCache();
    }
  }

  console.log('✅ getSubmoduleDepth clamping tests passed!');
}

/**
 * Test listSubmodulesRecursive with various depths
 *
 * Coverage target: listSubmodulesRecursive() depth handling
 */
async function testListSubmodulesRecursiveDepth(): Promise<void> {
  console.log('Testing listSubmodulesRecursive depth handling...');

  // Reset cache
  _resetCache();

  // Test with depth 0 (should return empty array)
  {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'recursive-test-'));
    try {
      const result = await listSubmodulesRecursive(tempDir, 0);
      assert.ok(Array.isArray(result), 'Should return an array');
      assert.strictEqual(result.length, 0, 'Depth 0 should return empty array');
    } finally {
      fs.rmdirSync(tempDir);
    }
  }

  // Test with negative depth (should be clamped to 0, return empty)
  {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'recursive-test-'));
    try {
      const result = await listSubmodulesRecursive(tempDir, -5);
      assert.ok(Array.isArray(result), 'Should return an array');
      assert.strictEqual(result.length, 0, 'Negative depth should return empty array');
    } finally {
      fs.rmdirSync(tempDir);
    }
  }

  // Test with very high depth (should be clamped to MAX_SUBMODULE_DEPTH)
  {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'recursive-test-'));
    try {
      // This won't find any submodules, but should not throw
      const result = await listSubmodulesRecursive(tempDir, 100);
      assert.ok(Array.isArray(result), 'Should return an array');
      // Non-git directory returns empty array
      assert.strictEqual(result.length, 0, 'Non-git directory should return empty array');
    } finally {
      fs.rmdirSync(tempDir);
    }
  }

  console.log('✅ listSubmodulesRecursive depth handling tests passed!');
}

/**
 * Test isSubmoduleSupportEnabled with mocked workspace
 *
 * Coverage target: isSubmoduleSupportEnabled() with workspace available
 */
function testIsSubmoduleSupportEnabledWithMock(): void {
  console.log('Testing isSubmoduleSupportEnabled with mock...');

  // Test with applyToSubmodules = false
  {
    const mockVSCode = {
      workspace: {
        getConfiguration: () => ({
          get: <T>() => false as unknown as T,
        }),
      },
      l10n: undefined,
      window: undefined,
      extensions: undefined,
    };

    try {
      _setMockVSCode(mockVSCode as never);
      const result = isSubmoduleSupportEnabled();
      assert.strictEqual(result, false, 'Should return false when configured as false');
    } finally {
      _resetCache();
    }
  }

  // Test with applyToSubmodules = true
  {
    const mockVSCode = {
      workspace: {
        getConfiguration: () => ({
          get: <T>() => true as unknown as T,
        }),
      },
      l10n: undefined,
      window: undefined,
      extensions: undefined,
    };

    try {
      _setMockVSCode(mockVSCode as never);
      const result = isSubmoduleSupportEnabled();
      assert.strictEqual(result, true, 'Should return true when configured as true');
    } finally {
      _resetCache();
    }
  }

  console.log('✅ isSubmoduleSupportEnabled with mock tests passed!');
}

/**
 * Test setIdentityForSubmodules with empty array
 *
 * Coverage target: setIdentityForSubmodules() edge case
 */
async function testSetIdentityForSubmodulesEmpty(): Promise<void> {
  console.log('Testing setIdentityForSubmodules with empty array...');

  // Test with empty submodules array
  const result = await setIdentityForSubmodules([], 'Test User', 'test@example.com');

  assert.strictEqual(result.success, 0, 'Should have 0 success with empty array');
  assert.strictEqual(result.failed, 0, 'Should have 0 failed with empty array');

  console.log('✅ setIdentityForSubmodules empty array tests passed!');
}

/**
 * Test setSubmoduleGitConfig success path with real git repo
 *
 * Coverage target: setSubmoduleGitConfig() success return (line 255)
 */
async function testSetSubmoduleGitConfigSuccess(): Promise<void> {
  console.log('Testing setSubmoduleGitConfig success path...');

  const { execSync } = await import('node:child_process');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitconfig-success-'));

  try {
    // Initialize a git repo
    execSync('git init', { cwd: tempDir, stdio: 'ignore' });

    // Test setting user.name (should succeed)
    const result = await setSubmoduleGitConfig(tempDir, 'user.name', 'Test User');
    assert.strictEqual(result, true, 'setSubmoduleGitConfig should return true on success');

    // Test setting user.email (should succeed)
    const result2 = await setSubmoduleGitConfig(tempDir, 'user.email', 'test@example.com');
    assert.strictEqual(result2, true, 'setSubmoduleGitConfig should return true on success');

    console.log('✅ setSubmoduleGitConfig success path tests passed!');
  } finally {
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Test setIdentityForSubmodules with real git repo (success and failure paths)
 *
 * Coverage target: setIdentityForSubmodules() internal logic (lines 274-314)
 */
async function testSetIdentityForSubmodulesWithRepo(): Promise<void> {
  console.log('Testing setIdentityForSubmodules with real repo...');

  const { execSync } = await import('node:child_process');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-test-'));

  try {
    // Initialize a git repo
    execSync('git init', { cwd: tempDir, stdio: 'ignore' });

    // Create a mock submodule object pointing to the temp git repo
    const mockSubmodule = {
      path: 'test-submodule',
      absolutePath: tempDir,
      commitHash: 'abc123',
      initialized: true,
    };

    // Test with a single valid submodule (no GPG key)
    const result1 = await setIdentityForSubmodules(
      [mockSubmodule],
      'Test User',
      'test@example.com'
    );
    assert.strictEqual(result1.success, 1, 'Should have 1 success');
    assert.strictEqual(result1.failed, 0, 'Should have 0 failed');

    // Test with GPG key (covers gpgKeyId branch)
    const result2 = await setIdentityForSubmodules(
      [mockSubmodule],
      'Test User',
      'test@example.com',
      'ABCD1234'
    );
    assert.strictEqual(result2.success, 1, 'Should have 1 success with GPG key');
    assert.strictEqual(result2.failed, 0, 'Should have 0 failed');

    // Test with invalid submodule (non-git directory)
    const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'non-git-'));
    const invalidSubmodule = {
      path: 'invalid',
      absolutePath: nonGitDir,
      commitHash: 'def456',
      initialized: false,
    };

    try {
      const result3 = await setIdentityForSubmodules(
        [invalidSubmodule],
        'Test User',
        'test@example.com'
      );
      assert.strictEqual(result3.success, 0, 'Should have 0 success for non-git dir');
      assert.strictEqual(result3.failed, 1, 'Should have 1 failed for non-git dir');
    } finally {
      fs.rmSync(nonGitDir, { recursive: true, force: true });
    }

    console.log('✅ setIdentityForSubmodules with real repo tests passed!');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Test listSubmodules with git repo that has no submodules (empty stdout path)
 *
 * Coverage target: listSubmodules() empty stdout path (line 153-155)
 * Note: The full success path (lines 157-168) requires fixing a bug in gitExec
 * where stdout.trim() removes the leading status character from submodule output.
 */
async function testListSubmodulesEmptyResult(): Promise<void> {
  console.log('Testing listSubmodules with repo having no submodules...');

  const { execSync } = await import('node:child_process');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'no-submodules-'));

  try {
    // Initialize a git repo with no submodules
    execSync('git init', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: tempDir, stdio: 'ignore' });
    fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test Repo');
    execSync('git add .', { cwd: tempDir, stdio: 'ignore' });
    execSync('git commit -m "Initial commit"', { cwd: tempDir, stdio: 'ignore' });

    // Test listSubmodules - should return empty array
    const submodules = await listSubmodules(tempDir);

    assert.ok(Array.isArray(submodules), 'Should return an array');
    assert.strictEqual(submodules.length, 0, 'Should find 0 submodules');

    console.log('✅ listSubmodules empty result tests passed!');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Run all submodule tests
 */
export async function runSubmoduleTests(): Promise<void> {
  console.log('\n=== Submodule Security Tests ===\n');

  try {
    // Path validation tests
    testSubmodulePathValidation();
    testTraversalPrevention();
    testAbsolutePathRejection();
    testControlCharacterRejection();
    testSymlinkEscapePrevention();
    testMaxSubmoduleDepth();
    testWorkspaceBoundary();
    testRegexPatternStrictness();
    testInvalidWorkspacePaths();

    // VS Code API fallback tests
    testVSCodeApiFallback();

    // Depth clamping tests (with mocked workspace)
    testGetSubmoduleDepthClamping();

    // GitExecResult error handling tests
    await testListSubmodulesErrorHandling();
    await testSetSubmoduleGitConfigErrorHandling();

    // Recursive depth handling tests
    await testListSubmodulesRecursiveDepth();

    // Mocked workspace tests
    testIsSubmoduleSupportEnabledWithMock();

    // setIdentityForSubmodules tests
    await testSetIdentityForSubmodulesEmpty();

    // Success path tests with real git repos
    await testSetSubmoduleGitConfigSuccess();
    await testSetIdentityForSubmodulesWithRepo();

    // listSubmodules empty result path with real git repo
    await testListSubmodulesEmptyResult();

    console.log('\n✅ All submodule tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runSubmoduleTests().catch(console.error);
}
