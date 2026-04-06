/**
 * Tests for validation-types module (toFieldError)
 */

import * as assert from 'node:assert';
import { toFieldError } from '../core/validation-types';

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
