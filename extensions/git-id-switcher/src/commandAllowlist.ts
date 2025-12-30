/**
 * Command Allowlist for Defense-in-Depth Security
 *
 * Defines which commands and subcommands are permitted.
 * Unknown commands are rejected even if using secureExec.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

import { isSecurePath, isPathArgument } from './pathSecurity';
import { validateCombinedFlags } from './flagValidator';

// Re-export for backwards compatibility
export { isSecurePath, isPathArgument, SecurePathResult } from './pathSecurity';
export { validateCombinedFlags, CombinedFlagResult } from './flagValidator';

/**
 * Security constants for argument validation
 */
const MAX_ARGS_COUNT = 20;
const MAX_ARG_LENGTH = 256;

/**
 * Subcommand configuration
 */
interface SubcommandConfig {
  allowed: boolean;
  allowedArgs?: readonly string[];
  description?: string;
  /**
   * List of arguments that expect a user-supplied value immediately following them.
   * Only the value strictly following one of these arguments will be allowed as an arbitrary string.
   * Example: ['user.name'] allows 'user.name "John Doe"'.
   */
  allowedOptionsWithValues?: readonly string[];
  /**
   * Whether to allow arbitrary positional arguments (use sparingly!).
   */
  allowAnyPositional?: boolean;
  /**
   * Whether to allow path-like positional arguments only.
   * More restrictive than allowAnyPositional - only allows paths (starting with /, ~, ., or containing /).
   * Useful for commands like 'git submodule status <path>'.
   */
  allowPathPositionals?: boolean;
}

/**
 * Command configuration
 */
interface CommandConfig {
  allowed: boolean;
  description: string;
  subcommands?: Record<string, SubcommandConfig>;
  allowedArgs?: readonly string[];
  /**
   * List of arguments that expect a user-supplied value immediately following them.
   */
  allowedOptionsWithValues?: readonly string[];
  /**
   * Whether to allow arbitrary positional arguments.
   */
  allowAnyPositional?: boolean;
  /**
   * Whether to allow path-like positional arguments only.
   * More restrictive than allowAnyPositional - only allows paths (starting with /, ~, ., or containing /).
   */
  allowPathPositionals?: boolean;
}

/**
 * Allowlist of permitted commands
 */
export const ALLOWED_COMMANDS: Record<string, CommandConfig> = {
  git: {
    allowed: true,
    description: 'Git version control',
    subcommands: {
      '--version': { allowed: true, description: 'Check git version' },
      config: {
        allowed: true,
        description: 'Git configuration',
        // STRICT: Only allow values for specific config keys
        allowAnyPositional: false,
        allowedArgs: [
          '--local',
          '--global',
          'user.name',
          'user.email',
          'user.signingkey',
          'commit.gpgsign',
        ],
        allowedOptionsWithValues: [
          'user.name',
          'user.email',
          'user.signingkey',
          'commit.gpgsign',
        ],
      },
      'rev-parse': {
        allowed: true,
        description: 'Git repository detection',
        allowedArgs: ['--is-inside-work-tree', '--show-toplevel', '--git-dir'],
      },
      submodule: {
        allowed: true,
        description: 'Submodule operations',
        // Only 'status' subcommand is allowed, with optional path arguments
        // Using allowPathPositionals instead of allowAnyPositional to prevent
        // dangerous subcommands like 'update', 'init', 'add' from being allowed
        allowPathPositionals: true,
        allowedArgs: ['status', '--recursive'],
      },
    },
  },
  'ssh-add': {
    allowed: true,
    description: 'SSH agent key management',
    // ssh-add takes key paths directly as positional args
    allowAnyPositional: true,
    allowedArgs: ['-l', '-d', '-D', '--apple-use-keychain'],
  },
  'ssh-keygen': {
    allowed: true,
    description: 'SSH key operations (read-only)',
    allowedArgs: ['-lf', '-l', '-f'],
    // -f takes a filename argument, and -lf implies -f
    allowedOptionsWithValues: ['-f', '-lf'],
  },
};

/**
 * Result of command allowlist check
 */
export interface AllowlistCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a command is in the allowlist
 */
