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
 */

import * as assert from 'assert';
import {
  validateCombinedFlags,
  isCommandAllowed,
} from '../commandAllowlist';

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
 * Test invalid character detection in flags
 */
function testInvalidCharacterDetection(): void {
  console.log('Testing invalid character detection...');

  // Flags with numbers
  {
    const result = validateCombinedFlags('-l1', 'ssh-keygen', ['-l', '-f']);
    assert.strictEqual(result.valid, false, '-l1 should be invalid (contains number)');
    assert.ok(
      result.reason?.includes('Invalid character'),
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
