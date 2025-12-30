/**
 * Secure Command Execution Utilities
 *
 * Uses execFile() instead of exec() to prevent command injection.
 * All arguments are passed as arrays, never string-interpolated.
 * Integrates with command allowlist for defense-in-depth.
 *
 * Features:
 * - Command-specific timeouts (git: 10s, ssh-add: 5s, ssh-keygen: 5s)
 * - Custom TimeoutError class for better error handling
 * - Security logging for timeout events
 *
 * @see https://owasp.org/www-community/attacks/Command_Injection
 * @see https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback
 */

import { execFile, ExecFileException } from 'child_process';
import { promisify } from 'util';
import { isCommandAllowed } from './commandAllowlist';
import { securityLogger, type ISecurityLogger } from './securityLogger';
import { getWorkspace } from './vscodeLoader';

const execFilePromise = promisify(execFile);

/**
 * Command-specific timeout values in milliseconds
 *
 * These values are tuned based on typical execution times:
 * - git: Most operations complete quickly, but some (e.g., network) need more time
 * - ssh-add: Key operations are fast, timeout mainly for passphrase prompts
 * - ssh-keygen: Fingerprint operations are very fast
 *
 * Exported for testing purposes.
 */
export const COMMAND_TIMEOUTS: Readonly<Record<string, number>> = {
  git: 10000, // 10 seconds
  'ssh-add': 5000, // 5 seconds
  'ssh-keygen': 5000, // 5 seconds
} as const;

/**
 * Default timeout for commands not in COMMAND_TIMEOUTS map
 * Exported for testing purposes.
 */
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Custom error class for timeout errors
 *
 * Provides clear distinction between timeout errors and other execution errors.
 * Includes command details for debugging and logging purposes.
 *
 * Security: Args are stored but should be sanitized before logging externally.
 * The error message intentionally does not include args to prevent leakage.
 *
 * @example
 * try {
 *   await secureExec('git', ['status']);
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.log(`Command ${error.command} timed out after ${error.timeoutMs}ms`);
 *   }
 * }
 */
export class TimeoutError extends Error {
  public readonly command: string;
  public readonly args: readonly string[];
  public readonly timeoutMs: number;
  public readonly isTimeout = true;
  /** Error code for programmatic identification */
  public readonly code = 'ETIMEDOUT';

  constructor(command: string, args: string[], timeoutMs: number) {
    super(
      `Command '${command}' timed out after ${timeoutMs}ms`
    );
    this.name = 'TimeoutError';
    this.command = command;
    // Store a frozen copy to prevent mutation
    this.args = Object.freeze([...args]);
    this.timeoutMs = timeoutMs;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}

/**
 * Timeout limits for validation
 */
const TIMEOUT_LIMITS = {
  MIN: 1000, // 1 second minimum
  MAX: 300000, // 5 minutes maximum
} as const;

/**
 * Security limits for command name validation
 */
const COMMAND_NAME_LIMITS = {
  MAX_LENGTH: 64, // Maximum command name length (DoS protection)
  MAX_ENTRIES: 100, // Maximum number of timeout entries (DoS protection)
} as const;

/**
 * Validate command name for security
 *
 * @param cmd - Command name to validate
 * @returns true if command name is valid
 */
function isValidCommandName(cmd: string): boolean {
  // Check for null/undefined/empty
  if (!cmd || typeof cmd !== 'string' || cmd.length === 0) {
    return false;
  }

  // DoS protection: limit length
  if (cmd.length > COMMAND_NAME_LIMITS.MAX_LENGTH) {
    return false;
  }

  // SECURITY: Only allow ASCII alphanumeric, hyphen, underscore, and dot
  // This prevents injection attacks via command names
  // Valid characters: a-z, A-Z, 0-9, -, _, .
  const validCommandNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!validCommandNameRegex.test(cmd)) {
    return false;
  }

  // SECURITY: Reject command names that start with special characters
  // (even though regex should catch this, defensive check)
  if (cmd.startsWith('.') || cmd.startsWith('-') || cmd.startsWith('_')) {
    return false;
  }

  return true;
}

