# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Přepínejte mezi více Git profily jedním kliknutím. Spravujte více GitHub účtů, SSH klíče, GPG podepisování a <b>automaticky aplikujte profil na Git submoduly</b>.
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

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/cs/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Proč Git ID Switcher?

I když existuje mnoho nástrojů pro přepínání Git profilů, **Git ID Switcher** řeší složité problémy, které jiné často ignorují:

1. **Noční můra submodulů**: Při práci s repozitáři obsahujícími submoduly (Hugo témata, vendor knihovny atd.) je obvykle nutné ručně nastavit `git config user.name` pro _každý_ submodul. Toto rozšíření to elegantně řeší rekurzivní aplikací vašeho profilu na všechny aktivní submoduly.
2. **Zpracování SSH & GPG**: Nemění jen vaše jméno — také vyměňuje SSH klíče v agentovi a konfiguruje GPG podepisování, takže nikdy neuděláte commit s nesprávným podpisem.

## Funkce

- **UI pro správu profilů**: Přidávejte, upravujte, mažte a přeřazujte profily bez úpravy settings.json
- **Přepnutí profilu jedním klikem**: Okamžitá změna Git user.name a user.email
- **Integrace do stavového řádku**: Vždy vidíte aktuální profil
- **Podpora submodulů**: Automatická propagace profilu do Git submodulů
- **Správa SSH klíčů**: Automatické přepínání SSH klíčů v ssh-agent
- **Podpora GPG podepisování**: Konfigurace GPG klíče pro podepisování commitů (volitelné)
- **Podrobné nápovědy**: Kompletní informace s popisem a SSH hostem
- **Multiplatformní**: Funguje na macOS, Linux a Windows
- **Vícejazyčný**: Podporuje 17 jazyků

## 🌏 Poznámka k vícejazyčné podpoře

> **Oceňuji existenci menšin.**
> Nechci je zavrhnout jen proto, že jich je málo.
> I když překlady nejsou dokonalé, doufám, že pocítíte náš záměr porozumět a projevit respekt menšinovým jazykům.

Toto rozšíření podporuje všech 17 jazyků, které podporuje VS Code. Navíc se u README dokumentace pokoušíme překládat do menšinových jazyků a dokonce i vtipných jazyků.

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

Po instalaci jsou připraveny ukázkové profily.
Postupujte podle níže uvedeného průvodce a upravte je podle svých potřeb.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/cs/first-ux.webp" width="600" alt="Průvodce prvním nastavením (13 kroků): Otevřete správu profilů ze stavového řádku, upravte a vytvořte nové" loading="lazy">

> **Soubory klíčů se neodesílají**: Při nastavení cesty k SSH klíči se zaznamenává pouze cesta (umístění) k souboru klíče. Obsah souboru klíče nebude nikdy nahrán nebo odeslán externě.

