/**
 * SSH Agent Management
 *
 * Handles adding/removing SSH keys from ssh-agent.
 * Cross-platform support for macOS, Linux, and Windows.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 * @see https://owasp.org/www-community/attacks/Command_Injection
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { Identity, getIdentitiesWithValidation } from '../identity/identity';
import { sshAgentExec, sshKeygenExec } from '../security/secureExec';
import { isPathSafe } from '../identity/inputValidator';
import {
  normalizeAndValidatePath,
  validateSshKeyPath,
} from '../security/pathUtils';
import { createSecurityViolationError, wrapError } from '../core/errors';
import { securityLogger } from '../security/securityLogger';

/**
 * Maximum allowed SSH key file size (1MB)
 * SSH private keys are typically small (1-4KB).
 * 1MB is a generous limit that catches DoS attacks while allowing for edge cases.
 */
const MAX_SSH_KEY_FILE_SIZE = 1024 * 1024;

/**
 * Minimum SSH key file size (10 bytes)
 * Even the smallest valid SSH key would be larger than this.
 * This catches empty files and trivially invalid files.
 */
const MIN_SSH_KEY_FILE_SIZE = 10;

/**
 * Unix permission bits that should NOT be set on SSH key files
 * Combines group and others read/write/execute bits
 */
const INSECURE_PERMISSION_BITS = 0o077;

/**
 * Owner execute bit that should NOT be set on SSH key files
 * SSH private keys should not be executable (security best practice)
 */
const OWNER_EXECUTE_BIT = 0o100;

/**
 * Valid SSH private key format headers
 * These are the standard formats supported by ssh-add
 */
const VALID_SSH_KEY_HEADERS = [
  '-----BEGIN OPENSSH PRIVATE KEY-----',      // OpenSSH format (modern)
  '-----BEGIN RSA PRIVATE KEY-----',          // RSA PEM format
  '-----BEGIN DSA PRIVATE KEY-----',          // DSA PEM format
  '-----BEGIN EC PRIVATE KEY-----',           // EC PEM format
  '-----BEGIN PRIVATE KEY-----',              // PKCS#8 unencrypted
  '-----BEGIN ENCRYPTED PRIVATE KEY-----',    // PKCS#8 encrypted
  'PuTTY-User-Key-File-2:',                   // PuTTY PPK v2
  'PuTTY-User-Key-File-3:',                   // PuTTY PPK v3
] as const;

/**
 * Maximum bytes to read for format validation
 * SSH key headers are typically within the first 50 bytes
 */
const FORMAT_CHECK_BYTES = 64;

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
 * @param token Optional cancellation token for aborting the operation
 */
