/**
 * E2E Tests for StatusBar Module
 *
 * These tests verify the IdentityStatusBar class functionality using the real VS Code API.
 * Tests cover status bar creation, state transitions, and display behavior.
 *
 * Test Categories:
 * - StatusBar Creation: Factory function, initial state
 * - State Transitions: setIdentity, setNoIdentity, setLoading, setError
 * - Identity Display: Default icon, custom icon, truncation
 * - State Sequences: Realistic usage patterns (e.g., Identity → Loading → Identity)
 * - Resource Management: dispose behavior
 *
 * Test Count: 17 tests covering statusBar.ts functionality
 * PRD Requirement: Minimum 8 tests ✓
 *
 * E2E Test Limitations:
 * - StatusBarItem.text and StatusBarItem.tooltip are private properties
 * - Direct text/tooltip verification requires unit tests or test-only getters
 * - This E2E suite verifies:
 *   1. Methods execute without errors (integration with VS Code API)
 *   2. getCurrentIdentity() returns correct state
 *   3. State transitions work correctly in sequence
 *   4. Resource cleanup via dispose()
 *
 * Note: For detailed text/tooltip content verification, consider adding
 * test-only accessor methods to statusBar.ts in a future phase.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { createStatusBar, IdentityStatusBar } from '../../statusBar';
import { Identity } from '../../identity';

const EXTENSION_ID = 'nullvariant.git-id-switcher';

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

  withAllFields: {
    id: 'test-full',
    name: 'Full Test User',
    email: 'full@example.com',
    icon: '💼',
    service: 'GitHub',
    description: 'Work account for GitHub',
    sshKeyPath: '~/.ssh/id_github',
    sshHost: 'github-work',
    gpgKeyId: 'ABCD1234',
  } as Identity,

  longName: {
    id: 'test-long',
    name: 'This Is A Very Long Name That Should Be Truncated In Status Bar',
    email: 'longname@example.com',
    icon: '📝',
  } as Identity,

  noIcon: {
    id: 'test-no-icon',
    name: 'No Icon User',
    email: 'noicon@example.com',
  } as Identity,
};

describe('StatusBar E2E Test Suite', function () {
  // Set suite-level timeout for all tests
  this.timeout(10000);

  let statusBar: IdentityStatusBar | undefined;

  before(async () => {
    vscode.window.showInformationMessage('Starting StatusBar E2E tests...');
    const extension = vscode.extensions.getExtension(EXTENSION_ID);

    // Ensure extension is activated
    if (extension && !extension.isActive) {
      await extension.activate();
    }
  });

  afterEach(() => {
    // Clean up status bar after each test
    if (statusBar) {
      statusBar.dispose();
      statusBar = undefined;
    }
  });

  after(() => {
    vscode.window.showInformationMessage('StatusBar E2E tests completed.');
  });

  describe('StatusBar Creation', () => {
    it('should create status bar using factory function', () => {
      statusBar = createStatusBar();

      assert.ok(statusBar, 'createStatusBar should return an IdentityStatusBar instance');
      assert.ok(
        statusBar instanceof IdentityStatusBar,
        'Instance should be of type IdentityStatusBar'
      );
    });

    it('should initialize with no identity selected (initial state)', () => {
      statusBar = createStatusBar();

      // Initial state should have no identity
      const currentIdentity = statusBar.getCurrentIdentity();
      assert.strictEqual(
        currentIdentity,
        undefined,
        'Initial state should have no identity (undefined)'
      );
    });
  });

  describe('State Transitions: setIdentity', () => {
    it('should set identity and update current identity state', () => {
      statusBar = createStatusBar();

      // Set identity
      statusBar.setIdentity(TEST_IDENTITIES.basic);

      // Verify state change
      const currentIdentity = statusBar.getCurrentIdentity();
      assert.ok(currentIdentity, 'Current identity should be set');
      assert.strictEqual(currentIdentity.id, TEST_IDENTITIES.basic.id, 'Identity ID should match');
      assert.strictEqual(currentIdentity.name, TEST_IDENTITIES.basic.name, 'Identity name should match');
      assert.strictEqual(currentIdentity.email, TEST_IDENTITIES.basic.email, 'Identity email should match');
    });

    it('should handle identity with custom icon', () => {
      statusBar = createStatusBar();

      // Set identity with custom icon
      statusBar.setIdentity(TEST_IDENTITIES.withIcon);

      const currentIdentity = statusBar.getCurrentIdentity();
      assert.ok(currentIdentity, 'Current identity should be set');
      assert.strictEqual(currentIdentity.icon, '🚀', 'Custom icon should be preserved');
    });

    it('should handle identity without icon (uses default)', () => {
      statusBar = createStatusBar();

      // Set identity without icon
      statusBar.setIdentity(TEST_IDENTITIES.noIcon);

      const currentIdentity = statusBar.getCurrentIdentity();
      assert.ok(currentIdentity, 'Current identity should be set');
      assert.strictEqual(currentIdentity.icon, undefined, 'Icon should be undefined for identity without icon');
    });

    it('should handle identity with all optional fields', () => {
      statusBar = createStatusBar();

      // Set identity with all fields
      statusBar.setIdentity(TEST_IDENTITIES.withAllFields);

      const currentIdentity = statusBar.getCurrentIdentity();
      assert.ok(currentIdentity, 'Current identity should be set');
      assert.strictEqual(currentIdentity.service, 'GitHub', 'Service should be preserved');
      assert.strictEqual(currentIdentity.description, 'Work account for GitHub', 'Description should be preserved');
      assert.strictEqual(currentIdentity.sshKeyPath, '~/.ssh/id_github', 'SSH key path should be preserved');
      assert.strictEqual(currentIdentity.sshHost, 'github-work', 'SSH host should be preserved');
      assert.strictEqual(currentIdentity.gpgKeyId, 'ABCD1234', 'GPG key ID should be preserved');
    });

    it('should handle identity with long name (truncation scenario)', () => {
      statusBar = createStatusBar();

      // Set identity with long name - should not throw
      assert.doesNotThrow(() => {
        statusBar!.setIdentity(TEST_IDENTITIES.longName);
      }, 'Setting identity with long name should not throw');

      const currentIdentity = statusBar.getCurrentIdentity();
      assert.ok(currentIdentity, 'Current identity should be set');
      assert.strictEqual(
        currentIdentity.name,
        TEST_IDENTITIES.longName.name,
        'Original name should be preserved in identity object'
      );
    });
  });

  describe('State Transitions: setNoIdentity', () => {
    it('should clear current identity when setNoIdentity is called', () => {
      statusBar = createStatusBar();

      // First set an identity
      statusBar.setIdentity(TEST_IDENTITIES.basic);
      assert.ok(statusBar.getCurrentIdentity(), 'Identity should be set');

      // Then clear it
      statusBar.setNoIdentity();

      const currentIdentity = statusBar.getCurrentIdentity();
      assert.strictEqual(
        currentIdentity,
        undefined,
        'Current identity should be undefined after setNoIdentity'
      );
    });
  });

  describe('State Transitions: setLoading', () => {
    it('should execute setLoading without error', () => {
      statusBar = createStatusBar();

      // setLoading should not throw
      assert.doesNotThrow(() => {
        statusBar!.setLoading();
      }, 'setLoading should not throw');
    });

    it('should preserve currentIdentity during loading state', () => {
      statusBar = createStatusBar();

      // Set an identity first
      statusBar.setIdentity(TEST_IDENTITIES.basic);
      const identityBeforeLoading = statusBar.getCurrentIdentity();

      // Enter loading state
      statusBar.setLoading();

      // currentIdentity should be preserved (only visual state changes)
      const identityDuringLoading = statusBar.getCurrentIdentity();
      assert.deepStrictEqual(
        identityDuringLoading,
        identityBeforeLoading,
        'currentIdentity should be preserved during loading'
      );
    });
  });

  describe('State Transitions: setError', () => {
    it('should execute setError without error', () => {
      statusBar = createStatusBar();

      // setError should not throw
      assert.doesNotThrow(() => {
        statusBar!.setError('Test error message');
      }, 'setError should not throw');
    });

    it('should handle empty error message', () => {
      statusBar = createStatusBar();

      assert.doesNotThrow(() => {
        statusBar!.setError('');
      }, 'setError with empty message should not throw');
    });

    it('should handle special characters in error message', () => {
      statusBar = createStatusBar();

      assert.doesNotThrow(() => {
        statusBar!.setError('Error: <script>alert("xss")</script> & special chars 日本語');
      }, 'setError with special characters should not throw');
    });
  });

  describe('State Sequences', () => {
    it('should handle typical switch flow: NoIdentity → Identity → Loading → Identity', () => {
      statusBar = createStatusBar();

      // Step 1: Initial state (NoIdentity)
      assert.strictEqual(statusBar.getCurrentIdentity(), undefined, 'Should start with no identity');

      // Step 2: User selects an identity
      statusBar.setIdentity(TEST_IDENTITIES.basic);
      assert.strictEqual(statusBar.getCurrentIdentity()?.id, 'test-basic', 'Should have basic identity');

      // Step 3: User triggers another switch (loading state)
      statusBar.setLoading();
      // Note: setLoading doesn't clear currentIdentity (preserves last known state)

      // Step 4: New identity is set
      statusBar.setIdentity(TEST_IDENTITIES.withIcon);
      assert.strictEqual(statusBar.getCurrentIdentity()?.id, 'test-icon', 'Should have new identity');
    });

    it('should handle switching between multiple identities', () => {
      statusBar = createStatusBar();

      // Switch through multiple identities
      statusBar.setIdentity(TEST_IDENTITIES.basic);
      assert.strictEqual(statusBar.getCurrentIdentity()?.id, 'test-basic');

      statusBar.setIdentity(TEST_IDENTITIES.withIcon);
      assert.strictEqual(statusBar.getCurrentIdentity()?.id, 'test-icon');

      statusBar.setIdentity(TEST_IDENTITIES.withAllFields);
      assert.strictEqual(statusBar.getCurrentIdentity()?.id, 'test-full');

      // All identity data should be preserved
      const current = statusBar.getCurrentIdentity();
      assert.ok(current, 'Current identity should exist');
      assert.strictEqual(current.name, 'Full Test User');
      assert.strictEqual(current.service, 'GitHub');
    });

    it('should recover from error state to identity state', () => {
      statusBar = createStatusBar();

      // Set an identity
      statusBar.setIdentity(TEST_IDENTITIES.basic);
      assert.strictEqual(statusBar.getCurrentIdentity()?.id, 'test-basic');

      // Enter error state
      statusBar.setError('Something went wrong');

      // Recover by setting a new identity
      statusBar.setIdentity(TEST_IDENTITIES.withIcon);
      assert.strictEqual(
        statusBar.getCurrentIdentity()?.id,
        'test-icon',
        'Should recover from error state'
      );
    });
  });

  describe('Resource Management', () => {
    it('should dispose without error', () => {
      statusBar = createStatusBar();

      // dispose should not throw
      assert.doesNotThrow(() => {
        statusBar!.dispose();
      }, 'dispose should not throw');

      // Mark as disposed so afterEach doesn't double-dispose
      statusBar = undefined;
    });
  });
});
