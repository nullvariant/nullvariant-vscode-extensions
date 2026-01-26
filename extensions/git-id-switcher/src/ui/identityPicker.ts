/**
 * Quick Pick for Identity Selection
 *
 * Shows a searchable list of all configured identities.
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 */

import type * as vscodeTypes from 'vscode';
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
export interface IdentityQuickPickItem extends vscodeTypes.QuickPickItem {
  identity: Identity;
  _isManageOption?: boolean;
}

/**
 * Create quick pick items from identities
 *
 * @internal Exported for testing purposes
 */
export function createQuickPickItems(
  currentIdentity?: Identity
): IdentityQuickPickItem[] {
  const vs = getVSCode();
  if (!vs) {
    return [];
  }

  const identities = getIdentitiesWithValidation();

  return identities.map(identity => {
    const isCurrent = currentIdentity?.id === identity.id;

    return {
      identity,
      label: getIdentityLabel(identity),
      description: isCurrent ? '$(check) ' + vs.l10n.t('Current') : undefined,
      detail: getIdentityDetail(identity),
      picked: isCurrent,
    };
  });
}

/**
 * Show identity selection quick pick
 *
 * @returns Selected identity, 'manage' for management menu, or undefined if cancelled
 */
export async function showIdentityQuickPick(
  currentIdentity?: Identity
): Promise<Identity | 'manage' | undefined> {
  const vs = getVSCode();
  if (!vs) {
    return undefined;
  }

  const items = createQuickPickItems(currentIdentity);

  if (items.length === 0) {
    vs.window.showWarningMessage(
      vs.l10n.t('No identities configured. Add identities in settings: {0}', 'gitIdSwitcher.identities')
    );
    return undefined;
  }

  // Add separator and manage option
  const separatorItem = {
    label: '',
    kind: vs.QuickPickItemKind.Separator,
    identity: null as unknown as Identity,
  } as IdentityQuickPickItem;

  const manageItem: IdentityQuickPickItem = {
    label: '$(gear) ' + vs.l10n.t('Manage identities...'),
    identity: null as unknown as Identity,
    _isManageOption: true,
  };

  const allItems = [...items, separatorItem, manageItem];

  const quickPick = vs.window.createQuickPick<IdentityQuickPickItem>();
  quickPick.items = allItems;
  quickPick.title = vs.l10n.t('Select Git Identity');
  quickPick.placeholder = vs.l10n.t('Search identities...');
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

  return new Promise<Identity | 'manage' | undefined>(resolve => {
    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      quickPick.hide();
      if (selected?._isManageOption) {
        resolve('manage');
      } else {
        resolve(selected?.identity);
      }
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
  const vs = getVSCode();
  if (!vs) {
    return;
  }

  const config = vs.workspace.getConfiguration('gitIdSwitcher');
  const showNotifications = config.get<boolean>('showNotifications', true);

  if (showNotifications) {
    vs.window.showInformationMessage(
      vs.l10n.t('Switched to {0}', getIdentityLabel(identity))
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
