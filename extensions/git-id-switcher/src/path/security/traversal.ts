/**
 * Path Traversal Validation Module
 *
 * Provides validators for detecting path traversal and structural attacks.
 * Part of the path security validation pipeline.
 *
 * @internal This module is part of the path security system.
 */

import { PATH_MAX } from '../../constants';
import { hasPathTraversalStrict } from '../../validators/common';

/**
 * Internal state for validation pipeline
 */
export interface ValidationState {
  valid: boolean;
  path: string;
  reason?: string;
}

/**
 * Validator function type for pipeline pattern
 */
export type Validator = (state: ValidationState) => ValidationState;

// ============================================================================
// Structural Validators
// ============================================================================

/**
 * Validates that path is not empty or undefined
 */
export const validateNotEmpty: Validator = (state) => {
  if (!state.path || state.path.length === 0) {
    return { ...state, valid: false, reason: 'Path cannot be empty or undefined' };
  }
  return state;
};

/**
 * Validates no leading/trailing whitespace (potential obfuscation)
 */
export const validateNoWhitespace: Validator = (state) => {
  if (state.path !== state.path.trim()) {
    return { ...state, valid: false, reason: 'Path contains leading or trailing whitespace' };
  }
  return state;
};

/**
 * Validates PATH_MAX length (in bytes for Unicode safety)
 */
export const validatePathMaxLength: Validator = (state) => {
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

// ============================================================================
// Path Traversal Validators
// ============================================================================

/**
 * Validates no path traversal patterns (..)
 */
export const validateNoTraversal: Validator = (state) => {
  if (hasPathTraversalStrict(state.path)) {
    return { ...state, valid: false, reason: 'Path contains traversal pattern (..)' };
  }
  return state;
};

/**
 * Validates no double forward slashes (potential path confusion)
 * Note: Double backslashes (\\) are caught by validateNoBackslash
 */
export const validateNoDoubleSlash: Validator = (state) => {
  if (/\/\//.test(state.path)) {
    return { ...state, valid: false, reason: 'Path contains double slashes' };
  }
  return state;
};

/**
 * Validates no backslashes (cross-platform safety)
 */
export const validateNoBackslash: Validator = (state) => {
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
export const validateTildePattern: Validator = (state) => {
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

// ============================================================================
// Platform-Specific Validators
// ============================================================================

/**
 * Validates no Windows absolute paths (drive letters)
 */
export const validateNoWindowsAbsolutePath: Validator = (state) => {
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
export const validateNoUNCPath: Validator = (state) => {
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
export const validateNoWindowsDevicePath: Validator = (state) => {
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
export const validateNoTrailingDot: Validator = (state) => {
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
export const validateNoTrailingDotSlash: Validator = (state) => {
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
export const validateNoWindowsReservedNames: Validator = (state) => {
  const windowsReservedNames = /^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])([./\\]|$)/i;
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
export const validatePrefix: Validator = (state) => {
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
