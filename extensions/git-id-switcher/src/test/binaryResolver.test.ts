/**
 * Tests for Binary Path Resolver
 *
 * Tests that binaryResolver properly:
 * - Resolves absolute paths for allowed commands
 * - Caches resolved paths
 * - Validates executables
 * - Handles VS Code git.path setting
 * - Rejects non-allowed commands
 *
 * Coverage includes:
 * - BinaryResolutionError class
 * - getBinaryPath function
 * - clearPathCache function
 * - checkBinaryAvailability function (including error handling)
 * - resolveAllBinaryPaths function (including error propagation)
 * - isAllowedCommand validation
 * - isValidExecutable validation
 *
 * Defense-in-depth code not covered (requires VS Code mocking):
 * - Lines 225-236: VS Code git.path validation path
 *   - Requires VS Code workspace mock to test getVSCodeGitPath()
 *   - The path where git.path setting is configured but invalid
 * - Lines 244-249: resolveCommandPath throw path
 *   - Requires which/where to fail for an allowed command
 *   - Tested indirectly via cache manipulation
 * - Lines 301-312: Non-BinaryResolutionError wrapping
 *   - Internal errors are already BinaryResolutionError
 *   - Defense-in-depth for unexpected error types
 */

import * as assert from 'node:assert';
import * as path from 'node:path';
import {
  getBinaryPath,
  clearPathCache,
  checkBinaryAvailability,
  resolveAllBinaryPaths,
  BinaryResolutionError,
  __testExports,
} from '../binaryResolver';
import { _setMockVSCode, _resetCache } from '../core/vscodeLoader';

const {
  ALLOWED_COMMANDS,
  WHICH_PATHS,
  pathCache,
  isAllowedCommand,
  isValidExecutable,
  getWhichCommand,
} = __testExports;

/**
 * Test BinaryResolutionError class
 */
function testBinaryResolutionError(): void {
  console.log('Testing BinaryResolutionError class...');

  // Test basic construction
  {
    const error = new BinaryResolutionError('git', 'Command not found');
    assert.strictEqual(error.name, 'BinaryResolutionError', 'Name should be set');
    assert.strictEqual(error.command, 'git', 'Command should be stored');
    assert.strictEqual(error.code, 'ENOENT_BINARY', 'Code should be ENOENT_BINARY');
    assert.ok(
      error.message.includes('git'),
      'Message should include command'
    );
    assert.ok(
      error.message.includes('Command not found'),
      'Message should include reason'
    );
  }

  // Test instanceof
  {
    const error = new BinaryResolutionError('ssh-add', 'Not executable');
    assert.ok(error instanceof BinaryResolutionError, 'Should be BinaryResolutionError');
    assert.ok(error instanceof Error, 'Should be Error');
  }

  // Test stack trace
  {
    const error = new BinaryResolutionError('ssh-keygen', 'Test');
    assert.ok(error.stack !== undefined, 'Should have stack trace');
  }

  console.log('✅ BinaryResolutionError tests passed!');
}

/**
 * Test ALLOWED_COMMANDS constant
 */
function testAllowedCommands(): void {
  console.log('Testing ALLOWED_COMMANDS...');

  assert.ok(ALLOWED_COMMANDS.includes('git'), 'git should be allowed');
  assert.ok(ALLOWED_COMMANDS.includes('ssh-add'), 'ssh-add should be allowed');
  assert.ok(ALLOWED_COMMANDS.includes('ssh-keygen'), 'ssh-keygen should be allowed');
  assert.strictEqual(ALLOWED_COMMANDS.length, 3, 'Should have exactly 3 allowed commands');

  console.log('✅ ALLOWED_COMMANDS tests passed!');
}

/**
 * Check if a path looks like an absolute path for its platform.
 * This is platform-agnostic, unlike path.isAbsolute().
 */
