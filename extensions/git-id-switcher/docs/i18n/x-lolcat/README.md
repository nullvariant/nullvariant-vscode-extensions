# Git ID Switcher 🐱

> **I CAN HAZ MULTIPLE IDENTITIEZ?** YES U CAN!

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      SWITCH BETWEN UR MULTIPLE GIT PROFILEZ WIF WUN CLIK. MANAGE LOTZ OF GITHUB ACCOUNTZ, SSH KEYZ, GPG SININ, AN <b>AUTOMAGICALLY APPLY PROFILE 2 GIT SUBMODULEZ</b>. KTHXBAI!
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <b>🐱</b> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-lolcat/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Y DIS EXTENSHUN?

WILE MANY GIT PROFILE SWITCHERZ EXIST, **GIT ID SWITCHER** SOLVEZ TEH HARD PROBLEMZ DAT OTHR TOOLZ MISS:

1. **SUBMODULEZ NITEMARE**: WERKIN WIF REPOSITORIEZ DAT HAZ SUBMODULEZ (LIEK HUGO TEMEZ, VENDOR LIBRARIEZ), U USUALLY HAZ 2 SET `git config user.name` MANUALLY 4 _EACH_ SUBMODULE. DIS EXTENSHUN SOLVEZ IT BY RECURSIVELY APPLYIN UR PROFILE 2 ALL ACTIVE SUBMODULEZ. SO SMRT!
2. **SSH & GPG HANDLIN**: IT DONT JUS CHANGE UR NAEM; IT SWAPZ UR SSH KEYZ IN SSH-AGENT AN CONFIGUREZ GPG SININ SO U NEVR COMMIT WIF TEH RONG SIGNATUR. NO MOAR FAILZ!

## FEATUREZ 😺

- **PROFILE MANAGEMINT UI**: ADD, EDIT, DELEET, AN REORDR PROFILEZ WITHOUT EDITIN settings.json. SO EZ!
- **WUN-CLIK PROFILE SWITCH**: CHANGE UR GIT USER.NAME AN USER.EMAIL LIEK SPEEDEE CAT
- **STATUS BAR**: ALWAYZ C UR CURRENT PROFILE AT A GLANS
- **SUBMODULE SUPPORT**: AUTOMAGICALLY PROPAGATE UR PROFILE 2 GIT SUBMODULEZ
- **SSH KEY MANAGEMINT**: AUTOMAGICALLY SWITCH UR SSH KEYZ IN SSH-AGENT
- **GPG SININ SUPPORT**: CONFIGURE UR GPG KEY 4 COMMIT SININ (OPSHUNUL)
- **RICH TOOLTIPZ**: DETAILD PROFILE INFO WIF DESCRIPSHUN AN SSH HOST
- **CROSS-PLATFORM**: WERKZ ON MACOS, LINUX, AN WINDOWZ - ALL TEH BOXEZ!
- **LOCALIZD**: SUPPORTZ 17 LANGUAGEZ!

## 🌏 BOUT MULTILINGUAL SUPPORT

> **I VALUEZ TEH EXISTENS OF MINORITIEZ.**
> I DONT WANT 2 DISCARD DEM JUS CUZ DEY R SMOL IN NUMBR.
> EVEN IF TRANSLASHUNZ ARNT PERFICT, I HOEP U CAN FEEL OUR INTENT 2 SHOW RESPEKT!

DIS EXTENSHUN SUPPORTZ ALL 17 LANGUAGEZ DAT VS CODE SUPPORTZ. AN 4 README DOCUMENTASHUN, WE ALSO CHALLENGD OURSELF 2 TRANSLAIT INTO MINORITY LANGUAGEZ AN JOKE LANGUAGEZ.

DIS IZ NOT JUS "GLOBAL SUPPORT"—DIS IZ "RESPEKT 4 LINGUISTIK DIVERSITEE." AN ACROSS ALL LANGUAGEZ, IN EVERY PLACE, DEVELOPRZ MAKIN TEH WURLD BETTR WIF COMMITS... I WANT DIS 2 BE DAT KIND OF INFRASTRUCTUR. DO WANT!

