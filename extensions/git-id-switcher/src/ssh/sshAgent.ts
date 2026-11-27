/**
 * SSH Agent Management
 *
 * Handles adding/removing SSH keys from ssh-agent.
 * Cross-platform support for macOS, Linux, and Windows.
 *
 * Only the authentication key (sshKeyPath) is handled here. The signing key
 * (sshSigningKeyPath) is used by git directly and never added to the agent;
 * when it is another identity's authentication key, a switch to the identity
 * that signs with it does not remove it.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 * @see https://owasp.org/www-community/attacks/Command_Injection
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { Identity, getIdentitiesWithValidation } from "../identity/identity";
import { sshAgentExec, sshKeygenExec } from "../security/secureExec";
import { validateKeyPathFormat } from "../identity/inputValidator";
import { validateSshKeyPath } from "../security/pathUtils";
import { createSecurityViolationError, wrapError } from "../core/errors";
import { validateKeyFileBeforeAddToAgent } from "./keyFileValidator";

/**
 * Check if an ssh-agent key comment matches a given basename using
 * exact or word-boundary matching.
 *
 * ssh-add stores the key file path as the comment by default.
 * Possible comment formats:
 * - Full path: "/home/user/.ssh/id_ed25519"
 * - Basename only: "id_ed25519"
 * - With user comment: "id_ed25519 user@host" (space-separated)
 *
 * @security Uses exact/word-boundary matching instead of substring includes()
 * to prevent partial matches (e.g., "id_rsa" matching "id_rsa_work").
 *
 * @param comment - The ssh-agent key comment
 * @param basename - The SSH key file basename to match
 * @returns true if the comment matches the basename
 */
function isBasenameMatch(comment: string, basename: string): boolean {
  // defense-in-depth: empty basename would false-positive on paths ending with '/'
  // eslint-disable-next-line unicorn/prefer-ternary -- keep the defense-in-depth guard as an explicit early return
  if (basename.length === 0) {
    return false;
  }
  return (
    // Exact match: comment is just the basename
    comment === basename ||
    // Path match: comment ends with /<basename>
    comment.endsWith("/" + basename) ||
    comment.endsWith("\\" + basename) ||
    // Space-separated match: comment starts with <basename> followed by space
    // (ssh-keygen comments like "id_ed25519 user@host")
    comment.startsWith(basename + " ") ||
    // Path + space match: comment contains /<basename> followed by space
    // (full path with additional comment like "/home/user/.ssh/id_ed25519 user@host")
    comment.includes("/" + basename + " ") ||
    comment.includes("\\" + basename + " ") ||
    // Token match: basename appears as a standalone space-delimited token
    // defense-in-depth: handles fallback case where listSshKeys() uses entire
    // ssh-add -l line as comment (e.g., "256 SHA256:xxx id_ed25519 (unknown)")
    comment.includes(" " + basename + " ") ||
    comment.endsWith(" " + basename)
  );
}

export interface SshKeyInfo {
  fingerprint: string;
  comment: string;
  type: string;
}

/**
 * Check a configured authentication key path and expand it (tilde,
 * normalization, symlinks).
 *
 * Two checks: the format of a key path setting (validateKeyPathFormat, the
 * same check as the settings and the identity form), then the path checks
 * before the path is used (pathUtils.validateSshKeyPath). An absolute path,
 * `~/`, and on Windows a drive path (`C:\`) are accepted.
 *
 * @remarks
 * **Naming convention**: Named with `OrThrow` suffix because this function
 * throws an exception on validation failure rather than returning a result object.
 *
 * @throws SecurityViolationError if the path is not accepted
 */
function expandKeyPathOrThrow(keyPath: string): string {
  const formatErrors: string[] = [];
  validateKeyPathFormat(keyPath, "sshKeyPath", formatErrors);
  if (formatErrors.length > 0) {
    // SECURITY: Don't include the actual path in error message to prevent information leakage
    throw createSecurityViolationError(vscode.l10n.t("Invalid SSH key path"), {
      field: "sshKeyPath",
      context: { check: "format", errorCount: formatErrors.length },
    });
  }

  const result = validateSshKeyPath(keyPath, {
    resolveSymlinks: true,
    requireExists: false, // Don't require existence for all operations
  });
  if (!result.valid) {
    // SECURITY: Only log the reason internally, don't expose the path or the reason to users
    throw createSecurityViolationError(vscode.l10n.t("Invalid SSH key path"), {
      field: "sshKeyPath",
      context: { reason: result.reason },
    });
  }

  return result.normalizedPath!;
}

