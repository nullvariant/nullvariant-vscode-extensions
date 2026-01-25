/**
 * Fuzzing Tests for Input Validation
 *
 * Uses fast-check for property-based testing (fuzzing) to discover
 * edge cases and potential security vulnerabilities in validation code.
 *
 * Test Coverage:
 * - validateIdentity(): crash resistance, return type, dangerous patterns
 * - validateIdentities(): large array handling
 * - isPathSafe(): path traversal, shell metacharacters
 * - Field-specific: GPG key ID (hex), SSH host (hostname pattern)
 *
 * Total: ~4,650 property-based test runs per execution
 *
 * @see https://github.com/dubzzz/fast-check
 */

import * as assert from 'node:assert';
import * as fc from 'fast-check';
import { validateIdentity, validateIdentities, isPathSafe } from '../identity/inputValidator';
import { Identity } from '../identity/identity';

/**
 * Arbitrary for generating Identity-like objects
 * Generates random strings for all fields to test robustness
 */
const arbitraryIdentity = fc.record({
  id: fc.string(),
  name: fc.string(),
  email: fc.string(),
  icon: fc.option(fc.string(), { nil: undefined }),
  service: fc.option(fc.string(), { nil: undefined }),
  description: fc.option(fc.string(), { nil: undefined }),
  sshKeyPath: fc.option(fc.string(), { nil: undefined }),
  sshHost: fc.option(fc.string(), { nil: undefined }),
  gpgKeyId: fc.option(fc.string(), { nil: undefined }),
});

/**
 * Arbitrary for generating potentially malicious strings
 */
const maliciousStringArbitrary = fc.oneof(
  // Shell metacharacters
  fc.constant('`id`'),
  fc.constant('$(whoami)'),
  fc.constant('${PATH}'),
  fc.constant('foo | bar'),
  fc.constant('foo & bar'),
  fc.constant('foo < bar'),
  fc.constant('foo > bar'),
  fc.constant('foo { bar }'),
  // Newlines and null bytes (blocked by DANGEROUS_PATTERNS)
  fc.constant('foo\nbar'),
  fc.constant('foo\rbar'),
  fc.constant('foo\0bar'),
  // Note: tabs (\t) are intentionally allowed in names
  // Hex escapes
  fc.constant('foo\\x00bar'),
  fc.constant('foo\\x0abar'),
  // Path traversal
  fc.constant('../../../etc/passwd'),
  fc.constant('/home/../etc/passwd'),
  // Mixed with normal text
  fc.string().map(s => s + '$(id)'),
  fc.string().map(s => '`' + s + '`'),
);

/**
 * Test: validateIdentity should never throw on arbitrary input
 */
function testValidateIdentityNeverThrows(): void {
  console.log('  Fuzzing: validateIdentity should never throw...');

  fc.assert(
    fc.property(arbitraryIdentity, (identity: Identity) => {
      // Should not throw, regardless of input
      const result = validateIdentity(identity);

      // Result should always be a valid ValidationResult
      assert.strictEqual(typeof result.valid, 'boolean');
      assert.ok(Array.isArray(result.errors));
    }),
    { numRuns: 1000, verbose: false }
  );

  console.log('    ✅ Passed (1000 runs)');
}

/**
 * Test: validateIdentity should always return boolean valid and array errors
 */
function testValidateIdentityReturnType(): void {
  console.log('  Fuzzing: validateIdentity return type consistency...');

  fc.assert(
    fc.property(
      fc.record({
        id: fc.oneof(fc.string(), fc.constant(undefined), fc.constant(null)),
        name: fc.oneof(fc.string(), fc.constant(undefined), fc.constant(null)),
        email: fc.oneof(fc.string(), fc.constant(undefined), fc.constant(null)),
      }),
      (obj) => {
        const result = validateIdentity(obj as Identity);
        assert.strictEqual(typeof result.valid, 'boolean');
        assert.ok(Array.isArray(result.errors));
        result.errors.forEach(e => assert.strictEqual(typeof e, 'string'));
      }
    ),
    { numRuns: 500, verbose: false }
  );

  console.log('    ✅ Passed (500 runs)');
}

/**
 * Test: All dangerous patterns should be detected
 */