/**
 * Get user-configured command timeouts from VS Code settings
 *
 * SECURITY: Validates all user-provided values to prevent:
 * - DoS attacks (too many entries, invalid values)
 * - Injection attacks (malicious command names)
 * - Resource exhaustion (NaN, Infinity, extreme values)
 *
 * PERFORMANCE: This function is called on every command execution.
 * VS Code's getConfiguration() is lightweight, so caching is not necessary.
 * If performance becomes an issue, consider caching with config change detection.
 *
 * @returns User-configured timeouts or empty object
 */
function getUserConfiguredTimeouts(): Record<string, number> {
  try {
    const workspace = getWorkspace();
    if (!workspace) {
      // VS Code API not available (e.g., in tests)
      return {};
    }
    const config = workspace.getConfiguration('gitIdSwitcher');
    const userTimeouts = config.get<Record<string, number>>('commandTimeouts', {});

    // SECURITY: Limit number of entries to prevent DoS
    const entries = Object.entries(userTimeouts);
    if (entries.length > COMMAND_NAME_LIMITS.MAX_ENTRIES) {
      // Log but don't throw - just use first MAX_ENTRIES
      // SECURITY: Use securityLogger if available, otherwise console.warn
      try {
        securityLogger.logValidationFailure(
          'commandTimeouts',
          `Too many timeout entries (${entries.length}), limiting to ${COMMAND_NAME_LIMITS.MAX_ENTRIES}`,
          entries.length
        );
      } catch {
        // Fallback to console if logger not available
        console.warn(
          `[Security] Too many timeout entries (${entries.length}), limiting to ${COMMAND_NAME_LIMITS.MAX_ENTRIES}`
        );
      }
    }

    // Validate and sanitize user-provided values
    const sanitized: Record<string, number> = {};
    let count = 0;
    for (const [cmd, timeout] of entries) {
      // DoS protection: limit number of entries processed
      if (count >= COMMAND_NAME_LIMITS.MAX_ENTRIES) {
        break;
      }

      // SECURITY: Validate command name
      if (!isValidCommandName(cmd)) {
        // Skip invalid command names (log for debugging)
        try {
          securityLogger.logValidationFailure(
            'commandTimeouts',
            'Invalid command name in timeout config',
            cmd
          );
        } catch {
          console.warn(`[Security] Invalid command name in timeout config: ${cmd}`);
        }
        continue;
      }

      // SECURITY: Validate timeout value
      if (
        typeof timeout !== 'number' ||
        !Number.isFinite(timeout) || // Rejects NaN and Infinity
        timeout < TIMEOUT_LIMITS.MIN ||
        timeout > TIMEOUT_LIMITS.MAX
      ) {
        // Skip invalid timeout values (log for debugging)
        try {
          securityLogger.logValidationFailure(
            'commandTimeouts',
            `Invalid timeout value (must be ${TIMEOUT_LIMITS.MIN}-${TIMEOUT_LIMITS.MAX}ms)`,
            { command: cmd, timeout }
          );
        } catch {
          console.warn(
            `[Security] Invalid timeout value for command '${cmd}': ${timeout} (must be ${TIMEOUT_LIMITS.MIN}-${TIMEOUT_LIMITS.MAX}ms)`
          );
        }
        continue;
      }

      // SECURITY: Ensure timeout is an integer (prevent precision attacks)
      const timeoutInt = Math.floor(timeout);
      if (timeoutInt !== timeout) {
        // Round to nearest integer (log for debugging)
        try {
          securityLogger.logValidationFailure(
            'commandTimeouts',
            'Timeout value is not an integer, rounding',
            { command: cmd, original: timeout, rounded: timeoutInt }
          );
        } catch {
          console.warn(
            `[Security] Timeout value for command '${cmd}' is not an integer, rounding: ${timeout} -> ${timeoutInt}`
          );
        }
      }

      sanitized[cmd] = timeoutInt;
      count++;
    }
    return sanitized;
  } catch {
    // VS Code API not available (e.g., in tests)
    return {};
  }
}

