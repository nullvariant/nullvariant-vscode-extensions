/**
 * Path Utilities for Secure Path Handling
 *
 * Provides path normalization, validation, and symlink resolution.
 * Designed to prevent path traversal and symlink-based attacks.
 *
 * This module re-exports functions from specialized modules:
 * - pathNormalizer.ts: Path normalization and tilde expansion
 * - pathSymlinkResolver.ts: Symlink resolution and detection
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import { PATH_MAX } from '../core/constants';
import { CONTROL_CHAR_REGEX_ALL, hasNullByte, hasInvisibleUnicode } from '../validators/common';

// Re-export from pathNormalizer.ts
export {
  NormalizePathOptions,
  NormalizedPathResult,
  expandTilde,
  normalizeAndValidatePath,
} from './pathNormalizer';

// Re-export from pathSymlinkResolver.ts
export {
  SymlinkResolutionResult,
  resolveSymlinksSecurely,
  containsSymlinks,
} from './pathSymlinkResolver';

// Import for internal use
import { normalizeAndValidatePath, NormalizedPathResult } from './pathNormalizer';

/**
 * Options for submodule path validation
 */
export interface ValidateSubmodulePathOptions {
  /**
   * Whether to verify symlinks don't escape workspace
   * Default: true (security-first)
   */
  verifySymlinks?: boolean;

  /**
   * Whether to require the submodule directory to exist
   * Default: false (submodule might not be initialized yet)
   */
  requireExists?: boolean;
}

/**
 * Validate an SSH key path specifically
 *
 * Performs path validation with symlink resolution enabled.
 * SSH keys can be stored in any location (not restricted to ~/.ssh or /etc/ssh).
 */
export function validateSshKeyPath(
  keyPath: string,
  options: { resolveSymlinks?: boolean; requireExists?: boolean; baseDir?: string } = {}
): NormalizedPathResult {
  // Validate path with symlink resolution enabled for SSH keys
  return normalizeAndValidatePath(keyPath, {
    ...options,
    resolveSymlinks: true, // Always resolve symlinks for SSH keys
  });
}

/**
 * Pre-validation checks for submodule path.
 * @internal
 */
function validateSubmodulePathPreChecks(
  submodulePath: string
): NormalizedPathResult | null {
  // Pre-check: submodule path should not be empty
  if (!submodulePath || submodulePath.trim().length === 0) {
    return {
      valid: false,
      originalPath: submodulePath,
      reason: 'Submodule path is empty',
    };
  }

  // Pre-check: submodule path should not be absolute
  if (path.isAbsolute(submodulePath)) {
    return {
      valid: false,
      originalPath: submodulePath,
      reason: 'Submodule path must be relative to workspace root',
    };
  }

  // Pre-check: submodule path should not contain control characters
  // SECURITY: Reject control characters (0x00-0x1f, 0x7f) to prevent injection attacks
  if (CONTROL_CHAR_REGEX_ALL.test(submodulePath)) {
    return {
      valid: false,
      originalPath: submodulePath,
      reason: 'Submodule path contains control characters',
    };
  }

  // Pre-check: submodule path length (before normalization)
  // SECURITY: Prevent extremely long paths that could cause DoS
  const inputByteLength = Buffer.byteLength(submodulePath, 'utf8');
  if (inputByteLength > PATH_MAX) {
    return {
      valid: false,
      originalPath: submodulePath,
      reason: `Submodule path exceeds maximum length (${inputByteLength} > ${PATH_MAX} bytes)`,
    };
  }

  return null; // All pre-checks passed
}

/**
 * Assert that normalized path is within workspace boundary.
 *
 * @remarks
 * **Naming convention**: Named with `assert` prefix because this function
 * returns an error result if the assertion fails (path escapes workspace),
 * or null if the assertion passes (path is within boundary).
 *
 * @internal
 */
function assertWithinWorkspaceBoundary(
  normalizedPath: string,
  workspacePath: string,
  originalPath: string
): NormalizedPathResult | null {
  const workspaceWithSep = workspacePath + path.sep;
  if (
    !normalizedPath.startsWith(workspaceWithSep) &&
    normalizedPath !== workspacePath
  ) {
    return {
      valid: false,
      originalPath,
      reason: 'Submodule path escapes workspace root after normalization',
    };
  }
  return null; // Within boundary
}

/**
 * Verify symlinks don't escape workspace.
 * @internal
 * @returns Resolved path result, or null if path doesn't exist (acceptable)
 */
