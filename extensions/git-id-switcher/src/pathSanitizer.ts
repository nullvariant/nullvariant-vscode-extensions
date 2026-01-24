/**
 * Path Sanitization Module
 *
 * Provides path sanitization functions for secure logging.
 * Redacts sensitive paths to prevent information leakage.
 *
 * Separated from SecurityLogger for Single Responsibility Principle.
 */

import * as path from 'node:path';
import { PATH_MAX, MAX_PATTERN_CHECK_LENGTH } from './core/constants';
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
 * Check if path components contain a sequence of sensitive components
 * starting at any position.
 *
 * @internal
 */
function matchesComponentSequence(
  pathComponents: string[],
  sensitiveComponents: string[]
): boolean {
  const maxStartIndex = pathComponents.length - sensitiveComponents.length;
  for (let i = 0; i <= maxStartIndex; i++) {
    if (componentsMatchAt(pathComponents, sensitiveComponents, i)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if sensitive components match path components at a given start index.
 *
 * @internal
 */
function componentsMatchAt(
  pathComponents: string[],
  sensitiveComponents: string[],
  startIndex: number
): boolean {
  for (let j = 0; j < sensitiveComponents.length; j++) {
    if (pathComponents[startIndex + j] !== sensitiveComponents[j]) {
      return false;
    }
  }
  return true;
}

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

    if (matchesComponentSequence(pathComponents, sensitiveComponents)) {
      return true;
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
 * Get home directory path in a platform-aware manner.
 *
 * @internal
 */
function getHomeDirectory(): string {
  if (process.platform === 'win32') {
    // Windows: HOMEDRIVE + HOMEPATH (e.g., C: + \Users\username)
    const homeDrive = process.env.HOMEDRIVE || '';
    const homePath = process.env.HOMEPATH || '';
    if (homeDrive && homePath) {
      return homeDrive + homePath;
    }
    return process.env.USERPROFILE || '';
  }
  return process.env.HOME || '';
}

/**
 * Try to redact UNC path server name for privacy.
 * Returns null if not a UNC path.
 *
 * @internal
 */
function tryRedactUncPath(normalizedPath: string): string | null {
  // SECURITY: UNC paths start with // (but not ///)
  const isUncPath = normalizedPath.startsWith('//') && !normalizedPath.startsWith('///');
  if (!isUncPath) {
    return null;
  }
  // Redact UNC server name: //server/share -> //[REDACTED]/share
  const uncMatch = normalizedPath.match(/^\/\/([^/]+)(\/.*)?$/);
  if (uncMatch) {
    return `//[REDACTED]${uncMatch[2] || ''}`;
  }
  /* c8 ignore next: edge case - malformed UNC path that passes prefix but not regex */
  return null;
}

/**
 * Replace home directory with ~ for privacy.
 *
 * @internal
 */
function replaceHomeWithTilde(normalizedPath: string, home: string): string | null {
  if (!home) {
    return null;
  }
  const normalizedHome = home.replace(/\\/g, '/');
  // SECURITY: Ensure we match at path component boundary
  if (normalizedPath === normalizedHome || normalizedPath.startsWith(normalizedHome + '/')) {
    return '~' + normalizedPath.slice(normalizedHome.length);
  }
  return null;
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
  const normalizedPath = inputPath.replace(/\\/g, '/');

  // SECURITY: Handle Windows UNC paths
  const redactedUnc = tryRedactUncPath(normalizedPath);
  if (redactedUnc !== null) {
    return redactedUnc;
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
  const homeReplaced = replaceHomeWithTilde(normalizedPath, getHomeDirectory());
  if (homeReplaced !== null) {
    return homeReplaced;
  }

  // SECURITY: Return normalized path (not original) for consistency
  return normalizedPath;
}
