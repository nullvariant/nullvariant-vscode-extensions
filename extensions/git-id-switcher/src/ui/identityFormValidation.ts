/**
 * Identity Form Validation
 *
 * UI-layer validation for identity form fields.
 * Defense-in-depth: All validators delegate to identity layer (SSoT)
 * and add UI-specific feedback via VS Code l10n.
 *
 * @module ui/identityFormValidation
 */

import type { VSCodeAPI } from "./identityFormUtils";
import {
  type Identity,
  type KeyPathField,
  SIGNING_FIELDS,
  getUserScopeIdentities,
  getFieldMetadata,
} from "../identity/identity";
import { MAX_ID_LENGTH, MAX_NAME_LENGTH } from "../core/constants";
import { isValidIdentityId } from "../validators/common";
import {
  validateKeyPathFormat,
  validateFieldForDangerousPatterns,
  validateEmailField,
  validateGpgKeyId,
  validateSshHost,
} from "../identity/inputValidator";

// ============================================================================
// Constants
// ============================================================================

/** Optional fields that can be cleared */
export const OPTIONAL_FIELDS: ReadonlySet<keyof Identity> = new Set([
  "service",
  "icon",
  "description",
  "sshKeyPath",
  "sshHost",
  "gpgKeyId",
  "sshSigningKeyPath",
]);

// ============================================================================
// Field Optionality
// ============================================================================

/**
 * Check if a field is optional (can be empty).
 *
 * @param field - The field name to check
 * @returns true if the field can be empty
 */
export function isOptionalField(field: keyof Identity): boolean {
  return OPTIONAL_FIELDS.has(field);
}

// ============================================================================
// Individual Field Validators
// ============================================================================

/**
 * Validate ID input.
 *
 * SECURITY: Validates format to prevent injection attacks.
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @param existingIds - Set of existing identity IDs
 * @returns Error message or null if valid
 */
export function validateIdInput(
  vs: VSCodeAPI,
  value: string,
  existingIds: Set<string>,
): string | null {
  if (!value) {
    return vs.l10n.t("ID cannot be empty");
  }
  if (!isValidIdentityId(value, MAX_ID_LENGTH)) {
    return vs.l10n.t(
      "ID must be 1-{0} alphanumeric characters, underscores, or hyphens",
      MAX_ID_LENGTH,
    );
  }
  if (existingIds.has(value)) {
    return vs.l10n.t("ID already exists");
  }
  return null;
}

/**
 * Validate Name input.
 *
 * SECURITY: Checks for dangerous shell metacharacters to prevent command injection.
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateNameInput(vs: VSCodeAPI, value: string): string | null {
  if (!value || value.trim().length === 0) {
    return vs.l10n.t("Name cannot be empty");
  }
  if (value.length > MAX_NAME_LENGTH) {
    return vs.l10n.t("Name is too long (max {0} characters)", MAX_NAME_LENGTH);
  }
  // SECURITY: Delegate to identity layer (SSoT for dangerous pattern detection)
  const errors: string[] = [];
  validateFieldForDangerousPatterns(value, "name", errors);
  return errors.length > 0 ? vs.l10n.t("Name contains invalid characters") : null;
}

/**
 * Validate Email input.
 *
 * SECURITY: Validates email format to prevent malformed data.
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateEmailInput(vs: VSCodeAPI, value: string): string | null {
  if (!value) {
    return vs.l10n.t("Email cannot be empty");
  }
  // Delegate format and length validation to identity layer (SSoT)
  const errors: string[] = [];
  validateEmailField(value, errors);
  return errors.length > 0 ? vs.l10n.t("Invalid email format") : null;
}

/**
 * Validate a key path input (sshKeyPath, sshSigningKeyPath).
 *
 * SECURITY: Reuses validateKeyPathFormat from inputValidator.ts, the same
 * level as the settings and the runtime check (`/`, `~/` or a Windows drive
 * path, no traversal, no dangerous characters). Defense-in-depth:
 * identity.ts also validates on save.
 *
 * @param field - The key path field
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateKeyPathInput(field: KeyPathField, value: string): string | null {
  if (!value) return null; // Optional field
  const errors: string[] = [];
  validateKeyPathFormat(value, field, errors);
  return errors[0] ?? null;
}

/**
 * Validate GPG key ID input.
 *
 * SECURITY: Reuses GPG_KEY_REGEX from validators/common.ts
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateGpgKeyIdInput(vs: VSCodeAPI, value: string): string | null {
  if (!value) return null; // Optional field
  // Delegate to identity layer (SSoT)
  const errors: string[] = [];
  validateGpgKeyId(value, errors);
  return errors.length > 0 ? vs.l10n.t("GPG key ID must be 8-40 hexadecimal characters") : null;
}

/**
 * Validate SSH host input.
 *
 * SECURITY: Reuses SSH_HOST_REGEX from validators/common.ts
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateSshHostInput(vs: VSCodeAPI, value: string): string | null {
  if (!value) return null; // Optional field
  // Delegate to identity layer (SSoT for format and length validation)
  const errors: string[] = [];
  validateSshHost(value, errors);
  return errors.length > 0 ? vs.l10n.t("SSH host must contain only valid hostname characters") : null;
}

/** Whether a field is one of the signing fields (an identity sets at most one) */
function isSigningField(field: keyof Identity): boolean {
  return (SIGNING_FIELDS as readonly string[]).includes(field);
}

