/**
 * Test Runner
 *
 * Runs all security tests for the extension.
 */

import { runSecurityTests } from './validation.test';
import { runSecureExecTests } from './secureExec.test';
import { runPathSecurityTests } from './pathSecurity.test';
import { runPathUtilsTests } from './pathUtils.test';
import { runSshKeyFormatTests } from './sshKeyFormat.test';
import { runValidatorsCommonTests } from './validatorsCommon.test';
import { runVSCodeLoaderTests } from './vscodeLoader.test';
import { runFileLogWriterTests } from './fileLogWriter.test';
import { runFuzzingTests } from './validation.fuzz.test';
import { runCombinedFlagValidationTests } from './combinedFlagValidation.test';

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Git ID Switcher Security Tests           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Run validation tests (synchronous)
    runSecurityTests();

    // Run secure execution tests (async)
    await runSecureExecTests();

    // Run path security tests
    await runPathSecurityTests();

    // Run path utils tests
    await runPathUtilsTests();

    // Run SSH key format validation tests
    await runSshKeyFormatTests();

    // Run common validators tests
    runValidatorsCommonTests();

    // Run VS Code loader tests
    runVSCodeLoaderTests();

    // Run FileLogWriter tests
    await runFileLogWriterTests();

    // Run combined flag validation tests
    await runCombinedFlagValidationTests();

    // Run fuzzing tests (property-based testing)
    runFuzzingTests();

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
