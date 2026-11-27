/**
 * SSH Signing Key Check
 *
 * Before an SSH signing key path is written to user.signingkey, the key is
 * made to sign a small fixed text the way git signs a commit
 * (`ssh-keygen -Y sign -n git -f <path>`), without askpass and with a
 * timeout. The switch stops unless the signature is made, and
 * made with the key the path names. Which key OpenSSH picks is not predicted:
 * the signature says which key signed.
 *
 * The key the path names is read without a passphrase: from a private key
 * with `ssh-keygen -y`, or from a public key file (`.pub`, when the private
 * key is in ssh-agent). A private key protected by a passphrase cannot be
 * read that way, so it is not accepted as the path: the user names its `.pub`
 * file instead.
 *
 * The permissions of the key file, and of the `.pub` file next to it, follow
 * the rules of keyFileValidator.ts (Unix only): a private key must not be
 * accessible by group or others nor executable; a public key (a `.pub` file)
 * must not be writable by group or others nor executable. Both files must be
 * owned by the current user or root. Another account on the same machine
 * could otherwise change which key signs.
 *
 * The check runs only when the key file (or the `.pub` file next to it, which
 * OpenSSH reads first) has changed since it last passed (size, modification
 * time or permissions): a hardware key may ask for a touch each time it signs.
 * What passed is kept in VS Code's global state (keys belong to the user, not
 * to a workspace).
 *
 * @sideeffect Runs ssh-keygen, reads the key file, writes the global state
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { MementoPort } from '../core/mementoPort';
import { MAX_IDENTITIES, MAX_SSH_KEY_FILE_SIZE } from '../core/constants';
import { SIGNING_TEST_DATA } from '../security/sshKeygenRules';
import { sshKeygenExec } from '../security/secureExec';
import { isPlainObject } from '../validators/common';
import { findInsecurePermission } from './keyFileValidator';

/** Storage key in the global state */
export const SIGNING_KEY_CHECK_STATE_KEY = 'gitIdSwitcher.checkedSigningKeys';

/** The file name suffix of a public key file */
const PUBLIC_KEY_SUFFIX = '.pub';

/** How long signing may take: a hardware key may wait for a touch */
const SIGNING_TIMEOUT_MS = 30_000;

/** Magic preamble of an SSH signature (PROTOCOL.sshsig) */
const SSHSIG_MAGIC = 'SSHSIG';

/** Length of the version field that follows the magic preamble */
const UINT32_LENGTH = 4;

export interface FileStamp {
  readonly isFile: boolean;
  readonly size: number;
  readonly mtimeMs: number;
  /** The file mode (permission bits) */
  readonly mode: number;
  /** The user ID of the owner */
  readonly uid: number;
}

export interface SigningKeyCheckDependencies {
  /** Stat a file (following links), undefined when it does not exist or cannot be read */
  stat(filePath: string): Promise<FileStamp | undefined>;
  readFile(filePath: string): Promise<string>;
  /** Run ssh-keygen; rejects when it fails */
  sshKeygen(args: string[], options: { input?: string; timeout?: number; isNonInteractive?: boolean }): Promise<{ stdout: string }>;
  /** VS Code's global state */
  readonly store: MementoPort;
}

export type SigningKeyCheckResult =
  | { readonly result: 'ok' }
  | {
      readonly result: 'failed';
      /**
       * not-a-key-file: not an absolute path, missing, not a regular file, or too large;
       * insecure-permissions: group or others could change (or, for a
       *   private key, read) the key file or the `.pub` file next to it,
       *   or another user than the current one or root owns one of them;
       * public-key-unknown: the key's public key cannot be read without a passphrase;
       * sign-failed: the key could not sign;
       * other-key: another key signed
       */
      readonly reason: 'not-a-key-file' | 'insecure-permissions' | 'public-key-unknown' | 'sign-failed' | 'other-key';
    };

/**
 * The real file system and ssh-keygen, with `store` for the passed checks.
 */
export function createSigningKeyCheckDependencies(store: MementoPort): SigningKeyCheckDependencies {
  return {
    stat: async (filePath): Promise<FileStamp | undefined> => {
      try {
        const stats = await fs.stat(filePath);
        return { isFile: stats.isFile(), size: stats.size, mtimeMs: stats.mtimeMs, mode: stats.mode, uid: stats.uid };
      } catch {
        return undefined;
      }
    },
    readFile: (filePath) => fs.readFile(filePath, 'utf8'),
    sshKeygen: (args, options) => sshKeygenExec(args, options),
    store,
  };
}

/** What a passed check depended on: the key file and the `.pub` file next to it */
interface CheckedStamp {
  readonly key: FileStamp;
  readonly publicKey: FileStamp | null;
}

/**
 * Whether the current user or root owns a file (Unix only: always true on
 * Windows, whose ACLs are not checked).
 */
function isOwnedByUserOrRoot(stamp: FileStamp): boolean {
  return process.platform === 'win32' || stamp.uid === 0 || (typeof process.getuid === 'function' && stamp.uid === process.getuid());
}

/** Decode base64 text */
function decodeBase64(text: string): Buffer {
  // eslint-disable-next-line unicorn/prefer-uint8array-base64 -- the Node.js of VS Code 1.85 (engines.vscode) has no Uint8Array.fromBase64
  return Buffer.from(text, 'base64');
}

/**
 * The key blob of a public key line (`<type> <base64> [comment]`), or
 * undefined when the text does not start with such a line: the blob must
 * start with the same type as the line.
 */
export function parsePublicKeyLine(text: string): Buffer | undefined {
  const [type = '', encoded = ''] = text.trim().split(' ', 2);
  const blob = decodeBase64(encoded);
  const typeEnd = UINT32_LENGTH + (blob.length >= UINT32_LENGTH ? blob.readUInt32BE(0) : 0);
  const isKeyOfType = type !== '' && blob.subarray(UINT32_LENGTH, typeEnd).toString('latin1') === type;
  return isKeyOfType ? blob : undefined;
}

