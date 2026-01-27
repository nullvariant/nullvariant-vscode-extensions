/**
 * Identity Management UI
 *
 * Provides UI for managing identities (Add/Edit/Delete).
 * Uses VS Code QuickPick and InputBox APIs.
 *
 * Security: All user input is validated at the UI layer (first line of defense)
 * and again at the persistence layer (defense-in-depth).
 *
 * @module ui/identityManager
 */

import { getVSCode } from '../core/vscodeLoader';
import {
  Identity,
  getIdentitiesWithValidation,
  getIdentityLabel,
  getIdentityDetail,
  updateIdentityInConfig,
  addIdentityToConfig,
  FIELD_METADATA,
  FieldMetadata,
} from '../identity/identity';
import {
  MAX_IDENTITIES,
  MAX_ID_LENGTH,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_SSH_HOST_LENGTH,
} from '../core/constants';
import {
  isValidIdentityId,
  isValidEmail,
  hasDangerousChars,
  GPG_KEY_REGEX,
  SSH_HOST_REGEX,
} from '../validators/common';
import { validateSshKeyPathFormat } from '../identity/inputValidator';
import { isUnderSshDirectory } from '../security/pathUtils';
import { getUserSafeMessage } from '../core/errors';
import { securityLogger } from '../security/securityLogger';

// ============================================================================
// Type Definitions
// ============================================================================

/** VS Code API type alias for cleaner function signatures */
type VSCodeAPI = NonNullable<ReturnType<typeof getVSCode>>;

/** Field selection item for edit wizard */
interface FieldQuickPickItem {
  readonly label: string;
  readonly description?: string;
  readonly detail?: string;
  readonly field: keyof Identity | null;
  readonly _isDisabled?: boolean;
}

/** Identity selection item for edit wizard */
interface IdentityQuickPickItem {
  readonly label: string;
  readonly detail?: string;
  readonly identity: Identity;
}

/** Editable fields (excludes 'id' which is immutable) */
type EditableField = Exclude<keyof Identity, 'id'>;

/** Optional fields that can be cleared */
const OPTIONAL_FIELDS: ReadonlySet<keyof Identity> = new Set([
  'service', 'icon', 'description',
  'sshKeyPath', 'sshHost', 'gpgKeyId',
]);

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if a field is optional (can be empty).
 *
 * @param field - The field name to check
 * @returns true if the field can be empty
 */
function isOptionalField(field: keyof Identity): boolean {
  return OPTIONAL_FIELDS.has(field);
}

/**
 * Validate ID input.
 *
 * SECURITY: Validates format to prevent injection attacks.
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @param existingIds - Set of existing identity IDs
 * @returns Error message or null if valid
 */
function validateIdInput(
  vs: VSCodeAPI,
  value: string,
  existingIds: Set<string>
): string | null {
  if (!value) {
    return vs.l10n.t('ID cannot be empty');
  }
  if (!isValidIdentityId(value, MAX_ID_LENGTH)) {
    return vs.l10n.t(
      'ID must be 1-{0} alphanumeric characters, underscores, or hyphens',
      MAX_ID_LENGTH
    );
  }
  if (existingIds.has(value)) {
    return vs.l10n.t('ID already exists');
  }
  return null;
}

