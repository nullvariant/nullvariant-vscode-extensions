/**
 * Operation Guard for Workspace Trust
 *
 * Provides a guard mechanism to check whether operations are allowed
 * based on the current workspace trust state.
 *
 * Security design:
 * - Fail-safe: Operations are blocked when trust state is unknown
 * - Centralized: Single point for all trust-based access control
 * - Logged: All blocked operations are logged for security audit
 *
 * @see https://code.visualstudio.com/docs/editor/workspace-trust
 */

import * as vscode from 'vscode';
import {
  type IWorkspaceTrustManager,
  getWorkspaceTrustManager,
} from './workspaceTrust';
import {
  OperationType,
  RestrictionLevel,
  getOperationInfo,
  getRestrictionLevel,
} from './operationClassification';
import { securityLogger, type ISecurityLogger } from './securityLogger';
import { ErrorCategory, SecurityError } from './errors';

/**
 * Result of an operation guard check
 */
export interface GuardCheckResult {
  /** Whether the operation is allowed */
  readonly allowed: boolean;
  /** Reason for blocking (if not allowed) */
  readonly reason?: string;
  /** Whether user confirmation was obtained (for CONFIRMATION_REQUIRED operations) */
  readonly userConfirmed?: boolean;
  /** Whether user confirmation is needed (set by synchronous checkOperation) */
  readonly needsConfirmation?: boolean;
}

/**
 * Options for OperationGuard
 */
export interface OperationGuardOptions {
  /** Custom trust manager for dependency injection */
  trustManager?: IWorkspaceTrustManager;
  /** Custom logger for dependency injection */
  logger?: ISecurityLogger;
}

/**
 * Error thrown when an operation is blocked due to workspace trust
 */
export class WorkspaceTrustError extends SecurityError {
  readonly operationType: OperationType;

  constructor(operationType: OperationType, reason: string) {
    super({
      category: ErrorCategory.SECURITY,
      userMessage: reason,
      internalDetails: {
        field: 'workspaceTrust',
        context: { operationType },
      },
      autoLog: false, // We log separately with more context
    });
    this.name = 'WorkspaceTrustError';
    this.operationType = operationType;
  }
}

/**
 * Interface for OperationGuard (for dependency injection)
 */
export interface IOperationGuard extends vscode.Disposable {
  /**
   * Check if an operation is allowed
   * @param operationType - The operation type to check
   * @returns Result indicating whether the operation is allowed
   */
  checkOperation(operationType: OperationType): GuardCheckResult;

  /**
   * Check if an operation is allowed, with optional user confirmation
   * @param operationType - The operation type to check
   * @param showConfirmation - Whether to show confirmation dialog for CONFIRMATION_REQUIRED operations
   * @returns Promise resolving to the check result
   */
  checkOperationAsync(
    operationType: OperationType,
    showConfirmation?: boolean
  ): Promise<GuardCheckResult>;

  /**
   * Execute an operation with guard check
   * @param operationType - The operation type
   * @param operation - The operation to execute if allowed
   * @throws WorkspaceTrustError if the operation is blocked
   */
  executeGuarded<T>(
    operationType: OperationType,
    operation: () => T | Promise<T>
  ): Promise<T>;

  /**
   * Check if the workspace is currently trusted
   */
  isWorkspaceTrusted(): boolean;
}

/**
 * OperationGuard class
 *
 * Provides trust-based access control for operations.
 *
 * @example
 * ```typescript
 * const guard = new OperationGuard();
 *
 * // Synchronous check
 * const result = guard.checkOperation(OperationType.GIT_CONFIG_WRITE);
 * if (!result.allowed) {
 *   vscode.window.showErrorMessage(result.reason!);
 *   return;
 * }
 *
 * // Execute with guard
 * await guard.executeGuarded(OperationType.SSH_KEY_ADD, async () => {
 *   await addSshKey(keyPath);
 * });
 * ```
 */
export class OperationGuard implements IOperationGuard {
  private readonly trustManager: IWorkspaceTrustManager;
  private readonly logger: ISecurityLogger;
  private _disposed = false;

  constructor(options: OperationGuardOptions = {}) {
    this.trustManager = options.trustManager ?? getWorkspaceTrustManager();
    this.logger = options.logger ?? securityLogger;
  }

  /**
   * Check if an operation is allowed (synchronous)
   *
   * IMPORTANT: This method is for quick synchronous checks only.
   * - For BLOCKED operations: Returns allowed=false
   * - For ALLOWED operations: Returns allowed=true
   * - For CONFIRMATION_REQUIRED operations: Returns allowed=false with needsConfirmation=true
   *
   * Use checkOperationAsync() for operations that require user confirmation.
   *
   * @param operationType - The operation type to check
   * @returns Result indicating whether the operation is allowed
   */
  public checkOperation(operationType: OperationType): GuardCheckResult {
    // If workspace is trusted, all operations are allowed
    if (this.trustManager.isTrusted()) {
      return { allowed: true };
    }

    const restrictionLevel = getRestrictionLevel(operationType);
    const operationInfo = getOperationInfo(operationType);

    switch (restrictionLevel) {
      case RestrictionLevel.ALLOWED:
        return { allowed: true };

      case RestrictionLevel.CONFIRMATION_REQUIRED:
        // For sync check, return not allowed but indicate confirmation is needed
        // Caller should use checkOperationAsync() to get user confirmation
        return {
          allowed: false,
          needsConfirmation: true,
          reason: vscode.l10n.t('User confirmation required for this operation'),
        };

      case RestrictionLevel.BLOCKED:
      default:
        // Log blocked operation
        this.logger.logOperationBlocked(
          operationType,
          operationInfo?.restrictionReason ?? 'Operation blocked in untrusted workspace'
        );

        return {
          allowed: false,
          reason: this.formatBlockedMessage(operationType, operationInfo?.restrictionReason),
        };
    }
  }

