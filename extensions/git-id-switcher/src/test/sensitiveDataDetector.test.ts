/**
 * Sensitive Data Detector Tests
 *
 * Coverage: sensitiveDataDetector.ts achieves 100% statement coverage.
 *
 * Tests comprehensive sensitive data detection and sanitization including:
 *
 * ## looksLikeSensitiveData() tests:
 * - Keyword detection (api_key, secret, password, token, bearer, authorization, credential, private)
 * - Case insensitivity (PASSWORD, PaSsWoRd, etc.)
 * - Keyword variations (api_key, api-key, apikey, API_KEY)
 * - Base64 pattern detection with character diversity requirements (3+ types)
 * - Length boundaries (MIN_SECRET_LENGTH=32, MAX_SECRET_LENGTH=256)
 * - DoS protection (MAX_PATTERN_CHECK_LENGTH=1000 limit)
 * - False positive prevention (pure numbers, UUIDs, normal identifiers)
 *
 * ## sanitizeValue() tests:
 * - Primitive types: null, undefined, number, boolean
 * - String handling: empty, normal, sensitive keyword, truncation
 * - Path detection: Unix (/), tilde (~), Windows drive (C:), UNC (\\\\)
 * - Array abstraction: [Array(length)]
 * - Object handling: key listing, sensitive key redaction, 5-key truncation
 * - Special types: function, symbol, BigInt
 * - Special objects: Date, Error, RegExp, Map, Set
 *
 * ## sanitizeDetails() tests:
 * - Key sanitization (sensitive keys → [REDACTED_KEY])
 * - Value sanitization (sensitive values → [REDACTED:SENSITIVE_VALUE])
 * - Multiple sensitive keys merging behavior
 * - Undefined/null value pass-through
 *
 * ## Integration tests:
 * - Path sanitization via pathSanitizer module
 * - Nested object abstraction (non-recursive sanitization)
 *
 * Total: 20 test functions covering all code paths.
 */

import * as assert from 'node:assert';
import {
  looksLikeSensitiveData,
  sanitizeValue,
  sanitizeDetails,
  type SanitizeOptions,
} from '../security/sensitiveDataDetector';
import {
  MAX_PATTERN_CHECK_LENGTH,
  MAX_LOG_STRING_LENGTH,
  MIN_SECRET_LENGTH,
  MAX_SECRET_LENGTH,
} from '../core/constants';

/**
 * Test looksLikeSensitiveData keyword detection
 */
function testKeywordDetection(): void {
  console.log('Testing keyword detection...');

  // api_key variations
  {
    assert.strictEqual(
      looksLikeSensitiveData('my_api_key_value'),
      true,
      'api_key should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('MY_API_KEY'),
      true,
      'API_KEY (uppercase) should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('api-key-123'),
      true,
      'api-key with hyphen should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('apikey'),
      true,
      'apikey without separator should be detected'
    );
  }

  // secret
  {
    assert.strictEqual(
      looksLikeSensitiveData('client_secret'),
      true,
      'secret should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('SECRET_VALUE'),
      true,
      'SECRET (uppercase) should be detected'
    );
  }

  // password
  {
    assert.strictEqual(
      looksLikeSensitiveData('password123'),
      true,
      'password should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('PASSWORD'),
      true,
      'PASSWORD (uppercase) should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('user_password'),
      true,
      'password in middle should be detected'
    );
  }

  // token
  {
    assert.strictEqual(
      looksLikeSensitiveData('access_token'),
      true,
      'token should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('TOKEN_VALUE'),
      true,
      'TOKEN (uppercase) should be detected'
    );
  }

  // bearer
  {
    assert.strictEqual(
      looksLikeSensitiveData('Bearer abc123'),
      true,
      'bearer should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('BEARER_TOKEN'),
      true,
      'BEARER (uppercase) should be detected'
    );
  }

  // authorization
  {
    assert.strictEqual(
      looksLikeSensitiveData('authorization_header'),
      true,
      'authorization should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('AUTHORIZATION'),
      true,
      'AUTHORIZATION (uppercase) should be detected'
    );
  }

  // credential
  {
    assert.strictEqual(
      looksLikeSensitiveData('user_credential'),
      true,
      'credential should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('CREDENTIALS'),
      true,
      'CREDENTIALS (uppercase) should be detected'
    );
  }

  // private
  {
    assert.strictEqual(
      looksLikeSensitiveData('private_key'),
      true,
      'private should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('PRIVATE_DATA'),
      true,
      'PRIVATE (uppercase) should be detected'
    );
  }

  console.log('✅ Keyword detection passed!');
}

/**
 * Test Base64 pattern detection
 */
