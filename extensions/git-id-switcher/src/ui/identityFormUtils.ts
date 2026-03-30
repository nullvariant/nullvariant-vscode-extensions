/**
 * Identity Form Utilities
 *
 * Shared UI helpers, QuickInput infrastructure, and persistence
 * used by both Add Form and Edit Flow.
 *
 * @module ui/identityFormUtils
 */

import { getVSCode } from '../core/vscodeLoader';
import {
  type Identity,
  type FieldMetadata,
  FIELD_METADATA,
  addIdentityToConfig,
  updateIdentityInConfig,
} from '../identity/identity';
import { replaceHomeWithTilde } from '../security/pathUtils';
import { getUserSafeMessage } from '../core/errors';

// ============================================================================
// Type Definitions
// ============================================================================

/** VS Code API type alias for cleaner function signatures */
export type VSCodeAPI = NonNullable<ReturnType<typeof getVSCode>>;

/** Field selection item for edit wizard */
export interface FieldQuickPickItem {
  readonly label: string;
  readonly description?: string;
  readonly detail?: string;
  readonly field: keyof Identity | null;
  readonly _isDisabled?: boolean;
}

/** Generic QuickPick type */
export type GenericQuickPick<T> = ReturnType<VSCodeAPI['window']['createQuickPick']> & {
  readonly selectedItems: readonly T[];
};

/** InputBox type */
export type GenericInputBox = ReturnType<VSCodeAPI['window']['createInputBox']>;

/** Result type for QuickInput operations (QuickPick/InputBox with back button) */
export type QuickInputResult<T> = T | 'back' | undefined;

/** Options for showFieldInputBox */
export interface FieldInputBoxOptions {
  readonly title: string;
  readonly value: string;
  readonly placeholder: string;
  readonly prompt?: string;
  readonly validateInput: (value: string) => string | null;
  readonly field?: keyof Identity;
}

// ============================================================================
// Constants
// ============================================================================

/** Placeholder keys for each field (unified with package.nls.json for logical DRY) */
export const FIELD_PLACEHOLDER_KEYS: Partial<Record<keyof Identity, string>> = {
  id: 'Unique ID (alphanumeric, hyphens, underscores only; must not duplicate; required)',
  name: 'Git user.name (required)',
  email: 'Git user.email (required)',
  service: 'Git hosting service (e.g., GitHub, GitLab, Bitbucket)',
  icon: 'Emoji to display in status bar (e.g., 🏠, 💼)',
  description: 'Note for this identity (e.g., Work, Personal)',
  sshKeyPath: 'Path to SSH private key (e.g., ~/.ssh/id_ed25519_work)',
  sshHost: 'SSH config host alias (e.g., github-work, gitlab-personal)',
  gpgKeyId: 'GPG key ID for commit signing (e.g., ABCD1234EF567890)',
};

/** Prompt keys for InputBox based on mode */
export const INPUT_BOX_PROMPT_KEYS = {
  required: "Press 'Enter' to save",
  optionalAdd: "Press 'Enter' to save (leave empty to skip)",
  optionalEdit: "Press 'Enter' to save (leave empty to clear)",
} as const;

// ============================================================================
// UI Text Helpers
// ============================================================================

/**
 * Get placeholder text for a field.
 * Note: Complete DRY with package.nls.json is technically impossible due to VS Code l10n architecture.
 */
export function getPlaceholderForField(vs: VSCodeAPI, field: keyof Identity): string {
  const key = FIELD_PLACEHOLDER_KEYS[field];
  return key ? vs.l10n.t(key) : '';
}

/** Get prompt text for InputBox based on field optionality and mode. */
export function getInputBoxPrompt(vs: VSCodeAPI, isOptional: boolean, mode: 'add' | 'edit'): string {
  if (!isOptional) return vs.l10n.t(INPUT_BOX_PROMPT_KEYS.required);
  return vs.l10n.t(mode === 'add' ? INPUT_BOX_PROMPT_KEYS.optionalAdd : INPUT_BOX_PROMPT_KEYS.optionalEdit);
}

// ============================================================================
// Field Item Builders
// ============================================================================

/**
 * Build the ID field item based on identity count.
 * Single profile: ID is editable (initial setup scenario).
 * Multiple profiles: ID is locked (reference integrity).
 *
 * @param vs - VS Code API
 * @param meta - Field metadata for ID
 * @param displayValue - Formatted display value
 * @param savedField - Field that was just saved (for visual feedback)
 * @param identityCount - Total number of identities
 * @returns Field item for the ID field
 */
