/**
 * Identity Config Tests
 *
 * Unit tests for identity/identityConfig.ts. The module talks to the VS Code
 * API only through core/vscodeLoader, so the tests inject a mock API with
 * _setMockVSCode() and never need the extension host.
 *
 * Covered:
 * - Readers: getIdentities, getIdentitiesWithValidation (cache, guards,
 *   filtering, one-time notification), getIdentityById, getDefaultIdentity
 * - Cache control: invalidateIdentityCache
 * - Writers: deleteIdentityFromConfig, addIdentityToConfig,
 *   updateIdentityInConfig, moveIdentityInConfig (success and error paths)
 */

import * as assert from 'node:assert';
import {
  addIdentityToConfig,
  deleteIdentityFromConfig,
  getDefaultIdentity,
  getIdentities,
  getIdentitiesWithValidation,
  getIdentityById,
  invalidateIdentityCache,
  moveIdentityInConfig,
  updateIdentityInConfig,
} from '../identity/identityConfig';
import type { Identity } from '../identity/identity';
import { MAX_IDENTITIES } from '../core/constants';
import { _resetCache, _setMockVSCode } from '../core/vscodeLoader';
import { securityLogger } from '../security/securityLogger';

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

type WarningBehavior = 'dismiss' | 'open-settings' | 'reject';

interface HarnessOptions {
  /** Raw configuration values by key (e.g. identities, defaultIdentity) */
  readonly settings?: Record<string, unknown>;
  /** How the warning notification resolves */
  readonly warning?: WarningBehavior;
  /** When set, config.update() rejects with this error */
  readonly updateError?: Error;
}

interface UpdateCall {
  readonly key: string;
  readonly value: unknown;
  readonly target: unknown;
}

interface WarningCall {
  readonly message: string;
  readonly items: readonly string[];
}

interface Harness {
  readonly api: object;
  readonly sections: string[];
  readonly updates: UpdateCall[];
  readonly warnings: WarningCall[];
  readonly commands: unknown[][];
  readonly validationFailures: { field: string; reason: string; value: unknown }[];
  readonly configChanges: string[];
}

const GLOBAL_TARGET = 1;

function formatMessage(message: string, args: readonly unknown[]): string {
  return message.replaceAll(/\{(\d+)\}/g, (_match, index: string) =>
    String(args[Number(index)]),
  );
}

function createHarness(options: HarnessOptions = {}): Harness {
  const settings = options.settings ?? {};
  const sections: string[] = [];
  const updates: UpdateCall[] = [];
  const warnings: WarningCall[] = [];
  const commands: unknown[][] = [];
  const validationFailures: Harness['validationFailures'] = [];
  const configChanges: string[] = [];

  const api = {
    workspace: {
      getConfiguration: (section: string) => {
        sections.push(section);
        return {
          get: <T>(key: string, defaultValue?: T): T | undefined =>
            settings[key] === undefined ? defaultValue : (settings[key] as T),
          update: async (key: string, value: unknown, target: unknown): Promise<void> => {
            updates.push({ key, value, target });
            if (options.updateError) {
              throw options.updateError;
            }
          },
        };
      },
    },
    ConfigurationTarget: { Global: GLOBAL_TARGET },
    window: {
      showWarningMessage: (message: string, ...items: string[]): Promise<string | undefined> => {
        warnings.push({ message, items });
        const behavior = options.warning ?? 'dismiss';
        if (behavior === 'open-settings') {
          return Promise.resolve(items[0]);
        }
        if (behavior === 'reject') {
          return Promise.reject(new Error('notification failed'));
        }
        return Promise.resolve(undefined);
      },
    },
    commands: {
      executeCommand: (...args: unknown[]): Promise<void> => {
        commands.push(args);
        return Promise.resolve();
      },
    },
    l10n: {
      t: (message: string, ...args: unknown[]): string => formatMessage(message, args),
    },
  };

  return { api, sections, updates, warnings, commands, validationFailures, configChanges };
}

/** Let fire-and-forget promise callbacks settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

interface MutableSecurityLogger {
  logValidationFailure?: unknown;
  logConfigChange?: unknown;
}

/**
 * Run a test body with the mock VS Code API installed and the security logger
 * recorded (instead of printing to the console). Everything is restored in
 * finally so tests cannot influence each other.
 */
async function withHarness(
  options: HarnessOptions,
  body: (harness: Harness) => void | Promise<void>,
): Promise<void> {
  const harness = createHarness(options);
  const loggerOverrides = securityLogger as unknown as MutableSecurityLogger;

  invalidateIdentityCache();
  loggerOverrides.logValidationFailure = (field: string, reason: string, value?: unknown) => {
    harness.validationFailures.push({ field, reason, value });
  };
  loggerOverrides.logConfigChange = (configKey: string) => {
    harness.configChanges.push(configKey);
  };
  _setMockVSCode(harness.api as never);

  try {
    await body(harness);
  } finally {
    delete loggerOverrides.logValidationFailure;
    delete loggerOverrides.logConfigChange;
    _setMockVSCode(undefined);
    _resetCache();
    invalidateIdentityCache();
  }
}

