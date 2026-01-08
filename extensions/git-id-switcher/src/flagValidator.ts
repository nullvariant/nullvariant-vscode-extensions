/**
 * Command Flag Validation Module
 *
 * Provides secure validation for command-line flags.
 * Prevents flag injection and validates combined flag patterns.
 *
 * Separated from commandAllowlist for Single Responsibility Principle.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

import {
  CONTROL_CHAR_REGEX_STRICT,
  hasInvisibleUnicode,
  hasNullByte,
} from './validators/common';

/**
 * Security constants for flag validation
 */
const MAX_FLAG_LENGTH = 50; // Maximum length for a single flag argument
const MAX_COMBINED_FLAG_CHARS = 10; // Maximum individual flag characters in combined form

/**
 * Result of combined flag validation
 */
export interface CombinedFlagResult {
  valid: boolean;
  reason?: string;
}

/**
 * Allowed combined flag patterns per command
 * Only explicitly listed combinations are allowed.
 * Patterns are matched exactly (order matters).
 */
const ALLOWED_COMBINED_PATTERNS: Record<string, readonly string[]> = {
  'ssh-keygen': ['lf'], // -lf (list fingerprint of file)
};

/**
 * Validate a combined flag argument (e.g., -lf, -abc)
 *
 * Security checks performed:
 * 1. Length limit to prevent DoS attacks
 * 2. Duplicate flag detection (e.g., -ll is rejected)
 * 3. Unknown flag detection (each character must be in allowlist)
 * 4. Exact match validation (patterns must match exactly)
 * 5. Only explicitly allowed combinations are permitted
 *
 * @param flag - The flag to validate (e.g., '-lf', '-abc')
 * @param command - The command being executed (e.g., 'ssh-keygen')
 * @param allowedArgs - Array of allowed individual flags
 * @returns CombinedFlagResult indicating if the flag is valid
 */
export function validateCombinedFlags(
  flag: string,
  command: string,
  allowedArgs: readonly string[]
): CombinedFlagResult {
  // Basic validation
  if (!flag || flag.length === 0) {
    return { valid: false, reason: 'Flag is empty' };
  }

  // CRITICAL: Check for leading/trailing whitespace (potential obfuscation)
  if (flag !== flag.trim()) {
    return { valid: false, reason: 'Flag contains leading or trailing whitespace' };
  }

  // CRITICAL: Check for null bytes (common attack vector)
  if (hasNullByte(flag)) {
    return { valid: false, reason: 'Flag contains null byte' };
  }

  // CRITICAL: Check for control characters (ASCII 0-31 except tab, newline)
  if (CONTROL_CHAR_REGEX_STRICT.test(flag)) {
    return { valid: false, reason: 'Flag contains control characters' };
  }

  // CRITICAL: Check for invisible/zero-width Unicode characters
  if (hasInvisibleUnicode(flag)) {
    return { valid: false, reason: 'Flag contains invisible Unicode characters' };
  }

  // CRITICAL: Normalize Unicode to NFC for consistent comparison
  // This prevents normalization-based attacks (e.g., combining characters)
  const normalizedFlag = flag.normalize('NFC');

  // CRITICAL: Re-check for control characters and invisible chars AFTER normalization
  if (CONTROL_CHAR_REGEX_STRICT.test(normalizedFlag)) {
    return { valid: false, reason: 'Flag contains control characters (after normalization)' };
  }
  if (hasInvisibleUnicode(normalizedFlag)) {
    return { valid: false, reason: 'Flag contains invisible Unicode characters (after normalization)' };
  }

  // Must start with single dash (not double dash for long options)
  if (!normalizedFlag.startsWith('-')) {
    // Non-flag argument - let caller handle
    return { valid: true };
  }

  // CRITICAL: Long options (--option) should be checked via exact match, not here
  // Return early to let caller handle long options explicitly
  if (normalizedFlag.startsWith('--')) {
    return { valid: true }; // Let caller handle long options via exact match
  }

  // Length limit for DoS protection (check normalized length)
  if (normalizedFlag.length > MAX_FLAG_LENGTH) {
    return {
      valid: false,
      reason: 'Flag exceeds maximum length',
    };
  }

  // Extract flag characters (remove leading dash)
  const flagChars = normalizedFlag.slice(1);

  // Empty after removing dash
  if (flagChars.length === 0) {
    return { valid: false, reason: 'Flag contains only dash' };
  }

  // CRITICAL: Check for flag-value concatenation (e.g., -f/path, -lfile, -fpath)
  // Some commands allow flags and values to be concatenated, but we reject this
  // for security to ensure clear separation between flags and values
  // This prevents obfuscation attacks where a flag is hidden in a path-like string
  // Check if flagChars contains path-like patterns (starts with /, ~, ., or contains path separators)
  if (
    flagChars.startsWith('/') ||
    flagChars.startsWith('~') ||
    flagChars.startsWith('./') ||
    flagChars.startsWith('../') ||
    flagChars.includes('/') ||
    flagChars.includes('\\')
  ) {
    return {
      valid: false,
      reason: 'Flag contains path-like pattern. Flags and values must be separate arguments.',
    };
  }

  // Check for invalid characters in flag
  // Valid flag characters are ASCII letters only (a-z, A-Z)
  // Numbers and special characters are not valid in combined short flags
  const invalidCharRegex = /[^a-zA-Z]/;
  if (invalidCharRegex.test(flagChars)) {
    return {
      valid: false,
      reason: 'Flag contains invalid characters. Only ASCII letters allowed.',
    };
  }

  // Single character flag - check directly against allowlist
  if (flagChars.length === 1) {
    const singleFlag = `-${flagChars}`;
    if (allowedArgs.includes(singleFlag)) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: 'Flag is not in allowlist',
    };
  }

  // Combined flag validation (2+ characters)
  // Check for maximum combined flag characters
  if (flagChars.length > MAX_COMBINED_FLAG_CHARS) {
    return {
      valid: false,
      reason: 'Combined flag has too many characters',
    };
  }

  // Check for duplicate characters (e.g., -ll)
  const charSet = new Set<string>();
  for (const char of flagChars) {
    if (charSet.has(char)) {
      return {
        valid: false,
        reason: 'Duplicate flag character in combined flag',
      };
    }
    charSet.add(char);
  }

  // Check if this command has allowed combined patterns
  const commandPatterns = ALLOWED_COMBINED_PATTERNS[command];

  if (commandPatterns) {
    // Check against explicitly allowed patterns (exact match required)
    if (commandPatterns.includes(flagChars)) {
      return { valid: true };
    }
  }

  // If no explicit pattern matched, check each character individually
  // All characters must be valid individual flags
  const allowedSingleChars = new Set<string>();
  for (const allowed of allowedArgs) {
    // Extract single-char flags (e.g., -l, -f, -d)
    if (allowed.startsWith('-') && !allowed.startsWith('--') && allowed.length === 2) {
      allowedSingleChars.add(allowed[1]);
    }
  }

  // Check each character in the combined flag
  const unknownChars: string[] = [];
  for (const char of flagChars) {
    if (!allowedSingleChars.has(char)) {
      unknownChars.push(char);
    }
  }

  if (unknownChars.length > 0) {
    return {
      valid: false,
      reason: 'Unknown flag character(s) in combined flag',
    };
  }

  // All characters are valid individual flags
  // But for security, we require explicit pattern definitions for combined flags
  // If no patterns are defined, reject the combined flag
  // This prevents unexpected flag combinations from being silently allowed
  return {
    valid: false,
    reason: 'Combined flag is not explicitly allowed. Use separate flags instead.',
  };
}
