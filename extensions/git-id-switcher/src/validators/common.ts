/**
 * Common Validation Functions
 *
 * Centralized validation utilities used across the extension.
 * Single source of truth for security validation patterns.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
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
 * Email validation regex (simplified RFC 5322)
 *
 * @deprecated Use isValidEmail() instead. This regex is kept for backward
 * compatibility but should not be used directly due to potential ReDoS concerns.
 * @see isValidEmail
 */
export const EMAIL_REGEX = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

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
