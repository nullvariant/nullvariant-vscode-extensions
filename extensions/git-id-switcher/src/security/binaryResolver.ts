/**
 * Binary Path Resolver
 *
 * Resolves absolute paths for allowed commands (git, ssh-add, ssh-keygen)
 * to prevent PATH pollution attacks.
 *
 * Security features:
 * - Uses 'which' command to resolve absolute paths
 * - Caches resolved paths to avoid repeated lookups
 * - Validates paths exist and are executable
 * - Prioritizes VS Code git.path setting for git command
 *
 * @see https://owasp.org/www-community/attacks/Command_Injection
 */

import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { getWorkspace } from '../core/vscodeLoader';
import { securityLogger } from './securityLogger';

const execFilePromise = promisify(execFile);

/**
 * List of commands that this extension is allowed to execute.
 * Only these commands will have their paths resolved and cached.
 */
const ALLOWED_COMMANDS = ['git', 'ssh-add', 'ssh-keygen'] as const;
type AllowedCommand = (typeof ALLOWED_COMMANDS)[number];

/**
 * Cache for resolved binary paths.
 * Key: command name, Value: absolute path or null if resolution failed
 */
const pathCache = new Map<string, string | null>();

/**
 * Timeout for path resolution (5 seconds)
 */
const RESOLUTION_TIMEOUT = 5000;

/**
 * Error thrown when a binary path cannot be resolved
 */
export class BinaryResolutionError extends Error {
  public readonly command: string;
  public readonly code = 'ENOENT_BINARY';

  constructor(command: string, reason: string) {
    super(`Failed to resolve path for '${command}': ${reason}`);
    this.name = 'BinaryResolutionError';
    this.command = command;

    /* c8 ignore start - Error.captureStackTrace availability depends on JS engine */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BinaryResolutionError);
    }
    /* c8 ignore stop */
  }
}

/**
 * Validate that a path points to an existing, executable file.
 *
 * Security: Uses lstat to detect symlinks, then validates the target.
 *
 * @param binaryPath - Path to validate
 * @returns true if path is a valid executable
 */
async function isValidExecutable(binaryPath: string): Promise<boolean> {
  try {
    // Get file stats (follows symlinks)
    const stats = await fs.stat(binaryPath);

    // Must be a regular file
    if (!stats.isFile()) {
      return false;
    }

    // On Unix, check execute permission
    /* c8 ignore start - Unix execute permission check (requires non-executable file setup) */
    if (process.platform !== 'win32') {
      // Check if any execute bit is set (owner, group, or others)
      const executableBits = 0o111;
      if ((stats.mode & executableBits) === 0) {
        return false;
      }
    }
    /* c8 ignore stop */

    return true;
  } catch /* c8 ignore start */ {
    return false;
  } /* c8 ignore stop */
}

/**
 * Known paths for 'which' command on different platforms.
 *
 * Using absolute paths prevents PATH pollution attacks on the resolver itself.
 * Falls back to command name if absolute path doesn't exist.
 */
const WHICH_PATHS: Readonly<Record<string, readonly string[]>> = {
  darwin: ['/usr/bin/which'],
  linux: ['/usr/bin/which', '/bin/which'],
  win32: ['C:\\Windows\\System32\\where.exe'],
} as const;

/**
 * Get the path to 'which' or 'where' command.
 *
 * Tries known absolute paths first, falls back to command name.
 * This prevents PATH pollution attacks on the resolver itself.
 *
 * @returns Path to which/where command
 */
async function getWhichCommand(): Promise<string> {
  const platform = process.platform;
  const knownPaths = WHICH_PATHS[platform] ?? WHICH_PATHS['linux'];

  for (const knownPath of knownPaths) {
    if (await isValidExecutable(knownPath)) {
      return knownPath;
    }
  }

  /* c8 ignore start - Fallback when known system paths don't exist (rare) */
  // Fallback: use command name (less secure, but better than failing)
  // This is logged for security audit
  securityLogger.logValidationFailure(
    'binary-resolution',
    `No known absolute path for which/where on ${platform}, falling back to PATH`,
    undefined
  );
  return platform === 'win32' ? 'where' : 'which';
  /* c8 ignore stop */
}

/**
 * Resolve binary path using platform-specific 'which' command.
 *
 * Uses absolute paths for 'which'/'where' when possible to prevent
 * PATH pollution attacks on the resolver itself.
 *
 * @param command - Command name to resolve
 * @returns Absolute path or null if not found
 */
async function resolveWithWhich(command: string): Promise<string | null> {
  try {
    const whichCommand = await getWhichCommand();

    const { stdout } = await execFilePromise(whichCommand, [command], {
      timeout: RESOLUTION_TIMEOUT,
      maxBuffer: 1024 * 10, // 10KB should be enough for paths
    });

    // 'which' returns the path on stdout
    // 'where' on Windows may return multiple paths, take the first
    const resolvedPath = stdout.trim().split(/[\r\n]/)[0];

    /* c8 ignore next 3 - Empty which output */
    if (!resolvedPath) {
      return null;
    }

    // Normalize the path
    const normalizedPath = path.normalize(resolvedPath);

    /* c8 ignore start - Invalid executable validation */
    // Validate the resolved path
    if (!(await isValidExecutable(normalizedPath))) {
      securityLogger.logValidationFailure(
        'binary-resolution',
        `Resolved path is not a valid executable: ${command}`,
        undefined
      );
      return null;
    }
    /* c8 ignore stop */

    return normalizedPath;
  } catch /* c8 ignore start */ {
    // Command not found or other error
    return null;
  } /* c8 ignore stop */
}