/**
 * The public key blob in an armored SSH signature, or undefined when the text
 * is not one.
 *
 * @see https://github.com/openssh/openssh-portable/blob/master/PROTOCOL.sshsig
 */
export function parseSignaturePublicKey(armored: string): Buffer | undefined {
  const body = armored
    .split('\n')
    .filter((line) => line !== '' && !line.startsWith('-----'))
    .join('');
  const blob = decodeBase64(body);
  const keyLengthAt = SSHSIG_MAGIC.length + UINT32_LENGTH;
  if (blob.length < keyLengthAt + UINT32_LENGTH || blob.subarray(0, SSHSIG_MAGIC.length).toString('latin1') !== SSHSIG_MAGIC) {
    return undefined;
  }
  const keyStart = keyLengthAt + UINT32_LENGTH;
  const keyEnd = keyStart + blob.readUInt32BE(keyLengthAt);
  return keyEnd <= blob.length ? blob.subarray(keyStart, keyEnd) : undefined;
}

/** The public key the path names, read without a passphrase */
async function readExpectedPublicKey(keyPath: string, deps: SigningKeyCheckDependencies): Promise<Buffer | undefined> {
  try {
    const { stdout } = await deps.sshKeygen(['-y', '-P', '', '-f', keyPath], {});
    return parsePublicKeyLine(stdout);
  } catch {
    // Not a private key without a passphrase: read the file as a public key
    return readPublicKeyFile(keyPath, deps);
  }
}

/** The public key in a public key file, undefined when it cannot be read as one */
async function readPublicKeyFile(keyPath: string, deps: SigningKeyCheckDependencies): Promise<Buffer | undefined> {
  try {
    return parsePublicKeyLine(await deps.readFile(keyPath));
  } catch {
    return undefined;
  }
}

/** The public key that signed the test data, or undefined when signing failed */
async function signTestData(keyPath: string, deps: SigningKeyCheckDependencies): Promise<Buffer | undefined> {
  try {
    const { stdout } = await deps.sshKeygen(['-Y', 'sign', '-n', 'git', '-f', keyPath], {
      input: SIGNING_TEST_DATA,
      timeout: SIGNING_TIMEOUT_MS,
      isNonInteractive: true,
    });
    return parseSignaturePublicKey(stdout);
  } catch {
    return undefined;
  }
}

function readChecked(store: MementoPort): Record<string, unknown> {
  const stored = store.get<unknown>(SIGNING_KEY_CHECK_STATE_KEY);
  return isPlainObject(stored) ? { ...stored } : {};
}

/**
 * Remember a passed check. Only the latest MAX_IDENTITIES keys are kept.
 */
async function rememberChecked(store: MementoPort, keyPath: string, stamp: CheckedStamp): Promise<void> {
  const checked = readChecked(store);
  delete checked[keyPath];
  const entries = [...Object.entries(checked), [keyPath, stamp] as const].slice(-MAX_IDENTITIES);
  await store.update(SIGNING_KEY_CHECK_STATE_KEY, Object.fromEntries(entries));
}

/**
 * Check that the SSH signing key at `keyPath` signs, with the key it names.
 *
 * @param keyPath - The value written to user.signingkey (see normalizeSigningKeyPath)
 * @sideeffect Runs ssh-keygen (signing may ask a hardware key for a touch),
 *   reads the key file, and stores a passed check in the global state
 */
export async function checkSigningKey(keyPath: string, deps: SigningKeyCheckDependencies): Promise<SigningKeyCheckResult> {
  // A path that is not absolute here (C:/... on POSIX) would name another
  // file when git runs in another folder
  if (!path.isAbsolute(keyPath)) {
    return { result: 'failed', reason: 'not-a-key-file' };
  }
  const key = await deps.stat(keyPath);
  if (key === undefined || !key.isFile || key.size > MAX_SSH_KEY_FILE_SIZE) {
    return { result: 'failed', reason: 'not-a-key-file' };
  }
  const stamp: CheckedStamp = { key, publicKey: (await deps.stat(`${keyPath}${PUBLIC_KEY_SUFFIX}`)) ?? null };
  // Before the remembered check: that owner could change the file and set its time back
  if (!isOwnedByUserOrRoot(key) || (stamp.publicKey !== null && !isOwnedByUserOrRoot(stamp.publicKey))) {
    return { result: 'failed', reason: 'insecure-permissions' };
  }
  if (JSON.stringify(readChecked(deps.store)[keyPath]) === JSON.stringify(stamp)) {
    return { result: 'ok' };
  }

  // A `.pub` file is a public key; any other file is taken as a private key (the stricter rules)
  const hasInsecurePermission =
    findInsecurePermission(key.mode, keyPath.endsWith(PUBLIC_KEY_SUFFIX) ? 'public' : 'private') !== undefined ||
    (stamp.publicKey !== null && findInsecurePermission(stamp.publicKey.mode, 'public') !== undefined);
  if (hasInsecurePermission) {
    return { result: 'failed', reason: 'insecure-permissions' };
  }

  const expected = await readExpectedPublicKey(keyPath, deps);
  if (expected === undefined) {
    return { result: 'failed', reason: 'public-key-unknown' };
  }
  const signedWith = await signTestData(keyPath, deps);
  if (signedWith === undefined) {
    return { result: 'failed', reason: 'sign-failed' };
  }
  if (!signedWith.equals(expected)) {
    return { result: 'failed', reason: 'other-key' };
  }
  await rememberChecked(deps.store, keyPath, stamp);
  return { result: 'ok' };
}
