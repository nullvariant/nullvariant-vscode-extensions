# Git ID Switcher 🎭

> _"To switch, or not to switch—that is the question."_
> — A Developer, pondering their Git identity

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Switcheth betwixt thy multiple Git profiles with but a single click. Manageth multiple GitHub accounts, SSH keys, GPG signing, and <b>automatically applyeth thy profile unto Git submodules</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <b>🎭</b>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-shakespeare/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Wherefore This Extension?

Whilst many Git profile switching tools doth exist upon this mortal coil, **Git ID Switcher** solveth the vexing problems that others do neglect:

1. **The Submodule's Lament**: When working with repositories containing submodules (such as Hugo themes or vendor libraries), one must oft set `git config user.name` by hand for _each_ submodule — a most tedious affair! This extension handleth it with grace, recursively applying thy profile unto all active submodules.
2. **SSH & GPG Handling**: It doth not merely change thy name; it swappeth thy SSH keys within the agent and configureth GPG signing, that thou might never commit with the wrong signature!

## Features Most Noble

- **Profile Management UI**: Add, edit, delete, and reorder profiles without editing settings.json — no manual labour required!
- **One-Click Profile Switch**: Change thy Git user.name and user.email in the twinkling of an eye
- **Status Bar Integration**: Ever shall thy current profile be visible at a glance
- **Submodule Support**: Automatically propagateth thy profile unto all Git submodules
- **SSH Key Management**: Automatically switcheth thy SSH keys within the ssh-agent
- **GPG Signing Support**: Configureth thy GPG key for the signing of commits (optional, yet most wise)
- **Rich Tooltips**: Detailed profile information with description and SSH host
- **Cross-Platform**: Worketh upon macOS, Linux, and Windows — all the stages of the world!
- **Localized**: Supporteth 17 tongues of the realm

## 🌏 A Soliloquy on Multilingual Support

> _"What's in a language? That which we call a tongue_
> _By any other name would speak as sweet."_
>
> **I do value the existence of minorities.**
> I wish not to discard them merely because they be few in number.
> Even if translations be not perfect, I hope thou canst feel our intent to show respect.

This extension doth support all 17 languages that VS Code supports. And for README documentation, we have also challenged ourselves to translate into minority languages and joke languages.

This is not merely "global support" — 'tis "respect for linguistic diversity." And across all languages, in every place, developers making the world better with commits... I wish for this to be that manner of infrastructure.

---

## Quick Start, Good Sir or Madam

A typical arrangement for the management of one's personal account and enterprise account (Enterprise Managed User). The most essential preparation for any performance!

### Act I: Prepare Thy SSH Keys

First, forge SSH keys for each account (if thou dost already possess them, skip this):

