# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Váltson több Git-profil között egyetlen kattintással. Kezeljen több GitHub-fiókot, SSH-kulcsokat, GPG-aláírást, és <b>automatikusan alkalmazza a profilt a Git-almodulokra</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <b>🇭🇺</b> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/hu/demo.webp" width="600" alt="Demó" loading="lazy">

## 🎯 Miért a Git ID Switcher?

Bár sok Git-profil váltó létezik, a **Git ID Switcher** olyan összetett problémákat old meg, amelyeket mások gyakran figyelmen kívül hagynak:

1. **Az almodulok rémálma**: Almodulokat tartalmazó tárolókkal (Hugo témák, vendor könyvtárak stb.) dolgozva általában manuálisan kell beállítani a `git config user.name`-et _minden_ almodulhoz. Ez a bővítmény elegánsan megoldja ezt a profil rekurzív alkalmazásával az összes aktív almodulra.
2. **SSH és GPG kezelés**: Nem csak a nevét változtatja meg; az SSH-kulcsokat is cseréli az ssh-agent-ben és konfigurálja a GPG-aláírást, így soha nem fog rossz aláírással commitolni.

## Funkciók

- **Profilkezelő UI**: Profilok hozzáadása, szerkesztése, törlése és átrendezése a settings.json szerkesztése nélkül
- **Egykattintásos profilváltás**: Git user.name és user.email azonnali módosítása
- **Állapotsáv-integráció**: Aktuális profil mindig egy pillantásra látható
- **Almodul-támogatás**: Profil automatikus alkalmazása a Git-almodulokra
- **SSH-kulcs kezelés**: SSH-kulcsok automatikus váltása az ssh-agent-ben
- **GPG-aláírás támogatás**: GPG-kulcs konfigurálása commit aláíráshoz (opcionális)
- **Részletes tooltipek**: Teljes körű profilinformáció leírással és SSH-hosttal
- **Platformfüggetlen**: Működik macOS, Linux és Windows rendszeren
- **Többnyelvű**: 17 nyelvet támogat

## 🌏 Megjegyzés a többnyelvű támogatásról

> **Értékelem a kisebbségek létezését.**
> Nem akarom elvetni őket csak azért, mert kevesen vannak.
> Még ha a fordítások nem is tökéletesek, remélem, hogy érezni fogja szándékunkat a kisebbségi nyelvek megértésére és tiszteletére.

Ez a bővítmény mind a 17 VS Code által támogatott nyelvet támogatja. Ezen túlmenően a README dokumentációnál kihívást jelentünk magunknak kisebbségi nyelvekre és még vicces nyelvekre is fordítani.

Ez nem csak „globális támogatás" — ez „tisztelet a nyelvi sokféleség iránt". És örülnék, ha ez olyan infrastruktúrává válna, ahol a világot jobbá tevő commitok a világ minden tájáról érkező fejlesztőktől származnak, túllépve a nyelvi akadályokon.

---

## Gyors kezdés

Tipikus beállítás a személyes fiók és a vállalati fiók (Enterprise Managed User) kezeléséhez.

### 1. lépés: SSH-kulcsok előkészítése

Először hozzon létre SSH-kulcsokat minden fiókhoz (hagyja ki, ha már megvannak):

```bash
# Személyes
ssh-keygen -t ed25519 -C "alex@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Munkahelyi
ssh-keygen -t ed25519 -C "alex.nagy@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Regisztrálja minden kulcs **nyilvános kulcsát** (`.pub` fájl) a megfelelő GitHub-fiókhoz.

> **Megjegyzés**: A GitHubra az `id_ed25519_personal.pub` (nyilvános kulcs) kerül regisztrálásra. Az `id_ed25519_personal` (kiterjesztés nélkül) a privát kulcs — soha ne ossza meg és ne töltse fel sehova.

### 2. lépés: SSH konfigurálása

Szerkessze a `~/.ssh/config` fájlt:

```ssh-config
# Személyes GitHub-fiók (alapértelmezett)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Munkahelyi GitHub-fiók
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### 3. lépés: A bővítmény konfigurálása

