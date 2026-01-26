/**
 * Git ID Switcher - VS Code Extension Entry Point
 * @author Null;Variant
 * @license MIT
 */

import * as vscode from 'vscode';
import { Identity, getIdentitiesWithValidation, resetValidationNotificationFlag } from '../identity/identity';
import { createStatusBar, IdentityStatusBar } from '../ui/identityStatusBar';
import { showDocumentation } from '../ui/documentationPublic';
import { securityLogger } from '../security/securityLogger';
import { getUserSafeMessage, isFatalError } from './errors';
import { initializeWorkspaceTrust } from './workspaceTrust';
import { tryRestoreSavedIdentity, tryDetectFromGit, tryDetectFromSsh, applyDetectedIdentity } from '../services/detection';
import { selectIdentityCommand, showCurrentIdentityCommand, showWelcomeNotification, handleDeleteIdentity } from '../commands/handlers';

// Global state
let statusBar: IdentityStatusBar;
let currentIdentity: Identity | undefined;
let initializeCancellation: vscode.CancellationTokenSource | undefined;

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
  context.subscriptions.push(selectCommand, showCurrentCommand, showDocsCommand, deleteCommand);

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
 * Perform initialization that requires workspace trust.
 * SECURITY: Only call after confirming workspace is trusted.
 */
async function performTrustedInitialization(context: vscode.ExtensionContext): Promise<void> {
  await initializeState(context);

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      initializeState(context).catch(error => {
        const safeMessage = getUserSafeMessage(error);
        console.error('[Git ID Switcher] Failed to initialize after workspace change:', safeMessage);
        if (isFatalError(error)) {
          vscode.window.showErrorMessage(
            vscode.l10n.t('Failed to initialize Git ID Switcher: {0}', safeMessage)
          );
        }
      });
    })
  );

  securityLogger.storeConfigSnapshot();

  context.subscriptions.push(
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

        resetValidationNotificationFlag();
        initializeState(context).catch(error => {
          const safeMessage = getUserSafeMessage(error);
          console.error('[Git ID Switcher] Failed to initialize after config change:', safeMessage);
          if (isFatalError(error)) {
            vscode.window.showErrorMessage(
              vscode.l10n.t('Failed to initialize Git ID Switcher: {0}', safeMessage)
            );
          }
        });
      }
    })
  );
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
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
      showWelcomeNotification();
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
