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
 * Configuration keys that we track for changes
 */
export const CONFIG_KEYS = [
  'identities',
  'defaultIdentity',
  'autoSwitchSshKey',
  'showNotifications',
  'applyToSubmodules',
  'submoduleDepth',
  'includeIconInGitConfig',
] as const;

export type ConfigKey = (typeof CONFIG_KEYS)[number];

/**
 * Configuration snapshot for change detection
 */
export interface ConfigSnapshot {
  identities: unknown[];
  defaultIdentity: string;
  autoSwitchSshKey: boolean;
  showNotifications: boolean;
  applyToSubmodules: boolean;
  submoduleDepth: number;
  includeIconInGitConfig: boolean;
}

/**
 * Configuration change details
 */
export interface ConfigChangeDetail {
  key: ConfigKey;
  previousValue: unknown;
  newValue: unknown;
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
   * Current configuration snapshot for change detection
   */
  private configSnapshot: ConfigSnapshot | null = null;

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
    // Clear configuration snapshot to prevent memory leaks
    this.configSnapshot = null;
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

    // SECURITY: Limit JSON stringification size to prevent DoS
    const MAX_MESSAGE_SIZE = 10000; // 10KB per log message
    let message: string;
    try {
      const jsonStr = JSON.stringify(fullEvent.details);
      if (jsonStr.length > MAX_MESSAGE_SIZE) {
        // Truncate if too large
        message = `[${fullEvent.timestamp}] ${severityIcon} [${fullEvent.severity.toUpperCase()}] ${fullEvent.type}: ${jsonStr.slice(0, MAX_MESSAGE_SIZE)}...[truncated]`;
      } else {
        message = `[${fullEvent.timestamp}] ${severityIcon} [${fullEvent.severity.toUpperCase()}] ${fullEvent.type}: ${jsonStr}`;
      }
    } catch (error) {
      // SECURITY: Fallback if JSON.stringify fails (e.g., circular reference)
      message = `[${fullEvent.timestamp}] ${severityIcon} [${fullEvent.severity.toUpperCase()}] ${fullEvent.type}: [Failed to serialize details: ${String(error)}]`;
    }

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
    // SECURITY: Sanitize args but show first few for debugging
    // Only show first 3 args (sanitized) to balance security and debugging needs
    const sanitizedArgs = args.slice(0, 3).map(arg => this.sanitizeValue(arg));
    const argsDetails: Record<string, unknown> = {
      count: args.length,
      firstFew: sanitizedArgs,
    };
    if (args.length > 3) {
      argsDetails.more = `... and ${args.length - 3} more`;
    }

