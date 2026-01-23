/**
 * Path Traversal Security Validators
 *
 * Provides validators for detecting path traversal attacks:
 * - Directory traversal patterns (..)
 * - Double slashes
 * - Backslashes
 * - Trailing dots
 */

import { hasPathTraversalStrict } from '../../validators/common';
import { Validator } from './unicode';

// ============================================================================
// Traversal Validators
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
 *
 * Note: This validator is defense-in-depth code. Due to pipeline order:
 * - /. endings are caught first by validateNoTrailingDot
 * - /.. endings are caught first by validateNoTraversal
 * This code exists as a safety net if upstream validators are modified.
 */
/* c8 ignore start - Defense-in-depth: unreachable due to prior validators */
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
/* c8 ignore stop */
