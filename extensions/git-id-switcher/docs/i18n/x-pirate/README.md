# Git ID Switcher 🏴‍☠️

> **Ahoy, matey!** This here be a translation fer all ye scallywags who speak the noble tongue o' the Seven Seas!

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Switch between yer multiple Git identities with a single click o' yer hook! Manage multiple GitHub accounts, SSH keys, GPG signin', and <b>automatically apply yer identity to all Git Submodules</b>, arrr!
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/attestations"><img src="https://img.shields.io/badge/SLSA-Level_3-green" alt="SLSA 3"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml/badge.svg" alt="Security"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
      <a href="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions"><img src="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions/graph/badge.svg" alt="codecov"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      🌐 Tongues: <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-x-pirate.png" width="600" alt="Demo">

## 🎯 Why This Extension, Ye Ask?

While many Git identity switchers sail the seven seas, **Git ID Switcher** solves the treacherous problems that others ignore:

1. **Submodules Be a Nightmare**: Workin' with repositories that have submodules usually requires settin' `git config user.name` manually fer *each* submodule. This extension handles it elegantly by recursively applyin' yer identity to all active submodules in yer fleet.
2. **SSH & GPG Handlin'**: It don't just change yer name; it swaps yer SSH keys in the agent and configures GPG signin' so ye never commit with the wrong signature, lest ye walk the plank!

## Features, Ye Scurvy Dog!

- **Submodule Support**: Automatically propagate yer identity to all Git submodules in yer fleet
- **SSH Key Management**: Automatically switch yer SSH keys in ssh-agent, like changin' sails in a storm
- **GPG Signin' Support**: Configure yer GPG key fer commit signin' (optional, but a true pirate always signs their plunder)
- **One-Click Identity Switch**: Change yer Git user.name and user.email faster than ye can say "shiver me timbers!"
- **Status Bar Integration**: Always see yer current identity at a glance from the crow's nest
- **Rich Tooltips**: Detailed identity info with description and SSH host
- **Cross-Platform**: Works on macOS, Linux, and Windows - every port in the digital sea!
- **Localized**: Supports 17 languages, plus Pirate speak, arrr!

## 🌏 A Note on Multilingual Support

> **I value the existence o' minorities, even pirates!**
> I don't want to discard 'em just because they be small in number.
> Even if translations ain't perfect, I hope ye can feel our intent to show respect fer all tongues!

---

## Quick Start, Ye Landlubber

Typical setup fer managin' yer personal account and company account (Enterprise Managed User). The essential provisions fer any voyage!

### Step 1: Prepare Yer SSH Keys

```bash
# Captain's personal account
ssh-keygen -t ed25519 -C "blackbeard@personal.example.com" -f ~/.ssh/id_ed25519_captain

# Merchant vessel account (fer legitimate business, arrr)
ssh-keygen -t ed25519 -C "blackbeard@merchant.example.com" -f ~/.ssh/id_ed25519_merchant
```

After generatin' yer keys, register the public keys (`.pub`) to each service (GitHub, GitLab, Bitbucket, etc.). This be required, matey!

### Step 2: Configure Yer SSH

Edit `~/.ssh/config`:

```ssh-config
# Captain's Personal Account (GitHub - default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_captain
    IdentitiesOnly yes

# Merchant Account (GitHub)
Host github-merchant
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_merchant
    IdentitiesOnly yes

# Tavern Account (Bitbucket)
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_tavern
    IdentitiesOnly yes
```

### Step 3: Configure the Extension

