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
    label: `$(gear) ${vs.l10n.t('Manage Identities')}`,
    identity: null as unknown as Identity,
    _isManageOption: true,
  };

  const allItems = [...items, separatorItem, manageItem];

  // Manage button for title bar
  const manageButton: vscodeTypes.QuickInputButton = {
    iconPath: new vs.ThemeIcon('gear'),
    tooltip: vs.l10n.t('Manage Identities'),
  };

  const quickPick = vs.window.createQuickPick<IdentityQuickPickItem>();
  quickPick.items = allItems;
  quickPick.title = vs.l10n.t('Select an identity');
  quickPick.placeholder = vs.l10n.t('Search identities...');
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
    let isResolved = false;

    // Handle title bar manage button
    quickPick.onDidTriggerButton(button => {
      if (button !== manageButton) {
      	return;
      }

      isResolved = true;
      quickPick.hide();
      resolve('manage');
    });

    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      isResolved = true;
      quickPick.hide();
      resolve(selected?._isManageOption ? 'manage' : selected?.identity);
    });

    quickPick.onDidHide(() => {
      quickPick.dispose();
      if (!isResolved) {
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
  const isShowNotifications = config.get<boolean>('showNotifications', true);

  if (isShowNotifications) {
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
 * Result from sync resolution quick pick
 */
export type SyncResolutionResult = 'reapply' | 'select' | 'dismiss';

/**
 * Show sync mismatch resolution quick pick
 *
 * Presents options to resolve a profile-git config mismatch:
 * 1. Re-apply profile - Re-apply the current profile to git config
 * 2. Select different profile - Open identity selection
 * 3. Dismiss - Ignore until next check
 *
 * @returns Selected resolution action, or undefined if cancelled
 */
export async function showSyncResolutionQuickPick(): Promise<SyncResolutionResult | undefined> {
  const vs = getVSCode();
  if (!vs) {
    return undefined;
  }

  const items: vscodeTypes.QuickPickItem[] = [
    {
      label: `$(sync) ${vs.l10n.t('Re-apply profile')}`,
      description: vs.l10n.t('Re-apply the current profile to git config'),
    },
    {
      label: `$(list-selection) ${vs.l10n.t('Select different profile')}`,
      description: vs.l10n.t('Choose a different identity profile'),
    },
    {
      label: `$(close) ${vs.l10n.t('Dismiss')}`,
      description: vs.l10n.t('Ignore until next sync check'),
    },
  ];

  const selected = await vs.window.showQuickPick(items, {
    title: vs.l10n.t('Profile out of sync'),
    placeHolder: vs.l10n.t('How would you like to resolve this?'),
  });

  if (!selected) {
    return undefined;
  }

  // Match by index position (stable regardless of l10n)
  const index = items.indexOf(selected);
  const actions: SyncResolutionResult[] = ['reapply', 'select', 'dismiss'];
  return actions[index];
}

/**
 * Action triggered by an inline button on an identity item.
 */
type IdentityItemAction = 'moveUp' | 'moveDown' | 'edit' | 'delete';

/**
 * Inline buttons shown on each identity item, in display order,
 * with the action each one triggers.
 */
function createIdentityItemButtons(
  vs: typeof vscodeTypes
): ReadonlyArray<{ button: vscodeTypes.QuickInputButton; action: IdentityItemAction }> {
  return [
    {
      button: { iconPath: new vs.ThemeIcon('arrow-up'), tooltip: vs.l10n.t('Move up') },
      action: 'moveUp',
    },
    {
      button: { iconPath: new vs.ThemeIcon('arrow-down'), tooltip: vs.l10n.t('Move down') },
      action: 'moveDown',
    },
    {
      button: { iconPath: new vs.ThemeIcon('pencil'), tooltip: vs.l10n.t('Edit') },
      action: 'edit',
    },
    {
      button: { iconPath: new vs.ThemeIcon('trash'), tooltip: vs.l10n.t('Delete') },
      action: 'delete',
    },
  ];
}

/**
 * Build the manage-identities items: one per identity (or a placeholder),
 * then a separator and the "New Identity" option.
 */
function createManageIdentityItems(
  vs: typeof vscodeTypes,
  identities: Identity[],
  buttons: vscodeTypes.QuickInputButton[]
): ManageIdentityQuickPickItem[] {
  const items: ManageIdentityQuickPickItem[] =
    identities.length === 0
      ? [{ label: vs.l10n.t('(No identities)'), _isPlaceholder: true }]
      : identities.map((identity, index) => ({
          label: getIdentityLabel(identity),
          detail: getIdentityDetail(identity),
          identity,
          index,
          buttons,
        }));

  items.push(
    {
      label: '',
      kind: vs.QuickPickItemKind.Separator,
    },
    {
      label: vs.l10n.t('New Identity'),
      iconPath: new vs.ThemeIcon('add'),
      _isAddOption: true,
    }
  );
  return items;
}

/**
 * Result for a title bar button: Back goes back, the add button adds.
 */
function resultForTitleButton(
  button: vscodeTypes.QuickInputButton,
  backButton: vscodeTypes.QuickInputButton,
  addButton: vscodeTypes.QuickInputButton
): ManageIdentitiesResult | undefined {
  if (button === backButton) {
    return { action: 'back' };
  }
  return button === addButton ? { action: 'add' } : undefined;
}

/**
 * Result for an inline button on an identity item, or undefined if the item
 * is not an identity or the button is unknown.
 */
function resultForItemButton(
  item: ManageIdentityQuickPickItem,
  button: vscodeTypes.QuickInputButton,
  itemButtons: ReadonlyArray<{ button: vscodeTypes.QuickInputButton; action: IdentityItemAction }>
): ManageIdentitiesResult | undefined {
  const { identity, index } = item;
  if (!identity || index === undefined) {
    return undefined;
  }
  const matched = itemButtons.find(entry => entry.button === button);
  return matched ? { action: matched.action, identity, index } : undefined;
}

/**
 * Result for accepting a selection: only the add option resolves.
 * Identity items and the placeholder keep the picker open.
 */
function resultForAccept(
  selected: ManageIdentityQuickPickItem | undefined
): ManageIdentitiesResult | undefined {
  return selected?._isAddOption ? { action: 'add' } : undefined;
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

  const itemButtons = createIdentityItemButtons(vs);
  const addButton: vscodeTypes.QuickInputButton = {
    iconPath: new vs.ThemeIcon('add'),
    tooltip: vs.l10n.t('New Identity'),
  };
  const items = createManageIdentityItems(
    vs,
    identities,
    itemButtons.map(({ button }) => button)
  );

  const quickPick = vs.window.createQuickPick<ManageIdentityQuickPickItem>();
  quickPick.items = items;
  quickPick.title = vs.l10n.t('Manage Identities');
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
    let isResolved = false;
    const finish = (result: ManageIdentitiesResult): void => {
      isResolved = true;
      quickPick.hide();
      resolve(result);
    };

    const finishIfChosen = (result: ManageIdentitiesResult | undefined): void => {
      if (result) {
        finish(result);
      }
    };

    // Title bar buttons (Back and Add)
    quickPick.onDidTriggerButton(button => {
      finishIfChosen(resultForTitleButton(button, vs.QuickInputButtons.Back, addButton));
    });

    // Inline buttons on identity items
    quickPick.onDidTriggerItemButton(e => {
      finishIfChosen(resultForItemButton(e.item, e.button, itemButtons));
    });

    // Selection (only the add option resolves; other items stay in the picker)
    quickPick.onDidAccept(() => {
      finishIfChosen(resultForAccept(quickPick.selectedItems[0]));
    });

    // Handle hide (Esc or close button)
    quickPick.onDidHide(() => {
      quickPick.dispose();
      if (!isResolved) {
        resolve({ action: 'back' });
      }
    });

    quickPick.show();
  });
}
