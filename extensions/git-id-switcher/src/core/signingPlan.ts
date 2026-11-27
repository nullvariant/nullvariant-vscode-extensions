/**
 * Commit Signing Plan
 *
 * Decides which `--local` git config operations a switch needs for the three
 * signing config keys (gpg.format, user.signingkey, commit.gpgsign), from the
 * values in the repository, the record of what the extension wrote before,
 * and the next identity's signing method.
 *
 * No I/O: reading and writing git config lives in repositoryConfigWriter.ts,
 * so the repository root and each submodule run the same plan. The only
 * outside input is the home directory, read by normalizeSigningKeyPath() to
 * expand `~/`.
 *
 * The three keys are handled as one group. The extension restores the values
 * it found before writing only when all three keys still hold what it wrote;
 * if the user changed any of them, the extension leaves all three alone, so the
 * signing method and the key never end up taken from different sources.
 */

import * as path from 'node:path';
import type { GpgFormat } from './constants';
import { SIGNING_FIELDS, SIGNING_FIELD_FORMATS, type Identity } from '../identity/identity';
import { expandTilde } from '../security/pathNormalizer';
import { isAllowedGitConfigValue } from '../security/gitConfigRules';
import type { ConfigOperation, ConfigReadResult, LocalValue } from './localGitConfig';

/** Signing config keys in the order they are written (the order is part of the design) */
export const SIGNING_CONFIG_KEYS = ['gpg.format', 'user.signingkey', 'commit.gpgsign'] as const;

export type SigningConfigKey = (typeof SIGNING_CONFIG_KEYS)[number];

/** The `--local` values of the three signing keys of a repository, as read */
export type LocalSigningValues = Readonly<Record<SigningConfigKey, ConfigReadResult>>;

/** What the extension found in a key before writing, and what it wrote */
export interface WrittenRecord {
  readonly before: LocalValue;
  readonly written: string;
}

/** Record for one repository: the three signing config keys, always together */
export type RepositoryRecord = Readonly<Record<SigningConfigKey, WrittenRecord>>;

/** How the next identity signs commits */
export interface SigningSpec {
  readonly gpgFormat: GpgFormat;
  /** GPG key ID, or the absolute SSH key path (see normalizeSigningKeyPath) */
  readonly signingKey: string;
}

export type SigningBlockReason = 'read-error' | 'unrestorable-value';

export type SigningPlan =
  | {
      readonly result: 'ok';
      readonly operations: readonly ConfigOperation<SigningConfigKey>[];
      /** The record to keep after the operations succeed (undefined = no record) */
      readonly record: RepositoryRecord | undefined;
    }
  | { readonly result: 'blocked'; readonly reason: SigningBlockReason; readonly key: SigningConfigKey };

/** Order for stopping signing: stop signing first, then the key, then the format */
const RESTORE_ORDER: readonly SigningConfigKey[] = ['commit.gpgsign', 'user.signingkey', 'gpg.format'];

/**
 * The value written to user.signingkey for an SSH key path: `~/` expanded and
 * the path normalized. Symlinks are not resolved, so replacing the link target
 * keeps meaning what the user configured. Sync Check compares against the same
 * form, and the value does not depend on whether the git version expands `~`.
 *
 * On Windows the separators are written as `/` (`C:/Users/...`): git's
 * documentation does not say which separator Git for Windows expects in
 * user.signingKey, so one form is written, and Sync Check compares against it.
 *
 * @param keyPath - The configured path (`~/...` or absolute)
 * @param pathApi - Path functions of the platform (path.win32 / path.posix in tests)
 */
export function normalizeSigningKeyPath(
  keyPath: string,
  pathApi: Pick<typeof path, 'normalize' | 'sep'> = path,
): string {
  const normalized = pathApi.normalize(expandTilde(keyPath));
  return pathApi.sep === '\\' ? normalized.replaceAll('\\', '/') : normalized;
}

/**
 * The signing method an identity asks for, or undefined when it does not sign.
 *
 * @throws Error if more than one signing field is set (validation rejects
 *   such identities before this is reached)
 */
export function resolveSigningSpec(identity: Readonly<Identity>): SigningSpec | undefined {
  const setFields = SIGNING_FIELDS.filter((field) => identity[field]);
  if (setFields.length > 1) {
    throw new Error(`${setFields.join(' and ')} cannot both be set`);
  }
  const field = setFields.at(0);
  if (field === undefined) {
    return undefined;
  }
  const gpgFormat = SIGNING_FIELD_FORMATS[field];
  const value = identity[field] as string;
  return { gpgFormat, signingKey: gpgFormat === 'ssh' ? normalizeSigningKeyPath(value) : value };
}

