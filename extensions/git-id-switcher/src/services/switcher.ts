/**
 * Identity Switching Service
 *
 * Handles the actual switching of Git identities including:
 * - Git configuration updates
 * - SSH key switching
 * - State management
 *
 * Switches run one at a time within this window: a switch requested while
 * another is running waits for it, so two switches never write git config or
 * ssh-agent at once. Other work on the same records (tidying them at startup)
 * runs in the same queue (runInSwitchQueue).
 *
 * A switch names the identity by its ID. When its turn comes, the identity is
 * read again from the validated settings (so a signing key removed meanwhile
 * is not used). The identity is applied also when it is the current one, so
 * values changed by hand since are written again.
 *
 * A switch moves the switch generation on when it starts and when it ends, so
 * a Sync Check that ran while a switch was running can tell that its result
 * may be out of date.
 *
 * @module services/switcher
 */

import * as vscode from 'vscode';
import { Identity, getIdentityById, getIdentityLabel } from '../identity/identity';
import { checkWorkspaceRepository, setGitConfigForIdentity, type GitConfigApplyOutcome } from '../core/gitConfig';
import { switchToIdentitySshKey } from '../ssh/sshAgent';
import { showIdentitySwitchedNotification } from '../ui/identityPicker';
import { securityLogger } from '../security/securityLogger';
import { createConfigError, getUserSafeMessage } from '../core/errors';
import { IdentityStatusBar } from '../ui/identityStatusBar';
import { checkSync } from '../core/syncChecker';
import { extensionLogger } from '../logging/extensionLogger';
import { createSerialRunner } from '../core/serialRunner';
import { createSigningRecordStore, type SigningRecordStore } from '../core/signingRecordStore';

const runSerially = createSerialRunner();

/** Moves on when a switch in this window starts and when it ends */
let switchGeneration = 0;

/**
 * The switch generation. A result computed for the current identity is still
 * about it only if this has not changed meanwhile.
 */
export function getSwitchGeneration(): number {
  return switchGeneration;
}

/**
 * Run a task in the queue of identity switches (it waits for a running
 * switch, and a switch requested meanwhile waits for it).
 */
export function runInSwitchQueue<T>(task: () => Promise<T>): Promise<T> {
  return runSerially(task);
}

/**
 * The record of the signing config the extension wrote, for this workspace.
 */
export function getSigningRecordStore(context: vscode.ExtensionContext): SigningRecordStore {
  return createSigningRecordStore(context.workspaceState);
}

/**
 * Switch to an identity, in the switch queue.
 *
 * @param identityId - The identity to switch to, read from the validated
 *   settings when the switch's turn comes
 * @throws ConfigError if the identity is no longer in the settings (or is
 *   not valid) when its turn comes, or the error of the switch
 */
export function switchToIdentity(
  identityId: string,
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar,
  getCurrentIdentity: () => Identity | undefined,
  setCurrentIdentity: (identity: Identity) => void
): Promise<void> {
  return runSerially(async () => {
    // Read again now: the settings may have changed while this switch waited
    const identity = getIdentityById(identityId);
    if (identity === undefined) {
      throw createConfigError(
        vscode.l10n.t('The identity "{0}" is not in the settings, or is not valid.', identityId),
        { field: 'identity', context: { reason: 'identity-not-found' } },
      );
    }
    await runIdentitySwitch(identity, context, statusBar, getCurrentIdentity, setCurrentIdentity);
  });
}

/**
 * Tell the user what a switch left undone in git config (the switch
 * itself succeeded).
 */
function showGitConfigWarnings(identity: Identity, outcome: GitConfigApplyOutcome): void {
  const label = getIdentityLabel(identity);
  if (outcome.failedSubmoduleCount > 0) {
    void vscode.window.showWarningMessage(
      vscode.l10n.t(
        'Switched to {0}, but Git config could not be fully updated in {1} submodule(s); some may keep a mix of the previous and new values.',
        label,
        outcome.failedSubmoduleCount,
      ),
    );
  }
  if (!outcome.isSubmoduleListComplete) {
    void vscode.window.showWarningMessage(
      vscode.l10n.t(
        'Switched to {0}, but the submodules could not all be listed; some may keep the previous Git config.',
        label,
      ),
    );
  }
}

/**
 * Run one switch.
 */
async function runIdentitySwitch(
  identity: Identity,
  context: vscode.ExtensionContext,
  statusBar: IdentityStatusBar,
  getCurrentIdentity: () => Identity | undefined,
  setCurrentIdentity: (identity: Identity) => void
): Promise<void> {
  statusBar.setLoading();
  switchGeneration++;

  const previousIdentityId = getCurrentIdentity()?.id ?? null;
  const signingRecords = getSigningRecordStore(context);

  try {
    const config = vscode.workspace.getConfiguration('gitIdSwitcher');
    const isAutoSwitchSshKey = config.get<boolean>('autoSwitchSshKey', true);

    // Update Git config if in a repository. A check that failed stops the
    // switch; it is never taken as "not a repository".
    const repository = await checkWorkspaceRepository();
    if (repository === 'error') {
      throw createConfigError(
        vscode.l10n.t('Could not tell whether the workspace folder is in a Git repository; nothing was changed.'),
        { field: 'repository', context: { reason: 'repository-check-failed' } },
      );
    }
    const gitConfigOutcome = repository === 'repository'
      ? await setGitConfigForIdentity(identity, signingRecords, context.globalState)
      : undefined;

    // Switch SSH key if enabled and key is configured
    if (isAutoSwitchSshKey && identity.sshKeyPath) {
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

    // Run sync check after applying identity (if enabled)
    if (config.get<boolean>('syncCheck.enabled', true)) {
      try {
        const syncResult = await checkSync(identity, { store: signingRecords });
        statusBar.setSyncState(syncResult);
      } catch {
        // Non-fatal: sync check failure should not disrupt the switch
        extensionLogger.debug('Post-switch sync check failed silently');
      }
    }

    // Show notification
    showIdentitySwitchedNotification(identity);
    if (gitConfigOutcome) {
      showGitConfigWarnings(identity, gitConfigOutcome);
    }

    extensionLogger.info(`Switched to identity: ${identity.id}`);
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage in console
    const safeMessage = getUserSafeMessage(error);
    extensionLogger.error(`Failed to switch identity: ${safeMessage}`);

    // Revert status bar
    const currentIdentity = getCurrentIdentity();
    if (currentIdentity) {
      statusBar.setIdentity(currentIdentity);
    } else {
      statusBar.setNoIdentity();
    }

    // Re-throw error for caller to handle (selectIdentityCommand will notify user)
    throw error;
  } finally {
    switchGeneration++;
  }
}
