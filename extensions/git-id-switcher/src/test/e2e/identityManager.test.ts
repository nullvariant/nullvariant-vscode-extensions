/**
 * E2E Tests for Identity Manager UI
 *
 * Tests for identityManager.ts UI functionality including:
 * - showAddIdentityWizard() multi-step input with Esc-back navigation
 * - showEditIdentityWizard() field editing with targetIdentity support
 * - validateInput integration with security validators
 * - MAX_IDENTITIES limit enforcement
 * - getUserSafeMessage error handling
 *
 * Test Categories:
 * - Add Wizard Flow: 3-step wizard with Esc-back support
 * - Edit Wizard Flow: Field editing with optional identity selection skip
 * - validateInput Integration: Security validator usage verification
 * - Security: Dangerous character detection, length limits
 * - Error Handling: getUserSafeMessage integration
 *
 * Test Count: 19 tests covering identityManager.ts functionality
 *
 * Note: These tests use mocked VS Code API via vscodeLoader since
 * UI interactions require VS Code window API.
 */

import * as assert from 'node:assert';
import { showAddIdentityWizard, showEditIdentityWizard } from '../../ui/identityManager';
import { _setMockVSCode, _resetCache } from '../../core/vscodeLoader';
import { MAX_IDENTITIES, MAX_NAME_LENGTH, MAX_EMAIL_LENGTH } from '../../core/constants';
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
 * Create a mock VS Code API for identity manager tests
 */
