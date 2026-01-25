/**
 * Tests for Common Validation Functions
 *
 * Tests the centralized validation utilities in validators/common.ts
 */

import * as assert from 'node:assert';
import {
  hasNullByte,
  hasControlChars,
  hasPathTraversal,
  hasPathTraversalStrict,
  hasInvisibleUnicode,
  isValidEmail,
  isValidHex,
  isValidSshHost,
  isValidGpgKeyId,
  isValidIdentityId,
  hasDangerousChars,
  INVISIBLE_CHARS,
  CONTROL_CHAR_REGEX_STRICT,
  CONTROL_CHAR_REGEX_ALL,
  SSH_HOST_PATTERN,
  SSH_HOST_REGEX,
  GPG_KEY_PATTERN,
  GPG_KEY_REGEX,
  IDENTITY_ID_PATTERN,
  IDENTITY_ID_REGEX,
  SAFE_TEXT_PATTERN,
  SAFE_TEXT_REGEX,
  DANGEROUS_PATTERNS,
} from '../validators/common';

/**
 * Test suite for hasNullByte
 */
function testHasNullByte(): void {
  console.log('Testing hasNullByte...');

  assert.strictEqual(hasNullByte('normal string'), false, 'Normal string should not contain null byte');
  assert.strictEqual(hasNullByte(''), false, 'Empty string should not contain null byte');
  assert.strictEqual(hasNullByte('\0'), true, 'String with null byte should be detected');
  assert.strictEqual(hasNullByte('test\0string'), true, 'String with embedded null byte should be detected');
  assert.strictEqual(hasNullByte('test\\x00'), false, 'Escaped null byte should not be detected');

  console.log('✅ hasNullByte tests passed!');
}

/**
 * Test suite for hasControlChars
 */
function testHasControlChars(): void {
  console.log('Testing hasControlChars...');

  // Normal strings
  assert.strictEqual(hasControlChars('normal string'), false, 'Normal string should not contain control chars');
  assert.strictEqual(hasControlChars('test123'), false, 'Alphanumeric string should not contain control chars');

  // Control characters (strict mode - excludes tab/newline)
  assert.strictEqual(hasControlChars('\x00'), true, 'Null byte should be detected (strict)');
  assert.strictEqual(hasControlChars('\x01'), true, 'SOH should be detected (strict)');
  assert.strictEqual(hasControlChars('\x08'), true, 'BS should be detected (strict)');
  assert.strictEqual(hasControlChars('\x0b'), true, 'VT should be detected (strict)');
  assert.strictEqual(hasControlChars('\x1f'), true, 'US should be detected (strict)');
  assert.strictEqual(hasControlChars('\x7f'), true, 'DEL should be detected (strict)');

  // Tab and newline (allowed in strict mode)
  assert.strictEqual(hasControlChars('\t'), false, 'Tab should be allowed (strict)');
  assert.strictEqual(hasControlChars('\n'), false, 'Newline should be allowed (strict)');
  assert.strictEqual(hasControlChars('\r'), false, 'Carriage return should be allowed (strict)');

  // Non-strict mode (blocks all control chars)
  assert.strictEqual(hasControlChars('\t', false), true, 'Tab should be detected (non-strict)');
  assert.strictEqual(hasControlChars('\n', false), true, 'Newline should be detected (non-strict)');
  assert.strictEqual(hasControlChars('\r', false), true, 'Carriage return should be detected (non-strict)');

  console.log('✅ hasControlChars tests passed!');
}

/**
 * Test suite for hasPathTraversal
 */
function testHasPathTraversal(): void {
  console.log('Testing hasPathTraversal...');

  // Normal paths
  assert.strictEqual(hasPathTraversal('/home/user/file'), false, 'Normal path should not contain traversal');
  assert.strictEqual(hasPathTraversal('~/.ssh/id_rsa'), false, 'Home path should not contain traversal');

  // Traversal patterns
  assert.strictEqual(hasPathTraversal('../file'), true, 'Basic traversal should be detected');
  assert.strictEqual(hasPathTraversal('../../file'), true, 'Double traversal should be detected');
  assert.strictEqual(hasPathTraversal('/home/../etc/passwd'), true, 'Path with traversal should be detected');
  assert.strictEqual(hasPathTraversal('..'), true, 'Standalone .. should be detected');
  assert.strictEqual(hasPathTraversal('...'), true, 'Triple dots should be detected');

  console.log('✅ hasPathTraversal tests passed!');
}

