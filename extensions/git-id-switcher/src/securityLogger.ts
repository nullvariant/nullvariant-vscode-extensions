/**
 * Security Audit Logger
 *
 * Records security-relevant events to VS Code Output Channel.
 * Provides visibility into extension operations for security auditing.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Security limits to prevent DoS attacks
 */
const SECURITY_LIMITS = {
  /** Maximum path length to process */
  MAX_PATH_LENGTH: 4096,
  /** Maximum string length for pattern matching */
  MAX_PATTERN_CHECK_LENGTH: 1000,
  /** Maximum string length to log (truncate longer) */
  MAX_LOG_STRING_LENGTH: 50,
  /** Minimum length for secret-like string detection */
  MIN_SECRET_LENGTH: 32,
  /** Maximum length for secret-like string detection */
  MAX_SECRET_LENGTH: 256,
} as const;

/**
 * Platform-specific sensitive directory patterns
 */
const SENSITIVE_DIRS_UNIX = [
  // SSH and GPG
  '.ssh',
  '.gnupg',
  // Cloud credentials
  '.aws',
  '.azure',
  '.gcloud',
  '.config/gcloud',
  // Package managers with auth
  '.npmrc',
  '.yarnrc',
  '.docker',
  // Kubernetes
  '.kube',
  // Database credentials
  '.pgpass',
  '.my.cnf',
  '.netrc',
  // System directories
  '/etc/passwd',
  '/etc/shadow',
  '/etc/ssh',
  '/etc/ssl',
  '/etc/pki',
] as const;

const SENSITIVE_DIRS_WINDOWS = [
  // User profile sensitive locations
  'AppData\\Roaming',
  'AppData\\Local',
  // SSH (Windows)
  '.ssh',
  // Cloud credentials (same as Unix)
  '.aws',
  '.azure',
  '.gcloud',
  // Windows credential store related
  'Credentials',
  // Certificate stores
  'Microsoft\\Crypto',
  'Microsoft\\Protect',
] as const;

/**
 * Patterns that indicate sensitive content in any path
 */
const SENSITIVE_PATTERNS = [
  /private[_-]?key/i,
  /id_rsa/i,
  /id_ed25519/i,
  /id_ecdsa/i,
  /id_dsa/i,
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /credential/i,
  /secret/i,
  /password/i,
  /token/i,
  /\.env$/i,
  /\.env\./i,
] as const;

/**
 * Security event types
 */
export enum SecurityEventType {
  /** Identity was switched */
  IDENTITY_SWITCH = 'IDENTITY_SWITCH',
  /** SSH key was loaded */
  SSH_KEY_LOAD = 'SSH_KEY_LOAD',
  /** SSH key was removed */
  SSH_KEY_REMOVE = 'SSH_KEY_REMOVE',
  /** Input validation failed */
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  /** Command was blocked by allowlist */
  COMMAND_BLOCKED = 'COMMAND_BLOCKED',
  /** Configuration was changed */
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  /** Extension was activated */
  EXTENSION_ACTIVATE = 'EXTENSION_ACTIVATE',
  /** Extension was deactivated */
  EXTENSION_DEACTIVATE = 'EXTENSION_DEACTIVATE',
}

/**
 * Severity levels for security events
 */
export type Severity = 'info' | 'warning' | 'error';

/**
 * Security event structure
 */
export interface SecurityEvent {
  timestamp: string;
  type: SecurityEventType;
  severity: Severity;
  details: Record<string, unknown>;
}

/**
 * Security Logger class
 *
 * Manages security event logging to VS Code Output Channel.
 * Singleton pattern ensures consistent logging across the extension.
 */
class SecurityLoggerImpl {
  private outputChannel: vscode.OutputChannel | null = null;
  private readonly channelName = 'Git ID Switcher Security';

