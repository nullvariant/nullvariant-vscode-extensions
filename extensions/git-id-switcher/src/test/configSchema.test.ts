/**
 * Unit Tests for Config Schema Validation
 *
 * Tests the configSchema module functionality including:
 * - Empty string handling for optional fields
 * - Required field validation
 * - Malicious value rejection
 * - Length constraints (minLength, maxLength)
 * - Format validation (email, hex)
 * - Schema validation edge cases
 */

import * as assert from 'node:assert';
import {
  validateIdentitySchema,
  validateIdentitiesSchema,
  getSchemaDocumentation,
  IDENTITY_SCHEMA,
} from '../identity/configSchema';

/**
 * Test empty string handling for required fields
 *
 * SECURITY: Required fields (id, name, email) must NOT accept empty strings.
 * Empty string should be treated as "missing" and trigger a required field error.
 */
function testRequiredFieldsEmptyString(): void {
  console.log('Testing required fields with empty string...');

  // Test 1: Empty string for 'id' should fail
  {
    const identity = {
      id: '',
      name: 'Test User',
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Empty id should fail validation');
    assert.ok(
      result.errors.some(e => e.field === 'id' && e.message.includes('Required')),
      'Error should indicate id is required'
    );
  }

  // Test 2: Empty string for 'name' should fail
  {
    const identity = {
      id: 'test',
      name: '',
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Empty name should fail validation');
    assert.ok(
      result.errors.some(e => e.field === 'name' && e.message.includes('Required')),
      'Error should indicate name is required'
    );
  }

  // Test 3: Empty string for 'email' should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Empty email should fail validation');
    assert.ok(
      result.errors.some(e => e.field === 'email' && e.message.includes('Required')),
      'Error should indicate email is required'
    );
  }

  // Test 4: All required fields empty should fail with multiple errors
  {
    const identity = {
      id: '',
      name: '',
      email: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'All empty required fields should fail');
    assert.strictEqual(result.errors.length, 3, 'Should have 3 errors for 3 required fields');
  }

  console.log('  Required fields empty string tests passed!');
}

/**
 * Test empty string handling for optional fields
 *
 * Empty string should be treated as "not set" for optional fields.
 * This allows default config with "" values to pass validation without errors.
 */
function testOptionalFieldsEmptyString(): void {
  console.log('Testing optional fields with empty string...');

  // Test 1: Empty string for 'service' should pass (treated as not set)
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      service: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Empty service should pass (treated as not set)');
    assert.strictEqual(result.errors.length, 0, 'No errors for empty service');
  }

  // Test 2: Empty string for 'sshKeyPath' should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshKeyPath: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Empty sshKeyPath should pass (treated as not set)');
    assert.strictEqual(result.errors.length, 0, 'No errors for empty sshKeyPath');
  }

  // Test 3: Empty string for 'sshHost' should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshHost: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Empty sshHost should pass (treated as not set)');
    assert.strictEqual(result.errors.length, 0, 'No errors for empty sshHost');
  }

  // Test 4: Empty string for 'gpgKeyId' should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Empty gpgKeyId should pass (treated as not set)');
    assert.strictEqual(result.errors.length, 0, 'No errors for empty gpgKeyId');
  }

  // Test 5: Empty string for 'description' should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      description: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Empty description should pass (treated as not set)');
    assert.strictEqual(result.errors.length, 0, 'No errors for empty description');
  }

  // Test 6: Empty string for 'icon' should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      icon: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Empty icon should pass (treated as not set)');
    assert.strictEqual(result.errors.length, 0, 'No errors for empty icon');
  }

  // Test 7: All optional fields empty should pass (default config scenario)
  {
    const identity = {
      id: 'example',
      name: 'Example User',
      email: 'example@example.com',
      service: '',
      sshKeyPath: '',
      sshHost: '',
      gpgKeyId: '',
      description: '',
      icon: '',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'All empty optional fields should pass');
    assert.strictEqual(result.errors.length, 0, 'No errors when all optional fields are empty');
  }

  console.log('  Optional fields empty string tests passed!');
}

/**
 * Test malicious value rejection
 *
 * SECURITY: Malicious values (command injection, etc.) must be blocked
 * even when the empty string check is in place.
 */
