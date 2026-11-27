/**
 * Memento Port
 *
 * The part of VS Code's Memento that the extension reads and writes, so the
 * users can be tested without VS Code: the record of the signing config the
 * extension wrote (workspace state, signingRecordStore.ts) and the signing
 * keys that passed their check (global state, signingKeyCheck.ts).
 */

export interface MementoPort {
  get<T>(key: string): T | undefined;
  update(key: string, value: unknown): PromiseLike<void>;
}
