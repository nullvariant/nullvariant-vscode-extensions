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
 * Quick pick item for manage identities UI
 *
 * @internal Exported for testing purposes
 */
export interface ManageIdentityQuickPickItem extends vscodeTypes.QuickPickItem {
  identity?: Identity;
  index?: number;
  _isPlaceholder?: boolean;
  _isAddOption?: boolean;
}

/**
 * Result from manage identities quick pick
 */
export type ManageIdentitiesResult =
  | { action: 'back' }
  | { action: 'add' }
  | { action: 'edit'; identity: Identity; index: number }
  | { action: 'delete'; identity: Identity; index: number }
  | { action: 'moveUp'; identity: Identity; index: number }
  | { action: 'moveDown'; identity: Identity; index: number };

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
    label: `$(gear) ${vs.l10n.t('Manage Profiles')}`,
    identity: null as unknown as Identity,
    _isManageOption: true,
  };

  const allItems = [...items, separatorItem, manageItem];

  // Manage button for title bar
  const manageButton: vscodeTypes.QuickInputButton = {
    iconPath: new vs.ThemeIcon('gear'),
    tooltip: vs.l10n.t('Manage Profiles'),
  };

  const quickPick = vs.window.createQuickPick<IdentityQuickPickItem>();
  quickPick.items = allItems;
  quickPick.title = vs.l10n.t('Select Profile');
  quickPick.placeholder = vs.l10n.t('Search profiles...');
  quickPick.buttons = [manageButton];
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
    let resolved = false;

    // Handle title bar manage button
    quickPick.onDidTriggerButton(button => {
      if (button === manageButton) {
        resolved = true;
        quickPick.hide();
        resolve('manage');
      }
    });

    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      resolved = true;
      quickPick.hide();
      if (selected?._isManageOption) {
        resolve('manage');
      } else {
        resolve(selected?.identity);
      }
    });

    quickPick.onDidHide(() => {
      quickPick.dispose();
      if (!resolved) {
        resolve(undefined);
      }
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

/**
 * Show manage identities quick pick
 *
 * Displays a list of identities with inline move up/down, edit, and delete buttons.
 * Uses createQuickPick for item button support.
 *
 * @param identities - List of configured identities
 * @param lastIndex - Index to focus (for returning after edit/delete)
 * @returns ManageIdentitiesResult or undefined if cancelled
 */
export async function showManageIdentitiesQuickPick(
  identities: Identity[],
  lastIndex = 0
): Promise<ManageIdentitiesResult | undefined> {
  const vs = getVSCode();
  if (!vs) {
    return undefined;
  }

  // Build items
  const items: ManageIdentityQuickPickItem[] = [];

  // Move up button (arrow-up icon)
  const moveUpButton: vscodeTypes.QuickInputButton = {
    iconPath: new vs.ThemeIcon('arrow-up'),
    tooltip: vs.l10n.t('Move up'),
  };

  // Move down button (arrow-down icon)
  const moveDownButton: vscodeTypes.QuickInputButton = {
    iconPath: new vs.ThemeIcon('arrow-down'),
    tooltip: vs.l10n.t('Move down'),
  };

  // Edit button (pencil icon)
  const editButton: vscodeTypes.QuickInputButton = {
    iconPath: new vs.ThemeIcon('pencil'),
    tooltip: vs.l10n.t('Edit'),
  };

  // Delete button (trash icon)
  const deleteButton: vscodeTypes.QuickInputButton = {
    iconPath: new vs.ThemeIcon('trash'),
    tooltip: vs.l10n.t('Delete'),
  };

  // Add button for title bar
  const addButton: vscodeTypes.QuickInputButton = {
    iconPath: new vs.ThemeIcon('add'),
    tooltip: vs.l10n.t('New Profile'),
  };

  if (identities.length === 0) {
    // Show placeholder when no identities
    items.push({
      label: vs.l10n.t('(No identities)'),
      _isPlaceholder: true,
    });
  } else {
    // Add identity items with inline buttons
    identities.forEach((identity, index) => {
      items.push({
        label: getIdentityLabel(identity),
        detail: getIdentityDetail(identity),
        identity,
        index,
        buttons: [moveUpButton, moveDownButton, editButton, deleteButton],
      });
    });
  }

  // Add separator and "New Profile" option
  items.push(
    {
      label: '',
      kind: vs.QuickPickItemKind.Separator,
    } as ManageIdentityQuickPickItem,
    {
      label: vs.l10n.t('New Profile'),
      iconPath: new vs.ThemeIcon('add'),
      _isAddOption: true,
    }
  );

  const quickPick = vs.window.createQuickPick<ManageIdentityQuickPickItem>();
  quickPick.items = items;
  quickPick.title = vs.l10n.t('Manage Profiles');
  quickPick.ignoreFocusOut = true;
  quickPick.buttons = [vs.QuickInputButtons.Back, addButton];
  quickPick.matchOnDescription = true;
  quickPick.matchOnDetail = true;

  // Calculate safe index for focus
  // Only focus on identity items (not placeholder or add option)
  const identityItemCount = identities.length;
  if (identityItemCount > 0) {
    const safeIndex = Math.min(lastIndex, Math.max(0, identityItemCount - 1));
    quickPick.activeItems = [items[safeIndex]];
  }

  return new Promise<ManageIdentitiesResult | undefined>(resolve => {
    let resolved = false;

    // Handle title bar buttons (back and add)
    quickPick.onDidTriggerButton(button => {
      if (button === vs.QuickInputButtons.Back) {
        resolved = true;
        quickPick.hide();
        resolve({ action: 'back' });
      } else if (button === addButton) {
        resolved = true;
        quickPick.hide();
        resolve({ action: 'add' });
      }
    });

    // Handle inline item buttons (move up/down, edit, delete)
    quickPick.onDidTriggerItemButton(e => {
      const item = e.item;
      if (!item.identity || item.index === undefined) {
        return;
      }

      resolved = true;
      quickPick.hide();

      if (e.button === moveUpButton) {
        resolve({ action: 'moveUp', identity: item.identity, index: item.index });
      } else if (e.button === moveDownButton) {
        resolve({ action: 'moveDown', identity: item.identity, index: item.index });
      } else if (e.button === editButton) {
        resolve({ action: 'edit', identity: item.identity, index: item.index });
      } else if (e.button === deleteButton) {
        resolve({ action: 'delete', identity: item.identity, index: item.index });
      }
    });

    // Handle selection (only for add option)
    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];

      // Ignore identity items and placeholder
      if (!selected || selected.identity || selected._isPlaceholder) {
        return; // Don't resolve/hide, stay in picker
      }

      // Handle add option
      if (selected._isAddOption) {
        resolved = true;
        quickPick.hide();
        resolve({ action: 'add' });
      }
    });

    // Handle hide (Esc or close button)
    quickPick.onDidHide(() => {
      quickPick.dispose();
      if (!resolved) {
        resolve({ action: 'back' });
      }
    });

    quickPick.show();
  });
}
