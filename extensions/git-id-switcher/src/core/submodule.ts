/**
 * Git Submodule Management
 *
 * Handles detection and configuration of Git submodules.
 * Allows identity settings to propagate to all submodules.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 *
 * Note: Uses vscodeLoader for lazy loading VS Code APIs to enable unit testing.
 */

import { getWorkspace } from './vscodeLoader';
import { gitExec, gitExecRaw } from '../secureExec';
import { validateSubmodulePath, validateWorkspacePath } from '../pathUtils';
import { securityLogger } from '../securityLogger';

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
 * Valid status characters for git submodule status output.
 * ' ' = initialized, '-' = uninitialized, '+' = modified
 */
const VALID_STATUS_CHARS = new Set([' ', '-', '+']);

/**
 * Valid characters for SHA-1 commit hash (lowercase hex only).
 */
const HEX_CHARS = new Set('0123456789abcdef');

/**
 * Check if a code point is a control character (0x00-0x1f or 0x7f).
 */
function isControlCodePoint(codePoint: number): boolean {
  return codePoint <= 0x1f || codePoint === 0x7f;
}

/**
 * Check if a string contains any control characters.
 * Linear time O(n), no backtracking possible.
 */
function hasControlChars(str: string): boolean {
  for (const char of str) {
    const codePoint = char.codePointAt(0);
    /* c8 ignore next 3 - Defense-in-depth: git output shouldn't contain control chars */
    if (codePoint !== undefined && isControlCodePoint(codePoint)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a string is a valid 40-character lowercase hex SHA-1 hash.
 * Linear time O(n), no regex needed.
 */
function isValidCommitHash(str: string): boolean {
  if (str.length !== 40) return false;
  for (const char of str) {
    if (!HEX_CHARS.has(char)) return false;
  }
  return true;
}

/**
 * Strip optional branch suffix " (branch-name)" from the end of a string.
 * Returns the path portion without the branch suffix.
 * Linear time O(n), scans from end to find matching parentheses.
 */
function stripBranchSuffix(str: string): string {
  // Must end with ')'
  if (!str.endsWith(')')) return str;

  // Find matching '(' scanning backwards
  let parenDepth = 0;
  let branchStart = -1;

  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i];
    if (char === ')') {
      parenDepth++;
    } else if (char === '(') {
      parenDepth--;
      if (parenDepth === 0) {
        branchStart = i;
        break;
      }
    }
  }

  // No matching '(' found
  if (branchStart === -1) return str;

  // Check for space before '('
  if (branchStart > 0 && str[branchStart - 1] === ' ') {
    // Validate branch name has no control characters
    const branchName = str.slice(branchStart + 1, -1);
    if (!hasControlChars(branchName)) {
      return str.slice(0, branchStart - 1);
    }
  }
  /* c8 ignore start - Defense-in-depth: malformed branch suffix edge case */
  return str;
}
/* c8 ignore stop */

/**
 * Parse and validate a single submodule entry from git status output.
 * Uses pure string operations to prevent ReDoS vulnerabilities.
 *
 * Format: "<status><commit> <path> (<branch>)" or "<status><commit> <path>"
 * - status: single character (' ' = initialized, '-' = uninitialized, '+' = modified)
 * - commit: 40-character hex SHA-1 hash
 * - path: submodule path (no control characters)
 * - branch: optional branch name in parentheses
 *
 * @internal
 */
function parseSubmoduleEntry(
  line: string,
  workspacePath: string
): Submodule | null {
  // Minimum valid line: status(1) + hash(40) + space(1) + path(1) = 43 chars
  if (line.length < 43) {
    /* c8 ignore start - Short/empty lines from git output */
    if (line.trim()) {
      securityLogger.logValidationFailure(
        'submoduleStatusLine',
        'Line too short for valid submodule status'
      );
    }
    return null;
    /* c8 ignore stop */
  }

  // Extract status character (position 0)
  const status = line[0];
  /* c8 ignore start - Invalid status from malformed git output */
  if (!VALID_STATUS_CHARS.has(status)) {
    securityLogger.logValidationFailure(
      'submoduleStatus',
      'Invalid status character'
    );
    return null;
  }
  /* c8 ignore stop */
  const initialized = status !== '-';

  // Extract commit hash (positions 1-40)
  const commitHash = line.slice(1, 41);
  /* c8 ignore start - Invalid hash from malformed git output */
  if (!isValidCommitHash(commitHash)) {
    securityLogger.logValidationFailure(
      'submoduleCommitHash',
      'Invalid commit hash format'
    );
    return null;
  }
  /* c8 ignore stop */

  // Find first whitespace after commit hash
  let pathStart = 41;
  while (pathStart < line.length && (line[pathStart] === ' ' || line[pathStart] === '\t')) {
    pathStart++;
  }

  // Extract remainder and strip branch suffix
  const remainder = line.slice(pathStart);
  const submodulePath = stripBranchSuffix(remainder);

  // Validate path is not empty
  /* c8 ignore start - Empty path from malformed git output */
  if (submodulePath.length === 0) {
    securityLogger.logValidationFailure(
      'submodulePath',
      'Empty submodule path'
    );
    return null;
  }
  /* c8 ignore stop */

  /* c8 ignore start - Defense-in-depth: git output shouldn't contain control chars */
  // Validate path has no control characters
  if (hasControlChars(submodulePath)) {
    securityLogger.logValidationFailure(
      'submodulePath',
      'Path contains control characters'
    );
    return null;
  }
  /* c8 ignore stop */

  /* c8 ignore start - Regex already ensures 40 chars, but defensive check */
  // SECURITY: Defensive check for commit hash length
  if (commitHash.length !== 40) {
    securityLogger.logValidationFailure(
      'submoduleCommitHash',
      `Invalid commit hash length: ${commitHash.length} (expected 40)`,
      commitHash
    );
    return null;
  }
  /* c8 ignore stop */

  // Skip uninitialized submodules
  /* c8 ignore start - Uninitialized submodule edge case (requires mock git output with '-' prefix) */
  if (!initialized) {
    return null;
  }
  /* c8 ignore stop */

  // SECURITY: Validate and normalize submodule path
  const pathResult = validateSubmodulePath(submodulePath, workspacePath);
  /* c8 ignore start - Path validation failure edge case (requires mock git output with invalid path) */
  if (!pathResult.valid || !pathResult.normalizedPath) {
    securityLogger.logValidationFailure(
      'submodulePath',
      pathResult.reason ?? 'Unknown validation failure',
      submodulePath
    );
    return null;
  }
  /* c8 ignore stop */

  return {
    path: submodulePath,
    absolutePath: pathResult.normalizedPath,
    commitHash,
    initialized,
  };
}

/**
 * List all submodules in the workspace
 *
 * Uses `git submodule status` to get submodule information.
 * Only returns initialized submodules with validated paths.
 */
export async function listSubmodules(workspacePath: string): Promise<Submodule[]> {
  // SECURITY: Validate workspace path before use
  // Use validateWorkspacePath instead of normalizeAndValidatePath because
  // VS Code provides workspace paths in platform-native format (Windows: C:\...)
  const workspaceValidation = validateWorkspacePath(workspacePath, {
    requireExists: true,
  });

  if (!workspaceValidation.valid || !workspaceValidation.normalizedPath) {
    securityLogger.logValidationFailure(
      'submoduleWorkspace',
      workspaceValidation.reason ?? 'Invalid workspace path'
    );
    return [];
  }

  const validatedWorkspacePath = workspaceValidation.normalizedPath;

  const result = await gitExecRaw(['submodule', 'status'], validatedWorkspacePath);

  /* c8 ignore start - Git command failures (various error conditions) */
  if (!result.success) {
    // SECURITY: Log unexpected errors (except ENOENT for non-git directories)
    const errorCode = (result.error as NodeJS.ErrnoException).code;
    if (errorCode !== 'ENOENT' && errorCode !== undefined) {
      securityLogger.logValidationFailure(
        'submoduleList',
        `Failed to list submodules: ${errorCode}`
      );
    }
    return [];
  }
  /* c8 ignore stop */

  const stdout = result.stdout;
  if (!stdout.trim()) {
    return [];
  }

  const lines = stdout.split('\n');
  const submodules: Submodule[] = [];

  for (const line of lines) {
    const submodule = parseSubmoduleEntry(line, validatedWorkspacePath);
    if (submodule) {
      submodules.push(submodule);
    }
  }

  return submodules;
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

  /* c8 ignore start - Depth validation warnings (edge cases) */
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
  /* c8 ignore stop */

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
  // SECURITY: Using gitExec with array args prevents command injection
  // The key and value are passed as separate array elements, not interpolated
  const result = await gitExec(['config', '--local', key, value], submodulePath);

  if (!result.success) {
    // Log failure through security logger (sanitizes path)
    // Note: gitExec already logs the error, but we add context about the submodule operation
    securityLogger.logValidationFailure(
      `submoduleGitConfig.${key}`,
      'Failed to set git config in submodule',
      submodulePath
    );
    return false;
  }

  return true;
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
    } catch /* c8 ignore start */ {
      failed++;
    } /* c8 ignore stop */
  });

  await Promise.all(promises);

  return { success, failed };
}

