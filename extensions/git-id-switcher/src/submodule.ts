/**
 * Git Submodule Management
 *
 * Handles detection and configuration of Git submodules.
 * Allows identity settings to propagate to all submodules.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 */

import * as vscode from 'vscode';
import { gitExec } from './secureExec';
import { validateSubmodulePath, normalizeAndValidatePath } from './pathUtils';
import { securityLogger } from './securityLogger';

/**
 * Maximum allowed submodule recursion depth to prevent DoS attacks.
 * Deep nesting of submodules can cause performance issues and potential attacks.
 * This value matches the maximum defined in package.json configuration.
 */
const MAX_SUBMODULE_DEPTH = 5;

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
 * Regex pattern for parsing git submodule status output.
 *
 * Format: "<status><commit> <path> (<branch>)" or "<status><commit> <path>"
 * - status: single character (' ' = initialized, '-' = uninitialized, '+' = modified)
 * - commit: 40-character hex SHA-1 hash
 * - path: submodule path (no control characters, validated separately)
 * - branch: optional branch name in parentheses
 *
 * Security considerations:
 * - Commit hash is strictly 40 hex characters (SHA-1), lowercase only
 * - Path is captured conservatively (non-greedy) and validated separately
 * - Branch name is optional and not used for security-sensitive operations
 * - Path must be at least 1 character (non-empty)
 * - Branch name (if present) must not contain newlines or control characters
 */
// Control characters are intentionally excluded for security
// eslint-disable-next-line no-control-regex
const SUBMODULE_STATUS_REGEX = /^([ +-])([a-f0-9]{40})\s+([^\x00-\x1f\x7f]+?)(?:\s+\([^\x00-\x1f\x7f)]+\))?$/;

/**
 * List all submodules in the workspace
 *
 * Uses `git submodule status` to get submodule information.
 * Only returns initialized submodules with validated paths.
 */
export async function listSubmodules(workspacePath: string): Promise<Submodule[]> {
  // SECURITY: Validate workspace path before use
  // This prevents path traversal if workspacePath itself is malicious
  const workspaceValidation = normalizeAndValidatePath(workspacePath, {
    resolveSymlinks: false, // Don't resolve workspace symlinks (performance)
    requireExists: true, // Workspace must exist
  });

  if (!workspaceValidation.valid || !workspaceValidation.normalizedPath) {
    securityLogger.logValidationFailure(
      'submoduleWorkspace',
      workspaceValidation.reason ?? 'Invalid workspace path',
      undefined
    );
    return [];
  }

  const validatedWorkspacePath = workspaceValidation.normalizedPath;

  try {
    // SECURITY: Using gitExec with array args
    const stdout = await gitExec(['submodule', 'status'], validatedWorkspacePath);

    if (!stdout.trim()) {
      return [];
    }

    const lines = stdout.trim().split('\n');
    const submodules: Submodule[] = [];

    for (const line of lines) {
      // SECURITY: Use strict regex pattern for parsing
      const match = line.match(SUBMODULE_STATUS_REGEX);

      if (match) {
        const [, status, commitHash, submodulePath] = match;
        const initialized = status !== '-';

        // SECURITY: Double-check commit hash length (regex already validates, but defensive)
        // This prevents potential regex bypass or malformed input
        if (commitHash.length !== 40) {
          securityLogger.logValidationFailure(
            'submoduleCommitHash',
            `Invalid commit hash length: ${commitHash.length} (expected 40)`,
            commitHash
          );
          continue;
        }

        if (initialized) {
          // SECURITY: Validate and normalize submodule path to prevent path traversal
          // This also checks for symlink escapes
          // Use validated workspace path (not original) for consistency
          const pathResult = validateSubmodulePath(submodulePath, validatedWorkspacePath);
          if (pathResult.valid && pathResult.normalizedPath) {
            submodules.push({
              path: submodulePath,
              absolutePath: pathResult.normalizedPath,
              commitHash,
              initialized,
            });
          } else {
            // Log security violation through security logger
            securityLogger.logValidationFailure(
              'submodulePath',
              pathResult.reason ?? 'Unknown validation failure',
              submodulePath
            );
          }
        }
      } else if (line.trim()) {
        // Line didn't match expected format - potential malformed input
        securityLogger.logValidationFailure(
          'submoduleStatusLine',
          'Unexpected git submodule status line format',
          undefined
        );
      }
    }

    return submodules;
  } catch (error) {
    // SECURITY: Log unexpected errors for security auditing
    // Don't expose full error details to prevent information leakage
    const errorCode = (error as NodeJS.ErrnoException).code;
    if (errorCode !== 'ENOENT' && errorCode !== undefined) {
      // Only log non-ENOENT errors (ENOENT is expected for non-git directories)
      securityLogger.logValidationFailure(
        'submoduleList',
        `Failed to list submodules: ${errorCode}`,
        undefined
      );
    }
    // Not a git repository or no submodules - return empty array
    return [];
  }
}

