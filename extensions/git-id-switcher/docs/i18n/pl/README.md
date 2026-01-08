# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Przełączaj się między wieloma tożsamościami Git jednym kliknięciem. Zarządzaj wieloma kontami GitHub, kluczami SSH, podpisami GPG i <b>automatycznie stosuj tożsamość do submodułów Git</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <br>
      🌐 Języki: <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <b>🇵🇱</b> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-pl.png" width="600" alt="Demo">

## 🎯 Dlaczego Git ID Switcher?

Chociaż istnieje wiele narzędzi do przełączania tożsamości Git, **Git ID Switcher** rozwiązuje złożone problemy, które inne często ignorują:

1. **Koszmar submodułów**: Pracując z repozytoriami zawierającymi submoduły (motywy Hugo, biblioteki vendor itp.), zwykle trzeba ręcznie ustawiać `git config user.name` dla *każdego* submodułu. To rozszerzenie elegancko rozwiązuje problem, rekurencyjnie stosując tożsamość do wszystkich aktywnych submodułów.
2. **Obsługa SSH i GPG**: Nie tylko zmienia nazwę; również wymienia klucze SSH w agencie i konfiguruje podpis GPG, więc nigdy nie zrobisz commita z niewłaściwym podpisem.

## Funkcje

- **Obsługa submodułów**: Automatyczne propagowanie tożsamości do submodułów Git
- **Zarządzanie kluczami SSH**: Automatyczne przełączanie kluczy SSH w ssh-agent
- **Obsługa podpisów GPG**: Konfiguracja klucza GPG do podpisywania commitów (opcjonalne)
- **Przełączanie tożsamości jednym kliknięciem**: Natychmiastowa zmiana Git user.name i user.email
- **Integracja z paskiem stanu**: Zawsze widzisz bieżącą tożsamość
- **Szczegółowe podpowiedzi**: Pełne informacje z opisem i hostem SSH
- **Wieloplatformowość**: Działa na macOS, Linux i Windows
- **Wielojęzyczność**: Obsługuje 17 języków

## 🌏 Słowo o wsparciu wielojęzycznym

> **Cenię istnienie mniejszości.**
> Nie chcę ich odrzucać tylko dlatego, że jest ich niewiele.
> Nawet jeśli tłumaczenia nie są idealne, mam nadzieję, że poczujesz naszą intencję zrozumienia i okazania szacunku językom mniejszościowym.

To rozszerzenie obsługuje wszystkie 17 języków obsługiwanych przez VSCode. Dodatkowo, w przypadku dokumentacji README, podejmujemy wyzwanie tłumaczenia na języki mniejszościowe, a nawet żartobliwe.

To nie tylko „globalne wsparcie" — to „szacunek dla różnorodności językowej". I cieszę się, jeśli stanie się to infrastrukturą, w której commity ulepszające świat pochodzą od deweloperów z całego świata, przekraczając bariery językowe.

---

## Szybki start

Typowa konfiguracja do zarządzania wieloma kontami GitHub (w tym kontami Enterprise Managed User).

### Krok 1: Przygotuj klucze SSH

Najpierw utwórz klucze SSH dla każdego konta (pomiń, jeśli już masz):

```bash
# Osobisty
ssh-keygen -t ed25519 -C "alex.kowalski@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Służbowy
ssh-keygen -t ed25519 -C "alex.kowalski@company.example.com" -f ~/.ssh/id_ed25519_work
```

Zarejestruj **klucz publiczny** (plik `.pub`) każdego klucza na odpowiednim koncie GitHub.

> **Uwaga**: Na GitHub rejestrujesz `id_ed25519_personal.pub` (klucz publiczny). `id_ed25519_personal` (bez rozszerzenia) to klucz prywatny — nigdy go nie udostępniaj ani nie wgrywaj nigdzie.

### Krok 2: Skonfiguruj SSH

Edytuj `~/.ssh/config`:

```ssh-config
# Osobiste konto GitHub (domyślne)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Służbowe konto GitHub
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Krok 3: Skonfiguruj rozszerzenie

Otwórz ustawienia rozszerzenia (`Cmd+,` / `Ctrl+,`) → wyszukaj "Git ID Switcher" → kliknij "Edytuj w settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@personal.example.com",
      "service": "GitHub",
      "description": "Projekty osobiste",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@company.example.com",
      "service": "GitHub Praca",
      "description": "Konto służbowe",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Krok 4: Używaj

1. Kliknij ikonę tożsamości na pasku stanu (prawy dolny róg)
2. Wybierz tożsamość
3. Gotowe! Konfiguracja Git i klucz SSH zostały przełączone.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-pl.png" width="600" alt="Quick Pick">

### Używanie aliasów hostów SSH

Podczas klonowania repozytoriów używaj hosta odpowiadającego twojej tożsamości:

```bash
# Dla tożsamości służbowej (używa aliasu github-work)
git clone git@github-work:company/repo.git

# Dla tożsamości osobistej (używa domyślnego github.com)
git clone git@github.com:akowalski/repo.git
```

---

## Opcjonalnie: Podpis GPG

Jeśli podpisujesz commity za pomocą GPG:

### Krok 1: Znajdź ID klucza GPG

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Przykładowe wyjście:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Alex Kowalski <alex.kowalski@personal.example.com>
```

ID klucza to `ABCD1234`.

### Krok 2: Dodaj klucz GPG do tożsamości

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@personal.example.com",
      "service": "GitHub",
      "description": "Projekty osobiste",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Po przełączeniu na tę tożsamość rozszerzenie ustawia:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Pełny przykład: 4 konta z SSH + GPG

Oto kompletny przykład łączący wszystko:

### Konfiguracja SSH (`~/.ssh/config`)