function testBase64PatternDetection(): void {
  console.log('Testing Base64 pattern detection...');

  // Valid base64-like secrets (32-256 chars with 3+ character types)
  {
    // 32 chars with upper, lower, numbers = 3 types
    const secret32 = 'AbCdEfGh12345678AbCdEfGh12345678';
    assert.strictEqual(secret32.length, 32, 'Test string should be 32 chars');
    assert.strictEqual(
      looksLikeSensitiveData(secret32),
      true,
      '32-char base64-like string with 3 types should be detected'
    );
  }

  {
    // With base64 padding
    const secretWithPadding = 'AbCdEfGh12345678AbCdEfGh123456==';
    assert.strictEqual(
      looksLikeSensitiveData(secretWithPadding),
      true,
      'Base64 with padding should be detected (4 types: upper, lower, digit, =)'
    );
  }

  {
    // With +/ characters (base64 special chars)
    const secretWithSpecial = 'AbCdEfGh+/345678AbCdEfGh12345678';
    assert.strictEqual(
      looksLikeSensitiveData(secretWithSpecial),
      true,
      'Base64 with +/ should be detected'
    );
  }

  // Should NOT detect strings with only 2 character types
  {
    // Only lowercase and numbers (2 types)
    const twoTypes = 'abcdefgh12345678abcdefgh12345678';
    assert.strictEqual(twoTypes.length, 32, 'Test string should be 32 chars');
    assert.strictEqual(
      looksLikeSensitiveData(twoTypes),
      false,
      'String with only 2 character types should NOT be detected'
    );
  }

  {
    // Only digits (1 type) - 32 chars
    const digitsOnly = '12345678901234567890123456789012';
    assert.strictEqual(digitsOnly.length, 32, 'Test string should be 32 chars');
    assert.strictEqual(
      looksLikeSensitiveData(digitsOnly),
      false,
      'Digits-only string should NOT be detected'
    );
  }

  {
    // Only uppercase (1 type)
    const upperOnly = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEF';
    assert.strictEqual(upperOnly.length, 32, 'Test string should be 32 chars');
    assert.strictEqual(
      looksLikeSensitiveData(upperOnly),
      false,
      'Uppercase-only string should NOT be detected'
    );
  }

  // Length boundaries
  {
    // Too short (31 chars < MIN_SECRET_LENGTH)
    const tooShort = 'AbCdEfGh12345678AbCdEfGh1234567';
    assert.strictEqual(tooShort.length, 31, 'Test string should be 31 chars');
    assert.strictEqual(
      looksLikeSensitiveData(tooShort),
      false,
      'String shorter than MIN_SECRET_LENGTH should NOT be detected as base64'
    );
  }

  {
    // At MIN_SECRET_LENGTH (32 chars)
    const atMin = 'AbCdEfGh12345678AbCdEfGh12345678';
    assert.strictEqual(atMin.length, MIN_SECRET_LENGTH, 'Test string should be MIN_SECRET_LENGTH');
    assert.strictEqual(
      looksLikeSensitiveData(atMin),
      true,
      'String at MIN_SECRET_LENGTH with 3 types should be detected'
    );
  }

  {
    // At MAX_SECRET_LENGTH (256 chars) - upper, lower, digit = 3 types
    const atMaxWith3Types = 'A'.repeat(80) + 'a'.repeat(80) + '1'.repeat(96);
    assert.strictEqual(atMaxWith3Types.length, MAX_SECRET_LENGTH, 'Test string should be MAX_SECRET_LENGTH');
    assert.strictEqual(
      looksLikeSensitiveData(atMaxWith3Types),
      true,
      'String at MAX_SECRET_LENGTH with 3 types should be detected'
    );
  }

  {
    // Too long (257 chars > MAX_SECRET_LENGTH)
    const tooLong = 'A'.repeat(80) + 'a'.repeat(80) + '1'.repeat(97);
    assert.strictEqual(tooLong.length, 257, 'Test string should be 257 chars');
    assert.strictEqual(
      looksLikeSensitiveData(tooLong),
      false,
      'String longer than MAX_SECRET_LENGTH should NOT be detected as base64'
    );
  }

  // Invalid base64 characters should not trigger base64 detection
  {
    const invalidBase64 = 'AbCdEfGh!@#$5678AbCdEfGh12345678';
    assert.strictEqual(
      looksLikeSensitiveData(invalidBase64),
      false,
      'String with invalid base64 chars should NOT be detected as base64'
    );
  }

  console.log('✅ Base64 pattern detection passed!');
}

/**
 * Test DoS protection via MAX_PATTERN_CHECK_LENGTH
 */
function testDoSProtection(): void {
  console.log('Testing DoS protection...');

  // String longer than MAX_PATTERN_CHECK_LENGTH with keyword after limit
  {
    const longPrefix = 'x'.repeat(MAX_PATTERN_CHECK_LENGTH + 1);
    const longString = longPrefix + 'password';
    assert.strictEqual(
      looksLikeSensitiveData(longString),
      false,
      'Keyword after MAX_PATTERN_CHECK_LENGTH should NOT be detected'
    );
  }

  // String longer than MAX_PATTERN_CHECK_LENGTH with keyword before limit
  {
    const prefix = 'x'.repeat(MAX_PATTERN_CHECK_LENGTH - 10);
    const longStringWithKeyword = prefix + 'password' + 'x'.repeat(100);
    assert.strictEqual(
      looksLikeSensitiveData(longStringWithKeyword),
      true,
      'Keyword within MAX_PATTERN_CHECK_LENGTH should be detected'
    );
  }

  // Exactly at MAX_PATTERN_CHECK_LENGTH
  {
    const exactLength = 'password' + 'x'.repeat(MAX_PATTERN_CHECK_LENGTH - 8);
    assert.strictEqual(exactLength.length, MAX_PATTERN_CHECK_LENGTH, 'String should be exactly MAX_PATTERN_CHECK_LENGTH');
    assert.strictEqual(
      looksLikeSensitiveData(exactLength),
      true,
      'Keyword at start of MAX_PATTERN_CHECK_LENGTH string should be detected'
    );
  }

  console.log('✅ DoS protection passed!');
}

