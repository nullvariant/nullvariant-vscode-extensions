/**
 * Switching combinations for the commit signing keys, as test data.
 *
 * One row per (previous state, next identity). The three keys are written as
 * the group (gpg.format, user.signingkey, commit.gpgsign); `ABSENT` is "not set" (`∅` in the table).
 * The same rows are run against the pure planner, and against real git for
 * the workspace root and for a submodule.
 */

import type { ConfigOperation } from '../../core/localGitConfig';
import type { RepositoryRecord, SigningConfigKey, SigningSpec } from '../../core/signingPlan';

/** Not set */
export const ABSENT = undefined;

export type Triple = readonly [string | undefined, string | undefined, string | undefined];

export const G1 = 'AAAA1111BBBB2222';
export const G2 = 'CCCC3333DDDD4444';
export const K1 = '/home/test/.ssh/id_k1';
export const K2 = '/home/test/.ssh/id_k2';
/** A key path the user wrote by hand */
export const Ku = '~/.ssh/u.pub';

/** Build a record from the group before writing and the group written */
export function record(before: Triple, written: readonly [string, string, string]): RepositoryRecord {
  const entry = (index: number): RepositoryRecord[SigningConfigKey] => {
    const value = before[index];
    return {
      before: value === undefined ? { kind: 'absent' } : { kind: 'value', value },
      written: written[index],
    };
  };
  return {
    'gpg.format': entry(0),
    'user.signingkey': entry(1),
    'commit.gpgsign': entry(2),
  };
}

interface PreviousState {
  readonly local: Triple;
  readonly record: RepositoryRecord | undefined;
}

/**
 * Previous states (P6, the read failure, is not a set of values: see
 * READ_ERROR_CASES). P8 is not in the table: one key (gpg.format) changed by
 * hand after the record, the edge of the "all three or none" rule.
 */
export const PREVIOUS: Readonly<Record<'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P7' | 'P8', PreviousState>> = {
  P0: { local: [ABSENT, ABSENT, ABSENT], record: undefined },
  P1: { local: ['openpgp', G1, 'true'], record: record([ABSENT, ABSENT, ABSENT], ['openpgp', G1, 'true']) },
  P2: { local: ['ssh', K1, 'true'], record: record([ABSENT, ABSENT, ABSENT], ['ssh', K1, 'true']) },
  P3: { local: ['ssh', Ku, 'true'], record: undefined },
  P4: { local: ['ssh', Ku, 'false'], record: record([ABSENT, ABSENT, ABSENT], ['ssh', K1, 'true']) },
  P5: { local: ['openpgp', G1, 'true'], record: record(['ssh', Ku, 'true'], ['openpgp', G1, 'true']) },
  P7: { local: ['x509', ABSENT, ABSENT], record: undefined },
  P8: { local: ['openpgp', K1, 'true'], record: record([ABSENT, ABSENT, ABSENT], ['ssh', K1, 'true']) },
};

export const NEXT: Readonly<Record<'N0' | 'N1' | 'N2', SigningSpec | undefined>> = {
  N0: undefined,
  N1: { gpgFormat: 'openpgp', signingKey: G2 },
  N2: { gpgFormat: 'ssh', signingKey: K2 },
};

const set = (key: SigningConfigKey, value: string): ConfigOperation<SigningConfigKey> => ({ operation: 'set', key, value });
const unset = (key: SigningConfigKey): ConfigOperation<SigningConfigKey> => ({ operation: 'unset', key });

export interface SigningCase {
  readonly name: string;
  readonly previous: keyof typeof PREVIOUS;
  readonly next: keyof typeof NEXT;
  readonly expected:
    | {
        readonly result: 'ok';
        readonly operations: readonly ConfigOperation<SigningConfigKey>[];
        readonly local: Triple;
        readonly record: RepositoryRecord | undefined;
      }
    | { readonly result: 'blocked'; readonly reason: 'unrestorable-value'; readonly key: SigningConfigKey };
}

const ok = (
  operations: readonly ConfigOperation<SigningConfigKey>[],
  local: Triple,
  rec: RepositoryRecord | undefined,
): SigningCase['expected'] => ({ result: 'ok', operations, local, record: rec });

const UNSET_ALL = [unset('commit.gpgsign'), unset('user.signingkey'), unset('gpg.format')];

