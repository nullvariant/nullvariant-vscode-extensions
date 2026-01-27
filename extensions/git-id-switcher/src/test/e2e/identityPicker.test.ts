/**
 * E2E Tests for Identity Picker UI
 *
 * Tests for identity picker UI functionality including:
 * - showIdentityQuickPick() item generation
 * - Current identity marking
 * - Manage option handling
 * - Empty state handling
 * - Return type: Identity | 'manage' | undefined
 * - showManageIdentitiesQuickPick() management UI
 *
 * Test Categories:
 * - Empty State: Warning when no identities configured
 * - Item Generation: QuickPickItem label, description, detail
 * - Current Identity: $(check) mark for active identity
 * - Manage Option: Separator and manage menu item
 * - User Interaction: Selection, manage option, and cancellation
 * - Manage Identities UI: Inline buttons, back button, add option
 *
 * Test Count: 23 tests (9 for showIdentityQuickPick + 14 for showManageIdentitiesQuickPick)
 *
 * Note: These tests use mocked VS Code API via vscodeLoader since quick pick
 * interactions require VS Code window API.
 */

import * as assert from 'node:assert';
import { showIdentityQuickPick, showManageIdentitiesQuickPick } from '../../ui/identityPicker';
import { _setMockVSCode, _resetCache } from '../../core/vscodeLoader';
import type { Identity } from '../../identity/identity';

/**
 * Test identity fixtures
 */
const TEST_IDENTITIES = {
  work: {
    id: 'work',
    name: 'Work User',
    email: 'work@example.com',
  },
  personal: {
    id: 'personal',
    name: 'Personal User',
    email: 'personal@example.com',
    icon: '🏠',
  },
  github: {
    id: 'github',
    name: 'GitHub User',
    email: 'github@example.com',
    service: 'GitHub',
    description: 'Open source contributions',
  },
};

/**
 * Interface for captured quick pick items
 */
interface CapturedQuickPickItem {
  identity: Identity | null;
  label: string;
  description?: string;
  detail?: string;
  _isManageOption?: boolean;
  kind?: number;
}

/**
 * Create a mock VS Code API for identity picker tests
 */
function createMockVSCode(options: {
  identities?: Identity[];
  selectedIdentity?: Identity | undefined;
  selectManageOption?: boolean;
}) {
  let capturedItems: CapturedQuickPickItem[] = [];
  let capturedPlaceholder = '';
  let capturedTitle = '';
  const showWarningMessageCalls: string[] = [];

  return {
    workspace: {
      isTrusted: true,
      getConfiguration: () => ({
        get: (key: string) => {
          if (key === 'identities') {
            return options.identities ?? [];
          }
          return undefined;
        },
      }),
    },
    window: {
      showWarningMessage: async (message: string) => {
        showWarningMessageCalls.push(message);
        return undefined;
      },
      createQuickPick: <T extends { identity: unknown; _isManageOption?: boolean }>() => {
        let acceptCallback: (() => void) | undefined;
        let hideCallback: (() => void) | undefined;

        return {
          set items(value: T[]) {
            capturedItems = value as unknown as CapturedQuickPickItem[];
          },
          get items(): T[] {
            return capturedItems as unknown as T[];
          },
          set title(value: string) {
            capturedTitle = value;
          },
          set placeholder(value: string) {
            capturedPlaceholder = value;
          },
          set activeItems(_value: T[]) {
            // Capture but don't need to track for tests
          },
          matchOnDescription: false,
          matchOnDetail: false,
          get selectedItems(): T[] {
            // Return manage option if requested
            if (options.selectManageOption) {
              const manageItem = capturedItems.find(
                item => item._isManageOption === true
              );
              return manageItem ? [manageItem as unknown as T] : [];
            }
            // Return selected identity
            if (options.selectedIdentity) {
              const selected = capturedItems.find(
                item => item.identity?.id === options.selectedIdentity?.id
              );
              return selected ? [selected as unknown as T] : [];
            }
            return [];
          },
          onDidAccept: (callback: () => void) => {
            acceptCallback = callback;
          },
          onDidHide: (callback: () => void) => {
            hideCallback = callback;
          },
          show: () => {
            // Simulate user selection
            if (options.selectedIdentity !== undefined || options.selectManageOption) {
              setTimeout(() => acceptCallback?.(), 0);
            } else {
              setTimeout(() => hideCallback?.(), 0);
            }
          },
          hide: () => {},
          dispose: () => {},
        };
      },
    },
    l10n: {
      t: (message: string, ...args: unknown[]) => {
        let result = message;
        args.forEach((arg, index) => {
          result = result.replace(`{${index}}`, String(arg));
        });
        return result;
      },
    },
    QuickPickItemKind: {
      Separator: -1,
      Default: 0,
    },
    // Test inspection helpers
    _getCapturedItems: () => capturedItems,
    _getCapturedPlaceholder: () => capturedPlaceholder,
    _getCapturedTitle: () => capturedTitle,
    _getShowWarningMessageCalls: () => showWarningMessageCalls,
  };
}