/**
 * Test sanitizeValue with different types
 */
function testSanitizeValueTypes(): void {
  console.log('Testing sanitizeValue type handling...');

  // null and undefined
  {
    assert.strictEqual(
      sanitizeValue(null),
      null,
      'null should pass through'
    );
    assert.strictEqual(
      sanitizeValue(undefined),
      undefined,
      'undefined should pass through'
    );
  }

  // numbers
  {
    assert.strictEqual(
      sanitizeValue(42),
      42,
      'number should pass through'
    );
    assert.strictEqual(
      sanitizeValue(3.14),
      3.14,
      'float should pass through'
    );
    assert.strictEqual(
      sanitizeValue(-100),
      -100,
      'negative number should pass through'
    );
    assert.strictEqual(
      sanitizeValue(0),
      0,
      'zero should pass through'
    );
  }

  // booleans
  {
    assert.strictEqual(
      sanitizeValue(true),
      true,
      'true should pass through'
    );
    assert.strictEqual(
      sanitizeValue(false),
      false,
      'false should pass through'
    );
  }

  // strings (non-sensitive)
  {
    assert.strictEqual(
      sanitizeValue('hello'),
      'hello',
      'normal string should pass through'
    );
    assert.strictEqual(
      sanitizeValue(''),
      '',
      'empty string should pass through'
    );
  }

  // arrays
  {
    assert.strictEqual(
      sanitizeValue([1, 2, 3]),
      '[Array(3)]',
      'array should be abstracted with length'
    );
    assert.strictEqual(
      sanitizeValue([]),
      '[Array(0)]',
      'empty array should show length 0'
    );
    assert.strictEqual(
      sanitizeValue(['secret', 'password']),
      '[Array(2)]',
      'array with sensitive values should just show length'
    );
  }

  // functions
  {
    const fn = function test() { return 1; };
    assert.strictEqual(
      sanitizeValue(fn),
      '[function]',
      'function should show type'
    );
  }

  // symbols
  {
    const sym = Symbol('test');
    assert.strictEqual(
      sanitizeValue(sym),
      '[symbol]',
      'symbol should show type'
    );
  }

  console.log('✅ sanitizeValue type handling passed!');
}

/**
 * Test sanitizeValue path detection
 */
function testPathDetection(): void {
  console.log('Testing path detection...');

  // Unix absolute paths (start with /)
  {
    const result = sanitizeValue('/home/user/.ssh/id_rsa');
    assert.strictEqual(
      typeof result,
      'string',
      'path should return string'
    );
    assert.ok(
      (result as string).includes('~') || (result as string).includes('[REDACTED'),
      'Unix path should be sanitized'
    );
  }

  // Home directory paths (start with ~)
  {
    const result = sanitizeValue('~/.ssh/id_rsa');
    assert.strictEqual(
      typeof result,
      'string',
      'tilde path should return string'
    );
    assert.ok(
      (result as string).includes('~') || (result as string).includes('[REDACTED'),
      'Tilde path should be handled'
    );
  }

  // Windows drive letters
  {
    const result = sanitizeValue('C:\\Users\\test\\secret.key');
    assert.strictEqual(
      typeof result,
      'string',
      'Windows path should return string'
    );
    // Windows paths go through sanitizePath
    assert.notStrictEqual(
      result,
      'C:\\Users\\test\\secret.key',
      'Windows path should be sanitized (not returned as-is)'
    );
  }

  // Windows UNC paths
  {
    const result = sanitizeValue('\\\\server\\share\\file.key');
    assert.strictEqual(
      typeof result,
      'string',
      'UNC path should return string'
    );
    assert.ok(
      (result as string).includes('[REDACTED') || (result as string).includes('//'),
      'UNC path should be sanitized'
    );
  }

  // Lowercase drive letter
  {
    const result = sanitizeValue('d:\\data\\config.json');
    assert.strictEqual(
      typeof result,
      'string',
      'lowercase drive path should return string'
    );
  }

  console.log('✅ Path detection passed!');
}

/**
 * Test sanitizeValue string truncation
 */
function testStringTruncation(): void {
  console.log('Testing string truncation...');

  // String at MAX_LOG_STRING_LENGTH
  {
    const atLimit = 'a'.repeat(MAX_LOG_STRING_LENGTH);
    assert.strictEqual(
      sanitizeValue(atLimit),
      atLimit,
      'String at MAX_LOG_STRING_LENGTH should not be truncated'
    );
  }

  // String over MAX_LOG_STRING_LENGTH
  {
    const overLimit = 'a'.repeat(MAX_LOG_STRING_LENGTH + 10);
    const result = sanitizeValue(overLimit) as string;
    assert.ok(
      result.includes('...[truncated]'),
      'Long string should be truncated'
    );
    assert.strictEqual(
      result.length,
      MAX_LOG_STRING_LENGTH + '...[truncated]'.length,
      'Truncated string should have correct length'
    );
  }

  // Long sensitive string - should be redacted before truncation
  {
    const longPassword = 'password' + 'x'.repeat(100);
    const result = sanitizeValue(longPassword);
    assert.strictEqual(
      result,
      '[REDACTED:SENSITIVE_VALUE]',
      'Sensitive string should be redacted, not truncated'
    );
  }

  console.log('✅ String truncation passed!');
}

