/**
 * Tests for Security Error Classes
 */

import * as assert from 'node:assert';
import {
  SecurityError,
  ErrorCategory,
  createValidationError,
  createSecurityViolationError,
  createConfigError,
  createSystemError,
  wrapError,
  isSecurityError,
  getUserSafeMessage,
  toFieldError,
} from '../core/errors';

/**
 * Test SecurityError constructor
 */
function testSecurityErrorConstructor(): void {
  console.log('Testing SecurityError constructor...');

  // Should create error with user message
  {
    const error = new SecurityError({
      category: ErrorCategory.VALIDATION,
      userMessage: 'Test error message',
      autoLog: false, // Disable logging for tests
    });

    assert.strictEqual(error.message, 'Test error message');
    assert.strictEqual(error.userMessage, 'Test error message');
    assert.strictEqual(error.category, ErrorCategory.VALIDATION);
    assert.strictEqual(error.name, 'SecurityError');
  }

  // Should store internal details
  {
    const error = new SecurityError({
      category: ErrorCategory.SECURITY,
      userMessage: 'Security violation',
      internalDetails: {
        field: 'testField',
        value: 'sensitive-data',
        context: { key: 'value' },
      },
      autoLog: false,
    });

    const details = error.getInternalDetails();
    assert.strictEqual(details.field, 'testField');
    assert.strictEqual(details.value, 'sensitive-data');
    assert.deepStrictEqual(details.context, { key: 'value' });
  }

  // Should default to empty internal details
  {
    const error = new SecurityError({
      category: ErrorCategory.CONFIG,
      userMessage: 'Config error',
      autoLog: false,
    });

    const details = error.getInternalDetails();
    assert.deepStrictEqual(details, {});
  }

  console.log('✅ SecurityError constructor tests passed!');
}

/**
 * Test getUserMessage method
 */
function testGetUserMessage(): void {
  console.log('Testing getUserMessage...');

  const error = new SecurityError({
    category: ErrorCategory.SYSTEM,
    userMessage: 'User-safe message',
    autoLog: false,
  });

  assert.strictEqual(error.getUserMessage(), 'User-safe message');

  console.log('✅ getUserMessage tests passed!');
}

/**
 * Test getSafeStack method
 */
