# AGENTS Instructions

- This file provides guidance for AI agents working in this repository.
- Scope: the entire monorepo (root-level AGENTS.md).
- Keep changes minimal and consistent with existing project conventions.
- Do not modify files unrelated to the requested task.

## Branch Protection

- **main branch**: Direct push is disabled. All changes must go through a Pull Request.
- **CI checks**: The `build` check must pass before merging.
- **Signed commits**: Required on main (handled by maintainers during merge).

## Release Process

Extensions are automatically published to VS Code Marketplace and Open VSX when a release tag is pushed.

AI agents should NOT:

- Push release tags
- Modify version numbers in package.json without explicit instruction
- Run `vsce publish` or similar commands

Release tags follow the format: `git-id-switcher-v1.0.0`

## Testing

### Requirements

- Node.js 20+

### Running Tests

```bash
cd extensions/git-id-switcher

# Unit tests (fast, no VS Code required)
npm run test

# E2E tests (requires VS Code download on first run)
npm run test:e2e

# All tests
npm run test && npm run test:e2e
```

### Test Strategy

| Test Type  | Target                                       | When to Use                |
|------------|----------------------------------------------|----------------------------|
| Unit Tests | Pure functions, utilities, validation        | Fast feedback, edge cases  |
| E2E Tests  | VS Code API integration, extension lifecycle | Real behavior verification |

### Adding E2E Tests

E2E test files are in `extensions/git-id-switcher/src/test/e2e/`. Guidelines:

1. **No mocks**: Use real VS Code APIs and Git commands
2. **Cleanup**: Remove temporary files/repos after tests
3. **Isolation**: Each test should be independent
4. **Naming**: Use descriptive test names that explain the scenario

#### UI Module Testing Notes

- **StatusBar**: Test state transitions (`setIdentity`, `setNoIdentity`, `setLoading`, `setError`)
- **QuickPick**: Modify config → generate items → verify output
- **Webview (Documentation)**: Cannot access DOM directly; verify via command execution + `extension.isActive` check

### CI/CD

- Unit tests: Must pass to merge PR
- E2E tests: Run in parallel with build, currently non-blocking (`continue-on-error: true`)
- E2E uses `xvfb-run` for headless execution on Linux
