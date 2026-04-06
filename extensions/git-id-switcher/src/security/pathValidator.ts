/**
 * Path Security Validation Module
 *
 * Provides secure path validation functions.
 * Prevents path traversal attacks and validates path safety.
 *
 * Separated from commandAllowlist for Single Responsibility Principle.
 * Refactored using pipeline pattern for KISS compliance (Issue-00041).
 *
 * This module re-exports validators from specialized modules:
 * - pathUnicodeDetector.ts: Unicode attack detection
 * - pathTraversalDetector.ts: Path traversal detection
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

import { PATH_MAX } from '../core/constants';
import { hasNullByte } from '../validators/common';

// Re-export from pathUnicodeDetector.ts
export {
  ValidationState,
  Validator,
  createControlCharValidator,
  createInvisibleUnicodeValidator,
  controlCharValidator,
  invisibleUnicodeValidator,
  normalizeUnicode,
  validateNoControlCharsAfterNormalization,
  validateNoInvisibleUnicodeAfterNormalization,
} from './pathUnicodeDetector';

// Re-export from pathTraversalDetector.ts
export {
  validateNoTraversal,
  validateNoDoubleSlash,
  validateNoBackslash,
  validateNoTrailingDot,
  validateNoTrailingDotSlash,
} from './pathTraversalDetector';

// Import for internal use
import {
  ValidationState,
  Validator,
  controlCharValidator,
  invisibleUnicodeValidator,
  normalizeUnicode,
  validateNoControlCharsAfterNormalization,
  validateNoInvisibleUnicodeAfterNormalization,
} from './pathUnicodeDetector';

import {
  validateNoTraversal,
  validateNoDoubleSlash,
  validateNoBackslash,
  validateNoTrailingDot,
  validateNoTrailingDotSlash,
} from './pathTraversalDetector';

/**
 * Result of secure path validation
 */
export interface SecurePathResult {
  valid: boolean;
  reason?: string;
}

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
 * Validates tilde patterns: only ~/ is allowed, not ~user
 */
const validateTildePattern: Validator = (state) => {
  if (state.path.startsWith('~') && // Allow '~' or '~/...', but reject '~user' patterns
    state.path.length > 1 && !state.path.startsWith('~/')) {
      return {
        ...state,
        valid: false,
        reason: 'Tilde expansion to other users (~user) is not allowed, use ~/ only',
      };
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
 *
 * Note: Defense-in-depth. Unreachable due to validateNoBackslash and
 * validateNoDoubleSlash catching these patterns first.
 */
/* c8 ignore start - Defense-in-depth: unreachable due to prior validators */
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
/* c8 ignore stop */

/**
 * Validates no Windows device paths (\\.\COM1, etc.)
 *
 * Note: Defense-in-depth. Unreachable due to validateNoBackslash and
 * validateNoDoubleSlash catching these patterns first.
 */
/* c8 ignore start - Defense-in-depth: unreachable due to prior validators */
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
/* c8 ignore stop */

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
 * Validates path starts with a recognized prefix (/, ~/, ~, or ./).
 *
 * @remarks
 * **Naming convention**: Named with `validate` prefix because this is a validator
 * function that returns a validation state. It does not throw exceptions.
 *
 * Note: Traversal patterns (..) are already caught by validateNoTraversal,
 * so we don't need to re-check here.
 */
const validatePathHasAllowedPrefix: Validator = (state) => {
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
  controlCharValidator,
  invisibleUnicodeValidator,
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
  validatePathHasAllowedPrefix,
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
 * Validate a path argument for comprehensive security.
 *
 * This function performs comprehensive security checks on file paths:
 * - Rejects path traversal patterns (.., //)
 * - Rejects ~user patterns (only ~/ is allowed)
 * - Rejects Windows special paths (UNC, device paths)
 * - Rejects null bytes and control characters
 * - Enforces PATH_MAX length limit
 * - Normalizes Unicode (NFC)
 *
 * @remarks
 * **Naming convention**: Named with `validate` prefix and `Security` suffix because:
 * - `validate*()` returns a result object with `valid` boolean and optional `reason`
 * - `Security` indicates this checks for attack resistance, not just format validity
 *
 * **Terminology**:
 * - `valid`: Format/structure is correct (e.g., `isEmailFormatValid()`)
 * - `secure`: Resistant to security attacks (e.g., `validatePathSecurity()`)
 * - `safe`: Safe for a specific context (e.g., `isShellSafePath()`)
 *
 * @param inputPath - The path string to validate
 * @returns SecurePathResult indicating if path is secure
 *
 * @example
 * validatePathSecurity('/home/user/.ssh/id_rsa')  // { valid: true }
 * validatePathSecurity('../etc/passwd')           // { valid: false, reason: '...' }
 */
export function validatePathSecurity(inputPath: string): SecurePathResult {
  // Initialize state
  let state: ValidationState = { valid: true, path: inputPath };

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
