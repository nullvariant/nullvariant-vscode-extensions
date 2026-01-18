/**
 * Path Utilities for Secure Path Handling
 *
 * Provides path normalization, validation, and symlink resolution.
 * Designed to prevent path traversal and symlink-based attacks.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { isSecurePath, SecurePathResult } from './pathSecurity';
import { PATH_MAX } from './constants';
import { CONTROL_CHAR_REGEX_ALL, hasNullByte, hasPathTraversal, hasInvisibleUnicode } from './validators/common';

/**
 * Options for path normalization
 */
export interface NormalizePathOptions {
  /**
   * Whether to resolve symlinks using fs.realpathSync.native()
   * Default: false (for performance, enable for strict security)
   */
  resolveSymlinks?: boolean;

  /**
   * Whether to verify the path exists on filesystem
   * Default: false
   */
  requireExists?: boolean;

  /**
   * Base directory to resolve relative paths against
   * Default: process.cwd()
   */
  baseDir?: string;
}

/**
 * Result of path normalization and validation
 */
export interface NormalizedPathResult {
  valid: boolean;
  normalizedPath?: string;
  originalPath: string;
  reason?: string;
  /**
   * True if symlinks were resolved
   */
  symlinksResolved?: boolean;
}

/**
 * Expand ~ to home directory
 *
 * Only expands ~/ (current user), not ~user (other users)
 *
 * @param inputPath - Path that may start with ~
 * @returns Path with ~ expanded to home directory
 */
export function expandTilde(inputPath: string): string {
  if (!inputPath) {
    return inputPath;
  }

  // Only expand ~ or ~/
  if (inputPath === '~') {
    return os.homedir();
  }

  if (inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }

  // Do NOT expand ~user patterns (security risk)
  return inputPath;
}

/**
 * Validate path length against PATH_MAX.
 * @internal
 */
function validatePathLength(
  pathToCheck: string,
  inputPath: string,
  context: string
): NormalizedPathResult | null {
  const byteLength = Buffer.byteLength(pathToCheck, 'utf8');
  if (byteLength > PATH_MAX) {
    return {
      valid: false,
      originalPath: inputPath,
      reason: `${context} exceeds maximum length (${byteLength} > ${PATH_MAX} bytes)`,
    };
  }
  return null;
}

/**
 * Resolve symlinks securely and re-validate the result.
 * @internal
 * @returns Object with resolvedPath on success, or invalidResult if validation fails
 */
function resolveAndValidateSymlinks(
  normalizedPath: string,
  inputPath: string
): { resolvedPath: string; invalidResult?: undefined } | { resolvedPath?: undefined; invalidResult: NormalizedPathResult } {
  const symlinkResult = resolveSymlinksSecurely(normalizedPath);
  if (!symlinkResult.valid) {
    return { invalidResult: { valid: false, originalPath: inputPath, reason: symlinkResult.reason } };
  }

  const resolvedPath = symlinkResult.resolvedPath ?? normalizedPath;

  // Re-validate after symlink resolution
  const symlinkCheck = isSecurePathAfterNormalization(resolvedPath, inputPath);
  if (!symlinkCheck.valid) {
    return { invalidResult: { valid: false, originalPath: inputPath, reason: `Post-symlink check failed: ${symlinkCheck.reason}` } };
  }

  return { resolvedPath };
}

/**
 * Normalize and validate a path for security
 *
 * This function performs:
 * 1. Tilde expansion (~/ to home directory)
 * 2. Path normalization (resolve ., .., //)
 * 3. Security validation (path traversal, etc.)
 * 4. Optional symlink resolution
 *
 * @param inputPath - The path to normalize and validate
 * @param options - Normalization options
 * @returns NormalizedPathResult with validation status
 *
 * @example
 * const result = normalizeAndValidatePath('~/.ssh/id_rsa');
 * if (result.valid) {
 *   console.log(result.normalizedPath); // /home/user/.ssh/id_rsa
 * }
 */
