/**
 * Security-aware Error Classes
 *
 * Provides error classes that separate user-visible messages from internal details.
 * This prevents information leakage through error messages.
 *
 * Design goals:
 * - User-facing messages are generic and safe
 * - Internal details are logged but not exposed to users
 * - Stack traces are controlled to prevent file structure leakage
 */

import { securityLogger, sanitizeValue } from '../security/securityLogger';
import { sanitizePath } from '../security/pathSanitizer';

/**
 * Error category for classification and handling
 */
export enum ErrorCategory {
  /** Security-related errors (path traversal, injection, etc.) */
  SECURITY = 'SECURITY',
  /** Input validation errors */
  VALIDATION = 'VALIDATION',
  /** System/runtime errors */
  SYSTEM = 'SYSTEM',
  /** Configuration errors */
  CONFIG = 'CONFIG',
}

/**
 * Internal error details for logging (not exposed to users)
 */
export interface InternalErrorDetails {
  /** Original error if wrapping another error */
  originalError?: Error;
  /** Field or component that caused the error */
  field?: string;
  /** The problematic value (will be sanitized before logging) */
  value?: unknown;
  /** Additional context for debugging */
  context?: Record<string, unknown>;
}

/**
 * Options for creating a SecurityError
 */
export interface SecurityErrorOptions {
  /** Error category for classification */
  category: ErrorCategory;
  /** User-facing message (must not contain sensitive info) */
  userMessage: string;
  /** Internal details for logging */
  internalDetails?: InternalErrorDetails;
  /** Whether to log this error automatically (default: true) */
  autoLog?: boolean;
}

/**
 * Security-aware Error class
 *
 * Separates user-visible messages from internal details to prevent
 * information leakage through error messages.
 *
 * @example
 * ```typescript
 * throw new SecurityError({
 *   category: ErrorCategory.VALIDATION,
 *   userMessage: 'Invalid configuration',
 *   internalDetails: {
 *     field: 'identity.email',
 *     value: userInput,  // Will be sanitized in logs
 *     context: { identityId: 'work' }
 *   }
 * });
 * ```
 */
export class SecurityError extends Error {
  readonly category: ErrorCategory;
  readonly userMessage: string;
  readonly internalDetails: InternalErrorDetails;
  // V8のError.stackはgetter定義前に保存しないと循環参照になるため、
  // 生スタックをprivateフィールドに退避する
  private readonly rawStack: string | undefined;

  constructor(options: SecurityErrorOptions) {
    // User-facing message is the Error's message
    super(options.userMessage);

    this.name = 'SecurityError';
    this.category = options.category;
    this.userMessage = options.userMessage;
    this.internalDetails = options.internalDetails ?? {};

    // Capture stack trace but exclude this constructor
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SecurityError);
    }

    // getter定義前に生スタックを退避（循環参照の防止）
    this.rawStack = this.stack;

    // SECURITY: Override stack property to return sanitized stack by default
    // This prevents information leakage even if stack is accessed directly
    Object.defineProperty(this, 'stack', {
      get: () => this.getSafeStack() || '',
      configurable: true,
    });

    // Auto-log if enabled (default: true)
    if (options.autoLog !== false) {
      this.logError();
    }
  }

  /**
   * Get user-safe message (for display in UI)
   */
  getUserMessage(): string {
    return this.userMessage;
  }

  /**
   * Get internal details (for logging only)
   *
   * Returns a shallow-frozen copy to prevent external mutation
   * that could tamper with audit log integrity.
   */
  getInternalDetails(): Readonly<InternalErrorDetails> {
    return Object.freeze({ ...this.internalDetails });
  }

  /**
   * Log error details through security logger
   */
  private logError(): void {
    try {
      const field = this.internalDetails.field ?? 'unknown';
      const reason = this.userMessage;

      // SECURITY: Sanitize value before logging to prevent information leakage
      const sanitizedValue = sanitizeValue(this.internalDetails.value);

      // Log all security-relevant errors
      // SECURITY, VALIDATION, CONFIG, and SYSTEM errors are all logged
      securityLogger.logValidationFailure(
        `[${this.category}] ${field}`,
        reason,
        sanitizedValue
      );
    } catch {
      // SECURITY: Don't let logging failures prevent error propagation
      // Silently ignore logging errors to ensure SecurityError is still thrown
    }
  }

  /**
   * Get safe stack trace (with internal paths sanitized)
   */
  getSafeStack(): string | undefined {
    /* c8 ignore next 3 -- rawStack is undefined only on non-V8 runtimes without Error.captureStackTrace */
    if (!this.rawStack) {
      return undefined;
    }

    // Delegate path sanitization to pathSanitizer (SSOT for path redaction).
    // Extract file paths from V8 stack frames using string ops (no regex)
    // to avoid backtracking / ReDoS risk flagged by sonarjs/slow-regex.
    const lines = this.rawStack.split('\n');
    const safeLines = lines.map((line) => {
      // V8 stack frames end with :line:col or :line:col)
      const lineColMatch = /:(\d+):(\d+)\)?$/.exec(line);
      if (!lineColMatch?.index) return line;

      const suffixStart = lineColMatch.index;
      const suffix = line.slice(suffixStart);

      // Find the start of the path portion.
      // Parenthesized: "at Func (path:line:col)" — Bare: "at path:line:col"
      const parenPos = line.lastIndexOf('(', suffixStart);
      const pathStart =
        parenPos !== -1 && suffix.endsWith(')')
          ? parenPos + 1
          : line.lastIndexOf(' ', suffixStart) + 1;

      const pathOnly = line.slice(pathStart, suffixStart);
      const sanitized = sanitizePath(pathOnly);
      return line.slice(0, pathStart) + sanitized + suffix;
    });

    return safeLines.join('\n');
  }
}

