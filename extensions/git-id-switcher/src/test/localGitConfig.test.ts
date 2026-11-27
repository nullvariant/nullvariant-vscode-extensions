/**
 * Local Git Config Port Tests
 *
 * createLocalGitConfigPort() against real git, and how a `git config --get`
 * result becomes a value, absent, or error.
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createLocalGitConfigPort, readConfigArgs, toConfigReadResult } from '../core/localGitConfig';
import { gitExec, removeTrailingNewline } from '../security/secureExec';
import { git, makeTempDir, readLocal } from './helpers/signingFixtures';

function testToConfigReadResult(): void {
  console.log('  Testing toConfigReadResult()...');
  // -z: the value is what comes before the one NUL git ends it with
  assert.deepStrictEqual(toConfigReadResult({ success: true, stdout: 'ssh\0' }), { kind: 'value', value: 'ssh' });
  assert.deepStrictEqual(toConfigReadResult({ success: true, stdout: '\0' }), { kind: 'value', value: '' });
  assert.deepStrictEqual(toConfigReadResult({ success: true, stdout: 'a\r\n\0' }), { kind: 'value', value: 'a\r\n' });
  // Not one NUL-terminated value: an error, never a value
  for (const stdout of ['ssh', 'ssh\n', '', 'a\0b\0', '\0ssh']) {
    assert.deepStrictEqual(toConfigReadResult({ success: true, stdout }), { kind: 'error' }, JSON.stringify(stdout));
  }
  assert.deepStrictEqual(readConfigArgs('gpg.format', 'local'), ['config', '-z', '--local', '--get', 'gpg.format']);
  assert.deepStrictEqual(readConfigArgs('gpg.format', 'merged'), ['config', '-z', '--get', 'gpg.format']);
  assert.deepStrictEqual(toConfigReadResult({ success: false, error: new Error('x'), exitCode: 1 }), { kind: 'absent' });
  assert.deepStrictEqual(toConfigReadResult({ success: false, error: new Error('x'), exitCode: 128 }), { kind: 'error' });
  // No exit code (blocked, timed out, not started): never "not set"
  assert.deepStrictEqual(toConfigReadResult({ success: false, error: new Error('x') }), { kind: 'error' });
  // A warning on standard error (git could not read a config file): neither a
  // value nor "not set"
  const warning = "warning: unable to access '/home/u/.config/git/config': Permission denied\n";
  assert.deepStrictEqual(toConfigReadResult({ success: true, stdout: 'ssh\0', stderr: warning }), { kind: 'error' });
  assert.deepStrictEqual(toConfigReadResult({ success: false, error: new Error('x'), exitCode: 1, stderr: warning }), { kind: 'error' });
  assert.deepStrictEqual(toConfigReadResult({ success: true, stdout: 'ssh\0', stderr: '' }), { kind: 'value', value: 'ssh' });
  // Bytes that are not UTF-8 arrive as U+FFFD: writing that back would write another value
  assert.deepStrictEqual(toConfigReadResult({ success: true, stdout: 'a�\0' }), { kind: 'error' });
}

async function testReadWarningWithRealGit(): Promise<void> {
  console.log('  Testing a read with a warning from real git...');
  const dir = makeTempDir('local-config-warning-');
  const savedGlobal = process.env.GIT_CONFIG_GLOBAL;
  try {
    const repository = path.join(dir, 'repo');
    fs.mkdirSync(repository);
    git(repository, ['init', '-q']);
    // A global config git cannot read (a directory): git warns, and exits 1
    // as for a key that is not set
    process.env.GIT_CONFIG_GLOBAL = dir;
    const result = await gitExec(readConfigArgs('user.signingkey', 'merged'), repository);
    assert.ok((result.stderr ?? '').includes('warning'), `git warns on standard error: ${JSON.stringify(result)}`);
    assert.deepStrictEqual(toConfigReadResult(result), { kind: 'error' });
  } finally {
    if (savedGlobal === undefined) {
      delete process.env.GIT_CONFIG_GLOBAL;
    } else {
      process.env.GIT_CONFIG_GLOBAL = savedGlobal;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function testPortWithRealGit(): Promise<void> {
  console.log('  Testing createLocalGitConfigPort() with real git...');
  const repository = makeTempDir('local-config-');
  try {
    git(repository, ['init', '-q']);
    const port = createLocalGitConfigPort(repository);
    assert.deepStrictEqual(await port.get('gpg.format'), { kind: 'absent' });
    assert.strictEqual(await port.set('gpg.format', 'ssh'), true);
    assert.deepStrictEqual(await port.get('gpg.format'), { kind: 'value', value: 'ssh' });
    assert.strictEqual(await port.unset('gpg.format'), true);
    assert.strictEqual(readLocal(repository, 'gpg.format'), undefined);
    // Unsetting a key that is not set (exit 5) is the state asked for
    assert.strictEqual(await port.unset('gpg.format'), true);
    // A value the rules reject is blocked
    assert.strictEqual(await port.set('gpg.format', 'x509'), false);
    // user.name / user.email have no unset in the rules
    assert.strictEqual(await port.set('user.name', 'Someone'), true);
    assert.strictEqual(await port.unset('user.name'), false);
    assert.strictEqual(readLocal(repository, 'user.name'), 'Someone');

    // Exit 5 also means "several lines match": nothing was removed
    fs.appendFileSync(
      path.join(repository, '.git', 'config'),
      '[user]\n\tsigningkey = /home/u/.ssh/a\n\tsigningkey = /home/u/.ssh/b\n',
    );
    assert.strictEqual(await port.unset('user.signingkey'), false);
    assert.strictEqual(readLocal(repository, 'user.signingkey'), '/home/u/.ssh/b', 'the values stay');
  } finally {
    fs.rmSync(repository, { recursive: true, force: true });
  }

  const outside = makeTempDir('local-config-outside-');
  try {
    assert.deepStrictEqual(await createLocalGitConfigPort(outside).get('user.name'), { kind: 'error' });
    assert.strictEqual(await createLocalGitConfigPort(outside).unset('gpg.format'), false);
  } finally {
    fs.rmSync(outside, { recursive: true, force: true });
  }
}

function testRemoveTrailingNewline(): void {
  console.log('  Testing removeTrailingNewline()...');
  assert.strictEqual(removeTrailingNewline('value\n'), 'value');
  // Only the newline git adds: a carriage return belongs to the value
  assert.strictEqual(removeTrailingNewline('value\r\n'), 'value\r');
  assert.strictEqual(removeTrailingNewline('value\r'), 'value\r');
  assert.strictEqual(removeTrailingNewline('value  \n'), 'value  ', 'trailing spaces are kept');
  assert.strictEqual(removeTrailingNewline('value\n\n'), 'value\n', 'only one line ending');
  assert.strictEqual(removeTrailingNewline(' value'), ' value');
  assert.strictEqual(removeTrailingNewline(''), '');
}

/**
 * The repository root and config values are read as git prints them, less
 * the line ending: a directory whose name ends with a space is not taken for
 * the one without it, and a value ending with spaces reads back the same.
 */
