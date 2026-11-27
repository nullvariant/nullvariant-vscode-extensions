/**
 * SSH Signing Key Check Tests (fake ssh-keygen and file system)
 *
 * The parsing of public key lines and signatures, the remembered checks, and
 * each way the check stops. The same check against real ssh-keygen and
 * ssh-agent is in sshSigning.test.ts.
 */

import * as assert from 'node:assert';
import { MAX_IDENTITIES } from '../core/constants';
import {
  SIGNING_KEY_CHECK_STATE_KEY,
  checkSigningKey,
  parsePublicKeyLine,
  parseSignaturePublicKey,
  type FileStamp,
  type SigningKeyCheckDependencies,
  type SigningKeyCheckResult,
} from '../ssh/signingKeyCheck';
import { SIGNING_TEST_DATA } from '../security/sshKeygenRules';
import { armorSignature, createMemento, keyBlob, publicKeyLine, signatureBy } from './helpers/signingFixtures';

const KEY = keyBlob('k');

function testParsePublicKeyLine(): void {
  console.log('  Testing parsePublicKeyLine()...');
  const line = publicKeyLine(KEY);
  assert.deepStrictEqual(parsePublicKeyLine(`${line.trim()} comment\n`), KEY);
  assert.deepStrictEqual(parsePublicKeyLine(`\n  ${line}`), KEY);
  for (const text of [
    '',
    'ssh-ed25519',
    line.replace('ssh-ed25519', 'ssh-rsa'), // the type in the blob is another
    '-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA\n',
    'ssh-ed25519 AAA', // shorter than a length field
  ]) {
    assert.strictEqual(parsePublicKeyLine(text), undefined, JSON.stringify(text));
  }
}

function testParseSignaturePublicKey(): void {
  console.log('  Testing parseSignaturePublicKey()...');
  assert.deepStrictEqual(parseSignaturePublicKey(signatureBy(KEY)), KEY);
  const tooLong = Buffer.concat([Buffer.from('SSHSIG'), Buffer.alloc(4), Buffer.from([0, 0, 1, 0]), Buffer.from('short')]);
  const notSignature = Buffer.concat([Buffer.from('NOTSIG'), Buffer.alloc(8)]);
  for (const text of ['', armorSignature(Buffer.from('SSHSIG')), armorSignature(notSignature), armorSignature(tooLong)]) {
    assert.strictEqual(parseSignaturePublicKey(text), undefined, JSON.stringify(text));
  }
}

interface FakeOptions {
  /** The public key ssh-keygen -y prints (undefined: not a private key it can read) */
  readonly publicKey?: Buffer;
  readonly fileText?: string | Error;
  readonly signedWith?: Buffer | Error;
  /** Files by path (default: fakeStat) */
  readonly files?: Readonly<Record<string, FileStamp | undefined>>;
}

type FakeDependencies = SigningKeyCheckDependencies & { calls: string[] };

/** The current user (the tests run on Unix) */
const UID = typeof process.getuid === 'function' ? process.getuid() : 0;

/** A key file with safe permissions */
const FILE: FileStamp = { isFile: true, size: 400, mtimeMs: 7, mode: 0o600, uid: UID };

/** A sidecar `.pub` that does not exist, for every key path but the public key file */
function fakeStat(filePath: string): ReturnType<SigningKeyCheckDependencies['stat']> {
  const isMissing = filePath === '/k.pub' || filePath.endsWith('.pub.pub');
  return Promise.resolve(isMissing ? undefined : FILE);
}

function fakeDependencies(options: FakeOptions = {}, store = createMemento()): FakeDependencies {
  const calls: string[] = [];
  const keygen: SigningKeyCheckDependencies['sshKeygen'] = async (args, execOptions) => {
    calls.push(args.join(' '));
    if (args[0] === '-y') {
      if (options.publicKey === undefined) {
        throw new Error('not a private key');
      }
      return { stdout: publicKeyLine(options.publicKey) };
    }
    assert.deepStrictEqual(execOptions, { input: SIGNING_TEST_DATA, timeout: 30_000, isNonInteractive: true });
    if (options.signedWith instanceof Error) {
      throw options.signedWith;
    }
    return { stdout: options.signedWith === undefined ? 'garbage' : signatureBy(options.signedWith) };
  };
  return {
    calls,
    store,
    stat: options.files === undefined ? fakeStat : async (filePath) => options.files?.[filePath],
    readFile: async () => {
      calls.push('readFile');
      if (options.fileText instanceof Error) {
        throw options.fileText;
      }
      return options.fileText ?? '';
    },
    sshKeygen: keygen,
  };
}

const failed = (reason: Extract<SigningKeyCheckResult, { result: 'failed' }>['reason']): SigningKeyCheckResult => ({
  result: 'failed',
  reason,
});

