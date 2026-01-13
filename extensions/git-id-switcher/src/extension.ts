/**
 * Git ID Switcher - VS Code Extension Entry Point
 *
 * Switch between multiple Git identities with one click.
 * Automatically configures Git author, SSH keys, and GPG signing.
 *
 * @author Null;Variant
 * @license MIT
 */

import * as vscode from 'vscode';
import {
  Identity,
  getIdentitiesWithValidation,
  getIdentityById,
  getIdentityLabel,
  resetValidationNotificationFlag,
} from './identity';
import { createStatusBar, IdentityStatusBar } from './statusBar';
import {
  setGitConfigForIdentity,
  detectCurrentIdentity,
  isGitRepository,
} from './gitConfig';
import { switchToIdentitySshKey, detectCurrentIdentityFromSsh } from './sshAgent';
import {
  showIdentityQuickPick,
  showIdentitySwitchedNotification,
  showErrorNotification,
} from './quickPick';
import { showDocumentation } from './documentation';
import { securityLogger } from './securityLogger';
import { getUserSafeMessage, isFatalError } from './errors';
import { getOperationGuard, WorkspaceTrustError, __resetOperationGuard } from './operationGuard';
import { OperationType } from './operationClassification';
import { __resetWorkspaceTrustManager } from './workspaceTrust';

// Global state
let statusBar: IdentityStatusBar;
let currentIdentity: Identity | undefined;
let initializeCancellation: vscode.CancellationTokenSource | undefined;

/**
 * Extension activation
 */
export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  console.log('[Git ID Switcher] Activating...');

  // Initialize security logger
  securityLogger.initialize();
  securityLogger.logActivation();

  // Create status bar
  statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  // Register commands
  const selectCommand = vscode.commands.registerCommand(
    'git-id-switcher.selectIdentity',
    () => selectIdentityCommand(context)
  );

  const showCurrentCommand = vscode.commands.registerCommand(
    'git-id-switcher.showCurrentIdentity',
    showCurrentIdentityCommand
  );

  const showDocsCommand = vscode.commands.registerCommand(
    'git-id-switcher.showDocumentation',
    () => showDocumentation(context)
  );

  context.subscriptions.push(selectCommand, showCurrentCommand, showDocsCommand);

  // Initialize state
  await initializeState(context);

  // Watch for workspace changes
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

  // Store initial configuration snapshot for change detection
  securityLogger.storeConfigSnapshot();

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('gitIdSwitcher')) {
        try {
          // Detect and log specific configuration changes
          const newSnapshot = securityLogger.createConfigSnapshot();
          const changes = securityLogger.detectConfigChanges(newSnapshot);
          if (changes.length > 0) {
            securityLogger.logConfigChanges(changes);
          }
          // Update snapshot for next change detection
          // SECURITY: Always update snapshot even if logging fails
          securityLogger.storeConfigSnapshot();
        } catch (error) {
          // SECURITY: Log error but don't break the extension
          // This prevents malicious configuration from causing DoS
          console.error('[Git ID Switcher] Error handling config change:', error);
          // Still update snapshot to prevent state corruption
          try {
            securityLogger.storeConfigSnapshot();
          } catch (snapshotError) {
            console.error('[Git ID Switcher] Error storing config snapshot:', snapshotError);
          }
        }

        // Reset validation notification flag to allow re-notification if errors persist
        // This ensures users are notified again if they fix some issues but others remain
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

  console.log('[Git ID Switcher] Activated');
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  // Cancel any in-progress initialization
  if (initializeCancellation) {
    initializeCancellation.cancel();
    initializeCancellation.dispose();
    initializeCancellation = undefined;
  }

  // Dispose workspace trust related singletons
  __resetOperationGuard();
  __resetWorkspaceTrustManager();

  securityLogger.logDeactivation();
  securityLogger.dispose();
  console.log('[Git ID Switcher] Deactivated');
}

/**
 * Result type for identity detection operations
 */
type DetectionResult = { found: true; identity: Identity } | { found: false };

/**
 * Try to restore saved identity from workspace state.
 * @internal
 */
function tryRestoreSavedIdentity(context: vscode.ExtensionContext): DetectionResult {
  const savedIdentityId = context.workspaceState.get<string>('currentIdentityId');
  if (!savedIdentityId) {
    return { found: false };
  }
  const savedIdentity = getIdentityById(savedIdentityId);
  if (savedIdentity) {
    return { found: true, identity: savedIdentity };
  }
  return { found: false };
}

/**
 * Try to detect identity from Git config.
 * @internal
 */
async function tryDetectFromGit(token: vscode.CancellationToken): Promise<DetectionResult | 'cancelled'> {
  if (!await isGitRepository(token)) {
    return { found: false };
  }

  if (token.isCancellationRequested) {
    console.debug('[Git ID Switcher] Initialization cancelled after isGitRepository');
    return 'cancelled';
  }

  const detectedIdentity = await detectCurrentIdentity(token);

  if (token.isCancellationRequested) {
    console.debug('[Git ID Switcher] Initialization cancelled after detectCurrentIdentity');
    return 'cancelled';
  }

  if (detectedIdentity) {
    return { found: true, identity: detectedIdentity };
  }
  return { found: false };
}

