/**
 * Command Allowlist for Defense-in-Depth Security
 *
 * Defines which commands and subcommands are permitted.
 * Unknown commands are rejected even if using secureExec.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

import { validatePathSecurity, isPathArgument } from './pathValidator';
import { validateCombinedFlags } from './flagValidator';
import { validateGitConfigArgs } from './gitConfigRules';
import { validateSshKeygenArgs, validateSshKeygenInput } from './sshKeygenRules';
import { validateDriveAbsolutePathSecurity } from './drivePathValidator';
import { isDriveAbsolutePath } from '../validators/common';
import { MAX_COMMAND_ARG_LENGTH } from '../core/constants';

// Re-export path security utilities
export { validatePathSecurity, isPathArgument, SecurePathResult } from './pathValidator';
export { validateCombinedFlags, CombinedFlagResult } from './flagValidator';

/**
 * Security constants for argument validation
 */
const MAX_ARGS_COUNT = 20;

/**
 * Subcommand configuration
 */
interface SubcommandConfig {
  allowed: boolean;
  allowedArgs?: readonly string[];
  description?: string;
  /**
   * Whether to allow path-like positional arguments only (starting with /,
   * ~, ., or containing /). Arbitrary positional arguments are never allowed.
   * Useful for commands like 'git submodule status <path>'.
   */
  allowPathPositionals?: boolean;
  /**
   * Validate the whole argument list as one grammar instead of token by token.
   * When set, the token rules above are not used; the length and path checks
   * that apply to every argument still run first.
   */
  validateArgs?: (args: readonly string[]) => AllowlistCheckResult;
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
   * Whether to allow path-like positional arguments only (starting with /,
   * ~, ., or containing /).
   */
  allowPathPositionals?: boolean;
  /** See SubcommandConfig.validateArgs */
  validateArgs?: (args: readonly string[]) => AllowlistCheckResult;
  /**
   * Check the standard input given to the command. A command without it
   * takes no standard input at all.
   */
  validateInput?: (args: readonly string[], input: string | undefined) => AllowlistCheckResult;
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
        // STRICT: per-key rules for operation, scope and value (see gitConfigRules)
        validateArgs: validateGitConfigArgs,
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
        // Path positionals only, to prevent
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
    allowPathPositionals: true,
    // SECURITY: -D (remove all keys) intentionally excluded — only -d (remove specific key) is used
    allowedArgs: ['-l', '-d', '--apple-use-keychain'],
  },
  'ssh-keygen': {
    allowed: true,
    description: 'SSH key operations (read-only)',
    // STRICT: -lf <path>, -y -P '' -f <path> and -Y sign -n git -f <path> only (see sshKeygenRules)
    validateArgs: validateSshKeygenArgs,
    // STRICT: only the signing form reads stdin, and only the fixed test data
    validateInput: validateSshKeygenInput,
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
): AllowlistCheckResult | { config: CommandConfig | SubcommandConfig; argsToValidate: string[] } {
  if (!commandConfig.subcommands) {
    return { config: commandConfig, argsToValidate: args };
  }

  const subcommand = args[0];
  const subConfig = commandConfig.subcommands[subcommand];

  if (subConfig) {
    /* c8 ignore start: no subcommands are currently disabled - reserved for future */
    // eslint-disable-next-line unicorn/prefer-ternary -- keep the c8 ignore boundary around the reserved branch
    if (!subConfig.allowed) {
      return { allowed: false, reason: `Subcommand '${command} ${subcommand}' is disabled` };
    }
    /* c8 ignore stop */
    return { config: subConfig, argsToValidate: args.slice(1) };
  }

  // eslint-disable-next-line unicorn/prefer-ternary -- keep the c8 ignore boundary around the fallback path
  if (command === 'git') {
    return { allowed: false, reason: `Git subcommand '${subcommand}' is not in the allowlist` };
  }
  /* c8 ignore start: only git has subcommands, so this path is never hit */

  return { config: commandConfig, argsToValidate: args };
}
/* c8 ignore stop */

/**
 * Validate a flag argument.
 * @internal
 */
// eslint-disable-next-line sonarjs/function-return-type -- discriminated union return is intentional
function validateFlagArgument(
  arg: string,
  allowedArgs: readonly string[]
): AllowlistCheckResult | 'allowed' {
  // Check for combined flags (only if it's not a long option --)
  if (!arg.startsWith('--') && arg.length > 2) {
    const flagResult = validateCombinedFlags(arg, allowedArgs);
    /* c8 ignore start: combined patterns also in allowedArgs - matches earlier */
    // eslint-disable-next-line unicorn/prefer-ternary -- keep the c8 ignore boundary around the unreachable branch
    if (flagResult.valid) {
      return 'allowed';
    }
    /* c8 ignore stop */
    /* c8 ignore next: fallback never used - validateCombinedFlags always provides reason */
    return { allowed: false, reason: flagResult.reason || 'Invalid combined flag' };
  }
  return { allowed: false, reason: `Flag '${arg}' is not allowed for this command` };
}

/**
 * Validate path safety for an argument.
 * @internal
 */
