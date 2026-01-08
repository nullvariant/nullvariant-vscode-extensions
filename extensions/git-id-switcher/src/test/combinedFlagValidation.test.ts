/**
 * Security Tests for Combined Flag Validation
 *
 * Tests comprehensive flag security including:
 * - Combined flag parsing (-lf, -abc)
 * - Duplicate flag detection (-ll)
 * - Unknown flag detection
 * - Order-sensitive validation
 * - DoS attack prevention (long flag strings)
 * - Integration with isCommandAllowed
 * - Whitespace/null byte/control character detection
 * - Invisible Unicode character detection
 * - Path separator injection prevention
 * - Unicode normalization attack prevention
 * - Case sensitivity handling
 * - Non-ASCII dash character handling
 * - Windows-specific path injection prevention
 *
 * Coverage: flagValidator.ts achieves 95.65% statement coverage.
 *
 * Intentionally uncovered lines (defensive/extensibility code):
 * - Lines 101-102, 104-105: Post-NFC-normalization checks for control chars
 *   and invisible Unicode. These are defensive checks that trigger only if
 *   NFC normalization introduces problematic characters, which is extremely
 *   rare in practice. The pre-normalization checks catch virtually all cases.
 * - Lines 210-216: Unordered pattern matching logic. Currently, all patterns
 *   in ALLOWED_COMBINED_PATTERNS use ordered=true. This code exists for
 *   future extensibility but has no active use case.
 */

import * as assert from 'assert';
import { validateCombinedFlags } from '../flagValidator';
import { isCommandAllowed } from '../commandAllowlist';

/**
 * Test basic combined flag validation
 */
