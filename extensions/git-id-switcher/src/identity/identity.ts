/**
 * Git Identity Type Definitions
 *
 * Identities are loaded from VS Code settings, not hardcoded.
 * Each identity represents a Git persona with optional SSH/GPG keys.
 *
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 */

import { getVSCode } from '../core/vscodeLoader';
import { validateIdentitySchema } from './configSchema';
import { securityLogger } from '../security/securityLogger';
import {
  MAX_IDENTITIES,
  MAX_ID_LENGTH,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_SERVICE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_SSH_HOST_LENGTH,
  MAX_GPG_KEY_LENGTH,
} from '../core/constants';
import {
  isValidIdentityId,
  isValidEmail,
  isValidSshHost,
  isValidGpgKeyId,
  hasPathTraversal,
  hasDangerousChars,
} from '../validators/common';

/**
 * Session-level flag to prevent multiple validation error notifications.
 * Reset when extension is reloaded.
 */
let hasShownValidationError = false;

/**
 * Show one-time validation error notification to user.
 *
 * Extracted from getIdentitiesWithValidation() to reduce cognitive complexity.
 * Sets flag immediately to prevent concurrent notifications from race conditions.
 *
 * @param invalidCount - Number of invalid identity configurations
 */
function showValidationErrorNotification(invalidCount: number): void {
  const vs = getVSCode();
  if (!vs || hasShownValidationError) {
    return;
  }

  // Set flag immediately to prevent concurrent notifications
  hasShownValidationError = true;

  const message = invalidCount === 1
    ? vs.l10n.t(
        'Git ID Switcher: 1 identity configuration is invalid and was skipped. Check the settings.'
      )
    : vs.l10n.t(
        'Git ID Switcher: {0} identity configurations are invalid and were skipped. Check the settings.',
        invalidCount
      );

  // Fire and forget: notification is non-blocking
  // Note: VS Code's Thenable doesn't have .catch(), so we use .then(onFulfilled, onRejected)
  vs.window.showWarningMessage(message, vs.l10n.t('Open Settings'))
    .then(
      action => {
        if (action) {
          vs.commands.executeCommand(
            'workbench.action.openSettings',
            'gitIdSwitcher.identities'
          );
        }
      },
      () => {
        // SECURITY: Don't let notification errors affect validation flow
      }
    );
}

export interface Identity {
  /** Unique identifier (lowercase, no spaces) */
  id: string;

  /** Display icon (emoji) - optional */
  icon?: string;

  /** Git user.name (pure name without service info) */
  name: string;

  /** Git hosting service (e.g., "GitHub", "GitLab", "Bitbucket") - optional */
  service?: string;

  /** Git user.email */
  email: string;

  /** Short description of this identity - optional */
  description?: string;

  /** Path to SSH private key - optional */
  sshKeyPath?: string;

  /** SSH config host alias (for multi-account setups) - optional */
  sshHost?: string;

  /** GPG key ID for commit signing - optional */
  gpgKeyId?: string;
}

/**
 * Metadata for identity fields used in edit UI
 *
 * Defines how each field should be displayed and validated in the identity
 * management interface. Validators reuse functions from validators/common.ts
 * to maintain consistency with configSchema validation (ARCHITECTURE.md compliance).
 */
export interface FieldMetadata {
  /** Field key from Identity interface */
  key: keyof Identity;

  /** i18n key for field label (must exist in all locale files) */
  labelKey: string;

  /** Whether the field is required */
  required: boolean;

  /** Whether the field can be edited (ID is false after creation) */
  editable: boolean;

  /** Input type hint for UI */
  inputType: 'text' | 'file' | 'email';

  /** VSCode Codicon name for UI display (e.g., 'lock', 'person', 'mail') */
  icon: string;

  /** Maximum length for this field (if applicable) */
  maxLength?: number;

  /**
   * Validator function for this field
   *
   * @param value - The value to validate
   * @returns Error message if invalid, undefined if valid
   */
  validator?: (value: string) => string | undefined;
}

