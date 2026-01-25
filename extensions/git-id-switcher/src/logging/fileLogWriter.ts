/**
 * File Log Writer
 *
 * Writes structured logs to files with rotation support.
 * Provides file-based log persistence for audit trails.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { StructuredLog, ILogWriter, FileLogConfig } from './logTypes';
import { isSecurePath } from '../security/pathValidator';

/**
 * File log writer with rotation support
 *
 * Responsibilities (SRP):
 * - Write logs to file
 * - Rotate files when size limit reached
 * - Clean up old log files
 */
export class FileLogWriter implements ILogWriter {
  private readonly config: FileLogConfig;
  private currentFilePath: string = '';
  private writeStream: fs.WriteStream | null = null;
  private currentFileSize: number = 0;
  private initialized: boolean = false;
  private rotationRetryCount: number = 0;
  /**
   * Maximum number of rotation retry attempts
   *
   * Set to 3 to allow for transient filesystem errors while preventing
   * infinite loops in case of persistent issues (e.g., disk full, permissions).
   */
  private readonly MAX_ROTATION_RETRIES = 3;

  constructor(config: FileLogConfig) {
    this.config = config;
  }

  /**
   * Initialize the log writer
   * Creates log directory and opens write stream
   */
  private initialize(): boolean {
    if (this.initialized || !this.config.enabled || !this.config.filePath) {
      return this.initialized;
    }

    try {
      // Validate file path for security
      const pathResult = isSecurePath(this.config.filePath);
      if (!pathResult.valid) {
        console.error(`[Git ID Switcher] Invalid log file path: ${pathResult.reason}`);
        return false;
      }

      const logDir = path.dirname(this.config.filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      this.currentFilePath = this.config.filePath;
      this.openWriteStream();
      this.initialized = true;
      return true;
    } catch (error) /* c8 ignore start */ {
      console.error('[Git ID Switcher] Failed to initialize file logger:', error);
      return false;
    } /* c8 ignore stop */
  }

  /**
   * Open write stream for current log file
   */
  private openWriteStream(): void {
    /* c8 ignore start - Close existing stream edge case (requires multiple openWriteStream calls) */
    if (this.writeStream) {
      this.writeStream.end();
    }
    /* c8 ignore stop */

    try {
      if (fs.existsSync(this.currentFilePath)) {
        const stats = fs.statSync(this.currentFilePath);
        this.currentFileSize = stats.size;
      } else {
        this.currentFileSize = 0;
      }

      this.writeStream = fs.createWriteStream(this.currentFilePath, { flags: 'a' });
      /* c8 ignore start - Stream error handler for unexpected I/O errors */
      this.writeStream.on('error', (error) => {
        console.error('[Git ID Switcher] File log write error:', error);
        // Close stream on error to prevent further writes
        this.writeStream = null;
        // Attempt to reinitialize on next write
        this.initialized = false;
      });
      /* c8 ignore stop */
    } catch (error) /* c8 ignore start */ {
      console.error('[Git ID Switcher] Failed to open log file:', error);
      this.writeStream = null;
    } /* c8 ignore stop */
  }

  /**
   * Write a structured log entry to file
   */
  write(log: StructuredLog): void {
    if (!this.config.enabled) {
      return;
    }

    if (!this.initialized && !this.initialize()) {
      return;
    }

    /* c8 ignore next 3 - Write stream not available (edge case) */
    if (!this.writeStream) {
      return;
    }

    try {
      const line = this.formatLogLine(log);
      const lineBytes = Buffer.byteLength(line, 'utf8');

      if (this.currentFileSize + lineBytes > this.config.maxFileSizeBytes) {
        this.rotate();
      }

      this.writeStream.write(line);
      this.currentFileSize += lineBytes;
    } catch (error) /* c8 ignore start */ {
      console.error('[Git ID Switcher] Failed to write log:', error);
    } /* c8 ignore stop */
  }

  /**
   * Serialize metadata with circular reference handling
   *
   * Attempts to serialize metadata, falling back to partial serialization
   * if full serialization fails (e.g., circular references).
   *
   * Separated from formatLogLine() for Single Responsibility Principle.
   */
  private serializeMetadata(metadata: Record<string, unknown>): string {
    try {
      return ` ${JSON.stringify(metadata)}`;
    } catch (error) /* c8 ignore start */ {
      // Try to serialize with replacer to handle circular references
      try {
        const seen = new WeakSet();
        return ` ${JSON.stringify(metadata, (_key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        })}`;
      } catch {
        // If all serialization attempts fail, include at least the keys
        const keys = Object.keys(metadata);
        return ` [metadata serialization failed: ${keys.length} keys, error: ${String(error)}]`;
      }
    } /* c8 ignore stop */
  }

  /**
   * Format log entry as single line
   */
  private formatLogLine(log: StructuredLog): string {
    const metadataStr = log.metadata ? this.serializeMetadata(log.metadata) : '';
    return `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}${metadataStr}\n`;
  }

  /**
   * Perform log file rotation
   *
   * Separated from rotate() for Single Responsibility Principle.
   * Handles the actual file rotation operation.
   */
  private performRotation(): string | null {
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
    const ext = path.extname(this.currentFilePath);
    const base = path.basename(this.currentFilePath, ext);
    const dir = path.dirname(this.currentFilePath);
    const rotatedPath = path.join(dir, `${base}.${timestamp}${ext}`);

    if (fs.existsSync(this.currentFilePath)) {
      fs.renameSync(this.currentFilePath, rotatedPath);
    }

    return dir;
  }

  /**
   * Rotate log files
   *
   * Renames current file with timestamp suffix and removes old files
   * Includes retry limit to prevent infinite loops
   */
  private rotate(): void {
    /* c8 ignore next 3 - Write stream not available (edge case) */
    if (!this.writeStream) {
      return;
    }

    /* c8 ignore start - Rotation retry limit (hard to reproduce) */
    // Prevent infinite rotation loops
    if (this.rotationRetryCount >= this.MAX_ROTATION_RETRIES) {
      console.error('[Git ID Switcher] Maximum rotation retries reached, disabling file logging');
      this.dispose();
      return;
    }
    /* c8 ignore stop */

    try {
      this.writeStream.end();
      this.writeStream = null;

      const dir = this.performRotation();
      if (dir) {
        const ext = path.extname(this.currentFilePath);
        const base = path.basename(this.currentFilePath, ext);
        this.cleanupOldFiles(dir, base, ext);
      }

      this.openWriteStream();
      this.rotationRetryCount = 0; // Reset on success
      // currentFileSize is reset in openWriteStream() by reading file stats
    } catch (error) /* c8 ignore start */ {
      this.rotationRetryCount++;
      console.error(`[Git ID Switcher] Failed to rotate log file (attempt ${this.rotationRetryCount}/${this.MAX_ROTATION_RETRIES}):`, error);

      // Only retry if under limit
      if (this.rotationRetryCount < this.MAX_ROTATION_RETRIES) {
        this.openWriteStream();
      } else {
        // Disable logging to prevent infinite loop
        this.dispose();
      }
    } /* c8 ignore stop */
  }

  /**
   * Remove old rotated log files exceeding maxFiles limit
   *
   * Keeps: current log file + (maxFiles - 1) rotated files = maxFiles total
   */
  private cleanupOldFiles(dir: string, baseName: string, ext: string): void {
    try {
      const files = fs.readdirSync(dir);
      const currentFileName = `${baseName}${ext}`;

      // Find rotated files (exclude current log file)
      const rotatedFiles: Array<{ path: string; mtime: number }> = [];
      for (const f of files) {
        if (f.startsWith(baseName) && f.endsWith(ext) && f !== currentFileName) {
          const filePath = path.join(dir, f);
          try {
            const stats = fs.statSync(filePath);
            rotatedFiles.push({ path: filePath, mtime: stats.mtime.getTime() });
          } catch /* c8 ignore start */ {
            // File may have been deleted, skip it
          } /* c8 ignore stop */
        }
      }

      // Sort by mtime descending (newest first)
      rotatedFiles.sort((a, b) => b.mtime - a.mtime);

      // Keep (maxFiles - 1) rotated files, delete the rest
      const maxRotatedFiles = Math.max(0, this.config.maxFiles - 1);
      const filesToDelete = rotatedFiles.slice(maxRotatedFiles);
      for (const file of filesToDelete) {
        try {
          fs.unlinkSync(file.path);
        } catch /* c8 ignore start */ {
          // File may have been deleted by another process, ignore
        } /* c8 ignore stop */
      }
    } catch (error) /* c8 ignore start */ {
      console.error('[Git ID Switcher] Failed to cleanup old log files:', error);
    } /* c8 ignore stop */
  }

  /**
   * Close the write stream and cleanup
   */
  dispose(): void {
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }
    this.initialized = false;
    this.rotationRetryCount = 0;
  }
}