async function testExactOutputWithRealGit(): Promise<void> {
  console.log('  Testing the root and values keep trailing spaces (real git)...');
  const dir = makeTempDir('exact-output-');
  try {
    const plain = path.join(dir, 'repo');
    const spaced = path.join(dir, 'repo ');
    for (const repository of [plain, spaced]) {
      fs.mkdirSync(repository);
      git(repository, ['init', '-q']);
    }
    const root = await gitExec(['rev-parse', '--show-toplevel'], spaced);
    assert.deepStrictEqual(root, { success: true, stdout: spaced, stderr: '' });

    // A value the user wrote with trailing spaces (the extension itself never
    // writes one: the allowlist rejects it) reads back exactly, so it is
    // never taken for the value without them
    git(spaced, ['config', '--local', 'user.signingkey', 'ABCD1234  ']);
    const port = createLocalGitConfigPort(spaced);
    assert.deepStrictEqual(await port.get('user.signingkey'), { kind: 'value', value: 'ABCD1234  ' });
    // Values ending with a carriage return or a newline read back exactly too
    for (const value of ['ABCD1234\r', 'ABCD1234\n', 'ABCD1234\r\n']) {
      git(spaced, ['config', '--local', 'user.signingkey', value]);
      assert.deepStrictEqual(await port.get('user.signingkey'), { kind: 'value', value }, JSON.stringify(value));
    }
    // A directory whose name ends with a carriage return is its own root
    if (process.platform !== 'win32') {
      const carriage = path.join(dir, 'repo\r');
      fs.mkdirSync(carriage);
      git(carriage, ['init', '-q']);
      assert.deepStrictEqual(await gitExec(['rev-parse', '--show-toplevel'], carriage), { success: true, stdout: carriage, stderr: '' });
    }
    assert.strictEqual(await port.set('user.name', 'Name  '), false, 'not written by the extension');
    assert.strictEqual(await port.set('user.name', 'Name'), true);
    assert.strictEqual(readLocal(spaced, 'user.name'), 'Name');
    assert.strictEqual(readLocal(plain, 'user.name'), undefined, 'the other repository is untouched');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export async function runLocalGitConfigTests(): Promise<void> {
  console.log('\n🔧 Running Local Git Config Port Tests...\n');
  testToConfigReadResult();
  testRemoveTrailingNewline();
  await testPortWithRealGit();
  await testExactOutputWithRealGit();
  await testReadWarningWithRealGit();
  console.log('\n✅ All Local Git Config Port Tests Passed!\n');
}
