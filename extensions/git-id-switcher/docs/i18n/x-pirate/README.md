# Git ID Switcher 🏴‍☠️

> **Ahoy, matey!** This here be a translation fer all ye scallywags who speak the noble tongue o' the Seven Seas!

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Switch betwixt yer multiple Git profiles with a single click o' yer hook! Manage multiple GitHub accounts, SSH keys, GPG signin', an' <b>automatically apply yer profile to Git submodules</b>, arrr!
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <b>🏴‍☠️</b> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-pirate/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Why Git ID Switcher, Ye Ask?

While many Git profile switchin' tools sail the seven seas, **Git ID Switcher** solves the treacherous problems that others leave adrift:

1. **The Submodule Nightmare**: When workin' with repositories that have submodules (like Hugo themes or vendor libraries), ye usually have to set `git config user.name` manually fer _each_ submodule. This extension solves it by recursively applyin' yer profile to all active submodules in yer fleet. Elegant as a galleon, arrr!
2. **SSH & GPG Handlin'**: It don't just change yer name; it swaps yer SSH keys in ssh-agent an' configures GPG signin' so ye never commit with the wrong signature, lest ye walk the plank!

## Features

- **Profile Management UI**: Add, edit, delete, an' reorder profiles without editin' settings.json — no need to swab the deck manually!
- **One-Click Profile Switch**: Change yer Git user.name an' user.email faster than ye can say "shiver me timbers!"
- **Status Bar Integration**: Always see yer current profile at a glance from the crow's nest
- **Submodule Support**: Automatically propagate yer profile to Git submodules across yer fleet
- **SSH Key Management**: Automatically switch yer SSH keys in ssh-agent, like changin' sails in a storm
- **GPG Signin' Support**: Configure yer GPG key fer commit signin' (optional, but a true pirate always signs their plunder)
- **Rich Tooltips**: Detailed profile info with description an' SSH host
- **Cross-Platform**: Works on macOS, Linux, an' Windows — every port in the digital sea!
- **Localized**: Supports 17 languages!

## 🌏 A Note on Multilingual Support

> **I value the existence o' minorities, even pirates!**
> I don't want to discard 'em just because they be small in number.
> Even if translations ain't perfect, I hope ye can feel our intent to show respect fer all tongues!

This extension supports all 17 languages that VS Code supports. An' fer README documentation, we also challenged ourselves to translate into minority languages an' joke languages.

This ain't just "global support" — this be "respect fer linguistic diversity." An' across all languages, in every port, developers makin' the world better with commits... I want this to be that kind o' infrastructure. Fair winds to all!

---

## Quick Start, Ye Landlubber

A typical setup fer managin' yer personal account an' company account (Enterprise Managed User). The essential provisions fer any voyage!

### Step 1: Prepare Yer SSH Keys

