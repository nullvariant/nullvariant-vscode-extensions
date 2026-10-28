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
import { tryRestoreSavedIdentity, tryDetectFromGit, tryDetectFromSsh, applyDetectedIdentity, type DetectionResult } from '../services/detection';
import { selectIdentityCommand, showCurrentIdentityCommand, showWelcomeNotification, handleDeleteIdentity, resolveSyncMismatchCommand } from '../commands/handlers';
import { checkSync } from './syncChecker';
import { extensionLogger } from '../logging/extensionLogger';

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
  extensionLogger.info('Activating...');

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
    extensionLogger.info('Activated in restricted mode (untrusted workspace)');
    return;
  }

  extensionLogger.info('Activated');
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
    extensionLogger.debug('Sync check failed silently');
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
      extensionLogger.debug(`Debounced sync check failed: ${safeMessage}`);
    });
  }, SYNC_CHECK_DEBOUNCE_MS);
}

/**
 * Re-run initialization and the sync check after a workspace event.
 * Failures are logged, and fatal ones are also shown to the user.
 *
 * @param trigger - What caused the re-initialization, for the log message
 */
async function reinitialize(context: vscode.ExtensionContext, trigger: string): Promise<void> {
  try {
    await initializeState(context);
    await performSyncCheck();
  } catch (error) {
    const safeMessage = getUserSafeMessage(error);
    extensionLogger.error(`Failed to initialize after ${trigger}: ${safeMessage}`);
    if (isFatalError(error)) {
      vscode.window.showErrorMessage(
        vscode.l10n.t('Failed to initialize Git ID Switcher: {0}', safeMessage)
      );
    }
  }
}

/**
 * Log what changed in the configuration, then store the new snapshot.
 * The snapshot is stored even if detecting the changes fails.
 */
function recordConfigChanges(): void {
  try {
    const newSnapshot = securityLogger.createConfigSnapshot();
    const changes = securityLogger.detectConfigChanges(newSnapshot);
    if (changes.length > 0) {
      securityLogger.logConfigChanges(changes);
    }
    securityLogger.storeConfigSnapshot();
  } catch (error) {
    extensionLogger.error(`Error handling config change: ${getUserSafeMessage(error)}`);
    try {
      securityLogger.storeConfigSnapshot();
    } catch (snapshotError) {
      extensionLogger.error(`Error storing config snapshot: ${getUserSafeMessage(snapshotError)}`);
    }
  }
}

/**
 * Handle a configuration change: log it, drop cached identities, and re-initialize.
 */
function handleConfigurationChange(
  context: vscode.ExtensionContext,
  e: vscode.ConfigurationChangeEvent,
): void {
  if (!e.affectsConfiguration('gitIdSwitcher')) {
    return;
  }

  recordConfigChanges();
  invalidateIdentityCache();
  void reinitialize(context, 'config change');
}

/**
 * Sync check on window focus return (if enabled).
 */
function handleWindowStateChange(state: vscode.WindowState): void {
  if (!state.focused) {
    return;
  }
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  if (!config.get<boolean>('syncCheck.onFocusReturn', true)) {
    return;
  }
  debouncedSyncCheck();
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
      void reinitialize(context, 'workspace change');
    }),
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      handleConfigurationChange(context, e);
    }),
    vscode.window.onDidChangeWindowState(handleWindowStateChange),
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
  extensionLogger.info('Deactivated');
  extensionLogger.dispose();
}

/**
 * Try each identity source in order and apply the first identity found.
 *
 * Order: the identity saved in this workspace, then the Git config, then the
 * SSH agent. A later source runs only if the earlier ones found nothing, and a
 * cancelled detection stops the search. Only detected identities are saved
 * back to the workspace (the restored one is already saved).
 *
 * The saved identity is restored before the loop on purpose: restoring is
 * synchronous, so reading and applying it has no await in between where a
 * newer initialization could cancel this one.
 */
async function detectAndApplyIdentity(
  context: vscode.ExtensionContext,
  token: vscode.CancellationToken,
): Promise<void> {
  const saved = tryRestoreSavedIdentity(context);
  if (saved.found) {
    await applyDetectedIdentity(saved.identity, context, false, statusBar, setCurrentIdentity);
    return;
  }

  const detectors: ReadonlyArray<(token: vscode.CancellationToken) => Promise<DetectionResult | 'cancelled'>> = [
    tryDetectFromGit,
    tryDetectFromSsh,
  ];

  for (const detect of detectors) {
    const result = await detect(token);
    if (result === 'cancelled') {
      return;
    }
    if (result.found) {
      await applyDetectedIdentity(result.identity, context, true, statusBar, setCurrentIdentity);
      return;
    }
  }

  statusBar.setNoIdentity();
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

    await detectAndApplyIdentity(context, token);
  } catch (error) {
    if (token.isCancellationRequested) {
      extensionLogger.debug('Initialization cancelled (caught in error handler)');
      return;
    }

    const safeMessage = getUserSafeMessage(error);
    extensionLogger.error(`Failed to initialize: ${safeMessage}`);
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