/** Run a test body without any VS Code API (getVSCode() returns undefined). */
async function withoutVSCode(body: () => void | Promise<void>): Promise<void> {
  invalidateIdentityCache();
  _setMockVSCode(undefined);
  // _setMockVSCode(undefined) marks the load as attempted, so getVSCode() returns undefined
  try {
    await body();
  } finally {
    _setMockVSCode(undefined);
    _resetCache();
    invalidateIdentityCache();
  }
}

async function assertRejectsWith(promise: Promise<unknown>, message: string): Promise<void> {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof Error, 'Should reject with an Error');
    assert.strictEqual(error.message, message);
    return true;
  });
}

const WORK: Identity = { id: 'work', name: 'Work User', email: 'work@example.com' };
const PERSONAL: Identity = {
  id: 'personal',
  name: 'Personal User',
  email: 'personal@example.com',
  icon: '🏠',
  description: 'Home account',
};
const OSS: Identity = { id: 'oss', name: 'OSS User', email: 'oss@example.com' };

// ---------------------------------------------------------------------------
// getIdentities
// ---------------------------------------------------------------------------

async function testGetIdentitiesWithoutVSCode(): Promise<void> {
  console.log('Testing getIdentities() without VS Code API...');
  await withoutVSCode(() => {
    assert.deepStrictEqual(getIdentities(), []);
  });
  console.log('✅ getIdentities() without VS Code API passed!');
}

async function testGetIdentitiesReturnsRawConfig(): Promise<void> {
  console.log('Testing getIdentities() returns raw configuration without validation...');
  const raw = [WORK, { id: 'bad id', name: '', email: 'nope' }];
  await withHarness({ settings: { identities: raw } }, (harness) => {
    assert.deepStrictEqual(getIdentities(), raw, 'Invalid entries must not be filtered');
    assert.deepStrictEqual(harness.sections, ['gitIdSwitcher']);
    assert.deepStrictEqual(harness.validationFailures, [], 'No validation should run');
  });
  console.log('✅ getIdentities() returns raw configuration passed!');
}

async function testGetIdentitiesDefaultsToEmpty(): Promise<void> {
  console.log('Testing getIdentities() with unset configuration...');
  await withHarness({}, () => {
    assert.deepStrictEqual(getIdentities(), []);
  });
  console.log('✅ getIdentities() with unset configuration passed!');
}

async function testGetIdentitiesBypassesCache(): Promise<void> {
  console.log('Testing getIdentities() bypasses the validated cache...');
  const settings: Record<string, unknown> = { identities: [WORK] };
  await withHarness({ settings }, (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK]);
    settings.identities = [WORK, OSS];
    assert.deepStrictEqual(getIdentities(), [WORK, OSS], 'Raw read must see the latest config');
    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK], 'Cache is still used');
    assert.deepStrictEqual(harness.sections, ['gitIdSwitcher', 'gitIdSwitcher']);
  });
  console.log('✅ getIdentities() bypasses cache passed!');
}

// ---------------------------------------------------------------------------
// getIdentitiesWithValidation
// ---------------------------------------------------------------------------

async function testValidationWithoutVSCode(): Promise<void> {
  console.log('Testing getIdentitiesWithValidation() without VS Code API...');
  await withoutVSCode(() => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), []);
    assert.deepStrictEqual(getIdentitiesWithValidation(), [], 'Nothing is cached without VS Code');
  });
  console.log('✅ getIdentitiesWithValidation() without VS Code API passed!');
}

async function testValidationReturnsValidIdentitiesAndCaches(): Promise<void> {
  console.log('Testing getIdentitiesWithValidation() caching for the same API object...');
  await withHarness({ settings: { identities: [WORK, PERSONAL] } }, (harness) => {
    const first = getIdentitiesWithValidation();
    assert.deepStrictEqual(first, [WORK, PERSONAL]);
    assert.strictEqual(harness.sections.length, 1);

    const second = getIdentitiesWithValidation();
    assert.deepStrictEqual(second, [WORK, PERSONAL]);
    assert.strictEqual(harness.sections.length, 1, 'Cache hit must not read the config again');
    assert.notStrictEqual(second, first, 'A fresh copy is returned on every call');

    // Mutating the returned array must not corrupt the cache
    second.pop();
    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK, PERSONAL]);
    assert.strictEqual(harness.sections.length, 1);
    assert.deepStrictEqual(harness.validationFailures, []);
  });
  console.log('✅ getIdentitiesWithValidation() caching passed!');
}

