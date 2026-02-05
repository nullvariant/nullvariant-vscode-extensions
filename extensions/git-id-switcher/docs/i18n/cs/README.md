# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Přepínejte mezi více Git identitami jedním kliknutím. Spravujte více GitHub účtů, SSH klíče, GPG podepisování a <b>automaticky aplikujte identitu na Git submoduly</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <b>🇨🇿</b> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-cs.png" width="600" alt="Demo">

## 🎯 Proč Git ID Switcher?

I když existuje mnoho nástrojů pro přepínání Git identity, **Git ID Switcher** řeší složité problémy, které jiné často ignorují:

1. **Noční můra submodulů**: Při práci s repozitáři obsahujícími submoduly (Hugo témata, vendor knihovny atd.) je obvykle nutné ručně nastavit `git config user.name` pro _každý_ submodul. Toto rozšíření to elegantně řeší rekurzivní aplikací vaší identity na všechny aktivní submoduly.
2. **Zpracování SSH a GPG**: Nemění jen vaše jméno; také vyměňuje SSH klíče v agentovi a konfiguruje GPG podepisování, takže nikdy neuděláte commit s nesprávným podpisem.

## Funkce

- **Podpora submodulů**: Automatická propagace identity do Git submodulů
- **Správa SSH klíčů**: Automatické přepínání SSH klíčů v ssh-agent
- **Podpora GPG podepisování**: Konfigurace GPG klíče pro podepisování commitů (volitelné)
- **Přepnutí identity jedním klikem**: Okamžitá změna Git user.name a user.email
- **Integrace do stavového řádku**: Vždy vidíte aktuální identitu
- **Podrobné nápovědy**: Kompletní informace s popisem a SSH hostem
- **Multiplatformní**: Funguje na macOS, Linux a Windows
- **Vícejazyčný**: Podporuje 17 jazyků

## 🌏 Poznámka k vícejazyčné podpoře

> **Oceňuji existenci menšin.**
> Nechci je zavrhnout jen proto, že jich je málo.
> I když překlady nejsou dokonalé, doufám, že pocítíte náš záměr porozumět a projevit respekt menšinovým jazykům.

Toto rozšíření podporuje všech 17 jazyků, které podporuje VSCode. Navíc se u README dokumentace pokoušíme překládat do menšinových jazyků a dokonce i vtipných jazyků.

To není jen „globální podpora" — je to „respekt k jazykové rozmanitosti". A budu rád, když se to stane infrastrukturou, kde commity zlepšující svět přicházejí od vývojářů odkudkoli, překonávajících jazykové bariéry.

---

## Rychlý start

Typické nastavení pro správu osobního účtu a pracovního účtu (Enterprise Managed User).

### Krok 1: Připravte SSH klíče

Nejprve vytvořte SSH klíče pro každý účet (přeskočte, pokud již máte):

```bash
# Osobní
ssh-keygen -t ed25519 -C "alex.novak@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Pracovní
ssh-keygen -t ed25519 -C "alex.novak@company.example.com" -f ~/.ssh/id_ed25519_work
```

Zaregistrujte **veřejný klíč** (soubor `.pub`) každého klíče na příslušném GitHub účtu.

> **Poznámka**: Na GitHub registrujete `id_ed25519_personal.pub` (veřejný klíč). `id_ed25519_personal` (bez přípony) je soukromý klíč — nikdy ho nesdílejte ani nenahrávejte nikam.

### Krok 2: Nakonfigurujte SSH

Upravte `~/.ssh/config`:

```ssh-config
# Osobní GitHub účet (výchozí)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Pracovní GitHub účet
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Krok 3: Nakonfigurujte rozšíření

Otevřete nastavení rozšíření (`Cmd+,` / `Ctrl+,`) → hledejte "Git ID Switcher" → klikněte na "Upravit v settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Alex Novák",
      "email": "alex.novak@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Osobní projekty",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "name": "Alex Novák",
      "email": "alex.novak@company.example.com",
      "service": "GitHub Práce",
      "icon": "💼",
      "description": "Pracovní účet",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Krok 4: Používejte

1. Klikněte na ikonu identity ve stavovém řádku (vpravo dole)
2. Vyberte identitu
3. Hotovo! Git konfigurace a SSH klíč jsou přepnuty.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-cs.png" width="600" alt="Quick Pick">

### Používání SSH host aliasů

Při klonování repozitářů použijte host odpovídající vaší identitě:

```bash
# Pro pracovní identitu (používá alias github-work)
git clone git@github-work:company/repo.git