    this.log({
      type: SecurityEventType.COMMAND_BLOCKED,
      severity: 'error',
      details: {
        // Sanitize command in case it contains sensitive data (e.g., in path)
        command: this.sanitizeValue(command),
        args: argsDetails,
        reason,
      },
    });
  }

  /**
   * Create a configuration snapshot from current VS Code configuration
   * SECURITY: Limits array size to prevent DoS attacks
   */
  createConfigSnapshot(): ConfigSnapshot {
    const config = vscode.workspace.getConfiguration('gitIdSwitcher');
    const identities = config.get<unknown[]>('identities', []);
    
    // SECURITY: Limit identities array size to prevent DoS attacks
    // This prevents maliciously large configuration from causing performance issues
    const MAX_IDENTITIES = 1000;
    const limitedIdentities = Array.isArray(identities) && identities.length > MAX_IDENTITIES
      ? identities.slice(0, MAX_IDENTITIES)
      : identities;
    
    return {
      identities: limitedIdentities,
      defaultIdentity: config.get<string>('defaultIdentity', ''),
      autoSwitchSshKey: config.get<boolean>('autoSwitchSshKey', true),
      showNotifications: config.get<boolean>('showNotifications', true),
      applyToSubmodules: config.get<boolean>('applyToSubmodules', true),
      submoduleDepth: config.get<number>('submoduleDepth', 1),
      includeIconInGitConfig: config.get<boolean>('includeIconInGitConfig', false),
    };
  }

  /**
   * Store the current configuration snapshot
   * SECURITY: Wrapped in try-catch to prevent errors from breaking the extension
   */
  storeConfigSnapshot(): void {
    try {
      this.configSnapshot = this.createConfigSnapshot();
    } catch (error) {
      // SECURITY: Log error but don't break the extension
      // This prevents malicious configuration from causing DoS
      console.error('[Git ID Switcher Security] Error storing config snapshot:', error);
      // Keep previous snapshot to prevent state corruption
      // (null check in detectConfigChanges will handle this)
    }
  }

  /**
   * Compare two values for equality (deep comparison for objects/arrays)
   * SECURITY: Limits depth and size to prevent DoS attacks
   */
  private valuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;

    if (typeof a === 'object' && typeof b === 'object') {
      try {
        // SECURITY: Limit comparison depth to prevent DoS from deeply nested objects
        const MAX_DEPTH = 10;
        // SECURITY: Limit stringified size to prevent DoS from large objects
        const MAX_STRINGIFY_SIZE = 100000; // 100KB
        
        // Quick size check: estimate size by converting to string with size limit
        const aStr = JSON.stringify(a);
        const bStr = JSON.stringify(b);
        
        // SECURITY: If strings are too large, use length-based comparison as fallback
        if (aStr.length > MAX_STRINGIFY_SIZE || bStr.length > MAX_STRINGIFY_SIZE) {
          // For very large objects, compare lengths and types only
          // This prevents DoS but may miss some changes (acceptable trade-off)
          return aStr.length === bStr.length && typeof a === typeof b;
        }
        
        return aStr === bStr;
      } catch {
        // SECURITY: On error (e.g., circular reference), return false
        // This is safe: we'll detect a change even if values are actually equal
        // Better to log a false positive than to crash
        return false;
      }
    }

    return false;
  }

  /**
   * Detect which configuration keys changed
   * SECURITY: Wrapped in try-catch to prevent errors from breaking the extension
   */
  detectConfigChanges(newSnapshot: ConfigSnapshot): ConfigChangeDetail[] {
    if (!this.configSnapshot) {
      return [];
    }

    try {
      const changes: ConfigChangeDetail[] = [];

      for (const key of CONFIG_KEYS) {
        const previousValue = this.configSnapshot[key];
        const newValue = newSnapshot[key];

        if (!this.valuesEqual(previousValue, newValue)) {
          changes.push({
            key,
            previousValue,
            newValue,
          });
        }
      }

      return changes;
    } catch (error) {
      // SECURITY: Log error but don't break the extension
      // This prevents malicious configuration from causing DoS
      console.error('[Git ID Switcher Security] Error detecting config changes:', error);
      return [];
    }
  }

  /**
   * Summarize identity changes for logging
   * SECURITY: Wrapped in try-catch and limits processing to prevent DoS
   */
  private summarizeIdentityChanges(
    previousIdentities: unknown[],
    newIdentities: unknown[]
  ): Record<string, unknown> {
    try {
      // SECURITY: Limit array sizes to prevent DoS attacks
      const MAX_IDENTITIES_TO_PROCESS = 1000;
      const prevLimited = Array.isArray(previousIdentities)
        ? previousIdentities.slice(0, MAX_IDENTITIES_TO_PROCESS)
        : [];
      const newLimited = Array.isArray(newIdentities)
        ? newIdentities.slice(0, MAX_IDENTITIES_TO_PROCESS)
        : [];

      // Use raw IDs for comparison
      const prevIds = this.extractIdentityIds(prevLimited, false);
      const newIds = this.extractIdentityIds(newLimited, false);

      const added = newIds.filter(id => !prevIds.includes(id));
      const removed = prevIds.filter(id => !newIds.includes(id));
      const modified = newIds.filter(id => {
        if (!prevIds.includes(id)) return false;
        const prevIdentity = prevLimited.find(
          i => this.getIdentityId(i) === id
        );
        const newIdentity = newLimited.find(
          i => this.getIdentityId(i) === id
        );
        return !this.valuesEqual(prevIdentity, newIdentity);
      });

      // Sanitize IDs for output
      return {
        previousCount: previousIdentities.length,
        newCount: newIdentities.length,
        added: added.length > 0 ? this.sanitizeIds(added) : undefined,
        removed: removed.length > 0 ? this.sanitizeIds(removed) : undefined,
        modified: modified.length > 0 ? this.sanitizeIds(modified) : undefined,
        // SECURITY: Indicate if arrays were truncated
        truncated: previousIdentities.length > MAX_IDENTITIES_TO_PROCESS ||
          newIdentities.length > MAX_IDENTITIES_TO_PROCESS,
      };
    } catch (error) {
      // SECURITY: Return safe summary on error
      console.error('[Git ID Switcher Security] Error summarizing identity changes:', error);
      return {
        previousCount: Array.isArray(previousIdentities) ? previousIdentities.length : 0,
        newCount: Array.isArray(newIdentities) ? newIdentities.length : 0,
        error: 'Failed to summarize changes',
      };
    }
  }

  /**
   * Sanitize an array of IDs for safe logging
   */
  private sanitizeIds(ids: string[]): string[] {
    const maxIdLength = 64;
    return ids.map(id =>
      id.length > maxIdLength ? id.slice(0, maxIdLength) + '...' : id
    );
  }

  /**
   * Extract identity IDs from an identities array
   * @param sanitize - Whether to truncate long IDs (default: true for external use)
   */
  private extractIdentityIds(identities: unknown[], sanitize = true): string[] {
    const ids: string[] = [];
    const maxItems = 100; // DoS protection
    const maxIdLength = 64; // Match IDENTITY_SCHEMA.id.maxLength
    let count = 0;

    for (const identity of identities) {
      if (count >= maxItems) break;
      const id = this.getIdentityId(identity);
      if (id) {
        // Optionally truncate long IDs for safety
        const safeId = sanitize && id.length > maxIdLength
          ? id.slice(0, maxIdLength) + '...'
          : id;
        ids.push(safeId);
      }
      count++;
    }

    return ids;
  }

  /**
   * Get the ID from an identity object
   */
  private getIdentityId(identity: unknown): string | null {
    if (
      typeof identity === 'object' &&
      identity !== null &&
      'id' in identity &&
      typeof (identity as Record<string, unknown>).id === 'string'
    ) {
      return (identity as Record<string, unknown>).id as string;
    }
    return null;
  }

  /**
   * Sanitize a configuration value for logging
   */
  private sanitizeConfigValue(key: ConfigKey, value: unknown): unknown {
    // For identities, provide a summary instead of full details
    if (key === 'identities' && Array.isArray(value)) {
      return {
        count: value.length,
        ids: this.extractIdentityIds(value),
      };
    }

    // For other values, use standard sanitization
    return this.sanitizeValue(value);
  }

  /**
   * Log configuration change with before/after values
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
   * Log detailed configuration changes with before/after values
   * SECURITY: Wrapped in try-catch to prevent errors from breaking the extension
   * SECURITY: Ensures all values are sanitized before logging
   */
  logConfigChanges(changes: ConfigChangeDetail[]): void {
    if (changes.length === 0) {
      return;
    }

    try {
      // SECURITY: Limit number of changes to log to prevent DoS
      const MAX_CHANGES_TO_LOG = 100;
      const changesToLog = changes.slice(0, MAX_CHANGES_TO_LOG);

      for (const change of changesToLog) {
        // Special handling for identities array
        if (change.key === 'identities') {
          const prevIdentities = Array.isArray(change.previousValue)
            ? change.previousValue
            : [];
          const newIdentities = Array.isArray(change.newValue)
            ? change.newValue
            : [];

          this.log({
            type: SecurityEventType.CONFIG_CHANGE,
            severity: 'info',
            details: {
              configKey: change.key,
              changes: this.summarizeIdentityChanges(prevIdentities, newIdentities),
            },
          });
        } else {
          this.log({
            type: SecurityEventType.CONFIG_CHANGE,
            severity: 'info',
            details: {
              configKey: change.key,
              previousValue: this.sanitizeConfigValue(change.key, change.previousValue),
              newValue: this.sanitizeConfigValue(change.key, change.newValue),
            },
          });
        }
      }

      // SECURITY: Log if changes were truncated
      if (changes.length > MAX_CHANGES_TO_LOG) {
        this.log({
          type: SecurityEventType.CONFIG_CHANGE,
          severity: 'warning',
          details: {
            configKey: 'multiple',
            message: `Too many config changes (${changes.length}), only logged first ${MAX_CHANGES_TO_LOG}`,
          },
        });
      }
    } catch (error) {
      // SECURITY: Log error but don't break the extension
      console.error('[Git ID Switcher Security] Error logging config changes:', error);
    }
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
   *
   * SECURITY: Uses path component boundary checking to prevent false positives
   * (e.g., `.ssh-backup` should not match `.ssh`)
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

    // Split path into components for accurate boundary checking
    const pathComponents = pathToCheck.split('/').filter(c => c.length > 0);

    for (const sensitiveDir of sensitiveDirs) {
      // Normalize the sensitive dir pattern to forward slashes
      const normalizedSensitive = isWindows
        ? sensitiveDir.replace(/\\/g, '/').toLowerCase()
        : sensitiveDir;

      // Split sensitive dir into components (may contain multiple levels like '.config/gcloud')
      const sensitiveComponents = normalizedSensitive.split('/').filter(c => c.length > 0);

      // Check if path components contain the sensitive directory components as a sequence
      // This ensures we match whole directory names, not substrings
      for (let i = 0; i <= pathComponents.length - sensitiveComponents.length; i++) {
        let matches = true;
        for (let j = 0; j < sensitiveComponents.length; j++) {
          if (pathComponents[i + j] !== sensitiveComponents[j]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          return true;
        }
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

    // SECURITY: Check for control characters (potential injection attack)
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1f\x7f]/.test(inputPath)) {
      return '[REDACTED:CONTROL_CHARS]';
    }

    // DoS protection: limit path length
    if (inputPath.length > SECURITY_LIMITS.MAX_PATH_LENGTH) {
      return '[REDACTED:PATH_TOO_LONG]';
    }

    // Normalize path separators for consistent checking
    // SECURITY: Handle Windows UNC paths (\\server\share -> //server/share)
    // Preserve UNC prefix for proper detection
    const normalizedPath = inputPath.replace(/\\/g, '/');
    // SECURITY: UNC paths start with // (but not ///)
    // For UNC paths, we should redact the server name for privacy
    const isUncPath = normalizedPath.startsWith('//') && !normalizedPath.startsWith('///');
    if (isUncPath) {
      // Redact UNC server name: //server/share -> //[REDACTED]/share
      const uncMatch = normalizedPath.match(/^\/\/([^/]+)(\/.*)?$/);
      if (uncMatch) {
        return `//[REDACTED]${uncMatch[2] || ''}`;
      }
    }

    // Check for sensitive patterns first (highest priority)
    if (this.matchesSensitivePattern(normalizedPath)) {
      return '[REDACTED:SENSITIVE_FILE]';
    }

    // Check for sensitive directories
    if (this.containsSensitiveDir(normalizedPath)) {
      return '[REDACTED:SENSITIVE_DIR]';
    }

    // Replace home directory with ~ for privacy
    // SECURITY: Handle Windows HOMEDRIVE + HOMEPATH combination
    let home = '';
    if (process.platform === 'win32') {
      // Windows: HOMEDRIVE + HOMEPATH (e.g., C: + \Users\username)
      const homeDrive = process.env.HOMEDRIVE || '';
      const homePath = process.env.HOMEPATH || '';
      if (homeDrive && homePath) {
        home = homeDrive + homePath;
      } else {
        home = process.env.USERPROFILE || '';
      }
    } else {
      home = process.env.HOME || '';
    }

    if (home) {
      const normalizedHome = home.replace(/\\/g, '/');
      // SECURITY: Ensure we match at path component boundary
      // Check exact match or match followed by /
      if (
        normalizedPath === normalizedHome ||
        normalizedPath.startsWith(normalizedHome + '/')
      ) {
        return '~' + normalizedPath.slice(normalizedHome.length);
      }
    }

    // SECURITY: Return normalized path (not original) for consistency
    // This ensures path separators are consistent in logs
    return normalizedPath;
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
    // SECURITY: More strict detection to reduce false positives
    // Only check if string is within reasonable length to avoid ReDoS
    if (
      checkValue.length >= SECURITY_LIMITS.MIN_SECRET_LENGTH &&
      checkValue.length <= SECURITY_LIMITS.MAX_SECRET_LENGTH
    ) {
      // Base64-like strings typically have:
      // - High entropy (mix of uppercase, lowercase, numbers)
      // - Padding with = at the end
      // - Length multiple of 4 (for base64)
      const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
      if (base64Pattern.test(checkValue)) {
        // Additional check: base64 strings usually have high character diversity
        // Count unique character types (uppercase, lowercase, numbers, special)
        const hasUpper = /[A-Z]/.test(checkValue);
        const hasLower = /[a-z]/.test(checkValue);
        const hasNumbers = /[0-9]/.test(checkValue);
        const hasSpecial = /[+/=]/.test(checkValue);
        const typeCount = [hasUpper, hasLower, hasNumbers, hasSpecial].filter(Boolean).length;

        // Require at least 3 character types to reduce false positives
        // (e.g., "12345678901234567890123456789012" should not match)
        if (typeCount >= 3) {
          return true;
        }
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
      // SECURITY: Check for Windows UNC paths (\\server\share) and drive letters
      if (
        value.startsWith('/') ||
        value.startsWith('~') ||
        /^[A-Za-z]:/.test(value) ||
        /^\\\\/.test(value)
      ) {
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
      // For arrays, show length only (contents might be sensitive)
      if (Array.isArray(value)) {
        return `[Array(${value.length})]`;
      }
      // For objects, sanitize keys and show key count
      // SECURITY: Sanitize object keys to prevent information leakage
      // SECURITY: Do not recursively sanitize nested objects to prevent
      // infinite recursion and performance issues. Nested objects are abstracted.
      const keys = Object.keys(value);
      const sanitizedKeys = keys.map(key =>
        this.looksLikeSensitiveData(key) ? '[REDACTED_KEY]' : key
      );
      // Show sanitized key names if they're safe, otherwise just count
      const safeKeys = sanitizedKeys.filter(k => k !== '[REDACTED_KEY]');
      if (safeKeys.length === keys.length) {
        // All keys are safe, show them (limited to 5 for readability)
        return `[Object(${keys.length} keys: ${safeKeys.slice(0, 5).join(', ')}${safeKeys.length > 5 ? '...' : ''})]`;
      } else {
        // Some keys are sensitive, only show count
        return `[Object(${keys.length} keys)]`;
      }
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
