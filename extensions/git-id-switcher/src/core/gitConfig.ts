/**
 * Git Configuration Management
 *
 * Handles reading and writing Git config for user identity switching.
 * Uses workspace-level config when in a Git repository.
 * Supports propagating config to submodules.
 *
 * What to write (including signing), how to put values back on failure, and
 * the messages for a failed write live in signingPlan.ts and
 * repositoryConfigWriter.ts; this module connects them to the open workspace.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 * @see https://owasp.org/www-community/attacks/Command_Injection
 *
 * Note: Uses vscodeLoader for lazy loading VS Code APIs to enable unit testing.
 */

// Type-only import for TypeScript (stripped at compile time)
import type * as vscodeTypes from 'vscode';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getWorkspace, localize as t } from './vscodeLoader';
import { Identity, getIdentitiesWithValidation } from '../identity/identity';
import { gitExec, secureExec } from '../security/secureExec';
import { GIT_CONFIG_KEYS, type GitConfigKey } from '../security/gitConfigRules';
import { validateIdentity } from '../identity/inputValidator';
import {
  collectSubmodules,
  setIdentityForSubmodules,
  isSubmoduleSupportEnabled,
  getSubmoduleDepth,
} from './submodule';
import { createValidationError, createConfigError } from './errors';
import { extensionLogger } from '../logging/extensionLogger';
import { createLocalGitConfigPort, readConfigArgs, toConfigReadResult, type ConfigReadResult } from './localGitConfig';
import {
  applyIdentityToRepository,
  assertGitSupportsSigning,
  assertSigningKeyUsable,
  combineSigningResidue,
  createApplyError,
  detectSigningResidue,
  readSigningValues,
  type SigningResidue,
} from './repositoryConfigWriter';
import type { SigningRecordStore } from './signingRecordStore';
import type { MementoPort } from './mementoPort';
import { createSigningKeyCheckDependencies } from '../ssh/signingKeyCheck';
import { SIGNING_CONFIG_KEYS, resolveSigningSpec, type LocalSigningValues, type SigningSpec } from './signingPlan';
import { classifyRepositoryCheck, hasGitEntryUpwards, type RepositoryCheck } from './repositoryCheck';

/**
 * Check if icon should be included in Git config user.name
 * @returns true if icon should be included, false otherwise (default: false)
 */
export function shouldIncludeIconInGitConfig(): boolean {
  const workspace = getWorkspace();
  if (!workspace) {
    return false;
  }
  const config = workspace.getConfiguration('gitIdSwitcher');
  return config.get<boolean>('includeIconInGitConfig', false);
}

/**
 * Build user.name string for Git config
 * Icon is only included if includeIconInGitConfig setting is true
 */
function buildGitUserName(identity: Identity): string {
  return identity.icon && shouldIncludeIconInGitConfig() ? `${identity.icon} ${identity.name}` : identity.name;
}

/** The values git uses (all scopes merged), by git config key; read by Sync Check */
export type GitConfig = Readonly<Record<GitConfigKey, ConfigReadResult>>;

/** Every key of `keys` unreadable */
function allUnreadable<K extends GitConfigKey>(keys: readonly K[]): Readonly<Record<K, ConfigReadResult>> {
  return Object.fromEntries(keys.map((key) => [key, { kind: 'error' }])) as Record<K, ConfigReadResult>;
}

/** All values unreadable (cancelled, or not a Git repository) */
const UNREADABLE_GIT_CONFIG: GitConfig = allUnreadable(GIT_CONFIG_KEYS);

/**
 * Get the current workspace path
 * @throws ConfigError if no workspace folder is open or VS Code API not available
 */
function getWorkspacePath(): string {
  const workspace = getWorkspace();
  const workspaceFolder = workspace?.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw createConfigError(t('No workspace folder open'));
  }
  return workspaceFolder.uri.fsPath;
}

/**
 * Execute a git command in the current workspace
 *
 * @param args - Git arguments as array (NOT a string command)
 * @returns stdout on success, undefined on failure
 */
async function execGitInWorkspace(args: string[]): Promise<string | undefined> {
  const cwd = getWorkspacePath();
  const result = await gitExec(args, cwd);
  return result.success ? result.stdout : undefined;
}

/**
 * Absolute path of the repository root of the workspace (the key of its record)
 */
async function getRepositoryRoot(): Promise<string | undefined> {
  return execGitInWorkspace(['rev-parse', '--show-toplevel']);
}

/**
 * Read the value git uses for a key (no scope option: all scopes merged).
 *
 * @sideeffect Executes `git config --get` in `repositoryPath`
 */