/**
 * List submodules recursively up to a specified depth
 *
 * SECURITY: Enforces maximum depth limit to prevent DoS attacks
 * through deeply nested submodules.
 *
 * @param workspacePath - Path to the workspace root
 * @param maxDepth - Maximum recursion depth (clamped to MAX_SUBMODULE_DEPTH)
 * @param currentDepth - Current recursion depth (internal use)
 */
export async function listSubmodulesRecursive(
  workspacePath: string,
  maxDepth: number = 1,
  currentDepth: number = 0
): Promise<Submodule[]> {
  // SECURITY: Enforce maximum depth limit to prevent DoS
  // Clamp maxDepth to valid range [0, MAX_SUBMODULE_DEPTH]
  const effectiveMaxDepth = Math.min(Math.max(0, maxDepth), MAX_SUBMODULE_DEPTH);

  // Log warning on first call if requested depth is outside valid range
  if (currentDepth === 0) {
    if (maxDepth > MAX_SUBMODULE_DEPTH) {
      securityLogger.logValidationFailure(
        'submoduleDepth',
        `Requested depth ${maxDepth} exceeds maximum allowed (${MAX_SUBMODULE_DEPTH}), clamped to ${effectiveMaxDepth}`,
        maxDepth
      );
    } else if (maxDepth < 0) {
      securityLogger.logValidationFailure(
        'submoduleDepth',
        `Requested depth ${maxDepth} is negative, clamped to ${effectiveMaxDepth}`,
        maxDepth
      );
    }
  }

  if (currentDepth >= effectiveMaxDepth) {
    return [];
  }

  const submodules = await listSubmodules(workspacePath);
  const allSubmodules: Submodule[] = [...submodules];

  // Recursively get nested submodules
  for (const submodule of submodules) {
    const nestedSubmodules = await listSubmodulesRecursive(
      submodule.absolutePath,
      effectiveMaxDepth,
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
    // Log failure through security logger (sanitizes path)
    securityLogger.logValidationFailure(
      `submoduleGitConfig.${key}`,
      'Failed to set git config in submodule',
      submodulePath
    );
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
 *
 * SECURITY: Returns value clamped to MAX_SUBMODULE_DEPTH (5) to prevent DoS.
 * Invalid or negative values default to 1.
 */
export function getSubmoduleDepth(): number {
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  const configuredDepth = config.get<number>('submoduleDepth', 1);

  // SECURITY: Clamp to valid range [0, MAX_SUBMODULE_DEPTH]
  const clampedDepth = Math.min(Math.max(0, configuredDepth), MAX_SUBMODULE_DEPTH);

  // Log if configured value was outside valid range
  if (configuredDepth !== clampedDepth) {
    securityLogger.logValidationFailure(
      'submoduleDepth',
      `Configured depth ${configuredDepth} clamped to ${clampedDepth} (max: ${MAX_SUBMODULE_DEPTH})`,
      configuredDepth
    );
  }

  return clampedDepth;
}

/**
 * Get the maximum allowed submodule depth (currently 5)
 * Exposed for testing and documentation purposes.
 */
export function getMaxSubmoduleDepth(): number {
  return MAX_SUBMODULE_DEPTH;
}
