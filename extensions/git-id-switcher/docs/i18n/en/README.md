# Git ID Switcher

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
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/attestations"><img src="https://img.shields.io/badge/SLSA-Level_3-green" alt="SLSA 3"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml/badge.svg" alt="Security"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/%20-Win%20%7C%20Mac%20%7C%20Linux-blue?labelColor=555&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMSAySDNjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoN3YySDh2Mmg4di0yaC0ydi0yaDdjMS4xIDAgMi0uOSAyLTJWNGMwLTEuMS0uOS0yLTItMnptMCAxNEgzVjRoMTh2MTJ6Ii8+PC9zdmc+" alt="Platform"></a>
      <a href="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions"><img src="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions/graph/badge.svg" alt="codecov"></a>
      <a href="https://sonarcloud.io/summary/new_code?id=nullvariant_nullvariant-vscode-extensions"><img src="https://sonarcloud.io/api/project_badges/measure?project=nullvariant_nullvariant-vscode-extensions&metric=alert_status" alt="Quality Gate Status"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <b>🇺🇸</b> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/en/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Why Git ID Switcher?

While many Git identity switchers exist, **Git ID Switcher** solves the complex problems that others overlook:

1. **Submodule Nightmare**: When working with repositories that have submodules (e.g., Hugo themes, vendored libraries), you normally need to manually set `git config user.name` for _each_ submodule. This extension elegantly solves this by recursively applying your identity to all active submodules.
2. **SSH & GPG Handling**: It doesn't just change your name; it swaps SSH keys in ssh-agent and configures GPG signing, preventing commits with the wrong signature.

## Features

- **Identity Management UI**: Add, edit, delete, and reorder identities without editing settings.json
- **One-Click Identity Switch**: Instantly change Git user.name and user.email
- **Status Bar Integration**: Always see your current identity at a glance
- **Submodule Support**: Automatically propagate identity to Git submodules
- **SSH Key Management**: Automatically switch SSH keys in ssh-agent
- **GPG Signing Support**: Configure GPG key for commit signing (optional)
- **Rich Tooltips**: Detailed identity info including description and SSH host
- **Cross-Platform**: Works on macOS, Linux, and Windows
- **Multilingual**: Supports 17 languages

## 🌏 A Note on Multilingual Support

> **I value the existence of minorities.**
> I don't want to discard them just because they are small in number.
> Even if translations aren't perfect, I hope you can feel our intent to understand and show respect for minority languages.

This extension supports all 17 languages that VS Code supports. Additionally, for README documentation, we're challenging ourselves to translate into minority languages and even joke languages.

This isn't just "global support" — it's "respect for linguistic diversity." And I'd be happy if this becomes infrastructure where commits that make the world better come from developers living everywhere, transcending language barriers.

---

## Quick Start

A typical setup for switching between personal and company-issued accounts (Enterprise Managed User).

### Step 1: Prepare SSH Keys

First, create SSH keys for each account (skip if you already have them):

```bash
# Personal
ssh-keygen -t ed25519 -C "alex@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Work
ssh-keygen -t ed25519 -C "alex.smith@company.example.com" -f ~/.ssh/id_ed25519_work
```

Register the **public key** (`.pub` file) of each SSH key to the respective GitHub account.

> **Note**: Register `id_ed25519_personal.pub` (public key) to GitHub. `id_ed25519_personal` (without extension) is the private key — never share it with anyone or upload it anywhere.

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

Sample identities are provided right after installation.
Follow the guide below to edit them for your own use.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/en/first-ux.webp" width="600" alt="Initial setup steps: Open identity management from status bar, then edit and create identities" loading="lazy">

> **Key files are not sent**: When setting SSH key paths, only the file path (location) is recorded. The contents of the key file are never uploaded or sent externally.

> **If using GPG signing**: You can also set `gpgKeyId` in the identity edit screen.
> See "[Troubleshooting](#gpg-signing-not-working)" for how to find your GPG key ID.

> **Hint**: You can also configure directly from settings.json.
> Open extension settings (`Cmd+,` / `Ctrl+,`) → search "Git ID Switcher" → click "Edit in settings.json".
> See "[Full Example](#full-example-4-accounts-with-ssh--gpg)" for JSON configuration examples.

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
      "service": "GitHub",
      "email": "alex@personal.example.com",
      "description": "Personal projects",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Smith",
      "service": "GitHub Work",
      "email": "alex.smith@company.example.com",
      "description": "Work development",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "Alex Smith",
      "service": "Bitbucket",
      "email": "alex@bitbucket.example.com",
      "description": "Bitbucket projects",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Smith",
      "service": "GitLab",
      "email": "alex@freelance.example.com",
      "description": "Freelance projects"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Note: The last identity (`freelance`) has no SSH. Git config-only switching is also possible, such as when using different committer info with the same GitHub account.

