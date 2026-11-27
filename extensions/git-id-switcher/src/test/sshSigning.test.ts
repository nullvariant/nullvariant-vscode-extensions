/**
 * SSH Commit Signing Tests (real ssh-keygen and git)
 *
 * Creates a key under a temporary home directory (HOME / USERPROFILE point to
 * it), applies an identity with sshSigningKeyPath `~/.ssh/...` to a temporary
 * repository through the same code as a switch, commits, and checks the
 * signature with `git verify-commit` against a gpg.ssh.allowedSignersFile.
 * Then switches to an unsigned identity and checks that the signing config is
 * gone and commits are no longer signed. On Windows the written key path is a
 * drive path (`C:/...`).
 *
 * Skipped (with a printed reason) when:
 * - ssh-keygen is not installed
 * - git is older than 2.34 (the first version with SSH signing)
 *
 * In CI (the CI environment variable is set) a skip is a failure: the runners
 * are expected to have both, and a silent skip would hide a lost test.
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { normalizeSigningKeyPath, resolveSigningSpec } from '../core/signingPlan';
import { applyIdentityToRepository } from '../core/repositoryConfigWriter';
import { createLocalGitConfigPort } from '../core/localGitConfig';
import { createSigningRecordStore } from '../core/signingRecordStore';
import { checkSigningKey, createSigningKeyCheckDependencies, type SigningKeyCheckDependencies } from '../ssh/signingKeyCheck';
import { createMemento } from './helpers/signingFixtures';
import { removeTrailingNewline } from '../security/secureExec';

/** First git version with gpg.format=ssh */
const MIN_GIT_VERSION: readonly [number, number] = [2, 34];

/**
 * The environment of git and ssh-keygen: the temporary home directory, and
 * none of the user's global and system config or ssh-agent. Built after the
 * home directory is created, so child processes never see the real home.
 */
let isolatedEnv: NodeJS.ProcessEnv = {};

function createIsolatedEnv(home: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    GIT_CONFIG_GLOBAL: os.devNull,
    GIT_CONFIG_NOSYSTEM: '1',
    SSH_AUTH_SOCK: '',
  };
}

function getSkipReason(): string | undefined {
  const keygen = spawnSync('ssh-keygen', ['-?'], { stdio: 'ignore' });
  if (keygen.error) {
    return `ssh-keygen is not available (${(keygen.error as NodeJS.ErrnoException).code ?? 'error'})`;
  }
  const versionOutput = spawnSync('git', ['--version'], { encoding: 'utf8' }).stdout ?? '';
  // "git version 2.50.1 (Apple Git-155)"
  const version = versionOutput.split(' ', 3).at(2) ?? '';
  const [major = 0, minor = 0] = version.split('.', 2).map(Number);
  const isTooOld = major < MIN_GIT_VERSION[0] || (major === MIN_GIT_VERSION[0] && minor < MIN_GIT_VERSION[1]);
  return isTooOld ? `git ${versionOutput.trim()} is older than ${MIN_GIT_VERSION.join('.')}` : undefined;
}

