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

// ============================================================================
// Field Length Limits
// ============================================================================

/**
 * Maximum email address length per RFC 5321
 *
 * RFC 5321 Section 4.5.3.1 specifies:
 * - Local part: max 64 octets (4.5.3.1.1)
 * - Domain: max 255 octets (4.5.3.1.2)
 * - Total: 64 + 1 (@) + 255 = 320 characters maximum
 */
export const MAX_EMAIL_LENGTH = 320;

/**
 * Maximum SSH host length (DNS maximum)
 *
 * RFC 1035 specifies 253 characters maximum for fully qualified domain names.
 */
export const MAX_SSH_HOST_LENGTH = 253;

/**
 * Maximum display name length
 *
 * Reasonable limit for git user.name and identity display names.
 */
export const MAX_NAME_LENGTH = 256;

/**
 * Maximum service name length
 *
 * Used for service identifiers like "github", "gitlab", etc.
 */
export const MAX_SERVICE_LENGTH = 64;

/**
 * Maximum description length
 *
 * Used for identity descriptions and notes.
 */
export const MAX_DESCRIPTION_LENGTH = 500;

// ============================================================================
// Security: Control Character Detection
// ============================================================================

/**
 * Control character regex pattern (strict)
 *
 * Matches ASCII control characters (0x00-0x1f, 0x7f) excluding common whitespace.
 * Allows tab (0x09), newline (0x0a), and carriage return (0x0d).
 * Used for input validation to prevent injection attacks.
 */
// eslint-disable-next-line no-control-regex
export const CONTROL_CHAR_REGEX_STRICT = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

/**
 * Control character regex pattern (all)
 *
 * Matches all ASCII control characters (0x00-0x1f, 0x7f) including whitespace.
 * Used for strict input validation where no control characters are acceptable.
 */
// eslint-disable-next-line no-control-regex
export const CONTROL_CHAR_REGEX_ALL = /[\u0000-\u001F\u007F]/;

// ============================================================================
// Security: Prototype Pollution Prevention
// ============================================================================

/**
 * Keys that indicate prototype pollution attempts
 *
 * Rejected unconditionally in object key validation and field name parsing.
 * defense-in-depth: Even though Object.keys() skips prototype chain,
 * __proto__ can exist as an own property via JSON.parse or object literal.
 *
 * Used in:
 * - configSchema.ts: identity object key validation
 * - validation-types.ts: parsed field name validation
 */
export const DANGEROUS_PROTOTYPE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// ============================================================================
// Error String Limits
// ============================================================================

/**
 * Maximum error string length for validation error parsing
 *
 * Prevents memory exhaustion from oversized external input (e.g., git stderr).
 * Strings exceeding this limit are truncated before parsing.
 */
export const MAX_ERROR_STRING_LENGTH = 1024;

// ============================================================================
// Icon Limits
// ============================================================================

/**
 * Maximum icon byte length
 *
 * Composed emojis (e.g., family emoji with ZWJ sequences) can be up to 32 bytes.
 */
export const MAX_ICON_BYTE_LENGTH = 32;

/**
 * Maximum icon grapheme count
 *
 * Icons should be a single visible character (grapheme cluster).
 */
export const MAX_ICON_GRAPHEME_COUNT = 1;

// ============================================================================
// GPG Key Limits
// ============================================================================

/**
 * Minimum GPG key ID length
 *
 * Short key IDs are 8 hex characters.
 */
export const MIN_GPG_KEY_LENGTH = 8;

/**
 * Maximum GPG key ID length
 *
 * Full fingerprints are 40 hex characters.
 */
export const MAX_GPG_KEY_LENGTH = 40;

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
