/**
 * Fixtures for the commit signing tests: an in-memory Memento, an in-memory
 * git config port with failure injection, and real git repositories.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { MementoPort } from '../../core/mementoPort';
import type { ConfigReadResult, LocalGitConfigPort, LocalValue } from '../../core/localGitConfig';
import { SIGNING_CONFIG_KEYS, type SigningConfigKey } from '../../core/signingPlan';
import type { GitConfigKey } from '../../security/gitConfigRules';
import { removeTrailingNewline } from '../../security/secureExec';
import type { Triple } from './signingCases';

/** Memento that stores JSON copies, like VS Code's workspace state */
export function createMemento(
  initial?: Readonly<Record<string, unknown>>,
): MementoPort & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>(Object.entries(initial ?? {}));
  return {
    data,
    get: <T>(key: string): T | undefined => data.get(key) as T | undefined,
    update: async (key: string, value: unknown): Promise<void> => {
      data.set(key, structuredClone(value));
    },
  };
}

export function toLocal(values: Triple): Record<SigningConfigKey, LocalValue> {
  const entry = (value: string | undefined): LocalValue =>
    value === undefined ? { kind: 'absent' } : { kind: 'value', value };
  return { 'gpg.format': entry(values[0]), 'user.signingkey': entry(values[1]), 'commit.gpgsign': entry(values[2]) };
}

export interface FakePortOptions {
  readonly readErrors?: readonly GitConfigKey[];
  /** Decides at each read whether it fails (in addition to readErrors) */
  readonly failRead?: (key: GitConfigKey) => boolean;
  /** Called after each set / unset with its description and whether it worked */
  readonly onWrite?: (write: string, isDone: boolean) => void;
  readonly failSet?: (key: GitConfigKey, value: string) => boolean;
  readonly failUnset?: (key: GitConfigKey) => boolean;
}

export type FakePort = LocalGitConfigPort & {
  values: Map<GitConfigKey, string>;
  /** Every set / unset, in order, as "set key=value" / "unset key" */
  writes: string[];
};

/** In-memory `--local` config with failure injection */
export function createFakePort(
  initial: Partial<Record<GitConfigKey, string>>,
  options: FakePortOptions = {},
): FakePort {
  const values = new Map<GitConfigKey, string>(Object.entries(initial) as Array<[GitConfigKey, string]>);
  const writes: string[] = [];
  return {
    values,
    writes,
    get: async (key): Promise<ConfigReadResult> => {
      if (options.readErrors?.includes(key) || options.failRead?.(key)) {
        return { kind: 'error' };
      }
      const value = values.get(key);
      return value === undefined ? { kind: 'absent' } : { kind: 'value', value };
    },
    set: async (key, value) => {
      const write = `set ${key}=${value}`;
      writes.push(write);
      const isDone = !options.failSet?.(key, value);
      if (isDone) {
        values.set(key, value);
      }
      options.onWrite?.(write, isDone);
      return isDone;
    },
    unset: async (key) => {
      const write = `unset ${key}`;
      writes.push(write);
      const isDone = !options.failUnset?.(key);
      if (isDone) {
        values.delete(key);
      }
      options.onWrite?.(write, isDone);
      return isDone;
    },
  };
}

/**
 * Run git and return its output without the line ending git adds, and
 * nothing else removed (as the extension reads it: a value or a path may end
 * with spaces).
 */
export function git(cwd: string, args: string[]): string {
  return removeTrailingNewline(execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
}

/** `git config --get` exits 1 when the key is not set */
const EXIT_GET_KEY_NOT_SET = 1;

/**
 * Read a key from a repository's --local config (undefined when not set).
 * Only exit 1 means "not set": any other failure throws, so it never passes
 * for a missing value.
 */
export function readLocal(repository: string, key: string): string | undefined {
  try {
    return git(repository, ['config', '--local', '--get', key]);
  } catch (error) {
    if ((error as { status?: number }).status === EXIT_GET_KEY_NOT_SET) {
      return undefined;
    }
    throw error;
  }
}

/** Read the three signing config keys from a repository's --local config */
export function readLocalTriple(repository: string): Triple {
  return [readLocal(repository, 'gpg.format'), readLocal(repository, 'user.signingkey'), readLocal(repository, 'commit.gpgsign')];
}

/** `git config --unset` exits 5 when the key is not set */
const EXIT_UNSET_KEY_NOT_SET = 5;

/** Write a key to a repository's --local config (undefined = unset) */
export function writeLocal(repository: string, key: string, value: string | undefined): void {
  if (value !== undefined) {
    git(repository, ['config', '--local', key, value]);
    return;
  }
  try {
    git(repository, ['config', '--local', '--unset', key]);
  } catch (error) {
    // A key that is not set is what was asked for; anything else is a fixture failure
    if ((error as { status?: number }).status !== EXIT_UNSET_KEY_NOT_SET) {
      throw error;
    }
  }
}

/** Write the three signing config keys to a repository's --local config */
export function writeLocalTriple(repository: string, values: Triple): void {
  for (const [index, key] of SIGNING_CONFIG_KEYS.entries()) {
    writeLocal(repository, key, values[index]);
  }
}

export function makeTempDir(prefix: string): string {
  // realpath (native, like git): /tmp is a symlink on macOS, Windows may use
  // short names, and submodule paths are checked against the real path
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  return fs.realpathSync.native(dir);
}

/** Encode bytes as base64 */
export function encodeBase64(bytes: Buffer): string {
  // eslint-disable-next-line unicorn/prefer-uint8array-base64 -- the Node.js of VS Code 1.85 (engines.vscode) has no Uint8Array#toBase64
  return bytes.toString('base64');
}

/** An SSH wire string: a 32-bit length, then the bytes */
function sshString(bytes: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length);
  return Buffer.concat([length, bytes]);
}

/** A public key blob of type ssh-ed25519 (the key bytes need not be a real key) */
export function keyBlob(key: string): Buffer {
  return Buffer.concat([sshString(Buffer.from('ssh-ed25519')), sshString(Buffer.from(key))]);
}

/** The public key line of a blob */
export function publicKeyLine(blob: Buffer): string {
  return `ssh-ed25519 ${encodeBase64(blob)}\n`;
}

/** Armor a blob as an SSH signature */
export function armorSignature(blob: Buffer): string {
  return `-----BEGIN SSH SIGNATURE-----\n${encodeBase64(blob)}\n-----END SSH SIGNATURE-----\n`;
}

/** An armored SSH signature made with the key `signedWith` (the signature itself is left out) */
export function signatureBy(signedWith: Buffer): string {
  return armorSignature(Buffer.concat([Buffer.from('SSHSIG'), Buffer.alloc(4), sshString(signedWith)]));
}

export function initRepository(dir: string): void {
  git(dir, ['init', '-q']);
  git(dir, ['config', '--local', 'user.name', 'Fixture']);
  git(dir, ['config', '--local', 'user.email', 'fixture@example.com']);
  fs.writeFileSync(path.join(dir, 'README.md'), '# fixture\n');
  git(dir, ['add', 'README.md']);
  git(dir, ['-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'init']);
}
