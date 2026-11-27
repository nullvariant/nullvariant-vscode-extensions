/**
 * Sync Checker Tests
 *
 * Tests for profile vs git config synchronization detection.
 *
 * ## stripIcon() tests:
 * - No icon configured → returns unchanged
 * - Icon matches prefix → strips icon
 * - Icon does not match → returns unchanged
 * - Empty string handling
 *
 * ## compareSyncState() tests:
 * - Fully synced (name + email match)
 * - Name mismatch
 * - Email mismatch
 * - Multiple mismatches (name + email)
 * - GPG signing key mismatch
 * - GPG signing key match
 * - GPG key in identity but not in git config → out of sync (not set is a mismatch)
 * - No GPG key in identity → signing key ignored unless the extension left it
 * - Unknown state (a value could not be read)
 * - SSH signing, gpg.format and commit.gpgsign comparison, leftover signing values
 * - includeIconInGitConfig enabled (icon stripping in comparison)
 * - includeIconInGitConfig enabled but identity has no icon
 * - Partial git config (only userName set, no email)
 * - Partial git config (only userEmail set, no name)
 *
 * Total: Comprehensive coverage of pure comparison logic and icon stripping.
 */

import * as assert from 'node:assert';
import type { Identity } from '../identity/identity';
import type { GitConfig } from '../core/gitConfig';
import type { ConfigReadResult } from '../core/localGitConfig';
import type { GitConfigKey } from '../security/gitConfigRules';
import {
  stripIcon,
  compareSyncState,
  checkSync,
  _setGitConfigReader,
  _setLocalSigningReader,
  _setSigningResidueDetector,
} from '../core/syncChecker';
import { createSigningRecordStore } from '../core/signingRecordStore';
import { normalizeSigningKeyPath } from '../core/signingPlan';
import { _resetCache } from '../core/vscodeLoader';

// ============================================================================
// Test Helpers
// ============================================================================

function createIdentity(overrides: Partial<Identity> = {}): Identity {
  return {
    id: 'test',
    name: 'John Doe',
    email: 'john@example.com',
    ...overrides,
  };
}

type GitConfigInput = Partial<Record<GitConfigKey, string | ConfigReadResult | undefined>>;

/** A string is a set value, undefined is "not set", an object is used as is */
function toRead(value: string | ConfigReadResult | undefined): ConfigReadResult {
  if (value === undefined) {
    return { kind: 'absent' };
  }
  return typeof value === 'string' ? { kind: 'value', value } : value;
}

function createGitConfig(overrides: GitConfigInput = {}): GitConfig {
  const input: GitConfigInput = {
    'user.name': 'John Doe',
    'user.email': 'john@example.com',
    ...overrides,
  };
  return {
    'user.name': toRead(input['user.name']),
    'user.email': toRead(input['user.email']),
    'user.signingkey': toRead(input['user.signingkey']),
    'gpg.format': toRead(input['gpg.format']),
    'commit.gpgsign': toRead(input['commit.gpgsign']),
  };
}

const READ_ERROR: ConfigReadResult = { kind: 'error' };

/** A store with no records (the leftover detector is replaced in these tests) */
const STORE = createSigningRecordStore({ get: () => undefined, update: async () => undefined });

/** Leftover detection for the checkSync() tests that are not about it */
const detectNoResidue = async (): Promise<'none'> => 'none';

// ============================================================================
// stripIcon() Tests
// ============================================================================

function testStripIconNoIcon(): void {
  console.log('  Testing stripIcon() with no icon...');

  assert.strictEqual(stripIcon('John Doe', undefined), 'John Doe');
  assert.strictEqual(stripIcon('', undefined), '');
}

function testStripIconMatchingPrefix(): void {
  console.log('  Testing stripIcon() with matching icon prefix...');

  assert.strictEqual(stripIcon('🏢 John Doe', '🏢'), 'John Doe');
  assert.strictEqual(stripIcon('🏠 Personal Name', '🏠'), 'Personal Name');
  // Flag emoji (multi-codepoint)
  assert.strictEqual(stripIcon('🇯🇵 Taro', '🇯🇵'), 'Taro');
}