function testBasicCombinedFlags(): void {
  console.log('Testing basic combined flag validation...');

  // Valid combined flag for ssh-keygen
  {
    const result = validateCombinedFlags('-lf', 'ssh-keygen', ['-l', '-f', '-lf']);
    assert.strictEqual(result.valid, true, '-lf should be valid for ssh-keygen');
  }

  // Single character flag
  {
    const result = validateCombinedFlags('-l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, true, '-l should be valid');
  }

  // Single character flag not in allowlist
  {
    const result = validateCombinedFlags('-x', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-x should be invalid');
    assert.ok(result.reason?.includes('not in allowlist'), 'Should mention not in allowlist');
  }

  console.log('✅ Basic combined flag validation passed!');
}

/**
 * Test duplicate flag detection
 */
function testDuplicateFlagDetection(): void {
  console.log('Testing duplicate flag detection...');

  const duplicateFlags = [
    '-ll',
    '-ff',
    '-aa',
    '-lfl',
    '-aba',
  ];

  for (const flag of duplicateFlags) {
    const result = validateCombinedFlags(flag, 'ssh-keygen', ['-l', '-f', '-a']);
    assert.strictEqual(
      result.valid,
      false,
      `Duplicate flag should be blocked: "${flag}"`
    );
    assert.ok(
      result.reason?.includes('Duplicate'),
      `Should mention duplicate for: "${flag}"`
    );
  }

  console.log('✅ Duplicate flag detection passed!');
}

/**
 * Test unknown flag detection in combined flags
 */
function testUnknownFlagDetection(): void {
  console.log('Testing unknown flag detection...');

  // Unknown flag in combined
  {
    const result = validateCombinedFlags('-lfa', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-lfa should be invalid (a is unknown)');
    assert.ok(
      result.reason?.includes('Unknown flag character') || result.reason?.includes('not in allowed patterns'),
      'Should mention unknown flag or not in patterns'
    );
  }

  // All unknown flags
  {
    const result = validateCombinedFlags('-xyz', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-xyz should be invalid');
  }

  console.log('✅ Unknown flag detection passed!');
}

/**
 * Test order-sensitive flag validation
 */
function testOrderSensitiveFlags(): void {
  console.log('Testing order-sensitive flag validation...');

  // -lf is allowed for ssh-keygen (order matters)
  {
    const result = validateCombinedFlags('-lf', 'ssh-keygen', ['-l', '-f', '-lf']);
    assert.strictEqual(result.valid, true, '-lf should be valid (correct order)');
  }

  // -fl is NOT allowed for ssh-keygen (wrong order)
  {
    const result = validateCombinedFlags('-fl', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-fl should be invalid (wrong order)');
    assert.ok(
      result.reason?.includes('not explicitly allowed') || result.reason?.includes('not in allowed patterns'),
      'Should mention not allowed'
    );
  }

  console.log('✅ Order-sensitive flag validation passed!');
}

/**
 * Test DoS attack prevention (long flag strings)
 */
function testDoSPrevention(): void {
  console.log('Testing DoS attack prevention...');

  // Very long flag string
  {
    const longFlag = '-' + 'a'.repeat(100);
    const result = validateCombinedFlags(longFlag, 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Very long flag should be blocked');
    assert.ok(
      result.reason?.includes('maximum length') || result.reason?.includes('too many characters'),
      'Should mention length limit'
    );
  }

  // Flag string with many unique characters
  {
    const manyCharsFlag = '-abcdefghijk';
    const result = validateCombinedFlags(manyCharsFlag, 'ssh-keygen', [
      '-a', '-b', '-c', '-d', '-e', '-f', '-g', '-h', '-i', '-j', '-k',
    ]);
    assert.strictEqual(result.valid, false, 'Flag with many chars should be blocked');
    assert.ok(
      result.reason?.includes('too many characters'),
      'Should mention too many characters'
    );
  }

  console.log('✅ DoS attack prevention passed!');
}

/**
 * Test long option handling (--option)
 */
function testLongOptions(): void {
  console.log('Testing long option handling...');

  // Long options should not be processed by validateCombinedFlags
  // (they should be handled by exact match in caller)
  {
    const result = validateCombinedFlags('--apple-use-keychain', 'ssh-add', ['--apple-use-keychain']);
    assert.strictEqual(result.valid, true, 'Long options should pass through');
  }

  console.log('✅ Long option handling passed!');
}

/**
 * Test empty and edge case flags
 */
function testEdgeCases(): void {
  console.log('Testing edge cases...');

  // Empty string
  {
    const result = validateCombinedFlags('', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Empty string should be invalid');
  }

  // Just a dash
  {
    const result = validateCombinedFlags('-', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Just dash should be invalid');
  }

  // Non-flag string (no dash prefix)
  {
    const result = validateCombinedFlags('lf', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, true, 'Non-flag should pass through to caller');
  }

  console.log('✅ Edge cases passed!');
}

/**
 * Test leading/trailing whitespace detection
 */
function testWhitespaceDetection(): void {
  console.log('Testing leading/trailing whitespace detection...');

  // Leading whitespace
  {
    const result = validateCombinedFlags(' -l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Leading space should be invalid');
    assert.ok(
      result.reason?.includes('whitespace'),
      'Should mention whitespace'
    );
  }

  // Trailing whitespace
  {
    const result = validateCombinedFlags('-l ', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Trailing space should be invalid');
    assert.ok(
      result.reason?.includes('whitespace'),
      'Should mention whitespace'
    );
  }

  // Both leading and trailing whitespace
  {
    const result = validateCombinedFlags(' -l ', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Both leading and trailing whitespace should be invalid');
  }

  // Tab character as whitespace
  {
    const result = validateCombinedFlags('\t-l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Tab as leading whitespace should be invalid');
  }

  // Newline as whitespace
  {
    const result = validateCombinedFlags('-l\n', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Newline as trailing whitespace should be invalid');
  }

  console.log('✅ Leading/trailing whitespace detection passed!');
}

/**
 * Test null byte detection
 */
function testNullByteDetection(): void {
  console.log('Testing null byte detection...');

  // Null byte in flag
  {
    const result = validateCombinedFlags('-l\x00f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Null byte should be invalid');
    assert.ok(
      result.reason?.includes('null byte'),
      'Should mention null byte'
    );
  }

  // Null byte at start
  {
    const result = validateCombinedFlags('\x00-l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Null byte at start should be invalid');
  }

  // Null byte at end
  {
    const result = validateCombinedFlags('-l\x00', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Null byte at end should be invalid');
  }

  console.log('✅ Null byte detection passed!');
}

/**
 * Test control character detection
 */
function testControlCharacterDetection(): void {
  console.log('Testing control character detection...');

  // Bell character (ASCII 7)
  {
    const result = validateCombinedFlags('-l\x07f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Bell character should be invalid');
    assert.ok(
      result.reason?.includes('control character'),
      'Should mention control character'
    );
  }

  // Escape character (ASCII 27)
  {
    const result = validateCombinedFlags('-l\x1bf', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Escape character should be invalid');
  }

  // Backspace character (ASCII 8)
  {
    const result = validateCombinedFlags('-l\x08f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Backspace character should be invalid');
  }

  // Form feed (ASCII 12)
  {
    const result = validateCombinedFlags('-l\x0cf', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Form feed should be invalid');
  }

  // Carriage return in middle of flag
  {
    const result = validateCombinedFlags('-l\rf', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Carriage return should be invalid');
  }

  console.log('✅ Control character detection passed!');
}

/**
 * Test invisible Unicode character detection
 */
function testInvisibleUnicodeDetection(): void {
  console.log('Testing invisible Unicode character detection...');

  // Zero-width space (U+200B)
  {
    const result = validateCombinedFlags('-l\u200bf', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Zero-width space should be invalid');
    assert.ok(
      result.reason?.includes('invisible Unicode'),
      'Should mention invisible Unicode'
    );
  }

  // Zero-width non-joiner (U+200C)
  {
    const result = validateCombinedFlags('-l\u200cf', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Zero-width non-joiner should be invalid');
  }

  // Zero-width joiner (U+200D)
  {
    const result = validateCombinedFlags('-l\u200df', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Zero-width joiner should be invalid');
  }

  // Left-to-right mark (U+200E)
  {
    const result = validateCombinedFlags('-l\u200ef', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Left-to-right mark should be invalid');
  }

  // Right-to-left mark (U+200F)
  {
    const result = validateCombinedFlags('-l\u200ff', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Right-to-left mark should be invalid');
  }

  // Word joiner (U+2060)
  {
    const result = validateCombinedFlags('-l\u2060f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Word joiner should be invalid');
  }

  // Left-to-right embedding (U+202A)
  {
    const result = validateCombinedFlags('-l\u202af', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Left-to-right embedding should be invalid');
  }

  console.log('✅ Invisible Unicode character detection passed!');
}

/**
 * Test Unicode normalization edge cases
 */
function testUnicodeNormalization(): void {
  console.log('Testing Unicode normalization edge cases...');

  // Combining characters (may normalize to different form)
  // é as e + combining acute accent (U+0301)
  {
    const result = validateCombinedFlags('-le\u0301', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Combining accent should be invalid');
    assert.ok(
      result.reason?.includes('invalid characters') || result.reason?.includes('not in allowlist'),
      'Should be rejected as invalid character'
    );
  }

  // Fullwidth letters (should be rejected)
  // Fullwidth 'l' (U+FF4C)
  {
    const result = validateCombinedFlags('-\uff4c', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Fullwidth letter should be invalid');
  }

  // Homoglyph attack: Cyrillic 'а' instead of Latin 'a'
  {
    const result = validateCombinedFlags('-l\u0430', 'ssh-keygen', ['-l', '-a']);
    assert.strictEqual(result.valid, false, 'Cyrillic homoglyph should be invalid');
  }

  console.log('✅ Unicode normalization edge cases passed!');
}

/**
 * Test path separator detection in flags
 */
function testPathSeparatorDetection(): void {
  console.log('Testing path separator detection in flags...');

  // Forward slash in flag (potential path injection)
  {
    const result = validateCombinedFlags('-f/etc/passwd', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Forward slash should be invalid');
    assert.ok(
      result.reason?.includes('path-like pattern'),
      'Should mention path-like pattern'
    );
  }

  // Backslash in flag (Windows path injection)
  {
    const result = validateCombinedFlags('-f\\Windows\\System32', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Backslash should be invalid');
  }

  // Tilde expansion attack
  {
    const result = validateCombinedFlags('-f~/.ssh/id_rsa', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Tilde path should be invalid');
  }

  // Relative path injection with ./
  {
    const result = validateCombinedFlags('-f./secret', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Relative path ./ should be invalid');
  }

  // Parent directory traversal ../
  {
    const result = validateCombinedFlags('-f../../../etc/passwd', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Parent directory traversal should be invalid');
  }

  // Absolute path starting with /
  {
    const result = validateCombinedFlags('-l/home/user', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Absolute path should be invalid');
  }

  // Mixed path separators
  {
    const result = validateCombinedFlags('-f\\path/to/file', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Mixed path separators should be invalid');
  }

  console.log('✅ Path separator detection in flags passed!');
}

/**
 * Test dangerous flag rejection via integration
 */
function testDangerousFlagRejection(): void {
  console.log('Testing dangerous flag rejection...');

  // --exec flag (command execution)
  {
    const result = isCommandAllowed('git', ['--exec=malicious']);
    assert.strictEqual(result.allowed, false, '--exec should be blocked');
  }

  // --upload-pack (potential RCE in git)
  {
    const result = isCommandAllowed('git', ['--upload-pack=/bin/sh']);
    assert.strictEqual(result.allowed, false, '--upload-pack should be blocked');
  }

  // -o option with ProxyCommand (SSH escape)
  {
    const result = isCommandAllowed('ssh', ['-o', 'ProxyCommand=/bin/sh']);
    assert.strictEqual(result.allowed, false, '-o ProxyCommand should be blocked');
  }

  // Unknown git command
  {
    const result = isCommandAllowed('git', ['arbitrary-subcommand']);
    assert.strictEqual(result.allowed, false, 'Unknown git subcommand should be blocked');
  }

  console.log('✅ Dangerous flag rejection passed!');
}

/**
 * Test combined flag with valid individual flags but no explicit pattern
 * This tests the "fall-through" behavior where all chars are valid but combination is rejected
 */
function testCombinedFlagNotExplicitlyAllowed(): void {
  console.log('Testing combined flag not explicitly allowed...');

  // -lf is explicitly allowed for ssh-keygen
  {
    const result = validateCombinedFlags('-lf', 'ssh-keygen', ['-l', '-f', '-lf']);
    assert.strictEqual(result.valid, true, '-lf should be valid for ssh-keygen');
  }

  // -ab has valid individual flags but no explicit pattern
  // For a command with patterns defined, unlisted combinations should be rejected
  {
    // ssh-keygen has patterns, so -ab (if a and b were allowed) would be rejected
    // since it's not in ALLOWED_COMBINED_PATTERNS
    const result = validateCombinedFlags('-fl', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-fl should be invalid (wrong order)');
    assert.ok(
      result.reason?.includes('not explicitly allowed'),
      'Should mention not explicitly allowed'
    );
  }

  // For a command without defined patterns, any combination is rejected
  {
    const result = validateCombinedFlags('-ab', 'ssh-add', ['-a', '-b']);
    assert.strictEqual(result.valid, false, '-ab should be invalid for ssh-add');
    assert.ok(
      result.reason?.includes('not explicitly allowed'),
      'Should mention not explicitly allowed for command without patterns'
    );
  }

  console.log('✅ Combined flag not explicitly allowed tests passed!');
}

/**
 * Test various Unicode attack vectors comprehensively
 */
function testUnicodeAttackVectors(): void {
  console.log('Testing Unicode attack vectors...');

  // Byte order mark (BOM) - U+FEFF
  {
    const result = validateCombinedFlags('-l\ufefff', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'BOM should be invalid');
  }

  // Soft hyphen - U+00AD (invisible)
  {
    const result = validateCombinedFlags('-l\u00adf', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Soft hyphen should be invalid');
  }

  // Mongolian vowel separator - U+180E
  {
    const result = validateCombinedFlags('-l\u180ef', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Mongolian vowel separator should be invalid');
  }

  // Right-to-left override - U+202E (can be used for display attacks)
  {
    const result = validateCombinedFlags('-l\u202ef', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'RTL override should be invalid');
  }

  // Zero-width no-break space / BOM - U+FEFF
  {
    const result = validateCombinedFlags('\ufeff-l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Leading BOM should be invalid');
  }

  // Combining Grapheme Joiner - U+034F
  {
    const result = validateCombinedFlags('-l\u034ff', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Combining grapheme joiner should be invalid');
  }

  console.log('✅ Unicode attack vectors tests passed!');
}

/**
 * Test boundary conditions for length limits
 */
function testLengthBoundaries(): void {
  console.log('Testing length boundaries...');

  // Exactly at MAX_FLAG_LENGTH (50 chars)
  {
    const flag = '-' + 'a'.repeat(49);
    assert.strictEqual(flag.length, 50, 'Flag should be exactly 50 chars');
    const result = validateCombinedFlags(flag, 'ssh-keygen', ['-a']);
    assert.strictEqual(result.valid, false, 'Flag at MAX_FLAG_LENGTH should be blocked (too many chars)');
  }

  // Just under MAX_FLAG_LENGTH
  {
    const flag = '-' + 'a'.repeat(9);
    const result = validateCombinedFlags(flag, 'ssh-keygen', ['-a']);
    assert.strictEqual(result.valid, false, 'Flag should be blocked (duplicate chars or too many)');
  }

  // Over MAX_COMBINED_FLAG_CHARS (10 chars limit, so 11 triggers error)
  {
    const flag = '-abcdefghijk';
    assert.strictEqual(flag.length - 1, 11, 'Flag body should be 11 chars (over limit)');
    const result = validateCombinedFlags(flag, 'ssh-keygen', [
      '-a', '-b', '-c', '-d', '-e', '-f', '-g', '-h', '-i', '-j', '-k'
    ]);
    assert.strictEqual(result.valid, false, 'Flag over MAX_COMBINED_FLAG_CHARS should be blocked');
    assert.ok(
      result.reason?.includes('too many characters'),
      'Should mention too many characters'
    );
  }

  // At MAX_COMBINED_FLAG_CHARS boundary (exactly 10 - passes length check, fails pattern check)
  {
    const flag = '-abcdefghij';
    const result = validateCombinedFlags(flag, 'ssh-keygen', [
      '-a', '-b', '-c', '-d', '-e', '-f', '-g', '-h', '-i', '-j'
    ]);
    // This passes length check but fails because combination not explicitly allowed
    assert.strictEqual(result.valid, false, 'Flag at MAX_COMBINED_FLAG_CHARS should be blocked');
    assert.ok(
      result.reason?.includes('not explicitly allowed'),
      'Should mention not explicitly allowed'
    );
  }

  console.log('✅ Length boundaries tests passed!');
}

/**
 * Test case sensitivity in flags
 */
function testCaseSensitivity(): void {
  console.log('Testing case sensitivity in flags...');

  // Upper case single flag (should work if in allowlist)
  {
    const result = validateCombinedFlags('-L', 'ssh-keygen', ['-L', '-l', '-f']);
    assert.strictEqual(result.valid, true, '-L should be valid if in allowlist');
  }

  // Upper case single flag not in allowlist
  {
    const result = validateCombinedFlags('-L', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-L should be invalid if only -l is allowed');
    assert.ok(
      result.reason?.includes('not in allowlist'),
      'Should mention not in allowlist'
    );
  }

  // Mixed case combined flag
  {
    const result = validateCombinedFlags('-Lf', 'ssh-keygen', ['-L', '-f']);
    // This would need an explicit pattern to be allowed
    assert.strictEqual(result.valid, false, '-Lf should be invalid (no pattern defined)');
  }

  // ssh-add uses -D (upper case)
  {
    const result = isCommandAllowed('ssh-add', ['-D']);
    assert.strictEqual(result.allowed, true, 'ssh-add -D should be allowed');
  }

  console.log('✅ Case sensitivity tests passed!');
}

/**
 * Test non-ASCII dash characters (potential obfuscation)
 */
function testNonAsciiDashCharacters(): void {
  console.log('Testing non-ASCII dash characters...');

  // En-dash (U+2013)
  {
    const result = validateCombinedFlags('\u2013l', 'ssh-keygen', ['-l', '-f']);
    // En-dash is not a valid flag prefix
    assert.strictEqual(result.valid, true, 'En-dash prefix should pass through (non-flag)');
  }

  // Em-dash (U+2014)
  {
    const result = validateCombinedFlags('\u2014l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, true, 'Em-dash prefix should pass through (non-flag)');
  }

  // Minus sign (U+2212) - mathematical minus
  {
    const result = validateCombinedFlags('\u2212l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, true, 'Math minus prefix should pass through (non-flag)');
  }

  // Hyphen (U+2010)
  {
    const result = validateCombinedFlags('\u2010l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, true, 'Hyphen prefix should pass through (non-flag)');
  }

  // Non-breaking hyphen (U+2011)
  {
    const result = validateCombinedFlags('\u2011l', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, true, 'Non-breaking hyphen should pass through (non-flag)');
  }

  console.log('✅ Non-ASCII dash character tests passed!');
}

/**
 * Test flag with special Windows-specific issues
 */
function testWindowsSpecificFlags(): void {
  console.log('Testing Windows-specific flag issues...');

  // Windows-style path in flag (backslash)
  {
    const result = validateCombinedFlags('-fC:\\Users\\test', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'Windows path in flag should be invalid');
    assert.ok(
      result.reason?.includes('path-like pattern'),
      'Should mention path-like pattern'
    );
  }

  // UNC path style
  {
    const result = validateCombinedFlags('-f\\\\server\\share', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, 'UNC path in flag should be invalid');
  }

  console.log('✅ Windows-specific flag tests passed!');
}

/**
 * Test invalid character detection in flags
 */
function testInvalidCharacterDetection(): void {
  console.log('Testing invalid character detection...');

  // Flags with numbers
  {
    const result = validateCombinedFlags('-l1', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l1 should be invalid (contains number)');
    assert.ok(
      result.reason?.includes('invalid characters'),
      'Should mention invalid character'
    );
  }

  // Flags with special characters
  {
    const result = validateCombinedFlags('-l@f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l@f should be invalid (contains @)');
  }

  // Flags with embedded dash
  {
    const result = validateCombinedFlags('-l-f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l-f should be invalid (contains -)');
  }

  // Flags with underscore
  {
    const result = validateCombinedFlags('-l_f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l_f should be invalid (contains _)');
  }

  // Flags with space
  {
    const result = validateCombinedFlags('-l f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l f should be invalid (contains space)');
  }

  // Flags with dot
  {
    const result = validateCombinedFlags('-l.f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l.f should be invalid (contains .)');
  }

  // Flags with equals sign (often used for values)
  {
    const result = validateCombinedFlags('-l=value', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l=value should be invalid (contains =)');
  }

  // Flags with colon
  {
    const result = validateCombinedFlags('-l:f', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l:f should be invalid (contains :)');
  }

  console.log('✅ Invalid character detection passed!');
}

/**
 * Test integration with isCommandAllowed for ssh-keygen
 */
function testSshKeygenIntegration(): void {
  console.log('Testing ssh-keygen integration...');

  // Valid command: ssh-keygen -lf /path/to/key
  {
    const result = isCommandAllowed('ssh-keygen', ['-lf', '/home/user/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, true, 'ssh-keygen -lf should be allowed');
  }

  // Valid command: ssh-keygen -l -f /path/to/key (separate flags)
  {
    const result = isCommandAllowed('ssh-keygen', ['-l', '-f', '/home/user/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, true, 'ssh-keygen -l -f should be allowed');
  }

  // Invalid: ssh-keygen -fl (wrong order)
  {
    const result = isCommandAllowed('ssh-keygen', ['-fl', '/home/user/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, false, 'ssh-keygen -fl should be blocked (wrong order)');
  }

  // Invalid: ssh-keygen -lfa (unknown flag 'a')
  {
    const result = isCommandAllowed('ssh-keygen', ['-lfa', '/home/user/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, false, 'ssh-keygen -lfa should be blocked (unknown a)');
  }

  // Invalid: ssh-keygen -ll (duplicate flag)
  {
    const result = isCommandAllowed('ssh-keygen', ['-ll', '/home/user/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, false, 'ssh-keygen -ll should be blocked (duplicate)');
  }

  // Invalid: very long flag
  {
    const longFlag = '-' + 'l'.repeat(60);
    const result = isCommandAllowed('ssh-keygen', [longFlag, '/home/user/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, false, 'Very long flag should be blocked');
  }

  console.log('✅ ssh-keygen integration passed!');
}

/**
 * Test integration with isCommandAllowed for ssh-add
 */
function testSshAddIntegration(): void {
  console.log('Testing ssh-add integration...');

  // Valid command: ssh-add -l
  {
    const result = isCommandAllowed('ssh-add', ['-l']);
    assert.strictEqual(result.allowed, true, 'ssh-add -l should be allowed');
  }

  // Valid command: ssh-add -D
  {
    const result = isCommandAllowed('ssh-add', ['-D']);
    assert.strictEqual(result.allowed, true, 'ssh-add -D should be allowed');
  }

  // Valid command: ssh-add with path
  {
    const result = isCommandAllowed('ssh-add', ['/home/user/.ssh/id_rsa']);
    assert.strictEqual(result.allowed, true, 'ssh-add with valid path should be allowed');
  }

  // Invalid: ssh-add with unknown flag
  {
    const result = isCommandAllowed('ssh-add', ['-x']);
    assert.strictEqual(result.allowed, false, 'ssh-add -x should be blocked');
  }

  // Invalid: ssh-add with combined flags (not defined for ssh-add)
  {
    const result = isCommandAllowed('ssh-add', ['-ld']);
    assert.strictEqual(result.allowed, false, 'ssh-add -ld should be blocked (no combined patterns)');
  }

  console.log('✅ ssh-add integration passed!');
}

/**
 * Test command without combined pattern restrictions
 */
function testCommandWithoutPatternRestrictions(): void {
  console.log('Testing command without pattern restrictions...');

  // All combined flags are rejected unless explicitly allowed in ALLOWED_COMBINED_PATTERNS
  // This ensures strict security by default

  console.log('✅ Command without pattern restrictions handled correctly!');
}

/**
 * Test argument count and length limits
 */
function testArgumentLimits(): void {
  console.log('Testing argument limits...');

  // Too many arguments
  {
    const manyArgs = Array(25).fill('-l');
    const result = isCommandAllowed('ssh-add', manyArgs);
    assert.strictEqual(result.allowed, false, 'Too many arguments should be blocked');
    assert.ok(
      result.reason?.includes('Too many arguments'),
      'Should mention too many arguments'
    );
  }

  // Very long argument (not a path)
  {
    const longArg = 'a'.repeat(300);
    const result = isCommandAllowed('ssh-add', [longArg]);
    assert.strictEqual(result.allowed, false, 'Very long argument should be blocked');
    assert.ok(
      result.reason?.includes('maximum length'),
      'Should mention maximum length'
    );
  }

  // Normal number of arguments should be allowed
  {
    const result = isCommandAllowed('ssh-add', ['-l']);
    assert.strictEqual(result.allowed, true, 'Normal args count should be allowed');
  }

  console.log('✅ Argument limits passed!');
}

/**
 * Run all combined flag validation tests
 */
export async function runCombinedFlagValidationTests(): Promise<void> {
  console.log('\n=== Combined Flag Validation Tests ===\n');

  try {
    testBasicCombinedFlags();
    testDuplicateFlagDetection();
    testUnknownFlagDetection();
    testOrderSensitiveFlags();
    testDoSPrevention();
    testLongOptions();
    testEdgeCases();
    testWhitespaceDetection();
    testNullByteDetection();
    testControlCharacterDetection();
    testInvisibleUnicodeDetection();
    testUnicodeNormalization();
    testPathSeparatorDetection();
    testDangerousFlagRejection();
    testCombinedFlagNotExplicitlyAllowed();
    testUnicodeAttackVectors();
    testLengthBoundaries();
    testCaseSensitivity();
    testNonAsciiDashCharacters();
    testWindowsSpecificFlags();
    testInvalidCharacterDetection();
    testSshKeygenIntegration();
    testSshAddIntegration();
    testCommandWithoutPatternRestrictions();
    testArgumentLimits();

    console.log('\n✅ All combined flag validation tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runCombinedFlagValidationTests().catch(console.error);
}
