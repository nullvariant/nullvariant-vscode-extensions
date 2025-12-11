/**
 * SSH Agent Management
 *
 * Handles adding/removing SSH keys from ssh-agent.
 * Cross-platform support for macOS, Linux, and Windows.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as path from 'path';
import { Identity, getIdentities } from './identity';

const execAsync = promisify(exec);

export interface SshKeyInfo {
  fingerprint: string;
  comment: string;
  type: string;
}

/**
 * Expand ~ to home directory
 */
function expandPath(keyPath: string): string {
  if (keyPath.startsWith('~')) {
    return path.join(os.homedir(), keyPath.slice(1));
  }
  return keyPath;
}

/**
 * List all keys currently in ssh-agent
 */
export async function listSshKeys(): Promise<SshKeyInfo[]> {
  try {
    const { stdout } = await execAsync('ssh-add -l');
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
 */
export async function addSshKey(keyPath: string): Promise<void> {
  const expandedPath = expandPath(keyPath);

  // Check platform for appropriate ssh-add flags
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      // macOS: Use Keychain integration
      await execAsync(`ssh-add --apple-use-keychain "${expandedPath}"`);
    } else if (platform === 'win32') {
      // Windows: Standard ssh-add (assumes OpenSSH is installed)
      await execAsync(`ssh-add "${expandedPath}"`);
    } else {
      // Linux and others
      await execAsync(`ssh-add "${expandedPath}"`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to add SSH key: ${message}`);
  }
}

/**
 * Remove SSH key from agent
 */
export async function removeSshKey(keyPath: string): Promise<void> {
  const expandedPath = expandPath(keyPath);

  try {
    await execAsync(`ssh-add -d "${expandedPath}"`);
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
  const identities = getIdentities();
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
  const identities = getIdentities();

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
 */
export async function getKeyFingerprint(keyPath: string): Promise<string | undefined> {
  const expandedPath = expandPath(keyPath);

  try {
    const { stdout } = await execAsync(`ssh-keygen -lf "${expandedPath}"`);
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
