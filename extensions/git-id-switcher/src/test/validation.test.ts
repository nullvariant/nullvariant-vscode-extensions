/**
 * Security Tests for Input Validation
 *
 * Tests that malicious input is properly rejected.
 */

import * as assert from 'node:assert';
import { validateIdentity, validateIdentities, isPathSafe, validateFieldForDangerousPatterns } from '../identity/inputValidator';
import { hasDangerousChars } from '../validators/common';
import { Identity } from '../identity/identity';

/**
 * Test suite for validateIdentity
 */
function testValidateIdentity(): void {
  console.log('Testing validateIdentity...');

  // Test 1: Valid identity should pass
  {
    const validIdentity: Identity = {
      id: 'personal',
      name: 'John Doe',
      email: 'john@example.com',
    };
    const result = validateIdentity(validIdentity);
    assert.strictEqual(result.valid, true, 'Valid identity should pass');
    assert.strictEqual(result.errors.length, 0, 'No errors for valid identity');
  }

  // Test 2: Identity with all optional fields should pass
  {
    const fullIdentity: Identity = {
      id: 'work',
      icon: '👔',
      name: 'John Doe',
      email: 'john.doe@company.com',
      description: 'Work account',
      sshKeyPath: '~/.ssh/id_work',
      sshHost: 'github.com-work',
      gpgKeyId: 'ABCD1234',
    };
    const result = validateIdentity(fullIdentity);
    assert.strictEqual(result.valid, true, 'Full valid identity should pass');
  }

  // Test 2b: Identity with semicolon in name should pass (e.g., "Null;Variant")
  {
    const semicolonName: Identity = {
      id: 'nullvariant',
      icon: '🎭',
      name: 'Null;Variant',
      email: 'dev@nullvariant.com',
    };
    const result = validateIdentity(semicolonName);
    assert.strictEqual(result.valid, true, 'Semicolon in name should be allowed');
  }

  // Test 3: Command injection in name should fail
  // Note: semicolon is intentionally allowed (e.g., "Null;Variant")
  {
    const maliciousName: Identity = {
      id: 'malicious',
      name: 'test$(rm -rf ~)',
      email: 'test@example.com',
    };
    const result = validateIdentity(maliciousName);
    assert.strictEqual(result.valid, false, 'Command injection in name should fail');
    assert.ok(
      result.errors.some(e => e.includes('name')),
      'Error should mention name field'
    );
  }

  // Test 4: Command substitution in email should fail
  {
    const maliciousEmail: Identity = {
      id: 'malicious',
      name: 'Test User',
      email: '$(whoami)@evil.com',
    };
    const result = validateIdentity(maliciousEmail);
    assert.strictEqual(result.valid, false, 'Command substitution in email should fail');
  }

  // Test 5: Shell metacharacters should fail
  {
    const shellChars: Identity = {
      id: 'test',
      name: 'Test | cat /etc/passwd',
      email: 'test@example.com',
    };
    const result = validateIdentity(shellChars);
    assert.strictEqual(result.valid, false, 'Shell metacharacters should fail');
  }

  // Test 6: Backtick injection should fail
  {
    const backtickInjection: Identity = {
      id: 'test',
      name: 'Test `id`',
      email: 'test@example.com',
    };
    const result = validateIdentity(backtickInjection);
    assert.strictEqual(result.valid, false, 'Backtick injection should fail');
  }

  // Test 7: Newline injection should fail
  {
    const newlineInjection: Identity = {
      id: 'test',
      name: 'Test\nmalicious',
      email: 'test@example.com',
    };
    const result = validateIdentity(newlineInjection);
    assert.strictEqual(result.valid, false, 'Newline injection should fail');
  }

  // Test 8: Invalid email format should fail
  {
    const invalidEmail: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'not-an-email',
    };
    const result = validateIdentity(invalidEmail);
    assert.strictEqual(result.valid, false, 'Invalid email format should fail');
  }

  // Test 9: Path traversal in sshKeyPath should fail
  {
    const pathTraversal: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshKeyPath: '/home/../etc/passwd',
    };
    const result = validateIdentity(pathTraversal);
    assert.strictEqual(result.valid, false, 'Path traversal should fail');
  }

  // Test 10: Non-absolute sshKeyPath should fail
  {
    const relativePath: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshKeyPath: 'relative/path/key',
    };
    const result = validateIdentity(relativePath);
    assert.strictEqual(result.valid, false, 'Relative SSH key path should fail');
  }

  // Test 11: Invalid GPG key ID should fail
  {
    const invalidGpg: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'invalid-gpg-key',
    };
    const result = validateIdentity(invalidGpg);
    assert.strictEqual(result.valid, false, 'Invalid GPG key ID should fail');
  }

  // Test 12: Valid GPG key ID should pass
  {
    const validGpg: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      gpgKeyId: 'ABCDEF12',
    };
    const result = validateIdentity(validGpg);
    assert.strictEqual(result.valid, true, 'Valid GPG key ID should pass');
  }

  // Test 13: Missing required fields should fail
  {
    const missingFields = {
      id: 'test',
    } as Identity;
    const result = validateIdentity(missingFields);
    assert.strictEqual(result.valid, false, 'Missing required fields should fail');
  }

  // Test 14: Unicode name should pass (legitimate international names)
  {
    const unicodeName: Identity = {
      id: 'test',
      name: '田中太郎',
      email: 'tanaka@example.com',
    };
    const result = validateIdentity(unicodeName);
    assert.strictEqual(result.valid, true, 'Unicode name should pass');
  }

  // Test 15: Hex escape sequence should fail
  {
    const hexEscape: Identity = {
      id: 'test',
      name: String.raw`Test\x00User`,
      email: 'test@example.com',
    };
    const result = validateIdentity(hexEscape);
    assert.strictEqual(result.valid, false, 'Hex escape sequence should fail');
  }

  // Test 16: Email exceeding max length (320) should fail
  {
    const longEmail: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'a'.repeat(310) + '@example.com', // 322 chars > 320
    };
    const result = validateIdentity(longEmail);
    assert.strictEqual(result.valid, false, 'Email exceeding max length should fail');
    assert.ok(
      result.errors.some(e => e.includes('email') && e.includes('320')),
      'Error should mention email max length 320'
    );
  }

  // Test 17: sshHost exceeding max length (253) should fail
  {
    const longSshHost: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      sshHost: 'a'.repeat(254), // > 253 chars
    };
    const result = validateIdentity(longSshHost);
    assert.strictEqual(result.valid, false, 'sshHost exceeding max length should fail');
    assert.ok(
      result.errors.some(e => e.includes('sshHost') && e.includes('253')),
      'Error should mention sshHost max length 253'
    );
  }

  // Test 18: Service exceeding max length (64) should fail
  {
    const longService: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      service: 'a'.repeat(65), // > 64 chars
    };
    const result = validateIdentity(longService);
    assert.strictEqual(result.valid, false, 'Service exceeding max length should fail');
    assert.ok(
      result.errors.some(e => e.includes('service') && e.includes('64')),
      'Error should mention service max length 64'
    );
  }

  // Test 19: Description exceeding max length (500) should fail
  {
    const longDescription: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      description: 'a'.repeat(501), // > 500 chars
    };
    const result = validateIdentity(longDescription);
    assert.strictEqual(result.valid, false, 'Description exceeding max length should fail');
    assert.ok(
      result.errors.some(e => e.includes('description') && e.includes('500')),
      'Error should mention description max length 500'
    );
  }

  // Test 20: Icon exceeding max byte length (32) should fail
  {
    const longIcon: Identity = {
      id: 'test',
      name: 'Test User',
      email: 'test@example.com',
      icon: 'a'.repeat(33), // > 32 bytes
    };
    const result = validateIdentity(longIcon);
    assert.strictEqual(result.valid, false, 'Icon exceeding max byte length should fail');
    assert.ok(
      result.errors.some(e => e.includes('icon') && e.includes('maximum length')),
      'Error should mention icon max length'
    );
  }

  // Test 21: Name exceeding max length (256) should fail
  {
    const longName: Identity = {
      id: 'test',
      name: 'a'.repeat(257), // > 256 chars
      email: 'test@example.com',
    };
    const result = validateIdentity(longName);
    assert.strictEqual(result.valid, false, 'Name exceeding max length should fail');
    assert.ok(
      result.errors.some(e => e.includes('name') && e.includes('256')),
      'Error should mention name max length 256'
    );
  }

  console.log('✅ All validateIdentity tests passed!');
}

