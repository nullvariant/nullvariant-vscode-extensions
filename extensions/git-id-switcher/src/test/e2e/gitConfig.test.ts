/**
 * E2E Tests for Git Configuration Module
 *
 * These tests verify the Git configuration functionality using real Git repositories.
 * Tests use actual git commands (no mocks) to ensure real behavior validation.
 *
 * Test Categories:
 * - Git Availability: Verify git command is available (2 tests)
 * - Repository Detection: Check if directory is a Git repository (4 tests)
 * - Configuration Reading: Read user.name, user.email, user.signingkey (5 tests)
 * - Configuration Writing: Write git config values to local repository (6 tests)
 * - Multiple Config Reading: Read multiple configurations simultaneously (3 tests)
 * - Error Handling: Handle missing configs, non-existent repos, invalid states (4 tests)
 * - Git Author Format: Verify author string formatting (2 tests)
 * - Repository State: Verify repository state and branch info (3 tests)
 * - Config Scope Isolation: Verify local/global config isolation (2 tests)
 * - Cleanup Verification: Verify temp repo cleanup (2 tests)
 *
 * Test Count: 33 tests covering gitConfig.ts related functionality
 *
 * Note: These tests create a temporary Git repository for testing.
 * The repository is created in before() and removed in after().
 * Each test restores original configuration values after execution.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFileSync } from 'child_process';

const EXTENSION_ID = 'nullvariant.git-id-switcher';

/**
 * Git environment variables for consistent test execution
 */
const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: 'Test User',
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'Test User',
  GIT_COMMITTER_EMAIL: 'test@example.com',
};

/**
 * Helper to execute git commands synchronously for test setup/teardown
 * Uses execFileSync to properly handle arguments with spaces and special characters
 */
function gitSync(args: string[], cwd: string): string {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: GIT_ENV,
    }).trim();
  } catch (error) {
    return '';
  }
}

/**
 * Create a temporary directory for test repository
 */
