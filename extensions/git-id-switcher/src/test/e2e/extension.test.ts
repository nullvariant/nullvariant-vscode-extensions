/**
 * E2E Tests for Git ID Switcher Extension
 *
 * These tests run in an actual VS Code environment using @vscode/test-electron.
 * They verify the extension's behavior without mocks, ensuring real VS Code API integration.
 *
 * Test Categories:
 * - Extension Activation: Lifecycle, metadata, URI, kind, idempotent activation
 * - Command Registration: All commands are registered correctly
 * - Configuration: All settings are accessible with correct types and default values
 * - Command Execution: Commands execute without errors
 * - Error Handling: Graceful handling of invalid inputs
 * - Extension State: Consistent state after activation
 * - Deactivation Behavior: Commands remain available while active
 *
 * Note: These tests use the real VS Code API (no mocks) to ensure actual behavior.
 */

import * as assert from 'node:assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'nullvariant.git-id-switcher';
const EXTENSION_COMMANDS = [
  'git-id-switcher.selectIdentity',
  'git-id-switcher.showCurrentIdentity',
  'git-id-switcher.showDocumentation',
  'git-id-switcher.deleteIdentity',
] as const;

const VALID_LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'SECURITY'] as const;

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

    it('should have valid extension URI', () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // extensionUri should be a valid VS Code URI
      const uri = extension.extensionUri;
      assert.ok(uri, 'Extension should have an extensionUri');
      assert.ok(uri.scheme, 'Extension URI should have a scheme');
      assert.ok(uri.fsPath, 'Extension URI should have a file system path');
    });

    it('should have correct extension kind', () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // extensionKind indicates where the extension runs (UI, Workspace, or both)
      const kind = extension.extensionKind;
      assert.ok(
        kind === vscode.ExtensionKind.UI ||
        kind === vscode.ExtensionKind.Workspace,
        'Extension kind should be UI or Workspace'
      );
    });

    it('should handle multiple activate calls safely', async () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // Calling activate multiple times should be safe (idempotent)
      await extension.activate();
      const isActive1 = extension.isActive;

      await extension.activate();
      const isActive2 = extension.isActive;

      await extension.activate();
      const isActive3 = extension.isActive;

      assert.strictEqual(isActive1, true, 'Extension should be active after first activate');
      assert.strictEqual(isActive2, true, 'Extension should remain active after second activate');
      assert.strictEqual(isActive3, true, 'Extension should remain active after third activate');
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

    it('should have logging configuration accessible', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');

      // Verify logging settings exist and have correct types
      const fileEnabled = config.get('logging.fileEnabled');
      assert.strictEqual(typeof fileEnabled, 'boolean', 'logging.fileEnabled should be a boolean');

      const level = config.get('logging.level');
      assert.strictEqual(typeof level, 'string', 'logging.level should be a string');

      const maxFileSize = config.get('logging.maxFileSize');
      assert.strictEqual(typeof maxFileSize, 'number', 'logging.maxFileSize should be a number');

      const maxFiles = config.get('logging.maxFiles');
      assert.strictEqual(typeof maxFiles, 'number', 'logging.maxFiles should be a number');
    });

    it('should have commandTimeouts as an object', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');

      const commandTimeouts = config.get('commandTimeouts');
      assert.ok(
        typeof commandTimeouts === 'object' && commandTimeouts !== null,
        'commandTimeouts should be an object'
      );
    });

    it('should have submoduleDepth within valid range', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');

      const submoduleDepth = config.get<number>('submoduleDepth');
      assert.ok(submoduleDepth !== undefined, 'submoduleDepth should be defined');
      // According to package.json: minimum: 1, maximum: 5
      assert.ok(submoduleDepth >= 1, 'submoduleDepth should be at least 1');
      assert.ok(submoduleDepth <= 5, 'submoduleDepth should be at most 5');
    });

    it('should have defaultIdentity as a string', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');

      const defaultIdentity = config.get('defaultIdentity');
      assert.strictEqual(typeof defaultIdentity, 'string', 'defaultIdentity should be a string');
    });

    it('should have default identity item with required fields', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      const identities = config.get<Array<{ id: string; name: string; email: string }>>('identities');

      assert.ok(Array.isArray(identities) && identities.length > 0, 'identities should have at least one item');

      const firstIdentity = identities[0];
      assert.ok(firstIdentity.id, 'Identity should have an id');
      assert.ok(firstIdentity.name, 'Identity should have a name');
      assert.ok(firstIdentity.email, 'Identity should have an email');
    });

    it('should have logging.level with a valid value', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      const level = config.get<string>('logging.level');

      assert.ok(level !== undefined, 'logging.level should be defined');
      assert.ok(
        VALID_LOG_LEVELS.includes(level as typeof VALID_LOG_LEVELS[number]),
        `logging.level should be one of: ${VALID_LOG_LEVELS.join(', ')}`
      );
    });

    it('should have includeIconInGitConfig as a boolean', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      const includeIconInGitConfig = config.get('includeIconInGitConfig');

      assert.strictEqual(
        typeof includeIconInGitConfig,
        'boolean',
        'includeIconInGitConfig should be a boolean'
      );
    });
  });

  describe('Command Execution', () => {
    it('should execute showCurrentIdentity command without error', async () => {
      // This command shows an information message, should not throw
      await assert.doesNotReject(
        async () => {
          await vscode.commands.executeCommand('git-id-switcher.showCurrentIdentity');
        },
        'showCurrentIdentity command should execute without throwing'
      );
    });

    it('should execute showDocumentation command without error', async () => {
      // This command opens a webview panel, should not throw
      await assert.doesNotReject(
        async () => {
          await vscode.commands.executeCommand('git-id-switcher.showDocumentation');
        },
        'showDocumentation command should execute without throwing'
      );

      // Clean up: close the opened webview panel
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    it('should have selectIdentity command available for execution', async () => {
      // We can't fully test selectIdentity as it shows a QuickPick UI,
      // but we can verify the command is executable (it will show the UI)
      const commands = await vscode.commands.getCommands(true);
      assert.ok(
        commands.includes('git-id-switcher.selectIdentity'),
        'selectIdentity command should be available'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent command gracefully', async () => {
      // VS Code should throw when executing a non-existent command
      await assert.rejects(
        async () => {
          await vscode.commands.executeCommand('git-id-switcher.nonExistentCommand');
        },
        /command.*not found/i,
        'Non-existent command should throw an error'
      );
    });

    it('should handle invalid configuration values gracefully', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');

      // Getting a non-existent config key should return undefined, not throw
      const nonExistent = config.get('nonExistentKey');
      assert.strictEqual(nonExistent, undefined, 'Non-existent config key should return undefined');
    });

    it('should handle configuration inspection for identities', () => {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');

      // inspect() should return detailed configuration info
      const inspection = config.inspect('identities');
      assert.ok(inspection, 'Configuration inspection should return an object');
      assert.ok(
        inspection.defaultValue !== undefined,
        'Configuration should have a default value'
      );
    });
  });

  describe('Extension State', () => {
    it('should maintain activation state after multiple checks', async () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // Check activation state multiple times
      const isActive1 = extension.isActive;
      const isActive2 = extension.isActive;
      const isActive3 = extension.isActive;

      assert.strictEqual(isActive1, isActive2, 'Activation state should be consistent');
      assert.strictEqual(isActive2, isActive3, 'Activation state should be consistent');
    });

    it('should have extension exports available after activation', async () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // Ensure extension is activated
      if (!extension.isActive) {
        await extension.activate();
      }

      // Extension exports may be undefined if extension doesn't export anything
      // This test just verifies we can access the exports property without error
      const exports = extension.exports;
      // exports can be undefined, null, or an object - all are valid
      assert.ok(
        exports === undefined || exports === null || typeof exports === 'object',
        'Extension exports should be undefined, null, or an object'
      );
    });
  });

  describe('Deactivation Behavior', () => {
    it('should have commands registered while extension is active', async () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // Ensure extension is activated
      if (!extension.isActive) {
        await extension.activate();
      }

      assert.strictEqual(extension.isActive, true, 'Extension should be active');

      // Commands should be available
      const commands = await vscode.commands.getCommands(true);
      for (const cmd of EXTENSION_COMMANDS) {
        assert.ok(
          commands.includes(cmd),
          `Command "${cmd}" should be registered while extension is active`
        );
      }
    });

    it('should have extension ID accessible even after activation', () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // Extension ID should always be accessible
      assert.strictEqual(
        extension.id,
        EXTENSION_ID,
        'Extension ID should match expected value'
      );
    });

    it('should have extension path accessible', () => {
      assert.ok(extension, `Extension ${EXTENSION_ID} should be found`);

      // Extension path should be a non-empty string
      assert.ok(
        typeof extension.extensionPath === 'string' && extension.extensionPath.length > 0,
        'Extension path should be a non-empty string'
      );
    });
  });
});
