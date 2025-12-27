# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/git-id-switcher/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Switch between multiple Git identities with one click. Manage multiple GitHub accounts, SSH keys, GPG signing, and <b>automatically apply identity to Git Submodules</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Languages: <b>🇺🇸</b> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/ja/README.md">🇯🇵</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/zh-CN/README.md">🇨🇳</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/zh-TW/README.md">🇹🇼</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/ko/README.md">🇰🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/de/README.md">🇩🇪</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/fr/README.md">🇫🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/es/README.md">🇪🇸</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/pt-BR/README.md">🇧🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/it/README.md">🇮🇹</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/ru/README.md">🇷🇺</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/pl/README.md">🇵🇱</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/tr/README.md">🇹🇷</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/cs/README.md">🇨🇿</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/hu/README.md">🇭🇺</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/bg/README.md">🇧🇬</a> <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/i18n/uk/README.md">🇺🇦</a> ... <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher/docs/LANGUAGES.md">+8 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/git-id-switcher/demo.png" width="600" alt="Demo">

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

A typical setup for managing personal and work (Enterprise Managed User) accounts.

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

Open extension settings (`Cmd+,` / `Ctrl+,`) → search "Git ID Switcher" → click "Edit in settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Smith",
      "email": "alex@personal.example.com",
      "service": "GitHub",
      "description": "Personal projects",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Smith",
      "email": "alex.smith@company.example.com",
      "service": "GitHub Work",
      "description": "Work account (company-issued Enterprise Managed User)",
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
      "service": "GitHub",
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

# Work account (company-issued Enterprise Managed User)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Bitbucket account
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
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
      "service": "GitHub",
      "description": "Personal projects",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Smith",
      "email": "alex.smith@company.example.com",
      "service": "GitHub Work",
      "description": "Work account (company-issued Enterprise Managed User)",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "asmith-bb",
      "email": "asmith.bb@example.com",
      "service": "Bitbucket",
      "description": "Bitbucket projects",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Smith",
      "email": "alex@freelance.example.com",
      "service": "GitLab",
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
| `icon`        |          | Emoji shown in status bar (single emoji only)              |
| `service`     |          | Service name (e.g., `"GitHub"`, `"GitLab"`). Used for UI display |
| `description` |          | Short description shown in picker and tooltip              |
| `sshKeyPath`  |          | Path to SSH private key (e.g., `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |          | SSH config Host alias (e.g., `"github-work"`)              |
| `gpgKeyId`    |          | GPG key ID for commit signing                              |

#### Display Limitations

- **Status bar**: Text exceeding ~25 characters will be truncated with `...`
- **`icon`**: Only a single emoji (grapheme cluster) is allowed. Multiple emojis or long strings are not supported

### Global Settings

| Setting                              | Default    | Description                                              |
| ------------------------------------ | ---------- | -------------------------------------------------------- |
| `gitIdSwitcher.identities`           | See sample | List of identity configurations                          |
| `gitIdSwitcher.defaultIdentity`      | See sample | ID of default identity to use                            |
| `gitIdSwitcher.autoSwitchSshKey`     | `true`     | Auto-switch SSH key when changing identities             |
| `gitIdSwitcher.showNotifications`    | `true`     | Show notification on identity switch                     |
| `gitIdSwitcher.applyToSubmodules`    | `true`     | Propagate identity to Git submodules                     |
| `gitIdSwitcher.submoduleDepth`       | `1`        | Max depth for nested submodule config (1-5)              |
| `gitIdSwitcher.includeIconInGitConfig` | `false`  | Include icon emoji in Git config `user.name`             |

#### About `includeIconInGitConfig`

Controls behavior when `icon` field is set:

| Value | Behavior |
|-------|----------|
| `false` (default) | `icon` is shown in editor UI only. Only `name` is written to Git config |
| `true` | `icon + name` is written to Git config. Emoji appears in commit history |

Example: `icon: "👤"`, `name: "Alex Smith"`

| includeIconInGitConfig | Git config `user.name` | Commit signature |
|------------------------|------------------------|------------------|
| `false` | `Alex Smith` | `Alex Smith <email>` |
| `true` | `👤 Alex Smith` | `👤 Alex Smith <email>` |

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

### Git Config Layer Structure

Git configuration has three layers, where lower layers override higher ones:

```text
System (/etc/gitconfig)
    ↓ overrides
Global (~/.gitconfig)
    ↓ overrides
Local (.git/config)  ← highest priority
```

**Git ID Switcher writes to `--local` (repository-local).**

This means:

- Identity is saved to each repository's `.git/config`
- Different identities can be maintained per repository
- Global settings (`~/.gitconfig`) are not modified

### When Switching Identities

When you switch identities, the extension does (in order):

1. **Git Config** (always): Sets `git config --local user.name` and `user.email`
2. **SSH Key** (if `sshKeyPath` set): Removes other keys from ssh-agent, adds the selected one
3. **GPG Key** (if `gpgKeyId` set): Sets `git config --local user.signingkey` and enables signing
4. **Submodules** (if enabled): Propagates config to all submodules (default: depth 1)

### How Submodule Propagation Works

Local settings are per-repository, so they don't automatically apply to submodules.
That's why this extension provides submodule propagation (see "Advanced: Submodule Support" for details).

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

### Error with `name` field?

The following characters in the `name` field will cause an error:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Use the `service` field if you want to include service information.

```jsonc
// NG
"name": "Alex Smith (Personal)"

// OK
"name": "Alex Smith",
"service": "GitHub"
```

### New settings not showing?

After updating the extension, new settings may not appear in the settings UI.

**Solution:** Restart your machine completely.

VS Code-based editors cache the settings schema in memory, and "Reload Window" or reinstalling the extension may not be enough to refresh it.

### Default values empty?

If sample settings don't appear even after a fresh install, **Settings Sync** may be the cause.

If you previously saved empty settings, they may have synced to the cloud and are overwriting the default values on new installations.

**Solution:**

1. Find the setting in the settings UI
2. Click the gear icon → "Reset Setting"
3. Sync with Settings Sync (this removes the old settings from the cloud)

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