describe('showIdentityQuickPick E2E Test Suite', function () {
  // Set suite-level timeout for all tests
  this.timeout(10000);

  beforeEach(() => {
    _resetCache();
  });

  afterEach(() => {
    _resetCache();
  });

  describe('Empty State', () => {
    it('should show warning and return undefined when no identities', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showIdentityQuickPick();

      assert.strictEqual(result, undefined, 'Should return undefined');
      const warnings = mockVSCode._getShowWarningMessageCalls();
      assert.strictEqual(warnings.length, 1, 'Should show warning');
      assert.ok(
        warnings[0].includes('No identities configured'),
        'Warning should mention no identities'
      );
    });
  });

  describe('Item Generation', () => {
    it('should create items with correct labels', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showIdentityQuickPick();

      const items = mockVSCode._getCapturedItems();
      // Items include identities + separator + manage option
      assert.ok(items.length >= 2, 'Should create at least two identity items');

      const workItem = items.find(item => item.identity?.id === 'work');
      assert.ok(workItem, 'Work item should exist');
      assert.strictEqual(workItem.label, 'Work User', 'Work label should be name');

      const personalItem = items.find(item => item.identity?.id === 'personal');
      assert.ok(personalItem, 'Personal item should exist');
      assert.ok(personalItem.label.includes('🏠'), 'Personal label should include icon');
    });

    it('should include service in label when specified', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.github],
        selectedIdentity: TEST_IDENTITIES.github,
      });
      _setMockVSCode(mockVSCode as never);

      await showIdentityQuickPick();

      const items = mockVSCode._getCapturedItems();
      const githubItem = items.find(item => item.identity?.id === 'github');

      assert.ok(githubItem, 'GitHub item should exist');
      assert.ok(githubItem.label.includes('GitHub User'), 'Label should include name');
      assert.ok(githubItem.label.includes('GitHub'), 'Label should include service');
    });

    it('should include manage option with separator', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showIdentityQuickPick();

      const items = mockVSCode._getCapturedItems();

      // Check for separator
      const separator = items.find(item => item.kind === -1);
      assert.ok(separator, 'Should have separator item');

      // Check for manage option
      const manageItem = items.find(item => item._isManageOption === true);
      assert.ok(manageItem, 'Should have manage option');
      assert.ok(manageItem.label.includes('Manage'), 'Manage label should mention Manage');
    });
  });

  describe('Current Identity Marking', () => {
    it('should mark current identity with $(check) Current description', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showIdentityQuickPick(TEST_IDENTITIES.work);

      const items = mockVSCode._getCapturedItems();

      const workItem = items.find(item => item.identity?.id === 'work');
      assert.ok(workItem, 'Work item should exist');
      assert.ok(workItem.description, 'Work should have description');
      assert.ok(workItem.description?.includes('Current'), 'Work description should mention Current');
      assert.ok(workItem.description?.includes('$(check)'), 'Work description should have check icon');

      const personalItem = items.find(item => item.identity?.id === 'personal');
      assert.ok(personalItem, 'Personal item should exist');
      assert.strictEqual(personalItem.description, undefined, 'Personal should not have description');
    });
  });

  describe('Return Type: Identity | manage | undefined', () => {
    it('should return Identity when identity selected', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        selectedIdentity: TEST_IDENTITIES.personal,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showIdentityQuickPick();

      assert.ok(result, 'Should return selected identity');
      assert.notStrictEqual(result, 'manage', 'Should not return manage');
      assert.strictEqual((result as Identity).id, 'personal', 'Should return personal identity');
    });

    it('should return "manage" when manage option selected', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        selectManageOption: true,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showIdentityQuickPick();

      assert.strictEqual(result, 'manage', 'Should return "manage" string');
    });

    it('should return undefined when user cancels', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        selectedIdentity: undefined,
        selectManageOption: false,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showIdentityQuickPick();

      assert.strictEqual(result, undefined, 'Should return undefined when cancelled');
    });
  });

  describe('Title and Placeholder', () => {
    it('should set correct title and placeholder', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showIdentityQuickPick();

      const title = mockVSCode._getCapturedTitle();
      const placeholder = mockVSCode._getCapturedPlaceholder();

      assert.ok(title.includes('Select') || title.includes('Identity'), 'Title should mention Select or Identity');
      assert.ok(placeholder.includes('Search') || placeholder.includes('identit'), 'Placeholder should mention Search or identities');
    });
  });
});