function testDangerousPatternsDetected(): void {
  console.log('  Fuzzing: dangerous patterns should be detected...');

  const dangerousChars = ['`', '$', '(', ')', '{', '}', '|', '&', '<', '>'];

  fc.assert(
    fc.property(
      fc.oneof(...dangerousChars.map(c => fc.constant(c))),
      fc.string(),
      fc.string(),
      (dangerousChar, prefix, suffix) => {
        const name = prefix + dangerousChar + suffix;
        const result = validateIdentity({
          id: 'test',
          name,
          email: 'test@example.com',
        });
        // Should detect the dangerous character
        assert.strictEqual(result.valid, false,
          `Should reject name containing '${dangerousChar}': "${name}"`);
      }
    ),
    { numRuns: 200, verbose: false }
  );

  console.log('    ✅ Passed (200 runs)');
}

/**
 * Test: Newline characters should always be rejected
 */
function testNewlineRejection(): void {
  console.log('  Fuzzing: newline characters should be rejected...');

  fc.assert(
    fc.property(
      fc.oneof(fc.constant('\n'), fc.constant('\r')),
      fc.string(),
      fc.string(),
      (newline, prefix, suffix) => {
        const name = prefix + newline + suffix;
        const result = validateIdentity({
          id: 'test',
          name,
          email: 'test@example.com',
        });
        assert.strictEqual(result.valid, false,
          `Should reject name containing newline: ${JSON.stringify(name)}`);
      }
    ),
    { numRuns: 100, verbose: false }
  );

  console.log('    ✅ Passed (100 runs)');
}

/**
 * Test: isPathSafe should never throw
 */
function testIsPathSafeNeverThrows(): void {
  console.log('  Fuzzing: isPathSafe should never throw...');

  fc.assert(
    fc.property(fc.string(), (path) => {
      const result = isPathSafe(path);
      assert.strictEqual(typeof result, 'boolean');
    }),
    { numRuns: 1000, verbose: false }
  );

  console.log('    ✅ Passed (1000 runs)');
}

/**
 * Test: Path traversal should always be detected
 */
function testPathTraversalDetection(): void {
  console.log('  Fuzzing: path traversal should be detected...');

  fc.assert(
    fc.property(
      fc.array(fc.constantFrom('/', 'a', 'b', 'c', '.'), { minLength: 1, maxLength: 20 }),
      (pathChars: string[]) => {
        const pathFragment = pathChars.join('');
        // If path contains "..", it should be unsafe
        if (pathFragment.includes('..')) {
          const result = isPathSafe(pathFragment);
          assert.strictEqual(result, false,
            `Should reject path with traversal: "${pathFragment}"`);
        }
      }
    ),
    { numRuns: 500, verbose: false }
  );

  console.log('    ✅ Passed (500 runs)');
}

/**
 * Test: Shell metacharacters in paths should be rejected
 */
