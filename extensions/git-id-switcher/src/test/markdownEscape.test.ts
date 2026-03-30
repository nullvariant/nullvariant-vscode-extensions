/**
 * Tests for Markdown escape functions in markdownEscape.ts
 *
 * Covers escapeMarkdownInline pure function.
 */

import * as assert from 'node:assert';
import { escapeMarkdownInline } from '../ui/markdownEscape';

function testEscapeMarkdownInline(): void {
  console.log('  escapeMarkdownInline');

  // Asterisks (bold/italic)
  assert.strictEqual(
    escapeMarkdownInline('**bold**'),
    String.raw`\*\*bold\*\*`,
    'Should escape asterisks'
  );

  // Underscores (italic)
  assert.strictEqual(
    escapeMarkdownInline('_italic_'),
    String.raw`\_italic\_`,
    'Should escape underscores'
  );

  // Backticks (code)
  assert.strictEqual(
    escapeMarkdownInline('`code`'),
    String.raw`\`code\``,
    'Should escape backticks'
  );

  // Square brackets (links)
  assert.strictEqual(
    escapeMarkdownInline('[link](url)'),
    String.raw`\[link\](url)`,
    'Should escape square brackets'
  );

  // Angle brackets (HTML)
  assert.strictEqual(
    escapeMarkdownInline('<script>'),
    '&lt;script&gt;',
    'Should escape angle brackets to HTML entities'
  );

  // Pipe character
  assert.strictEqual(
    escapeMarkdownInline('a|b'),
    String.raw`a\|b`,
    'Should escape pipe character'
  );

  // Backslash itself
  assert.strictEqual(
    escapeMarkdownInline(String.raw`a\b`),
    String.raw`a\\b`,
    'Should escape backslash'
  );

  // Combined special characters
  assert.strictEqual(
    escapeMarkdownInline('*user|name*'),
    String.raw`\*user\|name\*`,
    'Should escape multiple special chars together'
  );

  // Plain text — pass through unchanged
  assert.strictEqual(
    escapeMarkdownInline('John Doe'),
    'John Doe',
    'Should leave plain text unchanged'
  );

  // Empty string
  assert.strictEqual(
    escapeMarkdownInline(''),
    '',
    'Should handle empty string'
  );

  // Realistic git user.name with pipe
  assert.strictEqual(
    escapeMarkdownInline('Org | Team'),
    String.raw`Org \| Team`,
    'Should escape pipe in realistic user name'
  );

  // Newline characters are replaced with space
  assert.strictEqual(
    escapeMarkdownInline('line1\nline2'),
    'line1 line2',
    'Should replace LF with space'
  );

  // Carriage return is stripped
  assert.strictEqual(
    escapeMarkdownInline('line1\r\nline2'),
    'line1 line2',
    'Should strip CR and replace LF with space'
  );

  // Carriage return only
  assert.strictEqual(
    escapeMarkdownInline('line1\rline2'),
    'line1line2',
    'Should strip standalone CR'
  );

  // Backslash before pipe (realistic edge case)
  assert.strictEqual(
    escapeMarkdownInline(String.raw`a\|b`),
    String.raw`a\\\|b`,
    'Should escape both backslash and pipe independently'
  );

  console.log('    ✅ All escapeMarkdownInline tests passed');
}

export function runMarkdownEscapeTests(): void {
  console.log('\n=== Markdown Escape Tests ===\n');

  try {
    testEscapeMarkdownInline();

    console.log('\n  All markdown escape tests passed!\n');
  } catch (error) {
    console.error('\n  Test failed:', error);
    process.exit(1);
  }
}

// Run tests when executed directly
if (require.main === module) {
  runMarkdownEscapeTests();
}