/**
 * Validate Name input.
 *
 * SECURITY: Checks for dangerous shell metacharacters to prevent command injection.
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateNameInput(vs: VSCodeAPI, value: string): string | null {
  if (!value || value.trim().length === 0) {
    return vs.l10n.t('Name cannot be empty');
  }
  if (value.length > MAX_NAME_LENGTH) {
    return vs.l10n.t('Name is too long (max {0} characters)', MAX_NAME_LENGTH);
  }
  // SECURITY: Check for dangerous shell metacharacters
  if (hasDangerousChars(value)) {
    return vs.l10n.t('Name contains invalid characters');
  }
  return null;
}

/**
 * Validate Email input.
 *
 * SECURITY: Validates email format to prevent malformed data.
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateEmailInput(vs: VSCodeAPI, value: string): string | null {
  if (!value) {
    return vs.l10n.t('Email cannot be empty');
  }
  if (value.length > MAX_EMAIL_LENGTH) {
    return vs.l10n.t('Email is too long (max {0} characters)', MAX_EMAIL_LENGTH);
  }
  if (!isValidEmail(value)) {
    return vs.l10n.t('Invalid email format');
  }
  return null;
}

/**
 * Validate SSH key path input.
 *
 * SECURITY: Reuses validateSshKeyPathFormat from inputValidator.ts
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateSshKeyPathInput(vs: VSCodeAPI, value: string): string | null {
  if (!value) return null; // Optional field
  const errors: string[] = [];
  // Reuse existing validator (Defense-in-depth)
  validateSshKeyPathFormat(value, errors);
  if (errors.length > 0) {
    return vs.l10n.t('Invalid SSH key path format');
  }
  // Safety First: Also check that path is under ~/.ssh directory
  if (!isUnderSshDirectory(value)) {
    return vs.l10n.t('SSH key path must be under ~/.ssh/ directory');
  }
  return null;
}

/**
 * Validate GPG key ID input.
 *
 * SECURITY: Reuses GPG_KEY_REGEX from validators/common.ts
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateGpgKeyIdInput(vs: VSCodeAPI, value: string): string | null {
  if (!value) return null; // Optional field
  if (!GPG_KEY_REGEX.test(value)) {
    return vs.l10n.t('GPG key ID must be 8-40 hexadecimal characters');
  }
  return null;
}

/**
 * Validate SSH host input.
 *
 * SECURITY: Reuses SSH_HOST_REGEX from validators/common.ts
 * Defense-in-depth: identity.ts also validates on save.
 *
 * @param vs - VS Code API
 * @param value - Input value
 * @returns Error message or null if valid
 */
function validateSshHostInput(vs: VSCodeAPI, value: string): string | null {
  if (!value) return null; // Optional field
  if (!SSH_HOST_REGEX.test(value)) {
    return vs.l10n.t('SSH host must contain only valid hostname characters');
  }
  if (value.length > MAX_SSH_HOST_LENGTH) {
    return vs.l10n.t('SSH host is too long (max {0} characters)', MAX_SSH_HOST_LENGTH);
  }
  return null;
}

/**
 * Validate field input based on field type.
 *
 * @param vs - VS Code API
 * @param field - Field being edited
 * @param value - Input value
 * @param isOptional - Whether the field is optional
 * @returns Error message or null if valid
 */
function validateFieldInput(
  vs: VSCodeAPI,
  field: keyof Identity,
  value: string,
  isOptional: boolean
): string | null {
  // Optional fields can be empty
  if (isOptional && value.trim() === '') {
    return null;
  }

  switch (field) {
    case 'name':
      return validateNameInput(vs, value);
    case 'email':
      return validateEmailInput(vs, value);
    case 'sshKeyPath':
      return validateSshKeyPathInput(vs, value);
    case 'gpgKeyId':
      return validateGpgKeyIdInput(vs, value);
    case 'sshHost':
      return validateSshHostInput(vs, value);
    default:
      // Optional fields (service, icon, description) have no specific validation
      return null;
  }
}

// ============================================================================
// UI Utilities
// ============================================================================

/**
 * Get placeholder text for a field.
 *
 * @param vs - VS Code API
 * @param field - Field name
 * @returns Localized placeholder text
 */
