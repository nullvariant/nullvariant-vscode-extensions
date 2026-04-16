# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Przełączaj się między wieloma profilami Git jednym kliknięciem. Zarządzaj wieloma kontami GitHub, kluczami SSH, podpisami GPG i <b>automatycznie stosuj profil do submodułów Git</b>.
      <br><br>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher?label=version" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/attestations"><img src="https://img.shields.io/badge/SLSA-Level_3-green" alt="SLSA 3"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions#supply-chain-security"><img src="https://img.shields.io/badge/Sigstore-Cosign_Signed-blue?logo=sigstore" alt="Sigstore"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions#supply-chain-security"><img src="https://img.shields.io/badge/SBOM-CycloneDX-brightgreen" alt="SBOM"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml/badge.svg" alt="Security"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/%20-Win%20%7C%20Mac%20%7C%20Linux-blue?labelColor=555&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMSAySDNjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoN3YySDh2Mmg4di0yaC0ydi0yaDdjMS4xIDAgMi0uOSAyLTJWNGMwLTEuMS0uOS0yLTItMnptMCAxNEgzVjRoMTh2MTJ6Ii8+PC9zdmc+" alt="Platform"></a>
      <a href="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions"><img src="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions/graph/badge.svg" alt="codecov"></a>
      <a href="https://sonarcloud.io/summary/new_code?id=nullvariant_nullvariant-vscode-extensions"><img src="https://sonarcloud.io/api/project_badges/measure?project=nullvariant_nullvariant-vscode-extensions&metric=alert_status" alt="Quality Gate Status"></a>
      <a href="https://snyk.io/"><img src="https://img.shields.io/badge/Snyk-monitored-4C4A73?logo=snyk&logoColor=white" alt="Snyk monitored"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <b>🇵🇱</b> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/pl/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Dlaczego Git ID Switcher?

Chociaż istnieje wiele narzędzi do przełączania profili Git, **Git ID Switcher** rozwiązuje złożone problemy, które inne często pomijają:

1. **Koszmar submodułów**: Pracując z repozytoriami zawierającymi submoduły (motywy Hugo, biblioteki vendor itp.), zwykle trzeba ręcznie ustawiać `git config user.name` dla _każdego_ submodułu. To rozszerzenie elegancko rozwiązuje ten problem, rekurencyjnie stosując profil do wszystkich aktywnych submodułów.
2. **Obsługa SSH i GPG**: Nie tylko zmienia nazwę; również wymienia klucze SSH w agencie i konfiguruje podpis GPG, więc nigdy nie zrobisz commita z niewłaściwym podpisem.

## Funkcje

- **Interfejs zarządzania profilami**: Dodawaj, edytuj, usuwaj i zmieniaj kolejność profili bez edycji settings.json
- **Przełączanie profili jednym kliknięciem**: Natychmiastowa zmiana Git user.name i user.email
- **Integracja z paskiem stanu**: Zawsze widzisz bieżący profil
- **Sprawdzanie synchronizacji**: Wykrywanie niezgodności między profilem a git config w czasie rzeczywistym z ostrzeżeniem na pasku stanu
- **Obsługa submodułów**: Automatyczne propagowanie profilu do submodułów Git
- **Zarządzanie kluczami SSH**: Automatyczne przełączanie kluczy SSH w ssh-agent
- **Obsługa podpisów GPG**: Konfiguracja klucza GPG do podpisywania commitów (opcjonalne)
- **Szczegółowe podpowiedzi**: Pełne informacje z opisem i hostem SSH
- **Wieloplatformowość**: Działa na macOS, Linux i Windows
- **Wielojęzyczność**: Obsługuje 17 języków

## 🌏 Słowo o wsparciu wielojęzycznym

> **Cenię istnienie mniejszości.**
> Nie chcę ich odrzucać tylko dlatego, że jest ich niewiele.
> Nawet jeśli tłumaczenia nie są idealne, mam nadzieję, że poczujesz naszą intencję zrozumienia i okazania szacunku językom mniejszościowym.

To rozszerzenie obsługuje wszystkie 17 języków obsługiwanych przez VS Code. Dodatkowo, w przypadku dokumentacji README, podejmujemy wyzwanie tłumaczenia na języki mniejszościowe, a nawet żartobliwe.

