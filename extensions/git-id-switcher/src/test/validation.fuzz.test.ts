/**
 * Fuzzing Tests for Input Validation
 *
 * Uses fast-check for property-based testing (fuzzing) to discover
 * edge cases and potential security vulnerabilities in validation code.
 *
 * Test Coverage:
 * - validateIdentity(): crash resistance, return type, dangerous patterns
 * - validateIdentities(): large array handling
 * - isShellSafePath(): path traversal, shell metacharacters
 * - Field-specific: GPG key ID (hex), SSH host (hostname pattern)
 *
 * Total: ~4,650 property-based test runs per execution
 *
 * @see https://github.com/dubzzz/fast-check
 */

import * as assert from 'node:assert';
import * as fc from 'fast-check';
import { validateIdentity, validateIdentities, isShellSafePath } from '../identity/inputValidator';
import { hasInvisibleUnicode, INVISIBLE_CHARS } from '../validators/common';
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
  fc.constant(String.raw`foo\x00bar`),
  fc.constant(String.raw`foo\x0abar`),
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
        for (const e of result.errors) assert.strictEqual(typeof e, 'string');
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
 * Test: isShellSafePath should never throw
 */
function testIsPathSafeNeverThrows(): void {
  console.log('  Fuzzing: isShellSafePath should never throw...');

  fc.assert(
    fc.property(fc.string(), (path) => {
      const result = isShellSafePath(path);
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
          const result = isShellSafePath(pathFragment);
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
      const result = isShellSafePath(maliciousPath);
      // Most malicious strings should be rejected
      // (some may be false positives, but that's acceptable for security)
      if (/[`$(){}|&<>\n\r\0]/.test(maliciousPath)) {
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
      fc.string({ minLength: 1000, maxLength: 10_000 }),
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
 * Test: Bidi override characters should be detected by hasInvisibleUnicode
 * defense-in-depth: CVE-2021-42574 (Trojan Source) prevention
 */
function testBidiCharacterDetection(): void {
  console.log('  Fuzzing: Bidi characters should be detected in all positions...');

  // All Bidi-related characters that must be detected
  const bidiChars = [
    '\u202A', // LRE
    '\u202B', // RLE
    '\u202C', // PDF
    '\u202D', // LRO
    '\u202E', // RLO
    '\u2066', // LRI
    '\u2067', // RLI
    '\u2068', // FSI
    '\u2069', // PDI
    '\u180E', // Mongolian Vowel Separator
    '\u2028', // Line Separator
    '\u2029', // Paragraph Separator
  ];

  fc.assert(
    fc.property(
      fc.constantFrom(...bidiChars),
      fc.string(),
      fc.string(),
      (bidiChar, prefix, suffix) => {
        const input = prefix + bidiChar + suffix;
        assert.strictEqual(hasInvisibleUnicode(input), true,
          `Bidi char U+${bidiChar.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')} should be detected`);
      }
    ),
    { numRuns: 200, verbose: false }
  );

  console.log('    ✅ Passed (200 runs)');
}

/**
 * Test: Bidi characters should be detected by hasInvisibleUnicode in any string context
 * defense-in-depth: prevents Trojan Source attacks (CVE-2021-42574)
 *
 * Note: hasInvisibleUnicode is used by path validators and command allowlist,
 * not directly by validateIdentity for text fields. This test verifies the
 * detection function itself works correctly with Bidi characters.
 */
function testBidiInStringContexts(): void {
  console.log('  Fuzzing: Bidi characters should be detected in string contexts...');

  const bidiChars = [
    '\u202A', '\u202B', '\u202C', '\u202D', '\u202E',
    '\u2066', '\u2067', '\u2068', '\u2069',
  ];

  fc.assert(
    fc.property(
      fc.constantFrom(...bidiChars),
      fc.string(),
      fc.string(),
      (bidiChar, prefix, suffix) => {
        // Bidi characters should be detected in any string context
        const testStrings = [
          bidiChar,                           // standalone
          prefix + bidiChar + suffix,         // embedded
          '~/.ssh/' + bidiChar + 'id_rsa',   // in path context
          'user' + bidiChar + '@example.com', // in email context
        ];
        for (const s of testStrings) {
          assert.strictEqual(hasInvisibleUnicode(s), true,
            `Bidi char U+${bidiChar.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')} should be detected in "${s.slice(0, 30)}"`);
        }
      }
    ),
    { numRuns: 100, verbose: false }
  );

  console.log('    ✅ Passed (100 runs)');
}

/**
 * Test: All INVISIBLE_CHARS entries should be detected by hasInvisibleUnicode
 * Ensures no regression when new characters are added
 */
function testAllInvisibleCharsDetected(): void {
  console.log('  Fuzzing: all INVISIBLE_CHARS entries should be detected...');

  fc.assert(
    fc.property(
      fc.constantFrom(...INVISIBLE_CHARS),
      fc.string(),
      (invisibleChar, surrounding) => {
        // Character alone
        assert.strictEqual(hasInvisibleUnicode(invisibleChar), true,
          `Invisible char U+${invisibleChar.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')} should be detected alone`);
        // Character embedded in string
        assert.strictEqual(hasInvisibleUnicode(surrounding + invisibleChar), true,
          `Invisible char should be detected when embedded`);
      }
    ),
    { numRuns: 200, verbose: false }
  );

  console.log('    ✅ Passed (200 runs)');
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
    testBidiCharacterDetection();
    testBidiInStringContexts();
    testAllInvisibleCharsDetected();

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