function testMaliciousValueRejection(): void {
  console.log('Testing malicious value rejection...');

  // Test 1: Command injection in sshKeyPath should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshKeyPath: '$(rm -rf /)',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Command injection in sshKeyPath should fail');
    assert.ok(
      result.errors.some(e => e.field === 'sshKeyPath'),
      'Error should mention sshKeyPath field'
    );
  }

  // Test 2: Backtick injection in name should fail
  {
    const identity = {
      id: 'test',
      name: 'test`id`',
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Backtick injection in name should fail');
    assert.ok(
      result.errors.some(e => e.field === 'name'),
      'Error should mention name field'
    );
  }

  // Test 3: Pipe command in name should fail
  {
    const identity = {
      id: 'test',
      name: 'Test | cat /etc/passwd',
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Pipe command in name should fail');
  }

  // Test 4: Command substitution in service should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      service: '$(whoami)',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Command substitution in service should fail');
  }

  // Test 5: Shell metacharacters in description should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      description: 'Test & echo attack',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Shell metacharacters in description should fail');
  }

  // Test 6: Path traversal in sshKeyPath
  // Note: configSchema.ts pattern does NOT detect path traversal (..)
  // Path traversal detection is done in validation.ts (validateSshKeyPath)
  // This is by design: configSchema handles format validation, validation.ts handles security
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshKeyPath: '/home/../etc/passwd',
    };
    const result = validateIdentitySchema(identity);
    // configSchema.ts allows this because pattern only checks for dangerous chars
    // The path traversal check is in validation.ts
    assert.strictEqual(result.valid, true, 'configSchema does not check path traversal (validation.ts does)');
  }

  // Test 7: Relative path in sshKeyPath should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshKeyPath: 'relative/path/key',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Relative path in sshKeyPath should fail');
  }

  // Test 8: Invalid sshHost format should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshHost: '-invalid-start',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Invalid sshHost format should fail');
  }

  // Test 9: Non-hex gpgKeyId should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'not-hex-value',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Non-hex gpgKeyId should fail');
  }

  console.log('  Malicious value rejection tests passed!');
}

/**
 * Test whitespace handling
 *
 * Whitespace-only values pass pattern validation but may be treated differently.
 * This behavior is outside current scope but worth documenting via tests.
 */
function testWhitespaceHandling(): void {
  console.log('Testing whitespace handling...');

  // Test 1: Whitespace-only service (passes pattern, may be UX issue but not security)
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      service: '   ',
    };
    const result = validateIdentitySchema(identity);
    // Current behavior: whitespace passes pattern validation
    // This is noted as potential UX improvement in PRD but not a security issue
    assert.strictEqual(result.valid, true, 'Whitespace-only service passes current pattern');
  }

  // Test 2: Whitespace-only id should fail (still needs to match pattern)
  {
    const identity = {
      id: '   ',
      name: 'Test User',
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Whitespace-only id should fail pattern check');
  }

  console.log('  Whitespace handling tests passed!');
}

/**
 * Test validateIdentitySchema edge cases
 */
function testValidateIdentitySchemaEdgeCases(): void {
  console.log('Testing validateIdentitySchema edge cases...');

  // Test 1: null input should fail
  {
    const result = validateIdentitySchema(null);
    assert.strictEqual(result.valid, false, 'null input should fail');
    assert.ok(
      result.errors.some(e => e.field === 'root'),
      'Error should mention root for null input'
    );
  }

  // Test 2: undefined input should fail
  {
    const result = validateIdentitySchema(undefined);
    assert.strictEqual(result.valid, false, 'undefined input should fail');
  }

  // Test 3: Array input should fail
  {
    const result = validateIdentitySchema([]);
    assert.strictEqual(result.valid, false, 'Array input should fail');
  }

  // Test 4: Primitive input should fail
  {
    const result = validateIdentitySchema('string');
    assert.strictEqual(result.valid, false, 'String input should fail');
  }

  // Test 5: Unknown field should be flagged
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      unknownField: 'value',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Unknown field should fail');
    assert.ok(
      result.errors.some(e => e.field === 'unknownField' && e.message.includes('Unknown')),
      'Error should mention unknown field'
    );
  }

  // Test 6: Too many fields should fail (DoS protection)
  {
    const identity: Record<string, unknown> = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
    };
    // Add 101 unknown fields
    for (let i = 0; i < 101; i++) {
      identity[`field${i}`] = 'value';
    }
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Too many fields should fail');
    assert.ok(
      result.errors.some(e => e.message.includes('too many fields')),
      'Error should mention too many fields'
    );
  }

  // Test 7: Valid identity with all fields should pass
  {
    const identity = {
      id: 'work',
      icon: '👔',
      name: 'John Doe',
      service: 'GitHub',
      email: 'john@company.com',
      description: 'Work account',
      sshKeyPath: '~/.ssh/id_work',
      sshHost: 'github.com-work',
      gpgKeyId: 'ABCD1234',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Valid identity with all fields should pass');
    assert.strictEqual(result.errors.length, 0, 'No errors for valid identity');
  }

  // Test 8: null value in optional field should be treated as not set
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      service: null,
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'null in optional field should pass (treated as not set)');
  }

  // Test 9: undefined value in optional field should be treated as not set
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      service: undefined,
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'undefined in optional field should pass (treated as not set)');
  }

  // Test 10: null value in required field should fail
  {
    const identity = {
      id: 'test',
      name: null,
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'null in required field should fail');
    assert.ok(
      result.errors.some(e => e.field === 'name' && e.message.includes('Required')),
      'Error should indicate name is required'
    );
  }

  console.log('  validateIdentitySchema edge cases tests passed!');
}

