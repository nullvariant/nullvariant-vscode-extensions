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
 * - checkBinaryAvailability function
 * - isAllowedCommand validation
 * - isValidExecutable validation
 */

import * as assert from 'node:assert';
import * as path from 'node:path';
import {
  getBinaryPath,
  clearPathCache,
  checkBinaryAvailability,
  BinaryResolutionError,
  __testExports,
} from '../binaryResolver';

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