/** The values a signing identity needs in each key */
export function getDesiredSigningValues(spec: SigningSpec): Readonly<Record<SigningConfigKey, string>> {
  return {
    'gpg.format': spec.gpgFormat,
    'user.signingkey': spec.signingKey,
    'commit.gpgsign': 'true',
  };
}

function isSameValue(current: LocalValue, value: string): boolean {
  return current.kind === 'value' && current.value === value;
}

/** Whether all three keys still hold the values the record says were written */
export function hasWrittenValues(
  record: RepositoryRecord,
  local: Readonly<Record<SigningConfigKey, LocalValue>>,
): boolean {
  return SIGNING_CONFIG_KEYS.every((key) => isSameValue(local[key], record[key].written));
}

/**
 * The operation that puts a key back to a previous value.
 */
export function restoreOperation(key: SigningConfigKey, before: LocalValue): ConfigOperation<SigningConfigKey> {
  return before.kind === 'absent'
    ? { operation: 'unset', key }
    : { operation: 'set', key, value: before.value };
}

function planWrite(
  record: RepositoryRecord | undefined,
  local: Readonly<Record<SigningConfigKey, LocalValue>>,
  next: SigningSpec,
): SigningPlan {
  for (const key of SIGNING_CONFIG_KEYS) {
    const current = local[key];
    // A value the extension could not write back would be lost when the next
    // unsigned identity restores the previous values, so do not overwrite it.
    if (current.kind === 'value' && !isAllowedGitConfigValue(key, current.value)) {
      return { result: 'blocked', reason: 'unrestorable-value', key };
    }
  }

  const desired = getDesiredSigningValues(next);
  const isKeepingBefore = record !== undefined && hasWrittenValues(record, local);

  const operations: ConfigOperation<SigningConfigKey>[] = [];
  const entries = SIGNING_CONFIG_KEYS.map((key) => {
    if (!isSameValue(local[key], desired[key])) {
      operations.push({ operation: 'set', key, value: desired[key] });
    }
    const before = isKeepingBefore ? record[key].before : local[key];
    return [key, { before, written: desired[key] }] as const;
  });

  return { result: 'ok', operations, record: Object.fromEntries(entries) as RepositoryRecord };
}

function planRestore(
  record: RepositoryRecord | undefined,
  local: Readonly<Record<SigningConfigKey, LocalValue>>,
): SigningPlan {
  // No record: the values are the user's (or from a version that kept no
  // record), so they are not removed.
  // A record whose values the user changed: leave all three keys alone.
  if (record === undefined || !hasWrittenValues(record, local)) {
    return { result: 'ok', operations: [], record: undefined };
  }

  const operations = RESTORE_ORDER.flatMap((key): ConfigOperation<SigningConfigKey>[] => {
    const before = record[key].before;
    return before.kind === 'value' && isSameValue(local[key], before.value)
      ? []
      : [restoreOperation(key, before)];
  });
  return { result: 'ok', operations, record: undefined };
}

/**
 * The three values as read, or the first key whose read failed.
 */
export function toLocalValues(
  read: LocalSigningValues,
): Record<SigningConfigKey, LocalValue> | { readonly unreadableKey: SigningConfigKey } {
  const values: Partial<Record<SigningConfigKey, LocalValue>> = {};
  for (const key of SIGNING_CONFIG_KEYS) {
    const value = read[key];
    if (value.kind === 'error') {
      return { unreadableKey: key };
    }
    values[key] = value;
  }
  return values as Record<SigningConfigKey, LocalValue>;
}

/**
 * Plan the signing config for one repository.
 *
 * @param record - What the extension wrote before (undefined = no record)
 * @param local - The current `--local` values of the three keys
 * @param next - The next identity's signing method (undefined = does not sign)
 */
export function planSigningConfig(
  record: RepositoryRecord | undefined,
  local: LocalSigningValues,
  next: SigningSpec | undefined,
): SigningPlan {
  const current = toLocalValues(local);
  if ('unreadableKey' in current) {
    return { result: 'blocked', reason: 'read-error', key: current.unreadableKey };
  }
  return next === undefined ? planRestore(record, current) : planWrite(record, current, next);
}
