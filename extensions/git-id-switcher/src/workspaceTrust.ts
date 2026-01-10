/**
 * VS Code Workspace Trust Manager
 *
 * Manages workspace trust state detection and event handling.
 * Provides a centralized way to check if the current workspace is trusted.
 *
 * Security guarantees:
 * - Fail-safe: Returns false (untrusted) when trust state is unknown
 * - Backward compatible: Works with VS Code 1.56 and earlier (no Trust API)
 * - Event-driven: Notifies listeners when trust state changes
 * - Configurable: Can be disabled via gitIdSwitcher.disableWorkspaceTrust setting
 *
 * @see https://code.visualstudio.com/docs/editor/workspace-trust
 */

import * as vscode from 'vscode';

/**
 * Interface for trust state change event data
 */
export interface TrustStateChangeEvent {
  /** Whether the workspace is now trusted */
  readonly isTrusted: boolean;
  /** Timestamp of the change */
  readonly timestamp: Date;
}

/**
 * Listener function type for trust state changes
 */
export type TrustStateChangeListener = (event: TrustStateChangeEvent) => void;

/**
 * Interface for WorkspaceTrustManager for dependency injection
 */
export interface IWorkspaceTrustManager extends vscode.Disposable {
  /** Check if the workspace is currently trusted */
  isTrusted(): boolean;
  /** Check if Workspace Trust API is available */
  isApiAvailable(): boolean;
  /** Check if Workspace Trust feature is disabled by configuration */
  isDisabledByConfig(): boolean;
  /** Register a listener for trust state changes */
  onTrustGranted(listener: TrustStateChangeListener): vscode.Disposable;
}

/**
 * Check if VS Code Workspace Trust API is available
 *
 * Workspace Trust API was introduced in VS Code 1.57.
 * This function safely checks for API availability.
 *
 * @returns true if Workspace Trust API is available
 */
export function isWorkspaceTrustApiAvailable(): boolean {
  try {
    // Check if the property exists and is a boolean
    return typeof vscode.workspace.isTrusted === 'boolean';
  } catch {
    // API not available or error checking
    return false;
  }
}

/**
 * WorkspaceTrustManager class
 *
 * Manages workspace trust state and provides:
 * - Current trust state checking
 * - Trust state change event handling
 * - Disposable pattern for cleanup
 *
 * @example
 * const manager = new WorkspaceTrustManager();
 * if (!manager.isTrusted()) {
 *   // Block dangerous operations
 * }
 * manager.onTrustGranted((event) => {
 *   console.log('Trust granted at:', event.timestamp);
 * });
 */
export class WorkspaceTrustManager implements IWorkspaceTrustManager {
  private readonly disposables: vscode.Disposable[] = [];
  private readonly listeners: Set<TrustStateChangeListener> = new Set();
  private trustState: boolean;
  private readonly _apiAvailable: boolean;
  private _disposed = false;
  private _disabledByConfigCache: boolean | undefined;

