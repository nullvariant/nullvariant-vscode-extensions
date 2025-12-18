# Git ID Switcher

<table>
  <tr>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Switch between multiple Git identities with one click. Manage multiple GitHub accounts, SSH keys, GPG signing, and <b>automatically apply identity to Git Submodules</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Languages: <b>🇺🇸</b> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/ja/README.md">🇯🇵</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/zh-CN/README.md">🇨🇳</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/zh-TW/README.md">🇹🇼</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/ko/README.md">🇰🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/de/README.md">🇩🇪</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/fr/README.md">🇫🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/es/README.md">🇪🇸</a> ... <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/LANGUAGES.md">+20 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/docs/demo.png" width="600" alt="Demo">

## Features

- **One-Click Identity Switch**: Change Git user.name and user.email instantly
- **SSH Key Management**: Automatically switch SSH keys in ssh-agent
- **GPG Signing Support**: Configure GPG key for commit signing (optional)
- **Submodule Support**: Automatically propagate identity to Git submodules
- **Status Bar Integration**: Always see your current identity at a glance
- **Rich Tooltips**: Detailed identity info with description and SSH host
- **Cross-Platform**: Works on macOS, Linux, and Windows
- **Localized**: Supports 17 languages

## 🚀 Why this extension?

While many Git identity switchers exist, **Git ID Switcher** solves the complex problems that others ignore:

1. **Submodules Nightmare**: Working with repositories that have submodules (e.g., Hugo themes, vendored libraries) usually requires setting `git config user.name` manually for *each* submodule. This extension handles it elegantly by recursively applying your identity to all active submodules.
2. **SSH & GPG handling**: It doesn't just change your name; it swaps your SSH keys in the agent and configures GPG signing so you never commit with the wrong signature.

## 🌏 A Note on Multilingual Support

> **I value the existence of minorities.**
> I don't want to discard them just because they are small in number.
> Even if translations aren't perfect, I hope you can feel our intent to understand and show respect for minority languages.

This extension supports all 17 languages that VSCode supports. Additionally, for README documentation, we're challenging ourselves to translate into minority languages and even joke languages.

This isn't just "global support" - it's "respect for linguistic diversity." And I'd be happy if this becomes infrastructure where commits that make the world better come from developers living everywhere, transcending language barriers.

---

## Quick Start

A typical setup for managing multiple GitHub accounts.

### Step 1: Prepare SSH Keys

First, create SSH keys for each account (skip if you already have them):

```bash
# Personal
ssh-keygen -t ed25519 -C "alex@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Work
ssh-keygen -t ed25519 -C "alex.smith@company.example.com" -f ~/.ssh/id_ed25519_work
```

Register the **public key** (`.pub` file) of each key to the respective GitHub account.

> **Note**: Register `id_ed25519_personal.pub` (public key) to GitHub. `id_ed25519_personal` (without extension) is the private key - never share it with anyone or upload it anywhere.

### Step 2: Configure SSH

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

### Step 3: Configure the Extension

Open VS Code Settings (`Cmd+,` / `Ctrl+,`) → search "Git ID Switcher" → click "Edit in settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Smith",
      "email": "alex@personal.example.com",
      "description": "Personal projects",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Smith",
      "email": "alex.smith@company.example.com",
      "description": "Work account",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Step 4: Use It

1. Click the identity icon in the status bar (bottom right)
2. Select an identity
3. Done! Git config and SSH key are now switched.

### Using SSH Host Aliases

When cloning repos, use the host that corresponds to your identity:

```bash
# For work identity (uses github-work alias)
git clone git@github-work:company/repo.git

# For personal identity (uses default github.com)
git clone git@github.com:asmith/repo.git
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
uid         [ultimate] Alex Smith <alex@personal.example.com>
```

The key ID is `ABCD1234`.

### Step 2: Add GPG Key to Identity

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Smith",
      "email": "alex@personal.example.com",
      "description": "Personal projects",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

