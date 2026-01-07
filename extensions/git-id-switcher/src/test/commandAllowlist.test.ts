/**
 * Security Tests for Command Allowlist
 *
 * Tests the strict validation logic for command allowlisting.
 */

import * as assert from 'assert';
import { isCommandAllowed } from '../commandAllowlist';

async function testCommandAllowlist(): Promise<void> {
  console.log('Testing Command Allowlist Security...');

  // Test 1: Safe git config commands
  {
    console.log('  Testing safe git config commands...');
    const result1 = isCommandAllowed('git', ['config', '--local', 'user.name', 'John Doe']);
    assert.strictEqual(result1.allowed, true, 'Should allow git config with value');

    const result2 = isCommandAllowed('git', ['config', '--global', 'user.email', 'test@example.com']);
    assert.strictEqual(result2.allowed, true, 'Should allow git config --global');
  }

  // Test 2: Block unknown flags
  {
    console.log('  Testing blocking of unknown flags...');
    const result1 = isCommandAllowed('git', ['config', '--malicious-flag', 'user.name']);
    assert.strictEqual(result1.allowed, false, 'Should block unknown flag');
    assert.ok(result1.reason?.includes('not allowed'), 'Reason should mention flag not allowed');

    const result2 = isCommandAllowed('git', ['config', 'user.name', '--bad-flag']);
    assert.strictEqual(result2.allowed, false, 'Should block flag in value position');
  }

  // Test 3: Block unknown subcommands
  {
    console.log('  Testing blocking of unknown subcommands...');
    const result = isCommandAllowed('git', ['baddir']);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.reason?.includes('not in the allowlist'));
  }

  // Test 4: Validate submodule arguments
  {
    console.log('  Testing submodule arguments...');
    const result1 = isCommandAllowed('git', ['submodule', 'status', '--recursive']);
    assert.strictEqual(result1.allowed, true);

    const result2 = isCommandAllowed('git', ['submodule', 'status', '--malicious']);
    assert.strictEqual(result2.allowed, false);
  }

  // Test 5: Respect allowedOptionsWithValues setting
  {
    console.log('  Testing allowedOptionsWithValues setting...');
    // git config has allowAnyPositional: false but allowedOptionsWithValues: ['user.name', ...]

    // Correct usage: value follows allowed option
    const result1 = isCommandAllowed('git', ['config', 'user.name', 'John Doe']);
    assert.strictEqual(result1.allowed, true, 'Should allow value following allowed option');

    // Incorrect usage: arbitrary positional not following allowed option
    const result2 = isCommandAllowed('git', ['config', 'core.sshCommand', 'evil_script.sh']);
    assert.strictEqual(result2.allowed, false, 'Should block arbitrary key/value pairs not in allowlist');

    // Incorrect usage: just a random string
    const result3 = isCommandAllowed('git', ['config', 'random_string']);
    assert.strictEqual(result3.allowed, false, 'Should block random string');
  }

  // Test 6: allowAnyPositional (ssh-add)
  {
    console.log('  Testing allowAnyPositional (ssh-add)...');

    // Valid path (also checked by isSecurePath)
    const result1 = isCommandAllowed('ssh-add', ['/path/to/key']);
    assert.strictEqual(result1.allowed, true, 'Should allow arbitrary positional for ssh-add');

    // But flag-like strings are still blocked if unknown
    const result2 = isCommandAllowed('ssh-add', ['--unknown-flag']);
    assert.strictEqual(result2.allowed, false, 'Should block unknown flags even with allowAnyPositional');
  }

  // Test 7: Validate path arguments even when positional allowed
  {
    console.log('  Testing path argument validation...');
    // ssh-add has allowAnyPositional: true

    // Valid path
    const result1 = isCommandAllowed('ssh-add', ['/path/to/key']);
    assert.strictEqual(result1.allowed, true, 'Should allow valid path');

    // Path traversal
    const result2 = isCommandAllowed('ssh-add', ['../../etc/passwd']);
    console.log(`    Checking path traversal: allowed=${result2.allowed}, reason=${result2.reason}`);
    assert.strictEqual(result2.allowed, false, 'Should block path traversal');
    assert.ok(result2.reason?.includes('Path argument rejected'), 'Reason should mention path rejection');
  }

  // Test 8: Handle combined flags correctly
  {
    console.log('  Testing combined flags...');
    // ssh-keygen uses combined flags like -lf
    const result1 = isCommandAllowed('ssh-keygen', ['-lf', '/path/to/key']);
    assert.strictEqual(result1.allowed, true, 'Should allow combined flag -lf');

    // Invalid combination
    // Assuming -x is not allowed
    const result2 = isCommandAllowed('ssh-keygen', ['-lx', '/path/to/key']);
    assert.strictEqual(result2.allowed, false, 'Should block invalid combined flag');
  }

  console.log('✅ All Command Allowlist tests passed!');
}

// Run tests when executed directly
if (require.main === module) {
  testCommandAllowlist().catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}