/**
 * Test validateIdentitiesSchema
 */
function testValidateIdentitiesSchema(): void {
  console.log('Testing validateIdentitiesSchema...');

  // Test 1: Empty array should pass
  {
    const result = validateIdentitiesSchema([]);
    assert.strictEqual(result.valid, true, 'Empty array should pass');
  }

  // Test 2: Non-array input should fail
  {
    const result = validateIdentitiesSchema({});
    assert.strictEqual(result.valid, false, 'Non-array input should fail');
  }

  // Test 3: Array with valid identities should pass
  {
    const identities = [
      { id: 'personal', name: 'John', email: 'john@example.com' },
      { id: 'work', name: 'John Work', email: 'john@company.com' },
    ];
    const result = validateIdentitiesSchema(identities);
    assert.strictEqual(result.valid, true, 'Valid identities array should pass');
  }

  // Test 4: Duplicate IDs should fail
  {
    const identities = [
      { id: 'same', name: 'John', email: 'john@example.com' },
      { id: 'same', name: 'Jane', email: 'jane@example.com' },
    ];
    const result = validateIdentitiesSchema(identities);
    assert.strictEqual(result.valid, false, 'Duplicate IDs should fail');
    assert.ok(
      result.errors.some(e => e.message.includes('Duplicate')),
      'Error should mention duplicate'
    );
  }

  // Test 5: Array with one invalid identity should fail
  {
    const identities = [
      { id: 'valid', name: 'John', email: 'john@example.com' },
      { id: 'invalid', name: 'Test$(rm -rf /)', email: 'test@example.com' },
    ];
    const result = validateIdentitiesSchema(identities);
    assert.strictEqual(result.valid, false, 'Array with invalid identity should fail');
  }

  // Test 6: Array with empty string in optional field should pass
  {
    const identities = [
      {
        id: 'test',
        name: 'Test User',
        email: 'test@example.com',
        service: '',
        sshKeyPath: '',
      },
    ];
    const result = validateIdentitiesSchema(identities);
    assert.strictEqual(result.valid, true, 'Array with empty optional fields should pass');
  }

  console.log('  validateIdentitiesSchema tests passed!');
}

/**
 * Test getSchemaDocumentation
 */
function testGetSchemaDocumentation(): void {
  console.log('Testing getSchemaDocumentation...');

  const doc = getSchemaDocumentation();

  // Test 1: Should return a string
  {
    assert.strictEqual(typeof doc, 'string', 'Should return a string');
  }

  // Test 2: Should include all field names
  {
    const fieldNames = Object.keys(IDENTITY_SCHEMA);
    for (const field of fieldNames) {
      assert.ok(doc.includes(field), `Documentation should include field: ${field}`);
    }
  }

  // Test 3: Should indicate required fields
  {
    assert.ok(doc.includes('(required)'), 'Documentation should indicate required fields');
  }

  // Test 4: Should include type information
  {
    assert.ok(doc.includes('string'), 'Documentation should include type information');
  }

  console.log('  getSchemaDocumentation tests passed!');
}

