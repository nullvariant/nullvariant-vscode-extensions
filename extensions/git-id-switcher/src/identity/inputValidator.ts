/**
 * Input Validation for Identity Settings
 *
 * Validates user-provided configuration values before use.
 * Rejects potentially dangerous patterns to prevent injection attacks.
 *
 * @see https://owasp.org/www-community/attacks/Command_Injection
 * @see https://cwe.mitre.org/data/definitions/78.html
 */

import { Identity } from './identity';
import {
  isValidEmail,
  hasPathTraversal,
  isValidIdentityId,
  GPG_KEY_REGEX,
  SSH_HOST_REGEX,
  DANGEROUS_PATTERNS,
} from '../validators/common';
import {
  MAX_ID_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_SSH_HOST_LENGTH,
  MAX_NAME_LENGTH,
  MAX_SERVICE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_ICON_BYTE_LENGTH,
} from '../core/constants';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a string field for dangerous command injection patterns.
 *
 * @remarks
 * **Naming convention**: Named with `validate` prefix and explicit purpose
 * (`ForDangerousPatterns`) because this function checks for security-critical
 * patterns like command injection, not format validity.
 *
 * @param value - The field value to validate
 * @param fieldName - The name of the field (for error messages)
 * @param errors - Array to accumulate validation errors
 */
function validateFieldForDangerousPatterns(
  value: string | undefined,
  fieldName: string,
  errors: string[]
): void {
  if (!value) {
    return;
  }

  for (const { pattern, description } of DANGEROUS_PATTERNS) {
    if (pattern.test(value)) {
      errors.push(`${fieldName} contains ${description}`);
      break;
    }
  }
}

/**
 * Validate an email address
 */
function validateEmail(email: string | undefined, errors: string[]): void {
  if (!email) {
    return;
  }

  if (!isValidEmail(email)) {
    errors.push('email: invalid email format');
  }

  // Additional length check (RFC 5321)
  // Note: isValidEmail already checks for 254 chars, but identity config allows 320
  if (email.length > MAX_EMAIL_LENGTH) {
    errors.push(`email: exceeds maximum length (${MAX_EMAIL_LENGTH} characters)`);
  }
}

/**
 * Validate SSH key path format.
 *
 * This validates only the format/structure of the path:
 * - Must be absolute or start with ~
 * - No path traversal (..)
 * - No dangerous characters
 *
 * @remarks
 * **Naming convention**: Named with `Format` suffix to distinguish from
 * `validateSshKeyPath` in pathUtils.ts which performs full path normalization
 * and symlink resolution. This function only validates format.
 *
 * **Terminology**:
 * - `valid`: Format/structure is correct (this function)
 * - `secure`: Resistant to security attacks (pathUtils.validateSshKeyPath)
 */
function validateSshKeyPathFormat(
  sshKeyPath: string | undefined,
  errors: string[]
): void {
  if (!sshKeyPath) {
    return;
  }

  // Must start with / or ~
  if (!sshKeyPath.startsWith('/') && !sshKeyPath.startsWith('~')) {
    errors.push('sshKeyPath: must be an absolute path or start with ~');
  }

  // No path traversal
  if (hasPathTraversal(sshKeyPath)) {
    errors.push('sshKeyPath: path traversal (..) is not allowed');
  }

  // No dangerous characters in path
  validateFieldForDangerousPatterns(sshKeyPath, 'sshKeyPath', errors);
}

/**
 * Validate GPG key ID
 */
function validateGpgKeyId(gpgKeyId: string | undefined, errors: string[]): void {
  if (!gpgKeyId) {
    return;
  }

  if (!GPG_KEY_REGEX.test(gpgKeyId)) {
    errors.push('gpgKeyId: must be 8-40 hexadecimal characters');
  }
}

/**
 * Validate SSH host alias
 */
function validateSshHost(sshHost: string | undefined, errors: string[]): void {
  if (!sshHost) {
    return;
  }

  if (!SSH_HOST_REGEX.test(sshHost)) {
    errors.push('sshHost: must contain only alphanumeric characters, dots, underscores, and hyphens');
  }

  // DNS maximum label length
  if (sshHost.length > MAX_SSH_HOST_LENGTH) {
    errors.push(`sshHost: exceeds maximum length (${MAX_SSH_HOST_LENGTH} characters)`);
  }
}

