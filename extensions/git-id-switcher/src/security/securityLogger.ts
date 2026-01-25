/**
 * Security Audit Logger
 *
 * Records security-relevant events to VS Code Output Channel.
 * Provides visibility into extension operations for security auditing.
 *
 * @see https://owasp.org/www-project-application-security-verification-standard/
 */

// Type-only import (stripped at compile time, no runtime dependency)
import type { OutputChannel } from 'vscode';
import { getVSCode } from '../core/vscodeLoader';
import { MAX_ID_LENGTH } from '../core/constants';
import { sanitizePath } from './pathSanitizer';
import { sanitizeValue, sanitizeDetails, type SanitizeOptions } from './sensitiveDataDetector';
import { expandTilde } from './pathUtils';
import * as path from 'node:path';
import { isSecurePath, isSecureLogPath } from './pathValidator';
import {
  LogLevel,
  type StructuredLog,
  type ILogWriter,
  type FileLogConfig,
  DEFAULT_FILE_LOG_CONFIG,
  severityToLogLevel,
  shouldLog,
  parseLogLevel,
} from '../logging/logTypes';
import { FileLogWriter } from '../logging/fileLogWriter';

// Re-export for backwards compatibility
export { sanitizePath } from './pathSanitizer';
export { sanitizeValue, sanitizeDetails, looksLikeSensitiveData, type SanitizeOptions } from './sensitiveDataDetector';

// Re-export types from configChangeDetector for backwards compatibility
export {
  CONFIG_KEYS,
  type ConfigKey,
  type ConfigSnapshot,
  type ConfigChangeDetail,
} from '../core/configChangeDetector';

import { configChangeDetector } from '../core/configChangeDetector';
import type { ConfigKey, ConfigSnapshot, ConfigChangeDetail } from '../core/configChangeDetector';

/**
 * Security event types
 */
export enum SecurityEventType {
  IDENTITY_SWITCH = 'IDENTITY_SWITCH',
  SSH_KEY_LOAD = 'SSH_KEY_LOAD',
  SSH_KEY_REMOVE = 'SSH_KEY_REMOVE',
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  COMMAND_BLOCKED = 'COMMAND_BLOCKED',
  COMMAND_TIMEOUT = 'COMMAND_TIMEOUT',
  COMMAND_ERROR = 'COMMAND_ERROR',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  EXTENSION_ACTIVATE = 'EXTENSION_ACTIVATE',
  EXTENSION_DEACTIVATE = 'EXTENSION_DEACTIVATE',
}

export type Severity = 'info' | 'warning' | 'error';

export interface SecurityEvent {
  timestamp: string;
  type: SecurityEventType;
  severity: Severity;
  details: Record<string, unknown>;
}

// Re-export LogLevel for external use
export { LogLevel } from '../logging/logTypes';

/**
 * Security Logger interface for dependency injection
 */
export interface ISecurityLogger {
  logCommandTimeout(command: string, args: string[], timeoutMs: number, cwd?: string): void;
  logCommandBlocked(command: string, args: string[], reason: string): void;
  logCommandError(command: string, args: string[], error: Error, cwd?: string): void;
  logValidationFailure(field: string, reason: string, value?: unknown): void;
}

/**
 * Security Logger class
 */
class SecurityLoggerImpl implements ISecurityLogger {
  private outputChannel: OutputChannel | null = null;
  private readonly channelName = 'Git ID Switcher Security';
  private fileLogWriter: ILogWriter | null = null;
  private minLogLevel: LogLevel = LogLevel.INFO;
  private globalStorageUri: string | null = null;
  private sanitizeOptions: SanitizeOptions = {};

  /**
   * Initialize with extension context for secure file logging
   *
   * SECURITY: This method must be called with the extension context
   * to enable secure file logging. The globalStorageUri is used as
   * the only allowed directory for log files, ignoring workspace settings.
   *
   * @param globalStoragePath - The path from context.globalStorageUri.fsPath
   */
  /* c8 ignore start - VS Code extension context only (not available in unit tests) */
  initializeWithContext(globalStoragePath: string): void {
    this.globalStorageUri = globalStoragePath;
    this.initialize();
  }
  /* c8 ignore stop */