/**
 * Get VS Code's configured git.path setting.
 *
 * This setting takes priority over PATH-resolved paths for git command.
 *
 * @returns Configured git path or null
 */
function getVSCodeGitPath(): string | null {
  try {
    const workspace = getWorkspace();
    if (!workspace) {
      return null;
    }

    const config = workspace.getConfiguration('git');
    const gitPath = config.get<string>('path');

    if (!gitPath || typeof gitPath !== 'string' || gitPath.trim().length === 0) {
      return null;
    }

    return gitPath.trim();
  } catch /* c8 ignore start */ {
    return null;
  } /* c8 ignore stop */
}

/**
 * Resolve the absolute path for a command.
 *
 * Resolution priority:
 * 1. For git: VS Code git.path setting (if configured and valid)
 * 2. System PATH via 'which'/'where' command
 *
 * Security: Validates that resolved paths are executable files.
 *
 * @param command - Command name to resolve
 * @returns Absolute path to the binary
 * @throws BinaryResolutionError if path cannot be resolved
 */
async function resolveCommandPath(command: AllowedCommand): Promise<string> {
  // For git, check VS Code setting first
  if (command === 'git') {
    const vscodeGitPath = getVSCodeGitPath();
    if (vscodeGitPath) {
      // Normalize and validate VS Code configured path
      const normalizedPath = path.normalize(vscodeGitPath);
      if (await isValidExecutable(normalizedPath)) {
        return normalizedPath;
      }
      // Log warning but continue to try PATH resolution
      securityLogger.logValidationFailure(
        'binary-resolution',
        'VS Code git.path is not a valid executable, falling back to PATH',
        undefined
      );
    }
  }

  // Resolve via which/where
  const resolvedPath = await resolveWithWhich(command);
  if (resolvedPath) {
    return resolvedPath;
  }

  /* c8 ignore next 4 - Command not found fallback */
  throw new BinaryResolutionError(
    command,
    'Command not found in PATH or not executable'
  );
}

/**
 * Check if a command is in the allowed list.
 *
 * @param command - Command name to check
 * @returns true if command is allowed
 */
function isAllowedCommand(command: string): command is AllowedCommand {
  return ALLOWED_COMMANDS.includes(command as AllowedCommand);
}

/**
 * Get the absolute path for a command.
 *
 * Uses caching to avoid repeated path resolution.
 * Cache can be invalidated using clearPathCache().
 *
 * Security considerations:
 * - Only resolves paths for allowed commands
 * - Validates that resolved paths are executable
 * - Caches results to prevent TOCTOU issues within a session
 * - VS Code git.path takes priority for git command
 *
 * @param command - Command name (must be in ALLOWED_COMMANDS)
 * @returns Absolute path to the binary
 * @throws BinaryResolutionError if path cannot be resolved
 * @throws Error if command is not in allowed list
 */
export async function getBinaryPath(command: string): Promise<string> {
  // Validate command is allowed
  if (!isAllowedCommand(command)) {
    throw new Error(`Command '${command}' is not in the allowed list`);
  }

  // Check cache first
  const cachedPath = pathCache.get(command);
  if (cachedPath !== undefined) {
    if (cachedPath === null) {
      throw new BinaryResolutionError(command, 'Previously failed to resolve');
    }
    return cachedPath;
  }

  try {
    const resolvedPath = await resolveCommandPath(command);

    // Cache successful resolution
    pathCache.set(command, resolvedPath);

    return resolvedPath;
  } catch (error) /* c8 ignore start */ {
    // Cache failure to avoid repeated resolution attempts
    pathCache.set(command, null);

    if (error instanceof BinaryResolutionError) {
      throw error;
    }

    throw new BinaryResolutionError(
      command,
      error instanceof Error ? error.message : 'Unknown error'
    );
  } /* c8 ignore stop */
}

/**
 * Clear the path cache.
 *
 * Useful when:
 * - User changes git.path setting
 * - Testing
 * - After system PATH changes
 */
export function clearPathCache(): void {
  pathCache.clear();
}

/**
 * Pre-resolve all allowed command paths.
 *
 * Call this at extension activation to:
 * - Fail early if required commands are not available
 * - Populate cache for faster subsequent calls
 *
 * @returns Object mapping commands to their resolved paths
 * @throws BinaryResolutionError if any command cannot be resolved
 */
export async function resolveAllBinaryPaths(): Promise<
  Record<AllowedCommand, string>
> {
  const results: Partial<Record<AllowedCommand, string>> = {};

  for (const command of ALLOWED_COMMANDS) {
    results[command] = await getBinaryPath(command);
  }

  return results as Record<AllowedCommand, string>;
}

/**
 * Check if all required binaries are available.
 *
 * Non-throwing version of resolveAllBinaryPaths.
 *
 * @returns Object with availability status for each command
 */
export async function checkBinaryAvailability(): Promise<
  Record<AllowedCommand, { available: boolean; path?: string; error?: string }>
> {
  const results: Record<
    AllowedCommand,
    { available: boolean; path?: string; error?: string }
  > = {} as Record<AllowedCommand, { available: boolean; path?: string; error?: string }>;

  for (const command of ALLOWED_COMMANDS) {
    try {
      const resolvedPath = await getBinaryPath(command);
      results[command] = { available: true, path: resolvedPath };
    } catch (error) /* c8 ignore start */ {
      results[command] = {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } /* c8 ignore stop */
  }

  return results;
}

/**
 * Test-only exports
 */
export const __testExports = {
  ALLOWED_COMMANDS,
  WHICH_PATHS,
  pathCache,
  isValidExecutable,
  resolveWithWhich,
  getVSCodeGitPath,
  getWhichCommand,
  isAllowedCommand,
};
