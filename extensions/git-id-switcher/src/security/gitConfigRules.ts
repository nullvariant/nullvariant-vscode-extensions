/**
 * Git Config Argument Rules
 *
 * Reads the arguments of `git config` as one grammar instead of a set of
 * tokens, and checks them against one rule table. For each key, the table
 * holds the operations it allows, the scope each operation may use, and the
 * values it may be set to. Only the keys in the table are accepted; writes
 * (set and unset) are `--local` only; and only the three signing keys can be
 * unset.
 *
 * The same value rules decide whether a value read from a repository can be
 * written back later (restoring the value that was there before a switch).
 *
 * @see https://git-scm.com/docs/git-config
 */

import { GPG_FORMATS, MAX_COMMAND_ARG_LENGTH } from '../core/constants';
import { GPG_KEY_REGEX, hasKeyPathPrefix, isDriveAbsolutePath } from '../validators/common';
import { isPathArgument, validatePathSecurity } from './pathValidator';
import { validateDriveAbsolutePathSecurity } from './drivePathValidator';
import type { AllowlistCheckResult } from './commandAllowlist';

/** Keys the extension reads or writes */
export const GIT_CONFIG_KEYS = [
  'user.name',
  'user.email',
  'user.signingkey',
  'commit.gpgsign',
  'gpg.format',
] as const;

export type GitConfigKey = (typeof GIT_CONFIG_KEYS)[number];

export type GitConfigOperation = 'get' | 'set' | 'unset';

/**
 * The scope option of a `git config` call. git's scopes are system, global,
 * local, worktree and command; the extension uses `--local` only. A call
 * without a scope option reads the value git uses (all scopes merged).
 */
export type GitConfigScope = 'local';

/** A scope option in the rule table: `--local`, or no scope option */
type ScopeOption = GitConfigScope | 'unscoped';

interface KeyRule {
  /** The operations the key allows, each with the scope options it may use */
  readonly operations: Readonly<Partial<Record<GitConfigOperation, readonly ScopeOption[]>>>;
  /** Whether a value may be written to the key (also when restoring a previous value) */
  readonly isAllowedValue: (value: string) => boolean;
}

/**
 * Text values (user.name, user.email): not a flag, bounded length, and
 * path-like values must pass the path security checks.
 */
function isAllowedTextValue(value: string): boolean {
  if (value.startsWith('-')) {
    return false;
  }
  if (isPathArgument(value) || value.includes('/')) {
    return validatePathSecurity(value).valid;
  }
  return value.length <= MAX_COMMAND_ARG_LENGTH;
}

/**
 * user.signingkey: a GPG key ID, or an absolute (`/`), home (`~/`) or
 * Windows drive (`C:\` or `C:/`, what `~/` expands to on Windows) key path.
 */
function isAllowedSigningKeyValue(value: string): boolean {
  if (GPG_KEY_REGEX.test(value)) {
    return true;
  }
  if (!hasKeyPathPrefix(value)) {
    return false;
  }
  return isDriveAbsolutePath(value)
    ? validateDriveAbsolutePathSecurity(value).valid
    : validatePathSecurity(value).valid;
}

/** Read without a scope option (Sync Check) or from `--local`; write to `--local` */
const READ_AND_SET = { get: ['unscoped', 'local'], set: ['local'] } as const;

/** The signing keys can also be unset, to put back a key that was not set */
const READ_SET_AND_UNSET = { ...READ_AND_SET, unset: ['local'] } as const;

/**
 * The rule table: operations, scopes and values per key.
 *
 * user.name and user.email have no unset: a switch that fails after writing a
 * name or email that was not set before cannot put that back, and says so.
 */
const KEY_RULES: Readonly<Record<GitConfigKey, KeyRule>> = {
  'user.name': { operations: READ_AND_SET, isAllowedValue: isAllowedTextValue },
  'user.email': { operations: READ_AND_SET, isAllowedValue: isAllowedTextValue },
  'user.signingkey': { operations: READ_SET_AND_UNSET, isAllowedValue: isAllowedSigningKeyValue },
  'commit.gpgsign': {
    operations: READ_SET_AND_UNSET,
    isAllowedValue: (value) => value === 'true' || value === 'false',
  },
  'gpg.format': {
    operations: READ_SET_AND_UNSET,
    isAllowedValue: (value) => (GPG_FORMATS as readonly string[]).includes(value),
  },
};