/**
 * Test IDENTITY_SCHEMA structure
 */
function testIdentitySchemaStructure(): void {
  console.log('Testing IDENTITY_SCHEMA structure...');

  // Test 1: Required fields should be marked
  {
    const requiredFields = ['id', 'name', 'email'];
    for (const field of requiredFields) {
      assert.ok(IDENTITY_SCHEMA[field], `Schema should have field: ${field}`);
      assert.strictEqual(
        IDENTITY_SCHEMA[field].required,
        true,
        `${field} should be marked as required`
      );
    }
  }

  // Test 2: Optional fields should not be marked as required
  {
    const optionalFields = ['icon', 'service', 'description', 'sshKeyPath', 'sshHost', 'gpgKeyId'];
    for (const field of optionalFields) {
      assert.ok(IDENTITY_SCHEMA[field], `Schema should have field: ${field}`);
      assert.ok(
        !IDENTITY_SCHEMA[field].required,
        `${field} should not be marked as required`
      );
    }
  }

  // Test 3: All fields should have type and description
  {
    for (const [field, schema] of Object.entries(IDENTITY_SCHEMA)) {
      assert.ok(schema.type, `${field} should have type`);
      assert.ok(schema.description, `${field} should have description`);
    }
  }

  // Test 4: Fields with patterns should have valid regex
  {
    for (const [field, schema] of Object.entries(IDENTITY_SCHEMA)) {
      if (schema.pattern) {
        assert.doesNotThrow(
          () => new RegExp(schema.pattern as string),
          `${field} pattern should be valid regex`
        );
      }
    }
  }

  console.log('  IDENTITY_SCHEMA structure tests passed!');
}

/**
 * Test length constraints (minLength, maxLength)
 */
function testLengthConstraints(): void {
  console.log('Testing length constraints...');

  // Test 1: gpgKeyId too short (minLength: 8) should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'ABCD', // Only 4 chars, needs 8
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'gpgKeyId too short should fail');
    assert.ok(
      result.errors.some(e => e.field === 'gpgKeyId' && e.message.includes('at least')),
      'Error should mention minimum length'
    );
  }

  // Test 2: gpgKeyId at minimum length (8) should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'ABCD1234', // Exactly 8 chars
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'gpgKeyId at minimum length should pass');
  }

  // Test 3: gpgKeyId too long (maxLength: 40) should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'A'.repeat(41), // 41 chars, max is 40
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'gpgKeyId too long should fail');
    assert.ok(
      result.errors.some(e => e.field === 'gpgKeyId' && e.message.includes('maximum')),
      'Error should mention maximum length'
    );
  }

  // Test 4: id too long (maxLength: 64) should fail
  {
    const identity = {
      id: 'a'.repeat(65), // 65 chars, max is 64
      name: 'Test User',
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'id too long should fail');
    assert.ok(
      result.errors.some(e => e.field === 'id'),
      'Error should mention id field'
    );
  }

  // Test 5: name too long (maxLength: 256) should fail
  {
    const identity = {
      id: 'test',
      name: 'a'.repeat(257), // 257 chars, max is 256
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'name too long should fail');
    assert.ok(
      result.errors.some(e => e.field === 'name' && e.message.includes('maximum')),
      'Error should mention maximum length for name'
    );
  }

  // Test 6: email too long (maxLength: 320) should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'a'.repeat(310) + '@example.com', // Over 320 chars
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'email too long should fail');
    assert.ok(
      result.errors.some(e => e.field === 'email' && e.message.includes('maximum')),
      'Error should mention maximum length for email'
    );
  }

  // Test 7: description too long (maxLength: 500) should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      description: 'a'.repeat(501), // 501 chars, max is 500
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'description too long should fail');
    assert.ok(
      result.errors.some(e => e.field === 'description' && e.message.includes('maximum')),
      'Error should mention maximum length for description'
    );
  }

  // Test 8: sshHost too long (maxLength: 253) should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshHost: 'a'.repeat(254), // 254 chars, max is 253
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'sshHost too long should fail');
    assert.ok(
      result.errors.some(e => e.field === 'sshHost' && e.message.includes('maximum')),
      'Error should mention maximum length for sshHost'
    );
  }

  // Test 9: service too long (maxLength: 64) should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      service: 'a'.repeat(65), // 65 chars, max is 64
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'service too long should fail');
    assert.ok(
      result.errors.some(e => e.field === 'service' && e.message.includes('maximum')),
      'Error should mention maximum length for service'
    );
  }

  // Test 10: Boundary test - id at exactly maxLength (64) should pass
  {
    const identity = {
      id: 'a'.repeat(64), // Exactly 64 chars
      name: 'Test User',
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'id at exactly maxLength should pass');
  }

  // Test 11: Boundary test - gpgKeyId at exactly maxLength (40) should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'A'.repeat(40), // Exactly 40 hex chars (SHA-1 fingerprint)
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'gpgKeyId at exactly maxLength should pass');
  }

  // Test 12: Boundary test - sshHost at exactly maxLength (253) should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshHost: 'a'.repeat(253), // Exactly 253 chars (DNS max)
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'sshHost at exactly maxLength should pass');
  }

  console.log('  Length constraints tests passed!');
}