function testPathShellMetacharacters(): void {
  console.log('  Fuzzing: shell metacharacters in paths should be rejected...');

  fc.assert(
    fc.property(maliciousStringArbitrary, (maliciousPath) => {
      const result = isPathSafe(maliciousPath);
      // Most malicious strings should be rejected
      // (some may be false positives, but that's acceptable for security)
      if (maliciousPath.match(/[`$(){}|&<>\n\r\0]/)) {
        assert.strictEqual(result, false,
          `Should reject path with dangerous chars: "${maliciousPath}"`);
      }
    }),
    { numRuns: 200, verbose: false }
  );

  console.log('    ✅ Passed (200 runs)');
}

/**
 * Test: validateIdentities should handle large arrays gracefully
 */
function testValidateIdentitiesLargeArrays(): void {
  console.log('  Fuzzing: validateIdentities with large arrays...');

  fc.assert(
    fc.property(
      fc.array(arbitraryIdentity, { maxLength: 100 }),
      (identities) => {
        const result = validateIdentities(identities as Identity[]);
        assert.strictEqual(typeof result.valid, 'boolean');
        assert.ok(Array.isArray(result.errors));
      }
    ),
    { numRuns: 50, verbose: false }
  );

  console.log('    ✅ Passed (50 runs)');
}

/**
 * Test: Arbitrary strings should not cause crashes
 */
function testArbitraryStringHandling(): void {
  console.log('  Fuzzing: arbitrary strings should not cause crashes...');

  fc.assert(
    fc.property(
      fc.string(),
      fc.string(),
      (name: string, email: string) => {
        const result = validateIdentity({
          id: 'test',
          name,
          email,
        });
        // Should not throw, result should be valid structure
        assert.strictEqual(typeof result.valid, 'boolean');
        assert.ok(Array.isArray(result.errors));
      }
    ),
    { numRuns: 500, verbose: false }
  );

  console.log('    ✅ Passed (500 runs)');
}

/**
 * Test: Null byte injection should be detected
 */
function testNullByteInjection(): void {
  console.log('  Fuzzing: null byte injection should be detected...');

  fc.assert(
    fc.property(
      fc.string(),
      fc.string(),
      (prefix, suffix) => {
        const maliciousName = prefix + '\0' + suffix;
        const result = validateIdentity({
          id: 'test',
          name: maliciousName,
          email: 'test@example.com',
        });
        assert.strictEqual(result.valid, false,
          `Should reject name with null byte: ${JSON.stringify(maliciousName)}`);
      }
    ),
    { numRuns: 100, verbose: false }
  );

  console.log('    ✅ Passed (100 runs)');
}

/**
 * Test: GPG key ID validation (must be hex only)
 */
function testGpgKeyIdValidation(): void {
  console.log('  Fuzzing: GPG key ID should only accept hex...');

  fc.assert(
    fc.property(
      fc.string({ minLength: 8, maxLength: 40 }),
      (gpgKeyId) => {
        const result = validateIdentity({
          id: 'test',
          name: 'Test User',
          email: 'test@example.com',
          gpgKeyId,
        });

        // If gpgKeyId contains non-hex characters, it should be invalid
        const isValidHex = /^[A-Fa-f0-9]{8,40}$/.test(gpgKeyId);
        if (!isValidHex) {
          assert.strictEqual(result.valid, false,
            `Non-hex GPG key ID should be rejected: "${gpgKeyId}"`);
        }
      }
    ),
    { numRuns: 200, verbose: false }
  );

  console.log('    ✅ Passed (200 runs)');
}

/**
 * Test: SSH host validation (alphanumeric + dots/hyphens/underscores)
 */
function testSshHostValidation(): void {
  console.log('  Fuzzing: SSH host should only accept valid hostnames...');

  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 253 }),
      (sshHost) => {
        const result = validateIdentity({
          id: 'test',
          name: 'Test User',
          email: 'test@example.com',
          sshHost,
        });

        // SSH host must match DNS-safe pattern
        const isValidHost = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(sshHost);
        if (!isValidHost) {
          assert.strictEqual(result.valid, false,
            `Invalid SSH host should be rejected: "${sshHost}"`);
        }
      }
    ),
    { numRuns: 200, verbose: false }
  );

  console.log('    ✅ Passed (200 runs)');
}

/**
 * Test: Very long strings should be handled gracefully
 */
function testVeryLongStrings(): void {
  console.log('  Fuzzing: very long strings should be handled...');

  fc.assert(
    fc.property(
      fc.string({ minLength: 1000, maxLength: 10000 }),
      (longString) => {
        const result = validateIdentity({
          id: 'test',
          name: longString,
          email: 'test@example.com',
        });
        // Should not throw
        assert.strictEqual(typeof result.valid, 'boolean');
        // Long names should be rejected
        if (longString.length > 256) {
          assert.strictEqual(result.valid, false,
            'Very long name should be rejected');
        }
      }
    ),
    { numRuns: 100, verbose: false }
  );

  console.log('    ✅ Passed (100 runs)');
}

/**
 * Run all fuzzing tests
 */
export function runFuzzingTests(): void {
  console.log('\n=== Fuzzing Tests (Property-based Testing) ===\n');

  try {
    testValidateIdentityNeverThrows();
    testValidateIdentityReturnType();
    testDangerousPatternsDetected();
    testNewlineRejection();
    testNullByteInjection();
    testIsPathSafeNeverThrows();
    testPathTraversalDetection();
    testPathShellMetacharacters();
    testValidateIdentitiesLargeArrays();
    testArbitraryStringHandling();
    testVeryLongStrings();
    testGpgKeyIdValidation();
    testSshHostValidation();

    console.log('\n✅ All fuzzing tests passed!\n');
  } catch (error) {
    console.error('\n❌ Fuzzing test failed:', error);
    throw error;
  }
}

// Run tests when executed directly
if (require.main === module) {
  runFuzzingTests();
}
