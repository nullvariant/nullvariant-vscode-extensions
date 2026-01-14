# Git ID Switcher ✨

> **toki pona** li toki lili. ona li jo e nimi 120 taso.
>
> (Toki Pona is a minimalist language. It has only about 120 words.)

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      sina ken ante e nimi sina lon Git. luka wan la, sina ante e nimi. ilo ni li pona tawa GitHub mute, SSH, GPG, en <b>Git Submodule</b>.
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
      <a href="https://sonarcloud.io/summary/new_code?id=nullvariant_nullvariant-vscode-extensions"><img src="https://sonarcloud.io/api/project_badges/measure?project=nullvariant_nullvariant-vscode-extensions&metric=alert_status" alt="Quality Gate Status"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <b>✨</b> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-tok.png" width="600" alt="Demo">

## 🎯 tan seme?

ilo ante mute li lon. taso **Git ID Switcher** li pona tan ni:

1. **submodule**: sina jo e submodule la, sina wile pana e nimi tawa ona ale. ni li ike. ilo ni li pana e nimi tawa submodule ale.
2. **SSH en GPG**: ilo li ante e SSH key en GPG. sina sitelen e nimi pona.

## ijo pona (Features)

- **Submodule**: ilo li pana e nimi tawa submodule ale
- **SSH**: ilo li ante e SSH key
- **GPG**: sina ken sitelen e nimi sina lon commit
- **ante lili**: sina ken ante e nimi sina lon tenpo lili
- **lukin pona**: sina ken lukin e nimi sina lon status bar
- **sona mute**: tooltip li jo e sona mute
- **ma ale**: ilo li lon macOS, Linux, Windows
- **toki mute**: ilo li jo e toki 17

## 🌏 toki lili

> **mi olin e kulupu lili.**
> mi wile ala weka e ona tan ni: ona li lili.
> toki mi li pona ala la, mi wile e ni: sina sona e wile mi.

---

## open (Quick Start)

ni li nasin pona tawa jan pona account en jan lawa account (Enterprise Managed User).

### nanpa wan: SSH key

o pali e SSH key (o ante ala la, sina jo):

```bash
# jan pona (personal)
ssh-keygen -t ed25519 -C "janpona@pona.example.com" -f ~/.ssh/id_ed25519_pona

# jan lawa (work)
ssh-keygen -t ed25519 -C "janlawa@lawa.example.com" -f ~/.ssh/id_ed25519_lawa
```

o pana e **key open** (`.pub` file) tawa GitHub account.

> **sona**: GitHub li kama jo e `id_ed25519_pona.pub` (key open). `id_ed25519_pona` (ala .pub) li key len—o pana ala tawa jan ante!

### nanpa tu: SSH config

`~/.ssh/config`:

```ssh-config
# jan pona
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_pona
    IdentitiesOnly yes

# jan lawa
Host github-lawa
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_lawa
    IdentitiesOnly yes
```

### nanpa tu wan: ilo ni

o open e settings (`Cmd+,` / `Ctrl+,`) → o alasa e "Git ID Switcher" → o luka e "Edit in settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "jan-pona",
      "icon": "😊",
      "name": "jan pona",
      "service": "GitHub",
      "email": "janpona@pona.example.com",
      "description": "pali pona mi",
      "sshKeyPath": "~/.ssh/id_ed25519_pona"
    },
    {
      "id": "jan-lawa",
      "icon": "👔",
      "name": "jan lawa",
      "service": "GitHub lawa",
      "email": "janlawa@lawa.example.com",
      "description": "pali lawa",
      "sshKeyPath": "~/.ssh/id_ed25519_lawa",
      "sshHost": "github-lawa"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "jan-pona",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### nanpa tu tu: pali!

1. o luka e sitelen lon status bar (noka pini)
2. o kama jo e nimi
3. pona! nimi sina li ante!

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-tok.png" width="600" alt="Quick Pick">

### SSH Host Alias

sina kama jo e repo la, o kepeken host pona:

```bash
# jan lawa ID (kepeken github-lawa)
git clone git@github-lawa:lawa/repo.git

# jan pona ID (kepeken github.com)
git clone git@github.com:janpona/repo.git
```

---

## wile ala: GPG

sina sitelen e nimi lon commit kepeken GPG la:

### nanpa wan: GPG key ID

```bash
gpg --list-secret-keys --keyid-format SHORT
```

ni li pana:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] jan pona <janpona@pona.example.com>
```

key ID li `ABCD1234`.

### nanpa tu: GPG key ID pana

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "jan-pona",
      "icon": "😊",
      "name": "jan pona",
      "service": "GitHub",
      "email": "janpona@pona.example.com",
      "description": "pali pona mi",
      "sshKeyPath": "~/.ssh/id_ed25519_pona",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

sina ante e nimi la, ilo li pali e ni:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## sona ale: 4 account SSH + GPG

ale li lon ni:

### SSH Config (`~/.ssh/config`)

```ssh-config
# jan pona account (open)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_pona
    IdentitiesOnly yes

