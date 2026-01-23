/**
 * Path Security Validation Module
 *
 * Provides secure path validation functions.
 * Prevents path traversal attacks and validates path safety.
 *
 * This module re-exports functions from the path/security/ directory for backwards compatibility.
 * New code should import directly from the specific modules:
 * - './path/security/traversal' for path traversal validation
 * - './path/security/unicode' for Unicode/character validation
 *
 * Separated from commandAllowlist for Single Responsibility Principle.
 * Refactored using pipeline pattern for KISS compliance (Issue-00041).
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

// Import traversal validators
import {
  type ValidationState,
  type Validator,
  validateNotEmpty,
  validateNoWhitespace,
  validatePathMaxLength,
  validateNoTraversal,
  validateNoDoubleSlash,
  validateNoBackslash,
  validateTildePattern,
  validateNoWindowsAbsolutePath,
  validateNoUNCPath,
  validateNoWindowsDevicePath,
  validateNoTrailingDot,
  validateNoTrailingDotSlash,
  validateNoWindowsReservedNames,
  validatePrefix,
} from './path/security/traversal';

// Import Unicode validators
import {
  validateNoNullBytes,
  validateNoControlChars,
  validateNoInvisibleUnicode,
  normalizeUnicode,
  validateNoControlCharsAfterNormalization,
  validateNoInvisibleUnicodeAfterNormalization,
  isSecureLogPathImpl,
  type SecureLogPathResult,
} from './path/security/unicode';

// ============================================================================
// Public Types
// ============================================================================

/**
 * Result of secure path validation
 */
export interface SecurePathResult {
  valid: boolean;
  reason?: string;
}

// Re-export SecureLogPathResult type
export type { SecureLogPathResult };

// ============================================================================
// Validation Pipeline
// ============================================================================

/**
 * Pre-normalization validators
 * Must run before Unicode normalization
 */
const preNormalizationValidators: Validator[] = [
  validateNotEmpty,
  validateNoWhitespace,
  validateNoNullBytes,
  validateNoControlChars,
  validateNoInvisibleUnicode,
];

/**
 * Post-normalization validators
 * Run after Unicode normalization
 */
const postNormalizationValidators: Validator[] = [
  validateNoControlCharsAfterNormalization,
  validateNoInvisibleUnicodeAfterNormalization,
  validatePathMaxLength,
  validateNoTraversal,
  // Backslash check before double slash to give specific error for '\\'
  validateNoBackslash,
  validateNoDoubleSlash,
  validateTildePattern,
  validateNoWindowsAbsolutePath,
  // Device paths (\\.\, //./) must be checked before UNC for specific error messages
  validateNoWindowsDevicePath,
  validateNoUNCPath,
  validateNoTrailingDot,
  validateNoTrailingDotSlash,
  validateNoWindowsReservedNames,
  validatePrefix,
];

/**
 * Runs validators through pipeline, short-circuiting on first failure
 *
 * @param state - Current validation state
 * @param validators - Array of validators to run
 * @returns Final validation state (invalid if any validator fails)
 */
function runValidators(state: ValidationState, validators: Validator[]): ValidationState {
  for (const validator of validators) {
    if (!state.valid) {
      break; // Short-circuit on first failure
    }
    state = validator(state);
  }
  return state;
}

/**
 * Validate a path argument for security
 *
 * This function performs comprehensive security checks on file paths:
 * - Rejects path traversal patterns (.., //)
 * - Rejects ~user patterns (only ~/ is allowed)
 * - Rejects Windows special paths (UNC, device paths)
 * - Rejects null bytes and control characters
 * - Enforces PATH_MAX length limit
 * - Normalizes Unicode (NFC)
 *
 * @param path - The path string to validate
 * @returns SecurePathResult indicating if path is safe
 *
 * @example
 * isSecurePath('/home/user/.ssh/id_rsa')  // { valid: true }
 * isSecurePath('../etc/passwd')           // { valid: false, reason: '...' }
 */
export function isSecurePath(path: string): SecurePathResult {
  // Initialize state
  let state: ValidationState = { valid: true, path };

  // Phase 1: Pre-normalization checks
  state = runValidators(state, preNormalizationValidators);
  if (!state.valid) {
    return { valid: false, reason: state.reason };
  }

  // Phase 2: Unicode normalization
  state = normalizeUnicode(state);

  // Phase 3: Post-normalization checks
  state = runValidators(state, postNormalizationValidators);
  if (!state.valid) {
    return { valid: false, reason: state.reason };
  }

  return { valid: true };
}

/**
 * Check if an argument looks like a file path
 * Used to determine if path validation should be applied
 *
 * This catches both valid and potentially malicious paths for validation.
 * CRITICAL: This function must be conservative - it's better to validate
 * a non-path as a path than to miss a malicious path.
 *
 * @param arg - The argument to check
 * @returns true if the argument looks like a file path
 */
export function isPathArgument(arg: string): boolean {
  if (!arg || arg.length === 0) {
    return false;
  }

  // CRITICAL: Check for leading/trailing whitespace (potential obfuscation)
  // If arg has whitespace, it might be a path with obfuscation
  const trimmedArg = arg.trim();
  if (trimmedArg !== arg) {
    // Has whitespace - could be obfuscated path, so treat as path for validation
    // The validation function will reject it, but we need to catch it here
    return true;
  }

  // Check if it looks like a path (starts with /, ~, ., or contains path separators)
  // We intentionally catch ../ here so it can be validated and rejected
  // CRITICAL: Also check for Windows drive letters (C:, D:, etc.)
  return (
    arg.startsWith('/') ||
    arg.startsWith('~') ||
    arg.startsWith('./') ||
    arg.startsWith('../') ||
    arg === '.' ||
    arg === '..' ||
    // Windows drive letter pattern (C:, D:, etc.)
    /^[a-zA-Z]:/.test(arg) ||
    // Windows UNC path pattern (\\server, //server)
    /^[/\\]{2}/.test(arg)
  );
}

/**
 * Validate a log file path for security
 *
 * This function performs comprehensive security checks on log file paths:
 * - First performs basic path validation via isSecurePath()
 * - Detects and rejects symbolic links in the path (TOCTOU mitigation)
 * - Resolves to real path and validates it's under allowed directory
 *
 * SECURITY: This function mitigates:
 * - Arbitrary file write via workspace settings
 * - Symlink following attacks
 *
 * @param filePath - The log file path to validate
 * @param allowedBaseDir - The allowed base directory (e.g., globalStorageUri)
 * @returns SecureLogPathResult indicating if path is safe and the resolved path
 *
 * @example
 * // Valid: path under allowed directory
 * isSecureLogPath('/home/user/.vscode/globalStorage/ext/logs/security.log', '/home/user/.vscode/globalStorage/ext')
 * // { valid: true, resolvedPath: '/home/user/.vscode/globalStorage/ext/logs/security.log' }
 *
 * // Invalid: path outside allowed directory
 * isSecureLogPath('/etc/passwd', '/home/user/.vscode/globalStorage/ext')
 * // { valid: false, reason: 'Path is not under allowed directory' }
 *
 * // Invalid: symlink detected
 * isSecureLogPath('/home/user/symlink-to-etc/passwd', '/home/user')
 * // { valid: false, reason: 'Path contains symbolic link: /home/user/symlink-to-etc' }
 */
export function isSecureLogPath(filePath: string, allowedBaseDir: string): SecureLogPathResult {
  // Delegate to implementation, passing isSecurePath to avoid circular dependency
  return isSecureLogPathImpl(filePath, allowedBaseDir, isSecurePath);
}