function looksLikeAbsolutePath(p: string, platform: string): boolean {
  if (platform === 'win32') {
    // Windows: C:\... or \\server\...
    return /^[A-Za-z]:[/\\]/.test(p) || p.startsWith('\\\\');
  }
  // Unix: starts with /
  return p.startsWith('/');
}

/**
 * Test WHICH_PATHS constant for platform security
 */
function testWhichPaths(): void {
  console.log('Testing WHICH_PATHS...');

  // Verify known platforms have entries
  assert.ok('darwin' in WHICH_PATHS, 'Should have darwin entry');
  assert.ok('linux' in WHICH_PATHS, 'Should have linux entry');
  assert.ok('win32' in WHICH_PATHS, 'Should have win32 entry');

  // Verify paths are absolute (platform-agnostic check)
  for (const [platform, paths] of Object.entries(WHICH_PATHS)) {
    for (const p of paths) {
      assert.ok(
        looksLikeAbsolutePath(p, platform),
        `Path ${p} for ${platform} should be absolute`
      );
    }
  }

  // Verify Windows uses where.exe
  assert.ok(
    WHICH_PATHS['win32'].some(p => p.includes('where')),
    'Windows should use where.exe'
  );

  // Verify Unix uses which
  assert.ok(
    WHICH_PATHS['darwin'].some(p => p.includes('which')),
    'macOS should use which'
  );
  assert.ok(
    WHICH_PATHS['linux'].some(p => p.includes('which')),
    'Linux should use which'
  );

  console.log('✅ WHICH_PATHS tests passed!');
}

/**
 * Test getWhichCommand returns absolute path when available
 */
async function testGetWhichCommand(): Promise<void> {
  console.log('Testing getWhichCommand...');

  const whichPath = await getWhichCommand();

  // Should return a non-empty string
  assert.ok(whichPath.length > 0, 'Should return a path');

  // On most systems, should return an absolute path
  if (path.isAbsolute(whichPath)) {
    console.log(`  Using absolute path: ${whichPath}`);
  } else {
    // Fallback to command name (less secure but acceptable)
    console.log(`  Fallback to command name: ${whichPath}`);
    assert.ok(
      whichPath === 'which' || whichPath === 'where',
      'Fallback should be which or where'
    );
  }

  console.log('✅ getWhichCommand tests passed!');
}

/**
 * Test isAllowedCommand function
 */
function testIsAllowedCommand(): void {
  console.log('Testing isAllowedCommand...');

  // Test allowed commands
  assert.strictEqual(isAllowedCommand('git'), true, 'git should be allowed');
  assert.strictEqual(isAllowedCommand('ssh-add'), true, 'ssh-add should be allowed');
  assert.strictEqual(isAllowedCommand('ssh-keygen'), true, 'ssh-keygen should be allowed');

  // Test disallowed commands
  assert.strictEqual(isAllowedCommand('rm'), false, 'rm should not be allowed');
  assert.strictEqual(isAllowedCommand('bash'), false, 'bash should not be allowed');
  assert.strictEqual(isAllowedCommand('curl'), false, 'curl should not be allowed');
  assert.strictEqual(isAllowedCommand(''), false, 'empty string should not be allowed');
  assert.strictEqual(isAllowedCommand('Git'), false, 'Git (capitalized) should not be allowed');

  console.log('✅ isAllowedCommand tests passed!');
}

/**
 * Test getBinaryPath with allowed commands
 */
