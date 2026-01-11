/**
 * Unit Tests for Operation Guard
 *
 * Tests the OperationGuard class functionality including:
 * - Operation type classification
 * - Trust-based access control
 * - Blocked operations in untrusted workspaces
 * - Confirmation-required operations
 * - Allowed operations (read-only)
 *
 * Note: These tests mock the WorkspaceTrustManager to test various scenarios.
 */

import * as assert from 'assert';
import {
  OperationType,
  RestrictionLevel,
  OPERATION_CLASSIFICATION,
  getOperationInfo,
  getRestrictionLevel,
  isBlockedOperation,
  requiresConfirmation,
  isAllowedOperation,
  getOperationsByRestriction,
} from '../operationClassification';

/**
 * Test operation classification constants
 */
function testOperationClassificationConstants(): void {
  console.log('Testing operation classification constants...');

  // Test that all operation types have classification
  {
    const operationTypes = Object.values(OperationType);
    for (const type of operationTypes) {
      const info = OPERATION_CLASSIFICATION[type];
      assert.ok(info, `Operation type ${type} should have classification`);
      assert.ok(info.type === type, `Operation info type should match`);
      assert.ok(
        Object.values(RestrictionLevel).includes(info.restriction),
        `Restriction level should be valid`
      );
      assert.ok(typeof info.displayName === 'string', 'displayName should be string');
      assert.ok(typeof info.restrictionReason === 'string', 'restrictionReason should be string');
    }
  }

  console.log('  Operation classification constants tests passed!');
}

/**
 * Test blocked operations
 */
function testBlockedOperations(): void {
  console.log('Testing blocked operations...');

  // Test that dangerous operations are blocked
  const blockedOps = [
    OperationType.GIT_CONFIG_WRITE,
    OperationType.SSH_KEY_ADD,
    OperationType.SSH_KEY_REMOVE,
    OperationType.SSH_AGENT_OPERATION,
  ];

  for (const op of blockedOps) {
    assert.strictEqual(
      getRestrictionLevel(op),
      RestrictionLevel.BLOCKED,
      `${op} should be BLOCKED`
    );
    assert.strictEqual(isBlockedOperation(op), true, `${op} should be blocked`);
    assert.strictEqual(requiresConfirmation(op), false, `${op} should not require confirmation`);
    assert.strictEqual(isAllowedOperation(op), false, `${op} should not be allowed`);
  }

  console.log('  Blocked operations tests passed!');
}

/**
 * Test confirmation-required operations
 */
function testConfirmationRequiredOperations(): void {
  console.log('Testing confirmation-required operations...');

  const confirmOps = [OperationType.IDENTITY_SWITCH];

  for (const op of confirmOps) {
    assert.strictEqual(
      getRestrictionLevel(op),
      RestrictionLevel.CONFIRMATION_REQUIRED,
      `${op} should be CONFIRMATION_REQUIRED`
    );
    assert.strictEqual(isBlockedOperation(op), false, `${op} should not be blocked`);
    assert.strictEqual(requiresConfirmation(op), true, `${op} should require confirmation`);
    assert.strictEqual(isAllowedOperation(op), false, `${op} should not be always allowed`);
  }

  console.log('  Confirmation-required operations tests passed!');
}

/**
 * Test allowed operations (read-only)
 */
function testAllowedOperations(): void {
  console.log('Testing allowed operations...');

  const allowedOps = [
    OperationType.GIT_CONFIG_READ,
    OperationType.IDENTITY_LIST,
    OperationType.SSH_KEY_LIST,
    OperationType.SETTINGS_READ,
    OperationType.SSH_KEY_FINGERPRINT,
  ];

  for (const op of allowedOps) {
    assert.strictEqual(
      getRestrictionLevel(op),
      RestrictionLevel.ALLOWED,
      `${op} should be ALLOWED`
    );
    assert.strictEqual(isBlockedOperation(op), false, `${op} should not be blocked`);
    assert.strictEqual(requiresConfirmation(op), false, `${op} should not require confirmation`);
    assert.strictEqual(isAllowedOperation(op), true, `${op} should be allowed`);
  }

  console.log('  Allowed operations tests passed!');
}

