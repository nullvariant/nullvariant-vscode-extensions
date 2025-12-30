/**
 * Security Audit Logger
 *
 * Records security-relevant events to VS Code Output Channel.
 * Provides visibility into extension operations for security auditing.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

import * as vscode from 'vscode';

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
   * Log a security event
   */
  private log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
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
      // SECURITY: Only show event type, not details which may contain sensitive info
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
        command,
        // Sanitize args in case they contain sensitive data
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
   * Sanitize path for logging (don't expose full path structure)
   * This method is public so other modules can use it for consistent sanitization.
   */
  sanitizePath(inputPath: string): string {
    // Replace home directory with ~
    const home = process.env.HOME || process.env.USERPROFILE || '';
    if (home && inputPath.startsWith(home)) {
      return '~' + inputPath.slice(home.length);
    }
    return inputPath;
  }

  /**
   * Sanitize a value for safe logging
   * Removes or masks potentially sensitive information.
   */
  sanitizeValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      // Sanitize paths
      if (value.startsWith('/') || value.startsWith('~') || /^[A-Za-z]:/.test(value)) {
        return this.sanitizePath(value);
      }
      // Truncate long strings
      if (value.length > 100) {
        return value.slice(0, 100) + '...[truncated]';
      }
      return value;
    }

    if (typeof value === 'object') {
      // Don't log complex objects - just indicate their type
      return `[${Array.isArray(value) ? 'Array' : 'Object'}]`;
    }

    return value;
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