/**
 * Check if submodule support is enabled in settings
 * Returns true by default if VS Code API is not available (for testing)
 */
export function isSubmoduleSupportEnabled(): boolean {
  const workspace = getWorkspace();
  if (!workspace) {
    return true; // Default to enabled for testing
  }
  const config = workspace.getConfiguration('gitIdSwitcher');
  return config.get<boolean>('applyToSubmodules', true);
}

/**
 * Get configured submodule depth
 *
 * SECURITY: Returns value clamped to MAX_SUBMODULE_DEPTH (5) to prevent DoS.
 * Invalid or negative values default to 1.
 * Returns 1 if VS Code API is not available (for testing).
 */
export function getSubmoduleDepth(): number {
  const workspace = getWorkspace();
  if (!workspace) {
    return 1; // Default depth for testing
  }
  const config = workspace.getConfiguration('gitIdSwitcher');
  const configuredDepth = config.get<number>('submoduleDepth', 1);

  // SECURITY: Clamp to valid range [0, MAX_SUBMODULE_DEPTH]
  const clampedDepth = Math.min(Math.max(0, configuredDepth), MAX_SUBMODULE_DEPTH);

  /* c8 ignore start - Depth clamping validation logging (edge case) */
  // Log if configured value was outside valid range
  if (configuredDepth !== clampedDepth) {
    securityLogger.logValidationFailure(
      'submoduleDepth',
      `Configured depth ${configuredDepth} clamped to ${clampedDepth} (max: ${MAX_SUBMODULE_DEPTH})`,
      configuredDepth
    );
  }
  /* c8 ignore stop */

  return clampedDepth;
}

/**
 * Get the maximum allowed submodule depth (currently 5)
 * Exposed for testing and documentation purposes.
 */
export function getMaxSubmoduleDepth(): number {
  return MAX_SUBMODULE_DEPTH;
}
