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
} from '../identity/identity';
import { MAX_IDENTITIES, MAX_ID_LENGTH, MAX_NAME_LENGTH, MAX_EMAIL_LENGTH } from '../core/constants';
import { isValidIdentityId, isValidEmail } from '../validators/common';
import { getUserSafeMessage } from '../core/errors';

/**
 * Show the manage identities menu.
 *
 * @param hasIdentities - Whether there are any identities configured
 * @returns The selected action or undefined if cancelled
 */
export async function showManageMenu(
  hasIdentities: boolean
): Promise<'add' | 'edit' | 'delete' | undefined> {
  const vs = getVSCode();
  if (!vs) {
    return undefined;
  }

  interface ManageMenuItem {
    label: string;
    action: 'add' | 'edit' | 'delete';
  }

  const items: ManageMenuItem[] = hasIdentities
    ? [
        {
          label: '$(add) ' + vs.l10n.t('Add new identity'),
          action: 'add',
        },
        {
          label: '$(pencil) ' + vs.l10n.t('Edit identity'),
          action: 'edit',
        },
        {
          label: '$(trash) ' + vs.l10n.t('Delete'),
          action: 'delete',
        },
      ]
    : [
        {
          label: '$(add) ' + vs.l10n.t('Add new identity'),
          action: 'add',
        },
      ];

  const selected = await vs.window.showQuickPick(items, {
    title: vs.l10n.t('Manage identities...'),
    placeHolder: vs.l10n.t('Select an action'),
  });

  return selected?.action;
}

/**
 * Show the add identity wizard (3 steps: ID → Name → Email).
 *
 * @returns The new identity or undefined if cancelled
 */
export async function showAddIdentityWizard(): Promise<Identity | undefined> {
  const vs = getVSCode();
  if (!vs) {
    return undefined;
  }

  // Check maximum limit before starting
  const identities = getIdentitiesWithValidation();
  if (identities.length >= MAX_IDENTITIES) {
    vs.window.showWarningMessage(
      vs.l10n.t('Maximum number of identities reached ({0})', MAX_IDENTITIES)
    );
    return undefined;
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
        return vs.l10n.t('Only letters, numbers, hyphens, underscores allowed');
      }
      if (existingIds.has(value)) {
        return vs.l10n.t('ID already exists');
      }
      return null;
    },
  });

  if (id === undefined) {
    return undefined;
  }

  // Step 2: Name input
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
      return null;
    },
  });

  if (name === undefined) {
    return undefined;
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
    return undefined;
  }

  return { id, name, email };
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
 * @returns Promise that resolves when editing is complete or cancelled
 */
export async function showEditIdentityWizard(): Promise<void> {
  const vs = getVSCode();
  if (!vs) {
    return;
  }

  const identities = getIdentitiesWithValidation();
  if (identities.length === 0) {
    vs.window.showWarningMessage(
      vs.l10n.t('No identities configured. Add identities in settings: {0}', 'gitIdSwitcher.identities')
    );
    return;
  }

  // Step 1: Select identity to edit
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
    return;
  }

  const selectedIdentity = selectedIdentityItem.identity;

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
    return;
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
    return;
  }

  // Determine the final value (undefined for empty optional fields)
  const finalValue = isOptionalField && newValue.trim() === '' ? undefined : newValue;

  try {
    await updateIdentityInConfig(selectedIdentity.id, field, finalValue);
    vs.window.showInformationMessage(
      vs.l10n.t("Identity '{0}' has been updated.", selectedIdentity.id)
    );
  } catch (error) {
    // SECURITY: Use getUserSafeMessage to prevent information leakage
    const safeMessage = getUserSafeMessage(error);
    vs.window.showErrorMessage(
      vs.l10n.t('Git ID Switcher: {0}', safeMessage)
    );
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

  switch (field) {
    case 'name':
      if (!value || value.trim().length === 0) {
        return vs.l10n.t('Name cannot be empty');
      }
      if (value.length > MAX_NAME_LENGTH) {
        return vs.l10n.t('Name is too long (max {0} characters)', MAX_NAME_LENGTH);
      }
      return null;

    case 'email':
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

    case 'service':
    case 'icon':
    case 'description':
      // Optional fields have no specific validation beyond empty check
      return null;

    default:
      return null;
  }
}
