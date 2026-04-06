/**
 * Extension Logger
 *
 * Lightweight OutputChannel-based logger for extension lifecycle events.
 * Uses VS Code's OutputChannel as the proper logging mechanism instead of
 * console.log/debug, which ESLint's no-console rule correctly discourages.
 *
 * When VS Code API is unavailable (test environment), log calls are no-ops.
 *
 * @module logging/extensionLogger
 */

// Type-only import (stripped at compile time, no runtime dependency)
import type { OutputChannel } from 'vscode';
import { getWindow } from '../core/vscodeLoader';

/** OutputChannel name visible in VS Code's "Output" panel */
const CHANNEL_NAME = 'Git ID Switcher';

/** Extension name prefix for log messages */
const PREFIX = '[Git ID Switcher]';

/**
 * Extension logger interface
 */
export interface IExtensionLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
  dispose(): void;
}

class ExtensionLoggerImpl implements IExtensionLogger {
  private outputChannel: OutputChannel | null = null;
  private initialized = false;
  private disposed = false;

  /**
   * Lazily create the OutputChannel on first use.
   * In test environments (no VS Code API), this is a no-op.
   */
  private ensureInitialized(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    const window = getWindow();
    if (window) {
      this.outputChannel = window.createOutputChannel(CHANNEL_NAME);
    }
  }

  /**
   * Log an informational message (normal lifecycle events).
   * Maps to OutputChannel.appendLine().
   */
  info(message: string): void {
    if (this.disposed) return;
    this.ensureInitialized();
    this.outputChannel?.appendLine(`${PREFIX} ${message}`);
  }

  /**
   * Log a warning message (non-fatal issues that deserve attention).
   * Maps to OutputChannel.appendLine() with [warn] prefix.
   */
  warn(message: string): void {
    if (this.disposed) return;
    this.ensureInitialized();
    this.outputChannel?.appendLine(`${PREFIX} [warn] ${message}`);
  }

  /**
   * Log an error message (failures that affect functionality).
   * Maps to OutputChannel.appendLine() with [error] prefix.
   */
  error(message: string): void {
    if (this.disposed) return;
    this.ensureInitialized();
    this.outputChannel?.appendLine(`${PREFIX} [error] ${message}`);
  }

  /**
   * Log a debug-level message (cancellation traces, diagnostic info).
   * Maps to OutputChannel.appendLine() with [debug] prefix.
   */
  debug(message: string): void {
    if (this.disposed) return;
    this.ensureInitialized();
    this.outputChannel?.appendLine(`${PREFIX} [debug] ${message}`);
  }

  dispose(): void {
    this.disposed = true;
    if (this.outputChannel) {
      this.outputChannel.dispose();
      this.outputChannel = null;
    }
    this.initialized = false;
  }

  /** @internal Test-only: reset all internal state so the singleton can be reused across tests */
  _resetForTest(): void {
    this.outputChannel?.dispose();
    this.disposed = false;
    this.initialized = false;
    this.outputChannel = null;
  }
}

/** Singleton instance */
export const extensionLogger = new ExtensionLoggerImpl();