/**
 * Fields that can be edited in the identity management UI
 *
 * Includes core fields (id, name, email) and optional fields
 * (service, icon, description, sshKeyPath, sshHost, gpgKeyId).
 */
export const EDITABLE_FIELDS: ReadonlyArray<keyof Identity> = [
  'id',
  'name',
  'email',
  'service',
  'icon',
  'description',
  'sshKeyPath',
  'sshHost',
  'gpgKeyId',
];

/**
 * Validate SSH key path format
 *
 * Reuses validators from validators/common.ts:
 * - Must be absolute path or start with ~
 * - No path traversal (..)
 * - No dangerous shell characters
 *
 * @param value - The SSH key path to validate
 * @returns Error message if invalid, undefined if valid
 */
function validateSshKeyPathForField(value: string): string | undefined {
  // Must start with / or ~
  if (!value.startsWith('/') && !value.startsWith('~')) {
    return 'sshKeyPath must be an absolute path or start with ~';
  }

  // No path traversal
  if (hasPathTraversal(value)) {
    return 'sshKeyPath: path traversal (..) is not allowed';
  }

  // No dangerous characters
  if (hasDangerousChars(value)) {
    return 'sshKeyPath contains dangerous characters';
  }

  return undefined;
}

/**
 * Field metadata for identity edit UI
 *
 * Defines validation rules and UI hints for each editable field.
 * Validators delegate to validators/common.ts functions for consistency.
 */
export const FIELD_METADATA: ReadonlyArray<FieldMetadata> = [
  {
    key: 'id',
    labelKey: 'ID',
    required: true,
    editable: true, // Editable during creation, but changing ID requires special handling
    inputType: 'text',
    icon: 'lock',
    maxLength: MAX_ID_LENGTH,
    validator: (value: string) =>
      isValidIdentityId(value, MAX_ID_LENGTH)
        ? undefined
        : `ID must be 1-${MAX_ID_LENGTH} alphanumeric characters, underscores, or hyphens`,
  },
  {
    key: 'name',
    labelKey: 'Name',
    required: true,
    editable: true,
    inputType: 'text',
    icon: 'person',
    maxLength: MAX_NAME_LENGTH,
    validator: (value: string) =>
      hasDangerousChars(value) ? 'Name contains invalid characters' : undefined,
  },
  {
    key: 'email',
    labelKey: 'Email',
    required: true,
    editable: true,
    inputType: 'email',
    icon: 'mail',
    maxLength: MAX_EMAIL_LENGTH,
    validator: (value: string) =>
      isValidEmail(value) ? undefined : 'Invalid email format',
  },
  {
    key: 'service',
    labelKey: 'Service',
    required: false,
    editable: true,
    inputType: 'text',
    icon: 'server',
    maxLength: MAX_SERVICE_LENGTH,
    validator: (value: string) =>
      hasDangerousChars(value) ? 'Service contains invalid characters' : undefined,
  },
  {
    key: 'icon',
    labelKey: 'Icon',
    required: false,
    editable: true,
    inputType: 'text',
    icon: 'symbol-color',
    // Icon validation is complex (grapheme clusters), handled by configSchema
  },
  {
    key: 'description',
    labelKey: 'Description',
    required: false,
    editable: true,
    inputType: 'text',
    icon: 'note',
    maxLength: MAX_DESCRIPTION_LENGTH,
    validator: (value: string) =>
      hasDangerousChars(value)
        ? 'Description contains invalid characters'
        : undefined,
  },
  {
    key: 'sshKeyPath',
    labelKey: 'SSH Key Path',
    required: false,
    editable: true,
    inputType: 'file',
    icon: 'key',
    validator: validateSshKeyPathForField,
  },
  {
    key: 'sshHost',
    labelKey: 'SSH Host',
    required: false,
    editable: true,
    inputType: 'text',
    icon: 'globe',
    maxLength: MAX_SSH_HOST_LENGTH,
    validator: (value: string) =>
      isValidSshHost(value)
        ? undefined
        : 'SSH host must contain only alphanumeric characters, dots, underscores, and hyphens',
  },
  {
    key: 'gpgKeyId',
    labelKey: 'GPG Key ID',
    required: false,
    editable: true,
    inputType: 'text',
    icon: 'key',
    maxLength: MAX_GPG_KEY_LENGTH,
    validator: (value: string) =>
      isValidGpgKeyId(value) ? undefined : 'GPG key ID must be 8-40 hexadecimal characters',
  },
];