/**
 * List all keys currently in ssh-agent
 * @param token Optional cancellation token for aborting the operation
 */
export async function listSshKeys(
  token?: vscode.CancellationToken,
): Promise<SshKeyInfo[]> {
  if (token?.isCancellationRequested) {
    return [];
  }

  try {
    // SECURITY: Using sshAgentExec with array args
    const { stdout } = await sshAgentExec(["-l"]);

    if (token?.isCancellationRequested) {
      return [];
    }

    const lines = stdout
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);

    return lines.map((line) => {
      // Format: "256 SHA256:xxx comment (type)"
      // SECURITY: Use split-based parsing to avoid ReDoS (SonarQube S5852)
      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        // Extract type from last part: "(type)" -> "type"
        const lastPart = parts.at(-1) ?? "";
        const typeMatch =
          lastPart.startsWith("(") && lastPart.endsWith(")")
            ? lastPart.slice(1, -1)
            : null;
        if (typeMatch && /^\w+$/.test(typeMatch)) {
          // Comment is everything between fingerprint and type
          const comment = parts.slice(2, -1).join(" ");
          return {
            fingerprint: parts[1],
            comment,
            type: typeMatch,
          };
        }
      }
      return {
        fingerprint: "",
        comment: line,
        type: "unknown",
      };
    });
  } catch {
    // ssh-add -l returns exit code 1 if no keys
    return [];
  }
}

/**
 * Add SSH key to agent
 *
 * Uses --apple-use-keychain for macOS Keychain integration
 *
 * SECURITY: Path is validated before use including:
 * - Path format and traversal prevention
 * - File existence check
 * - File type validation (must be regular file)
 * - File size limit (DoS prevention)
 * - File permissions check (Unix only)
 */
export async function addSshKey(keyPath: string): Promise<void> {
  // SECURITY: Validate path format before use
  const expandedPath = expandKeyPathOrThrow(keyPath);

  // SECURITY: Validate file before passing to ssh-add
  const fileValidation = await validateKeyFileBeforeAddToAgent(expandedPath);
  if (!fileValidation.valid) {
    throw createSecurityViolationError(
      vscode.l10n.t("SSH key file validation failed"),
      {
        field: "sshKeyPath",
        context: { reason: fileValidation.reason },
      },
    );
  }

  // Check platform for appropriate ssh-add flags
  const platform = process.platform;

  try {

    // macOS: Use Keychain integration; Windows, Linux and others: plain add
    // SECURITY: Using sshAgentExec with array args prevents injection
    // (the path is passed as a single array element, not interpolated)
    await sshAgentExec(platform === "darwin" ? ["--apple-use-keychain", expandedPath] : [expandedPath]);
  } catch (error) {
    // SECURITY: Wrap error to hide internal details from users
    throw wrapError(error, vscode.l10n.t("Failed to add SSH key"), {
      field: "sshKeyPath",
      context: { platform },
    });
  }
}

/**
 * Remove SSH key from agent
 *
 * SECURITY: Path is validated before use
 */
export async function removeSshKey(keyPath: string): Promise<void> {
  // SECURITY: Validate path before use
  const expandedPath = expandKeyPathOrThrow(keyPath);

  try {
    // SECURITY: Using sshAgentExec with array args
    await sshAgentExec(["-d", expandedPath]);
  } catch {
    // Ignore errors (key might not be loaded)
  }
}

/**
 * The expanded private key path of an identity's SSH signing key (without
 * `.pub`), or undefined when it has none or the path is not accepted.
 */
function getSigningPrivateKeyPath(identity: Identity): string | undefined {
  const signingKeyPath = identity.sshSigningKeyPath?.replace(/\.pub$/, "");
  try {
    return signingKeyPath ? expandKeyPathOrThrow(signingKeyPath) : undefined;
  } catch {
    return undefined;
  }
}

/** Whether an authentication key path names the given expanded key path */
function isSameKey(sshKeyPath: string, expandedKeyPath: string | undefined): boolean {
  try {
    return expandedKeyPath !== undefined && expandKeyPathOrThrow(sshKeyPath) === expandedKeyPath;
  } catch {
    return false;
  }
}

