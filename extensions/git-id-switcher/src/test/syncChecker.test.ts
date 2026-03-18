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
 * - GPG key in identity but not in git config → synced (not yet set)
 * - No GPG key in identity → signing key ignored
 * - Unknown state (git config empty)
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
import {
  stripIcon,
  compareSyncState,
  checkSync,
  _setGitConfigReader,
} from '../core/syncChecker';
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

function createGitConfig(overrides: Partial<GitConfig> = {}): GitConfig {
  return {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    signingKey: undefined,
    ...overrides,
  };
}

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
  const gitConfig = createGitConfig({ userName: 'Jane Doe' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'name');
  assert.strictEqual(result.mismatches[0].expected, 'John Doe');
  assert.strictEqual(result.mismatches[0].actual, 'Jane Doe');
}

function testCompareSyncStateEmailMismatch(): void {
  console.log('  Testing compareSyncState() email mismatch...');

  const identity = createIdentity({ email: 'john@example.com' });
  const gitConfig = createGitConfig({ userEmail: 'john@other.com' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'email');
  assert.strictEqual(result.mismatches[0].expected, 'john@example.com');
  assert.strictEqual(result.mismatches[0].actual, 'john@other.com');
}

function testCompareSyncStateMultipleMismatches(): void {
  console.log('  Testing compareSyncState() multiple mismatches...');

  const identity = createIdentity({ name: 'John Doe', email: 'john@example.com' });
  const gitConfig = createGitConfig({ userName: 'Jane Doe', userEmail: 'jane@other.com' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 2);

  const fields = new Set(result.mismatches.map(m => m.field));
  assert.ok(fields.has('name'));
  assert.ok(fields.has('email'));
}

function testCompareSyncStateGpgKeyMismatch(): void {
  console.log('  Testing compareSyncState() GPG key mismatch...');

  const identity = createIdentity({ gpgKeyId: 'ABCD1234' });
  const gitConfig = createGitConfig({ signingKey: 'EFGH5678' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'signingKey');
  assert.strictEqual(result.mismatches[0].expected, 'ABCD1234');
  assert.strictEqual(result.mismatches[0].actual, 'EFGH5678');
}

function testCompareSyncStateGpgKeyMatch(): void {
  console.log('  Testing compareSyncState() GPG key match...');

  const identity = createIdentity({ gpgKeyId: 'ABCD1234' });
  const gitConfig = createGitConfig({ signingKey: 'ABCD1234' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateGpgKeyNotInGitConfig(): void {
  console.log('  Testing compareSyncState() GPG key in identity but not in git config...');

  // Identity has GPG key but git config doesn't have signingKey set
  // This is not a mismatch - the key might not be set yet
  const identity = createIdentity({ gpgKeyId: 'ABCD1234' });
  const gitConfig = createGitConfig({ signingKey: undefined });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateNoGpgKeyInIdentity(): void {
  console.log('  Testing compareSyncState() no GPG key in identity...');

  // Identity has no GPG key, git config has one → should be ignored
  const identity = createIdentity();
  const gitConfig = createGitConfig({ signingKey: 'ABCD1234' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateUnknown(): void {
  console.log('  Testing compareSyncState() unknown state (empty git config)...');

  const identity = createIdentity();
  const gitConfig: GitConfig = {
    userName: undefined,
    userEmail: undefined,
    signingKey: undefined,
  };

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'unknown');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateWithIconEnabled(): void {
  console.log('  Testing compareSyncState() with includeIconInGitConfig enabled...');

  const identity = createIdentity({ icon: '🏢', name: 'John Doe' });
  // Git config has icon prepended (as buildGitUserName would produce)
  const gitConfig = createGitConfig({ userName: '🏢 John Doe' });

  const result = compareSyncState(identity, gitConfig, true);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateWithIconEnabledButMismatch(): void {
  console.log('  Testing compareSyncState() with icon enabled but name mismatch...');

  const identity = createIdentity({ icon: '🏢', name: 'John Doe' });
  // Git config has icon but different name
  const gitConfig = createGitConfig({ userName: '🏢 Jane Doe' });

  const result = compareSyncState(identity, gitConfig, true);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'name');
  assert.strictEqual(result.mismatches[0].expected, 'John Doe');
  // actual should show the raw git config value
  assert.strictEqual(result.mismatches[0].actual, '🏢 Jane Doe');
}

function testCompareSyncStateWithIconEnabledNoIdentityIcon(): void {
  console.log('  Testing compareSyncState() with icon enabled but identity has no icon...');

  // Identity has no icon, so includeIconInGitConfig has no effect
  const identity = createIdentity({ name: 'John Doe' });
  const gitConfig = createGitConfig({ userName: 'John Doe' });

  const result = compareSyncState(identity, gitConfig, true);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateWithIconDisabledButGitConfigHasIcon(): void {
  console.log('  Testing compareSyncState() with icon disabled but git config has icon...');

  // includeIconInGitConfig is false, but someone manually set icon in git config
  const identity = createIdentity({ icon: '🏢', name: 'John Doe' });
  const gitConfig = createGitConfig({ userName: '🏢 John Doe' });

  // When icon setting is off, no icon stripping → mismatch
  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'name');
}

function testCompareSyncStatePartialGitConfigOnlyName(): void {
  console.log('  Testing compareSyncState() partial git config (only userName)...');

  const identity = createIdentity();
  const gitConfig: GitConfig = {
    userName: 'John Doe',
    userEmail: undefined,
    signingKey: undefined,
  };

  // userName matches, email is undefined → no email mismatch
  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStatePartialGitConfigOnlyEmail(): void {
  console.log('  Testing compareSyncState() partial git config (only userEmail)...');

  const identity = createIdentity();
  const gitConfig: GitConfig = {
    userName: undefined,
    userEmail: 'john@example.com',
    signingKey: undefined,
  };

  // userName is undefined, email matches → no mismatch
  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'synced');
  assert.strictEqual(result.mismatches.length, 0);
}

function testCompareSyncStateUnsetFieldMismatch(): void {
  console.log('  Testing compareSyncState() git config field set but identity field different...');

  const identity = createIdentity({ name: 'John Doe' });
  const gitConfig = createGitConfig({ userName: 'Different Name', userEmail: 'john@example.com' });

  const result = compareSyncState(identity, gitConfig, false);

  assert.strictEqual(result.state, 'out_of_sync');
  assert.strictEqual(result.mismatches.length, 1);
  assert.strictEqual(result.mismatches[0].field, 'name');
}

// ============================================================================
// checkSync() Tests (async, uses mock git config reader)
// ============================================================================

async function testCheckSyncSynced(): Promise<void> {
  console.log('  Testing checkSync() synced...');

  _resetCache();
  _setGitConfigReader(async () => ({
    userName: 'John Doe',
    userEmail: 'john@example.com',
    signingKey: undefined,
  }));

  try {
    const identity = createIdentity();
    const result = await checkSync(identity, false);

    assert.strictEqual(result.state, 'synced');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncOutOfSync(): Promise<void> {
  console.log('  Testing checkSync() out of sync...');

  _resetCache();
  _setGitConfigReader(async () => ({
    userName: 'Wrong Name',
    userEmail: 'wrong@example.com',
    signingKey: undefined,
  }));

  try {
    const identity = createIdentity();
    const result = await checkSync(identity, false);

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
    const result = await checkSync(identity, false);

    assert.strictEqual(result.state, 'unknown');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncWithCancellationBeforeStart(): Promise<void> {
  console.log('  Testing checkSync() with pre-cancelled token...');

  _resetCache();
  let readerCalled = false;
  _setGitConfigReader(async () => {
    readerCalled = true;
    return { userName: 'John', userEmail: 'j@e.com', signingKey: undefined };
  });

  try {
    const identity = createIdentity();
    const token = { isCancellationRequested: true, onCancellationRequested: () => ({ dispose: () => {} }) };
    const result = await checkSync(identity, false, token as any);

    assert.strictEqual(result.state, 'unknown');
    assert.strictEqual(readerCalled, false);
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
    return { userName: 'John Doe', userEmail: 'john@example.com', signingKey: undefined };
  });

  try {
    const identity = createIdentity();
    const result = await checkSync(identity, false, token as any);

    assert.strictEqual(result.state, 'unknown');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncFallsBackToSetting(): Promise<void> {
  console.log('  Testing checkSync() falls back to shouldIncludeIconInGitConfig...');

  _resetCache();
  _setGitConfigReader(async () => ({
    userName: 'John Doe',
    userEmail: 'john@example.com',
    signingKey: undefined,
  }));

  try {
    const identity = createIdentity();
    // Pass undefined for includeIconInGitConfig to trigger fallback
    // With no VS Code API available, shouldIncludeIconInGitConfig() returns false
    const result = await checkSync(identity);

    assert.strictEqual(result.state, 'synced');
    assert.strictEqual(result.mismatches.length, 0);
  } finally {
    _setGitConfigReader(undefined);
  }
}

async function testCheckSyncWithIconSetting(): Promise<void> {
  console.log('  Testing checkSync() with icon setting explicitly passed...');

  _resetCache();
  _setGitConfigReader(async () => ({
    userName: '🏢 John Doe',
    userEmail: 'john@example.com',
    signingKey: undefined,
  }));

  try {
    const identity = createIdentity({ icon: '🏢' });
    // Explicitly pass includeIconInGitConfig=true
    const result = await checkSync(identity, true);

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

  // checkSync tests (async)
  console.log('\ncheckSync():');
  await testCheckSyncSynced();
  await testCheckSyncOutOfSync();
  await testCheckSyncGitConfigReadFailure();
  await testCheckSyncWithCancellationBeforeStart();
  await testCheckSyncCancelledAfterRead();
  await testCheckSyncFallsBackToSetting();
  await testCheckSyncWithIconSetting();

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