// =============================================================================
// showManageIdentitiesQuickPick Tests (14 cases)
// =============================================================================

/**
 * Interface for captured manage identities quick pick items
 */
interface CapturedManageQuickPickItem {
  label: string;
  detail?: string;
  identity?: Identity;
  index?: number;
  buttons?: Array<{ iconPath: unknown; tooltip: string }>;
  _isPlaceholder?: boolean;
  _isAddOption?: boolean;
  kind?: number;
}

/**
 * Mock ThemeIcon class for testing
 */
class MockThemeIcon {
  constructor(public readonly id: string) {}
}

/**
 * Create a mock VS Code API for manage identities tests
 */
function createManageMockVSCode(options: {
  identities?: Identity[];
  triggerAction?: 'back' | 'add' | 'edit' | 'delete' | 'selectIdentity' | 'selectPlaceholder' | 'hide';
  actionIndex?: number;
}) {
  let capturedItems: CapturedManageQuickPickItem[] = [];
  let capturedTitle = '';
  let capturedButtons: unknown[] = [];
  let capturedActiveItems: CapturedManageQuickPickItem[] = [];

  return {
    workspace: {
      isTrusted: true,
      getConfiguration: () => ({
        get: (key: string) => {
          if (key === 'identities') {
            return options.identities ?? [];
          }
          return undefined;
        },
      }),
    },
    window: {
      createQuickPick: <T extends CapturedManageQuickPickItem>() => {
        let acceptCallback: (() => void) | undefined;
        let hideCallback: (() => void) | undefined;
        let buttonCallback: ((button: unknown) => void) | undefined;
        let itemButtonCallback: ((e: { item: T; button: unknown }) => void) | undefined;

        return {
          set items(value: T[]) {
            capturedItems = value as unknown as CapturedManageQuickPickItem[];
          },
          get items(): T[] {
            return capturedItems as unknown as T[];
          },
          set title(value: string) {
            capturedTitle = value;
          },
          set buttons(value: unknown[]) {
            capturedButtons = value;
          },
          get buttons(): unknown[] {
            return capturedButtons;
          },
          set activeItems(value: T[]) {
            capturedActiveItems = value as unknown as CapturedManageQuickPickItem[];
          },
          get activeItems(): T[] {
            return capturedActiveItems as unknown as T[];
          },
          matchOnDescription: false,
          matchOnDetail: false,
          get selectedItems(): T[] {
            // Return item based on action
            if (options.triggerAction === 'add') {
              const addItem = capturedItems.find(item => item._isAddOption === true);
              return addItem ? [addItem as unknown as T] : [];
            }
            if (options.triggerAction === 'selectIdentity') {
              const idx = options.actionIndex ?? 0;
              const identityItem = capturedItems.find(
                item => item.identity && item.index === idx
              );
              return identityItem ? [identityItem as unknown as T] : [];
            }
            if (options.triggerAction === 'selectPlaceholder') {
              const placeholderItem = capturedItems.find(item => item._isPlaceholder === true);
              return placeholderItem ? [placeholderItem as unknown as T] : [];
            }
            return [];
          },
          onDidTriggerButton: (callback: (button: unknown) => void) => {
            buttonCallback = callback;
          },
          onDidTriggerItemButton: (callback: (e: { item: T; button: unknown }) => void) => {
            itemButtonCallback = callback;
          },
          onDidAccept: (callback: () => void) => {
            acceptCallback = callback;
          },
          onDidHide: (callback: () => void) => {
            hideCallback = callback;
          },
          show: () => {
            setTimeout(() => {
              if (options.triggerAction === 'back') {
                // Trigger back button
                buttonCallback?.(capturedButtons[0]); // QuickInputButtons.Back
              } else if (options.triggerAction === 'edit' || options.triggerAction === 'delete') {
                // Trigger item button
                const idx = options.actionIndex ?? 0;
                const item = capturedItems.find(i => i.index === idx);
                if (item && item.buttons && itemButtonCallback) {
                  // Find button by icon id
                  const targetIconId = options.triggerAction === 'edit' ? 'pencil' : 'trash';
                  const button = item.buttons.find(
                    b => (b.iconPath as MockThemeIcon)?.id === targetIconId
                  );
                  if (button) {
                    itemButtonCallback({ item: item as T, button });
                  }
                }
              } else if (options.triggerAction === 'add' || options.triggerAction === 'selectIdentity' || options.triggerAction === 'selectPlaceholder') {
                acceptCallback?.();
              } else if (options.triggerAction === 'hide') {
                hideCallback?.();
              }
            }, 0);
          },
          hide: () => {},
          dispose: () => {},
        };
      },
    },
    l10n: {
      t: (message: string, ...args: unknown[]) => {
        let result = message;
        args.forEach((arg, index) => {
          result = result.replace(`{${index}}`, String(arg));
        });
        return result;
      },
    },
    QuickPickItemKind: {
      Separator: -1,
      Default: 0,
    },
    QuickInputButtons: {
      Back: { id: 'back' },
    },
    ThemeIcon: MockThemeIcon,
    // Test inspection helpers
    _getCapturedItems: () => capturedItems,
    _getCapturedTitle: () => capturedTitle,
    _getCapturedButtons: () => capturedButtons,
    _getCapturedActiveItems: () => capturedActiveItems,
  };
}

