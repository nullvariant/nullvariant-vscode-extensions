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
}

/**
 * Command configuration
 */
interface CommandConfig {
  allowed: boolean;
  description: string;
  subcommands?: Record<string, SubcommandConfig>;
  allowedArgs?: readonly string[];
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
        allowedArgs: [
          '--local',
          '--global',
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
        allowedArgs: ['status', '--recursive'],
      },
    },
  },
  'ssh-add': {
    allowed: true,
    description: 'SSH agent key management',
    allowedArgs: ['-l', '-d', '-D', '--apple-use-keychain'],
  },
  'ssh-keygen': {
    allowed: true,
    description: 'SSH key operations (read-only)',
    allowedArgs: ['-lf', '-l', '-f'],
  },
} as const;

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

  // Check subcommands if defined
  if (commandConfig.subcommands) {
    const subcommand = args[0];
    const subConfig = commandConfig.subcommands[subcommand];

    if (subConfig) {
      if (!subConfig.allowed) {
        return { allowed: false, reason: `Subcommand '${command} ${subcommand}' is disabled` };
      }
      return { allowed: true };
    }

    if (command === 'git') {
      return { allowed: false, reason: `Git subcommand '${subcommand}' is not in the allowlist` };
    }
  }

  // Validate args for non-subcommand commands
  const allowedArgs = commandConfig.allowedArgs || [];

  if (args.length > MAX_ARGS_COUNT) {
    return { allowed: false, reason: 'Too many arguments' };
  }

  for (const arg of args) {
    if (!isPathArgument(arg) && arg.length > MAX_ARG_LENGTH) {
      return { allowed: false, reason: 'Argument exceeds maximum length' };
    }

    if (isPathArgument(arg)) {
      const pathResult = isSecurePath(arg);
      if (!pathResult.valid) {
        return { allowed: false, reason: 'Path argument rejected' };
      }
      continue;
    }

    if (arg.startsWith('-')) {
      if (allowedArgs.includes(arg)) {
        continue;
      }
      const flagResult = validateCombinedFlags(arg, command, allowedArgs);
      if (!flagResult.valid) {
        return { allowed: false, reason: flagResult.reason || 'Argument is not allowed' };
      }
      continue;
    }

    if (!allowedArgs.includes(arg)) {
      return { allowed: false, reason: 'Argument is not allowed for this command' };
    }
  }

  return { allowed: true };
}

/**
 * Get human-readable description of allowed commands
 */
export function getAllowedCommandsDescription(): string {
  const lines: string[] = ['Allowed commands:'];

  for (const [cmd, config] of Object.entries(ALLOWED_COMMANDS)) {
    if (config.allowed) {
      lines.push(`  ${cmd}: ${config.description}`);
      if (config.subcommands) {
        for (const [sub, subConfig] of Object.entries(config.subcommands)) {
          if (subConfig.allowed) {
            lines.push(`    - ${sub}: ${subConfig.description || ''}`);
          }
        }
      }
    }
  }

  return lines.join('\n');
}
