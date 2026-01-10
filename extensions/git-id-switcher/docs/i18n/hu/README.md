# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Váltson több Git-azonosító között egyetlen kattintással. Kezeljen több GitHub-fiókot, SSH-kulcsokat, GPG-aláírást, és <b>automatikusan alkalmazza az azonosítót a Git-almodulokra</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <b>🇭🇺</b> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-hu.png" width="600" alt="Demo">

## 🎯 Miért a Git ID Switcher?

Bár sok Git-azonosító váltó létezik, a **Git ID Switcher** olyan összetett problémákat old meg, amelyeket mások gyakran figyelmen kívül hagynak:

1. **Az almodulok rémálma**: Almodulokat tartalmazó tárolókkal (Hugo témák, vendor könyvtárak stb.) dolgozva általában manuálisan kell beállítani a `git config user.name`-et *minden* almodulhoz. Ez a bővítmény elegánsan megoldja ezt az azonosító rekurzív alkalmazásával az összes aktív almodulra.
2. **SSH és GPG kezelés**: Nem csak a nevét változtatja meg; az SSH-kulcsokat is cseréli az agentben és konfigurálja a GPG-aláírást, így soha nem fog rossz aláírással commitolni.

## Funkciók

- **Almodul-támogatás**: Azonosító automatikus propagálása Git-almodulokba
- **SSH-kulcs kezelés**: SSH-kulcsok automatikus váltása az ssh-agent-ben
- **GPG-aláírás támogatás**: GPG-kulcs konfigurálása commit aláíráshoz (opcionális)
- **Egykattintásos azonosítóváltás**: Git user.name és user.email azonnali módosítása
- **Állapotsáv-integráció**: Mindig lássa az aktuális azonosítóját
- **Részletes tooltipek**: Teljes körű információ leírással és SSH-hosttal
- **Platformfüggetlen**: Működik macOS, Linux és Windows rendszeren
- **Többnyelvű**: 17 nyelvet támogat

## 🌏 Megjegyzés a többnyelvű támogatásról

> **Értékelem a kisebbségek létezését.**
> Nem akarom elvetni őket csak azért, mert kevesen vannak.
> Még ha a fordítások nem is tökéletesek, remélem, hogy érezni fogja szándékunkat a kisebbségi nyelvek megértésére és tiszteletére.

Ez a bővítmény mind a 17 VSCode által támogatott nyelvet támogatja. Ezen túlmenően a README dokumentációnál kihívást jelentünk magunknak kisebbségi nyelvekre és még vicces nyelvekre is fordítani.

Ez nem csak „globális támogatás" — ez „tisztelet a nyelvi sokféleség iránt". És örülnék, ha ez olyan infrastruktúrává válna, ahol a világot jobbá tevő commitok a világ minden tájáról érkező fejlesztőktől származnak, túllépve a nyelvi akadályokon.

---

## Gyors kezdés

Tipikus beállítás a személyes fiók és a vállalati fiók (Enterprise Managed User) kezeléséhez.

### 1. lépés: SSH-kulcsok előkészítése

Először hozzon létre SSH-kulcsokat minden fiókhoz (hagyja ki, ha már megvannak):

```bash
# Személyes
ssh-keygen -t ed25519 -C "alex.kovacs@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Munkahelyi
ssh-keygen -t ed25519 -C "alex.kovacs@company.example.com" -f ~/.ssh/id_ed25519_work
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

Nyissa meg a bővítmény beállításait (`Cmd+,` / `Ctrl+,`) → keressen rá: "Git ID Switcher" → kattintson a "Szerkesztés a settings.json-ban" lehetőségre:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kovács",
      "service": "GitHub",
      "email": "alex.kovacs@personal.example.com",
      "description": "Személyes projektek",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kovács",
      "service": "GitHub Munkahelyi",
      "email": "alex.kovacs@company.example.com",
      "description": "Munkahelyi fiók",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### 4. lépés: Használat

1. Kattintson az azonosító ikonra az állapotsávon (jobb alsó sarokban)
2. Válasszon azonosítót
3. Kész! A Git-konfiguráció és az SSH-kulcs váltva lett.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-hu.png" width="600" alt="Quick Pick">

### SSH host aliasok használata

Tárolók klónozásakor használja az azonosítójának megfelelő hostot:

```bash
# Munkahelyi azonosítóhoz (a github-work aliast használja)
git clone git@github-work:company/repo.git

# Személyes azonosítóhoz (az alapértelmezett github.com-ot használja)
git clone git@github.com:akovacs/repo.git
```

---

## Opcionális: GPG-aláírás

Ha GPG-vel írja alá a commitokat:

### 1. lépés: Keresse meg a GPG-kulcs ID-ját

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Példa kimenet:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Alex Kovács <alex.kovacs@personal.example.com>
```

A kulcs ID: `ABCD1234`.