/**
 * Test sanitizeValue object handling
 */
function testObjectHandling(): void {
  console.log('Testing object handling...');

  // Object with safe keys
  {
    const obj = { name: 'test', count: 5 };
    const result = sanitizeValue(obj) as string;
    assert.ok(
      result.includes('Object(2 keys'),
      'Object should show key count'
    );
    assert.ok(
      result.includes('name') && result.includes('count'),
      'Safe keys should be shown'
    );
  }

  // Object with sensitive keys
  {
    const obj = { api_key: 'xxx', password: 'yyy' };
    const result = sanitizeValue(obj) as string;
    assert.ok(
      result.includes('Object(2 keys)'),
      'Object with sensitive keys should show only count'
    );
    assert.ok(
      !result.includes('api_key') && !result.includes('password'),
      'Sensitive keys should not be shown'
    );
  }

  // Object with mixed keys
  {
    const obj = { name: 'test', secret: 'xxx' };
    const result = sanitizeValue(obj) as string;
    assert.ok(
      result.includes('Object(2 keys)'),
      'Object with mixed keys should show only count'
    );
    assert.ok(
      !result.includes('secret'),
      'Sensitive key should not be shown'
    );
  }

  // Object with more than 5 keys (should truncate key list)
  {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 };
    const result = sanitizeValue(obj) as string;
    assert.ok(
      result.includes('Object(7 keys'),
      'Object should show correct key count'
    );
    assert.ok(
      result.includes('...'),
      'Key list should be truncated with ...'
    );
  }

  // Empty object
  {
    const obj = {};
    const result = sanitizeValue(obj) as string;
    assert.ok(
      result.includes('Object(0 keys'),
      'Empty object should show 0 keys'
    );
  }

  console.log('✅ Object handling passed!');
}

/**
 * Test sanitizeValue sensitive data detection
 */
function testSensitiveDataRedaction(): void {
  console.log('Testing sensitive data redaction...');

  // String containing sensitive keyword
  {
    assert.strictEqual(
      sanitizeValue('my_api_key_value'),
      '[REDACTED:SENSITIVE_VALUE]',
      'String with api_key should be redacted'
    );
    assert.strictEqual(
      sanitizeValue('password123'),
      '[REDACTED:SENSITIVE_VALUE]',
      'String with password should be redacted'
    );
    assert.strictEqual(
      sanitizeValue('Bearer token123'),
      '[REDACTED:SENSITIVE_VALUE]',
      'String with bearer should be redacted'
    );
  }

  // Base64-like secret
  {
    const secret = 'AbCdEfGh12345678AbCdEfGh12345678';
    assert.strictEqual(
      sanitizeValue(secret),
      '[REDACTED:SENSITIVE_VALUE]',
      'Base64-like secret should be redacted'
    );
  }

  console.log('✅ Sensitive data redaction passed!');
}

/**
 * Test sanitizeDetails function
 */
function testSanitizeDetails(): void {
  console.log('Testing sanitizeDetails...');

  // Details with safe keys and values
  {
    const details = { name: 'test', count: 5 };
    const result = sanitizeDetails(details);
    assert.strictEqual(result.name, 'test', 'Safe string value should pass through');
    assert.strictEqual(result.count, 5, 'Number value should pass through');
  }

  // Details with sensitive key
  {
    const details = { api_key: 'value', name: 'test' };
    const result = sanitizeDetails(details);
    assert.ok(
      '[REDACTED_KEY]' in result,
      'Sensitive key should be replaced with [REDACTED_KEY]'
    );
    assert.ok(
      !('api_key' in result),
      'Original sensitive key should not exist'
    );
    assert.strictEqual(result.name, 'test', 'Safe key should remain');
  }

  // Details with sensitive value
  {
    const details = { config: 'password123' };
    const result = sanitizeDetails(details);
    assert.strictEqual(
      result.config,
      '[REDACTED:SENSITIVE_VALUE]',
      'Sensitive value should be redacted'
    );
  }

  // Details with both sensitive key and value
  {
    const details = { secret: 'password123' };
    const result = sanitizeDetails(details);
    assert.ok(
      '[REDACTED_KEY]' in result,
      'Sensitive key should be replaced'
    );
    assert.strictEqual(
      result['[REDACTED_KEY]'],
      '[REDACTED:SENSITIVE_VALUE]',
      'Sensitive value should also be redacted'
    );
  }

  // Empty details
  {
    const details = {};
    const result = sanitizeDetails(details);
    assert.deepStrictEqual(result, {}, 'Empty details should return empty object');
  }

  // Details with path value
  {
    const details = { path: '/home/user/.ssh/id_rsa' };
    const result = sanitizeDetails(details);
    assert.notStrictEqual(
      result.path,
      '/home/user/.ssh/id_rsa',
      'Path should be sanitized'
    );
  }

  // Details with array value
  {
    const details = { items: [1, 2, 3] };
    const result = sanitizeDetails(details);
    assert.strictEqual(
      result.items,
      '[Array(3)]',
      'Array should be abstracted'
    );
  }

  // Details with null value
  {
    const details = { empty: null };
    const result = sanitizeDetails(details);
    assert.strictEqual(result.empty, null, 'null should pass through');
  }

  console.log('✅ sanitizeDetails passed!');
}

