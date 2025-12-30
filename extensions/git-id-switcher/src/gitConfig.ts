/**
 * Git Configuration Management
 *
 * Handles reading and writing Git config for user identity switching.
 * Uses workspace-level config when in a Git repository.
 * Supports propagating config to submodules.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 * @see https://owasp.org/www-community/attacks/Command_Injection
 */

import * as vscode from 'vscode';
import { Identity, formatGitAuthor, getIdentities } from './identity';
import { gitExec, secureExec } from './secureExec';
import { validateIdentity } from './validation';
import {
  listSubmodulesRecursive,
  setIdentityForSubmodules,
  isSubmoduleSupportEnabled,
  getSubmoduleDepth,
} from './submodule';
import { createValidationError, createConfigError } from './errors';

/**
 * Check if icon should be included in Git config user.name
 * @returns true if icon should be included, false otherwise (default: false)
 */
function shouldIncludeIconInGitConfig(): boolean {
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
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
 * Execute a git command in the current workspace
 *
 * @param args - Git arguments as array (NOT a string command)
 */
async function execGitInWorkspace(args: string[]): Promise<string> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw createConfigError('No workspace folder open');
  }

  const cwd = workspaceFolder.uri.fsPath;
  return gitExec(args, cwd);
}

/**
 * Get current Git configuration
 */
export async function getCurrentGitConfig(): Promise<GitConfig> {
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

/**
 * Set Git user configuration for an identity
 *
 * Uses --local to set workspace-level config.
 * Optionally propagates to submodules if enabled.
 *
 * SECURITY: Validates identity before applying config
 */
export async function setGitConfigForIdentity(identity: Identity): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw createConfigError('No workspace folder open');
  }

  // SECURITY: Validate identity before use
  const validation = validateIdentity(identity);
  if (!validation.valid) {
    // SECURITY: Don't expose validation details to users
    throw createValidationError('Invalid identity configuration', {
      field: 'identity',
      context: { errorCount: validation.errors.length },
    });
  }

  // Check if we're in a git repository
  const isGitRepo = await execGitInWorkspace(['rev-parse', '--is-inside-work-tree']);
  if (isGitRepo !== 'true') {
    throw createConfigError('Not in a Git repository');
  }

  const cwd = workspaceFolder.uri.fsPath;

  // Set user.name (icon is only included if includeIconInGitConfig is true)
  const userName = buildGitUserName(identity);

  // SECURITY: Using gitExec with array args prevents command injection
  await gitExec(['config', '--local', 'user.name', userName], cwd);

  // Set user.email
  await gitExec(['config', '--local', 'user.email', identity.email], cwd);

  // Set GPG signing key if available
  if (identity.gpgKeyId) {
    await gitExec(['config', '--local', 'user.signingkey', identity.gpgKeyId], cwd);
    await gitExec(['config', '--local', 'commit.gpgsign', 'true'], cwd);
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
 */
export async function detectCurrentIdentity(): Promise<Identity | undefined> {
  const config = await getCurrentGitConfig();

  if (!config.userEmail) {
    return undefined;
  }

  // Match by email (most reliable)
  const identities = getIdentities();
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
 */
export async function isGitRepository(): Promise<boolean> {
  const result = await execGitInWorkspace(['rev-parse', '--is-inside-work-tree']);
  return result === 'true';
}
