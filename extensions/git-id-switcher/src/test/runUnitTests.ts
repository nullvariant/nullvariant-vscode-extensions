/**
 * Unit Test Runner
 *
 * Runs unit tests (pure logic, fast execution).
 */

import { runSecurityTests } from './validation.test';
import { runPathUtilsTests } from './pathUtils.test';
import { runSshKeyFormatTests } from './sshKeyFormat.test';
import { runValidatorsCommonTests } from './validatorsCommon.test';
import { runVSCodeLoaderTests } from './vscodeLoader.test';
import { runFileLogWriterTests } from './fileLogWriter.test';
import { runCombinedFlagValidationTests } from './combinedFlagValidation.test';
import { runConfigChangeDetectorTests } from './configChangeDetector.test';
import { runDocumentationTests } from './documentation.test';
import { runConfigSchemaTests } from './configSchema.test';
import { runI18nTests } from './i18n.test';
import { runSubmoduleTests } from './submodule.test';
import { runPathSeparatorTests } from './pathSeparator.test';
import { runDisplayLimitsTests } from './displayLimits.test';
import { runSshAgentParsingTests } from './sshAgentParsing.test';
import { runSyncCheckerTests } from './syncChecker.test';
import { runHtmlTemplatesTests } from './htmlTemplates.test';

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Git ID Switcher Unit Tests               ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Run validation tests (synchronous)
    runSecurityTests();

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

    // Run config change detector tests
    runConfigChangeDetectorTests();

    // Run documentation module tests
    await runDocumentationTests();

    // Run config schema tests
    runConfigSchemaTests();

    // Run i18n translation key coverage tests
    runI18nTests();

    // Run submodule tests (now uses vscodeLoader for lazy loading)
    await runSubmoduleTests();

    // Run cross-platform path separator tests
    await runPathSeparatorTests();

    // Run display limits tests
    runDisplayLimitsTests();

    // Run SSH agent parsing tests (ReDoS-safe split-based parsing)
    await runSshAgentParsingTests();

    // Run sync checker tests (profile vs git config comparison)
    await runSyncCheckerTests();

    // Run HTML template tests (pure functions, no VS Code dependency)
    runHtmlTemplatesTests();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🎉 All Unit Tests Passed!                ║');
    console.log('╚════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    // Sanitize error to prevent sensitive data leakage
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Unit test suite failed:', errorMessage);
    process.exit(1);
  }
}

main().catch(error => {
  // Sanitize error to prevent sensitive data leakage
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Fatal error:', errorMessage);
  process.exit(1);
});
