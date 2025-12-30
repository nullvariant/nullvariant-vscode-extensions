/**
 * Configuration Change Detection
 *
 * Detects and tracks changes to VS Code configuration.
 * Separated from SecurityLogger for Single Responsibility Principle.
 */

/**
 * Lazy-loaded VS Code workspace API
 *
 * IMPORTANT: VS Code module is loaded lazily to support testing.
 * In test environments (outside VS Code extension host), the vscode
 * module is not available.
 *
 * @returns VS Code workspace API or undefined if not available
 */
function getVSCodeWorkspace(): typeof import('vscode').workspace | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const vscode = require('vscode') as typeof import('vscode');
    return vscode.workspace;
  } catch {
    // VS Code API not available (e.g., in tests)
    return undefined;
  }
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
  'commandTimeouts',
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
  commandTimeouts: Record<string, number>;
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
 * Security limits for DoS protection
 */
const LIMITS = {
  MAX_IDENTITIES: 1000,
  MAX_STRINGIFY_SIZE: 100000, // 100KB
} as const;

/**
 * Configuration Change Detector
 *
 * Tracks configuration changes between snapshots.
 */
export class ConfigChangeDetector {
  private snapshot: ConfigSnapshot | null = null;

  /**
   * Create a configuration snapshot from current VS Code configuration
   */
  createSnapshot(): ConfigSnapshot {
    const workspace = getVSCodeWorkspace();
    if (!workspace) {
      // Return default snapshot when VS Code API is not available (e.g., in tests)
      return {
        identities: [],
        defaultIdentity: '',
        autoSwitchSshKey: true,
        showNotifications: true,
        applyToSubmodules: true,
        submoduleDepth: 1,
        includeIconInGitConfig: false,
        commandTimeouts: {},
      };
    }
    const config = workspace.getConfiguration('gitIdSwitcher');
    const identities = config.get<unknown[]>('identities', []);

    // Limit identities array size to prevent DoS attacks
    const limitedIdentities =
      Array.isArray(identities) && identities.length > LIMITS.MAX_IDENTITIES
        ? identities.slice(0, LIMITS.MAX_IDENTITIES)
        : identities;

    return {
      identities: limitedIdentities,
      defaultIdentity: config.get<string>('defaultIdentity', ''),
      autoSwitchSshKey: config.get<boolean>('autoSwitchSshKey', true),
      showNotifications: config.get<boolean>('showNotifications', true),
      applyToSubmodules: config.get<boolean>('applyToSubmodules', true),
      submoduleDepth: config.get<number>('submoduleDepth', 1),
      includeIconInGitConfig: config.get<boolean>('includeIconInGitConfig', false),
      commandTimeouts: config.get<Record<string, number>>('commandTimeouts', {}),
    };
  }

  /**
   * Store the current configuration snapshot
   */
  storeSnapshot(): void {
    try {
      this.snapshot = this.createSnapshot();
    } catch (error) {
      console.error('[ConfigChangeDetector] Error storing snapshot:', error);
    }
  }

  /**
   * Get the current stored snapshot
   */
  getSnapshot(): ConfigSnapshot | null {
    return this.snapshot;
  }

  /**
   * Clear the stored snapshot
   */
  clearSnapshot(): void {
    this.snapshot = null;
  }

  /**
   * Compare two values for equality (deep comparison for objects/arrays)
   */
  private valuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;

    if (typeof a === 'object' && typeof b === 'object') {
      try {
        const aStr = JSON.stringify(a);
        const bStr = JSON.stringify(b);

        // If strings are too large, use length-based comparison as fallback
        if (
          aStr.length > LIMITS.MAX_STRINGIFY_SIZE ||
          bStr.length > LIMITS.MAX_STRINGIFY_SIZE
        ) {
          return aStr.length === bStr.length && typeof a === typeof b;
        }

        return aStr === bStr;
      } catch {
        // On error (e.g., circular reference), return false
        return false;
      }
    }

    return false;
  }

  /**
   * Detect which configuration keys changed
   */
  detectChanges(newSnapshot: ConfigSnapshot): ConfigChangeDetail[] {
    if (!this.snapshot) {
      return [];
    }

    try {
      const changes: ConfigChangeDetail[] = [];

      for (const key of CONFIG_KEYS) {
        const previousValue = this.snapshot[key];
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
      console.error('[ConfigChangeDetector] Error detecting changes:', error);
      return [];
    }
  }

  /**
   * Get the ID from an identity object
   */
  getIdentityId(identity: unknown): string | null {
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
   * Extract identity IDs from an identities array
   */
  extractIdentityIds(identities: unknown[]): string[] {
    const ids: string[] = [];
    const maxItems = 100;
    let count = 0;

    for (const identity of identities) {
      if (count >= maxItems) break;
      const id = this.getIdentityId(identity);
      if (id) {
        ids.push(id);
      }
      count++;
    }

    return ids;
  }

  /**
   * Summarize identity changes
   */
  summarizeIdentityChanges(
    previousIdentities: unknown[],
    newIdentities: unknown[]
  ): {
    previousCount: number;
    newCount: number;
    added: string[];
    removed: string[];
    modified: string[];
  } {
    const prevIds = this.extractIdentityIds(previousIdentities);
    const newIds = this.extractIdentityIds(newIdentities);

    const added = newIds.filter(id => !prevIds.includes(id));
    const removed = prevIds.filter(id => !newIds.includes(id));
    const modified = newIds.filter(id => {
      if (!prevIds.includes(id)) return false;
      const prevIdentity = previousIdentities.find(
        i => this.getIdentityId(i) === id
      );
      const newIdentity = newIdentities.find(i => this.getIdentityId(i) === id);
      return !this.valuesEqual(prevIdentity, newIdentity);
    });

    return {
      previousCount: previousIdentities.length,
      newCount: newIdentities.length,
      added,
      removed,
      modified,
    };
  }
}

/**
 * Singleton instance
 */
export const configChangeDetector = new ConfigChangeDetector();
