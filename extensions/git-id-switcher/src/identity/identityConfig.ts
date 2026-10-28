/**
 * Identity Settings Access
 *
 * Reads the identities from the VS Code settings (with schema validation and
 * a cache), and writes them back (add, update, delete, reorder).
 *
 * Uses vscodeLoader for testability (allows mocking in E2E tests).
 */

import { getVSCode } from "../core/vscodeLoader";
import { validateIdentitySchema } from "./configSchema";
import { securityLogger } from "../security/securityLogger";
import { MAX_IDENTITIES, MAX_ID_LENGTH } from "../core/constants";
import { isValidIdentityId } from "../validators/common";
import type { Identity } from "./identity";

/**
 * Session-level flag to prevent multiple validation error notifications.
 * Reset when extension is reloaded.
 */
let hasShownValidationError = false;

/**
 * Cache for validated identities.
 *
 * Invalidated on configuration change via invalidateIdentityCache().
 * Avoids redundant VS Code config reads + schema validation on every call
 * (up to MAX_IDENTITIES=1000 validateIdentitySchema() per invocation).
 */
let identityCache: Identity[] | null = null;

/**
 * The VS Code API object the cache was read from.
 *
 * In production there is only one, so this never changes. Tests swap in mock
 * objects, and a configuration-change handler that finishes late can fill the
 * cache from a different object; the cache is only reused for the same object.
 */
let identityCacheSource: unknown;

function storeIdentityCache(identities: Identity[], source: unknown): void {
  identityCache = identities;
  identityCacheSource = source;
}

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

  const message =
    invalidCount === 1
      ? vs.l10n.t(
          "Git ID Switcher: 1 identity configuration is invalid and was skipped. Check the settings.",
        )
      : vs.l10n.t(
          "Git ID Switcher: {0} identity configurations are invalid and were skipped. Check the settings.",
          invalidCount,
        );

  // Fire and forget: notification is non-blocking
  // Note: VS Code's Thenable doesn't have .catch(), so we use .then(onFulfilled, onRejected)
  vs.window.showWarningMessage(message, vs.l10n.t("Open Settings")).then(
    (action) => {
      if (action) {
        vs.commands.executeCommand(
          "workbench.action.openSettings",
          "gitIdSwitcher.identities",
        );
      }
    },
    () => {
      // SECURITY: Don't let notification errors affect validation flow
    },
  );
}

/**
 * Load identities from VS Code settings (raw, no validation)
 *
 * WARNING: This function does not validate identities.
 * Use getIdentitiesWithValidation() for security-critical code paths.
 *
 * NOTE: Always reads from VS Code configuration directly, bypassing the
 * identity cache. This is intentional for config mutation code paths
 * (add/delete/update/move) that need the latest raw configuration.
 */
