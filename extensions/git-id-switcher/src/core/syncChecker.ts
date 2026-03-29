/**
 * Sync Checker - Profile vs Git Config Synchronization Detection
 *
 * Detects mismatches between the selected identity profile and
 * the actual git config (user.name, user.email, user.signingkey).
 *
 * Design:
 * - compareSyncState() is a pure function for testability
 * - stripIcon() reverses buildGitUserName()'s icon prepend
 * - checkSync() orchestrates git config reading and comparison
 *
 * @sideeffect checkSync() executes `git config --local` via getCurrentGitConfig()
 */

import type * as vscodeTypes from 'vscode';
import type { Identity } from '../identity/identity';
import { type GitConfig, getCurrentGitConfig, shouldIncludeIconInGitConfig } from './gitConfig';

// ============================================================================
// Types
// ============================================================================

export type SyncState = 'synced' | 'out_of_sync' | 'unknown';

export interface SyncMismatch {
  field: 'name' | 'email' | 'signingKey';
  expected: string;
  actual: string;
}

export interface SyncCheckResult {
  state: SyncState;
  mismatches: SyncMismatch[];
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
  if (gitUserName.startsWith(prefix)) {
    return gitUserName.slice(prefix.length);
  }

  return gitUserName;
}

/**
 * Compare an identity profile against actual git config values.
 *
 * Pure function: no I/O, no side effects.
 *
 * @param identity - The selected identity profile
 * @param gitConfig - The actual git config values
 * @param includeIconInGitConfig - Whether icons are included in git config user.name
 * @returns SyncCheckResult with state and any mismatches
 */
export function compareSyncState(
  identity: Readonly<Identity>,
  gitConfig: Readonly<GitConfig>,
  includeIconInGitConfig: boolean,
): SyncCheckResult {
  // If git config is completely empty, state is unknown (likely not a git repo)
  if (gitConfig.userName === undefined && gitConfig.userEmail === undefined) {
    return { state: 'unknown', mismatches: [] };
  }

  const mismatches: SyncMismatch[] = [];

  // Compare user.name
  if (gitConfig.userName !== undefined) {
    const actualName = includeIconInGitConfig
      ? stripIcon(gitConfig.userName, identity.icon)
      : gitConfig.userName;

    if (actualName !== identity.name) {
      mismatches.push({
        field: 'name',
        expected: identity.name,
        actual: gitConfig.userName,
      });
    }
  }

  // Compare user.email
  if (gitConfig.userEmail !== undefined && gitConfig.userEmail !== identity.email) {
    mismatches.push({
      field: 'email',
      expected: identity.email,
      actual: gitConfig.userEmail,
    });
  }

  // Compare user.signingkey (only if identity has a GPG key configured)
  if (
    identity.gpgKeyId
    && gitConfig.signingKey !== undefined
    && gitConfig.signingKey !== identity.gpgKeyId
  ) {
    mismatches.push({
      field: 'signingKey',
      expected: identity.gpgKeyId,
      actual: gitConfig.signingKey,
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

/**
 * Override for getCurrentGitConfig, used in tests.
 * Not intended for production use.
 */
let gitConfigReaderOverride: GitConfigReader | undefined;

/**
 * Set a mock git config reader for testing.
 * Not intended for production use.
 */
export function _setGitConfigReader(reader: GitConfigReader | undefined): void {
  gitConfigReaderOverride = reader;
}

/**
 * Check synchronization between an identity profile and actual git config.
 *
 * @sideeffect Executes `git config --local` 3 times (user.name, user.email, user.signingkey)
 *
 * @param identity - The selected identity profile
 * @param includeIconInGitConfig - Whether icons are included in git config user.name
 * @param token - Optional cancellation token for aborting the operation
 * @returns SyncCheckResult indicating sync state and any mismatches
 */
export async function checkSync(
  identity: Readonly<Identity>,
  includeIconInGitConfig?: boolean,
  token?: vscodeTypes.CancellationToken,
): Promise<SyncCheckResult> {
  if (token?.isCancellationRequested) {
    return { state: 'unknown', mismatches: [] };
  }

  try {
    /* c8 ignore next - production path: test environment has no VS Code API */
    const readGitConfig = gitConfigReaderOverride ?? getCurrentGitConfig;
    const gitConfig = await readGitConfig(token);

    if (token?.isCancellationRequested) {
      return { state: 'unknown', mismatches: [] };
    }

    const iconSetting = includeIconInGitConfig ?? shouldIncludeIconInGitConfig();
    return compareSyncState(identity, gitConfig, iconSetting);
  } catch {
    // Git config read failure (not a git repo, git not installed, etc.)
    return { state: 'unknown', mismatches: [] };
  }
}