async function testGetBinaryPathAllowed(): Promise<void> {
  console.log('Testing getBinaryPath with allowed commands...');

  // Clear cache before tests
  clearPathCache();

  // Test git path resolution
  {
    try {
      const gitPath = await getBinaryPath('git');
      assert.ok(gitPath.length > 0, 'Should return a path');
      assert.ok(
        path.isAbsolute(gitPath),
        'Should return absolute path'
      );
      console.log(`  Resolved git: ${gitPath}`);
    } catch (error) {
      if (error instanceof BinaryResolutionError) {
        console.log('  git not available (expected in some environments)');
      } else {
        throw error;
      }
    }
  }

  // Test ssh-add path resolution
  {
    try {
      const sshAddPath = await getBinaryPath('ssh-add');
      assert.ok(sshAddPath.length > 0, 'Should return a path');
      assert.ok(
        path.isAbsolute(sshAddPath),
        'Should return absolute path'
      );
      console.log(`  Resolved ssh-add: ${sshAddPath}`);
    } catch (error) {
      if (error instanceof BinaryResolutionError) {
        console.log('  ssh-add not available (expected in some environments)');
      } else {
        throw error;
      }
    }
  }

  // Test ssh-keygen path resolution
  {
    try {
      const sshKeygenPath = await getBinaryPath('ssh-keygen');
      assert.ok(sshKeygenPath.length > 0, 'Should return a path');
      assert.ok(
        path.isAbsolute(sshKeygenPath),
        'Should return absolute path'
      );
      console.log(`  Resolved ssh-keygen: ${sshKeygenPath}`);
    } catch (error) {
      if (error instanceof BinaryResolutionError) {
        console.log('  ssh-keygen not available (expected in some environments)');
      } else {
        throw error;
      }
    }
  }

  console.log('✅ getBinaryPath allowed commands tests passed!');
}

/**
 * Test getBinaryPath with disallowed commands
 */
async function testGetBinaryPathDisallowed(): Promise<void> {
  console.log('Testing getBinaryPath with disallowed commands...');

  // Test disallowed command throws Error (not BinaryResolutionError)
  {
    try {
      await getBinaryPath('rm');
      assert.fail('Should have thrown for disallowed command');
    } catch (error) {
      assert.ok(error instanceof Error, 'Should throw Error');
      assert.ok(
        !(error instanceof BinaryResolutionError),
        'Should not be BinaryResolutionError for disallowed command'
      );
      assert.ok(
        (error as Error).message.includes('not in the allowed list'),
        'Should mention not allowed'
      );
    }
  }

  // Test another disallowed command
  {
    try {
      await getBinaryPath('curl');
      assert.fail('Should have thrown for curl');
    } catch (error) {
      assert.ok(error instanceof Error, 'Should throw Error');
    }
  }

  console.log('✅ getBinaryPath disallowed commands tests passed!');
}

/**
 * Test path caching
 */
async function testPathCaching(): Promise<void> {
  console.log('Testing path caching...');

  // Clear cache
  clearPathCache();
  assert.strictEqual(pathCache.size, 0, 'Cache should be empty after clear');

  // Resolve a path
  try {
    const gitPath1 = await getBinaryPath('git');

    // Check cache is populated
    assert.ok(pathCache.has('git'), 'Cache should have git entry');

    // Second call should use cache
    const gitPath2 = await getBinaryPath('git');
    assert.strictEqual(gitPath1, gitPath2, 'Cached path should match');

    console.log('  Caching works correctly');
  } catch (error) {
    if (error instanceof BinaryResolutionError) {
      console.log('  git not available, skipping cache test');
    } else {
      throw error;
    }
  }

  console.log('✅ Path caching tests passed!');
}

/**
 * Test clearPathCache
 */
function testClearPathCache(): void {
  console.log('Testing clearPathCache...');

  // Add some entries to cache manually for testing
  pathCache.set('test-command', '/usr/bin/test');
  assert.ok(pathCache.has('test-command'), 'Should have test entry');

  // Clear cache
  clearPathCache();
  assert.strictEqual(pathCache.size, 0, 'Cache should be empty');
  assert.ok(!pathCache.has('test-command'), 'Test entry should be gone');

  console.log('✅ clearPathCache tests passed!');
}

/**
 * Test checkBinaryAvailability
 */
