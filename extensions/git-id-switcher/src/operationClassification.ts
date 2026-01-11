/**
 * Operation Classification for Workspace Trust
 *
 * Defines operation types and their restriction levels for untrusted workspaces.
 * This module provides a centralized way to classify operations based on their
 * security risk level.
 *
 * Security design:
 * - Dangerous operations are blocked or require confirmation in untrusted workspaces
 * - Safe operations (read-only) are always allowed
 * - Fail-safe: Unknown operations are treated as dangerous
 *
 * @see https://code.visualstudio.com/docs/editor/workspace-trust
 */

/**
 * Restriction level for operations in untrusted workspaces
 */
export enum RestrictionLevel {
  /**
   * Operation is completely blocked in untrusted workspaces.
   * Used for operations that could compromise security.
   */
  BLOCKED = 'BLOCKED',

  /**
   * Operation requires user confirmation in untrusted workspaces.
   * Used for operations that are potentially risky but may be needed.
   */
  CONFIRMATION_REQUIRED = 'CONFIRMATION_REQUIRED',

  /**
   * Operation is allowed in all workspaces.
   * Used for read-only operations that don't modify system state.
   */
  ALLOWED = 'ALLOWED',
}

/**
 * Operation type identifiers
 *
 * These are used to identify specific operations for trust checking.
 */
export enum OperationType {
  // Dangerous operations (BLOCKED)
  /** Modifying git config (user.name, user.email, etc.) */
  GIT_CONFIG_WRITE = 'GIT_CONFIG_WRITE',
  /** Adding SSH key to ssh-agent */
  SSH_KEY_ADD = 'SSH_KEY_ADD',
  /** Removing SSH key from ssh-agent */
  SSH_KEY_REMOVE = 'SSH_KEY_REMOVE',
  /** Any SSH agent operation */
  SSH_AGENT_OPERATION = 'SSH_AGENT_OPERATION',

  // Confirmation required operations
  /** Switching Git identity */
  IDENTITY_SWITCH = 'IDENTITY_SWITCH',

  // Safe operations (ALLOWED)
  /** Reading current Git config */
  GIT_CONFIG_READ = 'GIT_CONFIG_READ',
  /** Listing identities (read-only) */
  IDENTITY_LIST = 'IDENTITY_LIST',
  /** Listing SSH keys in agent (read-only) */
  SSH_KEY_LIST = 'SSH_KEY_LIST',
  /** Reading extension settings */
  SETTINGS_READ = 'SETTINGS_READ',
  /** Getting SSH key fingerprint (read-only) */
  SSH_KEY_FINGERPRINT = 'SSH_KEY_FINGERPRINT',
}

/**
 * Operation metadata for display and logging
 */
export interface OperationInfo {
  /** Operation type identifier */
  readonly type: OperationType;
  /** Restriction level in untrusted workspaces */
  readonly restriction: RestrictionLevel;
  /** Human-readable operation name (for UI display) */
  readonly displayName: string;
  /** Reason for restriction (for user information) */
  readonly restrictionReason: string;
}

/**
 * Operation classification map
 *
 * Defines the restriction level and metadata for each operation type.
 * This is the single source of truth for operation security classification.
 */
