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
  addIdentityToConfig,
} from '../identity/identity';
import {
  showIdentityQuickPick,
  showDeleteIdentityQuickPick,
  showErrorNotification,
} from '../ui/identityPicker';
import {
  showManageMenu,
  showAddIdentityWizard,
  showEditIdentityWizard,
} from '../ui/identityManager';
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
      await handleManageIdentities(context, statusBar);
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
 * Handle the manage identities submenu.
 *
 * @param context - VS Code extension context
 * @param statusBar - Identity status bar instance
 */
async function handleManageIdentities(
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar
): Promise<void> {
  const identities = getIdentitiesWithValidation();
  const hasIdentities = identities.length > 0;

  const action = await showManageMenu(hasIdentities);

  if (!action) {
    return;
  }

  switch (action) {
    case 'add':
      await handleAddIdentity();
      break;
    case 'edit':
      await handleEditIdentity(statusBar, context);
      break;
    case 'delete':
      await handleDeleteIdentity(context, statusBar);
      break;
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

/**
 * Handle the add identity command.
 *
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 *
 * Flow:
 * 1. Show add identity wizard
 * 2. Add identity to config
 * 3. Show success notification
 */
export async function handleAddIdentity(): Promise<void> {
  const vs = getVSCode();
  if (!vs) {
    return;
  }

  // SECURITY: Block command execution in untrusted workspaces
  if (!requireWorkspaceTrust()) {
    return;
  }

  try {
    const newIdentity = await showAddIdentityWizard();

    if (!newIdentity) {
      // User cancelled
      return;
    }

    await addIdentityToConfig(newIdentity);

    vs.window.showInformationMessage(
      vs.l10n.t("Identity '{0}' has been created.", newIdentity.id)
    );
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    showErrorNotification(vs.l10n.t('Failed to add identity: {0}', safeMessage));

    // Propagate fatal errors (security violations)
    if (isFatalError(error)) {
      throw error;
    }
  }
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
 * 1. Show quick pick for selection (empty check handled by picker)
 * 2. Check if selected identity is current
 * 3. Show confirmation dialog (different message for current identity)
 * 4. Delete identity from config
 * 5. Clear workspace state if current identity was deleted
 * 6. Update status bar
 * 7. Show success notification
 *
 * @param context - VS Code extension context
 * @param statusBar - Identity status bar instance for UI update
 */
export async function handleDeleteIdentity(
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar
): Promise<void> {
  const vs = getVSCode();
  if (!vs) {
    return;
  }

  // SECURITY: Block command execution in untrusted workspaces
  if (!requireWorkspaceTrust()) {
    return;
  }

  // Get current identity ID from workspace state
  const currentIdentityId = context.workspaceState.get<string>('currentIdentityId');

  try {
    // Show quick pick for selection
    const selectedIdentity = await showDeleteIdentityQuickPick(currentIdentityId);

    if (!selectedIdentity) {
      // User cancelled
      return;
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
      return;
    }

    // Delete identity from config
    await deleteIdentityFromConfig(selectedIdentity.id);

    // Clear workspace state and update status bar if current identity was deleted
    if (isCurrentIdentity) {
      await context.workspaceState.update('currentIdentityId', undefined);
      statusBar.setNoIdentity();
    }

    // Show success notification
    vs.window.showInformationMessage(
      vs.l10n.t("Identity '{0}' has been deleted.", identityLabel)
    );
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    showErrorNotification(vs.l10n.t('Failed to delete identity: {0}', safeMessage));

    // Propagate fatal errors (security violations)
    if (isFatalError(error)) {
      throw error;
    }
  }
}