/**
 * Get the appropriate timeout for a command
 *
 * Priority order:
 * 1. Function argument override (if > 0 and valid)
 * 2. User-configured timeout from VS Code settings
 * 3. Built-in command-specific timeout from COMMAND_TIMEOUTS map
 * 4. DEFAULT_TIMEOUT (30 seconds)
 *
 * Note: An override of 0 or negative is treated as "use default" behavior.
 * This prevents accidentally disabling timeouts entirely.
 *
 * SECURITY: All timeout values are validated to prevent:
 * - NaN and Infinity values
 * - Values outside acceptable range
 * - Non-integer values (rounded)
 *
 * @param command - The command to get timeout for
 * @param overrideTimeout - Optional override from ExecOptions (must be > 0 to be used)
 * @returns Timeout in milliseconds (always positive and finite)
 */
export function getCommandTimeout(
  command: string,
  overrideTimeout?: number
): number {
  // SECURITY: Validate override timeout if provided
  if (overrideTimeout !== undefined) {
    // Check for positive value
    if (overrideTimeout > 0) {
      // SECURITY: Validate that timeout is finite (rejects NaN and Infinity)
      if (!Number.isFinite(overrideTimeout)) {
        // Log validation failure (use securityLogger if available)
        try {
          securityLogger.logValidationFailure(
            'commandTimeout',
            'Invalid override timeout (not finite)',
            overrideTimeout
          );
        } catch {
          console.warn(
            `[Security] Invalid override timeout (${overrideTimeout}), using default`
          );
        }
        // Fall through to default behavior
      } else {
        // SECURITY: Validate range
        if (
          overrideTimeout >= TIMEOUT_LIMITS.MIN &&
          overrideTimeout <= TIMEOUT_LIMITS.MAX
        ) {
          // SECURITY: Ensure integer (prevent precision attacks)
          return Math.floor(overrideTimeout);
        } else {
          // Log validation failure (use securityLogger if available)
          try {
            securityLogger.logValidationFailure(
              'commandTimeout',
              `Override timeout out of range (must be ${TIMEOUT_LIMITS.MIN}-${TIMEOUT_LIMITS.MAX}ms)`,
              overrideTimeout
            );
          } catch {
            console.warn(
              `[Security] Override timeout (${overrideTimeout}) out of range, using default`
            );
          }
          // Fall through to default behavior
        }
      }
    }
    // If overrideTimeout is 0 or negative, fall through to default behavior
  }

  // Check user-configured timeouts from VS Code settings
  const userTimeouts = getUserConfiguredTimeouts();
  if (userTimeouts[command] !== undefined) {
    // User timeouts are already validated in getUserConfiguredTimeouts()
    return userTimeouts[command];
  }

  // Fall back to built-in command-specific timeout
  return COMMAND_TIMEOUTS[command] ?? DEFAULT_TIMEOUT;
}

/**
 * Check if an error is a timeout error (from execFile or our TimeoutError)
 *
 * Detects both:
 * - Our custom TimeoutError class
 * - Node.js execFile timeout errors (killed=true, signal=SIGTERM)
 *
 * SECURITY: Validates error structure to prevent false positives.
 * Only accepts errors that definitively indicate a timeout.
 *
 * @param error - The error to check
 * @returns true if the error indicates a timeout occurred
 */
function isTimeoutError(error: unknown): error is TimeoutError | ExecFileException {
  // Our custom TimeoutError
  if (error instanceof TimeoutError) {
    return true;
  }

  // Node.js execFile timeout error
  // When execFile times out, it kills the process with SIGTERM
  // SECURITY: Must check both killed and signal to prevent false positives
  if (error instanceof Error) {
    const execError = error as ExecFileException;
    // SECURITY: Both conditions must be true for timeout detection
    // killed=true alone is not sufficient (could be manual kill)
    // signal='SIGTERM' alone is not sufficient (could be other signal)
    // Only accept if both are present and match timeout pattern
    if (
      execError.killed === true &&
      execError.signal === 'SIGTERM'
    ) {
      return true;
    }
  }

  return false;
}

export interface ExecOptions {
  cwd?: string;
  timeout?: number;
  maxBuffer?: number;
  /** Optional logger for dependency injection (defaults to securityLogger) */
  logger?: ISecurityLogger;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
}

/**
 * Secure command execution using execFile
 *
 * Security guarantees:
 * - No shell interpretation (shell metacharacters are treated as literals)
 * - Arguments are passed directly to the process
 * - Command injection is not possible
 * - Commands are validated against allowlist (defense-in-depth)
 * - Command-specific timeouts prevent resource exhaustion
 *
 * @param command - The command to execute (must be in PATH or absolute)
 * @param args - Array of arguments (never concatenate user input)
 * @param options - Execution options (cwd, timeout, maxBuffer)
 * @throws TimeoutError if command execution times out
 * @throws Error if command execution fails or command not in allowlist
 */
