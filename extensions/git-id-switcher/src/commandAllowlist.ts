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
 * Resolve subcommand config if applicable.
 * @internal
 */
function resolveSubcommandConfig(
  commandConfig: CommandConfig,
  command: string,
  args: string[]
): { config: CommandConfig | SubcommandConfig; argsToValidate: string[] } | AllowlistCheckResult {
  if (!commandConfig.subcommands) {
    return { config: commandConfig, argsToValidate: args };
  }

  const subcommand = args[0];
  const subConfig = commandConfig.subcommands[subcommand];

  if (subConfig) {
    /* c8 ignore start: no subcommands are currently disabled - reserved for future */
    if (!subConfig.allowed) {
      return { allowed: false, reason: `Subcommand '${command} ${subcommand}' is disabled` };
    }
    /* c8 ignore stop */
    return { config: subConfig, argsToValidate: args.slice(1) };
  }

  if (command === 'git') {
    return { allowed: false, reason: `Git subcommand '${subcommand}' is not in the allowlist` };
  }
  /* c8 ignore start: only git has subcommands, so this path is never hit */

  return { config: commandConfig, argsToValidate: args };
}
/* c8 ignore stop */

/**
 * Check if arg is a value for a previous option that expects values.
 * @internal
 */
function isValueForPreviousOption(
  arg: string,
  index: number,
  argsToValidate: string[],
  allowedOptionsWithValues: readonly string[]
): AllowlistCheckResult | 'is_value' | 'not_value' {
  if (index === 0) {
    return 'not_value';
  }
  const prevArg = argsToValidate[index - 1];
  if (!allowedOptionsWithValues.includes(prevArg)) {
    return 'not_value';
  }
  // Security: reject if value looks like a flag
  if (arg.startsWith('-')) {
    return { allowed: false, reason: `Value for '${prevArg}' cannot mean a flag ('${arg}')` };
  }
  return 'is_value';
}

/**
 * Validate a flag argument.
 * @internal
 */
function validateFlagArgument(
  arg: string,
  command: string,
  allowedArgs: readonly string[]
): AllowlistCheckResult | 'allowed' {
  // Check for combined flags (only if it's not a long option --)
  if (!arg.startsWith('--') && arg.length > 2) {
    const flagResult = validateCombinedFlags(arg, command, allowedArgs);
    /* c8 ignore start: combined patterns also in allowedArgs - matches earlier */
    if (flagResult.valid) {
      return 'allowed';
    }
    /* c8 ignore stop */
    return { allowed: false, reason: flagResult.reason || 'Invalid combined flag' };
  }
  return { allowed: false, reason: `Flag '${arg}' is not allowed for this command` };
}

/**
 * Check if a command is in the allowlist
 */
export function isCommandAllowed(command: string, args: string[]): AllowlistCheckResult {
  const commandConfig = ALLOWED_COMMANDS[command];

  if (!commandConfig) {
    return { allowed: false, reason: `Command '${command}' is not in the allowlist` };
  }

  /* c8 ignore start: no commands are currently disabled - reserved for future */
  if (!commandConfig.allowed) {
    return { allowed: false, reason: `Command '${command}' is explicitly disabled` };
  }
  /* c8 ignore stop */

  if (args.length === 0) {
    return { allowed: true };
  }

  if (args.length > MAX_ARGS_COUNT) {
    return { allowed: false, reason: 'Too many arguments' };
  }

  // Resolve subcommand config
  const subResult = resolveSubcommandConfig(commandConfig, command, args);
  if ('allowed' in subResult) {
    return subResult;
  }
  const { config: currentConfig, argsToValidate } = subResult;

  // Extract config options
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

    // Path Safety Check
    const looksLikePathForSecurity = isPathArgument(arg) || arg.includes('/');
    if (looksLikePathForSecurity) {
      const pathResult = isSecurePath(arg);
      if (!pathResult.valid) {
        return { allowed: false, reason: `Path argument rejected: ${pathResult.reason}` };
      }
    }

    // 1. Check if this is a value for a previous option
    const valueCheck = isValueForPreviousOption(arg, i, argsToValidate, allowedOptionsWithValues);
    if (valueCheck === 'is_value') {
      continue;
    }
    if (typeof valueCheck === 'object') {
      return valueCheck;
    }

    // 2. Exact Match Allowlist
    if (allowedArgs.includes(arg)) {
      continue;
    }

    // 3. Strict Flag Validation
    if (arg.startsWith('-')) {
      const flagCheck = validateFlagArgument(arg, command, allowedArgs);
      /* c8 ignore start: combined patterns also in allowedArgs - matches earlier */
      if (flagCheck === 'allowed') {
        continue;
      }
      /* c8 ignore stop */
      return flagCheck;
    }

    // 4. Fallback: arbitrary positionals allowed?
    if (allowAnyPositional) {
      continue;
    }

    // 5. Path-only positionals allowed?
    if (allowPathPositionals && looksLikePathForSecurity) {
      continue;
    }

    return { allowed: false, reason: `Argument '${arg}' is not allowed for this command` };
  }

  return { allowed: true };
}
