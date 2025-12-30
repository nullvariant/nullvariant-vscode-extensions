/**
 * Log Types
 *
 * Defines log level enumeration and structured log interface.
 * Provides type definitions for the logging system.
 */

/**
 * Log severity levels
 *
 * Ordered from lowest to highest severity:
 * - DEBUG: Detailed diagnostic information
 * - INFO: General operational information
 * - WARN: Warning conditions
 * - ERROR: Error conditions
 * - SECURITY: Security-relevant events (always logged)
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY',
}

/**
 * Numeric priority for log levels (higher = more severe)
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.SECURITY]: 4,
};

/**
 * Structured log entry
 */
export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log writer interface for dependency injection
 */
export interface ILogWriter {
  write(log: StructuredLog): void;
  dispose(): void;
}

/**
 * File logging configuration
 */
export interface FileLogConfig {
  enabled: boolean;
  filePath: string;
  maxFileSizeBytes: number;
  maxFiles: number;
}

/**
 * Default file logging configuration
 */
export const DEFAULT_FILE_LOG_CONFIG: FileLogConfig = {
  enabled: false,
  filePath: '',
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
};

/**
 * Maps legacy Severity to LogLevel
 */
export function severityToLogLevel(severity: 'info' | 'warning' | 'error'): LogLevel {
  switch (severity) {
    case 'info':
      return LogLevel.INFO;
    case 'warning':
      return LogLevel.WARN;
    case 'error':
      return LogLevel.ERROR;
  }
}

/**
 * Checks if a log level should be logged based on minimum level
 *
 * SECURITY level is always logged regardless of minLevel setting,
 * as security events must be auditable at all times.
 */
export function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  // SECURITY level is always logged
  if (level === LogLevel.SECURITY) {
    return true;
  }
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

/**
 * Safely converts a string to LogLevel enum
 *
 * @param levelStr - String representation of log level
 * @param defaultLevel - Default level to return if conversion fails
 * @returns LogLevel enum value or defaultLevel
 */
export function parseLogLevel(levelStr: string, defaultLevel: LogLevel = LogLevel.INFO): LogLevel {
  const upperLevel = levelStr.toUpperCase();
  if (upperLevel in LogLevel) {
    return LogLevel[upperLevel as keyof typeof LogLevel];
  }
  return defaultLevel;
}
