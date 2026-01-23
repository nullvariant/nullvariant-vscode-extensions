/**
 * Unicode and Character Validation Module
 *
 * Provides validators for detecting Unicode attacks and control characters.
 * Also includes secure log path validation.
 *
 * @internal This module is part of the path security system.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  CONTROL_CHAR_REGEX_STRICT,
  hasInvisibleUnicode,
  hasNullByte,
} from '../../validators/common';
import type { Validator } from './traversal';

// ============================================================================
// Validator Factories (DRY pattern)
// ============================================================================

/**
 * Creates a validator for control characters with custom error message suffix
 */
export const createControlCharValidator = (suffix: string = ''): Validator => (state) => {
  if (CONTROL_CHAR_REGEX_STRICT.test(state.path)) {
    return { ...state, valid: false, reason: `Path contains control characters${suffix}` };
  }
  return state;
};

/**
 * Creates a validator for invisible Unicode with custom error message suffix
 */
export const createInvisibleUnicodeValidator = (suffix: string = ''): Validator => (state) => {
  if (hasInvisibleUnicode(state.path)) {
    return { ...state, valid: false, reason: `Path contains invisible Unicode characters${suffix}` };
  }
  return state;
};

// ============================================================================
// Unicode/Character Validators
// ============================================================================

/**
 * Validates no null bytes (common attack vector)
 */
export const validateNoNullBytes: Validator = (state) => {
  if (hasNullByte(state.path)) {
    return { ...state, valid: false, reason: 'Path contains null byte' };
  }
  return state;
};

/** Validates no control characters (pre-normalization) */
export const validateNoControlChars = createControlCharValidator();

/** Validates no invisible Unicode characters (pre-normalization) */
export const validateNoInvisibleUnicode = createInvisibleUnicodeValidator();

/**
 * Normalizes Unicode to NFC for consistent comparison
 */
export const normalizeUnicode: Validator = (state) => ({
  ...state,
  path: state.path.normalize('NFC'),
});

/**
 * Re-validates control characters after normalization.
 * NFC normalization can theoretically affect character composition,
 * so we re-check as a security precaution.
 */
export const validateNoControlCharsAfterNormalization = createControlCharValidator(' (after normalization)');

/**
 * Re-validates invisible Unicode after normalization.
 * Security precaution for edge cases in Unicode normalization.
 */
export const validateNoInvisibleUnicodeAfterNormalization = createInvisibleUnicodeValidator(' (after normalization)');

// ============================================================================
// Secure Log Path Validation
// ============================================================================

/**
 * Result of secure log path validation
 */
export interface SecureLogPathResult {
  valid: boolean;
  reason?: string;
  resolvedPath?: string;
}

/**
 * Check if a path is a symbolic link using lstat
 *
 * @param filePath - The path to check
 * @returns true if the path is a symbolic link
 */
function isSymbolicLink(filePath: string): boolean {
  try {
    const stats = fs.lstatSync(filePath);
    return stats.isSymbolicLink();
  } catch {
    // File doesn't exist yet, which is fine for new log files
    return false;
  }
}

/**
 * Check if any component of the path is a symbolic link
 *
 * @param filePath - The path to check
 * @returns object with isSymlink flag and the symlink path if found
 */
function hasSymbolicLinkInPath(filePath: string): { isSymlink: boolean; symlinkPath?: string } {
  // Normalize the path first to handle mixed separators on Windows
  const normalizedPath = path.normalize(filePath);
  const parts = normalizedPath.split(path.sep).filter(Boolean);

  // Handle Windows drive letters (e.g., C:) and Unix root (/)
  let currentPath = '';
  if (normalizedPath.startsWith(path.sep)) {
    currentPath = path.sep;
  } else if (/^[a-zA-Z]:/.test(normalizedPath)) {
    // Windows drive letter - first part includes the drive
    currentPath = parts.shift() || '';
    if (!currentPath.endsWith(path.sep)) {
      currentPath += path.sep;
    }
  }

  for (const part of parts) {
    currentPath = path.join(currentPath, part);
    try {
      const stats = fs.lstatSync(currentPath);
      if (stats.isSymbolicLink()) {
        return { isSymlink: true, symlinkPath: currentPath };
      }
    } catch {
      // Path component doesn't exist yet, which is fine
      break;
    }
  }

  return { isSymlink: false };
}

/**
 * Resolve the real path, handling non-existent files
 *
 * For non-existent files, resolves the parent directory and appends the filename.
 *
 * @param filePath - The path to resolve
 * @returns The resolved real path or null if resolution fails
 */