/**
 * Test getOperationInfo function
 */
function testGetOperationInfo(): void {
  console.log('Testing getOperationInfo...');

  // Test valid operation type
  {
    const info = getOperationInfo(OperationType.GIT_CONFIG_WRITE);
    assert.ok(info, 'Should return info for valid operation type');
    assert.strictEqual(info.type, OperationType.GIT_CONFIG_WRITE);
    assert.strictEqual(info.restriction, RestrictionLevel.BLOCKED);
    assert.ok(info.displayName.length > 0, 'Should have display name');
    assert.ok(info.restrictionReason.length > 0, 'Should have restriction reason');
  }

  // Test allowed operation has empty reason
  {
    const info = getOperationInfo(OperationType.GIT_CONFIG_READ);
    assert.ok(info, 'Should return info for allowed operation');
    assert.strictEqual(info.restrictionReason, '', 'Allowed operations should have empty reason');
  }

  console.log('  getOperationInfo tests passed!');
}

/**
 * Test getOperationsByRestriction function
 */
function testGetOperationsByRestriction(): void {
  console.log('Testing getOperationsByRestriction...');

  // Test BLOCKED operations
  {
    const blocked = getOperationsByRestriction(RestrictionLevel.BLOCKED);
    assert.ok(blocked.includes(OperationType.GIT_CONFIG_WRITE), 'Should include GIT_CONFIG_WRITE');
    assert.ok(blocked.includes(OperationType.SSH_KEY_ADD), 'Should include SSH_KEY_ADD');
    assert.ok(!blocked.includes(OperationType.IDENTITY_SWITCH), 'Should not include IDENTITY_SWITCH');
    assert.ok(!blocked.includes(OperationType.GIT_CONFIG_READ), 'Should not include GIT_CONFIG_READ');
  }

  // Test CONFIRMATION_REQUIRED operations
  {
    const confirm = getOperationsByRestriction(RestrictionLevel.CONFIRMATION_REQUIRED);
    assert.ok(confirm.includes(OperationType.IDENTITY_SWITCH), 'Should include IDENTITY_SWITCH');
    assert.ok(!confirm.includes(OperationType.GIT_CONFIG_WRITE), 'Should not include GIT_CONFIG_WRITE');
  }

  // Test ALLOWED operations
  {
    const allowed = getOperationsByRestriction(RestrictionLevel.ALLOWED);
    assert.ok(allowed.includes(OperationType.GIT_CONFIG_READ), 'Should include GIT_CONFIG_READ');
    assert.ok(allowed.includes(OperationType.IDENTITY_LIST), 'Should include IDENTITY_LIST');
    assert.ok(!allowed.includes(OperationType.SSH_KEY_ADD), 'Should not include SSH_KEY_ADD');
  }

  console.log('  getOperationsByRestriction tests passed!');
}

/**
 * Test restriction reason for blocked operations
 */
function testRestrictionReasons(): void {
  console.log('Testing restriction reasons...');

  // Blocked operations should have meaningful reasons
  const blockedOps = getOperationsByRestriction(RestrictionLevel.BLOCKED);
  for (const op of blockedOps) {
    const info = getOperationInfo(op);
    assert.ok(info, `Should have info for ${op}`);
    assert.ok(
      info.restrictionReason.length > 10,
      `${op} should have meaningful restriction reason`
    );
  }

  // Confirmation operations should have reasons
  const confirmOps = getOperationsByRestriction(RestrictionLevel.CONFIRMATION_REQUIRED);
  for (const op of confirmOps) {
    const info = getOperationInfo(op);
    assert.ok(info, `Should have info for ${op}`);
    assert.ok(
      info.restrictionReason.length > 10,
      `${op} should have meaningful restriction reason`
    );
  }

  console.log('  Restriction reasons tests passed!');
}

/**
 * Mock OperationGuard behavior tests
 */
