/**
 * Symlink Resolution Utilities
 *
 * Provides secure symlink resolution and detection.
 * Designed to prevent symlink-based attacks including loops and escapes.
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import { PATH_MAX } from '../core/constants';

/**
 * Result of symlink resolution
 */
export interface SymlinkResolutionResult {
  valid: boolean;
  resolvedPath?: string;
  reason?: string;
}

/**
 * Rejection reasons for the realpath error codes that have a known meaning.
 * Any other code falls back to a generic reason that names the code.
 */
const SYMLINK_ERROR_REASONS: ReadonlyMap<string, string> = new Map([
  ['ELOOP', 'Symlink loop detected (ELOOP) - possible infinite loop attack'],
  ['EACCES', 'Permission denied while resolving symlinks (EACCES)'],
  ['ENAMETOOLONG', 'Path too long while resolving symlinks (ENAMETOOLONG)'],
  ['ENOTDIR', 'A component of the path is not a directory (ENOTDIR)'],
]);

/**
 * Resolve symlinks securely with loop detection
 *
 * Uses fs.realpathSync.native() with error handling for:
 * - ELOOP: Symlink loop detected (infinite loop attack)
 * - ENOENT: File/directory doesn't exist
 * - EACCES: Permission denied
 * - ENAMETOOLONG: Path too long
 *
 * SECURITY NOTES:
 * - On Windows, fs.realpathSync.native() correctly handles:
 *   - Symbolic links (created with mklink /D or mklink)
 *   - Junctions (created with mklink /J)
 *   - Hard links (created with mklink /H)
 * - ELOOP detection prevents infinite symlink loops (e.g., /a -> /b -> /a)
 * - ENOENT returns normalized input path (not raw) for consistency
 */
export function resolveSymlinksSecurely(inputPath: string): SymlinkResolutionResult {
  try {
    // Use native realpath for best performance and OS symlink handling
    const resolvedPath = fs.realpathSync.native(inputPath);

    /* c8 ignore start - PATH_MAX check after symlink resolution (edge case) */
    // Verify resolved path length
    const resolvedByteLength = Buffer.byteLength(resolvedPath, 'utf8');
    if (resolvedByteLength > PATH_MAX) {
      return {
        valid: false,
        reason: `Resolved path exceeds maximum length (${resolvedByteLength} > ${PATH_MAX} bytes)`,
      };
    }
    /* c8 ignore stop */

    return {
      valid: true,
      resolvedPath,
    };
  } catch (error) /* c8 ignore start */ {
    const nodeError = error as NodeJS.ErrnoException;
    const code = nodeError.code;

    if (code === 'ENOENT') {
      // File doesn't exist - this might be OK depending on use case
      // SECURITY: inputPath is already normalized by normalizeAndValidatePath()
      // before this function is called, but we normalize again for defensive programming
      // This ensures consistency even if the function is called directly
      // The caller can check requireExists if they need the file to exist
      return {
        valid: true,
        resolvedPath: path.normalize(inputPath), // Already normalized, but safe to normalize again (idempotent)
      };
    }

    return {
      valid: false,
      reason:
        (code === undefined ? undefined : SYMLINK_ERROR_REASONS.get(code)) ??
        `Error resolving symlinks: ${code || nodeError.message}`,
    };
  } /* c8 ignore stop */
}

/**
 * Check if a path contains symlinks
 *
 * Useful for detecting potential symlink attacks without resolving them
 *
 * SECURITY: ELOOP errors are treated as symlinks detected (potential attack)
 */
export function containsSymlinks(inputPath: string): boolean {
  try {
    const realPath = fs.realpathSync.native(inputPath);
    const normalPath = path.normalize(inputPath);
    return realPath !== normalPath;
  } catch (error) /* c8 ignore start */ {
    const nodeError = error as NodeJS.ErrnoException;
    const code = nodeError.code;

    // ELOOP indicates a symlink loop - treat as symlink detected (security concern)
    // ENOENT means file doesn't exist - can't determine if symlink, return false
    // Other errors (EACCES, etc.) - assume no symlinks for now
    // The error will be caught later during actual path resolution if needed
    return code === 'ELOOP';
  } /* c8 ignore stop */
}
