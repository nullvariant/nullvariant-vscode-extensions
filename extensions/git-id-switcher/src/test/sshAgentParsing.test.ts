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
    'a'.repeat(10000),
    ' '.repeat(10000),
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
 * Run all SSH agent parsing tests
 */
export async function runSshAgentParsingTests(): Promise<void> {
  console.log('\n=== SSH Agent Output Parsing Tests ===\n');

  testStandardSshAddOutput();
  testSshAddEdgeCases();
  testKeygenOutputParsing();
  testKeygenEdgeCases();
  testReDoSResistance();

  console.log('\n✅ All SSH agent parsing tests passed!\n');
}

// Run tests when executed directly
if (require.main === module) {
  runSshAgentParsingTests().catch(console.error);
}