async function testValidationCacheIsPerApiObject(): Promise<void> {
  console.log('Testing getIdentitiesWithValidation() does not reuse the cache across API objects...');
  await withHarness({ settings: { identities: [WORK] } }, (first) => {
    const second = createHarness({ settings: { identities: [OSS] } });

    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK]);

    _setMockVSCode(second.api as never);
    assert.deepStrictEqual(
      getIdentitiesWithValidation(),
      [OSS],
      'A different API object must trigger a fresh read',
    );
    assert.strictEqual(second.sections.length, 1);

    // The cache was replaced by the second object, so the first one is stale now
    _setMockVSCode(first.api as never);
    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK]);
    assert.strictEqual(first.sections.length, 2);
  });
  console.log('✅ getIdentitiesWithValidation() cache per API object passed!');
}

async function testValidationNonArrayConfig(): Promise<void> {
  console.log('Testing getIdentitiesWithValidation() with non-array configuration...');
  await withHarness({ settings: { identities: 'not-an-array' } }, (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), []);
    assert.deepStrictEqual(harness.validationFailures, [
      { field: 'identities', reason: 'Configuration must be an array', value: 'string' },
    ]);
    assert.strictEqual(harness.warnings.length, 0, 'No notification for a type error');

    // Not cached: the configuration may be in transition, so it is read again
    assert.deepStrictEqual(getIdentitiesWithValidation(), []);
    assert.strictEqual(harness.sections.length, 2);
    assert.strictEqual(harness.validationFailures.length, 2);
  });

  await withHarness({ settings: { identities: { id: 'work' } } }, (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), []);
    assert.strictEqual(harness.validationFailures[0].value, 'object');
  });
  console.log('✅ getIdentitiesWithValidation() with non-array configuration passed!');
}

async function testValidationEmptyArrayIsCached(): Promise<void> {
  console.log('Testing getIdentitiesWithValidation() with empty array...');
  await withHarness({ settings: { identities: [] } }, (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), []);
    assert.deepStrictEqual(getIdentitiesWithValidation(), []);
    assert.strictEqual(harness.sections.length, 1, 'Empty array is a valid, cached state');
    assert.deepStrictEqual(harness.validationFailures, []);
    assert.strictEqual(harness.warnings.length, 0);
  });

  await withHarness({}, (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), [], 'Unset config defaults to []');
    assert.strictEqual(harness.sections.length, 1);
  });
  console.log('✅ getIdentitiesWithValidation() with empty array passed!');
}

async function testValidationExceedsMaxIdentities(): Promise<void> {
  console.log('Testing getIdentitiesWithValidation() with more than MAX_IDENTITIES entries...');
  const tooMany = Array.from({ length: MAX_IDENTITIES + 1 }, (_, i) => ({
    id: `id-${i}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
  }));
  await withHarness({ settings: { identities: tooMany } }, (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), []);
    assert.deepStrictEqual(harness.validationFailures, [
      {
        field: 'identities',
        reason: `Array length exceeds maximum (${MAX_IDENTITIES})`,
        value: MAX_IDENTITIES + 1,
      },
    ]);

    // Fails closed and is cached to avoid log spam
    assert.deepStrictEqual(getIdentitiesWithValidation(), []);
    assert.strictEqual(harness.sections.length, 1);
    assert.strictEqual(harness.validationFailures.length, 1);
  });

  const exactlyMax = Array.from({ length: MAX_IDENTITIES }, (_, i) => ({
    id: `id-${i}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
  }));
  await withHarness({ settings: { identities: exactlyMax } }, (harness) => {
    assert.strictEqual(getIdentitiesWithValidation().length, MAX_IDENTITIES);
    assert.deepStrictEqual(harness.validationFailures, []);
  });
  console.log('✅ getIdentitiesWithValidation() with MAX_IDENTITIES limit passed!');
}

async function testValidationFiltersInvalidEntries(): Promise<void> {
  console.log('Testing getIdentitiesWithValidation() filters invalid entries...');
  const raw = [
    WORK,
    'a string',
    { id: 'bad-email', name: 'Bad Email', email: 'not-an-email' },
    OSS,
    null,
  ];
  await withHarness({ settings: { identities: raw } }, async (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK, OSS]);

    const fields = harness.validationFailures.map((f) => f.field);
    assert.ok(fields.includes('identities[1].root'), `Non-object entry logged: ${fields.join(',')}`);
    assert.ok(fields.includes('identities[2].email'), `Bad email logged: ${fields.join(',')}`);
    assert.ok(fields.includes('identities[4].root'), `null entry logged: ${fields.join(',')}`);
    assert.ok(
      harness.validationFailures.some(
        (f) => f.field === 'identities[2].email' && f.reason === 'Invalid email format',
      ),
    );

    // Three invalid entries -> one plural notification
    assert.deepStrictEqual(harness.warnings, [
      {
        message:
          'Git ID Switcher: 3 identity configurations are invalid and were skipped. Check the settings.',
        items: ['Open Settings'],
      },
    ]);
    await flushPromises();
    assert.deepStrictEqual(harness.commands, [], 'Dismissed notification opens nothing');
  });
  console.log('✅ getIdentitiesWithValidation() filtering passed!');
}