/**
 * Get field metadata by key
 *
 * @param key - The field key to look up
 * @returns FieldMetadata for the key, or undefined if not found
 */
export function getFieldMetadata(key: keyof Identity): FieldMetadata | undefined {
  return FIELD_METADATA.find(f => f.key === key);
}

/**
 * Load identities from VS Code settings (raw, no validation)
 *
 * WARNING: This function does not validate identities.
 * Use getIdentitiesWithValidation() for security-critical code paths.
 */
export function getIdentities(): Identity[] {
  const vs = getVSCode();
  if (!vs) {
    return [];
  }
  const config = vs.workspace.getConfiguration('gitIdSwitcher');
  const identities = config.get<Identity[]>('identities', []);
  return identities;
}

/**
 * Load identities with early validation
 *
 * Performs schema validation on load and filters out invalid identities.
 * Logs validation errors and shows a one-time user notification per session.
 *
 * @returns Array of valid identities (invalid ones are filtered out)
 */
export function getIdentitiesWithValidation(): Identity[] {
  const vs = getVSCode();
  if (!vs) {
    return [];
  }

  const config = vs.workspace.getConfiguration('gitIdSwitcher');
  const rawIdentities = config.get<unknown[]>('identities', []);

  // Type check: must be an array
  if (!Array.isArray(rawIdentities)) {
    // Log type error but don't show notification (configuration might be in transition)
    securityLogger.logValidationFailure(
      'identities',
      'Configuration must be an array',
      typeof rawIdentities
    );
    return [];
  }

  // Early return for empty array (valid state)
  if (rawIdentities.length === 0) {
    return [];
  }

  // SECURITY: Limit array size to prevent DoS attacks via excessive validation
  // VS Code settings should enforce this, but defense-in-depth requires explicit check
  if (rawIdentities.length > MAX_IDENTITIES) {
    securityLogger.logValidationFailure(
      'identities',
      `Array length exceeds maximum (${MAX_IDENTITIES})`,
      rawIdentities.length
    );
    // Return empty array to fail securely
    return [];
  }

  // Filter and validate individual identities
  const validIdentities: Identity[] = [];
  const invalidIndices: number[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < rawIdentities.length; i++) {
    const identity = rawIdentities[i];
    const result = validateIdentitySchema(identity);

    if (!result.valid) {
      invalidIndices.push(i);
      // Log validation failures
      for (const error of result.errors) {
        securityLogger.logValidationFailure(
          `identities[${i}].${error.field}`,
          error.message,
          error.value
        );
      }
      continue;
    }

    // Type assertion is safe here because validateIdentitySchema() ensures
    // the object matches the Identity schema structure
    const validatedIdentity = identity as Identity;

    // Check for duplicate IDs (defense-in-depth: schema validation also checks this)
    const id = validatedIdentity.id;
    if (seenIds.has(id)) {
      invalidIndices.push(i);
      securityLogger.logValidationFailure(
        `identities[${i}].id`,
        `Duplicate ID: ${id}`,
        id
      );
      continue;
    }

    seenIds.add(id);
    validIdentities.push(validatedIdentity);
  }

  // Show one-time notification if there are invalid identities
  if (invalidIndices.length > 0) {
    showValidationErrorNotification(invalidIndices.length);
  }

  return validIdentities;
}

/**
 * Reset the validation error notification flag
 *
 * Used when configuration changes to allow re-notification of validation errors.
 * Also exposed for testing purposes.
 */
