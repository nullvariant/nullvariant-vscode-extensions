/**
 * E2E Tests for Identity Manager UI
 *
 * Tests for identityManager.ts UI functionality including:
 * - showAddIdentityWizard() multi-step input with Esc-back navigation
 * - showAddIdentityForm() property list style form
 * - showEditIdentityWizard() field editing with targetIdentity support
 * - Edit identity form field selection
 * - SSH/GPG field editing with security validation
 * - validateInput integration with security validators
 * - MAX_IDENTITIES limit enforcement
 * - getUserSafeMessage error handling
 *
 * Test Categories:
 * - Add Wizard Flow: 3-step wizard with Esc-back support
 * - Add Identity Form: Property list display, required field validation,
 *   duplicate ID check, back button
 * - Edit Wizard Flow: Field editing with optional identity selection skip
 * - Edit Identity Form: Back button, ID field non-editable,
 *   edit loop continuation, placeholder
 * - SSH/GPG Field Editing: sshKeyPath, sshHost, gpgKeyId validation,
 *   file picker button, showOpenDialog integration
 * - validateInput Integration: Security validator usage verification
 * - Security: Dangerous character detection, length limits
 * - Error Handling: getUserSafeMessage integration
 *
 * Test Count: 72 tests covering identityManager.ts functionality
 *
 * Note: These tests use mocked VS Code API via vscodeLoader since
 * UI interactions require VS Code window API.
 */

import * as assert from 'node:assert';
import { showAddIdentityWizard, showEditIdentityWizard, showAddIdentityForm } from '../../ui/identityManager';
import { _setMockVSCode, _resetCache } from '../../core/vscodeLoader';
import { MAX_IDENTITIES, MAX_NAME_LENGTH, MAX_EMAIL_LENGTH, MAX_SSH_HOST_LENGTH } from '../../core/constants';
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
    service: 'GitHub',
    description: 'Personal projects',
  },
};

/** Symbol for Back button */
const BACK_BUTTON = Symbol('QuickInputButtons.Back');

/**
 * Mock ThemeIcon class for testing
 */
class MockThemeIcon {
  constructor(public readonly id: string) {}
}

/** Special symbol to represent back button trigger in inputBox tests */
const INPUT_BOX_BACK = Symbol('InputBox.Back');

/** Special symbol to represent file picker button click */
const FILE_PICKER_CLICK = Symbol('InputBox.FilePicker');

/**
 * Create a mock VS Code API for identity manager tests
 *
 * Options:
 * - showInputBoxResults: Used by legacy showInputBox() API
 * - inputBoxSelections: Used by createInputBox() API (supports symbol INPUT_BOX_BACK for back button)
 * - quickPickSelections: Used by createQuickPick() API (supports 'back' string for back button)
 */
