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
} from '../validators/common';

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

/**
 * Validator that rejects paths containing control characters (pre-normalization).
 *
 * @remarks
 * **Naming convention**: Named as a validator object (noun) rather than a function
 * because it's a pre-built validator instance created by a factory function.
 */
export const controlCharValidator = createControlCharValidator();

/**
 * Validator that rejects paths containing invisible Unicode characters (pre-normalization).
 *
 * @remarks
 * **Naming convention**: Named as a validator object (noun) rather than a function
 * because it's a pre-built validator instance created by a factory function.
 */
export const invisibleUnicodeValidator = createInvisibleUnicodeValidator();

/**
 * @deprecated Use `controlCharValidator` instead. This alias will be removed in a future version.
 */
export const validateNoControlChars = controlCharValidator;

/**
 * @deprecated Use `invisibleUnicodeValidator` instead. This alias will be removed in a future version.
 */
export const validateNoInvisibleUnicode = invisibleUnicodeValidator;

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
