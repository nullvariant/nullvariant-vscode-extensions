/**
 * Quick Pick for Identity Selection
 *
 * Shows a searchable list of all configured identities.
 */

import * as vscode from 'vscode';
import {
  Identity,
  getIdentities,
  getIdentityLabel,
  getIdentityDetail,
} from './identity';

/**
 * Quick pick item for an identity
 */
interface IdentityQuickPickItem extends vscode.QuickPickItem {
  identity: Identity;
}

/**
 * Create quick pick items from identities
 */
function createQuickPickItems(
  currentIdentity?: Identity
): IdentityQuickPickItem[] {
  const identities = getIdentities();

  return identities.map(identity => {
    const isCurrent = currentIdentity?.id === identity.id;

    return {
      identity,
      label: getIdentityLabel(identity),
      description: isCurrent ? '$(check) Current' : undefined,
      detail: getIdentityDetail(identity),
      picked: isCurrent,
    };
  });
}

/**
 * Show identity selection quick pick
 *
 * @returns Selected identity or undefined if cancelled
 */
export async function showIdentityQuickPick(
  currentIdentity?: Identity
): Promise<Identity | undefined> {
  const items = createQuickPickItems(currentIdentity);

  if (items.length === 0) {
    vscode.window.showWarningMessage(
      'No identities configured. Add identities in settings: gitIdSwitcher.identities'
    );
    return undefined;
  }

  const quickPick = vscode.window.createQuickPick<IdentityQuickPickItem>();
  quickPick.items = items;
  quickPick.title = 'Select Git Identity';
  quickPick.placeholder = 'Search identities...';
  quickPick.matchOnDescription = true;
  quickPick.matchOnDetail = true;

  // Find and highlight current identity
  if (currentIdentity) {
    const currentItem = items.find(
      item => item.identity.id === currentIdentity.id
    );
    if (currentItem) {
      quickPick.activeItems = [currentItem];
    }
  }

  return new Promise<Identity | undefined>(resolve => {
    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      quickPick.hide();
      resolve(selected?.identity);
    });

    quickPick.onDidHide(() => {
      quickPick.dispose();
      resolve(undefined);
    });

    quickPick.show();
  });
}

/**
 * Show identity switched notification
 */
export function showIdentitySwitchedNotification(identity: Identity): void {
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  const showNotifications = config.get<boolean>('showNotifications', true);

  if (showNotifications) {
    vscode.window.showInformationMessage(
      `Switched to ${getIdentityLabel(identity)}`
    );
  }
}

/**
 * Show error notification
 */
export function showErrorNotification(message: string): void {
  vscode.window.showErrorMessage(`Git Identity Switcher: ${message}`);
}