> **Pokud používáte GPG podepisování**: Můžete také nastavit `gpgKeyId` na obrazovce úprav profilu.
> Informace o nalezení ID GPG klíče viz „[Řešení problémů](#gpg-podepisování-nefunguje)".

> **Tip**: Můžete také konfigurovat přímo v settings.json.
> Otevřete nastavení rozšíření (`Cmd+,` / `Ctrl+,`) → vyhledejte „Git ID Switcher" → klikněte na „Upravit v settings.json".
> Příklad konfigurace ve formátu JSON viz „[Kompletní příklad konfigurace](#kompletní-příklad-konfigurace-5-účtů-s-ssh--gpg)".

---

## Kompletní příklad konfigurace: 5 účtů s SSH + GPG

Kompletní příklad kombinující vše:

### SSH konfigurace (`~/.ssh/config`)

```ssh-config
# Osobní účet (výchozí)
Host github-personal
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

# Klient A – zakázková práce (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Klient B – projekt na místě (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS příspěvky (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Nastavení rozšíření

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Alex Novák",
      "email": "alex@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Osobní projekty",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Alex Novák",
      "email": "alex.novak@techcorp.example.com",
      "service": "GitHub Práce",
      "icon": "💼",
      "description": "TechCorp hlavní práce",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Alex Novák",
      "email": "alex@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA zakázka",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "A.Novák",
      "email": "a.novak@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB na místě",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "alex-dev",
      "email": "alex.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "Příspěvky do OSS",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Poznámka: 4. profil (`client-b`) používá zkrácené jméno a 5. (`oss`) vývojářský handle. Pro každý profil můžete nastavit jiné zobrazované jméno, i pro tutéž osobu.

---

## Správa profilů

Klikněte na stavový řádek → „Správa profilů" ve spodní části seznamu pro otevření obrazovky správy.
Přidávání, úpravy, mazání a přeřazování profilů lze provádět přímo z UI.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/cs/identity-management.webp" width="600" alt="Správa profilů: Průvodce operacemi mazání a přeřazování" loading="lazy">

Profily můžete také mazat z palety příkazů pomocí `Git ID Switcher: Delete Identity`.

---

## Příkazy

| Příkaz                                   | Popis                             |
| ---------------------------------------- | --------------------------------- |
| `Git ID Switcher: Select Identity`       | Otevřít výběr profilu             |
| `Git ID Switcher: Delete Identity`       | Smazat profil                     |
| `Git ID Switcher: Show Current Identity` | Zobrazit info o aktuálním profilu |
| `Git ID Switcher: Show Documentation`    | Zobrazit dokumentaci              |

---

## Reference konfigurace

### Vlastnosti profilu

| Vlastnost     | Povinná | Popis                                                                       |
| ------------- | ------- | --------------------------------------------------------------------------- |
| `id`          | ✅      | Jedinečný identifikátor (např.: `"personal"`, `"work"`)                     |
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

| Nastavení                                  | Výchozí     | Popis                                                                                        |
| ------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Viz příklad | Seznam konfigurací profilů                                                                   |
| `gitIdSwitcher.defaultIdentity`            | Viz příklad | ID výchozího profilu                                                                         |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`      | Automaticky přepínat SSH klíč při změně profilu                                              |
| `gitIdSwitcher.showNotifications`          | `true`      | Zobrazit oznámení při přepnutí profilu                                                       |
| `gitIdSwitcher.applyToSubmodules`          | `true`      | Aplikovat profil na Git submoduly                                                            |
| `gitIdSwitcher.submoduleDepth`             | `1`         | Maximální hloubka pro vnořené submoduly (1-5)                                                |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`     | Zahrnout emoji ikonu do Git config `user.name`                                               |
| `gitIdSwitcher.logging.fileEnabled`        | `false`     | Zapnout auditní logování (změny profilu, operace SSH atd.)                                   |
| `gitIdSwitcher.logging.filePath`           | `""`        | Cesta k souboru logu (např.: `~/.git-id-switcher/security.log`). Prázdné = výchozí umístění  |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`  | Maximální velikost souboru před rotací (bajty, 1MB-100MB)                                    |
| `gitIdSwitcher.logging.maxFiles`           | `5`         | Maximální počet rotovaných log souborů (1-20)                                                |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`     | Pokud je povoleno, všechny hodnoty jsou v protokolech maskovány (maximální soukromí)         |
| `gitIdSwitcher.logging.level`              | `"INFO"`    | Úroveň logování (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Zaznamenává vybranou a vyšší |
| `gitIdSwitcher.commandTimeouts`            | `{}`        | Vlastní timeout pro příkaz (ms, 1sek-5min). Např.: `{"git": 15000, "ssh-add": 10000}`        |

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

- Profil je uložen v `.git/config` každého repozitáře
- Lze udržovat různé profily pro každý repozitář
- Globální nastavení (`~/.gitconfig`) se nemění

### Chování při přepnutí profilu

Při přepnutí profilu rozšíření provede (v pořadí):

1. **Git konfigurace** (vždy): Nastaví `git config --local user.name` a `user.email`
2. **SSH klíč** (pokud je nastaven `sshKeyPath`): Odstraní ostatní klíče z ssh-agent, přidá vybraný
3. **GPG klíč** (pokud je nastaven `gpgKeyId`): Nastaví `git config --local user.signingkey` a povolí podepisování
4. **Submoduly** (pokud povoleno): Propaguje konfiguraci do všech submodulů (výchozí: hloubka 1)

### Mechanismus propagace do submodulů

Lokální nastavení jsou specifická pro repozitář, takže se automaticky neaplikují na submoduly.
Proto toto rozšíření poskytuje funkci propagace do submodulů (podrobnosti viz „Pokročilé: Podpora submodulů").

### Podrobnosti správy SSH klíčů

Git ID Switcher spravuje SSH klíče prostřednictvím `ssh-agent`:

| Operace        | Prováděný příkaz       |
| -------------- | ---------------------- |
| Přidání klíče  | `ssh-add <keyPath>`    |
| Odebrání klíče | `ssh-add -d <keyPath>` |
| Seznam klíčů   | `ssh-add -l`           |

**Důležité:** Toto rozšíření **nemodifikuje** `~/.ssh/config`. Konfiguraci SSH musíte nastavit ručně (viz „Krok 2" v Rychlém startu).

### Interakce s existující SSH konfigurací

Pokud již máte konfiguraci SSH, Git ID Switcher funguje následovně:

| Vaše nastavení                                          | Chování Git ID Switcheru                                  |
| ------------------------------------------------------- | --------------------------------------------------------- |
| `IdentityFile` specifikován v `~/.ssh/config`           | Oba lze použít; `IdentitiesOnly yes` zabraňuje konfliktům |
| Nastavena proměnná prostředí `GIT_SSH_COMMAND`          | Použije se vlastní SSH příkaz; ssh-agent nadále funguje   |
| Nastaven `git config core.sshCommand`                   | Stejné jako výše                                          |
| Proměnné prostředí související s SSH nastaveny v direnv | Koexistuje; ssh-agent funguje nezávisle                   |

**Doporučeno:** Vždy nastavte `IdentitiesOnly yes` v SSH configu. Tím se zabrání, aby SSH zkoušelo více klíčů.

### Proč `IdentitiesOnly yes`?

Bez tohoto nastavení může SSH zkoušet klíče v tomto pořadí:

1. Klíče načtené v ssh-agent (spravované Git ID Switcherem)
2. Klíče specifikované v `~/.ssh/config`
3. Výchozí klíče (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` atd.)

To může vést k selhání autentizace nebo použití nesprávného klíče.

Nastavením `IdentitiesOnly yes` bude SSH používat **pouze specifikovaný klíč**. Tím se zajistí, že se použije klíč nastavený v Git ID Switcheru.

```ssh-config
# Doporučená konfigurace
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Tento řádek je důležitý
```

S tímto nastavením bude při připojení k hostu `github-work` použit pouze `~/.ssh/id_ed25519_work` a žádné jiné klíče se nezkoušejí.

---

## Pokročilé: Podpora submodulů

Pro složité repozitáře používající Git submoduly je správa profilů často problematická. Pokud uděláte commit v submodulu, Git použije lokální konfiguraci tohoto submodulu, která může použít globální konfiguraci (špatný email!), pokud není explicitně nastavena.

**Git ID Switcher** automaticky detekuje submoduly a aplikuje na ně vybraný profil.

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

To zajišťuje, že váš profil je vždy správný, ať už děláte commit v hlavním repozitáři nebo ve vendor knihovně.

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

### Špatný profil při push?

**Při novém klonování:**

Při klonování pracovních repozitářů použijte host alias nastavený v SSH configu:

```bash
# Pracovní (používá alias github-work)
git clone git@github-work:company/repo.git

# Osobní (používá výchozí github.com)
git clone git@github.com:yourname/repo.git
```

**Pro existující repozitáře:**

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

3. Ujistěte se, že email v profilu odpovídá emailu GPG klíče

### Profil není detekován?

- Ujistěte se, že jste v Git repozitáři
- Zkontrolujte, že `settings.json` nemá syntaktické chyby
- Znovu načtěte okno VS Code (`Cmd+Shift+P` → „Znovu načíst okno")

### Chyba v poli `name`?

Následující znaky v poli `name` způsobí chybu:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Pokud chcete zahrnout název služby, použijte pole `service`.

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

### Výchozí hodnoty (identities atd.) jsou prázdné?

Pokud se ukázková nastavení nezobrazují ani po čisté instalaci, příčinou může být **Settings Sync**.

Pokud jste dříve uložili prázdná nastavení, mohla být synchronizována do cloudu a přepisují výchozí hodnoty při nových instalacích.

**Řešení:**

1. Najděte nastavení v rozhraní nastavení
2. Klikněte na ikonu ozubeného kola → „Resetovat nastavení"
3. Synchronizujte s Settings Sync (tím se odstraní stará nastavení z cloudu)

---

## Filozofie návrhu

> **„Kdo jsem?" — Jediná otázka, na kterou toto rozšíření odpovídá**

Postaveno na **Architektuře Karesansui**: jednoduché jádro (100 řádků).
Proto zbývá prostor pro kvalitu (90% pokrytí testy, logování, timeouty)
a záměrná omezení (žádné GitHub API, žádná správa tokenů).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Přečíst celou filozofii](../../DESIGN_PHILOSOPHY.md)

---

## Přispívání

Příspěvky jsou vítány! Viz [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licence

MIT licence — viz [LICENSE](../../../LICENSE).

## Poděkování

Vytvořeno [Null;Variant](https://github.com/nullvariant)