export async function secureExec(
  command: string,
  args: string[],
  options: ExecOptions = {}
): Promise<ExecResult> {
  // Use injected logger or default to securityLogger singleton
  const logger = options.logger ?? securityLogger;

  // Defense-in-depth: Check command allowlist
  const allowlistCheck = isCommandAllowed(command, args);
  if (!allowlistCheck.allowed) {
    const error = new Error(`Command blocked: ${allowlistCheck.reason}`);
    console.error(`[Security] ${error.message}`);
    throw error;
  }

  // Get command-specific timeout (user override takes precedence)
  const timeout = getCommandTimeout(command, options.timeout);

  const execOptions = {
    timeout,
    maxBuffer: options.maxBuffer ?? 1024 * 1024, // 1MB buffer
    cwd: options.cwd,
  };

  try {
    const { stdout, stderr } = await execFilePromise(command, args, execOptions);
    return { stdout, stderr };
  } catch (error: unknown) {
    // Handle timeout errors specifically
    if (isTimeoutError(error)) {
      // SECURITY: Log timeout event for debugging and audit trail
      // This helps identify performance issues and potential DoS attacks
      logger.logCommandTimeout(command, args, timeout, options.cwd);

      // SECURITY: Throw our custom TimeoutError for better handling upstream
      // Note: We create a new TimeoutError rather than re-throwing the original
      // because the original error may contain sensitive information in its
      // message or stack trace. Our TimeoutError is sanitized.
      throw new TimeoutError(command, args, timeout);
    }

    // SECURITY: Re-throw other errors as-is
    // These are typically command execution failures (e.g., command not found,
    // permission denied, etc.) and should be handled by the caller.
    // We don't log them here to avoid information leakage.
    throw error;
  }
}

/**
 * Git command wrapper
 *
 * Executes git commands securely with proper argument handling.
 * Uses command-specific timeout (10 seconds for git).
 *
 * @param args - Git subcommand and arguments as array
 * @param cwd - Working directory (optional, defaults to current)
 * @returns Trimmed stdout output, empty string on error (including timeout)
 *
 * @example
 * // Get config value
 * const name = await gitExec(['config', 'user.name'], '/path/to/repo');
 *
 * // Set config value (safe even with special characters)
 * await gitExec(['config', '--local', 'user.name', 'Name with "quotes"'], cwd);
 */
export async function gitExec(args: string[], cwd?: string): Promise<string> {
  try {
    const { stdout } = await secureExec('git', args, { cwd });
    return stdout.trim();
  } catch (error) {
    // Git command failed (e.g., config not set, not a repo, timeout)
    // Timeout errors are already logged by secureExec
    // Return empty string for backwards compatibility
    return '';
  }
}

/**
 * SSH-add command wrapper
 *
 * Executes ssh-add commands securely.
 * Uses command-specific timeout (5 seconds for ssh-add).
 *
 * @param args - SSH-add arguments as array
 * @returns Full result with stdout and stderr
 * @throws TimeoutError if command times out (5 seconds)
 *
 * @example
 * // List keys
 * const result = await sshAgentExec(['-l']);
 *
 * // Add key (path is safe even with spaces/special chars)
 * await sshAgentExec(['/path/to/key with spaces']);
 * await sshAgentExec(['--apple-use-keychain', keyPath]);
 */
export async function sshAgentExec(args: string[]): Promise<ExecResult> {
  return secureExec('ssh-add', args);
}

/**
 * SSH-keygen command wrapper
 *
 * Executes ssh-keygen commands securely (read-only operations).
 * Uses command-specific timeout (5 seconds for ssh-keygen).
 *
 * @param args - SSH-keygen arguments as array
 * @returns Full result with stdout and stderr
 * @throws TimeoutError if command times out (5 seconds)
 *
 * @example
 * // Get key fingerprint
 * const result = await sshKeygenExec(['-lf', keyPath]);
 */
export async function sshKeygenExec(args: string[]): Promise<ExecResult> {
  return secureExec('ssh-keygen', args);
}