# Pro osobní identitu (používá výchozí github.com)
git clone git@github.com:anovak/repo.git
```

---

## Volitelné: GPG podepisování

Pokud podepisujete commity pomocí GPG:

### Krok 1: Najděte ID vašeho GPG klíče

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Příklad výstupu:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Alex Novák <alex.novak@personal.example.com>
```

ID klíče je `ABCD1234`.

### Krok 2: Přidejte GPG klíč k identitě

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Alex Novák",
      "email": "alex.novak@personal.example.com",
      "icon": "🏠",
      "description": "Osobní projekty",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Při přepnutí na tuto identitu rozšíření nastaví:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Kompletní příklad: 4 účty s SSH + GPG

Zde je kompletní příklad kombinující vše:

### SSH konfigurace (`~/.ssh/config`)

```ssh-config
# Osobní účet (výchozí)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Pracovní účet (Enterprise Managed User od společnosti)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Bitbucket účet
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Nastavení rozšíření

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Alex Novák",
      "email": "alex.novak@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Osobní projekty",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "name": "Alex Novák",
      "email": "alex.novak@company.example.com",
      "service": "GitHub Práce",
      "icon": "💼",
      "description": "Pracovní účet",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "name": "Alex Novák",
      "email": "alex.novak@bitbucket.example.com",
      "service": "Bitbucket",
      "icon": "🪣",
      "description": "Bitbucket projekty",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "name": "Alex Novák",
      "email": "alex.novak@freelance.example.com",
      "service": "GitLab",
      "icon": "🎯",
      "description": "Freelance projekty"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Poznámka: Poslední identita (`freelance`) nemá SSH — pouze přepíná Git konfiguraci. To je užitečné při použití různých committer informací se stejným GitLab účtem.

---

## Reference konfigurace

### Vlastnosti identity

| Vlastnost     | Povinná | Popis                                                                       |
| ------------- | ------- | --------------------------------------------------------------------------- |
| `id`          | ✅      | Jedinečný identifikátor (např.: `"work"`, `"personal"`)                     |
| `name`        | ✅      | Git user.name — zobrazeno v commitech                                       |
| `email`       | ✅      | Git user.email — zobrazeno v commitech                                      |
| `icon`        |         | Emoji ve stavovém řádku (např.: `"🏠"`). Pouze jedno emoji                  |
| `service`     |         | Název služby (např.: `"GitHub"`, `"GitLab"`). Používá se pro zobrazení v UI |
| `description` |         | Krátký popis ve výběru a nápovědě                                           |
| `sshKeyPath`  |         | Cesta k soukromému SSH klíči (např.: `"~/.ssh/id_ed25519_work"`)            |
| `sshHost`     |         | SSH config host alias (např.: `"github-work"`)                              |
| `gpgKeyId`    |         | ID GPG klíče pro podepisování commitů                                       |

#### Omezení zobrazení

- **Stavový řádek**: Text delší než ~25 znaků bude zkrácen s `...`
- **`icon`**: Povoleno pouze jedno emoji (grafémový cluster). Více emoji nebo dlouhé řetězce nejsou podporovány

### Globální nastavení

| Nastavení                                  | Výchozí     | Popis                                                                                          |
| ------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Viz příklad | Seznam konfigurací identit                                                                     |
| `gitIdSwitcher.defaultIdentity`            | Viz příklad | ID výchozí identity                                                                            |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`      | Automaticky přepínat SSH klíč                                                                  |
| `gitIdSwitcher.showNotifications`          | `true`      | Zobrazit oznámení při přepnutí                                                                 |
| `gitIdSwitcher.applyToSubmodules`          | `true`      | Aplikovat identitu na Git submoduly                                                            |
| `gitIdSwitcher.submoduleDepth`             | `1`         | Max. hloubka pro vnořené submoduly (1-5)                                                       |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`     | Zahrnout emoji ikonu do Git config `user.name`                                                 |
| `gitIdSwitcher.logging.fileEnabled`        | `false`     | Zapnout auditní logování (změny identity, operace SSH, atd.)                                   |
| `gitIdSwitcher.logging.filePath`           | `""`        | Cesta k souboru logu (např.: `~/.git-id-switcher/security.log`). Prázdné = výchozí umístění    |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`  | Max. velikost souboru před rotací (bajty, 1MB-100MB)                                           |
| `gitIdSwitcher.logging.maxFiles`           | `5`         | Max. počet rotovaných log souborů (1-20)                                                       |
| `gitIdSwitcher.logging.level`              | `"INFO"`    | Úroveň logování: `DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`. Zaznamenává vybranou úroveň a vyšší |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`     | Pokud je povoleno, všechny hodnoty jsou v protokolech maskovány (maximální soukromí)           |
| `gitIdSwitcher.commandTimeouts`            | `{}`        | Vlastní timeout pro příkaz (ms, 1sek-5min). Např.: `{"git": 15000, "ssh-add": 10000}`          |

#### O nastavení `includeIconInGitConfig`

Ovládá chování, když je nastaveno pole `icon`:

| Hodnota           | Chování                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| `false` (výchozí) | `icon` se zobrazuje pouze v rozhraní editoru. Do Git configu se zapisuje pouze `name` |
| `true`            | Do Git configu se zapisuje `icon + name`. Emoji se objeví v historii commitů          |

Příklad: `icon: "👤"`, `name: "Alex Novák"`

| includeIconInGitConfig | Git config `user.name` | Podpis commitu          |
| ---------------------- | ---------------------- | ----------------------- |
| `false`                | `Alex Novák`           | `Alex Novák <email>`    |
| `true`                 | `👤 Alex Novák`        | `👤 Alex Novák <email>` |

### Poznámka: Základní nastavení (bez SSH)

Pokud nepotřebujete přepínat SSH klíče (např. při použití různých committer informací s jedním GitHub účtem), můžete použít minimální konfiguraci:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Alex Novák",
      "email": "alex.novak@personal.example.com",
      "icon": "🏠",
      "description": "Osobní projekty"
    },
    {
      "id": "work",
      "name": "Alex Novák",
      "email": "alex.novak@company.example.com",
      "icon": "💼",
      "description": "Pracovní účet"
    }
  ]
}
```