/**
 * Remove all identity keys from agent
 *
 * This removes all keys for configured identities, leaving other keys intact
 *
 * @param keptKeyPath - An expanded key path that is not removed (the signing
 *   key of the identity switched to, when it is another identity's
 *   authentication key: git signs with it from ssh-agent)
 */
export async function removeAllIdentityKeys(keptKeyPath?: string): Promise<void> {
  const identities = getIdentitiesWithValidation();
  const removePromises = identities
    .filter((identity) => identity.sshKeyPath && !isSameKey(identity.sshKeyPath, keptKeyPath))
    .map((identity) =>
      removeSshKey(identity.sshKeyPath!).catch(() => {
        // Ignore individual errors
      }),
    );

  await Promise.all(removePromises);
}

/**
 * Switch to a specific identity's SSH key
 *
 * Removes all identity keys and adds only the selected one. The key the
 * selected identity signs with (sshSigningKeyPath) is not removed.
 */
export async function switchToIdentitySshKey(
  identity: Identity,
): Promise<void> {
  if (!identity.sshKeyPath) {
    // No SSH key configured for this identity
    return;
  }

  // First, remove all identity keys but the signing key of this identity
  await removeAllIdentityKeys(getSigningPrivateKeyPath(identity));

  // Then add the selected identity's key
  await addSshKey(identity.sshKeyPath);
}

/**
 * Check if a specific SSH key is currently loaded in the ssh-agent.
 *
 * @remarks
 * **Naming convention**: Named with `check` prefix because this function
 * performs an external state check (queries ssh-agent process) rather than
 * a pure boolean predicate. The `InAgent` suffix clarifies where it's checking.
 */
export async function checkKeyLoadedInAgent(keyPath: string): Promise<boolean> {
  // SECURITY: Validate path
  const expandedPath = expandKeyPathOrThrow(keyPath);
  const keys = await listSshKeys();

  // Check if any loaded key's comment matches the key path basename
  // (ssh-add uses the key path as comment by default)
  // defense-in-depth: use exact/word-boundary matching to prevent
  // partial matches (e.g., "id_rsa" matching "id_rsa_work")
  return keys.some((key) => {
    const keyPathBasename = path.basename(expandedPath);
    return isBasenameMatch(key.comment, keyPathBasename);
  });
}

/**
 * Detect which identity's key is currently loaded
 * @param token Optional cancellation token for aborting the operation
 */
export async function detectCurrentIdentityFromSsh(
  token?: vscode.CancellationToken,
): Promise<Identity | undefined> {
  if (token?.isCancellationRequested) {
    return undefined;
  }

  const keys = await listSshKeys(token);

  if (token?.isCancellationRequested) {
    return undefined;
  }

  const identities = getIdentitiesWithValidation();

  for (const identity of identities) {
    if (token?.isCancellationRequested) {
      return undefined;
    }

    if (!identity.sshKeyPath) {
      continue;
    }

    const keyPathBasename = path.basename(expandKeyPathOrThrow(identity.sshKeyPath));
    // defense-in-depth: exact/word-boundary matching (see isBasenameMatch)
    const isLoaded = keys.some((key) =>
      isBasenameMatch(key.comment, keyPathBasename),
    );
    if (isLoaded) {
      return identity;
    }
  }

  return undefined;
}

/**
 * Get SSH key fingerprint
 *
 * SECURITY: Path is validated before use
 */
export async function getKeyFingerprint(
  keyPath: string,
): Promise<string | undefined> {
  // SECURITY: Validate path before use
  const expandedPath = expandKeyPathOrThrow(keyPath);

  try {
    // SECURITY: Using sshKeygenExec with array args
    const { stdout } = await sshKeygenExec(["-lf", expandedPath]);
    // SECURITY: Use split-based parsing to avoid ReDoS (SonarQube S5852)
    const parts = stdout.trim().split(/\s+/);
    return parts.length >= 2 ? parts[1] : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Check if SSH key file exists
 */
export async function keyFileExists(keyPath: string): Promise<boolean> {
  const expandedPath = expandKeyPathOrThrow(keyPath);

  try {
    await fs.access(expandedPath);
    return true;
  } catch {
    return false;
  }
}
