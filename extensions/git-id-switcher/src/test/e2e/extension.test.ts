/**
 * E2E Tests for Git ID Switcher Extension
 *
 * These tests run in an actual VS Code environment using @vscode/test-electron.
 * They verify the extension's activation, command registration, and configuration access.
 *
 * Note: These tests use the real VS Code API (no mocks) to ensure actual behavior.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'nullvariant.git-id-switcher';
const EXTENSION_COMMANDS = [
  'git-id-switcher.selectIdentity',
  'git-id-switcher.showCurrentIdentity',
  'git-id-switcher.showDocumentation',
] as const;

interface ExtensionPackageJson {
  name: string;
  version: string;
  main: string;
  engines?: {
    vscode?: string;
  };
}

describe('Extension E2E Test Suite', function () {
  // Set suite-level timeout for all tests
  this.timeout(10000);

  let extension: vscode.Extension<unknown> | undefined;

  before(async () => {
    vscode.window.showInformationMessage('Starting Git ID Switcher E2E tests...');
    extension = vscode.extensions.getExtension(EXTENSION_ID);
  });

  after(() => {
    vscode.window.showInformationMessage('Git ID Switcher E2E tests completed.');
  });

  describe('Extension Activation', () => {
    it('should be present in VS Code extensions list', () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);
    });

    it('should activate successfully', async () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // Activate and wait
      await extension.activate();
      assert.strictEqual(extension.isActive, true, 'Extension should be active after activation');
    });

    it('should have valid package.json metadata', () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      const packageJson = extension.packageJSON as ExtensionPackageJson;
      assert.ok(packageJson.name, 'Extension should have a name');
      assert.strictEqual(packageJson.name, 'git-id-switcher', 'Extension name should match');
      assert.ok(packageJson.version, 'Extension should have a version');
      assert.ok(packageJson.engines?.vscode, 'Extension should specify VS Code engine');
      assert.ok(packageJson.main, 'Extension should have a main entry point');
    });
  });

  describe('Command Registration', () => {
    it('should register all expected commands', async () => {
      const commands = await vscode.commands.getCommands(true);

      for (const cmd of EXTENSION_COMMANDS) {
        assert.ok(
          commands.includes(cmd),
          `Command "${cmd}" should be registered`
        );
      }
    });
  });

  describe('Configuration', () => {
    it('should provide accessible configuration', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      assert.ok(config, 'Configuration should be accessible');
    });

    it('should have identities as an array', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      const identities = config.get('identities');
      assert.ok(Array.isArray(identities), 'identities should be an array');
    });

    it('should have autoSwitchSshKey as a boolean', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      const autoSwitchSshKey = config.get('autoSwitchSshKey');
      assert.strictEqual(
        typeof autoSwitchSshKey,
        'boolean',
        'autoSwitchSshKey should be a boolean'
      );
    });

    it('should have default configuration values', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');

      // Check various default settings
      const showNotifications = config.get('showNotifications');
      assert.strictEqual(typeof showNotifications, 'boolean', 'showNotifications should be a boolean');

      const applyToSubmodules = config.get('applyToSubmodules');
      assert.strictEqual(typeof applyToSubmodules, 'boolean', 'applyToSubmodules should be a boolean');

      const submoduleDepth = config.get('submoduleDepth');
      assert.strictEqual(typeof submoduleDepth, 'number', 'submoduleDepth should be a number');
    });
  });
});
