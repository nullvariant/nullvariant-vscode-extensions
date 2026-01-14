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
  INVISIBLE_CHARS,
  CONTROL_CHAR_REGEX_STRICT,
  CONTROL_CHAR_REGEX_ALL,
  EMAIL_REGEX,
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

  // EMAIL_REGEX should be a regex object
  assert.ok(EMAIL_REGEX instanceof RegExp, 'EMAIL_REGEX should be a RegExp');

  console.log('✅ Constants tests passed!');
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
