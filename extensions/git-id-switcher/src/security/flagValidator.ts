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
} from "../validators/common";

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
  "ssh-keygen": ["lf"], // -lf (list fingerprint of file)
};

/**
 * Detect unsafe characters in a flag argument.
 *
 * @remarks
 * **Naming convention**: Named with `detect` prefix because this function
 * looks for and reports security issues (whitespace, null bytes, control chars,
 * invisible Unicode) rather than just validating format.
 *
 * @internal
 */
function detectUnsafeCharsInFlag(flag: string): CombinedFlagResult | null {
  // CRITICAL: Check for leading/trailing whitespace (potential obfuscation)
  if (flag !== flag.trim()) {
    return {
      valid: false,
      reason: "Flag contains leading or trailing whitespace",
    };
  }

  // CRITICAL: Check for null bytes (common attack vector)
  if (hasNullByte(flag)) {
    return { valid: false, reason: "Flag contains null byte" };
  }

  // CRITICAL: Check for control characters (ASCII 0-31 except tab, newline)
  if (CONTROL_CHAR_REGEX_STRICT.test(flag)) {
    return { valid: false, reason: "Flag contains control characters" };
  }

  // CRITICAL: Check for invisible/zero-width Unicode characters
  if (hasInvisibleUnicode(flag)) {
    return {
      valid: false,
      reason: "Flag contains invisible Unicode characters",
    };
  }

  return null; // No security issues found
}

/**
 * Check for path-like patterns in flag characters.
 * @internal
 */
function hasPathLikePattern(flagChars: string): boolean {
  // Any "/" covers absolute ("/"), relative ("./") and parent ("../") paths
  return (
    flagChars.startsWith("~") ||
    flagChars.includes("/") ||
    flagChars.includes("\\")
  );
}

/**
 * Check if combined flag characters are valid and have no duplicates.
 * @internal
 */
function validateCombinedFlagChars(
  flagChars: string,
): CombinedFlagResult | null {
  // Check for duplicate characters (e.g., -ll)
  const charSet = new Set<string>();
  for (const char of flagChars) {
    if (charSet.has(char)) {
      return {
        valid: false,
        reason: "Duplicate flag character in combined flag",
      };
    }
    charSet.add(char);
  }
  return null; // No issues found
}

/**
 * Validate combined flag characters against the allowlist.
 *
 * @remarks
 * **Naming convention**: Named with `validate` prefix because this returns
 * a result object with `valid` boolean and optional `reason`. The explicit
 * `AgainstAllowlist` suffix clarifies what it's being validated against.
 *
 * @internal
 */
function validateCombinedFlagAgainstAllowlist(
  flagChars: string,
  command: string,
  allowedArgs: readonly string[],
): CombinedFlagResult {
  // Check if this command has allowed combined patterns
  const commandPatterns = ALLOWED_COMBINED_PATTERNS[command];
  if (commandPatterns?.includes(flagChars)) {
    return { valid: true };
  }

  // Extract allowed single-char flags from allowedArgs
  const allowedSingleChars = new Set<string>();
  for (const allowed of allowedArgs) {
    if (
      allowed.startsWith("-") &&
      !allowed.startsWith("--") &&
      allowed.length === 2
    ) {
      allowedSingleChars.add(allowed.at(1)!);
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
      reason: "Unknown flag character(s) in combined flag",
    };
  }

  // All characters are valid individual flags, but require explicit pattern definition
  return {
    valid: false,
    reason:
      "Combined flag is not explicitly allowed. Use separate flags instead.",
  };
}

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
  allowedArgs: readonly string[],
): CombinedFlagResult {
  const normalization = normalizeFlagSafely(flag);
  if (!normalization.ok) {
    return normalization.rejection;
  }
  const { normalizedFlag } = normalization;

  // Non-flag or long option - let caller handle
  if (!normalizedFlag.startsWith("-") || normalizedFlag.startsWith("--")) {
    return { valid: true };
  }

  // Length limit for DoS protection
  if (normalizedFlag.length > MAX_FLAG_LENGTH) {
    return { valid: false, reason: "Flag exceeds maximum length" };
  }

  // Extract flag characters (remove leading dash)
  return validateShortFlagChars(normalizedFlag.slice(1), command, allowedArgs);
}

/**
 * Result of {@link normalizeFlagSafely}: the normalized flag, or why it was rejected.
 * @internal
 */
type FlagNormalization =
  | { ok: true; normalizedFlag: string }
  | { ok: false; rejection: CombinedFlagResult };

/**
 * Reject unsafe characters, then return the NFC-normalized flag.
 *
 * Unsafe characters are checked both before and after normalization, so a
 * flag cannot pass by normalizing into an unsafe form.
 * @internal
 */
function normalizeFlagSafely(flag: string): FlagNormalization {
  // Basic validation
  if (!flag || flag.length === 0) {
    return { ok: false, rejection: { valid: false, reason: "Flag is empty" } };
  }

  // CRITICAL: Security character checks (whitespace, null bytes, control chars, invisible unicode)
  const securityCheck = detectUnsafeCharsInFlag(flag);
  if (securityCheck) {
    return { ok: false, rejection: securityCheck };
  }

  // CRITICAL: Normalize Unicode to NFC for consistent comparison
  const normalizedFlag = flag.normalize("NFC");

  /* c8 ignore start - Post-normalization check for edge cases in Unicode normalization */
  // CRITICAL: Re-check after normalization
  const normalizedSecurityCheck = detectUnsafeCharsInFlag(normalizedFlag);
  if (normalizedSecurityCheck) {
    return {
      ok: false,
      rejection: {
        valid: false,
        reason: normalizedSecurityCheck.reason + " (after normalization)",
      },
    };
  }
  /* c8 ignore stop */

  return { ok: true, normalizedFlag };
}

/**
 * Detect malformed short-flag characters (empty, path-like, or non-letters).
 * @internal
 */
function detectMalformedFlagChars(flagChars: string): CombinedFlagResult | null {
  if (flagChars.length === 0) {
    return { valid: false, reason: "Flag contains only dash" };
  }

  // CRITICAL: Check for flag-value concatenation (path-like patterns)
  if (hasPathLikePattern(flagChars)) {
    return {
      valid: false,
      reason:
        "Flag contains path-like pattern. Flags and values must be separate arguments.",
    };
  }

  // Check for invalid characters (only ASCII letters allowed)
  const invalidCharRegex = /[^a-zA-Z]/;
  if (invalidCharRegex.test(flagChars)) {
    return {
      valid: false,
      reason: "Flag contains invalid characters. Only ASCII letters allowed.",
    };
  }

  return null;
}

/**
 * Validate the characters of a short flag (after the leading dash).
 * @internal
 */
function validateShortFlagChars(
  flagChars: string,
  command: string,
  allowedArgs: readonly string[],
): CombinedFlagResult {
  const malformed = detectMalformedFlagChars(flagChars);
  if (malformed) {
    return malformed;
  }

  // Single character flag - check directly against allowlist
  if (flagChars.length === 1) {
    return allowedArgs.includes(`-${flagChars}`)
      ? { valid: true }
      : { valid: false, reason: "Flag is not in allowlist" };
  }

  // Combined flag validation (2+ characters)
  if (flagChars.length > MAX_COMBINED_FLAG_CHARS) {
    return { valid: false, reason: "Combined flag has too many characters" };
  }

  // Check for duplicate characters, then against allowlist patterns and individual flags
  return (
    validateCombinedFlagChars(flagChars) ??
    validateCombinedFlagAgainstAllowlist(flagChars, command, allowedArgs)
  );
}
