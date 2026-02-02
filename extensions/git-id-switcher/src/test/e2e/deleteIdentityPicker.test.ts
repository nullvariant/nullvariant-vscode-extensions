/**
 * E2E Tests for showDeleteIdentityQuickPick
 *
 * Tests for identity picker UI functionality including:
 * - showDeleteIdentityQuickPick() item generation
 * - Current identity marking
 * - Empty state handling
 *
 * Test Categories:
 * - Empty State: Warning when no identities configured
 * - Item Generation: QuickPickItem label, description, detail
 * - Current Identity: $(check) mark for active identity
 * - User Interaction: Selection and cancellation
 *
 * Test Count: 9 tests covering showDeleteIdentityQuickPick() functionality
 *
 * Note: These tests use mocked VS Code API via vscodeLoader since quick pick
 * interactions require VS Code window API.
 */

import * as assert from 'node:assert';
import { showDeleteIdentityQuickPick } from '../../ui/identityPicker';
import { _setMockVSCode, _resetCache } from '../../core/vscodeLoader';

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
  identity: typeof TEST_IDENTITIES.work;
  label: string;
  description?: string;
  detail?: string;
}

/**
 * Create a mock VS Code API for identity picker tests
 */
function createMockVSCode(options: {
  identities?: typeof TEST_IDENTITIES.work[];
  selectedIdentity?: typeof TEST_IDENTITIES.work | undefined;
}) {
  let capturedItems: CapturedQuickPickItem[] = [];
  let capturedPlaceholder = '';
  let capturedIgnoreFocusOut = false;
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
      createQuickPick: <T extends { identity: unknown }>() => {
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
          get ignoreFocusOut() { return capturedIgnoreFocusOut; },
          set ignoreFocusOut(value: boolean) { capturedIgnoreFocusOut = value; },
          matchOnDescription: false,
          matchOnDetail: false,
          get selectedItems(): T[] {
            if (options.selectedIdentity) {
              const selected = capturedItems.find(
                item => item.identity.id === options.selectedIdentity?.id
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
            if (options.selectedIdentity !== undefined) {
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
    // Test inspection helpers
    _getCapturedItems: () => capturedItems,
    _getCapturedPlaceholder: () => capturedPlaceholder,
    _getCapturedTitle: () => capturedTitle,
    _getCapturedIgnoreFocusOut: () => capturedIgnoreFocusOut,
    _getShowWarningMessageCalls: () => showWarningMessageCalls,
  };
}

describe('showDeleteIdentityQuickPick E2E Test Suite', function () {
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

      const result = await showDeleteIdentityQuickPick();

      assert.strictEqual(result, undefined, 'Should return undefined');
      const warnings = mockVSCode._getShowWarningMessageCalls();
      assert.strictEqual(warnings.length, 1, 'Should show warning');
      assert.ok(
        warnings[0].includes('No identities configured'),
        'Warning should mention no identities'
      );
    });
  });

  describe('Focus Behavior', () => {
    it('should not set ignoreFocusOut (simple picker dismisses on focus loss)', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showDeleteIdentityQuickPick();

      assert.strictEqual(mockVSCode._getCapturedIgnoreFocusOut(), false, 'Delete identity QuickPick should not set ignoreFocusOut');
    });
  });

  describe('Item Generation', () => {
    it('should create items with correct labels', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showDeleteIdentityQuickPick();

      const items = mockVSCode._getCapturedItems();
      assert.strictEqual(items.length, 2, 'Should create two items');

      const workItem = items.find(item => item.identity.id === 'work');
      assert.ok(workItem, 'Work item should exist');
      assert.strictEqual(workItem.label, 'Work User', 'Work label should be name');

      const personalItem = items.find(item => item.identity.id === 'personal');
      assert.ok(personalItem, 'Personal item should exist');
      assert.ok(personalItem.label.includes('🏠'), 'Personal label should include icon');
      assert.ok(personalItem.label.includes('Personal User'), 'Personal label should include name');
    });

    it('should create items with service in label', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.github],
        selectedIdentity: TEST_IDENTITIES.github,
      });
      _setMockVSCode(mockVSCode as never);

      await showDeleteIdentityQuickPick();

      const items = mockVSCode._getCapturedItems();
      assert.strictEqual(items.length, 1, 'Should create one item');

      const githubItem = items[0];
      assert.ok(githubItem.label.includes('GitHub User'), 'Label should include name');
      assert.ok(githubItem.label.includes('GitHub'), 'Label should include service');
    });

    it('should include email in detail', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showDeleteIdentityQuickPick();

      const items = mockVSCode._getCapturedItems();
      const workItem = items[0];
      assert.ok(workItem.detail, 'Should have detail');
      assert.strictEqual(workItem.detail, 'work@example.com', 'Detail should be email');
    });

    it('should include description and email in detail when description exists', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.github],
        selectedIdentity: TEST_IDENTITIES.github,
      });
      _setMockVSCode(mockVSCode as never);

      await showDeleteIdentityQuickPick();

      const items = mockVSCode._getCapturedItems();
      const githubItem = items[0];
      assert.ok(githubItem.detail, 'Should have detail');
      assert.ok(githubItem.detail?.includes('Open source contributions'), 'Detail should include description');
      assert.ok(githubItem.detail?.includes('github@example.com'), 'Detail should include email');
    });

    it('should set correct title and placeholder', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showDeleteIdentityQuickPick();

      const title = mockVSCode._getCapturedTitle();
      const placeholder = mockVSCode._getCapturedPlaceholder();

      assert.ok(title.includes('Delete'), 'Title should mention Delete');
      assert.ok(placeholder.includes('Select'), 'Placeholder should mention Select');
      assert.ok(placeholder.includes('delete'), 'Placeholder should mention delete');
    });
  });

  describe('Current Identity Marking', () => {
    it('should mark current identity with $(check) Current description', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        selectedIdentity: TEST_IDENTITIES.work,
      });
      _setMockVSCode(mockVSCode as never);

      await showDeleteIdentityQuickPick('work');

      const items = mockVSCode._getCapturedItems();

      const workItem = items.find(item => item.identity.id === 'work');
      assert.ok(workItem, 'Work item should exist');
      assert.ok(workItem.description, 'Work should have description');
      assert.ok(workItem.description?.includes('Current'), 'Work description should mention Current');
      assert.ok(workItem.description?.includes('$(check)'), 'Work description should have check icon');

      const personalItem = items.find(item => item.identity.id === 'personal');
      assert.ok(personalItem, 'Personal item should exist');
      assert.strictEqual(personalItem.description, undefined, 'Personal should not have description');
    });
  });

  describe('User Interaction', () => {
    it('should return undefined when user cancels', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        selectedIdentity: undefined,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showDeleteIdentityQuickPick();

      assert.strictEqual(result, undefined, 'Should return undefined when cancelled');
    });

    it('should return selected identity', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        selectedIdentity: TEST_IDENTITIES.personal,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showDeleteIdentityQuickPick();

      assert.ok(result, 'Should return selected identity');
      assert.strictEqual(result?.id, 'personal', 'Should return personal identity');
    });
  });
});
