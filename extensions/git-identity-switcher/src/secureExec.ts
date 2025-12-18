/**
 * Secure Command Execution Utilities
 *
 * Uses execFile() instead of exec() to prevent command injection.
 * All arguments are passed as arrays, never string-interpolated.
 * Integrates with command allowlist for defense-in-depth.
 *
 * @see https://owasp.org/www-community/attacks/Command_Injection
 * @see https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { isCommandAllowed } from './commandAllowlist';

const execFilePromise = promisify(execFile);

export interface ExecOptions {
  cwd?: string;
  timeout?: number;
  maxBuffer?: number;
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
 *
 * @param command - The command to execute (must be in PATH or absolute)
 * @param args - Array of arguments (never concatenate user input)
 * @param options - Execution options (cwd, timeout, maxBuffer)
 * @throws Error if command execution fails or command not in allowlist
 */
export async function secureExec(
  command: string,
  args: string[],
  options: ExecOptions = {}
): Promise<ExecResult> {
  // Defense-in-depth: Check command allowlist
  const allowlistCheck = isCommandAllowed(command, args);
  if (!allowlistCheck.allowed) {
    const error = new Error(`Command blocked: ${allowlistCheck.reason}`);
    console.error(`[Security] ${error.message}`);
    throw error;
  }

  const defaultOptions = {
    timeout: 30000, // 30 second timeout
    maxBuffer: 1024 * 1024, // 1MB buffer
    ...options,
  };

  const { stdout, stderr } = await execFilePromise(command, args, defaultOptions);

  return { stdout, stderr };
}

/**
 * Git command wrapper
 *
 * Executes git commands securely with proper argument handling.
 *
 * @param args - Git subcommand and arguments as array
 * @param cwd - Working directory (optional, defaults to current)
 * @returns Trimmed stdout output
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
    // Git command failed (e.g., config not set, not a repo)
    // Return empty string for backwards compatibility
    return '';
  }
}

/**
 * SSH-add command wrapper
 *
 * Executes ssh-add commands securely.
 *
 * @param args - SSH-add arguments as array
 * @returns Full result with stdout and stderr
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
 *
 * @param args - SSH-keygen arguments as array
 * @returns Full result with stdout and stderr
 *
 * @example
 * // Get key fingerprint
 * const result = await sshKeygenExec(['-lf', keyPath]);
 */
export async function sshKeygenExec(args: string[]): Promise<ExecResult> {
  return secureExec('ssh-keygen', args);
}