/**
 * Test suite for hasPathTraversalStrict
 */
function testHasPathTraversalStrict(): void {
  console.log('Testing hasPathTraversalStrict...');

  // Normal paths
  assert.strictEqual(hasPathTraversalStrict('/home/user/file'), false, 'Normal path should not contain traversal');
  assert.strictEqual(hasPathTraversalStrict('~/.ssh/id_rsa'), false, 'Home path should not contain traversal');

  // Basic traversal patterns
  assert.strictEqual(hasPathTraversalStrict('../file'), true, 'Basic traversal should be detected');
  assert.strictEqual(hasPathTraversalStrict('../../file'), true, 'Double traversal should be detected');
  assert.strictEqual(hasPathTraversalStrict('/home/../etc/passwd'), true, 'Path with traversal should be detected');
  assert.strictEqual(hasPathTraversalStrict('..'), true, 'Standalone .. should be detected');

  // Advanced traversal patterns
  assert.strictEqual(hasPathTraversalStrict('./../file'), true, './../ pattern should be detected');
  assert.strictEqual(hasPathTraversalStrict('.././file'), true, '.././ pattern should be detected');
  assert.strictEqual(hasPathTraversalStrict('/./../file'), true, '/./../ pattern should be detected');
  assert.strictEqual(hasPathTraversalStrict('/.././file'), true, '/.././ pattern should be detected');
  assert.strictEqual(hasPathTraversalStrict('.../file'), true, 'Triple dots should be detected');
  assert.strictEqual(hasPathTraversalStrict('..../file'), true, 'Quadruple dots should be detected');

  // Windows-style paths
  assert.strictEqual(hasPathTraversalStrict('..\\file'), true, 'Windows-style traversal should be detected');
  assert.strictEqual(hasPathTraversalStrict('\\..\\file'), true, 'Windows absolute with traversal should be detected');

  // Edge cases
  assert.strictEqual(hasPathTraversalStrict('/..'), true, 'Path ending with /.. should be detected');
  assert.strictEqual(hasPathTraversalStrict('\\..'), true, 'Path ending with \\.. should be detected');

  console.log('✅ hasPathTraversalStrict tests passed!');
}

/**
 * Test suite for hasInvisibleUnicode
 */
function testHasInvisibleUnicode(): void {
  console.log('Testing hasInvisibleUnicode...');

  // Normal strings
  assert.strictEqual(hasInvisibleUnicode('normal string'), false, 'Normal string should not contain invisible chars');
  assert.strictEqual(hasInvisibleUnicode('test123'), false, 'Alphanumeric string should not contain invisible chars');

  // Invisible Unicode characters
  for (const char of INVISIBLE_CHARS) {
    assert.strictEqual(hasInvisibleUnicode(char), true, `Invisible char ${char.charCodeAt(0).toString(16)} should be detected`);
    assert.strictEqual(hasInvisibleUnicode(`test${char}string`), true, `Embedded invisible char should be detected`);
  }

  // Mixed content
  assert.strictEqual(hasInvisibleUnicode('test\u200Bstring'), true, 'Zero-width space should be detected');
  assert.strictEqual(hasInvisibleUnicode('test\uFEFFstring'), true, 'BOM should be detected');

  console.log('✅ hasInvisibleUnicode tests passed!');
}

/**
 * Test suite for isValidEmail
 */