async function testValidationDuplicateIds(): Promise<void> {
  console.log('Testing getIdentitiesWithValidation() with duplicate IDs...');
  const duplicate = { id: 'work', name: 'Second Work', email: 'second@example.com' };
  await withHarness({ settings: { identities: [WORK, duplicate, OSS] } }, (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK, OSS], 'First occurrence wins');
    assert.deepStrictEqual(harness.validationFailures, [
      { field: 'identities[1].id', reason: 'Duplicate ID: work', value: 'work' },
    ]);
    assert.deepStrictEqual(harness.warnings, [
      {
        message:
          'Git ID Switcher: 1 identity configuration is invalid and was skipped. Check the settings.',
        items: ['Open Settings'],
      },
    ]);
  });
  console.log('✅ getIdentitiesWithValidation() with duplicate IDs passed!');
}

async function testValidationNotificationOpensSettings(): Promise<void> {
  console.log('Testing validation notification opens settings when accepted...');
  await withHarness(
    { settings: { identities: [WORK, 42] }, warning: 'open-settings' },
    async (harness) => {
      assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK]);
      await flushPromises();
      assert.deepStrictEqual(harness.commands, [
        ['workbench.action.openSettings', 'gitIdSwitcher.identities'],
      ]);
    },
  );
  console.log('✅ Validation notification opens settings passed!');
}

async function testValidationNotificationRejectionIsSwallowed(): Promise<void> {
  console.log('Testing validation notification failure does not affect validation...');
  await withHarness(
    { settings: { identities: [WORK, 42] }, warning: 'reject' },
    async (harness) => {
      assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK]);
      await flushPromises();
      assert.strictEqual(harness.warnings.length, 1);
      assert.deepStrictEqual(harness.commands, []);
      assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK], 'Still usable afterwards');
    },
  );
  console.log('✅ Validation notification failure passed!');
}

async function testValidationNotificationShownOncePerSession(): Promise<void> {
  console.log('Testing validation notification is shown once per session...');
  await withHarness({ settings: { identities: [WORK, 42] } }, (first) => {
    const second = createHarness({ settings: { identities: [OSS, 43, 44] } });

    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK]);
    assert.strictEqual(first.warnings.length, 1);

    // Another API object bypasses the cache but not the session flag
    _setMockVSCode(second.api as never);
    assert.deepStrictEqual(getIdentitiesWithValidation(), [OSS]);
    assert.strictEqual(second.warnings.length, 0, 'The flag suppresses repeated notifications');

    // invalidateIdentityCache() resets the flag, so the next load notifies again
    invalidateIdentityCache();
    assert.deepStrictEqual(getIdentitiesWithValidation(), [OSS]);
    assert.strictEqual(second.warnings.length, 1);
    assert.ok(second.warnings[0].message.includes('2 identity configurations'));
  });
  console.log('✅ Validation notification once per session passed!');
}

async function testValidationNotificationWhenVSCodeVanishes(): Promise<void> {
  console.log('Testing validation notification when VS Code disappears during validation...');
  await withHarness({}, (harness) => {
    const settings: Record<string, unknown> = { identities: [WORK, 42] };
    // The configuration read drops the API, so the notification helper sees no VS Code
    const api = harness.api as {
      workspace: { getConfiguration: (section: string) => unknown };
    };
    api.workspace.getConfiguration = () => ({
      get: (key: string) => {
        _setMockVSCode(undefined);
        return settings[key];
      },
    });

    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK]);
    assert.strictEqual(harness.warnings.length, 0, 'No notification without VS Code');
  });
  console.log('✅ Validation notification without VS Code passed!');
}

// ---------------------------------------------------------------------------
// invalidateIdentityCache
// ---------------------------------------------------------------------------

