/**
 * Git Identity Type Definitions
 *
 * Identities are loaded from VS Code settings, not hardcoded.
 * Each identity represents a Git persona with optional SSH/GPG keys.
 *
 * This module holds the Identity type and how an identity is displayed.
 * Reading and writing the identities in the settings lives in
 * `./identityConfig`, and the editable field definitions in
 * `./identityFields`; both are re-exported here so callers keep a single
 * import site for the identity domain.
 *
 * The field constants below are defined before the re-exports at the end of
 * this file: identityConfig and configSchema import them, and they must be
 * set when those modules are loaded through this one.
 */

import type { GpgFormat } from "../core/constants";

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

  /** Path to the SSH private key for authentication (added to ssh-agent) - optional */
  sshKeyPath?: string;

  /** SSH config host alias (for multi-account setups) - optional */
  sshHost?: string;

  /** GPG key ID for commit signing - optional (not together with sshSigningKeyPath) */
  gpgKeyId?: string;

  /**
   * Path to the SSH key for commit signing - optional (not together with gpgKeyId).
   * A private key, or the public key when the private key is in ssh-agent.
   * Not added to ssh-agent by the extension.
   */
  sshSigningKeyPath?: string;
}

/** Fields that hold a key path */
export const KEY_PATH_FIELDS = ["sshKeyPath", "sshSigningKeyPath"] as const;

export type KeyPathField = (typeof KEY_PATH_FIELDS)[number];

/** Fields that choose the key commits are signed with (at most one is set) */
export const SIGNING_FIELDS = ["gpgKeyId", "sshSigningKeyPath"] as const;

export type SigningField = (typeof SIGNING_FIELDS)[number];

/** The `gpg.format` each signing field signs with */
export const SIGNING_FIELD_FORMATS: Readonly<Record<SigningField, GpgFormat>> = {
  gpgKeyId: "openpgp",
  sshSigningKeyPath: "ssh",
};

/**
 * Get identity display label for UI
 * If service is specified, formats as "Name - Service"
 */
export function getIdentityLabel(identity: Identity): string {
  const displayName = identity.service
    ? `${identity.name} - ${identity.service}`
    : identity.name;

  return identity.icon ? `${identity.icon} ${displayName}` : displayName;
}

/**
 * Get identity display detail for quick pick
 * Shows description if available, otherwise email
 */
export function getIdentityDetail(identity: Identity): string {
  return identity.description ? `${identity.description} (${identity.email})` : identity.email;
}

/**
 * Format identity as Git author string
 */
export function formatGitAuthor(identity: Identity): string {
  return identity.icon ? `${identity.icon} ${identity.name} <${identity.email}>` : `${identity.name} <${identity.email}>`;
}

export {
  getUserScopeIdentities,
  getManagedIdentities,
  getIdentitiesWithValidation,
  invalidateIdentityCache,
  getIdentityById,
  getDefaultIdentity,
  deleteIdentityFromConfig,
  addIdentityToConfig,
  updateIdentityInConfig,
  moveIdentityInConfig,
} from "./identityConfig";
export {
  type FieldMetadata,
  EDITABLE_FIELDS,
  FIELD_METADATA,
  getFieldMetadata,
} from "./identityFields";
