# Git ID Switcher

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher)](https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Switch between multiple Git identities with one click. Automatically configures Git author, SSH keys, and GPG signing.

![Demo](https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-identity-switcher/docs/demo.png)

## Features

- **One-Click Identity Switch**: Change Git user.name and user.email instantly
- **SSH Key Management**: Automatically switch SSH keys in ssh-agent (optional)
- **GPG Signing Support**: Configure GPG key for commit signing (optional)
- **Submodule Support**: Automatically propagate identity to Git submodules
- **Status Bar Integration**: Always see your current identity at a glance
- **Rich Tooltips**: Detailed identity info with description and SSH host
- **Cross-Platform**: Works on macOS, Linux, and Windows

## Quick Start (Minimal Setup)

The simplest setup only requires `id`, `name`, and `email`. No SSH or GPG configuration needed.

### Step 1: Add to settings.json

Open VS Code Settings (`Cmd+,` / `Ctrl+,`) → search "Git ID Switcher" → click "Edit in settings.json", or directly add:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Your Name",
      "email": "you@personal.com"
    },
    {
      "id": "work",
      "name": "Your Name",
      "email": "you@company.com"
    }
  ]
}
```

### Step 2: Use It

1. Click the identity icon in the status bar (bottom right)
2. Select an identity
3. Done! Git config is now switched.

This basic setup changes `git config user.name` and `user.email` - that's it.

---

## Optional: Add Visual Identity

Make identities easier to recognize with icons and descriptions:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Your Name",
      "email": "you@personal.com",
      "description": "Personal projects"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Your Name",
      "email": "you@company.com",
      "description": "Work account"
    }
  ]
}
```

- `icon`: Emoji shown in status bar
- `description`: Shown in picker and tooltip

---

## Optional: SSH Key Switching

If you have multiple GitHub/GitLab accounts with different SSH keys:

### Step 1: Configure SSH Host Aliases

Edit `~/.ssh/config`:

```ssh-config
# Personal GitHub account (default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Work GitHub account
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Step 2: Add SSH Config to Identity

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Your Name",
      "email": "you@personal.com",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "name": "Your Name",
      "email": "you@company.com",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ]
}
```

- `sshKeyPath`: Path to your SSH private key (added to ssh-agent on switch)
- `sshHost`: SSH config Host alias (shown in tooltip, helps you remember which host to use)

### Using SSH Host Aliases

When cloning repos for an identity with `sshHost`:

```bash
# For work identity (uses github-work alias)
git clone git@github-work:company/repo.git

# For personal identity (uses default github.com)
git clone git@github.com:you/repo.git
```

---

## Optional: GPG Signing

If you sign commits with GPG:

### Step 1: Find Your GPG Key ID

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Output example:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Your Name <you@example.com>
```

The key ID is `ABCD1234`.

### Step 2: Add GPG Key to Identity

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Your Name",
      "email": "you@personal.com",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

When you switch to this identity, the extension sets:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Full Example: 7 Accounts with SSH + GPG

Here's a complete example combining everything:

### SSH Config (`~/.ssh/config`)

```ssh-config
# Main account (default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_main
    IdentitiesOnly yes

# Work account
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Open source persona
Host github-oss
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Extension Settings

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "main",
      "icon": "👤",
      "name": "Real Name",
      "email": "realname@gmail.com",
      "description": "Main identity",
      "sshKeyPath": "~/.ssh/id_ed25519_main",
      "gpgKeyId": "456B8973"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Real Name",
      "email": "realname@company.com",
      "description": "Work account",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "oss",
      "icon": "🌟",
      "name": "OSS Handle",
      "email": "oss@example.com",
      "description": "Open source contributions",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "github-oss"
    },
    {
      "id": "client-a",
      "icon": "🏢",
      "name": "Your Name",
      "email": "contractor@client-a.com",
      "description": "Client A project"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "main",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Note: The last identity (`client-a`) has no SSH or GPG - it only switches Git config.

---

## Configuration Reference

### Identity Properties

| Property | Required | Description |
|----------|----------|-------------|
| `id` | ✅ | Unique identifier (e.g., `"work"`, `"personal"`) |
| `name` | ✅ | Git user.name - shown in commits |
| `email` | ✅ | Git user.email - shown in commits |
| `icon` | | Emoji shown in status bar (e.g., `"💼"`) |
| `description` | | Short description shown in picker and tooltip |
| `sshKeyPath` | | Path to SSH private key (e.g., `"~/.ssh/id_ed25519_work"`) |
| `sshHost` | | SSH config Host alias (e.g., `"github-work"`) |
| `gpgKeyId` | | GPG key ID for commit signing |

### Global Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `gitIdSwitcher.identities` | `[]` | List of identity configurations |
| `gitIdSwitcher.defaultIdentity` | `""` | ID of default identity to use |
| `gitIdSwitcher.autoSwitchSshKey` | `true` | Auto-switch SSH key when changing identities |
| `gitIdSwitcher.showNotifications` | `true` | Show notification on identity switch |
| `gitIdSwitcher.applyToSubmodules` | `true` | Propagate identity to Git submodules |
| `gitIdSwitcher.submoduleDepth` | `1` | Max depth for nested submodule config (1-5) |

---

## How It Works

When you switch identities, the extension does (in order):

1. **Git Config** (always): Sets `git config --local user.name` and `user.email`
2. **SSH Key** (if `sshKeyPath` set): Removes other keys from ssh-agent, adds the selected one
3. **GPG Key** (if `gpgKeyId` set): Sets `git config --local user.signingkey` and enables signing
4. **Submodules** (if enabled): Propagates config to all submodules

---

## Troubleshooting

### SSH key not switching?

1. Ensure `ssh-agent` is running:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Check key path is correct:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. On macOS, add to Keychain once:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Wrong identity on push?

1. Check remote URL uses correct host alias:

   ```bash
   git remote -v
   # Should show git@github-work:... for work repos
   ```

2. Update if needed:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG signing not working?

1. Find your GPG key ID:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Test signing:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Make sure the email in your identity matches the GPG key's email.

### Identity not detected?

- Make sure you're in a Git repository
- Check `settings.json` for syntax errors
- Reload VS Code window (`Cmd+Shift+P` → "Reload Window")

---

## Commands

| Command | Description |
|---------|-------------|
| `Git ID: Select Identity` | Open the identity picker |
| `Git ID: Show Current Identity` | Display current identity info |

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT License - see [LICENSE](../../LICENSE).

## Credits

Created by [Null;Variant](https://github.com/nullvariant)
