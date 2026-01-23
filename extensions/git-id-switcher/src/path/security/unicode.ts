/**
 * Unicode Security Validators
 *
 * Provides validators for detecting Unicode-based attacks:
 * - Control characters
 * - Invisible Unicode characters
 * - Unicode normalization
 */

import {
  CONTROL_CHAR_REGEX_STRICT,
  hasInvisibleUnicode,
} from '../../validators/common';

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
// Pre-built Validators
// ============================================================================

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
