/**
 * Configuration Schema Validation
 *
 * Provides strict schema-based validation for identity configuration.
 * Uses TypeScript types and runtime validation for defense-in-depth.
 *
 * @see https://json-schema.org/
 */

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
  format?: 'email' | 'uri' | 'date' | 'hex';
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
    maxLength: 64,
    pattern: '^[a-zA-Z0-9_-]+$',
  },
  icon: {
    type: 'string',
    description: 'Display emoji (single emoji character)',
    maxLength: 8, // Composed emoji can be up to 8 bytes
  },
  name: {
    type: 'string',
    description: 'Git user.name',
    required: true,
    minLength: 1,
    maxLength: 256,
    // Disallow control characters and shell metacharacters
    pattern: '^[^\\x00-\\x1f\\x7f`$(){}|;&<>]+$',
  },
  email: {
    type: 'string',
    description: 'Git user.email',
    required: true,
    maxLength: 320, // RFC 5321 max email length
    format: 'email',
  },
  description: {
    type: 'string',
    description: 'Optional description of this identity',
    maxLength: 500,
  },
  sshKeyPath: {
    type: 'string',
    description: 'Path to SSH private key',
    maxLength: 4096, // PATH_MAX on most systems
    // Must be absolute path or start with ~, no dangerous chars
    pattern: '^[~/][^\\x00-\\x1f\\x7f`$(){}|;&<>]*$',
  },
  sshHost: {
    type: 'string',
    description: 'SSH config host alias',
    maxLength: 253, // DNS max length
    // DNS-safe characters only
    pattern: '^[a-zA-Z0-9][a-zA-Z0-9._-]*$',
  },
  gpgKeyId: {
    type: 'string',
    description: 'GPG key ID (hex)',
    minLength: 8,
    maxLength: 40, // SHA-1 fingerprint length
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
 * Simple email format validation
 */
function isValidEmail(email: string): boolean {
  // Simplified email regex - catches most invalid emails
  // while allowing legitimate international characters
  const emailRegex = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  return emailRegex.test(email);
}

/**
 * Hex format validation
 */
function isValidHex(value: string): boolean {
  return /^[A-Fa-f0-9]+$/.test(value);
}

/**
 * Validate a value against a property schema
 */
function validateProperty(
  field: string,
  value: unknown,
  schema: PropertySchema,
  errors: SchemaError[]
): void {
  // Type check
  if (value !== undefined && value !== null) {
    if (typeof value !== schema.type) {
      errors.push({
        field,
        message: `Expected ${schema.type}, got ${typeof value}`,
        value,
      });
      return;
    }

    // String-specific validations
    if (schema.type === 'string' && typeof value === 'string') {
      // Length checks
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

      // Pattern check
      if (schema.pattern) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value)) {
          errors.push({
            field,
            message: `Does not match required pattern`,
            value,
          });
        }
      }

      // Format checks
      if (schema.format === 'email' && !isValidEmail(value)) {
        errors.push({
          field,
          message: 'Invalid email format',
          value,
        });
      }

      if (schema.format === 'hex' && !isValidHex(value)) {
        errors.push({
          field,
          message: 'Must be hexadecimal',
          value,
        });
      }
    }

    // Number-specific validations
    if (schema.type === 'number' && typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({
          field,
          message: `Must be at least ${schema.minimum}`,
          value,
        });
      }

      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({
          field,
          message: `Must be at most ${schema.maximum}`,
          value,
        });
      }
    }
  } else if (schema.required) {
    errors.push({
      field,
      message: 'Required field is missing',
    });
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

  const obj = identity as Record<string, unknown>;

  // Check for unknown fields
  const knownFields = Object.keys(IDENTITY_SCHEMA);
  for (const field of Object.keys(obj)) {
    if (!knownFields.includes(field)) {
      errors.push({
        field,
        message: 'Unknown field',
        value: obj[field],
      });
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
    lines.push(`  ${field}${required}: ${schema.type}`);
    lines.push(`    ${schema.description}`);

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
