/**
 * Security Tests for Command Allowlist
 *
 * Tests the strict validation logic for command allowlisting.
 */

import * as assert from 'node:assert';
import { isCommandAllowed } from '../security/commandAllowlist';
import { SIGNING_TEST_DATA } from '../security/sshKeygenRules';

export async function runCommandAllowlistTests(): Promise<void> {
  console.log('Testing Command Allowlist Security...');

  // Test 1: Safe git config commands
  {
    console.log('  Testing safe git config commands...');
    const result1 = isCommandAllowed('git', ['config', '--local', 'user.name', 'John Doe']);
    assert.strictEqual(result1.allowed, true, 'Should allow git config with value');

    // The extension only writes --local config (least privilege); --global is rejected
    const result2 = isCommandAllowed('git', ['config', '--global', 'user.email', 'test@example.com']);
    assert.strictEqual(result2.allowed, false, 'Should reject git config --global');
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

  // Test 5: git config is read as a grammar (see gitConfigRules.test.ts for all forms)
  {
    console.log('  Testing git config grammar...');

    // Setting without a scope is rejected: only --local is written
    const result1 = isCommandAllowed('git', ['config', 'user.name', 'John Doe']);
    assert.strictEqual(result1.allowed, false, 'Should reject a scope-less set');

    // Incorrect usage: arbitrary positional not following allowed option
    const result2 = isCommandAllowed('git', ['config', 'core.sshCommand', 'evil_script.sh']);
    assert.strictEqual(result2.allowed, false, 'Should block arbitrary key/value pairs not in allowlist');

    // Incorrect usage: just a random string
    const result3 = isCommandAllowed('git', ['config', 'random_string']);
    assert.strictEqual(result3.allowed, false, 'Should block random string');
  }

  // Test 6: ssh-add takes key paths as positionals and only the flags it uses
  {
    console.log('  Testing the ssh-add rules...');
    for (const args of [['-l'], ['/path/to/key'], ['--apple-use-keychain', '/path/to/key'], ['-d', '/path/to/key']]) {
      assert.strictEqual(isCommandAllowed('ssh-add', args).allowed, true, JSON.stringify(args));
    }
    for (const args of [['-D'], ['--unknown-flag'], ['not-a-path']]) {
      assert.strictEqual(isCommandAllowed('ssh-add', args).allowed, false, JSON.stringify(args));
    }
    // A command without a grammar accepts no arguments
    assert.strictEqual(isCommandAllowed('git', []).allowed, true);
    // The length check applies to the token rules and the grammars alike
    assert.strictEqual(isCommandAllowed('git', ['rev-parse', 'a'.repeat(300)]).reason, 'Argument exceeds maximum length');
    assert.strictEqual(isCommandAllowed('ssh-keygen', ['a'.repeat(300)]).reason, 'Argument exceeds maximum length');
  }

  // Test 7: Standard input: ssh-keygen -Y sign takes exactly the fixed test
  // data; nothing else takes standard input
  {
    console.log('  Testing standard input rules...');
    const sign = ['-Y', 'sign', '-n', 'git', '-f', '/path/to/key'];
    assert.deepStrictEqual(isCommandAllowed('ssh-keygen', sign, SIGNING_TEST_DATA), { allowed: true });
    for (const input of [undefined, '', 'other data\n', `${SIGNING_TEST_DATA}more`]) {
      assert.deepStrictEqual(isCommandAllowed('ssh-keygen', sign, input), {
        allowed: false,
        reason: 'ssh-keygen standard input is not allowed for this form',
      }, JSON.stringify(input));
    }
    assert.strictEqual(isCommandAllowed('ssh-keygen', ['-lf', '/path/to/key.pub'], SIGNING_TEST_DATA).allowed, false);
    assert.deepStrictEqual(isCommandAllowed('git', ['--version'], 'x'), {
      allowed: false,
      reason: "Command 'git' takes no standard input",
    });
    assert.deepStrictEqual(isCommandAllowed('ssh-add', ['-l'], 'x'), {
      allowed: false,
      reason: "Command 'ssh-add' takes no standard input",
    });
  }

  // Test 8: ssh-keygen accepts only its three forms (sshKeygenRules)
  {
    console.log('  Testing the ssh-keygen grammar...');
    for (const args of [
      ['-lf', '/path/to/key.pub'],
      ['-y', '-P', '', '-f', '/path/to/key'],
      ['-Y', 'sign', '-n', 'git', '-f', '/path/to/key'],
      // Windows drive paths get the drive path checks, like git config
      ['-lf', 'C:/Users/me/.ssh/id_sign.pub'],
      ['-y', '-P', '', '-f', String.raw`C:\Users\me\.ssh\id_sign`],
      ['-Y', 'sign', '-n', 'git', '-f', 'C:/Users/me/.ssh/id_sign'],
    ]) {
      const input = args[0] === '-Y' ? SIGNING_TEST_DATA : undefined;
      const result = isCommandAllowed('ssh-keygen', args, input);
      assert.strictEqual(result.allowed, true, `${JSON.stringify(args)}: ${result.reason}`);
    }
    const rejected = [
      [],
      ['-lf'],
      ['-l', '-f', '/path/to/key'],
      ['-fl', '/path/to/key'],
      ['-lx', '/path/to/key'],
      ['-lf', '~/.ssh/id'],
      ['-lf', 'relative/key'],
      ['-lf', '/path/to/key', '/other'],
      ['-y', '-f', '/path/to/key'], // without -P '' it could ask for a passphrase
      ['-y', '-P', 'secret', '-f', '/path/to/key'],
      ['-y', '-P', '', '-f', '-malicious'],
      ['-y', '-P', '', '-f'],
      ['-p', '-P', '', '-f', '/path/to/key'], // changes the passphrase: writes the file
      ['-t', 'ed25519', '-f', '/path/to/key'],
      ['-Y', 'sign', '-f', '/path/to/key'], // no namespace
      ['-Y', 'sign', '-n', 'file', '-f', '/path/to/key'], // another namespace
      ['-Y', 'sign', '-n', 'git', '-f', '/path/to/key', '/path/to/file'], // signs a file, writes .sig
      ['-Y', 'verify', '-n', 'git', '-f', '/path/to/key'],
      ['-lf', 'C:/Users/../id'],
      ['-lf', String.raw`\\server\share\id.pub`],
    ];
    for (const args of rejected) {
      assert.strictEqual(isCommandAllowed('ssh-keygen', args).allowed, false, JSON.stringify(args));
    }
    assert.strictEqual(
      isCommandAllowed('ssh-keygen', ['-l', '-f', '/path/to/key']).reason,
      'ssh-keygen arguments are not allowed (no matching form)',
    );
  }

  // Test 9: Path checks run before the rules
  {
    console.log('  Testing path argument validation...');
    assert.strictEqual(isCommandAllowed('ssh-add', ['/path/to/key']).allowed, true, 'Should allow valid path');
    const traversal = isCommandAllowed('ssh-add', ['../../etc/passwd']);
    assert.strictEqual(traversal.allowed, false, 'Should block path traversal');
    assert.ok(traversal.reason?.includes('Path argument rejected'), 'Reason should mention path rejection');
    const grammarTraversal = isCommandAllowed('ssh-keygen', ['-lf', '/path/../../etc/passwd']);
    assert.strictEqual(grammarTraversal.allowed, false);
    assert.ok(grammarTraversal.reason?.startsWith('Path argument rejected'), grammarTraversal.reason);
    // Token rules run the path checks too
    const tokenTraversal = isCommandAllowed('git', ['submodule', 'status', '../../etc']);
    assert.strictEqual(tokenTraversal.allowed, false);
    assert.ok(tokenTraversal.reason?.startsWith('Path argument rejected'), tokenTraversal.reason);
    // Token rules: a combined flag that is not allowed
    const combined = isCommandAllowed('git', ['rev-parse', '-xy']);
    assert.strictEqual(combined.allowed, false);
    assert.strictEqual(isCommandAllowed('git', ['rev-parse', '--unknown']).allowed, false);
  }

  // Test 10: allowPathPositionals with valid path
  {
    console.log('  Testing allowPathPositionals with valid path...');
    // git submodule has allowPathPositionals: true
    // Should allow path-like arguments
    const result1 = isCommandAllowed('git', ['submodule', 'status', './path/to/module']);
    assert.strictEqual(result1.allowed, true, 'Should allow path positional for submodule status');

    const result2 = isCommandAllowed('git', ['submodule', 'status', '/absolute/path/to/module']);
    assert.strictEqual(result2.allowed, true, 'Should allow absolute path positional');

    // Non-path-like argument should be blocked
    const result3 = isCommandAllowed('git', ['submodule', 'status', 'init']);
    assert.strictEqual(result3.allowed, false, 'Should block non-path argument for submodule');
    assert.ok(
      result3.reason?.includes('not allowed'),
      'Reason should mention argument not allowed'
    );
  }

  console.log('✅ All Command Allowlist tests passed!');
}

// Run tests when executed directly
if (require.main === module) {
  runCommandAllowlistTests().catch((error: unknown) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}