```bash
# Personal
ssh-keygen -t ed25519 -C "william@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Work
ssh-keygen -t ed25519 -C "william@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Register thy **public keys** (`.pub` files) unto each GitHub account.

> **Note**: What thou dost register on GitHub is `id_ed25519_personal.pub` (public key). `id_ed25519_personal` (without extension) is the private key — never share or upload it! Guard it as thou wouldst the Crown Jewels!

### Act II: Configure Thy SSH

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

### Act III: Configure the Extension

After thou dost install, sample profiles stand ready for thee. Follow this guide to edit them for thyself.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-shakespeare/first-ux.webp" width="600" alt="First setup steps (13): Open profile management from status bar, edit and create new profiles" loading="lazy">

> **Thy key files are not sent anywhere**: When thou dost set the SSH key path, only the file path (location) is recorded. The key file contents are never uploaded or sent to external services.

> **If thou wouldst use GPG signing**: Thou canst also set `gpgKeyId` in the profile edit screen.
> For how to find thy GPG key ID, see "[Troubleshooting](#gpg-signing-doth-not-work)".

> **Tip**: Thou canst also configure directly from settings.json.
> Open extension settings (`Cmd+,` / `Ctrl+,`) → Search "Git ID Switcher" → Click "Edit in settings.json".
> For JSON format examples, see "[Full Example](#full-example-five-accounts-with-ssh--gpg-a-grand-ensemble)".

---

## Full Example: Five Accounts with SSH + GPG (A Grand Ensemble)

All the elements combined! Here doth follow the complete example:

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

# Client A — Commissioned Work (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Client B — On-Site Engagement (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS Contributions (GitLab)
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
      "name": "William the Bard",
      "email": "william@personal.example.com",
      "service": "GitHub",
      "icon": "🎭",
      "description": "Mine own works",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "William the Bard",
      "email": "william@techcorp.example.com",
      "service": "GitHub Labour",
      "icon": "👑",
      "description": "TechCorp principal toil",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "William the Bard",
      "email": "william@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏰",
      "description": "ClientA commission",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "W.Shakespeare",
      "email": "w.shakespeare@clientb.example.com",
      "service": "Bitbucket",
      "icon": "⚔️",
      "description": "ClientB in residence",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "william-dev",
      "email": "william.dev@example.com",
      "service": "GitLab",
      "icon": "📜",
      "description": "OSS for the commons",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Note: The fourth profile (`client-b`) employeth an abbreviated name, and the fifth (`oss`) a developer's nom de plume. Thou canst set different display names for each profile, even for the selfsame person.

---

## Profile Management

Click the status bar → at the bottom of the list, click "Profile Management" to open the management screen.
Thou canst add, edit, delete, and reorder profiles all from the UI directly.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-shakespeare/identity-management.webp" width="600" alt="Profile management: delete and reorder operations" loading="lazy">

Thou canst also delete profiles from the command palette: `Git ID Switcher: Delete Identity`.

---

## Commands

| Command                                  | Description                |
| ---------------------------------------- | -------------------------- |
| `Git ID Switcher: Select Identity`       | Open the profile picker    |
| `Git ID Switcher: Delete Identity`       | Delete a profile           |
| `Git ID Switcher: Show Current Identity` | Reveal thy current profile |
| `Git ID Switcher: Show Documentation`    | Reveal the chronicles      |

---

## Settings Reference

### Profile Properties

| Property      | Required | Description                                                     |
| ------------- | -------- | --------------------------------------------------------------- |
| `id`          | ✅       | Unique identifier (e.g., `"personal"`, `"work"`)                |
| `name`        | ✅       | Git user.name — appeareth in commits                            |
| `email`       | ✅       | Git user.email — appeareth in commits                           |
| `icon`        |          | Emoji for status bar (e.g., `"🎭"`). Single emoji only!         |
| `service`     |          | Service name (e.g., `"GitHub"`, `"GitLab"`). Used in UI display |
| `description` |          | Short description for picker and tooltip                        |
| `sshKeyPath`  |          | Path to SSH private key (e.g., `"~/.ssh/id_ed25519_work"`)      |
| `sshHost`     |          | SSH config Host alias (e.g., `"github-work"`)                   |
| `gpgKeyId`    |          | GPG key ID for commit signing                                   |

#### Display Limitations

- **Status bar**: If longer than ~25 characters, it is truncated with `...`
- **`icon`**: Single emoji (grapheme cluster) only. No multiple emojis or long strings allowed

### Global Settings

| Setting                                    | Default     | Description                                                                                    |
| ------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | See samples | The list of profiles                                                                           |
| `gitIdSwitcher.defaultIdentity`            | See samples | Default profile ID                                                                             |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`      | Automatically switch SSH keys upon changing profiles                                           |
| `gitIdSwitcher.showNotifications`          | `true`      | Display notification upon switching profiles                                                   |
| `gitIdSwitcher.applyToSubmodules`          | `true`      | Propagate profile unto Git submodules                                                          |
| `gitIdSwitcher.submoduleDepth`             | `1`         | Maximum depth for nested submodules (1-5)                                                      |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`     | Include emoji in Git config `user.name`                                                        |
| `gitIdSwitcher.logging.fileEnabled`        | `false`     | Save audit logs unto file (records profile switches, SSH key operations, etc.)                 |
| `gitIdSwitcher.logging.filePath`           | `""`        | Log file path (e.g., `~/.git-id-switcher/security.log`). Empty = default path                  |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`  | Maximum file size ere rotation (bytes, 1MB-100MB)                                              |
| `gitIdSwitcher.logging.maxFiles`           | `5`         | Number of rotated log files to preserve (1-20)                                                 |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`     | When enabled, all values are masked within the logs (maximum privacy mode)                     |
| `gitIdSwitcher.logging.level`              | `"INFO"`    | Log verbosity (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Records selected level and above |
| `gitIdSwitcher.commandTimeouts`            | `{}`        | Custom timeouts per command (ms, 1s-5min). E.g., `{"git": 15000, "ssh-add": 10000}`            |

#### `includeIconInGitConfig` Setting

This doth control what happens when thou dost set the `icon` field:

| Value             | Behavior                                                                          |
| ----------------- | --------------------------------------------------------------------------------- |
| `false` (default) | `icon` only showeth in editor UI. Only `name` is written unto Git config          |
| `true`            | `icon + name` is written unto Git config. Emoji showeth in commit history as well |

Example: `icon: "🎭"`, `name: "William the Bard"`

| includeIconInGitConfig | Git config `user.name` | Commit signature              |
| ---------------------- | ---------------------- | ----------------------------- |
| `false`                | `William the Bard`     | `William the Bard <email>`    |
| `true`                 | `🎭 William the Bard`  | `🎭 William the Bard <email>` |

---

## How It Works

### Git Config Layer Structure

Git config hath three layers, like acts in a play. Lower layers are overridden by higher ones:

```text
System (/etc/gitconfig)
    ↓ overridden by