Open **Extension Settings** and configure yer identities in `gitIdSwitcher.identities`:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "captain",
      "icon": "🏴‍☠️",
      "name": "Captain Blackbeard",
      "email": "blackbeard@personal.example.com",
      "description": "Plunderin' personal projects",
      "sshKeyPath": "~/.ssh/id_ed25519_captain",
      "service": "github"
    },
    {
      "id": "merchant",
      "icon": "⚓",
      "name": "Edward Teach",
      "email": "blackbeard@merchant.example.com",
      "description": "Legitimate merchant business",
      "sshKeyPath": "~/.ssh/id_ed25519_merchant",
      "sshHost": "github-merchant",
      "service": "github"
    },
    {
      "id": "navy-spy",
      "icon": "🎭",
      "name": "Lieutenant Smith",
      "email": "smith@navy.example.com",
      "description": "Undercover operations",
      "service": "gitlab"
    },
    {
      "id": "tavern",
      "icon": "🍺",
      "name": "Jolly Roger",
      "email": "jolly@tavern.example.com",
      "description": "Tavern side projects",
      "service": "bitbucket"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "captain",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Step 4: Set Sail

1. Click the identity icon in the status bar (bottom right, near the anchor)
2. Pick yer identity
3. Arrr! Yer Git config and SSH keys be switched!

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-x-pirate.png" width="600" alt="Quick Pick">

---

## Optional: GPG Signin'

If ye want to sign yer commits with GPG (like a proper pirate captain signs their letters o' marque):

### Step 1: Find Yer GPG Key ID

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Example output:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Captain Blackbeard <blackbeard@personal.example.com>
```

Yer key ID be `ABCD1234`. Remember it well!

### Step 2: Add GPG Key to Yer Identity

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "captain",
      "icon": "🏴‍☠️",
      "name": "Captain Blackbeard",
      "service": "GitHub",
      "email": "blackbeard@personal.example.com",
      "description": "Plunderin' personal projects",
      "sshKeyPath": "~/.ssh/id_ed25519_captain",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

When ye switch to this identity, the extension sets:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

Now yer commits be properly signed like a captain's decree!

---

## Full Example: 4 Accounts with SSH + GPG (Full Fleet)

All the provisions combined! Here be the full example:

### SSH Config (`~/.ssh/config`)

```ssh-config
# Captain's Personal Account (default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_captain
    IdentitiesOnly yes

# Merchant Account (Company EMU)
Host github-merchant
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_merchant
    IdentitiesOnly yes

# Tavern Account (Bitbucket)
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_tavern
    IdentitiesOnly yes
```

### Extension Config

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "captain",
      "icon": "🏴‍☠️",
      "name": "Captain Blackbeard",
      "service": "GitHub",
      "email": "blackbeard@personal.example.com",
      "description": "Personal - Plunderin' projects",
      "sshKeyPath": "~/.ssh/id_ed25519_captain",
      "gpgKeyId": "CAPTAIN1"
    },
    {
      "id": "merchant",
      "icon": "⚓",
      "name": "Edward Teach",
      "service": "GitHub Company",
      "email": "teach@company_blackbeard.example.com",
      "description": "Company (EMU) - Merchant business",
      "sshKeyPath": "~/.ssh/id_ed25519_merchant",
      "sshHost": "github-merchant",
      "gpgKeyId": "MERCHANT1"
    },
    {
      "id": "tavern",
      "icon": "🪣",
      "name": "Jolly Roger",
      "service": "Bitbucket",
      "email": "jolly@tavern.example.com",
      "description": "Bitbucket - Tavern projects",
      "sshKeyPath": "~/.ssh/id_ed25519_tavern",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "navy-spy",
      "icon": "🎭",
      "name": "Lieutenant Smith",
      "service": "GitLab",
      "email": "smith@freelance.example.com",
      "description": "Freelance - Undercover operations"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "captain",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Note: The last identity (`navy-spy`) has no SSH. Ye can use this fer switchin' just Git config (like different committer info on the same account).

---

## Identity Properties

| Property | Required | Description |
|----------|----------|-------------|
| `id` | ✅ | Unique identifier fer this identity |
| `name` | ✅ | Git `user.name` (shows in commits) |
| `email` | ✅ | Git `user.email` |
| `icon` | ❌ | Single emoji fer status bar. EMOJI ONLY, no text! |
| `description` | ❌ | Description (shows in dropdown) |
| `sshKeyPath` | ❌ | Path to SSH private key |
| `sshHost` | ❌ | SSH host alias (`Host` in ~/.ssh/config) |
| `gpgKeyId` | ❌ | GPG key ID fer commit signin' |
| `service` | ❌ | Git service: `github`, `gitlab`, `bitbucket`, `other` |

---

## Commands

| Command                         | What It Does                        |
| ------------------------------- | ----------------------------------- |
| `Git ID: Select Identity`       | Open the identity picker, ye scurvy dog |
| `Git ID: Show Current Identity` | Show current identity info          |

---

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `gitIdSwitcher.identities` | `[]` | List of identities in yer crew |
| `gitIdSwitcher.defaultIdentity` | `""` | Default identity ID |
| `gitIdSwitcher.autoSwitchSshKey` | `true` | Automatically switch SSH keys |
| `gitIdSwitcher.showNotifications` | `true` | Show notification when switchin' identities |
| `gitIdSwitcher.applyToSubmodules` | `true` | Apply identity to submodules |
| `gitIdSwitcher.submoduleDepth` | `1` | Max depth fer nested submodules (1-5) |
| `gitIdSwitcher.includeIconInGitConfig` | `false` | Include emoji in Git config (see below) |
| `gitIdSwitcher.logging.fileEnabled` | `false` | Enable loggin' to file fer audit |
| `gitIdSwitcher.logging.filePath` | `""` | Custom log file path |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Max log file size before rotation (bytes, 1MB-100MB) |
| `gitIdSwitcher.logging.maxFiles` | `5` | Number of log files to keep (1-20) |
| `gitIdSwitcher.logging.level` | `"INFO"` | Loggin' level (DEBUG/INFO/WARN/ERROR/SECURITY) |
| `gitIdSwitcher.commandTimeouts` | `{}` | External command timeouts (ms, 1s-5min) |

---

## Display Limitations

- **`icon` property**: Single emoji only! No text like "🏴‍☠️ Captain". Just "🏴‍☠️".
- **`includeIconInGitConfig`**: When disabled (default), emoji not added to Git config user.name.

---

## `includeIconInGitConfig` Setting

This setting controls whether emoji be added to Git `user.name`.

| Setting | Behavior |
|---------|----------|
| `false` (default) | Git config: `user.name = Captain Blackbeard` (no emoji in config) |
| `true` | Git config: `user.name = 🏴‍☠️ Captain Blackbeard` (emoji in config) |

> **Note**: Emoji always shows in status bar regardless of this setting! This only affects Git config, matey.

---

## Git Config Layer Structure

### How Git Config Works

Git config has 3 layers, like decks on a ship:

```text
SYSTEM (/etc/gitconfig)
   ↓ overridden by
GLOBAL (~/.gitconfig)
   ↓ overridden by
LOCAL (.git/config)  ← This extension writes here with `--local`
```

### Submodule Propagation

Local settings be per-repository, so submodules don't automatically inherit 'em.
That be why this extension has the propagation feature (see "Advanced: Submodule Support" section).

---

## Advanced: Submodule Support

When ye have complex repositories with Git submodules, identity management can be treacherous. When ye commit inside a submodule, Git uses that submodule's local config, and if not set, it falls back to global config (wrong email address! Walk the plank!).

**Git ID Switcher** automatically detects submodules and applies yer selected identity.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Enable/disable this feature
- `submoduleDepth`: How deep to sail?
  - `1`: Only direct submodules (most common)
  - `2+`: Nested submodules (submodules within submodules - like ships within ships!)

This way, whether ye commit in the main repo or in a vendor library, yer identity be always correct. No more embarrassin' commits with the wrong flag!

---

## Troubleshootin'

### "Name field is required" Error

If ye see this error, check yer settings:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "captain",
      "name": "Captain Blackbeard",  // ← This be required!
      "email": "blackbeard@personal.example.com"  // ← This too!
    }
  ]
}
```

Both `name` and `email` be required. Can't sail without 'em!

### New Settings Not Showin'

If new settings like `service` or `includeIconInGitConfig` not showin':

1. **Reload Window**: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Type**: "Developer: Reload Window"
3. **Press Enter**

VS Code caches settin' schemas. Reload fixes it, arrr!

### Settings Sync Conflicts

If ye use VS Code Settings Sync and have different identities on different ships:

1. **Option A**: Disable sync fer this extension's settings
2. **Option B**: Use same identities on all ships
3. **Option C**: Use workspace settings (`.vscode/settings.json`) instead

> **Tip**: Workspace settings be per-project and don't sync. Good fer different identities across yer fleet!

---

## Design Philosophy

> "Who be I?" — That be the only question this here extension answers, savvy?

Built on **Karesansui Architecture**: a simple core (100 lines),
surrounded by deliberate quality (90% coverage, loggin', timeouts)
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
