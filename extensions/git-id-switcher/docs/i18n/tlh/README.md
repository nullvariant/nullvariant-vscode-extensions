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
      wa' weQ neH lo'taHvIS Git ID law' choHlaH. GitHub accounts law', SSH keys, GPG signing, <b>Git Submodules automatic ID apply</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <br>
      🌐 Hol: <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 latlh</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-tlh.png" width="600" alt="Demo">

## 🎯 qatlh extension?

Git ID switchers law' tu'lu', 'ach **Git ID Switcher** qay' potlh solve:

1. **Submodules qay'**: Submodules repository work, `git config user.name` *Hoch* submodule manually set need. extension Hoch active submodules ID recursively apply.
2. **SSH & GPG**: pong neH choH. ssh-agent SSH keys swap, GPG signing configure. wrong signature commit never!

## Features (ngoQ)

- **Submodule Support**: Git submodules ID automatic propagate
- **SSH Key Management**: ssh-agent SSH keys automatic choH
- **GPG Signing Support**: GPG key commit signing configure (optional)
- **wa' weQ ID choH**: Git user.name, user.email nom choHlaH
- **Status Bar Integration**: DaH ID leghlaH
- **Rich Tooltips**: ID details, description, SSH host
- **Cross-Platform**: macOS, Linux, Windows - Hoch platforms!
- **Localized**: 17 Hol support

## 🌏 Multilingual Support

> **minorities value jIH.**
> puS neH chaH 'e' vIHar pagh.
> translations perfect pagh, 'ach respect show intent feel DaneH.

---

## Quick Start

Typical setup warrior account 'ej fleet account (Enterprise Managed User) manage.

### Step 1: SSH Keys prepare

First, SSH keys generate accounts (skip if already have):

```bash
# warrior (personal)
ssh-keygen -t ed25519 -C "worf@warrior.example.com" -f ~/.ssh/id_ed25519_warrior

# captain (work)
ssh-keygen -t ed25519 -C "martok@captain.example.com" -f ~/.ssh/id_ed25519_captain
```

Each key **public key** (`.pub` file) GitHub account register.

> **Note**: GitHub register `id_ed25519_warrior.pub` (public key). `id_ed25519_warrior` (no extension) private key—never share, never upload!

### Step 2: SSH Config

`~/.ssh/config` edit:

```ssh-config
# Warrior Account
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_warrior
    IdentitiesOnly yes

# Captain Account
Host github-captain
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_captain
    IdentitiesOnly yes
```

### Step 3: Extension Configure

