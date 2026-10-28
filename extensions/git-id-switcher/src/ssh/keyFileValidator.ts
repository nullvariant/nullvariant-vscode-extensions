/**
 * SSH Key File Validation
 *
 * Checks a private key file before it is added to ssh-agent: that it is a
 * regular file, within size limits, not readable by group or others, and in
 * a known private key format. Failures are logged as security events.
 */

import type { Stats } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import * as fs from "node:fs/promises";
import { securityLogger } from "../security/securityLogger";

/**
 * Maximum allowed SSH key file size (1MB)
 * SSH private keys are typically small (1-4KB).
 * 1MB is a generous limit that catches DoS attacks while allowing for edge cases.
 */
const MAX_SSH_KEY_FILE_SIZE = 1_048_576; // 1 MiB (1024 * 1024)

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
  "-----BEGIN OPENSSH PRIVATE KEY-----", // OpenSSH format (modern)
  "-----BEGIN RSA PRIVATE KEY-----", // RSA PEM format
  "-----BEGIN DSA PRIVATE KEY-----", // DSA PEM format
  "-----BEGIN EC PRIVATE KEY-----", // EC PEM format
  "-----BEGIN PRIVATE KEY-----", // PKCS#8 unencrypted
  "-----BEGIN ENCRYPTED PRIVATE KEY-----", // PKCS#8 encrypted
  "PuTTY-User-Key-File-2:", // PuTTY PPK v2
  "PuTTY-User-Key-File-3:", // PuTTY PPK v3
] as const;

/**
 * Maximum bytes to read for format validation
 * SSH key headers are typically within the first 50 bytes
 */
const FORMAT_CHECK_BYTES = 64;

/**
 * Mask for the permission bits (owner, group, others) of a file mode.
 */
const FILE_PERMISSION_BITS = 0o777;

/**
 * Radix for showing permission bits in the familiar octal form (e.g. "600").
 */
const OCTAL_RADIX = 8;

/**
 * Validation result for SSH key file
 */
export interface KeyFileValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate that file content starts with a valid SSH private key header.
 *
 * Reads only the first few bytes to validate the format efficiently.
 * Supports OpenSSH, PEM (RSA/DSA/EC), PKCS#8, and PuTTY formats.
 *
 * @remarks
 * **Naming convention**: Named with `validate` prefix to remove the redundant
 * `is` + `Valid` pattern from the original name. Returns boolean for simplicity
 * since the validation is binary (valid header or not).
 *
 * SECURITY: File handle is always closed, even on error.
 *
 * @param filePath - Path to the SSH key file
 * @returns true if the file has a valid SSH key header
 */