  initialize(): void {
    if (!this.outputChannel) {
      const vscode = getVSCode();
      if (vscode) {
        this.outputChannel = vscode.window.createOutputChannel(this.channelName);
        this.initializeFileLogging();
      }
    }
  }

  private initializeFileLogging(): void {
    const vscode = getVSCode();
    if (!vscode) return;

    const config = vscode.workspace.getConfiguration('gitIdSwitcher.logging');

    // Get redactAllSensitive setting for maximum privacy mode
    const redactAllSensitive = config.get<boolean>('redactAllSensitive', false);
    this.sanitizeOptions = { redactAllSensitive };

    // SECURITY: Ignore workspace setting for filePath
    // Always use globalStorageUri to prevent arbitrary file write attacks
    // via malicious .vscode/settings.json
    let secureFilePath = '';
    /* c8 ignore start - globalStorageUri is only set via initializeWithContext (VS Code extension context) */
    if (this.globalStorageUri) {
      // Use fixed path under globalStorageUri
      // IMPORTANT: Use path.join for cross-platform compatibility (Windows uses \)
      secureFilePath = path.join(this.globalStorageUri, 'logs', 'security.log');

      // Validate using isSecureLogPath with symlink detection
      const pathResult = isSecureLogPath(secureFilePath, this.globalStorageUri);
      if (!pathResult.valid) {
        console.error(`[Git ID Switcher] Invalid log file path: ${pathResult.reason}`);
        return;
      }
      secureFilePath = pathResult.resolvedPath || secureFilePath;
    } /* c8 ignore stop */ else /* c8 ignore start */ {
      // Fallback: use workspace setting but validate strictly
      const rawFilePath = config.get<string>('filePath', DEFAULT_FILE_LOG_CONFIG.filePath);
      const expandedPath = rawFilePath ? expandTilde(rawFilePath) : '';

      if (expandedPath) {
        const pathResult = isSecurePath(expandedPath);
        if (!pathResult.valid) {
          console.error(`[Git ID Switcher] Invalid log file path: ${pathResult.reason}`);
          return;
        }
        secureFilePath = expandedPath;
      }
    } /* c8 ignore stop */

    const fileConfig: FileLogConfig = {
      enabled: config.get<boolean>('fileEnabled', DEFAULT_FILE_LOG_CONFIG.enabled),
      filePath: secureFilePath,
      maxFileSizeBytes: config.get<number>('maxFileSize', DEFAULT_FILE_LOG_CONFIG.maxFileSizeBytes),
      maxFiles: config.get<number>('maxFiles', DEFAULT_FILE_LOG_CONFIG.maxFiles),
    };

    const levelStr = config.get<string>('level', 'INFO');
    this.minLogLevel = parseLogLevel(levelStr, LogLevel.INFO);

    if (fileConfig.enabled && fileConfig.filePath) {
      this.fileLogWriter = new FileLogWriter(fileConfig);
    }
  }

  dispose(): void {
    if (this.outputChannel) {
      this.outputChannel.dispose();
      this.outputChannel = null;
    }
    if (this.fileLogWriter) {
      this.fileLogWriter.dispose();
      this.fileLogWriter = null;
    }
  }

  private log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const sanitizedDetails = sanitizeDetails(event.details, this.sanitizeOptions);
    const timestamp = new Date().toISOString();
    const fullEvent: SecurityEvent = {
      ...event,
      details: sanitizedDetails,
      timestamp,
    };

    const logLevel = severityToLogLevel(event.severity);

    // Write to file if enabled and meets minimum level
    this.writeToFile(logLevel, timestamp, event.type, sanitizedDetails);

    // Write to OutputChannel and console
    this.writeToOutputChannel(fullEvent);

