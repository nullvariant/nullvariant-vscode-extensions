/**
 * Security Tests for Input Validation
 *
 * Tests that malicious input is properly rejected.
 */

import * as assert from 'node:assert';
import { validateIdentity, validateIdentities, isPathSafe } from '../identity/inputValidator';
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
      name: 'Test\\x00User',
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
 * Run all tests
 */
export function runSecurityTests(): void {
  console.log('\n=== Security Validation Tests ===\n');

  try {
    testValidateIdentity();
    testValidateIdentities();
    testIsPathSafe();

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