```ssh-config
# Konto osobiste (domyślne)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Konto służbowe
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Konto Bitbucket
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Ustawienia rozszerzenia

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@personal.example.com",
      "service": "GitHub",
      "description": "Projekty osobiste",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@company.example.com",
      "service": "GitHub Praca",
      "description": "Konto służbowe",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "akowalski-bb",
      "email": "akowalski.bb@example.com",
      "service": "Bitbucket",
      "description": "Projekty Bitbucket",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@freelance.example.com",
      "service": "GitLab",
      "description": "Projekty freelance"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Uwaga: Ostatnia tożsamość (`freelance`) nie ma SSH — przełącza tylko konfigurację Git. Jest to przydatne, gdy używasz różnych informacji o committerze z tym samym kontem GitLab.

---

## Odniesienie do konfiguracji

### Właściwości tożsamości

| Właściwość    | Wymagane | Opis                                                       |
| ------------- | -------- | ---------------------------------------------------------- |
| `id`          | ✅       | Unikalny identyfikator (np.: `"work"`, `"personal"`)       |
| `name`        | ✅       | Git user.name — wyświetlane w commitach (patrz Ograniczenia wyświetlania) |
| `email`       | ✅       | Git user.email — wyświetlane w commitach                   |
| `icon`        |          | Pojedyncze emoji na pasku stanu (np.: `"💼"`)               |
| `service`     |          | Nazwa serwisu (np.: `"GitHub"`, `"GitLab"`, `"Bitbucket"`) |
| `description` |          | Krótki opis w selektorze i podpowiedzi                     |
| `sshKeyPath`  |          | Ścieżka do prywatnego klucza SSH (np.: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |          | Alias hosta SSH (np.: `"github-work"`)                     |
| `gpgKeyId`    |          | ID klucza GPG do podpisywania commitów                     |

#### Ograniczenia wyświetlania

- **Pasek stanu**: Tekst dłuższy niż ~25 znaków zostanie obcięty z `...`
- **`icon`**: Dozwolone jest tylko jedno emoji (klaster grafemów). Wiele emoji lub długie ciągi nie są obsługiwane

### Ustawienia globalne

| Ustawienie                             | Domyślnie  | Opis                                            |
| -------------------------------------- | ---------- | ----------------------------------------------- |
| `gitIdSwitcher.identities`             | Zobacz przykład | Lista konfiguracji tożsamości              |
| `gitIdSwitcher.defaultIdentity`        | Zobacz przykład | ID domyślnej tożsamości                    |
| `gitIdSwitcher.autoSwitchSshKey`       | `true`     | Automatyczne przełączanie klucza SSH            |
| `gitIdSwitcher.showNotifications`      | `true`     | Pokazuj powiadomienie przy przełączaniu         |
| `gitIdSwitcher.applyToSubmodules`      | `true`     | Stosuj tożsamość do submodułów Git              |
| `gitIdSwitcher.submoduleDepth`         | `1`        | Maks. głębokość dla zagnieżdżonych submodułów (1-5) |
| `gitIdSwitcher.includeIconInGitConfig` | `false`    | Dołącz emoji do Git user.name                   |
| `gitIdSwitcher.logging.fileEnabled` | `false` | Włącz logowanie audytu (zmiany tożsamości, operacje SSH, itp.) |
| `gitIdSwitcher.logging.filePath` | `""` | Ścieżka pliku dziennika (np.: `~/.git-id-switcher/security.log`). Pusty = domyślna lokalizacja |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Maks. rozmiar pliku przed rotacją (bajty, 1MB-100MB) |
| `gitIdSwitcher.logging.maxFiles` | `5` | Maks. liczba plików dziennika w rotacji (1-20) |
| `gitIdSwitcher.logging.level` | `"INFO"` | Poziom logowania: `DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`. Zapisuje wybrany poziom i wyżej |
| `gitIdSwitcher.commandTimeouts` | `{}` | Niestandardowy timeout dla komend (ms, 1sek-5min). Np.: `{"git": 15000, "ssh-add": 10000}` |

#### O ustawieniu `includeIconInGitConfig`

Kontroluje zachowanie gdy pole `icon` jest ustawione:

| Wartość | Zachowanie |
|---------|------------|
| `false` (domyślnie) | `icon` jest wyświetlany tylko w interfejsie edytora. Tylko `name` jest zapisywane w Git config |
| `true` | `icon + name` jest zapisywane w Git config. Emoji pojawi się w historii commitów |

Przykład: `icon: "👤"`, `name: "Alex Kowalski"`

| includeIconInGitConfig | Git config `user.name` | Podpis commita |
|------------------------|------------------------|----------------|
| `false` | `Alex Kowalski` | `Alex Kowalski <email>` |
| `true` | `👤 Alex Kowalski` | `👤 Alex Kowalski <email>` |

### Uwaga: Podstawowa konfiguracja (bez SSH)

Jeśli nie potrzebujesz przełączać kluczy SSH (np. używając różnych informacji o committerze z jednym kontem GitHub), możesz użyć minimalnej konfiguracji:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@personal.example.com",
      "service": "GitHub",
      "description": "Projekty osobiste"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@company.example.com",
      "service": "GitHub Praca",
      "description": "Konto służbowe"
    }
  ]
}
```

Ta konfiguracja przełącza tylko `git config user.name` i `user.email`.

---

## Jak to działa

### Struktura warstw konfiguracji Git

Konfiguracja Git ma trzy warstwy, gdzie niższe warstwy nadpisują wyższe:

```text
Systemowa (/etc/gitconfig)
    ↓ nadpisuje
Globalna (~/.gitconfig)
    ↓ nadpisuje
Lokalna (.git/config)  ← najwyższy priorytet
```

**Git ID Switcher zapisuje do `--local` (lokalne dla repozytorium).**

Oznacza to:

- Tożsamość jest zapisywana w `.git/config` każdego repozytorium
- Można utrzymywać różne tożsamości dla każdego repozytorium
- Ustawienia globalne (`~/.gitconfig`) nie są modyfikowane

### Zachowanie przy przełączaniu tożsamości

Po przełączeniu tożsamości rozszerzenie wykonuje (w kolejności):

1. **Konfiguracja Git** (zawsze): Ustawia `git config --local user.name` i `user.email`
2. **Klucz SSH** (jeśli ustawiono `sshKeyPath`): Usuwa inne klucze z ssh-agent, dodaje wybrany
3. **Klucz GPG** (jeśli ustawiono `gpgKeyId`): Ustawia `git config --local user.signingkey` i włącza podpisywanie
4. **Submoduły** (jeśli włączone): Propaguje konfigurację do wszystkich submodułów (domyślnie: głębokość 1)

