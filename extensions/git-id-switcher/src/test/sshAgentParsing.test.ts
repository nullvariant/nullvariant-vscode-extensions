/**
 * SSH Agent Output Parsing Tests
 *
 * Tests for parsing ssh-add -l and ssh-keygen -lf output.
 * These tests verify the split-based parsing logic used to avoid ReDoS vulnerabilities.
 *
 * SECURITY: These tests ensure the parsing is both secure and correct.
 * The split-based approach avoids regex backtracking (SonarQube S5852).
 */

import * as assert from 'node:assert';

/**
 * Parse a single line from ssh-add -l output
 * (Mirrors the logic in sshAgent.ts listSshKeys)
 *
 * Format: "256 SHA256:xxx comment (type)"
 */
function parseSshAddLine(line: string): { fingerprint: string; comment: string; type: string } {
  const parts = line.split(/\s+/);
  if (parts.length >= 4) {
    const lastPart = parts.at(-1) ?? '';
    const typeMatch = lastPart.startsWith('(') && lastPart.endsWith(')')
      ? lastPart.slice(1, -1)
      : null;
    if (typeMatch && /^\w+$/.test(typeMatch)) {
      const comment = parts.slice(2, -1).join(' ');
      return {
        fingerprint: parts[1],
        comment,
        type: typeMatch,
      };
    }
  }
  return {
    fingerprint: '',
    comment: line,
    type: 'unknown',
  };
}

/**
 * Parse ssh-keygen -lf output to extract fingerprint
 * (Mirrors the logic in sshAgent.ts getKeyFingerprint)
 */
function parseKeygenOutput(stdout: string): string | undefined {
  const parts = stdout.trim().split(/\s+/);
  return parts.length >= 2 ? parts[1] : undefined;
}

/**
 * Test standard ssh-add -l output parsing
 */
function testStandardSshAddOutput(): void {
  console.log('Testing standard ssh-add -l output parsing...');

  // Standard format: "256 SHA256:xxx comment (type)"
  const result1 = parseSshAddLine('256 SHA256:abcdef123456 user@example.com (ED25519)');
  assert.strictEqual(result1.fingerprint, 'SHA256:abcdef123456');
  assert.strictEqual(result1.comment, 'user@example.com');
  assert.strictEqual(result1.type, 'ED25519');

  // RSA key with longer fingerprint
  const result2 = parseSshAddLine('4096 SHA256:zyxwvu987654321 admin@server.local (RSA)');
  assert.strictEqual(result2.fingerprint, 'SHA256:zyxwvu987654321');
  assert.strictEqual(result2.comment, 'admin@server.local');
  assert.strictEqual(result2.type, 'RSA');

  // Comment with spaces
  const result3 = parseSshAddLine('256 SHA256:fingerprint My Multi Word Comment (ECDSA)');
  assert.strictEqual(result3.fingerprint, 'SHA256:fingerprint');
  assert.strictEqual(result3.comment, 'My Multi Word Comment');
  assert.strictEqual(result3.type, 'ECDSA');

  console.log('  Standard ssh-add output parsing tests passed!');
}

/**
 * Test edge cases for ssh-add -l output
 */
function testSshAddEdgeCases(): void {
  console.log('Testing ssh-add -l edge cases...');

  // Less than 4 parts - should return fallback
  const result1 = parseSshAddLine('256 SHA256:abc');
  assert.strictEqual(result1.fingerprint, '');
  assert.strictEqual(result1.comment, '256 SHA256:abc');
  assert.strictEqual(result1.type, 'unknown');

  // No parentheses around type - should return fallback
  const result2 = parseSshAddLine('256 SHA256:abc comment RSA');
  assert.strictEqual(result2.fingerprint, '');
  assert.strictEqual(result2.comment, '256 SHA256:abc comment RSA');
  assert.strictEqual(result2.type, 'unknown');

  // Only opening parenthesis - should return fallback
  const result3 = parseSshAddLine('256 SHA256:abc comment (RSA');
  assert.strictEqual(result3.fingerprint, '');
  assert.strictEqual(result3.comment, '256 SHA256:abc comment (RSA');
  assert.strictEqual(result3.type, 'unknown');

  // Only closing parenthesis - should return fallback
  const result4 = parseSshAddLine('256 SHA256:abc comment RSA)');
  assert.strictEqual(result4.fingerprint, '');
  assert.strictEqual(result4.comment, '256 SHA256:abc comment RSA)');
  assert.strictEqual(result4.type, 'unknown');

  // Type with non-word characters - should return fallback
  const result5 = parseSshAddLine('256 SHA256:abc comment (RSA-256)');
  assert.strictEqual(result5.fingerprint, '');
  assert.strictEqual(result5.comment, '256 SHA256:abc comment (RSA-256)');
  assert.strictEqual(result5.type, 'unknown');

  // Empty parentheses - should return fallback
  const result6 = parseSshAddLine('256 SHA256:abc comment ()');
  assert.strictEqual(result6.fingerprint, '');
  assert.strictEqual(result6.comment, '256 SHA256:abc comment ()');
  assert.strictEqual(result6.type, 'unknown');

  // Empty line - should return fallback
  const result7 = parseSshAddLine('');
  assert.strictEqual(result7.fingerprint, '');
  assert.strictEqual(result7.comment, '');
  assert.strictEqual(result7.type, 'unknown');

  // Type with spaces inside parentheses - should return fallback
  const result8 = parseSshAddLine('256 SHA256:abc comment (RSA 2048)');
  assert.strictEqual(result8.fingerprint, '');
  assert.strictEqual(result8.comment, '256 SHA256:abc comment (RSA 2048)');
  assert.strictEqual(result8.type, 'unknown');

  console.log('  ssh-add edge cases tests passed!');
}

