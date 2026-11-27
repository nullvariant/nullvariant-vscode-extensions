/**
 * Write an Identity to One Repository
 *
 * Writes user.name, user.email and the signing config planned by
 * signingPlan.ts to one repository, keeps the record of what was written, and
 * puts the values back if a write fails part way.
 *
 * The workspace root and each submodule go through the same function, so
 * signing config is written in one place only.
 *
 * Another process changing the same git config while a switch runs (a
 * terminal, another window) is outside what this guards against: git config
 * has no compare-and-set, and such a process could change the values anyway.
 */

import { isAllowedGitConfigOperation, type GitConfigKey } from '../security/gitConfigRules';
import { createConfigError, createSecurityViolationError } from './errors';
import { localize } from './vscodeLoader';
import type { ConfigOperation, LocalGitConfigPort, LocalValue } from './localGitConfig';
import type { SigningRecordStore } from './signingRecordStore';
import {
  SIGNING_CONFIG_KEYS,
  hasWrittenValues,
  planSigningConfig,
  toLocalValues,
  type LocalSigningValues,
  type RepositoryRecord,
  type SigningBlockReason,
  type SigningConfigKey,
  type SigningSpec,
} from './signingPlan';
import { checkSigningKey, type SigningKeyCheckDependencies, type SigningKeyCheckResult } from '../ssh/signingKeyCheck';
import { MIN_GIT_VERSION_FOR_SSH_SIGNING } from './constants';

export type ApplyResult =
  | { readonly result: 'ok' }
  | {
      /** Stopped before anything was written */
      readonly result: 'blocked';
      readonly reason: SigningBlockReason;
      /** The key that could not be read, or holds a value that cannot be restored */
      readonly key: GitConfigKey;
    }
  | {
      /** A write failed part way, or the record of the values could not be stored */
      readonly result: 'failed';
      /** The key that failed to be written (none when the record could not be stored) */
      readonly key?: GitConfigKey;
      /** Whether every value written before the failure was put back */
      readonly isRolledBack: boolean;
    };

interface ExecutedOperation {
  readonly key: GitConfigKey;
  readonly before: LocalValue;
}

/**
 * Run one operation; whether it changed git config as asked.
 */
function didApplyOperation(port: LocalGitConfigPort, operation: ConfigOperation): Promise<boolean> {
  return operation.operation === 'set' ? port.set(operation.key, operation.value) : port.unset(operation.key);
}

/**
 * Store the record; false when the store cannot be written.
 */
async function didStoreRecord(
  store: SigningRecordStore,
  repositoryPath: string,
  record: RepositoryRecord | undefined,
): Promise<boolean> {
  try {
    await store.set(repositoryPath, record);
    return true;
  } catch {
    return false;
  }
}

/** Read the `--local` values of the three signing keys */
export async function readSigningValues(port: LocalGitConfigPort): Promise<LocalSigningValues> {
  const [gpgFormat, userSigningKey, commitGpgSign] = await Promise.all(
    SIGNING_CONFIG_KEYS.map((key) => port.get(key)),
  );
  return { 'gpg.format': gpgFormat, 'user.signingkey': userSigningKey, 'commit.gpgsign': commitGpgSign };
}

/**
 * The record after a rollback that did not put everything back, from the
 * values in the repository: the record that matches all three values (the
 * new one or the old one), or no record when they are a mix, so they are
 * treated as the user's and never removed automatically.
 */
async function rebuildRecord(
  port: LocalGitConfigPort,
  candidates: readonly (RepositoryRecord | undefined)[],
): Promise<RepositoryRecord | undefined> {
  const local = toLocalValues(await readSigningValues(port));
  return 'unreadableKey' in local
    ? undefined
    : candidates.find(
        (candidate): candidate is RepositoryRecord => candidate !== undefined && hasWrittenValues(candidate, local),
      );
}

/**
 * Put back one executed operation.
 *
 * A key that was not set before and has no unset in the git config rules
 * (user.name, user.email) cannot be put back; it stays written.
 *
 * @returns Whether the key holds its previous value afterwards
 */
async function didPutBack(port: LocalGitConfigPort, { key, before }: ExecutedOperation): Promise<boolean> {
  return before.kind === 'value'
    ? port.set(key, before.value)
    : isAllowedGitConfigOperation(key, 'unset', 'local') && (await port.unset(key));
}

/**
 * Put back the executed operations in reverse order.
 *
 * @returns Whether every operation was put back
 */
async function didRollBack(port: LocalGitConfigPort, executed: readonly ExecutedOperation[]): Promise<boolean> {
  let isComplete = true;
  for (let index = executed.length - 1; index >= 0; index--) {
    isComplete = (await didPutBack(port, executed[index])) && isComplete;
  }
  return isComplete;
}