async function testInvalidateIdentityCache(): Promise<void> {
  console.log('Testing invalidateIdentityCache()...');
  const settings: Record<string, unknown> = { identities: [WORK] };
  await withHarness({ settings }, (harness) => {
    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK]);
    settings.identities = [OSS];
    assert.deepStrictEqual(getIdentitiesWithValidation(), [WORK], 'Stale until invalidated');

    invalidateIdentityCache();
    assert.deepStrictEqual(getIdentitiesWithValidation(), [OSS]);
    assert.strictEqual(harness.sections.length, 2);

    // Safe to call repeatedly
    invalidateIdentityCache();
    invalidateIdentityCache();
    assert.deepStrictEqual(getIdentitiesWithValidation(), [OSS]);
    assert.strictEqual(harness.sections.length, 3);
  });
  console.log('✅ invalidateIdentityCache() passed!');
}

// ---------------------------------------------------------------------------
// getIdentityById / getDefaultIdentity
// ---------------------------------------------------------------------------

async function testGetIdentityById(): Promise<void> {
  console.log('Testing getIdentityById()...');
  await withHarness({ settings: { identities: [WORK, PERSONAL, 42] } }, () => {
    assert.deepStrictEqual(getIdentityById('personal'), PERSONAL);
    assert.deepStrictEqual(getIdentityById('work'), WORK);
    assert.strictEqual(getIdentityById('missing'), undefined);
    assert.strictEqual(getIdentityById(''), undefined);
  });
  await withoutVSCode(() => {
    assert.strictEqual(getIdentityById('work'), undefined);
  });
  console.log('✅ getIdentityById() passed!');
}

async function testGetDefaultIdentity(): Promise<void> {
  console.log('Testing getDefaultIdentity()...');
  await withoutVSCode(() => {
    assert.strictEqual(getDefaultIdentity(), undefined);
  });

  await withHarness({ settings: { identities: [] } }, () => {
    assert.strictEqual(getDefaultIdentity(), undefined, 'No identities -> undefined');
  });

  await withHarness(
    { settings: { identities: [WORK, PERSONAL], defaultIdentity: 'personal' } },
    () => {
      assert.deepStrictEqual(getDefaultIdentity(), PERSONAL, 'Configured default wins');
    },
  );

  await withHarness(
    { settings: { identities: [WORK, PERSONAL], defaultIdentity: 'missing' } },
    () => {
      assert.deepStrictEqual(getDefaultIdentity(), WORK, 'Unknown default falls back to first');
    },
  );

  await withHarness({ settings: { identities: [WORK, PERSONAL], defaultIdentity: '' } }, () => {
    assert.deepStrictEqual(getDefaultIdentity(), WORK, 'Empty default -> first identity');
  });

  await withHarness({ settings: { identities: [WORK, PERSONAL] } }, () => {
    assert.deepStrictEqual(getDefaultIdentity(), WORK, 'Unset default -> first identity');
  });

  // Only validated identities can become the default
  await withHarness(
    { settings: { identities: [{ id: 'bad', name: '', email: 'x' }, OSS], defaultIdentity: 'bad' } },
    () => {
      assert.deepStrictEqual(getDefaultIdentity(), OSS, 'Invalid default is never returned');
    },
  );
  console.log('✅ getDefaultIdentity() passed!');
}

// ---------------------------------------------------------------------------
// deleteIdentityFromConfig
// ---------------------------------------------------------------------------

async function testDeleteIdentity(): Promise<void> {
  console.log('Testing deleteIdentityFromConfig()...');
  await withHarness({ settings: { identities: [WORK, PERSONAL, OSS] } }, async (harness) => {
    await deleteIdentityFromConfig('personal');
    assert.deepStrictEqual(harness.updates, [
      { key: 'identities', value: [WORK, OSS], target: GLOBAL_TARGET },
    ]);
    assert.deepStrictEqual(harness.configChanges, ['identities']);
    assert.deepStrictEqual(harness.sections, ['gitIdSwitcher']);
  });
  console.log('✅ deleteIdentityFromConfig() passed!');
}

async function testDeleteIdentityErrors(): Promise<void> {
  console.log('Testing deleteIdentityFromConfig() error paths...');
  await withoutVSCode(async () => {
    await assertRejectsWith(deleteIdentityFromConfig('work'), 'VS Code API not available');
  });

  await withHarness({ settings: { identities: [WORK] } }, async (harness) => {
    await assertRejectsWith(deleteIdentityFromConfig('bad id!'), 'Invalid identity ID format: bad id!');
    await assertRejectsWith(deleteIdentityFromConfig(''), 'Invalid identity ID format: ');
    await assertRejectsWith(
      deleteIdentityFromConfig('x'.repeat(65)),
      `Invalid identity ID format: ${'x'.repeat(65)}`,
    );
    await assertRejectsWith(deleteIdentityFromConfig('missing'), 'Identity not found: missing');
    assert.deepStrictEqual(harness.updates, [], 'Guards must not write');
    assert.deepStrictEqual(harness.configChanges, []);
  });

  await withHarness(
    { settings: { identities: [WORK] }, updateError: new Error('write failed') },
    async (harness) => {
      await assertRejectsWith(deleteIdentityFromConfig('work'), 'write failed');
      assert.strictEqual(harness.updates.length, 1);
      assert.deepStrictEqual(harness.configChanges, [], 'No log entry when the update fails');
    },
  );

  await withHarness({}, async () => {
    await assertRejectsWith(deleteIdentityFromConfig('work'), 'Identity not found: work');
  });
  console.log('✅ deleteIdentityFromConfig() error paths passed!');
}

