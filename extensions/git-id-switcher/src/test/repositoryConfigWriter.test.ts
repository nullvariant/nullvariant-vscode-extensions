/**
 * Repository Config Writer Tests
 *
 * - applyIdentityToRepository(): every row of the switching table against
 *   real git, for the workspace root and for a real submodule
 * - #19 (a read fails) for each key, with a fake port
 * - failures part way and rollback; a record store that cannot be written;
 *   startup tidying; leftover detection
 * - the checks and messages around a write (signing key check, errors)
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  applyIdentityToRepository,
  assertSigningKeyUsable,
  combineSigningResidue,
  createApplyError,
  detectSigningResidue,
  maintainSigningRecords,
} from '../core/repositoryConfigWriter';
import { SIGNING_RECORD_STATE_KEY, createSigningRecordStore, type SigningRecordStore } from '../core/signingRecordStore';
import { SIGNING_CONFIG_KEYS, type RepositoryRecord } from '../core/signingPlan';
import { createLocalGitConfigPort, type LocalGitConfigPort } from '../core/localGitConfig';
import { collectSubmodules, setIdentityForSubmodules, type Submodule } from '../core/submodule';
import { getUserSafeMessage, isSecurityError } from '../core/errors';
import type { GitConfigKey } from '../security/gitConfigRules';
import type { SigningKeyCheckDependencies } from '../ssh/signingKeyCheck';
import { ABSENT, G1, G2, K1, K2, NEXT, PREVIOUS, READ_ERROR_CASES, SIGNING_CASES, record } from './helpers/signingCases';
import {
  createFakePort,
  createMemento,
  git,
  initRepository,
  keyBlob,
  makeTempDir,
  publicKeyLine,
  readLocal,
  readLocalTriple,
  signatureBy,
  writeLocal,
  writeLocalTriple,
} from './helpers/signingFixtures';

const NAME_BEFORE = 'Before';
const EMAIL_BEFORE = 'before@example.com';

function storeWith(records: Readonly<Record<string, unknown>> = {}): SigningRecordStore {
  return createSigningRecordStore(createMemento({ [SIGNING_RECORD_STATE_KEY]: records }));
}

// ============================================================================
// The table against real git
// ============================================================================

async function runTableAgainstRepository(
  label: string,
  repository: string,
  isApplied: (store: SigningRecordStore, next: (typeof NEXT)[keyof typeof NEXT]) => Promise<boolean>,
): Promise<void> {
  for (const testCase of SIGNING_CASES) {
    const name = `${label} ${testCase.name}`;
    const previous = PREVIOUS[testCase.previous];
    writeLocal(repository, 'user.name', NAME_BEFORE);
    writeLocal(repository, 'user.email', EMAIL_BEFORE);
    writeLocalTriple(repository, previous.local);
    assert.deepStrictEqual(readLocalTriple(repository), previous.local, `${name}: the previous state is set up`);
    const store = createSigningRecordStore(createMemento());
    await store.set(repository, previous.record);

    const isOk = await isApplied(store, NEXT[testCase.next]);

    if (testCase.expected.result === 'blocked') {
      assert.strictEqual(isOk, false, `${name}: fails`);
      assert.deepStrictEqual(readLocalTriple(repository), previous.local, `${name}: values unchanged`);
      assert.deepStrictEqual(store.get(repository), previous.record, `${name}: record unchanged`);
      assert.strictEqual(readLocal(repository, 'user.name'), NAME_BEFORE, `${name}: user.name unchanged`);
      assert.strictEqual(readLocal(repository, 'user.email'), EMAIL_BEFORE, `${name}: user.email unchanged`);
      continue;
    }
    assert.strictEqual(isOk, true, `${name}: succeeds`);
    assert.deepStrictEqual(readLocalTriple(repository), testCase.expected.local, `${name}: --local values`);
    assert.deepStrictEqual(store.get(repository), testCase.expected.record, `${name}: record`);
    assert.strictEqual(readLocal(repository, 'user.name'), 'Table User', `${name}: user.name`);
    assert.strictEqual(readLocal(repository, 'user.email'), 'table@example.com', `${name}: user.email`);
  }
}

async function testTableWithRealGit(): Promise<void> {
  console.log('  Testing the switching table against real git (root and submodule)...');
  const root = makeTempDir('signing-table-');
  try {
    const subSource = path.join(root, 'sub-source');
    const parent = path.join(root, 'parent');
    fs.mkdirSync(subSource);
    fs.mkdirSync(parent);
    initRepository(subSource);
    initRepository(parent);
    git(parent, ['-c', 'protocol.file.allow=always', 'submodule', 'add', '-q', subSource, 'lib']);
    git(parent, ['-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'add submodule']);

    // Workspace root
    await runTableAgainstRepository('root', parent, async (store, next) => {
      const result = await applyIdentityToRepository(
        createLocalGitConfigPort(parent), store, parent, 'Table User', 'table@example.com', next,
      );
      return result.result === 'ok';
    });

    // A real submodule, found through `git submodule status`
    const { submodules } = await collectSubmodules(parent);
    assert.strictEqual(submodules.length, 1, 'fixture has one submodule');
    const subPath = submodules[0].absolutePath;
    await runTableAgainstRepository('submodule', subPath, async (store, next) => {
      const result = await setIdentityForSubmodules(submodules, 'Table User', 'table@example.com', next, store);
      assert.strictEqual(result.success + result.failed, 1);
      return result.success === 1;
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

// ============================================================================
// #19: a read fails
// ============================================================================

async function testReadErrors(): Promise<void> {
  console.log('  Testing #19 (a read fails) for every key...');
  const p2 = PREVIOUS.P2.record as RepositoryRecord;
  const p2Values = { 'user.name': 'Old', 'user.email': 'old@example.com', 'gpg.format': 'ssh', 'user.signingkey': K1, 'commit.gpgsign': 'true' };
  const keys: readonly GitConfigKey[] = ['user.name', 'user.email', ...SIGNING_CONFIG_KEYS];

  for (const testCase of READ_ERROR_CASES) {
    for (const key of keys) {
      const name = `${testCase.name} (${key})`;
      const store = storeWith({ '/repo': p2 });
      const port = createFakePort(p2Values, { readErrors: [key] });
      const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT[testCase.next]);
      assert.deepStrictEqual(result, { result: 'blocked', reason: 'read-error', key }, name);
      assert.deepStrictEqual(port.writes, [], `${name}: nothing written`);
      assert.deepStrictEqual(store.get('/repo'), p2, `${name}: record unchanged`);

      // The same through the submodule path
      const submodule: Submodule = { path: 'lib', absolutePath: '/sub', commitHash: '0'.repeat(40), initialized: true };
      const subStore = storeWith({ '/sub': p2 });
      const subPort = createFakePort(p2Values, { readErrors: [key] });
      assert.deepStrictEqual(
        await setIdentityForSubmodules([submodule], 'New', 'new@example.com', NEXT[testCase.next], subStore, () => subPort),
        { success: 0, failed: 1 },
        `${name} (submodule)`,
      );
      assert.deepStrictEqual(subPort.writes, [], `${name} (submodule): nothing written`);
      assert.deepStrictEqual(subStore.get('/sub'), p2, `${name} (submodule): record unchanged`);
    }
  }
}

// ============================================================================
// Failures part way and rollback (fake port)
// ============================================================================

async function testRollback(): Promise<void> {
  console.log('  Testing rollback when a write fails part way...');

  // Values were set before: every write is put back, the old record is kept
  {
    const oldRecord = record([ABSENT, ABSENT, ABSENT], ['openpgp', G1, 'true']);
    const store = storeWith({ '/repo': oldRecord });
    const port = createFakePort(
      { 'user.name': 'Old', 'user.email': 'old@example.com', 'gpg.format': 'openpgp', 'user.signingkey': G1, 'commit.gpgsign': 'true' },
      { failSet: (key) => key === 'user.signingkey' },
    );
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N2);
    assert.deepStrictEqual(result, { result: 'failed', key: 'user.signingkey', isRolledBack: true });
    assert.deepStrictEqual(Object.fromEntries(port.values), {
      'user.name': 'Old', 'user.email': 'old@example.com', 'gpg.format': 'openpgp', 'user.signingkey': G1, 'commit.gpgsign': 'true',
    });
    assert.deepStrictEqual(store.get('/repo'), oldRecord);
    assert.deepStrictEqual(port.writes, [
      'set user.name=New', 'set user.email=new@example.com', 'set gpg.format=ssh', `set user.signingkey=${K2}`,
      'set gpg.format=openpgp', 'set user.email=old@example.com', 'set user.name=Old',
    ]);
  }

  // Nothing was set before: the signing keys are unset again, but user.name
  // and user.email have no unset, so they stay written and the rollback is
  // incomplete
  {
    const store = createSigningRecordStore(createMemento());
    const port = createFakePort({}, { failSet: (key) => key === 'commit.gpgsign' });
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N1);
    assert.deepStrictEqual(result, { result: 'failed', key: 'commit.gpgsign', isRolledBack: false });
    assert.deepStrictEqual(Object.fromEntries(port.values), { 'user.name': 'New', 'user.email': 'new@example.com' });
    assert.deepStrictEqual(port.writes.slice(-2), ['unset user.signingkey', 'unset gpg.format']);
    assert.ok(!port.writes.includes('unset user.name') && !port.writes.includes('unset user.email'));
    // Rebuilt from the values: neither record matches, so no record
    assert.strictEqual(store.get('/repo'), undefined);
  }

  // Putting a signing key back fails: the record is rebuilt from the values
  {
    const store = createSigningRecordStore(createMemento());
    const port = createFakePort(
      { 'user.name': 'Old', 'user.email': 'old@example.com' },
      { failSet: (key) => key === 'commit.gpgsign', failUnset: (key) => key === 'user.signingkey' },
    );
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N1);
    assert.deepStrictEqual(result, { result: 'failed', key: 'commit.gpgsign', isRolledBack: false });
    assert.deepStrictEqual(Object.fromEntries(port.values), {
      'user.name': 'Old', 'user.email': 'old@example.com', 'user.signingkey': G2,
    });
    assert.strictEqual(store.get('/repo'), undefined);
  }

  // Putting back fails part way and leaves the old values: the old record
  // matches them again and is kept
  {
    const oldRecord = record([ABSENT, ABSENT, ABSENT], ['openpgp', G1, 'true']);
    const store = storeWith({ '/repo': oldRecord });
    const port = createFakePort(
      { 'user.name': 'Old', 'user.email': 'old@example.com', 'gpg.format': 'openpgp', 'user.signingkey': G1, 'commit.gpgsign': 'true' },
      { failSet: (key, value) => key === 'user.signingkey' || value === 'Old' },
    );
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N2);
    assert.deepStrictEqual(result, { result: 'failed', key: 'user.signingkey', isRolledBack: false });
    assert.deepStrictEqual(store.get('/repo'), oldRecord);
  }

  // Putting back fails and the values cannot be read afterwards: no record,
  // so the values are never removed automatically
  {
    const oldRecord = record([ABSENT, ABSENT, ABSENT], ['openpgp', G1, 'true']);
    const store = storeWith({ '/repo': oldRecord });
    let isReadable = true;
    const port = createFakePort(
      { 'user.name': 'Old', 'user.email': 'old@example.com', 'gpg.format': 'openpgp', 'user.signingkey': G1, 'commit.gpgsign': 'true' },
      {
        failSet: (key, value) => key === 'user.signingkey' || value === 'openpgp',
        failRead: () => !isReadable,
        // Once putting gpg.format back fails, the repository cannot be read either
        onWrite: (write, isDone) => {
          if (!isDone && write === 'set gpg.format=openpgp') {
            isReadable = false;
          }
        },
      },
    );
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N2);
    assert.deepStrictEqual(result, { result: 'failed', key: 'user.signingkey', isRolledBack: false });
    assert.strictEqual(store.get('/repo'), undefined);
  }

  // The first write fails: nothing to put back
  {
    const store = createSigningRecordStore(createMemento());
    const port = createFakePort({ 'user.name': 'Old' }, { failSet: (key) => key === 'user.name' });
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', undefined);
    assert.deepStrictEqual(result, { result: 'failed', key: 'user.name', isRolledBack: true });
    assert.strictEqual(store.get('/repo'), undefined);
  }

  // Restoring (unsigned identity) fails part way after the record matched
  {
    const oldRecord = record([ABSENT, ABSENT, ABSENT], ['ssh', K1, 'true']);
    const store = storeWith({ '/repo': oldRecord });
    const port = createFakePort(
      { 'user.name': 'Old', 'user.email': 'old@example.com', 'gpg.format': 'ssh', 'user.signingkey': K1, 'commit.gpgsign': 'true' },
      { failUnset: (key) => key === 'gpg.format' },
    );
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', undefined);
    assert.deepStrictEqual(result, { result: 'failed', key: 'gpg.format', isRolledBack: true });
    assert.deepStrictEqual(store.get('/repo'), oldRecord);
    // Every value as before, put back in reverse order
    assert.deepStrictEqual(Object.fromEntries(port.values), {
      'user.name': 'Old', 'user.email': 'old@example.com', 'gpg.format': 'ssh', 'user.signingkey': K1, 'commit.gpgsign': 'true',
    });
    assert.deepStrictEqual(port.writes, [
      'set user.name=New', 'set user.email=new@example.com', 'unset commit.gpgsign', 'unset user.signingkey', 'unset gpg.format',
      `set user.signingkey=${K1}`, 'set commit.gpgsign=true', 'set user.email=old@example.com', 'set user.name=Old',
    ]);
  }

  // A value the extension could not restore: nothing is written
  {
    const store = createSigningRecordStore(createMemento());
    const port = createFakePort({ 'commit.gpgsign': 'yes' });
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N1);
    assert.deepStrictEqual(result, { result: 'blocked', reason: 'unrestorable-value', key: 'commit.gpgsign' });
    assert.deepStrictEqual(port.writes, []);
  }
}

async function testSubmoduleFailureCounts(): Promise<void> {
  console.log('  Testing the submodule counts when a write fails...');
  const ok: Submodule = { path: 'ok', absolutePath: '/ok', commitHash: '0'.repeat(40), initialized: true };
  const failing: Submodule = { path: 'failing', absolutePath: '/failing', commitHash: '0'.repeat(40), initialized: true };
  const recorded = record([ABSENT, ABSENT, ABSENT], ['ssh', K1, 'true']);
  const written = { 'user.name': 'Old', 'user.email': 'old@example.com', 'gpg.format': 'ssh', 'user.signingkey': K1, 'commit.gpgsign': 'true' };
  const store = storeWith({ '/ok': recorded, '/failing': recorded });
  const ports: Record<string, LocalGitConfigPort & { values: Map<GitConfigKey, string> }> = {
    '/ok': createFakePort(written),
    '/failing': createFakePort(written, { failUnset: (key) => key === 'user.signingkey' }),
  };

  const result = await setIdentityForSubmodules([ok, failing], 'New', 'new@example.com', undefined, store, (repositoryPath) => ports[repositoryPath]);
  assert.deepStrictEqual(result, { success: 1, failed: 1 });
  // The failed submodule is put back, values and record
  assert.deepStrictEqual(Object.fromEntries(ports['/failing'].values), written);
  assert.deepStrictEqual(store.get('/failing'), recorded);
  // The other one was restored
  assert.deepStrictEqual(Object.fromEntries(ports['/ok'].values), { 'user.name': 'New', 'user.email': 'new@example.com' });
  assert.strictEqual(store.get('/ok'), undefined);
}

/** A record store whose set() throws on the calls listed (1 = the first call) */
function storeFailingOn(calls: readonly number[]): SigningRecordStore {
  const store = storeWith();
  let count = 0;
  return {
    get: (repositoryPath) => store.get(repositoryPath),
    repositoryPaths: () => store.repositoryPaths(),
    set: async (repositoryPath, state) => {
      count++;
      if (calls.includes(count)) {
        throw new Error('the workspace state cannot be written');
      }
      await store.set(repositoryPath, state);
    },
  };
}