export function isCommandAllowed(command: string, args: string[]): AllowlistCheckResult {
  const commandConfig = ALLOWED_COMMANDS[command];

  if (!commandConfig) {
    return { allowed: false, reason: `Command '${command}' is not in the allowlist` };
  }

  if (!commandConfig.allowed) {
    return { allowed: false, reason: `Command '${command}' is explicitly disabled` };
  }

  if (args.length === 0) {
    return { allowed: true };
  }

  if (args.length > MAX_ARGS_COUNT) {
    return { allowed: false, reason: 'Too many arguments' };
  }

  let currentConfig: CommandConfig | SubcommandConfig = commandConfig;
  let argsToValidate = args;

  // Check subcommands if defined
  if (commandConfig.subcommands) {
    const subcommand = args[0];
    const subConfig = commandConfig.subcommands[subcommand];

    if (subConfig) {
      if (!subConfig.allowed) {
        return { allowed: false, reason: `Subcommand '${command} ${subcommand}' is disabled` };
      }
      currentConfig = subConfig;
      argsToValidate = args.slice(1);
    } else if (command === 'git') {
      // Git requires valid subcommand
      return { allowed: false, reason: `Git subcommand '${subcommand}' is not in the allowlist` };
    }
  }

  // Validate arguments
  const allowedArgs = currentConfig.allowedArgs || [];
  const allowAnyPositional = currentConfig.allowAnyPositional || false;
  const allowPathPositionals = currentConfig.allowPathPositionals || false;
  const allowedOptionsWithValues = currentConfig.allowedOptionsWithValues || [];

  for (let i = 0; i < argsToValidate.length; i++) {
    const arg = argsToValidate[i];

    // Length check
    if (!isPathArgument(arg) && arg.length > MAX_ARG_LENGTH) {
      return { allowed: false, reason: 'Argument exceeds maximum length' };
    }

    // Path Safety Check (Always run if it looks like a path)
    // Note: Also check args containing '/' for relative paths like 'path/to/submodule'
    const looksLikePathForSecurity = isPathArgument(arg) || arg.includes('/');
    if (looksLikePathForSecurity) {
      const pathResult = isSecurePath(arg);
      if (!pathResult.valid) {
        return { allowed: false, reason: `Path argument rejected: ${pathResult.reason}` };
      }
    }

    // 1. Is this argument a value for a previous option?
    // Check previous argument ONLY if there is one
    if (i > 0) {
      const prevArg = argsToValidate[i - 1];
      if (allowedOptionsWithValues.includes(prevArg)) {
        // Security: Even if it's a value, reject it if it looks like a flag
        // This prevents confusion and potential flag injection if the parser is loose
        if (arg.startsWith('-')) {
          return { allowed: false, reason: `Value for '${prevArg}' cannot mean a flag ('${arg}')` };
        }
        
        // This arg is a value for a permitted option (e.g. "user.name" -> "John")
        // It is allowed regardless of content (as long as path checks passed above)
        continue;
      }
    }

    // 2. Exact Match Allowlist (Flags or fixed positionals)
    if (allowedArgs.includes(arg)) {
      continue;
    }

    // 3. Strict Flag Validation
    // If it looks like a flag (starts with -), it MUST be explicitly allowed or a valid combined flag.
    // We do NOT allow flags to fall through to allowAnyPositional.
    if (arg.startsWith('-')) {
      // Check for combined flags (only if it's not a long option --)
      if (!arg.startsWith('--') && arg.length > 2) {
        const flagResult = validateCombinedFlags(arg, command, allowedArgs);
        if (flagResult.valid) {
          continue;
        }
        return { allowed: false, reason: flagResult.reason || 'Invalid combined flag' };
      }

      // If we are here, it's a flag (short or long) that is NOT in allowedArgs
      // and NOT a valid combined flag. reject it.
      return { allowed: false, reason: `Flag '${arg}' is not allowed for this command` };
    }

    // 4. Fallback: arbitrary positionals allowed?
    if (allowAnyPositional) {
      // It's a non-flag positional argument (e.g. "John Doe", "email@example.com", "/path/to/key")
      // Allowed by allowAnyPositional=true
      // NOTE: Flags (starting with -) are already handled/rejected in Step 3.
      continue;
    }

    // 5. Path-only positionals allowed?
    if (allowPathPositionals && looksLikePathForSecurity) {
      // Path-like arguments are allowed (already validated by isSecurePath above)
      // This prevents non-path strings like 'update', 'init', 'add' from being allowed
      continue;
    }

    return { allowed: false, reason: `Argument '${arg}' is not allowed for this command` };
  }

  return { allowed: true };
}
