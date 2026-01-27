/**
 * Common Validation Functions
 *
 * Centralized validation utilities used across the extension.
 * Single source of truth for security validation patterns.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 *
 * ## Function Naming Conventions
 *
 * This module follows strict naming conventions for validation functions:
 *
 * | Pattern          | Behavior                                    | Example                          |
 * |------------------|---------------------------------------------|----------------------------------|
 * | `is*()` / `has*()` | Returns boolean                           | `isValidEmail()`, `hasNullByte()` |
 * | `validate*()`    | Returns result object `{valid, reason?}`    | `validatePathSecurity()`         |
 * | `*OrThrow()`     | Throws exception on failure                 | `validateKeyPathOrThrow()`       |
 * | `assert*()`      | Returns error result or null if valid       | `assertWithinWorkspaceBoundary()`|
 * | `detect*()`      | Returns detected issue or null              | `detectUnsafeCharsInFlag()`      |
 * | `check*()`       | Queries external state (side effects)       | `checkKeyLoadedInAgent()`        |
 *
 * ## Terminology
 *
 * | Term     | Meaning                                              | Example                       |
 * |----------|------------------------------------------------------|-------------------------------|
 * | `valid`  | Format/structure is correct                          | `isEmailFormatValid()`        |
 * | `secure` | Resistant to security attacks                        | `validatePathSecurity()`      |
 * | `safe`   | Safe for a specific context (e.g., shell execution)  | `isShellSafePath()`           |
 *
 * ## Prohibited Patterns
 *
 * - ❌ `check*()` for pure predicates (use `is*()` or `has*()`)
 * - ❌ `is*Valid*()` redundant prefix (use `isValid*()` or `validate*()`)
 * - ❌ Ambiguous names like `validateField()` (specify what's being validated)
 */

/**
 * Invisible/zero-width Unicode characters that could be used to
 * obfuscate paths (homograph attacks, visual spoofing)
 *
 * Used in:
 * - commandAllowlist.ts: path and flag validation
 */
export const INVISIBLE_CHARS = [
  '\u200B', // Zero-width space
  '\u200C', // Zero-width non-joiner
  '\u200D', // Zero-width joiner
  '\u200E', // Left-to-right mark
  '\u200F', // Right-to-left mark
  '\u2060', // Word joiner
  '\u2061', // Function application
  '\u2062', // Invisible times
  '\u2063', // Invisible separator
  '\u2064', // Invisible plus
  '\uFEFF', // Byte order mark (BOM)
  '\u00AD', // Soft hyphen
] as const;

/**
 * Control character regex pattern
 *
 * Matches ASCII control characters (0x00-0x1f, 0x7f) excluding common whitespace.
 * Used for input validation to prevent injection attacks.
 *
 * Note: Different modules may use slightly different patterns:
 * - Some exclude tab/newline (0x09, 0x0a, 0x0d)
 * - Some include all control characters
 */
// eslint-disable-next-line no-control-regex
export const CONTROL_CHAR_REGEX_STRICT = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;
// eslint-disable-next-line no-control-regex
export const CONTROL_CHAR_REGEX_ALL = /[\x00-\x1f\x7f]/;

/**
 * Check if a string contains null bytes
 *
 * Null bytes are a common attack vector for path truncation attacks.
 *
 * @param s - The string to check
 * @returns true if string contains null byte
 */
export function hasNullByte(s: string): boolean {
  return s.includes('\0');
}

/**
 * Check if a string contains control characters
 *
 * @param s - The string to check
 * @param strict - If true, allows tab/newline; if false, blocks all control chars
 * @returns true if string contains control characters
 */
export function hasControlChars(s: string, strict = true): boolean {
  const regex = strict ? CONTROL_CHAR_REGEX_STRICT : CONTROL_CHAR_REGEX_ALL;
  return regex.test(s);
}

/**
 * Check if a string contains path traversal patterns (simple)
 *
 * Fast, simple check for basic traversal patterns.
 * Use this for quick validation in non-critical paths.
 *
 * For security-critical path validation, use `hasPathTraversalStrict()` instead.
 *
 * @param s - The string to check
 * @returns true if string contains basic traversal pattern (..)
 *
 * @see hasPathTraversalStrict for comprehensive validation
 */
export function hasPathTraversal(s: string): boolean {
  // Simple check for basic traversal
  if (s.includes('..')) {
    return true;
  }
  return false;
}

/**
 * Check if a string contains path traversal patterns (comprehensive)
 *
 * More thorough check using regex patterns.
 * Use this for security-critical path validation (e.g., file paths, command arguments).
 *
 * Detects various path traversal attack patterns including:
 * - ../ and ..\
 * - /.. and \..
 * - Standalone ..
 * - ./../ and .././ patterns
 * - /./../ and /.././ patterns (absolute paths with relative traversal)
 * - 3+ consecutive dots (potential obfuscation)
 *
 * @param s - The string to check
 * @returns true if string contains path traversal patterns
 *
 * @see hasPathTraversal for simple validation
 */