async function testCheckSigningKey(): Promise<void> {
  console.log('  Testing checkSigningKey()...');

  // A private key: its public key from ssh-keygen -y, then a signature with it
  const store = createMemento();
  const deps = fakeDependencies({ publicKey: KEY, signedWith: KEY }, store);
  assert.deepStrictEqual(await checkSigningKey('/k', deps), { result: 'ok' });
  assert.deepStrictEqual(deps.calls, ['-y -P  -f /k', '-Y sign -n git -f /k']);
  assert.deepStrictEqual(store.data.get(SIGNING_KEY_CHECK_STATE_KEY), {
    '/k': { key: FILE, publicKey: null },
  });
  // Unchanged files: not checked again
  deps.calls.length = 0;
  assert.deepStrictEqual(await checkSigningKey('/k', deps), { result: 'ok' });
  assert.deepStrictEqual(deps.calls, []);

  // A public key file: read as the public key
  const publicDeps = fakeDependencies({ fileText: publicKeyLine(KEY), signedWith: KEY });
  assert.deepStrictEqual(await checkSigningKey('/p.pub', publicDeps), { result: 'ok' });
  assert.deepStrictEqual(publicDeps.calls, ['-y -P  -f /p.pub', 'readFile', '-Y sign -n git -f /p.pub']);

  // The ways it stops
  const unreadable = fakeDependencies({ fileText: new Error('EACCES') });
  assert.deepStrictEqual(await checkSigningKey('/k', unreadable), failed('public-key-unknown'));
  const cannotSign = fakeDependencies({ publicKey: KEY, signedWith: new Error('no key') });
  assert.deepStrictEqual(await checkSigningKey('/k', cannotSign), failed('sign-failed'));
  assert.deepStrictEqual(await checkSigningKey('/k', fakeDependencies({ publicKey: KEY })), failed('sign-failed'));
  const otherStore = createMemento();
  const otherKey = fakeDependencies({ publicKey: KEY, signedWith: keyBlob('other') }, otherStore);
  assert.deepStrictEqual(await checkSigningKey('/k', otherKey), failed('other-key'));
  assert.strictEqual(otherStore.data.get(SIGNING_KEY_CHECK_STATE_KEY), undefined, 'a failed check is not remembered');
  for (const stat of [undefined, { ...FILE, isFile: false }, { ...FILE, size: 1_048_577 }]) {
    const fileDeps: SigningKeyCheckDependencies = { ...fakeDependencies(), stat: async () => stat };
    assert.deepStrictEqual(await checkSigningKey('/k', fileDeps), failed('not-a-key-file'), JSON.stringify(stat));
  }
  // A path that is not absolute on this platform (a drive path on POSIX):
  // stopped before the file is looked at
  const drivePath = fakeDependencies({ publicKey: KEY, signedWith: KEY, files: { 'C:/Users/u/.ssh/k': FILE } });
  assert.deepStrictEqual(await checkSigningKey('C:/Users/u/.ssh/k', drivePath), failed('not-a-key-file'));
  assert.deepStrictEqual(drivePath.calls, []);
}

/**
 * The permissions of the key file and the `.pub` file next to it (Unix): a
 * private key that group or others can read, or a public key (a `.pub`
 * file) they can write, stops the check before anything is read.
 */
async function testPermissions(): Promise<void> {
  console.log('  Testing the permissions of the key files...');
  const withMode = (mode: number): FileStamp => ({ ...FILE, mode });
  const cases: ReadonlyArray<{ path: string; files: Record<string, FileStamp | undefined>; fileText?: string; result: SigningKeyCheckResult }> = [
    // A private key: no access for group or others, not executable
    { path: '/k', files: { '/k': withMode(0o644) }, result: failed('insecure-permissions') },
    { path: '/k', files: { '/k': withMode(0o700) }, result: failed('insecure-permissions') },
    { path: '/k', files: { '/k': withMode(0o400) }, result: { result: 'ok' } },
    // The .pub next to a private key: not writable by group or others, not executable
    { path: '/k', files: { '/k': withMode(0o600), '/k.pub': withMode(0o664) }, result: failed('insecure-permissions') },
    { path: '/k', files: { '/k': withMode(0o600), '/k.pub': withMode(0o744) }, result: failed('insecure-permissions') },
    { path: '/k', files: { '/k': withMode(0o600), '/k.pub': withMode(0o644) }, result: { result: 'ok' } },
    // A public key file: readable by anyone, not writable by group or others
    { path: '/p.pub', files: { '/p.pub': withMode(0o644) }, fileText: publicKeyLine(KEY), result: { result: 'ok' } },
    { path: '/p.pub', files: { '/p.pub': withMode(0o664) }, fileText: publicKeyLine(KEY), result: failed('insecure-permissions') },
    { path: '/p.pub', files: { '/p.pub': withMode(0o755) }, fileText: publicKeyLine(KEY), result: failed('insecure-permissions') },
    // Owned by the current user or root, never by another user
    { path: '/k', files: { '/k': { ...FILE, uid: 0 } }, result: { result: 'ok' } },
    { path: '/k', files: { '/k': { ...FILE, uid: UID + 1 } }, result: failed('insecure-permissions') },
    { path: '/k', files: { '/k': FILE, '/k.pub': { ...withMode(0o644), uid: UID + 1 } }, result: failed('insecure-permissions') },
    { path: '/p.pub', files: { '/p.pub': { ...withMode(0o644), uid: UID + 1 } }, fileText: publicKeyLine(KEY), result: failed('insecure-permissions') },
  ];
  for (const { path, files, fileText, result } of cases) {
    const deps = fakeDependencies({ publicKey: path.endsWith('.pub') ? undefined : KEY, signedWith: KEY, files, fileText });
    assert.deepStrictEqual(await checkSigningKey(path, deps), result, JSON.stringify({ path, files }));
    if (result.result === 'failed') {
      assert.deepStrictEqual(deps.calls, [], 'nothing is read, ssh-keygen does not run');
    }
  }
}