async function readMergedGitConfig(key: GitConfigKey, repositoryPath: string): Promise<ConfigReadResult> {
  return toConfigReadResult(await gitExec(readConfigArgs(key, 'merged'), repositoryPath));
}

/**
 * Read the merged git config of the workspace.
 */
async function readGitConfig(): Promise<GitConfig> {
  if ((await execGitInWorkspace(['rev-parse', '--is-inside-work-tree'])) !== 'true') {
    return UNREADABLE_GIT_CONFIG;
  }
  const cwd = getWorkspacePath();
  const values = await Promise.all(GIT_CONFIG_KEYS.map((key) => readMergedGitConfig(key, cwd)));
  return Object.fromEntries(GIT_CONFIG_KEYS.map((key, index) => [key, values[index]])) as Record<
    GitConfigKey,
    ConfigReadResult
  >;
}

/**
 * Get current Git configuration
 * @param token Optional cancellation token for aborting the operation
 */
export async function getCurrentGitConfig(
  token?: vscodeTypes.CancellationToken
): Promise<GitConfig> {
  if (token?.isCancellationRequested) {
    return UNREADABLE_GIT_CONFIG;
  }

  // If no token provided, execute normally
  if (!token) {
    return readGitConfig();
  }

  // Track disposable for cleanup
  let disposable: vscodeTypes.Disposable | undefined;

  // Create a promise that rejects when cancellation is requested
  const cancellationPromise = new Promise<never>((_, reject) => {
    if (token.isCancellationRequested) {
      reject(new Error('Operation cancelled'));
      return;
    }

    disposable = token.onCancellationRequested(() => {
      reject(new Error('Operation cancelled'));
    });
  });

  try {
    return await Promise.race([readGitConfig(), cancellationPromise]);
  } catch (error) {
    // If cancelled, nothing was read
    if (token.isCancellationRequested) {
      return UNREADABLE_GIT_CONFIG;
    }
    // Re-throw other errors
    throw error;
  } finally {
    // Always clean up the event listener to prevent memory leaks
    disposable?.dispose();
  }
}

/**
 * Whether the workspace repository, or a submodule with a record (when
 * submodule support is on), still holds signing values the extension wrote,
 * which an unsigned identity should have put back.
 *
 * @returns 'present', 'none', or 'error' when the values cannot be read
 */
export async function detectWorkspaceSigningResidue(
  store: SigningRecordStore
): Promise<SigningResidue> {
  const root = await getRepositoryRoot();
  if (root === undefined) {
    return 'error';
  }
  // Compared as resolved paths: git prints the root with `/` on Windows, and
  // submodule paths are built with the platform separator
  const rootPrefix = path.resolve(root) + path.sep;
  const submodulePaths = isSubmoduleSupportEnabled()
    ? store.repositoryPaths().filter((repositoryPath) => path.resolve(repositoryPath).startsWith(rootPrefix))
    : [];
  const residues = await Promise.all(
    [root, ...submodulePaths].map((repositoryPath) =>
      detectSigningResidue(createLocalGitConfigPort(repositoryPath), store, repositoryPath),
    ),
  );
  return combineSigningResidue(residues);
}

/**
 * Read the `--local` values of the three signing keys of the workspace
 * repository (where the extension writes them). Every value is an error when
 * the repository root cannot be found.
 */
export async function readWorkspaceLocalSigningValues(): Promise<LocalSigningValues> {
  const root = await getRepositoryRoot();
  return root === undefined ? allUnreadable(SIGNING_CONFIG_KEYS) : readSigningValues(createLocalGitConfigPort(root));
}

/** What a write of git config left undone (the values of the repository root are written) */
export interface GitConfigApplyOutcome {
  /** Submodules whose git config could not be written */
  readonly failedSubmoduleCount: number;
  /** False when the submodules could not all be listed (some may be missing) */
  readonly isSubmoduleListComplete: boolean;
}

/**
 * Whether a file system entry exists (not followed if it is a link): true,
 * false when it or a folder on its path does not exist, 'error' when that
 * cannot be told.
 *
 * @sideeffect Reads the file system
 */
export async function entryExists(entryPath: string): Promise<boolean | 'error'> {
  try {
    await fs.lstat(entryPath);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code === 'ENOENT' || code === 'ENOTDIR' ? false : 'error';
  }
}

/**
 * Whether the workspace folder is in a Git work tree, outside any
 * repository, or that could not be told (see repositoryCheck.ts).
 *
 * @throws ConfigError if no workspace folder is open
 * @sideeffect Executes `git rev-parse` and reads the file system for `.git`
 */
export async function checkWorkspaceRepository(): Promise<RepositoryCheck> {
  const cwd = getWorkspacePath();
  const result = await gitExec(['rev-parse', '--is-inside-work-tree'], cwd);
  return classifyRepositoryCheck(result, process.env, () => hasGitEntryUpwards(cwd, entryExists));
}