function testIsValidEmail(): void {
  console.log('Testing isValidEmail...');

  // Valid emails
  assert.strictEqual(isValidEmail('user@example.com'), true, 'Valid email should pass');
  assert.strictEqual(isValidEmail('user.name@example.com'), true, 'Email with dot should pass');
  assert.strictEqual(isValidEmail('user+tag@example.co.uk'), true, 'Email with plus and subdomain should pass');

  // Invalid emails
  assert.strictEqual(isValidEmail('not-an-email'), false, 'Invalid email format should fail');
  assert.strictEqual(isValidEmail('user@'), false, 'Email without domain should fail');
  assert.strictEqual(isValidEmail('@example.com'), false, 'Email without user should fail');
  assert.strictEqual(isValidEmail('user@example'), false, 'Email without TLD should fail');
  assert.strictEqual(isValidEmail('user @example.com'), false, 'Email with space should fail');
  assert.strictEqual(isValidEmail('user<tag>@example.com'), false, 'Email with angle brackets should fail');

  // Additional edge cases (ReDoS prevention)
  assert.strictEqual(isValidEmail(''), false, 'Empty string should fail');
  assert.strictEqual(isValidEmail('user@@example.com'), false, 'Multiple @ should fail');
  assert.strictEqual(isValidEmail('user@example.com.'), false, 'Domain ending with dot should fail');
  assert.strictEqual(isValidEmail('a'.repeat(255) + '@example.com'), false, 'Email exceeding 254 chars should fail');

  // ReDoS resistance test - should complete quickly even with adversarial input
  const start = Date.now();
  const adversarialInput = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.' + 'c'.repeat(50);
  isValidEmail(adversarialInput);
  const elapsed = Date.now() - start;
  assert.ok(elapsed < 100, `ReDoS test should complete in <100ms, took ${elapsed}ms`);

  console.log('✅ isValidEmail tests passed!');
}

/**
 * Test suite for isValidHex
 */
function testIsValidHex(): void {
  console.log('Testing isValidHex...');

  // Valid hex strings
  assert.strictEqual(isValidHex('ABCDEF1234567890'), true, 'Valid hex string should pass');
  assert.strictEqual(isValidHex('abcdef'), true, 'Lowercase hex should pass');
  assert.strictEqual(isValidHex('0123456789ABCDEF'), true, 'Mixed case hex should pass');
  assert.strictEqual(isValidHex('A'), true, 'Single hex char should pass');

  // Invalid hex strings
  assert.strictEqual(isValidHex(''), false, 'Empty string should fail');
  assert.strictEqual(isValidHex('ABCDEFG'), false, 'String with non-hex char should fail');
  assert.strictEqual(isValidHex('ABCD EF'), false, 'String with space should fail');
  assert.strictEqual(isValidHex('ABCD-EF'), false, 'String with hyphen should fail');

  console.log('✅ isValidHex tests passed!');
}

/**
 * Test suite for constants
 */
function testConstants(): void {
  console.log('Testing constants...');

  // INVISIBLE_CHARS should be a readonly array
  assert.ok(Array.isArray(INVISIBLE_CHARS), 'INVISIBLE_CHARS should be an array');
  assert.ok(INVISIBLE_CHARS.length > 0, 'INVISIBLE_CHARS should not be empty');

  // CONTROL_CHAR_REGEX should be regex objects
  assert.ok(CONTROL_CHAR_REGEX_STRICT instanceof RegExp, 'CONTROL_CHAR_REGEX_STRICT should be a RegExp');
  assert.ok(CONTROL_CHAR_REGEX_ALL instanceof RegExp, 'CONTROL_CHAR_REGEX_ALL should be a RegExp');

  // New pattern constants - verify types
  assert.ok(typeof SSH_HOST_PATTERN === 'string', 'SSH_HOST_PATTERN should be a string');
  assert.ok(SSH_HOST_REGEX instanceof RegExp, 'SSH_HOST_REGEX should be a RegExp');
  assert.ok(typeof GPG_KEY_PATTERN === 'string', 'GPG_KEY_PATTERN should be a string');
  assert.ok(GPG_KEY_REGEX instanceof RegExp, 'GPG_KEY_REGEX should be a RegExp');
  assert.ok(typeof IDENTITY_ID_PATTERN === 'string', 'IDENTITY_ID_PATTERN should be a string');
  assert.ok(IDENTITY_ID_REGEX instanceof RegExp, 'IDENTITY_ID_REGEX should be a RegExp');
  assert.ok(typeof SAFE_TEXT_PATTERN === 'string', 'SAFE_TEXT_PATTERN should be a string');
  assert.ok(SAFE_TEXT_REGEX instanceof RegExp, 'SAFE_TEXT_REGEX should be a RegExp');
  assert.ok(Array.isArray(DANGEROUS_PATTERNS), 'DANGEROUS_PATTERNS should be an array');
  assert.ok(DANGEROUS_PATTERNS.length > 0, 'DANGEROUS_PATTERNS should not be empty');

  // Verify pattern values match expected (ensures consistency across refactoring)
  assert.strictEqual(SSH_HOST_PATTERN, '^[a-zA-Z0-9][a-zA-Z0-9._-]*$', 'SSH_HOST_PATTERN value should match');
  assert.strictEqual(GPG_KEY_PATTERN, '^[A-Fa-f0-9]{8,40}$', 'GPG_KEY_PATTERN value should match');
  assert.strictEqual(IDENTITY_ID_PATTERN, '^[a-zA-Z0-9_-]+$', 'IDENTITY_ID_PATTERN value should match');

  // Verify DANGEROUS_PATTERNS has expected number of patterns
  assert.strictEqual(DANGEROUS_PATTERNS.length, 4, 'DANGEROUS_PATTERNS should have 4 patterns');

  console.log('✅ Constants tests passed!');
}

