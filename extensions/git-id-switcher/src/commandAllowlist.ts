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
 * Security constants for path validation
 */
const PATH_MAX = 4096; // POSIX PATH_MAX

/**
 * Result of secure path validation
 */
export interface SecurePathResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate a path argument for security
 *
 * This function performs comprehensive security checks on file paths:
 * - Rejects path traversal patterns (.., //)
 * - Rejects ~user patterns (only ~/ is allowed)
 * - Rejects Windows special paths (UNC, device paths)
 * - Rejects null bytes and control characters
 * - Enforces PATH_MAX length limit
 * - Normalizes Unicode (NFC)
 *
 * @param path - The path string to validate
 * @returns SecurePathResult indicating if path is safe
 *
 * @example
 * isSecurePath('/home/user/.ssh/id_rsa')  // { valid: true }
 * isSecurePath('../etc/passwd')           // { valid: false, reason: '...' }
 */
export function isSecurePath(path: string): SecurePathResult {
  // Check for null/undefined/empty
  if (!path || path.length === 0) {
    return { valid: false, reason: 'Path is empty or undefined' };
  }

  // Check PATH_MAX length (in bytes for Unicode safety)
  const byteLength = Buffer.byteLength(path, 'utf8');
  if (byteLength > PATH_MAX) {
    return {
      valid: false,
      reason: `Path exceeds maximum length (${byteLength} > ${PATH_MAX} bytes)`,
    };
  }

  // Check for null bytes (common attack vector)
  if (path.includes('\0')) {
    return { valid: false, reason: 'Path contains null byte' };
  }

  // Check for control characters (ASCII 0-31 except tab, newline)
  // eslint-disable-next-line no-control-regex
  const controlCharRegex = /[\x00-\x08\x0b\x0c\x0e-\x1f]/;
  if (controlCharRegex.test(path)) {
    return { valid: false, reason: 'Path contains control characters' };
  }

  // Check for invisible/zero-width Unicode characters that could be used to
  // obfuscate paths (homograph attacks, visual spoofing)
  const invisibleChars = [
    '\u200B', // Zero-width space
    '\u200C', // Zero-width non-joiner
    '\u200D', // Zero-width joiner
    '\u200E', // Left-to-right mark
    '\u200F', // Right-to-left mark
    '\u2060', // Word joiner
    '\u2061', // Function application
    '\u2062', // Invisible times
    '\u2063', // Invisible separator
    '\u2064', // Invisible plus
    '\uFEFF', // Byte order mark (BOM)
    '\u00AD', // Soft hyphen
  ];
  for (const char of invisibleChars) {
    if (path.includes(char)) {
      return {
        valid: false,
        reason: 'Path contains invisible Unicode characters',
      };
    }
  }

  // Normalize Unicode to NFC for consistent comparison
  const normalizedPath = path.normalize('NFC');

  // Check for path traversal patterns
  // Matches: .., /.., ../, /../, standalone ..
  const traversalPatterns = [
    /\.\.[/\\]/, // ../ or ..\
    /[/\\]\.\.$/, // ends with /.. or \..
    /[/\\]\.\.[/\\]/, // /../ or \..\
    /^\.\.[/\\]/, // starts with ../ or ..\
    /^\.\.$/,     // exactly ".."
  ];

  for (const pattern of traversalPatterns) {
    if (pattern.test(normalizedPath)) {
      return { valid: false, reason: 'Path contains traversal pattern (..)' };
    }
  }

  // Check for double slashes (potential path confusion)
  if (/\/\//.test(normalizedPath) || /\\\\/.test(normalizedPath)) {
    // Exception: Windows UNC paths start with \\ but we reject those anyway
    return { valid: false, reason: 'Path contains double slashes' };
  }

  // Check for backslashes in paths (cross-platform safety)
  // On Windows, \ is a path separator; on Unix, it's a valid filename char
  // To prevent cross-platform confusion attacks, reject paths with backslashes
  if (normalizedPath.includes('\\')) {
    return {
      valid: false,
      reason: 'Path contains backslash (use forward slashes for cross-platform compatibility)',
    };
  }

  // Check tilde patterns: only ~/ is allowed, not ~user
  if (normalizedPath.startsWith('~')) {
    // Allow: ~, ~/, ~/path
    // Reject: ~user, ~user/path
    if (normalizedPath !== '~' && !normalizedPath.startsWith('~/')) {
      return {
        valid: false,
        reason: 'Tilde expansion to other users (~user) is not allowed, use ~/ only',
      };
    }
  }

  // Check for Windows absolute paths (security boundary)
  // Reject: C:\, D:\, etc.
  if (/^[a-zA-Z]:[/\\]/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'Windows absolute paths (drive letters) are not allowed in this context',
    };
  }

  // Check for Windows UNC paths: \\server\share or \\?\
  if (/^[/\\]{2}/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'UNC paths and Windows device paths are not allowed',
    };
  }

  // Check for Windows device paths: \\.\COM1, \\.\PhysicalDrive0, etc.
  if (/^[/\\]{2}[./\\]/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'Windows device paths are not allowed',
    };
  }

  // Check for Windows reserved device names
  const windowsReservedNames = /^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])([./\\]|$)/i;
  const basename = normalizedPath.split(/[/\\]/).pop() || '';
  if (windowsReservedNames.test(basename)) {
    return {
      valid: false,
      reason: 'Windows reserved device names are not allowed',
    };
  }

  // Path must start with a recognized prefix
  const validPrefixes = [
    '/',      // Absolute Unix path
    '~/',     // Home directory
    '~',      // Home directory (exact match)
    '.',      // Current directory (but not ..)
  ];

  const startsWithValidPrefix = validPrefixes.some(prefix => {
    if (prefix === '.') {
      // Special handling for '.': must be exactly '.' or './'
      return normalizedPath === '.' || normalizedPath.startsWith('./');
    }
    return normalizedPath === prefix || normalizedPath.startsWith(prefix);
  });

  if (!startsWithValidPrefix) {
    return {
      valid: false,
      reason: 'Path must be absolute (start with /) or relative to home (~/) or current directory (./)',
    };
  }

  return { valid: true };
}

/**
 * Check if an argument looks like a file path
 * Used to determine if path validation should be applied
 *
 * This catches both valid and potentially malicious paths for validation.
 */
export function isPathArgument(arg: string): boolean {
  if (!arg || arg.length === 0) {
    return false;
  }

  // Check if it looks like a path (starts with /, ~, ., or contains path separators)
  // We intentionally catch ../ here so it can be validated and rejected
  return (
    arg.startsWith('/') ||
    arg.startsWith('~') ||
    arg.startsWith('./') ||
    arg.startsWith('../') ||
    arg === '.' ||
    arg === '..'
  );
}

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
  // File paths must pass security validation, flags must be in allowlist
  const allowedArgs = commandConfig.allowedArgs || [];

  for (const arg of args) {
    // Check if argument looks like a file path
    if (isPathArgument(arg)) {
      // Validate path for security (path traversal, etc.)
      const pathResult = isSecurePath(arg);
      if (!pathResult.valid) {
        return {
          allowed: false,
          reason: `Path argument rejected: ${pathResult.reason}`,
        };
      }
      // Path is valid, continue to next argument
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
