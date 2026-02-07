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
      luka wan la, sina ante e nimi mute lon Git. GitHub account mute, SSH key, GPG sitelen li pona. <b>Git Submodule li kama jo e nimi</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <b>✨</b> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tok/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 tan seme la ilo Git ID Switcher?

ilo ante mute li lon. taso **Git ID Switcher** li pona tan ni: ona li weka e ike suli:

1. **submodule ike**: submodule li lon repo sina la (e.g., Hugo theme, vendor library), sina wile pana e `git config user.name` tawa submodule _ale_. ilo ni li pana e nimi tawa submodule ale.
2. **SSH en GPG**: ilo ni li ante e nimi taso ala. ona li ante e SSH key lon ssh-agent, li pana e GPG sitelen. ni la, sina sitelen ike ala lon commit.

## ijo pona (Features)

- **nimi ante UI**: settings.json ante ala la, nimi sin, ante, weka, nanpa ante li ken
- **luka wan la nimi ante**: Git user.name en user.email li ante lon tenpo lili
- **status bar**: nimi sina li lon status bar lon tenpo ale
- **submodule pona**: Git submodule li kama jo e nimi
- **SSH key**: ssh-agent SSH key li ante
- **GPG sitelen**: GPG key li pona tawa commit sitelen (wile ala)
- **sona mute tooltip**: description en SSH host li lon
- **ma ale**: macOS, Linux, Windows
- **toki mute**: toki 17

## 🌏 toki lili

> **mi olin e kulupu lili.**
> mi wile ala weka e ona tan ni: ona li lili.
> toki mi li pona ala la, mi wile e ni: sina sona e wile mi. mi wile pana e sona mi: toki lili li lon, mi pilin pona tawa ona.

ilo ni li jo e toki 17 pi VS Code. lipu README la, mi mute li lukin pali e toki pi kulupu lili en toki musi.

ni li "ilo pi toki ale" taso ala—ni li "pilin pona tawa toki ale." toki ale la, ma ale la, jan pali li pana e commit pona tawa ma... mi wile e ni: ilo ni li nasin pona tawa ni.

---

## open (Quick Start)

ni li nasin pona tawa jan pona account en jan lawa account (Enterprise Managed User).

### nanpa wan: SSH key

o pali e SSH key (sina jo la o ante ala):

```bash
# jan pona
ssh-keygen -t ed25519 -C "mun@personal.example.com" -f ~/.ssh/id_ed25519_personal

# jan lawa
ssh-keygen -t ed25519 -C "mun@company.example.com" -f ~/.ssh/id_ed25519_work
```

SSH key **key open** (`.pub` file) o pana tawa GitHub account.

> **sona**: GitHub li kama jo e `id_ed25519_personal.pub` (key open). `id_ed25519_personal` (ala .pub) li key len—o pana ala tawa jan ante!

### nanpa tu: SSH config

`~/.ssh/config` o ante:

```ssh-config
# jan pona GitHub account (open)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# jan lawa GitHub account
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### nanpa tu wan: ilo ni

ilo o open la, nimi lukin li lon. o ante e ona tawa sina.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tok/first-ux.webp" width="600" alt="open nasin (nanpa 13): status bar la nimi ante UI o open, o ante, o pali sin" loading="lazy">

> **key file li tawa ala**: SSH key la, key nasin (ma) taso li lon. key insa li tawa ala ma ante!

> **GPG sitelen la**: nimi ante UI la `gpgKeyId` li ken lon.
> GPG key ID nasin "[ike en pona](#gpg-sitelen-li-pali-ala)" o lukin.

> **sona**: settings.json la, sina ken ante.
> settings o open (`Cmd+,` / `Ctrl+,`) → "Git ID Switcher" o alasa → "Edit in settings.json" o luka.
> JSON nasin "[sona ale: 5 account SSH + GPG](#sona-ale-5-account-ssh--gpg)" o lukin.

---

## sona ale: 5 account SSH + GPG

ale li lon ni:

### SSH Config (`~/.ssh/config`)

```ssh-config
# jan pona account (open)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# jan lawa account (Enterprise Managed User)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# kulupu mani A (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# kulupu mani B (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# pali open (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### ilo settings

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "jan Mun",
      "email": "mun@personal.example.com",
      "service": "GitHub",
      "icon": "☀️",
      "description": "pali mi",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "jan Mun",
      "email": "mun@techcorp.example.com",
      "service": "GitHub pali",
      "icon": "🌙",
      "description": "TechCorp pali suli",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "jan Mun",
      "email": "mun@clienta.example.com",
      "service": "Bitbucket",
      "icon": "💧",
      "description": "ClientA pali",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "M.Mun",
      "email": "m.mun@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🔥",
      "description": "ClientB lon ma",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "mun-dev",
      "email": "mun.dev@example.com",
      "service": "GitLab",
      "icon": "🌿",
      "description": "pana tawa OSS",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

