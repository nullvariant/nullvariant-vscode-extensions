/**
 * Git Identity Type Definitions
 *
 * Identities are loaded from VS Code settings, not hardcoded.
 * Each identity represents a Git persona with optional SSH/GPG keys.
 */

import * as vscode from 'vscode';
import { validateIdentitySchema } from './configSchema';
import { securityLogger } from './securityLogger';

/**
 * Session-level flag to prevent multiple validation error notifications.
 * Reset when extension is reloaded.
 */
let hasShownValidationError = false;

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
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
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
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  const rawIdentities = config.get<unknown[]>('identities', []);

  // Early return for empty array
  if (!Array.isArray(rawIdentities) || rawIdentities.length === 0) {
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

    // Check for duplicate IDs
    const id = (identity as Identity).id;
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
    validIdentities.push(identity as Identity);
  }

  // Show one-time notification if there are invalid identities
  if (invalidIndices.length > 0 && !hasShownValidationError) {
    hasShownValidationError = true;

    const message = invalidIndices.length === 1
      ? vscode.l10n.t(
          'Git ID Switcher: 1 identity configuration is invalid and was skipped. Check the settings.'
        )
      : vscode.l10n.t(
          'Git ID Switcher: {0} identity configurations are invalid and were skipped. Check the settings.',
          invalidIndices.length
        );

    vscode.window.showWarningMessage(message, vscode.l10n.t('Open Settings'))
      .then(action => {
        if (action) {
          vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'gitIdSwitcher.identities'
          );
        }
      });
  }

  return validIdentities;
}

/**
 * Reset the validation error notification flag (for testing)
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
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
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