function buildIdFieldItem(
  vs: VSCodeAPI,
  meta: FieldMetadata,
  displayValue: string,
  savedField: keyof Identity | undefined,
  identityCount: number | undefined
): FieldQuickPickItem {
  if (identityCount === 1) {
    const description = savedField === meta.key
      ? `$(check) ${vs.l10n.t('Saved')}`
      : displayValue;
    return {
      label: `$(pencil) ${vs.l10n.t(meta.labelKey)}`,
      description,
      field: 'id',
    };
  }
  return {
    label: `$(${meta.icon}) ${vs.l10n.t(meta.labelKey)}`,
    description: displayValue,
    detail: vs.l10n.t('(cannot be changed)'),
    field: null,
    _isDisabled: true,
  };
}

/**
 * Build field items for edit wizard using FIELD_METADATA.
 * Unified with Step 6 (showAddIdentityForm) for consistent UI.
 *
 * @param vs - VS Code API
 * @param identity - Identity being edited
 * @param savedField - Field that was just saved (for visual feedback)
 * @param identityCount - Total number of identities (1 = allow ID editing)
 * @returns Array of field items for QuickPick
 */
export function buildFieldItems(
  vs: VSCodeAPI,
  identity: Identity,
  savedField?: keyof Identity,
  identityCount?: number
): FieldQuickPickItem[] {
  const items: FieldQuickPickItem[] = [];

  for (const meta of FIELD_METADATA) {
    const value = identity[meta.key];
    const hasValue = value !== undefined && String(value).trim() !== '';
    const displayValue = hasValue ? String(value) : vs.l10n.t('(none)');

    if (meta.key === 'id') {
      items.push(buildIdFieldItem(vs, meta, displayValue, savedField, identityCount));
      continue;
    }

    // Visual feedback for just-saved field
    const description = savedField === meta.key
      ? `$(check) ${vs.l10n.t('Saved')}`
      : displayValue;

    items.push({
      label: `$(${meta.icon}) ${vs.l10n.t(meta.labelKey)}`,
      description,
      field: meta.key,
    });
  }

  return items;
}

// ============================================================================
// Persistence Layer
// ============================================================================

/**
 * Save a new identity to config.
 *
 * SECURITY: Logs config change for audit trail.
 * Uses getUserSafeMessage to prevent information leakage in errors.
 *
 * @param vs - VS Code API
 * @param identity - New identity to save
 * @returns true if saved successfully, false otherwise
 */
export async function saveNewIdentity(vs: VSCodeAPI, identity: Identity): Promise<boolean> {
  try {
    await addIdentityToConfig(identity);
    // SECURITY: Audit logging is handled by addIdentityToConfig (SSoT)
    vs.window.showInformationMessage(
      vs.l10n.t("Identity '{0}' has been created.", identity.id)
    );
    return true;
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    vs.window.showErrorMessage(
      vs.l10n.t('Git ID Switcher: {0}', safeMessage)
    );
    return false;
  }
}

/**
 * Save edited identity field.
 *
 * SECURITY: Logs config change for audit trail.
 * Uses getUserSafeMessage to prevent information leakage in errors.
 *
 * @param vs - VS Code API
 * @param identityId - ID of identity being edited
 * @param field - Field being updated
 * @param value - New value (undefined to clear)
 * @returns true if saved successfully, false otherwise
 */
export async function saveEditedField(
  vs: VSCodeAPI,
  identityId: string,
  field: keyof Identity,
  value: string | undefined
): Promise<boolean> {
  try {
    await updateIdentityInConfig(identityId, field, value);
    // SECURITY: Audit logging is handled by updateIdentityInConfig (SSoT)
    vs.window.showInformationMessage(
      vs.l10n.t("Identity '{0}' has been updated.", identityId)
    );
    return true;
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    vs.window.showErrorMessage(
      vs.l10n.t('Git ID Switcher: {0}', safeMessage)
    );
    return false;
  }
}

// ============================================================================
// QuickInput Helpers
// ============================================================================

/**
 * Create a disposable cleanup function with resolved state tracking.
 * Used by QuickPick and InputBox wait helpers to prevent double-resolution.
 *
 * @returns Object with cleanup function and isResolved checker
 */
function createDisposableCleanup(): {
  cleanup: (disposables: { dispose(): void }[]) => void;
  isResolved: () => boolean;
} {
  let resolved = false;
  return {
    cleanup: (disposables: { dispose(): void }[]): void => {
      if (!resolved) {
        resolved = true;
        for (const d of disposables) d.dispose();
      }
    },
    isResolved: (): boolean => resolved,
  };
}

