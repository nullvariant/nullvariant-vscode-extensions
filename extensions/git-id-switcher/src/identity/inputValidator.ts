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
import { EMAIL_REGEX, hasPathTraversal } from '../validators/common';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Dangerous character patterns that could indicate injection attempts
 *
 * Even though we use execFile(), defense-in-depth requires input validation.
 * These patterns catch obvious attack attempts early.
 */
const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  // Note: execFile() doesn't invoke shell, so most metacharacters are safe.
  // We still block the most dangerous ones as defense-in-depth.
  // Semicolon (;) is intentionally allowed - valid in names like "Null;Variant"
  { pattern: /[`$(){}|&<>]/, description: 'shell metacharacters' },
  { pattern: /[\n\r]/, description: 'newline characters' },
  { pattern: /\\x[0-9a-f]{2}/i, description: 'hex escape sequences' },
  { pattern: /\0/, description: 'null bytes' },
];

/**
 * GPG Key ID pattern (8-40 hex characters)
 */
const GPG_KEY_REGEX = /^[A-Fa-f0-9]{8,40}$/;

/**
 * SSH host alias pattern (DNS-safe characters)
 */
const SSH_HOST_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

/**
 * Validate a string field for dangerous patterns
 */
function validateField(
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

  if (!EMAIL_REGEX.test(email)) {
    errors.push('email: invalid email format');
  }

  // Additional length check (RFC 5321)
  if (email.length > 320) {
    errors.push('email: exceeds maximum length (320 characters)');
  }
}

/**
 * Validate SSH key path
 *
 * - Must be absolute or start with ~
 * - No path traversal (..)
 * - No dangerous characters
 */
function validateSshKeyPath(
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
  validateField(sshKeyPath, 'sshKeyPath', errors);
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
  if (sshHost.length > 253) {
    errors.push('sshHost: exceeds maximum length (253 characters)');
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
  if (identity.id && !/^[a-zA-Z0-9_-]{1,64}$/.test(identity.id)) {
    errors.push('id: must be 1-64 alphanumeric characters, underscores, or hyphens');
  }

  // Text field validation (dangerous patterns)
  validateField(identity.name, 'name', errors);
  validateField(identity.email, 'email', errors);
  validateField(identity.service, 'service', errors);
  validateField(identity.description, 'description', errors);
  validateField(identity.icon, 'icon', errors);

  // Format-specific validation
  validateEmail(identity.email, errors);
  validateSshKeyPath(identity.sshKeyPath, errors);
  validateGpgKeyId(identity.gpgKeyId, errors);
  validateSshHost(identity.sshHost, errors);

  // Length limits
  if (identity.name && identity.name.length > 256) {
    errors.push('name: exceeds maximum length (256 characters)');
  }
  if (identity.service && identity.service.length > 64) {
    errors.push('service: exceeds maximum length (64 characters)');
  }
  if (identity.description && identity.description.length > 500) {
    errors.push('description: exceeds maximum length (500 characters)');
  }
  if (identity.icon && identity.icon.length > 8) {
    // Emoji can be 1-4 bytes, allowing up to 8 for composed emoji
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
 * Check if a path is safe (no injection risk)
 *
 * Used for SSH key paths and other file system operations.
 *
 * @param path - The path to check
 * @returns true if the path appears safe
 */
export function isPathSafe(path: string): boolean {
  // No path traversal
  if (hasPathTraversal(path)) {
    return false;
  }

  // No shell metacharacters
  for (const { pattern } of DANGEROUS_PATTERNS) {
    if (pattern.test(path)) {
      return false;
    }
  }

  return true;
}