---

## QUICK START 🐾

TIPICAL SETUP 4 MANAGIN PURSONAL ACCOUNT AN COMPANY ACCOUNT (ENTERPRISE MANAGED USUR). MOST IMPORTINT THINGZ!

### STEP 1: PREPAR UR SSH KEYZ

FURST, MAEK SSH KEYZ 4 EACH ACCOUNT (IF U ALREADY HAZ DEM, SKIP DIS):

```bash
# PURSONAL
ssh-keygen -t ed25519 -C "ceiling@personal.example.com" -f ~/.ssh/id_ed25519_personal

# WERK
ssh-keygen -t ed25519 -C "ceiling.cat@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

REGISTAR UR **PUBLIK KEYZ** (`.pub` FILEZ) 2 EACH GITHUB ACCOUNT.

> **NOTE**: WAT U REGISTAR ON GITHUB IZ `id_ed25519_personal.pub` (PUBLIK KEY). `id_ed25519_personal` (NO EXTENSHUN) IZ TEH PRIVAT KEY—NEVR SHARE OR UPLOAD DIS! SRSLY!

### STEP 2: CONFIGUR SSH

EDIT `~/.ssh/config`:

```ssh-config
# PURSONAL GITHUB ACCOUNT (DEFALT)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# WERK GITHUB ACCOUNT
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### STEP 3: CONFIGUR TEH EXTENSHUN

AFTR U INSTALL, SAMPLE PROFILEZ R REDDY 4 U. FOLLOW DIS GUIDE 2 EDIT DEM 4 URSELF.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-lolcat/first-ux.webp" width="600" alt="FURST SETUP STEPS (13): OPEN PROFILE MANAGEMINT FROM STATUS BAR, EDIT AN CREEATE NEW PROFILEZ" loading="lazy">

> **UR KEY FILEZ R NOT SENT ANYWHER**: WEN U SET SSH KEY PATH, ONLY TEH FILE PATH (LOCASHUN) IZ RECORDD. TEH KEY FILE CONTENTS R NEVR UPLOADD OR SENT 2 EXTERNAL SERVISEZ. SAFETY FURST!

> **IF U WANT GPG SININ**: U CAN ALSO SET `gpgKeyId` IN TEH PROFILE EDIT SCREEN.
> 4 HOW 2 FIND UR GPG KEY ID, C "[TROUBLESHOOTIN](#gpg-sinin-not-werkin)". KTHX!

> **TIP**: U CAN ALSO CONFIGUR DIRECTLY FROM settings.json.
> OPEN EXTENSHUN SETTINGZ (`Cmd+,` / `Ctrl+,`) → SEARCH "Git ID Switcher" → CLIK "EDIT IN settings.json".
> 4 JSON FORMAT EXAMPLZ, C "[FULL EXAMPL](#full-exampl-5-accountz-wif-ssh--gpg)".

---

## FULL EXAMPL: 5 ACCOUNTZ WIF SSH + GPG

ALL TEH THINGZ COMBIND! HEER IZ FULL EXAMPL:

### SSH CONFIG (`~/.ssh/config`)

