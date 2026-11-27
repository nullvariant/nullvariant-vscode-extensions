/**
 * Git Config Rules Tests
 *
 * The `git config` grammar and per-key rules, checked directly and through
 * the command allowlist (both the forms that must pass and those that must
 * be rejected).
 */

import * as assert from 'node:assert';
import {
  GIT_CONFIG_KEYS,
  isAllowedGitConfigOperation,
  isAllowedGitConfigValue,
  isGitConfigKey,
  validateGitConfigArgs,
} from '../security/gitConfigRules';
import { isCommandAllowed } from '../security/commandAllowlist';
import { validateDriveAbsolutePathSecurity } from '../security/drivePathValidator';
import { isDriveAbsolutePath } from '../validators/common';

/** Forms the extension uses, and other forms the rules accept (arguments after `git`) */
const ALLOWED: ReadonlyArray<readonly string[]> = [
  // get, NUL-terminated (no scope option: all scopes merged)
  ['config', '-z', '--get', 'user.name'],
  ['config', '-z', '--get', 'user.email'],
  ['config', '-z', '--get', 'user.signingkey'],
  ['config', '-z', '--get', 'commit.gpgsign'],
  ['config', '-z', '--get', 'gpg.format'],
  // get from --local, NUL-terminated
  ['config', '-z', '--local', '--get', 'user.name'],
  ['config', '-z', '--local', '--get', 'gpg.format'],
  // set
  ['config', '--local', 'user.name', 'John Doe'],
  ['config', '--local', 'user.name', 'Null;Variant'],
  ['config', '--local', 'user.email', 'test@example.com'],
  ['config', '--local', 'user.signingkey', 'ABCD1234EF567890'],
  ['config', '--local', 'user.signingkey', '/Users/u/.ssh/id_sign'],
  ['config', '--local', 'user.signingkey', '~/.ssh/id_sign.pub'],
  ['config', '--local', 'commit.gpgsign', 'true'],
  ['config', '--local', 'commit.gpgsign', 'false'],
  ['config', '--local', 'gpg.format', 'ssh'],
  ['config', '--local', 'gpg.format', 'openpgp'],
  // --local --unset: the three signing keys only
  ['config', '--local', '--unset', 'gpg.format'],
  ['config', '--local', '--unset', 'user.signingkey'],
  ['config', '--local', '--unset', 'commit.gpgsign'],
  // Windows drive paths (what ~/ expands to on Windows)
  ['config', '--local', 'user.signingkey', 'C:/Users/u/.ssh/id_sign'],
  ['config', '--local', 'user.signingkey', String.raw`C:\Users\u\.ssh\id_sign.pub`],
  ['config', '--local', 'user.signingkey', 'd:/keys/id_sign'],
];

