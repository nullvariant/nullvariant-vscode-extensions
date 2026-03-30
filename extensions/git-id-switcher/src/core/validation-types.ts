/**
 * Unified Validation Types (Phase 4)
 *
 * Provides field-level validation error types and utilities
 * for consistent validation result handling across the codebase.
 */

/**
 * Field-level validation error
 *
 * Represents a validation error for a specific field.
 * Properties are readonly to ensure immutability after creation.
 */
export interface FieldValidationError {
  /** Field name that failed validation */
  readonly field: string;
  /** Error message describing the validation failure */
  readonly message: string;
}

/**
 * Unified validation result
 *
 * A consistent structure for validation results across the codebase.
 * Properties are readonly to ensure immutability after creation.
 */
export interface UnifiedValidationResult {
  /** Whether validation passed */
  readonly isValid: boolean;
  /** List of field-level errors (empty if isValid is true) */
  readonly errors: readonly FieldValidationError[];
}

/**
 * Parse a string error message into a FieldValidationError
 *
 * @param error - Error string in format "field: message" or plain message
 * @returns FieldValidationError with parsed field and message
 *
 * @example
 * ```typescript
 * // Standard format with colon separator
 * toFieldError('email: Invalid format')
 * // Returns: { field: 'email', message: 'Invalid format' }
 *
 * // No colon - treated as unknown field
 * toFieldError('Unknown error')
 * // Returns: { field: 'unknown', message: 'Unknown error' }
 *
 * // Empty string
 * toFieldError('')
 * // Returns: { field: 'unknown', message: '' }
 *
 * // Empty field name (colon at start) - treated as unknown
 * toFieldError(': message only')
 * // Returns: { field: 'unknown', message: ': message only' }
 * ```
 */
export function toFieldError(error: string): FieldValidationError {
  const colonIndex = error.indexOf(':');
  if (colonIndex === -1) {
    return {
      field: 'unknown',
      message: error,
    };
  }

  const field = error.slice(0, colonIndex).trim();
  const message = error.slice(colonIndex + 1).trim();

  // If field is empty after trim, use 'unknown'
  if (!field) {
    return {
      field: 'unknown',
      message: error,
    };
  }

  return { field, message };
}
