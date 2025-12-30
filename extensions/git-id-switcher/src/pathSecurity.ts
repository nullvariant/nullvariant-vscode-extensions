/**
 * Path Security Validation Module
 *
 * Provides secure path validation functions.
 * Prevents path traversal attacks and validates path safety.
 *
 * Separated from commandAllowlist for Single Responsibility Principle.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

import { PATH_MAX } from './constants';
import {
  CONTROL_CHAR_REGEX_STRICT,
  hasInvisibleUnicode,
  hasPathTraversal,
  hasPathTraversalStrict,
  hasNullByte,
} from './validators/common';

/**
 * Result of secure path validation
 */
export interface SecurePathResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate a path argument for security
 *
 * This function performs comprehensive security checks on file paths:
 * - Rejects path traversal patterns (.., //)
 * - Rejects ~user patterns (only ~/ is allowed)
 * - Rejects Windows special paths (UNC, device paths)
 * - Rejects null bytes and control characters
 * - Enforces PATH_MAX length limit
 * - Normalizes Unicode (NFC)
 *
 * @param path - The path string to validate
 * @returns SecurePathResult indicating if path is safe
 *
 * @example
 * isSecurePath('/home/user/.ssh/id_rsa')  // { valid: true }
 * isSecurePath('../etc/passwd')           // { valid: false, reason: '...' }
 */
export function isSecurePath(path: string): SecurePathResult {
  // Check for null/undefined/empty
  if (!path || path.length === 0) {
    return { valid: false, reason: 'Path is empty or undefined' };
  }

  // CRITICAL: Check for leading/trailing whitespace (potential obfuscation)
  // Whitespace can be used to hide malicious patterns
  if (path !== path.trim()) {
    return { valid: false, reason: 'Path contains leading or trailing whitespace' };
  }

  // Check for null bytes (common attack vector) - must check BEFORE normalization
  if (hasNullByte(path)) {
    return { valid: false, reason: 'Path contains null byte' };
  }

  // Check for control characters (ASCII 0-31 except tab, newline)
  // Note: null byte (\x00) is already checked above, but regex includes it for completeness
  if (CONTROL_CHAR_REGEX_STRICT.test(path)) {
    return { valid: false, reason: 'Path contains control characters' };
  }

  // Check for invisible/zero-width Unicode characters that could be used to
  // obfuscate paths (homograph attacks, visual spoofing)
  if (hasInvisibleUnicode(path)) {
    return {
      valid: false,
      reason: 'Path contains invisible Unicode characters',
    };
  }

  // Normalize Unicode to NFC for consistent comparison
  // This must be done early to catch normalization-based attacks
  const normalizedPath = path.normalize('NFC');

  // CRITICAL: Re-check for control characters and invisible chars AFTER normalization
  // Normalization can create new control characters in edge cases
  if (CONTROL_CHAR_REGEX_STRICT.test(normalizedPath)) {
    return { valid: false, reason: 'Path contains control characters (after normalization)' };
  }
  if (hasInvisibleUnicode(normalizedPath)) {
    return {
      valid: false,
      reason: 'Path contains invisible Unicode characters (after normalization)',
    };
  }

  // Check PATH_MAX length (in bytes for Unicode safety) - check AFTER normalization
  // Normalization can change byte length (NFC/NFD conversion)
  const normalizedByteLength = Buffer.byteLength(normalizedPath, 'utf8');
  if (normalizedByteLength > PATH_MAX) {
    return {
      valid: false,
      reason: `Path exceeds maximum length (${normalizedByteLength} > ${PATH_MAX} bytes)`,
    };
  }

  // Check for path traversal patterns using comprehensive validation
  if (hasPathTraversalStrict(normalizedPath)) {
    return { valid: false, reason: 'Path contains traversal pattern (..)' };
  }

  // Check for double slashes (potential path confusion)
  if (/\/\//.test(normalizedPath) || /\\\\/.test(normalizedPath)) {
    // Exception: Windows UNC paths start with \\ but we reject those anyway
    return { valid: false, reason: 'Path contains double slashes' };
  }

  // Check for backslashes in paths (cross-platform safety)
  // On Windows, \ is a path separator; on Unix, it's a valid filename char
  // To prevent cross-platform confusion attacks, reject paths with backslashes
  // NOTE: This check comes AFTER UNC path checks, which already reject \\ patterns
  // But we still need this to catch single backslashes and mixed separators
  if (normalizedPath.includes('\\')) {
    return {
      valid: false,
      reason: 'Path contains backslash (use forward slashes for cross-platform compatibility)',
    };
  }

  // Check tilde patterns: only ~/ is allowed, not ~user
  if (normalizedPath.startsWith('~')) {
    // Allow: ~, ~/, ~/path
    // Reject: ~user, ~user/path
    if (normalizedPath !== '~' && !normalizedPath.startsWith('~/')) {
      return {
        valid: false,
        reason: 'Tilde expansion to other users (~user) is not allowed, use ~/ only',
      };
    }
  }

  // Check for Windows absolute paths (security boundary)
  // Reject: C:\, D:\, C:, D: (drive letter only), etc.
  // CRITICAL: Must check for both C:\ and C: (without separator)
  // CRITICAL: Also reject paths that start with drive letter followed by any content
  if (/^[a-zA-Z]:/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'Windows absolute paths (drive letters) are not allowed in this context',
    };
  }

  // Check for Windows UNC paths: \\server\share or \\?\
  // CRITICAL: Must check BEFORE backslash check to catch UNC paths
  if (/^[/\\]{2}/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'UNC paths and Windows device paths are not allowed',
    };
  }

  // Check for Windows device paths: \\.\COM1, \\.\PhysicalDrive0, etc.
  // Also check for //?/ and //./ patterns (forward slash variants)
  // CRITICAL: This must come AFTER UNC check to avoid redundant checks
  // But we need separate patterns for device paths vs UNC paths
  if (/^[/\\]{2}[.?\\]/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'Windows device paths are not allowed',
    };
  }

  // CRITICAL: Check for paths ending with dots (Windows quirk)
  // Windows doesn't allow paths ending with . or .. (except . and .. themselves)
  // But we already reject .., so we only need to check for trailing single dot
  // Example: /path/to/file. (trailing dot) - valid on Unix, invalid on Windows
  // We reject for cross-platform safety
  // CRITICAL: Also check for paths ending with /./ or /../
  if (normalizedPath.length > 1) {
    if (normalizedPath.endsWith('.')) {
      // Exception: '.' itself is allowed (already checked in prefix validation)
      if (normalizedPath !== '.') {
        return {
          valid: false,
          reason: 'Path ends with dot (not allowed for cross-platform compatibility)',
        };
      }
    }
    // Defensive check: Paths ending with /./ or /../
    // Note: Traversal check (line 106) should catch /../, but this explicit check
    // for /./ provides additional safety for edge cases.
    if (normalizedPath.endsWith('/.') || normalizedPath.endsWith('/..')) {
      return {
        valid: false,
        reason: 'Path ends with /./ or /../ (not allowed)',
      };
    }
  }

  // Check for Windows reserved device names
  const windowsReservedNames = /^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])([./\\]|$)/i;
  const basename = normalizedPath.split(/[/\\]/).pop() || '';
  if (windowsReservedNames.test(basename)) {
    return {
      valid: false,
      reason: 'Windows reserved device names are not allowed',
    };
  }

  // Path must start with a recognized prefix
  // CRITICAL: Must validate AFTER all security checks to prevent bypass
  const validPrefixes = [
    '/',      // Absolute Unix path
    '~/',     // Home directory
    '~',      // Home directory (exact match)
    '.',      // Current directory (but not ..)
  ];

  const startsWithValidPrefix = validPrefixes.some(prefix => {
    if (prefix === '.') {
      // Special handling for '.': must be exactly '.' or './'
      // Note: Traversal check (line 106) should catch './../' patterns, but this
      // additional check ensures './' is not followed by traversal for extra safety.
      if (normalizedPath === '.' || normalizedPath.startsWith('./')) {
        // Defensive check: ensure './' is not followed by traversal
        if (normalizedPath.startsWith('./') && hasPathTraversal(normalizedPath)) {
          return false;
        }
        return true;
      }
      return false;
    }
    return normalizedPath === prefix || normalizedPath.startsWith(prefix);
  });

  if (!startsWithValidPrefix) {
    return {
      valid: false,
      reason: 'Path must be absolute (start with /) or relative to home (~/) or current directory (./)',
    };
  }

  // Final validation: ensure no remaining security issues
  // Defensive check: This should have been caught by hasPathTraversalStrict() above (line 106),
  // but we check again after normalization to catch any edge cases where normalization
  // might affect traversal pattern detection.
  if (hasPathTraversal(normalizedPath)) {
    return { valid: false, reason: 'Path contains traversal pattern' };
  }

  // Defensive check: Character length validation after normalization.
  // Note: Byte length check (line 97-103) is the primary validation for PATH_MAX.
  // This character length check provides an additional safety layer for edge cases
  // where normalization might affect character count differently than byte count.
  if (normalizedPath.length > PATH_MAX) {
    return {
      valid: false,
      reason: `Path exceeds maximum character length (${normalizedPath.length} > ${PATH_MAX})`,
    };
  }

  // Defensive check: Ensure normalized path doesn't contain leading/trailing whitespace.
  // Note: This is checked before normalization (line 55-57), but we check again after
  // normalization to catch any edge cases where normalization might introduce whitespace.
  if (normalizedPath.length > 0 && (normalizedPath[0] === ' ' || normalizedPath[normalizedPath.length - 1] === ' ')) {
    return { valid: false, reason: 'Path contains leading or trailing whitespace' };
  }

  return { valid: true };
}