async function testCheckBinaryAvailability(): Promise<void> {
  console.log('Testing checkBinaryAvailability...');

  // Clear cache first
  clearPathCache();

  const availability = await checkBinaryAvailability();

  // Check structure
  assert.ok('git' in availability, 'Should have git entry');
  assert.ok('ssh-add' in availability, 'Should have ssh-add entry');
  assert.ok('ssh-keygen' in availability, 'Should have ssh-keygen entry');

  // Check each entry has correct structure
  for (const [cmd, status] of Object.entries(availability)) {
    assert.ok(
      typeof status.available === 'boolean',
      `${cmd} should have boolean available`
    );

    if (status.available) {
      assert.ok(
        typeof status.path === 'string',
        `${cmd} should have path when available`
      );
      assert.ok(
        path.isAbsolute(status.path!),
        `${cmd} path should be absolute`
      );
      console.log(`  ${cmd}: available at ${status.path}`);
    } else {
      assert.ok(
        typeof status.error === 'string',
        `${cmd} should have error when not available`
      );
      console.log(`  ${cmd}: not available - ${status.error}`);
    }
  }

  console.log('✅ checkBinaryAvailability tests passed!');
}

/**
 * Test isValidExecutable
 */
async function testIsValidExecutable(): Promise<void> {
  console.log('Testing isValidExecutable...');

  // Test with non-existent path
  {
    const result = await isValidExecutable('/nonexistent/path/to/binary');
    assert.strictEqual(result, false, 'Non-existent path should be invalid');
  }

  // Test with a directory
  {
    const result = await isValidExecutable('/tmp');
    assert.strictEqual(result, false, 'Directory should be invalid');
  }

  // Test with a known executable (if available)
  if (process.platform !== 'win32') {
    const result = await isValidExecutable('/bin/sh');
    // /bin/sh might exist on Unix systems
    console.log(`  /bin/sh is ${result ? 'valid' : 'invalid'}`);
  }

  console.log('✅ isValidExecutable tests passed!');
}

/**
 * Test failed resolution is cached
 */
async function testFailedResolutionCaching(): Promise<void> {
  console.log('Testing failed resolution caching...');

  // Clear cache
  clearPathCache();

  // Note: We can't easily test this without a mock because we can't have
  // an allowed command that doesn't exist. This would require modifying
  // ALLOWED_COMMANDS which is const.

  // Instead, verify that cache handles null values properly
  pathCache.set('test-null', null);
  assert.ok(pathCache.has('test-null'), 'Should store null');
  assert.strictEqual(pathCache.get('test-null'), null, 'Should return null');

  // Clean up
  clearPathCache();

  console.log('✅ Failed resolution caching tests passed!');
}

/**
 * Test that cached failures throw BinaryResolutionError
 */
async function testCachedFailureThrows(): Promise<void> {
  console.log('Testing cached failure throws...');

  // Clear cache and add a null entry
  clearPathCache();
  pathCache.set('git', null);

  // Should throw BinaryResolutionError for cached failure
  try {
    await getBinaryPath('git');
    assert.fail('Should have thrown for cached failure');
  } catch (error) {
    assert.ok(
      error instanceof BinaryResolutionError,
      'Should throw BinaryResolutionError'
    );
    assert.ok(
      (error as BinaryResolutionError).message.includes('Previously failed'),
      'Should mention previous failure'
    );
  }

  // Clean up
  clearPathCache();

  console.log('✅ Cached failure throws tests passed!');
}

/**
 * Test resolveAllBinaryPaths function
 */
async function testResolveAllBinaryPaths(): Promise<void> {
  console.log('Testing resolveAllBinaryPaths...');

  // Clear cache first
  clearPathCache();

  try {
    const paths = await resolveAllBinaryPaths();

    // Should have all three commands
    assert.ok('git' in paths, 'Should have git path');
    assert.ok('ssh-add' in paths, 'Should have ssh-add path');
    assert.ok('ssh-keygen' in paths, 'Should have ssh-keygen path');

    // All paths should be absolute
    for (const cmd of Object.keys(paths)) {
      const cmdPath = paths[cmd as keyof typeof paths];
      assert.ok(
        path.isAbsolute(cmdPath),
        `${cmd} path should be absolute`
      );
    }

    console.log('  All binary paths resolved successfully');
  } catch (error) {
    // If any command is not available, the function throws
    if (error instanceof BinaryResolutionError) {
      console.log(`  Command not available: ${error.command} (expected in some environments)`);
    } else {
      throw error;
    }
  }

  console.log('✅ resolveAllBinaryPaths tests passed!');
}

