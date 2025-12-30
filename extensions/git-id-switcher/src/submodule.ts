/**
 * Git Submodule Management
 *
 * Handles detection and configuration of Git submodules.
 * Allows identity settings to propagate to all submodules.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 * @see https://owasp.org/www-community/attacks/Command_Injection
 */

import * as vscode from 'vscode';
import { gitExec } from './secureExec';
import { validateSubmodulePath } from './pathUtils';
import { getUserSafeMessage } from './errors';
import { securityLogger } from './securityLogger';

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
 * List all submodules in the workspace
 *
 * Uses `git submodule status` to get submodule information.
 * Only returns initialized submodules.
 */
export async function listSubmodules(workspacePath: string): Promise<Submodule[]> {
  try {
    // SECURITY: Using gitExec with array args
    const stdout = await gitExec(['submodule', 'status'], workspacePath);

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
          // SECURITY: Validate and normalize submodule path to prevent path traversal
          const pathResult = validateSubmodulePath(submodulePath, workspacePath);
          if (pathResult.valid && pathResult.normalizedPath) {
            submodules.push({
              path: submodulePath,
              absolutePath: pathResult.normalizedPath,
              commitHash,
              initialized,
            });
          } else {
            // Log security violation but don't throw (fail gracefully)
            console.warn(
              `Security: Invalid submodule path rejected: ${submodulePath} - ${pathResult.reason}`
            );
          }
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
 *
 * SECURITY: Uses gitExec with array args to prevent command injection
 *
 * @param submodulePath - Absolute path to the submodule
 * @param key - Git config key (e.g., 'user.name')
 * @param value - Git config value
 */
export async function setSubmoduleGitConfig(
  submodulePath: string,
  key: string,
  value: string
): Promise<boolean> {
  try {
    // SECURITY: Using gitExec with array args prevents command injection
    // The key and value are passed as separate array elements, not interpolated
    await gitExec(['config', '--local', key, value], submodulePath);
    return true;
  } catch (error) {
    // SECURITY: Use getUserSafeMessage and sanitize path to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    const sanitizedPath = securityLogger.sanitizePath(submodulePath);
    console.error(`Failed to set ${key} in ${sanitizedPath}: ${safeMessage}`);
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