```ssh-config
# PURSONAL ACCOUNT (DEFALT)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# WERK ACCOUNT (COMPANY ENTERPRISE MANAGED USUR)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# CLIENT A WERK (BITBUCKET)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# CLIENT B WERK (BITBUCKET)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS STUFFZ (GITLAB)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### EXTENSHUN SETTINGZ

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Ceiling Cat",
      "email": "ceiling@personal.example.com",
      "service": "GitHub",
      "icon": "🐱",
      "description": "MAH STUFFZ",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Ceiling Cat",
      "email": "ceiling.cat@techcorp.example.com",
      "service": "GitHub Werk",
      "icon": "⌨️",
      "description": "TechCorp SRIUS BIZNESS",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Ceiling Cat",
      "email": "ceiling@clienta.example.com",
      "service": "Bitbucket",
      "icon": "😼",
      "description": "ClientA MOAR WERK",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "C.Cat",
      "email": "c.cat@clientb.example.com",
      "service": "Bitbucket",
      "icon": "😻",
      "description": "ClientB IN UR OFFICE",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "ceiling-dev",
      "email": "ceiling.dev@example.com",
      "service": "GitLab",
      "icon": "🐈",
      "description": "I CAN HAZ OSS",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

NOTE: TEH 4TH PROFILE (`client-b`) UZEZ SHORT NAEM, AN TEH 5TH (`oss`) UZEZ DEV HANDL. U CAN SET DIFFRNT DISPLAY NAEMZ 4 EACH PROFILE, EVEN 4 TEH SAEM PURSON. KTHX!

---

## PROFILE MANAGEMINT

CLIK TEH STATUS BAR → AT TEH BOTTOM OF TEH LIST, CLIK "PROFILE MANAGEMINT" 2 OPEN TEH MANAGEMINT SCREEN.
U CAN ADD, EDIT, DELEET, AN REORDR PROFILEZ ALL FROM TEH UI. NO MOAR EDITIN JSON!

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/x-lolcat/identity-management.webp" width="600" alt="PROFILE MANAGEMINT: DELEET AN REORDR OPERASHUNZ" loading="lazy">

U CAN ALSO DELEET PROFILEZ FROM COMMAND PALETTE: `Git ID Switcher: Delete Identity`. KTHX!

---

## COMMANDZ

| COMMAND                                  | WAT IT DOEZ               |
| ---------------------------------------- | ------------------------- |
| `Git ID Switcher: Select Identity`       | OPEN TEH PROFILE PIKR     |
| `Git ID Switcher: Delete Identity`       | DELEET A PROFILE          |
| `Git ID Switcher: Show Current Identity` | SHOW CURRENT PROFILE INFO |
| `Git ID Switcher: Show Documentation`    | SHOW TEH DOCUMENTZ        |

---

## SETTINGZ REFERENS

### PROFILE PROPERTIEZ

| PROPRTY       | REQIRED | DESCRIPSHUN                                                    |
| ------------- | ------- | -------------------------------------------------------------- |
| `id`          | ✅      | UNIQ IDENTIFYR (E.G., `"personal"`, `"work-main"`)             |
| `name`        | ✅      | GIT `user.name` — SHOWZ IN COMMITS                             |
| `email`       | ✅      | GIT `user.email` — SHOWZ IN COMMITS                            |
| `icon`        |         | EMOJI 4 STATUS BAR (E.G., `"🐱"`). SINGUL EMOJI ONLY!          |
| `service`     |         | SERVIS NAEM (E.G., `"GitHub"`, `"GitLab"`). UZED IN UI DISPLAY |
| `description` |         | SHORT DESCRIPSHUN 4 PIKR AN TOOLTIP                            |
| `sshKeyPath`  |         | PATH 2 SSH PRIVAT KEY (E.G., `"~/.ssh/id_ed25519_work"`)       |
| `sshHost`     |         | SSH CONFIG HOST ALIAS (E.G., `"github-work"`)                  |
| `gpgKeyId`    |         | GPG KEY ID 4 COMMIT SININ                                      |

#### DISPLAY LIMITASHUNZ

- **STATUS BAR**: IF LONGR DAN ~25 CHARACTERZ, IT GETZ TRUNCATD WIF `...`
- **`icon`**: SINGUL EMOJI (GRAPHEME CLUSTR) ONLY. NO MULTIPUL EMOJIZ OR LONG STRINGZ ALLOWD

### GLOBAL SETTINGZ

| SETTIN                                     | DEFALT     | DESCRIPSHUN                                                                                 |
| ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | C SAMPLEZ  | LIST OF PROFILEZ                                                                            |
| `gitIdSwitcher.defaultIdentity`            | C SAMPLEZ  | DEFALT PROFILE ID                                                                           |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | AUTOMAGICALLY SWITCH SSH KEYZ WEN CHANGIN PROFILEZ                                          |
| `gitIdSwitcher.showNotifications`          | `true`     | SHOW NOTIFICASHUN WEN SWITCHIN PROFILEZ                                                     |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | PROPAGATE PROFILE 2 GIT SUBMODULEZ                                                          |
| `gitIdSwitcher.submoduleDepth`             | `1`        | MAX DEPTH 4 NESTED SUBMODULEZ (1-5)                                                         |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | INCLUD EMOJI IN GIT CONFIG `user.name`                                                      |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | SAVE AUDIT LOGZ 2 FILE (RECORDZ PROFILE SWITCHEZ, SSH KEY OPERASHUNZ, ETC.)                 |
| `gitIdSwitcher.logging.filePath`           | `""`       | LOG FILE PATH (E.G., `~/.git-id-switcher/security.log`). EMPTY = DEFALT PATH                |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | MAX FILE SIEZ B4 ROTASHUN (BYTEZ, 1MB-100MB)                                                |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | NUMBR OF ROTATD LOG FILEZ 2 KEEP (1-20)                                                     |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | WEN ENABLD, ALL VALUEZ R MASKD IN LOGZ (MAXIMUMZ PRIVACYZ MODE)                             |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | LOG VERBOSITEE (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). RECORDZ SELECTD LEVL AN ABUV |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | CUSTOM TIEMOUTZ PER COMMAND (MS, 1S-5MIN). E.G., `{"git": 15000, "ssh-add": 10000}`         |

#### `includeIconInGitConfig` SETTIN

DIS CONTROLZ WAT HAPPENZ WEN U SET TEH `icon` FEELD:

| SETTIN           | BEHAVYR                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `false` (DEFALT) | `icon` ONLY SHOWZ IN EDITR UI. ONLY `name` IZ RITTN 2 GIT CONFIG     |
| `true`           | `icon + name` IZ RITTN 2 GIT CONFIG. EMOJI SHOWZ IN COMMIT HISTORY 2 |

EXAMPL: `icon: "🐱"`, `name: "Ceiling Cat"`

| includeIconInGitConfig | GIT CONFIG `user.name` | COMMIT SIGNATUR          |
| ---------------------- | ---------------------- | ------------------------ |
| `false`                | `Ceiling Cat`          | `Ceiling Cat <email>`    |
| `true`                 | `🐱 Ceiling Cat`       | `🐱 Ceiling Cat <email>` |

---

## HOW IT WERKZ

### GIT CONFIG LAYR STRUCTUR

GIT CONFIG HAZ 3 LAYERZ, LIEK A LASAGNA. BOTTOM GETZ OVERRIDN BY TOP:

```text
SYSTEM (/etc/gitconfig)
    ↓ OVERRIDN BY
