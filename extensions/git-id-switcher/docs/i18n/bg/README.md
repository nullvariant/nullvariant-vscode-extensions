# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Превключвайте между множество Git профили с един клик. Управлявайте множество GitHub акаунти, SSH ключове, GPG подписване и <b>автоматично прилагайте профила към Git подмодули</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <b>🇧🇬</b> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/bg/demo.webp" width="600" alt="Демо" loading="lazy">

## 🎯 Защо Git ID Switcher?

Въпреки че има много инструменти за смяна на Git профили, **Git ID Switcher** решава сложни проблеми, които други често игнорират:

1. **Кошмарът на подмодулите**: При работа с хранилища съдържащи подмодули (Hugo теми, vendor библиотеки и т.н.), обикновено трябва ръчно да зададете `git config user.name` за _всеки_ подмодул. Това разширение решава проблема елегантно чрез рекурсивно прилагане на вашия профил към всички активни подмодули.
2. **Обработка на SSH и GPG**: Не само променя името ви; също сменя SSH ключовете в агента и конфигурира GPG подписването, така че никога няма да направите комит с грешен подпис.

## Функции

- **UI за управление на профили**: Добавяне, редактиране, изтриване и пренареждане на профили без редактиране на settings.json
- **Превключване на профил с един клик**: Мигновена промяна на Git user.name и user.email
- **Интеграция в лентата на състоянието**: Винаги виждате текущия си профил
- **Проверка за синхронизация**: Откриване на несъответствия между профила и git config в реално време с предупреждение в лентата на състоянието
- **Поддръжка на подмодули**: Автоматично разпространяване на профила към Git подмодули
- **Управление на SSH ключове**: Автоматично превключване на SSH ключове в ssh-agent
- **Поддръжка на GPG подписване**: Конфигуриране на GPG ключ за подписване на комити (опционално)
- **Подробни подсказки**: Пълна информация за профила с описание и SSH хост
- **Междуплатформен**: Работи на macOS, Linux и Windows
- **Многоезичен**: Поддържа 17 езика

## 🌏 Бележка за многоезичната поддръжка

> **Ценя съществуването на малцинствата.**
> Не искам да ги отхвърлям само защото са малко на брой.
> Дори ако преводите не са перфектни, надявам се да усетите намерението ни да разбираме и показваме уважение към малцинствените езици.

Това разширение поддържа всичките 17 езика, които VS Code поддържа. Освен това, за README документацията се предизвикваме да превеждаме на малцинствени езици и дори шеговити езици.

Това не е просто „глобална поддръжка" — това е „уважение към езиковото разнообразие". И ще се радвам, ако това стане инфраструктура, където комити подобряващи света идват от разработчици отвсякъде, преодолявайки езиковите бариери.

---

## Бърз старт

Типична настройка за управление на личен акаунт и корпоративен акаунт (Enterprise Managed User).

### Стъпка 1: Подгответе SSH ключове

Първо създайте SSH ключове за всеки акаунт (пропуснете ако вече имате):

```bash
# Личен
ssh-keygen -t ed25519 -C "sasha@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Служебен
ssh-keygen -t ed25519 -C "sasha.ivanov@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Регистрирайте **публичния ключ** (`.pub` файл) на всеки ключ в съответния GitHub акаунт.

> **Забележка**: В GitHub се регистрира `id_ed25519_personal.pub` (публичен ключ). `id_ed25519_personal` (без разширение) е частният ключ — никога не го споделяйте и не го качвайте никъде.

### Стъпка 2: Конфигурирайте SSH

Редактирайте `~/.ssh/config`:

```ssh-config
# Личен GitHub акаунт (по подразбиране)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Служебен GitHub акаунт
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Стъпка 3: Конфигурирайте разширението

При инсталиране са включени примерни профили.
Следвайте ръководството по-долу, за да ги редактирате за вашите нужди.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/bg/first-ux.webp" width="600" alt="Стъпки за първоначална настройка (13 стъпки): Отворете управлението на профили от лентата на състоянието, редактирайте и създавайте профили" loading="lazy">

