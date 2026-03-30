/**
 * Identity Add Form
 *
 * UI for creating a new identity with property list style form.
 * Uses QuickPick for field selection and InputBox for value input.
 *
 * @module ui/identityAddForm
 */

import { getVSCode } from '../core/vscodeLoader';
import {
  type Identity,
  getIdentitiesWithValidation,
  FIELD_METADATA,
} from '../identity/identity';
import { MAX_IDENTITIES } from '../core/constants';
import {
  type VSCodeAPI,
  type GenericQuickPick,
  type QuickInputResult,
  getPlaceholderForField,
  getInputBoxPrompt,
  showFieldInputBox,
  saveNewIdentity,
  waitForQuickPickSelection,
} from './identityFormUtils';
import {
  validateIdInput,
  validateFieldInput,
} from './identityFormValidation';

// ============================================================================
// Type Definitions
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

/** QuickPick type for add form */
type AddFormQuickPick = GenericQuickPick<AddFormQuickPickItem>;

// ============================================================================
// Form State Helpers
// ============================================================================

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

// ============================================================================
// Form Item Builders
// ============================================================================

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
      : `$(session-in-progress) ${vs.l10n.t('Save')}`,
    description: canSave
      ? undefined
      : vs.l10n.t('(fill required fields)'),
    field: 'save',
    _isDisabled: !canSave,
    _isSaveButton: true,
  });

  return items;
}

// ============================================================================
// Field Input
// ============================================================================

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
  meta: typeof FIELD_METADATA[number],
  currentValue: string,
  existingIds: Set<string>
): Promise<QuickInputResult<string>> {
  const isOptional = !meta.required;

  return showFieldInputBox(vs, {
    title: vs.l10n.t('New Identity: {0}', vs.l10n.t(meta.labelKey)),
    value: currentValue,
    placeholder: getPlaceholderForField(vs, meta.key),
    prompt: getInputBoxPrompt(vs, isOptional, 'add'),
    field: meta.key,
    validateInput: (value: string) => {
      if (meta.key === 'id') {
        return validateIdInput(vs, value, existingIds);
      }
      return validateFieldInput(vs, meta.key, value, isOptional);
    },
  });
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
  // string (but not 'back'): update state with new value
  if (typeof result === 'string' && result !== 'back') {
    (state as Record<string, string | undefined>)[fieldKey] = result.trim() || undefined;
  }
}

// ============================================================================
// Main Form Loop
// ============================================================================

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
  quickPick.title = vs.l10n.t('New Identity');
  quickPick.placeholder = vs.l10n.t('Filter...');
  quickPick.ignoreFocusOut = true;
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

// ============================================================================
// Public API
// ============================================================================

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
