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

import { PATH_MAX } from './constants';
import {
  CONTROL_CHAR_REGEX_STRICT,
  hasInvisibleUnicode,
  hasPathTraversal,
  hasPathTraversalStrict,
  hasNullByte,
} from './validators/common';

/**
 * Security constants for flag validation
 */
const MAX_FLAG_LENGTH = 50; // Maximum length for a single flag argument
const MAX_COMBINED_FLAG_CHARS = 10; // Maximum individual flag characters in combined form
const MAX_ARGS_COUNT = 20; // Maximum number of arguments allowed
const MAX_ARG_LENGTH = 256; // Maximum length for a single non-path argument

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

  // CRITICAL: Check for leading/trailing whitespace (potential obfuscation)
  // Whitespace can be used to hide malicious patterns
  if (path !== path.trim()) {
    return { valid: false, reason: 'Path contains leading or trailing whitespace' };
  }

  // Check for null bytes (common attack vector) - must check BEFORE normalization
  if (hasNullByte(path)) {
    return { valid: false, reason: 'Path contains null byte' };
  }

  // Check for control characters (ASCII 0-31 except tab, newline)
  // Note: null byte (\x00) is already checked above, but regex includes it for completeness
  if (CONTROL_CHAR_REGEX_STRICT.test(path)) {
    return { valid: false, reason: 'Path contains control characters' };
  }

  // Check for invisible/zero-width Unicode characters that could be used to
  // obfuscate paths (homograph attacks, visual spoofing)
  if (hasInvisibleUnicode(path)) {
    return {
      valid: false,
      reason: 'Path contains invisible Unicode characters',
    };
  }

  // Normalize Unicode to NFC for consistent comparison
  // This must be done early to catch normalization-based attacks
  const normalizedPath = path.normalize('NFC');

  // CRITICAL: Re-check for control characters and invisible chars AFTER normalization
  // Normalization can create new control characters in edge cases
  if (CONTROL_CHAR_REGEX_STRICT.test(normalizedPath)) {
    return { valid: false, reason: 'Path contains control characters (after normalization)' };
  }
  if (hasInvisibleUnicode(normalizedPath)) {
    return {
      valid: false,
      reason: 'Path contains invisible Unicode characters (after normalization)',
    };
  }

  // Check PATH_MAX length (in bytes for Unicode safety) - check AFTER normalization
  // Normalization can change byte length (NFC/NFD conversion)
  const normalizedByteLength = Buffer.byteLength(normalizedPath, 'utf8');
  if (normalizedByteLength > PATH_MAX) {
    return {
      valid: false,
      reason: `Path exceeds maximum length (${normalizedByteLength} > ${PATH_MAX} bytes)`,
    };
  }

  // Check for path traversal patterns using comprehensive validation
  if (hasPathTraversalStrict(normalizedPath)) {
    return { valid: false, reason: 'Path contains traversal pattern (..)' };
  }

  // Check for double slashes (potential path confusion)
  if (/\/\//.test(normalizedPath) || /\\\\/.test(normalizedPath)) {
    // Exception: Windows UNC paths start with \\ but we reject those anyway
    return { valid: false, reason: 'Path contains double slashes' };
  }

  // Check for backslashes in paths (cross-platform safety)
  // On Windows, \ is a path separator; on Unix, it's a valid filename char
  // To prevent cross-platform confusion attacks, reject paths with backslashes
  // NOTE: This check comes AFTER UNC path checks, which already reject \\ patterns
  // But we still need this to catch single backslashes and mixed separators
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
  // Reject: C:\, D:\, C:, D: (drive letter only), etc.
  // CRITICAL: Must check for both C:\ and C: (without separator)
  // CRITICAL: Also reject paths that start with drive letter followed by any content
  if (/^[a-zA-Z]:/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'Windows absolute paths (drive letters) are not allowed in this context',
    };
  }

  // Check for Windows UNC paths: \\server\share or \\?\
  // CRITICAL: Must check BEFORE backslash check to catch UNC paths
  if (/^[/\\]{2}/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'UNC paths and Windows device paths are not allowed',
    };
  }

  // Check for Windows device paths: \\.\COM1, \\.\PhysicalDrive0, etc.
  // Also check for //?/ and //./ patterns (forward slash variants)
  // CRITICAL: This must come AFTER UNC check to avoid redundant checks
  // But we need separate patterns for device paths vs UNC paths
  if (/^[/\\]{2}[.?\\]/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'Windows device paths are not allowed',
    };
  }

  // Check for Windows long path prefix: \\?\ (must be caught by UNC check above)
  // Additional check for forward slash variant: //?/
  // CRITICAL: This is redundant with UNC check, but explicit for clarity
  // UNC check at line 176 should catch this, but defensive check
  if (/^\/\/\?\/?/.test(normalizedPath)) {
    return {
      valid: false,
      reason: 'Windows long path prefixes are not allowed',
    };
  }

  // CRITICAL: Check for paths ending with dots (Windows quirk)
  // Windows doesn't allow paths ending with . or .. (except . and .. themselves)
  // But we already reject .., so we only need to check for trailing single dot
  // Example: /path/to/file. (trailing dot) - valid on Unix, invalid on Windows
  // We reject for cross-platform safety
  // CRITICAL: Also check for paths ending with /./ or /../
  if (normalizedPath.length > 1) {
    if (normalizedPath.endsWith('.')) {
      // Exception: '.' itself is allowed (already checked in prefix validation)
      if (normalizedPath !== '.') {
        return {
          valid: false,
          reason: 'Path ends with dot (not allowed for cross-platform compatibility)',
        };
      }
    }
    // Check for paths ending with /./ or /../ (should be caught by traversal check, but defensive)
    if (normalizedPath.endsWith('/.') || normalizedPath.endsWith('/..')) {
      return {
        valid: false,
        reason: 'Path ends with /./ or /../ (not allowed)',
      };
    }
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
  // CRITICAL: Must validate AFTER all security checks to prevent bypass
  const validPrefixes = [
    '/',      // Absolute Unix path
    '~/',     // Home directory
    '~',      // Home directory (exact match)
    '.',      // Current directory (but not ..)
  ];

  const startsWithValidPrefix = validPrefixes.some(prefix => {
    if (prefix === '.') {
      // Special handling for '.': must be exactly '.' or './'
      // CRITICAL: Must NOT allow './../' or './..' (already caught by traversal check)
      if (normalizedPath === '.' || normalizedPath.startsWith('./')) {
        // Additional check: ensure './' is not followed by traversal
        if (normalizedPath.startsWith('./') && hasPathTraversal(normalizedPath)) {
          return false; // Will be caught by traversal check, but defensive
        }
        return true;
      }
      return false;
    }
    return normalizedPath === prefix || normalizedPath.startsWith(prefix);
  });

  if (!startsWithValidPrefix) {
    return {
      valid: false,
      reason: 'Path must be absolute (start with /) or relative to home (~/) or current directory (./)',
    };
  }

  // Final validation: ensure no remaining security issues
  // This is a defensive check to catch any edge cases
  // Double-check that normalized path doesn't contain any dangerous patterns
  if (hasPathTraversal(normalizedPath)) {
    // This should have been caught by traversal patterns, but defensive check
    return { valid: false, reason: 'Path contains traversal pattern (defensive check)' };
  }

  // CRITICAL: Final check for normalized path length (defensive)
  // Normalization can theoretically change length, but we already checked above
  // This is a redundant check for extra safety
  if (normalizedPath.length > PATH_MAX) {
    // This should have been caught by byte length check, but character length check too
    return {
      valid: false,
      reason: `Path exceeds maximum character length (${normalizedPath.length} > ${PATH_MAX})`,
    };
  }

  // CRITICAL: Ensure normalized path doesn't start with whitespace (after trim check)
  // This is redundant but defensive
  if (normalizedPath.length > 0 && (normalizedPath[0] === ' ' || normalizedPath[normalizedPath.length - 1] === ' ')) {
    return { valid: false, reason: 'Path contains leading or trailing whitespace (after normalization)' };
  }

  return { valid: true };
}

