/**
 * E2E Tests for Command Handlers
 *
 * Tests for handleDeleteIdentity() command handler functionality including:
 * - Delete flow with confirmation
 * - Current identity handling
 * - Error handling
 *
 * Test Categories:
 * - No Identities: Warning message when no identities configured
 * - Cancel Flows: User cancels quick pick or confirmation dialog
 * - Success Flow: Delete identity and show notification
 * - Current Identity: Special handling for currently active identity
 * - Error Handling: Show error notification on failure
 *
 * Test Count: 8 tests covering handleDeleteIdentity() functionality
 *
 * Note: These tests use mocked VS Code API via vscodeLoader since
 * command handlers require VS Code window and workspace interactions.
 */

import * as assert from 'node:assert';
import { handleDeleteIdentity } from '../../commands/handlers';
import { _setMockVSCode, _resetCache } from '../../core/vscodeLoader';
import type { IdentityStatusBar } from '../../ui/identityStatusBar';

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
};

/**
 * Create a mock VS Code API for handler tests
 */
function createMockVSCode(options: {
  isTrusted?: boolean;
  identities?: typeof TEST_IDENTITIES.work[];
  showQuickPickResult?: typeof TEST_IDENTITIES.work | undefined;
  showWarningMessageResult?: string | undefined;
  configUpdateError?: Error;
}) {
  const showWarningMessageCalls: { message: string; options?: object }[] = [];
  const showInformationMessageCalls: string[] = [];
  const showErrorMessageCalls: string[] = [];
  const configUpdateCalls: { key: string; value: unknown }[] = [];

  return {
    workspace: {
      isTrusted: options.isTrusted ?? true,
      getConfiguration: () => ({
        get: (key: string) => {
          if (key === 'identities') {
            return options.identities ?? [];
          }
          return undefined;
        },
        update: async (key: string, value: unknown) => {
          if (options.configUpdateError) {
            throw options.configUpdateError;
          }
          configUpdateCalls.push({ key, value });
        },
      }),
      onDidGrantWorkspaceTrust: () => ({ dispose: () => {} }),
    },
    window: {
      showWarningMessage: async (message: string, ...args: unknown[]) => {
        showWarningMessageCalls.push({ message, options: args[0] as object });
        return options.showWarningMessageResult;
      },
      showInformationMessage: async (message: string) => {
        showInformationMessageCalls.push(message);
        return undefined;
      },
      showErrorMessage: async (message: string) => {
        showErrorMessageCalls.push(message);
        return undefined;
      },
      createQuickPick: () => {
        let acceptCallback: (() => void) | undefined;
        let hideCallback: (() => void) | undefined;

        return {
          items: [],
          title: '',
          placeholder: '',
          matchOnDescription: false,
          matchOnDetail: false,
          selectedItems: options.showQuickPickResult ? [{ identity: options.showQuickPickResult }] : [],
          onDidAccept: (callback: () => void) => {
            acceptCallback = callback;
          },
          onDidHide: (callback: () => void) => {
            hideCallback = callback;
          },
          show: () => {
            // Simulate user selection
            if (options.showQuickPickResult !== undefined) {
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
        // Simple template replacement
        let result = message;
        args.forEach((arg, index) => {
          result = result.replace(`{${index}}`, String(arg));
        });
        return result;
      },
    },
    ConfigurationTarget: {
      Global: 1,
      Workspace: 2,
      WorkspaceFolder: 3,
    },
    // Test inspection helpers
    _getShowWarningMessageCalls: () => showWarningMessageCalls,
    _getShowInformationMessageCalls: () => showInformationMessageCalls,
    _getShowErrorMessageCalls: () => showErrorMessageCalls,
    _getConfigUpdateCalls: () => configUpdateCalls,
  };
}

/**
 * Create a mock ExtensionContext
 */
function createMockContext(currentIdentityId?: string) {
  const workspaceState = new Map<string, unknown>();
  if (currentIdentityId) {
    workspaceState.set('currentIdentityId', currentIdentityId);
  }

  return {
    subscriptions: [],
    globalStorageUri: { fsPath: '/mock/global/storage' },
    workspaceState: {
      get: <T>(key: string): T | undefined => workspaceState.get(key) as T | undefined,
      update: async (key: string, value: unknown) => {
        if (value === undefined) {
          workspaceState.delete(key);
        } else {
          workspaceState.set(key, value);
        }
      },
    },
    globalState: {
      get: () => undefined,
      update: () => Promise.resolve(),
    },
    _getWorkspaceState: () => workspaceState,
  } as unknown as import('vscode').ExtensionContext & { _getWorkspaceState: () => Map<string, unknown> };
}

/**
 * Create a mock IdentityStatusBar
 */
function createMockStatusBar() {
  let noIdentityCalled = false;

  return {
    setNoIdentity: () => {
      noIdentityCalled = true;
    },
    setIdentity: () => {},
    setLoading: () => {},
    setError: () => {},
    getCurrentIdentity: () => undefined,
    dispose: () => {},
    _wasNoIdentityCalled: () => noIdentityCalled,
  } as unknown as IdentityStatusBar & { _wasNoIdentityCalled: () => boolean };
}

describe('handleDeleteIdentity E2E Test Suite', function () {
  // Set suite-level timeout for all tests
  this.timeout(10000);

  beforeEach(() => {
    _resetCache();
  });

  afterEach(() => {
    _resetCache();
  });

  describe('No Identities', () => {
    it('should show warning when no identities configured', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
      });
      _setMockVSCode(mockVSCode as never);

      const context = createMockContext();
      const statusBar = createMockStatusBar();

      await handleDeleteIdentity(context, statusBar);

      const warningCalls = mockVSCode._getShowWarningMessageCalls();
      assert.strictEqual(warningCalls.length, 1, 'Should show one warning message');
      assert.ok(
        warningCalls[0].message.includes('No identities configured'),
        'Warning should mention no identities'
      );
    });
  });

  describe('Cancel Flows', () => {
    it('should do nothing when user cancels quick pick', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showQuickPickResult: undefined, // User cancels
      });
      _setMockVSCode(mockVSCode as never);

      const context = createMockContext();
      const statusBar = createMockStatusBar();

      await handleDeleteIdentity(context, statusBar);

      const warningCalls = mockVSCode._getShowWarningMessageCalls();
      assert.strictEqual(warningCalls.length, 0, 'Should not show confirmation dialog');
      const configUpdates = mockVSCode._getConfigUpdateCalls();
      assert.strictEqual(configUpdates.length, 0, 'Should not update config');
    });

    it('should do nothing when user cancels confirmation dialog', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showQuickPickResult: TEST_IDENTITIES.work,
        showWarningMessageResult: undefined, // User cancels confirmation
      });
      _setMockVSCode(mockVSCode as never);

      const context = createMockContext();
      const statusBar = createMockStatusBar();

      await handleDeleteIdentity(context, statusBar);

      const warningCalls = mockVSCode._getShowWarningMessageCalls();
      assert.strictEqual(warningCalls.length, 1, 'Should show confirmation dialog');
      const configUpdates = mockVSCode._getConfigUpdateCalls();
      assert.strictEqual(configUpdates.length, 0, 'Should not update config when cancelled');
    });
  });

  describe('Success Flow', () => {
    it('should delete identity when user confirms', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        showQuickPickResult: TEST_IDENTITIES.work,
        showWarningMessageResult: 'Delete',
      });
      _setMockVSCode(mockVSCode as never);

      const context = createMockContext();
      const statusBar = createMockStatusBar();

      await handleDeleteIdentity(context, statusBar);

      const configUpdates = mockVSCode._getConfigUpdateCalls();
      assert.strictEqual(configUpdates.length, 1, 'Should update config');
      assert.strictEqual(configUpdates[0].key, 'identities', 'Should update identities');

      const infoCalls = mockVSCode._getShowInformationMessageCalls();
      assert.strictEqual(infoCalls.length, 1, 'Should show success notification');
      assert.ok(
        infoCalls[0].includes('has been deleted'),
        'Success message should confirm deletion'
      );
    });

    it('should not update status bar when deleting non-current identity', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        showQuickPickResult: TEST_IDENTITIES.work,
        showWarningMessageResult: 'Delete',
      });
      _setMockVSCode(mockVSCode as never);

      // Set personal as current (not work which we're deleting)
      const context = createMockContext('personal');
      const statusBar = createMockStatusBar();

      await handleDeleteIdentity(context, statusBar);

      assert.strictEqual(
        statusBar._wasNoIdentityCalled(),
        false,
        'setNoIdentity should not be called for non-current identity'
      );
    });
  });

  describe('Current Identity Handling', () => {
    it('should clear workspace state when deleting current identity', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showQuickPickResult: TEST_IDENTITIES.work,
        showWarningMessageResult: 'Delete',
      });
      _setMockVSCode(mockVSCode as never);

      const context = createMockContext('work');
      const statusBar = createMockStatusBar();

      await handleDeleteIdentity(context, statusBar);

      const workspaceState = context._getWorkspaceState();
      assert.strictEqual(
        workspaceState.has('currentIdentityId'),
        false,
        'currentIdentityId should be cleared'
      );

      assert.strictEqual(
        statusBar._wasNoIdentityCalled(),
        true,
        'setNoIdentity should be called'
      );
    });

    it('should show different confirmation message for current identity', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showQuickPickResult: TEST_IDENTITIES.work,
        showWarningMessageResult: undefined,
      });
      _setMockVSCode(mockVSCode as never);

      const context = createMockContext('work');
      const statusBar = createMockStatusBar();

      await handleDeleteIdentity(context, statusBar);

      const warningCalls = mockVSCode._getShowWarningMessageCalls();
      assert.strictEqual(warningCalls.length, 1, 'Should show confirmation');
      assert.ok(
        warningCalls[0].message.includes('current identity'),
        'Should mention this is current identity'
      );
    });
  });

  describe('Error Handling', () => {
    it('should show error notification when deletion fails', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showQuickPickResult: TEST_IDENTITIES.work,
        showWarningMessageResult: 'Delete',
        configUpdateError: new Error('Permission denied'),
      });
      _setMockVSCode(mockVSCode as never);

      const context = createMockContext();
      const statusBar = createMockStatusBar();

      await handleDeleteIdentity(context, statusBar);

      const errorCalls = mockVSCode._getShowErrorMessageCalls();
      assert.strictEqual(errorCalls.length, 1, 'Should show error notification');
      assert.ok(
        errorCalls[0].includes('Failed to delete'),
        'Error should mention failed deletion'
      );
    });
  });
});
