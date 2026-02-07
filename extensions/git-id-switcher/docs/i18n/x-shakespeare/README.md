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
      Switcheth betwixt thy multiple Git identities with but a single click. Manageth multiple GitHub accounts, SSH keys, GPG signing, and <b>automatically applyeth thine identity unto Git Submodules</b>.
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

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-x-shakespeare.png" width="600" alt="Demo">

## 🎯 Wherefore This Extension?

Whilst many Git identity switchers doth exist upon this mortal coil, **Git ID Switcher** solveth the vexing problems that others do ignore:

1. **The Submodule's Lament**: When working with repositories containing submodules, one must oft set `git config user.name` by hand for _each_ submodule—a most tedious affair! This extension handleth it with grace, recursively applying thine identity unto all active submodules.
2. **SSH & GPG Handling**: It doth not merely change thy name; it swappeth thy SSH keys in the agent and configureth GPG signing, that thou might never commit with the wrong signature!

## Features Most Noble

- **Submodule Support**: Automatically propagateth thine identity unto all Git submodules
- **SSH Key Management**: Automatically switcheth thy SSH keys within the ssh-agent
- **GPG Signing Support**: Configureth thy GPG key for the signing of commits (optional, yet most wise)
- **One-Click Identity Switch**: Changeth thy Git user.name and user.email in the twinkling of an eye
- **Status Bar Integration**: Ever shall thy current identity be visible at a glance
- **Rich Tooltips**: Detailed identity information with description and SSH host
- **Cross-Platform**: Worketh upon macOS, Linux, and Windows—all the stages of the world!
- **Localized**: Supporteth 17 tongues of the realm

## 🌏 A Soliloquy on Multilingual Support

> _"What's in a language? That which we call a tongue_
> _By any other name would speak as sweet."_
>
> **I do value the existence of minorities.**
> I wish not to discard them merely because they be few in number.
> Even if translations be not perfect, I hope thou canst feel our intent to show respect.

---

## Quick Start, Good Sir or Madam

A typical arrangement for the management of one's personal account and enterprise account (Enterprise Managed User). The most essential preparation for any performance!

### Act I: Prepare Thy SSH Keys

```bash
# For the tragedy of personal projects
ssh-keygen -t ed25519 -C "william@personal.example.com" -f ~/.ssh/id_ed25519_personal

# For the comedy of work
ssh-keygen -t ed25519 -C "william@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Upon generating thy keys, register the public keys (`.pub`) unto each service (GitHub, GitLab, Bitbucket, and so forth). This is most required!

### Act II: Configure Thy SSH

Edit `~/.ssh/config`:

```ssh-config
# Personal Account (GitHub - default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Company Account (GitHub)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Act III: Configure the Extension

Open **Extension Settings** and configure thine identities within `gitIdSwitcher.identities`:

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

### Act IV: The Performance

1. Click upon the identity icon in the status bar
2. Select thine identity
3. 'Tis done! Thy Git config and SSH keys have been switched!

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-x-shakespeare.png" width="600" alt="Quick Pick">

---

## Optional: GPG Signing

If thou wouldst sign thy commits with GPG (as a noble lord doth seal their letters):

### Scene I: Find Thy GPG Key ID

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Example output:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] William the Bard <william@personal.example.com>
```

Thy key ID is `ABCD1234`. Remember it well!

### Scene II: Add GPG Key to Thine Identity

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "William the Bard",
      "email": "william@personal.example.com",
      "service": "GitHub",
      "icon": "🎭",
      "description": "To code, or not to code",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

When thou switchest to this identity, the extension doth set:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

Now thy commits bear the royal seal!

---

## Full Example: Five Accounts with SSH + GPG (A Grand Ensemble)

All the elements combined! Here doth follow the complete example:

### SSH Config (`~/.ssh/config`)

```ssh-config
# Personal Account (default)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Company Account (Company EMU)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Client A – commissioned work (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Client B – on-site engagement (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS contributions (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Extension Config

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

Note: The fourth identity (`client-b`) employeth an abbreviated name, and the fifth (`oss`) a developer's nom de plume. Thou canst set different display names for each identity, even for the selfsame person.

---

## Identity Properties

| Property      | Required | Description                                             |
| ------------- | -------- | ------------------------------------------------------- |
| `id`          | ✅       | A unique identifier for this identity                   |
| `name`        | ✅       | Git `user.name` (appeareth in commits)                  |
| `email`       | ✅       | Git `user.email`                                        |
| `icon`        | ❌       | A single emoji for the status bar. EMOJI ONLY, no text! |
| `description` | ❌       | Description (showeth in dropdown)                       |
| `sshKeyPath`  | ❌       | Path to SSH private key                                 |
| `sshHost`     | ❌       | SSH host alias (`Host` in ~/.ssh/config)                |
| `gpgKeyId`    | ❌       | GPG key ID for commit signing                           |
| `service`     | ❌       | Git service: `github`, `gitlab`, `bitbucket`, `other`   |