### 2. lépés: GPG-kulcs hozzáadása az azonosítóhoz

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kovács",
      "service": "GitHub",
      "email": "alex.kovacs@personal.example.com",
      "description": "Személyes projektek",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Erre az azonosítóra váltáskor a bővítmény beállítja:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Teljes példa: 4 fiók SSH + GPG-vel

Itt egy teljes példa, ami mindent kombinál:

### SSH konfiguráció (`~/.ssh/config`)

```ssh-config
# Személyes fiók (alapértelmezett)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Munkahelyi fiók
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Bitbucket fiók
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Bővítmény beállítások

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kovács",
      "service": "GitHub",
      "email": "alex.kovacs@personal.example.com",
      "description": "Személyes projektek",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kovács",
      "service": "GitHub Munkahelyi",
      "email": "alex.kovacs@company.example.com",
      "description": "Munkahelyi fiók",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "Alex Kovács",
      "service": "Bitbucket",
      "email": "alex.kovacs@bitbucket.example.com",
      "description": "Bitbucket projektek",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Kovács",
      "service": "GitLab",
      "email": "alex.kovacs@freelance.example.com",
      "description": "Szabadúszó projektek"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Megjegyzés: Az utolsó azonosító (`freelance`) SSH nélküli — csak a Git-konfigurációt váltja. Ez hasznos, ha különböző committer-információkat használ ugyanazzal a GitLab-fiókkal.

---

## Konfiguráció referencia

### Azonosító tulajdonságai

| Tulajdonság   | Kötelező | Leírás                                                     |
| ------------- | -------- | ---------------------------------------------------------- |
| `id`          | ✅       | Egyedi azonosító (pl.: `"work"`, `"personal"`)             |
| `name`        | ✅       | Git user.name — commitokban jelenik meg                    |
| `email`       | ✅       | Git user.email — commitokban jelenik meg                   |
| `icon`        |          | Emoji az állapotsávon (pl.: `"🏠"`). Csak egyetlen emoji használható |
| `service`     |          | Szolgáltatás neve (pl.: `"GitHub"`, `"GitLab"`). UI megjelenítéshez |
| `description` |          | Rövid leírás a választóban és tooltipben                   |
| `sshKeyPath`  |          | Privát SSH-kulcs elérési útja (pl.: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |          | SSH config host alias (pl.: `"github-work"`)               |
| `gpgKeyId`    |          | GPG-kulcs ID commit-aláíráshoz                             |

#### Megjelenítési korlátozások

- **Állapotsáv**: Kb. 25 karakternél hosszabb szöveg `...`-tal rövidül
- **`icon`**: Csak egyetlen emoji (grafémafürt) használható. Több emoji vagy hosszú szöveg nem engedélyezett

### Globális beállítások

| Beállítás                         | Alapértelmezett | Leírás                                         |
| --------------------------------- | --------------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`        | Lásd a példát   | Azonosító konfigurációk listája                |
| `gitIdSwitcher.defaultIdentity`   | Lásd a példát   | Alapértelmezett azonosító ID                   |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`          | SSH-kulcs automatikus váltása                  |
| `gitIdSwitcher.showNotifications` | `true`          | Értesítés megjelenítése váltáskor              |
| `gitIdSwitcher.applyToSubmodules` | `true`          | Azonosító alkalmazása Git-almodulokra          |
| `gitIdSwitcher.submoduleDepth`    | `1`             | Max. mélység beágyazott almodulokhoz (1-5)     |
| `gitIdSwitcher.includeIconInGitConfig` | `false`    | Ikon emoji beírása a Git config `user.name`-be |
| `gitIdSwitcher.logging.fileEnabled` | `false` | Audit naplózás engedélyezése (azonosítóváltások, SSH műveletek, stb.) |
| `gitIdSwitcher.logging.filePath` | `""` | Naplófájl elérési útja (pl.: `~/.git-id-switcher/security.log`). Üres = alapértelmezett hely |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Max. fájlméret forgatás előtt (bájt, 1MB-100MB) |
| `gitIdSwitcher.logging.maxFiles` | `5` | Forgatott naplófájlok max. száma (1-20) |
| `gitIdSwitcher.logging.level` | `"INFO"` | Naplózási szint: `DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`. A kiválasztott szint és felette rögzít |
| `gitIdSwitcher.commandTimeouts` | `{}` | Egyedi időtúllépés parancsonként (ms, 1mp-5perc). Pl.: `{"git": 15000, "ssh-add": 10000}` |

#### Az `includeIconInGitConfig` beállításról

Az `icon` mező beállítása esetén a viselkedést szabályozza:

| Érték | Viselkedés |
|-------|------------|
| `false` (alapértelmezett) | Az `icon` csak a szerkesztő UI-ban jelenik meg. A Git configba csak a `name` kerül |
| `true` | Az `icon + name` íródik a Git configba. Az emoji a commit-előzményekben is megjelenik |

Példa: `icon: "👤"`, `name: "Alex Kovács"` esetén

| includeIconInGitConfig | Git config `user.name` | Commit-aláírás |
|------------------------|------------------------|----------------|
| `false` | `Alex Kovács` | `Alex Kovács <email>` |
| `true` | `👤 Alex Kovács` | `👤 Alex Kovács <email>` |

### Megjegyzés: Alapbeállítás (SSH nélkül)

Ha nincs szükség SSH-kulcs váltásra (pl. különböző committer-információk használata egyetlen GitHub-fiókkal), minimális konfigurációt használhat:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kovács",
      "email": "alex.kovacs@personal.example.com",
      "description": "Személyes projektek"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kovács",
      "email": "alex.kovacs@company.example.com",
      "description": "Munkahelyi fiók"
    }
  ]
}
```