// eslint-disable-next-line sonarjs/function-return-type -- discriminated union return is intentional
function validatePathSafety(arg: string): AllowlistCheckResult | 'safe' {
  const isLooksLikePathForSecurity = isPathArgument(arg) || arg.includes('/');
  if (isLooksLikePathForSecurity) {
    const pathResult = validatePathSecurity(arg);
    if (!pathResult.valid) {
      return { allowed: false, reason: `Path argument rejected: ${pathResult.reason}` };
    }
  }
  return 'safe';
}

/**
 * Validate the length of an argument (a path argument is checked by the path
 * checks instead).
 * @internal
 */
function validateArgumentLength(arg: string): AllowlistCheckResult | 'safe' {
  return !isPathArgument(arg) && arg.length > MAX_COMMAND_ARG_LENGTH
    ? { allowed: false, reason: 'Argument exceeds maximum length' }
    : 'safe';
}

/**
 * Validate path safety for a Windows drive path argument.
 * @internal
 */
function validateDrivePathSafety(arg: string): AllowlistCheckResult | 'safe' {
  const pathResult = validateDriveAbsolutePathSecurity(arg);
  return pathResult.valid
    ? 'safe'
    : { allowed: false, reason: `Path argument rejected: ${pathResult.reason}` };
}

/**
 * Result of single argument validation
 */
type ArgValidationResult = AllowlistCheckResult | 'continue';

/**
 * Validate a single argument against allowlist rules.
 * @internal
 */
// eslint-disable-next-line sonarjs/function-return-type -- discriminated union return is intentional
function validateSingleArgument(
  arg: string,
  config: {
    allowedArgs: readonly string[];
    allowPathPositionals: boolean;
  }
): ArgValidationResult {
  const { allowedArgs, allowPathPositionals: isAllowPathPositionals } = config;

  const lengthCheck = validateArgumentLength(arg);
  if (lengthCheck !== 'safe') {
    return lengthCheck;
  }

  // Path Safety Check
  const pathCheck = validatePathSafety(arg);
  if (pathCheck !== 'safe') {
    return pathCheck;
  }
  const isLooksLikePathForSecurity = isPathArgument(arg) || arg.includes('/');

  // 1. Exact Match Allowlist
  if (allowedArgs.includes(arg)) {
    return 'continue';
  }

  // 2. Strict Flag Validation
  if (arg.startsWith('-')) {
    const flagCheck = validateFlagArgument(arg, allowedArgs);
    /* c8 ignore start: combined patterns also in allowedArgs - matches earlier */
    // eslint-disable-next-line unicorn/prefer-ternary -- keep the c8 ignore boundary around the unreachable branch
    if (flagCheck === 'allowed') {
      return 'continue';
    }
    /* c8 ignore stop */
    return flagCheck;
  }

  // 3. Path-only positionals allowed?
  return isAllowPathPositionals && isLooksLikePathForSecurity
    ? 'continue'
    : { allowed: false, reason: `Argument '${arg}' is not allowed for this command` };
}

/**
 * Validate arguments with a grammar validator, after the length and path
 * checks that apply to every argument.
 * @internal
 */
function validateWithGrammar(
  argsToValidate: string[],
  validateArgs: (args: readonly string[]) => AllowlistCheckResult
): AllowlistCheckResult {
  for (const arg of argsToValidate) {
    const lengthCheck = validateArgumentLength(arg);
    if (lengthCheck !== 'safe') {
      return lengthCheck;
    }
    // A Windows drive path (what ~/ expands to on Windows) gets the same
    // checks with the drive prefix removed; the grammar decides whether the
    // key takes a path at all
    const pathCheck = isDriveAbsolutePath(arg)
      ? validateDrivePathSafety(arg)
      : validatePathSafety(arg);
    if (pathCheck !== 'safe') {
      return pathCheck;
    }
  }
  return validateArgs(argsToValidate);
}

/**
 * Check if a command is in the allowlist
 *
 * @param input - The text the command gets on standard input (undefined:
 *   none). Only a command with an input rule accepts standard input.
 */
export function isCommandAllowed(command: string, args: string[], input?: string): AllowlistCheckResult {
  const commandConfig = ALLOWED_COMMANDS[command];

  if (!commandConfig) {
    return { allowed: false, reason: `Command '${command}' is not in the allowlist` };
  }

  /* c8 ignore start: no commands are currently disabled - reserved for future */
  if (!commandConfig.allowed) {
    return { allowed: false, reason: `Command '${command}' is explicitly disabled` };
  }
  /* c8 ignore stop */

  const inputCheck = commandConfig.validateInput
    ? commandConfig.validateInput(args, input)
    : { allowed: input === undefined, reason: `Command '${command}' takes no standard input` };
  if (!inputCheck.allowed) {
    return inputCheck;
  }

  // A command read as one grammar decides about no arguments too
  if (args.length === 0 && !commandConfig.validateArgs) {
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

  if (currentConfig.validateArgs) {
    return validateWithGrammar(argsToValidate, currentConfig.validateArgs);
  }

  // Extract config options for argument validation
  const validationConfig = {
    allowedArgs: currentConfig.allowedArgs || [],
    allowPathPositionals: currentConfig.allowPathPositionals || false,
  };

  // Validate each argument
  for (const arg of argsToValidate) {
    const result = validateSingleArgument(arg, validationConfig);

    if (result === 'continue') {
      continue;
    }
    // Result is AllowlistCheckResult (not allowed)
    return result;
  }

  return { allowed: true };
}