function getPlaceholderForField(vs: VSCodeAPI, field: keyof Identity): string {
  switch (field) {
    case 'name':
      return vs.l10n.t('Git user.name');
    case 'email':
      return vs.l10n.t('Git user.email');
    case 'service':
      return vs.l10n.t('e.g., GitHub, GitLab, Bitbucket');
    case 'icon':
      return vs.l10n.t('Emoji icon (e.g., 👤, 🏠)');
    case 'description':
      return vs.l10n.t('Short description');
    case 'sshKeyPath':
      return vs.l10n.t('e.g., ~/.ssh/id_ed25519_work');
    case 'sshHost':
      return vs.l10n.t('e.g., github-work, gitlab-personal');
    case 'gpgKeyId':
      return vs.l10n.t('e.g., ABCD1234EF567890');
    default:
      return '';
  }
}

/**
 * Build field items for edit wizard using FIELD_METADATA.
 * Unified with Step 6 (showAddIdentityForm) for consistent UI.
 *
 * @param vs - VS Code API
 * @param identity - Identity being edited
 * @param savedField - Field that was just saved (for visual feedback)
 * @returns Array of field items for QuickPick
 */
function buildFieldItems(
  vs: VSCodeAPI,
  identity: Identity,
  savedField?: keyof Identity
): FieldQuickPickItem[] {
  const items: FieldQuickPickItem[] = [];

  for (const meta of FIELD_METADATA) {
    const value = identity[meta.key];
    const hasValue = value !== undefined && String(value).trim() !== '';
    const displayValue = hasValue ? String(value) : vs.l10n.t('(none)');

    // ID field is not editable (locked)
    // Using $(lock) icon in label (from FIELD_METADATA), value in description
    if (meta.key === 'id') {
      items.push({
        label: `$(${meta.icon}) ${vs.l10n.t(meta.labelKey)}`,
        description: displayValue,
        detail: vs.l10n.t('(cannot be changed)'),
        field: null,
        _isDisabled: true,
      });
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
async function saveNewIdentity(vs: VSCodeAPI, identity: Identity): Promise<boolean> {
  try {
    await addIdentityToConfig(identity);
    // SECURITY: Log identity creation for audit trail
    securityLogger.logConfigChange('identities');
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
async function saveEditedField(
  vs: VSCodeAPI,
  identityId: string,
  field: keyof Identity,
  value: string | undefined
): Promise<boolean> {
  try {
    await updateIdentityInConfig(identityId, field, value);
    // SECURITY: Log identity update for audit trail
    securityLogger.logConfigChange('identities');
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
// Add Identity Form
// ============================================================================

/** State for add identity form */
interface AddFormState {
  [key: string]: string | undefined;
  id: string;
  name: string;
  email: string;
  service?: string;
  icon?: string;
  description?: string;
  sshKeyPath?: string;
  sshHost?: string;
  gpgKeyId?: string;
}

/** QuickPick item for add form field */
interface AddFormQuickPickItem {
  readonly label: string;
  readonly description?: string;
  readonly detail?: string;
  readonly field: keyof Identity | 'save' | null;
  readonly _isDisabled?: boolean;
  readonly _isSaveButton?: boolean;
}

/**
 * Check if all required fields are filled.
 *
 * @param state - Current form state
 * @returns true if all required fields have values
 */
function areRequiredFieldsFilled(state: AddFormState): boolean {
  return state.id.trim() !== '' &&
         state.name.trim() !== '' &&
         state.email.trim() !== '';
}

/**
 * Build QuickPick items for add form.
 *
 * @param vs - VS Code API
 * @param state - Current form state
 * @param existingIds - Set of existing identity IDs for duplicate check
 * @returns Array of QuickPick items
 */
function buildAddFormItems(
  vs: VSCodeAPI,
  state: AddFormState,
  existingIds: Set<string>
): AddFormQuickPickItem[] {
  const items: AddFormQuickPickItem[] = [];

  for (const meta of FIELD_METADATA) {
    const value = state[meta.key as keyof AddFormState];
    const hasValue = value !== undefined && value.trim() !== '';
    const requiredMark = meta.required ? '*' : '';
    const displayValue = hasValue
      ? value
      : vs.l10n.t('(none)');

    // Check for ID duplicate (value is guaranteed to be defined when hasValue is true)
    let detail: string | undefined;
    if (meta.key === 'id' && hasValue && value && existingIds.has(value)) {
      detail = vs.l10n.t('ID already exists');
    }

    items.push({
      label: `$(${meta.icon}) ${vs.l10n.t(meta.labelKey)}${requiredMark}`,
      description: displayValue,
      detail,
      field: meta.key,
    });
  }

  // Separator
  items.push({
    label: '─────────────',
    field: null,
    _isDisabled: true,
  });

  // Save button (disabled until required fields are filled)
  const canSave = areRequiredFieldsFilled(state) && !existingIds.has(state.id);
  items.push({
    label: canSave
      ? `$(check) ${vs.l10n.t('Save')}`
      : `$(circle-slash) ${vs.l10n.t('Save')}`,
    description: canSave
      ? undefined
      : vs.l10n.t('(fill required fields)'),
    field: 'save',
    _isDisabled: !canSave,
    _isSaveButton: true,
  });

  return items;
}

/**
 * Prompt for field value input in add form.
 * Uses showFieldInputBox for back button support.
 *
 * @param vs - VS Code API
 * @param meta - Field metadata
 * @param currentValue - Current field value
 * @param existingIds - Set of existing identity IDs (for ID validation)
 * @returns New value, 'back' if back pressed, undefined if cancelled
 */
async function promptAddFormFieldInput(
  vs: VSCodeAPI,
  meta: FieldMetadata,
  currentValue: string,
  existingIds: Set<string>
): Promise<QuickInputResult<string>> {
  const isOptional = !meta.required;

  return showFieldInputBox(vs, {
    title: vs.l10n.t('New Profile: {0}', vs.l10n.t(meta.labelKey)),
    value: currentValue,
    placeholder: getPlaceholderForField(vs, meta.key),
    prompt: isOptional ? vs.l10n.t('Leave empty to skip') : undefined,
    field: meta.key,
    validateInput: (value: string) => {
      if (meta.key === 'id') {
        return validateIdInput(vs, value, existingIds);
      }
      return validateFieldInput(vs, meta.key, value, isOptional);
    },
  });
}

/** Generic QuickPick type */
type GenericQuickPick<T> = ReturnType<VSCodeAPI['window']['createQuickPick']> & {
  readonly selectedItems: readonly T[];
};

/** QuickPick type for add form (for backward compatibility) */
type AddFormQuickPick = GenericQuickPick<AddFormQuickPickItem>;

/** InputBox type */
type GenericInputBox = ReturnType<VSCodeAPI['window']['createInputBox']>;

/** Result type for QuickInput operations (QuickPick/InputBox with back button) */
type QuickInputResult<T> = T | 'back' | undefined;

/**
 * Wait for QuickPick selection or button press.
 * Generic helper used by both Add Form and Field Selection.
 *
 * @param vs - VS Code API
 * @param quickPick - The QuickPick instance
 * @returns Selected item, 'back' if back pressed, undefined if cancelled
 */
function waitForQuickPickSelection<T>(
  vs: VSCodeAPI,
  quickPick: GenericQuickPick<T>
): Promise<T | 'back' | undefined> {
  return new Promise(resolve => {
    let resolved = false;

    const cleanup = (disposables: { dispose(): void }[]): void => {
      if (!resolved) {
        resolved = true;
        disposables.forEach(d => d.dispose());
      }
    };

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
    let resolved = false;

    const cleanup = (disposables: { dispose(): void }[]): void => {
      if (!resolved) {
        resolved = true;
        disposables.forEach(d => d.dispose());
      }
    };

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

/** Options for showFieldInputBox */
interface FieldInputBoxOptions {
  readonly title: string;
  readonly value: string;
  readonly placeholder: string;
  readonly prompt?: string;
  readonly validateInput: (value: string) => string | null;
  readonly field?: keyof Identity;
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
async function showFieldInputBox(
  vs: VSCodeAPI,
  options: FieldInputBoxOptions
): Promise<QuickInputResult<string>> {
  const inputBox = vs.window.createInputBox();
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
      { iconPath: new vs.ThemeIcon('folder-opened'), tooltip: vs.l10n.t('Browse...') },
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
      return fileUri?.[0]?.fsPath;
    };
  }

  try {
    inputBox.show();
    return await waitForInputBoxValue(vs, inputBox, options.validateInput, onCustomButton);
  } finally {
    inputBox.dispose();
  }
}

/**
 * Build Identity from add form state.
 *
 * @param state - Current form state
 * @returns Identity object
 */
function buildIdentityFromState(state: AddFormState): Identity {
  const identity: Identity = {
    id: state.id,
    name: state.name,
    email: state.email,
  };

  if (state.service?.trim()) identity.service = state.service;
  if (state.icon?.trim()) identity.icon = state.icon;
  if (state.description?.trim()) identity.description = state.description;
  if (state.sshKeyPath?.trim()) identity.sshKeyPath = state.sshKeyPath;
  if (state.sshHost?.trim()) identity.sshHost = state.sshHost;
  if (state.gpgKeyId?.trim()) identity.gpgKeyId = state.gpgKeyId;

  return identity;
}

/**
 * Handle field edit in add form.
 *
 * @param vs - VS Code API
 * @param quickPick - The QuickPick instance
 * @param state - Current form state
 * @param fieldKey - Field to edit
 * @param existingIds - Set of existing identity IDs
 */
async function handleAddFormFieldEdit(
  vs: VSCodeAPI,
  quickPick: AddFormQuickPick,
  state: AddFormState,
  fieldKey: keyof Identity,
  existingIds: Set<string>
): Promise<void> {
  const meta = FIELD_METADATA.find(m => m.key === fieldKey);
  if (!meta) return;

  quickPick.hide();
  const currentValue = state[fieldKey] ?? '';
  const result = await promptAddFormFieldInput(vs, meta, currentValue, existingIds);

  // 'back' or undefined: return to form without changes
  // string: update state with new value
  if (typeof result === 'string') {
    (state as Record<string, string | undefined>)[fieldKey] = result.trim() || undefined;
  }
}

/**
 * Execute the add form loop.
 *
 * @param vs - VS Code API
 * @param existingIds - Set of existing identity IDs
 * @returns Created identity, or undefined if cancelled
 */
async function executeAddFormLoop(
  vs: VSCodeAPI,
  existingIds: Set<string>
): Promise<Identity | undefined> {
  const state: AddFormState = {
    id: '',
    name: '',
    email: '',
  };

  const quickPick = vs.window.createQuickPick<AddFormQuickPickItem>();
  quickPick.title = vs.l10n.t('New Profile');
  quickPick.placeholder = vs.l10n.t('Filter...');
  quickPick.buttons = [vs.QuickInputButtons.Back];

  try {
    while (true) {
      quickPick.items = buildAddFormItems(vs, state, existingIds);
      quickPick.show();

      const selection = await waitForQuickPickSelection<AddFormQuickPickItem>(vs, quickPick);

      // User cancelled or pressed back
      if (selection === undefined || selection === 'back') {
        return undefined;
      }

      // Skip disabled items (separator)
      if (selection._isDisabled && !selection._isSaveButton) {
        continue;
      }

      // Handle save button
      if (selection.field === 'save') {
        if (!selection._isDisabled) {
          return buildIdentityFromState(state);
        }
        continue;
      }

      // Handle field selection
      if (selection.field) {
        await handleAddFormFieldEdit(vs, quickPick, state, selection.field, existingIds);
      }
    }
  } finally {
    quickPick.dispose();
  }
}

/**
 * Show the add identity form (property list style).
 * Displays all fields with Codicons, allows editing each field.
 * Save is enabled only when all required fields are filled.
 *
 * @returns The created identity if saved, undefined if cancelled
 */
export async function showAddIdentityForm(): Promise<Identity | undefined> {
  const vs = getVSCode();
  if (!vs) {
    return undefined;
  }

  // SECURITY: Check maximum limit before starting (DoS protection)
  const identities = getIdentitiesWithValidation();
  if (identities.length >= MAX_IDENTITIES) {
    vs.window.showWarningMessage(
      vs.l10n.t('Maximum number of identities reached ({0})', MAX_IDENTITIES)
    );
    return undefined;
  }

  const existingIds = new Set(identities.map(i => i.id));
  const newIdentity = await executeAddFormLoop(vs, existingIds);

  if (!newIdentity) {
    return undefined;
  }

  const saved = await saveNewIdentity(vs, newIdentity);
  if (saved) {
    return newIdentity;
  }
  return undefined;
}

/**
 * Show the add identity wizard (3 steps: ID → Name → Email).
 * @deprecated Use showAddIdentityForm() instead
 * @returns true if identity was created, false if cancelled
 */
export async function showAddIdentityWizard(): Promise<boolean> {
  const result = await showAddIdentityForm();
  return result !== undefined;
}

// ============================================================================
// Edit Identity Wizard
// ============================================================================

/**
 * Select identity to edit (when target not provided).
 *
 * @param vs - VS Code API
 * @returns Selected identity or undefined if cancelled
 */
async function selectIdentityToEdit(vs: VSCodeAPI): Promise<Identity | undefined> {
  const identities = getIdentitiesWithValidation();
  if (identities.length === 0) {
    vs.window.showWarningMessage(
      vs.l10n.t('No identities configured. Add identities in settings: {0}', 'gitIdSwitcher.identities')
    );
    return undefined;
  }

  const identityItems: IdentityQuickPickItem[] = identities.map(identity => ({
    label: getIdentityLabel(identity),
    detail: getIdentityDetail(identity),
    identity,
  }));

  const selectedItem = await vs.window.showQuickPick(identityItems, {
    title: vs.l10n.t('Edit Identity: Select'),
    placeHolder: vs.l10n.t('Select identity to edit'),
  });

  return selectedItem?.identity;
}

/**
 * Show field selection QuickPick with back button.
 * Uses createQuickPick API for back button support and Filter... placeholder.
 *
 * @param vs - VS Code API
 * @param identity - Identity being edited
 * @param savedField - Field that was just saved (for visual feedback)
 * @returns Selected field, 'back' if back pressed, undefined if cancelled
 */
async function showFieldSelectionQuickPick(
  vs: VSCodeAPI,
  identity: Identity,
  savedField?: keyof Identity
): Promise<{ item: FieldQuickPickItem; field: EditableField } | 'back' | undefined> {
  const quickPick = vs.window.createQuickPick<FieldQuickPickItem>();
  quickPick.title = vs.l10n.t('Edit Identity: {0}', identity.id);
  quickPick.placeholder = vs.l10n.t('Filter...');
  quickPick.buttons = [vs.QuickInputButtons.Back];
  quickPick.items = buildFieldItems(vs, identity, savedField);

  try {
    quickPick.show();
    const selection = await waitForQuickPickSelection<FieldQuickPickItem>(vs, quickPick);

    // Handle back button or cancel
    if (selection === 'back' || selection === undefined) {
      return selection;
    }

    // Skip disabled items (ID field)
    if (selection._isDisabled || selection.field === null) {
      return undefined;
    }

    return {
      item: selection,
      field: selection.field as EditableField,
    };
  } finally {
    quickPick.dispose();
  }
}

/**
 * Prompt for field value input.
 * Uses showFieldInputBox for back button and file picker support.
 *
 * @param vs - VS Code API
 * @param fieldItem - Field being edited
 * @param field - Field name (guaranteed non-null)
 * @param currentValue - Current field value
 * @returns New value, 'back' if back pressed, undefined if cancelled
 */
async function promptFieldValueInput(
  vs: VSCodeAPI,
  fieldItem: FieldQuickPickItem,
  field: EditableField,
  currentValue: string
): Promise<QuickInputResult<string>> {
  const optional = isOptionalField(field);

  return showFieldInputBox(vs, {
    title: vs.l10n.t('Edit Identity: {0}', fieldItem.label),
    value: currentValue,
    placeholder: getPlaceholderForField(vs, field),
    prompt: optional ? vs.l10n.t('Leave empty to clear') : undefined,
    field,
    validateInput: (value: string) => validateFieldInput(vs, field, value, optional),
  });
}

/** State for edit loop */
interface EditLoopState {
  identity: Identity;
  savedField?: keyof Identity;
  hasUpdated: boolean;
}

/**
 * Refresh identity after save to get updated values.
 *
 * @param identityId - ID of the identity to refresh
 * @returns Refreshed identity or undefined if not found
 */
function refreshIdentity(identityId: string): Identity | undefined {
  const identities = getIdentitiesWithValidation();
  return identities.find(i => i.id === identityId);
}

/**
 * Process the value input step and save the field.
 *
 * @param vs - VS Code API
 * @param state - Edit loop state
 * @param selection - Selected field info
 * @param inputValue - Current input value
 * @returns 'saved' if saved, 'back' if user pressed Esc, 'error' if save failed
 */
async function processFieldValueInput(
  vs: VSCodeAPI,
  state: EditLoopState,
  selection: { item: FieldQuickPickItem; field: EditableField },
  inputValue: string
): Promise<'saved' | 'back' | 'error'> {
  const { item, field } = selection;
  const result = await promptFieldValueInput(vs, item, field, inputValue);

  // 'back' or undefined: return to field selection
  if (result === undefined || result === 'back') {
    return 'back';
  }

  const optional = isOptionalField(field);
  const finalValue = optional && result.trim() === '' ? undefined : result;
  const saved = await saveEditedField(vs, state.identity.id, field, finalValue);

  if (!saved) {
    return 'error';
  }

  state.hasUpdated = true;
  state.savedField = field;
  const refreshed = refreshIdentity(state.identity.id);
  if (refreshed) {
    state.identity = refreshed;
  }
  return 'saved';
}

/**
 * Execute the field selection and value input loop.
 * After editing a field, returns to field selection (loop continues).
 * Supports Esc to go back from value input to field selection.
 * Shows visual feedback when a field is saved.
 *
 * @param vs - VS Code API
 * @param identity - Identity being edited
 * @returns true if any field was updated, false if cancelled without changes
 */
async function executeFieldEditLoop(vs: VSCodeAPI, identity: Identity): Promise<boolean> {
  const state: EditLoopState = {
    identity,
    hasUpdated: false,
  };

  while (true) {
    // Step 1: Field selection
    const result = await showFieldSelectionQuickPick(vs, state.identity, state.savedField);
    state.savedField = undefined; // Clear feedback after showing

    if (result === 'back' || !result) {
      return state.hasUpdated;
    }

    // Step 2: Value input
    // All outcomes ('back', 'saved', 'error') return to field selection
    // Loop continues until user presses back button or cancels at field selection
    const inputValue = state.identity[result.field] ?? '';
    await processFieldValueInput(vs, state, result, inputValue);
  }
}

/**
 * Show the edit identity wizard.
 * Supports Esc to go back from value input to field selection.
 *
 * @param targetIdentity - Optional identity to edit (skips selection step)
 * @returns true if identity was updated, false if cancelled
 */
export async function showEditIdentityWizard(
  targetIdentity?: Identity
): Promise<boolean> {
  const vs = getVSCode();
  if (!vs) {
    return false;
  }

  // Determine identity to edit
  const selectedIdentity = targetIdentity ?? (await selectIdentityToEdit(vs));
  if (!selectedIdentity) {
    return false;
  }

  return executeFieldEditLoop(vs, selectedIdentity);
}