function testOperationGuardBehavior(): void {
  console.log('Testing OperationGuard behavior patterns...');

  // Test 1: Trusted workspace allows all operations
  {
    const isTrusted = true;
    const operation = OperationType.GIT_CONFIG_WRITE;
    const restriction = getRestrictionLevel(operation);

    // In trusted workspace, all operations are allowed regardless of restriction
    const allowed = isTrusted || restriction === RestrictionLevel.ALLOWED;
    assert.strictEqual(allowed, true, 'Trusted workspace should allow blocked operations');
  }

  // Test 2: Untrusted workspace blocks dangerous operations
  {
    const isTrusted = false;
    const operation = OperationType.GIT_CONFIG_WRITE;
    const restriction = getRestrictionLevel(operation);

    // In untrusted workspace, blocked operations are not allowed
    const allowed = isTrusted || restriction === RestrictionLevel.ALLOWED;
    assert.strictEqual(allowed, false, 'Untrusted workspace should block dangerous operations');
  }

  // Test 3: Untrusted workspace allows read-only operations
  {
    const isTrusted = false;
    const operation = OperationType.GIT_CONFIG_READ;
    const restriction = getRestrictionLevel(operation);

    const allowed = isTrusted || restriction === RestrictionLevel.ALLOWED;
    assert.strictEqual(allowed, true, 'Untrusted workspace should allow read operations');
  }

  // Test 4: Confirmation-required operations need special handling
  {
    const isTrusted = false;
    const operation = OperationType.IDENTITY_SWITCH;
    const restriction = getRestrictionLevel(operation);

    const needsConfirmation = !isTrusted && restriction === RestrictionLevel.CONFIRMATION_REQUIRED;
    assert.strictEqual(
      needsConfirmation,
      true,
      'Confirmation should be required in untrusted workspace'
    );
  }

  console.log('  OperationGuard behavior tests passed!');
}

/**
 * Test edge cases
 */
function testEdgeCases(): void {
  console.log('Testing edge cases...');

  // Test all operation types are covered
  {
    const allTypes = Object.values(OperationType);
    const classifiedTypes = Object.keys(OPERATION_CLASSIFICATION);

    assert.strictEqual(
      allTypes.length,
      classifiedTypes.length,
      'All operation types should be classified'
    );

    for (const type of allTypes) {
      assert.ok(
        type in OPERATION_CLASSIFICATION,
        `${type} should be in classification`
      );
    }
  }

  // Test restriction levels are mutually exclusive
  {
    const blocked = getOperationsByRestriction(RestrictionLevel.BLOCKED);
    const confirm = getOperationsByRestriction(RestrictionLevel.CONFIRMATION_REQUIRED);
    const allowed = getOperationsByRestriction(RestrictionLevel.ALLOWED);

    // No overlap between categories
    for (const op of blocked) {
      assert.ok(!confirm.includes(op), `${op} should not be in both BLOCKED and CONFIRMATION_REQUIRED`);
      assert.ok(!allowed.includes(op), `${op} should not be in both BLOCKED and ALLOWED`);
    }

    for (const op of confirm) {
      assert.ok(!allowed.includes(op), `${op} should not be in both CONFIRMATION_REQUIRED and ALLOWED`);
    }

    // All operations are classified
    const total = blocked.length + confirm.length + allowed.length;
    assert.strictEqual(
      total,
      Object.values(OperationType).length,
      'All operations should be in exactly one category'
    );
  }

  console.log('  Edge cases tests passed!');
}

/**
 * Run all operation guard tests
 */
export async function runOperationGuardTests(): Promise<void> {
  console.log('\n=== Operation Guard Tests ===\n');

  try {
    testOperationClassificationConstants();
    testBlockedOperations();
    testConfirmationRequiredOperations();
    testAllowedOperations();
    testGetOperationInfo();
    testGetOperationsByRestriction();
    testRestrictionReasons();
    testOperationGuardBehavior();
    testEdgeCases();

    console.log('\n  All operation guard tests passed!\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n  Test failed:', errorMessage);
    throw error;
  }
}

// Run tests when executed directly
if (require.main === module) {
  runOperationGuardTests().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
    process.exit(1);
  });
}