Telepítés után minta profilok állnak rendelkezésre.
Kövesse az alábbi útmutatót a saját beállításaihoz való szerkesztéshez.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/hu/first-ux.webp" width="600" alt="Első beállítási útmutató (13 lépés): Nyissa meg a profilkezelőt az állapotsávról, majd szerkessze vagy hozzon létre újat" loading="lazy">

> **A kulcsfájlok nem kerülnek elküldésre**: Az SSH-kulcs elérési útjának beállításakor csak a kulcsfájl elérési útja (helye) kerül rögzítésre. A kulcsfájl tartalma soha nem kerül feltöltésre vagy külső helyre küldésre.

> **GPG-aláírás használata esetén**: A profilszerkesztő képernyőn a `gpgKeyId` is beállítható.
> A GPG-kulcs azonosítójának megtalálásához lásd a „[Hibaelhárítás](#gpg-aláírás-nem-működik)" részt.

> **Tipp**: Közvetlenül a settings.json-ból is konfigurálhatja.
> Nyissa meg a bővítmény beállításait (`Cmd+,` / `Ctrl+,`) → keressen rá: „Git ID Switcher" → kattintson a „Szerkesztés a settings.json-ban" lehetőségre.
> A JSON formátumú konfigurációhoz lásd a „[Teljes konfigurációs példa](#teljes-konfigurációs-példa-5-fiók-ssh--gpg-val)" részt.

---

## Teljes konfigurációs példa: 5 fiók SSH + GPG-val

Teljes példa, amely mindent kombinál:

### SSH konfiguráció (`~/.ssh/config`)

```ssh-config
# Személyes fiók (alapértelmezett)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Munkahelyi fiók (vállalati Enterprise Managed User)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# A ügyfél – szerződéses munka (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# B ügyfél – helyszíni projekt (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS hozzájárulások (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Bővítmény beállítások

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Nagy Alex",
      "email": "alex@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Személyes projektek",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Nagy Alex",
      "email": "alex.nagy@techcorp.example.com",
      "service": "GitHub Munka",
      "icon": "💼",
      "description": "TechCorp fő munka",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Nagy Alex",
      "email": "alex@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA megbízás",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "A.Nagy",
      "email": "a.nagy@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB helyszíni",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "alex-dev",
      "email": "alex.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "OSS hozzájárulások",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Megjegyzés: A 4. profil (`client-b`) rövidített nevet, az 5. (`oss`) fejlesztői felhasználónevet használ. Ugyanannak a személynek minden profilhoz más megjelenítési nevet állíthat be.

---

## Profilkezelés

Kattintson az állapotsávra → a lista alján válassza a „Profilkezelés" lehetőséget a kezelőfelület megnyitásához.
A profilok hozzáadása, szerkesztése, törlése és átrendezése közvetlenül az UI-ból végezhető.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/hu/identity-management.webp" width="600" alt="Profilkezelés: törlési és átrendezési műveletek útmutatója" loading="lazy">

A profilokat a Parancspalettából is törölheti a `Git ID Switcher: Delete Identity` paranccsal.

---

## Parancsok

| Parancs                                  | Leírás                             |
| ---------------------------------------- | ---------------------------------- |
| `Git ID Switcher: Select Identity`       | Profilválasztó megnyitása          |
| `Git ID Switcher: Delete Identity`       | Profil törlése                     |
| `Git ID Switcher: Show Current Identity` | Aktuális profil info megjelenítése |
| `Git ID Switcher: Show Documentation`    | Dokumentáció megjelenítése         |

---

## Beállítási referencia

### Profil tulajdonságai

| Tulajdonság   | Kötelező | Leírás                                                               |
| ------------- | -------- | -------------------------------------------------------------------- |
| `id`          | ✅       | Egyedi azonosító (pl.: `"personal"`, `"work"`)                       |
| `name`        | ✅       | Git user.name — commitokban jelenik meg                              |
| `email`       | ✅       | Git user.email — commitokban jelenik meg                             |
| `icon`        |          | Emoji az állapotsávon (pl.: `"🏠"`). Csak egyetlen emoji használható |
| `service`     |          | Szolgáltatás neve (pl.: `"GitHub"`, `"GitLab"`). UI megjelenítéshez  |
| `description` |          | Rövid leírás a választóban és tooltipben                             |
| `sshKeyPath`  |          | Privát SSH-kulcs elérési útja (pl.: `"~/.ssh/id_ed25519_work"`)      |
| `sshHost`     |          | SSH config host alias (pl.: `"github-work"`)                         |
| `gpgKeyId`    |          | GPG-kulcs ID commit-aláíráshoz                                       |

#### Megjelenítési korlátozások

- **Állapotsáv**: Kb. 25 karakternél hosszabb szöveg `...`-tal rövidül
- **`icon`**: Csak egyetlen emoji (grafémafürt) használható. Több emoji vagy hosszú szöveg nem engedélyezett

### Globális beállítások

| Beállítás                                  | Alapértelmezett | Leírás                                                                                          |
| ------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Lásd a mintát   | Profil konfigurációk listája                                                                    |
| `gitIdSwitcher.defaultIdentity`            | Lásd a mintát   | Alapértelmezett profil ID                                                                       |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`          | SSH-kulcs automatikus váltása profilváltáskor                                                   |
| `gitIdSwitcher.showNotifications`          | `true`          | Értesítés megjelenítése profilváltáskor                                                         |
| `gitIdSwitcher.applyToSubmodules`          | `true`          | Profil alkalmazása Git-almodulokra                                                              |
| `gitIdSwitcher.submoduleDepth`             | `1`             | Max. mélység beágyazott almodulokhoz (1-5)                                                      |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`         | Ikon emoji beírása a Git config `user.name`-be                                                  |
| `gitIdSwitcher.logging.fileEnabled`        | `false`         | Audit naplózás fájlba (profilváltások, SSH műveletek, stb.)                                     |
| `gitIdSwitcher.logging.filePath`           | `""`            | Naplófájl elérési útja (pl.: `~/.git-id-switcher/security.log`). Üres = alapértelmezett hely    |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`      | Max. fájlméret rotálás előtt (bájt, 1MB-100MB)                                                  |
| `gitIdSwitcher.logging.maxFiles`           | `5`             | Rotált naplófájlok max. száma (1-20)                                                            |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`         | Ha engedélyezve van, minden érték maszkolva van a naplókban (maximális adatvédelem)             |
| `gitIdSwitcher.logging.level`              | `"INFO"`        | Naplózási szint (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). A kiválasztott szint és felette |
| `gitIdSwitcher.commandTimeouts`            | `{}`            | Egyedi időtúllépés parancsonként (ms, 1mp-5perc). Pl.: `{"git": 15000, "ssh-add": 10000}`       |

#### Az `includeIconInGitConfig` beállításról

Az `icon` mező beállítása esetén a viselkedést szabályozza:

| Érték                     | Viselkedés                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `false` (alapértelmezett) | Az `icon` csak a szerkesztő UI-ban jelenik meg. A Git configba csak a `name` kerül    |
| `true`                    | Az `icon + name` íródik a Git configba. Az emoji a commit-előzményekben is megjelenik |

Példa: `icon: "👤"`, `name: "Nagy Alex"` esetén

| includeIconInGitConfig | Git config `user.name` | Commit-aláírás         |
| ---------------------- | ---------------------- | ---------------------- |
| `false`                | `Nagy Alex`            | `Nagy Alex <email>`    |
| `true`                 | `👤 Nagy Alex`         | `👤 Nagy Alex <email>` |

---

## Működési elv

### Git config rétegstruktúra

A Git konfigurációnak három rétege van, ahol az alsó rétegeket a felsők felülírják:

```text
Rendszer (/etc/gitconfig)
    ↓ felülírja
Globális (~/.gitconfig)
    ↓ felülírja
Lokális (.git/config)  ← legmagasabb prioritás
```

**A Git ID Switcher `--local` (tároló-lokális) szinten ír.**

Ez azt jelenti:

- A profilt minden tároló `.git/config` fájljába menti
- Tárolónként különböző profilok tarthatók fenn
- A globális beállítás (`~/.gitconfig`) nem módosul

### Profilváltási viselkedés

Profil váltásakor a bővítmény a következőket hajtja végre (sorrendben):

1. **Git konfiguráció** (mindig): Beállítja a `git config --local user.name` és `user.email` értékeket
2. **SSH-kulcs** (ha `sshKeyPath` be van állítva): Eltávolítja a többi kulcsot az ssh-agent-ből, hozzáadja a kiválasztottat
3. **GPG-kulcs** (ha `gpgKeyId` be van állítva): Beállítja a `git config --local user.signingkey` értéket és engedélyezi az aláírást
4. **Almodulok** (ha engedélyezve): Propagálja a konfigurációt az összes almodulba (alapértelmezett: mélység 1)

### Almodul-propagáció mechanizmusa

A lokális konfiguráció tároló-szintű, ezért az almodulokra nem vonatkozik automatikusan.
Ezért ez a bővítmény almodul-propagációs funkciót biztosít (részletekért lásd: „Haladó: Almodul-támogatás").

### SSH-kulcs kezelés részletei

A Git ID Switcher az `ssh-agent`-en keresztül kezeli az SSH-kulcsokat:

| Művelet            | Végrehajtott parancs   |
| ------------------ | ---------------------- |
| Kulcs hozzáadása   | `ssh-add <keyPath>`    |
| Kulcs eltávolítása | `ssh-add -d <keyPath>` |
| Kulcsok listázása  | `ssh-add -l`           |

**Fontos:** Ez a bővítmény **nem módosítja** a `~/.ssh/config` fájlt. Az SSH konfigurációt manuálisan kell beállítani (lásd: „Gyors kezdés" 2. lépés).

### Kölcsönhatás a meglévő SSH beállításokkal

Ha már rendelkezik SSH beállításokkal, a Git ID Switcher a következőképpen működik:

| Az Ön beállítása                             | Git ID Switcher viselkedése                                           |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `~/.ssh/config`-ban `IdentityFile` megadva   | Mindkettő használható; `IdentitiesOnly yes` a konfliktus megelőzésére |
| `GIT_SSH_COMMAND` környezeti változó         | Egyéni SSH parancsot használ; az ssh-agent továbbra is működik        |
| `git config core.sshCommand` beállítva       | Ugyanaz, mint fent                                                    |
| direnv SSH-kapcsolódó környezeti változókkal | Együtt élnek; az ssh-agent függetlenül működik                        |

**Ajánlás:** Az SSH configban mindig állítsa be az `IdentitiesOnly yes` opciót. Ez megakadályozza, hogy az SSH több kulcsot próbáljon ki.

### Miért az `IdentitiesOnly yes`?

E beállítás nélkül az SSH a következő sorrendben próbálhatja a kulcsokat:

1. Az ssh-agent-be betöltött kulcsok (amelyeket a Git ID Switcher kezel)
2. A `~/.ssh/config`-ban megadott kulcsok
3. Alapértelmezett kulcsok (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` stb.)

Ez hitelesítési hibákhoz vagy nem szándékolt kulcshasználathoz vezethet.

Az `IdentitiesOnly yes` beállítással az SSH **csak a megadott kulcsot** használja. Ez biztosítja, hogy a Git ID Switcherben beállított kulcs kerüljön felhasználásra.

```ssh-config
# Ajánlott beállítás
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Ez a sor fontos
```

Ezzel a beállítással a `github-work` hosthoz való kapcsolódáskor csak a `~/.ssh/id_ed25519_work` kulcs kerül felhasználásra, más kulcsok nem lesznek kipróbálva.

---

## Haladó: Almodul-támogatás

Git-almodulokat használó összetett tárolók esetén a profilkezelés gyakran problémás. Ha almodulban commitol, a Git az adott almodul helyi konfigurációját használja, ami a globális konfigurációra eshet vissza (rossz email!), ha nincs explicit módon beállítva.

A **Git ID Switcher** automatikusan felismeri az almodulokat és alkalmazza rájuk a kiválasztott profilt.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Funkció engedélyezése/letiltása
- `submoduleDepth`: Milyen mélységig menjen?
  - `1`: Csak közvetlen almodulok (leggyakoribb)
  - `2+`: Beágyazott almodulok (almodulok almodulokon belül)

Ez biztosítja, hogy a profilja mindig helyes legyen, akár a fő tárolóban, akár vendor könyvtárban commitol.

---

## Hibaelhárítás

### SSH-kulcs nem vált?

1. Győződjön meg róla, hogy az `ssh-agent` fut:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Ellenőrizze, hogy a kulcs elérési útja helyes:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. macOS-en adja hozzá a Kulcskarikához egyszer:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Rossz profil push-kor?

**Új klónozáskor:**

Munkahelyi tárolók klónozásakor használja az SSH configban beállított host aliast:

```bash
# Munkahelyi profilhoz (github-work aliast használva)
git clone git@github-work:company/repo.git

# Személyes profilhoz (alapértelmezett github.com-ot használva)
git clone git@github.com:yourname/repo.git
```

**Meglévő tárolók esetén:**

1. Ellenőrizze, hogy a távoli URL a megfelelő host aliast használja:

   ```bash
   git remote -v
   # Munkahelyi tárolóknál git@github-work:... kell legyen
   ```

2. Szükség esetén frissítse:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG-aláírás nem működik?

1. Keresse meg a GPG-kulcs ID-ját:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Tesztelje az aláírást:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Győződjön meg róla, hogy a profilban szereplő email megegyezik a GPG-kulcs emailjével.

### Profil nem észlelt?

- Győződjön meg róla, hogy Git-tárolóban van
- Ellenőrizze, hogy a `settings.json`-ban nincsenek szintaktikai hibák
- Töltse újra a VS Code ablakot (`Cmd+Shift+P` → „Ablak újratöltése")

### A `name` mezőben hiba van?

A `name` mező hibát okoz, ha a következő karaktereket tartalmazza:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Ha szolgáltatásnevet szeretne hozzáadni, használja a `service` mezőt.

```jsonc
// Helytelen
"name": "Nagy Alex (személyes)"

// Helyes
"name": "Nagy Alex",
"service": "GitHub"
```

### Új beállítások nem jelennek meg?

Előfordulhat, hogy a bővítmény frissítése után az új beállítások nem jelennek meg a beállítások képernyőn.

**Megoldás:** Indítsa újra a teljes gépet.

A VS Code és más szerkesztők memóriában tárolják a beállítások sémáját, és ez nem mindig frissül az „Ablak újratöltése" vagy a bővítmény újratelepítése után.

### Alapértelmezett értékek (identities stb.) üresek?

Ha új telepítésnél sem jelennek meg a mintabeállítások, a **Settings Sync** lehet az ok.

Ha korábban üres beállításokat mentett, azok szinkronizálódtak a felhőbe, és felülírják az alapértelmezett értékeket az új telepítésnél.

**Megoldás:**

1. Keresse meg a beállítást a beállítások képernyőn
2. Kattintson a fogaskerék ikonra → „Beállítás visszaállítása"
3. Szinkronizáljon a Settings Sync-kel (a régi beállítás törlődik a felhőből)

---

## Tervezési filozófia

> **„Ki vagyok én" váltása** — Az egyetlen kérdés, amire ez a bővítmény válaszol

A **Karesansui Architektúrára** épül: egyszerű mag (100 sor),
ezért a többit minőségre (90% lefedettség, naplózás, időtúllépések)
és tudatos korlátozásokra (nincs GitHub API, nincs token kezelés) fordíthatjuk.

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Olvassa el a teljes filozófiát](../../DESIGN_PHILOSOPHY.md)

---

## Hozzájárulás

Hozzájárulásokat szívesen fogadunk! Lásd: [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licenc

MIT licenc — lásd: [LICENSE](../../../LICENSE).

## Köszönet

Készítette: [Null;Variant](https://github.com/nullvariant)
