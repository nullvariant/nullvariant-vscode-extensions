/**
 * Identity Management UI
 *
 * Provides UI for managing identities (Add/Edit/Delete).
 * Uses VS Code QuickPick and InputBox APIs.
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
import { MAX_IDENTITIES, MAX_ID_LENGTH, MAX_NAME_LENGTH, MAX_EMAIL_LENGTH } from '../core/constants';
import { isValidIdentityId, isValidEmail, hasDangerousChars } from '../validators/common';
import { getUserSafeMessage } from '../core/errors';
import { securityLogger } from '../security/securityLogger';

/**
 * Show the add identity wizard (3 steps: ID → Name → Email).
 *
 * @returns true if identity was created, false if cancelled
 */
export async function showAddIdentityWizard(): Promise<boolean> {
  const vs = getVSCode();
  if (!vs) {
    return false;
  }

  // Check maximum limit before starting
  const identities = getIdentitiesWithValidation();
  if (identities.length >= MAX_IDENTITIES) {
    vs.window.showWarningMessage(
      vs.l10n.t('Maximum number of identities reached ({0})', MAX_IDENTITIES)
    );
    return false;
  }

  const existingIds = new Set(identities.map(i => i.id));

  // Step 1: ID input
  const id = await vs.window.showInputBox({
    title: vs.l10n.t('Add Identity (1/3): ID'),
    placeHolder: vs.l10n.t('e.g., work-github, personal'),
    validateInput: (value: string) => {
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
    },
  });

  if (id === undefined) {
    return false;
  }

  // Step 2: Name input with security validation
  const name = await vs.window.showInputBox({
    title: vs.l10n.t('Add Identity (2/3): Name'),
    placeHolder: vs.l10n.t('Git user.name'),
    validateInput: (value: string) => {
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
    },
  });

  if (name === undefined) {
    return false;
  }

  // Step 3: Email input
  const email = await vs.window.showInputBox({
    title: vs.l10n.t('Add Identity (3/3): Email'),
    placeHolder: vs.l10n.t('Git user.email'),
    validateInput: (value: string) => {
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
    },
  });

  if (email === undefined) {
    return false;
  }

  // Create and return the identity (saving handled by caller)
  const newIdentity: Identity = { id, name, email };

  try {
    await addIdentityToConfig(newIdentity);
    // SECURITY: Log identity creation as config change
    securityLogger.logConfigChange('identities');
    vs.window.showInformationMessage(
      vs.l10n.t("Identity '{0}' has been created.", id)
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
 * Field selection item for edit wizard
 */
interface FieldQuickPickItem {
  label: string;
  description?: string;
  detail?: string;
  field: keyof Identity | null;
  _isDisabled?: boolean;
}

/**
 * Show the edit identity wizard.
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

  let selectedIdentity: Identity;

  if (targetIdentity) {
    // Skip identity selection when target is provided
    selectedIdentity = targetIdentity;
  } else {
    // Step 1: Select identity to edit
    const identities = getIdentitiesWithValidation();
    if (identities.length === 0) {
      vs.window.showWarningMessage(
        vs.l10n.t('No identities configured. Add identities in settings: {0}', 'gitIdSwitcher.identities')
      );
      return false;
    }

    interface IdentityQuickPickItem {
      label: string;
      detail?: string;
      identity: Identity;
    }

    const identityItems: IdentityQuickPickItem[] = identities.map(identity => ({
      label: getIdentityLabel(identity),
      detail: getIdentityDetail(identity),
      identity,
    }));

    const selectedIdentityItem = await vs.window.showQuickPick(identityItems, {
      title: vs.l10n.t('Edit Identity: Select'),
      placeHolder: vs.l10n.t('Select identity to edit'),
    });

    if (!selectedIdentityItem) {
      return false;
    }

    selectedIdentity = selectedIdentityItem.identity;
  }

  // Step 2: Select field to edit
  const fieldItems: FieldQuickPickItem[] = [
    {
      label: '$(lock) ID',
      description: selectedIdentity.id,
      detail: vs.l10n.t('(cannot be changed)'),
      field: null,
      _isDisabled: true,
    },
    {
      label: vs.l10n.t('Name'),
      description: selectedIdentity.name,
      field: 'name',
    },
    {
      label: vs.l10n.t('Email'),
      description: selectedIdentity.email,
      field: 'email',
    },
    {
      label: vs.l10n.t('Service'),
      description: selectedIdentity.service || vs.l10n.t('(none)'),
      field: 'service',
    },
    {
      label: vs.l10n.t('Icon'),
      description: selectedIdentity.icon || vs.l10n.t('(none)'),
      field: 'icon',
    },
    {
      label: vs.l10n.t('Description'),
      description: selectedIdentity.description || vs.l10n.t('(none)'),
      field: 'description',
    },
  ];

  const selectedField = await vs.window.showQuickPick(fieldItems, {
    title: vs.l10n.t('Edit Identity: Select Field'),
    placeHolder: vs.l10n.t('Select property to edit'),
  });

  if (!selectedField || selectedField._isDisabled || selectedField.field === null) {
    return false;
  }

  const field = selectedField.field;

  // Step 3: Edit the selected field
  const currentValue = selectedIdentity[field];
  const isOptionalField = ['service', 'icon', 'description'].includes(field);

  const newValue = await vs.window.showInputBox({
    title: vs.l10n.t('Edit Identity: {0}', selectedField.label),
    value: currentValue || '',
    placeHolder: getPlaceholderForField(vs, field),
    prompt: isOptionalField ? vs.l10n.t('Leave empty to clear') : undefined,
    validateInput: (value: string) => validateFieldInput(vs, field, value, isOptionalField),
  });

  if (newValue === undefined) {
    return false;
  }

  // Determine the final value (undefined for empty optional fields)
  const finalValue = isOptionalField && newValue.trim() === '' ? undefined : newValue;

  try {
    await updateIdentityInConfig(selectedIdentity.id, field, finalValue);
    // SECURITY: Log identity update as config change
    securityLogger.logConfigChange('identities');
    vs.window.showInformationMessage(
      vs.l10n.t("Identity '{0}' has been updated.", selectedIdentity.id)
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
 * Get placeholder text for a field.
 */
function getPlaceholderForField(
  vs: ReturnType<typeof getVSCode>,
  field: keyof Identity
): string {
  if (!vs) return '';

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
    default:
      return '';
  }
}

/**
 * Validate name field input.
 */
function validateNameInput(
  vs: NonNullable<ReturnType<typeof getVSCode>>,
  value: string
): string | null {
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
 * Validate email field input.
 */
function validateEmailInput(
  vs: NonNullable<ReturnType<typeof getVSCode>>,
  value: string
): string | null {
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
 * Validate field input.
 */
function validateFieldInput(
  vs: ReturnType<typeof getVSCode>,
  field: keyof Identity,
  value: string,
  isOptionalField: boolean
): string | null {
  if (!vs) return null;

  // Optional fields can be empty
  if (isOptionalField && value.trim() === '') {
    return null;
  }

  if (field === 'name') {
    return validateNameInput(vs, value);
  }
  if (field === 'email') {
    return validateEmailInput(vs, value);
  }

  // Optional fields (service, icon, description) have no specific validation
  return null;
}
