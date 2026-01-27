/**
 * Command Handlers
 *
 * VS Code command implementations for:
 * - Selecting identity
 * - Showing current identity
 * - Welcome notification
 * - Managing identities (Add/Edit/Delete)
 *
 * @module commands/handlers
 */

import * as vscode from 'vscode';
import { getVSCode } from '../core/vscodeLoader';
import {
  Identity,
  getIdentityLabel,
  getIdentitiesWithValidation,
  deleteIdentityFromConfig,
} from '../identity/identity';
import {
  showIdentityQuickPick,
  showErrorNotification,
  showManageIdentitiesQuickPick,
  showDeleteIdentityQuickPick,
} from '../ui/identityPicker';
import {
  showAddIdentityWizard,
  showEditIdentityWizard,
} from '../ui/identityManager';
import { securityLogger } from '../security/securityLogger';
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

    // Handle manage option
    if (selectedIdentity === 'manage') {
      await handleManageIdentities(context, statusBar, getCurrentIdentity, setCurrentIdentity);
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
 * Handle add action in manage identities loop.
 * @returns New lastIndex after add operation
 */
async function handleManageAdd(lastIndex: number): Promise<number> {
  const success = await handleAddIdentity();
  if (success) {
    const newIdentities = getIdentitiesWithValidation();
    return newIdentities.length - 1;
  }
  return lastIndex;
}

/**
 * Handle edit action in manage identities loop.
 */
async function handleManageEdit(
  identity: Identity,
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar
): Promise<void> {
  await showEditIdentityWizard(identity);
  // Refresh status bar if current identity was edited
  const currentIdentityId = context.workspaceState.get<string>('currentIdentityId');
  if (currentIdentityId === identity.id) {
    const updatedIdentity = getIdentitiesWithValidation().find(
      i => i.id === currentIdentityId
    );
    if (updatedIdentity) {
      statusBar.setIdentity(updatedIdentity);
    }
  }
}

/**
 * Handle delete action in manage identities loop.
 * @returns New lastIndex after delete operation
 */
async function handleManageDelete(
  identity: Identity,
  index: number,
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar
): Promise<number> {
  const success = await handleDeleteIdentity(context, statusBar, identity);
  if (success) {
    const newIdentities = getIdentitiesWithValidation();
    return Math.min(index, Math.max(0, newIdentities.length - 1));
  }
  return index;
}

/**
 * Handle the manage identities submenu with loop structure.
 *
 * Displays the manage identities UI in a loop, allowing multiple operations
 * without returning to the main picker. The loop exits when user presses
 * back button or Esc.
 *
 * Note: After exiting, selectIdentityCommand is called which may result in
 * re-entering this function. This recursion is bounded by user interaction
 * (requires explicit selection of "Manage identities..." option).
 *
 * @param context - VS Code extension context
 * @param statusBar - Identity status bar instance
 * @param getCurrentIdentity - Function to get the current identity
 * @param setCurrentIdentity - Function to set the current identity
 */
async function handleManageIdentities(
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar,
  getCurrentIdentity: () => Identity | undefined,
  setCurrentIdentity: (identity: Identity) => void
): Promise<void> {
  let lastIndex = 0;

  while (true) {
    const identities = getIdentitiesWithValidation();
    const result = await showManageIdentitiesQuickPick(identities, lastIndex);

    if (!result || result.action === 'back') {
      break; // Exit loop → return to main picker
    }

    switch (result.action) {
      case 'add':
        lastIndex = await handleManageAdd(lastIndex);
        break;
      case 'edit':
        await handleManageEdit(result.identity, context, statusBar);
        lastIndex = result.index;
        break;
      case 'delete':
        lastIndex = await handleManageDelete(result.identity, result.index, context, statusBar);
        break;
    }
  }

  // After loop exits, return to main picker
  await selectIdentityCommand(context, statusBar, getCurrentIdentity, setCurrentIdentity);
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

/**
 * Handle the add identity command.
 *
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 * The wizard handles validation, saving, and showing notifications.
 *
 * @returns true if identity was created, false if cancelled or failed
 */
export async function handleAddIdentity(): Promise<boolean> {
  // SECURITY: Block command execution in untrusted workspaces
  if (!requireWorkspaceTrust()) {
    return false;
  }

  // The wizard handles all steps including validation, saving, and notifications
  return showAddIdentityWizard();
}

/**
 * Handle the edit identity command.
 *
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 *
 * Flow:
 * 1. Show edit identity wizard (handles all steps internally)
 * 2. Update status bar if current identity was edited
 *
 * @param statusBar - Identity status bar instance for UI update
 * @param context - VS Code extension context
 */
export async function handleEditIdentity(
  statusBar: IdentityStatusBar,
  context: vscode.ExtensionContext
): Promise<void> {
  const vs = getVSCode();
  if (!vs) {
    return;
  }

  // SECURITY: Block command execution in untrusted workspaces
  if (!requireWorkspaceTrust()) {
    return;
  }

  try {
    // The wizard handles all steps and updates internally
    await showEditIdentityWizard();

    // Refresh status bar to reflect any changes to current identity
    const currentIdentityId = context.workspaceState.get<string>('currentIdentityId');
    if (currentIdentityId) {
      const updatedIdentity = getIdentitiesWithValidation().find(
        i => i.id === currentIdentityId
      );
      if (updatedIdentity) {
        statusBar.setIdentity(updatedIdentity);
      }
    }
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    showErrorNotification(vs.l10n.t('Failed to edit identity: {0}', safeMessage));

    // Propagate fatal errors (security violations)
    if (isFatalError(error)) {
      throw error;
    }
  }
}

/**
 * Handle the delete identity command.
 *
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 *
 * Flow:
 * 1. Show quick pick for selection (skipped if targetIdentity provided)
 * 2. Check if selected identity is current
 * 3. Show confirmation dialog (different message for current identity)
 * 4. Delete identity from config
 * 5. Clear workspace state if current identity was deleted
 * 6. Update status bar
 * 7. Show success notification
 *
 * @param context - VS Code extension context
 * @param statusBar - Identity status bar instance for UI update
 * @param targetIdentity - Optional identity to delete (skips selection UI)
 * @returns true if identity was deleted, false if cancelled or failed
 */
export async function handleDeleteIdentity(
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar,
  targetIdentity?: Identity
): Promise<boolean> {
  const vs = getVSCode();
  if (!vs) {
    return false;
  }

  // SECURITY: Block command execution in untrusted workspaces
  if (!requireWorkspaceTrust()) {
    return false;
  }

  // Get current identity ID from workspace state
  const currentIdentityId = context.workspaceState.get<string>('currentIdentityId');

  try {
    // Use target identity or show selection UI
    const selectedIdentity = targetIdentity ?? await showDeleteIdentityQuickPick(currentIdentityId);

    if (!selectedIdentity) {
      // User cancelled
      return false;
    }

    const isCurrentIdentity = selectedIdentity.id === currentIdentityId;
    const identityLabel = getIdentityLabel(selectedIdentity);

    // Show confirmation dialog (different message for current identity)
    const confirmMessage = isCurrentIdentity
      ? vs.l10n.t("'{0}' is your current identity. Delete anyway?", identityLabel)
      : vs.l10n.t("Are you sure you want to delete '{0}'?", identityLabel);

    const deleteButton = vs.l10n.t('Delete');
    const confirmation = await vs.window.showWarningMessage(
      confirmMessage,
      { modal: true },
      deleteButton
    );

    if (confirmation !== deleteButton) {
      // User cancelled confirmation
      return false;
    }

    // Delete identity from config
    await deleteIdentityFromConfig(selectedIdentity.id);

    // SECURITY: Log identity deletion as config change
    securityLogger.logConfigChange('identities');

    // Clear workspace state and update status bar if current identity was deleted
    if (isCurrentIdentity) {
      await context.workspaceState.update('currentIdentityId', undefined);
      statusBar.setNoIdentity();
    }

    // Show success notification
    vs.window.showInformationMessage(
      vs.l10n.t("Identity '{0}' has been deleted.", identityLabel)
    );

    return true;
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    showErrorNotification(vs.l10n.t('Failed to delete identity: {0}', safeMessage));

    // Propagate fatal errors (security violations)
    if (isFatalError(error)) {
      throw error;
    }

    return false;
  }
}