function verifySubmoduleSymlinks(
  normalizedSubmodulePath: string,
  normalizedWorkspace: string,
  originalPath: string
): NormalizedPathResult | null {
  try {
    // SECURITY: Check if the path exists before trying to resolve symlinks
    fs.accessSync(normalizedSubmodulePath);

    // SECURITY: Resolve symlinks atomically to minimize TOCTOU window
    // Use validateWorkspacePath because normalizedSubmodulePath is in platform-native format
    // (Windows: D:\..., Unix: /...). normalizeAndValidatePath rejects Windows paths by design.
    // After validation, we use fs.realpathSync to resolve symlinks.
    const pathValidation = validateWorkspacePath(normalizedSubmodulePath, {
      requireExists: true,
    });

    /* c8 ignore start - Path validation failure during symlink verification */
    if (!pathValidation.valid || !pathValidation.normalizedPath) {
      return {
        valid: false,
        originalPath,
        reason: `Symlink resolution failed: ${pathValidation.reason ?? 'unknown error'}`,
        symlinksResolved: true,
      };
    }
    /* c8 ignore stop */

    // Resolve symlinks using fs.realpathSync
    let resolvedByRealpath: string;
    try {
      resolvedByRealpath = fs.realpathSync(pathValidation.normalizedPath);
    } catch /* c8 ignore start */ {
      return {
        valid: false,
        originalPath,
        reason: 'Symlink resolution failed: realpathSync error',
        symlinksResolved: true,
      };
    } /* c8 ignore stop */

    const resolvedPath = resolvedByRealpath;

    // SECURITY: Re-check workspace boundary after symlink resolution
    const boundaryCheck = assertWithinWorkspaceBoundary(resolvedPath, normalizedWorkspace, originalPath);
    if (boundaryCheck) {
      return {
        valid: false,
        originalPath,
        reason: 'Submodule symlink target escapes workspace root',
        symlinksResolved: true,
      };
    }

    // Return the symlink-resolved path for maximum security
    // symlinksResolved: true indicates verification was performed (even if no symlinks found)
    return {
      valid: true,
      originalPath,
      normalizedPath: resolvedPath,
      symlinksResolved: true,
    };
  } catch (error) /* c8 ignore start */ {
    // Path doesn't exist - that's OK, submodule might not be initialized
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      // Non-ENOENT errors are logged by caller if needed
    }
    return null; // Path doesn't exist, caller should return normalized path
  } /* c8 ignore stop */
}

/**
 * Validate a workspace path (platform-native format)
 *
 * Unlike normalizeAndValidatePath, this function accepts Windows paths
 * (drive letters and backslashes) because VS Code provides workspace
 * paths in platform-native format.
 *
 * SECURITY: This function still checks for:
 * - Null bytes
 * - Control characters
 * - Invisible Unicode characters
 * - Path length limits
 * - File existence (if requireExists)
 *
 * Note: Path traversal is checked after normalization via path.resolve(),
 * which resolves .. and . segments.
 *
 * @param workspacePath - The workspace path to validate (platform-native format)
 * @param options - Validation options
 * @returns NormalizedPathResult with validation status
 *
 * @example
 * // Unix path
 * validateWorkspacePath('/home/user/project')
 * // { valid: true, normalizedPath: '/home/user/project' }
 *
 * // Windows path
 * validateWorkspacePath('C:\\Users\\test\\project')
 * // { valid: true, normalizedPath: 'C:\\Users\\test\\project' }
 */