async function testRecordStoreFailures(): Promise<void> {
  console.log('  Testing a record store that cannot be written...');
  const values = { 'user.name': 'Old', 'user.email': 'old@example.com' };
  // git config is written but the record cannot be stored: the values are
  // put back (they could not be put back later without it) and it fails
  {
    const store = storeFailingOn([1]);
    const port = createFakePort(values);
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N2);
    assert.deepStrictEqual(result, { result: 'failed', key: undefined, isRolledBack: true });
    assert.deepStrictEqual(Object.fromEntries(port.values), values);
    assert.strictEqual(store.get('/repo'), undefined);
  }
  // Putting back is not complete (user.name was not set): the record is
  // rebuilt from the values left
  {
    const store = storeFailingOn([1]);
    const port = createFakePort({});
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N2);
    assert.deepStrictEqual(result, { result: 'failed', key: undefined, isRolledBack: false });
    assert.strictEqual(port.values.get('user.name'), 'New');
    assert.strictEqual(port.values.get('gpg.format'), undefined);
    assert.strictEqual(store.get('/repo'), undefined);
  }
  // A write fails and the record cannot be stored afterwards: still a failed write
  {
    const store = storeFailingOn([1]);
    const port = createFakePort(values, { failSet: (key) => key === 'commit.gpgsign' });
    const result = await applyIdentityToRepository(port, store, '/repo', 'New', 'new@example.com', NEXT.N2);
    assert.deepStrictEqual(result, { result: 'failed', key: 'commit.gpgsign', isRolledBack: true });
  }
  // A submodule whose record store throws, or whose record cannot be saved
  // (its values are put back), is counted as failed; the others are applied
  {
    const submodules: Submodule[] = ['/a', '/b'].map((absolutePath) => ({
      path: absolutePath.slice(1), absolutePath, commitHash: '0'.repeat(40), initialized: true,
    }));
    const throwing: SigningRecordStore = {
      ...storeWith(),
      get: () => {
        throw new Error('the workspace state cannot be read');
      },
    };
    const result = await setIdentityForSubmodules(submodules, 'New', 'new@example.com', undefined, throwing, () => createFakePort(values));
    assert.deepStrictEqual(result, { success: 0, failed: 2 });
    const mixed = await setIdentityForSubmodules(submodules, 'New', 'new@example.com', undefined, storeFailingOn([1]), () => createFakePort(values));
    assert.deepStrictEqual(mixed, { success: 1, failed: 1 });
  }
}

