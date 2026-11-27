/**
 * Sync Checker - Profile vs Git Config Synchronization Detection
 *
 * Detects mismatches between the selected identity profile and the actual
 * git config (user.name, user.email, and the signing keys gpg.format,
 * user.signingkey, commit.gpgsign).
 *
 * A value that is not set counts as a mismatch, gpg.format included: git
 * reads a missing gpg.format as openpgp, but the extension always writes it
 * for a signing identity, so a missing one was removed after the switch (and
 * a `--global gpg.format ssh` would then apply). A value that cannot be read
 * makes the state unknown. Neither is ever reported as synced.
 *
 * For a signing identity, the three signing keys must also hold the values
 * in the repository's `--local` config, where the extension writes them: the
 * same value in `--global` alone means the repository's own value was removed.
 *
 * Design:
 * - compareSyncState() is a pure function for testability
 * - stripIcon() reverses buildGitUserName()'s icon prepend
 * - checkSync() orchestrates git config reading and comparison
 *
 * @sideeffect checkSync() executes `git config` via getCurrentGitConfig() and detectWorkspaceSigningResidue()
 */

import type * as vscodeTypes from 'vscode';
import type { Identity } from '../identity/identity';
import type { GitConfigKey } from '../security/gitConfigRules';
import {
  type GitConfig,
  getCurrentGitConfig,
  detectWorkspaceSigningResidue,
  readWorkspaceLocalSigningValues,
  shouldIncludeIconInGitConfig,
} from './gitConfig';
import type { ConfigReadResult } from './localGitConfig';
import type { SigningRecordStore } from './signingRecordStore';
import type { SigningResidue } from './repositoryConfigWriter';
import { SIGNING_CONFIG_KEYS, getDesiredSigningValues, resolveSigningSpec, type LocalSigningValues } from './signingPlan';

// ============================================================================
// Types
// ============================================================================

export type SyncState = 'synced' | 'out_of_sync' | 'unknown';

export interface SyncMismatch {
  /** The git config key, or signing values the extension wrote and did not put back */
  field: GitConfigKey | 'signingResidue';
  expected: string;
  actual: string;
}

export interface SyncCheckResult {
  state: SyncState;
  mismatches: SyncMismatch[];
}

function unknownResult(): SyncCheckResult {
  return { state: 'unknown', mismatches: [] };
}

// ============================================================================
// Pure Functions (no side effects, fully testable)
// ============================================================================

/**
 * Strip leading emoji icon from a git user.name value.
 *
 * Reverses the transformation applied by buildGitUserName():
 *   `${identity.icon} ${identity.name}` → `identity.name`
 *
 * The icon is always a single grapheme cluster followed by a space.
 * We detect this by checking if the first space-separated token
 * matches the identity's icon.
 *
 * @param gitUserName - The user.name value from git config
 * @param icon - The identity's icon (emoji), or undefined if no icon
 * @returns The user.name with icon stripped, or unchanged if no icon match
 */
export function stripIcon(gitUserName: string, icon: string | undefined): string {
  if (!icon) {
    return gitUserName;
  }

  const prefix = `${icon} `;
  return gitUserName.startsWith(prefix) ? gitUserName.slice(prefix.length) : gitUserName;
}

/** The value as shown in a mismatch ('' when not set) */
function displayValue(read: ConfigReadResult): string {
  return read.kind === 'value' ? read.value : '';
}

function compareValue(
  field: SyncMismatch['field'],
  expected: string,
  read: ConfigReadResult,
  normalize: (value: string) => string,
  mismatches: SyncMismatch[],
): void {
  if (read.kind !== 'value' || normalize(read.value) !== expected) {
    mismatches.push({ field, expected, actual: displayValue(read) });
  }
}

const unchanged = (value: string): string => value;

/**
 * Compare an identity profile against actual git config values.
 *
 * Pure function: no I/O, no side effects.
 *
 * @param identity - The selected identity profile
 * @param gitConfig - The actual (effective) git config values
 * @param includeIconInGitConfig - Whether icons are included in git config user.name
 * @param signingResidue - For an unsigned identity: whether signing values the
 *   extension wrote are still in the repository ('none' when not checked)
 * @param localSigning - For a signing identity: the `--local` values of the
 *   three signing keys (undefined when not checked)
 * @returns SyncCheckResult with state and any mismatches
 */