GLOBAL (~/.gitconfig)
    ↓ OVERRIDN BY
LOCAL (.git/config)  ← HIGHEST PRIORITEE
```

**GIT ID SWITCHER WRITZ 2 `--local` (REPOSITRY LOCAL).**

DAT MEENZ:

- SAVEZ PROFILE IN EACH REPOSITRY'Z `.git/config`
- U CAN HAZ DIFFRNT PROFILEZ 4 EACH REPOSITRY
- GLOBAL SETTINGZ (`~/.gitconfig`) R NOT MODIFYD

### PROFILE SWITCHIN BEHAVYR

WEN U SWITCH PROFILEZ, TEH EXTENSHUN DOEZ DEEZ THINGZ (IN ORDR):

1. **GIT CONFIG** (ALWAYZ): SETZ `git config --local user.name` AN `user.email`
2. **SSH KEY** (WEN `sshKeyPath` IZ SET): REMOVEZ OTHR KEYZ FROM SSH-AGENT, ADDZ SELECTD KEY
3. **GPG KEY** (WEN `gpgKeyId` IZ SET): SETZ `git config --local user.signingkey` AN ENABLZ SININ
4. **SUBMODULEZ** (WEN ENABLD): PROPAGATEZ SETTINGZ 2 ALL SUBMODULEZ (DEFALT: DEPTH 1)

### SUBMODULE PROPAGASHUN

LOCAL SETTINGZ R PER-REPOSITRY, SO SUBMODULEZ DONT AUTOMAGICALLY GET DEM.
DAT Y DIS EXTENSHUN HAZ PROPAGASHUN FEATUR (C "ADVANSED: SUBMODULE SUPPORT" SEKSHUN).

### SSH KEY MANAGEMINT DETAILZ

GIT ID SWITCHER MANAGEZ SSH KEYZ THRU `ssh-agent`:

| OPERASHUN  | COMMAND EXECUTD        |
| ---------- | ---------------------- |
| ADD KEY    | `ssh-add <keyPath>`    |
| REMOVE KEY | `ssh-add -d <keyPath>` |
| LIST KEYZ  | `ssh-add -l`           |

**IMPORTINT:** DIS EXTENSHUN DOEZ **NOT** MODIFY `~/.ssh/config`. U HAZ 2 CONFIGUR SSH CONFIG MANUALLY (C "QUICK START" STEP 2). KTHX!

### EXISTIN SSH SETTINGZ

IF U ALREADY HAZ SSH SETTINGZ, GIT ID SWITCHER WERKZ LIEK DIS:

| UR SETTIN                          | GIT ID SWITCHER BEHAVYR                                  |
| ---------------------------------- | -------------------------------------------------------- |
| `~/.ssh/config` WIF `IdentityFile` | BOTH CAN B UZED; `IdentitiesOnly yes` PREVENTZ CONFLICTZ |
| ENV VAR `GIT_SSH_COMMAND` SET      | UR CUSTOM SSH COMMAND IZ UZED; SSH-AGENT STILL WERKZ     |
| `git config core.sshCommand` SET   | SAEM AZ ABUV                                             |
| DIRENV WIF SSH ENV VARZ            | CAN COEXIST; SSH-AGENT WERKZ INDEPENDNTLY                |

**RECOMENDASHUN:** ALWAYZ SET `IdentitiesOnly yes` IN UR SSH CONFIG. DIS PREVENTZ SSH FROM TRYIN MULTIPUL KEYZ.

### Y `IdentitiesOnly yes`?

WITHOUT DIS SETTIN, SSH MAI TRY KEYZ IN DIS ORDR:

1. KEYZ LOADD IN SSH-AGENT (MANAGD BY GIT ID SWITCHER)
2. KEYZ SPECIFYD IN `~/.ssh/config`
3. DEFALT KEYZ (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, ETC.)

DIS CAN CAUZ AUTHENTICASHUN FAILURZ OR UZIN TEH RONG KEY. NOT GUD!

WIF `IdentitiesOnly yes`, SSH UZEZ **ONLY TEH SPECIFYD KEY**. DIS ENSURZ TEH KEY SET BY GIT ID SWITCHER IZ UZED.

```ssh-config
# RECOMENDID SETTIN
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← DIS LIEN IZ IMPORTINT!
```

WIF DIS SETTIN, CONEKTIN 2 `github-work` HOST ONLY UZEZ `~/.ssh/id_ed25519_work`. NO OTHR KEYZ R TRYD.

---

## ADVANSED: SUBMODULE SUPPORT

WEN U HAZ KOMPLEKS REPOSITORIEZ WIF GIT SUBMODULEZ, PROFILE MANAGEMINT CAN B ANNOYIN. WEN U COMMIT INSIED A SUBMODULE, GIT UZEZ DAT SUBMODULE'Z LOCAL CONFIG, AN IF NOT SET, IT FALLZ BAK 2 GLOBAL CONFIG (RONG EMAEL ADRES!).

**GIT ID SWITCHER** AUTOMAGICALLY DETEKTZ SUBMODULEZ AN APPLIEZ UR SELECTD PROFILE.

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

DIS WAI, WHETHER U COMMIT IN MAIN REPO OR IN VENDOR LIBRARY, UR PROFILE IZ ALWAYZ CORREKT. NO MOAR EMBARASING COMMITS!

---

## TROUBLESHOOTIN

### SSH KEY NOT SWITCHIN?

1. MAEK SHUR `ssh-agent` IZ RUNNIN:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. CHEEK IF KEY PATH IZ CORREKT:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. ON MACOS, ADD 2 KEYCHAIN WUNCE:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### PUSHIN WIF RONG PROFILE?

**WEN CLONIN NEW REPO:**

4 WERK REPOSITORIEZ, USE TEH HOST ALIAS FROM UR SSH CONFIG:

```bash
# WERK (USIN github-work ALIAS)
git clone git@github-work:company/repo.git

