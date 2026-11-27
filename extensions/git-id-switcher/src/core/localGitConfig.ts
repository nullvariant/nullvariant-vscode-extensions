/**
 * Git Config Access for One Repository
 *
 * Reads and writes the `--local` git config of one repository (the workspace
 * root or a submodule) through the command allowlist, telling a missing key
 * apart from a failed read.
 *
 * @sideeffect Executes `git config` in the given repository
 */

import { gitExec, type GitExecResult } from '../security/secureExec';
import type { GitConfigKey } from '../security/gitConfigRules';

/** A `--local` value: set, or not set */
export type LocalValue = { readonly kind: 'value'; readonly value: string } | { readonly kind: 'absent' };

/**
 * The result of reading a git config value: set, not set, or the read failed.
 * A failed read is never treated as "not set".
 */
export type ConfigReadResult = LocalValue | { readonly kind: 'error' };

/** One `--local` operation: set a key to a value, or unset it */
export type ConfigOperation<K extends GitConfigKey = GitConfigKey> =
  | { readonly operation: 'set'; readonly key: K; readonly value: string }
  | { readonly operation: 'unset'; readonly key: K };

/** `git config --get` exits 1 when the key is not set */
const EXIT_KEY_NOT_SET = 1;

/**
 * `git config --unset` exits 5 when the key is not set, and also when more
 * than one line matches the key (man git-config, git 2.50.1)
 */
const EXIT_UNSET_NOT_SINGLE_VALUE = 5;

/** Read and write `--local` config of one repository */
export interface LocalGitConfigPort {
  get(key: GitConfigKey): Promise<ConfigReadResult>;
  set(key: GitConfigKey, value: string): Promise<boolean>;
  /** @returns true if the key is not set afterwards */
  unset(key: GitConfigKey): Promise<boolean>;
}

/**
 * Turn a `git config -z --get` result into a value, absent, or error.
 *
 * With `-z`, git ends the value with one NUL instead of a newline, so the
 * value is the text before it, exactly (a value may itself end with a newline,
 * a carriage return or spaces). Output that is not one NUL-terminated value
 * is an error: a git config value cannot contain a NUL.
 *
 * A read is also an error when git printed anything on standard error (it
 * warns, and goes on, when it cannot read a config file), and when the value
 * holds U+FFFD: the output is decoded as UTF-8 and invalid bytes become
 * U+FFFD, so writing such a value back would write another value.
 */
export function toConfigReadResult(result: GitExecResult): ConfigReadResult {
  if ((result.stderr ?? '') !== '') {
    return { kind: 'error' };
  }
  if (result.success) {
    const end = result.stdout.indexOf('\0');
    const isOneValue = end !== -1 && end === result.stdout.length - 1 && !result.stdout.includes('�');
    return isOneValue ? { kind: 'value', value: result.stdout.slice(0, end) } : { kind: 'error' };
  }
  return result.exitCode === EXIT_KEY_NOT_SET ? { kind: 'absent' } : { kind: 'error' };
}

/**
 * The arguments that read a key as one NUL-terminated value.
 *
 * @param scope - 'local' for `--local` only, 'merged' for the value git uses
 *   (all scopes merged)
 */
export function readConfigArgs(key: GitConfigKey, scope: 'local' | 'merged'): string[] {
  return scope === 'local' ? ['config', '-z', '--local', '--get', key] : ['config', '-z', '--get', key];
}

/**
 * Create a port for the `--local` config of the repository at `repositoryPath`.
 *
 * @sideeffect Each call executes `git config --local` in `repositoryPath`
 */
export function createLocalGitConfigPort(repositoryPath: string): LocalGitConfigPort {
  const get = async (key: GitConfigKey): Promise<ConfigReadResult> =>
    toConfigReadResult(await gitExec(readConfigArgs(key, 'local'), repositoryPath));
  return {
    get,
    set: async (key, value): Promise<boolean> => {
      const result = await gitExec(['config', '--local', key, value], repositoryPath);
      return result.success;
    },
    unset: async (key): Promise<boolean> => {
      const result = await gitExec(['config', '--local', '--unset', key], repositoryPath);
      // Exit 5 means either "not set" (the state unset asks for) or "several
      // lines match" (nothing was removed), so read the key to tell them apart
      const isNotSingleValue = !result.success && result.exitCode === EXIT_UNSET_NOT_SINGLE_VALUE;
      const after = isNotSingleValue ? await get(key) : undefined;
      return result.success || after?.kind === 'absent';
    },
  };
}