/**
 * Test suite for validateIdentities
 */
function testValidateIdentities(): void {
  console.log('Testing validateIdentities...');

  // Test 1: Empty array should pass
  {
    const result = validateIdentities([]);
    assert.strictEqual(result.valid, true, 'Empty array should pass');
  }

  // Test 2: Array with valid identities should pass
  {
    const identities: Identity[] = [
      { id: 'personal', name: 'John', email: 'john@example.com' },
      { id: 'work', name: 'John Work', email: 'john@company.com' },
    ];
    const result = validateIdentities(identities);
    assert.strictEqual(result.valid, true, 'Valid identities array should pass');
  }

  // Test 3: Duplicate IDs should fail
  {
    const duplicates: Identity[] = [
      { id: 'same', name: 'John', email: 'john@example.com' },
      { id: 'same', name: 'Jane', email: 'jane@example.com' },
    ];
    const result = validateIdentities(duplicates);
    assert.strictEqual(result.valid, false, 'Duplicate IDs should fail');
  }

  // Test 4: One invalid identity should fail the whole array
  {
    const mixedArray: Identity[] = [
      { id: 'valid', name: 'John', email: 'john@example.com' },
      { id: 'invalid', name: 'Test$(rm -rf /)', email: 'test@example.com' },
    ];
    const result = validateIdentities(mixedArray);
    assert.strictEqual(result.valid, false, 'Array with invalid identity should fail');
  }

  console.log('✅ All validateIdentities tests passed!');
}

