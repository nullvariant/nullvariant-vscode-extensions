# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Переключайтесь между несколькими Git-профилями одним кликом. Управляйте несколькими аккаунтами GitHub, SSH-ключами и GPG-подписью, а также <b>автоматически применяйте профиль к Git-подмодулям</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
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
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <b>🇷🇺</b> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ru/demo.webp" width="600" alt="Демо" loading="lazy">

## 🎯 Почему Git ID Switcher?

Хотя существует много инструментов для переключения Git-профилей, **Git ID Switcher** решает сложные проблемы, которые другие часто упускают:

1. **Проблема подмодулей**: При работе с репозиториями, содержащими подмодули (темы Hugo, vendor-библиотеки и т.д.), обычно приходится вручную настраивать `git config user.name` для _каждого_ подмодуля. Это расширение элегантно решает проблему, рекурсивно применяя ваш профиль ко всем активным подмодулям.
2. **Обработка SSH и GPG**: Расширение не просто меняет ваше имя — оно также переключает SSH-ключи в ssh-agent и настраивает GPG-подпись, чтобы вы никогда не сделали коммит с неправильной подписью.

## Возможности

- **UI для управления профилями**: Добавляйте, редактируйте, удаляйте и сортируйте профили без редактирования settings.json
- **Переключение профиля одним кликом**: Мгновенная смена Git user.name и user.email
- **Интеграция в статусную строку**: Всегда видите текущий профиль
- **Поддержка подмодулей**: Автоматическое применение профиля к Git-подмодулям
- **Управление SSH-ключами**: Автоматическое переключение SSH-ключей в ssh-agent
- **Поддержка GPG-подписи**: Настройка GPG-ключа для подписи коммитов (опционально)
- **Подробные подсказки**: Полная информация с описанием и SSH-хостом
- **Кроссплатформенность**: Работает на macOS, Linux и Windows
- **Многоязычность**: Поддержка 17 языков

## 🌏 О многоязычной поддержке

> **Я ценю существование меньшинств.**
> Я не хочу отбрасывать их только потому, что их мало.
> Даже если переводы не идеальны, я надеюсь, что вы почувствуете наше намерение понять и уважать языки меньшинств.

Это расширение поддерживает все 17 языков, которые поддерживает VS Code. Кроме того, для документации README мы пробуем переводить на языки меньшинств и даже шуточные языки.

Это не просто «глобальная поддержка» — это «уважение к языковому разнообразию». И я буду рад, если это станет инфраструктурой, где коммиты, делающие мир лучше, приходят от разработчиков со всего мира, преодолевая языковые барьеры.

---

## Быстрый старт

Типичная настройка для управления личным аккаунтом и рабочим аккаунтом (Enterprise Managed User).

### Шаг 1: Подготовка SSH-ключей

Сначала создайте SSH-ключи для каждого аккаунта (пропустите, если уже есть):

```bash
# Личный
ssh-keygen -t ed25519 -C "sasha@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Рабочий
ssh-keygen -t ed25519 -C "sasha.petrov@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Зарегистрируйте **публичный ключ** (файл `.pub`) каждого ключа в соответствующем аккаунте GitHub.

> **Примечание**: На GitHub регистрируется `id_ed25519_personal.pub` (публичный ключ). `id_ed25519_personal` (без расширения) — это приватный ключ. Никогда не делитесь им и не загружайте его никуда.

### Шаг 2: Настройка SSH config

Отредактируйте `~/.ssh/config`:

```ssh-config
# Личный аккаунт GitHub (по умолчанию)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Рабочий аккаунт GitHub
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Шаг 3: Настройка расширения

Сразу после установки доступны примеры профилей.
Следуйте этому руководству, чтобы отредактировать их под себя.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ru/first-ux.webp" width="600" alt="Начальная настройка (13 шагов): открытие управления профилями из статусной строки, редактирование и создание" loading="lazy">

> **Файлы ключей не отправляются**: При настройке пути SSH-ключа сохраняется только путь (расположение) к файлу ключа. Содержимое файла ключа никогда не загружается и не отправляется куда-либо.

