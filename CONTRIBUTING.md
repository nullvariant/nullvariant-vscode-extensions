# Contributing

Thank you for your interest in contributing to nullvariant-vscode-extensions!

## Branch Protection

The `main` branch is protected with the following rules:

- **Pull Request required**: All changes must go through a PR (direct push is disabled)
- **CI status checks**: The `build` check must pass before merging
- **Signed commits required on main**: Commits merged to `main` must be GPG signed (handled by maintainers during merge)
- **Linear history**: Rebase/squash merging is required (no merge commits)

> **Note for contributors**: You don't need to GPG-sign your commits. The maintainer will handle signing when merging your PR.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Commit with a descriptive message
6. Push to your fork
7. Open a Pull Request
8. Wait for CI checks to pass, then a maintainer will merge

## Development Setup

```bash
# Clone
git clone https://github.com/your-username/nullvariant-vscode-extensions.git
cd nullvariant-vscode-extensions

# Set up git hooks (recommended)
git config core.hooksPath .githooks

# Install dependencies
npm install

# Work on an extension
cd extensions/git-id-switcher
npm install
npm run watch
```

## Code Style

- Use TypeScript
- Follow existing code patterns
- Add comments for complex logic
- Keep functions focused and small

## Testing

### Manual Testing

1. Open the extension folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Test your changes manually

### Unit Tests

```bash
cd extensions/git-id-switcher
npm run test
```

### E2E Tests

E2E (End-to-End) tests run in an actual VS Code environment using `@vscode/test-electron` and verify the extension works correctly as a whole.

#### Requirements

- Node.js 20+
- On first run, VS Code will be downloaded automatically (~100MB)

#### Running E2E Tests

```bash
cd extensions/git-id-switcher
npm run test:e2e
```

#### Adding E2E Tests

E2E test files are located in `src/test/e2e/`. When adding new E2E tests:

1. Create a test file in `src/test/e2e/` (e.g., `myFeature.test.ts`)
2. Use the VS Code Test API (`@vscode/test-electron`)
3. Test real extension behavior without mocks
4. Clean up any test data after tests complete

#### UI Module Testing Patterns

When testing UI modules (StatusBar, QuickPick, Documentation), follow these patterns:

**StatusBar Tests:**

- Test state transitions: `setIdentity()`, `setNoIdentity()`, `setLoading()`, `setError()`
- Verify status bar item visibility and text updates
- Use `statusBar.dispose()` in afterEach for cleanup

**QuickPick Tests:**

- Modify configuration → call item generation function → verify items
- Use `vscode.workspace.getConfiguration().update()` for temporary config changes
- Restore original configuration in afterEach

**Documentation (Webview) Tests:**

- **Limitation**: Cannot directly access Webview DOM from tests
- Use command execution + extension stability verification pattern:

  ```typescript
  await vscode.commands.executeCommand('git-id-switcher.showDocumentation');
  assert.strictEqual(extension.isActive, true, 'Extension should remain active');
  ```

- Test panel lifecycle: create → close → re-create
- Add stress tests (rapid open/close) to detect resource leaks
- Set appropriate timeout (e.g., `this.timeout(15000)`) for network operations

#### CI/CD Integration

E2E tests run automatically in GitHub Actions CI:

- Executed in parallel with the build job
- Uses `xvfb-run` for headless execution on Linux
- Currently set as non-blocking (`continue-on-error: true`)

## Pull Request Guidelines

- Describe what your PR does
- Reference any related issues
- Keep changes focused
- Update documentation if needed

## Questions?

Feel free to open an issue for discussion.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