  /**
   * Initialize the output channel
   * Should be called during extension activation
   */
  initialize(): void {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel(this.channelName);
    }
  }

  /**
   * Dispose the output channel
   * Should be called during extension deactivation
   */
  dispose(): void {
    if (this.outputChannel) {
      this.outputChannel.dispose();
      this.outputChannel = null;
    }
  }

  /**
   * Sanitize all values in a details object
   */
  private sanitizeDetails(
    details: Record<string, unknown>
  ): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(details)) {
      // Sanitize the key itself if it looks sensitive
      const sanitizedKey = this.looksLikeSensitiveData(key)
        ? '[REDACTED_KEY]'
        : key;
      sanitized[sanitizedKey] = this.sanitizeValue(value);
    }

    return sanitized;
  }

  /**
   * Log a security event
   */
  private log(event: Omit<SecurityEvent, 'timestamp'>): void {
    // Sanitize details before creating the event
    const sanitizedDetails = this.sanitizeDetails(event.details);

    const fullEvent: SecurityEvent = {
      ...event,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
    };

    const severityIcon = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '🚨',
    }[fullEvent.severity];

    const message = `[${fullEvent.timestamp}] ${severityIcon} [${fullEvent.severity.toUpperCase()}] ${fullEvent.type}: ${JSON.stringify(fullEvent.details)}`;

    // Log to output channel if available
    if (this.outputChannel) {
      this.outputChannel.appendLine(message);
    }

    // Also log to console for development
    console.log(`[Git ID Switcher Security] ${message}`);

    // Show notification for errors (without sensitive details)
    if (fullEvent.severity === 'error') {
      vscode.window.showWarningMessage(
        `Git ID Switcher Security: ${fullEvent.type} - Check Output panel for details`
      );
    }
  }

  /**
   * Log identity switch event
   */
  logIdentitySwitch(fromId: string | null, toId: string): void {
    this.log({
      type: SecurityEventType.IDENTITY_SWITCH,
      severity: 'info',
      details: {
        from: fromId ?? 'none',
        to: toId,
      },
    });
  }

  /**
   * Log SSH key load event
   */
  logSshKeyLoad(keyPath: string, success: boolean): void {
    this.log({
      type: SecurityEventType.SSH_KEY_LOAD,
      severity: success ? 'info' : 'warning',
      details: {
        keyPath: this.sanitizePath(keyPath),
        success,
      },
    });
  }

  /**
   * Log SSH key removal event
   */
  logSshKeyRemove(keyPath: string): void {
    this.log({
      type: SecurityEventType.SSH_KEY_REMOVE,
      severity: 'info',
      details: {
        keyPath: this.sanitizePath(keyPath),
      },
    });
  }

  /**
   * Log validation failure
   */
  logValidationFailure(field: string, reason: string, value?: unknown): void {
    // SECURITY: Sanitize value before logging to prevent information leakage
    const sanitizedValue = value !== undefined ? this.sanitizeValue(value) : undefined;

    this.log({
      type: SecurityEventType.VALIDATION_FAILURE,
      severity: 'warning',
      details: {
        field,
        reason,
        // Log sanitized value for debugging (safe for audit trail)
        value: sanitizedValue,
        valueType: typeof value,
      },
    });
  }

  /**
   * Log blocked command
   */
  logCommandBlocked(command: string, args: string[], reason: string): void {
    this.log({
      type: SecurityEventType.COMMAND_BLOCKED,
      severity: 'error',
      details: {
        // Sanitize command in case it contains sensitive data (e.g., in path)
        command: this.sanitizeValue(command),
        // Only show args count for security
        argsCount: args.length,
        reason,
      },
    });
  }

  /**
   * Log configuration change
   */
  logConfigChange(configKey: string): void {
    this.log({
      type: SecurityEventType.CONFIG_CHANGE,
      severity: 'info',
      details: {
        configKey,
      },
    });
  }

  /**
   * Log extension activation
   */
  logActivation(): void {
    this.log({
      type: SecurityEventType.EXTENSION_ACTIVATE,
      severity: 'info',
      details: {
        version: this.getExtensionVersion(),
      },
    });
  }

  /**
   * Log extension deactivation
   */
  logDeactivation(): void {
    this.log({
      type: SecurityEventType.EXTENSION_DEACTIVATE,
      severity: 'info',
      details: {},
    });
  }

  /**
   * Show the security log output channel
   */
  show(): void {
    if (this.outputChannel) {
      this.outputChannel.show();
    }
  }

  /**
   * Check if a path contains sensitive directory patterns
   * The input path should already be normalized (forward slashes only)
   */
  private containsSensitiveDir(normalizedPath: string): boolean {
    // DoS protection: limit iterations for very long paths
    if (normalizedPath.length > SECURITY_LIMITS.MAX_PATH_LENGTH) {
      return true; // Treat as sensitive if too long
    }

    const isWindows = process.platform === 'win32';
    const sensitiveDirs = isWindows ? SENSITIVE_DIRS_WINDOWS : SENSITIVE_DIRS_UNIX;

    // Path is already normalized to forward slashes
    const pathToCheck = isWindows ? normalizedPath.toLowerCase() : normalizedPath;

    for (const sensitiveDir of sensitiveDirs) {
      // Normalize the sensitive dir pattern to forward slashes
      const normalizedSensitive = isWindows
        ? sensitiveDir.replace(/\\/g, '/').toLowerCase()
        : sensitiveDir;

      // Check if path contains the sensitive directory as a component
      if (
        pathToCheck.includes(`/${normalizedSensitive}/`) ||
        pathToCheck.endsWith(`/${normalizedSensitive}`) ||
        pathToCheck === normalizedSensitive ||
        pathToCheck.startsWith(`${normalizedSensitive}/`)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a path matches sensitive file patterns
   */
  private matchesSensitivePattern(inputPath: string): boolean {
    // DoS protection: limit path length to check
    const pathToCheck =
      inputPath.length > SECURITY_LIMITS.MAX_PATTERN_CHECK_LENGTH
        ? inputPath.slice(0, SECURITY_LIMITS.MAX_PATTERN_CHECK_LENGTH)
        : inputPath;

    const filename = path.basename(pathToCheck);
    const fullPath = pathToCheck.toLowerCase();

    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(filename) || pattern.test(fullPath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Sanitize path for logging (don't expose full path structure)
   * This method is public so other modules can use it for consistent sanitization.
   *
   * Sensitive paths are redacted to prevent information leakage.
   * Home directory is replaced with ~ for privacy.
   */
  sanitizePath(inputPath: string): string {
    if (!inputPath || typeof inputPath !== 'string') {
      return '[INVALID_PATH]';
    }

    // DoS protection: limit path length
    if (inputPath.length > SECURITY_LIMITS.MAX_PATH_LENGTH) {
      return '[REDACTED:PATH_TOO_LONG]';
    }

    // Normalize path separators for consistent checking
    const normalizedPath = inputPath.replace(/\\/g, '/');

    // Check for sensitive patterns first (highest priority)
    if (this.matchesSensitivePattern(normalizedPath)) {
      return '[REDACTED:SENSITIVE_FILE]';
    }

    // Check for sensitive directories
    if (this.containsSensitiveDir(normalizedPath)) {
      return '[REDACTED:SENSITIVE_DIR]';
    }

    // Replace home directory with ~ for privacy
    const home = process.env.HOME || process.env.USERPROFILE || '';
    if (home) {
      const normalizedHome = home.replace(/\\/g, '/');
      if (normalizedPath.startsWith(normalizedHome)) {
        return '~' + normalizedPath.slice(normalizedHome.length);
      }
    }

    return inputPath;
  }

  /**
   * Check if a string looks like it might contain sensitive data
   */
  private looksLikeSensitiveData(value: string): boolean {
    // DoS protection: limit check length
    const checkValue =
      value.length > SECURITY_LIMITS.MAX_PATTERN_CHECK_LENGTH
        ? value.slice(0, SECURITY_LIMITS.MAX_PATTERN_CHECK_LENGTH)
        : value;

    const sensitiveKeywords = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token/i,
      /bearer/i,
      /authorization/i,
      /credential/i,
      /private/i,
    ];

    for (const keyword of sensitiveKeywords) {
      if (keyword.test(checkValue)) {
        return true;
      }
    }

    // Check for patterns that look like secrets (base64, hex, etc.)
    // Only check if string is within reasonable length to avoid ReDoS
    if (
      checkValue.length >= SECURITY_LIMITS.MIN_SECRET_LENGTH &&
      checkValue.length <= SECURITY_LIMITS.MAX_SECRET_LENGTH
    ) {
      if (/^[A-Za-z0-9+/=_-]+$/.test(checkValue)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Sanitize a value for safe logging
   * Removes or masks potentially sensitive information.
   *
   * Applies multiple layers of protection:
   * 1. Path sanitization for file paths
   * 2. Sensitive keyword detection
   * 3. Length truncation
   * 4. Object/array abstraction
   */
  sanitizeValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      // Empty strings are safe
      if (value.length === 0) {
        return value;
      }

      // Sanitize paths first
      if (value.startsWith('/') || value.startsWith('~') || /^[A-Za-z]:/.test(value)) {
        return this.sanitizePath(value);
      }

      // Check for sensitive-looking data
      if (this.looksLikeSensitiveData(value)) {
        return '[REDACTED:SENSITIVE_VALUE]';
      }

      // Truncate long strings for security
      if (value.length > SECURITY_LIMITS.MAX_LOG_STRING_LENGTH) {
        return (
          value.slice(0, SECURITY_LIMITS.MAX_LOG_STRING_LENGTH) +
          '...[truncated]'
        );
      }

      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'object') {
      // For arrays, show length only
      if (Array.isArray(value)) {
        return `[Array(${value.length})]`;
      }
      // For objects, show key count only
      const keys = Object.keys(value);
      return `[Object(${keys.length} keys)]`;
    }

    // For functions and symbols, just show type
    return `[${typeof value}]`;
  }

  /**
   * Get extension version
   */
  private getExtensionVersion(): string {
    try {
      const ext = vscode.extensions.getExtension('nullvariant.git-id-switcher');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return (ext?.packageJSON?.version as string) || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

/**
 * Singleton instance of security logger
 */
export const securityLogger = new SecurityLoggerImpl();
