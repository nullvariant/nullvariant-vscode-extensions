/**
 * Secure Log Path Validation Module
 *
 * Validates log file paths for security, ensuring they are under allowed
 * directories and free from symbolic link attacks.
 *
 * Separated from pathValidator.ts for Single Responsibility Principle.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { WINDOWS_DRIVE_LETTER_REGEX } from '../validators/common';
import { validatePathSecurity } from './pathValidator';
import { resolveSymlinksSecurely } from './pathSymlinkResolver';
import { isPathWithinDirectory } from './pathUtils';

/**
 * Result of secure log path validation
 */
export interface SecureLogPathResult {
  valid: boolean;
  reason?: string;
  resolvedPath?: string;
}

/**
 * Check if a path is a symbolic link using lstat.
 *
 * @remarks
 * **Naming convention**: Named with `Safe` suffix because this function
 * returns `false` on errors (file doesn't exist) rather than throwing,
 * making it safe to use in validation contexts where non-existent files
 * are acceptable.
 *
 * @param filePath - The path to check
 * @returns true if the path is a symbolic link, false if not or on error
 */
function isSymbolicLinkSafe(filePath: string): boolean {
  try {
    const stats = fs.lstatSync(filePath);
    return stats.isSymbolicLink();
  } catch /* c8 ignore start */ {
    // File doesn't exist yet, which is fine for new log files
    return false;
  } /* c8 ignore stop */
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
  } else if (WINDOWS_DRIVE_LETTER_REGEX.test(normalizedPath)) /* c8 ignore start */ {
    // Windows drive letter - first part includes the drive
    currentPath = parts.shift() || '';
    if (!currentPath.endsWith(path.sep)) {
      currentPath += path.sep;
    }
  } /* c8 ignore stop */

  for (const part of parts) {
    currentPath = path.join(currentPath, part);
    try {
      const stats = fs.lstatSync(currentPath);
      if (stats.isSymbolicLink()) {
        return { isSymlink: true, symlinkPath: currentPath };
      }
    } catch /* c8 ignore start */ {
      // Path component doesn't exist yet, which is fine
      break;
    } /* c8 ignore stop */
  }

  return { isSymlink: false };
}

/**
 * Validate a log file path for security
 *
 * This function performs comprehensive security checks on log file paths:
 * - First performs basic path validation via validatePathSecurity()
 * - Detects and rejects symbolic links in the path (TOCTOU mitigation)
 * - Resolves to real path and validates it's under allowed directory
 *
 * SECURITY: This function mitigates:
 * - Arbitrary file write via workspace settings
 * - Symlink following attacks
 *
 * @param filePath - The log file path to validate
 * @param allowedBaseDir - The allowed base directory (e.g., globalStorageUri)
 * @returns SecureLogPathResult indicating if path is safe and the resolved path
 *
 * @example
 * // Valid: path under allowed directory
 * isSecureLogPath('/home/user/.vscode/globalStorage/ext/logs/security.log', '/home/user/.vscode/globalStorage/ext')
 * // { valid: true, resolvedPath: '/home/user/.vscode/globalStorage/ext/logs/security.log' }
 *
 * // Invalid: path outside allowed directory
 * isSecureLogPath('/etc/passwd', '/home/user/.vscode/globalStorage/ext')
 * // { valid: false, reason: 'Path is not under allowed directory' }
 *
 * // Invalid: symlink detected
 * isSecureLogPath('/home/user/symlink-to-etc/passwd', '/home/user')
 * // { valid: false, reason: 'Path contains symbolic link: /home/user/symlink-to-etc' }
 */
export function isSecureLogPath(filePath: string, allowedBaseDir: string): SecureLogPathResult {
  // Step 1: Basic path validation
  const basicResult = validatePathSecurity(filePath);
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
  // Note: Defense-in-depth. hasSymbolicLinkInPath already checks each path component,
  // including the file itself, so this is a safety net.
  /* c8 ignore start - Defense-in-depth: hasSymbolicLinkInPath catches this */
  if (isSymbolicLinkSafe(filePath)) {
    return {
      valid: false,
      reason: 'Log file path is a symbolic link',
    };
  }
  /* c8 ignore stop */

  // Step 3: Resolve real path via resolveSymlinksSecurely (uses realpathSync.native)
  const resolveResult = resolveSymlinksSecurely(filePath);
  /* c8 ignore start - Defense-in-depth: symlinks already rejected in step 2, ELOOP unreachable */
  if (!resolveResult.valid) {
    return { valid: false, reason: resolveResult.reason };
  }
  /* c8 ignore stop */
  const resolvedPath = resolveResult.resolvedPath!;

  // Step 4: Validate allowed base directory
  const baseDirResult = validatePathSecurity(allowedBaseDir);
  if (!baseDirResult.valid) {
    return {
      valid: false,
      reason: `Invalid allowed base directory: ${baseDirResult.reason}`,
    };
  }

  // Step 5: Resolve allowed base directory
  const baseDirResolveResult = resolveSymlinksSecurely(allowedBaseDir);
  /* c8 ignore start - Defense-in-depth: base dir already validated in step 4 */
  if (!baseDirResolveResult.valid) {
    return {
      valid: false,
      reason: `Failed to resolve allowed base directory: ${baseDirResolveResult.reason}`,
    };
  }
  /* c8 ignore stop */
  const resolvedBaseDir = baseDirResolveResult.resolvedPath!;

  // Step 6: Check if path is under allowed directory
  if (!isPathWithinDirectory(path.normalize(resolvedPath), path.normalize(resolvedBaseDir))) {
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