/**
 * Set Git user configuration for an identity
 *
 * Uses --local to set workspace-level config.
 * Optionally propagates to submodules if enabled.
 *
 * SECURITY: Validates identity before applying config
 *
 * @param identity - The identity to apply
 * @param store - Record of the signing config the extension wrote
 * @param globalState - Where the passed checks of SSH signing keys are kept
 * @returns What was left undone in the submodules (the root succeeded)
 * @throws if the signing key does not pass its check, or the repository
 *   root could not be written
 */
export async function setGitConfigForIdentity(
  identity: Identity,
  store: SigningRecordStore,
  globalState: MementoPort
): Promise<GitConfigApplyOutcome> {
  const workspace = getWorkspace();
  const workspaceFolder = workspace?.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw createConfigError(t('No workspace folder open'));
  }

  // SECURITY: Validate identity before use
  const validation = validateIdentity(identity);
  if (!validation.valid) {
    // SECURITY: Don't expose validation details to users
    throw createValidationError(t('Invalid identity configuration'), {
      field: 'identity',
      context: { errorCount: validation.errors.length },
    });
  }

  // Check if we're in a git work tree (--show-toplevel fails outside one)
  const root = await getRepositoryRoot();
  if (root === undefined) {
    throw createConfigError(t('Not in a Git repository'));
  }

  // Set user.name (icon is only included if includeIconInGitConfig is true)
  const userName = buildGitUserName(identity);
  const signing = resolveSigningSpec(identity);

  // An SSH signing identity needs a git that signs with SSH: otherwise the config is not written
  await assertGitSupportsSigning(signing, async () => {
    const { stdout } = await secureExec('git', ['--version']);
    return stdout;
  });
  // SECURITY: Check that the signing key signs, with the key it names, before git is told to use it
  await assertSigningKeyUsable(signing, createSigningKeyCheckDependencies(globalState));

  const result = await applyIdentityToRepository(
    createLocalGitConfigPort(root),
    store,
    root,
    userName,
    identity.email,
    signing
  );
  if (result.result !== 'ok') {
    throw createApplyError(result);
  }

  // Propagate to submodules if enabled. Listed from the repository root, not
  // the workspace folder: a subdirectory would miss the submodules outside it.
  return isSubmoduleSupportEnabled()
    ? propagateToSubmodules(root, userName, identity.email, signing, store)
    : { failedSubmoduleCount: 0, isSubmoduleListComplete: true };
}

/**
 * Propagate identity config to all submodules
 */
async function propagateToSubmodules(
  repositoryRoot: string,
  userName: string,
  userEmail: string,
  signing: SigningSpec | undefined,
  store: SigningRecordStore
): Promise<GitConfigApplyOutcome> {
  const depth = getSubmoduleDepth();
  const { submodules, isComplete } = await collectSubmodules(repositoryRoot, depth);
  if (!isComplete) {
    extensionLogger.warn('Could not list the submodules');
  }

  const result = await setIdentityForSubmodules(submodules, userName, userEmail, signing, store);

  if (result.failed > 0) {
    extensionLogger.warn(`Failed to configure ${result.failed} submodule(s)`);
  }

  if (result.success > 0) {
    extensionLogger.info(`Configured ${result.success} submodule(s)`);
  }
  return { failedSubmoduleCount: result.failed, isSubmoduleListComplete: isComplete };
}

/**
 * Detect current identity from Git config
 * @param token Optional cancellation token for aborting the operation
 */
export async function detectCurrentIdentity(
  token?: vscodeTypes.CancellationToken
): Promise<Identity | undefined> {
  if (token?.isCancellationRequested) {
    return undefined;
  }

  const config = await getCurrentGitConfig(token);

  const userEmail = config['user.email'];
  if (token?.isCancellationRequested || userEmail.kind !== 'value') {
    return undefined;
  }

  // Match by email (most reliable)
  const email = userEmail.value;
  const identities = getIdentitiesWithValidation();
  return identities.find(i => i.email === email);
}

/**
 * Verify Git is available
 */
export async function isGitAvailable(): Promise<boolean> {
  try {
    // SECURITY: Using secureExec instead of exec
    await secureExec('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if current directory is a Git repository
 * @param token Optional cancellation token for aborting the operation
 */
export async function isGitRepository(
  token?: vscodeTypes.CancellationToken
): Promise<boolean> {
  if (token?.isCancellationRequested) {
    return false;
  }

  const result = await execGitInWorkspace(['rev-parse', '--is-inside-work-tree']);

  return !token?.isCancellationRequested && result === 'true';
}