Ez a beállítás csak a `git config user.name` és `user.email` értékeket váltja.

---

## Működés

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

- Az azonosítót minden tároló `.git/config` fájljába menti
- Tárolónként különböző azonosítók tarthatók fenn
- A globális beállítás (`~/.gitconfig`) nem módosul

### Azonosítóváltás viselkedése

Azonosító váltásakor a bővítmény a következőket hajtja végre (sorrendben):

1. **Git konfiguráció** (mindig): Beállítja a `git config --local user.name` és `user.email` értékeket
2. **SSH-kulcs** (ha `sshKeyPath` be van állítva): Eltávolítja a többi kulcsot az ssh-agent-ből, hozzáadja a kiválasztottat
3. **GPG-kulcs** (ha `gpgKeyId` be van állítva): Beállítja a `git config --local user.signingkey` értéket és engedélyezi az aláírást
4. **Almodulok** (ha engedélyezve): Propagálja a konfigurációt az összes almodulba (alapértelmezett: mélység 1)

### Almodul-propagáció mechanizmusa

A lokális konfiguráció tároló-szintű, ezért az almodulokra nem vonatkozik automatikusan.
Ezért ez a bővítmény almodul-propagációs funkciót biztosít (részletekért lásd: „Haladó: Almodul-támogatás").

---

## Haladó: Almodul-támogatás

Git-almodulokat használó összetett tárolók esetén az azonosítókezelés gyakran problémás. Ha almodulban commitol, a Git az adott almodul helyi konfigurációját használja, ami a globális konfigurációra eshet vissza (rossz email!), ha nincs explicit módon beállítva.

A **Git ID Switcher** automatikusan felismeri az almodulokat és alkalmazza rájuk a kiválasztott azonosítót.

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

Ez biztosítja, hogy az azonosítója mindig helyes legyen, akár a fő tárolóban, akár vendor könyvtárban commitol.

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

### Rossz azonosító push-kor?

1. Ellenőrizze, hogy a távoli URL a megfelelő host aliast használja:

   ```bash
   git remote -v
   # A munkahelyi tárolóknál git@github-work:... kell megjelenjen
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

3. Győződjön meg róla, hogy az azonosítóban szereplő email megegyezik a GPG-kulcs emailjével.

### Azonosító nem észlelt?

- Győződjön meg róla, hogy Git-tárolóban van
- Ellenőrizze, hogy a `settings.json`-ban nincsenek szintaktikai hibák
- Töltse újra a VS Code ablakot (`Cmd+Shift+P` → "Ablak újratöltése")

### A `name` mezőben hiba van?

A `name` mező hibát okoz, ha a következő karaktereket tartalmazza:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Ha szolgáltatásnevet szeretne hozzáadni, használja a `service` mezőt.

```jsonc
// Helytelen
"name": "Alex Kovács (személyes)"

// Helyes
"name": "Alex Kovács",
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

## Parancsok

| Parancs                         | Leírás                            |
| ------------------------------- | --------------------------------- |
| `Git ID: Select Identity`       | Azonosító választó megnyitása     |
| `Git ID: Show Current Identity` | Aktuális azonosító info megjelenítése |

---

## Tervezési filozófia

> "Ki vagyok én?" — Az egyetlen kérdés, amire ez a bővítmény válaszol.

A **Karesansui Architektúrára** épül: egyszerű mag (100 sor),
szándékos minőséggel (90% lefedettség, naplózás, időtúllépések)
és tudatos korlátozásokkal (nincs GitHub API, nincs token kezelés) körülvéve.

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Olvassa el a teljes filozófiát](../../DESIGN_PHILOSOPHY.md)

---

## Hozzájárulás

Hozzájárulásokat szívesen fogadunk! Lásd: [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licenc

MIT licenc — lásd: [LICENSE](../../../LICENSE).

## Köszönet

Készítette: [Null;Variant](https://github.com/nullvariant)
