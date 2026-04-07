/**
 * Tests for validation-types module (toFieldError)
 */

import * as assert from 'node:assert';
import { toFieldError } from '../core/validation-types';
import { MAX_ERROR_STRING_LENGTH } from '../core/constants';

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

  // === Defensive design tests (Issue-00116) ===

  // Should truncate oversized input (with colon separator)
  {
    const prefix = 'field: ';
    const oversized = prefix + 'x'.repeat(MAX_ERROR_STRING_LENGTH + 1000);
    const result = toFieldError(oversized);
    assert.strictEqual(result.field, 'field');
    // Truncation cuts the full input to MAX_ERROR_STRING_LENGTH, then splits on colon
    assert.strictEqual(result.message.length, MAX_ERROR_STRING_LENGTH - prefix.length);
    assert.strictEqual(result.message, 'x'.repeat(MAX_ERROR_STRING_LENGTH - prefix.length));
  }

  // Should truncate oversized input with no colon
  {
    const oversized = 'x'.repeat(MAX_ERROR_STRING_LENGTH + 500);
    const result = toFieldError(oversized);
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message.length, MAX_ERROR_STRING_LENGTH);
  }

  // Boundary: exactly MAX_ERROR_STRING_LENGTH (should NOT truncate)
  {
    const exact = 'x'.repeat(MAX_ERROR_STRING_LENGTH);
    const result = toFieldError(exact);
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message.length, MAX_ERROR_STRING_LENGTH);
  }

  // Boundary: MAX_ERROR_STRING_LENGTH + 1 (should truncate)
  {
    const overByOne = 'x'.repeat(MAX_ERROR_STRING_LENGTH + 1);
    const result = toFieldError(overByOne);
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message.length, MAX_ERROR_STRING_LENGTH);
  }

  // Should reject __proto__ field name
  {
    const result = toFieldError('__proto__: malicious payload');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, '__proto__: malicious payload');
  }

  // Should reject constructor field name
  {
    const result = toFieldError('constructor: malicious');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, 'constructor: malicious');
  }

  // Should reject prototype field name
  {
    const result = toFieldError('prototype: malicious');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, 'prototype: malicious');
  }

  // Should reject field names with NUL byte
  {
    const result = toFieldError('field\u0000name: value');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, 'field\u0000name: value');
  }

  // Should reject field names with control characters
  {
    const result = toFieldError('field\u0001: value');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, 'field\u0001: value');
  }

  // Should reject field names with newline
  {
    const result = toFieldError('field\ninjection: value');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, 'field\ninjection: value');
  }

  // Should reject field names with carriage return
  {
    const result = toFieldError('field\rinjection: value');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, 'field\rinjection: value');
  }

  // Should reject field names with tab (all control chars blocked)
  {
    const result = toFieldError('field\tname: value');
    assert.strictEqual(result.field, 'unknown');
    assert.strictEqual(result.message, 'field\tname: value');
  }

  console.log('✅ toFieldError tests passed!');
}

/**
 * Run all validation-types tests
 */
export async function runValidationTypesTests(): Promise<void> {
  console.log('\n=== Validation Types Tests ===\n');

  try {
    testToFieldError();

    console.log('\n✅ All validation-types tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runValidationTypesTests().catch(console.error);
}
