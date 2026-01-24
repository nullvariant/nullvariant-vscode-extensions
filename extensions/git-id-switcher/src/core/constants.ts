/**
 * Shared Constants
 *
 * Centralized constants used across the extension.
 * Single source of truth for security limits and configuration values.
 */

/**
 * POSIX PATH_MAX limit
 *
 * Used for path length validation across multiple modules:
 * - commandAllowlist.ts: path argument validation
 * - pathUtils.ts: path normalization
 * - securityLogger.ts: log sanitization
 */
export const PATH_MAX = 4096;

/**
 * Maximum number of identities allowed
 *
 * Used for DoS protection in:
 * - identity.ts: identity loading
 * - configChangeDetector.ts: config change detection
 * - securityLogger.ts: identity change summarization
 */
export const MAX_IDENTITIES = 1000;

/**
 * Maximum string length for pattern matching
 *
 * Used in securityLogger.ts for DoS protection
 */
export const MAX_PATTERN_CHECK_LENGTH = 1000;

/**
 * Maximum string length to log (truncate longer)
 *
 * Used in securityLogger.ts for log sanitization
 */
export const MAX_LOG_STRING_LENGTH = 50;

/**
 * Minimum length for secret-like string detection
 */
export const MIN_SECRET_LENGTH = 32;

/**
 * Maximum length for secret-like string detection
 */
export const MAX_SECRET_LENGTH = 256;

/**
 * Maximum identity ID length
 *
 * Matches IDENTITY_SCHEMA.id.maxLength in configSchema.ts
 */
export const MAX_ID_LENGTH = 64;

/**
 * Security limits object for backwards compatibility
 *
 * @deprecated Use individual constants instead
 */
export const SECURITY_LIMITS = {
  MAX_PATH_LENGTH: PATH_MAX,
  MAX_PATTERN_CHECK_LENGTH,
  MAX_LOG_STRING_LENGTH,
  MIN_SECRET_LENGTH,
  MAX_SECRET_LENGTH,
  MAX_ID_LENGTH,
} as const;