/**
 * Test suite for isPathSafe
 */
function testIsPathSafe(): void {
  console.log('Testing isPathSafe...');

  // Test 1: Normal path should be safe
  assert.strictEqual(isPathSafe('/home/user/.ssh/id_rsa'), true, 'Normal path is safe');

  // Test 2: Path with ~ should be safe
  assert.strictEqual(isPathSafe('~/.ssh/id_rsa'), true, 'Path with ~ is safe');

  // Test 3: Path traversal should be unsafe
  assert.strictEqual(isPathSafe('/home/../etc/passwd'), false, 'Path traversal is unsafe');

  // Test 4: Shell metacharacters should be unsafe
  assert.strictEqual(isPathSafe('/home/user/key$(rm -rf /)'), false, 'Shell metachar is unsafe');

  // Test 5: Command substitution should be unsafe
  assert.strictEqual(isPathSafe('/home/$(whoami)/key'), false, 'Command sub is unsafe');

  // Test 6: Backticks should be unsafe
  assert.strictEqual(isPathSafe('/home/`id`/key'), false, 'Backticks are unsafe');

  // Test 7: Pipe should be unsafe
  assert.strictEqual(isPathSafe('/home/user/key|cat'), false, 'Pipe is unsafe');

  console.log('✅ All isPathSafe tests passed!');
}

/**
 * Test suite for validation consistency between UI layer and identity layer
 *
 * Invariant: validateFieldForDangerousPatterns rejects a SUPERSET of what
 * hasDangerousChars rejects. Anything hasDangerousChars catches, the identity
 * layer also catches. The identity layer additionally catches text-level
 * patterns (hex escape sequences) that are safe bytes but dangerous text.
 *
 * Issue-00103: Unify validation logic between UI and identity layers.
 */