When you switch to this identity, the extension sets:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Full Example: 4 Accounts with SSH + GPG

Here's a complete example combining everything:

### SSH Config (`~/.ssh/config`)

```ssh-config
# Personal account (default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
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
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Smith",
      "email": "alex@personal.example.com",
      "description": "Personal projects",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Smith",
      "email": "alex.smith@company.example.com",
      "description": "Work account",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "oss",
      "icon": "🌟",
      "name": "asmith-oss",
      "email": "asmith.oss@example.com",
      "description": "Open source contributions",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "github-oss"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Smith",
      "email": "alex@freelance.example.com",
      "description": "Freelance projects"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Note: The last identity (`freelance`) has no SSH - it only switches Git config. This is useful when using different committer info with the same GitHub account.

---

## Configuration Reference

### Identity Properties

| Property      | Required | Description                                                |
| ------------- | -------- | ---------------------------------------------------------- |
| `id`          | ✅        | Unique identifier (e.g., `"work"`, `"personal"`)           |
| `name`        | ✅        | Git user.name - shown in commits                           |
| `email`       | ✅        | Git user.email - shown in commits                          |
| `icon`        |          | Emoji shown in status bar (e.g., `"💼"`)                    |
| `description` |          | Short description shown in picker and tooltip              |
| `sshKeyPath`  |          | Path to SSH private key (e.g., `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |          | SSH config Host alias (e.g., `"github-work"`)              |
| `gpgKeyId`    |          | GPG key ID for commit signing                              |

### Global Settings

| Setting                           | Default    | Description                                  |
| --------------------------------- | ---------- | -------------------------------------------- |
| `gitIdSwitcher.identities`        | See sample | List of identity configurations              |
| `gitIdSwitcher.defaultIdentity`   | See sample | ID of default identity to use                |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`     | Auto-switch SSH key when changing identities |
| `gitIdSwitcher.showNotifications` | `true`     | Show notification on identity switch         |
| `gitIdSwitcher.applyToSubmodules` | `true`     | Propagate identity to Git submodules         |
| `gitIdSwitcher.submoduleDepth`    | `1`        | Max depth for nested submodule config (1-5)  |

### Note: Basic Setup (No SSH)

If you don't need SSH key switching (e.g., using different committer info with a single GitHub account), you can use a minimal configuration:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Smith",
      "email": "alex@personal.example.com",
      "description": "Personal projects"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Smith",
      "email": "alex.smith@company.example.com",
      "description": "Work account"
    }
  ]
}
```

This setup only switches `git config user.name` and `user.email`.

---

## How It Works

When you switch identities, the extension does (in order):

1. **Git Config** (always): Sets `git config --local user.name` and `user.email`
2. **SSH Key** (if `sshKeyPath` set): Removes other keys from ssh-agent, adds the selected one
3. **GPG Key** (if `gpgKeyId` set): Sets `git config --local user.signingkey` and enables signing
4. **Submodules** (if enabled): Propagates config to all submodules (default: depth 1)

---

## Advanced: Submodule Support

For complex repositories using Git Submodules, identity management is often a pain. If you commit in a submodule, Git uses the local config of that submodule, which might default to your global config (wrong email!) if not explicitly set.

**Git ID Switcher** automatically detects submodules and applies the selected identity to them.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Enable/disable this feature
- `submoduleDepth`: How deep to go?
  - `1`: Direct submodules only (most common)
  - `2+`: Nested submodules (submodules within submodules)

This ensures that no matter where you commit—in the main repo or a vendored library—your identity is always correct.

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

| Command                         | Description                   |
| ------------------------------- | ----------------------------- |
| `Git ID: Select Identity`       | Open the identity picker      |
| `Git ID: Show Current Identity` | Display current identity info |

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/CONTRIBUTING.md).

## License

MIT License - see [LICENSE](https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/LICENSE).

## Credits

Created by [Null;Variant](https://github.com/nullvariant)
