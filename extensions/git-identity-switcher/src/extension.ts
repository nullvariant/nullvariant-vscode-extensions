/**
 * Git Identity Switcher - VS Code Extension Entry Point
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
  getIdentities,
  getIdentityById,
  getIdentityLabel,
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

// Global state
let statusBar: IdentityStatusBar;
let currentIdentity: Identity | undefined;

/**
 * Extension activation
 */
export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  console.log('Git Identity Switcher is activating...');

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

  context.subscriptions.push(selectCommand, showCurrentCommand);

  // Initialize state
  await initializeState(context);

  // Watch for workspace changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      initializeState(context);
    })
  );

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('gitIdSwitcher')) {
        initializeState(context);
      }
    })
  );

  console.log('Git Identity Switcher activated!');
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  console.log('Git Identity Switcher deactivated');
}

/**
 * Initialize state from saved settings and current Git config
 */
async function initializeState(context: vscode.ExtensionContext): Promise<void> {
  try {
    const identities = getIdentities();

    // No identities configured
    if (identities.length === 0) {
      statusBar.setNoIdentity();
      return;
    }

    // Try to restore saved identity
    const savedIdentityId = context.workspaceState.get<string>('currentIdentityId');
    if (savedIdentityId) {
      const savedIdentity = getIdentityById(savedIdentityId);
      if (savedIdentity) {
        currentIdentity = savedIdentity;
        statusBar.setIdentity(savedIdentity);
        return;
      }
    }

    // Try to detect from Git config
    if (await isGitRepository()) {
      const detectedIdentity = await detectCurrentIdentity();
      if (detectedIdentity) {
        currentIdentity = detectedIdentity;
        statusBar.setIdentity(detectedIdentity);
        await context.workspaceState.update('currentIdentityId', detectedIdentity.id);
        return;
      }
    }

    // Try to detect from SSH agent
    const sshIdentity = await detectCurrentIdentityFromSsh();
    if (sshIdentity) {
      currentIdentity = sshIdentity;
      statusBar.setIdentity(sshIdentity);
      await context.workspaceState.update('currentIdentityId', sshIdentity.id);
      return;
    }

    // No identity detected, show selection prompt
    statusBar.setNoIdentity();
  } catch (error) {
    console.error('Failed to initialize Git Identity Switcher:', error);
    statusBar.setNoIdentity();
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    showErrorNotification(vscode.l10n.t('Failed to select identity: {0}', message));
    statusBar.setError(message);
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
 */
async function switchToIdentity(
  identity: Identity,
  context: vscode.ExtensionContext
): Promise<void> {
  statusBar.setLoading();

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
    }

    // Update state
    currentIdentity = identity;
    statusBar.setIdentity(identity);

    // Save to workspace state
    await context.workspaceState.update('currentIdentityId', identity.id);

    // Show notification
    showIdentitySwitchedNotification(identity);

    console.log(`Switched to identity: ${identity.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to switch identity: ${message}`);

    // Revert status bar
    if (currentIdentity) {
      statusBar.setIdentity(currentIdentity);
    } else {
      statusBar.setNoIdentity();
    }

    throw error;
  }
}
