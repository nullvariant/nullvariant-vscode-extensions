# nullvariant-vscode-extensions

VS Code extensions by [Null;Variant](https://github.com/nullvariant).

## Extensions

| Extension | Description | Version |
|-----------|-------------|---------|
| [git-id-switcher](extensions/git-identity-switcher/) | Switch between multiple Git identities with one click | [![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher)](https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher) |

## Development

### Prerequisites

- Node.js 20+

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
│   └── git-identity-switcher/
├── .github/workflows/
│   ├── ci.yml
│   └── publish.yml
├── LICENSE
└── README.md
```

## Publishing

Extensions are automatically published when a tag is pushed:

```bash
git tag git-identity-switcher-v0.1.0
git push origin git-identity-switcher-v0.1.0
```

## License

MIT