export function hasPathTraversalStrict(s: string): boolean {
  const traversalPatterns = [
    /\.\.[/\\]/, // ../ or ..\
    /[/\\]\.\.$/, // ends with /.. or \..
    /[/\\]\.\.[/\\]/, // /../ or \..\
    /^\.\.[/\\]/, // starts with ../ or ..\
    /^\.\.$/,     // exactly ".."
    /\.\/\.\./,   // ./../ pattern (relative path with traversal)
    /\.\.\/\./,   // .././ pattern
    /\.{3,}/,     // 3+ consecutive dots (potential obfuscation)
    /\/\.\/\.\./, // /./../ pattern (absolute path with relative traversal)
    /\/\.\.\/\./, // /.././ pattern
  ];

  for (const pattern of traversalPatterns) {
    if (pattern.test(s)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a string contains invisible Unicode characters
 *
 * Invisible characters can be used to obfuscate paths and create
 * homograph attacks or visual spoofing.
 *
 * @param s - The string to check
 * @returns true if string contains invisible Unicode characters
 */
export function hasInvisibleUnicode(s: string): boolean {
  for (const char of INVISIBLE_CHARS) {
    if (s.includes(char)) {
      return true;
    }
  }
  return false;
}

/**
 * Validate an email address format
 *
 * Uses a split-based approach to avoid ReDoS vulnerabilities.
 * Validates: non-empty local part, single @, domain with at least one dot.
 *
 * @param email - The email string to validate
 * @returns true if email format is valid
 */
export function isValidEmail(email: string): boolean {
  // Length limit (RFC 5321: 254 chars max for email address)
  if (email.length > 254 || email.length === 0) {
    return false;
  }

  // No whitespace allowed
  if (/\s/.test(email)) {
    return false;
  }

  // No angle brackets allowed
  if (email.includes('<') || email.includes('>')) {
    return false;
  }

  // Split by @ - must have exactly one @
  const atIndex = email.indexOf('@');
  if (atIndex === -1 || atIndex !== email.lastIndexOf('@')) {
    return false;
  }

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  // Local part and domain must be non-empty
  if (local.length === 0 || domain.length === 0) {
    return false;
  }

  // Domain must contain at least one dot and not end with dot
  if (!domain.includes('.') || domain.endsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Validate a hex string (for GPG key IDs)
 *
 * @param value - The string to validate
 * @returns true if string contains only hex characters
 */
export function isValidHex(value: string): boolean {
  return /^[A-Fa-f0-9]+$/.test(value);
}

// =============================================================================
// SSH Host Validation
// =============================================================================

/**
 * SSH host alias pattern (DNS-safe characters)
 *
 * Must start with alphanumeric, followed by alphanumeric, dots, underscores, or hyphens.
 */
export const SSH_HOST_PATTERN = '^[a-zA-Z0-9][a-zA-Z0-9._-]*$';

/**
 * SSH host alias regex
 */
export const SSH_HOST_REGEX = new RegExp(SSH_HOST_PATTERN);

/**
 * Validate SSH host alias format
 *
 * @param value - The SSH host alias to validate
 * @returns true if format is valid
 */
export function isValidSshHost(value: string): boolean {
  return SSH_HOST_REGEX.test(value);
}

// =============================================================================
// GPG Key ID Validation
// =============================================================================

/**
 * GPG key ID pattern (8-40 hex characters)
 *
 * GPG key IDs can be:
 * - Short key ID: 8 characters (32 bits)
 * - Long key ID: 16 characters (64 bits)
 * - Full fingerprint: 40 characters (160 bits, SHA-1)
 */
export const GPG_KEY_PATTERN = '^[A-Fa-f0-9]{8,40}$';

/**
 * GPG key ID regex
 */
export const GPG_KEY_REGEX = new RegExp(GPG_KEY_PATTERN);

/**
 * Validate GPG key ID format
 *
 * Uses existing isValidHex() for hex character validation,
 * combined with length check.
 *
 * @param value - The GPG key ID to validate
 * @returns true if format is valid (8-40 hex characters)
 */
export function isValidGpgKeyId(value: string): boolean {
  return value.length >= 8 && value.length <= 40 && isValidHex(value);
}

// =============================================================================
// Identity ID Validation
// =============================================================================

/**
 * Identity ID pattern (alphanumeric, underscores, hyphens)
 *
 * Used for identity configuration keys.
 * Length validation is separate (via maxLength parameter).
 */
export const IDENTITY_ID_PATTERN = '^[a-zA-Z0-9_-]+$';

/**
 * Identity ID regex
 */
export const IDENTITY_ID_REGEX = new RegExp(IDENTITY_ID_PATTERN);

/**
 * Validate identity ID format and length
 *
 * @param value - The identity ID to validate
 * @param maxLength - Maximum allowed length
 * @returns true if format and length are valid
 */
export function isValidIdentityId(value: string, maxLength: number): boolean {
  return value.length > 0 && value.length <= maxLength && IDENTITY_ID_REGEX.test(value);
}

// =============================================================================
// Safe Text Validation (Shell Metacharacter Prevention)
// =============================================================================

/**
 * Pattern to match safe text (no control chars or shell metacharacters)
 *
 * Note: Semicolon (;) is intentionally ALLOWED - valid in names like "Null;Variant"
 *
 * Blocked characters:
 * - Control characters: \x00-\x1f, \x7f
 * - Backtick: `
 * - Dollar sign: $
 * - Parentheses: ()
 * - Braces: {}
 * - Pipe: |
 * - Ampersand: &
 * - Angle brackets: <>
 */
export const SAFE_TEXT_PATTERN = '^[^\\x00-\\x1f\\x7f`$(){}|&<>]+$';

/**
 * Safe text regex
 *
 * The pattern string above is for JSON Schema validation.
 * This regex is for runtime validation with the same pattern.
 * Using regex literal (consistent with CONTROL_CHAR_REGEX_ALL above).
 */
// eslint-disable-next-line no-control-regex
export const SAFE_TEXT_REGEX = /^[^\x00-\x1f\x7f`$(){}|&<>]+$/;

/**
 * Dangerous character patterns for validation (with descriptions)
 *
 * Used by inputValidator for detailed error messages.
 * Each pattern includes a human-readable description for user feedback.
 *
 * Note: For simple boolean check, use `hasDangerousChars()` instead.
 * This array is for cases where you need to report which specific
 * dangerous pattern was detected.
 */
export const DANGEROUS_PATTERNS: ReadonlyArray<{ pattern: RegExp; description: string }> = [
  { pattern: /[`$(){}|&<>]/, description: 'shell metacharacters' },
  { pattern: /[\n\r]/, description: 'newline characters' },
  { pattern: /\\x[0-9a-f]{2}/i, description: 'hex escape sequences' },
  { pattern: /\0/, description: 'null bytes' },
] as const;

/**
 * Check if text contains dangerous characters
 *
 * Uses SAFE_TEXT_REGEX for efficient single-pass validation.
 * Returns true if text is empty or contains any blocked character.
 *
 * For detailed error messages identifying which pattern matched,
 * iterate over DANGEROUS_PATTERNS instead.
 *
 * @param text - The text to check
 * @returns true if text is empty or contains dangerous characters (unsafe for shell)
 */
export function hasDangerousChars(text: string): boolean {
  return !SAFE_TEXT_REGEX.test(text);
}

// =============================================================================
// Field-specific Dangerous Character Detection
// =============================================================================

/**
 * Pattern for dangerous characters in file paths (strict mode)
 *
 * Blocks shell metacharacters that could enable command injection:
 * - Backtick (`): Command substitution
 * - Dollar sign ($): Variable expansion / command substitution
 * - Pipe (|): Pipeline
 * - Semicolon (;): Command separator
 * - Ampersand (&): Background execution / logical AND
 * - Angle brackets (<>): Redirection
 *
 * Note: This is stricter than text fields because paths are more likely
 * to be used in shell contexts (e.g., ssh -i <path>).
 */
export const DANGEROUS_CHARS_FOR_PATH_REGEX = /[`$|;&<>]/;

/**
 * Pattern for dangerous characters in text fields (relaxed mode)
 *
 * Only blocks command substitution characters:
 * - Backtick (`): Command substitution
 * - Dollar sign ($): Variable expansion / command substitution
 *
 * Allows:
 * - Semicolon (;): Valid in names like "Null;Variant"
 * - Pipe (|): May appear in descriptions
 * - Ampersand (&): May appear in company names like "AT&T"
 * - Angle brackets (<>): May appear in descriptions
 */
export const DANGEROUS_CHARS_FOR_TEXT_REGEX = /[`$]/;

/**
 * Check for dangerous characters in file paths (strict mode)
 *
 * Blocks shell metacharacters that could enable command injection.
 * Use this for sshKeyPath and other path-related fields.
 *
 * @param value - The path string to check
 * @returns true if path contains dangerous characters
 */
export function hasDangerousCharsForPath(value: string): boolean {
  return DANGEROUS_CHARS_FOR_PATH_REGEX.test(value);
}

/**
 * Check for dangerous characters in text fields (relaxed mode)
 *
 * Only blocks command substitution characters, allows semicolons and other
 * characters that may legitimately appear in names and descriptions.
 * Use this for name, service, description, and icon fields.
 *
 * @param value - The text string to check
 * @returns true if text contains dangerous characters
 */
export function hasDangerousCharsForText(value: string): boolean {
  return DANGEROUS_CHARS_FOR_TEXT_REGEX.test(value);
}