> **При использовании GPG-подписи**: Вы также можете настроить `gpgKeyId` на экране редактирования профиля.
> Как узнать ID GPG-ключа — см. раздел «[Устранение неполадок](#gpg-подпись-не-работает)».

> **Совет**: Вы также можете настроить напрямую в settings.json.
> Откройте настройки расширения (`Cmd+,` / `Ctrl+,`) → найдите «Git ID Switcher» → нажмите «Редактировать в settings.json».
> Примеры JSON-формата см. в разделе «[Полный пример: 5 аккаунтов с SSH + GPG](#полный-пример-5-аккаунтов-с-ssh--gpg)».

---

## Полный пример: 5 аккаунтов с SSH + GPG

Полный пример, объединяющий всё:

### Конфигурация SSH (`~/.ssh/config`)

```ssh-config
# Личный аккаунт (по умолчанию)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Рабочий аккаунт (Enterprise Managed User от компании)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Клиент A – контрактная работа (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Клиент B – проект на площадке (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS-вклад (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Настройки расширения

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Саша Петров",
      "email": "sasha@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Личные проекты",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Саша Петров",
      "email": "sasha.petrov@techcorp.example.com",
      "service": "GitHub Работа",
      "icon": "💼",
      "description": "TechCorp основная работа",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Саша Петров",
      "email": "sasha@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA контракт",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "С.Петров",
      "email": "s.petrov@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB на месте",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "sasha-dev",
      "email": "sasha.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "Вклад в OSS",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Примечание: 4-й профиль (`client-b`) использует сокращённое имя, а 5-й (`oss`) — ник разработчика. Для каждого профиля можно задать разное отображаемое имя, даже для одного человека.

---

## Управление профилями

Нажмите на статусную строку → «Управление профилями» внизу списка, чтобы открыть экран управления.
Добавление, редактирование, удаление и сортировка профилей выполняются прямо через UI.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ru/identity-management.webp" width="600" alt="Управление профилями: удаление и сортировка" loading="lazy">

Вы также можете удалить профиль через палитру команд: `Git ID Switcher: Delete Identity`.

---

## Команды

| Команда                                  | Описание                              |
| ---------------------------------------- | ------------------------------------- |
| `Git ID Switcher: Select Identity`       | Открыть выбор профиля                 |
| `Git ID Switcher: Delete Identity`       | Удалить профиль                       |
| `Git ID Switcher: Show Current Identity` | Показать информацию о текущем профиле |
| `Git ID Switcher: Show Documentation`    | Показать документацию                 |

---

## Справочник по настройкам

### Свойства профиля

| Свойство      | Обязательно | Описание                                                            |
| ------------- | ----------- | ------------------------------------------------------------------- |
| `id`          | ✅          | Уникальный идентификатор (напр.: `"personal"`, `"work"`)            |
| `name`        | ✅          | Git user.name — отображается в коммитах                             |
| `email`       | ✅          | Git user.email — отображается в коммитах                            |
| `icon`        |             | Эмодзи в статусной строке (напр.: `"🏠"`). Только один эмодзи       |
| `service`     |             | Название сервиса (напр.: `"GitHub"`, `"GitLab"`). Используется в UI |
| `description` |             | Краткое описание в селекторе и подсказке                            |
| `sshKeyPath`  |             | Путь к приватному SSH-ключу (напр.: `"~/.ssh/id_ed25519_work"`)     |
| `sshHost`     |             | Алиас хоста в SSH config (напр.: `"github-work"`)                   |
| `gpgKeyId`    |             | ID GPG-ключа для подписи коммитов                                   |

#### Ограничения отображения

- **Статусная строка**: Текст длиннее ~25 символов обрезается с `...`
- **`icon`**: Разрешён только один эмодзи (кластер графем). Несколько эмодзи или длинные строки не поддерживаются

### Глобальные настройки

| Настройка                                  | По умолчанию | Описание                                                                                                          |
| ------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | См. примеры  | Список конфигураций профилей                                                                                      |
| `gitIdSwitcher.defaultIdentity`            | См. примеры  | ID профиля по умолчанию                                                                                           |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`       | Автоматически переключать SSH-ключ при смене профиля                                                              |
| `gitIdSwitcher.showNotifications`          | `true`       | Показывать уведомление при переключении профиля                                                                   |
| `gitIdSwitcher.applyToSubmodules`          | `true`       | Применять профиль к Git-подмодулям                                                                                |
| `gitIdSwitcher.submoduleDepth`             | `1`          | Максимальная глубина для вложенных подмодулей (1-5)                                                               |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`      | Включать эмодзи в Git config `user.name`                                                                          |
| `gitIdSwitcher.logging.fileEnabled`        | `false`      | Сохранять журнал аудита в файл (переключения профилей, операции SSH и т.д.)                                       |
| `gitIdSwitcher.logging.filePath`           | `""`         | Путь к файлу журнала (напр.: `~/.git-id-switcher/security.log`). Пустая строка — путь по умолчанию                |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`   | Максимальный размер файла до ротации (байты, 1MB-100MB)                                                           |
| `gitIdSwitcher.logging.maxFiles`           | `5`          | Максимальное количество файлов ротации (1-20)                                                                     |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`      | При включении все значения маскируются в журналах (режим максимальной конфиденциальности)                         |
| `gitIdSwitcher.logging.level`              | `"INFO"`     | Уровень детализации журнала (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Записывается выбранный уровень и выше |
| `gitIdSwitcher.commandTimeouts`            | `{}`         | Пользовательские таймауты для команд (мс, 1сек-5мин). Напр.: `{"git": 15000, "ssh-add": 10000}`                   |

#### О настройке `includeIconInGitConfig`

Управляет поведением при установленном поле `icon`:

| Значение               | Поведение                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `false` (по умолчанию) | `icon` отображается только в UI редактора. В Git config записывается только `name` |
| `true`                 | В Git config записывается `icon + name`. Эмодзи остаётся в истории коммитов        |

Пример: `icon: "👤"`, `name: "Саша Петров"`

| includeIconInGitConfig | Git config `user.name` | Подпись коммита          |
| ---------------------- | ---------------------- | ------------------------ |
| `false`                | `Саша Петров`          | `Саша Петров <email>`    |
| `true`                 | `👤 Саша Петров`       | `👤 Саша Петров <email>` |

---

## Как это работает

### Структура уровней Git config

Конфигурация Git имеет три уровня, где нижние уровни переопределяют верхние:

```text
Системный (/etc/gitconfig)
    ↓ переопределяет
Глобальный (~/.gitconfig)
    ↓ переопределяет
Локальный (.git/config)  ← высший приоритет
```

**Git ID Switcher записывает в `--local` (локально для репозитория).**

Это означает:

- Профиль сохраняется в `.git/config` каждого репозитория
- Можно поддерживать разные профили для разных репозиториев
- Глобальные настройки (`~/.gitconfig`) не изменяются

### При переключении профиля

При переключении профиля расширение выполняет (по порядку):

1. **Git-конфигурация** (всегда): Устанавливает `git config --local user.name` и `user.email`
2. **SSH-ключ** (если задан `sshKeyPath`): Удаляет другие ключи из ssh-agent, добавляет выбранный
3. **GPG-ключ** (если задан `gpgKeyId`): Устанавливает `git config --local user.signingkey` и включает подпись
4. **Подмодули** (если включено): Применяет конфигурацию ко всем подмодулям (по умолчанию: глубина 1)

### Как работает распространение на подмодули

Локальные настройки применяются к каждому репозиторию отдельно, поэтому они не применяются автоматически к подмодулям.
Поэтому это расширение предоставляет функцию распространения на подмодули (подробности см. в разделе «Продвинутое: Поддержка подмодулей»).

### Детали управления SSH-ключами

Git ID Switcher управляет SSH-ключами через `ssh-agent`:

| Операция      | Выполняемая команда    |
| ------------- | ---------------------- |
| Добавить ключ | `ssh-add <keyPath>`    |
| Удалить ключ  | `ssh-add -d <keyPath>` |
| Список ключей | `ssh-add -l`           |

**Важно:** Это расширение **не изменяет** `~/.ssh/config`. Настройку SSH config нужно выполнить вручную (см. Шаг 2 в «Быстром старте»).

### Взаимодействие с существующей SSH-конфигурацией

Если у вас уже есть SSH-настройки, Git ID Switcher работает следующим образом:

| Ваша настройка                           | Поведение Git ID Switcher                                    |
| ---------------------------------------- | ------------------------------------------------------------ |
| `IdentityFile` указан в `~/.ssh/config`  | Оба работают; `IdentitiesOnly yes` предотвращает конфликты   |
| Установлена переменная `GIT_SSH_COMMAND` | Используется ваша SSH-команда; ssh-agent продолжает работать |
| Установлен `git config core.sshCommand`  | То же, что выше                                              |
| SSH-переменные через direnv              | Совместимы; ssh-agent работает независимо                    |

**Рекомендация:** Всегда устанавливайте `IdentitiesOnly yes` в SSH config. Это предотвращает попытки SSH использовать несколько ключей.

### Почему `IdentitiesOnly yes`?

Без этой настройки SSH может пробовать ключи в следующем порядке:

1. Ключи, загруженные в ssh-agent (управляются Git ID Switcher)
2. Ключи, указанные в `~/.ssh/config`
3. Ключи по умолчанию (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` и т.д.)

Это может привести к ошибкам аутентификации или использованию неправильного ключа.

При установке `IdentitiesOnly yes` SSH использует **только указанный ключ**. Это гарантирует использование ключа, настроенного в Git ID Switcher.

```ssh-config
# Рекомендуемая настройка
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← эта строка важна
```

С этой настройкой при подключении к хосту `github-work` используется только `~/.ssh/id_ed25519_work`, другие ключи не пробуются.

---

## Продвинутое: Поддержка подмодулей

Для сложных репозиториев с Git-подмодулями управление профилями часто вызывает проблемы. При коммите в подмодуле Git использует локальную конфигурацию этого подмодуля, которая может использовать глобальную конфигурацию (неправильный email!), если не настроена явно.

**Git ID Switcher** автоматически обнаруживает подмодули и применяет к ним выбранный профиль.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Включить/отключить эту функцию
- `submoduleDepth`: Насколько глубоко применять?
  - `1`: Только прямые подмодули (самый частый случай)
  - `2+`: Вложенные подмодули (подмодули внутри подмодулей)

Это гарантирует, что ваш профиль всегда правильный, независимо от того, делаете ли вы коммит в основном репозитории или в vendor-библиотеке.

---

## Устранение неполадок

### SSH-ключ не переключается?

1. Убедитесь, что `ssh-agent` запущен:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Проверьте правильность пути к ключу:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. На macOS добавьте в Keychain один раз:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Неправильный профиль при push?

**При новом клонировании:**

При клонировании рабочего репозитория используйте алиас хоста, настроенный в SSH config:

```bash
# Рабочий (используем алиас github-work)
git clone git@github-work:company/repo.git

# Личный (используем github.com по умолчанию)
git clone git@github.com:yourname/repo.git
```

**Для существующего репозитория:**

1. Проверьте, что remote URL использует правильный алиас хоста:

   ```bash
   git remote -v
   # Для рабочего репозитория должно быть git@github-work:...
   ```

2. Обновите при необходимости:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG-подпись не работает?

1. Найдите ID вашего GPG-ключа:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Протестируйте подпись:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Убедитесь, что email профиля совпадает с email GPG-ключа

### Профиль не определяется?

- Убедитесь, что находитесь в Git-репозитории
- Проверьте `settings.json` на синтаксические ошибки
- Перезагрузите окно VS Code (`Cmd+Shift+P` → «Перезагрузить окно»)

### Ошибка в поле `name`?

Следующие символы в поле `name` вызывают ошибку:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Если хотите добавить информацию о сервисе, используйте поле `service`.

```jsonc
// NG
"name": "Саша Петров (Личный)"

// OK
"name": "Саша Петров",
"service": "GitHub"
```

### Новые настройки не отображаются?

После обновления расширения новые настройки могут не отображаться в интерфейсе.

**Решение:** Полностью перезагрузите компьютер.

Редакторы на базе VS Code кэшируют схему настроек в памяти, и «Перезагрузить окно» или переустановка расширения может быть недостаточно.

### Значения по умолчанию (identities и т.д.) пустые?

Если примеры не появляются даже после новой установки, причиной может быть **Settings Sync**.

Если вы ранее сохранили пустые настройки, они могли синхронизироваться в облако и перезаписать значения по умолчанию при новых установках.

**Решение:**

1. Найдите настройку в интерфейсе настроек
2. Нажмите на шестерёнку → «Сбросить настройку»
3. Синхронизируйте с Settings Sync (старые настройки удалятся из облака)

---

## Философия дизайна

> **«Кто я»** — единственный вопрос, на который отвечает это расширение

Построено на **Архитектуре Карэсансуй**: ядро в 100 строк.
Именно поэтому остальное можно посвятить качеству (90% покрытие тестами, логирование, таймауты)
и намеренным ограничениям (без GitHub API, без управления токенами).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Читать полную философию дизайна](../../DESIGN_PHILOSOPHY.md)

---

## Участие в разработке

Вклад приветствуется! См. [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Лицензия

MIT — см. [LICENSE](../../../LICENSE).

## Благодарности

Создано [Null;Variant](https://github.com/nullvariant)
