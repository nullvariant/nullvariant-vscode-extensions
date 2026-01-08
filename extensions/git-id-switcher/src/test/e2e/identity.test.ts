/**
 * E2E Tests for Identity Module
 *
 * These tests verify the identity management functionality using the real VS Code API.
 * Tests cover configuration reading, writing, change detection, type validation, and default values.
 *
 * Test Categories:
 * - Configuration Reading: getConfiguration, identities array access, nested config
 * - Configuration Writing: update() method with various scopes (Global, Workspace)
 * - Change Detection: onDidChangeConfiguration event, affectsConfiguration checks
 * - Type Validation: string, number, boolean, array, object types with boundary checks
 * - Default Values: package.json defaults verification for all settings
 * - Error Handling: invalid values, undefined settings, empty arrays
 * - Configuration Scopes: global vs workspace, inspection properties
 *
 * Test Count: 36 tests covering identity.ts related functionality
 *
 * Note: These tests use the real VS Code API (no mocks) to ensure actual behavior.
 * Each test restores original configuration values after execution.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'nullvariant.git-id-switcher';
const CONFIG_SECTION = 'gitIdSwitcher';

interface TestIdentity {
  id: string;
  name: string;
  email: string;
  icon?: string;
  service?: string;
  description?: string;
  sshKeyPath?: string;
  sshHost?: string;
  gpgKeyId?: string;
}

/**
 * Store original configuration values for restoration
 */
interface OriginalConfig {
  identities: TestIdentity[];
  defaultIdentity: string;
  showNotifications: boolean;
  submoduleDepth: number;
}