To nie tylko „globalne wsparcie" — to „szacunek dla różnorodności językowej". I cieszę się, jeśli stanie się to infrastrukturą, w której commity ulepszające świat pochodzą od deweloperów z całego świata, przekraczając bariery językowe.

---

## Szybki start

Typowa konfiguracja do zarządzania kontem osobistym i służbowym (Enterprise Managed User).

### Krok 1: Przygotuj klucze SSH

Najpierw utwórz klucze SSH dla każdego konta (pomiń, jeśli już masz):

```bash
# Osobisty
ssh-keygen -t ed25519 -C "alex@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Służbowy
ssh-keygen -t ed25519 -C "alex.kowalski@techcorp.example.com" -f ~/.ssh/id_ed25519_work
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

Po instalacji dostępne są przykładowe profile.
Postępuj zgodnie z poniższym przewodnikiem, aby dostosować je do swoich potrzeb.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/pl/first-ux.webp" width="600" alt="Przewodnik pierwszej konfiguracji (13 kroków): otwórz zarządzanie profilami z paska stanu, edytuj i twórz nowe" loading="lazy">

> **Pliki kluczy nie są wysyłane**: Ustawienie ścieżki klucza SSH zapisuje tylko ścieżkę (lokalizację) pliku klucza. Zawartość pliku klucza nigdy nie jest przesyłana ani wysyłana na zewnątrz.

> **Jeśli używasz podpisu GPG**: Możesz również ustawić `gpgKeyId` w ekranie edycji profilu.
> Aby sprawdzić ID klucza GPG, zobacz „[Rozwiązywanie problemów](#podpis-gpg-nie-działa)".

> **Wskazówka**: Możesz również skonfigurować bezpośrednio w settings.json.
> Otwórz ustawienia rozszerzenia (`Cmd+,` / `Ctrl+,`) → wyszukaj „Git ID Switcher" → kliknij „Edytuj w settings.json".
> Przykłady konfiguracji JSON znajdziesz w „[Pełny przykład konfiguracji](#pełny-przykład-konfiguracji-5-kont-z-ssh--gpg)".

---

## Pełny przykład konfiguracji: 5 kont z SSH + GPG

Kompletny przykład łączący wszystko:

### Konfiguracja SSH (`~/.ssh/config`)

```ssh-config
# Konto osobiste (domyślne)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Konto służbowe (Enterprise Managed User wydany przez firmę)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Klient A – praca kontraktowa (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Klient B – projekt na miejscu (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# Wkład OSS (GitLab)
Host gitlab-oss
    HostName gitlab.com
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
      "name": "Alex Kowalski",
      "email": "alex@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Projekty osobiste",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Alex Kowalski",
      "email": "alex.kowalski@techcorp.example.com",
      "service": "GitHub Praca",
      "icon": "💼",
      "description": "TechCorp główna praca",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Alex Kowalski",
      "email": "alex@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA zlecenie",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "A.Kowalski",
      "email": "a.kowalski@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB na miejscu",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "alex-dev",
      "email": "alex.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "Wkład w OSS",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Uwaga: 4. profil (`client-b`) używa skróconej nazwy, a 5. (`oss`) — pseudonimu deweloperskiego. Możesz ustawić inną nazwę wyświetlaną dla każdego profilu, nawet dla tej samej osoby.

---

## Zarządzanie profilami

Kliknij pasek stanu → wybierz „Zarządzanie profilami" na dole listy, aby otworzyć panel zarządzania.
Dodawanie, edytowanie, usuwanie i zmiana kolejności profili — wszystko bezpośrednio z interfejsu.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/pl/identity-management.webp" width="600" alt="Zarządzanie profilami: przewodnik usuwania i zmiany kolejności" loading="lazy">

Możesz również usunąć profil z palety poleceń: `Git ID Switcher: Delete Identity`.

---

## Polecenia

| Polecenie                                | Opis                                |
| ---------------------------------------- | ----------------------------------- |
| `Git ID Switcher: Select Identity`       | Otwórz selektor profili             |
| `Git ID Switcher: Delete Identity`       | Usuń profil                         |
| `Git ID Switcher: Show Current Identity` | Pokaż informacje o bieżącym profilu |
| `Git ID Switcher: Show Documentation`    | Pokaż dokumentację                  |