First, forge SSH keys fer each account (if ye already have 'em, skip this):

```bash
# Personal
ssh-keygen -t ed25519 -C "morgan@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Work
ssh-keygen -t ed25519 -C "morgan@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Register yer **public keys** (`.pub` files) to each GitHub account, matey.

> **Note**: What ye register on GitHub be `id_ed25519_personal.pub` (public key). `id_ed25519_personal` (without extension) be the private key — never share or upload it! Guard it like buried treasure!

### Step 2: Configure Yer SSH

Edit `~/.ssh/config`:

```ssh-config
# Personal GitHub Account (Default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Work GitHub Account
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Step 3: Configure the Extension

After ye install, sample profiles be ready fer ye. Follow this guide to edit 'em fer yerself.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-pirate/first-ux.webp" width="600" alt="First setup steps (13): Open profile management from status bar, edit an' create new profiles" loading="lazy">

> **Yer key files be not sent anywhere**: When ye set the SSH key path, only the file path (location) be recorded. The key file contents be never uploaded or sent to external services. Safety first, matey!

> **If ye want GPG signin'**: Ye can also set `gpgKeyId` in the profile edit screen.
> Fer how to find yer GPG key ID, see "[Troubleshootin'](#gpg-signin-not-workin)".

> **Tip**: Ye can also configure directly from settings.json.
> Open extension settings (`Cmd+,` / `Ctrl+,`) → Search "Git ID Switcher" → Click "Edit in settings.json".
> Fer JSON format examples, see "[Full Example](#full-example-5-accounts-with-ssh--gpg-full-fleet)".

---

## Full Example: 5 Accounts with SSH + GPG (Full Fleet)

All the provisions combined! Here be the full example:

### SSH Config (`~/.ssh/config`)

```ssh-config
# Personal Account (Default)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Work Account (Company Enterprise Managed User)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Client A — Contract Plunder (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Client B — On-Site Voyage (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS Treasure (GitLab)
Host gitlab-oss
    HostName gitlab.com
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
      "name": "Cap'n Morgan",
      "email": "morgan@personal.example.com",
      "service": "GitHub",
      "icon": "🏴‍☠️",
      "description": "Me own treasure",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Cap'n Morgan",
      "email": "morgan@techcorp.example.com",
      "service": "GitHub Crew",
      "icon": "⚓",
      "description": "TechCorp main voyage",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Cap'n Morgan",
      "email": "morgan@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🦜",
      "description": "ClientA plunderin'",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "M.Morgan",
      "email": "m.morgan@clientb.example.com",
      "service": "Bitbucket",
      "icon": "💀",
      "description": "ClientB aboard ship",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "morgan-dev",
      "email": "morgan.dev@example.com",
      "service": "GitLab",
      "icon": "🏆",
      "description": "OSS booty fer all",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Note: The 4th profile (`client-b`) uses a shortened name, an' the 5th (`oss`) uses a dev handle. Ye can set different display names fer each profile, even fer the same scallywag.

---

## Profile Management

Click the status bar → at the bottom o' the list, click "Profile Management" to open the management screen.
Ye can add, edit, delete, an' reorder profiles all from the UI — no need to wrestle with JSON, arrr!

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-pirate/identity-management.webp" width="600" alt="Profile management: delete an' reorder operations" loading="lazy">

Ye can also delete profiles from the command palette: `Git ID Switcher: Delete Identity`.

---

## Commands

| Command                                  | What It Does                           |
| ---------------------------------------- | -------------------------------------- |
| `Git ID Switcher: Select Identity`       | Open the profile picker, ye scurvy dog |
| `Git ID Switcher: Delete Identity`       | Delete a profile                       |
| `Git ID Switcher: Show Current Identity` | Show current profile info              |
| `Git ID Switcher: Show Documentation`    | Display the ship's scrolls             |

---

## Settings Reference

### Profile Properties

| Property      | Required | Description                                                     |
| ------------- | -------- | --------------------------------------------------------------- |
| `id`          | ✅       | Unique identifier (e.g., `"personal"`, `"work"`)                |
| `name`        | ✅       | Git user.name — shows in commits                                |
| `email`       | ✅       | Git user.email — shows in commits                               |
| `icon`        |          | Emoji fer status bar (e.g., `"🏴‍☠️"`). Single emoji only!         |
| `service`     |          | Service name (e.g., `"GitHub"`, `"GitLab"`). Used in UI display |
| `description` |          | Short description fer picker an' tooltip                        |
| `sshKeyPath`  |          | Path to SSH private key (e.g., `"~/.ssh/id_ed25519_work"`)      |
| `sshHost`     |          | SSH config Host alias (e.g., `"github-work"`)                   |
| `gpgKeyId`    |          | GPG key ID fer commit signin'                                   |

#### Display Limitations

- **Status bar**: If longer than ~25 characters, it gets truncated with `...`
- **`icon`**: Single emoji (grapheme cluster) only. No multiple emojis or long strings allowed

### Global Settings

| Setting                                    | Default     | Description                                                                                    |
| ------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | See samples | List o' profiles                                                                               |
| `gitIdSwitcher.defaultIdentity`            | See samples | Default profile ID                                                                             |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`      | Automatically switch SSH keys when changin' profiles                                           |
| `gitIdSwitcher.showNotifications`          | `true`      | Show notification when switchin' profiles                                                      |
| `gitIdSwitcher.applyToSubmodules`          | `true`      | Propagate profile to Git submodules                                                            |
| `gitIdSwitcher.submoduleDepth`             | `1`         | Max depth fer nested submodules (1-5)                                                          |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`     | Include emoji in Git config `user.name`                                                        |
| `gitIdSwitcher.logging.fileEnabled`        | `false`     | Save audit logs to file (records profile switches, SSH key operations, etc.)                   |
| `gitIdSwitcher.logging.filePath`           | `""`        | Log file path (e.g., `~/.git-id-switcher/security.log`). Empty = default path                  |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`  | Max file size before rotation (bytes, 1MB-100MB)                                               |
| `gitIdSwitcher.logging.maxFiles`           | `5`         | Number o' rotated log files to keep (1-20)                                                     |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`     | When enabled, all values be masked in logs (maximum privacy mode, arrr!)                       |
| `gitIdSwitcher.logging.level`              | `"INFO"`    | Log verbosity (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Records selected level an' above |
| `gitIdSwitcher.commandTimeouts`            | `{}`        | Custom timeouts per command (ms, 1s-5min). E.g., `{"git": 15000, "ssh-add": 10000}`            |

#### `includeIconInGitConfig` Setting

This controls what happens when ye set the `icon` field:

| Value             | Behavior                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| `false` (default) | `icon` only shows in editor UI. Only `name` be written to Git config      |
| `true`            | `icon + name` be written to Git config. Emoji shows in commit history too |

Example: `icon: "🏴‍☠️"`, `name: "Cap'n Morgan"`

| includeIconInGitConfig | Git config `user.name` | Commit signature          |
| ---------------------- | ---------------------- | ------------------------- |
| `false`                | `Cap'n Morgan`         | `Cap'n Morgan <email>`    |
| `true`                 | `🏴‍☠️ Cap'n Morgan`      | `🏴‍☠️ Cap'n Morgan <email>` |

---

## How It Works

### Git Config Layer Structure

Git config has 3 layers, like decks on a ship. Lower layers be overridden by higher ones:

```text
System (/etc/gitconfig)
    ↓ overridden by
Global (~/.gitconfig)
    ↓ overridden by
Local (.git/config)  ← Highest priority
```

**Git ID Switcher writes to `--local` (repository local).**

That means:

- Saves profile in each repository's `.git/config`
- Ye can have different profiles fer each repository
- Global settings (`~/.gitconfig`) be not modified

### Profile Switchin' Behavior

When ye switch profiles, the extension does these things (in order):

1. **Git Config** (always): Sets `git config --local user.name` an' `user.email`
2. **SSH Key** (when `sshKeyPath` be set): Removes other keys from ssh-agent, adds selected key
3. **GPG Key** (when `gpgKeyId` be set): Sets `git config --local user.signingkey` an' enables signin'
4. **Submodules** (when enabled): Propagates settings to all submodules (default: depth 1)

### Submodule Propagation

Local settings be per-repository, so submodules don't automatically get 'em.
That be why this extension provides the propagation feature (see "Advanced: Submodule Support" section).

### SSH Key Management Details

Git ID Switcher manages SSH keys through `ssh-agent`:

| Operation  | Command Executed       |
| ---------- | ---------------------- |
| Add key    | `ssh-add <keyPath>`    |
| Remove key | `ssh-add -d <keyPath>` |
| List keys  | `ssh-add -l`           |

**Important:** This extension does **not** modify `~/.ssh/config`. Ye need to configure SSH config manually (see "Quick Start" Step 2). Savvy?

### Existing SSH Settings

If ye already have SSH settings, Git ID Switcher works like this:

| Yer Setting                                | Git ID Switcher Behavior                                  |
| ------------------------------------------ | --------------------------------------------------------- |
| `~/.ssh/config` with `IdentityFile`        | Both can be used; `IdentitiesOnly yes` prevents conflicts |
| Environment variable `GIT_SSH_COMMAND` set | Yer custom SSH command be used; ssh-agent still works     |
| `git config core.sshCommand` set           | Same as above                                             |
| direnv with SSH environment variables      | Can coexist; ssh-agent works independently                |

**Recommendation:** Always set `IdentitiesOnly yes` in yer SSH config. This prevents SSH from tryin' multiple keys, arrr!

### Why `IdentitiesOnly yes`?

Without this setting, SSH may try keys in this order:

1. Keys loaded in ssh-agent (managed by Git ID Switcher)
2. Keys specified in `~/.ssh/config`
3. Default keys (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, etc.)

This can cause authentication failures or usin' the wrong key. Not good fer any pirate!

With `IdentitiesOnly yes`, SSH uses **only the specified key**. This ensures the key set by Git ID Switcher be used.

```ssh-config
# Recommended setting
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← This line be important!
```

With this setting, connectin' to `github-work` host only uses `~/.ssh/id_ed25519_work`. No other keys be tried.

---

## Advanced: Submodule Support

When ye have complex repositories with Git submodules, profile management can be treacherous. When ye commit inside a submodule, Git uses that submodule's local config, an' if not set, it falls back to global config (wrong email address! Walk the plank!).

**Git ID Switcher** automatically detects submodules an' applies yer selected profile.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Enable/disable this feature
- `submoduleDepth`: How deep to sail?
  - `1`: Only direct submodules (most common)
  - `2+`: Nested submodules (submodules within submodules — ships within ships!)

This way, whether ye commit in the main repo or in a vendor library, yer profile be always correct. No more embarrassin' commits with the wrong flag!

---

## Troubleshootin'

### SSH Keys Not Switchin'?

1. Make sure `ssh-agent` be runnin':

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Check if key path be correct:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. On macOS, add to Keychain once:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Pushin' with the Wrong Profile?

**When clonin' a new repo:**

Fer work repositories, use the host alias from yer SSH config:

```bash
# Work (usin' github-work alias)
git clone git@github-work:company/repo.git

# Personal (usin' default github.com)
git clone git@github.com:yourname/repo.git
```

**Fer existing repositories:**

1. Check if remote URL uses the right host alias:

   ```bash
   git remote -v
   # Work repo should be git@github-work:...
   ```

2. Update if needed:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG Signin' Not Workin'?

1. Check yer GPG key ID:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Test signin':

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Make sure yer profile email matches yer GPG key email

### Profile Not Detected?

- Make sure ye be in a Git repository
- Check fer syntax errors in `settings.json`
- Reload VS Code window (`Cmd+Shift+P` → "Reload Window")

### `name` Field Gives Error?

These characters in the `name` field cause errors:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

If ye want to include a service name, use the `service` field instead.

```jsonc
// Bad — walk the plank!
"name": "Cap'n Morgan (Personal)"

// Good — smooth sailin'!
"name": "Cap'n Morgan",
"service": "GitHub"
```

### New Settings Not Showin'?

After updatin' the extension, new setting items may not appear in the settings screen.

**Fix:** Restart yer whole machine.

VS Code an' other editors cache setting schemas in memory. "Reload Window" or reinstallin' the extension may not be enough.

### Default Values (Identities, etc.) Be Empty?

If sample settings don't show on a fresh install, **Settings Sync** may be the cause.

If ye saved empty settings before, they got synced to the cloud an' now override the defaults on new installs.

**Fix:**

1. Find the setting in the settings screen
2. Click gear icon → "Reset Setting"
3. Sync with Settings Sync (old settings get removed from the cloud)

---

## Design Philosophy

> "Who be I?" — That be the only question this here extension answers, savvy?

Built on **Karesansui Architecture**: the core can be written in 100 lines.
That be why we can spend the rest on quality (90% test coverage, loggin', timeouts)
an' intentional constraints (no GitHub API, no token management).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Read the full philosophy, ye scurvy dog](../../DESIGN_PHILOSOPHY.md)

---

## Contributing

We welcome contributions from all pirates! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT License - See [LICENSE](../../../LICENSE). Share the plunder fairly!

## Credits

Crafted by [Null;Variant](https://github.com/nullvariant)

---

🏴‍☠️ **Fair winds and following seas, matey!** 🏴‍☠️