> **Вашите ключове не се изпращат**: При настройка на пътя до SSH ключа се записва само пътят (местоположението) на файла с ключа. Съдържанието на ключа никога не се качва или изпраща навън.

> **При използване на GPG подписване**: Можете да зададете `gpgKeyId` в екрана за редактиране на профила.
> За да намерите ID на вашия GPG ключ, вижте „[Отстраняване на проблеми](#gpg-подписването-не-работи)".

> **Съвет**: Можете също да конфигурирате директно от settings.json.
> Отворете настройките на разширението (`Cmd+,` / `Ctrl+,`) → потърсете „Git ID Switcher" → кликнете „Редактиране в settings.json".
> За примери на JSON формат вижте „[Пълен пример](#пълен-пример-5-акаунта-с-ssh--gpg)".

---

## Пълен пример: 5 акаунта с SSH + GPG

Ето пълен пример комбиниращ всичко:

### SSH конфигурация (`~/.ssh/config`)

```ssh-config
# Личен акаунт (по подразбиране)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Служебен акаунт (Enterprise Managed User от компанията)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Клиент A – договорна работа (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Клиент B – проект на място (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS приноси (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Настройки на разширението

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Саша Иванов",
      "email": "sasha@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Лични проекти",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Саша Иванов",
      "email": "sasha.ivanov@techcorp.example.com",
      "service": "GitHub Работа",
      "icon": "💼",
      "description": "TechCorp основна работа",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Саша Иванов",
      "email": "sasha@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA договор",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "С.Иванов",
      "email": "s.ivanov@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB на място",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "sasha-dev",
      "email": "sasha.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "OSS принос",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Забележка: 4-ият профил (`client-b`) използва съкратено име, а 5-ият (`oss`) — псевдоним на разработчик. Можете да зададете различно показвано име за всеки профил, дори за едно и също лице.

---

## Управление на профили

Кликнете върху лентата на състоянието → „Управление на профили" в долната част на списъка, за да отворите екрана за управление.
Добавяне, редактиране, изтриване и пренареждане на профили се извършва директно от UI.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/bg/identity-management.webp" width="600" alt="Управление на профили: Ръководство за изтриване и пренареждане" loading="lazy">

Можете също да изтриете профили от Command Palette с `Git ID Switcher: Delete Identity`.

---

## Команди

| Команда                                  | Описание                                  |
| ---------------------------------------- | ----------------------------------------- |
| `Git ID Switcher: Select Identity`       | Отваряне на селектора на профили          |
| `Git ID Switcher: Delete Identity`       | Изтриване на профил                       |
| `Git ID Switcher: Show Current Identity` | Показване на информация за текущия профил |
| `Git ID Switcher: Show Documentation`    | Показване на документация                 |

---

## Справочник за конфигурацията

### Свойства на профила

| Свойство      | Задължително | Описание                                                   |
| ------------- | ------------ | ---------------------------------------------------------- |
| `id`          | ✅           | Уникален идентификатор (напр.: `"personal"`, `"work"`)     |
| `name`        | ✅           | Git user.name — показва се в комитите                      |
| `email`       | ✅           | Git user.email — показва се в комитите                     |
| `icon`        |              | Емоджи в лентата на състоянието (напр.: `"🏠"`). Само едно |
| `service`     |              | Име на услугата (напр.: `"GitHub"`, `"GitLab"`). За UI     |
| `description` |              | Кратко описание в селектора и подсказката                  |
| `sshKeyPath`  |              | Път до частен SSH ключ (напр.: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |              | SSH config хост псевдоним (напр.: `"github-work"`)         |
| `gpgKeyId`    |              | ID на GPG ключ за подписване на комити                     |

#### Ограничения при показване

- **Лента на състоянието**: Текст над ~25 символа се съкращава с `...`
- **`icon`**: Може да се използва само едно емоджи (графемен клъстер). Множество емоджита или дълъг текст не са позволени

### Глобални настройки

| Настройка                                  | По подразбиране | Описание                                                                                                    |
| ------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Вижте примера   | Списък с конфигурации на профили                                                                            |
| `gitIdSwitcher.defaultIdentity`            | Вижте примера   | ID на профила по подразбиране                                                                               |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`          | Автоматично превключване на SSH ключ при смяна на профил                                                    |
| `gitIdSwitcher.showNotifications`          | `true`          | Показване на известие при превключване на профил                                                            |
| `gitIdSwitcher.applyToSubmodules`          | `true`          | Прилагане на профила към Git подмодули                                                                      |
| `gitIdSwitcher.submoduleDepth`             | `1`             | Максимална дълбочина за конфигуриране на вложени подмодули (1-5)                                            |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`         | Записване на емоджи иконата в Git config `user.name`                                                        |
| `gitIdSwitcher.syncCheck.enabled`          | `true`          | Проверка дали избраният профил съответства на действителния git config                                      |
| `gitIdSwitcher.syncCheck.onFocusReturn`    | `true`          | Изпълнение на проверка за синхронизация при връщане на фокуса към прозореца на редактора                    |
| `gitIdSwitcher.logging.fileEnabled`        | `false`         | Записване на одитен журнал във файл (превключвания на профили, SSH операции и др.)                          |
| `gitIdSwitcher.logging.filePath`           | `""`            | Път до файла на журнала (напр.: `~/.git-id-switcher/security.log`). Празно = местоположение по подразбиране |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`      | Максимален размер на файла преди ротация (байтове, 1MB-100MB)                                               |
| `gitIdSwitcher.logging.maxFiles`           | `5`             | Максимален брой ротирани файлове (1-20)                                                                     |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`         | Когато е активирано, всички стойности се маскират в журналите (максимална поверителност)                    |
| `gitIdSwitcher.logging.level`              | `"INFO"`        | Ниво на детайлност на журнала (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Записва избраното и по-високи |
| `gitIdSwitcher.commandTimeouts`            | `{}`            | Персонализирани таймаути за команди (ms, 1сек-5мин). Напр.: `{"git": 15000, "ssh-add": 10000}`              |

#### За `includeIconInGitConfig`

Контролира поведението при задаване на полето `icon`:

| Стойност                  | Поведение                                                                      |
| ------------------------- | ------------------------------------------------------------------------------ |
| `false` (по подразбиране) | `icon` се показва само в UI на редактора. В Git config се записва само `name`  |
| `true`                    | В Git config се записва `icon + name`. Емоджито остава в историята на комитите |

Пример: `icon: "👤"`, `name: "Саша Иванов"`

| includeIconInGitConfig | Git config `user.name` | Подпис на комит          |
| ---------------------- | ---------------------- | ------------------------ |
| `false`                | `Саша Иванов`          | `Саша Иванов <email>`    |
| `true`                 | `👤 Саша Иванов`       | `👤 Саша Иванов <email>` |

---

## Как работи

### Структура на Git config слоеве

Git конфигурацията има три слоя, където долните слоеве се презаписват от горните:

```text
Системна (/etc/gitconfig)
    ↓ презаписва
Глобална (~/.gitconfig)
    ↓ презаписва
Локална (.git/config)  ← най-висок приоритет
```

**Git ID Switcher записва на ниво `--local` (локално за хранилището).**

Това означава:

- Запазва профила в `.git/config` на всяко хранилище
- Може да поддържа различни профили за всяко хранилище
- Глобалните настройки (`~/.gitconfig`) не се променят

### Поведение при превключване на профил

При превключване на профил, разширението изпълнява (в ред):

1. **Git конфигурация** (винаги): Задава `git config --local user.name` и `user.email`
2. **SSH ключ** (ако е зададен `sshKeyPath`): Премахва други ключове от ssh-agent, добавя избрания
3. **GPG ключ** (ако е зададен `gpgKeyId`): Задава `git config --local user.signingkey` и включва подписването
4. **Подмодули** (ако е включено): Разпространява настройките към всички подмодули (по подразбиране: дълбочина 1)
5. **Проверка за синхронизация**: Проверява дали приложеният профил съответства на действителния git config

### Проверка за синхронизация

Сравнява избрания профил с действителните стойности на `git config --local` (`user.name`, `user.email`, `user.signingkey`) и показва предупреждение в лентата на състоянието при установяване на несъответствие.

**Кога се извършват проверки:**

- Непосредствено след прилагане на профила
- При промяна на папката на работното пространство
- При промяна на конфигурацията
- При връщане на фокуса към прозореца на редактора (debounce 500ms)

**При установяване на несъответствие:**

- Лентата на състоянието показва иконка ⚠️ с предупредителен фонов цвят
- Подсказката показва таблица с несъответстващите полета (поле, очаквана стойност, действителна стойност)
- Кликването върху лентата на състоянието показва опции за разрешаване:
  - **Повторно прилагане на профила** — Повторно прилагане на текущия профил към git config
  - **Избор на друг профил** — Отваряне на селектора на профили
  - **Игнориране** — Скриване на предупреждението до следващата проверка

**Деактивиране:**

Задайте `gitIdSwitcher.syncCheck.enabled` на `false`, за да деактивирате всички проверки за синхронизация.
За деактивиране само на проверката при връщане на фокус, задайте `gitIdSwitcher.syncCheck.onFocusReturn` на `false`.

### Механизъм на разпространение към подмодули

Локалната конфигурация действа на ниво хранилище, така че автоматично не се прилага към подмодулите.
Затова това разширение предоставя функция за разпространение към подмодули (за детайли вижте „Разширено: Поддръжка на подмодули").

### Детайли за управление на SSH ключове

Git ID Switcher управлява SSH ключове чрез `ssh-agent`:

| Операция           | Изпълнена команда      |
| ------------------ | ---------------------- |
| Добавяне на ключ   | `ssh-add <keyPath>`    |
| Премахване на ключ | `ssh-add -d <keyPath>` |
| Списък на ключове  | `ssh-add -l`           |

**Важно:** Това разширение **не променя** `~/.ssh/config`. SSH конфигурацията трябва да се настрои ръчно (вижте Стъпка 2 от „Бърз старт").

### Взаимодействие със съществуващи SSH настройки

Ако вече имате SSH настройки, Git ID Switcher работи по следния начин:

| Вашата настройка                 | Поведение на Git ID Switcher                                                |
| -------------------------------- | --------------------------------------------------------------------------- |
| `~/.ssh/config` с `IdentityFile` | Двете работят; използвайте `IdentitiesOnly yes` за избягване на конфликти   |
| Променлива `GIT_SSH_COMMAND`     | Използва вашата персонализирана SSH команда; ssh-agent продължава да работи |
| `git config core.sshCommand`     | Същото като по-горе                                                         |
| direnv задава SSH променливи     | Съществува съвместно; ssh-agent работи независимо                           |

**Препоръка:** Винаги задавайте `IdentitiesOnly yes` в SSH config. Това предотвратява SSH да опитва множество ключове.

### Защо `IdentitiesOnly yes`?

Без тази настройка SSH може да опита ключовете в следния ред:

1. Ключове заредени в ssh-agent (управлявани от Git ID Switcher)
2. Ключове указани в `~/.ssh/config`
3. Ключове по подразбиране (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` и др.)

Това може да доведе до неуспешна автентикация или използване на неочакван ключ.

Настройката `IdentitiesOnly yes` кара SSH да използва **само указания ключ**. Това гарантира, че ключът зададен от Git ID Switcher се използва надеждно.

```ssh-config
# Препоръчителна настройка
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Тази линия е важна
```

С тази настройка при свързване към хоста `github-work` ще се използва само `~/.ssh/id_ed25519_work` и няма да се опитват други ключове.

---

## Разширено: Поддръжка на подмодули

За сложни хранилища използващи Git подмодули, управлението на профили често е проблематично. Ако правите комит в подмодул, Git използва локалната конфигурация на този подмодул, която може да използва глобалната конфигурация (грешен имейл!) ако не е изрично зададена.

**Git ID Switcher** автоматично открива подмодулите и прилага избрания профил към тях.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Включване/изключване на тази функция
- `submoduleDepth`: Колко надълбоко да се отиде?
  - `1`: Само директни подмодули (най-често срещано)
  - `2+`: Вложени подмодули (подмодули в подмодули)

Това гарантира, че вашият профил е винаги правилен, независимо дали правите комит в главното хранилище или във vendor библиотека.

---

## Отстраняване на проблеми

### SSH ключът не се превключва?

1. Уверете се, че `ssh-agent` работи:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Проверете дали пътят до ключа е правилен:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. На macOS добавете към Keychain веднъж:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Грешен профил при push?

**При ново клониране:**

Когато клонирате служебно хранилище, използвайте хост псевдонима конфигуриран в SSH config:

```bash
# Служебен (използва псевдонима github-work)
git clone git@github-work:company/repo.git

# Личен (използва github.com по подразбиране)
git clone git@github.com:yourname/repo.git
```

**За съществуващи хранилища:**

1. Проверете дали отдалеченият URL използва правилния хост псевдоним:

   ```bash
   git remote -v
   # Трябва да показва git@github-work:... за служебни хранилища
   ```

2. Актуализирайте ако е необходимо:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG подписването не работи?

1. Намерете ID на вашия GPG ключ:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Тествайте подписването:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Уверете се, че имейлът в профила съвпада с имейла на GPG ключа.

### Профилът не се открива?

- Уверете се, че сте в Git хранилище
- Проверете дали `settings.json` няма синтактични грешки
- Презаредете прозореца на VS Code (`Cmd+Shift+P` → „Презареждане на прозореца")

### Грешка в полето `name`?

Полето `name` предизвиква грешка, ако съдържа тези символи:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Ако искате да добавите име на услуга, използвайте полето `service`.

```jsonc
// Грешно
"name": "Саша Иванов (личен)"

// Правилно
"name": "Саша Иванов",
"service": "GitHub"
```

### Нови настройки не се показват?

След актуализация на разширението, новите настройки може да не се показват на екрана с настройки.

**Решение:** Рестартирайте компютъра изцяло.

VS Code и други редактори пазят схемата на настройките в паметта и тя не винаги се обновява след „Презареждане на прозореца" или преинсталиране на разширението.

### Стойностите по подразбиране (identities и др.) са празни?

Ако примерните настройки не се показват дори при нова инсталация, причината може да е **Settings Sync**.

Ако преди сте записали празни настройки, те са синхронизирани в облака и презаписват стойностите по подразбиране при нова инсталация.

**Решение:**

1. Намерете настройката на екрана с настройки
2. Кликнете върху иконата зъбно колело → „Нулиране на настройката"
3. Синхронизирайте със Settings Sync (старата настройка ще бъде изтрита от облака)

---

## Философия на дизайна

> **„Кой съм аз?" — Единственият въпрос, на който това разширение отговаря**

Изградено върху **Архитектура Karesansui**. Ядрото може да се напише в 100 реда.
Затова можем да посветим останалото на качество (90% покритие на тестове, журнал, таймаути)
и съзнателни ограничения (без GitHub API интеграция, без управление на токени).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Прочетете пълната философия на дизайна](../../DESIGN_PHILOSOPHY.md)

---

## Принос

Приносите са добре дошли! Вижте [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Лиценз

MIT лиценз — вижте [LICENSE](../../../LICENSE).

## Благодарности

Създадено от [Null;Variant](https://github.com/nullvariant)