  /**
   * Check if an operation is allowed, with optional user confirmation
   *
   * For CONFIRMATION_REQUIRED operations, shows a confirmation dialog
   * if showConfirmation is true.
   *
   * @param operationType - The operation type to check
   * @param showConfirmation - Whether to show confirmation dialog (default: true)
   * @returns Promise resolving to the check result
   */
  public async checkOperationAsync(
    operationType: OperationType,
    showConfirmation = true
  ): Promise<GuardCheckResult> {
    // If workspace is trusted, all operations are allowed
    if (this.trustManager.isTrusted()) {
      return { allowed: true };
    }

    const restrictionLevel = getRestrictionLevel(operationType);
    const operationInfo = getOperationInfo(operationType);

    switch (restrictionLevel) {
      case RestrictionLevel.ALLOWED:
        return { allowed: true };

      case RestrictionLevel.CONFIRMATION_REQUIRED:
        if (!showConfirmation) {
          return { allowed: true, userConfirmed: false };
        }
        return await this.showConfirmationDialog(operationType, operationInfo?.restrictionReason);

      case RestrictionLevel.BLOCKED:
      default:
        // Log blocked operation
        this.logger.logOperationBlocked(
          operationType,
          operationInfo?.restrictionReason ?? 'Operation blocked in untrusted workspace'
        );

        return {
          allowed: false,
          reason: this.formatBlockedMessage(operationType, operationInfo?.restrictionReason),
        };
    }
  }

  /**
   * Execute an operation with guard check
   *
   * @param operationType - The operation type
   * @param operation - The operation to execute if allowed
   * @throws WorkspaceTrustError if the operation is blocked
   */
  public async executeGuarded<T>(
    operationType: OperationType,
    operation: () => T | Promise<T>
  ): Promise<T> {
    const result = await this.checkOperationAsync(operationType, true);

    if (!result.allowed) {
      throw new WorkspaceTrustError(
        operationType,
        result.reason ?? 'Operation blocked in untrusted workspace'
      );
    }

    return await operation();
  }

  /**
   * Check if the workspace is currently trusted
   */
  public isWorkspaceTrusted(): boolean {
    return this.trustManager.isTrusted();
  }

  /**
   * Show confirmation dialog for CONFIRMATION_REQUIRED operations
   */
  private async showConfirmationDialog(
    operationType: OperationType,
    restrictionReason?: string
  ): Promise<GuardCheckResult> {
    const operationInfo = getOperationInfo(operationType);
    const operationName = operationInfo?.displayName ?? operationType;

    const message = vscode.l10n.t(
      'This workspace is not trusted. {0} may modify your system. Do you want to proceed?',
      operationName
    );

    const trustButton = vscode.l10n.t('Trust Workspace');
    const proceedButton = vscode.l10n.t('Proceed Anyway');
    const cancelButton = vscode.l10n.t('Cancel');

    const result = await vscode.window.showWarningMessage(
      message,
      { modal: true, detail: restrictionReason },
      trustButton,
      proceedButton,
      cancelButton
    );

    if (result === trustButton) {
      // Request workspace trust
      await vscode.commands.executeCommand('workbench.action.manageTrust');
      // Check if trust was actually granted
      if (this.trustManager.isTrusted()) {
        return { allowed: true, userConfirmed: true };
      }
      // User didn't grant trust, treat as cancelled
      return { allowed: false, reason: 'Workspace trust not granted' };
    }

    if (result === proceedButton) {
      // Log that user explicitly confirmed
      this.logger.logOperationConfirmed(operationType);
      return { allowed: true, userConfirmed: true };
    }

    // Cancelled
    return { allowed: false, reason: 'Operation cancelled by user' };
  }

  /**
   * Format blocked message for user display
   */
  private formatBlockedMessage(operationType: OperationType, reason?: string): string {
    const operationInfo = getOperationInfo(operationType);
    const operationName = operationInfo?.displayName ?? operationType;

    if (reason) {
      return vscode.l10n.t(
        '{0} is blocked in untrusted workspaces. {1}',
        operationName,
        reason
      );
    }

    return vscode.l10n.t(
      '{0} is blocked in untrusted workspaces. Trust the workspace to enable this operation.',
      operationName
    );
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    // Currently no resources to dispose, but structure is ready for future use
  }
}

/**
 * Singleton instance of OperationGuard
 */
let operationGuardInstance: OperationGuard | undefined;

/**
 * Get the singleton OperationGuard instance
 *
 * @returns The shared OperationGuard instance
 */
export function getOperationGuard(): OperationGuard {
  if (!operationGuardInstance) {
    operationGuardInstance = new OperationGuard();
  }
  return operationGuardInstance;
}

/**
 * Reset the singleton instance (for testing only)
 *
 * @internal
 */
export function __resetOperationGuard(): void {
  if (operationGuardInstance) {
    operationGuardInstance.dispose();
    operationGuardInstance = undefined;
  }
}
