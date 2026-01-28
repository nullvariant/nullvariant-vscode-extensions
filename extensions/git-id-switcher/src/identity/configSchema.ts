/**
 * Configuration Schema Validation
 *
 * Provides strict schema-based validation for identity configuration.
 * Uses TypeScript types and runtime validation for defense-in-depth.
 *
 * @see https://json-schema.org/
 */

import { isSingleGrapheme } from '../ui/displayLimits';
import { isValidEmail, isValidHex, SSH_HOST_PATTERN } from '../validators/common';
import {
  PATH_MAX,
  MAX_ID_LENGTH,
  MAX_NAME_LENGTH,
  MAX_SERVICE_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_SSH_HOST_LENGTH,
  MAX_ICON_BYTE_LENGTH,
  MIN_GPG_KEY_LENGTH,
  MAX_GPG_KEY_LENGTH,
} from '../core/constants';

/**
 * Property schema definition
 */
interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: 'email' | 'uri' | 'date' | 'hex' | 'single-grapheme';
  minimum?: number;
  maximum?: number;
}

/**
 * Identity schema definition
 *
 * Based on JSON Schema specification with security-focused constraints.
 */
export const IDENTITY_SCHEMA: Record<string, PropertySchema> = {
  id: {
    type: 'string',
    description: 'Unique identifier (alphanumeric, underscores, hyphens)',
    required: true,
    minLength: 1,
    maxLength: MAX_ID_LENGTH,
    pattern: '^[a-zA-Z0-9_-]+$',
  },
  icon: {
    type: 'string',
    description: 'Display emoji (single emoji character)',
    maxLength: MAX_ICON_BYTE_LENGTH, // Allow for complex composed emoji (byte length)
    format: 'single-grapheme', // Validate as single visible character
  },
  name: {
    type: 'string',
    description: 'Git user.name (pure name without service info)',
    required: true,
    minLength: 1,
    maxLength: MAX_NAME_LENGTH,
    // Disallow control characters and shell metacharacters
    // Note: Semicolon (;) is intentionally ALLOWED - valid in names like "Null;Variant"
    pattern: '^[^\\x00-\\x1f\\x7f`$(){}|&<>]+$',
  },
  service: {
    type: 'string',
    description: 'Git hosting service (e.g., GitHub, GitLab, Bitbucket)',
    maxLength: MAX_SERVICE_LENGTH,
    // Allow Unicode (for i18n) but block control characters and command substitution
    // Only block backtick (`) and dollar sign ($) for command injection prevention
    // Allow ampersand (&) for company names like "AT&T"
    pattern: '^[^\\x00-\\x1f\\x7f`$]+$',
  },
  email: {
    type: 'string',
    description: 'Git user.email',
    required: true,
    maxLength: MAX_EMAIL_LENGTH, // RFC 5321 max email length
    format: 'email',
  },
  description: {
    type: 'string',
    description: 'Optional description of this identity',
    maxLength: MAX_DESCRIPTION_LENGTH,
    // Allow Unicode (for i18n) but block control characters and command substitution
    // Only block backtick (`) and dollar sign ($) for command injection prevention
    // Allow angle brackets (<>) for display formatting like "<main>"
    pattern: '^[^\\x00-\\x1f\\x7f`$]+$',
  },
  sshKeyPath: {
    type: 'string',
    description: 'Path to SSH private key',
    maxLength: PATH_MAX, // PATH_MAX on most systems
    // Must be absolute path (Unix: /, ~) or Windows drive letter (C:), no dangerous chars
    // Backslash (\) is allowed for Windows paths
    pattern: '^([~/]|[A-Za-z]:)[^\\x00-\\x1f\\x7f`$(){}|;&<>]*$',
  },
  sshHost: {
    type: 'string',
    description: 'SSH config host alias',
    maxLength: MAX_SSH_HOST_LENGTH, // DNS max length
    // DNS-safe characters only
    pattern: SSH_HOST_PATTERN,
  },
  gpgKeyId: {
    type: 'string',
    description: 'GPG key ID (hex)',
    minLength: MIN_GPG_KEY_LENGTH,
    maxLength: MAX_GPG_KEY_LENGTH, // SHA-1 fingerprint length
    format: 'hex',
  },
} as const;

/**
 * Schema validation result
 */
export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaError[];
}

/**
 * Individual schema error
 */
export interface SchemaError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validate string length constraints.
 * @internal
 */
function validateStringLength(
  field: string,
  value: string,
  schema: PropertySchema,
  errors: SchemaError[]
): void {
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push({
      field,
      message: `Must be at least ${schema.minLength} characters`,
      value,
    });
  }
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push({
      field,
      message: `Exceeds maximum length of ${schema.maxLength}`,
      value,
    });
  }
}

/**
 * Validate string pattern constraint.
 * @internal
 */
function validateStringPattern(
  field: string,
  value: string,
  pattern: string,
  errors: SchemaError[]
): void {
  try {
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      errors.push({
        field,
        message: `Does not match required pattern`,
        value,
      });
    }
  /* c8 ignore start: defensive - schema patterns are hardcoded valid */
  } catch {
    // SECURITY: Invalid regex pattern in schema is a programming error
    errors.push({
      field,
      message: 'Invalid validation pattern (internal error)',
      value: undefined,
    });
  }
  /* c8 ignore stop */
}

/**
 * Validate string format constraint.
 * @internal
 */
function validateStringFormat(
  field: string,
  value: string,
  format: PropertySchema['format'],
  errors: SchemaError[]
): void {
  if (format === 'email' && !isValidEmail(value)) {
    errors.push({ field, message: 'Invalid email format', value });
  }
  if (format === 'hex' && !isValidHex(value)) {
    errors.push({ field, message: 'Must be hexadecimal', value });
  }
  if (format === 'single-grapheme' && !isSingleGrapheme(value)) {
    errors.push({ field, message: 'Must be a single visible character (emoji or letter)', value });
  }
}

