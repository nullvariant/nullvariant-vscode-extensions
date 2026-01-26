/**
 * E2E Tests for showIdentityQuickPick
 *
 * Tests for identity picker UI functionality including:
 * - showIdentityQuickPick() item generation
 * - Current identity marking
 * - Manage option handling
 * - Empty state handling
 * - Return type: Identity | 'manage' | undefined
 *
 * Test Categories:
 * - Empty State: Warning when no identities configured
 * - Item Generation: QuickPickItem label, description, detail
 * - Current Identity: $(check) mark for active identity
 * - Manage Option: Separator and manage menu item
 * - User Interaction: Selection, manage option, and cancellation
 *
 * Test Count: 9 tests covering showIdentityQuickPick() functionality
 *
 * Note: These tests use mocked VS Code API via vscodeLoader since quick pick
 * interactions require VS Code window API.
 */

import * as assert from 'node:assert';
import { showIdentityQuickPick } from '../../ui/identityPicker';
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