// ============================================================================
// Startup tidying, leftovers
// ============================================================================

async function testMaintainSigningRecords(): Promise<void> {
  console.log('  Testing maintainSigningRecords()...');
  const oldRecord = record([ABSENT, ABSENT, ABSENT], ['openpgp', G1, 'true']);
  const store = storeWith({ '/gone': oldRecord, '/kept': oldRecord, '/invalid': 'x' });
  const asked: string[] = [];
  await maintainSigningRecords(store, async (repositoryPath) => {
    asked.push(repositoryPath);
    return repositoryPath === '/gone';
  });
  assert.deepStrictEqual(store.repositoryPaths(), ['/kept']);
  assert.deepStrictEqual(store.get('/kept'), oldRecord);
  // Data that is not a record is removed without looking at the repository
  assert.deepStrictEqual(asked, ['/gone', '/kept']);
}

async function testDetectSigningResidue(): Promise<void> {
  console.log('  Testing detectSigningResidue() and combineSigningResidue()...');
  const rec = record([ABSENT, ABSENT, ABSENT], ['ssh', K1, 'true']);
  const store = storeWith({ '/r': rec });
  const written = { 'gpg.format': 'ssh', 'user.signingkey': K1, 'commit.gpgsign': 'true' };

  assert.strictEqual(await detectSigningResidue(createFakePort(written), store, '/none'), 'none', 'no record');
  assert.strictEqual(await detectSigningResidue(createFakePort(written), store, '/r'), 'present', 'written values remain');
  assert.strictEqual(
    await detectSigningResidue(createFakePort({ ...written, 'commit.gpgsign': 'false' }), store, '/r'),
    'none',
    'the user changed a value: left alone',
  );
  assert.strictEqual(
    await detectSigningResidue(createFakePort(written, { readErrors: ['gpg.format'] }), store, '/r'),
    'error',
  );
  // A record whose values are already the previous ones needs no operation
  const restored = storeWith({ '/r': record(['ssh', K1, 'true'], ['ssh', K1, 'true']) });
  assert.strictEqual(await detectSigningResidue(createFakePort(written), restored, '/r'), 'none');
  // A state that is not a record at all
  assert.strictEqual(await detectSigningResidue(createFakePort(written), storeWith({ '/r': 'x' }), '/r'), 'none');

  assert.strictEqual(combineSigningResidue([]), 'none');
  assert.strictEqual(combineSigningResidue(['none', 'none']), 'none');
  assert.strictEqual(combineSigningResidue(['none', 'present']), 'present');
  assert.strictEqual(combineSigningResidue(['present', 'error']), 'error');
}

