/**
 * Signing Record Store Tests
 *
 * The record of the signing config the extension wrote: what it accepts back
 * from storage, and how it writes.
 */

import * as assert from 'node:assert';
import {
  SIGNING_RECORD_STATE_KEY,
  createSigningRecordStore,
  isRepositoryRecord,
} from '../core/signingRecordStore';
import { ABSENT, K1, record } from './helpers/signingCases';
import { createMemento } from './helpers/signingFixtures';

async function testRecordStore(): Promise<void> {
  console.log('  Testing createSigningRecordStore()...');
  const rec = record([ABSENT, 'x', ABSENT], ['ssh', K1, 'true']);
  const stored = (value: unknown): ReturnType<typeof createMemento> =>
    createMemento({ [SIGNING_RECORD_STATE_KEY]: value });

  assert.strictEqual(SIGNING_RECORD_STATE_KEY, 'gitIdSwitcher.signingRecords');

  // Nothing stored, or storage of the wrong type
  assert.strictEqual(createSigningRecordStore(createMemento()).get('/r'), undefined);
  assert.deepStrictEqual(createSigningRecordStore(stored('not an object')).repositoryPaths(), []);
  assert.deepStrictEqual(createSigningRecordStore(stored([rec])).repositoryPaths(), []);

  const store = createSigningRecordStore(
    stored({
      '/ok': rec,
      '/bad-record': { 'gpg.format': { before: { kind: 'value' }, written: 'ssh' } },
      '/bad-before': { ...rec, 'gpg.format': { before: { kind: 'other' }, written: 'ssh' } },
      '/bad-before-type': { ...rec, 'gpg.format': { before: 'absent', written: 'ssh' } },
      '/bad-written': { ...rec, 'gpg.format': { before: { kind: 'absent' }, written: 1 } },
      '/null': null,
    }),
  );
  assert.deepStrictEqual(store.get('/ok'), rec);
  for (const repositoryPath of ['/bad-record', '/bad-before', '/bad-before-type', '/bad-written', '/null']) {
    assert.strictEqual(store.get(repositoryPath), undefined, repositoryPath);
  }
  // Data of another shape is still listed, so it can be tidied away
  assert.ok(store.repositoryPaths().includes('/bad-record'));
  assert.strictEqual(store.get('__proto__'), undefined, 'inherited keys are not records');
  assert.strictEqual(store.get('toString'), undefined, 'inherited keys are not records');

  await store.set('/ok', undefined);
  assert.strictEqual(store.get('/ok'), undefined);
  assert.ok(!store.repositoryPaths().includes('/ok'));
  await store.set('/new', rec);
  assert.deepStrictEqual(store.get('/new'), rec);
  // The other repositories are kept
  assert.ok(store.repositoryPaths().includes('/bad-written'));

  assert.strictEqual(isRepositoryRecord(rec), true);
  assert.strictEqual(isRepositoryRecord(null), false);
  assert.strictEqual(isRepositoryRecord([]), false);
}

export async function runSigningRecordStoreTests(): Promise<void> {
  console.log('\n🗂️ Running Signing Record Store Tests...\n');
  await testRecordStore();
  console.log('\n✅ All Signing Record Store Tests Passed!\n');
}