/** Run git; its output with only the last newline removed (as the extension reads it) */
function git(cwd: string, args: string[]): string {
  return removeTrailingNewline(execFileSync('git', args, { cwd, env: isolatedEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
}

function commitFile(repository: string, name: string): void {
  fs.writeFileSync(path.join(repository, name), `${name}\n`);
  git(repository, ['add', name]);
  git(repository, ['commit', '-q', '-m', name]);
}

function generateKey(keyPath: string, comment: string): void {
  execFileSync('ssh-keygen', ['-q', '-t', 'ed25519', '-N', '', '-C', comment, '-f', keyPath], {
    env: isolatedEnv,
    stdio: 'ignore',
  });
}

async function testSignAndVerify(configuredPath: string, label: string, dir: string): Promise<void> {
  console.log(`  Testing SSH signing with the ${label}...`);
  const repo = fs.mkdtempSync(path.join(dir, 'repo-'));
  git(repo, ['init', '-q']);

  const identity = { id: 'signer', name: 'Signer', email: 'signer@example.com', sshSigningKeyPath: configuredPath };
  const keyPath = normalizeSigningKeyPath(configuredPath);
  const checkDependencies = createSigningKeyCheckDependencies(createMemento());
  assert.deepStrictEqual(await checkSigningKey(keyPath, checkDependencies), { result: 'ok' });

  const store = createSigningRecordStore(createMemento());
  const port = createLocalGitConfigPort(repo);
  const signed = await applyIdentityToRepository(port, store, repo, identity.name, identity.email, resolveSigningSpec(identity));
  assert.deepStrictEqual(signed, { result: 'ok' });
  assert.strictEqual(git(repo, ['config', '--local', '--get', 'gpg.format']), 'ssh');
  assert.strictEqual(git(repo, ['config', '--local', '--get', 'user.signingkey']), keyPath);
  assert.strictEqual(git(repo, ['config', '--local', '--get', 'commit.gpgsign']), 'true');

  // The verifier needs to know which key belongs to the committer
  const publicKeyPath = keyPath.endsWith('.pub') ? keyPath : `${keyPath}.pub`;
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8').trim();
  const allowedSigners = path.join(dir, `allowed_signers_${label.replace(' ', '_')}`);
  fs.writeFileSync(allowedSigners, `${identity.email} namespaces="git" ${publicKey}\n`);
  git(repo, ['config', '--local', 'gpg.ssh.allowedSignersFile', allowedSigners]);

  commitFile(repo, 'signed.txt');
  const verify = spawnSync('git', ['verify-commit', 'HEAD'], { cwd: repo, env: isolatedEnv, encoding: 'utf8' });
  assert.strictEqual(verify.status, 0, `git verify-commit should succeed: ${verify.stderr}`);
  assert.ok(verify.stderr.includes('Good "git" signature'), verify.stderr);
  assert.strictEqual(git(repo, ['log', '-1', '--format=%G?']), 'G');

  // The check is real: with another key as the committer's, verification fails
  const otherPublicKey = fs.readFileSync(path.join(dir, '.ssh', 'id_other.pub'), 'utf8').trim();
  const otherSigners = path.join(dir, `other_signers_${label.replace(' ', '_')}`);
  fs.writeFileSync(otherSigners, `${identity.email} namespaces="git" ${otherPublicKey}\n`);
  git(repo, ['config', '--local', 'gpg.ssh.allowedSignersFile', otherSigners]);
  const mismatch = spawnSync('git', ['verify-commit', 'HEAD'], { cwd: repo, env: isolatedEnv, encoding: 'utf8' });
  assert.notStrictEqual(mismatch.status, 0, 'verification with another key fails');
  assert.notStrictEqual(git(repo, ['log', '-1', '--format=%G?']), 'G');
  git(repo, ['config', '--local', 'gpg.ssh.allowedSignersFile', allowedSigners]);

  // Switch to an unsigned identity: the signing config the extension wrote is put back
  const unsigned = await applyIdentityToRepository(port, store, repo, 'Plain', 'plain@example.com', undefined);
  assert.deepStrictEqual(unsigned, { result: 'ok' });
  for (const key of ['gpg.format', 'user.signingkey', 'commit.gpgsign']) {
    const result = spawnSync('git', ['config', '--local', '--get', key], { cwd: repo, env: isolatedEnv });
    assert.strictEqual(result.status, 1, `${key} should be unset`);
  }
  commitFile(repo, 'unsigned.txt');
  assert.strictEqual(git(repo, ['log', '-1', '--format=%G?']), 'N');
  assert.strictEqual(store.get(repo), undefined);
}

/** Real dependencies that count the ssh-keygen calls */
function countingDependencies(): SigningKeyCheckDependencies & { keygenCalls: string[][] } {
  const real = createSigningKeyCheckDependencies(createMemento());
  const keygenCalls: string[][] = [];
  return {
    ...real,
    keygenCalls,
    sshKeygen: (args, options) => {
      keygenCalls.push(args);
      return real.sshKeygen(args, options);
    },
  };
}

/** Start an ssh-agent on a socket in `dir`, or undefined where that is not possible */
async function startAgent(dir: string): Promise<{ socket: string; stop: () => void } | undefined> {
  if (process.platform === 'win32') {
    return undefined;
  }
  const socket = path.join(dir, 'agent.sock');
  const agent = spawn('ssh-agent', ['-D', '-a', socket], { stdio: 'ignore' });
  for (let attempt = 0; attempt < 50 && !fs.existsSync(socket); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!fs.existsSync(socket)) {
    agent.kill();
    return undefined;
  }
  return { socket, stop: () => agent.kill() };
}

async function testSigningKeyCheck(dir: string): Promise<void> {
  console.log('  Testing the signing key check (ssh-keygen -Y sign)...');
  const keyPath = path.join(dir, '.ssh', 'id_sign');

  // A key that signs passes, and is not signed with again until its file changes
  const deps = countingDependencies();
  assert.deepStrictEqual(await checkSigningKey(keyPath, deps), { result: 'ok' });
  assert.ok(deps.keygenCalls.some((args) => args[0] === '-Y'), 'the key signed');
  deps.keygenCalls.length = 0;
  assert.deepStrictEqual(await checkSigningKey(keyPath, deps), { result: 'ok' });
  assert.deepStrictEqual(deps.keygenCalls, [], 'an unchanged key file is not checked again');
  const later = new Date(Date.now() + 60_000);
  fs.utimesSync(keyPath, later, later);
  assert.deepStrictEqual(await checkSigningKey(keyPath, deps), { result: 'ok' });
  assert.ok(deps.keygenCalls.length > 0, 'a changed key file is checked again');

  // Permissions (Unix): a private key that group or others can read, or a
  // .pub next to it that they can write, stops the check
  if (process.platform !== 'win32') {
    for (const [filePath, mode, restore] of [
      [keyPath, 0o644, 0o600],
      [`${keyPath}.pub`, 0o664, 0o644],
    ] as const) {
      fs.chmodSync(filePath, mode);
      try {
        assert.deepStrictEqual(
          await checkSigningKey(keyPath, deps),
          { result: 'failed', reason: 'insecure-permissions' },
          `${path.basename(filePath)} ${mode.toString(8)}`,
        );
      } finally {
        fs.chmodSync(filePath, restore);
      }
    }
    assert.deepStrictEqual(await checkSigningKey(keyPath, deps), { result: 'ok' });
  }

  // A broken private key, and a public key file with a broken key, stop
  const broken = path.join(dir, '.ssh', 'id_broken');
  fs.writeFileSync(broken, '-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA\n-----END OPENSSH PRIVATE KEY-----\n', { mode: 0o600 });
  assert.deepStrictEqual(await checkSigningKey(broken, countingDependencies()), { result: 'failed', reason: 'public-key-unknown' });
  const brokenPublic = path.join(dir, '.ssh', 'id_broken_public.pub');
  fs.writeFileSync(brokenPublic, 'ssh-ed25519 AAAAbroken\n', { mode: 0o644 });
  assert.deepStrictEqual(await checkSigningKey(brokenPublic, countingDependencies()), { result: 'failed', reason: 'public-key-unknown' });
  // A public key whose private key is neither next to it nor in ssh-agent cannot sign
  const lonely = path.join(dir, '.ssh', 'lonely.pub');
  fs.copyFileSync(path.join(dir, '.ssh', 'id_other.pub'), lonely);
  assert.deepStrictEqual(await checkSigningKey(lonely, countingDependencies()), { result: 'failed', reason: 'sign-failed' });
  assert.deepStrictEqual(
    await checkSigningKey(path.join(dir, '.ssh', 'missing'), countingDependencies()),
    { result: 'failed', reason: 'not-a-key-file' },
  );
  assert.deepStrictEqual(await checkSigningKey(path.join(dir, '.ssh'), countingDependencies()), {
    result: 'failed',
    reason: 'not-a-key-file',
  });

  // A private key protected by a passphrase: its public key cannot be read
  // without one, so it is not accepted (its .pub file is)
  const protectedKey = path.join(dir, '.ssh', 'id_protected');
  execFileSync('ssh-keygen', ['-q', '-t', 'ed25519', '-N', 'passphrase', '-f', protectedKey], { env: isolatedEnv, stdio: 'ignore' });
  assert.deepStrictEqual(await checkSigningKey(protectedKey, countingDependencies()), { result: 'failed', reason: 'public-key-unknown' });

  // The .pub file next to the key is another key: without that key in
  // ssh-agent, OpenSSH refuses to sign; with it, it signs with the other key.
  // Either way the switch stops.
  const mixed = path.join(dir, '.ssh', 'id_mixed');
  fs.copyFileSync(keyPath, mixed);
  fs.chmodSync(mixed, 0o600);
  fs.copyFileSync(path.join(dir, '.ssh', 'id_other.pub'), `${mixed}.pub`);
  assert.deepStrictEqual(await checkSigningKey(mixed, countingDependencies()), { result: 'failed', reason: 'sign-failed' });
  const agent = await startAgent(dir);
  if (agent === undefined) {
    console.log('    ssh-agent not available here: the other key in ssh-agent is not checked');
    return;
  }
  const savedSocket = process.env.SSH_AUTH_SOCK;
  try {
    execFileSync('ssh-add', [path.join(dir, '.ssh', 'id_other')], { env: { ...isolatedEnv, SSH_AUTH_SOCK: agent.socket }, stdio: 'ignore' });
    process.env.SSH_AUTH_SOCK = agent.socket;
    assert.deepStrictEqual(await checkSigningKey(mixed, countingDependencies()), { result: 'failed', reason: 'other-key' });
  } finally {
    process.env.SSH_AUTH_SOCK = savedSocket;
    agent.stop();
  }
}

export async function runSshSigningTests(): Promise<void> {
  console.log('\n🔑 Running SSH Commit Signing Tests (ssh-keygen + git verify-commit)...\n');
  const skipReason = getSkipReason();
  if (skipReason) {
    if (process.env.CI) {
      throw new Error(`SSH signing tests cannot run in CI: ${skipReason}`);
    }
    console.log(`  ⏭️  SKIPPED: SSH signing tests (${skipReason})`);
    return;
  }

  // realpath: the temporary directory may be reached through a symlink (macOS
  // /var) or a short name (Windows RUNNER~1), and key paths are resolved
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-id-switcher-ssh-signing-'));
  const dir = fs.realpathSync.native(tempDir);
  const savedHome = { HOME: process.env.HOME, USERPROFILE: process.env.USERPROFILE, SSH_AUTH_SOCK: process.env.SSH_AUTH_SOCK };
  // os.homedir() reads HOME (POSIX) and USERPROFILE (Windows)
  process.env.HOME = dir;
  process.env.USERPROFILE = dir;
  // The signing key check runs ssh-keygen with this process's environment: no agent of the user
  process.env.SSH_AUTH_SOCK = '';
  isolatedEnv = createIsolatedEnv(dir);
  try {
    fs.mkdirSync(path.join(dir, '.ssh'), { mode: 0o700 });
    generateKey(path.join(dir, '.ssh', 'id_sign'), 'signer@example.com');
    generateKey(path.join(dir, '.ssh', 'id_other'), 'other@example.com');
    // ssh-keygen creates the private key 0600 and the public key 0644
    await testSignAndVerify('~/.ssh/id_sign', 'private key', dir);
    await testSignAndVerify('~/.ssh/id_sign.pub', 'public key', dir);
    await testSigningKeyCheck(dir);
  } finally {
    for (const [name, value] of Object.entries(savedHome)) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
  console.log('\n✅ SSH Commit Signing Tests Passed!\n');
}
