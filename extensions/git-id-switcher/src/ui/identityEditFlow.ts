/**
 * Identity Edit Flow
 *
 * UI for editing existing identity profiles.
 * Supports field selection, value input with back navigation,
 * and visual feedback for saved fields.
 *
 * @module ui/identityEditFlow
 */

import { getVSCode } from '../core/vscodeLoader';
import {
  type Identity,
  getIdentities,
  getIdentitiesWithValidation,
  getIdentityLabel,
  getIdentityDetail,
  getFieldMetadata,
} from '../identity/identity';
import {
  type VSCodeAPI,
  type FieldQuickPickItem,
  type QuickInputResult,
  getPlaceholderForField,
  getInputBoxPrompt,
  buildFieldItems,
  showFieldInputBox,
  saveEditedField,
  waitForQuickPickSelection,
} from './identityFormUtils';
import {
  isOptionalField,
  validateFieldInput,
} from './identityFormValidation';

// ============================================================================
// Type Definitions
// ============================================================================

/** Identity selection item for edit wizard */
interface IdentityQuickPickItem {
  readonly label: string;
  readonly detail?: string;
  readonly identity: Identity;
}

/** Editable fields (excludes 'id' which is immutable) */
type EditableField = Exclude<keyof Identity, 'id'>;

/** EditableField + 'id' (used for ID editing when only one profile exists) */
type EditableFieldOrId = EditableField | 'id';

/** State for edit loop */
interface EditLoopState {
  identity: Identity;
  savedField?: keyof Identity;
  hasUpdated: boolean;
}

// ============================================================================
// Identity Selection
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

// ============================================================================
// Field Selection
// ============================================================================

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
): Promise<{ item: FieldQuickPickItem; field: EditableFieldOrId } | 'back' | undefined> {
  const identities = getIdentities();
  const identityCount = identities.length;

  const quickPick = vs.window.createQuickPick<FieldQuickPickItem>();
  quickPick.title = vs.l10n.t('Edit Identity: {0}', identity.id);
  quickPick.placeholder = vs.l10n.t('Filter...');
  quickPick.ignoreFocusOut = true;
  quickPick.buttons = [vs.QuickInputButtons.Back];
  quickPick.items = buildFieldItems(vs, identity, savedField, identityCount);

  try {
    quickPick.show();
    const selection = await waitForQuickPickSelection<FieldQuickPickItem>(vs, quickPick);

    // Handle back button or cancel
    if (selection === 'back' || selection === undefined) {
      return selection;
    }

    // Skip disabled items (ID field locked when multiple profiles)
    if (selection._isDisabled || selection.field === null) {
      return undefined;
    }

    return {
      item: selection,
      field: selection.field,
    };
  } finally {
    quickPick.dispose();
  }
}

// ============================================================================
// Value Input
// ============================================================================

/**
 * Prompt for field value input.
 * Uses showFieldInputBox for back button and file picker support.
 *
 * @param vs - VS Code API
 * @param field - Field name (guaranteed non-null)
 * @param currentValue - Current field value
 * @param currentIdentityId - Current identity ID (for ID self-exclusion in duplicate check)
 * @returns New value, 'back' if back pressed, undefined if cancelled
 */
async function promptFieldValueInput(
  vs: VSCodeAPI,
  field: EditableFieldOrId,
  currentValue: string,
  currentIdentityId?: string
): Promise<QuickInputResult<string>> {
  const optional = isOptionalField(field);

  return showFieldInputBox(vs, {
    title: vs.l10n.t('Edit Identity: {0}', vs.l10n.t(getFieldMetadata(field)?.labelKey ?? field)),
    value: currentValue,
    placeholder: getPlaceholderForField(vs, field),
    prompt: getInputBoxPrompt(vs, optional, 'edit'),
    field,
    validateInput: (value: string) => validateFieldInput(vs, field, value, optional, currentIdentityId),
  });
}

// ============================================================================
// State Management
// ============================================================================

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
  selection: { field: EditableFieldOrId },
  inputValue: string
): Promise<'saved' | 'back' | 'error'> {
  const { field } = selection;
  const result = await promptFieldValueInput(vs, field, inputValue, state.identity.id);

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
  // ID change: refresh with new ID (old ID no longer exists in config)
  const refreshId = (field === 'id' && finalValue) ? finalValue : state.identity.id;
  const refreshed = refreshIdentity(refreshId);
  if (refreshed) {
    state.identity = refreshed;
  }
  return 'saved';
}

// ============================================================================
// Main Edit Loop
// ============================================================================

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

// ============================================================================
// Public API
// ============================================================================

/**
 * Show the edit identity wizard.
 * Supports Esc to go back from value input to field selection.
 *
 * @param targetIdentity - Optional identity to edit (skips selection step)
 * @returns true if identity was updated, false if cancelled
 */
export async function showEditProfileFlow(
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
