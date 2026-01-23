/**
 * Path Utilities for Secure Path Handling
 *
 * This module re-exports functions from the path/ directory for backwards compatibility.
 * New code should import directly from the specific modules:
 * - './path/normalize' for path normalization
 * - './path/symlink' for symlink operations
 */

// Re-export all public APIs from normalize module
export {
  normalizeAndValidatePath,
  validateWorkspacePath,
  validateSubmodulePath,
  validateSshKeyPath,
  expandTilde,
} from './path/normalize';

// Re-export types from normalize module
export type {
  NormalizePathOptions,
  NormalizedPathResult,
  ValidateSubmodulePathOptions,
} from './path/normalize';

// Re-export symlink functions
export { containsSymlinks } from './path/symlink';
