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
   */
  getInternalDetails(): InternalErrorDetails {
    return this.internalDetails;
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
    if (!this.stack) {
      return undefined;
    }

    // Remove absolute paths - only show relative paths from extension root
    const lines = this.stack.split('\n');
    const safeLines = lines.map((line) => {
      // Replace full paths with relative indicators
      // macOS: /Users/username/...
      // Linux: /home/username/...
      // Windows: C:\Users\username\... or \\?\C:\Users\...
      // Windows UNC: \\server\share\...
      // WSL: /mnt/c/Users/username/...
      // Windows drive letters: D:\...
      return line
        .replaceAll(/\/Users\/[^/\s:]+/g, '~')
        .replaceAll(/\/home\/[^/\s:]+/g, '~')
        .replaceAll(/C:\\Users\\[^\\\s:]+/gi, '~')
        .replaceAll(/[A-Z]:\\Users\\[^\\\s:]+/gi, '~')
        .replaceAll(/\\\\\?\\[A-Z]:\\Users\\[^\\\s:]+/gi, '~')
        .replaceAll(/\\\\[^\\]+\\[^\\]+/g, String.raw`\\server\share`)
        .replaceAll(/\/mnt\/[a-z]\/Users\/[^/\s:]+/gi, '~')
        .replaceAll(/\/var\/folders\/[^/]+\/[^/]+/g, '/tmp')
        .replaceAll(/\/private\/var\/folders\/[^/]+\/[^/]+/g, '/tmp');
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
  return new SecurityError({
    category: ErrorCategory.SYSTEM,
    userMessage,
    internalDetails: {
      ...details,
      originalError,
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
  const originalError =
    error instanceof Error ? error : new Error(String(error));

  return new SecurityError({
    category: ErrorCategory.SYSTEM,
    userMessage,
    internalDetails: {
      ...details,
      originalError,
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
