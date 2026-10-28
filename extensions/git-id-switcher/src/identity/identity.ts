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
 */

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

export {
  getIdentities,
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