// ---------------------------------------------------------------------------
// addIdentityToConfig
// ---------------------------------------------------------------------------

async function testAddIdentity(): Promise<void> {
  console.log('Testing addIdentityToConfig()...');
  await withHarness({ settings: { identities: [WORK] } }, async (harness) => {
    await addIdentityToConfig(PERSONAL);
    assert.deepStrictEqual(harness.updates, [
      { key: 'identities', value: [WORK, PERSONAL], target: GLOBAL_TARGET },
    ]);
    assert.deepStrictEqual(harness.configChanges, ['identities']);
  });

  await withHarness({}, async (harness) => {
    await addIdentityToConfig(OSS);
    assert.deepStrictEqual(harness.updates, [
      { key: 'identities', value: [OSS], target: GLOBAL_TARGET },
    ]);
  });

  // The limit is checked against the current length: MAX - 1 entries still accept one more
  const almostFull = Array.from({ length: MAX_IDENTITIES - 1 }, (_, i) => ({
    id: `id-${i}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
  }));
  await withHarness({ settings: { identities: almostFull } }, async (harness) => {
    await addIdentityToConfig(OSS);
    const written = harness.updates[0].value as Identity[];
    assert.strictEqual(written.length, MAX_IDENTITIES);
    assert.deepStrictEqual(written[MAX_IDENTITIES - 1], OSS);
  });
  console.log('✅ addIdentityToConfig() passed!');
}

async function testAddIdentityErrors(): Promise<void> {
  console.log('Testing addIdentityToConfig() error paths...');
  await withoutVSCode(async () => {
    await assertRejectsWith(addIdentityToConfig(WORK), 'VS Code API not available');
  });

  await withHarness({ settings: { identities: [WORK] } }, async (harness) => {
    await assertRejectsWith(
      addIdentityToConfig({ id: 'bad-email', name: 'Bad Email', email: 'not-an-email' }),
      'Invalid identity schema: email: Invalid email format',
    );
    await assert.rejects(
      addIdentityToConfig({ id: 'bad id', name: '', email: 'not-an-email' }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.ok(error.message.startsWith('Invalid identity schema: '), error.message);
        assert.ok(error.message.includes('id: Does not match required pattern'), error.message);
        assert.ok(error.message.includes('name: Required field is missing'), error.message);
        assert.ok(error.message.includes('email: Invalid email format'), error.message);
        assert.ok(error.message.includes(', '), 'Multiple errors are joined with a comma');
        return true;
      },
    );
    await assertRejectsWith(
      addIdentityToConfig({ ...OSS, id: 'work' }),
      'Identity with ID already exists: work',
    );
    assert.deepStrictEqual(harness.updates, [], 'Guards must not write');
    assert.deepStrictEqual(harness.configChanges, []);
  });

  const full = Array.from({ length: MAX_IDENTITIES }, (_, i) => ({
    id: `id-${i}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
  }));
  await withHarness({ settings: { identities: full } }, async (harness) => {
    await assertRejectsWith(
      addIdentityToConfig(OSS),
      `Maximum identity limit reached: ${MAX_IDENTITIES}`,
    );
    assert.deepStrictEqual(harness.updates, []);
  });

  await withHarness(
    { settings: { identities: [WORK] }, updateError: new Error('write failed') },
    async (harness) => {
      await assertRejectsWith(addIdentityToConfig(OSS), 'write failed');
      assert.deepStrictEqual(harness.configChanges, []);
    },
  );
  console.log('✅ addIdentityToConfig() error paths passed!');
}

// ---------------------------------------------------------------------------
// updateIdentityInConfig
// ---------------------------------------------------------------------------