export function normalizeAndValidatePath(
  inputPath: string,
  options: NormalizePathOptions = {}
): NormalizedPathResult {
  const { resolveSymlinks = false, requireExists = false, baseDir = process.cwd() } = options;

  // Step 1: Basic input validation
  if (!inputPath || inputPath.length === 0) {
    return { valid: false, originalPath: inputPath, reason: 'Path is empty or undefined' };
  }

  // Step 2: Check PATH_MAX before any processing
  const inputLengthCheck = validatePathLength(inputPath, inputPath, 'Path');
  if (inputLengthCheck) return inputLengthCheck;

  // Step 3: Pre-normalization security check on raw input
  const preCheck = isSecurePath(inputPath);
  if (!preCheck.valid) {
    return { valid: false, originalPath: inputPath, reason: `Pre-normalization check failed: ${preCheck.reason}` };
  }

  // Step 4: Expand tilde and resolve to absolute path
  const expandedPath = expandTilde(inputPath);
  const resolvedAbsolutePath = path.isAbsolute(expandedPath)
    ? path.resolve(expandedPath)
    : path.resolve(baseDir, expandedPath);

  // Step 5: Normalize the path (resolve ., .., //)
  let normalizedPath = path.normalize(resolvedAbsolutePath);

  // Step 5.5: Verify normalization consistency (defensive check)
  const doubleCheckNormalized = path.normalize(path.resolve(normalizedPath));
  if (normalizedPath !== doubleCheckNormalized) {
    normalizedPath = doubleCheckNormalized;
  }

  // Step 6: Post-normalization security check
  const postCheck = isSecurePathAfterNormalization(normalizedPath, inputPath);
  if (!postCheck.valid) {
    return { valid: false, originalPath: inputPath, reason: `Post-normalization check failed: ${postCheck.reason}` };
  }

  // Step 7: Check PATH_MAX after normalization
  const normalizedLengthCheck = validatePathLength(normalizedPath, inputPath, 'Normalized path');
  if (normalizedLengthCheck) return normalizedLengthCheck;

  // Step 8: Optionally resolve symlinks
  let symlinksResolved = false;
  if (resolveSymlinks) {
    const symlinkResult = resolveAndValidateSymlinks(normalizedPath, inputPath);
    if (symlinkResult.invalidResult) {
      return symlinkResult.invalidResult;
    }
    if (symlinkResult.resolvedPath !== normalizedPath) {
      normalizedPath = symlinkResult.resolvedPath;
      symlinksResolved = true;
    }
  }

  // Step 9: Optionally check file existence (TOCTOU note: acceptable for validation)
  if (requireExists) {
    try {
      fs.accessSync(normalizedPath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      return { valid: false, originalPath: inputPath, normalizedPath, reason: `Path does not exist or is not accessible: ${code}` };
    }
  }

  return { valid: true, originalPath: inputPath, normalizedPath, symlinksResolved };
}

/**
 * Security check specifically for normalized paths
 *
 * After path.normalize(), we need to verify:
 * 1. Path doesn't escape to unexpected locations
 * 2. No remaining traversal patterns
 */
function isSecurePathAfterNormalization(
  normalizedPath: string,
  originalPath: string
): SecurePathResult {
  // Check for null bytes (should never appear after normalization)
  if (hasNullByte(normalizedPath)) {
    return { valid: false, reason: 'Normalized path contains null byte' };
  }

  // Normalized absolute paths should not contain .. or .
  // path.normalize should have resolved these
  if (hasPathTraversal(normalizedPath)) {
    return {
      valid: false,
      reason: 'Normalized path still contains traversal pattern (..)',
    };
  }

  // Check for double slashes (path.normalize should fix these)
  if (normalizedPath.includes('//')) {
    return {
      valid: false,
      reason: 'Normalized path contains double slashes',
    };
  }

  // Check that normalized path doesn't escape home directory
  // if original was a home directory path
  if (originalPath.startsWith('~')) {
    const homeDir = os.homedir();
    if (!normalizedPath.startsWith(homeDir)) {
      return {
        valid: false,
        reason: 'Path escaped from home directory after normalization',
      };
    }
  }

  return { valid: true };
}

/**
 * Result of symlink resolution
 */
interface SymlinkResolutionResult {
  valid: boolean;
  resolvedPath?: string;
  reason?: string;
}

/**
 * Resolve symlinks securely with loop detection
 *
 * Uses fs.realpathSync.native() with error handling for:
 * - ELOOP: Symlink loop detected (infinite loop attack)
 * - ENOENT: File/directory doesn't exist
 * - EACCES: Permission denied
 * - ENAMETOOLONG: Path too long
 *
 * SECURITY NOTES:
 * - On Windows, fs.realpathSync.native() correctly handles:
 *   - Symbolic links (created with mklink /D or mklink)
 *   - Junctions (created with mklink /J)
 *   - Hard links (created with mklink /H)
 * - ELOOP detection prevents infinite symlink loops (e.g., /a -> /b -> /a)
 * - ENOENT returns normalized input path (not raw) for consistency
 */
function resolveSymlinksSecurely(inputPath: string): SymlinkResolutionResult {
  try {
    // Use native realpath for best performance and OS symlink handling
    const resolvedPath = fs.realpathSync.native(inputPath);

    // Verify resolved path length
    const resolvedByteLength = Buffer.byteLength(resolvedPath, 'utf8');
    if (resolvedByteLength > PATH_MAX) {
      return {
        valid: false,
        reason: `Resolved path exceeds maximum length (${resolvedByteLength} > ${PATH_MAX} bytes)`,
      };
    }

    return {
      valid: true,
      resolvedPath,
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    const code = nodeError.code;

    switch (code) {
      case 'ELOOP':
        return {
          valid: false,
          reason: 'Symlink loop detected (ELOOP) - possible infinite loop attack',
        };
      case 'ENOENT':
        // File doesn't exist - this might be OK depending on use case
        // SECURITY: inputPath is already normalized by normalizeAndValidatePath()
        // before this function is called, but we normalize again for defensive programming
        // This ensures consistency even if the function is called directly
        // The caller can check requireExists if they need the file to exist
        return {
          valid: true,
          resolvedPath: path.normalize(inputPath), // Already normalized, but safe to normalize again (idempotent)
        };
      case 'EACCES':
        return {
          valid: false,
          reason: 'Permission denied while resolving symlinks (EACCES)',
        };
      case 'ENAMETOOLONG':
        return {
          valid: false,
          reason: 'Path too long while resolving symlinks (ENAMETOOLONG)',
        };
      case 'ENOTDIR':
        return {
          valid: false,
          reason: 'A component of the path is not a directory (ENOTDIR)',
        };
      default:
        return {
          valid: false,
          reason: `Error resolving symlinks: ${code || nodeError.message}`,
        };
    }
  }
}

/**
 * Check if a path contains symlinks
 *
 * Useful for detecting potential symlink attacks without resolving them
 *
 * SECURITY: ELOOP errors are treated as symlinks detected (potential attack)
 */
export function containsSymlinks(inputPath: string): boolean {
  try {
    const realPath = fs.realpathSync.native(inputPath);
    const normalPath = path.normalize(inputPath);
    return realPath !== normalPath;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    const code = nodeError.code;

    // ELOOP indicates a symlink loop - treat as symlink detected (security concern)
    if (code === 'ELOOP') {
      return true;
    }

    // ENOENT means file doesn't exist - can't determine if symlink, return false
    // Other errors (EACCES, etc.) - assume no symlinks for now
    // The error will be caught later during actual path resolution if needed
    return false;
  }
}

/**
 * Validate an SSH key path specifically
 *
 * Performs path validation with symlink resolution enabled.
 * SSH keys can be stored in any location (not restricted to ~/.ssh or /etc/ssh).
 */
export function validateSshKeyPath(
  keyPath: string,
  options: NormalizePathOptions = {}
): NormalizedPathResult {
  // Validate path with symlink resolution enabled for SSH keys
  return normalizeAndValidatePath(keyPath, {
    ...options,
    resolveSymlinks: true, // Always resolve symlinks for SSH keys
  });
}

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
 * Check if normalized path is within workspace boundary.
 * @internal
 */
function checkWorkspaceBoundary(
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

    if (!pathValidation.valid || !pathValidation.normalizedPath) {
      return {
        valid: false,
        originalPath,
        reason: `Symlink resolution failed: ${pathValidation.reason ?? 'unknown error'}`,
        symlinksResolved: true,
      };
    }

    // Resolve symlinks using fs.realpathSync
    let resolvedByRealpath: string;
    try {
      resolvedByRealpath = fs.realpathSync(pathValidation.normalizedPath);
    } catch {
      return {
        valid: false,
        originalPath,
        reason: 'Symlink resolution failed: realpathSync error',
        symlinksResolved: true,
      };
    }

    const resolvedPath = resolvedByRealpath;
    // symlinksResolved indicates that symlink verification was performed, not that symlinks were found
    const _symlinksActuallyChanged = resolvedByRealpath !== pathValidation.normalizedPath;
    void _symlinksActuallyChanged; // Unused, kept for potential future debugging

    // SECURITY: Re-check workspace boundary after symlink resolution
    const boundaryCheck = checkWorkspaceBoundary(resolvedPath, normalizedWorkspace, originalPath);
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
  } catch (error) {
    // Path doesn't exist - that's OK, submodule might not be initialized
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      // Non-ENOENT errors are logged by caller if needed
    }
    return null; // Path doesn't exist, caller should return normalized path
  }
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
  const boundaryCheck = checkWorkspaceBoundary(normalizedSubmodulePath, normalizedWorkspace, submodulePath);
  if (boundaryCheck) {
    return boundaryCheck;
  }

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