/**
 * Whether a string is one of the keys in the rule table.
 *
 * Matching is exact on the lowercase form. git treats key names
 * case-insensitively, but the extension only builds lowercase keys, so other
 * spellings are rejected.
 */
export function isGitConfigKey(key: string): key is GitConfigKey {
  return (GIT_CONFIG_KEYS as readonly string[]).includes(key);
}

/**
 * Whether `value` may be written to `key`.
 */
export function isAllowedGitConfigValue(key: GitConfigKey, value: string): boolean {
  return KEY_RULES[key].isAllowedValue(value);
}

/**
 * Whether the rule table allows an operation on a key with a scope option
 * (`scope` undefined = no scope option).
 */
export function isAllowedGitConfigOperation(
  key: GitConfigKey,
  operation: GitConfigOperation,
  scope: GitConfigScope | undefined,
): boolean {
  return KEY_RULES[key].operations[operation]?.includes(scope ?? 'unscoped') === true;
}

type MatchedForm =
  | { readonly operation: 'get' | 'unset'; readonly scope?: GitConfigScope; readonly key: string }
  | { readonly operation: 'set'; readonly scope: GitConfigScope; readonly key: string; readonly value: string };

/** `-z --get <key>`, `--local --unset <key>` and `--local <key> <value>` */
const THREE_ARGUMENT_FORM_LENGTH = 3;

/** `-z --local --get <key>` */
const LOCAL_GET_FORM_LENGTH = 4;

/**
 * Read with `-z`: git ends the value with a NUL instead of a newline, so a
 * value that itself ends with a newline or a carriage return is read as it is
 * (localGitConfig.ts reads it).
 */
const NUL_TERMINATED = '-z';

/**
 * Match the arguments to one of the four accepted forms (arguments after `config`):
 *
 * | form                       | operation | scope option |
 * | -------------------------- | --------- | ------------ |
 * | `-z --get <key>`           | get       | (none)       |
 * | `-z --local --get <key>`   | get       | `--local`    |
 * | `--local <key> <value>`    | set       | `--local`    |
 * | `--local --unset <key>`    | unset     | `--local`    |
 *
 * Whether the key allows that operation with that scope is decided by the
 * rule table afterwards.
 */
function matchForm(args: readonly string[]): MatchedForm | undefined {
  const [first, second, third, fourth] = args;
  if (first === NUL_TERMINATED) {
    if (second === '--get' && args.length === THREE_ARGUMENT_FORM_LENGTH) {
      return { operation: 'get', key: third };
    }
    return second === '--local' && third === '--get' && args.length === LOCAL_GET_FORM_LENGTH
      ? { operation: 'get', scope: 'local', key: fourth }
      : undefined;
  }
  if (first === '--local' && args.length === THREE_ARGUMENT_FORM_LENGTH) {
    return second === '--unset'
      ? { operation: 'unset', scope: 'local', key: third }
      : { operation: 'set', scope: 'local', key: second, value: third };
  }
  return undefined;
}

/**
 * Check `git config` arguments (the arguments after `config`): one of the
 * forms, a key in the rule table, an operation and scope the key allows, and
 * for a write a value the key allows.
 */
export function validateGitConfigArgs(args: readonly string[]): AllowlistCheckResult {
  const form = matchForm(args);
  if (!form) {
    return { allowed: false, reason: 'git config arguments are not allowed (no matching form)' };
  }

  if (!isGitConfigKey(form.key)) {
    return { allowed: false, reason: `git config key '${form.key}' is not in the allowlist` };
  }
  const key = form.key;

  if (!isAllowedGitConfigOperation(key, form.operation, form.scope)) {
    return { allowed: false, reason: `Operation '${form.operation}' is not allowed for git config key '${key}'` };
  }

  if (form.operation === 'set' && !isAllowedGitConfigValue(key, form.value)) {
    return { allowed: false, reason: `Value is not allowed for git config key '${key}'` };
  }
  return { allowed: true };
}
