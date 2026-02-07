# Git ID Switcher 🖖

> **Qapla'!** tlhIngan Hol jatlhlaH'a'? DaH Git ID choHlaH!
>
> (Success! Can you speak Klingon? Now you can switch Git ID!)

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      wa' weQ neH Git profiles law' DachoH. GitHub accounts law', SSH keys, GPG signing Daqon, <b>Git Submodules profiles automatic apply</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <b>🖖</b> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tlh/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 qatlh Git ID Switcher?

Git profile switchers law' tu'lu', 'ach **Git ID Switcher** latlh tools complex qay' Qaw':

1. **Submodules qay'**: Submodules lo'taHvIS repositories (e.g., Hugo themes, vendor libraries), usually _Hoch_ submodule `git config user.name` manually DaSet. extension Hoch active submodules profiles recursively chel, elegantly Qaw'.
2. **SSH & GPG SeH**: pong choH neH bIH. ssh-agent SSH keys DachoH, GPG signing DachoH, signature QIH commits yIbot.

## ngoQ (Features)

- **Profile Management UI**: settings.json edit without, profiles add, edit, delete, reorder possible
- **wa' weQ profile switch**: Git user.name 'ej user.email instant change
- **Status bar integration**: DaH profile always leghlaH
- **Submodule support**: Git submodules automatic profiles propagate
- **SSH key management**: ssh-agent SSH keys automatic switch
- **GPG signing support**: Commit signing GPG keys configure (optional)
- **Rich tooltips**: Description 'ej SSH host profile details
- **Cross-platform**: macOS, Linux, Windows - Hoch platforms!
- **Multilingual**: 17 languages support

## 🌏 Multilingual je minorities

> **minorities jIvoq.**
> puS neH chaH jIvoqbe'.
> Translations perfect bIHbe', 'ach minority languages yaj, respect qaq intent boj.

Extension VS Code Hol 17 qIp. README documentation, minority ethnic languages je joke languages mughwI' jIH.

"global support" neH bIH—"linguistic diversity respect." Hol Hoch, Daq Hoch, developers batlh commits chenmoH... infrastructure vIneH.

---

## Quick Start

Personal account je company-issued account (Enterprise Managed User) Segh typical setup.

### Step 1: SSH keys qawmoH

wa'DIch, accounts SSH keys chenmoH (already ghaj skip):

```bash
# Personal
ssh-keygen -t ed25519 -C "qapla@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Work
ssh-keygen -t ed25519 -C "qapla@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

SSH key **public key** (`.pub` file) GitHub account yIchel.

> **ghu**: GitHub `id_ed25519_personal.pub` (public key) yIchel. `id_ed25519_personal` (no extension) private key—not share, not upload!

### Step 2: SSH config choH

`~/.ssh/config` yIchoH:

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

### Step 3: Extension Segh

Install rIntaHvIS sample profiles qawmoHlu'. Guide tlha', SoH choH.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tlh/first-ux.webp" width="600" alt="First setup steps (13): Status bar profile management open, edit, create new flow" loading="lazy">

> **Key files ngeH qet**: SSH key He' choH, key file He' (Daq) neH teq. Key file contents ngeHbe', external ngeHbe'.

> **GPG signing lo'**: Profile choH screen `gpgKeyId` choH Datu'.
> GPG key ID paS mIw "[Troubleshooting](#gpg-signing-no-work)" legh.

> **QI'**: settings.json tI' Segh Datu'.
> Extension settings poSmoH (`Cmd+,` / `Ctrl+,`) → "Git ID Switcher" nej → "Edit in settings.json" wIv.
> JSON format Segh pIv "[Full Example](#full-example-5-accounts-ssh--gpg)" legh.

---

## pIv naQ: 5 Accounts SSH + GPG

Hoch tay'taH pIv naQ:

### SSH Config (`~/.ssh/config`)

```ssh-config
# Personal account (default)
Host github-personal
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

# Client A – contract work (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Client B – on-site project (Bitbucket)
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

### Extension Settings

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Qapla'",
      "email": "qapla@personal.example.com",
      "service": "GitHub",
      "icon": "⚔️",
      "description": "jIH ta'mey",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Qapla'",
      "email": "qapla@techcorp.example.com",
      "service": "GitHub vum",
      "icon": "🗡️",
      "description": "TechCorp vum'a'",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Qapla'",
      "email": "qapla@clienta.example.com",
      "service": "Bitbucket",
      "icon": "💪",
      "description": "ClientA mIw",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "Q.Qapla'",
      "email": "q.qapla@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🔥",
      "description": "ClientB Daq",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "qapla-dev",
      "email": "qapla.dev@example.com",
      "service": "GitLab",
      "icon": "🏆",
      "description": "OSS boQ",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

ghu: profile 4 (`client-b`) pong mojaq lo'. profile 5 (`oss`) chenmoH pong lo'. nuv rap qoj profiles pIm pong'e' lo'laH.

---

## Profiles qon

