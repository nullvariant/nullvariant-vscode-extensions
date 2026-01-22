/**
 * Fuzz Test Runner
 *
 * Runs property-based fuzzing tests using fast-check.
 */

import { runFuzzingTests } from './validation.fuzz.test';

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Git ID Switcher Fuzzing Tests            ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Run fuzzing tests (property-based testing)
    runFuzzingTests();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🎉 All Fuzzing Tests Passed!             ║');
    console.log('╚════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    // Sanitize error to prevent sensitive data leakage
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Fuzzing test suite failed:', errorMessage);
    process.exit(1);
  }
}

main().catch(error => {
  // Sanitize error to prevent sensitive data leakage
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Fatal error:', errorMessage);
  process.exit(1);
});