---

## Odniesienie do konfiguracji

### Właściwości profilu

| Właściwość    | Wymagane | Opis                                                               |
| ------------- | -------- | ------------------------------------------------------------------ |
| `id`          | ✅       | Unikalny identyfikator (np.: `"personal"`, `"work"`)               |
| `name`        | ✅       | Git user.name — wyświetlane w commitach                            |
| `email`       | ✅       | Git user.email — wyświetlane w commitach                           |
| `icon`        |          | Emoji na pasku stanu (np.: `"🏠"`). Tylko jedno emoji              |
| `service`     |          | Nazwa serwisu (np.: `"GitHub"`, `"GitLab"`). Używane w interfejsie |
| `description` |          | Krótki opis w selektorze i podpowiedzi                             |
| `sshKeyPath`  |          | Ścieżka do prywatnego klucza SSH (np.: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |          | Alias hosta SSH (np.: `"github-work"`)                             |
| `gpgKeyId`    |          | ID klucza GPG do podpisywania commitów                             |

#### Ograniczenia wyświetlania

- **Pasek stanu**: Tekst dłuższy niż ~25 znaków zostanie obcięty z `...`
- **`icon`**: Dozwolone jest tylko jedno emoji (klaster grafemów). Wiele emoji lub długie ciągi nie są obsługiwane

### Ustawienia globalne

| Ustawienie                                 | Domyślnie       | Opis                                                                                             |
| ------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------ |
| `gitIdSwitcher.identities`                 | Zobacz przykład | Lista konfiguracji profili                                                                       |
| `gitIdSwitcher.defaultIdentity`            | Zobacz przykład | ID domyślnego profilu                                                                            |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`          | Automatyczne przełączanie klucza SSH przy zmianie profilu                                        |
| `gitIdSwitcher.showNotifications`          | `true`          | Pokazuj powiadomienie przy przełączaniu profilu                                                  |
| `gitIdSwitcher.applyToSubmodules`          | `true`          | Stosuj profil do submodułów Git                                                                  |
| `gitIdSwitcher.submoduleDepth`             | `1`             | Maks. głębokość dla zagnieżdżonych submodułów (1-5)                                              |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`         | Dołącz emoji do Git config `user.name`                                                           |
| `gitIdSwitcher.syncCheck.enabled`          | `true`          | Sprawdź, czy wybrany profil odpowiada faktycznemu git config                                     |
| `gitIdSwitcher.syncCheck.onFocusReturn`    | `true`          | Uruchom sprawdzanie synchronizacji po powrocie fokusu do okna edytora                            |
| `gitIdSwitcher.logging.fileEnabled`        | `false`         | Zapisuj dziennik audytu do pliku (zmiany profilu, operacje SSH itp.)                             |
| `gitIdSwitcher.logging.filePath`           | `""`            | Ścieżka pliku dziennika (np.: `~/.git-id-switcher/security.log`). Pusty = domyślna lokalizacja   |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`      | Maks. rozmiar pliku przed rotacją (bajty, 1MB-100MB)                                             |
| `gitIdSwitcher.logging.maxFiles`           | `5`             | Maks. liczba plików dziennika w rotacji (1-20)                                                   |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`         | Po włączeniu wszystkie wartości są maskowane w dziennikach (maksymalna prywatność)               |
| `gitIdSwitcher.logging.level`              | `"INFO"`        | Poziom logowania (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Zapisuje wybrany poziom i wyżej |
| `gitIdSwitcher.commandTimeouts`            | `{}`            | Niestandardowe limity czasu dla poleceń (ms, 1s-5min). Np.: `{"git": 15000, "ssh-add": 10000}`   |

#### O ustawieniu `includeIconInGitConfig`

Kontroluje zachowanie gdy pole `icon` jest ustawione:

| Wartość             | Zachowanie                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `false` (domyślnie) | `icon` jest wyświetlany tylko w interfejsie edytora. Tylko `name` jest zapisywane w Git config |
| `true`              | `icon + name` jest zapisywane w Git config. Emoji pojawi się w historii commitów               |

Przykład: `icon: "👤"`, `name: "Alex Kowalski"`

| includeIconInGitConfig | Git config `user.name` | Podpis commita             |
| ---------------------- | ---------------------- | -------------------------- |
| `false`                | `Alex Kowalski`        | `Alex Kowalski <email>`    |
| `true`                 | `👤 Alex Kowalski`     | `👤 Alex Kowalski <email>` |

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

- Profil jest zapisywany w `.git/config` każdego repozytorium
- Można utrzymywać różne profile dla każdego repozytorium
- Ustawienia globalne (`~/.gitconfig`) nie są modyfikowane

### Zachowanie przy przełączaniu profilu

Po przełączeniu profilu rozszerzenie wykonuje (w kolejności):

1. **Konfiguracja Git** (zawsze): Ustawia `git config --local user.name` i `user.email`
2. **Klucz SSH** (jeśli ustawiono `sshKeyPath`): Usuwa inne klucze z ssh-agent, dodaje wybrany
3. **Klucz GPG** (jeśli ustawiono `gpgKeyId`): Ustawia `git config --local user.signingkey` i włącza podpisywanie
4. **Submoduły** (jeśli włączone): Propaguje konfigurację do wszystkich submodułów (domyślnie: głębokość 1)
5. **Sprawdzanie synchronizacji**: Weryfikuje, czy zastosowany profil odpowiada faktycznemu git config

### Sprawdzanie synchronizacji

Porównuje wybrany profil z faktycznymi wartościami `git config --local` (`user.name`, `user.email`, `user.signingkey`) i wyświetla ostrzeżenie na pasku stanu po wykryciu niezgodności.

**Kiedy uruchamiane jest sprawdzanie:**

- Natychmiast po zastosowaniu profilu
- Przy zmianie folderu obszaru roboczego
- Przy zmianie konfiguracji
- Po powrocie fokusu do okna edytora (debounce 500ms)

**Po wykryciu niezgodności:**

- Pasek stanu wyświetla ikonę ⚠️ z kolorem tła ostrzeżenia
- Podpowiedź wyświetla tabelę z niezgodnymi polami (pole, oczekiwana wartość, faktyczna wartość)
- Kliknięcie paska stanu wyświetla opcje rozwiązania:
  - **Zastosuj profil ponownie** — Ponowne zastosowanie bieżącego profilu do git config
  - **Wybierz inny profil** — Otwórz selektor profili
  - **Ignoruj** — Ukryj ostrzeżenie do następnego sprawdzenia

**Wyłączenie:**

Ustaw `gitIdSwitcher.syncCheck.enabled` na `false`, aby wyłączyć wszystkie sprawdzania synchronizacji.
Aby wyłączyć tylko sprawdzanie przy powrocie fokusu, ustaw `gitIdSwitcher.syncCheck.onFocusReturn` na `false`.

### Mechanizm propagacji do submodułów

Ustawienia lokalne są specyficzne dla repozytorium, więc nie są automatycznie stosowane do submodułów.
Dlatego to rozszerzenie zapewnia funkcję propagacji do submodułów (szczegóły w sekcji „Zaawansowane: Obsługa submodułów").

### Szczegóły zarządzania kluczami SSH

Git ID Switcher zarządza kluczami SSH poprzez `ssh-agent`:

| Operacja     | Wykonywane polecenie   |
| ------------ | ---------------------- |
| Dodaj klucz  | `ssh-add <keyPath>`    |
| Usuń klucz   | `ssh-add -d <keyPath>` |
| Lista kluczy | `ssh-add -l`           |

**Ważne:** To rozszerzenie **nie modyfikuje** `~/.ssh/config`. Konfiguracja SSH musi być wykonana ręcznie (zobacz Krok 2 w „Szybki start").

### Interakcja z istniejącą konfiguracją SSH

Jeśli masz już konfigurację SSH, Git ID Switcher działa następująco:

| Twoja konfiguracja                     | Zachowanie Git ID Switcher                                   |
| -------------------------------------- | ------------------------------------------------------------ |
| `~/.ssh/config` z `IdentityFile`       | Oba są dostępne; `IdentitiesOnly yes` zapobiega konfliktom   |
| Zmienna środowiskowa `GIT_SSH_COMMAND` | Używa niestandardowego polecenia SSH; ssh-agent nadal działa |
| `git config core.sshCommand`           | Jak wyżej                                                    |
| direnv z zmiennymi SSH                 | Współistnieją; ssh-agent działa niezależnie                  |

**Zalecenie:** Zawsze ustawiaj `IdentitiesOnly yes` w konfiguracji SSH. Zapobiega to próbowaniu wielu kluczy przez SSH.

### Dlaczego `IdentitiesOnly yes`?

Bez tego ustawienia SSH może próbować kluczy w następującej kolejności:

1. Klucze załadowane do ssh-agent (zarządzane przez Git ID Switcher)
2. Klucze określone w `~/.ssh/config`
3. Domyślne klucze (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` itp.)

Może to prowadzić do błędów uwierzytelniania lub użycia niewłaściwego klucza.

Z `IdentitiesOnly yes` SSH używa **tylko określonego klucza**. Gwarantuje to użycie klucza ustawionego przez Git ID Switcher.

```ssh-config
# Zalecana konfiguracja
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← ta linia jest ważna
```

Z tą konfiguracją połączenia z hostem `github-work` używają tylko `~/.ssh/id_ed25519_work`, bez próbowania innych kluczy.

---

## Zaawansowane: Obsługa submodułów

Dla złożonych repozytoriów używających submodułów Git, zarządzanie profilami jest często uciążliwe. Jeśli robisz commit w submodule, Git używa lokalnej konfiguracji tego submodułu, która może domyślnie używać konfiguracji globalnej (zły email!), jeśli nie jest jawnie ustawiona.

**Git ID Switcher** automatycznie wykrywa submoduły i stosuje do nich wybrany profil.

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

Gwarantuje to, że twój profil jest zawsze poprawny, niezależnie od tego, czy robisz commit w głównym repozytorium, czy w bibliotece vendor.

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

### Niewłaściwy profil przy push?

**Przy nowym klonowaniu:**

Podczas klonowania repozytoriów służbowych użyj aliasu hosta skonfigurowanego w SSH config:

```bash
# Służbowy (używa aliasu github-work)
git clone git@github-work:company/repo.git

# Osobisty (używa domyślnego github.com)
git clone git@github.com:yourname/repo.git
```

**Dla istniejących repozytoriów:**

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

3. Upewnij się, że email w profilu odpowiada emailowi klucza GPG

### Profil nie wykryty?

- Upewnij się, że jesteś w repozytorium Git
- Sprawdź, czy `settings.json` nie ma błędów składni
- Przeładuj okno VS Code (`Cmd+Shift+P` → „Przeładuj okno")

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

Edytory takie jak VS Code buforują schematy ustawień w pamięci, a „Przeładuj okno" lub ponowna instalacja rozszerzenia może nie wystarczyć do ich odświeżenia.

### Domyślne wartości (identities itp.) są puste?

Jeśli przykładowe ustawienia nie pojawiają się nawet po czystej instalacji, przyczyną może być **Settings Sync**.

Jeśli wcześniej zapisałeś puste ustawienia, mogły zostać zsynchronizowane do chmury i nadpisują wartości domyślne przy nowych instalacjach.

**Rozwiązanie:**

1. Znajdź ustawienie w interfejsie ustawień
2. Kliknij ikonę koła zębatego → „Resetuj ustawienie"
3. Zsynchronizuj z Settings Sync (to usunie stare ustawienia z chmury)

---

## Filozofia projektowania

> **„Kim jestem" — jedyne pytanie, na które odpowiada to rozszerzenie**

Zbudowane w oparciu o **Architekturę Karesansui**: proste jądro (100 linii).
Dlatego reszta może być poświęcona jakości (90% pokrycia testami, logowanie, limity czasu)
i świadomym ograniczeniom (brak GitHub API, brak zarządzania tokenami).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Przeczytaj pełną filozofię projektowania](../../DESIGN_PHILOSOPHY.md)

---

## Współtworzenie

Wkład jest mile widziany! Zobacz [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licencja

Licencja MIT — zobacz [LICENSE](../../../LICENSE).

## Podziękowania

Stworzone przez [Null;Variant](https://github.com/nullvariant)
