/**
 * Windows Drive Path Validation
 *
 * Accepts a Windows absolute path with a drive letter (`C:\Users\...` or
 * `C:/Users/...`) where a key path may be one: a key path setting, and the
 * value written to user.signingkey (on Windows, `~/` expands to such a path).
 * The rest of the path goes through the same checks as any other path
 * (validatePathSecurity), with backslashes read as separators.
 *
 * Only `<letter>:` followed by a separator is accepted. UNC paths
 * (`\\server\share`), device paths (`\\.\`, `\\?\`) and drive-relative
 * paths (`C:file`) do not match and stay rejected.
 */

import { DRIVE_PREFIX_LENGTH, isDriveAbsolutePath } from '../validators/common';
import { validatePathSecurity, type SecurePathResult } from './pathValidator';

/**
 * Validate a Windows absolute path with a drive letter.
 *
 * @param inputPath - The path to validate
 * @returns valid when the path has a drive prefix and the rest passes the
 *   path security checks (traversal, control characters, double separators,
 *   reserved device names, ...)
 */
export function validateDriveAbsolutePathSecurity(inputPath: string): SecurePathResult {
  return isDriveAbsolutePath(inputPath)
    ? validatePathSecurity(inputPath.slice(DRIVE_PREFIX_LENGTH).replaceAll('\\', '/'))
    : { valid: false, reason: 'Not a Windows absolute path with a drive letter' };
}