    // Show notification for errors
    if (fullEvent.severity === 'error') {
      this.showErrorNotification(fullEvent.type);
    }
  }

  /**
   * Write structured log to file
   */
  private writeToFile(
    logLevel: LogLevel,
    timestamp: string,
    eventType: SecurityEventType,
    metadata: Record<string, unknown>
  ): void {
    if (this.fileLogWriter && shouldLog(logLevel, this.minLogLevel)) {
      const structuredLog: StructuredLog = {
        timestamp,
        level: logLevel,
        category: 'SECURITY',
        message: eventType,
        metadata,
      };
      this.fileLogWriter.write(structuredLog);
    }
  }

  /**
   * Write formatted message to OutputChannel and console
   */
  private writeToOutputChannel(event: SecurityEvent): void {
    const severityIcon = { info: 'ℹ️', warning: '⚠️', error: '🚨' }[event.severity];
    const MAX_MESSAGE_SIZE = 10000;
    let message: string;
    try {
      const jsonStr = JSON.stringify(event.details);
      message = jsonStr.length > MAX_MESSAGE_SIZE
        ? `[${event.timestamp}] ${severityIcon} [${event.severity.toUpperCase()}] ${event.type}: ${jsonStr.slice(0, MAX_MESSAGE_SIZE)}...[truncated]`
        : `[${event.timestamp}] ${severityIcon} [${event.severity.toUpperCase()}] ${event.type}: ${jsonStr}`;
    } catch (error) /* c8 ignore start */ {
      message = `[${event.timestamp}] ${severityIcon} [${event.severity.toUpperCase()}] ${event.type}: [Failed to serialize: ${String(error)}]`;
    } /* c8 ignore stop */

    if (this.outputChannel) {
      this.outputChannel.appendLine(message);
    }
    console.log(`[Git ID Switcher Security] ${message}`);
  }

  /**
   * Show error notification to user
   */
  private showErrorNotification(eventType: SecurityEventType): void {
    const vscode = getVSCode();
    if (vscode) {
      vscode.window.showWarningMessage(
        `Git ID Switcher Security: ${eventType} - Check Output panel for details`
      );
    }
  }

  logIdentitySwitch(fromId: string | null, toId: string): void {
    this.log({
      type: SecurityEventType.IDENTITY_SWITCH,
      severity: 'info',
      details: { from: fromId ?? 'none', to: toId },
    });
  }

  logSshKeyLoad(keyPath: string, success: boolean): void {
    this.log({
      type: SecurityEventType.SSH_KEY_LOAD,
      severity: success ? 'info' : 'warning',
      details: { keyPath: sanitizePath(keyPath), success },
    });
  }

  logSshKeyRemove(keyPath: string): void {
    this.log({
      type: SecurityEventType.SSH_KEY_REMOVE,
      severity: 'info',
      details: { keyPath: sanitizePath(keyPath) },
    });
  }

  logValidationFailure(field: string, reason: string, value?: unknown): void {
    this.log({
      type: SecurityEventType.VALIDATION_FAILURE,
      severity: 'warning',
      details: {
        field,
        reason,
        value: value === undefined ? undefined : sanitizeValue(value),
        valueType: typeof value,
      },
    });
  }

  private buildArgsDetails(args: string[]): Record<string, unknown> {
    const sanitizedArgs = args.slice(0, 3).map(arg => sanitizeValue(arg));
    const result: Record<string, unknown> = { count: args.length, firstFew: sanitizedArgs };
    if (args.length > 3) {
      result.more = `... and ${args.length - 3} more`;
    }
    return result;
  }

  logCommandBlocked(command: string, args: string[], reason: string): void {
    this.log({
      type: SecurityEventType.COMMAND_BLOCKED,
      severity: 'error',
      details: { command: sanitizeValue(command), args: this.buildArgsDetails(args), reason },
    });
  }

  logCommandTimeout(command: string, args: string[], timeoutMs: number, cwd?: string): void {
    this.log({
      type: SecurityEventType.COMMAND_TIMEOUT,
      severity: 'warning',
      details: {
        command: sanitizeValue(command),
        args: this.buildArgsDetails(args),
        timeoutMs,
        cwd: cwd ? sanitizePath(cwd) : undefined,
      },
    });
  }

  logCommandError(command: string, args: string[], error: Error, cwd?: string): void {
    this.log({
      type: SecurityEventType.COMMAND_ERROR,
      severity: 'warning',
      details: {
        command: sanitizeValue(command),
        args: this.buildArgsDetails(args),
        errorName: error.name,
        errorMessage: sanitizeValue(error.message),
        cwd: cwd ? sanitizePath(cwd) : undefined,
      },
    });
  }

  // Delegation to ConfigChangeDetector for backwards compatibility
  createConfigSnapshot(): ConfigSnapshot {
    return configChangeDetector.createSnapshot();
  }

  storeConfigSnapshot(): void {
    configChangeDetector.storeSnapshot();
  }

  detectConfigChanges(newSnapshot: ConfigSnapshot): ConfigChangeDetail[] {
    return configChangeDetector.detectChanges(newSnapshot);
  }

  private sanitizeIds(ids: string[]): string[] {
    return ids.map(id => id.length > MAX_ID_LENGTH ? id.slice(0, MAX_ID_LENGTH) + '...' : id);
  }

  /**
   * Sanitize config value for logging
   * Note: identities are handled separately via buildIdentityChangeDetails()
   */
  private sanitizeConfigValue(_key: ConfigKey, value: unknown): unknown {
    return sanitizeValue(value);
  }

  logConfigChange(configKey: string): void {
    this.log({
      type: SecurityEventType.CONFIG_CHANGE,
      severity: 'info',
      details: { configKey },
    });
  }

  logConfigChanges(changes: ConfigChangeDetail[]): void {
    if (changes.length === 0) return;
    const MAX_CHANGES = 100;
    for (const change of changes.slice(0, MAX_CHANGES)) {
      const details = change.key === 'identities'
        ? this.buildIdentityChangeDetails(change)
        : { configKey: change.key, previousValue: this.sanitizeConfigValue(change.key, change.previousValue), newValue: this.sanitizeConfigValue(change.key, change.newValue) };
      this.log({ type: SecurityEventType.CONFIG_CHANGE, severity: 'info', details });
    }
    if (changes.length > MAX_CHANGES) {
      this.log({ type: SecurityEventType.CONFIG_CHANGE, severity: 'warning', details: { message: `Truncated (${changes.length})` } });
    }
  }

  private buildIdentityChangeDetails(change: ConfigChangeDetail): Record<string, unknown> {
    const prev = Array.isArray(change.previousValue) ? change.previousValue : [];
    const next = Array.isArray(change.newValue) ? change.newValue : [];
    const s = configChangeDetector.summarizeIdentityChanges(prev, next);
    return {
      configKey: change.key,
      changes: {
        previousCount: s.previousCount, newCount: s.newCount,
        added: s.added.length > 0 ? this.sanitizeIds(s.added) : undefined,
        removed: s.removed.length > 0 ? this.sanitizeIds(s.removed) : undefined,
        modified: s.modified.length > 0 ? this.sanitizeIds(s.modified) : undefined,
      },
    };
  }

  logActivation(): void {
    this.log({
      type: SecurityEventType.EXTENSION_ACTIVATE,
      severity: 'info',
      details: { version: this.getExtensionVersion() },
    });
  }

  logDeactivation(): void {
    this.log({ type: SecurityEventType.EXTENSION_DEACTIVATE, severity: 'info', details: {} });
  }

  show(): void {
    if (this.outputChannel) {
      this.outputChannel.show();
    }
  }

  private getExtensionVersion(): string {
    try {
      const vscode = getVSCode();
      /* c8 ignore next */
      if (!vscode) return 'unknown';
      const ext = vscode.extensions.getExtension('nullvariant.git-id-switcher');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return (ext?.packageJSON?.version as string) || 'unknown';
    } catch /* c8 ignore start */ {
      return 'unknown';
    } /* c8 ignore stop */
  }
}

export const securityLogger = new SecurityLoggerImpl();
