/**
 * Command Allowlist for Defense-in-Depth Security
 *
 * Defines which commands and subcommands are permitted.
 * Unknown commands are rejected even if using secureExec.
 *
 * This provides an additional security layer beyond execFile.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

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
 *
 * Only these commands can be executed by the extension.
 * Each command specifies allowed subcommands and arguments.
 */
export const ALLOWED_COMMANDS: Record<string, CommandConfig> = {
  git: {
    allowed: true,
    description: 'Git version control',
    subcommands: {
      '--version': {
        allowed: true,
        description: 'Check git version',
      },
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
        allowedArgs: [
          '--is-inside-work-tree',
          '--show-toplevel',
          '--git-dir',
        ],
      },
      submodule: {
        allowed: true,
        description: 'Submodule operations',
        allowedArgs: [
          'status',
          '--recursive',
        ],
      },
    },
  },
  'ssh-add': {
    allowed: true,
    description: 'SSH agent key management',
    allowedArgs: [
      '-l',              // List keys
      '-d',              // Delete specific key
      '-D',              // Delete all keys
      '--apple-use-keychain', // macOS keychain integration
    ],
  },
  'ssh-keygen': {
    allowed: true,
    description: 'SSH key operations (read-only)',
    allowedArgs: [
      '-lf',             // List fingerprint of a file
      '-l',              // List
      '-f',              // Specify file
    ],
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
 *
 * @param command - The command to execute (e.g., 'git', 'ssh-add')
 * @param args - Array of arguments
 * @returns Result indicating if command is allowed
 *
 * @example
 * const result = isCommandAllowed('git', ['config', '--local', 'user.name', 'John']);
 * if (!result.allowed) {
 *   console.error('Command blocked:', result.reason);
 * }
 */
export function isCommandAllowed(
  command: string,
  args: string[]
): AllowlistCheckResult {
  // Check if command is in allowlist
  const commandConfig = ALLOWED_COMMANDS[command];

  if (!commandConfig) {
    return {
      allowed: false,
      reason: `Command '${command}' is not in the allowlist`,
    };
  }

  if (!commandConfig.allowed) {
    return {
      allowed: false,
      reason: `Command '${command}' is explicitly disabled`,
    };
  }

  // If no args, command is allowed
  if (args.length === 0) {
    return { allowed: true };
  }

  // Check subcommands if defined
  if (commandConfig.subcommands) {
    const subcommand = args[0];
    const subConfig = commandConfig.subcommands[subcommand];

    if (subConfig) {
      if (!subConfig.allowed) {
        return {
          allowed: false,
          reason: `Subcommand '${command} ${subcommand}' is disabled`,
        };
      }
      // Subcommand is explicitly allowed
      return { allowed: true };
    }

    // For git, if subcommand is not explicitly listed, check allowedArgs
    if (command === 'git') {
      // First argument might be a git subcommand we haven't listed
      // Be conservative - only allow what we've explicitly defined
      return {
        allowed: false,
        reason: `Git subcommand '${subcommand}' is not in the allowlist`,
      };
    }
  }

  // For non-subcommand commands (ssh-add, ssh-keygen), check args pattern
  // Allow any file paths (they're validated separately) and allowed flags
  const allowedArgs = commandConfig.allowedArgs || [];

  for (const arg of args) {
    // Skip file path arguments (they start with / or ~)
    if (arg.startsWith('/') || arg.startsWith('~') || arg.startsWith('.')) {
      continue;
    }

    // Check if arg is in allowed list
    const isAllowedArg = allowedArgs.some(allowed => {
      // Exact match
      if (arg === allowed) {
        return true;
      }
      // For combined args like '-lf', check if components are allowed
      if (arg.startsWith('-') && allowed.startsWith('-')) {
        return arg.includes(allowed.replace('-', ''));
      }
      return false;
    });

    if (!isAllowedArg && arg.startsWith('-')) {
      return {
        allowed: false,
        reason: `Argument '${arg}' is not allowed for command '${command}'`,
      };
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