export function getIdentities(): Identity[] {
  const vs = getVSCode();
  if (!vs) {
    return [];
  }
  const config = vs.workspace.getConfiguration("gitIdSwitcher");
  const identities = config.get<Identity[]>("identities", []);
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
  // Return cached result if it was read from the same VS Code API object
  // (shallow copy to prevent callers from mutating cache)
  if (identityCache !== null && identityCacheSource === vs) {
    return [...identityCache];
  }

  if (!vs) {
    return [];
  }

  const config = vs.workspace.getConfiguration("gitIdSwitcher");
  const rawIdentities = config.get<unknown[]>("identities", []);

  // Type check: must be an array
  if (!Array.isArray(rawIdentities)) {
    // Log type error but don't show notification (configuration might be in transition)
    securityLogger.logValidationFailure(
      "identities",
      "Configuration must be an array",
      typeof rawIdentities,
    );
    return [];
  }

  // Early return for empty array (valid state, cache to avoid repeated config reads)
  if (rawIdentities.length === 0) {
    storeIdentityCache([], vs);
    return [];
  }

  // SECURITY: Limit array size to prevent DoS attacks via excessive validation
  // VS Code settings should enforce this, but defense-in-depth requires explicit check
  if (rawIdentities.length > MAX_IDENTITIES) {
    securityLogger.logValidationFailure(
      "identities",
      `Array length exceeds maximum (${MAX_IDENTITIES})`,
      rawIdentities.length,
    );
    // Cache and return empty array to fail securely (avoids repeated security log spam)
    storeIdentityCache([], vs);
    return [];
  }

  // Filter and validate individual identities
  const validIdentities: Identity[] = [];
  const invalidIndices: number[] = [];
  const seenIds = new Set<string>();

  for (const [i, identity] of rawIdentities.entries()) {
    const result = validateIdentitySchema(identity);

    if (!result.valid) {
      invalidIndices.push(i);
      // Log validation failures
      for (const error of result.errors) {
        securityLogger.logValidationFailure(
          `identities[${i}].${error.field}`,
          error.message,
          error.value,
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
        id,
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

  storeIdentityCache(validIdentities, vs);
  return [...validIdentities];
}

/**
 * Invalidate the identity cache and reset the validation notification flag.
 *
 * Must be called on configuration change (onDidChangeConfiguration)
 * to force re-validation on next getIdentitiesWithValidation() call.
 * Also exposed for testing purposes.
 */
export function invalidateIdentityCache(): void {
  identityCache = null;
  identityCacheSource = undefined;
  hasShownValidationError = false;
}

/**
 * Get identity by ID (with validation)
 */
export function getIdentityById(id: string): Identity | undefined {
  return getIdentitiesWithValidation().find((i) => i.id === id);
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

  const config = vs.workspace.getConfiguration("gitIdSwitcher");
  const defaultId = config.get<string>("defaultIdentity", "");

  const identities = getIdentitiesWithValidation();
  if (identities.length === 0) {
    return undefined;
  }

  if (defaultId) {
    const found = identities.find((i) => i.id === defaultId);
    if (found) {
      return found;
    }
  }

  return identities[0];
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
    throw new Error("VS Code API not available");
  }

  // Validate ID format
  if (!isValidIdentityId(id, MAX_ID_LENGTH)) {
    throw new Error(`Invalid identity ID format: ${id}`);
  }

  const config = vs.workspace.getConfiguration("gitIdSwitcher");
  const identities = config.get<Identity[]>("identities", []);

  // Find the identity to delete
  const index = identities.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error(`Identity not found: ${id}`);
  }

  // Remove the identity from array
  const updatedIdentities = identities.filter((i) => i.id !== id);

  // Update configuration
  await config.update(
    "identities",
    updatedIdentities,
    vs.ConfigurationTarget.Global,
  );

  // Log security event
  securityLogger.logConfigChange("identities");
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
    throw new Error("VS Code API not available");
  }

  // Validate schema
  const validationResult = validateIdentitySchema(identity);
  if (!validationResult.valid) {
    const errorMessages = validationResult.errors
      .map((e) => `${e.field}: ${e.message}`)
      .join(", ");
    throw new Error(`Invalid identity schema: ${errorMessages}`);
  }

  const config = vs.workspace.getConfiguration("gitIdSwitcher");
  const identities = config.get<Identity[]>("identities", []);

  // Check for duplicate ID
  const isDuplicateExists = identities.some((i) => i.id === identity.id);
  if (isDuplicateExists) {
    throw new Error(`Identity with ID already exists: ${identity.id}`);
  }

  // Check maximum limit
  if (identities.length >= MAX_IDENTITIES) {
    throw new Error(`Maximum identity limit reached: ${MAX_IDENTITIES}`);
  }

  // Add the new identity
  const updatedIdentities = [...identities, identity];

  // Update configuration
  await config.update(
    "identities",
    updatedIdentities,
    vs.ConfigurationTarget.Global,
  );

  // Log security event
  securityLogger.logConfigChange("identities");
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
  value: string | undefined,
): Promise<void> {
  const vs = getVSCode();
  if (!vs) {
    throw new Error("VS Code API not available");
  }

  // Validate ID format
  if (!isValidIdentityId(id, MAX_ID_LENGTH)) {
    throw new Error(`Invalid identity ID format: ${id}`);
  }

  // Required fields cannot be set to undefined
  const requiredFields: (keyof Identity)[] = ["id", "name", "email"];
  if (value === undefined && requiredFields.includes(field)) {
    throw new Error(`Cannot set required field to undefined: ${field}`);
  }

  const config = vs.workspace.getConfiguration("gitIdSwitcher");
  const identities = config.get<Identity[]>("identities", []);

  // If changing ID, validate new ID format and check for duplicates
  if (field === "id" && value !== undefined && value !== id) {
    if (!isValidIdentityId(value, MAX_ID_LENGTH)) {
      throw new Error(`Invalid new identity ID format: ${value}`);
    }
    const isDuplicateExists = identities.some((i) => i.id === value);
    if (isDuplicateExists) {
      throw new Error(`Identity with ID already exists: ${value}`);
    }
  }

  // Find the identity to update
  const index = identities.findIndex((i) => i.id === id);
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
      .map((e) => `${e.field}: ${e.message}`)
      .join(", ");
    throw new Error(`Invalid identity after update: ${errorMessages}`);
  }

  // Update the identities array
  const updatedIdentities = [...identities];
  updatedIdentities[index] = updatedIdentity;

  // Update configuration
  await config.update(
    "identities",
    updatedIdentities,
    vs.ConfigurationTarget.Global,
  );

  // Log security event
  securityLogger.logConfigChange("identities");
}

/**
 * Move an identity up or down in the configuration array.
 *
 * @param id - The identity ID to move (must pass isValidIdentityId validation)
 * @param direction - 'up' to move towards index 0, 'down' to move towards end
 * @returns Promise that resolves to true if moved, false if at boundary
 * @throws Error if identity ID format is invalid
 * @throws Error if identity with given ID is not found
 * @throws Error if configuration update fails
 * @throws Error if VS Code API is not available
 *
 * @example
 * // Move identity up (towards beginning of list)
 * const moved = await moveIdentityInConfig('work-github', 'up');
 * if (!moved) {
 *   // Identity was already at the top
 * }
 */
export async function moveIdentityInConfig(
  id: string,
  direction: "up" | "down",
): Promise<boolean> {
  const vs = getVSCode();
  if (!vs) {
    throw new Error("VS Code API not available");
  }

  // Validate ID format
  if (!isValidIdentityId(id, MAX_ID_LENGTH)) {
    throw new Error(`Invalid identity ID format: ${id}`);
  }

  const config = vs.workspace.getConfiguration("gitIdSwitcher");
  const identities = [...(config.get<Identity[]>("identities") ?? [])];

  // Find the identity to move
  const currentIndex = identities.findIndex((i) => i.id === id);
  if (currentIndex === -1) {
    throw new Error(`Identity not found: ${id}`);
  }

  // Calculate new index
  const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  // Boundary check: return false if cannot move
  if (newIndex < 0 || newIndex >= identities.length) {
    return false;
  }

  // Swap identities
  [identities[currentIndex], identities[newIndex]] = [
    identities[newIndex],
    identities[currentIndex],
  ];

  // Update configuration
  await config.update("identities", identities, vs.ConfigurationTarget.Global);

  // Log security event
  securityLogger.logConfigChange("identities");

  return true;
}