export function validateWorkspacePath(
  workspacePath: string,
  options: { requireExists?: boolean } = {}
): NormalizedPathResult {
  const { requireExists = false } = options;

  // Step 1: Basic input validation
  if (!workspacePath || workspacePath.length === 0) {
    return {
      valid: false,
      originalPath: workspacePath,
      reason: 'Workspace path is empty or undefined',
    };
  }

  // Step 2: Whitespace check (potential obfuscation)
  if (workspacePath !== workspacePath.trim()) {
    return {
      valid: false,
      originalPath: workspacePath,
      reason: 'Workspace path contains leading or trailing whitespace',
    };
  }

  // Step 3: Null byte check (common attack vector)
  if (hasNullByte(workspacePath)) {
    return {
      valid: false,
      originalPath: workspacePath,
      reason: 'Workspace path contains null byte',
    };
  }

  // Step 4: Control character check
  if (CONTROL_CHAR_REGEX_ALL.test(workspacePath)) {
    return {
      valid: false,
      originalPath: workspacePath,
      reason: 'Workspace path contains control characters',
    };
  }

  // Step 5: Invisible Unicode check
  if (hasInvisibleUnicode(workspacePath)) {
    return {
      valid: false,
      originalPath: workspacePath,
      reason: 'Workspace path contains invisible Unicode characters',
    };
  }

  // Step 6: Normalize the path using platform-native path.resolve()
  // This resolves . and .. segments and converts to absolute path
  const normalizedPath = path.resolve(workspacePath);

  // Step 7: PATH_MAX check (in bytes for Unicode safety)
  const byteLength = Buffer.byteLength(normalizedPath, 'utf8');
  if (byteLength > PATH_MAX) {
    return {
      valid: false,
      originalPath: workspacePath,
      reason: `Workspace path exceeds maximum length (${byteLength} > ${PATH_MAX} bytes)`,
    };
  }

  // Step 8: Existence check (if required)
  if (requireExists) {
    try {
      fs.accessSync(normalizedPath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      return {
        valid: false,
        originalPath: workspacePath,
        normalizedPath,
        reason: `Workspace path does not exist or is not accessible: ${code}`,
      };
    }
  }

  return {
    valid: true,
    originalPath: workspacePath,
    normalizedPath,
  };
}

/**
 * Validate a submodule path specifically
 *
 * Submodule paths come from git output and need special handling:
 * - Must be relative to workspace root
 * - Must not contain path traversal
 * - Must be normalized before joining with workspace path
 * - Symlinks must not escape workspace (if verifySymlinks is true)
 *
 * @param submodulePath - Relative path from git submodule status
 * @param workspacePath - Absolute path to workspace root
 * @param options - Validation options
 * @returns NormalizedPathResult with validation status
 */
export function validateSubmodulePath(
  submodulePath: string,
  workspacePath: string,
  options: ValidateSubmodulePathOptions = {}
): NormalizedPathResult {
  const { verifySymlinks = true, requireExists = false } = options;

  // First, validate the workspace path itself
  // Use validateWorkspacePath to accept platform-native paths (Windows drive letters, etc.)
  const workspaceResult = validateWorkspacePath(workspacePath, {
    requireExists: true,
  });

  if (!workspaceResult.valid) {
    return {
      valid: false,
      originalPath: submodulePath,
      reason: `Invalid workspace path: ${workspaceResult.reason ?? 'validation failed'}`,
    };
  }

  const normalizedWorkspace = workspaceResult.normalizedPath!;

  // Run pre-validation checks
  const preCheckResult = validateSubmodulePathPreChecks(submodulePath);
  if (preCheckResult) {
    return preCheckResult;
  }

  // Prepend './' to submodule paths that don't start with a recognized prefix
  // Git submodule paths are typically 'vendor/lib', not './vendor/lib'
  // isSecurePath requires paths to start with '/', '~/', or './'
  const prefixedSubmodulePath = submodulePath.startsWith('./')
    ? submodulePath
    : './' + submodulePath;

  // Normalize and validate the submodule path relative to workspace
  const result = normalizeAndValidatePath(prefixedSubmodulePath, {
    resolveSymlinks: false,
    requireExists: false,
    baseDir: normalizedWorkspace,
  });

  if (!result.valid) {
    return result;
  }

  const normalizedSubmodulePath = result.normalizedPath!;

  // SECURITY: Ensure the normalized path is still within workspace
  const boundaryCheck = assertWithinWorkspaceBoundary(normalizedSubmodulePath, normalizedWorkspace, submodulePath);
  /* c8 ignore start - Boundary escape after normalization (requires path traversal which is blocked earlier) */
  if (boundaryCheck) {
    return boundaryCheck;
  }
  /* c8 ignore stop */

  // Verify symlinks don't escape workspace (if enabled)
  if (verifySymlinks) {
    const symlinkResult = verifySubmoduleSymlinks(normalizedSubmodulePath, normalizedWorkspace, submodulePath);
    if (symlinkResult) {
      return symlinkResult;
    }
    // null means path doesn't exist, continue to requireExists check
  }

  // Optionally check if path exists
  if (requireExists) {
    try {
      fs.accessSync(normalizedSubmodulePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      return {
        valid: false,
        originalPath: submodulePath,
        normalizedPath: normalizedSubmodulePath,
        reason: `Submodule path does not exist: ${code}`,
      };
    }
  }

  return result;
}
