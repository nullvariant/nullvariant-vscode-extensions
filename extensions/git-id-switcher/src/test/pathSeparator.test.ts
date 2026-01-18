/**
 * Cross-Platform Path Separator Tests
 *
 * Tests path handling across different platforms (Windows, macOS, Linux).
 * Verifies that path operations work correctly regardless of the native separator.
 *
 * Coverage includes:
 * - path.join cross-platform behavior
 * - path.normalize with mixed separators
 * - path.sep platform detection
 */

import * as assert from 'node:assert';
import * as path from 'node:path';

/**
 * Test path.join handles cross-platform paths correctly
 */
function testPathJoinCrossPlatform(): void {
  console.log('Testing path.join cross-platform behavior...');

  // Basic path joining
  {
    const result = path.join('foo', 'bar', 'baz');
    assert.ok(result.includes('foo'), 'Result should contain foo');
    assert.ok(result.includes('bar'), 'Result should contain bar');
    assert.ok(result.includes('baz'), 'Result should contain baz');
    // Verify segments are properly separated
    assert.strictEqual(
      result.split(path.sep).filter(s => s).length,
      3,
      'Should have 3 path segments'
    );
  }

  // Deeply nested path
  {
    const result = path.join('a', 'b', 'c', 'd', 'e');
    assert.strictEqual(
      result.split(path.sep).filter(s => s).length,
      5,
      'Should have 5 path segments'
    );
  }

  // Path with file extension
  {
    const result = path.join('folder', 'subfolder', 'file.txt');
    assert.ok(result.endsWith('file.txt'), 'Should preserve filename');
    assert.strictEqual(
      result.split(path.sep).filter(s => s).length,
      3,
      'Should have 3 path segments'
    );
  }

  console.log('  path.join cross-platform tests passed!');
}

/**
 * Test path.normalize handles mixed separators correctly
 */
function testPathNormalizeMixedSeparators(): void {
  console.log('Testing path.normalize with mixed separators...');

  // Forward slashes (Unix-style)
  {
    const normalized = path.normalize('foo/bar/baz');
    const segments = normalized.split(path.sep).filter(s => s);
    assert.strictEqual(segments.length, 3, 'Forward slashes: should have 3 segments');
    assert.strictEqual(segments[0], 'foo', 'First segment should be foo');
    assert.strictEqual(segments[1], 'bar', 'Second segment should be bar');
    assert.strictEqual(segments[2], 'baz', 'Third segment should be baz');
  }

  // Double forward slashes
  {
    const normalized = path.normalize('foo//bar//baz');
    const segments = normalized.split(path.sep).filter(s => s);
    assert.strictEqual(segments.length, 3, 'Double slashes: should normalize to 3 segments');
  }

  // Mixed forward and backslashes (platform-dependent behavior)
  // On Windows: backslash is a separator, so 'foo/bar\\baz' -> 3 segments
  // On Unix: backslash is a valid filename character, so 'foo/bar\\baz' -> 2 segments
  {
    const normalized = path.normalize('foo/bar\\baz');
    const segments = normalized.split(path.sep).filter(s => s);
    if (process.platform === 'win32') {
      assert.strictEqual(segments.length, 3, 'Windows: Mixed separators should have 3 segments');
    } else {
      // On Unix, backslash is part of the filename
      assert.strictEqual(segments.length, 2, 'Unix: Backslash is filename char, should have 2 segments');
      assert.ok(segments[1].includes('\\'), 'Unix: Second segment should contain backslash');
    }
  }

  // Backslashes only (platform-dependent)
  {
    const normalized = path.normalize('foo\\bar\\baz');
    const segments = normalized.split(path.sep).filter(s => s);
    if (process.platform === 'win32') {
      assert.strictEqual(segments.length, 3, 'Windows: Backslashes should have 3 segments');
    } else {
      // On Unix, the entire string is one segment (backslash is filename char)
      assert.strictEqual(segments.length, 1, 'Unix: Backslash is filename char, should have 1 segment');
    }
  }

  console.log('  path.normalize mixed separators tests passed!');
}

/**
 * Test path.sep is correctly detected per platform
 */