/**
 * The value of another signing field that is set (an identity can set only
 * one of the signing fields).
 *
 * @param values - Identity field values
 * @param field - The field being edited
 * @returns The value of the other signing field, or undefined for a field that
 *   is not a signing field or when no other signing field is set
 */
export function getOtherSigningValue(
  values: Partial<Record<keyof Identity, string>>,
  field: keyof Identity
): string | undefined {
  return isSigningField(field)
    ? SIGNING_FIELDS.filter((signingField) => signingField !== field)
        .map((signingField) => values[signingField])
        .find((value) => value?.trim())
    : undefined;
}

// ============================================================================
// Field Validation Dispatcher
// ============================================================================

/**
 * Validate field input based on field type.
 *
 * @param vs - VS Code API
 * @param field - Field being edited
 * @param value - Input value
 * @param isOptional - Whether the field is optional
 * @param currentIdentityId - Current identity ID (for self-exclusion in duplicate check when editing 'id')
 * @param otherSigningValue - For gpgKeyId / sshSigningKeyPath: the value of the
 *   other signing field in the same identity (only one of them can be set)
 * @returns Error message or null if valid
 */
export function validateFieldInput(
  vs: VSCodeAPI,
  field: keyof Identity,
  value: string,
  isOptional: boolean,
  currentIdentityId?: string,
  otherSigningValue?: string,
): string | null {
  // Optional fields can be empty
  if (isOptional && value.trim() === "") {
    return null;
  }

  if (isSigningField(field) && otherSigningValue?.trim()) {
    return vs.l10n.t("GPG key ID and SSH signing key path cannot both be set. Clear the other one first.");
  }

  switch (field) {
    case "id": {
      const identities = getUserScopeIdentities();
      const existingIds = new Set(
        identities.filter((i) => i.id !== currentIdentityId).map((i) => i.id),
      );
      return validateIdInput(vs, value, existingIds);
    }
    case "name": {
      return validateNameInput(vs, value);
    }
    case "email": {
      return validateEmailInput(vs, value);
    }
    case "sshKeyPath":
    case "sshSigningKeyPath": {
      return validateKeyPathInput(field, value);
    }
    case "gpgKeyId": {
      return validateGpgKeyIdInput(vs, value);
    }
    case "sshHost": {
      return validateSshHostInput(vs, value);
    }
    default: {
      // Delegate dangerous pattern check to identity layer (SSoT)
      const errors: string[] = [];
      validateFieldForDangerousPatterns(value, field, errors);
      if (errors.length > 0) {
        return vs.l10n.t("{0} contains invalid characters", field);
      }
      // Length validation from FIELD_METADATA
      const meta = getFieldMetadata(field);
      return meta?.maxLength && value.length > meta.maxLength ? vs.l10n.t(
          "{0} is too long (max {1} characters)",
          field,
          meta.maxLength,
        ) : null;
    }
  }
}