export const SIGNING_CASES: readonly SigningCase[] = [
  { name: '#1 P0 → N0', previous: 'P0', next: 'N0', expected: ok([], [ABSENT, ABSENT, ABSENT], undefined) },
  {
    name: '#2 P0 → N1', previous: 'P0', next: 'N1',
    expected: ok(
      [set('gpg.format', 'openpgp'), set('user.signingkey', G2), set('commit.gpgsign', 'true')],
      ['openpgp', G2, 'true'],
      record([ABSENT, ABSENT, ABSENT], ['openpgp', G2, 'true']),
    ),
  },
  {
    name: '#3 P0 → N2', previous: 'P0', next: 'N2',
    expected: ok(
      [set('gpg.format', 'ssh'), set('user.signingkey', K2), set('commit.gpgsign', 'true')],
      ['ssh', K2, 'true'],
      record([ABSENT, ABSENT, ABSENT], ['ssh', K2, 'true']),
    ),
  },
  { name: '#4 P1 → N0', previous: 'P1', next: 'N0', expected: ok(UNSET_ALL, [ABSENT, ABSENT, ABSENT], undefined) },
  {
    name: '#5 P1 → N1', previous: 'P1', next: 'N1',
    expected: ok([set('user.signingkey', G2)], ['openpgp', G2, 'true'], record([ABSENT, ABSENT, ABSENT], ['openpgp', G2, 'true'])),
  },
  {
    name: '#6 P1 → N2', previous: 'P1', next: 'N2',
    expected: ok(
      [set('gpg.format', 'ssh'), set('user.signingkey', K2)],
      ['ssh', K2, 'true'],
      record([ABSENT, ABSENT, ABSENT], ['ssh', K2, 'true']),
    ),
  },
  { name: '#7 P2 → N0', previous: 'P2', next: 'N0', expected: ok(UNSET_ALL, [ABSENT, ABSENT, ABSENT], undefined) },
  {
    name: '#8 P2 → N1', previous: 'P2', next: 'N1',
    expected: ok(
      [set('gpg.format', 'openpgp'), set('user.signingkey', G2)],
      ['openpgp', G2, 'true'],
      record([ABSENT, ABSENT, ABSENT], ['openpgp', G2, 'true']),
    ),
  },
  {
    name: '#9 P2 → N2', previous: 'P2', next: 'N2',
    expected: ok([set('user.signingkey', K2)], ['ssh', K2, 'true'], record([ABSENT, ABSENT, ABSENT], ['ssh', K2, 'true'])),
  },
  { name: '#10 P3 → N0', previous: 'P3', next: 'N0', expected: ok([], ['ssh', Ku, 'true'], undefined) },
  {
    name: '#11 P3 → N1', previous: 'P3', next: 'N1',
    expected: ok(
      [set('gpg.format', 'openpgp'), set('user.signingkey', G2)],
      ['openpgp', G2, 'true'],
      record(['ssh', Ku, 'true'], ['openpgp', G2, 'true']),
    ),
  },
  {
    name: '#12 P3 → N2', previous: 'P3', next: 'N2',
    expected: ok([set('user.signingkey', K2)], ['ssh', K2, 'true'], record(['ssh', Ku, 'true'], ['ssh', K2, 'true'])),
  },
  { name: '#13 P4 → N0', previous: 'P4', next: 'N0', expected: ok([], ['ssh', Ku, 'false'], undefined) },
  {
    name: '#14 P4 → N1', previous: 'P4', next: 'N1',
    expected: ok(
      [set('gpg.format', 'openpgp'), set('user.signingkey', G2), set('commit.gpgsign', 'true')],
      ['openpgp', G2, 'true'],
      record(['ssh', Ku, 'false'], ['openpgp', G2, 'true']),
    ),
  },
  {
    name: '#15 P4 → N2', previous: 'P4', next: 'N2',
    expected: ok(
      [set('user.signingkey', K2), set('commit.gpgsign', 'true')],
      ['ssh', K2, 'true'],
      record(['ssh', Ku, 'false'], ['ssh', K2, 'true']),
    ),
  },
  {
    name: '#16 P5 → N0', previous: 'P5', next: 'N0',
    expected: ok([set('user.signingkey', Ku), set('gpg.format', 'ssh')], ['ssh', Ku, 'true'], undefined),
  },
  {
    name: '#17 P5 → N1', previous: 'P5', next: 'N1',
    expected: ok(
      [set('user.signingkey', G2)],
      ['openpgp', G2, 'true'],
      record(['ssh', Ku, 'true'], ['openpgp', G2, 'true']),
    ),
  },
  {
    name: '#18 P5 → N2', previous: 'P5', next: 'N2',
    expected: ok(
      [set('gpg.format', 'ssh'), set('user.signingkey', K2)],
      ['ssh', K2, 'true'],
      record(['ssh', Ku, 'true'], ['ssh', K2, 'true']),
    ),
  },
  { name: '#20 P7 → N0', previous: 'P7', next: 'N0', expected: ok([], ['x509', ABSENT, ABSENT], undefined) },
  {
    name: '#21 P7 → N1', previous: 'P7', next: 'N1',
    expected: { result: 'blocked', reason: 'unrestorable-value', key: 'gpg.format' },
  },
  {
    name: '#21 P7 → N2', previous: 'P7', next: 'N2',
    expected: { result: 'blocked', reason: 'unrestorable-value', key: 'gpg.format' },
  },
  // Not in the table: one key differs from the record
  { name: 'P8 → N0', previous: 'P8', next: 'N0', expected: ok([], ['openpgp', K1, 'true'], undefined) },
  {
    name: 'P8 → N2', previous: 'P8', next: 'N2',
    expected: ok(
      [set('gpg.format', 'ssh'), set('user.signingkey', K2)],
      ['ssh', K2, 'true'],
      record(['openpgp', K1, 'true'], ['ssh', K2, 'true']),
    ),
  },
];

/** #19: the read of a signing key fails (P6), for each next identity */
export const READ_ERROR_CASES: ReadonlyArray<{ readonly name: string; readonly next: keyof typeof NEXT }> = [
  { name: '#19 P6 → N0', next: 'N0' },
  { name: '#19 P6 → N1', next: 'N1' },
  { name: '#19 P6 → N2', next: 'N2' },
];
