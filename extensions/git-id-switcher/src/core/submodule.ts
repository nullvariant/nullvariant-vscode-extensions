/**
 * Git Submodule Management
 *
 * Handles detection and configuration of Git submodules.
 * Allows identity settings to propagate to all submodules.
 *
 * SECURITY: Uses execFile() via secureExec to prevent command injection.
 *
 * Note: Uses vscodeLoader for lazy loading VS Code APIs to enable unit testing.
 */

import { getWorkspace } from "./vscodeLoader";
import { gitExecRaw } from "../security/secureExec";
import {
  validateSubmodulePath,
  validateWorkspacePath,
} from "../security/pathUtils";
import { securityLogger } from "../security/securityLogger";
import { createLocalGitConfigPort, type LocalGitConfigPort } from "./localGitConfig";
import { applyIdentityToRepository, type ApplyResult } from "./repositoryConfigWriter";
import type { SigningRecordStore } from "./signingRecordStore";
import type { SigningSpec } from "./signingPlan";

/**
 * Maximum allowed submodule recursion depth to prevent DoS attacks.
 * Deep nesting of submodules can cause performance issues and potential attacks.
 * This value matches the maximum defined in package.json configuration.
 */
const MAX_SUBMODULE_DEPTH = 5;

export interface Submodule {
  /** Relative path from workspace root */
  path: string;
  /** Absolute path */
  absolutePath: string;
  /** Current commit hash */
  commitHash: string;
  /** Whether the submodule is initialized */
  initialized: boolean;
}

/**
 * Valid status characters for git submodule status output.
 * ' ' = initialized, '-' = uninitialized, '+' = modified. git also prints 'U'
 * (merge conflicts); such a line is not read, and counts as a submodule missed.
 *
 * @see https://git-scm.com/docs/git-submodule#Documentation/git-submodule.txt-status--cached--recursive--ltpathgt82308203
 */
const VALID_STATUS_CHARS = new Set([" ", "-", "+"]);

/**
 * One line of `git submodule status`: a submodule, one that is not
 * initialized (left out on purpose: it has no git config of its own), or a
 * line that could not be read (a submodule missed).
 */
type ParsedSubmoduleEntry =
  | { readonly kind: "submodule"; readonly submodule: Submodule }
  | { readonly kind: "uninitialized" }
  | { readonly kind: "unreadable" };

const UNINITIALIZED: ParsedSubmoduleEntry = { kind: "uninitialized" };
const UNREADABLE: ParsedSubmoduleEntry = { kind: "unreadable" };

/**
 * Valid characters for SHA-1 commit hash (lowercase hex only).
 */
const HEX_CHARS = new Set("0123456789abcdef");

/**
 * Check if a code point is a control character (0x00-0x1f or 0x7f).
 */
function isControlCodePoint(codePoint: number): boolean {
  return codePoint <= 0x1f || codePoint === 0x7f;
}

/**
 * Check if a string contains any control characters.
 * Linear time O(n), no backtracking possible.
 */
