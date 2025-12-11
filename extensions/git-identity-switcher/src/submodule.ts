/**
 * Git Submodule Management
 *
 * Handles detection and configuration of Git submodules.
 * Allows identity settings to propagate to all submodules.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as vscode from 'vscode';

const execAsync = promisify(exec);

export interface Submodule {
  /** Relative path from workspace root */
  path: string;
  /** Absolute path */
  absolutePath: string;
  /** Current commit hash */
  commitHash: string;
  /** Whether the submodule is initialized */
  initialized: boolean;
}

/**
 * Execute a git command in the specified directory
 */
async function execGitIn(cwd: string, command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`git ${command}`, { cwd });
    return stdout.trim();
  } catch (error) {
    return '';
  }
}

/**
 * List all submodules in the workspace
 *
 * Uses `git submodule status` to get submodule information.
 * Only returns initialized submodules.
 */
export async function listSubmodules(workspacePath: string): Promise<Submodule[]> {
  try {
    const { stdout } = await execAsync('git submodule status', { cwd: workspacePath });

    if (!stdout.trim()) {
      return [];
    }

    const lines = stdout.trim().split('\n');
    const submodules: Submodule[] = [];

    for (const line of lines) {
      // Format: " <commit> <path> (<branch>)" or "-<commit> <path>" (uninitialized)
      // The first character indicates status:
      // ' ' = initialized
      // '-' = not initialized
      // '+' = commit doesn't match
      const match = line.match(/^([ +-])([a-f0-9]+)\s+(.+?)(?:\s+\(.+\))?$/);

      if (match) {
        const [, status, commitHash, submodulePath] = match;
        const initialized = status !== '-';

        if (initialized) {
          submodules.push({
            path: submodulePath,
            absolutePath: path.join(workspacePath, submodulePath),
            commitHash,
            initialized,
          });
        }
      }
    }

    return submodules;
  } catch (error) {
    // Not a git repository or no submodules
    return [];
  }
}

/**
 * List submodules recursively up to a specified depth
 */
export async function listSubmodulesRecursive(
  workspacePath: string,
  maxDepth: number = 1,
  currentDepth: number = 0
): Promise<Submodule[]> {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const submodules = await listSubmodules(workspacePath);
  const allSubmodules: Submodule[] = [...submodules];

  // Recursively get nested submodules
  for (const submodule of submodules) {
    const nestedSubmodules = await listSubmodulesRecursive(
      submodule.absolutePath,
      maxDepth,
      currentDepth + 1
    );
    allSubmodules.push(...nestedSubmodules);
  }

  return allSubmodules;
}

/**
 * Set Git config for a submodule
 */
export async function setSubmoduleGitConfig(
  submodulePath: string,
  key: string,
  value: string
): Promise<boolean> {
  try {
    await execGitIn(submodulePath, `config --local ${key} "${value}"`);
    return true;
  } catch (error) {
    console.error(`Failed to set ${key} in ${submodulePath}:`, error);
    return false;
  }
}

/**
 * Set identity config for all submodules
 *
 * Sets user.name, user.email, and optionally GPG signing key.
 * Returns the number of successfully configured submodules.
 */
export async function setIdentityForSubmodules(
  submodules: Submodule[],
  userName: string,
  userEmail: string,
  gpgKeyId?: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  const promises = submodules.map(async (submodule) => {
    try {
      // Set user.name
      const nameResult = await setSubmoduleGitConfig(
        submodule.absolutePath,
        'user.name',
        userName
      );

      // Set user.email
      const emailResult = await setSubmoduleGitConfig(
        submodule.absolutePath,
        'user.email',
        userEmail
      );

      // Set GPG key if provided
      let gpgResult = true;
      if (gpgKeyId) {
        gpgResult = await setSubmoduleGitConfig(
          submodule.absolutePath,
          'user.signingkey',
          gpgKeyId
        );

        if (gpgResult) {
          await setSubmoduleGitConfig(
            submodule.absolutePath,
            'commit.gpgsign',
            'true'
          );
        }
      }

      if (nameResult && emailResult && gpgResult) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  });

  await Promise.all(promises);

  return { success, failed };
}

/**
 * Check if submodule support is enabled in settings
 */
export function isSubmoduleSupportEnabled(): boolean {
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  return config.get<boolean>('applyToSubmodules', true);
}

/**
 * Get configured submodule depth
 */
export function getSubmoduleDepth(): number {
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  return config.get<number>('submoduleDepth', 1);
}