describe('Identity E2E Test Suite', function () {
  // Set suite-level timeout for all tests
  this.timeout(10000);

  let originalConfig: OriginalConfig;

  before(async () => {
    vscode.window.showInformationMessage('Starting Identity E2E tests...');
    const extension = vscode.extensions.getExtension(EXTENSION_ID);

    // Ensure extension is activated
    if (extension && !extension.isActive) {
      await extension.activate();
    }

    // Store original configuration for restoration after tests
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    originalConfig = {
      identities: config.get<TestIdentity[]>('identities', []),
      defaultIdentity: config.get<string>('defaultIdentity', ''),
      showNotifications: config.get<boolean>('showNotifications', true),
      submoduleDepth: config.get<number>('submoduleDepth', 1),
    };
  });

  after(async () => {
    // Restore all original configuration values
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    await config.update('identities', originalConfig.identities, vscode.ConfigurationTarget.Global);
    await config.update('defaultIdentity', originalConfig.defaultIdentity, vscode.ConfigurationTarget.Global);
    await config.update('showNotifications', originalConfig.showNotifications, vscode.ConfigurationTarget.Global);
    await config.update('submoduleDepth', originalConfig.submoduleDepth, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage('Identity E2E tests completed.');
  });

  describe('Configuration Reading', () => {
    it('should read identities configuration as an array', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const identities = config.get('identities');

      assert.ok(Array.isArray(identities), 'identities should be an array');
    });

    it('should read identities with correct structure', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const identities = config.get<TestIdentity[]>('identities', []);

      if (identities.length > 0) {
        const identity = identities[0];
        assert.ok(typeof identity.id === 'string', 'identity.id should be a string');
        assert.ok(typeof identity.name === 'string', 'identity.name should be a string');
        assert.ok(typeof identity.email === 'string', 'identity.email should be a string');
      }
    });

    it('should read defaultIdentity configuration', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const defaultIdentity = config.get('defaultIdentity');

      assert.strictEqual(typeof defaultIdentity, 'string', 'defaultIdentity should be a string');
    });

    it('should provide configuration inspection', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect('identities');

      assert.ok(inspection, 'Inspection should return an object');
      assert.ok('defaultValue' in inspection, 'Inspection should have defaultValue');
      assert.ok('key' in inspection, 'Inspection should have key');
    });

    it('should read nested logging configuration', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      const level = config.get('logging.level');
      const fileEnabled = config.get('logging.fileEnabled');
      const maxFileSize = config.get('logging.maxFileSize');

      assert.strictEqual(typeof level, 'string', 'logging.level should be a string');
      assert.strictEqual(typeof fileEnabled, 'boolean', 'logging.fileEnabled should be a boolean');
      assert.strictEqual(typeof maxFileSize, 'number', 'logging.maxFileSize should be a number');
    });
  });

  describe('Configuration Writing', () => {
    it('should update identities configuration with minimal fields', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const testIdentity: TestIdentity = {
        id: 'test-e2e-identity',
        name: 'E2E Test User',
        email: 'e2e-test@example.com',
      };

      // Save current state
      const currentIdentities = config.get<TestIdentity[]>('identities', []);

      // Update with new identity
      const newIdentities = [...currentIdentities, testIdentity];
      await config.update('identities', newIdentities, vscode.ConfigurationTarget.Global);

      // Verify update
      const updatedConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const updatedIdentities = updatedConfig.get<TestIdentity[]>('identities', []);

      assert.ok(
        updatedIdentities.some(i => i.id === 'test-e2e-identity'),
        'New identity should be added'
      );

      // Restore original state
      await config.update('identities', currentIdentities, vscode.ConfigurationTarget.Global);
    });

    it('should update identities configuration with all optional fields', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const fullIdentity: TestIdentity = {
        id: 'test-full-identity',
        name: 'Full Test User',
        email: 'full-test@example.com',
        icon: '🧪',
        service: 'GitHub',
        description: 'Test identity with all fields',
        sshKeyPath: '~/.ssh/test_key',
        sshHost: 'github-test',
        gpgKeyId: 'ABCD1234EFGH5678',
      };

      // Save current state
      const currentIdentities = config.get<TestIdentity[]>('identities', []);

      // Update with full identity
      const newIdentities = [...currentIdentities, fullIdentity];
      await config.update('identities', newIdentities, vscode.ConfigurationTarget.Global);

      // Verify update
      const updatedConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const updatedIdentities = updatedConfig.get<TestIdentity[]>('identities', []);

      const addedIdentity = updatedIdentities.find(i => i.id === 'test-full-identity');
      assert.ok(addedIdentity, 'Full identity should be added');
      assert.strictEqual(addedIdentity?.icon, '🧪', 'icon should be preserved');
      assert.strictEqual(addedIdentity?.service, 'GitHub', 'service should be preserved');
      assert.strictEqual(addedIdentity?.description, 'Test identity with all fields', 'description should be preserved');
      assert.strictEqual(addedIdentity?.sshKeyPath, '~/.ssh/test_key', 'sshKeyPath should be preserved');
      assert.strictEqual(addedIdentity?.sshHost, 'github-test', 'sshHost should be preserved');
      assert.strictEqual(addedIdentity?.gpgKeyId, 'ABCD1234EFGH5678', 'gpgKeyId should be preserved');

      // Restore original state
      await config.update('identities', currentIdentities, vscode.ConfigurationTarget.Global);
    });

    it('should update identities configuration with multiple identities', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const testIdentities: TestIdentity[] = [
        { id: 'test-multi-1', name: 'Test User 1', email: 'test1@example.com' },
        { id: 'test-multi-2', name: 'Test User 2', email: 'test2@example.com' },
        { id: 'test-multi-3', name: 'Test User 3', email: 'test3@example.com' },
      ];

      // Save current state
      const currentIdentities = config.get<TestIdentity[]>('identities', []);

      // Update with multiple identities
      await config.update('identities', testIdentities, vscode.ConfigurationTarget.Global);

      // Verify update
      const updatedConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const updatedIdentities = updatedConfig.get<TestIdentity[]>('identities', []);

      assert.strictEqual(updatedIdentities.length, 3, 'Should have 3 identities');
      assert.ok(updatedIdentities.some(i => i.id === 'test-multi-1'), 'First identity should exist');
      assert.ok(updatedIdentities.some(i => i.id === 'test-multi-2'), 'Second identity should exist');
      assert.ok(updatedIdentities.some(i => i.id === 'test-multi-3'), 'Third identity should exist');

      // Restore original state
      await config.update('identities', currentIdentities, vscode.ConfigurationTarget.Global);
    });

    it('should update defaultIdentity configuration', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      // Save current state
      const currentDefault = config.get<string>('defaultIdentity', '');

      // Update
      const testValue = 'test-default-identity';
      await config.update('defaultIdentity', testValue, vscode.ConfigurationTarget.Global);

      // Verify
      const updatedConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const updatedDefault = updatedConfig.get<string>('defaultIdentity');
      assert.strictEqual(updatedDefault, testValue, 'defaultIdentity should be updated');

      // Restore
      await config.update('defaultIdentity', currentDefault, vscode.ConfigurationTarget.Global);
    });

    it('should update boolean configuration values', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      // Save current state
      const currentValue = config.get<boolean>('showNotifications', true);

      // Toggle value
      const newValue = !currentValue;
      await config.update('showNotifications', newValue, vscode.ConfigurationTarget.Global);

      // Verify
      const updatedConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const updatedValue = updatedConfig.get<boolean>('showNotifications');
      assert.strictEqual(updatedValue, newValue, 'showNotifications should be toggled');

      // Restore
      await config.update('showNotifications', currentValue, vscode.ConfigurationTarget.Global);
    });

    it('should update number configuration values', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      // Save current state
      const currentValue = config.get<number>('submoduleDepth', 1);

      // Update to new value
      const newValue = 3;
      await config.update('submoduleDepth', newValue, vscode.ConfigurationTarget.Global);

      // Verify
      const updatedConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const updatedValue = updatedConfig.get<number>('submoduleDepth');
      assert.strictEqual(updatedValue, newValue, 'submoduleDepth should be updated');

      // Restore
      await config.update('submoduleDepth', currentValue, vscode.ConfigurationTarget.Global);
    });
  });

  describe('Configuration Change Detection', () => {
    it('should detect configuration changes via onDidChangeConfiguration', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      // Save current state
      const currentValue = config.get<boolean>('showNotifications', true);

      // Create a promise that resolves when configuration changes
      const changeDetected = new Promise<boolean>((resolve) => {
        const disposable = vscode.workspace.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(`${CONFIG_SECTION}.showNotifications`)) {
            disposable.dispose();
            resolve(true);
          }
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          disposable.dispose();
          resolve(false);
        }, 5000);
      });

      // Trigger configuration change
      await config.update('showNotifications', !currentValue, vscode.ConfigurationTarget.Global);

      // Wait for change detection
      const detected = await changeDetected;
      assert.strictEqual(detected, true, 'Configuration change should be detected');

      // Restore
      await config.update('showNotifications', currentValue, vscode.ConfigurationTarget.Global);
    });

    it('should correctly identify affected configuration sections', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const currentValue = config.get<string>('defaultIdentity', '');

      let affectsGitIdSwitcher = false;
      let affectsOther = false;

      const changePromise = new Promise<void>((resolve) => {
        const disposable = vscode.workspace.onDidChangeConfiguration((e) => {
          affectsGitIdSwitcher = e.affectsConfiguration(CONFIG_SECTION);
          affectsOther = e.affectsConfiguration('someOtherExtension');
          disposable.dispose();
          resolve();
        });

        // Timeout
        setTimeout(() => {
          disposable.dispose();
          resolve();
        }, 5000);
      });

      // Trigger change
      await config.update('defaultIdentity', 'test-value', vscode.ConfigurationTarget.Global);
      await changePromise;

      assert.strictEqual(affectsGitIdSwitcher, true, 'Should affect gitIdSwitcher configuration');
      assert.strictEqual(affectsOther, false, 'Should not affect other extensions');

      // Restore
      await config.update('defaultIdentity', currentValue, vscode.ConfigurationTarget.Global);
    });
  });

  describe('Type Validation', () => {
    it('should validate string configuration types', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      const stringConfigs = ['defaultIdentity', 'logging.level'];

      for (const key of stringConfigs) {
        const value = config.get(key);
        assert.strictEqual(
          typeof value,
          'string',
          `${key} should be a string, got ${typeof value}`
        );
      }
    });

    it('should validate boolean configuration types', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      const booleanConfigs = [
        'showNotifications',
        'autoSwitchSshKey',
        'applyToSubmodules',
        'includeIconInGitConfig',
        'logging.fileEnabled',
      ];

      for (const key of booleanConfigs) {
        const value = config.get(key);
        assert.strictEqual(
          typeof value,
          'boolean',
          `${key} should be a boolean, got ${typeof value}`
        );
      }
    });

    it('should validate number configuration types', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      const numberConfigs = [
        'submoduleDepth',
        'logging.maxFileSize',
        'logging.maxFiles',
      ];

      for (const key of numberConfigs) {
        const value = config.get(key);
        assert.strictEqual(
          typeof value,
          'number',
          `${key} should be a number, got ${typeof value}`
        );
      }
    });

    it('should validate array configuration types', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      const identities = config.get('identities');
      assert.ok(Array.isArray(identities), 'identities should be an array');
    });

    it('should validate object configuration types', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

      const commandTimeouts = config.get('commandTimeouts');
      assert.ok(
        typeof commandTimeouts === 'object' && commandTimeouts !== null && !Array.isArray(commandTimeouts),
        'commandTimeouts should be an object'
      );
    });

    it('should validate commandTimeouts object properties', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const commandTimeouts = config.get<Record<string, number>>('commandTimeouts');

      assert.ok(commandTimeouts, 'commandTimeouts should exist');

      // Verify expected timeout properties exist and are numbers
      const expectedKeys = ['default', 'gitConfig', 'sshAdd', 'sshKeygen'];
      for (const key of expectedKeys) {
        if (key in commandTimeouts) {
          assert.strictEqual(
            typeof commandTimeouts[key],
            'number',
            `commandTimeouts.${key} should be a number`
          );
          assert.ok(commandTimeouts[key] > 0, `commandTimeouts.${key} should be positive`);
        }
      }
    });

    it('should validate submoduleDepth boundary values', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<number>('submoduleDepth');

      assert.ok(inspection?.defaultValue !== undefined, 'submoduleDepth should have a default value');
      // Default should be within valid range (1-5 according to package.json)
      assert.ok(inspection.defaultValue >= 1, 'default submoduleDepth should be at least 1');
      assert.ok(inspection.defaultValue <= 5, 'default submoduleDepth should be at most 5');

      // Current value should also be within range
      const currentValue = config.get<number>('submoduleDepth', 1);
      assert.ok(currentValue >= 1, 'submoduleDepth should be at least 1');
      assert.ok(currentValue <= 5, 'submoduleDepth should be at most 5');
    });

    it('should validate identity object structure', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const identities = config.get<TestIdentity[]>('identities', []);

      for (let i = 0; i < identities.length; i++) {
        const identity = identities[i];

        // Required fields
        assert.ok(typeof identity.id === 'string', `identities[${i}].id should be a string`);
        assert.ok(typeof identity.name === 'string', `identities[${i}].name should be a string`);
        assert.ok(typeof identity.email === 'string', `identities[${i}].email should be a string`);

        // Optional fields (if present, check type)
        if (identity.icon !== undefined) {
          assert.strictEqual(typeof identity.icon, 'string', `identities[${i}].icon should be a string`);
        }
        if (identity.service !== undefined) {
          assert.strictEqual(typeof identity.service, 'string', `identities[${i}].service should be a string`);
        }
        if (identity.description !== undefined) {
          assert.strictEqual(typeof identity.description, 'string', `identities[${i}].description should be a string`);
        }
        if (identity.sshKeyPath !== undefined) {
          assert.strictEqual(typeof identity.sshKeyPath, 'string', `identities[${i}].sshKeyPath should be a string`);
        }
        if (identity.sshHost !== undefined) {
          assert.strictEqual(typeof identity.sshHost, 'string', `identities[${i}].sshHost should be a string`);
        }
        if (identity.gpgKeyId !== undefined) {
          assert.strictEqual(typeof identity.gpgKeyId, 'string', `identities[${i}].gpgKeyId should be a string`);
        }
      }
    });
  });

  describe('Default Values', () => {
    it('should have default identities array with sample identity', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<TestIdentity[]>('identities');

      assert.ok(inspection?.defaultValue, 'identities should have a default value');
      assert.ok(Array.isArray(inspection?.defaultValue), 'default identities should be an array');
      assert.ok(inspection.defaultValue.length > 0, 'default identities should not be empty');
    });

    it('should have default showNotifications as true', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<boolean>('showNotifications');

      assert.ok(inspection?.defaultValue !== undefined, 'showNotifications should have a default value');
      assert.strictEqual(inspection.defaultValue, true, 'default showNotifications should be true');
    });

    it('should have default autoSwitchSshKey as true', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<boolean>('autoSwitchSshKey');

      assert.ok(inspection?.defaultValue !== undefined, 'autoSwitchSshKey should have a default value');
      assert.strictEqual(inspection.defaultValue, true, 'default autoSwitchSshKey should be true');
    });

    it('should have default submoduleDepth as 1', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<number>('submoduleDepth');

      assert.ok(inspection?.defaultValue !== undefined, 'submoduleDepth should have a default value');
      assert.strictEqual(inspection.defaultValue, 1, 'default submoduleDepth should be 1');
    });

    it('should have default logging.level as INFO', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<string>('logging.level');

      assert.ok(inspection?.defaultValue !== undefined, 'logging.level should have a default value');
      assert.strictEqual(inspection.defaultValue, 'INFO', 'default logging.level should be INFO');
    });

    it('should have default logging.fileEnabled as false', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<boolean>('logging.fileEnabled');

      assert.ok(inspection?.defaultValue !== undefined, 'logging.fileEnabled should have a default value');
      assert.strictEqual(inspection.defaultValue, false, 'default logging.fileEnabled should be false');
    });

    it('should have default applyToSubmodules as true', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<boolean>('applyToSubmodules');

      assert.ok(inspection?.defaultValue !== undefined, 'applyToSubmodules should have a default value');
      assert.strictEqual(inspection.defaultValue, true, 'default applyToSubmodules should be true');
    });

    it('should have default includeIconInGitConfig as false', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect<boolean>('includeIconInGitConfig');

      assert.ok(inspection?.defaultValue !== undefined, 'includeIconInGitConfig should have a default value');
      assert.strictEqual(inspection.defaultValue, false, 'default includeIconInGitConfig should be false');
    });
  });

  describe('Error Handling', () => {
    it('should return undefined for non-existent configuration keys', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const nonExistent = config.get('nonExistentKey');

      assert.strictEqual(nonExistent, undefined, 'Non-existent key should return undefined');
    });

    it('should return default value when key does not exist', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const valueWithDefault = config.get('nonExistentKey', 'defaultValue');

      assert.strictEqual(valueWithDefault, 'defaultValue', 'Should return provided default value');
    });

    it('should handle inspection of non-existent keys', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect('nonExistentKey');

      // Inspection returns an object even for non-existent keys
      assert.ok(inspection !== undefined, 'Inspection should return an object');
      assert.strictEqual(inspection?.defaultValue, undefined, 'Default value should be undefined');
      assert.strictEqual(inspection?.globalValue, undefined, 'Global value should be undefined');
    });

    it('should reset configuration to undefined (remove user setting)', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const originalValue = config.get<string>('defaultIdentity', '');

      // First, set a custom value
      await config.update('defaultIdentity', 'test-to-remove', vscode.ConfigurationTarget.Global);

      // Get fresh configuration to verify update (required for VS Code config API)
      const configAfterSet = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const valueAfterSet = configAfterSet.get<string>('defaultIdentity');
      assert.strictEqual(valueAfterSet, 'test-to-remove', 'Value should be set');

      // Reset to undefined (removes user setting, falls back to default)
      await configAfterSet.update('defaultIdentity', undefined, vscode.ConfigurationTarget.Global);

      // Get fresh configuration again
      const freshConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = freshConfig.inspect<string>('defaultIdentity');

      // Global value should be undefined (removed), but default should still exist
      assert.strictEqual(inspection?.globalValue, undefined, 'Global value should be removed');
      assert.ok(inspection?.defaultValue !== undefined, 'Default value should still exist');

      // Restore original value
      await freshConfig.update('defaultIdentity', originalValue, vscode.ConfigurationTarget.Global);
    });

    it('should handle empty identities array gracefully', async () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const currentIdentities = config.get<TestIdentity[]>('identities', []);

      // Set empty array
      await config.update('identities', [], vscode.ConfigurationTarget.Global);

      // Verify
      const freshConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const emptyIdentities = freshConfig.get<TestIdentity[]>('identities', []);
      assert.ok(Array.isArray(emptyIdentities), 'Should be an array');
      assert.strictEqual(emptyIdentities.length, 0, 'Should be empty');

      // Restore
      await config.update('identities', currentIdentities, vscode.ConfigurationTarget.Global);
    });
  });

  describe('Configuration Scopes', () => {
    it('should distinguish between global and workspace configuration', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect('showNotifications');

      assert.ok(inspection, 'Inspection should return an object');
      // globalValue and workspaceValue may be undefined if not set at those levels
      assert.ok('globalValue' in inspection, 'Should have globalValue property');
      assert.ok('workspaceValue' in inspection, 'Should have workspaceValue property');
      assert.ok('defaultValue' in inspection, 'Should have defaultValue property');
    });

    it('should have correct inspection key', () => {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const inspection = config.inspect('identities');

      assert.ok(inspection, 'Inspection should return an object');
      assert.strictEqual(inspection?.key, 'gitIdSwitcher.identities', 'Key should be fully qualified');
    });
  });
});