Toto nastavení pouze přepíná `git config user.name` a `user.email`.

---

## Jak to funguje

### Struktura vrstev Git konfigurace

Git konfigurace má tři vrstvy, kde nižší vrstvy přepisují vyšší:

```text
Systémová (/etc/gitconfig)
    ↓ přepisuje
Globální (~/.gitconfig)
    ↓ přepisuje
Lokální (.git/config)  ← nejvyšší priorita
```

**Git ID Switcher zapisuje do `--local` (lokální pro repozitář).**

To znamená:

- Identita je uložena v `.git/config` každého repozitáře
- Lze udržovat různé identity pro každý repozitář
- Globální nastavení (`~/.gitconfig`) se nemění

### Chování při přepnutí identity

Při přepnutí identity rozšíření provede (v pořadí):

1. **Git konfigurace** (vždy): Nastaví `git config --local user.name` a `user.email`
2. **SSH klíč** (pokud je nastaven `sshKeyPath`): Odstraní ostatní klíče z ssh-agent, přidá vybraný
3. **GPG klíč** (pokud je nastaven `gpgKeyId`): Nastaví `git config --local user.signingkey` a povolí podepisování
4. **Submoduly** (pokud povoleno): Propaguje konfiguraci do všech submodulů (výchozí: hloubka 1)

### Mechanismus propagace do submodulů