async function testUpdateIdentityFields(): Promise<void> {
  console.log('Testing updateIdentityInConfig() success paths...');
  await withHarness({ settings: { identities: [WORK, PERSONAL] } }, async (harness) => {
    // Set a field
    await updateIdentityInConfig('work', 'name', 'Renamed User');
    assert.deepStrictEqual(harness.updates[0], {
      key: 'identities',
      value: [{ ...WORK, name: 'Renamed User' }, PERSONAL],
      target: GLOBAL_TARGET,
    });

    // Add an optional field
    await updateIdentityInConfig('work', 'service', 'GitHub');
    assert.deepStrictEqual(harness.updates[1].value, [{ ...WORK, service: 'GitHub' }, PERSONAL]);

    // Clear an optional field (the key is removed, not set to undefined)
    await updateIdentityInConfig('personal', 'description', undefined);
    const cleared = (harness.updates[2].value as Identity[])[1];
    assert.deepStrictEqual(cleared, {
      id: 'personal',
      name: 'Personal User',
      email: 'personal@example.com',
      icon: '🏠',
    });
    assert.ok(!('description' in cleared), 'description key must be removed');

    // Change the ID to a free one
    await updateIdentityInConfig('personal', 'id', 'home');
    assert.deepStrictEqual(harness.updates[3].value, [WORK, { ...PERSONAL, id: 'home' }]);

    // "Changing" the ID to itself skips the duplicate check and still succeeds
    await updateIdentityInConfig('work', 'id', 'work');
    assert.deepStrictEqual(harness.updates[4].value, [WORK, PERSONAL]);

    assert.strictEqual(harness.updates.length, 5);
    assert.deepStrictEqual(harness.configChanges, Array.from({ length: 5 }, () => 'identities'));
  });
  console.log('✅ updateIdentityInConfig() success paths passed!');
}

async function testUpdateIdentityErrors(): Promise<void> {
  console.log('Testing updateIdentityInConfig() error paths...');
  await withoutVSCode(async () => {
    await assertRejectsWith(
      updateIdentityInConfig('work', 'name', 'X'),
      'VS Code API not available',
    );
  });

  await withHarness({ settings: { identities: [WORK, PERSONAL] } }, async (harness) => {
    await assertRejectsWith(
      updateIdentityInConfig('bad id!', 'name', 'X'),
      'Invalid identity ID format: bad id!',
    );

    for (const field of ['id', 'name', 'email'] as const) {
      await assertRejectsWith(
        updateIdentityInConfig('work', field, undefined),
        `Cannot set required field to undefined: ${field}`,
      );
    }

    await assertRejectsWith(
      updateIdentityInConfig('work', 'id', 'bad id!'),
      'Invalid new identity ID format: bad id!',
    );
    await assertRejectsWith(
      updateIdentityInConfig('work', 'id', 'personal'),
      'Identity with ID already exists: personal',
    );
    await assertRejectsWith(
      updateIdentityInConfig('missing', 'name', 'X'),
      'Identity not found: missing',
    );
    await assertRejectsWith(
      updateIdentityInConfig('work', 'email', 'not-an-email'),
      'Invalid identity after update: email: Invalid email format',
    );
    await assertRejectsWith(
      updateIdentityInConfig('work', 'name', 'bad`name'),
      'Invalid identity after update: name: Does not match required pattern',
    );

    assert.deepStrictEqual(harness.updates, [], 'Guards must not write');
    assert.deepStrictEqual(harness.configChanges, []);
  });

  await withHarness(
    { settings: { identities: [WORK] }, updateError: new Error('write failed') },
    async (harness) => {
      await assertRejectsWith(updateIdentityInConfig('work', 'name', 'New'), 'write failed');
      assert.deepStrictEqual(harness.configChanges, []);
    },
  );
  console.log('✅ updateIdentityInConfig() error paths passed!');
}

// ---------------------------------------------------------------------------
// moveIdentityInConfig
// ---------------------------------------------------------------------------

async function testMoveIdentity(): Promise<void> {
  console.log('Testing moveIdentityInConfig() success paths...');
  await withHarness({ settings: { identities: [WORK, PERSONAL, OSS] } }, async (harness) => {
    // The mock does not persist writes, so every move starts from [work, personal, oss]
    assert.strictEqual(await moveIdentityInConfig('personal', 'up'), true);
    assert.deepStrictEqual(harness.updates[0], {
      key: 'identities',
      value: [PERSONAL, WORK, OSS],
      target: GLOBAL_TARGET,
    });

    assert.strictEqual(await moveIdentityInConfig('personal', 'down'), true);
    assert.deepStrictEqual(harness.updates[1].value, [WORK, OSS, PERSONAL]);

    assert.strictEqual(await moveIdentityInConfig('oss', 'up'), true);
    assert.deepStrictEqual(harness.updates[2].value, [WORK, OSS, PERSONAL]);

    assert.strictEqual(await moveIdentityInConfig('work', 'down'), true);
    assert.deepStrictEqual(harness.updates[3].value, [PERSONAL, WORK, OSS]);

    assert.deepStrictEqual(harness.configChanges, Array.from({ length: 4 }, () => 'identities'));
  });
  console.log('✅ moveIdentityInConfig() success paths passed!');
}