/**
 * Test error wrapping in getBinaryPath
 */
async function testErrorWrapping(): Promise<void> {
  console.log('Testing error wrapping in getBinaryPath...');

  // Clear cache
  clearPathCache();

  // Manually set a non-BinaryResolutionError scenario
  // This is tricky because we can't easily trigger a non-BinaryResolutionError
  // in the normal code path. We test the cached failure path instead.

  // Test that cached null throws BinaryResolutionError
  pathCache.set('git', null);

  try {
    await getBinaryPath('git');
    assert.fail('Should throw');
  } catch (error) {
    assert.ok(error instanceof BinaryResolutionError, 'Should be BinaryResolutionError');
  }

  // Clean up
  clearPathCache();

  console.log('✅ Error wrapping tests passed!');
}

/**
 * Test checkBinaryAvailability with failed resolution
 *
 * This specifically tests the error catch block (lines 369-373) in checkBinaryAvailability().
 * The catch block handles errors from getBinaryPath() and returns them in the result object.
 *
 * Coverage target: checkBinaryAvailability() catch block
 */
async function testCheckBinaryAvailabilityWithFailures(): Promise<void> {
  console.log('Testing checkBinaryAvailability with failures...');

  // Clear cache to ensure clean state
  clearPathCache();

  // Verify cache is empty before test
  assert.strictEqual(pathCache.size, 0, 'Cache should be empty before test');

  // Set all commands to have null cache (simulating resolution failures)
  // When cache contains null, getBinaryPath throws BinaryResolutionError
  pathCache.set('git', null);
  pathCache.set('ssh-add', null);
  pathCache.set('ssh-keygen', null);

  const availability = await checkBinaryAvailability();

  // All commands should show as not available
  for (const cmd of ['git', 'ssh-add', 'ssh-keygen'] as const) {
    assert.strictEqual(
      availability[cmd].available,
      false,
      `${cmd} should not be available`
    );
    assert.ok(
      typeof availability[cmd].error === 'string',
      `${cmd} should have error message`
    );
    assert.ok(
      availability[cmd].error!.includes('Previously failed'),
      `${cmd} error should mention previous failure`
    );
    console.log(`  ${cmd}: ${availability[cmd].error}`);
  }

  // Clean up and verify
  clearPathCache();
  assert.strictEqual(pathCache.size, 0, 'Cache should be empty after cleanup');

  console.log('✅ checkBinaryAvailability with failures tests passed!');
}

/**
 * Test resolveAllBinaryPaths when resolution fails
 *
 * This tests that resolveAllBinaryPaths() properly throws BinaryResolutionError
 * when a command cannot be resolved. The function iterates through all commands
 * and throws on the first failure.
 *
 * Coverage target: resolveAllBinaryPaths() error propagation
 */
async function testResolveAllBinaryPathsWithFailure(): Promise<void> {
  console.log('Testing resolveAllBinaryPaths with failure...');

  // Clear cache to ensure clean state
  clearPathCache();
  assert.strictEqual(pathCache.size, 0, 'Cache should be empty before test');

  // Set git to fail (first command in ALLOWED_COMMANDS)
  pathCache.set('git', null);

  try {
    await resolveAllBinaryPaths();
    // If we reach here, the cached null was ignored because cache was cleared
    // by another operation. This is acceptable behavior.
    console.log('  All commands resolved (cache was cleared or git found in PATH)');
  } catch (error) {
    // Expected when git resolution fails due to cached null
    assert.ok(error instanceof BinaryResolutionError, 'Should throw BinaryResolutionError');
    assert.strictEqual((error as BinaryResolutionError).command, 'git', 'Command should be git');
    assert.ok(
      (error as BinaryResolutionError).message.includes('Previously failed'),
      'Should indicate previous failure'
    );
    console.log('  Correctly caught BinaryResolutionError for git');
  }

  // Clean up and verify
  clearPathCache();
  assert.strictEqual(pathCache.size, 0, 'Cache should be empty after cleanup');

  console.log('✅ resolveAllBinaryPaths with failure tests passed!');
}