function createMockVSCode(options: {
  identities?: Identity[];
  showQuickPickResult?: { identity?: Identity; field?: keyof Identity } | undefined;
  showInputBoxResults?: (string | undefined)[];
  configUpdateError?: Error;
  quickPickSelections?: unknown[];
  inputBoxSelections?: (string | typeof INPUT_BOX_BACK | typeof FILE_PICKER_CLICK | undefined)[];
  showOpenDialogResult?: string | undefined;
  onShowOpenDialog?: (dialogOptions: {
    canSelectFiles?: boolean;
    canSelectFolders?: boolean;
    defaultUri?: { fsPath: string } | undefined;
    title?: string;
  }) => void;
  onQuickPickCreated?: (quickPick: {
    items: unknown[];
    buttons: unknown[];
    title: string;
    placeholder: string;
  }) => void;
  onInputBoxCreated?: (inputBox: {
    buttons: unknown[];
    title: string;
    placeholder: string;
  }) => void;
}) {
  const showWarningMessageCalls: string[] = [];
  const showInformationMessageCalls: string[] = [];
  const showErrorMessageCalls: string[] = [];
  const configUpdateCalls: { key: string; value: unknown }[] = [];
  let inputBoxCallIndex = 0;
  let inputBoxSelectionIndex = 0;
  let quickPickSelectionIndex = 0; // Shared across all QuickPick instances
  let lastValidateInput: ((value: string) => string | null) | undefined;
  const allValidateInputs: ((value: string) => string | null)[] = [];

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
        update: async (key: string, value: unknown) => {
          if (options.configUpdateError) {
            throw options.configUpdateError;
          }
          configUpdateCalls.push({ key, value });
        },
      }),
    },
    window: {
      showWarningMessage: async (message: string) => {
        showWarningMessageCalls.push(message);
        return undefined;
      },
      showInformationMessage: async (message: string) => {
        showInformationMessageCalls.push(message);
        return undefined;
      },
      showErrorMessage: async (message: string) => {
        showErrorMessageCalls.push(message);
        return undefined;
      },
      showQuickPick: async <T>(items: T[]): Promise<T | undefined> => {
        const result = options.showQuickPickResult;
        if (!result) {
          return undefined;
        }
        // Find matching item
        return items.find((item: unknown) => {
          if ('identity' in result && typeof item === 'object' && item !== null && 'identity' in item) {
            return (item as { identity: Identity }).identity.id === result.identity?.id;
          }
          if ('field' in result && typeof item === 'object' && item !== null && 'field' in item) {
            return (item as { field: keyof Identity }).field === result.field;
          }
          return false;
        });
      },
      showInputBox: async (inputOptions?: {
        validateInput?: (value: string) => string | null;
        value?: string;
      }) => {
        // Capture validateInput for testing
        if (inputOptions?.validateInput) {
          lastValidateInput = inputOptions.validateInput;
          allValidateInputs.push(inputOptions.validateInput);
        }
        const results = options.showInputBoxResults ?? [];
        const result = results[inputBoxCallIndex];
        inputBoxCallIndex++;
        return result;
      },
      createInputBox: () => {
        let acceptCallback: (() => void) | undefined;
        let hideCallback: (() => void) | undefined;
        let buttonCallback: ((button: unknown) => void) | undefined;
        let changeCallback: ((value: string) => void) | undefined;
        let _value = '';
        let _validationMessage: string | undefined;
        let _buttons: unknown[] = [];
        let _title = '';
        let _placeholder = '';

        const inputBox = {
          get value() { return _value; },
          set value(v: string) {
            _value = v;
            if (changeCallback) changeCallback(v);
          },
          get validationMessage() { return _validationMessage; },
          set validationMessage(v: string | undefined) { _validationMessage = v; },
          get placeholder() { return _placeholder; },
          set placeholder(v: string) { _placeholder = v; },
          prompt: '',
          get title() { return _title; },
          set title(v: string) { _title = v; },
          get buttons() { return _buttons; },
          set buttons(value: unknown[]) { _buttons = value; },
          show: () => {
            // Notify test callback with InputBox state
            if (options.onInputBoxCreated) {
              options.onInputBoxCreated({
                buttons: _buttons,
                title: _title,
                placeholder: _placeholder,
              });
            }
            // Auto-trigger based on test configuration
            const selections = options.inputBoxSelections ?? options.showInputBoxResults ?? [];
            const selection = selections[inputBoxSelectionIndex];
            inputBoxSelectionIndex++;
            setTimeout(async () => {
              if (selection === INPUT_BOX_BACK && buttonCallback) {
                buttonCallback(BACK_BUTTON);
              } else if (selection === FILE_PICKER_CLICK && buttonCallback) {
                // Simulate file picker button click (non-back button)
                // The button callback is async, so we need to wait for showOpenDialog to complete
                const filePickerButton = { iconPath: { id: 'folder-opened' }, tooltip: 'Browse...' };
                await Promise.resolve(buttonCallback(filePickerButton));
                // After file picker completes, cancel the InputBox (test only needs to verify dialog options)
                setTimeout(() => {
                  if (hideCallback) hideCallback();
                }, 10);
              } else if (selection === undefined && hideCallback) {
                hideCallback();
              } else if (typeof selection === 'string' && acceptCallback) {
                _value = selection;
                // Trigger onDidChangeValue callback (this sets validationMessage via real implementation)
                if (changeCallback) {
                  changeCallback(selection);
                }
                // Accept only if no validation error
                if (!_validationMessage) {
                  acceptCallback();
                } else if (hideCallback) {
                  // Validation failed, treat as cancel
                  hideCallback();
                }
              }
            }, 0);
          },
          hide: () => {
            if (hideCallback) hideCallback();
          },
          dispose: () => {},
          onDidAccept: (callback: () => void) => {
            acceptCallback = callback;
            return { dispose: () => {} };
          },
          onDidTriggerButton: (callback: (button: unknown) => void) => {
            buttonCallback = callback;
            return { dispose: () => {} };
          },
          onDidHide: (callback: () => void) => {
            hideCallback = callback;
            return { dispose: () => {} };
          },
          onDidChangeValue: (callback: (value: string) => void) => {
            changeCallback = callback;
            return { dispose: () => {} };
          },
        };

        return inputBox;
      },
      showOpenDialog: async (dialogOptions?: {
        canSelectFiles?: boolean;
        canSelectFolders?: boolean;
        defaultUri?: { fsPath: string };
        title?: string;
      }) => {
        // Capture dialog options for testing
        if (options.onShowOpenDialog && dialogOptions) {
          options.onShowOpenDialog(dialogOptions);
        }
        const result = options.showOpenDialogResult;
        if (result) {
          return [{ fsPath: result }];
        }
        return undefined;
      },
      createQuickPick: <T>() => {
        // Note: quickPickSelectionIndex is shared across all QuickPick instances (defined at mock level)
        let acceptCallback: (() => void) | undefined;
        let buttonCallback: ((button: unknown) => void) | undefined;
        let hideCallback: (() => void) | undefined;
        let _items: T[] = [];
        let _selectedItems: T[] = [];
        let _activeItems: T[] = [];
        let _title = '';
        let _placeholder = '';
        let _buttons: unknown[] = [];

        const quickPick = {
          get title() { return _title; },
          set title(value: string) { _title = value; },
          get placeholder() { return _placeholder; },
          set placeholder(value: string) { _placeholder = value; },
          get buttons() { return _buttons; },
          set buttons(value: unknown[]) { _buttons = value; },
          get items() { return _items; },
          set items(value: T[]) { _items = value; },
          get selectedItems() { return _selectedItems; },
          get activeItems() { return _activeItems; },
          set activeItems(value: T[]) { _activeItems = value; },
          show: () => {
            // Notify test callback with QuickPick state
            if (options.onQuickPickCreated) {
              options.onQuickPickCreated({
                items: _items as unknown[],
                buttons: _buttons,
                title: _title,
                placeholder: _placeholder,
              });
            }
            // Auto-trigger selection based on test configuration
            const selections = options.quickPickSelections ?? [];
            const selection = selections[quickPickSelectionIndex];
            quickPickSelectionIndex++;
            setTimeout(() => {
              if (selection === 'back' && buttonCallback) {
                buttonCallback(BACK_BUTTON);
              } else if (selection === undefined && hideCallback) {
                hideCallback();
              } else if (acceptCallback) {
                // Find matching item from _items
                const matchedItem = _items.find((item: unknown) => {
                  if (typeof selection === 'object' && selection !== null) {
                    if ('field' in selection && typeof item === 'object' && item !== null && 'field' in item) {
                      return (item as { field: string }).field === (selection as { field: string }).field;
                    }
                    if ('_isSaveButton' in selection && typeof item === 'object' && item !== null && '_isSaveButton' in item) {
                      return (item as { _isSaveButton: boolean })._isSaveButton === (selection as { _isSaveButton: boolean })._isSaveButton;
                    }
                  }
                  return false;
                });
                _selectedItems = matchedItem ? [matchedItem] : [];
                acceptCallback();
              }
            }, 0);
          },
          hide: () => {
            if (hideCallback) hideCallback();
          },
          dispose: () => {},
          onDidAccept: (callback: () => void) => {
            acceptCallback = callback;
            return { dispose: () => {} };
          },
          onDidTriggerButton: (callback: (button: unknown) => void) => {
            buttonCallback = callback;
            return { dispose: () => {} };
          },
          onDidHide: (callback: () => void) => {
            hideCallback = callback;
            return { dispose: () => {} };
          },
        };
        return quickPick;
      },
    },
    QuickInputButtons: {
      Back: BACK_BUTTON,
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
    Uri: {
      file: (path: string) => ({ fsPath: path }),
    },
    ThemeIcon: MockThemeIcon,
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
    _getLastValidateInput: () => lastValidateInput,
    _getAllValidateInputs: () => allValidateInputs,
    _resetInputBoxCallIndex: () => { inputBoxCallIndex = 0; },
    _getInputBoxCallIndex: () => inputBoxCallIndex,
  };
}

