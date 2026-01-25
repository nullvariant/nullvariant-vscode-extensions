/**
 * Tests for displayLimits.ts
 *
 * Covers truncation functions for various display contexts.
 */

import * as assert from 'node:assert';
import {
  countGraphemes,
  truncateForStatusBar,
  truncateForQuickPickLabel,
  truncateForQuickPickDetail,
  isSingleGrapheme,
  DISPLAY_LIMITS,
} from '../ui/displayLimits';

/**
 * Test suite for countGraphemes
 */
function testCountGraphemes(): void {
  console.log('Testing countGraphemes...');

  assert.strictEqual(countGraphemes('Hello'), 5, 'ASCII characters should be counted correctly');
  assert.strictEqual(countGraphemes(''), 0, 'Empty string should return 0');
  assert.strictEqual(countGraphemes('\u{1F464}'), 1, 'Single emoji should count as 1');
  assert.strictEqual(countGraphemes('\u{1F464}\u{1F464}'), 2, 'Two emoji should count as 2');
  // Family emoji (man + zwj + woman + zwj + girl)
  assert.strictEqual(countGraphemes('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}'), 1, 'Combined emoji should count as 1');

  console.log('  countGraphemes tests passed!');
}

/**
 * Test suite for truncateForStatusBar
 */
function testTruncateForStatusBar(): void {
  console.log('Testing truncateForStatusBar...');

  // Should not truncate short text
  const shortText = 'Short';
  assert.strictEqual(truncateForStatusBar(shortText), shortText, 'Short text should not be truncated');

  // Should truncate text exceeding maxLength (25)
  const longText = 'This is a very long text that exceeds the status bar limit';
  const result = truncateForStatusBar(longText);
  assert.ok(result.endsWith(DISPLAY_LIMITS.statusBar.truncateSuffix), 'Truncated text should end with suffix');
  assert.ok(countGraphemes(result) <= DISPLAY_LIMITS.statusBar.maxLength, 'Truncated text should be within limit');

  // Should handle text exactly at maxLength
  const exactText = 'a'.repeat(DISPLAY_LIMITS.statusBar.maxLength);
  assert.strictEqual(truncateForStatusBar(exactText), exactText, 'Exact length text should not be truncated');

  // Should handle emoji correctly
  const emojiText = '\u{1F464}'.repeat(26); // 26 emoji exceeds 25 limit
  const emojiResult = truncateForStatusBar(emojiText);
  assert.ok(countGraphemes(emojiResult) <= DISPLAY_LIMITS.statusBar.maxLength, 'Emoji text should be truncated correctly');
  assert.ok(emojiResult.endsWith(DISPLAY_LIMITS.statusBar.truncateSuffix), 'Truncated emoji text should end with suffix');

  console.log('  truncateForStatusBar tests passed!');
}

/**
 * Test suite for truncateForQuickPickLabel
 */
function testTruncateForQuickPickLabel(): void {
  console.log('Testing truncateForQuickPickLabel...');

  // Should not truncate short text
  const shortText = 'Label';
  assert.strictEqual(truncateForQuickPickLabel(shortText), shortText, 'Short text should not be truncated');

  // Should truncate text exceeding maxLength (60)
  const longText = 'a'.repeat(70);
  const result = truncateForQuickPickLabel(longText);
  assert.ok(countGraphemes(result) <= DISPLAY_LIMITS.quickPickLabel.maxLength, 'Truncated text should be within limit');
  assert.ok(result.endsWith('...'), 'Truncated text should end with default suffix');

  // Should handle text exactly at maxLength
  const exactText = 'a'.repeat(DISPLAY_LIMITS.quickPickLabel.maxLength);
  assert.strictEqual(truncateForQuickPickLabel(exactText), exactText, 'Exact length text should not be truncated');

  console.log('  truncateForQuickPickLabel tests passed!');
}

/**
 * Test suite for truncateForQuickPickDetail
 */
function testTruncateForQuickPickDetail(): void {
  console.log('Testing truncateForQuickPickDetail...');

  // Should not truncate short text
  const shortText = 'Detail info';
  assert.strictEqual(truncateForQuickPickDetail(shortText), shortText, 'Short text should not be truncated');

  // Should truncate text exceeding maxLength (80)
  const longText = 'a'.repeat(90);
  const result = truncateForQuickPickDetail(longText);
  assert.ok(countGraphemes(result) <= DISPLAY_LIMITS.quickPickDetail.maxLength, 'Truncated text should be within limit');
  assert.ok(result.endsWith('...'), 'Truncated text should end with default suffix');

  // Should handle text exactly at maxLength
  const exactText = 'a'.repeat(DISPLAY_LIMITS.quickPickDetail.maxLength);
  assert.strictEqual(truncateForQuickPickDetail(exactText), exactText, 'Exact length text should not be truncated');

  console.log('  truncateForQuickPickDetail tests passed!');
}

/**
 * Test suite for isSingleGrapheme
 */
function testIsSingleGrapheme(): void {
  console.log('Testing isSingleGrapheme...');

  assert.strictEqual(isSingleGrapheme('a'), true, 'Single ASCII character should return true');
  assert.strictEqual(isSingleGrapheme('\u{1F464}'), true, 'Single emoji should return true');
  assert.strictEqual(isSingleGrapheme('ab'), false, 'Multiple characters should return false');
  assert.strictEqual(isSingleGrapheme('\u{1F464}\u{1F464}'), false, 'Multiple emoji should return false');
  assert.strictEqual(isSingleGrapheme(''), false, 'Empty string should return false');

  console.log('  isSingleGrapheme tests passed!');
}

/**
 * Run all tests
 */
export function runDisplayLimitsTests(): void {
  console.log('\n=== Display Limits Tests ===\n');

  try {
    testCountGraphemes();
    testTruncateForStatusBar();
    testTruncateForQuickPickLabel();
    testTruncateForQuickPickDetail();
    testIsSingleGrapheme();

    console.log('\n  All display limits tests passed!\n');
  } catch (error) {
    console.error('\n  Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runDisplayLimitsTests();
}