export function resetValidationNotificationFlag(): void {
  hasShownValidationError = false;
}

/**
 * Get identity by ID (with validation)
 */
export function getIdentityById(id: string): Identity | undefined {
  return getIdentitiesWithValidation().find(i => i.id === id);
}

/**
 * Get the default identity (first one, or specified in settings)
 * Uses validated identities to ensure only valid identities are returned.
 */
export function getDefaultIdentity(): Identity | undefined {
  const vs = getVSCode();
  if (!vs) {
    return undefined;
  }

  const config = vs.workspace.getConfiguration('gitIdSwitcher');
  const defaultId = config.get<string>('defaultIdentity', '');

  const identities = getIdentitiesWithValidation();
  if (identities.length === 0) {
    return undefined;
  }

  if (defaultId) {
    const found = identities.find(i => i.id === defaultId);
    if (found) {
      return found;
    }
  }

  return identities[0];
}

/**
 * Get identity display label for UI
 * If service is specified, formats as "Name - Service"
 */
export function getIdentityLabel(identity: Identity): string {
  const displayName = identity.service
    ? `${identity.name} - ${identity.service}`
    : identity.name;

  if (identity.icon) {
    return `${identity.icon} ${displayName}`;
  }
  return displayName;
}

/**
 * Get identity display detail for quick pick
 * Shows description if available, otherwise email
 */
export function getIdentityDetail(identity: Identity): string {
  if (identity.description) {
    return `${identity.description} (${identity.email})`;
  }
  return identity.email;
}

/**
 * Format identity as Git author string
 */
export function formatGitAuthor(identity: Identity): string {
  if (identity.icon) {
    return `${identity.icon} ${identity.name} <${identity.email}>`;
  }
  return `${identity.name} <${identity.email}>`;
}

/**
 * Delete an identity from VS Code configuration.
 *
 * @param id - The identity ID to delete (must pass isValidIdentityId validation)
 * @returns Promise that resolves when deletion is complete
 * @throws Error if identity ID format is invalid
 * @throws Error if identity with given ID is not found
 * @throws Error if configuration update fails
 * @throws Error if VS Code API is not available
 *
 * @example
 * await deleteIdentityFromConfig('work-github');
 */
