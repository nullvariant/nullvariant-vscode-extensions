/**
 * Command Handlers
 *
 * VS Code command implementations for:
 * - Selecting identity
 * - Showing current identity
 * - Welcome notification
 *
 * @module commands/handlers
 */

import * as vscode from 'vscode';
import { Identity, getIdentityLabel } from '../identity/identity';
import { showIdentityQuickPick, showErrorNotification } from '../ui/identityPicker';
import { requireWorkspaceTrust } from '../core/workspaceTrust';
import { getUserSafeMessage, isFatalError } from '../core/errors';
import { IdentityStatusBar } from '../ui/identityStatusBar';
import { switchToIdentity } from '../services/switcher';

/**
 * Command: Select identity
 */
export async function selectIdentityCommand(
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar,
  getCurrentIdentity: () => Identity | undefined,
  setCurrentIdentity: (identity: Identity) => void
): Promise<void> {
  // SECURITY: Block command execution in untrusted workspaces
  if (!requireWorkspaceTrust()) {
    return;
  }

  const currentIdentity = getCurrentIdentity();

  try {
    // Show quick pick
    const selectedIdentity = await showIdentityQuickPick(currentIdentity);

    if (!selectedIdentity) {
      // User cancelled
      return;
    }

    if (selectedIdentity.id === currentIdentity?.id) {
      // Same identity selected, no change needed
      vscode.window.showInformationMessage(
        vscode.l10n.t('Already using {0}', getIdentityLabel(selectedIdentity))
      );
      return;
    }

    // Switch to selected identity
    await switchToIdentity(
      selectedIdentity,
      context,
      statusBar,
      getCurrentIdentity,
      setCurrentIdentity
    );
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    showErrorNotification(vscode.l10n.t('Failed to select identity: {0}', safeMessage));
    statusBar.setError(safeMessage);

    // Propagate fatal errors (security violations)
    if (isFatalError(error)) {
      throw error;
    }
  }
}

/**
 * Command: Show current identity info
 */
export function showCurrentIdentityCommand(
  getCurrentIdentity: () => Identity | undefined
): void {
  const currentIdentity = getCurrentIdentity();
  if (currentIdentity) {
    vscode.window.showInformationMessage(
      vscode.l10n.t('Current identity: {0} ({1})', getIdentityLabel(currentIdentity), currentIdentity.email)
    );
  } else {
    vscode.window.showInformationMessage(
      vscode.l10n.t('No identity selected. Click the status bar to select one.')
    );
  }
}

/**
 * Show welcome notification for first-time users
 */
export async function showWelcomeNotification(): Promise<void> {
  const action = await vscode.window.showInformationMessage(
    vscode.l10n.t('Welcome to Git ID Switcher! Configure your identities to get started.'),
    vscode.l10n.t('Open Settings')
  );

  if (action) {
    vscode.commands.executeCommand(
      'workbench.action.openSettings',
      'gitIdSwitcher.identities'
    );
  }
}