function testStripIconNoMatch(): void {
  console.log('  Testing stripIcon() with non-matching icon...');

  // Different icon
  assert.strictEqual(stripIcon('🏢 John Doe', '🏠'), '🏢 John Doe');
  // No icon in gitUserName
  assert.strictEqual(stripIcon('John Doe', '🏢'), 'John Doe');
}

function testStripIconEmptyString(): void {
  console.log('  Testing stripIcon() with empty string...');

  assert.strictEqual(stripIcon('', '🏢'), '');
}

function testStripIconOnlyIcon(): void {
  console.log('  Testing stripIcon() with only icon and space...');

  // Edge case: user.name is just the icon + space (name would be empty string)
  assert.strictEqual(stripIcon('🏢 ', '🏢'), '');
}

// ============================================================================
// compareSyncState() Tests
// ============================================================================

function testCompareSyncStateSynced(): void {
  console.log('  Testing compareSyncState() fully synced...');

  const identity = createIdentity();
  const gitConfig = createGitConfig();

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateNameMismatch(): void {
  console.log('  Testing compareSyncState() name mismatch...');

  const identity = createIdentity({ name: 'John Doe' });
  const gitConfig = createGitConfig({ 'user.name': 'Jane Doe' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'user.name');
  assert.strictEqual(result.mismatches[0].expected, 'John Doe');
  assert.strictEqual(result.mismatches[0].actual, 'Jane Doe');
}

function testCompareSyncStateEmailMismatch(): void {
  console.log('  Testing compareSyncState() email mismatch...');

  const identity = createIdentity({ email: 'john@example.com' });
  const gitConfig = createGitConfig({ 'user.email': 'john@other.com' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'user.email');
  assert.strictEqual(result.mismatches[0].expected, 'john@example.com');
  assert.strictEqual(result.mismatches[0].actual, 'john@other.com');
}

function testCompareSyncStateMultipleMismatches(): void {
  console.log('  Testing compareSyncState() multiple mismatches...');

  const identity = createIdentity({ name: 'John Doe', email: 'john@example.com' });
  const gitConfig = createGitConfig({ 'user.name': 'Jane Doe', 'user.email': 'jane@other.com' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 2);

  const fields = new Set(result.mismatches.map(m => m.field));
  assert.ok(fields.has('user.name'));
  assert.ok(fields.has('user.email'));
}

function testCompareSyncStateGpgKeyMismatch(): void {
  console.log('  Testing compareSyncState() GPG key mismatch...');

  const identity = createIdentity({ gpgKeyId: 'ABCD1234' });
  const gitConfig = createGitConfig({ 'gpg.format': 'openpgp', 'user.signingkey': 'EFGH5678', 'commit.gpgsign': 'true' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'user.signingkey');
  assert.strictEqual(result.mismatches[0].expected, 'ABCD1234');
  assert.strictEqual(result.mismatches[0].actual, 'EFGH5678');
}

function testCompareSyncStateGpgKeyMatch(): void {
  console.log('  Testing compareSyncState() GPG key match...');

  const identity = createIdentity({ gpgKeyId: 'ABCD1234' });
  const gitConfig = createGitConfig({ 'gpg.format': 'openpgp', 'user.signingkey': 'ABCD1234', 'commit.gpgsign': 'true' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);

  // A missing gpg.format is a mismatch: the extension writes it for every
  // signing identity, and without it a --global gpg.format would apply
  const missingFormat = compareSyncState(
    identity,
    createGitConfig({ 'gpg.format': undefined, 'user.signingkey': 'ABCD1234', 'commit.gpgsign': 'true' }),
    false,
  );
  assert.deepStrictEqual(missingFormat, {
    state: 'out_of_sync',
    mismatches: [{ field: 'gpg.format', expected: 'openpgp', actual: '' }],
  });
}

function testCompareSyncStateGpgKeyNotInGitConfig(): void {
  console.log('  Testing compareSyncState() GPG key in identity but not in git config...');

  // A signing key or commit.gpgsign that is not set is a mismatch, not "synced"
  const identity = createIdentity({ gpgKeyId: 'ABCD1234' });
  const gitConfig = createGitConfig({ 'user.signingkey': undefined });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.deepStrictEqual(result.mismatches, [
    { field: 'gpg.format', expected: 'openpgp', actual: '' },
    { field: 'user.signingkey', expected: 'ABCD1234', actual: '' },
    { field: 'commit.gpgsign', expected: 'true', actual: '' },
  ]);
}

function testCompareSyncStateNoGpgKeyInIdentity(): void {
  console.log('  Testing compareSyncState() no GPG key in identity...');

  // An unsigned identity leaves signing to the user's own config: a key the
  // extension did not write (no leftover) is not compared
  const identity = createIdentity();
  const gitConfig = createGitConfig({ 'user.signingkey': 'ABCD1234', 'commit.gpgsign': 'true', 'gpg.format': 'ssh' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
  assert.deepStrictEqual(compareSyncState(identity, gitConfig, false, 'none'), result);
}

function testCompareSyncStateUnknown(): void {
  console.log('  Testing compareSyncState() unknown state (a value could not be read)...');

  const identity = createIdentity();
  for (const field of ['user.name', 'user.email', 'user.signingkey', 'gpg.format', 'commit.gpgsign'] as const) {
    const result = compareSyncState(identity, createGitConfig({ [field]: READ_ERROR }), false);
    assert.deepStrictEqual(result, { state: 'unknown', mismatches: [] }, `${field} read error`);
  }

  // Leftover signing values that cannot be read
  assert.deepStrictEqual(compareSyncState(identity, createGitConfig(), false, 'error'), {
    state: 'unknown',
    mismatches: [],
  });
}

function testCompareSyncStateWithIconEnabled(): void {
  console.log('  Testing compareSyncState() with includeIconInGitConfig enabled...');

  const identity = createIdentity({ icon: '🏢', name: 'John Doe' });
  // Git config has icon prepended (as buildGitUserName would produce)
  const gitConfig = createGitConfig({ 'user.name': '🏢 John Doe' });

  const result = compareSyncState(identity, gitConfig, true);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateWithIconEnabledButMismatch(): void {
  console.log('  Testing compareSyncState() with icon enabled but name mismatch...');

  const identity = createIdentity({ icon: '🏢', name: 'John Doe' });
  // Git config has icon but different name
  const gitConfig = createGitConfig({ 'user.name': '🏢 Jane Doe' });

  const result = compareSyncState(identity, gitConfig, true);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'user.name');
  assert.strictEqual(result.mismatches[0].expected, 'John Doe');
  // actual should show the raw git config value
  assert.strictEqual(result.mismatches[0].actual, '🏢 Jane Doe');
}

function testCompareSyncStateWithIconEnabledNoIdentityIcon(): void {
  console.log('  Testing compareSyncState() with icon enabled but identity has no icon...');

  // Identity has no icon, so includeIconInGitConfig has no effect
  const identity = createIdentity({ name: 'John Doe' });
  const gitConfig = createGitConfig({ 'user.name': 'John Doe' });

  const result = compareSyncState(identity, gitConfig, true);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateWithIconDisabledButGitConfigHasIcon(): void {
  console.log('  Testing compareSyncState() with icon disabled but git config has icon...');

  // includeIconInGitConfig is false, but someone manually set icon in git config
  const identity = createIdentity({ icon: '🏢', name: 'John Doe' });
  const gitConfig = createGitConfig({ 'user.name': '🏢 John Doe' });

  // When icon setting is off, no icon stripping → mismatch
  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'user.name');
}

function testCompareSyncStatePartialGitConfigOnlyName(): void {
  console.log('  Testing compareSyncState() partial git config (only userName)...');

  const identity = createIdentity();
  const gitConfig = createGitConfig({ 'user.email': undefined });

  // user.email not set is a mismatch, not "synced"
  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.deepStrictEqual(result.mismatches, [{ field: 'user.email', expected: 'john@example.com', actual: '' }]);
}

function testCompareSyncStatePartialGitConfigOnlyEmail(): void {
  console.log('  Testing compareSyncState() partial git config (only userEmail)...');

  const identity = createIdentity();
  const gitConfig = createGitConfig({ 'user.name': undefined });

  // user.name not set is a mismatch, not "synced"
  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.deepStrictEqual(result.mismatches, [{ field: 'user.name', expected: 'John Doe', actual: '' }]);
}

function testCompareSyncStateUnsetFieldMismatch(): void {
  console.log('  Testing compareSyncState() git config field set but identity field different...');

  const identity = createIdentity({ name: 'John Doe' });
  const gitConfig = createGitConfig({ 'user.name': 'Different Name', 'user.email': 'john@example.com' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'user.name');
}

// ============================================================================
// Signing comparison (SSH and GPG, gpg.format, commit.gpgsign, leftovers)
// ============================================================================

function testCompareSyncStateSshSigning(): void {
  console.log('  Testing compareSyncState() SSH signing identity...');

  const identity = createIdentity({ sshSigningKeyPath: '~/.ssh/id_sign' });
  const keyPath = normalizeSigningKeyPath('~/.ssh/id_sign');

  // The key is compared in the form the extension writes (~/ expanded)
  const synced = compareSyncState(
    identity,
    createGitConfig({ 'gpg.format': 'ssh', 'user.signingkey': keyPath, 'commit.gpgsign': 'true' }),
    false,
  );
  assert.deepStrictEqual(synced, { state: 'synced', mismatches: [] });

  // A hand-written ~/ path is a different value
  const tilde = compareSyncState(
    identity,
    createGitConfig({ 'gpg.format': 'ssh', 'user.signingkey': '~/.ssh/id_sign', 'commit.gpgsign': 'true' }),
    false,
  );
  assert.deepStrictEqual(tilde.mismatches, [{ field: 'user.signingkey', expected: keyPath, actual: '~/.ssh/id_sign' }]);

  // gpg.format not set: a mismatch (shown as not set)
  const noFormat = compareSyncState(
    identity,
    createGitConfig({ 'user.signingkey': keyPath, 'commit.gpgsign': 'true' }),
    false,
  );
  assert.deepStrictEqual(noFormat.mismatches, [{ field: 'gpg.format', expected: 'ssh', actual: '' }]);

  // git's other true spellings are not what the extension writes
  const yes = compareSyncState(
    identity,
    createGitConfig({ 'gpg.format': 'ssh', 'user.signingkey': keyPath, 'commit.gpgsign': 'yes' }),
    false,
  );
  assert.deepStrictEqual(yes.mismatches, [{ field: 'commit.gpgsign', expected: 'true', actual: 'yes' }]);
}

function testCompareSyncStateGpgFormatMismatch(): void {
  console.log('  Testing compareSyncState() gpg.format mismatch for a GPG identity...');

  const identity = createIdentity({ gpgKeyId: 'ABCD1234' });
  const result = compareSyncState(
    identity,
    createGitConfig({ 'gpg.format': 'ssh', 'user.signingkey': 'ABCD1234', 'commit.gpgsign': 'true' }),
    false,
  );
  assert.deepStrictEqual(result.mismatches, [{ field: 'gpg.format', expected: 'openpgp', actual: 'ssh' }]);
}

function testCompareSyncStateSigningResidue(): void {
  console.log('  Testing compareSyncState() leftover signing values for an unsigned identity...');

  const result = compareSyncState(createIdentity(), createGitConfig(), false, 'present');
  assert.strictEqual(result.state, 'out_of_sync');
  assert.deepStrictEqual(result.mismatches, [
    { field: 'signingResidue', expected: '', actual: 'gpg.format, user.signingkey, commit.gpgsign' },
  ]);

  // A signing identity compares its own values; leftovers do not apply
  const signing = compareSyncState(
    createIdentity({ gpgKeyId: 'ABCD1234' }),
    createGitConfig({ 'gpg.format': 'openpgp', 'user.signingkey': 'ABCD1234', 'commit.gpgsign': 'true' }),
    false,
    'present',
  );
  assert.deepStrictEqual(signing, { state: 'synced', mismatches: [] });
}

function testCompareSyncStateLocalSigning(): void {
  console.log('  Testing compareSyncState() the --local signing values of a signing identity...');

  const identity = createIdentity({ gpgKeyId: 'ABCD1234' });
  const values = { 'gpg.format': 'openpgp', 'user.signingkey': 'ABCD1234', 'commit.gpgsign': 'true' } as const;
  const merged = createGitConfig(values);
  const local = (overrides: Partial<Record<keyof typeof values, ConfigReadResult>> = {}) => ({
    'gpg.format': { kind: 'value', value: 'openpgp' } as ConfigReadResult,
    'user.signingkey': { kind: 'value', value: 'ABCD1234' } as ConfigReadResult,
    'commit.gpgsign': { kind: 'value', value: 'true' } as ConfigReadResult,
    ...overrides,
  });

  assert.deepStrictEqual(compareSyncState(identity, merged, false, 'none', local()), { state: 'synced', mismatches: [] });
  // The value git uses is right, but only because of --global: the
  // repository's own value was removed
  assert.deepStrictEqual(
    compareSyncState(identity, merged, false, 'none', local({ 'gpg.format': { kind: 'absent' } })).mismatches,
    [{ field: 'gpg.format', expected: 'openpgp', actual: '' }],
  );
  assert.deepStrictEqual(
    compareSyncState(identity, merged, false, 'none', local({ 'commit.gpgsign': { kind: 'value', value: 'false' } })).mismatches,
    [{ field: 'commit.gpgsign', expected: 'true', actual: 'false' }],
  );
  // A key is reported once: the value git uses first
  assert.deepStrictEqual(
    compareSyncState(
      identity,
      createGitConfig({ ...values, 'user.signingkey': 'FFFF0000' }),
      false,
      'none',
      local({ 'user.signingkey': { kind: 'absent' } }),
    ).mismatches,
    [{ field: 'user.signingkey', expected: 'ABCD1234', actual: 'FFFF0000' }],
  );
  // A --local value that cannot be read: unknown
  assert.deepStrictEqual(compareSyncState(identity, merged, false, 'none', local({ 'gpg.format': { kind: 'error' } })), {
    state: 'unknown',
    mismatches: [],
  });
}

async function testCheckSyncSigningResidue(): Promise<void> {
  console.log('  Testing checkSync() reads leftovers only for an unsigned identity...');

  _resetCache();
  const store = createSigningRecordStore({ get: () => undefined, update: async () => undefined });
  const residueCalls: unknown[] = [];
  _setGitConfigReader(async () =>
    createGitConfig({ 'gpg.format': 'openpgp', 'user.signingkey': 'ABCD1234', 'commit.gpgsign': 'true' }),
  );
  _setSigningResidueDetector(async (givenStore) => {
    residueCalls.push(givenStore);
    return 'present';
  });
  const localCalls: string[] = [];
  _setLocalSigningReader(async () => {
    localCalls.push('local');
    return {
      'gpg.format': { kind: 'value', value: 'openpgp' },
      'user.signingkey': { kind: 'value', value: 'ABCD1234' },
      'commit.gpgsign': { kind: 'absent' },
    };
  });

  try {
    const unsigned = await checkSync(createIdentity(), { store, includeIconInGitConfig: false });
    assert.strictEqual(unsigned.state, 'out_of_sync');
    assert.deepStrictEqual(residueCalls, [store]);

    assert.deepStrictEqual(localCalls, [], 'an unsigned identity does not read the --local signing values');

    // A signing identity does not read leftovers, and checks its --local values
    const signing = await checkSync(createIdentity({ gpgKeyId: 'ABCD1234' }), { store, includeIconInGitConfig: false });
    assert.deepStrictEqual(signing.mismatches, [{ field: 'commit.gpgsign', expected: 'true', actual: '' }]);
    assert.strictEqual(residueCalls.length, 1);
    assert.deepStrictEqual(localCalls, ['local']);
  } finally {
    _setGitConfigReader(undefined);
    _setSigningResidueDetector(detectNoResidue);
    _setLocalSigningReader(undefined);
  }
}

// ============================================================================
// checkSync() Tests (async, uses mock git config reader)
// ============================================================================

async function testCheckSyncSynced(): Promise<void> {
  console.log('  Testing checkSync() synced...');

  _resetCache();
  _setGitConfigReader(async () => createGitConfig({ 'user.name': 'John Doe', 'user.email': 'john@example.com' }));

  try {
    const identity = createIdentity();
    const result = await checkSync(identity, { store: STORE, includeIconInGitConfig: false });

    assert.strictEqual(result.state, 'synced');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncOutOfSync(): Promise<void> {
  console.log('  Testing checkSync() out of sync...');

  _resetCache();
  _setGitConfigReader(async () => createGitConfig({ 'user.name': 'Wrong Name', 'user.email': 'wrong@example.com' }));

  try {
    const identity = createIdentity();
    const result = await checkSync(identity, { store: STORE, includeIconInGitConfig: false });

    assert.strictEqual(result.state, 'out_of_sync');
    assert.strictEqual(result.mismatches.length, 2);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncGitConfigReadFailure(): Promise<void> {
  console.log('  Testing checkSync() git config read failure → unknown...');

  _resetCache();
  _setGitConfigReader(async () => {
    throw new Error('git not found');
  });

  try {
    const identity = createIdentity();
    const result = await checkSync(identity, { store: STORE, includeIconInGitConfig: false });

    assert.strictEqual(result.state, 'unknown');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncWithCancellationBeforeStart(): Promise<void> {
  console.log('  Testing checkSync() with pre-cancelled token...');

  _resetCache();
  let isReaderCalled = false;
  _setGitConfigReader(async () => {
    isReaderCalled = true;
    return createGitConfig({ 'user.name': 'John', 'user.email': 'j@e.com' });
  });

  try {
    const identity = createIdentity();
    const token = { isCancellationRequested: true, onCancellationRequested: () => ({ dispose: () => {} }) };
    const result = await checkSync(identity, { store: STORE, includeIconInGitConfig: false, token });

    assert.strictEqual(result.state, 'unknown');
    assert.strictEqual(isReaderCalled, false);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncCancelledAfterRead(): Promise<void> {
  console.log('  Testing checkSync() cancelled after git config read...');

  _resetCache();
  const token = {
    isCancellationRequested: false,
    onCancellationRequested: () => ({ dispose: () => {} }),
  };
  _setGitConfigReader(async () => {
    // Simulate cancellation occurring during git config read
    token.isCancellationRequested = true;
    return createGitConfig({ 'user.name': 'John Doe', 'user.email': 'john@example.com' });
  });

  try {
    const identity = createIdentity();
    const result = await checkSync(identity, { store: STORE, includeIconInGitConfig: false, token });

    assert.strictEqual(result.state, 'unknown');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncFallsBackToSetting(): Promise<void> {
  console.log('  Testing checkSync() falls back to shouldIncludeIconInGitConfig...');

  _resetCache();
  _setGitConfigReader(async () => createGitConfig({ 'user.name': 'John Doe', 'user.email': 'john@example.com' }));

  try {
    const identity = createIdentity();
    // Pass undefined for includeIconInGitConfig to trigger fallback
    // With no VS Code API available, shouldIncludeIconInGitConfig() returns false
    const result = await checkSync(identity, { store: STORE });

    assert.strictEqual(result.state, 'synced');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncWithIconSetting(): Promise<void> {
  console.log('  Testing checkSync() with icon setting explicitly passed...');

  _resetCache();
  _setGitConfigReader(async () => createGitConfig({ 'user.name': '🏢 John Doe', 'user.email': 'john@example.com' }));

  try {
    const identity = createIdentity({ icon: '🏢' });
    // Explicitly pass includeIconInGitConfig=true
    const result = await checkSync(identity, { store: STORE, includeIconInGitConfig: true });

    assert.strictEqual(result.state, 'synced');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

// ============================================================================
// Test Runner
// ============================================================================

async function runTests(): Promise<void> {
  console.log('\n🔄 Running Sync Checker Tests...\n');

  // stripIcon tests
  console.log('stripIcon():');
  testStripIconNoIcon();
  testStripIconMatchingPrefix();
  testStripIconNoMatch();
  testStripIconEmptyString();
  testStripIconOnlyIcon();

  // compareSyncState tests
  console.log('\ncompareSyncState():');
  testCompareSyncStateSynced();
  testCompareSyncStateNameMismatch();
  testCompareSyncStateEmailMismatch();
  testCompareSyncStateMultipleMismatches();
  testCompareSyncStateGpgKeyMismatch();
  testCompareSyncStateGpgKeyMatch();
  testCompareSyncStateGpgKeyNotInGitConfig();
  testCompareSyncStateNoGpgKeyInIdentity();
  testCompareSyncStateUnknown();
  testCompareSyncStateWithIconEnabled();
  testCompareSyncStateWithIconEnabledButMismatch();
  testCompareSyncStateWithIconEnabledNoIdentityIcon();
  testCompareSyncStateWithIconDisabledButGitConfigHasIcon();
  testCompareSyncStatePartialGitConfigOnlyName();
  testCompareSyncStatePartialGitConfigOnlyEmail();
  testCompareSyncStateUnsetFieldMismatch();
  testCompareSyncStateSshSigning();
  testCompareSyncStateGpgFormatMismatch();
  testCompareSyncStateSigningResidue();
  testCompareSyncStateLocalSigning();

  // checkSync tests (async)
  console.log('\ncheckSync():');
  _setSigningResidueDetector(detectNoResidue);
  try {
    await testCheckSyncSynced();
    await testCheckSyncOutOfSync();
    await testCheckSyncGitConfigReadFailure();
    await testCheckSyncWithCancellationBeforeStart();
    await testCheckSyncCancelledAfterRead();
    await testCheckSyncFallsBackToSetting();
    await testCheckSyncWithIconSetting();
    await testCheckSyncSigningResidue();
  } finally {
    _setSigningResidueDetector(undefined);
  }

  console.log('\n✅ All Sync Checker Tests Passed!\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Sync checker test failed:', errorMessage);
    process.exit(1);
  });
}

export {
  testStripIconNoIcon,
  testStripIconMatchingPrefix,
  testStripIconNoMatch,
  testStripIconEmptyString,
  testStripIconOnlyIcon,
  testCompareSyncStateSynced,
  testCompareSyncStateNameMismatch,
  testCompareSyncStateEmailMismatch,
  testCompareSyncStateMultipleMismatches,
  testCompareSyncStateGpgKeyMismatch,
  testCompareSyncStateGpgKeyMatch,
  testCompareSyncStateGpgKeyNotInGitConfig,
  testCompareSyncStateNoGpgKeyInIdentity,
  testCompareSyncStateUnknown,
  testCompareSyncStateWithIconEnabled,
  testCompareSyncStateWithIconEnabledButMismatch,
  testCompareSyncStateWithIconEnabledNoIdentityIcon,
  testCompareSyncStateWithIconDisabledButGitConfigHasIcon,
  testCompareSyncStatePartialGitConfigOnlyName,
  testCompareSyncStatePartialGitConfigOnlyEmail,
  testCompareSyncStateUnsetFieldMismatch,
  testCheckSyncSynced,
  testCheckSyncOutOfSync,
  testCheckSyncGitConfigReadFailure,
  testCheckSyncWithCancellationBeforeStart,
  testCheckSyncCancelledAfterRead,
  testCheckSyncFallsBackToSetting,
  testCheckSyncWithIconSetting,
  runTests as runSyncCheckerTests,
};