# jan lawa account
Host github-lawa
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_lawa
    IdentitiesOnly yes

# Bitbucket account
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### ilo settings

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "jan-pona",
      "icon": "😊",
      "name": "jan pona",
      "service": "GitHub",
      "email": "janpona@pona.example.com",
      "description": "pali pona mi",
      "sshKeyPath": "~/.ssh/id_ed25519_pona",
      "gpgKeyId": "PONA1234"
    },
    {
      "id": "jan-lawa",
      "icon": "👔",
      "name": "jan lawa",
      "service": "GitHub lawa",
      "email": "janlawa@lawa.example.com",
      "description": "pali lawa",
      "sshKeyPath": "~/.ssh/id_ed25519_lawa",
      "sshHost": "github-lawa",
      "gpgKeyId": "LAWA1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "jan pona",
      "service": "Bitbucket",
      "email": "janpona@bitbucket.example.com",
      "description": "pali Bitbucket",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "jan-musi",
      "icon": "🎮",
      "name": "jan musi",
      "service": "GitLab",
      "email": "janmusi@musi.example.com",
      "description": "musi pona"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "jan-pona",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

sona: pini ID (`jan-musi`) li jo ala e SSH—Git config taso li ante. GitLab account sama, commit nimi ante.

---

## sona settings (Configuration Reference)

### nimi ijo (Identity Properties)

| ijo           | wile | sona                                                       |
| ------------- | ---- | ---------------------------------------------------------- |
| `id`          | ✅   | nimi ante (example: `"jan-pona"`, `"jan-lawa"`)            |
| `name`        | ✅   | Git user.name — commit li jo e ni                          |
| `email`       | ✅   | Git user.email — commit li jo e ni                         |
| `icon`        |      | sitelen lon status bar (example: `"😊"`). sitelen wan taso |
| `service`     |      | nimi ilo (example: `"GitHub"`, `"GitLab"`). tawa UI        |
| `description` |      | sona lili tawa picker en tooltip                           |
| `sshKeyPath`  |      | nasin tawa SSH key len (example: `"~/.ssh/id_ed25519_lawa"`) |
| `sshHost`     |      | SSH config host nimi (example: `"github-lawa"`)            |
| `gpgKeyId`    |      | GPG key ID tawa commit sitelen                             |

#### lukin poka (Display Limitations)

- **status bar**: ~25 sitelen li ante tawa `...`
- **`icon`**: sitelen wan taso (grapheme cluster). sitelen mute li ken ala

### settings ale (General Settings)

| settings                            | open       | sona                                           |
| ----------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`          | lukin e ni | nimi ale                                       |
| `gitIdSwitcher.defaultIdentity`     | lukin e ni | nimi open                                      |
| `gitIdSwitcher.autoSwitchSshKey`    | `true`     | SSH key li ante                                |
| `gitIdSwitcher.showNotifications`   | `true`     | toki li kama                                   |
| `gitIdSwitcher.applyToSubmodules`   | `true`     | submodule li kama jo e nimi                    |
| `gitIdSwitcher.submoduleDepth`      | `1`        | submodule suli (1-5)                           |
| `gitIdSwitcher.includeIconInGitConfig` | `false` | sitelen li tawa Git config `user.name`         |
| `gitIdSwitcher.logging.fileEnabled` | `false`    | file logging li open (tawa lukin)              |
| `gitIdSwitcher.logging.filePath`    | `""`       | nasin file log                                 |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | file log suli (bytes, 1MB-100MB)               |
| `gitIdSwitcher.logging.maxFiles`    | `5`        | file log nanpa (1-20)                          |
| `gitIdSwitcher.logging.level`       | `"INFO"`   | logging suli (DEBUG/INFO/WARN/ERROR/SECURITY)  |
| `gitIdSwitcher.commandTimeouts`     | `{}`       | ilo weka tenpo (ms, 1s-5min)                   |

#### sona `includeIconInGitConfig`

`icon` li lon la, pali ni:

| ijo | pali |
|-----|------|
| `false` (open) | `icon` li lon UI taso. `name` taso li tawa Git config |
| `true` | `icon + name` li tawa Git config. sitelen li lon commit |

example: `icon: "👤"`, `name: "jan pona"`

| includeIconInGitConfig | Git config `user.name` | commit sitelen |
|------------------------|------------------------|----------------|
| `false` | `jan pona` | `jan pona <email>` |
| `true` | `👤 jan pona` | `👤 jan pona <email>` |

### sona: nasin lili (SSH ala)

sina wile ala e SSH key ante la (example: GitHub account sama, commit nimi ante), o kepeken nasin lili:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "jan-pona",
      "icon": "😊",
      "name": "jan pona",
      "email": "janpona@pona.example.com",
      "description": "pali pona mi"
    },
    {
      "id": "jan-lawa",
      "icon": "👔",
      "name": "jan lawa",
      "email": "janlawa@lawa.example.com",
      "description": "pali lawa"
    }
  ]
}
```

ni li ante e `git config user.name` en `user.email` taso.

---

## nasin pali (How It Works)

### Git Config linja (Git Config Layer Structure)

Git config li jo e linja tu wan; anpa li ante e sewi:

```text
System (/etc/gitconfig)
    ↓ ante
Global (~/.gitconfig)
    ↓ ante
Local (.git/config)  ← suli
```

**Git ID Switcher li sitelen lon `--local` (repo local).**

ni li tan:

- nimi li lon repo ale `.git/config` file
- repo ale li ken jo e nimi ante
- global settings (`~/.gitconfig`) li ante ala

### nimi ante pali (Identity Switching Behavior)

nimi ante la, ilo li pali (nanpa):

1. **Git Config** (lon): `git config --local user.name` en `user.email` li ante
2. **SSH Key** (`sshKeyPath` li lon): ssh-agent li kama jo e key ni, weka e key ante
3. **GPG Key** (`gpgKeyId` li lon): `git config --local user.signingkey` li ante, sitelen li open
4. **Submodule** (open): submodule ale li kama jo e settings (open: linja wan)

### submodule pana (Submodule Propagation Mechanism)

local config li lon repo taso. submodule li kama jo ala.
ni la ilo ni li pana e nimi tawa submodule (o lukin e "suli: Submodule").

---

## suli: Submodule (Advanced: Submodule Support)

repo suli li jo e Git submodule la, nimi ante li ike. sina commit lon submodule la, Git li kepeken submodule local config; li lon ala la, global config li kama (email ike!).

**Git ID Switcher** li alasa e submodule, li pana e nimi.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: ni li open/pini
- `submoduleDepth`: suli?
  - `1`: submodule open taso (mute)
  - `2+`: submodule lon submodule

ni la nimi sina li pona, repo suli anu vendor repo.

---

## ike en pona (Troubleshooting)

### SSH key li ante ala?

1. `ssh-agent` li pali:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. key nasin li pona:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. macOS la, Keychain li kama jo:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_lawa
   ```

### push la, nimi ike?

1. remote URL li kepeken host pona:

   ```bash
   git remote -v
   # lawa repo la git@github-lawa:... li lon
   ```

2. o ante:

   ```bash
   git remote set-url origin git@github-lawa:lawa/repo.git
   ```

### GPG sitelen li pali ala?

1. GPG key ID:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. sitelen test:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. nimi email en GPG key email li sama.

### nimi li lon ala?

- sina lon Git repo
- `settings.json` li jo ala e ike syntax
- VS Code window reload (`Cmd+Shift+P` → "Reload Window")

### `name` ijo li ike?

`name` ijo li jo e sitelen ni la, ike li kama:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

sina wile e nimi ilo la, o kepeken `service` ijo.

```jsonc
// IKE
"name": "jan pona (pona)"

// PONA
"name": "jan pona",
"service": "GitHub"
```

### settings sin li lon ala?

ilo ante la, settings sin li lon ala lon settings.

**pona**: o open sin e ilo ale.

VS Code li jo e settings schema lon memory. "Reload Window" anu reinstall li ken ala.

### open ijo (identities etc.) li lon ala?

install sin la, example settings li lon ala la, **Settings Sync** li ken tan.

tenpo pini la, settings ala li lon la, cloud sync li ante e open ijo.

**pona:**

1. o alasa e settings lon settings
2. sitelen gear → "Reset Setting"
3. Settings Sync (settings pini li weka lon cloud)

---

## nimi toki pona (Vocabulary)

| toki pona | English | Meaning |
|-----------|---------|---------|
| jan | person | person, human |
| pona | good | good, simple, positive |
| lawa | head, leader | to lead, control |
| sona | knowledge | to know, knowledge |
| musi | fun | fun, play, art |
| pali | work | to do, make, work |
| ilo | tool | tool, machine |
| ante | different | to change, different |
| nimi | name, word | name, word |

---

## ilo (Commands)

| ilo                             | sona                     |
| ------------------------------- | ------------------------ |
| `Git ID: Select Identity`       | o kama jo e nimi         |
| `Git ID: Show Current Identity` | o lukin e nimi sina      |

---

## nasin pali (Design Philosophy)

> "mi seme?" — wile ni taso li jo e toki.

**nasin Karesansui** li lon: insa pi lili en pona (linja 100),
pona wawa (90% li lon, lipu, tenpo awen) li lon poka,
wile ala li lon (GitHub API ala, ilo token ala).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[o lukin e nasin pali ale](../../DESIGN_PHILOSOPHY.md)

---

## pana (Contributing)

sina ken pana! o lukin e [CONTRIBUTING.md](../../CONTRIBUTING.md).

## lawa (License)

MIT License - o lukin e [LICENSE](../../../LICENSE).

## jan pali (Credits)

[Null;Variant](https://github.com/nullvariant) li pali e ni.

---

✨ **pona tawa sina!** ✨

*(Good to you! / Take care!)*