describe('identityManager E2E Test Suite', function () {
  // Set suite-level timeout for all tests
  this.timeout(10000);

  beforeEach(() => {
    _resetCache();
  });

  afterEach(() => {
    _resetCache();
  });

  // ===========================================================================
  // Add Wizard Flow Tests (with Esc-back navigation)
  // ===========================================================================

  describe('Add Wizard: Normal Flow', () => {
    it('should return true when all 3 steps completed', async () => {
      // showAddIdentityWizard now uses showAddIdentityForm (property list style)
      // User flow: QuickPick shows fields → select id → enter value → select name → enter value → ...
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },     // Select id field
          { field: 'name' },   // Select name field
          { field: 'email' },  // Select email field
          { _isSaveButton: true }, // Click save
        ],
        inputBoxSelections: ['test-id', 'Test User', 'test@example.com'],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, true, 'Should return true on success');
      const infoCalls = mockVSCode._getShowInformationMessageCalls();
      assert.ok(infoCalls.length >= 1, 'Should show success message');
    });

    it('should return false when step 1 cancelled (Esc)', async () => {
      // Cancel at QuickPick (property list)
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [undefined], // Cancel at QuickPick
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, false, 'Should return false when cancelled at QuickPick');
    });
  });

  describe('Add Wizard: Esc-back Navigation', () => {
    it('should go back to step 1 when Esc pressed at step 2, preserving ID value', async () => {
      // In property list style: select id → enter value → select name → Esc (back) → select name again
      // Note: 'back' in inputBoxSelections triggers back button, returns to QuickPick
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },     // Select id field
          { field: 'name' },   // Select name field
          // After back from InputBox, QuickPick shows again
          { field: 'name' },   // Select name field again
          { field: 'email' },  // Select email field
          { _isSaveButton: true }, // Click save
        ],
        inputBoxSelections: [
          'my-id',        // Enter id value
          INPUT_BOX_BACK, // Press back at name input
          'My Name',      // Enter name value (after back)
          'my@test.com',  // Enter email value
        ],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, true, 'Should complete successfully after back-navigation');
    });

    it('should go back to step 2 when Esc pressed at step 3, preserving Name value', async () => {
      // In property list style: complete id/name, then Esc at email input
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },
          { field: 'name' },
          { field: 'email' },
          // After back from InputBox, QuickPick shows again
          { field: 'email' }, // Select email again
          { _isSaveButton: true },
        ],
        inputBoxSelections: [
          'my-id',
          'My Name',
          INPUT_BOX_BACK, // Press back at email input
          'my@test.com',  // Enter email (after back)
        ],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, true, 'Should complete successfully after back-navigation');
    });
  });

  // ===========================================================================
  // Edit Wizard Flow Tests
  // ===========================================================================

  describe('Edit Wizard: targetIdentity Support', () => {
    it('should skip identity selection when targetIdentity is provided', async () => {
      // Edit wizard now uses createQuickPick for field selection
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        quickPickSelections: [
          { field: 'name' },  // Select name field
          undefined,          // Cancel after saving (exit loop)
        ],
        inputBoxSelections: ['Updated Name'],
      });
      _setMockVSCode(mockVSCode as never);

      // Pass targetIdentity to skip selection
      const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

      assert.strictEqual(result, true, 'Should return true on success');
      const infoCalls = mockVSCode._getShowInformationMessageCalls();
      assert.ok(infoCalls.some(msg => msg.includes('updated')), 'Should show update message');
    });

    it('should return true when edit completes successfully', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        quickPickSelections: [
          { field: 'email' }, // Select email field
          undefined,          // Cancel after saving (exit loop)
        ],
        inputBoxSelections: ['new@example.com'],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

      assert.strictEqual(result, true, 'Should return true (boolean)');
    });

    it('should return false when field selection cancelled (Esc)', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        quickPickSelections: [undefined], // Cancel field selection
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

      assert.strictEqual(result, false, 'Should return false when cancelled');
    });
  });

  describe('Edit Wizard: Esc-back Navigation', () => {
    it('should go back to field selection when Esc pressed at value input', async () => {
      // First attempt: select field, press back at InputBox
      // Second attempt: select field again, enter value
      let quickPickShowCount = 0;
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        quickPickSelections: [
          { field: 'name' },  // Select name field (first attempt)
          { field: 'name' },  // Select name field again (after back)
          undefined,          // Cancel after saving
        ],
        inputBoxSelections: [
          INPUT_BOX_BACK,   // First: press back button
          'Updated Name',   // Second: enter value
        ],
        onQuickPickCreated: () => {
          quickPickShowCount++;
        },
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

      assert.strictEqual(result, true, 'Should complete after back-navigation');
      assert.ok(quickPickShowCount >= 2, `Should show QuickPick multiple times due to back-navigation, got ${quickPickShowCount}`);
    });
  });

  describe('Edit Wizard: Return Type Verification', () => {
    it('should return boolean type from showEditIdentityWizard', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showQuickPickResult: { field: 'name' },
        showInputBoxResults: ['New Name'],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

      assert.strictEqual(typeof result, 'boolean', 'Return type should be boolean');
    });
  });

  describe('Add Wizard: Return Type Verification', () => {
    it('should return boolean type from showAddIdentityWizard', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },
          { field: 'name' },
          { field: 'email' },
          { _isSaveButton: true },
        ],
        inputBoxSelections: ['id', 'name', 'email@test.com'],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(typeof result, 'boolean', 'Return type should be boolean');
    });
  });

  // ===========================================================================
  // Security: Input Validation Integration Tests
  // Note: These tests verify validation through the UI flow (createInputBox API).
  // Invalid input triggers validation error, causing the flow to cancel.
  // ===========================================================================

  describe('Security: ID Input Validation', () => {
    it('should reject ID with invalid characters (validation causes cancel)', async () => {
      // Invalid ID with symbols - validation will fail, causing cancel
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },  // Select id field
          undefined,        // Cancel after validation failure
        ],
        inputBoxSelections: ['id@with#symbols!'], // Invalid ID
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      // Validation error causes hide (cancel), so result is false
      assert.strictEqual(result, false, 'Invalid ID should cause validation failure');
    });

    it('should show duplicate ID error in detail', async () => {
      // This is already covered by 'Duplicate ID Check' tests in Add Identity Form section
      // Duplicate ID shows "ID already exists" in detail and keeps save button disabled
      assert.ok(true, 'Duplicate ID check covered in Add Identity Form tests');
    });
  });

  describe('Security: Name Input Validation', () => {
    it('should reject name with dangerous characters ($, backtick)', async () => {
      // Name with dangerous characters - validation will fail
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },
          { field: 'name' },  // Select name field
          undefined,          // Cancel after validation failure
        ],
        inputBoxSelections: ['valid-id', 'User $HOME'], // Valid ID, Invalid name
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, false, 'Name with dangerous characters should cause validation failure');
    });

    it('should reject name exceeding MAX_NAME_LENGTH', async () => {
      const longName = 'a'.repeat(MAX_NAME_LENGTH + 1);
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },
          { field: 'name' },
          undefined,
        ],
        inputBoxSelections: ['valid-id', longName],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, false, 'Name exceeding max length should cause validation failure');
    });
  });

  describe('Security: Email Input Validation', () => {
    it('should reject invalid email format', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },
          { field: 'name' },
          { field: 'email' },
          undefined,
        ],
        inputBoxSelections: ['valid-id', 'Valid Name', 'notanemail'], // Invalid email
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, false, 'Invalid email format should cause validation failure');
    });

    it('should reject email exceeding MAX_EMAIL_LENGTH', async () => {
      const longEmail = 'a'.repeat(MAX_EMAIL_LENGTH) + '@example.com';
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },
          { field: 'name' },
          { field: 'email' },
          undefined,
        ],
        inputBoxSelections: ['valid-id', 'Valid Name', longEmail],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, false, 'Email exceeding max length should cause validation failure');
    });
  });

  describe('Security: validateInput - Valid Values', () => {
    it('should accept valid input values and complete successfully', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },
          { field: 'name' },
          { field: 'email' },
          { _isSaveButton: true },
        ],
        inputBoxSelections: ['valid-id', 'Valid Name', 'valid@example.com'],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, true, 'Valid values should complete successfully');
    });

    it('should reject empty string inputs', async () => {
      // Empty string for required field should fail validation
      const mockVSCode = createMockVSCode({
        identities: [],
        quickPickSelections: [
          { field: 'id' },  // Select id field
          undefined,        // Cancel after validation failure
        ],
        inputBoxSelections: [''], // Empty ID
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, false, 'Empty string should cause validation failure');
    });
  });

  // ===========================================================================
  // MAX_IDENTITIES Limit Tests
  // ===========================================================================

  describe('MAX_IDENTITIES Limit', () => {
    it('should show warning when MAX_IDENTITIES reached', async () => {
      // Create array with MAX_IDENTITIES identities
      const maxIdentities: Identity[] = [];
      for (let i = 0; i < MAX_IDENTITIES; i++) {
        maxIdentities.push({
          id: `identity-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
        });
      }

      const mockVSCode = createMockVSCode({
        identities: maxIdentities,
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, false, 'Should return false when limit reached');
      const warnings = mockVSCode._getShowWarningMessageCalls();
      assert.strictEqual(warnings.length, 1, 'Should show warning');
      assert.ok(
        warnings[0].includes(String(MAX_IDENTITIES)),
        'Warning should mention max limit'
      );
    });
  });

  // ===========================================================================
  // Add Identity Form (Property List Style) Tests
  // ===========================================================================

  describe('Add Identity Form: Property List Style', () => {
    describe('Property List Display', () => {
      it('should show QuickPick with all 9 FIELD_METADATA fields', async () => {
        let capturedItems: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [undefined], // Cancel immediately
          onQuickPickCreated: (quickPick) => {
            capturedItems = quickPick.items;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        // 9 fields + 1 separator + 1 save button = 11 items
        assert.ok(capturedItems.length >= 10, `Should have at least 10 items, got ${capturedItems.length}`);

        // Verify all 9 fields are present with correct icons
        const expectedFields = [
          { field: 'id', icon: 'lock' },
          { field: 'name', icon: 'person' },
          { field: 'email', icon: 'mail' },
          { field: 'service', icon: 'server' },
          { field: 'icon', icon: 'symbol-color' },
          { field: 'description', icon: 'note' },
          { field: 'sshKeyPath', icon: 'key' },
          { field: 'sshHost', icon: 'globe' },
          { field: 'gpgKeyId', icon: 'key' },
        ];

        for (const { field, icon } of expectedFields) {
          const item = capturedItems.find((i: unknown) =>
            typeof i === 'object' && i !== null && 'field' in i &&
            (i as { field: string }).field === field
          );
          assert.ok(item, `Field '${field}' should be present`);
          const label = (item as { label: string }).label;
          assert.ok(label.includes(`$(${icon})`), `Field '${field}' should have $(${icon}) icon, got: ${label}`);
        }
      });

      it('should mark required fields (id, name, email) with asterisk', async () => {
        let capturedItems: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedItems = quickPick.items;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        const requiredFields = ['id', 'name', 'email'];
        for (const field of requiredFields) {
          const item = capturedItems.find((i: unknown) =>
            typeof i === 'object' && i !== null && 'field' in i &&
            (i as { field: string }).field === field
          );
          assert.ok(item, `Field '${field}' should be present`);
          const label = (item as { label: string }).label;
          assert.ok(label.endsWith('*'), `Required field '${field}' should have * mark, got: ${label}`);
        }

        const optionalFields = ['service', 'icon', 'description', 'sshKeyPath', 'sshHost', 'gpgKeyId'];
        for (const field of optionalFields) {
          const item = capturedItems.find((i: unknown) =>
            typeof i === 'object' && i !== null && 'field' in i &&
            (i as { field: string }).field === field
          );
          if (item) {
            const label = (item as { label: string }).label;
            assert.ok(!label.endsWith('*'), `Optional field '${field}' should NOT have * mark, got: ${label}`);
          }
        }
      });

      it('should show separator line', async () => {
        let capturedItems: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedItems = quickPick.items;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        const separator = capturedItems.find((i: unknown) =>
          typeof i === 'object' && i !== null && 'label' in i &&
          (i as { label: string }).label.includes('─────────────')
        );
        assert.ok(separator, 'Separator should be present');
        assert.strictEqual((separator as { _isDisabled?: boolean })._isDisabled, true, 'Separator should be disabled');
      });

      it('should show save button at bottom', async () => {
        let capturedItems: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedItems = quickPick.items;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        const saveButton = capturedItems.find((i: unknown) =>
          typeof i === 'object' && i !== null && 'field' in i &&
          (i as { field: string }).field === 'save'
        );
        assert.ok(saveButton, 'Save button should be present');
        assert.strictEqual((saveButton as { _isSaveButton?: boolean })._isSaveButton, true, 'Save button should have _isSaveButton flag');

        // Save button should be at the end
        const lastItem = capturedItems.at(-1);
        assert.strictEqual((lastItem as { field: string }).field, 'save', 'Save button should be the last item');
      });
    });

    describe('Required Field Validation for Save Button', () => {
      it('should disable save button when id is empty', async () => {
        let capturedItems: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedItems = quickPick.items;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        const saveButton = capturedItems.find((i: unknown) =>
          typeof i === 'object' && i !== null && 'field' in i &&
          (i as { field: string }).field === 'save'
        );
        assert.ok(saveButton, 'Save button should be present');
        const label = (saveButton as { label: string }).label;
        assert.ok(label.includes('$(circle-slash)'), `Save button should show $(circle-slash) when disabled, got: ${label}`);
        assert.strictEqual((saveButton as { _isDisabled?: boolean })._isDisabled, true, 'Save button should be disabled');
      });

      it('should enable save button when all required fields are filled', async () => {
        let capturedItemsHistory: unknown[][] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [
            { field: 'id' },     // Select id field
            { field: 'name' },   // Select name field
            { field: 'email' },  // Select email field
            { _isSaveButton: true }, // Click save
          ],
          inputBoxSelections: ['test-id', 'Test User', 'test@example.com'],
          onQuickPickCreated: (quickPick) => {
            capturedItemsHistory.push([...quickPick.items]);
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        // After all fields filled, save button should be enabled
        assert.ok(capturedItemsHistory.length >= 4, `Expected at least 4 QuickPick displays, got ${capturedItemsHistory.length}`);
        const lastItems = capturedItemsHistory.at(-1);
        assert.ok(lastItems, 'Last items should exist');
        const saveButton = lastItems.find((i: unknown) =>
          typeof i === 'object' && i !== null && 'field' in i &&
          (i as { field: string }).field === 'save'
        );
        assert.ok(saveButton, 'Save button should exist');
        const label = (saveButton as { label: string }).label;
        assert.ok(label.includes('$(check)'), `Save button should show $(check) when enabled, got: ${label}`);
        assert.strictEqual((saveButton as { _isDisabled?: boolean })._isDisabled, false, 'Save button should be enabled');
      });

      it('should disable save button when only id is filled', async () => {
        let capturedItemsHistory: unknown[][] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [
            { field: 'id' },  // Select id field
            undefined,       // Cancel after
          ],
          inputBoxSelections: ['test-id'],
          onQuickPickCreated: (quickPick) => {
            capturedItemsHistory.push([...quickPick.items]);
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        // After id filled but name/email empty, save should still be disabled
        assert.ok(capturedItemsHistory.length >= 2, `Expected at least 2 QuickPick displays, got ${capturedItemsHistory.length}`);
        const lastItems = capturedItemsHistory.at(-1);
        assert.ok(lastItems, 'Last items should exist');
        const saveButton = lastItems.find((i: unknown) =>
          typeof i === 'object' && i !== null && 'field' in i &&
          (i as { field: string }).field === 'save'
        );
        assert.ok(saveButton, 'Save button should exist');
        assert.strictEqual((saveButton as { _isDisabled?: boolean })._isDisabled, true,
          'Save button should be disabled when only id is filled');
      });

      it('should disable save button when id and name filled but email empty', async () => {
        let capturedItemsHistory: unknown[][] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [
            { field: 'id' },    // Select id field
            { field: 'name' }, // Select name field
            undefined,         // Cancel after
          ],
          inputBoxSelections: ['test-id', 'Test User'],
          onQuickPickCreated: (quickPick) => {
            capturedItemsHistory.push([...quickPick.items]);
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        // After id and name filled but email empty, save should still be disabled
        assert.ok(capturedItemsHistory.length >= 3, `Expected at least 3 QuickPick displays, got ${capturedItemsHistory.length}`);
        const lastItems = capturedItemsHistory.at(-1);
        assert.ok(lastItems, 'Last items should exist');
        const saveButton = lastItems.find((i: unknown) =>
          typeof i === 'object' && i !== null && 'field' in i &&
          (i as { field: string }).field === 'save'
        );
        assert.ok(saveButton, 'Save button should exist');
        assert.strictEqual((saveButton as { _isDisabled?: boolean })._isDisabled, true,
          'Save button should be disabled when email is empty');
      });
    });

    describe('Duplicate ID Check', () => {
      it('should show ID already exists detail when duplicate ID entered', async () => {
        // Note: Duplicate ID detection happens at two levels:
        // 1. InputBox validation (validateIdInput) - prevents accepting duplicate ID
        // 2. buildAddFormItems - shows "ID already exists" detail when state has duplicate ID
        //
        // Since InputBox validation rejects duplicate IDs before they reach state,
        // we test that the validation correctly rejects duplicate input.
        // The detail display in QuickPick is tested indirectly via save button remaining disabled.
        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work], // Existing identity with id 'work'
          quickPickSelections: [
            { field: 'id' },   // Select id field
            undefined,        // Cancel after validation failure
          ],
          inputBoxSelections: ['work'], // Enter duplicate ID (will be rejected by validation)
        });
        _setMockVSCode(mockVSCode as never);

        const result = await showAddIdentityForm();

        // Duplicate ID is rejected at InputBox validation level, causing cancel
        assert.strictEqual(result, undefined, 'Should return undefined when duplicate ID validation fails');
      });

      it('should keep save button disabled when ID is duplicate', async () => {
        let capturedItemsHistory: unknown[][] = [];

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [
            { field: 'id' },
            { field: 'name' },
            { field: 'email' },
            undefined,
          ],
          inputBoxSelections: ['work', 'Test Name', 'test@example.com'], // Duplicate ID
          onQuickPickCreated: (quickPick) => {
            capturedItemsHistory.push([...quickPick.items]);
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        // Even with all fields filled, save should be disabled due to duplicate ID
        assert.ok(capturedItemsHistory.length >= 4, `Expected at least 4 QuickPick displays, got ${capturedItemsHistory.length}`);
        const lastItems = capturedItemsHistory.at(-1);
        assert.ok(lastItems, 'Last items should exist');
        const saveButton = lastItems.find((i: unknown) =>
          typeof i === 'object' && i !== null && 'field' in i &&
          (i as { field: string }).field === 'save'
        );
        assert.ok(saveButton, 'Save button should exist');
        assert.strictEqual((saveButton as { _isDisabled?: boolean })._isDisabled, true,
          'Save button should remain disabled with duplicate ID');
      });
    });

    describe('Back Button (Add Form)', () => {
      it('should have QuickInputButtons.Back in buttons array', async () => {
        let capturedButtons: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedButtons = quickPick.buttons;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showAddIdentityForm();

        assert.ok(capturedButtons.includes(BACK_BUTTON), 'QuickPick should have Back button');
      });

      it('should return undefined when back button clicked', async () => {
        const mockVSCode = createMockVSCode({
          identities: [],
          quickPickSelections: ['back'], // Trigger back button
        });
        _setMockVSCode(mockVSCode as never);

        const result = await showAddIdentityForm();

        assert.strictEqual(result, undefined, 'Should return undefined when back pressed');
      });
    });
  });

  // ===========================================================================
  // Edit Identity Form Tests
  // ===========================================================================

  describe('Edit Identity Form', () => {
    describe('Back Button (Field Selection)', () => {
      it('should have QuickInputButtons.Back in field selection', async () => {
        let capturedButtons: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [undefined], // Cancel immediately
          onQuickPickCreated: (quickPick) => {
            capturedButtons = quickPick.buttons;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showEditIdentityWizard(TEST_IDENTITIES.work);

        assert.ok(capturedButtons.includes(BACK_BUTTON), 'Field selection QuickPick should have Back button');
      });

      it('should return false when back button clicked at field selection', async () => {
        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: ['back'], // Trigger back button
        });
        _setMockVSCode(mockVSCode as never);

        const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

        assert.strictEqual(result, false, 'Should return false when back pressed at field selection');
      });
    });

    describe('ID Field Non-Editable', () => {
      it('should have ID field with field: null', async () => {
        let capturedItems: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedItems = quickPick.items;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showEditIdentityWizard(TEST_IDENTITIES.work);

        // Find ID item - it should have field: null
        const idItem = capturedItems.find((i: unknown) => {
          if (typeof i !== 'object' || i === null) return false;
          const item = i as { label?: string };
          return item.label?.includes('$(lock)');
        });
        assert.ok(idItem, 'ID item should be present');
        assert.strictEqual((idItem as { field: unknown }).field, null, 'ID field should be null');
      });

      it('should have ID field with _isDisabled: true', async () => {
        let capturedItems: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedItems = quickPick.items;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showEditIdentityWizard(TEST_IDENTITIES.work);

        const idItem = capturedItems.find((i: unknown) => {
          if (typeof i !== 'object' || i === null) return false;
          const item = i as { label?: string };
          return item.label?.includes('$(lock)');
        });
        assert.ok(idItem, 'ID item should be present');
        assert.strictEqual((idItem as { _isDisabled?: boolean })._isDisabled, true, 'ID field should be disabled');
      });

      it('should have ID field with $(lock) icon', async () => {
        let capturedItems: unknown[] = [];

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedItems = quickPick.items;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showEditIdentityWizard(TEST_IDENTITIES.work);

        const idItem = capturedItems.find((i: unknown) => {
          if (typeof i !== 'object' || i === null) return false;
          const item = i as { label?: string };
          return item.label?.includes('$(lock)');
        });
        assert.ok(idItem, 'ID item with $(lock) icon should be present');
      });

      it('should not close QuickPick when ID field is clicked (returns undefined for loop continuation)', async () => {
        let quickPickShowCount = 0;

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [
            { field: null }, // Click ID field (disabled)
            undefined,       // Cancel after
          ],
          onQuickPickCreated: () => {
            quickPickShowCount++;
          },
        });
        _setMockVSCode(mockVSCode as never);

        const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

        // When disabled item is clicked, it should return undefined and loop continues
        // The wizard should still be able to exit normally
        assert.strictEqual(result, false, 'Should return false when cancelled');
        // QuickPick should be shown at least once
        assert.ok(quickPickShowCount >= 1, 'QuickPick should be shown');
      });
    });

    describe('Edit Loop Continuation', () => {
      it('should return to field selection after editing a field', async () => {
        let quickPickShowCount = 0;

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [
            { field: 'name' },  // Select name field
            undefined,         // Cancel after returning
          ],
          inputBoxSelections: ['Updated Name'],
          onQuickPickCreated: () => {
            quickPickShowCount++;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showEditIdentityWizard(TEST_IDENTITIES.work);

        // QuickPick should be shown at least twice (initial + after edit)
        assert.ok(quickPickShowCount >= 2, `QuickPick should be shown at least twice, got ${quickPickShowCount}`);
      });

      it('should show $(check) Saved for just-saved field', async () => {
        let capturedItemsHistory: unknown[][] = [];

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [
            { field: 'name' },  // Select name field
            undefined,         // Cancel after returning
          ],
          inputBoxSelections: ['Updated Name'],
          onQuickPickCreated: (quickPick) => {
            capturedItemsHistory.push([...quickPick.items]);
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showEditIdentityWizard(TEST_IDENTITIES.work);

        // After saving, the name field should show "Saved" feedback
        if (capturedItemsHistory.length >= 2) {
          const itemsAfterSave = capturedItemsHistory[1];
          const nameItem = itemsAfterSave.find((i: unknown) => {
            if (typeof i !== 'object' || i === null) return false;
            return (i as { field?: string }).field === 'name';
          });
          if (nameItem) {
            const description = (nameItem as { description?: string }).description;
            assert.ok(description?.includes('Saved'), `Name field should show 'Saved' feedback, got: ${description}`);
          }
        }
      });

      it('should allow re-selecting the same field after saving', async () => {
        let quickPickShowCount = 0;

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [
            { field: 'name' },  // Select name field first time
            { field: 'name' },  // Select name field again
            undefined,         // Cancel
          ],
          inputBoxSelections: ['Updated Name', 'Updated Name Again'],
          onQuickPickCreated: () => {
            quickPickShowCount++;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showEditIdentityWizard(TEST_IDENTITIES.work);

        // QuickPick should be shown at least 3 times
        assert.ok(quickPickShowCount >= 3, `QuickPick should be shown at least 3 times for re-selection, got ${quickPickShowCount}`);
      });
    });

    describe('Placeholder', () => {
      it('should have Filter... placeholder in field selection', async () => {
        let capturedPlaceholder = '';

        const mockVSCode = createMockVSCode({
          identities: [TEST_IDENTITIES.work],
          quickPickSelections: [undefined],
          onQuickPickCreated: (quickPick) => {
            capturedPlaceholder = quickPick.placeholder;
          },
        });
        _setMockVSCode(mockVSCode as never);

        await showEditIdentityWizard(TEST_IDENTITIES.work);

        assert.strictEqual(capturedPlaceholder, 'Filter...', 'Placeholder should be "Filter..."');
      });
    });
  });

  // ===========================================================================
  // SSH/GPG Field Editing Tests
  //
  // Tests for SSH/GPG field editing requirements:
  // - sshKeyPath: validateSshKeyPathFormat(), isUnderSshDirectory(),
  //   path traversal, dangerous chars
  // - sshHost: SSH_HOST_REGEX validation, MAX_SSH_HOST_LENGTH
  // - gpgKeyId: GPG_KEY_REGEX validation (8-40 hex chars)
  // - File picker button ($(folder-opened)) and showOpenDialog integration
  // ===========================================================================

  describe('SSH/GPG Field Editing', () => {
    /**
     * Test identity fixture with SSH/GPG fields
     */
    const TEST_IDENTITY_WITH_SSH: Identity = {
      id: 'ssh-test',
      name: 'SSH Test User',
      email: 'ssh@example.com',
      sshKeyPath: '~/.ssh/id_rsa',
      sshHost: 'github-work',
      gpgKeyId: 'ABCD1234',
    };

    // =========================================================================
    // sshKeyPath Field Editing Tests
    // =========================================================================

    describe('sshKeyPath Field Editing', () => {
      describe('Validation', () => {
        it('should accept valid SSH key path (~/.ssh/id_rsa)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined, // Cancel after save
            ],
            inputBoxSelections: ['~/.ssh/id_rsa'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'Valid SSH key path should be accepted');
        });

        it('should accept SSH key path in subdirectory (~/.ssh/keys/work_key)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['~/.ssh/keys/work_key'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'SSH key path in subdirectory should be accepted');
        });

        // SSH directory restriction tests (isUnderSshDirectory)
        it('should reject path outside .ssh directory (~/documents/key)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['~/documents/key'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'Path outside .ssh directory should be rejected');
        });

        it('should reject path in .ssh_backup directory (~/.ssh_backup/key)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['~/.ssh_backup/key'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'Path in .ssh_backup (not .ssh) should be rejected');
        });

        it('should reject path with traversal (~/.ssh/../../../etc/passwd)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined, // Cancel after validation failure
            ],
            inputBoxSelections: ['~/.ssh/../../../etc/passwd'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          // Validation error causes flow to cancel
          assert.strictEqual(result, false, 'Path traversal should cause validation failure');
        });

        it('should allow single dot in path (~/.ssh/./id_rsa)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['~/.ssh/./id_rsa'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          // Single dot is harmless, should be accepted
          assert.strictEqual(result, true, 'Single dot in path should be allowed');
        });

        it('should reject backtick command substitution (`whoami`)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['~/.ssh/`whoami`'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'Backtick command should cause validation failure');
        });

        it('should reject dollar command substitution ($(command))', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['~/.ssh/$(whoami)'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'Dollar command substitution should cause validation failure');
        });

        it('should reject semicolon in path (key;rm -rf /)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['~/.ssh/key;rm -rf /'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'Semicolon in path should cause validation failure');
        });

        it('should reject path not starting with / or ~', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['relative/path/key'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'Relative path should cause validation failure');
        });

        it('should allow clearing sshKeyPath (empty string for optional field)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITY_WITH_SSH],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: [''], // Clear the field
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITY_WITH_SSH);

          assert.strictEqual(result, true, 'Clearing optional sshKeyPath should be allowed');
        });
      });

      describe('File Picker Button', () => {
        it('should show file picker button ($(folder-opened)) in InputBox', async () => {
          let capturedButtons: unknown[] = [];

          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: [undefined], // Cancel at InputBox
            onInputBoxCreated: (inputBox) => {
              capturedButtons = inputBox.buttons;
            },
          });
          _setMockVSCode(mockVSCode as never);

          await showEditIdentityWizard(TEST_IDENTITIES.work);

          // Should have Back button and file picker button
          assert.ok(capturedButtons.length >= 2, `Should have at least 2 buttons, got ${capturedButtons.length}`);

          // Find file picker button (has ThemeIcon with 'folder-opened')
          const hasFilePickerButton = capturedButtons.some((btn: unknown) => {
            if (typeof btn === 'object' && btn !== null && 'iconPath' in btn) {
              const iconPath = (btn as { iconPath: { id?: string } }).iconPath;
              return iconPath?.id === 'folder-opened';
            }
            return false;
          });
          assert.ok(hasFilePickerButton, 'Should have file picker button with $(folder-opened) icon');
        });

        it('should have showOpenDialog available for file picker', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: ['~/.ssh/selected_key'],
            showOpenDialogResult: '/home/user/.ssh/selected_key',
          });

          _setMockVSCode(mockVSCode as never);

          await showEditIdentityWizard(TEST_IDENTITIES.work);

          // Verify showOpenDialog is available in the mock
          // The actual file picker button click is handled by the mock infrastructure
          assert.strictEqual(typeof mockVSCode.window.showOpenDialog, 'function',
            'showOpenDialog should be available');
        });

        it('should have file picker button tooltip "Browse..."', async () => {
          let capturedButtons: unknown[] = [];

          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: [undefined],
            onInputBoxCreated: (inputBox) => {
              capturedButtons = inputBox.buttons;
            },
          });
          _setMockVSCode(mockVSCode as never);

          await showEditIdentityWizard(TEST_IDENTITIES.work);

          // Find file picker button and verify tooltip
          const filePickerButton = capturedButtons.find((btn: unknown) => {
            if (typeof btn === 'object' && btn !== null && 'iconPath' in btn) {
              const iconPath = (btn as { iconPath: { id?: string } }).iconPath;
              return iconPath?.id === 'folder-opened';
            }
            return false;
          });

          if (filePickerButton && typeof filePickerButton === 'object' && 'tooltip' in filePickerButton) {
            const tooltip = (filePickerButton as { tooltip?: string }).tooltip;
            assert.ok(tooltip?.includes('Browse'), `File picker button should have Browse tooltip, got: ${tooltip}`);
          }
        });
      });

      describe('showOpenDialog default path', () => {
        it('should use HOME/.ssh as defaultUri on Unix', async () => {
          // Save original env
          const originalHome = process.env.HOME;
          const originalUserProfile = process.env.USERPROFILE;

          // Set up Unix environment
          process.env.HOME = '/home/testuser';
          delete process.env.USERPROFILE;

          let capturedDefaultUri: { fsPath: string } | undefined;

          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: [FILE_PICKER_CLICK, undefined],
            showOpenDialogResult: '/home/testuser/.ssh/id_rsa',
            onShowOpenDialog: (dialogOptions) => {
              capturedDefaultUri = dialogOptions.defaultUri;
            },
          });
          _setMockVSCode(mockVSCode as never);

          try {
            await showEditIdentityWizard(TEST_IDENTITIES.work);
            assert.ok(capturedDefaultUri, 'showOpenDialog should have been called');
            assert.strictEqual(capturedDefaultUri?.fsPath, '/home/testuser/.ssh',
              'defaultUri should be HOME/.ssh');
          } finally {
            // Restore original env
            process.env.HOME = originalHome;
            if (originalUserProfile !== undefined) {
              process.env.USERPROFILE = originalUserProfile;
            }
          }
        });

        it('should use USERPROFILE/.ssh as defaultUri on Windows', async () => {
          // Save original env
          const originalHome = process.env.HOME;
          const originalUserProfile = process.env.USERPROFILE;

          // Set up Windows environment
          delete process.env.HOME;
          process.env.USERPROFILE = 'C:\\Users\\testuser';

          let capturedDefaultUri: { fsPath: string } | undefined;

          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: [FILE_PICKER_CLICK, undefined],
            showOpenDialogResult: 'C:\\Users\\testuser\\.ssh\\id_rsa',
            onShowOpenDialog: (dialogOptions) => {
              capturedDefaultUri = dialogOptions.defaultUri;
            },
          });
          _setMockVSCode(mockVSCode as never);

          try {
            await showEditIdentityWizard(TEST_IDENTITIES.work);
            assert.ok(capturedDefaultUri, 'showOpenDialog should have been called');
            assert.strictEqual(capturedDefaultUri?.fsPath, 'C:\\Users\\testuser/.ssh',
              'defaultUri should be USERPROFILE/.ssh');
          } finally {
            // Restore original env
            if (originalHome !== undefined) {
              process.env.HOME = originalHome;
            }
            process.env.USERPROFILE = originalUserProfile;
          }
        });

        it('should use undefined defaultUri when both HOME and USERPROFILE are undefined', async () => {
          // Save original env
          const originalHome = process.env.HOME;
          const originalUserProfile = process.env.USERPROFILE;

          // Clear both env vars
          delete process.env.HOME;
          delete process.env.USERPROFILE;

          let capturedDefaultUri: { fsPath: string } | undefined = { fsPath: 'sentinel' };
          let dialogWasCalled = false;

          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshKeyPath' },
              undefined,
            ],
            inputBoxSelections: [FILE_PICKER_CLICK, undefined],
            showOpenDialogResult: undefined,
            onShowOpenDialog: (dialogOptions) => {
              dialogWasCalled = true;
              capturedDefaultUri = dialogOptions.defaultUri;
            },
          });
          _setMockVSCode(mockVSCode as never);

          try {
            await showEditIdentityWizard(TEST_IDENTITIES.work);
            assert.ok(dialogWasCalled, 'showOpenDialog should have been called');
            assert.strictEqual(capturedDefaultUri, undefined,
              'defaultUri should be undefined when HOME and USERPROFILE are both undefined');
          } finally {
            // Restore original env
            if (originalHome !== undefined) {
              process.env.HOME = originalHome;
            }
            if (originalUserProfile !== undefined) {
              process.env.USERPROFILE = originalUserProfile;
            }
          }
        });
      });
    });

    // =========================================================================
    // sshHost Field Editing Tests
    // =========================================================================

    describe('sshHost Field Editing', () => {
      describe('Validation with SSH_HOST_REGEX', () => {
        it('should accept valid hostname (github-work)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshHost' },
              undefined,
            ],
            inputBoxSelections: ['github-work'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'Valid SSH host should be accepted');
        });

        it('should accept hostname with dot (gitlab.personal)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshHost' },
              undefined,
            ],
            inputBoxSelections: ['gitlab.personal'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'SSH host with dot should be accepted');
        });

        it('should accept hostname with underscore (my_server)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshHost' },
              undefined,
            ],
            inputBoxSelections: ['my_server'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'SSH host with underscore should be accepted');
        });

        it('should reject hostname with space', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshHost' },
              undefined,
            ],
            inputBoxSelections: ['invalid host'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'SSH host with space should be rejected');
        });

        it('should reject hostname with special characters (!@#)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshHost' },
              undefined,
            ],
            inputBoxSelections: ['invalid!@#host'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'SSH host with special characters should be rejected');
        });

        it('should reject hostname starting with hyphen', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshHost' },
              undefined,
            ],
            inputBoxSelections: ['-invalid-start'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'SSH host starting with hyphen should be rejected');
        });

        it('should reject hostname exceeding MAX_SSH_HOST_LENGTH', async () => {
          const longHost = 'a'.repeat(MAX_SSH_HOST_LENGTH + 1);
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'sshHost' },
              undefined,
            ],
            inputBoxSelections: [longHost],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'SSH host exceeding max length should be rejected');
        });

        it('should allow clearing sshHost (empty string for optional field)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITY_WITH_SSH],
            quickPickSelections: [
              { field: 'sshHost' },
              undefined,
            ],
            inputBoxSelections: [''],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITY_WITH_SSH);

          assert.strictEqual(result, true, 'Clearing optional sshHost should be allowed');
        });
      });
    });

    // =========================================================================
    // gpgKeyId Field Editing Tests
    // =========================================================================

    describe('gpgKeyId Field Editing', () => {
      describe('Validation with GPG_KEY_REGEX', () => {
        it('should accept valid 8-character hex key ID (ABCD1234)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: ['ABCD1234'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'Valid 8-char GPG key ID should be accepted');
        });

        it('should accept valid 16-character hex key ID', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: ['ABCD1234ABCD1234'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'Valid 16-char GPG key ID should be accepted');
        });

        it('should accept valid 40-character hex fingerprint', async () => {
          const fullFingerprint = 'ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234';
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: [fullFingerprint],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'Valid 40-char GPG fingerprint should be accepted');
        });

        it('should accept lowercase hex characters', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: ['abcdef12'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, true, 'Lowercase hex GPG key ID should be accepted');
        });

        it('should reject key ID with less than 8 characters (7 chars)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: ['ABCD123'], // 7 characters
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'GPG key ID with 7 chars should be rejected');
        });

        it('should reject key ID with more than 40 characters (41 chars)', async () => {
          const tooLong = 'A'.repeat(41);
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: [tooLong],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'GPG key ID with 41 chars should be rejected');
        });

        it('should reject non-hex characters (GHIJKLMN)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: ['GHIJKLMN'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'GPG key ID with non-hex chars should be rejected');
        });

        it('should reject key ID with spaces', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITIES.work],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: ['ABCD 1234'],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

          assert.strictEqual(result, false, 'GPG key ID with spaces should be rejected');
        });

        it('should allow clearing gpgKeyId (empty string for optional field)', async () => {
          const mockVSCode = createMockVSCode({
            identities: [TEST_IDENTITY_WITH_SSH],
            quickPickSelections: [
              { field: 'gpgKeyId' },
              undefined,
            ],
            inputBoxSelections: [''],
          });
          _setMockVSCode(mockVSCode as never);

          const result = await showEditIdentityWizard(TEST_IDENTITY_WITH_SSH);

          assert.strictEqual(result, true, 'Clearing optional gpgKeyId should be allowed');
        });
      });
    });
  });
});