Status bar yIwIv → list bIng "Profile Management" qon screen poSmoH.
Profiles chel, choH, teq, tay'—Hoch UI tI' vum Datu'.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tlh/identity-management.webp" width="600" alt="Profile management: delete, reorder operation guide" loading="lazy">

Command Palette `Git ID Switcher: Delete Identity` profile teq je Datu'.

---

## ra' (Commands)

| Command                                  | Description         |
| ---------------------------------------- | ------------------- |
| `Git ID Switcher: Select Identity`       | Profile picker open |
| `Git ID Switcher: Delete Identity`       | Profile delete      |
| `Git ID Switcher: Show Current Identity` | DaH profile show    |
| `Git ID Switcher: Show Documentation`    | Documentation show  |

---

## Segh leghwI'

### Profile Dotlh

| Property      | Required | Description                                                 |
| ------------- | -------- | ----------------------------------------------------------- |
| `id`          | ✅       | Unique identifier (e.g., `"personal"`, `"work"`)            |
| `name`        | ✅       | Git user.name — commits show                                |
| `email`       | ✅       | Git user.email — commits show                               |
| `icon`        |          | Status bar emoji (e.g., `"⚔️"`). Single emoji only          |
| `service`     |          | Service name (e.g., `"GitHub"`, `"GitLab"`). UI display use |
| `description` |          | Picker 'ej tooltip short description                        |
| `sshKeyPath`  |          | SSH private key path (e.g., `"~/.ssh/id_ed25519_work"`)     |
| `sshHost`     |          | SSH config Host alias (e.g., `"github-work"`)               |
| `gpgKeyId`    |          | Commit signing GPG key ID                                   |

#### cha' jen

- **Status bar**: ~25 mI' tIq `...` pe'
- **`icon`**: wa' emoji (grapheme cluster) neH. law' emojis, ngoD potlh Hutlh

### Segh Hoch

