/**
 * Record of the Signing Config the Extension Wrote
 *
 * Keeps, per repository (absolute path of the workspace root or a submodule),
 * what the extension found in the three signing config keys before writing
 * and what it wrote. Stored in the workspace state, so git's config allowlist
 * does not need to grow to hold it.
 *
 * Values read back from storage are checked before use: anything that does
 * not have the expected shape is treated as no record, so the extension never
 * removes values based on data it cannot vouch for.
 */

import type { LocalValue } from './localGitConfig';
import type { MementoPort } from './mementoPort';
import { SIGNING_CONFIG_KEYS, type RepositoryRecord, type WrittenRecord } from './signingPlan';
import { isPlainObject } from '../validators/common';

/** Storage key in the workspace state */
export const SIGNING_RECORD_STATE_KEY = 'gitIdSwitcher.signingRecords';

export interface SigningRecordStore {
  get(repositoryPath: string): RepositoryRecord | undefined;
  set(repositoryPath: string, record: RepositoryRecord | undefined): Promise<void>;
  /** Repository paths that have stored data (a record, or data of another shape) */
  repositoryPaths(): string[];
}

function isLocalValue(value: unknown): value is LocalValue {
  return (
    isPlainObject(value) &&
    (value.kind === 'absent' || (value.kind === 'value' && typeof value.value === 'string'))
  );
}

function isWrittenRecord(value: unknown): value is WrittenRecord {
  return isPlainObject(value) && isLocalValue(value.before) && typeof value.written === 'string';
}

/** Whether a stored value is a complete record of the three signing config keys */
export function isRepositoryRecord(value: unknown): value is RepositoryRecord {
  return isPlainObject(value) && SIGNING_CONFIG_KEYS.every((key) => isWrittenRecord(value[key]));
}

function readAll(memento: MementoPort): Record<string, unknown> {
  const stored = memento.get<unknown>(SIGNING_RECORD_STATE_KEY);
  return isPlainObject(stored) ? stored : {};
}

/**
 * Create a record store backed by a Memento (VS Code's workspace state).
 *
 * @sideeffect set() writes to the Memento
 */
export function createSigningRecordStore(memento: MementoPort): SigningRecordStore {
  return {
    get: (repositoryPath): RepositoryRecord | undefined => {
      const stored = readAll(memento)[repositoryPath];
      return isRepositoryRecord(stored) ? stored : undefined;
    },
    set: async (repositoryPath, record): Promise<void> => {
      const others = Object.fromEntries(
        Object.entries(readAll(memento)).filter(([storedPath]) => storedPath !== repositoryPath),
      );
      await memento.update(
        SIGNING_RECORD_STATE_KEY,
        record === undefined ? others : { ...others, [repositoryPath]: record },
      );
    },
    repositoryPaths: () => Object.keys(readAll(memento)),
  };
}