function hasControlChars(str: string): boolean {
  for (const char of str) {
    const codePoint = char.codePointAt(0);
    /* c8 ignore next 3 - Defense-in-depth: git output shouldn't contain control chars */
    if (codePoint !== undefined && isControlCodePoint(codePoint)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a string is a valid 40-character lowercase hex SHA-1 hash.
 * Linear time O(n), no regex needed.
 */
function isValidCommitHash(str: string): boolean {
  if (str.length !== 40) return false;
  for (const char of str) {
    if (!HEX_CHARS.has(char)) return false;
  }
  return true;
}

/**
 * Strip optional branch suffix " (branch-name)" from the end of a string.
 * Returns the path portion without the branch suffix.
 * Linear time O(n), scans from end to find matching parentheses.
 */
function stripBranchSuffix(str: string): string {
  // Must end with ')'
  if (!str.endsWith(")")) return str;

  // Find matching '(' scanning backwards
  let parenDepth = 0;
  let branchStart = -1;

  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i];
    if (char === ")") {
      parenDepth++;
    } else if (char === "(") {
      parenDepth--;
      if (parenDepth === 0) {
        branchStart = i;
        break;
      }
    }
  }

  // No matching '(' found
  if (branchStart === -1) return str;

  // Check for space before '('
  if (branchStart > 0 && str[branchStart - 1] === " ") {
    // Validate branch name has no control characters
    const branchName = str.slice(branchStart + 1, -1);
    if (!hasControlChars(branchName)) {
      return str.slice(0, branchStart - 1);
    }
  }
  /* c8 ignore start - Defense-in-depth: malformed branch suffix edge case */
  return str;
}
/* c8 ignore stop */

function getWorkspaceValidationFailureReason(workspaceValidation: {
  reason?: string;
}): string {
  return workspaceValidation.reason ?? "Invalid workspace path";
}

/**
 * Parse and validate a single submodule entry from git status output.
 * Uses pure string operations to prevent ReDoS vulnerabilities.
 *
 * Format: "<status><commit> <path> (<branch>)" or "<status><commit> <path>"
 * - status: single character (' ' = initialized, '-' = uninitialized, '+' = modified;
 *   any other, such as 'U' for merge conflicts, is not read)
 * - commit: 40-character hex SHA-1 hash
 * - path: submodule path (no control characters)
 * - branch: optional branch name in parentheses
 *
 * @internal
 */
function parseSubmoduleEntry(
  line: string,
  workspacePath: string,
): ParsedSubmoduleEntry {
  // Minimum valid line: status(1) + hash(40) + space(1) + path(1) = 43 chars
  /* c8 ignore start - Short lines from git output (empty lines are skipped before) */
  if (line.length < 43) {
    securityLogger.logValidationFailure(
      "submoduleStatusLine",
      "Line too short for valid submodule status",
    );
    return UNREADABLE;
  }
  /* c8 ignore stop */

  // Extract status character (position 0). Another character, such as the
  // 'U' git prints for a submodule with merge conflicts, is not read: the
  // submodule is reported as missed, never skipped quietly
  const status = line.at(0)!;
  if (!VALID_STATUS_CHARS.has(status)) {
    securityLogger.logValidationFailure(
      "submoduleStatus",
      "Status character that is not read",
    );
    return UNREADABLE;
  }
  const isInitialized = status !== "-";

  // Extract commit hash (positions 1-40)
  const commitHash = line.slice(1, 41);
  /* c8 ignore start - Invalid hash from malformed git output */
  if (!isValidCommitHash(commitHash)) {
    securityLogger.logValidationFailure(
      "submoduleCommitHash",
      "Invalid commit hash format",
    );
    return UNREADABLE;
  }
  /* c8 ignore stop */

  // git prints one space after the hash; only that one is removed, so a
  // path that starts with a space keeps it
  if (line[41] !== " ") {
    securityLogger.logValidationFailure(
      "submoduleStatusLine",
      "No space after the commit hash",
    );
    return UNREADABLE;
  }

  // Extract remainder and strip branch suffix
  const remainder = line.slice(42);
  const submodulePath = stripBranchSuffix(remainder);

  // Validate path is not empty
  /* c8 ignore start - Empty path from malformed git output */
  if (submodulePath.length === 0) {
    securityLogger.logValidationFailure(
      "submodulePath",
      "Empty submodule path",
    );
    return UNREADABLE;
  }
  /* c8 ignore stop */

  /* c8 ignore start - Defense-in-depth: git output shouldn't contain control chars */
  // Validate path has no control characters
  if (hasControlChars(submodulePath)) {
    securityLogger.logValidationFailure(
      "submodulePath",
      "Path contains control characters",
    );
    return UNREADABLE;
  }
  /* c8 ignore stop */

  /* c8 ignore start - Regex already ensures 40 chars, but defensive check */
  // SECURITY: Defensive check for commit hash length
  if (commitHash.length !== 40) {
    securityLogger.logValidationFailure(
      "submoduleCommitHash",
      `Invalid commit hash length: ${commitHash.length} (expected 40)`,
      commitHash,
    );
    return UNREADABLE;
  }
  /* c8 ignore stop */

  // Skip uninitialized submodules
  /* c8 ignore start - Uninitialized submodule edge case (requires mock git output with '-' prefix) */
  if (!isInitialized) {
    return UNINITIALIZED;
  }
  /* c8 ignore stop */

  // SECURITY: Validate and normalize submodule path
  const pathResult = validateSubmodulePath(submodulePath, workspacePath);
  /* c8 ignore start - Path validation failure edge case (requires mock git output with invalid path) */
  if (!pathResult.valid || !pathResult.normalizedPath) {
    securityLogger.logValidationFailure(
      "submodulePath",
      pathResult.reason ?? "Unknown validation failure",
      submodulePath,
    );
    return UNREADABLE;
  }
  /* c8 ignore stop */

  return {
    kind: "submodule",
    submodule: {
      path: submodulePath,
      absolutePath: pathResult.normalizedPath,
      commitHash,
      initialized: isInitialized,
    },
  };
}

/**
 * The submodules of a repository, or undefined when they could not be
 * listed (an invalid path, or `git submodule status` failed): a failed
 * listing is never taken as "no submodules". The listing is not complete
 * when a line of it could not be read (see ParsedSubmoduleEntry).
 */
async function readSubmodules(
  workspacePath: string,
): Promise<SubmoduleCollection | undefined> {
  // SECURITY: Validate workspace path before use
  // Use validateWorkspacePath instead of normalizeAndValidatePath because
  // VS Code provides workspace paths in platform-native format (Windows: C:\...)
  const workspaceValidation = validateWorkspacePath(workspacePath, {
    requireExists: true,
  });

  if (!workspaceValidation.valid || !workspaceValidation.normalizedPath) {
    securityLogger.logValidationFailure(
      "submoduleWorkspace",
      getWorkspaceValidationFailureReason(workspaceValidation),
    );
    return undefined;
  }

  const validatedWorkspacePath = workspaceValidation.normalizedPath;

  const result = await gitExecRaw(
    ["submodule", "status"],
    validatedWorkspacePath,
  );

  /* c8 ignore start - Git command failures (various error conditions) */
  if (!result.success) {
    // SECURITY: Log unexpected errors (except ENOENT for non-git directories)
    const errorCode = (result.error as NodeJS.ErrnoException).code;
    if (errorCode !== "ENOENT" && errorCode !== undefined) {
      securityLogger.logValidationFailure(
        "submoduleList",
        `Failed to list submodules: ${errorCode}`,
      );
    }
    return undefined;
  }
  /* c8 ignore stop */

  const submodules: Submodule[] = [];
  let isComplete = true;

  for (const line of result.stdout.split("\n")) {
    if (line.trim() === "") {
      continue;
    }
    const entry = parseSubmoduleEntry(line, validatedWorkspacePath);
    if (entry.kind === "submodule") {
      submodules.push(entry.submodule);
    } else if (entry.kind === "unreadable") {
      isComplete = false;
    }
  }

  return { submodules, isComplete };
}

/** Submodules found, and whether every listing succeeded */
export interface SubmoduleCollection {
  readonly submodules: Submodule[];
  /** False when the repository or a submodule could not be listed */
  readonly isComplete: boolean;
}

/**
 * List the initialized submodules (`git submodule status`, paths validated)
 * recursively up to a depth, and tell whether a listing failed on the way.
 *
 * SECURITY: Enforces maximum depth limit to prevent DoS attacks
 * through deeply nested submodules.
 *
 * @param workspacePath - Path to the repository root
 * @param maxDepth - Maximum recursion depth (clamped to MAX_SUBMODULE_DEPTH)
 * @param currentDepth - Current recursion depth (internal use)
 */
export async function collectSubmodules(
  workspacePath: string,
  maxDepth: number = 1,
  currentDepth: number = 0,
): Promise<SubmoduleCollection> {
  // SECURITY: Enforce maximum depth limit to prevent DoS
  // Clamp maxDepth to valid range [0, MAX_SUBMODULE_DEPTH]
  const effectiveMaxDepth = Math.min(
    Math.max(0, maxDepth),
    MAX_SUBMODULE_DEPTH,
  );

  /* c8 ignore start - Depth validation warnings (edge cases) */
  // Log warning on first call if requested depth is outside valid range
  if (currentDepth === 0) {
    if (maxDepth > MAX_SUBMODULE_DEPTH) {
      securityLogger.logValidationFailure(
        "submoduleDepth",
        `Requested depth ${maxDepth} exceeds maximum allowed (${MAX_SUBMODULE_DEPTH}), clamped to ${effectiveMaxDepth}`,
        maxDepth,
      );
    } else if (maxDepth < 0) {
      securityLogger.logValidationFailure(
        "submoduleDepth",
        `Requested depth ${maxDepth} is negative, clamped to ${effectiveMaxDepth}`,
        maxDepth,
      );
    }
  }
  /* c8 ignore stop */

  if (currentDepth >= effectiveMaxDepth) {
    return { submodules: [], isComplete: true };
  }

  const listed = await readSubmodules(workspacePath);
  if (listed === undefined) {
    return { submodules: [], isComplete: false };
  }
  const { submodules } = listed;

  // Sibling submodules are independent, so their nested lists are fetched concurrently.
  // Promise.all keeps the results in submodule order.
  const nested = await Promise.all(
    submodules.map((submodule) =>
      collectSubmodules(submodule.absolutePath, effectiveMaxDepth, currentDepth + 1),
    ),
  );

  return {
    submodules: [...submodules, ...nested.flatMap((collection) => collection.submodules)],
    isComplete: listed.isComplete && nested.every((collection) => collection.isComplete),
  };
}

type SubmoduleApplyResult = ApplyResult | { readonly result: "error" };

/** Apply to one submodule; an exception (e.g. from the record store) is a failure */
async function applyToSubmodule(
  submodule: Submodule,
  userName: string,
  userEmail: string,
  next: SigningSpec | undefined,
  store: SigningRecordStore,
  createPort: (repositoryPath: string) => LocalGitConfigPort,
): Promise<SubmoduleApplyResult> {
  try {
    return await applyIdentityToRepository(
      createPort(submodule.absolutePath),
      store,
      submodule.absolutePath,
      userName,
      userEmail,
      next,
    );
  } catch {
    return { result: "error" };
  }
}

function describeFailure(result: Exclude<SubmoduleApplyResult, { result: "ok" }>): string {
  switch (result.result) {
    case "error": {
      return "unexpected error";
    }
    case "failed": {
      return `write failed, rolled back: ${result.isRolledBack}`;
    }
    default: {
      return `${result.reason}, nothing changed`;
    }
  }
}

/**
 * Apply an identity to each submodule
 *
 * Submodules are applied one at a time: they share the record store, and a
 * failure is rolled back within that submodule only. A failed submodule
 * (including one whose record store threw) is counted and the others are
 * still applied.
 *
 * @param createPort - Creates the git config port of a submodule (a fake in tests)
 * @sideeffect Writes `--local` git config in each submodule and the record store
 */
export async function setIdentityForSubmodules(
  submodules: readonly Submodule[],
  userName: string,
  userEmail: string,
  next: SigningSpec | undefined,
  store: SigningRecordStore,
  createPort: (repositoryPath: string) => LocalGitConfigPort = createLocalGitConfigPort,
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const submodule of submodules) {
    const result = await applyToSubmodule(submodule, userName, userEmail, next, store, createPort);
    if (result.result === "ok") {
      success++;
    } else {
      failed++;
      // Log through the security logger (sanitizes the path)
      securityLogger.logValidationFailure(
        `submoduleGitConfig.${("key" in result ? result.key : undefined) ?? "signingRecords"}`,
        `Failed to apply identity to submodule (${describeFailure(result)})`,
        submodule.absolutePath,
      );
    }
  }

  return { success, failed };
}