/**
 * Try to detect identity from SSH agent.
 * @internal
 */
async function tryDetectFromSsh(token: vscode.CancellationToken): Promise<DetectionResult | 'cancelled'> {
  const sshIdentity = await detectCurrentIdentityFromSsh(token);

  if (token.isCancellationRequested) {
    console.debug('[Git ID Switcher] Initialization cancelled after detectCurrentIdentityFromSsh');
    return 'cancelled';
  }

  if (sshIdentity) {
    return { found: true, identity: sshIdentity };
  }
  return { found: false };
}

/**
 * Apply detected identity to state and status bar.
 * @internal
 */
async function applyDetectedIdentity(
  identity: Identity,
  context: vscode.ExtensionContext,
  saveToWorkspace: boolean
): Promise<void> {
  currentIdentity = identity;
  statusBar.setIdentity(identity);
  if (saveToWorkspace) {
    await context.workspaceState.update('currentIdentityId', identity.id);
  }
}

/**
 * Initialize state from saved settings and current Git config
 */
async function initializeState(context: vscode.ExtensionContext): Promise<void> {
  // Cancel any existing initialization
  if (initializeCancellation) {
    initializeCancellation.cancel();
    initializeCancellation.dispose();
  }

  const tokenSource = new vscode.CancellationTokenSource();
  initializeCancellation = tokenSource;
  const token = tokenSource.token;

  try {
    const identities = getIdentitiesWithValidation();

    // No identities configured
    if (identities.length === 0) {
      statusBar.setNoIdentity();
      return;
    }

    // First-run welcome notification: detect example-only state
    const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
    if (!hasShownWelcome && identities.length === 1 && identities[0].id === 'example') {
      showWelcomeNotification();
      await context.globalState.update('hasShownWelcome', true);
    }

    // Try to restore saved identity
    const savedResult = tryRestoreSavedIdentity(context);
    if (savedResult.found) {
      await applyDetectedIdentity(savedResult.identity, context, false);
      return;
    }

    // Try to detect from Git config
    const gitResult = await tryDetectFromGit(token);
    if (gitResult === 'cancelled') return;
    if (gitResult.found) {
      await applyDetectedIdentity(gitResult.identity, context, true);
      return;
    }

    // Try to detect from SSH agent
    const sshResult = await tryDetectFromSsh(token);
    if (sshResult === 'cancelled') return;
    if (sshResult.found) {
      await applyDetectedIdentity(sshResult.identity, context, true);
      return;
    }

    // No identity detected, show selection prompt
    statusBar.setNoIdentity();
  } catch (error) {
    // If cancelled, don't treat as error
    if (token.isCancellationRequested) {
      console.debug('[Git ID Switcher] Initialization cancelled (caught in error handler)');
      return;
    }

    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    console.error('[Git ID Switcher] Failed to initialize:', safeMessage);
    statusBar.setNoIdentity();

    // Propagate fatal errors (security violations) - re-throw as-is to preserve category
    if (isFatalError(error)) {
      throw error;
    }
  } finally {
    // Clean up cancellation token if this is still the current one
    if (initializeCancellation === tokenSource) {
      initializeCancellation = undefined;
    }
    tokenSource.dispose();
  }
}

/**
 * Command: Select identity
 */
async function selectIdentityCommand(
  context: vscode.ExtensionContext
): Promise<void> {
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
    await switchToIdentity(selectedIdentity, context);
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
function showCurrentIdentityCommand(): void {
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
 * Switch to a specific identity
 *
 * SECURITY: This operation is guarded by workspace trust.
 * In untrusted workspaces, user confirmation is required.
 */
async function switchToIdentity(
  identity: Identity,
  context: vscode.ExtensionContext
): Promise<void> {
  // SECURITY: Check workspace trust before switching identity
  const guard = getOperationGuard();
  const guardResult = await guard.checkOperationAsync(OperationType.IDENTITY_SWITCH, true);

  if (!guardResult.allowed) {
    // User cancelled or operation blocked
    throw new WorkspaceTrustError(
      OperationType.IDENTITY_SWITCH,
      guardResult.reason ?? vscode.l10n.t('Operation cancelled')
    );
  }

  statusBar.setLoading();

  const previousIdentityId = currentIdentity?.id ?? null;

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
    currentIdentity = identity;
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
    if (currentIdentity) {
      statusBar.setIdentity(currentIdentity);
    } else {
      statusBar.setNoIdentity();
    }

    // Re-throw error for caller to handle (selectIdentityCommand will notify user)
    throw error;
  }
}

/**
 * Show welcome notification for first-time users
 */
async function showWelcomeNotification(): Promise<void> {
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