/**
 * Check if an argument looks like a file path
 * Used to determine if path validation should be applied
 *
 * This catches both valid and potentially malicious paths for validation.
 * CRITICAL: This function must be conservative - it's better to validate
 * a non-path as a path than to miss a malicious path.
 */
export function isPathArgument(arg: string): boolean {
  if (!arg || arg.length === 0) {
    return false;
  }

  // CRITICAL: Check for leading/trailing whitespace (potential obfuscation)
  // If arg has whitespace, it might be a path with obfuscation
  const trimmedArg = arg.trim();
  if (trimmedArg !== arg) {
    // Has whitespace - could be obfuscated path, so treat as path for validation
    // The validation function will reject it, but we need to catch it here
    return true;
  }

  // Check if it looks like a path (starts with /, ~, ., or contains path separators)
  // We intentionally catch ../ here so it can be validated and rejected
  // CRITICAL: Also check for Windows drive letters (C:, D:, etc.)
  return (
    arg.startsWith('/') ||
    arg.startsWith('~') ||
    arg.startsWith('./') ||
    arg.startsWith('../') ||
    arg === '.' ||
    arg === '..' ||
    // Windows drive letter pattern (C:, D:, etc.)
    /^[a-zA-Z]:/.test(arg) ||
    // Windows UNC path pattern (\\server, //server)
    /^[/\\]{2}/.test(arg)
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
 * Result of combined flag validation
 */
export interface CombinedFlagResult {
  valid: boolean;
  reason?: string;
}

/**
 * Definition for allowed combined flag patterns
 */
interface AllowedCombinedPattern {
  pattern: string; // e.g., 'lf' for -lf
  ordered: boolean; // true if order matters (e.g., -lf !== -fl)
}

/**
 * Allowed combined flag patterns per command
 * Only explicitly listed combinations are allowed.
 */
const ALLOWED_COMBINED_PATTERNS: Record<string, AllowedCombinedPattern[]> = {
  'ssh-keygen': [
    { pattern: 'lf', ordered: true }, // -lf (list fingerprint of file) - order matters
  ],
};

/**
 * Validate a combined flag argument (e.g., -lf, -abc)
 *
 * Security checks performed:
 * 1. Length limit to prevent DoS attacks
 * 2. Duplicate flag detection (e.g., -ll is rejected)
 * 3. Unknown flag detection (each character must be in allowlist)
 * 4. Order-sensitive validation for specific commands
 * 5. Only explicitly allowed combinations are permitted
 *
 * @param flag - The flag to validate (e.g., '-lf', '-abc')
 * @param command - The command being executed (e.g., 'ssh-keygen')
 * @param allowedArgs - Array of allowed individual flags
 * @returns CombinedFlagResult indicating if the flag is valid
 */
export function validateCombinedFlags(
  flag: string,
  command: string,
  allowedArgs: readonly string[]
): CombinedFlagResult {
  // Basic validation
  if (!flag || flag.length === 0) {
    return { valid: false, reason: 'Flag is empty' };
  }

  // CRITICAL: Check for leading/trailing whitespace (potential obfuscation)
  if (flag !== flag.trim()) {
    return { valid: false, reason: 'Flag contains leading or trailing whitespace' };
  }

  // CRITICAL: Check for null bytes (common attack vector)
  if (hasNullByte(flag)) {
    return { valid: false, reason: 'Flag contains null byte' };
  }

  // CRITICAL: Check for control characters (ASCII 0-31 except tab, newline)
  if (CONTROL_CHAR_REGEX_STRICT.test(flag)) {
    return { valid: false, reason: 'Flag contains control characters' };
  }

  // CRITICAL: Check for invisible/zero-width Unicode characters
  if (hasInvisibleUnicode(flag)) {
    return { valid: false, reason: 'Flag contains invisible Unicode characters' };
  }

  // CRITICAL: Normalize Unicode to NFC for consistent comparison
  // This prevents normalization-based attacks (e.g., combining characters)
  const normalizedFlag = flag.normalize('NFC');

  // CRITICAL: Re-check for control characters and invisible chars AFTER normalization
  if (CONTROL_CHAR_REGEX_STRICT.test(normalizedFlag)) {
    return { valid: false, reason: 'Flag contains control characters (after normalization)' };
  }
  if (hasInvisibleUnicode(normalizedFlag)) {
    return { valid: false, reason: 'Flag contains invisible Unicode characters (after normalization)' };
  }

  // Must start with single dash (not double dash for long options)
  if (!normalizedFlag.startsWith('-')) {
    // Non-flag argument - let caller handle
    return { valid: true };
  }

  // CRITICAL: Long options (--option) should be checked via exact match, not here
  // Return early to let caller handle long options explicitly
  if (normalizedFlag.startsWith('--')) {
    return { valid: true }; // Let caller handle long options via exact match
  }

  // Length limit for DoS protection (check normalized length)
  if (normalizedFlag.length > MAX_FLAG_LENGTH) {
    return {
      valid: false,
      reason: `Flag exceeds maximum length`,
    };
  }

  // Extract flag characters (remove leading dash)
  const flagChars = normalizedFlag.slice(1);

  // Empty after removing dash
  if (flagChars.length === 0) {
    return { valid: false, reason: 'Flag contains only dash' };
  }

  // CRITICAL: Check for flag-value concatenation (e.g., -f/path, -lfile, -fpath)
  // Some commands allow flags and values to be concatenated, but we reject this
  // for security to ensure clear separation between flags and values
  // This prevents obfuscation attacks where a flag is hidden in a path-like string
  // Check if flagChars contains path-like patterns (starts with /, ~, ., or contains path separators)
  if (
    flagChars.startsWith('/') ||
    flagChars.startsWith('~') ||
    flagChars.startsWith('./') ||
    flagChars.startsWith('../') ||
    flagChars.includes('/') ||
    flagChars.includes('\\')
  ) {
    return {
      valid: false,
      reason: 'Flag contains path-like pattern. Flags and values must be separate arguments.',
    };
  }

  // Check for invalid characters in flag
  // Valid flag characters are ASCII letters only (a-z, A-Z)
  // Numbers and special characters are not valid in combined short flags
  const invalidCharRegex = /[^a-zA-Z]/;
  if (invalidCharRegex.test(flagChars)) {
    return {
      valid: false,
      reason: 'Flag contains invalid characters. Only ASCII letters allowed.',
    };
  }

  // Single character flag - check directly against allowlist
  if (flagChars.length === 1) {
    const singleFlag = `-${flagChars}`;
    if (allowedArgs.includes(singleFlag)) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: 'Flag is not in allowlist',
    };
  }

  // Combined flag validation (2+ characters)
  // Check for maximum combined flag characters
  if (flagChars.length > MAX_COMBINED_FLAG_CHARS) {
    return {
      valid: false,
      reason: 'Combined flag has too many characters',
    };
  }

  // Check for duplicate characters (e.g., -ll)
  const charSet = new Set<string>();
  for (const char of flagChars) {
    if (charSet.has(char)) {
      return {
        valid: false,
        reason: 'Duplicate flag character in combined flag',
      };
    }
    charSet.add(char);
  }

  // Check if this command has allowed combined patterns
  const commandPatterns = ALLOWED_COMBINED_PATTERNS[command];

  if (commandPatterns) {
    // Check against explicitly allowed patterns
    for (const pattern of commandPatterns) {
      if (pattern.ordered) {
        // Exact match required for ordered patterns
        if (flagChars === pattern.pattern) {
          return { valid: true };
        }
      } else {
        // For unordered patterns, check if same characters (sorted)
        const sortedFlag = [...flagChars].sort().join('');
        const sortedPattern = [...pattern.pattern].sort().join('');
        if (sortedFlag === sortedPattern) {
          return { valid: true };
        }
      }
    }
  }

  // If no explicit pattern matched, check each character individually
  // All characters must be valid individual flags
  const allowedSingleChars = new Set<string>();
  for (const allowed of allowedArgs) {
    // Extract single-char flags (e.g., -l, -f, -d)
    if (allowed.startsWith('-') && !allowed.startsWith('--') && allowed.length === 2) {
      allowedSingleChars.add(allowed[1]);
    }
  }

  // Check each character in the combined flag
  const unknownChars: string[] = [];
  for (const char of flagChars) {
    if (!allowedSingleChars.has(char)) {
      unknownChars.push(char);
    }
  }

  if (unknownChars.length > 0) {
    return {
      valid: false,
      reason: 'Unknown flag character(s) in combined flag',
    };
  }

  // All characters are valid individual flags
  // But for security, we require explicit pattern definitions for combined flags
  // If no patterns are defined, reject the combined flag
  // This prevents unexpected flag combinations from being silently allowed
  return {
    valid: false,
    reason: 'Combined flag is not explicitly allowed. Use separate flags instead.',
  };
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

  // Check args count limit (DoS protection)
  if (args.length > MAX_ARGS_COUNT) {
    return {
      allowed: false,
      reason: 'Too many arguments',
    };
  }

  for (const arg of args) {
    // Check individual argument length (except paths which have their own limit)
    if (!isPathArgument(arg) && arg.length > MAX_ARG_LENGTH) {
      return {
        allowed: false,
        reason: 'Argument exceeds maximum length',
      };
    }
    // Check if argument looks like a file path
    if (isPathArgument(arg)) {
      // Validate path for security (path traversal, etc.)
      const pathResult = isSecurePath(arg);
      if (!pathResult.valid) {
        return {
          allowed: false,
          reason: 'Path argument rejected',
        };
      }
      // Path is valid, continue to next argument
      continue;
    }

    // Check if arg is a flag (starts with -)
    if (arg.startsWith('-')) {
      // First, check for exact match in allowlist
      if (allowedArgs.includes(arg)) {
        continue;
      }

      // Use secure combined flag validation
      const flagResult = validateCombinedFlags(arg, command, allowedArgs);
      if (!flagResult.valid) {
        return {
          allowed: false,
          reason: flagResult.reason || 'Argument is not allowed for this command',
        };
      }
      continue;
    }

    // Non-flag, non-path argument - reject for security
    // Only explicitly allowed non-flag values should be accepted
    if (!allowedArgs.includes(arg)) {
      return {
        allowed: false,
        reason: 'Argument is not allowed for this command',
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
