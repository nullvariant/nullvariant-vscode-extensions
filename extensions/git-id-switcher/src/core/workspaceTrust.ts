/**
 * Workspace Trust Management
 *
 * Provides workspace trust checking functionality to ensure the extension
 * only executes sensitive operations in trusted workspaces.
 *
 * SECURITY: This module prevents the extension from running Git/SSH commands
 * in untrusted workspaces, which could execute malicious code from
 * workspace settings or .vscode configurations.
 *
 * @see https://code.visualstudio.com/docs/editor/workspace-trust
 */

// Type-only import (stripped at compile time, no runtime dependency)
import type * as vscodeTypes from 'vscode';
import { getVSCode, getWorkspace, getWindow } from './vscodeLoader';

/**
 * State tracking for workspace trust initialization
 */
let trustGrantedHandler: vscodeTypes.Disposable | undefined;
let hasInitialized = false;

/**
 * Check if the current workspace is trusted
 *
 * SECURITY: Always check trust before executing any Git/SSH commands
 * or reading workspace-specific configuration.
 *
 * @returns true if workspace is trusted, false otherwise (including when VS Code API is unavailable)
 */
export function isWorkspaceTrusted(): boolean {
  const workspace = getWorkspace();
  if (!workspace) {
    // In test environment without VS Code, default to untrusted for safety
    return false;
  }
  return workspace.isTrusted;
}

/**
 * Show a warning message when workspace is not trusted
 *
 * Informs the user that the extension features are disabled
 * until they trust the workspace.
 */
export function showUntrustedWorkspaceWarning(): void {
  const vscode = getVSCode();
  const window = getWindow();
  if (!window) {
    console.log('[Git ID Switcher] Workspace is not trusted. VS Code window API unavailable.');
    return;
  }

  const message = vscode?.l10n?.t
    ? vscode.l10n.t(
        'Git ID Switcher is disabled in untrusted workspaces. Trust this workspace to enable identity switching.'
      )
    : 'Git ID Switcher is disabled in untrusted workspaces. Trust this workspace to enable identity switching.';

  window.showWarningMessage(message);
}

/**
 * Initialize workspace trust handling
 *
 * Sets up event listener to initialize the extension when workspace trust
 * is granted. This ensures the extension activates properly even if the
 * workspace starts as untrusted.
 *
 * SECURITY: The initialization callback is only called once when trust
 * is first granted, preventing repeated initialization.
 *
 * @param context - Extension context for managing disposables
 * @param onTrustGranted - Callback to run when workspace becomes trusted
 * @returns true if workspace is already trusted and initialization can proceed,
 *          false if workspace is untrusted and initialization should be deferred
 */
export function initializeWorkspaceTrust(
  context: vscodeTypes.ExtensionContext,
  onTrustGranted: () => Promise<void>
): boolean {
  // If already initialized, don't set up handlers again
  if (hasInitialized) {
    return isWorkspaceTrusted();
  }

  hasInitialized = true;

  // If workspace is already trusted, proceed with initialization
  if (isWorkspaceTrusted()) {
    return true;
  }

  // Workspace is not trusted - show warning and set up trust handler
  showUntrustedWorkspaceWarning();
  console.log('[Git ID Switcher] Workspace is not trusted. Waiting for trust to be granted...');

  const workspace = getWorkspace();
  if (!workspace) {
    // VS Code API not available (test environment)
    return false;
  }

  // Register handler for when trust is granted
  trustGrantedHandler = workspace.onDidGrantWorkspaceTrust(async () => {
    console.log('[Git ID Switcher] Workspace trust granted. Initializing...');

    // Clean up the handler since trust can only be granted once per session
    if (trustGrantedHandler) {
      trustGrantedHandler.dispose();
      trustGrantedHandler = undefined;
    }

    // Run the initialization callback
    try {
      await onTrustGranted();
    } catch (error) {
      console.error('[Git ID Switcher] Failed to initialize after trust granted:', error);
    }
  });

  // Add to subscriptions for cleanup on deactivation
  context.subscriptions.push(trustGrantedHandler);

  return false;
}

/**
 * Guard function to check trust before executing a command
 *
 * SECURITY: Use this guard at the start of any command handler
 * that performs sensitive operations (Git commands, SSH operations, etc.)
 *
 * @returns true if the operation can proceed (workspace is trusted),
 *          false if the operation should be blocked (workspace is untrusted)
 */
export function requireWorkspaceTrust(): boolean {
  if (!isWorkspaceTrusted()) {
    const vscode = getVSCode();
    const window = getWindow();
    if (window) {
      const message = vscode?.l10n?.t
        ? vscode.l10n.t(
            'This operation requires a trusted workspace. Please trust this workspace first.'
          )
        : 'This operation requires a trusted workspace. Please trust this workspace first.';
      window.showWarningMessage(message);
    }
    return false;
  }
  return true;
}

/**
 * Reset internal state for testing purposes
 *
 * @internal
 */
export function _resetForTesting(): void {
  if (trustGrantedHandler) {
    trustGrantedHandler.dispose();
    trustGrantedHandler = undefined;
  }
  hasInitialized = false;
}