/** Forms that must be rejected, with a word the reason must contain */
const REJECTED: ReadonlyArray<{ args: readonly string[]; reason: string }> = [
  { args: ['config', '--global', '--unset', 'user.signingkey'], reason: 'no matching form' },
  { args: ['config', '--local', '--unset', 'core.sshCommand'], reason: 'not in the allowlist' },
  { args: ['config', '--local', 'gpg.format', 'x509'], reason: 'Value is not allowed' },
  // name/email have no unset, in any scope
  { args: ['config', '--local', '--unset', 'user.name'], reason: "Operation 'unset' is not allowed" },
  { args: ['config', '--local', '--unset', 'user.email'], reason: "Operation 'unset' is not allowed" },
  { args: ['config', '--global', '--unset', 'user.name'], reason: 'no matching form' },
  { args: ['config', '--global', '--unset', 'user.email'], reason: 'no matching form' },
  { args: ['config', '--unset', 'user.name'], reason: 'no matching form' },
  { args: ['config', '--unset', 'user.email'], reason: 'no matching form' },
  // Windows paths that are not a drive-absolute path, or fail the path checks
  { args: ['config', '--local', 'user.signingkey', String.raw`\\server\share\id_sign`], reason: 'Path argument rejected' },
  { args: ['config', '--local', 'user.signingkey', String.raw`\\.\pipe\agent`], reason: 'Path argument rejected' },
  { args: ['config', '--local', 'user.signingkey', String.raw`\\?\C:\Users\u\id_sign`], reason: 'Path argument rejected' },
  { args: ['config', '--local', 'user.signingkey', '//server/share/id_sign'], reason: 'Path argument rejected' },
  { args: ['config', '--local', 'user.signingkey', 'C:id_sign'], reason: 'Path argument rejected' },
  { args: ['config', '--local', 'user.signingkey', 'C:/Users/../id_sign'], reason: 'Path argument rejected' },
  { args: ['config', '--local', 'user.signingkey', String.raw`C:\Users\\u\id_sign`], reason: 'Path argument rejected' },
  { args: ['config', '--local', 'user.signingkey', String.raw`C:\Users\u\NUL`], reason: 'Path argument rejected' },
  // A drive path passes the path checks, but user.name does not take a path
  { args: ['config', '--local', 'user.name', 'C:/Users/u'], reason: 'Value is not allowed' },
  { args: ['config', '--local', 'commit.gpgsign', 'yes'], reason: 'Value is not allowed' },
  { args: ['config', '--local', 'user.signingkey', 'relative/key'], reason: 'Path argument rejected' },
  { args: ['config', '--local', 'user.signingkey', 'Foo <a@b>'], reason: 'Value is not allowed' },
  { args: ['config', '--local', 'user.name', 'a', 'user.email'], reason: 'no matching form' },
  // scope-less and --global set (not used by the extension)
  { args: ['config', 'user.name', 'John Doe'], reason: 'no matching form' },
  { args: ['config', '--global', 'user.email', 'test@example.com'], reason: 'no matching form' },
  { args: ['config', '--global', 'user.signingkey', 'ABCD1234'], reason: 'no matching form' },
  { args: ['config', '--global', 'commit.gpgsign', 'true'], reason: 'no matching form' },
  { args: ['config', '--local', '--global', 'user.name'], reason: 'not in the allowlist' },
  // no arguments, unknown keys and spellings
  { args: ['config'], reason: 'no matching form' },
  // Reads without -z (a value would end with the newline git adds) and the
  // implicit get are not forms
  { args: ['config', 'user.name'], reason: 'no matching form' },
  { args: ['config', '--get', 'user.name'], reason: 'no matching form' },
  { args: ['config', '--local', '--get', 'user.name'], reason: 'not in the allowlist' },
  { args: ['config', '-z', 'user.name'], reason: 'no matching form' },
  { args: ['config', '-z', '--get', 'user.name', 'x'], reason: 'no matching form' },
  { args: ['config', '-z', '--local', '--get'], reason: 'no matching form' },
  { args: ['config', '-z', '--local', 'user.name', 'x'], reason: 'no matching form' },
  { args: ['config', '-z', '--local', '--unset', 'gpg.format'], reason: 'no matching form' },
  { args: ['config', '-z', '--get', 'core.sshcommand'], reason: 'not in the allowlist' },
  { args: ['config', 'random_string'], reason: 'no matching form' },
  { args: ['config', 'core.sshCommand', 'evil_script.sh'], reason: 'no matching form' },
  { args: ['config', '--local', 'core.sshCommand', 'evil'], reason: 'not in the allowlist' },
  { args: ['config', '--local', 'user.signingKey', 'ABCD1234'], reason: 'not in the allowlist' },
  { args: ['config', '-z', '--get', 'nonexistent.key'], reason: 'not in the allowlist' },
  // flags in value position, unknown flags
  { args: ['config', '--local', 'user.name', '--bad-flag'], reason: 'Value is not allowed' },
  { args: ['config', '--malicious-flag', 'user.name'], reason: 'no matching form' },
  // a path value that fails the path checks (rejected before the grammar)
  { args: ['config', '--local', 'user.signingkey', '/a/../etc/passwd'], reason: 'Path argument rejected' },
  // too long (rejected before the grammar)
  { args: ['config', '--local', 'user.name', 'x'.repeat(257)], reason: 'maximum length' },
];

function testAllowlistAcceptsForms(): void {
  console.log('  Testing allowed git config forms...');
  for (const args of ALLOWED) {
    const result = isCommandAllowed('git', [...args]);
    assert.strictEqual(result.allowed, true, `Should allow: git ${args.join(' ')} (${result.reason})`);
  }
}

function testAllowlistRejectsForms(): void {
  console.log('  Testing rejected git config forms...');
  for (const { args, reason } of REJECTED) {
    const result = isCommandAllowed('git', [...args]);
    assert.strictEqual(result.allowed, false, `Should reject: git ${args.join(' ')}`);
    assert.ok(result.reason?.includes(reason), `Reason for git ${args.join(' ')}: ${result.reason}`);
  }
}

function testParse(): void {
  console.log('  Testing validateGitConfigArgs()...');
  for (const args of [
    ['-z', '--get', 'gpg.format'],
    ['-z', '--local', '--get', 'gpg.format'],
    ['--local', 'gpg.format', 'ssh'],
    ['--local', '--unset', 'gpg.format'],
  ]) {
    assert.deepStrictEqual(validateGitConfigArgs(args), { allowed: true }, args.join(' '));
  }
  // --get with three arguments is not a form
  assert.deepStrictEqual(validateGitConfigArgs(['-z', '--get', 'gpg.format', 'x']), {
    allowed: false,
    reason: 'git config arguments are not allowed (no matching form)',
  });
  assert.deepStrictEqual(validateGitConfigArgs(['-z', '--get', 'user.name']), { allowed: true });
  assert.strictEqual(validateGitConfigArgs([]).allowed, false);
}

