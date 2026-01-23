/**
 * Path Security Validation Module
 *
 * Provides secure path validation functions.
 * Prevents path traversal attacks and validates path safety.
 *
 * Separated from commandAllowlist for Single Responsibility Principle.
 * Refactored using pipeline pattern for KISS compliance (Issue-00041).
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { PATH_MAX } from './constants';
import {
  CONTROL_CHAR_REGEX_STRICT,
  hasInvisibleUnicode,
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
 * Internal state for validation pipeline
 */
interface ValidationState {
  valid: boolean;
  path: string;
  reason?: string;
}

/**
 * Validator function type for pipeline pattern
 */
type Validator = (state: ValidationState) => ValidationState;

// ============================================================================
// Validator Factories (DRY pattern)
// ============================================================================

/**
 * Creates a validator for control characters with custom error message suffix
 */
const createControlCharValidator = (suffix: string = ''): Validator => (state) => {
  if (CONTROL_CHAR_REGEX_STRICT.test(state.path)) {
    return { ...state, valid: false, reason: `Path contains control characters${suffix}` };
  }
  return state;
};

/**
 * Creates a validator for invisible Unicode with custom error message suffix
 */
const createInvisibleUnicodeValidator = (suffix: string = ''): Validator => (state) => {
  if (hasInvisibleUnicode(state.path)) {
    return { ...state, valid: false, reason: `Path contains invisible Unicode characters${suffix}` };
  }
  return state;
};

// ============================================================================
// Individual Validators (Single Responsibility)
// ============================================================================

/**
 * Validates that path is not empty or undefined
 */
const validateNotEmpty: Validator = (state) => {
  if (!state.path || state.path.length === 0) {
    return { ...state, valid: false, reason: 'Path cannot be empty or undefined' };
  }
  return state;
};

/**
 * Validates no leading/trailing whitespace (potential obfuscation)
 */
const validateNoWhitespace: Validator = (state) => {
  if (state.path !== state.path.trim()) {
    return { ...state, valid: false, reason: 'Path contains leading or trailing whitespace' };
  }
  return state;
};

/**
 * Validates no null bytes (common attack vector)
 */
const validateNoNullBytes: Validator = (state) => {
  if (hasNullByte(state.path)) {
    return { ...state, valid: false, reason: 'Path contains null byte' };
  }
  return state;
};

/** Validates no control characters (pre-normalization) */
const validateNoControlChars = createControlCharValidator();

/** Validates no invisible Unicode characters (pre-normalization) */
const validateNoInvisibleUnicode = createInvisibleUnicodeValidator();

/**
 * Normalizes Unicode to NFC for consistent comparison
 */
const normalizeUnicode: Validator = (state) => ({
  ...state,
  path: state.path.normalize('NFC'),
});

/**
 * Re-validates control characters after normalization.
 * NFC normalization can theoretically affect character composition,
 * so we re-check as a security precaution.
 */
const validateNoControlCharsAfterNormalization = createControlCharValidator(' (after normalization)');

/**
 * Re-validates invisible Unicode after normalization.
 * Security precaution for edge cases in Unicode normalization.
 */
const validateNoInvisibleUnicodeAfterNormalization = createInvisibleUnicodeValidator(' (after normalization)');

/**
 * Validates PATH_MAX length (in bytes for Unicode safety)
 */
const validatePathMaxLength: Validator = (state) => {
  const byteLength = Buffer.byteLength(state.path, 'utf8');
  if (byteLength > PATH_MAX) {
    return {
      ...state,
      valid: false,
      reason: `Path exceeds maximum length (${byteLength} > ${PATH_MAX} bytes)`,
    };
  }
  return state;
};

/**
 * Validates no path traversal patterns (..)
 */
const validateNoTraversal: Validator = (state) => {
  if (hasPathTraversalStrict(state.path)) {
    return { ...state, valid: false, reason: 'Path contains traversal pattern (..)' };
  }
  return state;
};

/**
 * Validates no double forward slashes (potential path confusion)
 * Note: Double backslashes (\\) are caught by validateNoBackslash
 */
const validateNoDoubleSlash: Validator = (state) => {
  if (/\/\//.test(state.path)) {
    return { ...state, valid: false, reason: 'Path contains double slashes' };
  }
  return state;
};

/**
 * Validates no backslashes (cross-platform safety)
 */
const validateNoBackslash: Validator = (state) => {
  if (state.path.includes('\\')) {
    return {
      ...state,
      valid: false,
      reason: 'Path contains backslash (use forward slashes for cross-platform compatibility)',
    };
  }
  return state;
};

/**
 * Validates tilde patterns: only ~/ is allowed, not ~user
 */
const validateTildePattern: Validator = (state) => {
  if (state.path.startsWith('~')) {
    // Allow '~' or '~/...', but reject '~user' patterns
    if (state.path.length > 1 && !state.path.startsWith('~/')) {
      return {
        ...state,
        valid: false,
        reason: 'Tilde expansion to other users (~user) is not allowed, use ~/ only',
      };
    }
  }
  return state;
};

/**
 * Validates no Windows absolute paths (drive letters)
 */
