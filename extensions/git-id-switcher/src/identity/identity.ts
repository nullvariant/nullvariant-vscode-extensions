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
import { MAX_IDENTITIES, MAX_ID_LENGTH } from '../core/constants';
import { isValidIdentityId } from '../validators/common';

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