function testOperationRules(): void {
  console.log('  Testing isAllowedGitConfigOperation() (operation and scope per key)...');
  for (const key of GIT_CONFIG_KEYS) {
    assert.strictEqual(isAllowedGitConfigOperation(key, 'get', undefined), true, `${key}: get without a scope`);
    assert.strictEqual(isAllowedGitConfigOperation(key, 'get', 'local'), true, `${key}: --local get`);
    assert.strictEqual(isAllowedGitConfigOperation(key, 'set', 'local'), true, `${key}: --local set`);
    assert.strictEqual(isAllowedGitConfigOperation(key, 'set', undefined), false, `${key}: set without a scope`);
    assert.strictEqual(isAllowedGitConfigOperation(key, 'unset', undefined), false, `${key}: unset without a scope`);
  }
  for (const key of ['gpg.format', 'user.signingkey', 'commit.gpgsign'] as const) {
    assert.strictEqual(isAllowedGitConfigOperation(key, 'unset', 'local'), true, key);
  }
  for (const key of ['user.name', 'user.email'] as const) {
    assert.strictEqual(isAllowedGitConfigOperation(key, 'unset', 'local'), false, key);
  }
}

function testDrivePaths(): void {
  console.log('  Testing validateDriveAbsolutePathSecurity()...');
  assert.strictEqual(isDriveAbsolutePath('C:/a'), true);
  assert.strictEqual(isDriveAbsolutePath(String.raw`z:\a`), true);
  for (const notDrive of ['C:a', 'C:', '/a', String.raw`\\server\share`, '1:/a', '']) {
    assert.strictEqual(isDriveAbsolutePath(notDrive), false, notDrive);
    assert.strictEqual(validateDriveAbsolutePathSecurity(notDrive).valid, false, notDrive);
  }
  assert.deepStrictEqual(validateDriveAbsolutePathSecurity(String.raw`C:\Users\u\.ssh\id_sign`), { valid: true });
  assert.deepStrictEqual(validateDriveAbsolutePathSecurity('C:/Users/u/.ssh/id_sign'), { valid: true });
  assert.strictEqual(validateDriveAbsolutePathSecurity('C:/Users/u/../k').valid, false);
  assert.strictEqual(validateDriveAbsolutePathSecurity('C:/Users/u/k\0').valid, false);
  assert.strictEqual(validateDriveAbsolutePathSecurity('C://server/share').valid, false);
  assert.strictEqual(validateDriveAbsolutePathSecurity('C:/Users/COM1').valid, false);
}

function testValues(): void {
  console.log('  Testing isAllowedGitConfigValue()...');
  assert.strictEqual(isAllowedGitConfigValue('user.name', 'John Doe'), true);
  assert.strictEqual(isAllowedGitConfigValue('user.name', '-x'), false);
  assert.strictEqual(isAllowedGitConfigValue('user.name', 'x'.repeat(256)), true);
  assert.strictEqual(isAllowedGitConfigValue('user.name', 'x'.repeat(257)), false);
  // Path-like text values go through the path checks
  assert.strictEqual(isAllowedGitConfigValue('user.name', 'a/b'), false);
  assert.strictEqual(isAllowedGitConfigValue('user.name', '/home/user'), true);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', '0123456789ABCDEF'), true);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', '/home/u/.ssh/k'), true);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', '~/.ssh/k'), true);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', '~user/.ssh/k'), false);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', '/home/u/../k'), false);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', 'key::ssh-ed25519 AAAA'), false);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', 'C:/Users/u/k'), true);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', String.raw`C:\Users\u\k`), true);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', 'C:/Users/../k'), false);
  assert.strictEqual(isAllowedGitConfigValue('user.signingkey', 'C:k'), false);
  assert.strictEqual(isAllowedGitConfigValue('commit.gpgsign', 'true'), true);
  assert.strictEqual(isAllowedGitConfigValue('commit.gpgsign', '1'), false);
  assert.strictEqual(isAllowedGitConfigValue('gpg.format', 'openpgp'), true);
  assert.strictEqual(isAllowedGitConfigValue('gpg.format', 'x509'), false);

  assert.strictEqual(isGitConfigKey('gpg.format'), true);
  assert.strictEqual(isGitConfigKey('core.sshcommand'), false);
  assert.deepStrictEqual([...GIT_CONFIG_KEYS], ['user.name', 'user.email', 'user.signingkey', 'commit.gpgsign', 'gpg.format']);
}

export async function runGitConfigRulesTests(): Promise<void> {
  console.log('\nTesting git config rules...');
  testAllowlistAcceptsForms();
  testAllowlistRejectsForms();
  testParse();
  testOperationRules();
  testValues();
  testDrivePaths();
  console.log('✅ Git config rules tests passed!');
}
