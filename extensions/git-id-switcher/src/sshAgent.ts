/**
 * SSH Agent Management
 *
 * Handles adding/removing SSH keys from ssh-agent.
 * Cross-platform support for macOS, Linux, and Windows.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 * @see https://owasp.org/www-community/attacks/Command_Injection
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { Identity, getIdentitiesWithValidation } from './identity';
import { sshAgentExec, sshKeygenExec } from './secureExec';
import { isPathSafe } from './validation';
import {
  normalizeAndValidatePath,
  validateSshKeyPath,
} from './pathUtils';
import { createSecurityViolationError, wrapError } from './errors';

export interface SshKeyInfo {
  fingerprint: string;
  comment: string;
  type: string;
}

/**
 * Expand and validate SSH key path securely
 *
 * Uses pathUtils for:
 * - Tilde expansion (~/ to home directory)
 * - Path normalization
 * - Symlink resolution
 * - Security validation
 *
 * @param keyPath - The SSH key path to expand
 * @returns Normalized absolute path
 * @throws Error if path is invalid or insecure
 */
function expandPath(keyPath: string): string {
  const result = validateSshKeyPath(keyPath, {
    resolveSymlinks: true,
    requireExists: false, // Don't require existence for all operations
  });

  if (!result.valid) {
    // SECURITY: Don't expose the actual path or detailed reason to users
    throw createSecurityViolationError(vscode.l10n.t('Invalid SSH key path'), {
      field: 'sshKeyPath',
      context: { reason: result.reason },
    });
  }

  return result.normalizedPath!;
}

/**
 * Validate SSH key path for security
 *
 * @throws Error if path is potentially dangerous
 */
function validateKeyPath(keyPath: string): void {
  // Use both legacy validation and new secure validation
  if (!isPathSafe(keyPath)) {
    // SECURITY: Don't include the actual path in error message to prevent information leakage
    throw createSecurityViolationError(vscode.l10n.t('Invalid SSH key path'), {
      field: 'sshKeyPath',
      context: { check: 'legacy' },
    });
  }

  // Additional validation using pathUtils
  const result = normalizeAndValidatePath(keyPath);
  if (!result.valid) {
    // SECURITY: Only log the reason internally, don't expose to users
    throw createSecurityViolationError(vscode.l10n.t('Invalid SSH key path'), {
      field: 'sshKeyPath',
      context: { reason: result.reason },
    });
  }
}

/**
 * List all keys currently in ssh-agent
 */
export async function listSshKeys(): Promise<SshKeyInfo[]> {
  try {
    // SECURITY: Using sshAgentExec with array args
    const { stdout } = await sshAgentExec(['-l']);
    const lines = stdout.trim().split('\n').filter(line => line.length > 0);

    return lines.map(line => {
      // Format: "256 SHA256:xxx comment (type)"
      const match = line.match(/^(\d+)\s+(\S+)\s+(.+)\s+\((\w+)\)$/);
      if (match) {
        return {
          fingerprint: match[2],
          comment: match[3],
          type: match[4],
        };
      }
      return {
        fingerprint: '',
        comment: line,
        type: 'unknown',
      };
    });
  } catch (error) {
    // ssh-add -l returns exit code 1 if no keys
    return [];
  }
}

/**
 * Add SSH key to agent
 *
 * Uses --apple-use-keychain for macOS Keychain integration
 *
 * SECURITY: Path is validated before use
 */
export async function addSshKey(keyPath: string): Promise<void> {
  // SECURITY: Validate path before use
  validateKeyPath(keyPath);

  const expandedPath = expandPath(keyPath);

  // Check platform for appropriate ssh-add flags
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      // macOS: Use Keychain integration
      // SECURITY: Using sshAgentExec with array args prevents injection
      await sshAgentExec(['--apple-use-keychain', expandedPath]);
    } else {
      // Windows, Linux and others
      // SECURITY: Path is passed as a single array element, not interpolated
      await sshAgentExec([expandedPath]);
    }
  } catch (error) {
    // SECURITY: Wrap error to hide internal details from users
    throw wrapError(error, vscode.l10n.t('Failed to add SSH key'), {
      field: 'sshKeyPath',
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
  validateKeyPath(keyPath);

  const expandedPath = expandPath(keyPath);

  try {
    // SECURITY: Using sshAgentExec with array args
    await sshAgentExec(['-d', expandedPath]);
  } catch (error) {
    // Ignore errors (key might not be loaded)
  }
}

/**
 * Remove all identity keys from agent
 *
 * This removes all keys for configured identities, leaving other keys intact
 */
export async function removeAllIdentityKeys(): Promise<void> {
  const identities = getIdentitiesWithValidation();
  const removePromises = identities
    .filter(identity => identity.sshKeyPath)
    .map(identity =>
      removeSshKey(identity.sshKeyPath!).catch(() => {
        // Ignore individual errors
      })
    );

  await Promise.all(removePromises);
}

/**
 * Switch to a specific identity's SSH key
 *
 * Removes all identity keys and adds only the selected one
 */
export async function switchToIdentitySshKey(identity: Identity): Promise<void> {
  if (!identity.sshKeyPath) {
    // No SSH key configured for this identity
    return;
  }

  // First, remove all identity keys
  await removeAllIdentityKeys();

  // Then add the selected identity's key
  await addSshKey(identity.sshKeyPath);
}

/**
 * Check if a specific key is loaded in the agent
 */
export async function isKeyLoaded(keyPath: string): Promise<boolean> {
  // SECURITY: Validate path
  validateKeyPath(keyPath);

  const expandedPath = expandPath(keyPath);
  const keys = await listSshKeys();

  // Check if any loaded key's comment contains the key path
  // (ssh-add uses the key path as comment by default)
  return keys.some(key => {
    const keyPathBasename = path.basename(expandedPath);
    return key.comment.includes(keyPathBasename);
  });
}

/**
 * Detect which identity's key is currently loaded
 */
export async function detectCurrentIdentityFromSsh(): Promise<Identity | undefined> {
  const keys = await listSshKeys();
  const identities = getIdentitiesWithValidation();

  for (const identity of identities) {
    if (!identity.sshKeyPath) {
      continue;
    }

    const keyPathBasename = path.basename(expandPath(identity.sshKeyPath));
    const isLoaded = keys.some(key => key.comment.includes(keyPathBasename));
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
export async function getKeyFingerprint(keyPath: string): Promise<string | undefined> {
  // SECURITY: Validate path before use
  validateKeyPath(keyPath);

  const expandedPath = expandPath(keyPath);

  try {
    // SECURITY: Using sshKeygenExec with array args
    const { stdout } = await sshKeygenExec(['-lf', expandedPath]);
    const match = stdout.match(/(\S+)\s+(\S+)/);
    return match ? match[2] : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Check if SSH key file exists
 */
export async function keyFileExists(keyPath: string): Promise<boolean> {
  const expandedPath = expandPath(keyPath);

  try {
    // Cross-platform file existence check
    const fs = await import('fs/promises');
    await fs.access(expandedPath);
    return true;
  } catch {
    return false;
  }
}
