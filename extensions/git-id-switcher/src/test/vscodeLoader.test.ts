/**
 * Tests for VS Code API Lazy Loader
 *
 * Tests the lazy loading mechanism for VS Code APIs
 */

import * as assert from 'node:assert';
import {
  getVSCode,
  getWorkspace,
  getWindow,
  getExtensions,
  _resetCache,
  _setMockVSCode,
} from '../vscodeLoader';

/**
 * Test suite for getVSCode
 */
function testGetVSCode(): void {
  console.log('Testing getVSCode...');

  // Reset cache before testing
  _resetCache();

  // In test environment, VS Code API may not be available
  const vscode = getVSCode();
  // Should return undefined or valid vscode module
  assert.ok(vscode === undefined || typeof vscode === 'object', 'getVSCode should return undefined or object');

  // Second call should return cached value
  const vscode2 = getVSCode();
  assert.strictEqual(vscode, vscode2, 'Second call should return cached value');

  console.log('✅ getVSCode tests passed!');
}

/**
 * Test suite for getWorkspace
 */
function testGetWorkspace(): void {
  console.log('Testing getWorkspace...');

  // Reset cache before testing
  _resetCache();

  const workspace = getWorkspace();
  // Should return undefined or valid workspace API
  assert.ok(
    workspace === undefined || typeof workspace === 'object',
    'getWorkspace should return undefined or object'
  );

  console.log('✅ getWorkspace tests passed!');
}

/**
 * Test suite for getWindow
 */
function testGetWindow(): void {
  console.log('Testing getWindow...');

  // Reset cache before testing
  _resetCache();

  const window = getWindow();
  // Should return undefined or valid window API
  assert.ok(window === undefined || typeof window === 'object', 'getWindow should return undefined or object');

  console.log('✅ getWindow tests passed!');
}

/**
 * Test suite for getExtensions
 */
function testGetExtensions(): void {
  console.log('Testing getExtensions...');

  // Reset cache before testing
  _resetCache();

  const extensions = getExtensions();
  // Should return undefined or valid extensions API
  assert.ok(
    extensions === undefined || typeof extensions === 'object',
    'getExtensions should return undefined or object'
  );

  console.log('✅ getExtensions tests passed!');
}

/**
 * Test suite for cache reset
 */
function testCacheReset(): void {
  console.log('Testing cache reset...');

  // Get VS Code (may cache it)
  const vscode1 = getVSCode();

  // Reset cache
  _resetCache();

  // Get again (should attempt to reload)
  const vscode2 = getVSCode();

  // Both should be the same (either both undefined or both same object)
  // The important thing is that _resetCache doesn't throw
  assert.ok(
    vscode1 === vscode2 || (vscode1 === undefined && vscode2 === undefined),
    'Cache reset should work without errors'
  );

  console.log('✅ Cache reset tests passed!');
}

/**
 * Test suite for lazy loading behavior
 */
function testLazyLoading(): void {
  console.log('Testing lazy loading behavior...');

  // Reset cache
  _resetCache();

  // First call should attempt to load
  const vscode1 = getVSCode();

  // Multiple calls should return same cached value
  const vscode2 = getVSCode();
  const vscode3 = getVSCode();

  assert.strictEqual(vscode1, vscode2, 'Multiple calls should return same value');
  assert.strictEqual(vscode2, vscode3, 'Multiple calls should return same value');

  console.log('✅ Lazy loading tests passed!');
}

/**
 * Test suite for mock VS Code injection
 * Tests the truthy branch of optional chaining operators (vscode?.workspace, etc.)
 */
function testMockVSCodeInjection(): void {
  console.log('Testing mock VS Code injection...');

  // Create mock VS Code API with workspace, window, and extensions
  const mockWorkspace = { name: 'test-workspace' };
  const mockWindow = { activeTextEditor: null };
  const mockExtensions = { all: [] };

  const mockVSCode = {
    workspace: mockWorkspace,
    window: mockWindow,
    extensions: mockExtensions,
  };

  try {
    // Inject mock - this tests the truthy branch of optional chaining
    _setMockVSCode(mockVSCode as never);

    // Test getVSCode returns mock
    const vscode = getVSCode();
    assert.strictEqual(vscode, mockVSCode, 'getVSCode should return injected mock');

    // Test getWorkspace returns mock workspace (covers vscode?.workspace truthy branch)
    const workspace = getWorkspace();
    assert.strictEqual(workspace, mockWorkspace, 'getWorkspace should return mock workspace');

    // Test getWindow returns mock window (covers vscode?.window truthy branch)
    const window = getWindow();
    assert.strictEqual(window, mockWindow, 'getWindow should return mock window');

    // Test getExtensions returns mock extensions (covers vscode?.extensions truthy branch)
    const extensions = getExtensions();
    assert.strictEqual(extensions, mockExtensions, 'getExtensions should return mock extensions');

    console.log('✅ Mock VS Code injection tests passed!');
  } finally {
    // Cleanup - always reset to prevent affecting other tests
    _resetCache();
  }
}

/**
 * Run all tests
 */
export function runVSCodeLoaderTests(): void {
  console.log('\n=== VS Code Loader Tests ===\n');

  try {
    testGetVSCode();
    testGetWorkspace();
    testGetWindow();
    testGetExtensions();
    testCacheReset();
    testLazyLoading();
    testMockVSCodeInjection();

    console.log('\n✅ All VS Code loader tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runVSCodeLoaderTests();
}
