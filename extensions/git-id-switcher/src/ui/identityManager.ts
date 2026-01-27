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

/** Add wizard step constants */
const ADD_WIZARD_FIRST_STEP = 1;
const ADD_WIZARD_LAST_STEP = 3;

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
 * Build field items for edit wizard.
 *
 * @param vs - VS Code API
 * @param identity - Identity being edited
 * @returns Array of field items for QuickPick
 */
function buildFieldItems(vs: VSCodeAPI, identity: Identity): FieldQuickPickItem[] {
  return [
    {
      label: '$(lock) ID',
      description: identity.id,
      detail: vs.l10n.t('(cannot be changed)'),
      field: null,
      _isDisabled: true,
    },
    {
      label: vs.l10n.t('Name'),
      description: identity.name,
      field: 'name',
    },
    {
      label: vs.l10n.t('Email'),
      description: identity.email,
      field: 'email',
    },
    {
      label: vs.l10n.t('Service'),
      description: identity.service || vs.l10n.t('(none)'),
      field: 'service',
    },
    {
      label: vs.l10n.t('Icon'),
      description: identity.icon || vs.l10n.t('(none)'),
      field: 'icon',
    },
    {
      label: vs.l10n.t('Description'),
      description: identity.description || vs.l10n.t('(none)'),
      field: 'description',
    },
    {
      label: '$(key) ' + vs.l10n.t('SSH Key Path'),
      description: identity.sshKeyPath || vs.l10n.t('(none)'),
      field: 'sshKeyPath',
    },
    {
      label: '$(globe) ' + vs.l10n.t('SSH Host'),
      description: identity.sshHost || vs.l10n.t('(none)'),
      field: 'sshHost',
    },
    {
      label: '$(shield) ' + vs.l10n.t('GPG Key ID'),
      description: identity.gpgKeyId || vs.l10n.t('(none)'),
      field: 'gpgKeyId',
    },
  ];
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
// Add Identity Wizard
// ============================================================================

/**
 * Prompt for ID input in add wizard.
 *
 * @param vs - VS Code API
 * @param existingIds - Set of existing identity IDs
 * @param currentValue - Current value (for back navigation)
 * @returns Entered ID or undefined if cancelled
 */
async function promptIdInput(
  vs: VSCodeAPI,
  existingIds: Set<string>,
  currentValue: string
): Promise<string | undefined> {
  return vs.window.showInputBox({
    title: vs.l10n.t('Add Identity (1/3): ID'),
    placeHolder: vs.l10n.t('e.g., work-github, personal'),
    value: currentValue,
    validateInput: (value: string) => validateIdInput(vs, value, existingIds),
  });
}

/**
 * Prompt for Name input in add wizard.
 *
 * @param vs - VS Code API
 * @param currentValue - Current value (for back navigation)
 * @returns Entered name or undefined if cancelled
 */
async function promptNameInput(
  vs: VSCodeAPI,
  currentValue: string
): Promise<string | undefined> {
  return vs.window.showInputBox({
    title: vs.l10n.t('Add Identity (2/3): Name'),
    placeHolder: vs.l10n.t('Git user.name'),
    value: currentValue,
    validateInput: (value: string) => validateNameInput(vs, value),
  });
}

/**
 * Prompt for Email input in add wizard.
 *
 * @param vs - VS Code API
 * @param currentValue - Current value (for back navigation)
 * @returns Entered email or undefined if cancelled
 */
async function promptEmailInput(
  vs: VSCodeAPI,
  currentValue: string
): Promise<string | undefined> {
  return vs.window.showInputBox({
    title: vs.l10n.t('Add Identity (3/3): Email'),
    placeHolder: vs.l10n.t('Git user.email'),
    value: currentValue,
    validateInput: (value: string) => validateEmailInput(vs, value),
  });
}

/** State for add identity wizard */
interface AddWizardState {
  idValue: string;
  nameValue: string;
  emailValue: string;
  currentStep: number;
}

/**
 * Execute step 1 of add wizard (ID input).
 * @returns Updated state, or undefined if cancelled
 */
async function executeAddStep1(
  vs: VSCodeAPI,
  existingIds: Set<string>,
  state: AddWizardState
): Promise<AddWizardState | undefined> {
  const id = await promptIdInput(vs, existingIds, state.idValue);
  if (id === undefined) {
    return undefined; // Esc on step 1 → cancel wizard
  }
  return { ...state, idValue: id, currentStep: 2 };
}

/**
 * Execute step 2 of add wizard (Name input).
 * @returns Updated state (may go back to step 1)
 */
async function executeAddStep2(
  vs: VSCodeAPI,
  state: AddWizardState
): Promise<AddWizardState> {
  const name = await promptNameInput(vs, state.nameValue);
  if (name === undefined) {
    return { ...state, currentStep: 1 }; // Esc → go back to step 1
  }
  return { ...state, nameValue: name, currentStep: 3 };
}

/**
 * Execute step 3 of add wizard (Email input).
 * @returns Updated state (may go back to step 2, or complete with step 4)
 */
async function executeAddStep3(
  vs: VSCodeAPI,
  state: AddWizardState
): Promise<AddWizardState> {
  const email = await promptEmailInput(vs, state.emailValue);
  if (email === undefined) {
    return { ...state, currentStep: 2 }; // Esc → go back to step 2
  }
  return { ...state, emailValue: email, currentStep: 4 }; // Complete
}

/**
 * Execute the add identity wizard loop.
 * @returns Collected identity data, or undefined if cancelled
 */
async function executeAddWizardLoop(
  vs: VSCodeAPI,
  existingIds: Set<string>
): Promise<{ id: string; name: string; email: string } | undefined> {
  let state: AddWizardState = {
    idValue: '',
    nameValue: '',
    emailValue: '',
    currentStep: 1,
  };

  while (state.currentStep >= ADD_WIZARD_FIRST_STEP && state.currentStep <= ADD_WIZARD_LAST_STEP) {
    if (state.currentStep === 1) {
      const result = await executeAddStep1(vs, existingIds, state);
      if (!result) return undefined;
      state = result;
    } else if (state.currentStep === 2) {
      state = await executeAddStep2(vs, state);
    } else {
      state = await executeAddStep3(vs, state);
    }
  }

  return { id: state.idValue, name: state.nameValue, email: state.emailValue };
}

/**
 * Show the add identity wizard (3 steps: ID → Name → Email).
 * Supports Esc to go back to previous step.
 *
 * @returns true if identity was created, false if cancelled
 */
export async function showAddIdentityWizard(): Promise<boolean> {
  const vs = getVSCode();
  if (!vs) {
    return false;
  }

  // SECURITY: Check maximum limit before starting (DoS protection)
  const identities = getIdentitiesWithValidation();
  if (identities.length >= MAX_IDENTITIES) {
    vs.window.showWarningMessage(
      vs.l10n.t('Maximum number of identities reached ({0})', MAX_IDENTITIES)
    );
    return false;
  }

  const existingIds = new Set(identities.map(i => i.id));
  const result = await executeAddWizardLoop(vs, existingIds);

  if (!result) {
    return false;
  }

  const newIdentity: Identity = { id: result.id, name: result.name, email: result.email };
  return saveNewIdentity(vs, newIdentity);
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
 * Select field to edit.
 *
 * @param vs - VS Code API
 * @param identity - Identity being edited
 * @returns Selected field item with non-null field, or undefined if cancelled
 */
async function selectFieldToEdit(
  vs: VSCodeAPI,
  identity: Identity
): Promise<{ item: FieldQuickPickItem; field: EditableField } | undefined> {
  const fieldItems = buildFieldItems(vs, identity);
  const selectedField = await vs.window.showQuickPick(fieldItems, {
    title: vs.l10n.t('Edit Identity: Select Field'),
    placeHolder: vs.l10n.t('Select property to edit'),
  });

  // Return undefined if cancelled, disabled, or null field
  if (!selectedField || selectedField._isDisabled || selectedField.field === null) {
    return undefined;
  }

  // Type narrowing: at this point field is guaranteed to be non-null and editable
  return {
    item: selectedField,
    field: selectedField.field as EditableField,
  };
}

/**
 * Prompt for field value input.
 *
 * @param vs - VS Code API
 * @param fieldItem - Field being edited
 * @param field - Field name (guaranteed non-null)
 * @param currentValue - Current field value
 * @returns New value or undefined if cancelled
 */
async function promptFieldValueInput(
  vs: VSCodeAPI,
  fieldItem: FieldQuickPickItem,
  field: EditableField,
  currentValue: string
): Promise<string | undefined> {
  const optional = isOptionalField(field);

  return vs.window.showInputBox({
    title: vs.l10n.t('Edit Identity: {0}', fieldItem.label),
    value: currentValue,
    placeHolder: getPlaceholderForField(vs, field),
    prompt: optional ? vs.l10n.t('Leave empty to clear') : undefined,
    validateInput: (value: string) => validateFieldInput(vs, field, value, optional),
  });
}

/**
 * Execute the field selection and value input loop.
 * Supports Esc to go back from value input to field selection.
 *
 * @param vs - VS Code API
 * @param identity - Identity being edited
 * @returns true if updated, false if cancelled
 */
async function executeFieldEditLoop(vs: VSCodeAPI, identity: Identity): Promise<boolean> {
  let currentStep = 1;
  let selection: { item: FieldQuickPickItem; field: EditableField } | undefined;
  let lastInputValue = '';

  while (currentStep >= 1 && currentStep <= 2) {
    if (currentStep === 1) {
      selection = await selectFieldToEdit(vs, identity);
      if (!selection) {
        return false; // Esc on field selection → return to caller
      }
      lastInputValue = identity[selection.field] ?? '';
      currentStep++;
      continue;
    }

    // currentStep === 2: selection is guaranteed to be defined here
    const { item, field } = selection!;
    const newValue = await promptFieldValueInput(vs, item, field, lastInputValue);

    if (newValue === undefined) {
      currentStep--; // Esc → go back to field selection
      continue;
    }

    const optional = isOptionalField(field);
    const finalValue = optional && newValue.trim() === '' ? undefined : newValue;
    return saveEditedField(vs, identity.id, field, finalValue);
  }

  return false;
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