Extension settings open (`Cmd+,` / `Ctrl+,`) → "Git ID Switcher" search → "Edit in settings.json" click:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "warrior",
      "icon": "⚔️",
      "name": "Worf, Son of Mogh",
      "service": "GitHub",
      "email": "worf@warrior.example.com",
      "description": "batlh (honor) projects",
      "sshKeyPath": "~/.ssh/id_ed25519_warrior"
    },
    {
      "id": "captain",
      "icon": "🖖",
      "name": "General Martok",
      "service": "GitHub Fleet",
      "email": "martok@captain.example.com",
      "description": "Fleet command",
      "sshKeyPath": "~/.ssh/id_ed25519_captain",
      "sshHost": "github-captain"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "warrior",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Step 4: Qapla'!

1. Status bar (bottom right) ID icon click
2. ID select
3. Qapla'! Git config, SSH keys switched!

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-tlh.png" width="600" alt="Quick Pick">

### SSH Host Aliases Use

Repositories clone, ID corresponding host use:

```bash
# Captain ID (github-captain alias use)
git clone git@github-captain:fleet/repo.git

# Warrior ID (default github.com use)
git clone git@github.com:worf/repo.git
```

---

## Optional: GPG Signing

GPG commits signing:

### Step 1: GPG Key ID Find

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Example output:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Worf, Son of Mogh <worf@warrior.example.com>
```

Key ID `ABCD1234`.

### Step 2: GPG Key ID Add

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "warrior",
      "icon": "⚔️",
      "name": "Worf, Son of Mogh",
      "service": "GitHub",
      "email": "worf@warrior.example.com",
      "description": "batlh (honor) projects",
      "sshKeyPath": "~/.ssh/id_ed25519_warrior",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

ID switch, extension:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Full Example: 4 Accounts SSH + GPG

All combining full example:

### SSH Config (`~/.ssh/config`)

```ssh-config
# Warrior account (default)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_warrior
    IdentitiesOnly yes

# Captain account
Host github-captain
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_captain
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
      "id": "warrior",
      "icon": "⚔️",
      "name": "Worf, Son of Mogh",
      "service": "GitHub",
      "email": "worf@warrior.example.com",
      "description": "batlh (honor) projects",
      "sshKeyPath": "~/.ssh/id_ed25519_warrior",
      "gpgKeyId": "WARRIOR1"
    },
    {
      "id": "captain",
      "icon": "🖖",
      "name": "General Martok",
      "service": "GitHub Fleet",
      "email": "martok@captain.example.com",
      "description": "Fleet command",
      "sshKeyPath": "~/.ssh/id_ed25519_captain",
      "sshHost": "github-captain",
      "gpgKeyId": "CAPTAIN1"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "Worf, Son of Mogh",
      "service": "Bitbucket",
      "email": "worf@bitbucket.example.com",
      "description": "Bitbucket projects",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "spy",
      "icon": "🎭",
      "name": "Operative",
      "service": "GitLab",
      "email": "spy@intelligence.example.com",
      "description": "Covert operations"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "warrior",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Note: Last ID (`spy`) no SSH—Git config only change. Same GitLab account different committer info use.

---

## Configuration Reference

### Identity Properties

| Property      | Required | Description                                                |
| ------------- | -------- | ---------------------------------------------------------- |
| `id`          | ✅       | Unique identifier (e.g., `"warrior"`, `"captain"`)         |
| `name`        | ✅       | Git user.name — commits show                               |
| `email`       | ✅       | Git user.email — commits show                              |
| `icon`        |          | Status bar emoji (e.g., `"⚔️"`). Single emoji only         |
| `service`     |          | Service name (e.g., `"GitHub"`, `"GitLab"`). UI use        |
| `description` |          | Picker, tooltip short description                          |
| `sshKeyPath`  |          | SSH private key path (e.g., `"~/.ssh/id_ed25519_captain"`) |
| `sshHost`     |          | SSH config host alias (e.g., `"github-captain"`)           |
| `gpgKeyId`    |          | GPG key ID commit signing                                  |

#### Display Limitations

- **Status bar**: ~25 characters text `...` truncate
- **`icon`**: Single emoji (grapheme cluster) only. Multiple emojis, long text no work

### General Settings

| Setting                             | Default    | Description                                    |
| ----------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`          | See example| Identity configurations list                   |
| `gitIdSwitcher.defaultIdentity`     | See example| Default identity ID                            |
| `gitIdSwitcher.autoSwitchSshKey`    | `true`     | SSH key automatic switch                       |
| `gitIdSwitcher.showNotifications`   | `true`     | Switch notification show                       |
| `gitIdSwitcher.applyToSubmodules`   | `true`     | Git submodules ID apply                        |
| `gitIdSwitcher.submoduleDepth`      | `1`        | Nested submodules max depth (1-5)              |
| `gitIdSwitcher.includeIconInGitConfig` | `false` | Emoji icon Git config `user.name` write        |
| `gitIdSwitcher.logging.fileEnabled` | `false`    | File logging enable (audit)                    |
| `gitIdSwitcher.logging.filePath`    | `""`       | Custom log file path                           |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Log file max size before rotation (bytes, 1MB-100MB) |
| `gitIdSwitcher.logging.maxFiles`    | `5`        | Log files keep count (1-20)                    |
| `gitIdSwitcher.logging.level`       | `"INFO"`   | Logging level (DEBUG/INFO/WARN/ERROR/SECURITY) |
| `gitIdSwitcher.commandTimeouts`     | `{}`       | External commands timeout (ms, 1s-5min)        |

#### `includeIconInGitConfig` About

`icon` field set behavior control:

| Value | Behavior |
|-------|----------|
| `false` (default) | `icon` editor UI only show. `name` only Git config write |
| `true` | `icon + name` Git config write. Emoji commit history remain |

Example: `icon: "👤"`, `name: "Worf, Son of Mogh"`

| includeIconInGitConfig | Git config `user.name` | Commit signature |
|------------------------|------------------------|------------------|
| `false` | `Worf, Son of Mogh` | `Worf, Son of Mogh <email>` |
| `true` | `👤 Worf, Son of Mogh` | `👤 Worf, Son of Mogh <email>` |

### Note: Basic Setup (No SSH)

SSH key switching not need (e.g., same GitHub account different committer info use), minimal configuration use:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "warrior",
      "icon": "⚔️",
      "name": "Worf, Son of Mogh",
      "email": "worf@warrior.example.com",
      "description": "batlh (honor) projects"
    },
    {
      "id": "captain",
      "icon": "🖖",
      "name": "General Martok",
      "email": "martok@captain.example.com",
      "description": "Fleet command"
    }
  ]
}
```

This setup `git config user.name` 'ej `user.email` only switch.

---

## How It Works (chay' Qap)

### Git Config Layer Structure

Git config three layers; lower layers higher layers override:

```text
System (/etc/gitconfig)
    ↓ override
Global (~/.gitconfig)
    ↓ override
Local (.git/config)  ← highest priority
```

**Git ID Switcher `--local` (repository local) level write.**

This means:

- ID each repository `.git/config` file save
- Different IDs each repository keep
- Global settings (`~/.gitconfig`) no change

### Identity Switching Behavior

ID switch, extension (order):

1. **Git Config** (always): `git config --local user.name` 'ej `user.email` set
2. **SSH Key** (`sshKeyPath` set): ssh-agent other keys remove, selected add
3. **GPG Key** (`gpgKeyId` set): `git config --local user.signingkey` set, signing enable
4. **Submodules** (enabled): All submodules config propagate (default: depth 1)

### Submodule Propagation Mechanism

Local config repository level work, submodules automatic no apply.
Therefore this extension submodule propagation feature provide (see "Advanced: Submodule Support" details).

---

## Advanced: Submodule Support

Git submodules complex repositories, ID management often difficult. Submodule commit, Git that submodule local config use; explicit no set, global config fallback (wrong email!).

**Git ID Switcher** submodules automatic detect, selected ID apply.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: This feature enable/disable
- `submoduleDepth`: How deep apply?
  - `1`: Direct submodules only (most common)
  - `2+`: Nested submodules (submodules inside submodules)

This ensure ID always correct, main repository or vendor library commit.

---

## Troubleshooting (qay' Solve)

### SSH key no switch?

1. `ssh-agent` running confirm:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Key path correct confirm:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. macOS, Keychain once add:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_captain
   ```

### Push wrong ID?

1. Remote URL correct host alias using confirm:

   ```bash
   git remote -v
   # Captain repos git@github-captain:... show
   ```

2. Necessary update:

   ```bash
   git remote set-url origin git@github-captain:fleet/repo.git
   ```

### GPG signing no work?

1. GPG key ID find:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Signing test:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. ID email GPG key email match confirm.

### ID no detect?

- Git repository inside confirm
- `settings.json` syntax error check
- VS Code window reload (`Cmd+Shift+P` → "Reload Window")

### `name` field error?

`name` field these characters contain, error:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Service name include want, `service` field use.

```jsonc
// WRONG
"name": "Worf (Warrior)"

// CORRECT
"name": "Worf, Son of Mogh",
"service": "GitHub"
```

### New settings no show?

Extension update, new settings settings screen no appear.

**Solution:** Machine full restart.

VS Code editors settings schema memory cache, "Reload Window" or reinstall not enough.

### Default values (identities etc.) empty?

New install sample settings no show, **Settings Sync** cause.

Past empty settings save, cloud sync, new install default values override.

**Solution:**

1. Settings screen relevant setting find
2. Gear icon → "Reset Setting" select
3. Settings Sync sync (old settings cloud remove)

---

## tlhIngan Hol Quick Reference

| tlhIngan | English | Usage |
|----------|---------|-------|
| Qapla' | Success! | Greeting/farewell |
| batlh | Honor | With honor |
| Heghlu'meH QaQ jajvam | Today is a good day to die | Before battle (or deployment) |
| nuqneH | What do you want? | Hello |
| HIja' / ghobe' | Yes / No | Responses |

---

## Commands (ra')

| Command                         | Description              |
| ------------------------------- | ------------------------ |
| `Git ID: Select Identity`       | ID picker open           |
| `Git ID: Show Current Identity` | DaH ID show              |

---

## Contributing

Contributions welcome! [CONTRIBUTING.md](../../CONTRIBUTING.md) yIlaD.

## License

MIT License - [LICENSE](../../../LICENSE) yIlaD.

## Credits

[Null;Variant](https://github.com/nullvariant) chenmoH

---

🖖 **Qapla'! batlh Daqawlu'taH!** 🖖

*(Success! You will be remembered with honor!)*
