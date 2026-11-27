/**
 * Identity Field Definitions
 *
 * Which identity fields can be edited, and the label, limits and validation
 * each field has in the identity form.
 */

import {
  MAX_ID_LENGTH,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_SERVICE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_SSH_HOST_LENGTH,
  MAX_GPG_KEY_LENGTH,
} from "../core/constants";
import {
  isValidIdentityId,
  isValidEmail,
  isValidSshHost,
  isValidGpgKeyId,
  hasDangerousChars,
  hasDangerousCharsForText,
} from "../validators/common";
import { validateKeyPathFormat } from "./inputValidator";
import type { Identity, KeyPathField } from "./identity";

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
  inputType: "text" | "file" | "email";

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
 * (service, icon, description, sshKeyPath, sshHost, gpgKeyId, sshSigningKeyPath).
 */
export const EDITABLE_FIELDS: ReadonlyArray<keyof Identity> = [
  "id",
  "name",
  "email",
  "service",
  "icon",
  "description",
  "sshKeyPath",
  "sshHost",
  "gpgKeyId",
  "sshSigningKeyPath",
];

/**
 * Field validator for a key path field.
 *
 * Uses the same format check as the runtime validation (inputValidator), so a
 * path is accepted or rejected the same way whether it comes from the form or
 * from the settings file.
 *
 * @param field - The key path field
 * @returns Validator returning the first error message, or undefined if valid
 */
function createKeyPathValidator(field: KeyPathField): (value: string) => string | undefined {
  return (value: string) => {
    const errors: string[] = [];
    validateKeyPathFormat(value, field, errors);
    return errors[0];
  };
}

/**
 * Field metadata for identity edit UI
 *
 * Defines validation rules and UI hints for each editable field.
 * Validators delegate to validators/common.ts functions for consistency.
 */
export const FIELD_METADATA: ReadonlyArray<FieldMetadata> = [
  {
    key: "id",
    labelKey: "ID",
    required: true,
    editable: true, // Editable during creation, but changing ID requires special handling
    inputType: "text",
    icon: "lock",
    maxLength: MAX_ID_LENGTH,
    validator: (value: string) =>
      isValidIdentityId(value, MAX_ID_LENGTH)
        ? undefined
        : `ID must be 1-${MAX_ID_LENGTH} alphanumeric characters, underscores, or hyphens`,
  },
  {
    key: "name",
    labelKey: "Name",
    required: true,
    editable: true,
    inputType: "text",
    icon: "person",
    maxLength: MAX_NAME_LENGTH,
    // strict: configSchema name pattern blocks (){}|&<> unlike service/description
    validator: (value: string) =>
      hasDangerousChars(value)
        ? "Name contains invalid characters"
        : undefined,
  },
  {
    key: "email",
    labelKey: "Email",
    required: true,
    editable: true,
    inputType: "email",
    icon: "mail",
    maxLength: MAX_EMAIL_LENGTH,
    validator: (value: string) =>
      isValidEmail(value) ? undefined : "Invalid email format",
  },
  {
    key: "service",
    labelKey: "Service",
    required: false,
    editable: true,
    inputType: "text",
    icon: "server",
    maxLength: MAX_SERVICE_LENGTH,
    validator: (value: string) =>
      hasDangerousCharsForText(value)
        ? "Service contains invalid characters"
        : undefined,
  },
  {
    key: "icon",
    labelKey: "Icon",
    required: false,
    editable: true,
    inputType: "text",
    icon: "symbol-color",
    // Note: Grapheme cluster validation is handled by configSchema
    // Here we only check for dangerous characters (command injection prevention)
    validator: (value: string) =>
      hasDangerousCharsForText(value)
        ? "Icon contains invalid characters"
        : undefined,
  },
  {
    key: "description",
    labelKey: "Description",
    required: false,
    editable: true,
    inputType: "text",
    icon: "note",
    maxLength: MAX_DESCRIPTION_LENGTH,
    validator: (value: string) =>
      hasDangerousCharsForText(value)
        ? "Description contains invalid characters"
        : undefined,
  },
  {
    key: "sshKeyPath",
    labelKey: "SSH Authentication Key Path",
    required: false,
    editable: true,
    inputType: "file",
    icon: "key",
    validator: createKeyPathValidator("sshKeyPath"),
  },
  {
    key: "sshHost",
    labelKey: "SSH Host",
    required: false,
    editable: true,
    inputType: "text",
    icon: "globe",
    maxLength: MAX_SSH_HOST_LENGTH,
    validator: (value: string) =>
      isValidSshHost(value)
        ? undefined
        : "SSH host must contain only alphanumeric characters, dots, underscores, and hyphens",
  },
  {
    key: "gpgKeyId",
    labelKey: "GPG Key ID",
    required: false,
    editable: true,
    inputType: "text",
    icon: "key",
    maxLength: MAX_GPG_KEY_LENGTH,
    validator: (value: string) =>
      isValidGpgKeyId(value)
        ? undefined
        : "GPG key ID must be 8-40 hexadecimal characters",
  },
  {
    key: "sshSigningKeyPath",
    labelKey: "SSH Signing Key Path",
    required: false,
    editable: true,
    inputType: "file",
    icon: "workspace-trusted",
    validator: createKeyPathValidator("sshSigningKeyPath"),
  },
];

/**
 * Get field metadata by key
 *
 * @param key - The field key to look up
 * @returns FieldMetadata for the key, or undefined if not found
 */
export function getFieldMetadata(
  key: keyof Identity,
): FieldMetadata | undefined {
  return FIELD_METADATA.find((f) => f.key === key);
}