async function testMoveIdentityBoundaries(): Promise<void> {
  console.log('Testing moveIdentityInConfig() boundaries...');
  await withHarness({ settings: { identities: [WORK, PERSONAL] } }, async (harness) => {
    assert.strictEqual(await moveIdentityInConfig('work', 'up'), false, 'Top cannot move up');
    assert.strictEqual(await moveIdentityInConfig('personal', 'down'), false, 'Bottom cannot move down');
    assert.deepStrictEqual(harness.updates, [], 'No write at a boundary');
    assert.deepStrictEqual(harness.configChanges, []);
  });

  await withHarness({ settings: { identities: [WORK] } }, async (harness) => {
    assert.strictEqual(await moveIdentityInConfig('work', 'up'), false);
    assert.strictEqual(await moveIdentityInConfig('work', 'down'), false);
    assert.deepStrictEqual(harness.updates, []);
  });
  console.log('✅ moveIdentityInConfig() boundaries passed!');
}

async function testMoveIdentityErrors(): Promise<void> {
  console.log('Testing moveIdentityInConfig() error paths...');
  await withoutVSCode(async () => {
    await assertRejectsWith(moveIdentityInConfig('work', 'up'), 'VS Code API not available');
  });

  await withHarness({ settings: { identities: [WORK, PERSONAL] } }, async (harness) => {
    await assertRejectsWith(moveIdentityInConfig('bad id!', 'up'), 'Invalid identity ID format: bad id!');
    await assertRejectsWith(moveIdentityInConfig('missing', 'down'), 'Identity not found: missing');
    assert.deepStrictEqual(harness.updates, []);
  });

  // config.get() without a default returns undefined when the key is unset
  await withHarness({}, async () => {
    await assertRejectsWith(moveIdentityInConfig('work', 'up'), 'Identity not found: work');
  });

  await withHarness(
    { settings: { identities: [WORK, PERSONAL] }, updateError: new Error('write failed') },
    async (harness) => {
      await assertRejectsWith(moveIdentityInConfig('personal', 'up'), 'write failed');
      assert.deepStrictEqual(harness.configChanges, []);
    },
  );
  console.log('✅ moveIdentityInConfig() error paths passed!');
}

async function testWritersDoNotMutateConfigArray(): Promise<void> {
  console.log('Testing writers do not mutate the configuration array in place...');
  const original = [WORK, PERSONAL, OSS];
  const snapshot = structuredClone(original);
  await withHarness({ settings: { identities: original } }, async () => {
    await moveIdentityInConfig('oss', 'up');
    await deleteIdentityFromConfig('work');
    await addIdentityToConfig({ id: 'extra', name: 'Extra', email: 'extra@example.com' });
    await updateIdentityInConfig('personal', 'name', 'Changed');
  });
  assert.deepStrictEqual(original, snapshot, 'The settings array must stay untouched');
  console.log('✅ Writers do not mutate configuration passed!');
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export async function runIdentityConfigTests(): Promise<void> {
  console.log('\n=== Identity Config Tests ===\n');

  try {
    await testGetIdentitiesWithoutVSCode();
    await testGetIdentitiesReturnsRawConfig();
    await testGetIdentitiesDefaultsToEmpty();
    await testGetIdentitiesBypassesCache();
    await testValidationWithoutVSCode();
    await testValidationReturnsValidIdentitiesAndCaches();
    await testValidationCacheIsPerApiObject();
    await testValidationNonArrayConfig();
    await testValidationEmptyArrayIsCached();
    await testValidationExceedsMaxIdentities();
    await testValidationFiltersInvalidEntries();
    await testValidationDuplicateIds();
    await testValidationNotificationOpensSettings();
    await testValidationNotificationRejectionIsSwallowed();
    await testValidationNotificationShownOncePerSession();
    await testValidationNotificationWhenVSCodeVanishes();
    await testInvalidateIdentityCache();
    await testGetIdentityById();
    await testGetDefaultIdentity();
    await testDeleteIdentity();
    await testDeleteIdentityErrors();
    await testAddIdentity();
    await testAddIdentityErrors();
    await testUpdateIdentityFields();
    await testUpdateIdentityErrors();
    await testMoveIdentity();
    await testMoveIdentityBoundaries();
    await testMoveIdentityErrors();
    await testWritersDoNotMutateConfigArray();

    console.log('\n✅ All identity config tests passed!\n');
  } finally {
    // Leave the real loader state behind no matter how the tests ended
    _setMockVSCode(undefined);
    _resetCache();
    invalidateIdentityCache();
  }
}

// Run tests if this file is executed directly
async function main(): Promise<void> {
  try {
    await runIdentityConfigTests();
  } catch (error: unknown) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  void main();
}