/**
 * Validate a complete Identity object
 *
 * Checks all fields for:
 * - Required fields present
 * - No dangerous character patterns
 * - Valid format for specific field types
 *
 * @param identity - The identity to validate
 * @returns ValidationResult with valid flag and list of errors
 *
 * @example
 * const result = validateIdentity(identity);
 * if (!result.valid) {
 *   console.error('Invalid identity:', result.errors);
 *   return;
 * }
 */
export function validateIdentity(identity: Identity): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!identity.id) {
    errors.push('id is required');
  }
  if (!identity.name) {
    errors.push('name is required');
  }
  if (!identity.email) {
    errors.push('email is required');
  }

  // ID validation (alphanumeric, underscores, hyphens only)
  if (identity.id && !isValidIdentityId(identity.id, MAX_ID_LENGTH)) {
    errors.push(`id: must be 1-${MAX_ID_LENGTH} alphanumeric characters, underscores, or hyphens`);
  }

  // Text field validation (dangerous patterns)
  validateFieldForDangerousPatterns(identity.name, 'name', errors);
  validateFieldForDangerousPatterns(identity.email, 'email', errors);
  validateFieldForDangerousPatterns(identity.service, 'service', errors);
  validateFieldForDangerousPatterns(identity.description, 'description', errors);
  validateFieldForDangerousPatterns(identity.icon, 'icon', errors);

  // Format-specific validation
  validateEmail(identity.email, errors);
  validateSshKeyPathFormat(identity.sshKeyPath, errors);
  validateGpgKeyId(identity.gpgKeyId, errors);
  validateSshHost(identity.sshHost, errors);

  // Length limits
  if (identity.name && identity.name.length > MAX_NAME_LENGTH) {
    errors.push(`name: exceeds maximum length (${MAX_NAME_LENGTH} characters)`);
  }
  if (identity.service && identity.service.length > MAX_SERVICE_LENGTH) {
    errors.push(`service: exceeds maximum length (${MAX_SERVICE_LENGTH} characters)`);
  }
  if (identity.description && identity.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`description: exceeds maximum length (${MAX_DESCRIPTION_LENGTH} characters)`);
  }
  if (identity.icon && identity.icon.length > MAX_ICON_BYTE_LENGTH) {
    // MAX_ICON_BYTE_LENGTH allows for complex composed emoji (e.g., family emoji with ZWJ sequences)
    errors.push('icon: exceeds maximum length');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an array of identities
 *
 * @param identities - Array of identities to validate
 * @returns ValidationResult with combined errors
 */
export function validateIdentities(identities: Identity[]): ValidationResult {
  const errors: string[] = [];

  // Check for duplicate IDs
  const ids = identities.map(i => i.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push('Duplicate identity IDs found');
  }

  // Validate each identity
  identities.forEach((identity, index) => {
    const result = validateIdentity(identity);
    if (!result.valid) {
      result.errors.forEach(error => {
        errors.push(`identities[${index}] (${identity.id || 'unknown'}): ${error}`);
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a path is safe for shell execution (no injection risk).
 *
 * Used for SSH key paths and other file system operations where the path
 * may be passed to shell commands.
 *
 * @remarks
 * **Naming convention**: Named with `is` prefix (boolean predicate) and
 * `ShellSafe` to indicate this specifically checks for shell injection safety,
 * not comprehensive path security.
 *
 * **Terminology**:
 * - `safe`: Safe for a specific context (shell execution in this case)
 * - `secure`: Resistant to security attacks (use `validatePathSecurity` instead)
 *
 * @deprecated Use `validatePathSecurity` from security/pathValidator instead
 * for comprehensive security checks. This function is kept for backwards
 * compatibility and maintains the original behavior of checking for path
 * traversal and shell metacharacters only.
 *
 * @param path - The path to check
 * @returns true if the path appears safe for shell execution
 */
export function isShellSafePath(path: string): boolean {
  // Original check: path traversal detection (simple check for "..")
  // This is stricter than isSecurePath's traversal detection
  if (hasPathTraversal(path)) {
    return false;
  }

  // Original check: shell metacharacters
  for (const { pattern } of DANGEROUS_PATTERNS) {
    if (pattern.test(path)) {
      return false;
    }
  }

  return true;
}

/**
 * @deprecated Use `isShellSafePath` instead. This alias will be removed in a future version.
 */
export const isPathSafe = isShellSafePath;