/**
 * Check if submodule support is enabled in settings
 * Returns true by default if VS Code API is not available (for testing)
 */
export function isSubmoduleSupportEnabled(): boolean {
  const workspace = getWorkspace();
  if (!workspace) {
    return true; // Default to enabled for testing
  }
  const config = workspace.getConfiguration("gitIdSwitcher");
  return config.get<boolean>("applyToSubmodules", true);
}

/**
 * Get configured submodule depth
 *
 * SECURITY: Returns value clamped to MAX_SUBMODULE_DEPTH (5) to prevent DoS.
 * Invalid or negative values default to 1.
 * Returns 1 if VS Code API is not available (for testing).
 */
export function getSubmoduleDepth(): number {
  const workspace = getWorkspace();
  if (!workspace) {
    return 1; // Default depth for testing
  }
  const config = workspace.getConfiguration("gitIdSwitcher");
  const configuredDepth = config.get<number>("submoduleDepth", 1);

  // SECURITY: The type parameter is not checked at runtime. A non-integer value
  // would make the clamp below NaN and disable the depth limit, so fall back to
  // the default instead.
  const depth = Number.isSafeInteger(configuredDepth) ? configuredDepth : 1;

  // SECURITY: Clamp to valid range [0, MAX_SUBMODULE_DEPTH]
  const clampedDepth = Math.min(Math.max(0, depth), MAX_SUBMODULE_DEPTH);

  /* c8 ignore start - Depth clamping validation logging (edge case) */
  // Log if configured value was outside valid range
  if (configuredDepth !== clampedDepth) {
    securityLogger.logValidationFailure(
      "submoduleDepth",
      `Configured depth ${configuredDepth} clamped to ${clampedDepth} (max: ${MAX_SUBMODULE_DEPTH})`,
      configuredDepth,
    );
  }
  /* c8 ignore stop */

  return clampedDepth;
}

/**
 * Get the maximum allowed submodule depth (currently 5)
 * Exposed for testing and documentation purposes.
 */
export function getMaxSubmoduleDepth(): number {
  return MAX_SUBMODULE_DEPTH;
}

/**
 * Test-only exports for private validation helpers.
 */
export const __testExports = {
  getWorkspaceValidationFailureReason,
  isValidCommitHash,
  parseSubmoduleEntry,
  stripBranchSuffix,
};
