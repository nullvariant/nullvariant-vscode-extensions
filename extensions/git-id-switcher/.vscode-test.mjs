// @ts-check
/**
 * VS Code Extension E2E Test Configuration
 *
 * This configuration file is used by @vscode/test-cli to run E2E tests.
 *
 * Running tests:
 *   npm run test:e2e
 *
 * CI Environment:
 *   On Linux CI (GitHub Actions), use xvfb-run for headless execution:
 *   xvfb-run -a npm run test:e2e
 *
 * @see https://code.visualstudio.com/api/working-with-extensions/testing-extension
 */
import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  // Glob pattern for test files
  files: 'out/test/e2e/**/*.test.js',

  // VS Code version to use for testing (matches engines.vscode in package.json)
  version: '1.85.0',

  // Mocha configuration
  mocha: {
    ui: 'bdd',
    timeout: 20000,
  },

  // Test workspace directory
  workspaceFolder: './test-workspace',

  // Launch arguments for VS Code
  // Using short user-data-dir path to avoid socket path length issues on macOS
  launchArgs: [
    '--user-data-dir=/tmp/vscode-test-data',
  ],
});