/**
 * Validate string-specific constraints.
 * @internal
 */
function validateStringValue(
  field: string,
  value: string,
  schema: PropertySchema,
  errors: SchemaError[]
): void {
  validateStringLength(field, value, schema, errors);
  if (schema.pattern) {
    validateStringPattern(field, value, schema.pattern, errors);
  }
  if (schema.format) {
    validateStringFormat(field, value, schema.format, errors);
  }
}

/**
 * Validate number-specific constraints.
 * @internal
 */
/* c8 ignore start: no number fields in current schema - reserved for future */
function validateNumberValue(
  field: string,
  value: number,
  schema: PropertySchema,
  errors: SchemaError[]
): void {
  if (schema.minimum !== undefined && value < schema.minimum) {
    errors.push({ field, message: `Must be at least ${schema.minimum}`, value });
  }
  if (schema.maximum !== undefined && value > schema.maximum) {
    errors.push({ field, message: `Must be at most ${schema.maximum}`, value });
  }
}
/* c8 ignore stop */

/**
 * Validate a value against a property schema
 */
function validateProperty(
  field: string,
  value: unknown,
  schema: PropertySchema,
  errors: SchemaError[]
): void {
  // Empty string is treated as "not set" for optional fields.
  // SECURITY: Required fields (id, name, email) are still protected via else-if below.
  if (value !== undefined && value !== null && value !== '') {
    if (typeof value !== schema.type) {
      errors.push({
        field,
        message: `Expected ${schema.type}, got ${typeof value}`,
        value,
      });
      return;
    }

    if (schema.type === 'string' && typeof value === 'string') {
      validateStringValue(field, value, schema, errors);
    }

    /* c8 ignore start: no number fields in current schema - reserved for future */
    if (schema.type === 'number' && typeof value === 'number') {
      validateNumberValue(field, value, schema, errors);
    }
    /* c8 ignore stop */
  } else if (schema.required) {
    errors.push({ field, message: 'Required field is missing' });
  }
}

/**
 * Validate an identity object against the schema
 *
 * @param identity - The identity object to validate
 * @returns Validation result with errors
 *
 * @example
 * const result = validateIdentitySchema(identity);
 * if (!result.valid) {
 *   result.errors.forEach(e => console.error(`${e.field}: ${e.message}`));
 * }
 */
export function validateIdentitySchema(identity: unknown): SchemaValidationResult {
  const errors: SchemaError[] = [];

  // Must be an object
  if (typeof identity !== 'object' || identity === null || Array.isArray(identity)) {
    return {
      valid: false,
      errors: [{
        field: 'root',
        message: 'Identity must be an object',
        value: identity,
      }],
    };
  }

  // SECURITY: Use Object.keys() to avoid prototype pollution
  // Object.keys() only returns own enumerable properties, not inherited ones
  const obj = identity as Record<string, unknown>;

  // Check for unknown fields
  // SECURITY: Object.keys() prevents prototype chain traversal
  const knownFields = Object.keys(IDENTITY_SCHEMA);
  const objKeys = Object.keys(obj);

  // SECURITY: Limit number of fields to prevent DoS via excessive unknown fields
  const MAX_FIELDS = 100;
  if (objKeys.length > MAX_FIELDS) {
    errors.push({
      field: 'root',
      message: `Object has too many fields (max ${MAX_FIELDS})`,
      value: undefined,
    });
    // Continue validation but skip unknown field check for performance
  } else {
    for (const field of objKeys) {
      if (!knownFields.includes(field)) {
        errors.push({
          field,
          message: 'Unknown field',
          value: obj[field],
        });
      }
    }
  }

  // Validate each known field
  for (const [field, schema] of Object.entries(IDENTITY_SCHEMA)) {
    validateProperty(field, obj[field], schema, errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an array of identities
 */
export function validateIdentitiesSchema(
  identities: unknown
): SchemaValidationResult {
  const errors: SchemaError[] = [];

  if (!Array.isArray(identities)) {
    return {
      valid: false,
      errors: [{
        field: 'identities',
        message: 'Must be an array',
        value: identities,
      }],
    };
  }

  // Check for duplicate IDs
  const ids = new Set<string>();
  identities.forEach((identity, index) => {
    if (typeof identity === 'object' && identity !== null) {
      const id = (identity as Record<string, unknown>).id;
      if (typeof id === 'string') {
        if (ids.has(id)) {
          errors.push({
            field: `identities[${index}].id`,
            message: `Duplicate ID: ${id}`,
            value: id,
          });
        }
        ids.add(id);
      }
    }
  });

  // Validate each identity
  identities.forEach((identity, index) => {
    const result = validateIdentitySchema(identity);
    result.errors.forEach(error => {
      errors.push({
        field: `identities[${index}].${error.field}`,
        message: error.message,
        value: error.value,
      });
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get the schema for documentation purposes
 */
export function getSchemaDocumentation(): string {
  const lines: string[] = ['Identity Schema:'];

  for (const [field, schema] of Object.entries(IDENTITY_SCHEMA)) {
    const required = schema.required ? ' (required)' : '';
    lines.push(
      `  ${field}${required}: ${schema.type}`,
      `    ${schema.description}`
    );

    if (schema.maxLength) {
      lines.push(`    Max length: ${schema.maxLength}`);
    }
    if (schema.pattern) {
      lines.push(`    Pattern: ${schema.pattern}`);
    }
    if (schema.format) {
      lines.push(`    Format: ${schema.format}`);
    }
  }

  return lines.join('\n');
}