Lokální nastavení jsou specifická pro repozitář, takže se automaticky neaplikují na submoduly.
Proto toto rozšíření poskytuje funkci propagace do submodulů (podrobnosti viz „Pokročilé: Podpora submodulů").

---

## Pokročilé: Podpora submodulů

Pro složité repozitáře používající Git submoduly je správa identity často problematická. Pokud uděláte commit v submodulu, Git použije lokální konfiguraci tohoto submodulu, která může použít globální konfiguraci (špatný email!), pokud není explicitně nastavena.

**Git ID Switcher** automaticky detekuje submoduly a aplikuje na ně vybranou identitu.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Povolit/zakázat tuto funkci
- `submoduleDepth`: Jak hluboko jít?
  - `1`: Pouze přímé submoduly (nejběžnější)
  - `2+`: Vnořené submoduly (submoduly v submodulech)

To zajišťuje, že vaše identita je vždy správná, ať už děláte commit v hlavním repozitáři nebo ve vendor knihovně.

---

## Řešení problémů

### SSH klíč se nepřepíná?

1. Ujistěte se, že `ssh-agent` běží:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Zkontrolujte, že cesta ke klíči je správná:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. Na macOS přidejte do Klíčenky jednou:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Špatná identita při push?

1. Zkontrolujte, že vzdálená URL používá správný host alias:

   ```bash
   git remote -v
   # Mělo by zobrazit git@github-work:... pro pracovní repozitáře
   ```

2. Aktualizujte pokud je třeba:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG podepisování nefunguje?

1. Najděte ID vašeho GPG klíče:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Otestujte podepisování:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Ujistěte se, že email ve vaší identitě odpovídá emailu GPG klíče.

### Identita není detekována?

- Ujistěte se, že jste v Git repozitáři
- Zkontrolujte, že `settings.json` nemá syntaktické chyby
- Znovu načtěte okno VS Code (`Cmd+Shift+P` → "Znovu načíst okno")

### Chyba v poli `name`?

Následující znaky v poli `name` způsobí chybu:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Pokud chcete zahrnout informace o službě, použijte pole `service`.

```jsonc
// NG
"name": "Alex Novák (Osobní)"

// OK
"name": "Alex Novák",
"service": "GitHub"
```

### Nová nastavení se nezobrazují?

Po aktualizaci rozšíření se nová nastavení nemusí zobrazit v rozhraní nastavení.

**Řešení:** Kompletně restartujte počítač.

Editory založené na VS Code ukládají do mezipaměti schémata nastavení v paměti a „Znovu načíst okno" nebo přeinstalace rozšíření nemusí stačit k jejich obnovení.

### Výchozí hodnoty jsou prázdné?

Pokud se ukázková nastavení nezobrazují ani po čisté instalaci, příčinou může být **Settings Sync**.

Pokud jste dříve uložili prázdná nastavení, mohla být synchronizována do cloudu a přepisují výchozí hodnoty při nových instalacích.

**Řešení:**

1. Najděte nastavení v rozhraní nastavení
2. Klikněte na ikonu ozubeného kola → „Resetovat nastavení"
3. Synchronizujte s Settings Sync (tím se odstraní stará nastavení z cloudu)

---

## Příkazy

| Příkaz                                   | Popis                             |
| ---------------------------------------- | --------------------------------- |
| `Git ID Switcher: Select Identity`       | Otevřít výběr identity            |
| `Git ID Switcher: Show Current Identity` | Zobrazit info o aktuální identitě |
| `Git ID Switcher: Show Documentation`    | Zobrazit dokumentaci              |

---

## Filozofie návrhu

> "Kdo jsem?" — Jediná otázka, na kterou toto rozšíření odpovídá.

Postaveno na **Architektuře Karesansui**: jednoduché jádro (100 řádků),
obklopené záměrnou kvalitou (90% pokrytí, logování, timeouty)
a vědomými omezeními (žádné GitHub API, žádná správa tokenů).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Přečíst celou filozofii](../../DESIGN_PHILOSOPHY.md)

---

## Přispívání

Příspěvky jsou vítány! Viz [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licence

MIT licence — viz [LICENSE](../../../LICENSE).

## Poděkování

Vytvořeno [Null;Variant](https://github.com/nullvariant)