function testGetSafeStack(): void {
  console.log('Testing getSafeStack...');

  // Should sanitize paths
  {
    const error = new SecurityError({
      category: ErrorCategory.VALIDATION,
      userMessage: 'Test',
      autoLog: false,
    });

    const originalStack = error.stack;
    if (originalStack) {
      const safeStack = error.getSafeStack();
      assert.ok(safeStack);
      // Should not contain /Users/username pattern (if macOS)
      assert.ok(!safeStack.match(/\/Users\/[a-zA-Z0-9_-]+\//));
    }
  }

  // Should return undefined for empty stack
  {
    const error = new SecurityError({
      category: ErrorCategory.VALIDATION,
      userMessage: 'Test',
      autoLog: false,
    });

    // Force stack to be undefined
    error.stack = undefined;
    assert.strictEqual(error.getSafeStack(), undefined);
  }

  console.log('✅ getSafeStack tests passed!');
}

/**
 * Test factory functions
 */
function testFactoryFunctions(): void {
  console.log('Testing factory functions...');

  // createValidationError should create VALIDATION category
  {
    const error = createValidationError('Validation failed');
    assert.strictEqual(error.category, ErrorCategory.VALIDATION);
    assert.strictEqual(error.userMessage, 'Validation failed');
  }

  // createSecurityViolationError should create SECURITY category
  {
    const error = createSecurityViolationError('Security violation');
    assert.strictEqual(error.category, ErrorCategory.SECURITY);
    assert.strictEqual(error.userMessage, 'Security violation');
  }

  // createConfigError should create CONFIG category
  {
    const error = createConfigError('Config error');
    assert.strictEqual(error.category, ErrorCategory.CONFIG);
    assert.strictEqual(error.userMessage, 'Config error');
  }

  // createSystemError should wrap original error
  {
    const originalError = new Error('Original error');
    const error = createSystemError('System error', originalError);

    assert.strictEqual(error.category, ErrorCategory.SYSTEM);
    assert.strictEqual(error.userMessage, 'System error');
    assert.strictEqual(error.getInternalDetails().originalError, originalError);
  }

  // wrapError should wrap Error instance
  {
    const originalError = new Error('Original');
    const error = wrapError(originalError, 'Wrapped error');

    assert.strictEqual(error.category, ErrorCategory.SYSTEM);
    assert.strictEqual(error.userMessage, 'Wrapped error');
    assert.ok(error.getInternalDetails().originalError instanceof Error);
  }

  // wrapError should wrap non-Error values
  {
    const error = wrapError('string error', 'Wrapped error');

    assert.strictEqual(error.category, ErrorCategory.SYSTEM);
    assert.strictEqual(error.userMessage, 'Wrapped error');
    assert.ok(error.getInternalDetails().originalError instanceof Error);
    assert.strictEqual(
      error.getInternalDetails().originalError?.message,
      'string error'
    );
  }

  console.log('✅ Factory function tests passed!');
}

/**
 * Test type guards
 */
function testTypeGuards(): void {
  console.log('Testing type guards...');

  // isSecurityError should return true for SecurityError
  {
    const error = new SecurityError({
      category: ErrorCategory.VALIDATION,
      userMessage: 'Test',
      autoLog: false,
    });

    assert.strictEqual(isSecurityError(error), true);
  }

  // isSecurityError should return false for regular Error
  {
    const error = new Error('Regular error');
    assert.strictEqual(isSecurityError(error), false);
  }

  // isSecurityError should return false for non-Error values
  {
    assert.strictEqual(isSecurityError('string'), false);
    assert.strictEqual(isSecurityError(null), false);
    assert.strictEqual(isSecurityError(undefined), false);
    assert.strictEqual(isSecurityError(123), false);
  }

  console.log('✅ Type guard tests passed!');
}

/**
 * Test getUserSafeMessage function
 */
function testGetUserSafeMessageFunction(): void {
  console.log('Testing getUserSafeMessage function...');

  // Should return user message from SecurityError
  {
    const error = new SecurityError({
      category: ErrorCategory.VALIDATION,
      userMessage: 'Safe message',
      autoLog: false,
    });

    assert.strictEqual(getUserSafeMessage(error), 'Safe message');
  }

  // Should return generic message for regular Error
  {
    const error = new Error('Internal error details');
    assert.strictEqual(
      getUserSafeMessage(error),
      'An unexpected error occurred'
    );
  }

  // Should return generic message for non-Error values
  {
    assert.strictEqual(
      getUserSafeMessage('string'),
      'An unexpected error occurred'
    );
    assert.strictEqual(
      getUserSafeMessage(null),
      'An unexpected error occurred'
    );
  }

  console.log('✅ getUserSafeMessage function tests passed!');
}

/**
 * Test toFieldError function
 */
function testToFieldError(): void {
  console.log('Testing toFieldError...');

  // Should parse colon-separated format
  {
    const result = toFieldError('email: Invalid format');
    assert.strictEqual(result.field, 'email');
    assert.strictEqual(result.message, 'Invalid format');
  }

  // Should handle no colon (plain error message)
  {
    const result = toFieldError('Unknown error');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, 'Unknown error');
  }

  // Should handle empty string
  {
    const result = toFieldError('');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, '');
  }

  // Should handle multiple colons (only split on first)
  {
    const result = toFieldError('path: /home/user: invalid');
    assert.strictEqual(result.field, 'path');
    assert.strictEqual(result.message, '/home/user: invalid');
  }

  // Should handle colon with no message
  {
    const result = toFieldError('field:');
    assert.strictEqual(result.field, 'field');
    assert.strictEqual(result.message, '');
  }

  // Should handle colon at the beginning (empty field)
  {
    const result = toFieldError(': message only');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, ': message only');
  }

  // Should trim whitespace
  {
    const result = toFieldError('  name  :  has spaces  ');
    assert.strictEqual(result.field, 'name');
    assert.strictEqual(result.message, 'has spaces');
  }

  // Should handle whitespace-only field name
  {
    const result = toFieldError('   : message');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, '   : message');
  }

  console.log('✅ toFieldError tests passed!');
}

/**
 * Run all error tests
 */
export async function runErrorTests(): Promise<void> {
  console.log('\n=== Security Error Tests ===\n');

  try {
    testSecurityErrorConstructor();
    testGetUserMessage();
    testGetSafeStack();
    testFactoryFunctions();
    testTypeGuards();
    testGetUserSafeMessageFunction();
    testToFieldError();

    console.log('\n✅ All error tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runErrorTests().catch(console.error);
}
