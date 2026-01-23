/**
 * Path Utilities for Secure Path Handling
 *
 * This module re-exports functions from the path/ directory for backwards compatibility.
 * New code should import directly from the specific modules:
 * - './path/normalize' for path normalization
 * - './path/workspace' for workspace/submodule validation
 * - './path/symlink' for symlink operations
 */

// Re-export path normalization APIs
export {
  normalizeAndValidatePath,
  validateSshKeyPath,
  expandTilde,
} from './path/normalize';

// Re-export types from normalize module
export type {
  NormalizePathOptions,
  NormalizedPathResult,
} from './path/normalize';

// Re-export workspace validation APIs
export {
  validateWorkspacePath,
  validateSubmodulePath,
} from './path/workspace';

// Re-export types from workspace module
export type { ValidateSubmodulePathOptions } from './path/workspace';

// Re-export symlink functions
export { containsSymlinks } from './path/symlink';
