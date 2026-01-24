/**
 * Path Normalization Utilities
 *
 * Provides path normalization, validation, and tilde expansion.
 * Designed to prevent path traversal and injection attacks.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { isSecurePath, SecurePathResult } from './pathValidator';
import { PATH_MAX } from '../core/constants';
import { hasNullByte, hasPathTraversal } from '../validators/common';
import { resolveSymlinksSecurely } from './pathSymlinkResolver';

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
  /* c8 ignore start - Defense-in-depth: null byte should be caught before normalization */
  if (hasNullByte(normalizedPath)) {
    return { valid: false, reason: 'Normalized path contains null byte' };
  }
  /* c8 ignore stop */

  // Normalized absolute paths should not contain .. or .
  // path.normalize should have resolved these
  /* c8 ignore start - Defense-in-depth: path.normalize handles these cases */
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
  /* c8 ignore stop */

  return { valid: true };
}

/**
 * Resolve symlinks securely and re-validate the result.
 * @internal
 * @returns Object with resolvedPath on success, or invalidResult if validation fails
 */
/* c8 ignore start - Symlink resolution errors (defense-in-depth, requires complex symlink setup) */
function resolveAndValidateSymlinks(
  normalizedPath: string,
  inputPath: string
): { resolvedPath: string } | { invalidResult: NormalizedPathResult } {
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
/* c8 ignore stop */

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
  /* c8 ignore start - Defense-in-depth: path.normalize is idempotent, this branch should never execute */
  if (normalizedPath !== doubleCheckNormalized) {
    normalizedPath = doubleCheckNormalized;
  }
  /* c8 ignore stop */

  // Step 6: Post-normalization security check
  const postCheck = isSecurePathAfterNormalization(normalizedPath, inputPath);
  /* c8 ignore start - Defense-in-depth: pre-check catches most issues, this is fallback */
  if (!postCheck.valid) {
    return { valid: false, originalPath: inputPath, reason: `Post-normalization check failed: ${postCheck.reason}` };
  }
  /* c8 ignore stop */

  // Step 7: Check PATH_MAX after normalization
  const normalizedLengthCheck = validatePathLength(normalizedPath, inputPath, 'Normalized path');
  if (normalizedLengthCheck) return normalizedLengthCheck;

  // Step 8: Optionally resolve symlinks
  let symlinksResolved = false;
  if (resolveSymlinks) {
    const symlinkResult = resolveAndValidateSymlinks(normalizedPath, inputPath);
    /* c8 ignore start - Symlink resolution failure edge case */
    if ('invalidResult' in symlinkResult) {
      return symlinkResult.invalidResult;
    }
    if (symlinkResult.resolvedPath !== normalizedPath) {
      normalizedPath = symlinkResult.resolvedPath;
      symlinksResolved = true;
    }
    /* c8 ignore stop */
  }

  // Step 9: Optionally check file existence (TOCTOU note: acceptable for validation)
  if (requireExists) {
    try {
      fs.accessSync(normalizedPath);
    } catch (error) /* c8 ignore start */ {
      const code = (error as NodeJS.ErrnoException).code;
      return { valid: false, originalPath: inputPath, normalizedPath, reason: `Path does not exist or is not accessible: ${code}` };
    } /* c8 ignore stop */
  }

  return { valid: true, originalPath: inputPath, normalizedPath, symlinksResolved };
}