export function compareSyncState(
  identity: Readonly<Identity>,
  gitConfig: Readonly<GitConfig>,
  includeIconInGitConfig: boolean,
  signingResidue: SigningResidue = 'none',
  localSigning?: LocalSigningValues,
): SyncCheckResult {
  const reads = [...Object.values<ConfigReadResult>(gitConfig), ...Object.values<ConfigReadResult>(localSigning ?? {})];
  if (signingResidue === 'error' || reads.some((read) => read.kind === 'error')) {
    return unknownResult();
  }

  const mismatches: SyncMismatch[] = [];

  compareValue(
    'user.name',
    identity.name,
    gitConfig['user.name'],
    (value) => (includeIconInGitConfig ? stripIcon(value, identity.icon) : value),
    mismatches,
  );
  compareValue('user.email', identity.email, gitConfig['user.email'], unchanged, mismatches);

  const signing = resolveSigningSpec(identity);
  if (signing) {
    const desired = getDesiredSigningValues(signing);
    // A missing gpg.format is a mismatch: the extension writes it explicitly.
    // Only 'true' matches commit.gpgsign: git's other spellings (yes, on, 1)
    // are not what the extension writes. Each key is reported once: the value
    // git uses first, then the repository's own (`--local`) value.
    for (const key of SIGNING_CONFIG_KEYS) {
      const before = mismatches.length;
      compareValue(key, desired[key], gitConfig[key], unchanged, mismatches);
      if (localSigning && mismatches.length === before) {
        compareValue(key, desired[key], localSigning[key], unchanged, mismatches);
      }
    }
  } else if (signingResidue === 'present') {
    // An unsigned identity leaves signing to the user's own config, but values
    // the extension wrote for a previous identity should have been put back.
    mismatches.push({
      field: 'signingResidue',
      expected: '',
      actual: SIGNING_CONFIG_KEYS.join(', '),
    });
  }

  return {
    state: mismatches.length === 0 ? 'synced' : 'out_of_sync',
    mismatches,
  };
}

// ============================================================================
// Side-effecting Functions
// ============================================================================

type GitConfigReader = (token?: vscodeTypes.CancellationToken) => Promise<GitConfig>;
type SigningResidueDetector = (store: SigningRecordStore) => Promise<SigningResidue>;
type LocalSigningReader = () => Promise<LocalSigningValues>;

/**
 * Overrides for the git config readers, used in tests.
 * Not intended for production use.
 */
let gitConfigReaderOverride: GitConfigReader | undefined;
let signingResidueDetectorOverride: SigningResidueDetector | undefined;
let localSigningReaderOverride: LocalSigningReader | undefined;

/**
 * Set a mock git config reader for testing.
 * Not intended for production use.
 */
export function _setGitConfigReader(reader: GitConfigReader | undefined): void {
  gitConfigReaderOverride = reader;
}

/**
 * Set a mock signing residue detector for testing.
 * Not intended for production use.
 */
export function _setSigningResidueDetector(detector: SigningResidueDetector | undefined): void {
  signingResidueDetectorOverride = detector;
}

/**
 * Set a mock reader of the `--local` signing values for testing.
 * Not intended for production use.
 */
export function _setLocalSigningReader(reader: LocalSigningReader | undefined): void {
  localSigningReaderOverride = reader;
}

export interface SyncCheckOptions {
  /** Record of the signing config the extension wrote (to find leftover values) */
  readonly store: SigningRecordStore;
  /** Whether icons are included in git config user.name (default: the setting) */
  readonly includeIconInGitConfig?: boolean;
  /** Cancellation token for aborting the operation */
  readonly token?: vscodeTypes.CancellationToken;
}

/**
 * Check synchronization between an identity profile and actual git config.
 *
 * @sideeffect Executes `git config` for each compared key, and for an unsigned
 *   identity reads the `--local` signing keys to look for leftover values
 *
 * @param identity - The selected identity profile
 * @param options - The record store, the icon setting and a cancellation token
 * @returns SyncCheckResult indicating sync state and any mismatches
 */
export async function checkSync(
  identity: Readonly<Identity>,
  options: SyncCheckOptions,
): Promise<SyncCheckResult> {
  const { store, includeIconInGitConfig, token } = options;
  if (token?.isCancellationRequested) {
    return unknownResult();
  }

  try {
    /* c8 ignore next 3 - production path: test environment has no VS Code API */
    const readGitConfig = gitConfigReaderOverride ?? getCurrentGitConfig;
    const detectResidue = signingResidueDetectorOverride ?? detectWorkspaceSigningResidue;
    const readLocalSigning = localSigningReaderOverride ?? readWorkspaceLocalSigningValues;
    const gitConfig = await readGitConfig(token);
    const isSigning = resolveSigningSpec(identity) !== undefined;
    const signingResidue = isSigning ? 'none' : await detectResidue(store);
    const localSigning = isSigning ? await readLocalSigning() : undefined;

    if (token?.isCancellationRequested) {
      return unknownResult();
    }

    const isIconSetting = includeIconInGitConfig ?? shouldIncludeIconInGitConfig();
    return compareSyncState(identity, gitConfig, isIconSetting, signingResidue, localSigning);
  } catch {
    // Git config read failure (not a git repo, git not installed, etc.)
    return unknownResult();
  }
}