Global (~/.gitconfig)
    ↓ overridden by
Local (.git/config)  ← Highest priority
```

**Git ID Switcher writeth unto `--local` (repository local).**

That is to say:

- It saveth the profile in each repository's `.git/config`
- Thou canst have different profiles for each repository
- Global settings (`~/.gitconfig`) are not modified

### Profile Switching Behaviour

When thou dost switch profiles, the extension performeth these actions (in order):

1. **Git Config** (always): Sets `git config --local user.name` and `user.email`
2. **SSH Key** (when `sshKeyPath` is set): Removes other keys from ssh-agent, adds the selected key
3. **GPG Key** (when `gpgKeyId` is set): Sets `git config --local user.signingkey` and enables signing
4. **Submodules** (when enabled): Propagates settings unto all submodules (default: depth 1)

### Submodule Propagation

Local settings are per-repository, thus submodules inherit them not automatically.
'Tis why this extension provideth the propagation feature (see "Advanced: Submodule Support" section).

### SSH Key Management Details

Git ID Switcher manageth SSH keys through `ssh-agent`:

| Operation  | Command Executed       |
| ---------- | ---------------------- |
| Add key    | `ssh-add <keyPath>`    |
| Remove key | `ssh-add -d <keyPath>` |
| List keys  | `ssh-add -l`           |

**Important:** This extension doth **not** modify `~/.ssh/config`. Thou must configure SSH config manually (see "Quick Start" Act II).

### Existing SSH Settings

If thou dost already have SSH settings, Git ID Switcher worketh thus:

| Thy Setting                                | Git ID Switcher Behaviour                                 |
| ------------------------------------------ | --------------------------------------------------------- |
| `~/.ssh/config` with `IdentityFile`        | Both may be used; `IdentitiesOnly yes` prevents conflicts |
| Environment variable `GIT_SSH_COMMAND` set | Thy custom SSH command is used; ssh-agent still worketh   |
| `git config core.sshCommand` set           | Same as above                                             |
| direnv with SSH environment variables      | They may coexist; ssh-agent worketh independently         |

**Recommendation:** Always set `IdentitiesOnly yes` within thy SSH config. This prevents SSH from trying multiple keys.

### Why `IdentitiesOnly yes`?

Without this setting, SSH may try keys in this order:

1. Keys loaded in ssh-agent (managed by Git ID Switcher)
2. Keys specified in `~/.ssh/config`
3. Default keys (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, etc.)

This may cause authentication failures or the use of the wrong key — a tragedy most foul!

With `IdentitiesOnly yes`, SSH uses **only the specified key**. This ensures the key set by Git ID Switcher is used.

```ssh-config
# Recommended setting
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← This line is most important!
```

With this setting, connecting unto `github-work` host uses only `~/.ssh/id_ed25519_work`. No other keys are tried.

---

## Advanced: Submodule Support

When thy repositories contain Git submodules, profile management becometh most vexing. When thou dost commit within a submodule, Git useth that submodule's local config, and if none be set, it falleth back to global config (the wrong email address! A tragedy most foul!).

**Git ID Switcher** automatically detecteth submodules and applieth thy selected profile.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Enable or disable this feature
- `submoduleDepth`: How deep shall we descend?
  - `1`: Only direct submodules (most common)
  - `2+`: Nested submodules (submodules within submodules — a play within a play!)

Thus, whether thou dost commit in the main repository or in a vendor library, thy profile remaineth ever correct. No more embarrassing commits with the wrong signature!

---

## Troubleshooting

### SSH Keys Switch Not?

1. Ensure that `ssh-agent` is running:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Verify that thy key path is correct:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. Upon macOS, add to Keychain once:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Pushing with the Wrong Profile?

**When cloning a new repository:**

For work repositories, use the host alias from thy SSH config:

```bash
# Work (using github-work alias)
git clone git@github-work:company/repo.git