export async function deleteIdentityFromConfig(id: string): Promise<void> {
  const vs = getVSCode();
  if (!vs) {
    throw new Error('VS Code API not available');
  }

  // Validate ID format
  if (!isValidIdentityId(id, MAX_ID_LENGTH)) {
    throw new Error(`Invalid identity ID format: ${id}`);
  }

  const config = vs.workspace.getConfiguration('gitIdSwitcher');
  const identities = config.get<Identity[]>('identities', []);

  // Find the identity to delete
  const index = identities.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Identity not found: ${id}`);
  }

  // Remove the identity from array
  const updatedIdentities = identities.filter(i => i.id !== id);

  // Update configuration
  await config.update('identities', updatedIdentities, vs.ConfigurationTarget.Global);

  // Log security event
  securityLogger.logConfigChange('identities');
}

/**
 * Add a new identity to VS Code configuration.
 *
 * @param identity - The identity to add (must pass schema validation)
 * @returns Promise that resolves when addition is complete
 * @throws Error if identity fails schema validation
 * @throws Error if identity with same ID already exists (duplicate check)
 * @throws Error if maximum identity limit is reached
 * @throws Error if configuration update fails
 * @throws Error if VS Code API is not available
 *
 * @example
 * await addIdentityToConfig({
 *   id: 'new-identity',
 *   name: 'New User',
 *   email: 'new@example.com'
 * });
 */
export async function addIdentityToConfig(identity: Identity): Promise<void> {
  const vs = getVSCode();
  if (!vs) {
    throw new Error('VS Code API not available');
  }

  // Validate schema
  const validationResult = validateIdentitySchema(identity);
  if (!validationResult.valid) {
    const errorMessages = validationResult.errors
      .map(e => `${e.field}: ${e.message}`)
      .join(', ');
    throw new Error(`Invalid identity schema: ${errorMessages}`);
  }

  const config = vs.workspace.getConfiguration('gitIdSwitcher');
  const identities = config.get<Identity[]>('identities', []);

  // Check for duplicate ID
  const duplicateExists = identities.some(i => i.id === identity.id);
  if (duplicateExists) {
    throw new Error(`Identity with ID already exists: ${identity.id}`);
  }

  // Check maximum limit
  if (identities.length >= MAX_IDENTITIES) {
    throw new Error(`Maximum identity limit reached: ${MAX_IDENTITIES}`);
  }

  // Add the new identity
  const updatedIdentities = [...identities, identity];

  // Update configuration
  await config.update('identities', updatedIdentities, vs.ConfigurationTarget.Global);

  // Log security event
  securityLogger.logConfigChange('identities');
}

/**
 * Update a specific field of an existing identity in VS Code configuration.
 *
 * @param id - The identity ID to update (must exist in configuration)
 * @param field - The field to update (keyof Identity)
 * @param value - The new value for the field (string or undefined to clear optional fields)
 * @returns Promise that resolves when update is complete
 * @throws Error if identity ID format is invalid
 * @throws Error if identity with given ID is not found
 * @throws Error if field validation fails
 * @throws Error if trying to set undefined for required fields (id, name, email)
 * @throws Error if changing ID and new ID format is invalid
 * @throws Error if changing ID and new ID already exists (duplicate check)
 * @throws Error if configuration update fails
 * @throws Error if VS Code API is not available
 *
 * @example
 * // Update name
 * await updateIdentityInConfig('work-github', 'name', 'New Name');
 *
 * // Clear optional field
 * await updateIdentityInConfig('work-github', 'description', undefined);
 */
export async function updateIdentityInConfig(
  id: string,
  field: keyof Identity,
  value: string | undefined
): Promise<void> {
  const vs = getVSCode();
  if (!vs) {
    throw new Error('VS Code API not available');
  }

  // Validate ID format
  if (!isValidIdentityId(id, MAX_ID_LENGTH)) {
    throw new Error(`Invalid identity ID format: ${id}`);
  }

  // Required fields cannot be set to undefined
  const requiredFields: (keyof Identity)[] = ['id', 'name', 'email'];
  if (requiredFields.includes(field) && value === undefined) {
    throw new Error(`Cannot set required field to undefined: ${field}`);
  }

  const config = vs.workspace.getConfiguration('gitIdSwitcher');
  const identities = config.get<Identity[]>('identities', []);

  // If changing ID, validate new ID format and check for duplicates
  if (field === 'id' && value !== undefined && value !== id) {
    if (!isValidIdentityId(value, MAX_ID_LENGTH)) {
      throw new Error(`Invalid new identity ID format: ${value}`);
    }
    const duplicateExists = identities.some(i => i.id === value);
    if (duplicateExists) {
      throw new Error(`Identity with ID already exists: ${value}`);
    }
  }

  // Find the identity to update
  const index = identities.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Identity not found: ${id}`);
  }

  // Create updated identity
  const updatedIdentity = { ...identities[index] };

  if (value === undefined) {
    // Remove optional field
    delete updatedIdentity[field];
  } else {
    // Set field value
    updatedIdentity[field] = value;
  }

  // Validate the updated identity
  const validationResult = validateIdentitySchema(updatedIdentity);
  if (!validationResult.valid) {
    const errorMessages = validationResult.errors
      .map(e => `${e.field}: ${e.message}`)
      .join(', ');
    throw new Error(`Invalid identity after update: ${errorMessages}`);
  }

  // Update the identities array
  const updatedIdentities = [...identities];
  updatedIdentities[index] = updatedIdentity;

  // Update configuration
  await config.update('identities', updatedIdentities, vs.ConfigurationTarget.Global);

  // Log security event
  securityLogger.logConfigChange('identities');
}