### Mechanizm propagacji do submodułów

Ustawienia lokalne są specyficzne dla repozytorium, więc nie są automatycznie stosowane do submodułów.
Dlatego to rozszerzenie zapewnia funkcję propagacji do submodułów (szczegóły w sekcji „Zaawansowane: Obsługa submodułów").

---

## Zaawansowane: Obsługa submodułów

Dla złożonych repozytoriów używających submodułów Git, zarządzanie tożsamością jest często uciążliwe. Jeśli robisz commit w submodule, Git używa lokalnej konfiguracji tego submodułu, która może używać konfiguracji globalnej (zły email!), jeśli nie jest jawnie ustawiona.

**Git ID Switcher** automatycznie wykrywa submoduły i stosuje do nich wybraną tożsamość.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Włącz/wyłącz tę funkcję
- `submoduleDepth`: Jak głęboko sięgać?
  - `1`: Tylko bezpośrednie submoduły (najczęstsze)
  - `2+`: Zagnieżdżone submoduły (submoduły w submodułach)

Gwarantuje to, że twoja tożsamość jest zawsze poprawna, niezależnie od tego, czy robisz commit w głównym repozytorium, czy w bibliotece vendor.

---

## Rozwiązywanie problemów

### Klucz SSH się nie przełącza?

1. Upewnij się, że `ssh-agent` jest uruchomiony:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Sprawdź, czy ścieżka do klucza jest poprawna:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. Na macOS dodaj do Keychain raz:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Niewłaściwa tożsamość przy push?

1. Sprawdź, czy zdalny URL używa poprawnego aliasu hosta:

   ```bash
   git remote -v
   # Powinien pokazywać git@github-work:... dla repozytoriów służbowych
   ```

2. Zaktualizuj w razie potrzeby:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### Podpis GPG nie działa?

1. Znajdź ID klucza GPG:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Przetestuj podpis:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Upewnij się, że email w tożsamości odpowiada emailowi klucza GPG.

### Tożsamość nie wykryta?

- Upewnij się, że jesteś w repozytorium Git
- Sprawdź, czy `settings.json` nie ma błędów składni
- Przeładuj okno VS Code (`Cmd+Shift+P` → "Przeładuj okno")

### Błąd w polu `name`?

Następujące znaki w polu `name` spowodują błąd:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Jeśli chcesz dołączyć informacje o serwisie, użyj pola `service`.

```jsonc
// NG
"name": "Alex Kowalski (Osobisty)"

// OK
"name": "Alex Kowalski",
"service": "GitHub"
```

### Nowe ustawienia nie są wyświetlane?

Po aktualizacji rozszerzenia nowe ustawienia mogą nie pojawiać się w interfejsie ustawień.

**Rozwiązanie:** Całkowicie uruchom ponownie komputer.

Edytory oparte na VS Code buforują schematy ustawień w pamięci, a „Przeładuj okno" lub ponowna instalacja rozszerzenia może nie wystarczyć do ich odświeżenia.

### Domyślne wartości są puste?

Jeśli przykładowe ustawienia nie pojawiają się nawet po czystej instalacji, przyczyną może być **Settings Sync**.

Jeśli wcześniej zapisałeś puste ustawienia, mogły zostać zsynchronizowane do chmury i nadpisują wartości domyślne przy nowych instalacjach.

**Rozwiązanie:**

1. Znajdź ustawienie w interfejsie ustawień
2. Kliknij ikonę koła zębatego → „Resetuj ustawienie"
3. Zsynchronizuj z Settings Sync (to usunie stare ustawienia z chmury)

---

## Polecenia

| Polecenie                       | Opis                              |
| ------------------------------- | --------------------------------- |
| `Git ID: Select Identity`       | Otwórz selektor tożsamości        |
| `Git ID: Show Current Identity` | Pokaż informacje o bieżącej tożsamości |

---

## Współtworzenie

Wkład jest mile widziany! Zobacz [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licencja

Licencja MIT — zobacz [LICENSE](../../../LICENSE).

## Podziękowania

Stworzone przez [Null;Variant](https://github.com/nullvariant)
