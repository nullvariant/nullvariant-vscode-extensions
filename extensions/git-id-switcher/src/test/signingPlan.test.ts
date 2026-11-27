/**
 * Commit Signing Plan Tests
 *
 * planSigningConfig() over every row of the switching table
 * (helpers/signingCases.ts), and the helpers it is built from.
 */

import * as assert from 'node:assert';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  SIGNING_CONFIG_KEYS,
  getDesiredSigningValues,
  hasWrittenValues,
  normalizeSigningKeyPath,
  planSigningConfig,
  resolveSigningSpec,
  restoreOperation,
  toLocalValues,
  type SigningConfigKey,
} from '../core/signingPlan';
import type { ConfigReadResult } from '../core/localGitConfig';
import { expandTilde } from '../security/pathNormalizer';
import { ABSENT, G1, K1, NEXT, PREVIOUS, READ_ERROR_CASES, SIGNING_CASES, record } from './helpers/signingCases';
import { toLocal } from './helpers/signingFixtures';

function testPlanTable(): void {
  console.log('  Testing planSigningConfig() over the switching table...');
  for (const testCase of SIGNING_CASES) {
    const previous = PREVIOUS[testCase.previous];
    const plan = planSigningConfig(previous.record, toLocal(previous.local), NEXT[testCase.next]);
    if (testCase.expected.result === 'blocked') {
      assert.deepStrictEqual(plan, testCase.expected, testCase.name);
      continue;
    }
    assert.deepStrictEqual(
      plan,
      { result: 'ok', operations: testCase.expected.operations, record: testCase.expected.record },
      testCase.name,
    );
  }

  // #19: the read of any one signing key fails
  for (const testCase of READ_ERROR_CASES) {
    for (const key of SIGNING_CONFIG_KEYS) {
      const local: Record<SigningConfigKey, ConfigReadResult> = {
        ...toLocal(['ssh', K1, 'true']),
        [key]: { kind: 'error' },
      };
      const plan = planSigningConfig(PREVIOUS.P2.record, local, NEXT[testCase.next]);
      assert.deepStrictEqual(plan, { result: 'blocked', reason: 'read-error', key }, `${testCase.name} (${key})`);
    }
  }
}

function testToLocalValues(): void {
  console.log('  Testing toLocalValues()...');
  assert.deepStrictEqual(toLocalValues(toLocal(['ssh', ABSENT, 'true'])), toLocal(['ssh', ABSENT, 'true']));
  // The first unreadable key, in the order the keys are written
  assert.deepStrictEqual(
    toLocalValues({ 'gpg.format': { kind: 'absent' }, 'user.signingkey': { kind: 'error' }, 'commit.gpgsign': { kind: 'error' } }),
    { unreadableKey: 'user.signingkey' },
  );
}

function testResolveSigningSpec(): void {
  console.log('  Testing resolveSigningSpec() and normalizeSigningKeyPath()...');
  const base = { id: 'a', name: 'A', email: 'a@example.com' };
  assert.strictEqual(resolveSigningSpec(base), undefined);
  assert.strictEqual(resolveSigningSpec({ ...base, gpgKeyId: '', sshSigningKeyPath: '' }), undefined);
  assert.deepStrictEqual(resolveSigningSpec({ ...base, gpgKeyId: G1 }), { gpgFormat: 'openpgp', signingKey: G1 });
  // The value written is the normalized path in the form normalizeSigningKeyPath
  // writes on this platform ('/' separators on Windows too)
  const signingKey = path.join(os.homedir(), '.ssh', 'id_sign');
  assert.deepStrictEqual(resolveSigningSpec({ ...base, sshSigningKeyPath: '~/.ssh/id_sign' }), {
    gpgFormat: 'ssh',
    signingKey: path.sep === '\\' ? signingKey.replaceAll('\\', '/') : signingKey,
  });
  assert.throws(
    () => resolveSigningSpec({ ...base, gpgKeyId: G1, sshSigningKeyPath: '~/.ssh/k' }),
    /^Error: gpgKeyId and sshSigningKeyPath cannot both be set$/,
  );

  // ~/ is expanded and the path normalized; symlinks are not resolved
  // (~/ is expanded with the platform's own separator, as the extension does)
  assert.strictEqual(normalizeSigningKeyPath('~/.ssh//k', path.posix), path.posix.normalize(expandTilde('~/.ssh//k')));
  assert.strictEqual(normalizeSigningKeyPath('/a/b/./c', path.posix), '/a/b/c');
  // Windows: written with '/' separators
  assert.strictEqual(normalizeSigningKeyPath(String.raw`C:\Users\u\.ssh\.\id_sign`, path.win32), 'C:/Users/u/.ssh/id_sign');
  assert.strictEqual(normalizeSigningKeyPath('C:/Users/u/.ssh//id_sign', path.win32), 'C:/Users/u/.ssh/id_sign');
  // The platform's own path functions by default
  const native = normalizeSigningKeyPath('~/.ssh/k');
  const expected = path.join(os.homedir(), '.ssh', 'k');
  assert.strictEqual(native, path.sep === '\\' ? expected.replaceAll('\\', '/') : expected);

  assert.deepStrictEqual(getDesiredSigningValues({ gpgFormat: 'ssh', signingKey: K1 }), {
    'gpg.format': 'ssh',
    'user.signingkey': K1,
    'commit.gpgsign': 'true',
  });
  assert.deepStrictEqual(restoreOperation('gpg.format', { kind: 'absent' }), { operation: 'unset', key: 'gpg.format' });
  assert.deepStrictEqual(restoreOperation('gpg.format', { kind: 'value', value: 'ssh' }), {
    operation: 'set',
    key: 'gpg.format',
    value: 'ssh',
  });
  const rec = record([ABSENT, ABSENT, ABSENT], ['ssh', K1, 'true']);
  assert.strictEqual(hasWrittenValues(rec, toLocal(['ssh', K1, 'true'])), true);
  assert.strictEqual(hasWrittenValues(rec, toLocal(['ssh', K1, ABSENT])), false);
}

export function runSigningPlanTests(): void {
  console.log('\n🔏 Running Commit Signing Plan Tests...\n');
  testPlanTable();
  testToLocalValues();
  testResolveSigningSpec();
  console.log('\n✅ All Commit Signing Plan Tests Passed!\n');
}