/**
 * Wait for QuickPick selection or button press.
 * Generic helper used by both Add Form and Field Selection.
 *
 * @param vs - VS Code API
 * @param quickPick - The QuickPick instance
 * @returns Selected item, 'back' if back pressed, undefined if cancelled
 */
export function waitForQuickPickSelection<T>(
  vs: VSCodeAPI,
  quickPick: GenericQuickPick<T>
): Promise<T | 'back' | undefined> {
  return new Promise(resolve => {
    const { cleanup } = createDisposableCleanup();

    const disposables: { dispose(): void }[] = [
      quickPick.onDidAccept(() => {
        cleanup(disposables);
        resolve(quickPick.selectedItems[0] as T | undefined);
      }),
      quickPick.onDidTriggerButton(button => {
        if (button === vs.QuickInputButtons.Back) {
          cleanup(disposables);
          resolve('back');
        }
      }),
      quickPick.onDidHide(() => {
        cleanup(disposables);
        resolve(undefined);
      }),
    ];
  });
}

/**
 * Wait for InputBox value or button press.
 * Generic helper used by both Add Form and Field Selection.
 * Supports optional file picker button for path fields.
 *
 * @param vs - VS Code API
 * @param inputBox - The InputBox instance
 * @param validateInput - Validation function
 * @param onCustomButton - Optional handler for non-back buttons (e.g., file picker)
 * @returns Input value, 'back' if back pressed, undefined if cancelled
 */
function waitForInputBoxValue(
  vs: VSCodeAPI,
  inputBox: GenericInputBox,
  validateInput: (value: string) => string | null,
  onCustomButton?: () => Promise<string | undefined>
): Promise<QuickInputResult<string>> {
  return new Promise(resolve => {
    const { cleanup } = createDisposableCleanup();

    const disposables: { dispose(): void }[] = [
      inputBox.onDidChangeValue(value => {
        inputBox.validationMessage = validateInput(value) ?? undefined;
      }),
      inputBox.onDidAccept(() => {
        if (!inputBox.validationMessage) {
          cleanup(disposables);
          resolve(inputBox.value);
        }
      }),
      inputBox.onDidTriggerButton(async button => {
        if (button === vs.QuickInputButtons.Back) {
          cleanup(disposables);
          resolve('back');
        } else if (onCustomButton) {
          const newValue = await onCustomButton();
          if (newValue !== undefined) {
            inputBox.value = newValue;
            inputBox.validationMessage = validateInput(newValue) ?? undefined;
          }
        }
      }),
      inputBox.onDidHide(() => {
        cleanup(disposables);
        resolve(undefined);
      }),
    ];
  });
}

/**
 * Show field input box with back button.
 * Common function for both Add and Edit forms.
 * Supports file picker button for sshKeyPath field.
 *
 * @param vs - VS Code API
 * @param options - Input box options
 * @returns Input value, 'back' if back pressed, undefined if cancelled
 */
export async function showFieldInputBox(
  vs: VSCodeAPI,
  options: FieldInputBoxOptions
): Promise<QuickInputResult<string>> {
  const inputBox = vs.window.createInputBox();
  inputBox.ignoreFocusOut = true;
  inputBox.title = options.title;
  inputBox.value = options.value;
  inputBox.placeholder = options.placeholder;
  inputBox.prompt = options.prompt;
  inputBox.buttons = [vs.QuickInputButtons.Back];

  // File picker handler for sshKeyPath field
  let onCustomButton: (() => Promise<string | undefined>) | undefined;
  if (options.field === 'sshKeyPath') {
    inputBox.buttons = [
      vs.QuickInputButtons.Back,
      { iconPath: new vs.ThemeIcon('folder-opened'), tooltip: vs.l10n.t('Browse for SSH key path...') },
    ];
    onCustomButton = async (): Promise<string | undefined> => {
      // Default to ~/.ssh - use HOME (Unix) or USERPROFILE (Windows)
      const homeDir = process.env.HOME ?? process.env.USERPROFILE;
      const defaultPath = homeDir ? `${homeDir}/.ssh` : undefined;
      const fileUri = await vs.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: defaultPath ? vs.Uri.file(defaultPath) : undefined,
        title: vs.l10n.t('Select SSH Key'),
      });
      const selected = fileUri?.[0]?.fsPath;
      return (selected && homeDir && replaceHomeWithTilde(selected, homeDir)) ?? selected;
    };
  }

  try {
    inputBox.show();
    return await waitForInputBoxValue(vs, inputBox, options.validateInput, onCustomButton);
  } finally {
    inputBox.dispose();
  }
}
