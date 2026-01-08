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

1. Open the extension folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Test your changes manually

## Pull Request Guidelines

- Describe what your PR does
- Reference any related issues
- Keep changes focused
- Update documentation if needed

## Questions?

Feel free to open an issue for discussion.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
