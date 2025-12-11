# nullvariant-vscode-extensions

VS Code extensions monorepo by [Null;Variant](https://github.com/nullvariant).

## Extensions

| Extension | Description | Version |
|-----------|-------------|---------|
| [git-identity-switcher](extensions/git-identity-switcher/) | Switch between multiple Git identities with one click | [![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-identity-switcher)](https://marketplace.visualstudio.com/items?itemName=nullvariant.git-identity-switcher) |

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/nullvariant/nullvariant-vscode-extensions.git
cd nullvariant-vscode-extensions

# Install dependencies
npm install

# Build all extensions
npm run build
```

### Working on an extension

```bash
cd extensions/git-identity-switcher

# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Package as VSIX
npm run package
```

### Testing locally

1. Open the extension folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Test the extension in the new window

## Repository Structure

```
nullvariant-vscode-extensions/
├── extensions/
│   └── git-identity-switcher/     # Git identity switching extension
├── packages/                       # Shared packages (future)
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI for PRs and main branch
│       └── publish.yml            # Auto-publish on tag
├── package.json                   # Workspace root
├── tsconfig.base.json             # Shared TypeScript config
├── LICENSE                        # MIT License
└── README.md                      # This file
```

## Publishing

Extensions are automatically published when a tag is pushed:

```bash
# Tag format: {extension-name}-v{version}
git tag git-identity-switcher-v0.1.0
git push origin git-identity-switcher-v0.1.0
```

This triggers:
1. Build and package the extension
2. Create a GitHub Release with VSIX
3. Optionally publish to VS Code Marketplace (requires `VSCE_PAT` secret)
4. Optionally publish to Open VSX (requires `OVSX_PAT` secret)

## License

MIT License - see [LICENSE](LICENSE) for details.
