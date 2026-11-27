/**
 * Signing Keys From User Settings Only
 *
 * SECURITY: The identities setting can also come from a workspace's
 * `.vscode/settings.json`. A repository could then set another of the user's
 * keys as the signing key, and commits would be signed with it. The signing
 * fields (gpgKeyId, sshSigningKeyPath) of an identity are therefore taken from
 * the identity in the user's settings with the same id, name and email, and
 * dropped if there is none. Matching the id alone is not enough: a workspace
 * could pick the id of one of the user's identities and pair its signing key
 * with another name and email.
 */

import { securityLogger } from "../security/securityLogger";
import { SIGNING_FIELDS, type Identity } from "./identity";
import { isPlainObject } from "../validators/common";

/**
 * The identity with the given id in the user's settings, if any.
 */
function findUserScopeIdentity(
  id: string,
  userScopeIdentities: readonly unknown[],
): Record<string, unknown> | undefined {
  return userScopeIdentities.find((entry): entry is Record<string, unknown> => isPlainObject(entry) && entry.id === id);
}

/**
 * The user's identity whose signing keys an identity may use: the one with
 * the same id, name and email. A user identity with the same id but another
 * name or email is logged and not used.
 */
function findMatchingUserScopeIdentity(
  identity: Identity,
  userScopeIdentities: readonly unknown[],
): Record<string, unknown> | undefined {
  const userIdentity = findUserScopeIdentity(identity.id, userScopeIdentities);
  if (userIdentity === undefined) {
    return undefined;
  }
  if (userIdentity.name === identity.name && userIdentity.email === identity.email) {
    return userIdentity;
  }
  securityLogger.logValidationFailure(
    `identities.${identity.id}`,
    "The name or email differs from the identity in user settings; its signing keys were not used",
  );
  return undefined;
}

/**
 * A copy of a settings entry without its signing fields (whatever their
 * values or types), or the entry itself when it is not an object.
 */
export function withoutSigningFields(entry: unknown): unknown {
  if (!isPlainObject(entry)) {
    return entry;
  }
  const copy: Record<string, unknown> = { ...entry };
  for (const field of SIGNING_FIELDS) {
    delete copy[field];
  }
  return copy;
}

/**
 * Take an identity's signing keys from the user's settings only.
 *
 * The result starts from the identity without its signing fields, and the
 * user's signing fields are copied into it as they are, of whatever type:
 * nothing from other settings is kept, and nothing of the user's is turned
 * into "not set" before validation. A value from other settings that differs
 * is logged and not used.
 *
 * The result is not validated here: the caller validates it as a whole, so
 * signing keys that are invalid (a number, for example) or conflict (both
 * gpgKeyId and sshSigningKeyPath) stop the identity instead of leaving it
 * unsigned.
 *
 * @param identity - A settings entry whose other fields are validated (from
 *   the merged settings); its own signing fields are only compared, never kept
 * @param userScopeIdentities - The identities in the user's settings
 * @returns The entry with signing fields from the user's settings only (to be validated)
 */
export function takeSigningKeysFromUserScope(
  identity: Identity,
  userScopeIdentities: readonly unknown[],
): Record<string, unknown> {
  const userIdentity = findMatchingUserScopeIdentity(identity, userScopeIdentities);
  const result = withoutSigningFields(identity) as Record<string, unknown>;
  for (const field of SIGNING_FIELDS) {
    const userValue = userIdentity?.[field];
    const otherValue: unknown = Reflect.get(identity, field);
    const isOtherValueSet = ![undefined, ""].includes(otherValue as string | undefined);
    if (isOtherValueSet && otherValue !== userValue) {
      securityLogger.logValidationFailure(
        `identities.${identity.id}.${field}`,
        "Signing keys are read from user settings only; a value from other settings was ignored",
      );
    }
    if (userValue !== undefined) {
      result[field] = userValue;
    }
  }
  return result;
}