# PURSONAL (USIN DEFALT github.com)
git clone git@github.com:yourname/repo.git
```

**4 EXISTIN REPOSITORIEZ:**

1. CHEEK IF REMOTE URL UZEZ TEH RITE HOST ALIAS:

   ```bash
   git remote -v
   # WERK REPO SHUD B git@github-work:...
   ```

2. UPDATE IF NEEDID:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG SININ NOT WERKIN?

1. CHEEK UR GPG KEY ID:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. TEST SININ:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. MAEK SHUR PROFILE EMAEL MATCHZ GPG KEY EMAEL

### PROFILE NOT DETECTD?

- MAEK SHUR UR IN A GIT REPOSITRY
- CHEEK 4 SYNTAX ERRORZ IN `settings.json`
- RELOAD VS CODE WINDOE (`Cmd+Shift+P` → "RELOAD WINDOE")

### `name` FEELD GIVZ ERUR?

DEEZ CHARACTERZ IN `name` FEELD CAUZ ERURZ:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

IF U WANT 2 INCLUD SERVIS NAEM, USE TEH `service` FEELD INSTED.

```jsonc
// BAD - NO CAN HAZ
"name": "Ceiling Cat (Pursonal)"

// GUD - I CAN HAZ
"name": "Ceiling Cat",
"service": "GitHub"
```

### NEW SETTINGZ NOT SHOWIN?

AFTR UPDATIN TEH EXTENSHUN, NEW SETTIN ITEMZ MAI NOT APEER IN SETTINGZ SCREEN.

**FIX:** RESTART UR HOLE MASHEEN.

VS CODE AN OTHR EDITORZ CACHE SETTIN SKEEMAZ IN MEMRY. "RELOAD WINDOE" OR REINSTALLIN TEH EXTENSHUN MAI NOT B ENUF.

### DEFALT VALUEZ (IDENTITIEZ ETC.) R EMPTY?

IF SAMPLE SETTINGZ DONT SHOW ON FRESH INSTALL, **SETTINGZ SYNC** MAI B TEH CAUZ.

IF U SAVD EMPTY SETTINGZ B4, DEY GOT SYNCD 2 CLOUD AN NOW OVERRIDE TEH DEFALTZ ON NEW INSTALLZ.

**FIX:**

1. FIND TEH SETTIN IN SETTINGZ SCREEN
2. CLIK GEAR ICON → "RESET SETTIN"
3. SYNC WIF SETTINGZ SYNC (OLD SETTINGZ GET REMOVD FROM CLOUD)

---

## DEZIGN FILOSOFY

> "HU AM I?" — DAT DA ONLY QUESHUN DIS EXTENSHN ANSWRZ.

BILT ON **KARESANSUI ARKITEKCHUR**: CORE CAN B RITTN IN 100 LINEZ.
DAT Y WE CAN SPEND TEH REST ON QUALITEE (90% TEST COVERAJ, LOGGIN, TIEMOUTZ)
AN INTENSHUNUL CONSTRAINTZ (NO GITHUB API, NO TOKN MANAGEMNT).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[READ DA FULL FILOSOFY](../../DESIGN_PHILOSOPHY.md)

---

## CONTRIBUTIN

WE WELCOM CONTRIBUSHUNZ! C [CONTRIBUTING.md](../../CONTRIBUTING.md). DO WANT!

## LICENS

MIT LICENS - C [LICENSE](../../../LICENSE). FREE LIEK FREDUM!

## CREDITZ

MADE BY [Null;Variant](https://github.com/nullvariant)

---

🐱 **KTHXBAI!** 🐱