type CurrentValues =
  | {
      readonly result: 'read';
      /** Every key the switch may write, as read before writing */
      readonly values: Readonly<Record<GitConfigKey, LocalValue>>;
      readonly signing: Readonly<Record<SigningConfigKey, LocalValue>>;
    }
  | { readonly result: 'blocked'; readonly reason: 'read-error'; readonly key: GitConfigKey };

/**
 * Read every key a switch may write; the first key that cannot be read stops it.
 */
async function readCurrentValues(port: LocalGitConfigPort): Promise<CurrentValues> {
  const [userName, userEmail, signingReads] = await Promise.all([
    port.get('user.name'),
    port.get('user.email'),
    readSigningValues(port),
  ]);
  for (const [key, value] of [['user.name', userName], ['user.email', userEmail]] as const) {
    if (value.kind === 'error') {
      return { result: 'blocked', reason: 'read-error', key };
    }
  }
  const signing = toLocalValues(signingReads);
  if ('unreadableKey' in signing) {
    return { result: 'blocked', reason: 'read-error', key: signing.unreadableKey };
  }
  return {
    result: 'read',
    values: { 'user.name': userName as LocalValue, 'user.email': userEmail as LocalValue, ...signing },
    signing,
  };
}

/**
 * Apply an identity to one repository.
 *
 * Order: read every value first; plan; write user.name, user.email, then the
 * signing operations; then store the new record. If a write fails, or the
 * record cannot be stored (the values written could then not be put back
 * later), the writes are put back in reverse order and the old record is
 * kept; if putting back is not complete, the record is rebuilt from the
 * values in the repository.
 *
 * @sideeffect Writes `--local` git config through the port and the record store
 */
export async function applyIdentityToRepository(
  port: LocalGitConfigPort,
  store: SigningRecordStore,
  repositoryPath: string,
  userName: string,
  userEmail: string,
  next: SigningSpec | undefined,
): Promise<ApplyResult> {
  const current = await readCurrentValues(port);
  if (current.result === 'blocked') {
    return current;
  }
  const oldRecord = store.get(repositoryPath);
  const plan = planSigningConfig(oldRecord, current.signing, next);
  if (plan.result === 'blocked') {
    return { result: 'blocked', reason: plan.reason, key: plan.key };
  }

  const operations: ConfigOperation[] = [
    { operation: 'set', key: 'user.name', value: userName },
    { operation: 'set', key: 'user.email', value: userEmail },
    ...plan.operations,
  ];
  const executed: ExecutedOperation[] = [];
  const rollBack = async (key?: GitConfigKey): Promise<ApplyResult> => {
    const isRolledBack = await didRollBack(port, executed);
    // The old record is still stored: only an incomplete rollback changes it
    if (!isRolledBack) {
      await didStoreRecord(store, repositoryPath, await rebuildRecord(port, [plan.record, oldRecord]));
    }
    return { result: 'failed', key, isRolledBack };
  };
  for (const operation of operations) {
    if (!(await didApplyOperation(port, operation))) {
      return rollBack(operation.key);
    }
    executed.push({ key: operation.key, before: current.values[operation.key] });
  }
  return (await didStoreRecord(store, repositoryPath, plan.record)) ? { result: 'ok' } : rollBack();
}

/** Whether signing values the extension wrote are still in a repository */
export type SigningResidue = 'present' | 'none' | 'error';

/**
 * Whether the repository still holds signing values the extension wrote that
 * an unsigned identity would put back (Sync Check reports this as a mismatch).
 *
 * @returns 'error' when the values cannot be read
 */
export async function detectSigningResidue(
  port: LocalGitConfigPort,
  store: SigningRecordStore,
  repositoryPath: string,
): Promise<SigningResidue> {
  const record = store.get(repositoryPath);
  if (record === undefined) {
    return 'none';
  }
  const plan = planSigningConfig(record, await readSigningValues(port), undefined);
  if (plan.result === 'blocked') {
    return 'error';
  }
  return plan.operations.length > 0 ? 'present' : 'none';
}

/**
 * Combine the residue of several repositories: any error makes the result
 * unknown, otherwise any leftover value counts.
 */
export function combineSigningResidue(residues: readonly SigningResidue[]): SigningResidue {
  if (residues.includes('error')) {
    return 'error';
  }
  return residues.includes('present') ? 'present' : 'none';
}

/**
 * Tidy the records at startup: the record of a repository that is gone (the
 * folder, or its `.git`) is removed, and so is stored data that cannot be
 * read as a record.
 *
 * @param isGone - Whether a recorded repository is gone (false when that cannot be told)
 * @sideeffect Writes the store
 */
