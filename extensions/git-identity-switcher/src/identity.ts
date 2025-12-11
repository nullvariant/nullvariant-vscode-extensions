/**
 * Git Identity Type Definitions
 *
 * Identities are loaded from VS Code settings, not hardcoded.
 * Each identity represents a Git persona with optional SSH/GPG keys.
 */

import * as vscode from 'vscode';

export interface Identity {
  /** Unique identifier (lowercase, no spaces) */
  id: string;

  /** Display icon (emoji) - optional */
  icon?: string;

  /** Git user.name */
  name: string;

  /** Git user.email */
  email: string;

  /** Path to SSH private key - optional */
  sshKeyPath?: string;

  /** GPG key ID for commit signing - optional */
  gpgKeyId?: string;
}

/**
 * Load identities from VS Code settings
 */
export function getIdentities(): Identity[] {
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  const identities = config.get<Identity[]>('identities', []);
  return identities;
}

/**
 * Get identity by ID
 */
export function getIdentityById(id: string): Identity | undefined {
  return getIdentities().find(i => i.id === id);
}

/**
 * Get the default identity (first one, or specified in settings)
 */
export function getDefaultIdentity(): Identity | undefined {
  const config = vscode.workspace.getConfiguration('gitIdSwitcher');
  const defaultId = config.get<string>('defaultIdentity', '');

  const identities = getIdentities();
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
 */
export function getIdentityLabel(identity: Identity): string {
  if (identity.icon) {
    return `${identity.icon} ${identity.name}`;
  }
  return identity.name;
}

/**
 * Get identity display detail for quick pick
 */
export function getIdentityDetail(identity: Identity): string {
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
