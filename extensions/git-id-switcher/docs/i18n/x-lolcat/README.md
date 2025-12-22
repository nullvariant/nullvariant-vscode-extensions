# Git ID Switcher 🐱

> **I CAN HAZ MULTIPLE IDENTITIEZ?** YES U CAN!

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      SWITCH BETWEN UR MULTIPLE GIT IDENTITIEZ WIF WUN CLIK. MANAGE LOTZ OF GITHUB ACCOUNTZ, SSH KEYZ, GPG SININ, AN <b>AUTOMAGICALLY APPLY IDENTITY 2 GIT SUBMODULEZ</b>. KTHXBAI!
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 LANGUAGEZ: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> ... <a href="../../LANGUAGES.md">+20 MOAR</a>
    </td>
  </tr>
</table>

<br>

<img src="demo.png" width="600" alt="Demo">

## FEATUREZ 😺

- **WUN-CLIK IDENTITY SWITCH**: CHANGE UR GIT USER.NAME AN USER.EMAIL LIEK SPEEDEE CAT
- **SSH KEY MANAGEMINT**: AUTOMAGICALLY SWITCH UR SSH KEYZ IN SSH-AGENT
- **GPG SININ SUPPORT**: CONFIGURE UR GPG KEY 4 COMMIT SININ (OPSHUNUL)
- **SUBMODULE SUPPORT**: AUTOMAGICALLY PROPAGATE UR IDENTITY 2 GIT SUBMODULEZ
- **STATUS BAR**: ALWAYZ C UR CURRENT IDENTITY AT A GLANS
- **RICH TOOLTIPZ**: DETAILD IDENTITY INFO WIF DESCRIPSHUN AN SSH HOST
- **CROSS-PLATFORM**: WERKZ ON MACOS, LINUX, AN WINDOWZ - ALL TEH BOXEZ!
- **LOCALIZD**: SUPPORTZ 17 LANGUAGEZ PLUS LOLCAT!

## 🚀 Y DIS EXTENSHUN?

WILE MANY GIT IDENTITY SWITCHERZ EXIST, **GIT ID SWITCHER** SOLVEZ TEH HARD PROBLEMZ:

1. **SUBMODULEZ NITEMARE**: WERKIN WIF REPOSITORIEZ DAT HAZ SUBMODULEZ USUALLY REQUIREZ SETTIN `git config user.name` MANUALLY 4 *EACH* SUBMODULE. DIS EXTENSHUN HANDLEZ IT BY RECURSIVELY APPLYIN UR IDENTITY 2 ALL ACTIVE SUBMODULEZ. SO SMRT!
2. **SSH & GPG HANDLIN**: IT DONT JUS CHANGE UR NAEM; IT SWAPZ UR SSH KEYZ IN TEH AGENT AN CONFIGUREZ GPG SININ SO U NEVR COMMIT WIF TEH RONG SIGNATUR. NO MOAR FAILZ!

## 🌏 BOUT MULTILINGUAL SUPPORT

> **I VALUEZ TEH EXISTENS OF MINORITIEZ.**
> I DONT WANT 2 DISCARD DEM JUS CUZ DEY R SMOL IN NUMBR.
> EVEN IF TRANSLASHUNZ ARNT PERFICT, I HOEP U CAN FEEL OUR INTENT 2 SHOW RESPEKT!

---

## QUICK START 🐾

TIPICAL SETUP 4 MANAGIN PURSONAL ACCOUNT AN COMPANY ACCOUNT (ENTERPRISE MANAGED USUR). MOST IMPORTINT THINGZ!

### STEP 1: PREPAR UR SSH KEYZ

```bash
# CEILING CAT (WATCHIN U CODE)
ssh-keygen -t ed25519 -C "ceiling@cat.example.com" -f ~/.ssh/id_ed25519_ceiling

# KEYBOARD CAT (MAKIN TEH CODEZ)
ssh-keygen -t ed25519 -C "keyboard@cat.example.com" -f ~/.ssh/id_ed25519_keyboard
```

AFTR U MAK TEH KEYZ, REGISTAR UR PUBLIK KEYZ (`.pub`) 2 EACH SERVIS (GITHUB, GITLAB, BITBUCKET, ETC.). IMPORTINT!

### STEP 2: CONFIGUR SSH

EDIT `~/.ssh/config`:

```ssh-config
# CEILING CAT ACCOUNT (GITHUB)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_ceiling
    IdentitiesOnly yes

# KEYBOARD CAT ACCOUNT (GITHUB)
Host github-keyboard
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_keyboard
    IdentitiesOnly yes

# NYAN CAT ACCOUNT (BITBUCKET)
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_nyan
    IdentitiesOnly yes
```

### STEP 3: CONFIGUR TEH EXTENSHUN

OPEN **EXTENSHUN SETTINGZ** AN CONFIGUR UR IDENTITIEZ IN `gitIdSwitcher.identities`:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "ceiling-cat",
      "icon": "😼",
      "name": "Ceiling Cat",
      "email": "ceiling@cat.example.com",
      "description": "WATCHIN U CODE",
      "sshKeyPath": "~/.ssh/id_ed25519_ceiling",
      "service": "github"
    },
    {
      "id": "keyboard-cat",
      "icon": "🎹",
      "name": "Keyboard Cat",
      "email": "keyboard@cat.example.com",
      "description": "PLAY HIM OFF",
      "sshKeyPath": "~/.ssh/id_ed25519_keyboard",
      "sshHost": "github-keyboard",
      "service": "github"
    },
    {
      "id": "grumpy-cat",
      "icon": "😾",
      "name": "Grumpy Cat",
      "email": "grumpy@cat.example.com",
      "description": "I HAD FUN ONCE. IT WUZ AWFUL.",
      "service": "gitlab"
    },
    {
      "id": "nyan",
      "icon": "🌈",
      "name": "Nyan Cat",
      "email": "nyan@cat.example.com",
      "description": "NYANYANYANYANYA",
      "service": "bitbucket"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "ceiling-cat",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### STEP 4: DO TEH THING

1. CLIK TEH IDENTITY ICON IN TEH STATUS BAR
2. PIK UR IDENTITY
3. INVISIBLE IDENTITY SWITCH! U CANT C IT BUT ITS DERE!

---

## OPSHUNUL: GPG SININ

IF U WANT 2 SIGN UR COMMITS WIF GPG (LIEK A FANCY CAT):

### STEP 1: FIND UR GPG KEY ID

```bash
gpg --list-secret-keys --keyid-format SHORT
```

EXAMPL OUTPUT:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Ceiling Cat <ceiling@cat.example.com>
```

UR KEY ID IZ `ABCD1234`. REMEMBR IT!

### STEP 2: ADD GPG KEY 2 UR IDENTITY

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "ceiling-cat",
      "icon": "😼",
      "name": "Ceiling Cat",
      "service": "GitHub",
      "email": "ceiling@cat.example.com",
      "description": "WATCHIN U CODE",
      "sshKeyPath": "~/.ssh/id_ed25519_ceiling",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

WEN U SWITCH 2 DIS IDENTITY, TEH EXTENSHUN SETZ:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

KTHXBAI! UR COMMITS R NOW SIGNED LIEK A BOSS CAT!

---

## FULL EXAMPL: 4 ACCOUNTZ WIF SSH + GPG (MOAR CATZ)

ALL TEH THINGZ COMBIND! HEER IZ FULL EXAMPL:

### SSH CONFIG (`~/.ssh/config`)

```ssh-config
# CEILING CAT ACCOUNT (DEFALT)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_ceiling
    IdentitiesOnly yes

# KEYBOARD CAT ACCOUNT (COMPANY EMU)
Host github-keyboard
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_keyboard
    IdentitiesOnly yes

# NYAN CAT ACCOUNT (BITBUCKET)
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_nyan
    IdentitiesOnly yes
```

### EXTENSHUN CONFIG

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "ceiling-cat",
      "icon": "😼",
      "name": "Ceiling Cat",
      "service": "GitHub",
      "email": "ceiling@cat.example.com",
      "description": "PURSONAL - WATCHIN U CODE",
      "sshKeyPath": "~/.ssh/id_ed25519_ceiling",
      "gpgKeyId": "CEILING1"
    },
    {
      "id": "keyboard-cat",
      "icon": "🎹",
      "name": "Keyboard Cat",
      "service": "GitHub COMPANY",
      "email": "keyboard@company_ceiling-cat.example.com",
      "description": "COMPANY (EMU) - PLAY HIM OFF",
      "sshKeyPath": "~/.ssh/id_ed25519_keyboard",
      "sshHost": "github-keyboard",
      "gpgKeyId": "KEYBOARD1"
    },
    {
      "id": "nyan-cat",
      "icon": "🪣",
      "name": "Nyan Cat",
      "service": "Bitbucket",
      "email": "nyan@cat.example.com",
      "description": "BITBUCKET - NYANYANYA",
      "sshKeyPath": "~/.ssh/id_ed25519_nyan",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "grumpy-cat",
      "icon": "😾",
      "name": "Grumpy Cat",
      "service": "GitLab",
      "email": "grumpy@freelance.example.com",
      "description": "FREELANS - I HAD FUN ONCE"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "ceiling-cat",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

NOTE: TEH LAST IDENTITY (`grumpy-cat`) HAZ NO SSH. U CAN USE DIS 4 SWITCHIN JUSS GIT CONFIG (LIEK DIFFRNT COMITTR INFO ON SAEM ACCOUNT).

---

## FAMOUS CAT MEMEZ EXPLANED 📚

| CAT | MEME ORIGIN | Y FAMOUS |
|-----|-------------|----------|
| 😼 Ceiling Cat | 2006 image macro | "Ceiling Cat iz watchin u" - teh original all-seeing cat |
| 🎹 Keyboard Cat | 1984 video, viral 2007 | Played ppl off wen dey fail |
| 😾 Grumpy Cat | Tardar Sauce, 2012 | "I had fun once. It was awful." RIP 2019 |
| 🌈 Nyan Cat | 2011 YouTube video | Pop-Tart cat flyin thru space wif rainbowz |

---

## IDENTITY PROPERTIEZ

| PROPRTY | REQIRED | DESCRIPSHUN |
|---------|---------|-------------|
| `id` | ✅ | UNIQ IDENTIFYR 4 DIS IDENTITY |
| `name` | ✅ | GIT `user.name` (SHOWZ IN COMMITS) |
| `email` | ✅ | GIT `user.email` |
| `icon` | ❌ | SINGUL EMOJI 4 STATUS BAR. EMOJI ONLY! NO TEXTIE! |
| `description` | ❌ | DESCRIPSHUN (SHOWZ IN DROPDOWN) |
| `sshKeyPath` | ❌ | PATH 2 SSH PRIVAT KEY |
| `sshHost` | ❌ | SSH HOST ALIAS (`Host` IN ~/.ssh/config) |
| `gpgKeyId` | ❌ | GPG KEY ID 4 COMMIT SININ |
| `service` | ❌ | GIT SERVIS: `github`, `gitlab`, `bitbucket`, `other` |

---

## COMMANDZ

| COMMAND                         | WAT IT DOEZ                    |
| ------------------------------- | ------------------------------ |
| `Git ID: Select Identity`       | OPEN TEH IDENTITY PIKR         |
| `Git ID: Show Current Identity` | SHOW CURRENT IDENTITY INFO     |

---

## SETTINGZ

| SETTIN | DEFALT | DESCRIPSHUN |
|--------|--------|-------------|
| `gitIdSwitcher.identities` | `[]` | LIST OF IDENTITIEZ |
| `gitIdSwitcher.defaultIdentity` | `""` | DEFALT IDENTITY ID |
| `gitIdSwitcher.autoSwitchSshKey` | `true` | AUTOMAGICALLY SWITCH SSH KEYZ |
| `gitIdSwitcher.applyToSubmodules` | `true` | APPLY IDENTITY 2 SUBMODULEZ |
| `gitIdSwitcher.includeIconInGitConfig` | `false` | INCLUD EMOJI IN GIT CONFIG (C BELOW) |

---

## DISPLAY LIMITASHUNZ

- **`icon` PROPRTY**: ONLY SINGUL EMOJI! NO TEXTIE LIEK "🐱 CAT". JUS "🐱".
- **`includeIconInGitConfig`**: WHEN DISABLD (DEFALT), EMOJI NOT ADED 2 GIT CONFIG USER.NAME.

---

## `includeIconInGitConfig` SETTIN

DIS SETTIN CONTROLZ IF EMOJI IZ ADED 2 GIT `user.name`.

| SETTIN | BEHAVYR |
|--------|---------|
| `false` (DEFALT) | GIT CONFIG: `user.name = Ceiling Cat` (NO EMOJI IN CONFIG) |
| `true` | GIT CONFIG: `user.name = 😼 Ceiling Cat` (EMOJI IN CONFIG) |

> **NOTE**: EMOJI ALWAYZ SHOWZ IN STATUS BAR REGARDLES OF DIS SETTIN! DIS ONLY AFFEKTS GIT CONFIG.

---

## GIT CONFIG LAYR STRUCTUR

### HOW GIT CONFIG WERKZ

GIT CONFIG HAZ 3 LAYERZ, LIEK A SANDWICH:

```text
SYSTEM (/etc/gitconfig)
   ↓ OVERRIDEN BY
GLOBAL (~/.gitconfig)
   ↓ OVERRIDEN BY
LOCAL (.git/config)  ← DIS EXTENSHUN WRITZ HEER WIF `--local`
```

### SUBMODULE PROPAGASHUN

LOKAL SETTINGZ R PER-REPOSITRY, SO SUBMODULEZ DONT AUTOMAGICALLY GET DEM.
DAT Y DIS EXTENSHUN HAZ PROPAGASHUN FEATUR (C "ADVANSED: SUBMODULE SUPPORT" SEKSHUN).

---

## ADVANSED: SUBMODULE SUPPORT

WEN U HAZ KOMPLEKS REPOSITORIEZ WIF GIT SUBMODULEZ, IDENTITY MANAGEMINT CAN B ANNOYIN. WEN U COMMIT INSIED A SUBMODULE, GIT USES DAT SUBMODULE'Z LOKAL CONFIG, AN IF NOT SET, IT FALLZ BAK 2 GLOBAL CONFIG (RONG EMAEL ADRES!).

**GIT ID SWITCHER** AUTOMAGICALLY DETEKTZ SUBMODULEZ AN APPLIEZ UR SELECTED IDENTITY.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: ENABL/DISABL DIS FEATUR
- `submoduleDepth`: HOW DEEP 2 GO?
  - `1`: ONLY DIRECT SUBMODULEZ (MOST COMMON)
  - `2+`: NESTED SUBMODULEZ (SUBMODULE INSIED SUBMODULE - INCEPTSHUN!)

DIS WAI, WHETHER U COMMIT IN MAIN REPO OR IN VENDOR LIBRARY, UR IDENTITY IZ ALWAYZ CORREKT. NO MOAR EMBARASING COMMITS!

---

## TROUBLESHOOTIN

### "NAME FEELD IZ REQIRED" ERUR

IF U C DIS ERUR, CHEEK UR SETTINGZ:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "ceiling-cat",
      "name": "Ceiling Cat",  // ← DIS IZ REQIRED!
      "email": "ceiling@cat.example.com"  // ← DIS 2!
    }
  ]
}
```

BOTH `name` AN `email` R REQIRED. CANT HAZ IDENTITY WITHOUT DEM!

### NEW SETTINGZ NOT SHOWIN

IF NEW SETTINGZ LIEK `service` OR `includeIconInGitConfig` NOT SHOWIN:

1. **RELOAD WINDOE**: PRES `Cmd+Shift+P` (MAC) OR `Ctrl+Shift+P` (WINDOWZ/LINUX)
2. **TIPE**: "Developr: Reload Window"
3. **PRES ENTR**

VS CODE CACHZ SETTIN SKEEMAZ. RELOAD FIXEZ IT!

### SETTINGZ SYNC CONFLICTZ

IF U USE VS CODE SETTINGZ SYNC AN HAZ DIFFRNT IDENTITIEZ ON DIFFRNT MASHINEZ:

1. **OPSHUN A**: DISABL SYNC 4 DIS EXTENSHUN SETTINGZ
2. **OPSHUN B**: USE SAEM IDENTITIEZ ON ALL MASHINEZ
3. **OPSHUN C**: USE WORKSPASE SETTINGZ (`.vscode/settings.json`) INSTED

> **TIP**: WORKSPASE SETTINGZ R PUR-PROJEKT AN DONT SYNC. GUD 4 DIFFRNT IDENTITIEZ!

---

## CONTRIBUTIN

WE WELCOM CONTRIBUSHUNZ! C [CONTRIBUTING.md](../../CONTRIBUTING.md). DO WANT!

## LICENS

MIT LICENS - C [LICENSE](../../LICENSE). FREE LIEK FREDUM!

## CREDITZ

MADE BY [Null;Variant](https://github.com/nullvariant)

---

🐱 **KTHXBAI!** 🐱
