# Git ID Switcher

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher)](https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Switch between multiple Git identities with one click. Automatically configures Git author, SSH keys, and GPG signing.

![Demo](https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-identity-switcher/docs/demo.gif)

## Features

- **One-Click Identity Switch**: Change Git user.name and user.email instantly
- **SSH Key Management**: Automatically switch SSH keys in ssh-agent
- **GPG Signing Support**: Configure GPG key for commit signing
- **Status Bar Integration**: Always see your current identity at a glance
- **Cross-Platform**: Works on macOS, Linux, and Windows

## Why Use This?

If you work with multiple Git accounts (work, personal, open source), you know the pain of:

- Committing with the wrong email
- SSH key conflicts when pushing
- Manually running `git config` commands

This extension solves all of that with a single click.

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P`
3. Type `ext install nullvariant.git-id-switcher`
4. Press Enter

### From VSIX File

1. Download the `.vsix` file from [Releases](https://github.com/nullvariant/nullvariant-vscode-extensions/releases)
2. In VS Code, press `Ctrl+Shift+P` / `Cmd+Shift+P`
3. Type "Install from VSIX"
4. Select the downloaded file

## Configuration

Add your identities to VS Code settings (`settings.json`):

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Your Name",
      "email": "personal@example.com",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Your Name",
      "email": "yourname@company.com",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

### Identity Properties

| Property | Required | Description |
|----------|----------|-------------|
| `id` | ✅ | Unique identifier for the identity |
| `name` | ✅ | Git user.name |
| `email` | ✅ | Git user.email |
| `icon` | | Emoji/icon shown in status bar |
| `sshKeyPath` | | Path to SSH private key |
| `gpgKeyId` | | GPG key ID for commit signing |

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `gitIdSwitcher.autoSwitchSshKey` | `true` | Auto-switch SSH key when changing identities |
| `gitIdSwitcher.showNotifications` | `true` | Show notifications on identity switch |
| `gitIdSwitcher.defaultIdentity` | `""` | Default identity ID to use |

## Usage

### Switch Identity

1. Click the identity icon in the status bar (bottom right)
2. Select an identity from the quick pick menu
3. Done! Your Git config and SSH key are now updated.

### Commands

- `Git ID: Select Identity` - Open the identity picker
- `Git ID: Show Current Identity` - Display current identity info

## How It Works

When you switch identities, the extension:

1. Sets `git config --local user.name` and `user.email` in the current repository
2. If configured, removes other identity SSH keys from ssh-agent and adds the selected one
3. If configured, sets `git config --local user.signingkey` for GPG signing

## SSH Key Management

The extension uses `ssh-add` to manage SSH keys:

- **macOS**: Uses `--apple-use-keychain` for Keychain integration
- **Linux/Windows**: Standard ssh-agent

Make sure your ssh-agent is running before using this feature.

## Troubleshooting

### SSH key not switching?

- Ensure `ssh-agent` is running
- Check that the key path is correct
- On macOS, run `ssh-add --apple-use-keychain ~/.ssh/your_key` once to add to Keychain

### Identity not detected?

- Make sure you're in a Git repository
- Check your `settings.json` for syntax errors

### GPG signing not working?

- Ensure `gpg` is installed and configured
- Run `gpg --list-secret-keys` to verify your key ID

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Credits

Created by [Null;Variant](https://github.com/nullvariant)
