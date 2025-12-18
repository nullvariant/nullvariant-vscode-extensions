# Git ID Switcher

<table>
  <tr>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Přepínejte mezi více Git identitami jedním kliknutím. Spravujte více GitHub účtů, SSH klíče, GPG podepisování a <b>automaticky aplikujte identitu na Git submoduly</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Jazyky: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <b>🇨🇿</b> ... <a href="../../LANGUAGES.md">+20 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/docs/i18n/cs/demo.png" width="600" alt="Demo">

## Funkce

- **Přepnutí identity jedním klikem**: Okamžitá změna Git user.name a user.email
- **Správa SSH klíčů**: Automatické přepínání SSH klíčů v ssh-agent
- **Podpora GPG podepisování**: Konfigurace GPG klíče pro podepisování commitů (volitelné)
- **Podpora submodulů**: Automatická propagace identity do Git submodulů
- **Integrace do stavového řádku**: Vždy vidíte aktuální identitu
- **Podrobné nápovědy**: Kompletní informace s popisem a SSH hostem
- **Multiplatformní**: Funguje na macOS, Linux a Windows
- **Vícejazyčný**: Podporuje 17 jazyků

## 🚀 Proč toto rozšíření?

I když existuje mnoho nástrojů pro přepínání Git identity, **Git ID Switcher** řeší složité problémy, které jiné často ignorují:

1. **Noční můra submodulů**: Při práci s repozitáři obsahujícími submoduly (Hugo témata, vendor knihovny atd.) je obvykle nutné ručně nastavit `git config user.name` pro *každý* submodul. Toto rozšíření to elegantně řeší rekurzivní aplikací vaší identity na všechny aktivní submoduly.
2. **Zpracování SSH a GPG**: Nemění jen vaše jméno; také vyměňuje SSH klíče v agentovi a konfiguruje GPG podepisování, takže nikdy neuděláte commit s nesprávným podpisem.

## 🌏 Poznámka k vícejazyčné podpoře

> **Oceňuji existenci menšin.**
> Nechci je zavrhnout jen proto, že jich je málo.
> I když překlady nejsou dokonalé, doufám, že pocítíte náš záměr porozumět a projevit respekt menšinovým jazykům.

Toto rozšíření podporuje všech 17 jazyků, které podporuje VSCode. Navíc se u README dokumentace pokoušíme překládat do menšinových jazyků a dokonce i vtipných jazyků.

To není jen „globální podpora" — je to „respekt k jazykové rozmanitosti". A budu rád, když se to stane infrastrukturou, kde commity zlepšující svět přicházejí od vývojářů odkudkoli, překonávajících jazykové bariéry.

---

## Rychlý start

Typické nastavení pro správu více GitHub účtů.

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

Otevřete nastavení VS Code (`Cmd+,` / `Ctrl+,`) → hledejte "Git ID Switcher" → klikněte na "Upravit v settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Novák",
      "email": "alex.novak@personal.example.com",
      "description": "Osobní projekty",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Novák",
      "email": "alex.novak@company.example.com",
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
      "icon": "🏠",
      "name": "Alex Novák",
      "email": "alex.novak@personal.example.com",
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

# Pracovní účet
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Open source persona
Host github-oss
    HostName github.com
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
      "icon": "🏠",
      "name": "Alex Novák",
      "email": "alex.novak@personal.example.com",
      "description": "Osobní projekty",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Novák",
      "email": "alex.novak@company.example.com",
      "description": "Pracovní účet",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "oss",
      "icon": "🌟",
      "name": "anovak-oss",
      "email": "anovak.oss@example.com",
      "description": "Open source příspěvky",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "github-oss"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Novák",
      "email": "alex.novak@freelance.example.com",
      "description": "Freelance projekty"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Poznámka: Poslední identita (`freelance`) nemá SSH — pouze přepíná Git konfiguraci. To je užitečné při použití různých committer informací se stejným GitHub účtem.

---

## Reference konfigurace

### Vlastnosti identity

| Vlastnost     | Povinná | Popis                                                      |
| ------------- | ------- | ---------------------------------------------------------- |
| `id`          | ✅      | Jedinečný identifikátor (např.: `"work"`, `"personal"`)    |
| `name`        | ✅      | Git user.name — zobrazeno v commitech                      |
| `email`       | ✅      | Git user.email — zobrazeno v commitech                     |
| `icon`        |         | Emoji ve stavovém řádku (např.: `"💼"`)                     |
| `description` |         | Krátký popis ve výběru a nápovědě                          |
| `sshKeyPath`  |         | Cesta k soukromému SSH klíči (např.: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |         | SSH config host alias (např.: `"github-work"`)             |
| `gpgKeyId`    |         | ID GPG klíče pro podepisování commitů                      |

### Globální nastavení

| Nastavení                         | Výchozí    | Popis                                          |
| --------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`        | Viz příklad | Seznam konfigurací identit                    |
| `gitIdSwitcher.defaultIdentity`   | Viz příklad | ID výchozí identity                           |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`     | Automaticky přepínat SSH klíč                  |
| `gitIdSwitcher.showNotifications` | `true`     | Zobrazit oznámení při přepnutí                 |
| `gitIdSwitcher.applyToSubmodules` | `true`     | Aplikovat identitu na Git submoduly            |
| `gitIdSwitcher.submoduleDepth`    | `1`        | Max. hloubka pro vnořené submoduly (1-5)       |

### Poznámka: Základní nastavení (bez SSH)

Pokud nepotřebujete přepínat SSH klíče (např. při použití různých committer informací s jedním GitHub účtem), můžete použít minimální konfiguraci:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Novák",
      "email": "alex.novak@personal.example.com",
      "description": "Osobní projekty"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Novák",
      "email": "alex.novak@company.example.com",
      "description": "Pracovní účet"
    }
  ]
}
```

Toto nastavení pouze přepíná `git config user.name` a `user.email`.

---

## Jak to funguje

Při přepnutí identity rozšíření provede (v pořadí):

1. **Git konfigurace** (vždy): Nastaví `git config --local user.name` a `user.email`
2. **SSH klíč** (pokud je nastaven `sshKeyPath`): Odstraní ostatní klíče z ssh-agent, přidá vybraný
3. **GPG klíč** (pokud je nastaven `gpgKeyId`): Nastaví `git config --local user.signingkey` a povolí podepisování
4. **Submoduly** (pokud povoleno): Propaguje konfiguraci do všech submodulů (výchozí: hloubka 1)

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

---

## Příkazy

| Příkaz                          | Popis                            |
| ------------------------------- | -------------------------------- |
| `Git ID: Select Identity`       | Otevřít výběr identity           |
| `Git ID: Show Current Identity` | Zobrazit info o aktuální identitě |

---

## Přispívání

Příspěvky jsou vítány! Viz [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licence

MIT licence — viz [LICENSE](../../LICENSE).

## Poděkování

Vytvořeno [Null;Variant](https://github.com/nullvariant)
