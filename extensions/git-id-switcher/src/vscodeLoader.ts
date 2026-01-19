/**
 * VS Code API Lazy Loader
 *
 * Provides lazy-loaded access to VS Code APIs for testing compatibility.
 * In test environments (outside VS Code extension host), the vscode
 * module is not available. By using lazy loading, we can run tests
 * without the vscode dependency.
 *
 * This module centralizes VS Code API loading to eliminate duplication
 * across gitConfig.ts, submodule.ts, secureExec.ts, securityLogger.ts,
 * configChangeDetector.ts, and workspaceTrust.ts.
 */

// Type-only import (stripped at compile time, no runtime dependency)
import type * as vscodeTypes from 'vscode';

/**
 * Cached VS Code module reference
 */
let cachedVSCode: typeof vscodeTypes | undefined;

/**
 * Flag to track if VS Code loading has been attempted
 */
let loadAttempted = false;

/**
 * Get the VS Code API module
 *
 * Lazily loads the vscode module on first call and caches it.
 * Returns undefined if VS Code API is not available (e.g., in tests).
 *
 * @returns VS Code API or undefined if not available
 *
 * @example
 * const vscode = getVSCode();
 * if (vscode) {
 *   vscode.window.showInformationMessage('Hello');
 * }
 */
export function getVSCode(): typeof vscodeTypes | undefined {
  if (loadAttempted) {
    return cachedVSCode;
  }

  loadAttempted = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedVSCode = require('vscode') as typeof vscodeTypes;
    return cachedVSCode;
  } catch {
    // VS Code API not available (e.g., in tests)
    cachedVSCode = undefined;
    return undefined;
  }
}

/**
 * Get the VS Code workspace API
 *
 * Convenience function for accessing workspace API directly.
 *
 * @returns VS Code workspace API or undefined if not available
 *
 * @example
 * const workspace = getWorkspace();
 * if (workspace) {
 *   const config = workspace.getConfiguration('myExtension');
 * }
 */
export function getWorkspace(): typeof vscodeTypes.workspace | undefined {
  const vscode = getVSCode();
  return vscode?.workspace;
}

/**
 * Get the VS Code window API
 *
 * Convenience function for accessing window API directly.
 *
 * @returns VS Code window API or undefined if not available
 *
 * @example
 * const window = getWindow();
 * if (window) {
 *   window.showInformationMessage('Hello');
 * }
 */
export function getWindow(): typeof vscodeTypes.window | undefined {
  const vscode = getVSCode();
  return vscode?.window;
}

/**
 * Get the VS Code extensions API
 *
 * Convenience function for accessing extensions API directly.
 *
 * @returns VS Code extensions API or undefined if not available
 */
export function getExtensions(): typeof vscodeTypes.extensions | undefined {
  const vscode = getVSCode();
  return vscode?.extensions;
}

/**
 * Reset the cached VS Code module
 *
 * Used for testing purposes to clear the cache between tests.
 * Not intended for production use.
 */
export function _resetCache(): void {
  cachedVSCode = undefined;
  loadAttempted = false;
}

/**
 * Set a mock VS Code module for testing
 *
 * Used for testing purposes to inject mock objects.
 * Not intended for production use.
 *
 * @param mockVSCode - Mock VS Code module or undefined to clear
 */
export function _setMockVSCode(mockVSCode: typeof vscodeTypes | undefined): void {
  cachedVSCode = mockVSCode;
  loadAttempted = true;
}
