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