/**
 * Test false positives - things that should NOT be detected
 */
function testFalsePositives(): void {
  console.log('Testing false positives (should NOT be detected)...');

  // Normal words that happen to contain keyword substrings
  {
    // "passionate" contains "pass" but not "password"
    assert.strictEqual(
      looksLikeSensitiveData('passionate'),
      false,
      '"passionate" should NOT be detected'
    );
  }

  {
    // "secretariat" contains "secret"
    assert.strictEqual(
      looksLikeSensitiveData('secretariat'),
      true, // This WILL be detected because it contains "secret"
      '"secretariat" contains "secret" so it WILL be detected'
    );
  }

  // Short strings that look like base64 but are too short
  {
    assert.strictEqual(
      looksLikeSensitiveData('AbCd1234'),
      false,
      'Short base64-like string should NOT be detected'
    );
  }

  // Numbers only (no keywords, no base64 pattern)
  {
    assert.strictEqual(
      looksLikeSensitiveData('123456'),
      false,
      'Pure numbers should NOT be detected'
    );
  }

  // Normal file names
  {
    assert.strictEqual(
      looksLikeSensitiveData('README.md'),
      false,
      'Normal file name should NOT be detected'
    );
  }

  // Normal identifiers
  {
    assert.strictEqual(
      looksLikeSensitiveData('my-project-name'),
      false,
      'Normal identifier should NOT be detected'
    );
  }

  // UUID (looks random but not base64)
  {
    assert.strictEqual(
      looksLikeSensitiveData('550e8400-e29b-41d4-a716-446655440000'),
      false,
      'UUID should NOT be detected (contains hyphens, not base64)'
    );
  }

  // Empty string
  {
    assert.strictEqual(
      looksLikeSensitiveData(''),
      false,
      'Empty string should NOT be detected'
    );
  }

  console.log('✅ False positive tests passed!');
}

/**
 * Test edge cases
 */
function testEdgeCases(): void {
  console.log('Testing edge cases...');

  // Case insensitivity
  {
    assert.strictEqual(
      looksLikeSensitiveData('PASSWORD'),
      true,
      'Uppercase PASSWORD should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('PaSsWoRd'),
      true,
      'Mixed case PaSsWoRd should be detected'
    );
  }

  // Keywords at different positions
  {
    assert.strictEqual(
      looksLikeSensitiveData('password'),
      true,
      'password at start should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('mypassword'),
      true,
      'password in middle should be detected'
    );
    assert.strictEqual(
      looksLikeSensitiveData('the_password_field'),
      true,
      'password with underscores should be detected'
    );
  }

  // Whitespace handling
  {
    assert.strictEqual(
      looksLikeSensitiveData('  password  '),
      true,
      'password with whitespace should be detected'
    );
  }

  // Special characters in strings
  {
    assert.strictEqual(
      looksLikeSensitiveData('password!@#$'),
      true,
      'password with special chars should be detected'
    );
  }

  // Unicode in strings
  {
    assert.strictEqual(
      looksLikeSensitiveData('パスワード'),
      false,
      'Japanese word should NOT be detected (no English keywords)'
    );
  }

  console.log('✅ Edge cases passed!');
}

/**
 * Test boundary conditions for string truncation
 */
function testTruncationBoundaries(): void {
  console.log('Testing truncation boundaries...');

  // Exactly at MAX_LOG_STRING_LENGTH (should not truncate)
  {
    const exactLength = 'x'.repeat(MAX_LOG_STRING_LENGTH);
    assert.strictEqual(exactLength.length, MAX_LOG_STRING_LENGTH);
    const result = sanitizeValue(exactLength);
    assert.strictEqual(
      result,
      exactLength,
      'String exactly at MAX_LOG_STRING_LENGTH should NOT be truncated'
    );
  }

  // One char over MAX_LOG_STRING_LENGTH (should truncate)
  {
    const oneOver = 'y'.repeat(MAX_LOG_STRING_LENGTH + 1);
    const result = sanitizeValue(oneOver) as string;
    assert.ok(
      result.endsWith('...[truncated]'),
      'String one char over limit should be truncated'
    );
    assert.strictEqual(
      result,
      'y'.repeat(MAX_LOG_STRING_LENGTH) + '...[truncated]',
      'Truncated content should be correct'
    );
  }

  // Very long string
  {
    const veryLong = 'z'.repeat(10000);
    const result = sanitizeValue(veryLong) as string;
    assert.ok(
      result.endsWith('...[truncated]'),
      'Very long string should be truncated'
    );
    assert.strictEqual(
      result.length,
      MAX_LOG_STRING_LENGTH + '...[truncated]'.length,
      'Truncated result should have correct length'
    );
  }

  console.log('✅ Truncation boundaries passed!');
}

/**
 * Test sanitizeDetails with multiple sensitive keys
 */
