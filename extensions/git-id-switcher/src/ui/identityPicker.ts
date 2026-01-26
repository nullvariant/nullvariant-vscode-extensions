/**
 * Quick Pick for Identity Selection
 *
 * Shows a searchable list of all configured identities.
 */

import * as vscode from 'vscode';
import {
  Identity,
  getIdentitiesWithValidation,
  getIdentityLabel,
  getIdentityDetail,
} from '../identity/identity';
import { getVSCode } from '../core/vscodeLoader';

/**
 * Quick pick item for an identity
 *
 * @internal Exported for testing purposes
 */
export interface IdentityQuickPickItem extends vscode.QuickPickItem {
  identity: Identity;
}

/**
 * Create quick pick items from identities
 *
 * @internal Exported for testing purposes
 */
export function createQuickPickItems(
  currentIdentity?: Identity
): IdentityQuickPickItem[] {
  const identities = getIdentitiesWithValidation();

  return identities.map(identity => {
    const isCurrent = currentIdentity?.id === identity.id;

    return {
      identity,
      label: getIdentityLabel(identity),
      description: isCurrent ? '$(check) ' + vscode.l10n.t('Current') : undefined,
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
      vscode.l10n.t('No identities configured. Add identities in settings: {0}', 'gitIdSwitcher.identities')
    );
    return undefined;
  }

  const quickPick = vscode.window.createQuickPick<IdentityQuickPickItem>();
  quickPick.items = items;
  quickPick.title = vscode.l10n.t('Select Git Identity');
  quickPick.placeholder = vscode.l10n.t('Search identities...');
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
      vscode.l10n.t('Switched to {0}', getIdentityLabel(identity))
    );
  }
}

/**
 * Show error notification
 *
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 */
export function showErrorNotification(message: string): void {
  const vs = getVSCode();
  if (!vs) {
    return;
  }
  vs.window.showErrorMessage(vs.l10n.t('Git ID Switcher: {0}', message));
}

/**
 * Show identity deletion quick pick
 *
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 *
 * @param currentIdentityId - The ID of the currently active identity (for marking)
 * @returns Selected identity or undefined if cancelled
 */
export async function showDeleteIdentityQuickPick(
  currentIdentityId?: string
): Promise<Identity | undefined> {
  const vs = getVSCode();
  if (!vs) {
    return undefined;
  }

  const identities = getIdentitiesWithValidation();

  if (identities.length === 0) {
    vs.window.showWarningMessage(
      vs.l10n.t('No identities configured. Add identities in settings: {0}', 'gitIdSwitcher.identities')
    );
    return undefined;
  }

  // Create items with (Current) mark for the active identity
  const items: IdentityQuickPickItem[] = identities.map(identity => {
    const isCurrent = currentIdentityId === identity.id;

    return {
      identity,
      label: getIdentityLabel(identity),
      description: isCurrent ? '$(check) ' + vs.l10n.t('Current') : undefined,
      detail: getIdentityDetail(identity),
    };
  });

  const quickPick = vs.window.createQuickPick<IdentityQuickPickItem>();
  quickPick.items = items;
  quickPick.title = vs.l10n.t('Delete Identity');
  quickPick.placeholder = vs.l10n.t('Select identity to delete');
  quickPick.matchOnDescription = true;
  quickPick.matchOnDetail = true;

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
