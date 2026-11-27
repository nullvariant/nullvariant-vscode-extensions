/**
 * ssh-keygen Argument Rules
 *
 * Reads the arguments of `ssh-keygen` as one grammar and accepts only the
 * three forms the extension uses:
 *
 * | form                                 | what it does                                                  |
 * | ------------------------------------ | ------------------------------------------------------------- |
 * | `-lf <absolute key path>`            | print the fingerprint of a key file                           |
 * | `-y -P '' -f <absolute path>`        | print the public key of a private key file; with the empty passphrase it never asks for one |
 * | `-Y sign -n git -f <absolute path>`  | sign the fixed test data on standard input, as git signs a commit, and print the signature |
 *
 * None of them writes a file. Every other option (key generation, `-p`,
 * certificates, ...) is rejected. Only the signing form takes standard input,
 * and only the fixed test data: the extension never signs anything else.
 *
 * The length and path checks that apply to every argument (Windows drive
 * paths included) run before this grammar (commandAllowlist.ts).
 *
 * @see https://man.openbsd.org/ssh-keygen
 */

import { isDriveAbsolutePath } from '../validators/common';
import type { AllowlistCheckResult } from './commandAllowlist';

/** The data signed to check a signing key (standard input of `-Y sign`) */
export const SIGNING_TEST_DATA = 'git-id-switcher signing key check\n';

/**
 * Whether an argument is a key path: an absolute path (the extension passes
 * the expanded path, never `~/`), Unix or Windows drive.
 */
function isAbsoluteKeyPath(arg: string | undefined): boolean {
  return arg !== undefined && (arg.startsWith('/') || isDriveAbsolutePath(arg));
}

/** Whether the arguments are the fixed words of a form followed by one key path */
function isForm(args: readonly string[], words: readonly string[]): boolean {
  return (
    args.length === words.length + 1 &&
    words.every((word, index) => args[index] === word) &&
    isAbsoluteKeyPath(args.at(-1))
  );
}

const FINGERPRINT_FORM = ['-lf'] as const;
const PRINT_PUBLIC_KEY_FORM = ['-y', '-P', '', '-f'] as const;
const SIGN_FORM = ['-Y', 'sign', '-n', 'git', '-f'] as const;

/**
 * Check `ssh-keygen` arguments against the accepted forms.
 */
export function validateSshKeygenArgs(args: readonly string[]): AllowlistCheckResult {
  return [FINGERPRINT_FORM, PRINT_PUBLIC_KEY_FORM, SIGN_FORM].some((words) => isForm(args, words))
    ? { allowed: true }
    : { allowed: false, reason: 'ssh-keygen arguments are not allowed (no matching form)' };
}

/**
 * Check the standard input of an `ssh-keygen` call: the signing form takes
 * exactly the fixed test data; the other forms take none.
 */
export function validateSshKeygenInput(args: readonly string[], input: string | undefined): AllowlistCheckResult {
  const expected = isForm(args, SIGN_FORM) ? SIGNING_TEST_DATA : undefined;
  return input === expected
    ? { allowed: true }
    : { allowed: false, reason: 'ssh-keygen standard input is not allowed for this form' };
}