function testValidationConsistency(): void {
  console.log('Testing validation consistency (UI ↔ identity layer)...');

  // Category 1: Inputs rejected by BOTH hasDangerousChars and validateFieldForDangerousPatterns
  // (actual dangerous bytes: shell metacharacters and control characters)
  const bothReject = [
    { value: 'test$(cmd)', reason: 'command substitution ($)' },
    { value: 'test`id`', reason: 'backtick injection' },
    { value: 'test|cat', reason: 'pipe' },
    { value: 'test&bg', reason: 'ampersand' },
    { value: 'test<in', reason: 'angle bracket (<)' },
    { value: 'test>out', reason: 'angle bracket (>)' },
    { value: 'test(group)', reason: 'parentheses' },
    { value: 'test{brace}', reason: 'braces' },
    { value: 'test\ninjection', reason: 'newline' },
    { value: 'test\rinjection', reason: 'carriage return' },
    { value: 'test\0null', reason: 'null byte' },
    // Control characters caught by hasDangerousChars (SAFE_TEXT_REGEX)
    // AND now also by validateFieldForDangerousPatterns (Issue-00103 fix)
    { value: 'test\u0002ctrl', reason: 'STX control character (0x02)' },
    { value: 'test\u0007bell', reason: 'BEL control character (0x07)' },
    { value: 'test\u001Bescape', reason: 'ESC control character (0x1B)' },
    { value: 'test\u007Fdel', reason: 'DEL control character (0x7F)' },
  ];

  for (const { value, reason } of bothReject) {
    const uiRejects = hasDangerousChars(value);
    const errors: string[] = [];
    validateFieldForDangerousPatterns(value, 'test', errors);
    const identityRejects = errors.length > 0;

    assert.strictEqual(uiRejects, true, `hasDangerousChars should reject: ${reason}`);
    assert.strictEqual(identityRejects, true, `validateFieldForDangerousPatterns should reject: ${reason}`);
  }

  // Category 2: Inputs rejected ONLY by validateFieldForDangerousPatterns
  // (literal text patterns like \x00 — safe bytes but dangerous as text)
  const identityOnlyRejects = [
    { value: String.raw`test\x00user`, reason: String.raw`hex escape \x00 (null)` },
    { value: String.raw`test\x0auser`, reason: String.raw`hex escape \x0a (LF)` },
    { value: String.raw`test\x1buser`, reason: String.raw`hex escape \x1b (ESC)` },
  ];

  for (const { value, reason } of identityOnlyRejects) {
    const uiRejects = hasDangerousChars(value);
    const errors: string[] = [];
    validateFieldForDangerousPatterns(value, 'test', errors);
    const identityRejects = errors.length > 0;

    // hasDangerousChars does NOT reject (all bytes are printable)
    assert.strictEqual(uiRejects, false, `hasDangerousChars allows: ${reason}`);
    // validateFieldForDangerousPatterns DOES reject (text-level pattern detection)
    assert.strictEqual(identityRejects, true, `validateFieldForDangerousPatterns catches: ${reason}`);
  }

  // Category 2b: validateFieldForDangerousPatterns boundary values
  {
    const errors: string[] = [];
    validateFieldForDangerousPatterns(undefined, 'test', errors);
    assert.strictEqual(errors.length, 0, 'undefined should produce no errors');
  }
  {
    const errors: string[] = [];
    validateFieldForDangerousPatterns('', 'test', errors);
    assert.strictEqual(errors.length, 0, 'empty string should produce no errors');
  }

  // Category 3: Inputs accepted by BOTH layers
  const bothAccept = [
    { value: 'John Doe', reason: 'simple ASCII name' },
    { value: '田中太郎', reason: 'Japanese name' },
    { value: 'Null;Variant', reason: 'semicolon in name' },
    { value: "O'Brien", reason: 'single quote in name' },
    { value: 'José García', reason: 'accented characters' },
    { value: 'Müller', reason: 'umlaut' },
  ];

  for (const { value, reason } of bothAccept) {
    const uiRejects = hasDangerousChars(value);
    const errors: string[] = [];
    validateFieldForDangerousPatterns(value, 'test', errors);
    const identityRejects = errors.length > 0;

    assert.strictEqual(uiRejects, false, `hasDangerousChars should accept: ${reason}`);
    assert.strictEqual(identityRejects, false, `validateFieldForDangerousPatterns should accept: ${reason}`);
  }

  // Category 4: validateIdentity integration — control characters in name are now caught
  {
    const controlCharName: Identity = {
      id: 'test',
      name: 'Test\u0007User',
      email: 'test@example.com',
    };
    const result = validateIdentity(controlCharName);
    assert.strictEqual(result.valid, false, 'Control character in name should fail');
    assert.ok(
      result.errors.some(e => e.includes('name') && e.includes('control characters')),
      'Error should mention control characters'
    );
  }

  console.log('✅ All validation consistency tests passed!');
}

/**
 * Run all tests
 */
export function runSecurityTests(): void {
  console.log('\n=== Security Validation Tests ===\n');

  try {
    testValidateIdentity();
    testValidateIdentities();
    testIsPathSafe();
    testValidationConsistency();

    console.log('\n✅ All security tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runSecurityTests();
}