# Personal (using default github.com)
git clone git@github.com:yourname/repo.git
```

**For existing repositories:**

1. Verify that the remote URL uses the correct host alias:

   ```bash
   git remote -v
   # Work repository should be git@github-work:...
   ```

2. Update if needed:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG Signing Doth Not Work?

1. Verify thy GPG key ID:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Test signing:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Ensure thy profile email matches thy GPG key email

### Profile Detected Not?

- Ensure thou art within a Git repository
- Check for syntax errors in `settings.json`
- Reload VS Code window (`Cmd+Shift+P` → "Reload Window")

### `name` Field Giveth Error?

These characters within the `name` field cause errors:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

If thou wouldst include a service name, use the `service` field instead.

```jsonc
// Ill-advised
"name": "William the Bard (Personal)"

// Most proper
"name": "William the Bard",
"service": "GitHub"
```

### New Settings Appear Not?

After updating the extension, new setting items may not appear in the settings screen.

**Remedy:** Restart thy entire machine.

VS Code and other editors cache setting schemas in memory. "Reload Window" or reinstalling the extension may not suffice.

### Default Values (Identities, etc.) Be Empty?

If sample settings appear not upon a fresh install, **Settings Sync** may be the cause.

If thou didst save empty settings previously, they were synced to the cloud and now override the defaults upon new installations.

**Remedy:**

1. Find the setting in the settings screen
2. Click the gear icon → "Reset Setting"
3. Sync with Settings Sync (old settings are removed from the cloud)

---

## Design Philosophy

> _"Who art I?" — That is the sole question this extension doth answer._

Built upon the **Karesansui Architecture**: a core most simple (100 lines).
That is why we may spend the rest upon quality (90% test coverage, logging, timeouts)
and constraints most intentional (no GitHub API, no token management).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Read the full philosophy](../../DESIGN_PHILOSOPHY.md)

---

## Contributing

We welcome contributions from all players upon this stage! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT License - See [LICENSE](../../../LICENSE).

## Credits

Crafted by [Null;Variant](https://github.com/nullvariant)

---

🎭 _"All the world's a stage, and all the devs merely players."_ 🎭