/**
 * Check if an argument looks like a file path
 * Used to determine if path validation should be applied
 *
 * This catches both valid and potentially malicious paths for validation.
 * CRITICAL: This function must be conservative - it's better to validate
 * a non-path as a path than to miss a malicious path.
 *
 * @param arg - The argument to check
 * @returns true if the argument looks like a file path
 */
export function isPathArgument(arg: string): boolean {
  if (!arg || arg.length === 0) {
    return false;
  }

  // CRITICAL: Check for leading/trailing whitespace (potential obfuscation)
  // If arg has whitespace, it might be a path with obfuscation
  const trimmedArg = arg.trim();
  if (trimmedArg !== arg) {
    // Has whitespace - could be obfuscated path, so treat as path for validation
    // The validation function will reject it, but we need to catch it here
    return true;
  }

  // Check if it looks like a path (starts with /, ~, ., or contains path separators)
  // We intentionally catch ../ here so it can be validated and rejected
  // CRITICAL: Also check for Windows drive letters (C:, D:, etc.)
  return (
    arg.startsWith('/') ||
    arg.startsWith('~') ||
    arg.startsWith('./') ||
    arg.startsWith('../') ||
    arg === '.' ||
    arg === '..' ||
    // Windows drive letter pattern (C:, D:, etc.)
    /^[a-zA-Z]:/.test(arg) ||
    // Windows UNC path pattern (\\server, //server)
    /^[/\\]{2}/.test(arg)
  );
}
