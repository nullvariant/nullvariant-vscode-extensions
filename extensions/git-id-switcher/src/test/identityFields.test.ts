/**
 * Tests for identityFields.ts
 *
 * Covers the editable field list, the field metadata lookup, and each
 * field's validator (one accepted and one rejected value per field, plus each
 * layer of the key path check).
 */

import * as assert from 'node:assert';
import {
  EDITABLE_FIELDS,
  FIELD_METADATA,
  getFieldMetadata,
} from '../identity/identityFields';
import type { Identity } from '../identity/identity';

/**
 * Run a field's validator, failing the test if the field has none.
 */
function validate(key: keyof Identity, value: string): string | undefined {
  const meta = getFieldMetadata(key);
  assert.ok(meta?.validator, `${key} should have a validator`);
  return meta.validator(value);
}

/**
 * Every editable field has metadata, and the lookup finds it by key.
 */
function testFieldMetadataLookup(): void {
  console.log('Testing field metadata lookup...');

  for (const key of EDITABLE_FIELDS) {
    assert.strictEqual(getFieldMetadata(key)?.key, key, `${key} should have metadata`);
  }
  assert.strictEqual(FIELD_METADATA.length, EDITABLE_FIELDS.length, 'Each editable field should have exactly one entry');
  assert.strictEqual(getFieldMetadata('nonexistent' as keyof Identity), undefined, 'Unknown key should return undefined');

  console.log('  Field metadata lookup tests passed!');
}

/**
 * Each field's validator accepts a valid value and rejects an invalid one.
 */
function testFieldValidators(): void {
  console.log('Testing field validators...');

  const cases: ReadonlyArray<readonly [keyof Identity, string, string, string]> = [
    ['id', 'work-01', 'bad id!', 'ID must be'],
    ['name', 'Jane Doe', 'Jane;$(rm)', 'Name contains invalid characters'],
    ['email', 'jane@example.com', 'not-an-email', 'Invalid email format'],
    ['service', 'AT&T', 'svc`cmd`', 'Service contains invalid characters'],
    ['icon', '🔑', 'icon$(x)', 'Icon contains invalid characters'],
    ['description', 'Work (main)', 'desc`x`', 'Description contains invalid characters'],
    ['sshHost', 'github-work', 'bad host!', 'SSH host must contain only'],
    ['gpgKeyId', 'ABCDEF1234567890', 'xyz', 'GPG key ID must be 8-40 hexadecimal characters'],
  ];

  assert.ok(validate('id', '')?.startsWith('ID must be'), 'Empty ID should be rejected');

  for (const [key, valid, invalid, expectedError] of cases) {
    assert.strictEqual(validate(key, valid), undefined, `${key} should accept ${JSON.stringify(valid)}`);
    const error = validate(key, invalid);
    assert.ok(error?.startsWith(expectedError), `${key} should reject ${JSON.stringify(invalid)}, got ${String(error)}`);
  }

  console.log('  Field validator tests passed!');
}

/**
 * The key path check (sshKeyPath, sshSigningKeyPath) is the runtime level:
 * absolute, ~/ or Windows drive paths anywhere, without traversal or
 * dangerous characters (never ~user).
 */
function testKeyPathValidators(): void {
  console.log('Testing key path validators...');

  for (const field of ['sshKeyPath', 'sshSigningKeyPath'] as const) {
    for (const accepted of ['~/.ssh/id_ed25519', '~/keys/id_ed25519', '/opt/keys/id_sign.pub', String.raw`C:\Users\me\.ssh\id_ed25519`, 'D:/keys/id']) {
      assert.strictEqual(validate(field, accepted), undefined, `${field} should accept ${accepted}`);
    }

    const rejected: ReadonlyArray<readonly [string, string]> = [
      ['~other/.ssh/id_ed25519', `${field}: must be an absolute path`],
      ['C:id_ed25519', `${field}: must be an absolute path`],
      ['~/.ssh/id;rm', `${field} contains shell metacharacters`],
      ['~/.ssh/id$(rm)', `${field} contains shell metacharacters`],
      ['~/.ssh/id\nrm', `${field} contains newline characters`],
      ['~/.ssh/../id_ed25519', `${field}: path traversal (..) is not allowed`],
      ['keys/id_ed25519', `${field}: must be an absolute path`],
    ];
    for (const [value, expectedError] of rejected) {
      const error = validate(field, value);
      assert.ok(error?.startsWith(expectedError), `${field} should reject ${JSON.stringify(value)}, got ${String(error)}`);
    }
  }

  assert.strictEqual(getFieldMetadata('sshSigningKeyPath')?.labelKey, 'SSH Signing Key Path');
  assert.strictEqual(getFieldMetadata('sshSigningKeyPath')?.inputType, 'file');
  assert.strictEqual(EDITABLE_FIELDS.at(-1), 'sshSigningKeyPath');

  console.log('  Key path validator tests passed!');
}

/**
 * Run all identityFields tests
 */
export function runIdentityFieldsTests(): void {
  console.log('\n=== Identity Fields Tests ===\n');
  testFieldMetadataLookup();
  testFieldValidators();
  testKeyPathValidators();
  console.log('\n✅ All identityFields tests passed!\n');
}