/**
 * Test format validation (email, hex, single-grapheme)
 */
function testFormatValidation(): void {
  console.log('Testing format validation...');

  // Test 1: Invalid email format should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'not-an-email',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Invalid email format should fail');
    assert.ok(
      result.errors.some(e => e.field === 'email' && e.message.includes('Invalid email')),
      'Error should mention invalid email format'
    );
  }

  // Test 2: Valid email format should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'user@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Valid email format should pass');
  }

  // Test 3: gpgKeyId with non-hex characters should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'GHIJKLMN', // G-N are not hex
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Non-hex gpgKeyId should fail');
    assert.ok(
      result.errors.some(e => e.field === 'gpgKeyId' && e.message.includes('hexadecimal')),
      'Error should mention hexadecimal requirement'
    );
  }

  // Test 4: Valid hex gpgKeyId should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'ABCDEF12',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Valid hex gpgKeyId should pass');
  }

  // Test 5: Single grapheme icon should pass
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      icon: '👔',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Single grapheme icon should pass');
  }

  // Test 6: Multiple grapheme icon should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      icon: '👔👔', // Two emojis
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Multiple grapheme icon should fail');
    assert.ok(
      result.errors.some(e => e.field === 'icon' && e.message.includes('single')),
      'Error should mention single character requirement'
    );
  }

  // Test 7: Complex composed emoji (ZWJ sequence) should pass as single grapheme
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      icon: '👨‍👩‍👧', // Family emoji (ZWJ sequence, single grapheme)
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'ZWJ composed emoji should pass as single grapheme');
  }

  // Test 8: Flag emoji should pass as single grapheme
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      icon: '🇯🇵', // Japan flag (regional indicator sequence)
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, true, 'Flag emoji should pass as single grapheme');
  }

  console.log('  Format validation tests passed!');
}

/**
 * Test type validation
 */
function testTypeValidation(): void {
  console.log('Testing type validation...');

  // Test 1: Wrong type for id should fail
  {
    const identity = {
      id: 123, // Should be string
      name: 'Test User',
      email: 'test@example.com',
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Number id should fail');
    assert.ok(
      result.errors.some(e => e.field === 'id' && e.message.includes('Expected string')),
      'Error should indicate type mismatch'
    );
  }

  // Test 2: Wrong type for optional field should fail
  {
    const identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      icon: 123, // Should be string
    };
    const result = validateIdentitySchema(identity);
    assert.strictEqual(result.valid, false, 'Number icon should fail');
  }

  console.log('  Type validation tests passed!');
}

/**
 * Run all configSchema tests
 */
export function runConfigSchemaTests(): void {
  console.log('\n=== Config Schema Tests ===\n');

  try {
    testRequiredFieldsEmptyString();
    testOptionalFieldsEmptyString();
    testMaliciousValueRejection();
    testWhitespaceHandling();
    testValidateIdentitySchemaEdgeCases();
    testValidateIdentitiesSchema();
    testGetSchemaDocumentation();
    testIdentitySchemaStructure();
    testLengthConstraints();
    testFormatValidation();
    testTypeValidation();

    console.log('\n  All configSchema tests passed!\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n  Test failed:', errorMessage);
    throw error;
  }
}

// Run tests when executed directly
if (require.main === module) {
  runConfigSchemaTests();
}
