# nullvariant-vscode-extensions

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge)](https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/11709/badge)](https://www.bestpractices.dev/projects/11709)

VS Code extensions by [Null;Variant](https://github.com/nullvariant).

## Extensions

### Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Switch between multiple Git identities with one click. Manage multiple GitHub accounts, SSH keys, GPG signing, and <b>automatically apply identity to Git Submodules</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Languages: <b>🇺🇸</b> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/ja/README.md">🇯🇵</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/zh-CN/README.md">🇨🇳</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/zh-TW/README.md">🇹🇼</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/ko/README.md">🇰🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/de/README.md">🇩🇪</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/fr/README.md">🇫🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/es/README.md">🇪🇸</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/pt-BR/README.md">🇧🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/it/README.md">🇮🇹</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/ru/README.md">🇷🇺</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/pl/README.md">🇵🇱</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/tr/README.md">🇹🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/cs/README.md">🇨🇿</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/hu/README.md">🇭🇺</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/bg/README.md">🇧🇬</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/uk/README.md">🇺🇦</a> ... <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/LANGUAGES.md">+8 more</a>
      <br><br>
      <a href="extensions/git-id-switcher/#readme">📖 Documentation</a> | <a href="extensions/git-id-switcher/docs/CONTRIBUTING.md">🤝 Contributing</a> | <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher">📦 Marketplace</a> | <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher">📦 Open VSX</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo.png" width="600" alt="Git ID Switcher Demo">

## Development

### Prerequisites

- Node.js 20+

### Working on an extension

```bash
cd extensions/git-id-switcher

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

### Git Hooks Setup

This repository uses custom git hooks for release safety. After cloning, run:

```bash
git config core.hooksPath .githooks
```

This enables the pre-push hook that prevents pushing version bumps without release tags.

## Repository Structure

```
nullvariant-vscode-extensions/
├── extensions/
│   └── git-id-switcher/
├── .github/workflows/
│   ├── ci.yml
│   └── publish.yml
├── .githooks/
│   └── pre-push
├── LICENSE
└── README.md
```

## Publishing

Extensions are automatically published when a tag is pushed:

```bash
git tag git-id-switcher-v0.1.0
git push origin git-id-switcher-v0.1.0
```

## License

MIT
