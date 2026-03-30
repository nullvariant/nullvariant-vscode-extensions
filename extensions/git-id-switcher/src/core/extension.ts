/**
 * Git ID Switcher - VS Code Extension Entry Point
 * @author Null;Variant
 * @license MIT
 */

import * as vscode from 'vscode';
import { Identity, getIdentitiesWithValidation, invalidateIdentityCache } from '../identity/identity';
import { createStatusBar, IdentityStatusBar } from '../ui/identityStatusBar';
import { showDocumentation } from '../ui/documentationPublic';
import { securityLogger } from '../security/securityLogger';
import { getUserSafeMessage, isFatalError } from './errors';
import { initializeWorkspaceTrust } from './workspaceTrust';
import { tryRestoreSavedIdentity, tryDetectFromGit, tryDetectFromSsh, applyDetectedIdentity } from '../services/detection';
import { selectIdentityCommand, showCurrentIdentityCommand, showWelcomeNotification, handleDeleteIdentity, resolveSyncMismatchCommand } from '../commands/handlers';
import { checkSync } from './syncChecker';

// Global state
let statusBar: IdentityStatusBar;
let currentIdentity: Identity | undefined;
let initializeCancellation: vscode.CancellationTokenSource | undefined;
let syncCheckDebounceTimer: ReturnType<typeof setTimeout> | undefined;

/** Debounce delay for sync check on focus return (ms) */
const SYNC_CHECK_DEBOUNCE_MS = 500;

// State accessors for dependency injection
const getCurrentIdentity = (): Identity | undefined => currentIdentity;
const setCurrentIdentity = (identity: Identity): void => { currentIdentity = identity; };

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('[Git ID Switcher] Activating...');

  // SECURITY: Log files written only to extension's secure storage
  securityLogger.initializeWithContext(context.globalStorageUri.fsPath);
  securityLogger.logActivation();

  statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  const selectCommand = vscode.commands.registerCommand(
    'git-id-switcher.selectIdentity',
    () => selectIdentityCommand(context, statusBar, getCurrentIdentity, setCurrentIdentity)
  );
  const showCurrentCommand = vscode.commands.registerCommand(
    'git-id-switcher.showCurrentIdentity',
    () => showCurrentIdentityCommand(getCurrentIdentity)
  );
  const showDocsCommand = vscode.commands.registerCommand(
    'git-id-switcher.showDocumentation',
    () => showDocumentation(context)
  );
  const deleteCommand = vscode.commands.registerCommand(
    'git-id-switcher.deleteIdentity',
    () => handleDeleteIdentity(context, statusBar)
  );
  const resolveSyncCommand = vscode.commands.registerCommand(
    'git-id-switcher.resolveSyncMismatch',
    () => resolveSyncMismatchCommand(context, statusBar, getCurrentIdentity, setCurrentIdentity)
  );
  context.subscriptions.push(selectCommand, showCurrentCommand, showDocsCommand, deleteCommand, resolveSyncCommand);

  // SECURITY: Check workspace trust before initializing sensitive operations
  const isTrusted = initializeWorkspaceTrust(context, async () => {
    await performTrustedInitialization(context);
  });

  if (isTrusted) {
    await performTrustedInitialization(context);
  } else {
    statusBar.setNoIdentity();
    console.log('[Git ID Switcher] Activated in restricted mode (untrusted workspace)');
    return;
  }

  console.log('[Git ID Switcher] Activated');
}

/**
 * Run sync check for the current identity and update the status bar.
 *
 * Reads `syncCheck.enabled` from configuration. When disabled, restores
 * the status bar to normal (synced) state to clear any lingering warning.
 *
 * @sideeffect Executes `git config --local` via checkSync()
 */
async function performSyncCheck(): Promise<void> {
  if (!currentIdentity) {
    return;
  }

  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  if (!config.get<boolean>('syncCheck.enabled', true)) {
    // Clear any existing warning when sync check is disabled
    statusBar.setSyncState({ state: 'synced', mismatches: [] });
    return;
  }

  try {
    const result = await checkSync(currentIdentity);
    statusBar.setSyncState(result);
  } catch {
    // Non-fatal: sync check failure should not disrupt the extension
    console.debug('[Git ID Switcher] Sync check failed silently');
  }
}

/**
 * Debounced sync check for focus-return events.
 * Prevents multiple rapid invocations when the window focus changes quickly.
 */
function debouncedSyncCheck(): void {
  if (syncCheckDebounceTimer !== undefined) {
    clearTimeout(syncCheckDebounceTimer);
  }
  syncCheckDebounceTimer = setTimeout(() => {
    syncCheckDebounceTimer = undefined;
    performSyncCheck().catch(error => {
      const safeMessage = getUserSafeMessage(error);
      console.debug('[Git ID Switcher] Debounced sync check failed:', safeMessage);
    });
  }, SYNC_CHECK_DEBOUNCE_MS);
}