function testMultipleSensitiveKeys(): void {
  console.log('Testing multiple sensitive keys...');

  // Multiple sensitive keys should all become [REDACTED_KEY]
  // Note: Object keys are unique, so multiple [REDACTED_KEY] will merge
  {
    const details = { api_key: 'value1', password: 'value2', secret: 'value3' };
    const result = sanitizeDetails(details);

    // All sensitive keys become [REDACTED_KEY], which means they merge
    // The result will have only one [REDACTED_KEY] with the last value
    assert.ok(
      '[REDACTED_KEY]' in result,
      'Sensitive keys should be redacted'
    );
    assert.ok(
      !('api_key' in result) && !('password' in result) && !('secret' in result),
      'Original sensitive keys should not exist'
    );

    // Check that only one key remains (due to key collision)
    const keys = Object.keys(result);
    assert.strictEqual(
      keys.length,
      1,
      'Multiple sensitive keys merge into one [REDACTED_KEY]'
    );
  }

  // Mix of sensitive and safe keys
  {
    const details = {
      name: 'safe',
      api_key: 'sensitive',
      count: 42,
      password: 'also_sensitive'
    };
    const result = sanitizeDetails(details);

    assert.strictEqual(result.name, 'safe', 'Safe string key preserved');
    assert.strictEqual(result.count, 42, 'Safe number value preserved');
    assert.ok('[REDACTED_KEY]' in result, 'Sensitive keys redacted');

    // api_key and password both become [REDACTED_KEY], so 2 sensitive keys → 1 redacted key
    // Total: name, count, [REDACTED_KEY] = 3 keys
    assert.strictEqual(
      Object.keys(result).length,
      3,
      'Should have 3 keys (name, count, [REDACTED_KEY])'
    );
  }

  console.log('✅ Multiple sensitive keys passed!');
}

/**
 * Test path sanitization integration
 */
function testPathSanitizationIntegration(): void {
  console.log('Testing path sanitization integration...');

  // Unix sensitive paths should be sanitized
  {
    const sshPath = '/home/user/.ssh/id_rsa';
    const result = sanitizeValue(sshPath) as string;
    assert.ok(
      result.includes('[REDACTED') || result.includes('~'),
      'SSH path should be sanitized'
    );
    assert.ok(
      !result.includes('/home/user'),
      'User home should be replaced or redacted'
    );
  }

  // Windows sensitive paths
  {
    const windowsPath = 'C:\\Users\\test\\.ssh\\id_rsa';
    const result = sanitizeValue(windowsPath) as string;
    // pathSanitizer should handle this
    assert.notStrictEqual(
      result,
      windowsPath,
      'Windows sensitive path should be modified'
    );
  }

  // Non-sensitive path should still be processed
  {
    const normalPath = '/tmp/test.txt';
    const result = sanitizeValue(normalPath) as string;
    // pathSanitizer handles all paths starting with /
    assert.strictEqual(
      typeof result,
      'string',
      'Normal path should return string'
    );
  }

  console.log('✅ Path sanitization integration passed!');
}

/**
 * Test Base64 character diversity edge cases
 */
function testBase64DiversityEdgeCases(): void {
  console.log('Testing Base64 character diversity edge cases...');

  // Exactly 3 character types (threshold)
  {
    // Upper + lower + digit = 3 types (should detect)
    const threeTypes = 'Aa1' + 'Bb2'.repeat(10) + 'Cc3';
    const paddedTo32 = (threeTypes + 'X'.repeat(32)).slice(0, 32);
    // Ensure it has 3 types: A-Z, a-z, 0-9
    assert.strictEqual(paddedTo32.length, 32);
    assert.strictEqual(
      looksLikeSensitiveData(paddedTo32),
      true,
      'String with exactly 3 character types should be detected'
    );
  }

  // Only special chars (+/=) plus one other type (2 types - should not detect)
  {
    // This won't be valid base64 pattern anyway due to structure
    const specialOnly = '++//==++//==++//==++//==++//==++=';
    assert.strictEqual(specialOnly.length, 33);
    // Only has special chars, so even if base64 pattern matches, type count is 1
    // But the base64 pattern requires alphanumeric, so it won't match
    assert.strictEqual(
      looksLikeSensitiveData(specialOnly),
      false,
      'Special chars only should NOT be detected'
    );
  }

  console.log('✅ Base64 diversity edge cases passed!');
}

/**
 * Test object with exactly 5 keys (boundary for key display)
 */
function testObjectKeyDisplayBoundary(): void {
  console.log('Testing object key display boundary...');

  // Exactly 5 keys (should show all without ...)
  {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const result = sanitizeValue(obj) as string;
    assert.ok(
      result.includes('Object(5 keys'),
      'Should show 5 keys'
    );
    assert.ok(
      !result.includes('...'),
      'Should NOT show ... for exactly 5 keys'
    );
    assert.ok(
      result.includes('a') && result.includes('e'),
      'All 5 keys should be shown'
    );
  }

  // 6 keys (should show 5 + ...)
  {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };
    const result = sanitizeValue(obj) as string;
    assert.ok(
      result.includes('Object(6 keys'),
      'Should show 6 keys'
    );
    assert.ok(
      result.includes('...'),
      'Should show ... for 6 keys'
    );
  }

  // 4 keys (should show all without ...)
  {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = sanitizeValue(obj) as string;
    assert.ok(
      result.includes('Object(4 keys'),
      'Should show 4 keys'
    );
    assert.ok(
      !result.includes('...'),
      'Should NOT show ... for 4 keys'
    );
  }

  console.log('✅ Object key display boundary passed!');
}