sona: nimi nanpa 4 (`client-b`) li nimi lili. nimi nanpa 5 (`oss`) li nimi pali. jan sama la, nimi ante li ken lon nimi ante ale.

---

## nimi ante (Profile Management)

status bar o luka → nanpa pini "nimi ante" o luka → UI o open.
nimi sin, ante, weka, nanpa ante—ale li ken lon UI.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tok/identity-management.webp" width="600" alt="nimi ante: weka en nanpa ante nasin" loading="lazy">

command palette la, `Git ID Switcher: Delete Identity` li ken weka e nimi.

---

## ilo (Commands)

| ilo                                      | sona                |
| ---------------------------------------- | ------------------- |
| `Git ID Switcher: Select Identity`       | o kama jo e nimi    |
| `Git ID Switcher: Delete Identity`       | o weka e nimi       |
| `Git ID Switcher: Show Current Identity` | o lukin e nimi sina |
| `Git ID Switcher: Show Documentation`    | o lukin e lipu sona |

---

## sona settings (Configuration Reference)

### nimi ijo (Identity Properties)

| ijo           | wile | sona                                                         |
| ------------- | ---- | ------------------------------------------------------------ |
| `id`          | ✅   | nimi ante (example: `"personal"`, `"work-main"`)             |
| `name`        | ✅   | Git user.name — commit li jo e ni                            |
| `email`       | ✅   | Git user.email — commit li jo e ni                           |
| `icon`        |      | sitelen lon status bar (example: `"☀️"`). sitelen wan taso   |
| `service`     |      | nimi ilo (example: `"GitHub"`, `"GitLab"`). tawa UI          |
| `description` |      | sona lili tawa picker en tooltip                             |
| `sshKeyPath`  |      | nasin tawa SSH key len (example: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |      | SSH config host nimi (example: `"github-work"`)              |
| `gpgKeyId`    |      | GPG key ID tawa commit sitelen                               |

#### lukin poka (Display Limitations)

- **status bar**: ~25 sitelen li ante tawa `...`
- **`icon`**: sitelen wan taso (grapheme cluster). sitelen mute li ken ala

### settings ale (General Settings)

| settings                                   | open       | sona                                                |
| ------------------------------------------ | ---------- | --------------------------------------------------- |
| `gitIdSwitcher.identities`                 | lukin e ni | nimi ale                                            |
| `gitIdSwitcher.defaultIdentity`            | lukin e ni | nimi open                                           |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | SSH key li ante                                     |
| `gitIdSwitcher.showNotifications`          | `true`     | toki li kama                                        |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | submodule li kama jo e nimi                         |
| `gitIdSwitcher.submoduleDepth`             | `1`        | submodule suli (1-5)                                |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | sitelen li tawa Git config `user.name`              |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | file logging li open (tawa lukin)                   |
| `gitIdSwitcher.logging.filePath`           | `""`       | nasin file log                                      |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | file log suli (bytes, 1MB-100MB)                    |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | file log nanpa (1-20)                               |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | logging suli (DEBUG/INFO/WARN/ERROR/SECURITY)       |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | ni li lon la, ale li len lon lipu (tenpo pona suli) |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | ilo weka tenpo (ms, 1s-5min)                        |

#### sona `includeIconInGitConfig`

`icon` li lon la, pali ni:

| ijo            | pali                                                    |
| -------------- | ------------------------------------------------------- |
| `false` (open) | `icon` li lon UI taso. `name` taso li tawa Git config   |
| `true`         | `icon + name` li tawa Git config. sitelen li lon commit |

example: `icon: "👤"`, `name: "jan Mun"`

| includeIconInGitConfig | Git config `user.name` | commit sitelen       |
| ---------------------- | ---------------------- | -------------------- |
| `false`                | `jan Mun`              | `jan Mun <email>`    |
| `true`                 | `👤 jan Mun`           | `👤 jan Mun <email>` |

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

### SSH key sona (SSH Key Management Details)

Git ID Switcher li kepeken `ssh-agent` tawa SSH key:

| pali        | ilo                    |
| ----------- | ---------------------- |
| key o pana  | `ssh-add <keyPath>`    |
| key o weka  | `ssh-add -d <keyPath>` |
| key o lukin | `ssh-add -l`           |

**suli:** ilo ni li **ante ala** e `~/.ssh/config`. SSH config o ante lon luka sina ("open" nanpa tu o lukin).

### SSH settings li lon la (Existing SSH Configuration Interaction)

SSH settings li lon la, Git ID Switcher li pali ni:

| sina settings                         | Git ID Switcher pali                                 |
| ------------------------------------- | ---------------------------------------------------- |
| `~/.ssh/config` `IdentityFile` li lon | tu li ken; `IdentitiesOnly yes` li pona tawa ike ala |
| `GIT_SSH_COMMAND` li lon              | SSH ilo sina li lon; ssh-agent li pali               |
| `git config core.sshCommand` li lon   | sama sewi                                            |
| direnv SSH li lon                     | pona; ssh-agent li pali                              |

**pona**: SSH config la, `IdentitiesOnly yes` o lon. SSH li kepeken key mute ala.

### tan seme `IdentitiesOnly yes`?

ni ala la, SSH li alasa e key ni:

1. ssh-agent key (Git ID Switcher li pana)
2. `~/.ssh/config` key
3. key open (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, etc.)

ni la, key ike li ken kama.

`IdentitiesOnly yes` la, SSH li kepeken **key ni taso**. Git ID Switcher key li pona.

```ssh-config
# nasin pona
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← ni li suli
```

ni la, `github-work` host li kepeken `~/.ssh/id_ed25519_work` taso. key ante li lon ala.

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

ni la repo suli commit anu vendor repo commit—nimi sina li pona.

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
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### push la, nimi ike?

**repo sin clone:**

jan lawa repo o clone la, SSH config host nimi o kepeken:

```bash
# jan lawa (github-work nimi o kepeken)
git clone git@github-work:lawa/repo.git

# jan pona (github.com open o kepeken)
git clone git@github.com:mun/repo.git
```

**repo ni li lon la:**

1. remote URL li kepeken host nimi pona:

   ```bash
   git remote -v
   # jan lawa repo la git@github-work:... li lon
   ```

2. o ante:

   ```bash
   git remote set-url origin git@github-work:lawa/repo.git
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
"name": "jan Mun (pona)"

// PONA
"name": "jan Mun",
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

## nasin sona (Design Philosophy)

> "mi seme?" — wile ni taso li jo e toki.

**nasin Karesansui** li lon: insa pi lili en pona (linja 100),
pona wawa (90% li lon, lipu, tenpo awen) li lon poka,
wile ala li lon (GitHub API ala, ilo token ala).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[o lukin e nasin sona ale](../../DESIGN_PHILOSOPHY.md)

---

## pana (Contributing)

sina ken pana! o lukin e [CONTRIBUTING.md](../../CONTRIBUTING.md).

## lawa (License)

MIT License - o lukin e [LICENSE](../../../LICENSE).

## jan pali (Credits)

[Null;Variant](https://github.com/nullvariant) li pali e ni.

---

✨ **pona tawa sina!** ✨

_(Good to you! / Take care!)_
