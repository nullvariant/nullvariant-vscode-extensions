/**
 * Security Test Runner
 *
 * Runs security-focused tests (secure execution, path security, etc.).
 */

import { runSecureExecTests } from './secureExec.test';
import { runBinaryResolverTests } from './binaryResolver.test';
import { runPathSecurityTests } from './pathSecurity.test';
import { runSensitiveDataDetectorTests } from './sensitiveDataDetector.test';
import { runSecurityLoggerTests } from './securityLogger.test';
import { runPathSanitizerTests } from './pathSanitizer.test';
import { runCommandAllowlistTests } from './commandAllowlist.test';
import { runWorkspaceTrustTests } from './workspaceTrust.test';

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Git ID Switcher Security Tests           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Run secure execution tests (async)
    await runSecureExecTests();

    // Run binary resolver tests
    await runBinaryResolverTests();

    // Run path security tests
    await runPathSecurityTests();

    // Run sensitive data detector tests
    await runSensitiveDataDetectorTests();

    // Run security logger tests
    await runSecurityLoggerTests();

    // Run path sanitizer tests
    await runPathSanitizerTests();

    // Run command allowlist tests
    await runCommandAllowlistTests();

    // Run workspace trust tests
    await runWorkspaceTrustTests();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🎉 All Security Tests Passed!            ║');
    console.log('╚════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    // Sanitize error to prevent sensitive data leakage
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Security test suite failed:', errorMessage);
    process.exit(1);
  }
}

main().catch(error => {
  // Sanitize error to prevent sensitive data leakage
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('Fatal error:', errorMessage);
  process.exit(1);
});