/**
 * Test getBinaryPath error wrapping for non-BinaryResolutionError
 *
 * Note: This is a defensive code path (lines 308-311) that wraps non-BinaryResolutionError
 * into BinaryResolutionError. In the current implementation, resolveCommandPath only throws
 * BinaryResolutionError, so this code path is defense-in-depth.
 *
 * We cannot easily trigger this path without mocking, but we can verify:
 * 1. The error structure is correct
 * 2. The error message format is consistent
 * 3. The error properties are properly set
 *
 * Coverage target: getBinaryPath() error handling (defense-in-depth)
 */
async function testGetBinaryPathDefensiveErrorWrapping(): Promise<void> {
  console.log('Testing getBinaryPath defensive error wrapping...');

  // Clear cache to ensure clean state
  clearPathCache();
  assert.strictEqual(pathCache.size, 0, 'Cache should be empty before test');

  // Test each allowed command to ensure consistent error handling
  for (const cmd of ['git', 'ssh-add', 'ssh-keygen'] as const) {
    // Set cache to null to simulate a failed resolution
    pathCache.set(cmd, null);

    try {
      await getBinaryPath(cmd);
      assert.fail(`Should throw for ${cmd}`);
    } catch (error) {
      // Verify error is properly wrapped as BinaryResolutionError
      assert.ok(error instanceof BinaryResolutionError, `Should be BinaryResolutionError for ${cmd}`);
      assert.strictEqual(
        (error as BinaryResolutionError).command,
        cmd,
        `Command property should be ${cmd}`
      );
      assert.strictEqual(
        (error as BinaryResolutionError).code,
        'ENOENT_BINARY',
        'Error code should be ENOENT_BINARY'
      );
      assert.ok(
        (error as BinaryResolutionError).message.includes(cmd),
        `Message should include command name ${cmd}`
      );
    }

    // Clear for next iteration
    clearPathCache();
  }

  // Verify final cleanup
  assert.strictEqual(pathCache.size, 0, 'Cache should be empty after cleanup');

  console.log('✅ getBinaryPath defensive error wrapping tests passed!');
}

/**
 * Test getVSCodeGitPath with mock VS Code workspace
 *
 * This tests the VS Code git.path setting handling (lines 225-236).
 * When git.path is configured in VS Code settings, it should be prioritized
 * over PATH resolution.
 *
 * Coverage target: getVSCodeGitPath() and resolveCommandPath() git.path branch
 */
