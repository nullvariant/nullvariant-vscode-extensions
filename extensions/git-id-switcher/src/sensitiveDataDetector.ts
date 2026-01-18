/**
 * Sensitive Data Detection Module
 *
 * Provides functions to detect and sanitize potentially sensitive data
 * before logging. Prevents information leakage in audit logs.
 *
 * Separated from SecurityLogger for Single Responsibility Principle.
 */

import {
  MAX_PATTERN_CHECK_LENGTH,
  MAX_LOG_STRING_LENGTH,
  MIN_SECRET_LENGTH,
  MAX_SECRET_LENGTH,
} from './constants';
import { sanitizePath } from './pathSanitizer';

/**
 * Keywords that indicate sensitive data in string values
 */
const SENSITIVE_KEYWORDS = [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /bearer/i,
  /authorization/i,
  /credential/i,
  /private/i,
] as const;

/**
 * Check if a string looks like it might contain sensitive data
 *
 * @param value - The string to check
 * @returns true if the string appears to contain sensitive data
 */
export function looksLikeSensitiveData(value: string): boolean {
  // DoS protection: limit check length
  const checkValue =
    value.length > MAX_PATTERN_CHECK_LENGTH
      ? value.slice(0, MAX_PATTERN_CHECK_LENGTH)
      : value;

  for (const keyword of SENSITIVE_KEYWORDS) {
    if (keyword.test(checkValue)) {
      return true;
    }
  }

  // Check for patterns that look like secrets (base64, hex, etc.)
  // SECURITY: More strict detection to reduce false positives
  // Only check if string is within reasonable length to avoid ReDoS
  if (
    checkValue.length >= MIN_SECRET_LENGTH &&
    checkValue.length <= MAX_SECRET_LENGTH
  ) {
    // Base64-like strings typically have:
    // - High entropy (mix of uppercase, lowercase, numbers)
    // - Padding with = at the end
    // - Length multiple of 4 (for base64)
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
    if (base64Pattern.test(checkValue)) {
      // Additional check: base64 strings usually have high character diversity
      // Count unique character types (uppercase, lowercase, numbers, special)
      const hasUpper = /[A-Z]/.test(checkValue);
      const hasLower = /[a-z]/.test(checkValue);
      const hasNumbers = /[0-9]/.test(checkValue);
      const hasSpecial = /[+/=]/.test(checkValue);
      const typeCount = [hasUpper, hasLower, hasNumbers, hasSpecial].filter(Boolean).length;

      // Require at least 3 character types to reduce false positives
      // (e.g., "12345678901234567890123456789012" should not match)
      if (typeCount >= 3) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a string looks like a file path.
 * @internal
 */
function looksLikePath(value: string): boolean {
  return (
    value.startsWith('/') ||
    value.startsWith('~') ||
    /^[A-Za-z]:/.test(value) ||
    /^\\\\/.test(value)
  );
}

/**
 * Sanitize a string value for safe logging.
 * @internal
 */
function sanitizeStringValue(value: string): string {
  // Empty strings are safe
  if (value.length === 0) {
    return value;
  }

  // Sanitize paths first (Windows UNC paths, drive letters, Unix paths)
  if (looksLikePath(value)) {
    return sanitizePath(value);
  }

  // Check for sensitive-looking data
  if (looksLikeSensitiveData(value)) {
    return '[REDACTED:SENSITIVE_VALUE]';
  }

  // Truncate long strings for security
  if (value.length > MAX_LOG_STRING_LENGTH) {
    return value.slice(0, MAX_LOG_STRING_LENGTH) + '...[truncated]';
  }

  return value;
}

/**
 * Sanitize an object value for safe logging.
 * @internal
 */
function sanitizeObjectValue(value: object): string {
  // For arrays, show length only (contents might be sensitive)
  if (Array.isArray(value)) {
    return `[Array(${value.length})]`;
  }

  // For objects, sanitize keys and show key count
  const keys = Object.keys(value);
  const sanitizedKeys = keys.map(key =>
    looksLikeSensitiveData(key) ? '[REDACTED_KEY]' : key
  );
  const safeKeys = sanitizedKeys.filter(k => k !== '[REDACTED_KEY]');

  // All keys are safe, show them (limited to 5 for readability)
  if (safeKeys.length === keys.length) {
    const keyList = safeKeys.slice(0, 5).join(', ');
    const suffix = safeKeys.length > 5 ? '...' : '';
    return `[Object(${keys.length} keys: ${keyList}${suffix})]`;
  }

  // Some keys are sensitive, only show count
  return `[Object(${keys.length} keys)]`;
}

/**
 * Options for sanitizeValue function
 */
export interface SanitizeOptions {
  /** When true, all string values are masked (maximum privacy mode) */
  redactAllSensitive?: boolean;
}

/**
 * Sanitize a value for safe logging
 * Removes or masks potentially sensitive information.
 *
 * Applies multiple layers of protection:
 * 1. Path sanitization for file paths
 * 2. Sensitive keyword detection
 * 3. Length truncation
 * 4. Object/array abstraction
 *
 * @param value - The value to sanitize
 * @param options - Sanitization options
 * @returns Sanitized value safe for logging
 */
export function sanitizeValue(value: unknown, options?: SanitizeOptions): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    // Maximum privacy mode: redact all string values
    if (options?.redactAllSensitive) {
      return '[REDACTED:ALL_VALUES]';
    }
    return sanitizeStringValue(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'object') {
    return sanitizeObjectValue(value);
  }

  // For functions and symbols, just show type
  return `[${typeof value}]`;
}

/**
 * Sanitize all values in a details object
 *
 * @param details - The details object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized details object safe for logging
 */
export function sanitizeDetails(
  details: Record<string, unknown>,
  options?: SanitizeOptions
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(details)) {
    // Sanitize the key itself if it looks sensitive
    const sanitizedKey = looksLikeSensitiveData(key)
      ? '[REDACTED_KEY]'
      : key;
    sanitized[sanitizedKey] = sanitizeValue(value, options);
  }

  return sanitized;
}