/**
 * Test suite for isValidSshHost
 */
function testIsValidSshHost(): void {
  console.log('Testing isValidSshHost...');

  // Valid SSH hosts
  assert.strictEqual(isValidSshHost('github'), true, 'Simple host name should pass');
  assert.strictEqual(isValidSshHost('my-server'), true, 'Host with hyphen should pass');
  assert.strictEqual(isValidSshHost('host.example.com'), true, 'Host with dots should pass');
  assert.strictEqual(isValidSshHost('a123'), true, 'Alphanumeric host should pass');
  assert.strictEqual(isValidSshHost('server_1'), true, 'Host with underscore should pass');
  assert.strictEqual(isValidSshHost('A'), true, 'Single uppercase char should pass');
  assert.strictEqual(isValidSshHost('0'), true, 'Single digit should pass');

  // Invalid SSH hosts
  assert.strictEqual(isValidSshHost(''), false, 'Empty string should fail');
  assert.strictEqual(isValidSshHost('-start'), false, 'Host starting with hyphen should fail');
  assert.strictEqual(isValidSshHost('.start'), false, 'Host starting with dot should fail');
  assert.strictEqual(isValidSshHost('_start'), false, 'Host starting with underscore should fail');
  assert.strictEqual(isValidSshHost('has space'), false, 'Host with space should fail');
  assert.strictEqual(isValidSshHost('日本語'), false, 'Non-ASCII host should fail');
  assert.strictEqual(isValidSshHost('host@domain'), false, 'Host with @ should fail');
  assert.strictEqual(isValidSshHost('host:22'), false, 'Host with colon should fail');

  console.log('✅ isValidSshHost tests passed!');
}

/**
 * Test suite for isValidGpgKeyId
 */
function testIsValidGpgKeyId(): void {
  console.log('Testing isValidGpgKeyId...');

  // Valid GPG key IDs
  assert.strictEqual(isValidGpgKeyId('ABCD1234'), true, '8-char hex should pass');
  assert.strictEqual(isValidGpgKeyId('abcd1234'), true, '8-char lowercase hex should pass');
  assert.strictEqual(isValidGpgKeyId('ABCD1234ABCD1234'), true, '16-char hex should pass');
  assert.strictEqual(isValidGpgKeyId('ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234'), true, '40-char hex should pass');
  assert.strictEqual(isValidGpgKeyId('ABCD12345'), true, '9-char hex should pass');

  // Boundary cases
  assert.strictEqual(isValidGpgKeyId('ABCD123'), false, '7-char hex should fail (too short)');
  assert.strictEqual(isValidGpgKeyId('abcd1234abcd1234abcd1234abcd1234abcd12345'), false, '41-char hex should fail (too long)');

  // Invalid GPG key IDs
  assert.strictEqual(isValidGpgKeyId(''), false, 'Empty string should fail');
  assert.strictEqual(isValidGpgKeyId('GHIJKLMN'), false, 'Non-hex chars should fail');
  assert.strictEqual(isValidGpgKeyId('ABCD 1234'), false, 'Hex with space should fail');
  assert.strictEqual(isValidGpgKeyId('ABCD-1234'), false, 'Hex with hyphen should fail');

  console.log('✅ isValidGpgKeyId tests passed!');
}

/**
 * Test suite for isValidIdentityId
 */
