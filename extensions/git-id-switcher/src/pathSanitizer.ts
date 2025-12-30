/**
 * Path Sanitization Module
 *
 * Provides path sanitization functions for secure logging.
 * Redacts sensitive paths to prevent information leakage.
 *
 * Separated from SecurityLogger for Single Responsibility Principle.
 */

import * as path from 'path';
import { PATH_MAX, MAX_PATTERN_CHECK_LENGTH } from './constants';
import { CONTROL_CHAR_REGEX_ALL } from './validators/common';

/**
 * Platform-specific sensitive directory patterns
 */
const SENSITIVE_DIRS_UNIX = [
  // SSH and GPG
  '.ssh',
  '.gnupg',
  // Cloud credentials
  '.aws',
  '.azure',
  '.gcloud',
  '.config/gcloud',
  // Package managers with auth
  '.npmrc',
  '.yarnrc',
  '.docker',
  // Kubernetes
  '.kube',
  // Database credentials
  '.pgpass',
  '.my.cnf',
  '.netrc',
  // System directories
  '/etc/passwd',
  '/etc/shadow',
  '/etc/ssh',
  '/etc/ssl',
  '/etc/pki',
] as const;

const SENSITIVE_DIRS_WINDOWS = [
  // User profile sensitive locations
  'AppData\\Roaming',
  'AppData\\Local',
  // SSH (Windows)
  '.ssh',
  // Cloud credentials (same as Unix)
  '.aws',
  '.azure',
  '.gcloud',
  // Windows credential store related
  'Credentials',
  // Certificate stores
  'Microsoft\\Crypto',
  'Microsoft\\Protect',
] as const;

/**
 * Patterns that indicate sensitive content in any path
 */
const SENSITIVE_PATTERNS = [
  /private[_-]?key/i,
  /id_rsa/i,
  /id_ed25519/i,
  /id_ecdsa/i,
  /id_dsa/i,
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /credential/i,
  /secret/i,
  /password/i,
  /token/i,
  /\.env$/i,
  /\.env\./i,
] as const;

/**
 * Check if a path contains sensitive directory patterns
 * The input path should already be normalized (forward slashes only)
 *
 * SECURITY: Uses path component boundary checking to prevent false positives
 * (e.g., `.ssh-backup` should not match `.ssh`)
 */
export function containsSensitiveDir(normalizedPath: string): boolean {
  // DoS protection: limit iterations for very long paths
  if (normalizedPath.length > PATH_MAX) {
    return true; // Treat as sensitive if too long
  }

  const isWindows = process.platform === 'win32';
  const sensitiveDirs = isWindows ? SENSITIVE_DIRS_WINDOWS : SENSITIVE_DIRS_UNIX;

  // Path is already normalized to forward slashes
  const pathToCheck = isWindows ? normalizedPath.toLowerCase() : normalizedPath;

  // Split path into components for accurate boundary checking
  const pathComponents = pathToCheck.split('/').filter(c => c.length > 0);

  for (const sensitiveDir of sensitiveDirs) {
    // Normalize the sensitive dir pattern to forward slashes
    const normalizedSensitive = isWindows
      ? sensitiveDir.replace(/\\/g, '/').toLowerCase()
      : sensitiveDir;

    // Split sensitive dir into components (may contain multiple levels like '.config/gcloud')
    const sensitiveComponents = normalizedSensitive.split('/').filter(c => c.length > 0);

    // Check if path components contain the sensitive directory components as a sequence
    // This ensures we match whole directory names, not substrings
    for (let i = 0; i <= pathComponents.length - sensitiveComponents.length; i++) {
      let matches = true;
      for (let j = 0; j < sensitiveComponents.length; j++) {
        if (pathComponents[i + j] !== sensitiveComponents[j]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a path matches sensitive file patterns
 */
export function matchesSensitivePattern(inputPath: string): boolean {
  // DoS protection: limit path length to check
  const pathToCheck =
    inputPath.length > MAX_PATTERN_CHECK_LENGTH
      ? inputPath.slice(0, MAX_PATTERN_CHECK_LENGTH)
      : inputPath;

  const filename = path.basename(pathToCheck);
  const fullPath = pathToCheck.toLowerCase();

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(filename) || pattern.test(fullPath)) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitize path for logging (don't expose full path structure)
 *
 * Sensitive paths are redacted to prevent information leakage.
 * Home directory is replaced with ~ for privacy.
 *
 * @param inputPath - The path to sanitize
 * @returns Sanitized path safe for logging
 */
export function sanitizePath(inputPath: string): string {
  if (!inputPath || typeof inputPath !== 'string') {
    return '[INVALID_PATH]';
  }

  // SECURITY: Check for control characters (potential injection attack)
  if (CONTROL_CHAR_REGEX_ALL.test(inputPath)) {
    return '[REDACTED:CONTROL_CHARS]';
  }

  // DoS protection: limit path length
  if (inputPath.length > PATH_MAX) {
    return '[REDACTED:PATH_TOO_LONG]';
  }

  // Normalize path separators for consistent checking
  // SECURITY: Handle Windows UNC paths (\\server\share -> //server/share)
  // Preserve UNC prefix for proper detection
  const normalizedPath = inputPath.replace(/\\/g, '/');
  // SECURITY: UNC paths start with // (but not ///)
  // For UNC paths, we should redact the server name for privacy
  const isUncPath = normalizedPath.startsWith('//') && !normalizedPath.startsWith('///');
  if (isUncPath) {
    // Redact UNC server name: //server/share -> //[REDACTED]/share
    const uncMatch = normalizedPath.match(/^\/\/([^/]+)(\/.*)?$/);
    if (uncMatch) {
      return `//[REDACTED]${uncMatch[2] || ''}`;
    }
  }

  // Check for sensitive patterns first (highest priority)
  if (matchesSensitivePattern(normalizedPath)) {
    return '[REDACTED:SENSITIVE_FILE]';
  }

  // Check for sensitive directories
  if (containsSensitiveDir(normalizedPath)) {
    return '[REDACTED:SENSITIVE_DIR]';
  }

  // Replace home directory with ~ for privacy
  // SECURITY: Handle Windows HOMEDRIVE + HOMEPATH combination
  let home = '';
  if (process.platform === 'win32') {
    // Windows: HOMEDRIVE + HOMEPATH (e.g., C: + \Users\username)
    const homeDrive = process.env.HOMEDRIVE || '';
    const homePath = process.env.HOMEPATH || '';
    if (homeDrive && homePath) {
      home = homeDrive + homePath;
    } else {
      home = process.env.USERPROFILE || '';
    }
  } else {
    home = process.env.HOME || '';
  }

  if (home) {
    const normalizedHome = home.replace(/\\/g, '/');
    // SECURITY: Ensure we match at path component boundary
    // Check exact match or match followed by /
    if (
      normalizedPath === normalizedHome ||
      normalizedPath.startsWith(normalizedHome + '/')
    ) {
      return '~' + normalizedPath.slice(normalizedHome.length);
    }
  }

  // SECURITY: Return normalized path (not original) for consistency
  // This ensures path separators are consistent in logs
  return normalizedPath;
}