export async function maintainSigningRecords(
  store: SigningRecordStore,
  isGone: (repositoryPath: string) => Promise<boolean>,
): Promise<void> {
  const repositoryPaths = store.repositoryPaths();
  // The repositories are looked at together; the records are removed one at
  // a time, since each write replaces all the stored records
  const toRemove = await Promise.all(
    repositoryPaths.map(async (repositoryPath) => store.get(repositoryPath) === undefined || isGone(repositoryPath)),
  );
  for (const [index, repositoryPath] of repositoryPaths.entries()) {
    if (toRemove[index]) {
      await store.set(repositoryPath, undefined);
    }
  }
}

// ============================================================================
// Messages and checks before writing
// ============================================================================

const SIGNING_KEY_MESSAGES: Readonly<Record<Extract<SigningKeyCheckResult, { result: 'failed' }>['reason'], string>> = {
  'not-a-key-file': 'SSH signing key file validation failed',
  'insecure-permissions': 'SSH signing key file validation failed',
  'public-key-unknown':
    'The public key of the SSH signing key could not be read without a passphrase, so Git config was not changed. Set sshSigningKeyPath to its public key file (.pub) and add the key to ssh-agent.',
  'sign-failed':
    'Could not sign with the SSH signing key, so Git config was not changed. A key with a passphrase must be in ssh-agent.',
  'other-key':
    'The SSH signing key signed with another key than the one in sshSigningKeyPath (check the .pub file next to it), so Git config was not changed.',
};

/**
 * Check, before git is told to use it, that an SSH signing key signs with the
 * key it names (see signingKeyCheck.ts). A GPG key is not checked.
 *
 * @throws SecurityError if the key does not pass the check
 * @sideeffect Runs ssh-keygen and stores a passed check (see checkSigningKey)
 */
export async function assertSigningKeyUsable(
  signing: SigningSpec | undefined,
  deps: SigningKeyCheckDependencies,
): Promise<void> {
  if (signing?.gpgFormat !== 'ssh') {
    return;
  }
  const check = await checkSigningKey(signing.signingKey, deps);
  if (check.result === 'failed') {
    throw createSecurityViolationError(localize(SIGNING_KEY_MESSAGES[check.reason]), {
      field: 'sshSigningKeyPath',
      context: { reason: check.reason },
    });
  }
}

/** What the output of `git --version` starts with */
const GIT_VERSION_PREFIX = 'git version ';

/** Whether a version part is digits only (Number('') is 0, and Number('1e1') is 10) */
function isDigits(part: string): boolean {
  return part !== '' && [...part].every((char) => char >= '0' && char <= '9');
}

/**
 * The version (major, minor) in the output of `git --version`
 * ("git version 2.50.1 (Apple Git-155)", "git version 2.45.1.windows.1"),
 * or undefined when the output is not of that form.
 */
export function parseGitVersion(output: string): readonly [number, number] | undefined {
  const text = output.trim();
  if (!text.startsWith(GIT_VERSION_PREFIX)) {
    return undefined;
  }
  const [major = '', minor = ''] = text.slice(GIT_VERSION_PREFIX.length).split('.', 2);
  return isDigits(major) && isDigits(minor) ? [Number(major), Number(minor)] : undefined;
}

/**
 * Check, before SSH signing config is written, that git can sign with it
 * (git 2.34 or later). Other signing is not checked.
 *
 * @param readGitVersion - The output of `git --version`
 * @throws ConfigError if git is older, or its version cannot be read
 */
export async function assertGitSupportsSigning(
  signing: SigningSpec | undefined,
  readGitVersion: () => Promise<string>,
): Promise<void> {
  if (signing?.gpgFormat !== 'ssh') {
    return;
  }
  const version = parseGitVersion(await readGitVersion());
  const [minMajor, minMinor] = MIN_GIT_VERSION_FOR_SSH_SIGNING;
  const isSupported = version !== undefined && (version[0] > minMajor || (version[0] === minMajor && version[1] >= minMinor));
  if (!isSupported) {
    throw createConfigError(
      localize('Signing with an SSH key needs Git {0} or later, so Git config was not changed. Update Git and try again.', MIN_GIT_VERSION_FOR_SSH_SIGNING.join('.')),
      { field: 'sshSigningKeyPath', context: { reason: 'git-too-old' } },
    );
  }
}

/**
 * Turn an apply that did not succeed into a user-facing error.
 */
export function createApplyError(result: Exclude<ApplyResult, { result: 'ok' }>): Error {
  if (result.result === 'failed') {
    return createConfigError(
      result.isRolledBack
        ? localize('Failed to update Git config. The previous values were restored.')
        : localize('Failed to update Git config, and some previous values could not be restored.'),
      { field: result.key, context: { isRolledBack: result.isRolledBack } },
    );
  }
  const details = { field: result.key, context: { reason: result.reason } };
  const message = result.reason === 'unrestorable-value'
    ? localize(
        "The repository's Git config has a value for {0} that Git ID Switcher cannot restore. Remove it from the repository's config and try again.",
        result.key,
      )
    : localize("Could not read the repository's Git config; nothing was changed.");
  return createConfigError(message, details);
}