/**
 * Factory functions for common error types
 */

/**
 * Create a validation error
 */
export function createValidationError(
  userMessage: string,
  details?: Omit<InternalErrorDetails, 'originalError'>
): SecurityError {
  return new SecurityError({
    category: ErrorCategory.VALIDATION,
    userMessage,
    internalDetails: details,
  });
}

/**
 * Create a security error (e.g., path traversal attempt)
 */
export function createSecurityViolationError(
  userMessage: string,
  details?: Omit<InternalErrorDetails, 'originalError'>
): SecurityError {
  return new SecurityError({
    category: ErrorCategory.SECURITY,
    userMessage,
    internalDetails: details,
  });
}

/**
 * Create a configuration error
 */
export function createConfigError(
  userMessage: string,
  details?: Omit<InternalErrorDetails, 'originalError'>
): SecurityError {
  return new SecurityError({
    category: ErrorCategory.CONFIG,
    userMessage,
    internalDetails: details,
  });
}

/**
 * Create a system error (wrapping an original error)
 */
export function createSystemError(
  userMessage: string,
  originalError: Error,
  details?: Omit<InternalErrorDetails, 'originalError'>
): SecurityError {
  // SECURITY: Strip stack from originalError before storing to prevent
  // unsanitized path leakage via getInternalDetails().originalError.stack
  const sanitizedOriginal = new Error(originalError.message);
  sanitizedOriginal.name = originalError.name;

  return new SecurityError({
    category: ErrorCategory.SYSTEM,
    userMessage,
    internalDetails: {
      ...details,
      originalError: sanitizedOriginal,
    },
  });
}

/**
 * Wrap an unknown error into a SecurityError
 */
export function wrapError(
  error: unknown,
  userMessage: string,
  details?: Omit<InternalErrorDetails, 'originalError'>
): SecurityError {
  const rawError =
    error instanceof Error ? error : new Error(String(error));

  // SECURITY: Strip stack from wrapped error before storing to prevent
  // unsanitized path leakage via getInternalDetails().originalError.stack
  const sanitizedError = new Error(rawError.message);
  sanitizedError.name = rawError.name;

  return new SecurityError({
    category: ErrorCategory.SYSTEM,
    userMessage,
    internalDetails: {
      ...details,
      originalError: sanitizedError,
    },
  });
}

/**
 * Check if an error is a SecurityError
 */
export function isSecurityError(error: unknown): error is SecurityError {
  return error instanceof SecurityError;
}

/**
 * Check if an error is fatal and should be propagated
 *
 * Fatal errors are those that indicate a security issue or
 * a critical system failure that cannot be recovered from.
 */
export function isFatalError(error: unknown): boolean {
  if (isSecurityError(error)) {
    return error.category === ErrorCategory.SECURITY;
  }
  return false;
}

/**
 * Get user-safe message from any error
 */
export function getUserSafeMessage(error: unknown): string {
  if (isSecurityError(error)) {
    return error.getUserMessage();
  }

  // For non-SecurityError, return a generic message
  return 'An unexpected error occurred';
}

// ============================================================================
// Unified Validation Types (Phase 4)
// ============================================================================

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
 * @deprecated This function exists for backward compatibility during migration.
 * New code should use structured validation that returns FieldValidationError directly.
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