  constructor() {
    this._apiAvailable = isWorkspaceTrustApiAvailable();

    if (this._apiAvailable) {
      // Initialize from current trust state
      this.trustState = vscode.workspace.isTrusted;

      // Subscribe to trust granted event
      const trustSubscription = vscode.workspace.onDidGrantWorkspaceTrust(() => {
        this.handleTrustGranted();
      });
      this.disposables.push(trustSubscription);

      // Subscribe to configuration changes to invalidate cache
      const configSubscription = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('gitIdSwitcher.disableWorkspaceTrust')) {
          this._disabledByConfigCache = undefined;
        }
      });
      this.disposables.push(configSubscription);

      console.log(
        `[WorkspaceTrustManager] Initialized. API available: true, Initial trust state: ${this.trustState}`
      );
    } else {
      // SECURITY: Fail-safe - treat as untrusted when API not available
      // This ensures we don't accidentally allow dangerous operations
      // on older VS Code versions that don't support workspace trust
      this.trustState = false;
      console.log(
        '[WorkspaceTrustManager] Workspace Trust API not available. ' +
          'Treating workspace as untrusted for safety.'
      );
    }
  }

  /**
   * Check if Workspace Trust API is available
   *
   * @returns true if the API is available (VS Code >= 1.57)
   */
  public isApiAvailable(): boolean {
    return this._apiAvailable;
  }

  /**
   * Check if Workspace Trust feature is disabled by configuration
   *
   * When disabled via gitIdSwitcher.disableWorkspaceTrust setting,
   * all trust checks return true (trusted), effectively bypassing
   * the workspace trust restrictions.
   *
   * This is provided as a rollback mechanism if workspace trust
   * causes issues for users.
   *
   * Performance: Uses caching with invalidation on config change.
   *
   * @returns true if workspace trust is disabled by config
   */
  public isDisabledByConfig(): boolean {
    // Return cached value if available
    if (this._disabledByConfigCache !== undefined) {
      return this._disabledByConfigCache;
    }

    try {
      const config = vscode.workspace.getConfiguration('gitIdSwitcher');
      this._disabledByConfigCache = config.get<boolean>('disableWorkspaceTrust', false);
      return this._disabledByConfigCache;
    } catch {
      // SECURITY: On error reading config, assume not disabled
      // This ensures fail-safe behavior
      return false;
    }
  }

  /**
   * Check if the workspace is currently trusted
   *
   * SECURITY: Returns false (untrusted) in the following cases:
   * - Workspace Trust API is not available (VS Code < 1.57)
   * - Trust state is unknown or cannot be determined
   *
   * Exception: Returns true if gitIdSwitcher.disableWorkspaceTrust is true
   * (rollback mechanism for problematic cases)
   *
   * @returns true if the workspace is trusted, false otherwise
   */
  public isTrusted(): boolean {
    // Check if workspace trust is disabled by configuration (rollback mechanism)
    if (this.isDisabledByConfig()) {
      return true;
    }

    if (!this._apiAvailable) {
      // SECURITY: Fail-safe - return untrusted when API not available
      return false;
    }

    // Re-read current state from VS Code API to ensure freshness
    // This handles edge cases where state might have changed without event
    try {
      this.trustState = vscode.workspace.isTrusted;
    } catch {
      // SECURITY: Fail-safe - return untrusted on error
      return false;
    }

    return this.trustState;
  }

  /**
   * Register a listener for trust state changes
   *
   * The listener will be called when:
   * - User grants trust to the workspace via VS Code UI
   *
   * Note: VS Code only provides onDidGrantWorkspaceTrust event,
   * which fires when trust is granted. There is no event for
   * trust being revoked (which requires closing the workspace).
   *
   * @param listener - Function to call when trust state changes
   * @returns Disposable to unregister the listener
   */
  public onTrustGranted(listener: TrustStateChangeListener): vscode.Disposable {
    this.listeners.add(listener);

    return {
      dispose: () => {
        this.listeners.delete(listener);
      },
    };
  }

  /**
   * Handle trust granted event from VS Code
   */
  private handleTrustGranted(): void {
    // Ignore events after disposal
    if (this._disposed) {
      return;
    }

    const previousState = this.trustState;
    this.trustState = true;

    console.log(
      `[WorkspaceTrustManager] Trust granted. Previous state: ${previousState}, New state: true`
    );

    const event: TrustStateChangeEvent = {
      isTrusted: true,
      timestamp: new Date(),
    };

    // Notify all listeners
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        // SECURITY: Don't let one listener's error break others
        console.error(
          '[WorkspaceTrustManager] Error in trust state change listener:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  /**
   * Dispose of all resources
   */
  public dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;

    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables.length = 0;
    this.listeners.clear();
    this._disabledByConfigCache = undefined;
  }
}

/**
 * Singleton instance of WorkspaceTrustManager
 *
 * Use this for most cases. Create your own instance only
 * if you need isolated trust management (e.g., for testing).
 */
let workspaceTrustManagerInstance: WorkspaceTrustManager | undefined;

/**
 * Get the singleton WorkspaceTrustManager instance
 *
 * @returns The shared WorkspaceTrustManager instance
 */
export function getWorkspaceTrustManager(): WorkspaceTrustManager {
  if (!workspaceTrustManagerInstance) {
    workspaceTrustManagerInstance = new WorkspaceTrustManager();
  }
  return workspaceTrustManagerInstance;
}

/**
 * Reset the singleton instance (for testing only)
 *
 * @internal
 */
export function __resetWorkspaceTrustManager(): void {
  if (workspaceTrustManagerInstance) {
    workspaceTrustManagerInstance.dispose();
    workspaceTrustManagerInstance = undefined;
  }
}