/**
 * Test ssh-keygen -lf output parsing
 */
function testKeygenOutputParsing(): void {
  console.log('Testing ssh-keygen -lf output parsing...');

  // Standard format: "256 SHA256:fingerprint user@example.com (ED25519)"
  const result1 = parseKeygenOutput('256 SHA256:abcdef123456 user@example.com (ED25519)');
  assert.strictEqual(result1, 'SHA256:abcdef123456');

  // RSA key
  const result2 = parseKeygenOutput('4096 SHA256:zyxwvu987654321 admin@server.local (RSA)');
  assert.strictEqual(result2, 'SHA256:zyxwvu987654321');

  // With leading/trailing whitespace
  const result3 = parseKeygenOutput('  256 SHA256:fingerprint comment (type)  \n');
  assert.strictEqual(result3, 'SHA256:fingerprint');

  console.log('  ssh-keygen output parsing tests passed!');
}

/**
 * Test ssh-keygen edge cases
 */
function testKeygenEdgeCases(): void {
  console.log('Testing ssh-keygen edge cases...');

  // Only one part - should return undefined
  const result1 = parseKeygenOutput('256');
  assert.strictEqual(result1, undefined);

  // Empty string - should return undefined
  const result2 = parseKeygenOutput('');
  assert.strictEqual(result2, undefined);

  // Only whitespace - should return undefined
  const result3 = parseKeygenOutput('   \n\t  ');
  assert.strictEqual(result3, undefined);

  // Exactly two parts
  const result4 = parseKeygenOutput('256 SHA256:abc');
  assert.strictEqual(result4, 'SHA256:abc');

  console.log('  ssh-keygen edge cases tests passed!');
}

/**
 * Test ReDoS resistance - ensure parsing doesn't hang on malicious input
 */
function testReDoSResistance(): void {
  console.log('Testing ReDoS resistance...');

  // These patterns would cause catastrophic backtracking with the old regex
  const maliciousInputs = [
    '256 ' + 'a'.repeat(1000) + ' ' + 'b'.repeat(1000) + ' (type)',
    '256 SHA256:x ' + ' '.repeat(1000) + ' (RSA)',
    '256 SHA256:x comment' + ' comment'.repeat(100) + ' (RSA)',
    'a'.repeat(10_000),
    ' '.repeat(10_000),
  ];

  const startTime = Date.now();
  for (const input of maliciousInputs) {
    parseSshAddLine(input);
    parseKeygenOutput(input);
  }
  const elapsed = Date.now() - startTime;

  // All parsing should complete quickly (< 100ms total)
  assert.ok(elapsed < 100, `Parsing took too long: ${elapsed}ms (possible ReDoS)`);

  console.log(`  ReDoS resistance tests passed! (${elapsed}ms for all inputs)`);
}

/**
 * Check if an ssh-agent key comment matches a given basename using
 * exact or word-boundary matching.
 * (Mirrors the logic in sshAgent.ts isBasenameMatch)
 *
 * @security Prevents partial matches (e.g., "id_rsa" matching "id_rsa_work")
 */
function isBasenameMatch(comment: string, basename: string): boolean {
  // defense-in-depth: empty basename would false-positive on paths ending with '/'
  if (basename.length === 0) {
    return false;
  }
  if (comment === basename) {
    return true;
  }
  if (comment.endsWith('/' + basename) || comment.endsWith('\\' + basename)) {
    return true;
  }
  if (comment.startsWith(basename + ' ')) {
    return true;
  }
  if (comment.includes('/' + basename + ' ') || comment.includes('\\' + basename + ' ')) {
    return true;
  }
  return false;
}

/**
 * Test SSH key basename matching - exact/word-boundary matching
 * defense-in-depth: prevents partial match spoofing (e.g., id_rsa matching id_rsa_work)
 */