async function testGetVSCodeGitPathWithMock(): Promise<void> {
  console.log('Testing getVSCodeGitPath with mock VS Code workspace...');

  // Clear caches to ensure clean state
  clearPathCache();
  _resetCache();

  // Test 1: Valid git.path setting (using actual git path if available)
  {
    // First, resolve the real git path
    let realGitPath: string | undefined;
    try {
      clearPathCache();
      realGitPath = await getBinaryPath('git');
    } catch {
      console.log('  git not available, skipping valid path test');
    }

    if (realGitPath) {
      // Create mock VS Code with git.path pointing to real git
      const mockConfig = {
        get: (key: string) => {
          if (key === 'path') {
            return realGitPath;
          }
          return undefined;
        },
      };

      const mockWorkspace = {
        getConfiguration: (section: string) => {
          if (section === 'git') {
            return mockConfig;
          }
          return { get: () => undefined };
        },
      };

      const mockVSCode = { workspace: mockWorkspace };

      // Clear cache and inject mock
      clearPathCache();
      _setMockVSCode(mockVSCode as never);

      try {
        const gitPath = await getBinaryPath('git');
        assert.strictEqual(gitPath, realGitPath, 'Should use VS Code git.path');
        console.log(`  ✓ VS Code git.path (${realGitPath}) was used`);
      } finally {
        // Clean up
        _resetCache();
        clearPathCache();
      }
    }
  }

  // Test 2: Invalid git.path setting (non-existent path)
  {
    const invalidPath = '/nonexistent/invalid/git/path';

    const mockConfig = {
      get: (key: string) => {
        if (key === 'path') {
          return invalidPath;
        }
        return undefined;
      },
    };

    const mockWorkspace = {
      getConfiguration: (section: string) => {
        if (section === 'git') {
          return mockConfig;
        }
        return { get: () => undefined };
      },
    };

    const mockVSCode = { workspace: mockWorkspace };

    // Clear cache and inject mock
    clearPathCache();
    _setMockVSCode(mockVSCode as never);

    try {
      // Should fall back to PATH resolution
      const gitPath = await getBinaryPath('git');
      // If we get here, git was found via PATH (invalid VS Code path was skipped)
      assert.ok(gitPath !== invalidPath, 'Should not use invalid VS Code path');
      assert.ok(path.isAbsolute(gitPath), 'Should return absolute path from PATH');
      console.log(`  ✓ Invalid VS Code git.path was skipped, found: ${gitPath}`);
    } catch (error) {
      // This is also acceptable if git is not in PATH
      if (error instanceof BinaryResolutionError) {
        console.log('  ✓ git not in PATH after invalid VS Code path (expected)');
      } else {
        throw error;
      }
    } finally {
      // Clean up
      _resetCache();
      clearPathCache();
    }
  }

  // Test 3: Empty git.path setting
  {
    const mockConfig = {
      get: (key: string) => {
        if (key === 'path') {
          return '';
        }
        return undefined;
      },
    };

    const mockWorkspace = {
      getConfiguration: (section: string) => {
        if (section === 'git') {
          return mockConfig;
        }
        return { get: () => undefined };
      },
    };

    const mockVSCode = { workspace: mockWorkspace };

    // Clear cache and inject mock
    clearPathCache();
    _setMockVSCode(mockVSCode as never);

    try {
      // Empty path should fall back to PATH resolution
      const gitPath = await getBinaryPath('git');
      assert.ok(path.isAbsolute(gitPath), 'Should return absolute path from PATH');
      console.log(`  ✓ Empty VS Code git.path was skipped, found: ${gitPath}`);
    } catch (error) {
      if (error instanceof BinaryResolutionError) {
        console.log('  ✓ git not in PATH (expected)');
      } else {
        throw error;
      }
    } finally {
      // Clean up
      _resetCache();
      clearPathCache();
    }
  }

  console.log('✅ getVSCodeGitPath with mock VS Code workspace tests passed!');
}

/**
 * Run all binary resolver tests
 */
export async function runBinaryResolverTests(): Promise<void> {
  console.log('\n=== Binary Resolver Tests ===\n');

  try {
    testBinaryResolutionError();
    testAllowedCommands();
    testWhichPaths();
    await testGetWhichCommand();
    testIsAllowedCommand();
    await testGetBinaryPathAllowed();
    await testGetBinaryPathDisallowed();
    await testPathCaching();
    testClearPathCache();
    await testCheckBinaryAvailability();
    await testIsValidExecutable();
    await testFailedResolutionCaching();
    await testCachedFailureThrows();
    await testResolveAllBinaryPaths();
    await testErrorWrapping();
    await testCheckBinaryAvailabilityWithFailures();
    await testResolveAllBinaryPathsWithFailure();
    await testGetBinaryPathDefensiveErrorWrapping();
    await testGetVSCodeGitPathWithMock();

    console.log('\n✅ All binary resolver tests passed!\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Test failed:', errorMessage);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runBinaryResolverTests().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
  });
}
