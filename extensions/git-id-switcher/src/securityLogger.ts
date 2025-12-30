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
import { getVSCode } from './vscodeLoader';
import { MAX_ID_LENGTH } from './constants';
import { sanitizePath } from './pathSanitizer';
import { sanitizeValue, sanitizeDetails } from './sensitiveDataDetector';

// Re-export for backwards compatibility
export { sanitizePath } from './pathSanitizer';
export { sanitizeValue, sanitizeDetails, looksLikeSensitiveData } from './sensitiveDataDetector';

// Re-export types from configChangeDetector for backwards compatibility
export {
  CONFIG_KEYS,
  type ConfigKey,
  type ConfigSnapshot,
  type ConfigChangeDetail,
} from './configChangeDetector';

import { configChangeDetector } from './configChangeDetector';
import type { ConfigKey, ConfigSnapshot, ConfigChangeDetail } from './configChangeDetector';

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

/**
 * Security Logger interface for dependency injection
 */
export interface ISecurityLogger {
  logCommandTimeout(command: string, args: string[], timeoutMs: number, cwd?: string): void;
  logCommandBlocked(command: string, args: string[], reason: string): void;
}

/**
 * Security Logger class
 */
class SecurityLoggerImpl implements ISecurityLogger {
  private outputChannel: OutputChannel | null = null;
  private readonly channelName = 'Git ID Switcher Security';

  initialize(): void {
    if (!this.outputChannel) {
      const vscode = getVSCode();
      if (vscode) {
        this.outputChannel = vscode.window.createOutputChannel(this.channelName);
      }
    }
  }

  dispose(): void {
    if (this.outputChannel) {
      this.outputChannel.dispose();
      this.outputChannel = null;
    }
  }

  private log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const sanitizedDetails = sanitizeDetails(event.details);
    const fullEvent: SecurityEvent = {
      ...event,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
    };

    const severityIcon = { info: 'ℹ️', warning: '⚠️', error: '🚨' }[fullEvent.severity];
    const MAX_MESSAGE_SIZE = 10000;
    let message: string;
    try {
      const jsonStr = JSON.stringify(fullEvent.details);
      message = jsonStr.length > MAX_MESSAGE_SIZE
        ? `[${fullEvent.timestamp}] ${severityIcon} [${fullEvent.severity.toUpperCase()}] ${fullEvent.type}: ${jsonStr.slice(0, MAX_MESSAGE_SIZE)}...[truncated]`
        : `[${fullEvent.timestamp}] ${severityIcon} [${fullEvent.severity.toUpperCase()}] ${fullEvent.type}: ${jsonStr}`;
    } catch (error) {
      message = `[${fullEvent.timestamp}] ${severityIcon} [${fullEvent.severity.toUpperCase()}] ${fullEvent.type}: [Failed to serialize: ${String(error)}]`;
    }

    if (this.outputChannel) {
      this.outputChannel.appendLine(message);
    }
    console.log(`[Git ID Switcher Security] ${message}`);

    if (fullEvent.severity === 'error') {
      const vscode = getVSCode();
      if (vscode) {
        vscode.window.showWarningMessage(
          `Git ID Switcher Security: ${fullEvent.type} - Check Output panel for details`
        );
      }
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
        value: value !== undefined ? sanitizeValue(value) : undefined,
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

  private sanitizeConfigValue(key: ConfigKey, value: unknown): unknown {
    if (key === 'identities' && Array.isArray(value)) {
      return { count: value.length, ids: this.sanitizeIds(configChangeDetector.extractIdentityIds(value)) };
    }
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
      if (!vscode) return 'unknown';
      const ext = vscode.extensions.getExtension('nullvariant.git-id-switcher');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return (ext?.packageJSON?.version as string) || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

export const securityLogger = new SecurityLoggerImpl();