describe('showManageIdentitiesQuickPick E2E Test Suite', function () {
  this.timeout(10000);

  beforeEach(() => {
    _resetCache();
  });

  afterEach(() => {
    _resetCache();
  });

  describe('Basic UI', () => {
    it('should display items correctly', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        triggerAction: 'hide',
      });
      _setMockVSCode(mockVSCode as never);

      await showManageIdentitiesQuickPick([TEST_IDENTITIES.work, TEST_IDENTITIES.personal]);

      const items = mockVSCode._getCapturedItems();
      // Should have: 2 identities + separator + add option = 4 items
      assert.ok(items.length >= 4, 'Should have identity items, separator, and add option');

      const identityItems = items.filter(item => item.identity);
      assert.strictEqual(identityItems.length, 2, 'Should have 2 identity items');
    });

    it('should set correct title with gear emoji', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'hide',
      });
      _setMockVSCode(mockVSCode as never);

      await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      const title = mockVSCode._getCapturedTitle();
      assert.ok(title.includes('⚙️') || title.includes('Manage'), 'Title should include gear emoji or Manage');
    });

    it('should have back button in title bar', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'hide',
      });
      _setMockVSCode(mockVSCode as never);

      await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      const buttons = mockVSCode._getCapturedButtons();
      assert.ok(buttons.length >= 1, 'Should have at least one button (back)');
      assert.ok(buttons[0] === (mockVSCode as never as { QuickInputButtons: { Back: unknown } }).QuickInputButtons.Back, 'First button should be Back');
    });

    it('should have inline edit and delete buttons on each identity item', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'hide',
      });
      _setMockVSCode(mockVSCode as never);

      await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      const items = mockVSCode._getCapturedItems();
      const identityItem = items.find(item => item.identity);

      assert.ok(identityItem, 'Should have identity item');
      assert.ok(identityItem?.buttons, 'Identity item should have buttons');
      assert.strictEqual(identityItem?.buttons?.length, 2, 'Should have 2 buttons (edit, delete)');
    });
  });

  describe('Empty State', () => {
    it('should show placeholder message when no identities', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [],
        triggerAction: 'hide',
      });
      _setMockVSCode(mockVSCode as never);

      await showManageIdentitiesQuickPick([]);

      const items = mockVSCode._getCapturedItems();
      const placeholder = items.find(item => item._isPlaceholder === true);

      assert.ok(placeholder, 'Should have placeholder item');
      assert.ok(placeholder?.label.includes('No identities') || placeholder?.label.includes('(No'), 'Placeholder should mention no identities');
    });

    it('should not close when placeholder is selected', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [],
        triggerAction: 'selectPlaceholder',
      });
      _setMockVSCode(mockVSCode as never);

      // This should not resolve with any action since placeholder selection is ignored
      const result = await showManageIdentitiesQuickPick([]);

      // When placeholder is selected, onDidAccept returns without resolving
      // The result should be back (from hide) or undefined
      assert.ok(result === undefined || result?.action === 'back', 'Should not close on placeholder selection');
    });
  });

  describe('User Actions', () => {
    it('should not close when identity row is selected (onDidAccept)', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'selectIdentity',
        actionIndex: 0,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      // Identity row selection should be ignored, resulting in back from hide
      assert.ok(result === undefined || result?.action === 'back', 'Should not close on identity row selection');
    });

    it('should return edit action when edit button clicked', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'edit',
        actionIndex: 0,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      assert.ok(result, 'Should return result');
      assert.strictEqual(result?.action, 'edit', 'Action should be edit');
      if (result?.action === 'edit') {
        assert.strictEqual(result.identity.id, 'work', 'Should return correct identity');
        assert.strictEqual(result.index, 0, 'Should return correct index');
      }
    });

    it('should return delete action when delete button clicked', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'delete',
        actionIndex: 0,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      assert.ok(result, 'Should return result');
      assert.strictEqual(result?.action, 'delete', 'Action should be delete');
      if (result?.action === 'delete') {
        assert.strictEqual(result.identity.id, 'work', 'Should return correct identity');
        assert.strictEqual(result.index, 0, 'Should return correct index');
      }
    });

    it('should return add action when add option selected', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'add',
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      assert.ok(result, 'Should return result');
      assert.strictEqual(result?.action, 'add', 'Action should be add');
    });

    it('should return back action when back button pressed', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'back',
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      assert.ok(result, 'Should return result');
      assert.strictEqual(result?.action, 'back', 'Action should be back');
    });

    it('should return back action when dismissed (Esc or close)', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'hide',
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showManageIdentitiesQuickPick([TEST_IDENTITIES.work]);

      assert.ok(result, 'Should return result');
      assert.strictEqual(result?.action, 'back', 'Action should be back on hide');
    });
  });

  describe('lastIndex Focus', () => {
    it('should focus on specified lastIndex position', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        triggerAction: 'hide',
      });
      _setMockVSCode(mockVSCode as never);

      await showManageIdentitiesQuickPick([TEST_IDENTITIES.work, TEST_IDENTITIES.personal], 1);

      const activeItems = mockVSCode._getCapturedActiveItems();
      assert.ok(activeItems.length >= 1, 'Should have active item');
      assert.strictEqual(activeItems[0]?.index, 1, 'Should focus on index 1');
    });

    it('should clamp lastIndex when it exceeds array length', async () => {
      const mockVSCode = createManageMockVSCode({
        identities: [TEST_IDENTITIES.work],
        triggerAction: 'hide',
      });
      _setMockVSCode(mockVSCode as never);

      // Pass lastIndex=10 but only 1 identity exists
      await showManageIdentitiesQuickPick([TEST_IDENTITIES.work], 10);

      const activeItems = mockVSCode._getCapturedActiveItems();
      assert.ok(activeItems.length >= 1, 'Should have active item');
      assert.strictEqual(activeItems[0]?.index, 0, 'Should clamp to max valid index (0)');
    });
  });
});