function checkedPaths(store: ReturnType<typeof createMemento>): string[] {
  return Object.keys(store.data.get(SIGNING_KEY_CHECK_STATE_KEY) as object);
}

async function testRememberedChecks(): Promise<void> {
  console.log('  Testing the remembered checks...');
  // Stored data of another shape is ignored, and replaced
  for (const stored of ['x', ['/k'], null]) {
    const store = createMemento({ [SIGNING_KEY_CHECK_STATE_KEY]: stored });
    const deps = fakeDependencies({ publicKey: KEY, signedWith: KEY }, store);
    assert.deepStrictEqual(await checkSigningKey('/k', deps), { result: 'ok' });
    assert.ok(deps.calls.length > 0, JSON.stringify(stored));
    assert.deepStrictEqual(checkedPaths(store), ['/k']);
  }
  // A changed stamp is checked again: the key file's modification time or
  // permissions, or only the .pub next to it (changed, or appeared)
  const pub = { ...FILE, mode: 0o644 };
  for (const [stored, files] of [
    [{ key: { ...FILE, mtimeMs: 6 }, publicKey: null }, { '/k': FILE }],
    [{ key: { ...FILE, mode: 0o400 }, publicKey: null }, { '/k': FILE }],
    [{ key: FILE, publicKey: pub }, { '/k': FILE, '/k.pub': { ...pub, mtimeMs: 8 } }],
    [{ key: FILE, publicKey: null }, { '/k': FILE, '/k.pub': pub }],
  ] as const) {
    const store = createMemento({ [SIGNING_KEY_CHECK_STATE_KEY]: { '/k': stored } });
    const deps = fakeDependencies({ publicKey: KEY, signedWith: KEY, files }, store);
    assert.deepStrictEqual(await checkSigningKey('/k', deps), { result: 'ok' });
    assert.ok(deps.calls.includes('-Y sign -n git -f /k'), JSON.stringify(files));
  }
  // A file owned by another user is stopped even when its stamp was remembered
  const foreign = { ...FILE, uid: UID + 1 };
  const remembered = createMemento({ [SIGNING_KEY_CHECK_STATE_KEY]: { '/k': { key: foreign, publicKey: null } } });
  const foreignDeps = fakeDependencies({ publicKey: KEY, signedWith: KEY, files: { '/k': foreign } }, remembered);
  assert.deepStrictEqual(await checkSigningKey('/k', foreignDeps), failed('insecure-permissions'));
  // Only the latest MAX_IDENTITIES keys are kept; the key checked is the newest
  const many = Object.fromEntries(Array.from({ length: MAX_IDENTITIES }, (_, index) => [`/old${index}`, {}]));
  const full = createMemento({ [SIGNING_KEY_CHECK_STATE_KEY]: { ...many, '/k': {} } });
  await checkSigningKey('/k', fakeDependencies({ publicKey: KEY, signedWith: KEY }, full));
  const kept = checkedPaths(full);
  assert.strictEqual(kept.length, MAX_IDENTITIES);
  assert.strictEqual(kept.at(-1), '/k');
  assert.ok(!kept.includes('/old0'));
}

export async function runSigningKeyCheckTests(): Promise<void> {
  console.log('\n🔏 Running SSH Signing Key Check Tests...\n');
  testParsePublicKeyLine();
  testParseSignaturePublicKey();
  await testCheckSigningKey();
  await testPermissions();
  await testRememberedChecks();
  console.log('\n✅ All SSH Signing Key Check Tests Passed!\n');
}
