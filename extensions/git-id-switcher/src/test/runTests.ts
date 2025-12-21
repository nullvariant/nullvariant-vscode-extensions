/**
 * Test Runner
 *
 * Runs all security tests for the extension.
 */

import { runSecurityTests } from './validation.test';
import { runSecureExecTests } from './secureExec.test';

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Git ID Switcher Security Tests           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Run validation tests (synchronous)
    runSecurityTests();

    // Run secure execution tests (async)
    await runSecureExecTests();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🎉 All Security Tests Passed!            ║');
    console.log('╚════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