---

## Identity Management

Click the status bar → select "Manage Profiles" at the bottom of the list to open the management screen.
You can add, edit, delete, and reorder identities directly from the UI.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/en/profile-management.webp" width="600" alt="Identity Management: Guide for delete and reorder operations" loading="lazy">

You can also delete an identity from the command palette using `Git ID Switcher: Delete Identity`.

---

## Commands

| Command                                  | Description                   |
| ---------------------------------------- | ----------------------------- |
| `Git ID Switcher: Select Identity`       | Open the identity picker      |
| `Git ID Switcher: Delete Identity`       | Delete an identity            |
| `Git ID Switcher: Show Current Identity` | Display current identity info |
| `Git ID Switcher: Show Documentation`    | Show documentation            |

---

## Configuration Reference

### Identity Properties

| Property      | Required | Description                                                      |
| ------------- | -------- | ---------------------------------------------------------------- |
| `id`          | ✅       | Unique identifier (e.g., `"personal"`, `"work"`)                 |
| `name`        | ✅       | Git user.name — shown in commits                                 |
| `email`       | ✅       | Git user.email — shown in commits                                |
| `icon`        |          | Emoji shown in status bar (e.g., `"🏠"`). Single emoji only      |
| `service`     |          | Service name (e.g., `"GitHub"`, `"GitLab"`). Used for UI display |
| `description` |          | Short description shown in picker and tooltip                    |
| `sshKeyPath`  |          | Path to SSH private key (e.g., `"~/.ssh/id_ed25519_work"`)       |
| `sshHost`     |          | SSH config Host alias (e.g., `"github-work"`)                    |
| `gpgKeyId`    |          | GPG key ID for commit signing                                    |

#### Display Limitations

- **Status bar**: Text exceeding ~25 characters will be truncated with `...`
- **`icon`**: Only a single emoji (grapheme cluster) is allowed. Multiple emojis or long strings are not supported

### Global Settings

