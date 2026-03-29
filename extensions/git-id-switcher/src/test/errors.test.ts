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
  isFatalError,
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

  // getInternalDetails should return a frozen copy (prevents audit log tampering)
  {
    const error = new SecurityError({
      category: ErrorCategory.VALIDATION,
      userMessage: 'Frozen test',
      internalDetails: {
        field: 'original',
        value: 'original-value',
      },
      autoLog: false,
    });

    const details = error.getInternalDetails();
    assert.ok(Object.isFrozen(details));
    assert.throws(
      () => {
        (details as Record<string, unknown>).field = 'tampered';
      },
      TypeError,
    );
    // Subsequent calls return fresh copies with original values
    assert.strictEqual(error.getInternalDetails().field, 'original');
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

    const safeStack = error.getSafeStack();
    if (safeStack) {
      // Should not contain /Users/username pattern (if macOS)
      assert.ok(!/\/Users\/[a-zA-Z0-9_-]+\//.test(safeStack));
    }
  }

  // error.stack should return sanitized stack (getter delegates to getSafeStack)
  {
    const error = new SecurityError({
      category: ErrorCategory.VALIDATION,
      userMessage: 'Test',
      autoLog: false,
    });

    const stack = error.stack;
    if (stack) {
      assert.ok(!/\/Users\/[a-zA-Z0-9_-]+\//.test(stack));
      assert.strictEqual(stack, error.getSafeStack());
    }
  }

  // error.stack access must not cause infinite recursion
  // Before the fix, Object.defineProperty getter called getSafeStack()
  // which read this.stack, triggering the getter again (V8-dependent)
  {
    const error = new SecurityError({
      category: ErrorCategory.VALIDATION,
      userMessage: 'Recursion test',
      autoLog: false,
    });

    // If infinite recursion exists, this would throw RangeError: Maximum call stack size exceeded
    let stack: string | undefined;
    assert.doesNotThrow(() => {
      stack = error.stack;
    });
    assert.ok(typeof stack === 'string');
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

  // createSystemError should wrap original error (with stack stripped for security)
  {
    const originalError = new Error('Original error');
    const error = createSystemError('System error', originalError);

    assert.strictEqual(error.category, ErrorCategory.SYSTEM);
    assert.strictEqual(error.userMessage, 'System error');

    const wrapped = error.getInternalDetails().originalError;
    assert.ok(wrapped instanceof Error);
    assert.strictEqual(wrapped?.message, 'Original error');
    assert.strictEqual(wrapped?.name, 'Error');
    // SECURITY: originalError.stack must not leak unsanitized paths
    assert.notStrictEqual(wrapped, originalError);
    // Stack must not carry over the original call site
    assert.notStrictEqual(wrapped?.stack, originalError.stack);
  }

  // wrapError should wrap Error instance (with stack stripped for security)
  {
    const originalError = new Error('Original');
    const error = wrapError(originalError, 'Wrapped error');

    assert.strictEqual(error.category, ErrorCategory.SYSTEM);
    assert.strictEqual(error.userMessage, 'Wrapped error');
    const wrapped = error.getInternalDetails().originalError;
    assert.ok(wrapped instanceof Error);
    assert.strictEqual(wrapped?.message, 'Original');
    // SECURITY: stack must not carry over the original call site
    assert.notStrictEqual(wrapped, originalError);
    assert.notStrictEqual(wrapped?.stack, originalError.stack);
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
 * Test isFatalError function
 */
function testIsFatalError(): void {
  console.log('Testing isFatalError...');

  // SECURITY category should be fatal
  {
    const error = new SecurityError({
      category: ErrorCategory.SECURITY,
      userMessage: 'Security violation',
      autoLog: false,
    });
    assert.strictEqual(isFatalError(error), true);
  }

  // Non-SECURITY categories should not be fatal
  {
    for (const category of [
      ErrorCategory.VALIDATION,
      ErrorCategory.SYSTEM,
      ErrorCategory.CONFIG,
    ]) {
      const error = new SecurityError({
        category,
        userMessage: 'Non-fatal',
        autoLog: false,
      });
      assert.strictEqual(isFatalError(error), false);
    }
  }

  // Regular Error should not be fatal
  {
    assert.strictEqual(isFatalError(new Error('regular')), false);
  }

  // Non-Error values should not be fatal
  {
    assert.strictEqual(isFatalError(null), false);
    assert.strictEqual(isFatalError('string'), false);
    assert.strictEqual(isFatalError(undefined), false);
  }

  console.log('✅ isFatalError tests passed!');
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
    testIsFatalError();
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
