/**
 * Git Configuration Management
 *
 * Handles reading and writing Git config for user identity switching.
 * Uses workspace-level config when in a Git repository.
 * Supports propagating config to submodules.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 * @see https://owasp.org/www-community/attacks/Command_Injection
 *
 * Note: Uses vscodeLoader for lazy loading VS Code APIs to enable unit testing.
 */

// Type-only import for TypeScript (stripped at compile time)
import type * as vscodeTypes from 'vscode';
import { getVSCode, getWorkspace } from './vscodeLoader';
import { Identity, formatGitAuthor, getIdentitiesWithValidation } from '../identity';
import { gitExec, secureExec } from '../secureExec';
import { validateIdentity } from '../validation';
import {
  listSubmodulesRecursive,
  setIdentityForSubmodules,
  isSubmoduleSupportEnabled,
  getSubmoduleDepth,
} from './submodule';
import { createValidationError, createConfigError } from './errors';

/**
 * Get localized string using VS Code l10n API
 * Falls back to the original string if VS Code API is not available
 */
function t(message: string): string {
  const vscode = getVSCode();
  return vscode?.l10n?.t(message) ?? message;
}

/**
 * Check if icon should be included in Git config user.name
 * @returns true if icon should be included, false otherwise (default: false)
 */
function shouldIncludeIconInGitConfig(): boolean {
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
  if (identity.icon && shouldIncludeIconInGitConfig()) {
    return `${identity.icon} ${identity.name}`;
  }
  return identity.name;
}

export interface GitConfig {
  userName?: string;
  userEmail?: string;
  signingKey?: string;
}

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
 * Execute a git command in the current workspace, throwing on failure
 *
 * @param args - Git arguments as array (NOT a string command)
 * @throws Error if command fails
 */
async function execGitInWorkspaceOrThrow(args: string[]): Promise<void> {
  const cwd = getWorkspacePath();
  const result = await gitExec(args, cwd);
  if (!result.success) {
    throw result.error;
  }
}

/**
 * Get current Git configuration
 * @param token Optional cancellation token for aborting the operation
 */
export async function getCurrentGitConfig(
  token?: vscodeTypes.CancellationToken
): Promise<GitConfig> {
  if (token?.isCancellationRequested) {
    return { userName: undefined, userEmail: undefined, signingKey: undefined };
  }

  // If no token provided, execute normally
  if (!token) {
    const [userName, userEmail, signingKey] = await Promise.all([
      execGitInWorkspace(['config', 'user.name']),
      execGitInWorkspace(['config', 'user.email']),
      execGitInWorkspace(['config', 'user.signingkey']),
    ]);

    return {
      userName: userName || undefined,
      userEmail: userEmail || undefined,
      signingKey: signingKey || undefined,
    };
  }

  // With cancellation token: race the operations against cancellation
  const configPromise = Promise.all([
    execGitInWorkspace(['config', 'user.name']),
    execGitInWorkspace(['config', 'user.email']),
    execGitInWorkspace(['config', 'user.signingkey']),
  ]);

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
    const [userName, userEmail, signingKey] = await Promise.race([
      configPromise,
      cancellationPromise,
    ]);

    return {
      userName: userName || undefined,
      userEmail: userEmail || undefined,
      signingKey: signingKey || undefined,
    };
  } catch (error) {
    // If cancelled, return empty config
    if (token.isCancellationRequested) {
      return { userName: undefined, userEmail: undefined, signingKey: undefined };
    }
    // Re-throw other errors
    throw error;
  } finally {
    // Always clean up the event listener to prevent memory leaks
    disposable?.dispose();
  }
}

/**
 * Set Git user configuration for an identity
 *
 * Uses --local to set workspace-level config.
 * Optionally propagates to submodules if enabled.
 *
 * SECURITY: Validates identity before applying config
 */
export async function setGitConfigForIdentity(identity: Identity): Promise<void> {
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

  // Check if we're in a git repository
  const isGitRepo = await execGitInWorkspace(['rev-parse', '--is-inside-work-tree']);
  if (isGitRepo !== 'true') {
    throw createConfigError(t('Not in a Git repository'));
  }

  // Set user.name (icon is only included if includeIconInGitConfig is true)
  const userName = buildGitUserName(identity);

  // SECURITY: Using execGitInWorkspaceOrThrow with array args prevents command injection
  await execGitInWorkspaceOrThrow(['config', '--local', 'user.name', userName]);

  // Set user.email
  await execGitInWorkspaceOrThrow(['config', '--local', 'user.email', identity.email]);

  // Set GPG signing key if available
  if (identity.gpgKeyId) {
    await execGitInWorkspaceOrThrow(['config', '--local', 'user.signingkey', identity.gpgKeyId]);
    await execGitInWorkspaceOrThrow(['config', '--local', 'commit.gpgsign', 'true']);
  }

  // Propagate to submodules if enabled
  if (isSubmoduleSupportEnabled()) {
    await propagateToSubmodules(workspaceFolder.uri.fsPath, identity);
  }
}

/**
 * Propagate identity config to all submodules
 */
async function propagateToSubmodules(
  workspacePath: string,
  identity: Identity
): Promise<void> {
  const depth = getSubmoduleDepth();
  const submodules = await listSubmodulesRecursive(workspacePath, depth);

  if (submodules.length === 0) {
    return;
  }

  // Use same logic as main repo (icon only if includeIconInGitConfig is true)
  const userName = buildGitUserName(identity);

  const result = await setIdentityForSubmodules(
    submodules,
    userName,
    identity.email,
    identity.gpgKeyId
  );

  if (result.failed > 0) {
    console.warn(
      `Git ID Switcher: Failed to configure ${result.failed} submodule(s)`
    );
  }

  if (result.success > 0) {
    console.log(
      `Git ID Switcher: Configured ${result.success} submodule(s)`
    );
  }
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

  if (token?.isCancellationRequested) {
    return undefined;
  }

  if (!config.userEmail) {
    return undefined;
  }

  // Match by email (most reliable)
  const identities = getIdentitiesWithValidation();
  return identities.find(i => i.email === config.userEmail);
}

/**
 * Get Git author string for commit --author flag
 */
export function getGitAuthorFlag(identity: Identity): string {
  return `--author="${formatGitAuthor(identity)}"`;
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

  if (token?.isCancellationRequested) {
    return false;
  }

  return result === 'true';
}