async function validateSshKeyFormat(filePath: string): Promise<boolean> {
  let fileHandle: FileHandle | null = null;
  try {
    fileHandle = await fs.open(filePath, "r");
    const buffer = Buffer.alloc(FORMAT_CHECK_BYTES);
    const { bytesRead } = await fileHandle.read(
      buffer,
      0,
      FORMAT_CHECK_BYTES,
      0,
    );

    if (bytesRead === 0) {
      return false;
    }

    // SECURITY: Try UTF-8 first (most common), then fallback to Latin-1 for binary formats
    // PuTTY format headers are ASCII-compatible, so UTF-8 should work
    let header: string;
    try {
      header = buffer.subarray(0, bytesRead).toString("utf8").trimStart();
    } catch /* c8 ignore start - Defense-in-depth: Buffer#toString("utf8") replaces invalid bytes instead of throwing */ {
      // Fallback to Latin-1 if UTF-8 decoding fails (shouldn't happen for valid SSH keys)
      header = buffer.subarray(0, bytesRead).toString("latin1").trimStart();
    } /* c8 ignore stop */

    // Check if the file starts with any valid SSH key header
    // Note: PuTTY format headers are ASCII, so UTF-8 decoding works fine
    return VALID_SSH_KEY_HEADERS.some((validHeader) =>
      header.startsWith(validHeader),
    );
  } catch (error) {
    // SECURITY: Log read errors for security audit
    // If we can't read the file, it's not a valid key
    securityLogger.logValidationFailure(
      "ssh-key-format",
      "Failed to read file for format validation",
      error instanceof Error ? error.name : "unknown",
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
          "ssh-key-format",
          "Failed to close file handle",
          closeError instanceof Error ? closeError.name : "unknown",
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
  const errorName = error instanceof Error ? error.name : "unknown";
  const errorCode = (error as NodeJS.ErrnoException)?.code;

  if (errorCode === "ENOENT") {
    securityLogger.logValidationFailure("ssh-key-file", "File does not exist");
    return { valid: false, reason: "file_not_found" };
  }

  if (errorCode === "EACCES" || errorCode === "EPERM") {
    securityLogger.logValidationFailure("ssh-key-file", "File access denied");
    return { valid: false, reason: "access_denied" };
  }

  securityLogger.logValidationFailure(
    "ssh-key-file",
    `File stat failed: ${errorName} (${errorCode ?? "unknown"})`,
  );
  return { valid: false, reason: "stat_error" };
}

/**
 * Validate file type (must be regular file).
 * @internal
 */
function validateKeyFileType(
  stats: Stats,
): KeyFileValidationResult | null {
  if (stats.isFile()) {
    return null; // Valid
  }

  if (stats.isDirectory()) {
    securityLogger.logValidationFailure(
      "ssh-key-file",
      "Path points to a directory, not a file",
    );
    return { valid: false, reason: "is_directory" };
  }

  securityLogger.logValidationFailure(
    "ssh-key-file",
    "Path is not a regular file",
  );
  return { valid: false, reason: "not_regular_file" };
}

/**
 * Validate file size limits.
 * @internal
 */
function validateKeyFileSize(size: number): KeyFileValidationResult | null {
  if (size < MIN_SSH_KEY_FILE_SIZE) {
    securityLogger.logValidationFailure(
      "ssh-key-file",
      `File size ${size} is below minimum ${MIN_SSH_KEY_FILE_SIZE}`,
    );
    return { valid: false, reason: "file_too_small" };
  }

  if (size > MAX_SSH_KEY_FILE_SIZE) {
    securityLogger.logValidationFailure(
      "ssh-key-file",
      `File size ${size} exceeds maximum ${MAX_SSH_KEY_FILE_SIZE}`,
    );
    return { valid: false, reason: "file_too_large" };
  }

  return null; // Valid
}

/**
 * Validate file permissions (Unix only).
 * @internal
 */
function validateKeyFilePermissions(
  mode: number,
): KeyFileValidationResult | null {
  // Skip on Windows (uses ACL-based permissions)
  if (process.platform === "win32") {
    return null;
  }

  const modeString = (mode & FILE_PERMISSION_BITS).toString(OCTAL_RADIX); // eslint-disable-line no-bitwise -- file permission extraction

  // Check if group or others have any permissions
  // eslint-disable-next-line no-bitwise -- permission bit extraction
  if ((mode & INSECURE_PERMISSION_BITS) !== 0) {
    securityLogger.logValidationFailure(
      "ssh-key-file",
      `Insecure permissions: ${modeString} (group/others have access)`,
    );
    return { valid: false, reason: "insecure_permissions" };
  }

  // Check if owner execute bit is set (SSH keys should not be executable)
  // eslint-disable-next-line no-bitwise -- permission bit extraction
  if ((mode & OWNER_EXECUTE_BIT) !== 0) {
    securityLogger.logValidationFailure(
      "ssh-key-file",
      `Insecure permissions: ${modeString} (owner execute bit set)`,
    );
    return { valid: false, reason: "insecure_permissions" };
  }

  return null; // Valid
}

/**
 * Validate SSH key file before adding to ssh-agent.
 *
 * Performs comprehensive security checks:
 * - File existence
 * - File type (must be regular file, not directory/device)
 * - File size limits (prevents DoS and catches empty files)
 * - File permissions (Unix only: checks for insecure permissions)
 * - File format validation (must start with valid SSH key header)
 *
 * @remarks
 * **Naming convention**: Named with `BeforeAddToAgent` suffix to clarify
 * the timing/context of this validation (pre-operation check before ssh-add).
 *
 * Note: Symlinks are already resolved by expandPath/validateSshKeyPath,
 * so we use fs.stat here which follows symlinks.
 *
 * @param expandedPath - Already expanded and validated path (symlinks resolved)
 * @returns Validation result
 */
export async function validateKeyFileBeforeAddToAgent(
  expandedPath: string,
): Promise<KeyFileValidationResult> {
  try {
    // Get file stats
    let stats: Stats;
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
    const isValidFormat = await validateSshKeyFormat(expandedPath);
    if (!isValidFormat) {
      securityLogger.logValidationFailure(
        "ssh-key-file",
        "File does not have a valid SSH private key format",
      );
      return { valid: false, reason: "invalid_format" };
    }

    return { valid: true };
  } catch (error) {
    // SECURITY: Log unexpected errors with details for security audit
    const errorName = error instanceof Error ? error.name : "unknown";
    const errorMessage = error instanceof Error ? error.message : String(error);
    const truncatedMessage =
      errorMessage.length > 100
        ? errorMessage.slice(0, 100) + "...[truncated]"
        : errorMessage;
    securityLogger.logValidationFailure(
      "ssh-key-file",
      `Unexpected error during validation: ${errorName}`,
      truncatedMessage,
    );
    return { valid: false, reason: "validation_error" };
  }
}