function createMockVSCode(options: {
  identities?: Identity[];
  showQuickPickResult?: { identity?: Identity; field?: keyof Identity } | undefined;
  showInputBoxResults?: (string | undefined)[];
  configUpdateError?: Error;
  quickPickSelections?: unknown[];
}) {
  const showWarningMessageCalls: string[] = [];
  const showInformationMessageCalls: string[] = [];
  const showErrorMessageCalls: string[] = [];
  const configUpdateCalls: { key: string; value: unknown }[] = [];
  let inputBoxCallIndex = 0;
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
      createQuickPick: <T>() => {
        let quickPickSelectionIndex = 0;
        let acceptCallback: (() => void) | undefined;
        let buttonCallback: ((button: unknown) => void) | undefined;
        let hideCallback: (() => void) | undefined;
        let _items: T[] = [];
        let _selectedItems: T[] = [];

        return {
          title: '',
          placeholder: '',
          buttons: [] as unknown[],
          get items() { return _items; },
          set items(value: T[]) { _items = value; },
          get selectedItems() { return _selectedItems; },
          show: () => {
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
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: ['test-id', 'Test User', 'test@example.com'],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, true, 'Should return true on success');
      const infoCalls = mockVSCode._getShowInformationMessageCalls();
      assert.ok(infoCalls.length >= 1, 'Should show success message');
    });

    it('should return false when step 1 cancelled (Esc)', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: [undefined], // Cancel at step 1
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, false, 'Should return false when cancelled at step 1');
    });
  });

  describe('Add Wizard: Esc-back Navigation', () => {
    it('should go back to step 1 when Esc pressed at step 2, preserving ID value', async () => {
      // Simulate: enter ID → Esc at step 2 → re-enter ID → continue
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: [
          'my-id',      // Step 1: enter ID
          undefined,    // Step 2: Esc (back to step 1)
          'my-id',      // Step 1 again: ID should be preserved
          'My Name',    // Step 2: enter name
          'my@test.com', // Step 3: enter email
        ],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(result, true, 'Should complete successfully after back-navigation');
      // Verify that inputBox was called 5 times (back-navigation increases calls)
      assert.ok(mockVSCode._getInputBoxCallIndex() >= 4, 'Should call inputBox multiple times due to back-navigation');
    });

    it('should go back to step 2 when Esc pressed at step 3, preserving Name value', async () => {
      // Simulate: enter all → Esc at step 3 → re-enter email
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: [
          'my-id',       // Step 1: enter ID
          'My Name',     // Step 2: enter name
          undefined,     // Step 3: Esc (back to step 2)
          'My Name',     // Step 2 again: name preserved
          'my@test.com', // Step 3: enter email
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
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work, TEST_IDENTITIES.personal],
        showQuickPickResult: { field: 'name' }, // Field selection
        showInputBoxResults: ['Updated Name'],
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
        showQuickPickResult: { field: 'email' },
        showInputBoxResults: ['new@example.com'],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

      assert.strictEqual(result, true, 'Should return true (boolean)');
    });

    it('should return false when field selection cancelled (Esc)', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showQuickPickResult: undefined, // Cancel field selection
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

      assert.strictEqual(result, false, 'Should return false when cancelled');
    });
  });

  describe('Edit Wizard: Esc-back Navigation', () => {
    it('should go back to field selection when Esc pressed at value input', async () => {
      // First attempt: select field, Esc at value
      // Second attempt: select field, enter value
      let quickPickCallCount = 0;
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showQuickPickResult: { field: 'name' },
        showInputBoxResults: [
          undefined,      // First: Esc at value input
          'Updated Name', // Second: enter value
        ],
      });

      // Override showQuickPick to track calls
      const originalShowQuickPick = mockVSCode.window.showQuickPick;
      mockVSCode.window.showQuickPick = async (...args) => {
        quickPickCallCount++;
        return originalShowQuickPick(...args);
      };

      _setMockVSCode(mockVSCode as never);

      const result = await showEditIdentityWizard(TEST_IDENTITIES.work);

      assert.strictEqual(result, true, 'Should complete after back-navigation');
      assert.ok(quickPickCallCount >= 2, 'Should call showQuickPick multiple times due to back-navigation');
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
        showInputBoxResults: ['id', 'name', 'email@test.com'],
      });
      _setMockVSCode(mockVSCode as never);

      const result = await showAddIdentityWizard();

      assert.strictEqual(typeof result, 'boolean', 'Return type should be boolean');
    });
  });

  // ===========================================================================
  // Security: validateInput Integration Tests
  // ===========================================================================

  describe('Security: ID Input Validation', () => {
    it('should return error for ID with invalid characters (symbols)', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: [undefined], // Cancel
      });
      _setMockVSCode(mockVSCode as never);

      await showAddIdentityWizard();

      const validateInput = mockVSCode._getLastValidateInput();
      assert.ok(validateInput, 'validateInput should be captured');

      // Test invalid characters
      const result = validateInput('id@with#symbols!');
      assert.ok(result !== null, 'ID with symbols should return error');
    });

    it('should return error for duplicate ID', async () => {
      const mockVSCode = createMockVSCode({
        identities: [TEST_IDENTITIES.work],
        showInputBoxResults: [undefined], // Cancel
      });
      _setMockVSCode(mockVSCode as never);

      await showAddIdentityWizard();

      const validateInput = mockVSCode._getLastValidateInput();
      assert.ok(validateInput, 'validateInput should be captured');

      const result = validateInput('work'); // Duplicate
      assert.ok(result !== null, 'Duplicate ID should return error');
      assert.ok(result?.includes('exists') || result?.includes('already'), 'Error should mention exists');
    });
  });

  describe('Security: Name Input Validation', () => {
    it('should return error for name with dangerous characters ($, backtick)', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: ['valid-id', undefined], // Cancel at name
      });
      _setMockVSCode(mockVSCode as never);

      await showAddIdentityWizard();

      const validateInput = mockVSCode._getLastValidateInput();
      assert.ok(validateInput, 'validateInput should be captured');

      // Test dangerous characters
      const dollarResult = validateInput('User $HOME');
      assert.ok(dollarResult !== null, 'Name with $ should return error');

      const backtickResult = validateInput('User `whoami`');
      assert.ok(backtickResult !== null, 'Name with backtick should return error');
    });

    it('should return error for name exceeding MAX_NAME_LENGTH', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: ['valid-id', undefined], // Cancel at name
      });
      _setMockVSCode(mockVSCode as never);

      await showAddIdentityWizard();

      const validateInput = mockVSCode._getLastValidateInput();
      assert.ok(validateInput, 'validateInput should be captured');

      const longName = 'a'.repeat(MAX_NAME_LENGTH + 1);
      const result = validateInput(longName);
      assert.ok(result !== null, 'Name exceeding max length should return error');
    });
  });

  describe('Security: Email Input Validation', () => {
    it('should return error for invalid email format', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: ['valid-id', 'Valid Name', 'valid@example.com'], // Complete wizard
      });
      _setMockVSCode(mockVSCode as never);

      await showAddIdentityWizard();

      // Use getAllValidateInputs to get the email validator (index 2)
      const allValidators = mockVSCode._getAllValidateInputs();
      const emailValidator = allValidators[2];
      assert.ok(emailValidator, 'Email validateInput should be captured');

      const result = emailValidator('notanemail');
      assert.ok(result !== null, 'Invalid email should return error');
    });

    it('should return error for email exceeding MAX_EMAIL_LENGTH', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: ['valid-id', 'Valid Name', 'valid@example.com'], // Complete wizard
      });
      _setMockVSCode(mockVSCode as never);

      await showAddIdentityWizard();

      // Use getAllValidateInputs to get the email validator (index 2)
      const allValidators = mockVSCode._getAllValidateInputs();
      const emailValidator = allValidators[2];
      assert.ok(emailValidator, 'Email validateInput should be captured');

      const longEmail = 'a'.repeat(MAX_EMAIL_LENGTH) + '@example.com';
      const result = emailValidator(longEmail);
      assert.ok(result !== null, 'Email exceeding max length should return error');
    });
  });

  describe('Security: validateInput - Valid Values', () => {
    it('should return null (no error) for valid input values', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: ['valid-id', 'Valid Name', 'valid@example.com'],
      });
      _setMockVSCode(mockVSCode as never);

      await showAddIdentityWizard();

      const allValidators = mockVSCode._getAllValidateInputs();

      // ID validator (first)
      if (allValidators[0]) {
        const idResult = allValidators[0]('new-valid-id');
        assert.strictEqual(idResult, null, 'Valid ID should return null');
      }

      // Name validator (second)
      if (allValidators[1]) {
        const nameResult = allValidators[1]('Valid Name');
        assert.strictEqual(nameResult, null, 'Valid name should return null');
      }

      // Email validator (third)
      if (allValidators[2]) {
        const emailResult = allValidators[2]('valid@example.com');
        assert.strictEqual(emailResult, null, 'Valid email should return null');
      }
    });

    it('should return error for empty string inputs', async () => {
      const mockVSCode = createMockVSCode({
        identities: [],
        showInputBoxResults: [undefined], // Cancel at ID
      });
      _setMockVSCode(mockVSCode as never);

      await showAddIdentityWizard();

      const validateInput = mockVSCode._getLastValidateInput();
      assert.ok(validateInput, 'validateInput should be captured');

      const result = validateInput('');
      assert.ok(result !== null, 'Empty string should return error');
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
});