// ============================================================================
// Checks and messages around a write
// ============================================================================

/** Signing key check dependencies that fail at the step named */
function checkDependencies(failAt: 'stat' | 'public-key' | 'sign' | 'other-key' | 'none'): SigningKeyCheckDependencies & { calls: string[] } {
  const calls: string[] = [];
  const blob = keyBlob('key');
  return {
    calls,
    stat: async (filePath) => {
      calls.push(`stat ${filePath}`);
      return failAt === 'stat' ? undefined : { isFile: true, size: 100, mtimeMs: 1, mode: 0o600, uid: 0 };
    },
    readFile: async () => '',
    sshKeygen: async (args) => {
      calls.push(args[0]);
      if (args[0] === '-y') {
        if (failAt === 'public-key') {
          throw new Error('no public key');
        }
        return { stdout: publicKeyLine(blob) };
      }
      if (failAt === 'sign') {
        throw new Error('cannot sign');
      }
      return { stdout: signatureBy(failAt === 'other-key' ? keyBlob('other') : blob) };
    },
    store: createMemento(),
  };
}

async function testAssertSigningKeyUsable(): Promise<void> {
  console.log('  Testing assertSigningKeyUsable()...');
  // No signing, or a GPG key: nothing is checked
  for (const signing of [undefined, { gpgFormat: 'openpgp' as const, signingKey: G1 }]) {
    const deps = checkDependencies('none');
    await assertSigningKeyUsable(signing, deps);
    assert.deepStrictEqual(deps.calls, []);
  }
  const ssh = { gpgFormat: 'ssh' as const, signingKey: K1 };
  const passing = checkDependencies('none');
  await assertSigningKeyUsable(ssh, passing);
  assert.ok(passing.calls.includes('-Y'), 'the key signs');

  const messages = {
    stat: 'SSH signing key file validation failed',
    'public-key':
      'The public key of the SSH signing key could not be read without a passphrase, so Git config was not changed. Set sshSigningKeyPath to its public key file (.pub) and add the key to ssh-agent.',
    sign: 'Could not sign with the SSH signing key, so Git config was not changed. A key with a passphrase must be in ssh-agent.',
    'other-key':
      'The SSH signing key signed with another key than the one in sshSigningKeyPath (check the .pub file next to it), so Git config was not changed.',
  } as const;
  for (const [failAt, message] of Object.entries(messages) as Array<[keyof typeof messages, string]>) {
    await assert.rejects(assertSigningKeyUsable(ssh, checkDependencies(failAt)), (error: unknown) => {
      assert.ok(isSecurityError(error), failAt);
      assert.strictEqual(getUserSafeMessage(error), message, failAt);
      return true;
    });
  }
}