function testIsValidIdentityId(): void {
  console.log('Testing isValidIdentityId...');

  // Valid identity IDs
  assert.strictEqual(isValidIdentityId('work', 64), true, 'Simple ID should pass');
  assert.strictEqual(isValidIdentityId('personal-github', 64), true, 'ID with hyphen should pass');
  assert.strictEqual(isValidIdentityId('id_123', 64), true, 'ID with underscore and digits should pass');
  assert.strictEqual(isValidIdentityId('A', 64), true, 'Single char ID should pass');
  assert.strictEqual(isValidIdentityId('a'.repeat(64), 64), true, 'ID at max length should pass');

  // Length validation
  assert.strictEqual(isValidIdentityId('a'.repeat(65), 64), false, 'ID exceeding max length should fail');
  assert.strictEqual(isValidIdentityId('abc', 2), false, 'ID exceeding custom max length should fail');
  assert.strictEqual(isValidIdentityId('ab', 2), true, 'ID at custom max length should pass');

  // Invalid identity IDs
  assert.strictEqual(isValidIdentityId('', 64), false, 'Empty string should fail');
  assert.strictEqual(isValidIdentityId('has space', 64), false, 'ID with space should fail');
  assert.strictEqual(isValidIdentityId('日本語', 64), false, 'Non-ASCII ID should fail');
  assert.strictEqual(isValidIdentityId('has.dot', 64), false, 'ID with dot should fail');
  assert.strictEqual(isValidIdentityId('has@at', 64), false, 'ID with @ should fail');

  console.log('✅ isValidIdentityId tests passed!');
}

/**
 * Test suite for hasDangerousChars
 */
function testHasDangerousChars(): void {
  console.log('Testing hasDangerousChars...');

  // Dangerous characters (should return true)
  assert.strictEqual(hasDangerousChars('`cmd`'), true, 'Backtick command should be dangerous');
  assert.strictEqual(hasDangerousChars('$(cmd)'), true, 'Command substitution should be dangerous');
  assert.strictEqual(hasDangerousChars('a|b'), true, 'Pipe should be dangerous');
  assert.strictEqual(hasDangerousChars('a&b'), true, 'Ampersand should be dangerous');
  assert.strictEqual(hasDangerousChars('a\nb'), true, 'Newline should be dangerous');
  assert.strictEqual(hasDangerousChars('a\rb'), true, 'Carriage return should be dangerous');
  assert.strictEqual(hasDangerousChars('\x00'), true, 'Null byte should be dangerous');
  assert.strictEqual(hasDangerousChars('a<b'), true, 'Less than should be dangerous');
  assert.strictEqual(hasDangerousChars('a>b'), true, 'Greater than should be dangerous');
  assert.strictEqual(hasDangerousChars('a{b}'), true, 'Braces should be dangerous');
  assert.strictEqual(hasDangerousChars('$VAR'), true, 'Dollar sign should be dangerous');

  // Safe characters (should return false)
  assert.strictEqual(hasDangerousChars('normal text'), false, 'Normal text should be safe');
  assert.strictEqual(hasDangerousChars('Null;Variant'), false, 'Semicolon should be allowed');
  assert.strictEqual(hasDangerousChars('hello-world_123'), false, 'Alphanumeric with hyphen/underscore should be safe');
  assert.strictEqual(hasDangerousChars('user@example.com'), false, 'Email format should be safe');
  assert.strictEqual(hasDangerousChars('/path/to/file'), false, 'Path should be safe');
  assert.strictEqual(hasDangerousChars('value=123'), false, 'Equals sign should be safe');

  // Empty string edge case - empty input is rejected as unsafe
  assert.strictEqual(hasDangerousChars(''), true, 'Empty string should be dangerous (no valid content)');

  console.log('✅ hasDangerousChars tests passed!');
}

/**
 * Run all tests
 */
export function runValidatorsCommonTests(): void {
  console.log('\n=== Common Validators Tests ===\n');

  try {
    testHasNullByte();
    testHasControlChars();
    testHasPathTraversal();
    testHasPathTraversalStrict();
    testHasInvisibleUnicode();
    testIsValidEmail();
    testIsValidHex();
    testIsValidSshHost();
    testIsValidGpgKeyId();
    testIsValidIdentityId();
    testHasDangerousChars();
    testConstants();

    console.log('\n✅ All common validators tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runValidatorsCommonTests();
}