| Setting                                    | Default    | Description                                                                               |
| ------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Sample     | Profile configurations list                                                               |
| `gitIdSwitcher.defaultIdentity`            | Sample     | Default profile ID use                                                                    |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | Profile change SSH keys automatic switch                                                  |
| `gitIdSwitcher.showNotifications`          | `true`     | Profile switch notification show                                                          |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | Git submodules profiles propagate                                                         |
| `gitIdSwitcher.submoduleDepth`             | `1`        | Nested submodules max depth (1-5)                                                         |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | Icon emoji Git config `user.name` include                                                 |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | Audit logs file save (profile switches, SSH key operations record)                        |
| `gitIdSwitcher.logging.filePath`           | `""`       | Log file path (e.g., `~/.git-id-switcher/security.log`). Empty default use                |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | Rotation before max file size (bytes, 1MB-100MB)                                          |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | Rotation files keep max count (1-20)                                                      |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | Enable Hoch values mask (maximum privacy mode)                                            |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | Log verbosity (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Selected level above record |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | Commands custom timeout values (ms, 1s-5min). E.g., `{"git": 15000, "ssh-add": 10000}`    |

#### `includeIconInGitConfig` About

`icon` field set behavior control:

| Value             | Behavior                                                    |
| ----------------- | ----------------------------------------------------------- |
| `false` (default) | `icon` editor UI only show. Git config `name` only write    |
| `true`            | Git config `icon + name` write. Commit history emoji remain |

Example: `icon: "👤"`, `name: "Qapla'"` case

| includeIconInGitConfig | Git config `user.name` | Commit signature    |
| ---------------------- | ---------------------- | ------------------- |
| `false`                | `Qapla'`               | `Qapla' <email>`    |
| `true`                 | `👤 Qapla'`            | `👤 Qapla' <email>` |

---

## chay' vum (How It Works)

### Git Config layer qach

Git config wej layers; bIng Segh Dung override:

```text
System (/etc/gitconfig)
    ↓ override
Global (~/.gitconfig)
    ↓ override
Local (.git/config)  ← highest priority
```

**Git ID Switcher `--local` (repository local) ghItlh.**

Doch:

- Repository `.git/config` profile choq
- Repositories rar profiles pol Datu'
- Global settings (`~/.gitconfig`) choHbe'

### Profile choH ngoQ

Profile DachoH, extension (order) vum:

1. **Git Config** (reH): `git config --local user.name` je `user.email` Datogh
2. **SSH key** (`sshKeyPath` toghta'): latlh keys ssh-agent teq, wIvta' chel
3. **GPG key** (`gpgKeyId` toghta'): `git config --local user.signingkey` Datogh, signing chu'
4. **Submodules** (chu'ta'): Hoch submodules config ngeH (default: depth 1)

### Submodule ngeH mIw

Local config repository qib vum, submodules automatic chelbe'.
vaj extension submodule ngeH ngoQ qem (De' "Advanced: Submodule Support" legh).

### SSH Key qon De'

Git ID Switcher `ssh-agent` lo'taHvIS SSH keys qon:

| vum       | ra' vum                |
| --------- | ---------------------- |
| Key chel  | `ssh-add <keyPath>`    |
| Key teq   | `ssh-add -d <keyPath>` |
| Key tlha' | `ssh-add -l`           |

**potlh:** Extension `~/.ssh/config` **choHbe'**. SSH config Segh manual poQ ("Quick Start" Step 2 legh).

### SSH Segh tu'lu'taHvIS vay'

SSH Segh DaghajtaH, Git ID Switcher ngoQ:

| SoH Segh                              | Git ID Switcher ngoQ                        |
| ------------------------------------- | ------------------------------------------- |
| `~/.ssh/config` `IdentityFile` DaSegh | cha' Dalo'laH; `IdentitiesOnly yes` yem bot |
| mi' Deghmey `GIT_SSH_COMMAND` DaSegh  | Custom SSH ra' Dalo'; ssh-agent vumtaH      |
| `git config core.sshCommand` DaSegh   | Dung rap                                    |
| direnv SSH mi' Deghmey DaSegh         | yIn Datu'; ssh-agent wa'bej vum             |

**Qel:** SSH config reH `IdentitiesOnly yes` yItogh. SSH law' keys wIv botmoH.

### qatlh `IdentitiesOnly yes`?

Segh Hutlh, SSH keys wIv order:

1. ssh-agent loaded keys (Git ID Switcher qon)
2. `~/.ssh/config` specified keys
3. Default keys (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, etc.)

Authentication luj, unintended key lo' Datu'.

`IdentitiesOnly yes` Datogh, SSH **specified keys neH** lo'. Git ID Switcher toghta' keys bIH lo'.

```ssh-config
# QelmeH Segh
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← ghItlh potlh
```

Segh toghta', `github-work` Host jot `~/.ssh/id_ed25519_work` neH lo', latlh keys wIvbe'.

---

## po'wI': Submodule qIp

Git submodules lo'taHvIS complex repositories, profile qon DatIv. Submodule commit, Git submodule local config lo'; explicitly Datoghbe', global config (email QIH!) default Datu'.

**Git ID Switcher** automatic submodules tu', wIvta' profile chel.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: ngoQ chu'/mev toggle
- `submoduleDepth`: 'ar depth chel?
  - `1`: tI' submodules neH (tlhutlh law')
  - `2+`: Nested submodules (submodules submodules tItDaq)

Main repository commit, vendor library commit—profile reH pIv guarantee.

---

## qay' Qaw' (Troubleshooting)

### SSH key choHbe'?

1. `ssh-agent` qetlh paS:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Key He' pIv paS:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. macOS, wa'logh Keychain chel:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### ngeH profile QIH?

**chu' clone:**

vum repository clone, SSH config Seghta' host alias lo':

```bash
# vum (github-work alias lo')
git clone git@github-work:company/repo.git

# Personal (default github.com lo')
git clone git@github.com:yourname/repo.git
```

**repository tu'lu'ta':**

1. Remote URL pIv host alias lo' paS:

   ```bash
   git remote -v
   # vum repository git@github-work:... cha' poQ
   ```

2. poQlu' choH:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG signing vumbe'?

1. GPG key ID paS:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Signing wIv:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Profile email GPG key email rap paS

### Profile tu'be'?

- Git repository tItDaq paS
- `settings.json` syntax Qagh yInej
- VS Code window yIchu'qa' (`Cmd+Shift+P` → "Reload Window")

### `name` De' Qagh?

`name` De' mI' bIH ngaS Qagh:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Service pong ngaS DaneH, `service` De' yIlo'.

```jsonc
// QIH
"name": "Qapla' (Personal)"

// pIv
"name": "Qapla'",
"service": "GitHub"
```

### chu' Segh cha'be'?

Extension choHta', chu' Segh Segh screen cha'be'.

**Qaw':** Machine naQ yIchu'qa'.

VS Code editors Segh schema yab cache, "Reload Window" pagh reinstall naQbe'.

### Default values (identities etc.) chIm?

chu' install sample Segh cha'be', **Settings Sync** qaSmoH.

ret chIm Segh choqta', cloud sync, chu' install default values override.

**Qaw':**

1. Segh screen Segh yItu'
2. Gear icon → "Reset Setting" yIwIv
3. Settings Sync sync (qan Segh cloud yIteq)

---

## meqba' QeD (Design Philosophy)

> **"jIH 'Iv?"** — wa' yu'wI' extension jang.

**Karesansui Architecture** lo'lu'. Core 100 ghItlhmey nap.
vaj remaining quality (test 90%, logging, timeouts) je
intentional constraints (GitHub API Hutlh, token qon Hutlh) lo' Datu'.

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[meqba' naQ yIlaD](../../DESIGN_PHILOSOPHY.md)

---

## boq (Contributing)

boq SuqeH! [CONTRIBUTING.md](../../CONTRIBUTING.md) yIlaD.

## chut (License)

MIT chut - [LICENSE](../../../LICENSE) yIlaD.

## quvmoH (Credits)

[Null;Variant](https://github.com/nullvariant) chenmoHta'

---

🖖 **Qapla'! batlh Daqawlu'taH!** 🖖

_(Success! You will be remembered with honor!)_