/**
 * Perform initialization that requires workspace trust.
 * SECURITY: Only call after confirming workspace is trusted.
 */
async function performTrustedInitialization(context: vscode.ExtensionContext): Promise<void> {
  await initializeState(context);

  // Run initial sync check after state is loaded
  await performSyncCheck();

  securityLogger.storeConfigSnapshot();

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      initializeState(context)
        .then(() => performSyncCheck())
        .catch(error => {
          const safeMessage = getUserSafeMessage(error);
          console.error('[Git ID Switcher] Failed to initialize after workspace change:', safeMessage);
          if (isFatalError(error)) {
            vscode.window.showErrorMessage(
              vscode.l10n.t('Failed to initialize Git ID Switcher: {0}', safeMessage)
            );
          }
        });
    }),
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('gitIdSwitcher')) {
        try {
          const newSnapshot = securityLogger.createConfigSnapshot();
          const changes = securityLogger.detectConfigChanges(newSnapshot);
          if (changes.length > 0) {
            securityLogger.logConfigChanges(changes);
          }
          securityLogger.storeConfigSnapshot();
        } catch (error) {
          console.error('[Git ID Switcher] Error handling config change:', error);
          try {
            securityLogger.storeConfigSnapshot();
          } catch (snapshotError) {
            console.error('[Git ID Switcher] Error storing config snapshot:', snapshotError);
          }
        }

        invalidateIdentityCache();
        initializeState(context)
          .then(() => performSyncCheck())
          .catch(error => {
            const safeMessage = getUserSafeMessage(error);
            console.error('[Git ID Switcher] Failed to initialize after config change:', safeMessage);
            if (isFatalError(error)) {
              vscode.window.showErrorMessage(
                vscode.l10n.t('Failed to initialize Git ID Switcher: {0}', safeMessage)
              );
            }
          });
      }
    }),
    // Sync check on window focus return
    vscode.window.onDidChangeWindowState((state: vscode.WindowState) => {
      if (!state.focused) {
        return;
      }
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      if (!config.get<boolean>('syncCheck.onFocusReturn', true)) {
        return;
      }
      debouncedSyncCheck();
    }),
  );
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  if (syncCheckDebounceTimer !== undefined) {
    clearTimeout(syncCheckDebounceTimer);
    syncCheckDebounceTimer = undefined;
  }
  if (initializeCancellation) {
    initializeCancellation.cancel();
    initializeCancellation.dispose();
    initializeCancellation = undefined;
  }
  securityLogger.logDeactivation();
  securityLogger.dispose();
  console.log('[Git ID Switcher] Deactivated');
}

/**
 * Initialize state from saved settings and current Git config
 */
async function initializeState(context: vscode.ExtensionContext): Promise<void> {
  if (initializeCancellation) {
    initializeCancellation.cancel();
    initializeCancellation.dispose();
  }

  const tokenSource = new vscode.CancellationTokenSource();
  initializeCancellation = tokenSource;
  const token = tokenSource.token;

  try {
    const identities = getIdentitiesWithValidation();

    if (identities.length === 0) {
      statusBar.setNoIdentity();
      return;
    }

    // First-run welcome notification
    const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
    if (!hasShownWelcome && identities.length === 1 && identities[0].id === 'example') {
      void showWelcomeNotification();
      await context.globalState.update('hasShownWelcome', true);
    }

    const savedResult = tryRestoreSavedIdentity(context);
    if (savedResult.found) {
      await applyDetectedIdentity(savedResult.identity, context, false, statusBar, setCurrentIdentity);
      return;
    }

    const gitResult = await tryDetectFromGit(token);
    if (gitResult === 'cancelled') return;
    if (gitResult.found) {
      await applyDetectedIdentity(gitResult.identity, context, true, statusBar, setCurrentIdentity);
      return;
    }

    const sshResult = await tryDetectFromSsh(token);
    if (sshResult === 'cancelled') return;
    if (sshResult.found) {
      await applyDetectedIdentity(sshResult.identity, context, true, statusBar, setCurrentIdentity);
      return;
    }

    statusBar.setNoIdentity();
  } catch (error) {
    if (token.isCancellationRequested) {
      console.debug('[Git ID Switcher] Initialization cancelled (caught in error handler)');
      return;
    }

    const safeMessage = getUserSafeMessage(error);
    console.error('[Git ID Switcher] Failed to initialize:', safeMessage);
    statusBar.setNoIdentity();

    if (isFatalError(error)) {
      throw error;
    }
  } finally {
    if (initializeCancellation === tokenSource) {
      initializeCancellation = undefined;
    }
    tokenSource.dispose();
  }
}
