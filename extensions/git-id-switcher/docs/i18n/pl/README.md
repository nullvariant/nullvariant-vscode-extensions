# Git ID Switcher

<table>
  <tr>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Przełączaj się między wieloma tożsamościami Git jednym kliknięciem. Zarządzaj wieloma kontami GitHub, kluczami SSH, podpisami GPG i <b>automatycznie stosuj tożsamość do submodułów Git</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Języki: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <b>🇵🇱</b> ... <a href="../../LANGUAGES.md">+20 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/docs/i18n/pl/demo.png" width="600" alt="Demo">

## Funkcje

- **Przełączanie tożsamości jednym kliknięciem**: Natychmiastowa zmiana Git user.name i user.email
- **Zarządzanie kluczami SSH**: Automatyczne przełączanie kluczy SSH w ssh-agent
- **Obsługa podpisów GPG**: Konfiguracja klucza GPG do podpisywania commitów (opcjonalne)
- **Obsługa submodułów**: Automatyczne propagowanie tożsamości do submodułów Git
- **Integracja z paskiem stanu**: Zawsze widzisz bieżącą tożsamość
- **Szczegółowe podpowiedzi**: Pełne informacje z opisem i hostem SSH
- **Wieloplatformowość**: Działa na macOS, Linux i Windows
- **Wielojęzyczność**: Obsługuje 17 języków

## 🚀 Dlaczego to rozszerzenie?

Chociaż istnieje wiele narzędzi do przełączania tożsamości Git, **Git ID Switcher** rozwiązuje złożone problemy, które inne często ignorują:

1. **Koszmar submodułów**: Pracując z repozytoriami zawierającymi submoduły (motywy Hugo, biblioteki vendor itp.), zwykle trzeba ręcznie ustawiać `git config user.name` dla *każdego* submodułu. To rozszerzenie elegancko rozwiązuje problem, rekurencyjnie stosując tożsamość do wszystkich aktywnych submodułów.
2. **Obsługa SSH i GPG**: Nie tylko zmienia nazwę; również wymienia klucze SSH w agencie i konfiguruje podpis GPG, więc nigdy nie zrobisz commita z niewłaściwym podpisem.

## 🌏 Słowo o wsparciu wielojęzycznym

> **Cenię istnienie mniejszości.**
> Nie chcę ich odrzucać tylko dlatego, że jest ich niewiele.
> Nawet jeśli tłumaczenia nie są idealne, mam nadzieję, że poczujesz naszą intencję zrozumienia i okazania szacunku językom mniejszościowym.

To rozszerzenie obsługuje wszystkie 17 języków obsługiwanych przez VSCode. Dodatkowo, w przypadku dokumentacji README, podejmujemy wyzwanie tłumaczenia na języki mniejszościowe, a nawet żartobliwe.

To nie tylko „globalne wsparcie" — to „szacunek dla różnorodności językowej". I cieszę się, jeśli stanie się to infrastrukturą, w której commity ulepszające świat pochodzą od deweloperów z całego świata, przekraczając bariery językowe.

---

## Szybki start

Typowa konfiguracja do zarządzania wieloma kontami GitHub.

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

Otwórz ustawienia VS Code (`Cmd+,` / `Ctrl+,`) → wyszukaj "Git ID Switcher" → kliknij "Edytuj w settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@personal.example.com",
      "description": "Projekty osobiste",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@company.example.com",
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

# Persona open source
Host github-oss
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
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
      "description": "Projekty osobiste",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@company.example.com",
      "description": "Konto służbowe",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "oss",
      "icon": "🌟",
      "name": "akowalski-oss",
      "email": "akowalski.oss@example.com",
      "description": "Wkład open source",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "github-oss"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@freelance.example.com",
      "description": "Projekty freelance"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Uwaga: Ostatnia tożsamość (`freelance`) nie ma SSH — przełącza tylko konfigurację Git. Jest to przydatne, gdy używasz różnych informacji o committerze z tym samym kontem GitHub.

---

## Odniesienie do konfiguracji

### Właściwości tożsamości

| Właściwość    | Wymagane | Opis                                                       |
| ------------- | -------- | ---------------------------------------------------------- |
| `id`          | ✅       | Unikalny identyfikator (np.: `"work"`, `"personal"`)       |
| `name`        | ✅       | Git user.name — wyświetlane w commitach                    |
| `email`       | ✅       | Git user.email — wyświetlane w commitach                   |
| `icon`        |          | Emoji na pasku stanu (np.: `"💼"`)                          |
| `description` |          | Krótki opis w selektorze i podpowiedzi                     |
| `sshKeyPath`  |          | Ścieżka do prywatnego klucza SSH (np.: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |          | Alias hosta SSH (np.: `"github-work"`)                     |
| `gpgKeyId`    |          | ID klucza GPG do podpisywania commitów                     |

### Ustawienia globalne

| Ustawienie                        | Domyślnie  | Opis                                           |
| --------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`        | Zobacz przykład | Lista konfiguracji tożsamości             |
| `gitIdSwitcher.defaultIdentity`   | Zobacz przykład | ID domyślnej tożsamości                   |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`     | Automatyczne przełączanie klucza SSH           |
| `gitIdSwitcher.showNotifications` | `true`     | Pokazuj powiadomienie przy przełączaniu        |
| `gitIdSwitcher.applyToSubmodules` | `true`     | Stosuj tożsamość do submodułów Git             |
| `gitIdSwitcher.submoduleDepth`    | `1`        | Maks. głębokość dla zagnieżdżonych submodułów (1-5) |

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
      "description": "Projekty osobiste"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@company.example.com",
      "description": "Konto służbowe"
    }
  ]
}
```

Ta konfiguracja przełącza tylko `git config user.name` i `user.email`.

---

## Jak to działa

Podczas przełączania tożsamości rozszerzenie wykonuje (w kolejności):

1. **Konfiguracja Git** (zawsze): Ustawia `git config --local user.name` i `user.email`
2. **Klucz SSH** (jeśli ustawiono `sshKeyPath`): Usuwa inne klucze z ssh-agent, dodaje wybrany
3. **Klucz GPG** (jeśli ustawiono `gpgKeyId`): Ustawia `git config --local user.signingkey` i włącza podpisywanie
4. **Submoduły** (jeśli włączone): Propaguje konfigurację do wszystkich submodułów (domyślnie: głębokość 1)

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

Licencja MIT — zobacz [LICENSE](../../LICENSE).

## Podziękowania

Stworzone przez [Null;Variant](https://github.com/nullvariant)
