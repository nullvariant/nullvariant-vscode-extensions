# nullvariant-vscode-extensions

VS Code extensions by [Null;Variant](https://github.com/nullvariant).

## Extensions

| | |
|:---:|:---|
| <img src="extensions/git-identity-switcher/images/icon.png" width="128" alt="Git ID Switcher"> | **Git ID Switcher**<br><br>Switch between multiple Git identities with one click. Automatically configures Git author, SSH keys, and GPG signing.<br><br>[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher)](https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher)<br><br>[📖 Documentation](extensions/git-identity-switcher/) \| [📦 Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher) |

![Git ID Switcher Demo](extensions/git-identity-switcher/docs/demo.png)

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
