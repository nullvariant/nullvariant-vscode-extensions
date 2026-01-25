/**
 * Identity Switching Service
 *
 * Handles the actual switching of Git identities including:
 * - Git configuration updates
 * - SSH key switching
 * - State management
 *
 * @module services/switcher
 */

import * as vscode from 'vscode';
import { Identity } from '../identity/identity';
import { setGitConfigForIdentity, isGitRepository } from '../core/gitConfig';
import { switchToIdentitySshKey } from '../ssh/sshAgent';
import { showIdentitySwitchedNotification } from '../ui/identityPicker';
import { securityLogger } from '../security/securityLogger';
import { getUserSafeMessage } from '../core/errors';
import { IdentityStatusBar } from '../ui/identityStatusBar';

/**
 * Switch to a specific identity
 */
export async function switchToIdentity(
  identity: Identity,
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar,
  getCurrentIdentity: () => Identity | undefined,
  setCurrentIdentity: (identity: Identity) => void
): Promise<void> {
  statusBar.setLoading();

  const previousIdentityId = getCurrentIdentity()?.id ?? null;

  try {
    const config = vscode.workspace.getConfiguration('gitIdSwitcher');
    const autoSwitchSshKey = config.get<boolean>('autoSwitchSshKey', true);

    // Update Git config if in a repository
    if (await isGitRepository()) {
      await setGitConfigForIdentity(identity);
    }

    // Switch SSH key if enabled and key is configured
    if (autoSwitchSshKey && identity.sshKeyPath) {
      await switchToIdentitySshKey(identity);
      securityLogger.logSshKeyLoad(identity.sshKeyPath, true);
    }

    // Update state
    setCurrentIdentity(identity);
    statusBar.setIdentity(identity);

    // Save to workspace state
    await context.workspaceState.update('currentIdentityId', identity.id);

    // Log identity switch
    securityLogger.logIdentitySwitch(previousIdentityId, identity.id);

    // Show notification
    showIdentitySwitchedNotification(identity);

    console.log(`[Git ID Switcher] Switched to identity: ${identity.id}`);
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage in console
    const safeMessage = getUserSafeMessage(error);
    console.error(`[Git ID Switcher] Failed to switch identity: ${safeMessage}`);

    // Revert status bar
    const currentIdentity = getCurrentIdentity();
    if (currentIdentity) {
      statusBar.setIdentity(currentIdentity);
    } else {
      statusBar.setNoIdentity();
    }

    // Re-throw error for caller to handle (selectIdentityCommand will notify user)
    throw error;
  }
}