function createTempDir(): string {
  const tempBase = os.tmpdir();
  const tempDir = path.join(tempBase, `git-id-switcher-e2e-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Remove a directory recursively
 */
function removeDirSync(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

describe('Git Config E2E Test Suite', function () {
  // Set suite-level timeout for all tests (git operations may be slow)
  this.timeout(15000);

  let tempRepoPath: string;
  let extension: vscode.Extension<unknown> | undefined;

  before(async () => {
    vscode.window.showInformationMessage('Starting Git Config E2E tests...');

    // Ensure extension is activated
    extension = vscode.extensions.getExtension(EXTENSION_ID);
    if (extension && !extension.isActive) {
      await extension.activate();
    }

    // Create temporary Git repository
    tempRepoPath = createTempDir();

    // Initialize git repository with default branch name
    gitSync(['init', '-b', 'main'], tempRepoPath);

    // Configure basic Git settings for the temp repo (local scope)
    gitSync(['config', 'user.name', 'Test User'], tempRepoPath);
    gitSync(['config', 'user.email', 'test@example.com'], tempRepoPath);

    // Create an initial commit so the repo is fully initialized
    const testFile = path.join(tempRepoPath, 'README.md');
    fs.writeFileSync(testFile, '# Test Repository\n');
    gitSync(['add', '.'], tempRepoPath);
    gitSync(['commit', '-m', 'Initial commit'], tempRepoPath);

    // Verify repository was properly initialized
    const isRepo = gitSync(['rev-parse', '--is-inside-work-tree'], tempRepoPath);
    if (isRepo !== 'true') {
      throw new Error('Failed to initialize test repository');
    }
  });

  after(() => {
    // Clean up temporary repository with error handling
    try {
      if (tempRepoPath && fs.existsSync(tempRepoPath)) {
        removeDirSync(tempRepoPath);
      }
    } catch (error) {
      // Log but don't fail - cleanup failure shouldn't affect test results
      console.warn('Failed to clean up temp repository:', error);
    }
    vscode.window.showInformationMessage('Git Config E2E tests completed.');
  });

  describe('Git Availability', () => {
    it('should have git command available', () => {
      const version = gitSync(['--version'], process.cwd());
      assert.ok(version.includes('git version'), 'Git should be available');
    });

    it('should report git version correctly', () => {
      const version = gitSync(['--version'], process.cwd());
      // Version format: "git version X.Y.Z" or similar
      assert.ok(/git version \d+\.\d+/.test(version), 'Git version should match expected format');
    });
  });

  describe('Repository Detection', () => {
    it('should detect temp directory as a git repository', () => {
      const result = gitSync(['rev-parse', '--is-inside-work-tree'], tempRepoPath);
      assert.strictEqual(result, 'true', 'Temp directory should be a git repository');
    });

    it('should detect git directory location', () => {
      const gitDir = gitSync(['rev-parse', '--git-dir'], tempRepoPath);
      assert.strictEqual(gitDir, '.git', 'Git directory should be .git');
    });

    it('should detect repository root', () => {
      const repoRoot = gitSync(['rev-parse', '--show-toplevel'], tempRepoPath);
      assert.ok(repoRoot.length > 0, 'Repository root should be detected');
      assert.ok(repoRoot.includes('git-id-switcher-e2e'), 'Root should include temp repo name');
    });

    it('should report non-repo directory correctly', () => {
      // Use system temp as non-repo (parent of our temp repo)
      const tempBase = os.tmpdir();
      const result = gitSync(['rev-parse', '--is-inside-work-tree'], tempBase);
      // Either empty (error) or 'false' means not a repo
      assert.ok(result === '' || result === 'false', 'System temp should not be a git repository');
    });
  });

  describe('Configuration Reading', () => {
    it('should read user.name from git config', () => {
      const userName = gitSync(['config', '--get', 'user.name'], tempRepoPath);
      assert.strictEqual(userName, 'Test User', 'user.name should match configured value');
    });

    it('should read user.email from git config', () => {
      const userEmail = gitSync(['config', '--get', 'user.email'], tempRepoPath);
      assert.strictEqual(userEmail, 'test@example.com', 'user.email should match configured value');
    });

    it('should return empty for non-existent config key', () => {
      const nonExistent = gitSync(['config', '--get', 'nonexistent.key'], tempRepoPath);
      assert.strictEqual(nonExistent, '', 'Non-existent key should return empty');
    });

    it('should read local config scope', () => {
      const userName = gitSync(['config', '--local', '--get', 'user.name'], tempRepoPath);
      assert.strictEqual(userName, 'Test User', 'Local user.name should be readable');
    });

    it('should list all local config values', () => {
      const configList = gitSync(['config', '--local', '--list'], tempRepoPath);
      assert.ok(configList.includes('user.name=Test User'), 'Config list should include user.name');
      assert.ok(configList.includes('user.email=test@example.com'), 'Config list should include user.email');
    });
  });

  describe('Configuration Writing', () => {
    it('should write user.name to local git config', () => {
      const newName = 'E2E Test Name';

      // Write new value
      gitSync(['config', '--local', 'user.name', newName], tempRepoPath);

      // Verify
      const readBack = gitSync(['config', '--get', 'user.name'], tempRepoPath);
      assert.strictEqual(readBack, newName, 'Written user.name should be readable');

      // Restore original
      gitSync(['config', '--local', 'user.name', 'Test User'], tempRepoPath);
    });

    it('should write user.email to local git config', () => {
      const newEmail = 'e2e-test@example.com';

      // Write new value
      gitSync(['config', '--local', 'user.email', newEmail], tempRepoPath);

      // Verify
      const readBack = gitSync(['config', '--get', 'user.email'], tempRepoPath);
      assert.strictEqual(readBack, newEmail, 'Written user.email should be readable');

      // Restore original
      gitSync(['config', '--local', 'user.email', 'test@example.com'], tempRepoPath);
    });

    it('should write user.signingkey to local git config', () => {
      const signingKey = 'ABCD1234EFGH5678';

      // Write signing key
      gitSync(['config', '--local', 'user.signingkey', signingKey], tempRepoPath);

      // Verify
      const readBack = gitSync(['config', '--get', 'user.signingkey'], tempRepoPath);
      assert.strictEqual(readBack, signingKey, 'Written user.signingkey should be readable');

      // Clean up - unset the key
      gitSync(['config', '--local', '--unset', 'user.signingkey'], tempRepoPath);
    });

    it('should write and read commit.gpgsign setting', () => {
      // Enable GPG signing
      gitSync(['config', '--local', 'commit.gpgsign', 'true'], tempRepoPath);

      // Verify
      const readBack = gitSync(['config', '--get', 'commit.gpgsign'], tempRepoPath);
      assert.strictEqual(readBack, 'true', 'commit.gpgsign should be true');

      // Disable and clean up
      gitSync(['config', '--local', '--unset', 'commit.gpgsign'], tempRepoPath);
    });

    it('should handle special characters in user.name', () => {
      const specialName = 'Test User (Dev)';

      // Write name with special characters
      gitSync(['config', '--local', 'user.name', specialName], tempRepoPath);

      // Verify
      const readBack = gitSync(['config', '--get', 'user.name'], tempRepoPath);
      assert.strictEqual(readBack, specialName, 'Special characters should be preserved');

      // Restore original
      gitSync(['config', '--local', 'user.name', 'Test User'], tempRepoPath);
    });

    it('should handle unicode characters in user.name', () => {
      const unicodeName = '🧪 Test User';

      // Write name with unicode (emoji)
      gitSync(['config', '--local', 'user.name', unicodeName], tempRepoPath);

      // Verify
      const readBack = gitSync(['config', '--get', 'user.name'], tempRepoPath);
      assert.strictEqual(readBack, unicodeName, 'Unicode characters should be preserved');

      // Restore original
      gitSync(['config', '--local', 'user.name', 'Test User'], tempRepoPath);
    });
  });

  describe('Multiple Config Reading', () => {
    it('should read multiple config values in sequence', () => {
      const userName = gitSync(['config', '--get', 'user.name'], tempRepoPath);
      const userEmail = gitSync(['config', '--get', 'user.email'], tempRepoPath);

      assert.ok(userName.length > 0, 'user.name should be readable');
      assert.ok(userEmail.length > 0, 'user.email should be readable');
      assert.ok(userEmail.includes('@'), 'user.email should contain @');
    });

    it('should read config with get-regexp', () => {
      const userConfigs = gitSync(['config', '--get-regexp', '^user\\.'], tempRepoPath);

      assert.ok(userConfigs.includes('user.name'), 'Should include user.name');
      assert.ok(userConfigs.includes('user.email'), 'Should include user.email');
    });

    it('should differentiate local from global config', () => {
      // Get all origins for user.name
      const origins = gitSync(['config', '--show-origin', '--get', 'user.name'], tempRepoPath);

      // Should show the local .git/config file
      assert.ok(origins.includes('.git/config'), 'Origin should include local .git/config');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid config key format gracefully', () => {
      // Invalid key format should return empty or error
      const result = gitSync(['config', '--get', 'invalid-key-format'], tempRepoPath);
      assert.strictEqual(result, '', 'Invalid key format should return empty');
    });

    it('should handle missing config value gracefully', () => {
      const result = gitSync(['config', '--get', 'nonexistent.setting'], tempRepoPath);
      assert.strictEqual(result, '', 'Missing config should return empty');
    });

    it('should handle unset operation for non-existent key', () => {
      // Unset a non-existent key - should not throw but may return empty
      const result = gitSync(['config', '--local', '--unset', 'nonexistent.key'], tempRepoPath);
      // Result will be empty (error case), which is expected
      assert.strictEqual(result, '', 'Unset non-existent key should handle gracefully');
    });

    it('should handle config operations on invalid path', () => {
      const invalidPath = '/nonexistent/path/to/repo';
      const result = gitSync(['config', '--get', 'user.name'], invalidPath);
      assert.strictEqual(result, '', 'Config on invalid path should return empty');
    });
  });

  describe('Git Author Format', () => {
    it('should format git author string correctly', () => {
      const userName = 'Test User';
      const userEmail = 'test@example.com';
      const authorFormat = `${userName} <${userEmail}>`;

      assert.ok(authorFormat.includes(userName), 'Author should include name');
      assert.ok(authorFormat.includes(userEmail), 'Author should include email');
      assert.ok(authorFormat.includes('<') && authorFormat.includes('>'), 'Author should have angle brackets');
    });

    it('should handle author format with unicode name', () => {
      const userName = '🧪 Test User';
      const userEmail = 'test@example.com';
      const authorFormat = `${userName} <${userEmail}>`;

      assert.ok(authorFormat.includes('🧪'), 'Author should include emoji');
      assert.strictEqual(authorFormat, '🧪 Test User <test@example.com>', 'Author format should be correct');
    });
  });

  describe('Repository State', () => {
    it('should report repository has at least one commit', () => {
      const commitCount = gitSync(['rev-list', '--count', 'HEAD'], tempRepoPath);
      const count = parseInt(commitCount, 10);
      assert.ok(!isNaN(count) && count >= 1, `Repository should have at least one commit, got: ${commitCount}`);
    });

    it('should report current branch', () => {
      const branch = gitSync(['rev-parse', '--abbrev-ref', 'HEAD'], tempRepoPath);
      // In a new repo, branch might be 'main', 'master', or 'HEAD' if no commits
      assert.ok(branch.length > 0, `Current branch should be reportable, got: ${branch}`);
    });

    it('should report working tree status', () => {
      const status = gitSync(['status', '--porcelain'], tempRepoPath);
      // Status is a string (may be empty if clean, or contain changes)
      assert.ok(typeof status === 'string', 'Status should be a string');
    });
  });

  describe('Config Scope Isolation', () => {
    it('should not affect global config when writing to local', () => {
      // Get global user.name if exists
      const globalName = gitSync(['config', '--global', '--get', 'user.name'], tempRepoPath);

      // Write different value to local
      gitSync(['config', '--local', 'user.name', 'Local Only User'], tempRepoPath);

      // Global should be unchanged
      const globalNameAfter = gitSync(['config', '--global', '--get', 'user.name'], tempRepoPath);
      assert.strictEqual(globalNameAfter, globalName, 'Global config should be unchanged');

      // Restore local
      gitSync(['config', '--local', 'user.name', 'Test User'], tempRepoPath);
    });

    it('should show local config overrides global', () => {
      // Get the effective user.name (local takes precedence)
      const effectiveName = gitSync(['config', '--get', 'user.name'], tempRepoPath);
      const localName = gitSync(['config', '--local', '--get', 'user.name'], tempRepoPath);

      assert.strictEqual(effectiveName, localName, 'Effective config should match local');
    });
  });

  describe('Cleanup Verification', () => {
    it('should verify temp repo still exists during test', () => {
      assert.ok(fs.existsSync(tempRepoPath), 'Temp repo should exist during tests');
    });

    it('should verify .git directory exists', () => {
      const gitDir = path.join(tempRepoPath, '.git');
      assert.ok(fs.existsSync(gitDir), '.git directory should exist');
    });
  });

  describe('Cancellation Handling', () => {
    // Import once for all tests in this describe block
    let getCurrentGitConfig: typeof import('../../gitConfig.js').getCurrentGitConfig;

    before(async () => {
      const module = await import('../../gitConfig.js');
      getCurrentGitConfig = module.getCurrentGitConfig;
    });

    it('should handle cancellation token that is already cancelled', async () => {
      // Create a cancellation token that's already cancelled
      const tokenSource = new vscode.CancellationTokenSource();
      tokenSource.cancel();

      const startTime = Date.now();
      const config = await getCurrentGitConfig(tokenSource.token);
      const duration = Date.now() - startTime;

      // Should return empty config immediately
      assert.strictEqual(config.userName, undefined, 'userName should be undefined');
      assert.strictEqual(config.userEmail, undefined, 'userEmail should be undefined');
      assert.strictEqual(config.signingKey, undefined, 'signingKey should be undefined');

      // Should complete very quickly (within 100ms)
      assert.ok(duration < 100, `Should return immediately for cancelled token, took ${duration}ms`);

      tokenSource.dispose();
    });

    it('should handle cancellation during operation', async () => {
      // Create a cancellation token
      const tokenSource = new vscode.CancellationTokenSource();

      // Start the operation
      const configPromise = getCurrentGitConfig(tokenSource.token);

      // Cancel immediately (simulating quick workspace switch)
      tokenSource.cancel();

      const config = await configPromise;

      // Should return empty config when cancelled
      assert.strictEqual(config.userName, undefined, 'userName should be undefined after cancellation');
      assert.strictEqual(config.userEmail, undefined, 'userEmail should be undefined after cancellation');
      assert.strictEqual(config.signingKey, undefined, 'signingKey should be undefined after cancellation');

      tokenSource.dispose();
    });

    it('should complete normally without cancellation', async () => {
      // Create a cancellation token but don't cancel it
      const tokenSource = new vscode.CancellationTokenSource();

      const config = await getCurrentGitConfig(tokenSource.token);

      // Should return a valid config object (values may be undefined in CI without git config)
      assert.ok(typeof config === 'object', 'Should return a config object');
      assert.ok('userName' in config, 'Config should have userName property');
      assert.ok('userEmail' in config, 'Config should have userEmail property');
      assert.ok('signingKey' in config, 'Config should have signingKey property');

      tokenSource.dispose();
    });

    it('should work without cancellation token', async () => {
      // Call without token
      const config = await getCurrentGitConfig();

      // Should return a valid config object (values may be undefined in CI without git config)
      assert.ok(typeof config === 'object', 'Should return a config object');
      assert.ok('userName' in config, 'Config should have userName property');
      assert.ok('userEmail' in config, 'Config should have userEmail property');
    });
  });
});