| Setting                                    | Default    | Description                                                                                    |
| ------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | See sample | List of identity configurations                                                                |
| `gitIdSwitcher.defaultIdentity`            | See sample | ID of the default identity to use                                                              |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | Auto-switch SSH key when changing identities                                                   |
| `gitIdSwitcher.showNotifications`          | `true`     | Show notification on identity switch                                                           |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | Propagate identity to Git submodules                                                           |
| `gitIdSwitcher.submoduleDepth`             | `1`        | Max depth for nested submodule configuration (1-5)                                             |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | Include icon emoji in Git config `user.name`                                                   |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | Save audit logs to file (records identity switches, SSH key operations, etc.)                  |
| `gitIdSwitcher.logging.filePath`           | `""`       | Log file path (e.g., `~/.git-id-switcher/security.log`). Empty string uses default path        |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | Max file size before rotation (bytes, 1MB-100MB)                                               |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | Max number of rotated log files to keep (1-20)                                                 |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | When enabled, masks all values in logs (maximum privacy mode)                                  |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | Log verbosity (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Records selected level and above |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | Custom timeout per command (ms, 1sec-5min). E.g., `{"git": 15000, "ssh-add": 10000}`           |

#### About `includeIconInGitConfig`

Controls behavior when the `icon` field is set:

| Value             | Behavior                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| `false` (default) | `icon` is shown in editor UI only. Only `name` is written to Git config |
| `true`            | `icon + name` is written to Git config. Emoji appears in commit history |

Example: `icon: "👤"`, `name: "Alex Smith"`

| includeIconInGitConfig | Git config `user.name` | Commit signature        |
| ---------------------- | ---------------------- | ----------------------- |
| `false`                | `Alex Smith`           | `Alex Smith <email>`    |
| `true`                 | `👤 Alex Smith`        | `👤 Alex Smith <email>` |

---

## How It Works

### Git Config Layer Structure

Git configuration has three layers, where lower layers are overridden by higher ones:

```text
System (/etc/gitconfig)
    ↓ overridden by
Global (~/.gitconfig)
    ↓ overridden by
Local (.git/config)  ← highest priority
```

**Git ID Switcher writes to `--local` (repository-local).**

This means:

- Identities are saved to each repository's `.git/config`
- Different identities can be maintained per repository
- Global settings (`~/.gitconfig`) are not modified

### What Happens When Switching Identities

When you switch identities, the extension does the following (in order):

1. **Git Config** (always): Sets `git config --local user.name` and `user.email`
2. **SSH Key** (if `sshKeyPath` set): Removes other keys from ssh-agent and adds the selected key
3. **GPG Key** (if `gpgKeyId` set): Sets `git config --local user.signingkey` and enables signing
4. **Submodules** (if enabled): Propagates settings to all submodules (default: depth 1)

### How Submodule Propagation Works

Local settings are per-repository, so they don't automatically apply to submodules.
That's why this extension provides submodule propagation (see "Advanced: Submodule Support" for details).

### SSH Key Management Details

Git ID Switcher manages SSH keys through `ssh-agent`:

| Operation  | Command                |
| ---------- | ---------------------- |
| Add key    | `ssh-add <keyPath>`    |
| Remove key | `ssh-add -d <keyPath>` |
| List keys  | `ssh-add -l`           |

**Important:** This extension does **NOT** modify `~/.ssh/config`. SSH config setup must be done manually (see Step 2 in "Quick Start").

### Interaction with Existing SSH Configuration

If you already have SSH configuration, Git ID Switcher works alongside it:

| Your Setup                             | Git ID Switcher Behavior                                        |
| -------------------------------------- | --------------------------------------------------------------- |
| `~/.ssh/config` with `IdentityFile`    | Both can be used; use `IdentitiesOnly yes` to prevent conflicts |
| `GIT_SSH_COMMAND` environment variable | Uses your custom SSH command; ssh-agent still works             |
| `git config core.sshCommand`           | Same as above                                                   |
| direnv with SSH-related env vars       | Works alongside; ssh-agent operates independently               |

**Recommended:** Always use `IdentitiesOnly yes` in your SSH config. This prevents SSH from trying multiple keys.

### Why `IdentitiesOnly yes`?

Without this setting, SSH may try keys in this order:

1. Keys loaded in ssh-agent (managed by Git ID Switcher)
2. Keys specified in `~/.ssh/config`
3. Default keys (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, etc.)

This can cause authentication failures or unintended key usage.

With `IdentitiesOnly yes`, SSH uses **only the specified key**. This ensures the key configured in Git ID Switcher is used reliably.

```ssh-config
# Recommended configuration
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← This line is important
```

With this configuration, connections to the `github-work` host will only use `~/.ssh/id_ed25519_work`, and no other keys will be tried.

---

## Advanced: Submodule Support

For complex repositories using Git Submodules, identity management is often troublesome. When you commit in a submodule, Git uses that submodule's local config, which may default to your global config (wrong email!) if not explicitly set.

**Git ID Switcher** automatically detects submodules and applies the selected identity.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Enable/disable this feature
- `submoduleDepth`: How deep to apply?
  - `1`: Direct submodules only (most common)
  - `2+`: Nested submodules (submodules within submodules)

This ensures your identity is always correct, whether you commit in the main repo or a vendored library.

---

## Troubleshooting

### SSH key not switching?

1. Ensure `ssh-agent` is running:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Check the key path is correct:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. On macOS, add to Keychain once:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Wrong identity on push?

**For new clones:**

When cloning work repositories, use the host alias configured in SSH config:

```bash
# Work (using github-work alias)
git clone git@github-work:company/repo.git

# Personal (using default github.com)
git clone git@github.com:yourname/repo.git
```

**For existing repositories:**

1. Check if the remote URL uses the correct host alias:

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

3. Make sure the email in your identity matches the GPG key's email

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

### Default values (identities, etc.) empty?

If sample settings don't appear even after a fresh install, **Settings Sync** may be the cause.

If you previously saved empty settings, they may have synced to the cloud and are overwriting the default values on new installations.

**Solution:**

1. Find the setting in the settings UI
2. Click the gear icon → "Reset Setting"
3. Sync with Settings Sync (this removes the old settings from the cloud)

---

## Design Philosophy

> **"Who am I?"** — The only question this extension answers

Built on **Karesansui Architecture**: a simple core (100 lines),
surrounded by deliberate quality (90% coverage, logging, timeouts)
and intentional constraints (no GitHub API, no token management).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Read the full philosophy](../../DESIGN_PHILOSOPHY.md)

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT License — see [LICENSE](../../../LICENSE).

## Credits

Created by [Null;Variant](https://github.com/nullvariant)
