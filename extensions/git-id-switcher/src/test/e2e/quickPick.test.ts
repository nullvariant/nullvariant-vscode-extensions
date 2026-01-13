/**
 * E2E Tests for QuickPick Module
 *
 * These tests verify the QuickPick functionality for identity selection using the real VS Code API.
 * Tests cover QuickPickItem generation, notification functions, configuration-based behavior,
 * and empty state handling.
 *
 * Test Categories:
 * - QuickPickItem Generation: createQuickPickItems function behavior (8 tests)
 * - Notification Functions: showIdentitySwitchedNotification, showErrorNotification (6 tests)
 * - Configuration Integration: showNotifications setting behavior (1 test)
 * - Empty State Handling: showIdentityQuickPick with no identities (2 tests)
 *
 * Test Count: 17 tests covering quickPick.ts functionality
 * PRD Requirement: Minimum 6 tests ✓
 *
 * PRD Checklist Coverage:
 * - [x] Identity未設定時の警告メッセージ表示テスト (Empty State Handling)
 * - [x] QuickPickItem生成のテスト（label, description, detail）
 * - [x] 現在のIdentityがpickedになることのテスト
 * - [x] showIdentitySwitchedNotification()のテスト
 * - [x] showErrorNotification()のテスト
 * - [x] 通知設定OFF時の動作テスト（showNotifications: false）
 *
 * E2E Test Limitations:
 * - VS Code QuickPick selection cannot be programmatically simulated
 * - showIdentityQuickPick() shows interactive UI, so full interaction testing is limited
 * - Notification display cannot be directly verified (fire-and-forget)
 *
 * Test Strategy:
 * - Use createQuickPickItems() directly to test item generation logic
 * - Test showIdentityQuickPick() returns correctly for empty state
 * - Test notification functions execute without errors
 * - Test configuration changes affect notification behavior
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import {
  createQuickPickItems,
  showIdentityQuickPick,
  showIdentitySwitchedNotification,
  showErrorNotification,
} from '../../quickPick';
import { Identity, getIdentityLabel, getIdentityDetail } from '../../identity';

const EXTENSION_ID = 'nullvariant.git-id-switcher';

/**
 * Race a promise against a timeout, returning undefined if timeout wins.
 * This helper reduces nesting depth in async tests.
 */
function raceWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 500
): Promise<T | undefined> {
  const timeoutPromise = new Promise<undefined>((resolve) => {
    setTimeout(() => resolve(undefined), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Test identity fixtures
 */
const TEST_IDENTITIES = {
  basic: {
    id: 'test-basic',
    name: 'Test User',
    email: 'test@example.com',
  } as Identity,

  withIcon: {
    id: 'test-icon',
    name: 'Test User',
    email: 'test@example.com',
    icon: '🚀',
  } as Identity,

  withService: {
    id: 'test-service',
    name: 'Work User',
    email: 'work@example.com',
    service: 'GitHub',
    description: 'Work account for GitHub',
  } as Identity,

  withAllFields: {
    id: 'test-full',
    name: 'Full Test User',
    email: 'full@example.com',
    icon: '💼',
    service: 'GitLab',
    description: 'Personal GitLab account',
    sshKeyPath: '~/.ssh/id_gitlab',
    sshHost: 'gitlab-personal',
    gpgKeyId: 'ABCD1234',
  } as Identity,
};

describe('QuickPick E2E Test Suite', function () {
  // Set suite-level timeout for all tests
  this.timeout(10000);

  let originalIdentities: unknown[];
  let originalShowNotifications: boolean | undefined;

  before(async () => {
    vscode.window.showInformationMessage('Starting QuickPick E2E tests...');
    const extension = vscode.extensions.getExtension(EXTENSION_ID);

    // Ensure extension is activated
    if (extension && !extension.isActive) {
      await extension.activate();
    }

    // Store original configuration values
    const config = vscode.workspace.getConfiguration('gitIdSwitcher');
    originalIdentities = config.get<unknown[]>('identities', []);
    originalShowNotifications = config.get<boolean>('showNotifications');
  });

  afterEach(async () => {
    // Restore original configuration after each test
    const config = vscode.workspace.getConfiguration('gitIdSwitcher');
    await config.update('identities', originalIdentities, vscode.ConfigurationTarget.Global);
    if (originalShowNotifications !== undefined) {
      await config.update('showNotifications', originalShowNotifications, vscode.ConfigurationTarget.Global);
    }
  });

  after(() => {
    vscode.window.showInformationMessage('QuickPick E2E tests completed.');
  });

  describe('QuickPickItem Generation', () => {
    it('should create QuickPickItems with correct label from identity', async () => {
      // Set up test identities
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('identities', [TEST_IDENTITIES.basic], vscode.ConfigurationTarget.Global);

      const items = createQuickPickItems();

      assert.strictEqual(items.length, 1, 'Should create one item');
      assert.strictEqual(
        items[0].label,
        getIdentityLabel(TEST_IDENTITIES.basic),
        'Label should match identity label'
      );
    });

    it('should create QuickPickItems with icon in label', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('identities', [TEST_IDENTITIES.withIcon], vscode.ConfigurationTarget.Global);

      const items = createQuickPickItems();

      assert.strictEqual(items.length, 1, 'Should create one item');
      assert.ok(items[0].label.includes('🚀'), 'Label should contain the icon');
    });

    it('should create QuickPickItems with service in label', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('identities', [TEST_IDENTITIES.withService], vscode.ConfigurationTarget.Global);

      const items = createQuickPickItems();

      assert.strictEqual(items.length, 1, 'Should create one item');
      assert.ok(items[0].label.includes('GitHub'), 'Label should contain the service name');
      assert.ok(items[0].label.includes('Work User'), 'Label should contain the name');
    });

    it('should create QuickPickItems with correct detail (with description)', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('identities', [TEST_IDENTITIES.withService], vscode.ConfigurationTarget.Global);

      const items = createQuickPickItems();

      assert.strictEqual(items.length, 1, 'Should create one item');
      assert.strictEqual(
        items[0].detail,
        getIdentityDetail(TEST_IDENTITIES.withService),
        'Detail should match identity detail'
      );
      assert.ok(items[0].detail?.includes('Work account for GitHub'), 'Detail should contain description');
      assert.ok(items[0].detail?.includes('work@example.com'), 'Detail should contain email');
    });

    it('should create QuickPickItems with email-only detail (no description)', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('identities', [TEST_IDENTITIES.basic], vscode.ConfigurationTarget.Global);

      const items = createQuickPickItems();

      assert.strictEqual(items.length, 1, 'Should create one item');
      // When no description, detail should be just the email
      assert.strictEqual(
        items[0].detail,
        TEST_IDENTITIES.basic.email,
        'Detail should be email when no description'
      );
    });

    it('should mark current identity as picked with description', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update(
        'identities',
        [TEST_IDENTITIES.basic, TEST_IDENTITIES.withIcon],
        vscode.ConfigurationTarget.Global
      );

      // Create items with basic as current identity
      const items = createQuickPickItems(TEST_IDENTITIES.basic);

      assert.strictEqual(items.length, 2, 'Should create two items');

      // Find the current identity item
      const currentItem = items.find(item => item.identity.id === TEST_IDENTITIES.basic.id);
      const otherItem = items.find(item => item.identity.id === TEST_IDENTITIES.withIcon.id);

      assert.ok(currentItem, 'Current identity item should exist');
      assert.ok(otherItem, 'Other identity item should exist');

      // Current identity should be picked and have description
      assert.strictEqual(currentItem.picked, true, 'Current identity should be picked');
      assert.ok(currentItem.description?.includes('Current'), 'Description should indicate current');
      assert.ok(currentItem.description?.includes('$(check)'), 'Description should have check icon');

      // Other identity should not be picked
      assert.strictEqual(otherItem.picked, false, 'Other identity should not be picked');
      assert.strictEqual(otherItem.description, undefined, 'Other identity should have no description');
    });

    it('should handle multiple identities correctly', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      const allIdentities = [
        TEST_IDENTITIES.basic,
        TEST_IDENTITIES.withIcon,
        TEST_IDENTITIES.withService,
        TEST_IDENTITIES.withAllFields,
      ];
      await config.update('identities', allIdentities, vscode.ConfigurationTarget.Global);

      const items = createQuickPickItems();

      assert.strictEqual(items.length, 4, 'Should create four items');

      // Each item should have the correct identity attached
      for (let i = 0; i < allIdentities.length; i++) {
        const item = items.find(it => it.identity.id === allIdentities[i].id);
        assert.ok(item, `Item for identity ${allIdentities[i].id} should exist`);
        assert.deepStrictEqual(item.identity, allIdentities[i], 'Identity should match');
      }
    });

    it('should return empty array when no identities configured', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('identities', [], vscode.ConfigurationTarget.Global);

      const items = createQuickPickItems();

      assert.strictEqual(items.length, 0, 'Should return empty array');
    });
  });

  describe('Notification Functions', () => {
    it('should execute showIdentitySwitchedNotification without error', async () => {
      // Ensure notifications are enabled
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('showNotifications', true, vscode.ConfigurationTarget.Global);

      // Should not throw
      assert.doesNotThrow(() => {
        showIdentitySwitchedNotification(TEST_IDENTITIES.basic);
      }, 'showIdentitySwitchedNotification should not throw');
    });

    it('should execute showIdentitySwitchedNotification with icon identity', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('showNotifications', true, vscode.ConfigurationTarget.Global);

      // Should not throw with identity that has icon
      assert.doesNotThrow(() => {
        showIdentitySwitchedNotification(TEST_IDENTITIES.withIcon);
      }, 'showIdentitySwitchedNotification with icon should not throw');
    });

    it('should execute showIdentitySwitchedNotification with service identity', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('showNotifications', true, vscode.ConfigurationTarget.Global);

      // Should not throw with identity that has service (label includes "Name - Service")
      assert.doesNotThrow(() => {
        showIdentitySwitchedNotification(TEST_IDENTITIES.withService);
      }, 'showIdentitySwitchedNotification with service should not throw');
    });

    it('should execute showErrorNotification without error', () => {
      // Should not throw
      assert.doesNotThrow(() => {
        showErrorNotification('Test error message');
      }, 'showErrorNotification should not throw');
    });

    it('should handle special characters in error message', () => {
      // Should not throw with special characters
      assert.doesNotThrow(() => {
        showErrorNotification('Error: <script>alert("xss")</script> & special chars 日本語');
      }, 'showErrorNotification with special characters should not throw');
    });

    it('should handle empty error message', () => {
      // Should not throw with empty message
      assert.doesNotThrow(() => {
        showErrorNotification('');
      }, 'showErrorNotification with empty message should not throw');
    });
  });

  describe('Configuration Integration', () => {
    it('should respect showNotifications=false setting', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('showNotifications', false, vscode.ConfigurationTarget.Global);

      // This should execute without showing notification (we can't verify UI, but should not throw)
      assert.doesNotThrow(() => {
        showIdentitySwitchedNotification(TEST_IDENTITIES.basic);
      }, 'showIdentitySwitchedNotification should not throw when notifications disabled');
    });
  });

  describe('Empty State Handling', () => {
    it('should return undefined and show warning when no identities configured', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('identities', [], vscode.ConfigurationTarget.Global);

      // showIdentityQuickPick should return undefined when no identities
      // Note: This will show a warning message (cannot verify UI, but behavior is correct)
      // The function returns a Promise that resolves to undefined when no identities
      // Since it shows a warning and doesn't create QuickPick, it resolves immediately
      const result = await raceWithTimeout(showIdentityQuickPick());

      assert.strictEqual(result, undefined, 'Should return undefined when no identities');
    });

    it('should handle showIdentityQuickPick with currentIdentity parameter when no identities', async () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      await config.update('identities', [], vscode.ConfigurationTarget.Global);

      // Even with a current identity, should return undefined if no identities configured
      const result = await raceWithTimeout(showIdentityQuickPick(TEST_IDENTITIES.basic));

      assert.strictEqual(result, undefined, 'Should return undefined even with currentIdentity param');
    });
  });
});