/**
 * Test special JavaScript types (BigInt, Date, Error, RegExp)
 */
function testSpecialJavaScriptTypes(): void {
  console.log('Testing special JavaScript types...');

  // BigInt (treated as object by typeof, but has special handling)
  {
    const bigIntValue = BigInt(12345678901234567890n);
    const result = sanitizeValue(bigIntValue);
    // BigInt is typeof 'bigint', not 'object', so it falls through to [bigint]
    assert.strictEqual(
      result,
      '[bigint]',
      'BigInt should show type'
    );
  }

  // Date object
  {
    const dateValue = new Date('2026-01-08');
    const result = sanitizeValue(dateValue) as string;
    // Date is an object, so it will be abstracted
    assert.ok(
      result.includes('Object('),
      'Date should be treated as object'
    );
  }

  // Error object
  {
    const errorValue = new Error('test error');
    const result = sanitizeValue(errorValue) as string;
    assert.ok(
      result.includes('Object('),
      'Error should be treated as object'
    );
  }

  // RegExp object
  {
    const regExpValue = /test/gi;
    const result = sanitizeValue(regExpValue) as string;
    // RegExp is an object
    assert.ok(
      result.includes('Object('),
      'RegExp should be treated as object'
    );
  }

  // Map (object type)
  {
    const mapValue = new Map([['key', 'value']]);
    const result = sanitizeValue(mapValue) as string;
    assert.ok(
      result.includes('Object('),
      'Map should be treated as object'
    );
  }

  // Set (object type)
  {
    const setValue = new Set([1, 2, 3]);
    const result = sanitizeValue(setValue) as string;
    assert.ok(
      result.includes('Object('),
      'Set should be treated as object'
    );
  }

  console.log('✅ Special JavaScript types passed!');
}

/**
 * Test nested object behavior (non-recursive sanitization)
 */
function testNestedObjectBehavior(): void {
  console.log('Testing nested object behavior...');

  // Nested objects should be abstracted, not recursively sanitized
  {
    const nested = {
      outer: {
        inner: {
          password: 'secret123'
        }
      }
    };
    const result = sanitizeValue(nested) as string;
    // The outer object should be abstracted, not revealing nested structure
    assert.ok(
      result.includes('Object(') && result.includes('outer'),
      'Nested object should show outer key'
    );
    assert.ok(
      !result.includes('password') && !result.includes('secret'),
      'Nested sensitive keys should not be visible in abstraction'
    );
  }

  // Array inside object
  {
    const withArray = {
      items: [1, 2, 3],
      name: 'test'
    };
    const result = sanitizeValue(withArray) as string;
    assert.ok(
      result.includes('Object(2 keys'),
      'Object with array should show key count'
    );
    assert.ok(
      result.includes('items') && result.includes('name'),
      'Safe keys should be shown'
    );
  }

  console.log('✅ Nested object behavior passed!');
}

/**
 * Test all keyword variations more thoroughly
 */
function testKeywordVariations(): void {
  console.log('Testing keyword variations...');

  // api_key variations
  {
    const variations = ['api_key', 'API_KEY', 'ApiKey', 'api-key', 'API-KEY', 'apikey', 'APIKEY'];
    for (const v of variations) {
      assert.strictEqual(
        looksLikeSensitiveData(v),
        true,
        `${v} should be detected`
      );
    }
  }

  // All sensitive keywords with prefix/suffix
  {
    const keywords = ['secret', 'password', 'token', 'bearer', 'authorization', 'credential', 'private'];
    for (const keyword of keywords) {
      // As prefix
      assert.strictEqual(
        looksLikeSensitiveData(`${keyword}_value`),
        true,
        `${keyword}_value should be detected`
      );
      // As suffix
      assert.strictEqual(
        looksLikeSensitiveData(`my_${keyword}`),
        true,
        `my_${keyword} should be detected`
      );
      // Uppercase
      assert.strictEqual(
        looksLikeSensitiveData(keyword.toUpperCase()),
        true,
        `${keyword.toUpperCase()} should be detected`
      );
    }
  }

  console.log('✅ Keyword variations passed!');
}

/**
 * Test sanitizeValue with undefined properties
 */
function testUndefinedProperties(): void {
  console.log('Testing undefined properties...');

  // Object with undefined value
  {
    const obj = { name: 'test', missing: undefined };
    const result = sanitizeDetails(obj);
    assert.strictEqual(result.name, 'test', 'Defined value should pass');
    assert.strictEqual(result.missing, undefined, 'Undefined should pass through');
  }

  // Object with null value
  {
    const obj = { name: 'test', empty: null };
    const result = sanitizeDetails(obj);
    assert.strictEqual(result.name, 'test', 'Defined value should pass');
    assert.strictEqual(result.empty, null, 'Null should pass through');
  }

  console.log('✅ Undefined properties passed!');
}

/**
 * Test redactAllSensitive option (maximum privacy mode)
 */