const validateNoWindowsAbsolutePath: Validator = (state) => {
  if (/^[a-zA-Z]:/.test(state.path)) {
    return {
      ...state,
      valid: false,
      reason: 'Windows absolute paths (drive letters) are not allowed in this context',
    };
  }
  return state;
};

/**
 * Validates no UNC paths (\\server\share or \\?\)
 */
const validateNoUNCPath: Validator = (state) => {
  if (/^[/\\]{2}/.test(state.path)) {
    return {
      ...state,
      valid: false,
      reason: 'UNC paths and Windows device paths are not allowed',
    };
  }
  return state;
};

/**
 * Validates no Windows device paths (\\.\COM1, etc.)
 */
const validateNoWindowsDevicePath: Validator = (state) => {
  if (/^[/\\]{2}[.?\\]/.test(state.path)) {
    return {
      ...state,
      valid: false,
      reason: 'Windows device paths are not allowed',
    };
  }
  return state;
};

/**
 * Validates no trailing dots (cross-platform safety)
 * Note: '.' itself is valid and allowed
 */
const validateNoTrailingDot: Validator = (state) => {
  if (state.path !== '.' && state.path.endsWith('.')) {
    return {
      ...state,
      valid: false,
      reason: 'Path ends with dot (not allowed for cross-platform compatibility)',
    };
  }
  return state;
};

/**
 * Validates no trailing /./ or /../ patterns (edge cases)
 */
const validateNoTrailingDotSlash: Validator = (state) => {
  if (state.path.endsWith('/.') || state.path.endsWith('/..')) {
    return {
      ...state,
      valid: false,
      reason: 'Path ends with /./ or /../ (not allowed)',
    };
  }
  return state;
};

/**
 * Validates no Windows reserved device names
 */
const validateNoWindowsReservedNames: Validator = (state) => {
  const windowsReservedNames = /^(CON|PRN|AUX|NUL|COM\d|LPT\d)([./\\]|$)/i;
  const basename = state.path.split(/[/\\]/).pop() || '';
  if (windowsReservedNames.test(basename)) {
    return {
      ...state,
      valid: false,
      reason: 'Windows reserved device names are not allowed',
    };
  }
  return state;
};

/**
 * Validates path starts with a recognized prefix
 * Note: Traversal patterns (..) are already caught by validateNoTraversal,
 * so we don't need to re-check here.
 */
const validatePrefix: Validator = (state) => {
  const validPrefixes = [
    '/',      // Absolute Unix path
    '~/',     // Home directory
    '~',      // Home directory (exact match)
    '.',      // Current directory (but not ..)
  ];

  const startsWithValidPrefix = validPrefixes.some(prefix => {
    if (prefix === '.') {
      // Special handling for '.': must be exactly '.' or './'
      return state.path === '.' || state.path.startsWith('./');
    }
    return state.path === prefix || state.path.startsWith(prefix);
  });

  if (!startsWithValidPrefix) {
    return {
      ...state,
      valid: false,
      reason: 'Path must start with / (absolute), ~/ (home), or ./ (current directory)',
    };
  }
  return state;
};

// ============================================================================
// Validation Pipeline
// ============================================================================

/**
 * Pre-normalization validators
 * Must run before Unicode normalization
 */
const preNormalizationValidators: Validator[] = [
  validateNotEmpty,
  validateNoWhitespace,
  validateNoNullBytes,
  validateNoControlChars,
  validateNoInvisibleUnicode,
];

/**
 * Post-normalization validators
 * Run after Unicode normalization
 */
const postNormalizationValidators: Validator[] = [
  validateNoControlCharsAfterNormalization,
  validateNoInvisibleUnicodeAfterNormalization,
  validatePathMaxLength,
  validateNoTraversal,
  // Backslash check before double slash to give specific error for '\\'
  validateNoBackslash,
  validateNoDoubleSlash,
  validateTildePattern,
  validateNoWindowsAbsolutePath,
  // Device paths (\\.\, //./) must be checked before UNC for specific error messages
  validateNoWindowsDevicePath,
  validateNoUNCPath,
  validateNoTrailingDot,
  validateNoTrailingDotSlash,
  validateNoWindowsReservedNames,
  validatePrefix,
];

/**
 * Runs validators through pipeline, short-circuiting on first failure
 *
 * @param state - Current validation state
 * @param validators - Array of validators to run
 * @returns Final validation state (invalid if any validator fails)
 */
function runValidators(state: ValidationState, validators: Validator[]): ValidationState {
  for (const validator of validators) {
    if (!state.valid) {
      break; // Short-circuit on first failure
    }
    state = validator(state);
  }
  return state;
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
  // Initialize state
  let state: ValidationState = { valid: true, path };

  // Phase 1: Pre-normalization checks
  state = runValidators(state, preNormalizationValidators);
  if (!state.valid) {
    return { valid: false, reason: state.reason };
  }

  // Phase 2: Unicode normalization
  state = normalizeUnicode(state);

  // Phase 3: Post-normalization checks
  state = runValidators(state, postNormalizationValidators);
  if (!state.valid) {
    return { valid: false, reason: state.reason };
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
  const basicResult = isSecurePath(filePath);
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
  const baseDirResult = isSecurePath(allowedBaseDir);
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