function testPathSepPlatformDetection(): void {
  console.log('Testing path.sep platform detection...');

  // path.sep should be a single character
  assert.strictEqual(path.sep.length, 1, 'path.sep should be single character');

  // path.sep should be either / or \
  assert.ok(
    path.sep === '/' || path.sep === '\\',
    `path.sep should be / or \\, got: ${path.sep}`
  );

  // Verify platform consistency
  if (process.platform === 'win32') {
    assert.strictEqual(path.sep, '\\', 'Windows should use backslash');
  } else {
    assert.strictEqual(path.sep, '/', 'Unix-like should use forward slash');
  }

  console.log('  path.sep platform detection tests passed!');
}

/**
 * Test relative path resolution
 */
function testRelativePathResolution(): void {
  console.log('Testing relative path resolution...');

  // Current directory reference
  {
    const normalized = path.normalize('./foo/bar');
    assert.ok(normalized.includes('foo'), 'Should contain foo');
    assert.ok(normalized.includes('bar'), 'Should contain bar');
  }

  // Parent directory reference
  {
    const normalized = path.normalize('foo/../bar');
    const segments = normalized.split(path.sep).filter(s => s);
    assert.strictEqual(segments.length, 1, 'Should resolve to single segment');
    assert.strictEqual(segments[0], 'bar', 'Should resolve to bar');
  }

  // Complex relative path
  {
    const normalized = path.normalize('a/b/../c/./d');
    const segments = normalized.split(path.sep).filter(s => s);
    assert.strictEqual(segments.length, 3, 'Should resolve to a/c/d');
    assert.deepStrictEqual(segments, ['a', 'c', 'd'], 'Should be [a, c, d]');
  }

  console.log('  Relative path resolution tests passed!');
}

/**
 * Test path.basename and path.dirname cross-platform
 */
function testPathBasenameDirname(): void {
  console.log('Testing path.basename and path.dirname...');

  // Unix-style path
  {
    const filePath = path.join('folder', 'subfolder', 'file.txt');
    const basename = path.basename(filePath);
    const dirname = path.dirname(filePath);

    assert.strictEqual(basename, 'file.txt', 'basename should be file.txt');
    assert.ok(dirname.includes('subfolder'), 'dirname should contain subfolder');
  }

  // Path with extension extraction
  {
    const filePath = path.join('dir', 'file.tar.gz');
    assert.strictEqual(path.basename(filePath), 'file.tar.gz', 'Should get full filename');
    assert.strictEqual(path.extname(filePath), '.gz', 'Should get last extension');
    assert.strictEqual(
      path.basename(filePath, '.gz'),
      'file.tar',
      'Should strip specified extension'
    );
  }

  console.log('  path.basename and path.dirname tests passed!');
}

/**
 * Test absolute path detection
 */
function testAbsolutePathDetection(): void {
  console.log('Testing absolute path detection...');

  // Platform-specific absolute paths
  if (process.platform === 'win32') {
    assert.strictEqual(path.isAbsolute('C:\\Users\\test'), true, 'Windows drive path is absolute');
    assert.strictEqual(path.isAbsolute('\\\\server\\share'), true, 'UNC path is absolute');
    assert.strictEqual(path.isAbsolute('relative\\path'), false, 'Relative path is not absolute');
  } else {
    assert.strictEqual(path.isAbsolute('/home/user'), true, 'Unix root path is absolute');
    assert.strictEqual(path.isAbsolute('relative/path'), false, 'Relative path is not absolute');
  }

  // Cross-platform: relative paths should never be absolute
  assert.strictEqual(path.isAbsolute('foo/bar'), false, 'foo/bar is not absolute');
  assert.strictEqual(path.isAbsolute('./foo'), false, './foo is not absolute');
  assert.strictEqual(path.isAbsolute('../foo'), false, '../foo is not absolute');

  console.log('  Absolute path detection tests passed!');
}

/**
 * Run all path separator tests
 */
export async function runPathSeparatorTests(): Promise<void> {
  console.log('\n=== Cross-Platform Path Separator Tests ===\n');

  try {
    testPathJoinCrossPlatform();
    testPathNormalizeMixedSeparators();
    testPathSepPlatformDetection();
    testRelativePathResolution();
    testPathBasenameDirname();
    testAbsolutePathDetection();

    console.log('\n  All path separator tests passed!\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n  Test failed:', errorMessage);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runPathSeparatorTests().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
  });
}