---

## Commands

| Command                                  | Description                 |
| ---------------------------------------- | --------------------------- |
| `Git ID Switcher: Select Identity`       | Open the identity picker    |
| `Git ID Switcher: Show Current Identity` | Reveal thy current identity |
| `Git ID Switcher: Show Documentation`    | Reveal the chronicles       |

---

## Settings

| Setting                                    | Default    | Description                                                                 |
| ------------------------------------------ | ---------- | --------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | `[]`       | The list of identities in thy troupe                                        |
| `gitIdSwitcher.defaultIdentity`            | `""`       | Default identity ID                                                         |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | Automatically switch SSH keys                                               |
| `gitIdSwitcher.showNotifications`          | `true`     | Display notification upon identity change                                   |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | Apply identity unto submodules                                              |
| `gitIdSwitcher.submoduleDepth`             | `1`        | Maximum depth for nested submodules (1-5)                                   |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | Include emoji in Git config (see below)                                     |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | Enable logging unto file for audit                                          |
| `gitIdSwitcher.logging.filePath`           | `""`       | Custom log file path                                                        |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | Max log file size ere rotation (bytes, 1MB-100MB)                           |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | Number of log files to preserve (1-20)                                      |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | Logging level (DEBUG/INFO/WARN/ERROR/SECURITY)                              |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | When 'tis enabled, all values are masked in the logs (maximum privacy mode) |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | External command timeouts (ms, 1s-5min)                                     |

---

## Display Limitations

- **`icon` property**: A single emoji only! No text such as "🎭 William". Simply "🎭".
- **`includeIconInGitConfig`**: When disabled (default), emoji doth not appear in Git config user.name.

---

## `includeIconInGitConfig` Setting

This setting doth control whether emoji be added to Git `user.name`.

| Setting           | Behavior                                                        |
| ----------------- | --------------------------------------------------------------- |
| `false` (default) | Git config: `user.name = William the Bard` (no emoji in config) |
| `true`            | Git config: `user.name = 🎭 William the Bard` (emoji in config) |

> **Note**: The emoji doth always appear in the status bar regardless of this setting! This affecteth only the Git config.

---

## Git Config Layer Structure

### How Git Config Worketh

Git config hath three layers, like acts in a play:

```text
SYSTEM (/etc/gitconfig)
   ↓ overridden by
GLOBAL (~/.gitconfig)
   ↓ overridden by
LOCAL (.git/config)  ← This extension writeth here with `--local`
```

### Submodule Propagation

Local settings art per-repository, thus submodules inherit them not automatically.
'Tis why this extension provideth the propagation feature (see "Advanced: Submodule Support" section).

---

## Advanced: Submodule Support

When thy repositories contain Git submodules, identity management becometh most vexing. When thou dost commit within a submodule, Git useth that submodule's local config, and if none be set, it falleth back to global config (the wrong email address! A tragedy most foul!).

**Git ID Switcher** automatically detecteth submodules and applieth thy selected identity.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Enable or disable this feature
- `submoduleDepth`: How deep shall we descend?
  - `1`: Only direct submodules (most common)
  - `2+`: Nested submodules (submodules within submodules—a play within a play!)

Thus, whether thou dost commit in the main repository or in a vendor library, thine identity remaineth ever correct. No more embarrassing commits with the wrong signature!

---

## Troubleshooting

### "Name field is required" Error

If thou dost encounter this error, examine thy settings:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "William the Bard", // ← This is required!
      "email": "william@personal.example.com" // ← This also!
    }
  ]
}
```

Both `name` and `email` are required. The play cannot proceed without them!

### New Settings Appear Not

If new settings such as `service` or `includeIconInGitConfig` appear not:

1. **Reload Window**: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Type**: "Developer: Reload Window"
3. **Press Enter**

VS Code doth cache setting schemas. A reload shall remedy this!

### Settings Sync Conflicts

If thou usest VS Code Settings Sync and hast different identities upon different machines:

1. **Option A**: Disable sync for this extension's settings
2. **Option B**: Use the same identities upon all machines
3. **Option C**: Use workspace settings (`.vscode/settings.json`) instead

> **Tip**: Workspace settings are per-project and sync not. Most suitable for different identities!

---

## Design Philosophy

> "Who art I?" — That is the sole question this extension doth answer.

Built upon the **Karesansui Architecture**: a core most simple (100 lines),
surrounded by deliberate quality (90% coverage, logging, timeouts)
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