export async function listSshKeys(
  token?: vscode.CancellationToken
): Promise<SshKeyInfo[]> {
  if (token?.isCancellationRequested) {
    return [];
  }

  try {
    // SECURITY: Using sshAgentExec with array args
    const { stdout } = await sshAgentExec(['-l']);

    if (token?.isCancellationRequested) {
      return [];
    }

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
 * SECURITY: Path is validated before use including:
 * - Path format and traversal prevention
 * - File existence check
 * - File type validation (must be regular file)
 * - File size limit (DoS prevention)
 * - File permissions check (Unix only)
 */
export async function addSshKey(keyPath: string): Promise<void> {
  // SECURITY: Validate path format before use
  validateKeyPath(keyPath);

  const expandedPath = expandPath(keyPath);

  // SECURITY: Validate file before passing to ssh-add
  const fileValidation = await validateKeyFileForSshAdd(expandedPath);
  if (!fileValidation.valid) {
    throw createSecurityViolationError(
      vscode.l10n.t('SSH key file validation failed'),
      {
        field: 'sshKeyPath',
        context: { reason: fileValidation.reason },
      }
    );
  }

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
 * @param token Optional cancellation token for aborting the operation
 */
export async function detectCurrentIdentityFromSsh(
  token?: vscode.CancellationToken
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
    await fs.access(expandedPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validation result for SSH key file
 */
export interface KeyFileValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Check if file content starts with a valid SSH private key header
 *
 * Reads only the first few bytes to validate the format efficiently.
 * Supports OpenSSH, PEM (RSA/DSA/EC), PKCS#8, and PuTTY formats.
 *
 * SECURITY: File handle is always closed, even on error.
 *
 * @param filePath - Path to the SSH key file
 * @returns true if the file has a valid SSH key header
 */
async function isValidSshKeyFormat(filePath: string): Promise<boolean> {
  let fileHandle: Awaited<ReturnType<typeof fs.open>> | null = null;
  try {
    fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(FORMAT_CHECK_BYTES);
    const { bytesRead } = await fileHandle.read(buffer, 0, FORMAT_CHECK_BYTES, 0);

    if (bytesRead === 0) {
      return false;
    }

    // SECURITY: Try UTF-8 first (most common), then fallback to Latin-1 for binary formats
    // PuTTY format headers are ASCII-compatible, so UTF-8 should work
    let header: string;
    try {
      header = buffer.subarray(0, bytesRead).toString('utf8').trimStart();
    } catch {
      // Fallback to Latin-1 if UTF-8 decoding fails (shouldn't happen for valid SSH keys)
      header = buffer.subarray(0, bytesRead).toString('latin1').trimStart();
    }

    // Check if the file starts with any valid SSH key header
    // Note: PuTTY format headers are ASCII, so UTF-8 decoding works fine
    return VALID_SSH_KEY_HEADERS.some(validHeader =>
      header.startsWith(validHeader)
    );
  } catch (error) {
    // SECURITY: Log read errors for security audit
    // If we can't read the file, it's not a valid key
    securityLogger.logValidationFailure(
      'ssh-key-format',
      'Failed to read file for format validation',
      error instanceof Error ? error.name : 'unknown'
    );
    return false;
  } finally {
    // SECURITY: Always close file handle to prevent resource leaks
    if (fileHandle) {
      try {
        await fileHandle.close();
      } catch (closeError) {
        // Log but don't throw - we're in cleanup
        securityLogger.logValidationFailure(
          'ssh-key-format',
          'Failed to close file handle',
          closeError instanceof Error ? closeError.name : 'unknown'
        );
      }
    }
  }
}

/**
 * Handle file stat errors and return appropriate validation result.
 * @internal
 */
function handleFileStatError(error: unknown): KeyFileValidationResult {
  const errorName = error instanceof Error ? error.name : 'unknown';
  const errorCode = (error as NodeJS.ErrnoException)?.code;

  if (errorCode === 'ENOENT') {
    securityLogger.logValidationFailure('ssh-key-file', 'File does not exist');
    return { valid: false, reason: 'file_not_found' };
  }

  if (errorCode === 'EACCES' || errorCode === 'EPERM') {
    securityLogger.logValidationFailure('ssh-key-file', 'File access denied');
    return { valid: false, reason: 'access_denied' };
  }

  securityLogger.logValidationFailure(
    'ssh-key-file',
    `File stat failed: ${errorName} (${errorCode ?? 'unknown'})`
  );
  return { valid: false, reason: 'stat_error' };
}

/**
 * Validate file type (must be regular file).
 * @internal
 */
function validateKeyFileType(stats: Awaited<ReturnType<typeof fs.stat>>): KeyFileValidationResult | null {
  if (stats.isFile()) {
    return null; // Valid
  }

  if (stats.isDirectory()) {
    securityLogger.logValidationFailure(
      'ssh-key-file',
      'Path points to a directory, not a file'
    );
    return { valid: false, reason: 'is_directory' };
  }

  securityLogger.logValidationFailure('ssh-key-file', 'Path is not a regular file');
  return { valid: false, reason: 'not_regular_file' };
}

/**
 * Validate file size limits.
 * @internal
 */
function validateKeyFileSize(size: number): KeyFileValidationResult | null {
  if (size < MIN_SSH_KEY_FILE_SIZE) {
    securityLogger.logValidationFailure(
      'ssh-key-file',
      `File size ${size} is below minimum ${MIN_SSH_KEY_FILE_SIZE}`
    );
    return { valid: false, reason: 'file_too_small' };
  }

  if (size > MAX_SSH_KEY_FILE_SIZE) {
    securityLogger.logValidationFailure(
      'ssh-key-file',
      `File size ${size} exceeds maximum ${MAX_SSH_KEY_FILE_SIZE}`
    );
    return { valid: false, reason: 'file_too_large' };
  }

  return null; // Valid
}

/**
 * Validate file permissions (Unix only).
 * @internal
 */
function validateKeyFilePermissions(mode: number): KeyFileValidationResult | null {
  // Skip on Windows (uses ACL-based permissions)
  if (process.platform === 'win32') {
    return null;
  }

  const modeString = (mode & 0o777).toString(8);

  // Check if group or others have any permissions
  if ((mode & INSECURE_PERMISSION_BITS) !== 0) {
    securityLogger.logValidationFailure(
      'ssh-key-file',
      `Insecure permissions: ${modeString} (group/others have access)`
    );
    return { valid: false, reason: 'insecure_permissions' };
  }

  // Check if owner execute bit is set (SSH keys should not be executable)
  if ((mode & OWNER_EXECUTE_BIT) !== 0) {
    securityLogger.logValidationFailure(
      'ssh-key-file',
      `Insecure permissions: ${modeString} (owner execute bit set)`
    );
    return { valid: false, reason: 'insecure_permissions' };
  }

  return null; // Valid
}

/**
 * Validate SSH key file for ssh-add operation
 *
 * Performs comprehensive security checks:
 * - File existence
 * - File type (must be regular file, not directory/device)
 * - File size limits (prevents DoS and catches empty files)
 * - File permissions (Unix only: checks for insecure permissions)
 * - File format validation (must start with valid SSH key header)
 *
 * Note: Symlinks are already resolved by expandPath/validateSshKeyPath,
 * so we use fs.stat here which follows symlinks.
 *
 * @param expandedPath - Already expanded and validated path (symlinks resolved)
 * @returns Validation result
 */
async function validateKeyFileForSshAdd(
  expandedPath: string
): Promise<KeyFileValidationResult> {
  try {
    // Get file stats
    let stats: Awaited<ReturnType<typeof fs.stat>>;
    try {
      stats = await fs.stat(expandedPath);
    } catch (error) {
      return handleFileStatError(error);
    }

    // Validate file type
    const typeCheck = validateKeyFileType(stats);
    if (typeCheck) return typeCheck;

    // Validate file size
    const sizeCheck = validateKeyFileSize(stats.size);
    if (sizeCheck) return sizeCheck;

    // Validate permissions (Unix only)
    const permCheck = validateKeyFilePermissions(stats.mode);
    if (permCheck) return permCheck;

    // Validate SSH key file format
    const isValidFormat = await isValidSshKeyFormat(expandedPath);
    if (!isValidFormat) {
      securityLogger.logValidationFailure(
        'ssh-key-file',
        'File does not have a valid SSH private key format'
      );
      return { valid: false, reason: 'invalid_format' };
    }

    return { valid: true };
  } catch (error) {
    // SECURITY: Log unexpected errors with details for security audit
    const errorName = error instanceof Error ? error.name : 'unknown';
    const errorMessage = error instanceof Error ? error.message : String(error);
    const truncatedMessage = errorMessage.length > 100
      ? errorMessage.slice(0, 100) + '...[truncated]'
      : errorMessage;
    securityLogger.logValidationFailure(
      'ssh-key-file',
      `Unexpected error during validation: ${errorName}`,
      truncatedMessage
    );
    return { valid: false, reason: 'validation_error' };
  }
}