function testBasenameExactMatching(): void {
  console.log('Testing SSH key basename exact matching...');

  // Exact match: comment is just the basename
  assert.strictEqual(isBasenameMatch('id_ed25519', 'id_ed25519'), true,
    'Exact basename match should succeed');

  // Path match: comment is a full path ending with basename
  assert.strictEqual(isBasenameMatch('/home/user/.ssh/id_ed25519', 'id_ed25519'), true,
    'Full path ending with basename should match');
  assert.strictEqual(isBasenameMatch('/Users/test/.ssh/id_rsa', 'id_rsa'), true,
    'macOS path ending with basename should match');
  assert.strictEqual(isBasenameMatch(String.raw`C:\Users\test\.ssh\id_rsa`, 'id_rsa'), true,
    'Windows path ending with basename should match');

  // Space-separated match: comment starts with basename followed by user comment
  assert.strictEqual(isBasenameMatch('id_ed25519 user@host', 'id_ed25519'), true,
    'Basename with space-separated comment should match');

  // Path + space match: full path with additional comment
  assert.strictEqual(isBasenameMatch('/home/user/.ssh/id_ed25519 user@host', 'id_ed25519'), true,
    'Full path with space-separated comment should match');

  console.log('  Basename exact matching tests passed!');
}

/**
 * Test that similar key names do NOT falsely match
 * This is the core regression test for HIGH-2
 */
function testBasenameNoPartialMatch(): void {
  console.log('Testing SSH key basename partial match prevention...');

  // id_rsa should NOT match id_rsa_work
  assert.strictEqual(isBasenameMatch('id_rsa_work', 'id_rsa'), false,
    'id_rsa should NOT match id_rsa_work');
  assert.strictEqual(isBasenameMatch('/home/user/.ssh/id_rsa_work', 'id_rsa'), false,
    'id_rsa should NOT match path ending with id_rsa_work');

  // id_ed25519 should NOT match id_ed25519_github
  assert.strictEqual(isBasenameMatch('id_ed25519_github', 'id_ed25519'), false,
    'id_ed25519 should NOT match id_ed25519_github');
  assert.strictEqual(isBasenameMatch('/home/user/.ssh/id_ed25519_github', 'id_ed25519'), false,
    'id_ed25519 should NOT match path ending with id_ed25519_github');

  // id_rsa_work should NOT match id_rsa
  assert.strictEqual(isBasenameMatch('id_rsa', 'id_rsa_work'), false,
    'id_rsa_work should NOT match shorter id_rsa');

  // Similar prefix should NOT match
  assert.strictEqual(isBasenameMatch('id_ed25519_personal', 'id_ed25519'), false,
    'id_ed25519 should NOT match id_ed25519_personal');

  // With path context
  assert.strictEqual(isBasenameMatch('id_rsa_work user@host', 'id_rsa'), false,
    'id_rsa should NOT match id_rsa_work even with user comment');

  console.log('  Basename partial match prevention tests passed!');
}

/**
 * Test basename matching with various comment formats
 */
function testBasenameMatchEdgeCases(): void {
  console.log('Testing SSH key basename matching edge cases...');

  // Empty inputs
  assert.strictEqual(isBasenameMatch('', 'id_rsa'), false,
    'Empty comment should not match');
  assert.strictEqual(isBasenameMatch('id_rsa', ''), false,
    'Empty basename should not match basename-only comment');
  assert.strictEqual(isBasenameMatch('', ''), false,
    'Empty basename and comment should not match');
  assert.strictEqual(isBasenameMatch('/home/user/', ''), false,
    'Empty basename should not match path with trailing slash');
  assert.strictEqual(isBasenameMatch(' ', ''), false,
    'Empty basename should not match space-only comment');

  // Comment with only spaces
  assert.strictEqual(isBasenameMatch('  ', 'id_rsa'), false,
    'Whitespace comment should not match');

  // Basename appears in the middle (should NOT match)
  assert.strictEqual(isBasenameMatch('prefix_id_rsa_suffix', 'id_rsa'), false,
    'Basename in middle of string should not match');

  // Multiple slashes
  assert.strictEqual(isBasenameMatch('/a/b/c/id_rsa', 'id_rsa'), true,
    'Deep path ending with basename should match');

  console.log('  Basename matching edge cases tests passed!');
}

/**
 * Run all SSH agent parsing tests
 */
export async function runSshAgentParsingTests(): Promise<void> {
  console.log('\n=== SSH Agent Output Parsing Tests ===\n');

  testStandardSshAddOutput();
  testSshAddEdgeCases();
  testKeygenOutputParsing();
  testKeygenEdgeCases();
  testReDoSResistance();
  testBasenameExactMatching();
  testBasenameNoPartialMatch();
  testBasenameMatchEdgeCases();

  console.log('\n✅ All SSH agent parsing tests passed!\n');
}

// Run tests when executed directly
if (require.main === module) {
  runSshAgentParsingTests().catch(console.error);
}