function resolveRealPath(filePath: string): string | null {
  try {
    // Try to resolve the full path first
    return fs.realpathSync(filePath);
  } catch {
    // File doesn't exist, try to resolve parent directory
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath);
    try {
      const resolvedDir = fs.realpathSync(dir);
      return path.join(resolvedDir, basename);
    } catch {
      // Parent directory also doesn't exist
      // In this case, just normalize the path
      return path.resolve(filePath);
    }
  }
}

/**
 * Check if a path is under an allowed base directory
 *
 * @param resolvedPath - The resolved real path to check
 * @param allowedBaseDir - The allowed base directory
 * @returns true if the path is under the allowed base directory
 */
function isUnderAllowedDir(resolvedPath: string, allowedBaseDir: string): boolean {
  // Normalize both paths for comparison
  const normalizedPath = path.normalize(resolvedPath);
  const normalizedBase = path.normalize(allowedBaseDir);

  // Ensure base directory ends with separator for proper prefix matching
  const baseWithSep = normalizedBase.endsWith(path.sep)
    ? normalizedBase
    : normalizedBase + path.sep;

  // Check if path starts with base directory or is exactly the base directory
  return normalizedPath === normalizedBase || normalizedPath.startsWith(baseWithSep);
}

// Import isSecurePath dynamically to avoid circular dependency
// This function is defined in the main pathSecurity.ts module
import type { SecurePathResult } from '../../pathSecurity';

/**
 * Validate a log file path for security
 *
 * This function performs comprehensive security checks on log file paths:
 * - First performs basic path validation via isSecurePath()
 * - Detects and rejects symbolic links in the path (TOCTOU mitigation)
 * - Resolves to real path and validates it's under allowed directory
 *
 * SECURITY: This function mitigates:
 * - Arbitrary file write via workspace settings
 * - Symlink following attacks
 *
 * @param filePath - The log file path to validate
 * @param allowedBaseDir - The allowed base directory (e.g., globalStorageUri)
 * @param isSecurePathFn - The isSecurePath function (injected to avoid circular dependency)
 * @returns SecureLogPathResult indicating if path is safe and the resolved path
 *
 * @example
 * // Valid: path under allowed directory
 * isSecureLogPath('/home/user/.vscode/globalStorage/ext/logs/security.log', '/home/user/.vscode/globalStorage/ext', isSecurePath)
 * // { valid: true, resolvedPath: '/home/user/.vscode/globalStorage/ext/logs/security.log' }
 *
 * // Invalid: path outside allowed directory
 * isSecureLogPath('/etc/passwd', '/home/user/.vscode/globalStorage/ext', isSecurePath)
 * // { valid: false, reason: 'Path is not under allowed directory' }
 *
 * // Invalid: symlink detected
 * isSecureLogPath('/home/user/symlink-to-etc/passwd', '/home/user', isSecurePath)
 * // { valid: false, reason: 'Path contains symbolic link: /home/user/symlink-to-etc' }
 */
export function isSecureLogPathImpl(
  filePath: string,
  allowedBaseDir: string,
  isSecurePathFn: (path: string) => SecurePathResult
): SecureLogPathResult {
  // Step 1: Basic path validation
  const basicResult = isSecurePathFn(filePath);
  if (!basicResult.valid) {
    return { valid: false, reason: basicResult.reason };
  }

  // Step 2: Check for symbolic links in the path
  // SECURITY: Detect symlinks before resolving to prevent TOCTOU attacks
  const symlinkCheck = hasSymbolicLinkInPath(filePath);
  if (symlinkCheck.isSymlink) {
    return {
      valid: false,
      reason: `Path contains symbolic link: ${symlinkCheck.symlinkPath}`,
    };
  }

  // Also check the file itself if it exists
  if (isSymbolicLink(filePath)) {
    return {
      valid: false,
      reason: 'Log file path is a symbolic link',
    };
  }

  // Step 3: Resolve real path
  const resolvedPath = resolveRealPath(filePath);
  if (!resolvedPath) {
    return {
      valid: false,
      reason: 'Failed to resolve path',
    };
  }

  // Step 4: Validate allowed base directory
  const baseDirResult = isSecurePathFn(allowedBaseDir);
  if (!baseDirResult.valid) {
    return {
      valid: false,
      reason: `Invalid allowed base directory: ${baseDirResult.reason}`,
    };
  }

  // Step 5: Resolve allowed base directory
  const resolvedBaseDir = resolveRealPath(allowedBaseDir);
  if (!resolvedBaseDir) {
    return {
      valid: false,
      reason: 'Failed to resolve allowed base directory',
    };
  }

  // Step 6: Check if path is under allowed directory
  if (!isUnderAllowedDir(resolvedPath, resolvedBaseDir)) {
    return {
      valid: false,
      reason: 'Path is not under allowed directory',
    };
  }

  return {
    valid: true,
    resolvedPath,
  };
}