function testCreateApplyError(): void {
  console.log('  Testing createApplyError()...');
  const message = (error: Error): string => getUserSafeMessage(error);
  assert.strictEqual(
    message(createApplyError({ result: 'failed', key: 'gpg.format', isRolledBack: true })),
    'Failed to update Git config. The previous values were restored.',
  );
  assert.strictEqual(
    message(createApplyError({ result: 'failed', key: 'user.name', isRolledBack: false })),
    'Failed to update Git config, and some previous values could not be restored.',
  );
  // The key that holds the value is named in the message
  assert.strictEqual(
    message(createApplyError({ result: 'blocked', reason: 'unrestorable-value', key: 'gpg.format' })),
    "The repository's Git config has a value for gpg.format that Git ID Switcher cannot restore. Remove it from the repository's config and try again.",
  );
  assert.strictEqual(
    message(createApplyError({ result: 'blocked', reason: 'read-error', key: 'user.signingkey' })),
    "Could not read the repository's Git config; nothing was changed.",
  );
}

export async function runRepositoryConfigWriterTests(): Promise<void> {
  console.log('\n✍️ Running Repository Config Writer Tests...\n');
  await testTableWithRealGit();
  await testReadErrors();
  await testRollback();
  await testSubmoduleFailureCounts();
  await testRecordStoreFailures();
  await testMaintainSigningRecords();
  await testDetectSigningResidue();
  await testAssertSigningKeyUsable();
  testCreateApplyError();
  console.log('\n✅ All Repository Config Writer Tests Passed!\n');
}