function testRedactAllSensitiveOption(): void {
  console.log('Testing redactAllSensitive option...');

  const redactAllOptions: SanitizeOptions = { redactAllSensitive: true };
  const normalOptions: SanitizeOptions = { redactAllSensitive: false };

  // sanitizeValue with redactAllSensitive: true - all strings should be redacted
  {
    assert.strictEqual(
      sanitizeValue('hello', redactAllOptions),
      '[REDACTED:ALL_VALUES]',
      'Normal string should be redacted when redactAllSensitive is true'
    );
    assert.strictEqual(
      sanitizeValue('test@example.com', redactAllOptions),
      '[REDACTED:ALL_VALUES]',
      'Email-like string should be redacted'
    );
    assert.strictEqual(
      sanitizeValue('', redactAllOptions),
      '[REDACTED:ALL_VALUES]',
      'Empty string should also be redacted when redactAllSensitive is true'
    );
    assert.strictEqual(
      sanitizeValue('password123', redactAllOptions),
      '[REDACTED:ALL_VALUES]',
      'Sensitive string should be redacted as ALL_VALUES, not SENSITIVE_VALUE'
    );
  }

  // sanitizeValue with redactAllSensitive: false - normal behavior
  {
    assert.strictEqual(
      sanitizeValue('hello', normalOptions),
      'hello',
      'Normal string should pass through when redactAllSensitive is false'
    );
    assert.strictEqual(
      sanitizeValue('password123', normalOptions),
      '[REDACTED:SENSITIVE_VALUE]',
      'Sensitive string should be redacted as SENSITIVE_VALUE when redactAllSensitive is false'
    );
  }

  // sanitizeValue with empty options {} - normal behavior
  {
    assert.strictEqual(
      sanitizeValue('hello', {}),
      'hello',
      'Normal string should pass through with empty options'
    );
  }

  // sanitizeValue without options (undefined) - normal behavior (backward compatibility)
  {
    assert.strictEqual(
      sanitizeValue('hello'),
      'hello',
      'Normal string should pass through without options (backward compatibility)'
    );
  }

  // Non-string values should not be affected by redactAllSensitive
  {
    assert.strictEqual(
      sanitizeValue(42, redactAllOptions),
      42,
      'Number should pass through even with redactAllSensitive'
    );
    assert.strictEqual(
      sanitizeValue(true, redactAllOptions),
      true,
      'Boolean should pass through even with redactAllSensitive'
    );
    assert.strictEqual(
      sanitizeValue(null, redactAllOptions),
      null,
      'null should pass through even with redactAllSensitive'
    );
    assert.strictEqual(
      sanitizeValue(undefined, redactAllOptions),
      undefined,
      'undefined should pass through even with redactAllSensitive'
    );
    assert.strictEqual(
      sanitizeValue([1, 2, 3], redactAllOptions),
      '[Array(3)]',
      'Array should be abstracted even with redactAllSensitive'
    );
  }

  // sanitizeDetails with redactAllSensitive: true
  {
    const details = { name: 'test', count: 5, email: 'user@example.com' };
    const result = sanitizeDetails(details, redactAllOptions);
    assert.strictEqual(
      result.name,
      '[REDACTED:ALL_VALUES]',
      'String value in details should be redacted'
    );
    assert.strictEqual(
      result.count,
      5,
      'Number value in details should pass through'
    );
    assert.strictEqual(
      result.email,
      '[REDACTED:ALL_VALUES]',
      'Email value in details should be redacted'
    );
  }

  // sanitizeDetails with redactAllSensitive: false - normal behavior
  {
    const details = { name: 'test', password: 'secret123' };
    const result = sanitizeDetails(details, normalOptions);
    assert.strictEqual(
      result.name,
      'test',
      'Safe string should pass through'
    );
    assert.ok(
      '[REDACTED_KEY]' in result,
      'Sensitive key should be redacted'
    );
  }

  // sanitizeDetails with sensitive key and redactAllSensitive: true
  {
    const details = { api_key: 'my-api-key-value' };
    const result = sanitizeDetails(details, redactAllOptions);
    assert.ok(
      '[REDACTED_KEY]' in result,
      'Sensitive key should still be redacted'
    );
    assert.strictEqual(
      result['[REDACTED_KEY]'],
      '[REDACTED:ALL_VALUES]',
      'Value should be redacted as ALL_VALUES'
    );
  }

  console.log('✅ redactAllSensitive option passed!');
}

/**
 * Run all tests
 */
export async function runSensitiveDataDetectorTests(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Sensitive Data Detector Tests            ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    testKeywordDetection();
    testBase64PatternDetection();
    testDoSProtection();
    testSanitizeValueTypes();
    testPathDetection();
    testStringTruncation();
    testObjectHandling();
    testSensitiveDataRedaction();
    testSanitizeDetails();
    testFalsePositives();
    testEdgeCases();
    testTruncationBoundaries();
    testMultipleSensitiveKeys();
    testPathSanitizationIntegration();
    testBase64DiversityEdgeCases();
    testObjectKeyDisplayBoundary();
    testSpecialJavaScriptTypes();
    testNestedObjectBehavior();
    testKeywordVariations();
    testUndefinedProperties();
    testRedactAllSensitiveOption();

    console.log('\n✅ All sensitive data detector tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runSensitiveDataDetectorTests().catch(console.error);
}
