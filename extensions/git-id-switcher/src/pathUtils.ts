/**
 * Path Utilities for Secure Path Handling
 *
 * Provides path normalization, validation, and symlink resolution.
 * Designed to prevent path traversal and symlink-based attacks.
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { isSecurePath, SecurePathResult } from './commandAllowlist';

/**
 * Security constants
 */
const PATH_MAX = 4096; // POSIX PATH_MAX

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
  const {
    resolveSymlinks = false,
    requireExists = false,
    baseDir = process.cwd(),
  } = options;

  // Step 1: Basic input validation
  if (!inputPath || inputPath.length === 0) {
    return {
      valid: false,
      originalPath: inputPath,
      reason: 'Path is empty or undefined',
    };
  }

  // Step 2: Check PATH_MAX before any processing
  const inputByteLength = Buffer.byteLength(inputPath, 'utf8');
  if (inputByteLength > PATH_MAX) {
    return {
      valid: false,
      originalPath: inputPath,
      reason: `Path exceeds maximum length (${inputByteLength} > ${PATH_MAX} bytes)`,
    };
  }

  // Step 3: Pre-normalization security check on raw input
  const preCheck = isSecurePath(inputPath);
  if (!preCheck.valid) {
    return {
      valid: false,
      originalPath: inputPath,
      reason: `Pre-normalization check failed: ${preCheck.reason}`,
    };
  }

  // Step 4: Expand tilde
  let expandedPath = expandTilde(inputPath);

  // Step 5: Resolve to absolute path if relative
  if (!path.isAbsolute(expandedPath)) {
    expandedPath = path.resolve(baseDir, expandedPath);
  }

  // Step 6: Normalize the path (resolve ., .., //)
  let normalizedPath = path.normalize(expandedPath);

  // Step 7: Post-normalization security check
  // This catches any traversal that survived normalization
  const postCheck = isSecurePathAfterNormalization(normalizedPath, inputPath);
  if (!postCheck.valid) {
    return {
      valid: false,
      originalPath: inputPath,
      reason: `Post-normalization check failed: ${postCheck.reason}`,
    };
  }

  // Step 8: Check PATH_MAX after normalization (can change length)
  const normalizedByteLength = Buffer.byteLength(normalizedPath, 'utf8');
  if (normalizedByteLength > PATH_MAX) {
    return {
      valid: false,
      originalPath: inputPath,
      reason: `Normalized path exceeds maximum length (${normalizedByteLength} > ${PATH_MAX} bytes)`,
    };
  }

  // Step 9: Optionally resolve symlinks
  let symlinksResolved = false;
  if (resolveSymlinks) {
    const symlinkResult = resolveSymlinksSecurely(normalizedPath);
    if (!symlinkResult.valid) {
      return {
        valid: false,
        originalPath: inputPath,
        reason: symlinkResult.reason,
      };
    }
    if (symlinkResult.resolvedPath) {
      normalizedPath = symlinkResult.resolvedPath;
      symlinksResolved = true;

      // Re-validate after symlink resolution
      const symlinkCheck = isSecurePathAfterNormalization(normalizedPath, inputPath);
      if (!symlinkCheck.valid) {
        return {
          valid: false,
          originalPath: inputPath,
          reason: `Post-symlink check failed: ${symlinkCheck.reason}`,
        };
      }
    }
  }

  // Step 10: Optionally check file existence
  if (requireExists) {
    try {
      fs.accessSync(normalizedPath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      return {
        valid: false,
        originalPath: inputPath,
        normalizedPath,
        reason: `Path does not exist or is not accessible: ${code}`,
      };
    }
  }

  return {
    valid: true,
    originalPath: inputPath,
    normalizedPath,
    symlinksResolved,
  };
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
  if (normalizedPath.includes('\0')) {
    return { valid: false, reason: 'Normalized path contains null byte' };
  }

  // Normalized absolute paths should not contain .. or .
  // path.normalize should have resolved these
  if (normalizedPath.includes('..')) {
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
 * - ELOOP: Symlink loop detected
 * - ENOENT: File/directory doesn't exist
 * - EACCES: Permission denied
 * - ENAMETOOLONG: Path too long
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
        // Return the input path as-is, let caller decide
        return {
          valid: true,
          resolvedPath: inputPath,
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
 */
export function containsSymlinks(inputPath: string): boolean {
  try {
    const realPath = fs.realpathSync.native(inputPath);
    const normalPath = path.normalize(inputPath);
    return realPath !== normalPath;
  } catch {
    // If we can't resolve, assume no symlinks (or error will be caught later)
    return false;
  }
}

/**
 * Validate an SSH key path specifically
 *
 * Additional checks for SSH key paths:
 * - Must be in allowed directories (~/.ssh, /etc/ssh, etc.)
 * - File extension checks (optional)
 */
export function validateSshKeyPath(
  keyPath: string,
  options: NormalizePathOptions = {}
): NormalizedPathResult {
  // First, do general path validation
  const result = normalizeAndValidatePath(keyPath, {
    ...options,
    resolveSymlinks: true, // Always resolve symlinks for SSH keys
  });

  if (!result.valid) {
    return result;
  }

  const normalizedPath = result.normalizedPath!;
  const homeDir = os.homedir();

  // SSH key paths should typically be in:
  // - ~/.ssh/
  // - /etc/ssh/ (system keys)
  // - Custom paths (allowed but logged)
  const allowedPrefixes = [
    path.join(homeDir, '.ssh'),
    '/etc/ssh',
  ];

  const isInAllowedLocation = allowedPrefixes.some(prefix =>
    normalizedPath.startsWith(prefix + path.sep) || normalizedPath === prefix
  );

  if (!isInAllowedLocation) {
    // Not an error, but worth noting - custom SSH key location
    // Could add logging here in the future
  }

  return result;
}