export const OPERATION_CLASSIFICATION: Readonly<Record<OperationType, OperationInfo>> = {
  // Dangerous operations - BLOCKED
  [OperationType.GIT_CONFIG_WRITE]: {
    type: OperationType.GIT_CONFIG_WRITE,
    restriction: RestrictionLevel.BLOCKED,
    displayName: 'Modify Git Configuration',
    restrictionReason: 'Modifying Git configuration could allow malicious repositories to inject harmful settings.',
  },
  [OperationType.SSH_KEY_ADD]: {
    type: OperationType.SSH_KEY_ADD,
    restriction: RestrictionLevel.BLOCKED,
    displayName: 'Add SSH Key',
    restrictionReason: 'Adding SSH keys could expose authentication credentials to untrusted code.',
  },
  [OperationType.SSH_KEY_REMOVE]: {
    type: OperationType.SSH_KEY_REMOVE,
    restriction: RestrictionLevel.BLOCKED,
    displayName: 'Remove SSH Key',
    restrictionReason: 'Removing SSH keys could disrupt authentication and cause denial of service.',
  },
  [OperationType.SSH_AGENT_OPERATION]: {
    type: OperationType.SSH_AGENT_OPERATION,
    restriction: RestrictionLevel.BLOCKED,
    displayName: 'SSH Agent Operation',
    restrictionReason: 'SSH agent operations could lead to unauthorized use of authentication keys.',
  },

  // Confirmation required operations
  [OperationType.IDENTITY_SWITCH]: {
    type: OperationType.IDENTITY_SWITCH,
    restriction: RestrictionLevel.CONFIRMATION_REQUIRED,
    displayName: 'Switch Identity',
    restrictionReason: 'Switching identity changes Git configuration and may affect SSH authentication.',
  },

  // Safe operations - ALLOWED
  [OperationType.GIT_CONFIG_READ]: {
    type: OperationType.GIT_CONFIG_READ,
    restriction: RestrictionLevel.ALLOWED,
    displayName: 'Read Git Configuration',
    restrictionReason: '',
  },
  [OperationType.IDENTITY_LIST]: {
    type: OperationType.IDENTITY_LIST,
    restriction: RestrictionLevel.ALLOWED,
    displayName: 'List Identities',
    restrictionReason: '',
  },
  [OperationType.SSH_KEY_LIST]: {
    type: OperationType.SSH_KEY_LIST,
    restriction: RestrictionLevel.ALLOWED,
    displayName: 'List SSH Keys',
    restrictionReason: '',
  },
  [OperationType.SETTINGS_READ]: {
    type: OperationType.SETTINGS_READ,
    restriction: RestrictionLevel.ALLOWED,
    displayName: 'Read Settings',
    restrictionReason: '',
  },
  [OperationType.SSH_KEY_FINGERPRINT]: {
    type: OperationType.SSH_KEY_FINGERPRINT,
    restriction: RestrictionLevel.ALLOWED,
    displayName: 'Get SSH Key Fingerprint',
    restrictionReason: '',
  },
} as const;

/**
 * Get operation information by type
 *
 * @param type - The operation type to look up
 * @returns Operation information or undefined if not found
 */
export function getOperationInfo(type: OperationType): OperationInfo | undefined {
  return OPERATION_CLASSIFICATION[type];
}

/**
 * Get restriction level for an operation
 *
 * SECURITY: Unknown operations are treated as BLOCKED for fail-safe behavior.
 *
 * @param type - The operation type to check
 * @returns The restriction level (BLOCKED for unknown operations)
 */
export function getRestrictionLevel(type: OperationType): RestrictionLevel {
  const info = OPERATION_CLASSIFICATION[type];
  // Fail-safe: Unknown operations are blocked
  return info?.restriction ?? RestrictionLevel.BLOCKED;
}

/**
 * Check if an operation is blocked in untrusted workspaces
 *
 * @param type - The operation type to check
 * @returns true if the operation should be blocked
 */
export function isBlockedOperation(type: OperationType): boolean {
  return getRestrictionLevel(type) === RestrictionLevel.BLOCKED;
}

/**
 * Check if an operation requires confirmation in untrusted workspaces
 *
 * @param type - The operation type to check
 * @returns true if the operation requires confirmation
 */
export function requiresConfirmation(type: OperationType): boolean {
  return getRestrictionLevel(type) === RestrictionLevel.CONFIRMATION_REQUIRED;
}

/**
 * Check if an operation is always allowed
 *
 * @param type - The operation type to check
 * @returns true if the operation is always allowed
 */
export function isAllowedOperation(type: OperationType): boolean {
  return getRestrictionLevel(type) === RestrictionLevel.ALLOWED;
}

/**
 * Get all operations with a specific restriction level
 *
 * @param level - The restriction level to filter by
 * @returns Array of operation types with the specified restriction level
 */
export function getOperationsByRestriction(level: RestrictionLevel): OperationType[] {
  return Object.values(OperationType).filter(
    (type) => getRestrictionLevel(type) === level
  );
}
