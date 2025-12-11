/**
 * Git Configuration Management
 *
 * Handles reading and writing Git config for user identity switching.
 * Uses workspace-level config when in a Git repository.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { Identity, formatGitAuthor, getIdentities } from './identity';

const execAsync = promisify(exec);

export interface GitConfig {
  userName?: string;
  userEmail?: string;
  signingKey?: string;
}

/**
 * Execute a git command in the current workspace
 */
async function execGit(command: string): Promise<string> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error('No workspace folder open');
  }

  const cwd = workspaceFolder.uri.fsPath;

  try {
    const { stdout } = await execAsync(`git ${command}`, { cwd });
    return stdout.trim();
  } catch (error) {
    // Git command failed (e.g., config not set)
    return '';
  }
}

/**
 * Get current Git configuration
 */
export async function getCurrentGitConfig(): Promise<GitConfig> {
  const [userName, userEmail, signingKey] = await Promise.all([
    execGit('config user.name'),
    execGit('config user.email'),
    execGit('config user.signingkey'),
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
 * Uses --local to set workspace-level config
 */
export async function setGitConfigForIdentity(identity: Identity): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error('No workspace folder open');
  }

  // Check if we're in a git repository
  const isGitRepo = await execGit('rev-parse --is-inside-work-tree');
  if (isGitRepo !== 'true') {
    throw new Error('Not in a Git repository');
  }

  // Set user.name (with emoji prefix if provided)
  const userName = identity.icon
    ? `${identity.icon} ${identity.name}`
    : identity.name;
  await execGit(`config --local user.name "${userName}"`);

  // Set user.email
  await execGit(`config --local user.email "${identity.email}"`);

  // Set GPG signing key if available
  if (identity.gpgKeyId) {
    await execGit(`config --local user.signingkey "${identity.gpgKeyId}"`);
    await execGit('config --local commit.gpgsign true');
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
    await execAsync('git --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if current directory is a Git repository
 */
export async function isGitRepository(): Promise<boolean> {
  const result = await execGit('rev-parse --is-inside-work-tree');
  return result === 'true';
}
