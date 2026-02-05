# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      한 번의 클릭으로 여러 Git ID를 전환합니다. 여러 GitHub 계정, SSH 키, GPG 서명을 관리하고, <b>Git 서브모듈에 자동으로 ID를 적용</b>합니다.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <b>🇰🇷</b> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-ko.png" width="600" alt="데모">

## 🎯 왜 Git ID Switcher인가요?

많은 Git ID 전환 도구가 있지만, **Git ID Switcher**는 다른 도구들이 종종 무시하는 복잡한 문제를 해결합니다:

1. **서브모듈의 악몽**: 서브모듈이 있는 저장소(예: Hugo 테마, vendor 라이브러리)에서 작업할 때, 일반적으로 _각_ 서브모듈마다 `git config user.name`을 수동으로 설정해야 합니다. 이 확장 프로그램은 모든 활성 서브모듈에 재귀적으로 ID를 적용하여 이 문제를 우아하게 해결합니다.
2. **SSH 및 GPG 처리**: 단순히 이름을 변경하는 것이 아닙니다. ssh-agent에서 SSH 키를 교체하고 GPG 서명을 설정하여 잘못된 서명으로 커밋하는 일이 없도록 합니다.

## 기능

- **서브모듈 지원**: Git 서브모듈에 자동으로 ID 전파
- **SSH 키 관리**: ssh-agent에서 SSH 키를 자동으로 전환
- **GPG 서명 지원**: 커밋 서명을 위한 GPG 키 설정 (선택 사항)
- **원클릭 ID 전환**: Git user.name과 user.email을 즉시 변경
- **상태 표시줄 통합**: 현재 ID를 한눈에 확인
- **풍부한 툴팁**: 설명과 SSH 호스트를 포함한 상세 ID 정보
- **크로스 플랫폼**: macOS, Linux, Windows 지원
- **다국어**: 17개 언어 지원

## 🌏 다국어 지원에 대한 생각

> **저는 소수의 존재 가치를 소중히 여깁니다.**
> 숫자가 적다는 이유만으로 그들을 버리고 싶지 않습니다.
> 번역이 완벽하지 않더라도, 소수 언어를 이해하고 존중하려는 우리의 의도를 느끼실 수 있기를 바랍니다.

이 확장 프로그램은 VSCode가 지원하는 17개 언어를 모두 지원합니다. 또한 README 문서의 경우, 소수 민족 언어와 재미있는 언어로의 번역도 도전하고 있습니다.

이것은 단순한 "글로벌 지원"이 아니라 "언어 다양성에 대한 존중"입니다. 이것이 언어 장벽을 초월하여 세상을 더 좋게 만드는 커밋이 전 세계 개발자들로부터 나오는 인프라가 되기를 바랍니다.

---

## 빠른 시작

개인 계정과 회사 발급 계정(Enterprise Managed User)을 관리하기 위한 일반적인 설정입니다.

### 1단계: SSH 키 준비

먼저 각 계정에 대한 SSH 키를 만듭니다 (이미 있다면 건너뛰세요):

```bash
# 개인용
ssh-keygen -t ed25519 -C "haneul@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 업무용
ssh-keygen -t ed25519 -C "haneul@company.example.com" -f ~/.ssh/id_ed25519_work
```

각 키의 **공개 키**(`.pub` 파일)를 해당 GitHub 계정에 등록합니다.

> **참고**: GitHub에 등록하는 것은 `id_ed25519_personal.pub`(공개 키)입니다. `id_ed25519_personal`(확장자 없음)은 개인 키입니다 - 절대 다른 사람과 공유하거나 어디에도 업로드하지 마세요.

### 2단계: SSH 설정

`~/.ssh/config`를 편집합니다:

```ssh-config
# 개인 GitHub 계정 (기본값)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 업무 GitHub 계정
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### 3단계: 확장 프로그램 설정

확장 프로그램 설정 열기(`Cmd+,` / `Ctrl+,`) → "Git ID Switcher" 검색 → "settings.json에서 편집" 클릭:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "김하늘",
      "email": "haneul@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "개인 프로젝트",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "name": "김하늘",
      "email": "haneul@company.example.com",
      "service": "GitHub 회사",
      "icon": "💼",
      "description": "회사 개발 (Enterprise Managed User)",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### 4단계: 사용하기

1. 상태 표시줄(오른쪽 하단)의 ID 아이콘을 클릭합니다
2. ID를 선택합니다
3. 완료! Git 설정과 SSH 키가 전환되었습니다.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-ko.png" width="600" alt="Quick Pick">

### SSH 호스트 별칭 사용

저장소를 클론할 때, ID에 해당하는 호스트를 사용합니다:

```bash
# 업무 ID (github-work 별칭 사용)
git clone git@github-work:company/repo.git

# 개인 ID (기본 github.com 사용)
git clone git@github.com:haneul/repo.git
```

---

## 선택 사항: GPG 서명

GPG로 커밋에 서명하는 경우:

### 1단계: GPG 키 ID 찾기

```bash
gpg --list-secret-keys --keyid-format SHORT
```

출력 예시:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] 김하늘 <haneul@personal.example.com>
```

키 ID는 `ABCD1234`입니다.

### 2단계: ID에 GPG 키 추가

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "김하늘",
      "email": "haneul@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "개인 프로젝트",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

이 ID로 전환하면, 확장 프로그램이 다음을 설정합니다:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## 전체 예시: 4개의 계정 + SSH + GPG

모든 기능을 결합한 전체 예시:

### SSH 설정 (`~/.ssh/config`)

```ssh-config
# 개인 계정 (기본값)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 업무 계정 (회사 발급 Enterprise Managed User)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Bitbucket 계정
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### 확장 프로그램 설정

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "김하늘",
      "email": "haneul@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "개인 프로젝트",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "name": "김하늘",
      "email": "haneul@company.example.com",
      "service": "GitHub 회사",
      "icon": "💼",
      "description": "회사 개발 (Enterprise Managed User)",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "name": "김하늘",
      "email": "haneul@bitbucket.example.com",
      "service": "Bitbucket",
      "icon": "🪣",
      "description": "Bitbucket 프로젝트",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "name": "김하늘",
      "email": "haneul@freelance.example.com",
      "service": "GitLab",
      "icon": "🎯",
      "description": "프리랜서 프로젝트"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

참고: 마지막 ID(`freelance`)는 SSH가 없습니다 — Git 설정만 전환합니다. 동일한 GitHub 계정에서 다른 커미터 정보를 사용할 때 유용합니다.

---

## 설정 참조

### ID 속성

| 속성          | 필수 | 설명                                                           |
| ------------- | ---- | -------------------------------------------------------------- |
| `id`          | ✅   | 고유 식별자 (예: `"work"`, `"personal"`)                       |
| `name`        | ✅   | Git user.name - 커밋에 표시됨                                  |
| `email`       | ✅   | Git user.email - 커밋에 표시됨                                 |
| `icon`        |      | 상태 표시줄에 표시되는 이모지 (예: `"💼"`). 단일 이모지만 허용 |
| `service`     |      | 서비스 이름 (예: `"GitHub"`, `"GitLab"`). UI 표시에 사용       |
| `description` |      | 선택기와 툴팁에 표시되는 짧은 설명                             |
| `sshKeyPath`  |      | SSH 개인 키 경로 (예: `"~/.ssh/id_ed25519_work"`)              |
| `sshHost`     |      | SSH 설정 호스트 별칭 (예: `"github-work"`)                     |
| `gpgKeyId`    |      | 커밋 서명용 GPG 키 ID                                          |

#### 표시 제한

- **상태 표시줄**: 약 25자를 초과하는 텍스트는 `...`으로 잘립니다
- **`icon`**: 단일 이모지(자소 클러스터)만 허용됩니다. 여러 이모지나 긴 문자열은 지원되지 않습니다

### 전역 설정

| 설정                                       | 기본값     | 설명                                                                                  |
| ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | 예시 참조  | ID 설정 목록                                                                          |
| `gitIdSwitcher.defaultIdentity`            | 예시 참조  | 기본으로 사용할 ID                                                                    |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | ID 전환 시 SSH 키 자동 전환                                                           |
| `gitIdSwitcher.showNotifications`          | `true`     | ID 전환 시 알림 표시                                                                  |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | Git 서브모듈에 ID 전파                                                                |
| `gitIdSwitcher.submoduleDepth`             | `1`        | 중첩된 서브모듈 설정의 최대 깊이 (1-5)                                                |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | Git config `user.name`에 아이콘 이모지 포함                                           |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | 감사 로그 활성화 (ID 전환, SSH 작업 등 기록)                                          |
| `gitIdSwitcher.logging.filePath`           | `""`       | 로그 파일 경로 (예: `~/.git-id-switcher/security.log`). 비어 있으면 기본 위치 사용    |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | 로테이션 전 최대 파일 크기 (바이트, 1MB-100MB)                                        |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | 보관할 로테이션 로그 파일 최대 수 (1-20)                                              |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | 로그 수준: `DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`. 선택한 수준 이상 기록            |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | 활성화하면 로그의 모든 값이 마스킹됩니다 (최대 개인정보 보호 모드)                    |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | 명령별 사용자 정의 타임아웃 (밀리초, 1초-5분). 예: `{"git": 15000, "ssh-add": 10000}` |

#### `includeIconInGitConfig`에 대하여

`icon` 필드 설정 시 동작을 제어합니다:

| 값               | 동작                                                         |
| ---------------- | ------------------------------------------------------------ |
| `false` (기본값) | `icon`은 에디터 UI에만 표시. Git config에는 `name`만 기록    |
| `true`           | Git config에 `icon + name` 기록. 커밋 기록에 이모지가 표시됨 |

예시: `icon: "👤"`, `name: "김하늘"`의 경우

| includeIconInGitConfig | Git config `user.name` | 커밋 서명           |
| ---------------------- | ---------------------- | ------------------- |
| `false`                | `김하늘`               | `김하늘 <email>`    |
| `true`                 | `👤 김하늘`            | `👤 김하늘 <email>` |

### 참고: 기본 설정 (SSH 없음)

SSH 키 전환이 필요 없는 경우 (예: 단일 GitHub 계정에서 다른 커미터 정보 사용), 최소 설정을 사용할 수 있습니다:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "김하늘",
      "email": "haneul@personal.example.com",
      "icon": "🏠",
      "description": "개인 프로젝트"
    },
    {
      "id": "work",
      "name": "김하늘",
      "email": "haneul@company.example.com",
      "icon": "💼",
      "description": "업무 개발"
    }
  ]
}
```

이 설정은 `git config user.name`과 `user.email`만 전환합니다.

---

## 작동 방식

### Git 설정 계층 구조

Git 설정에는 세 개의 계층이 있으며, 하위 계층이 상위 계층을 덮어씁니다:

```text
시스템 (/etc/gitconfig)
    ↓ 덮어씀
전역 (~/.gitconfig)
    ↓ 덮어씀
로컬 (.git/config)  ← 최우선
```

**Git ID Switcher는 `--local`(저장소 로컬)에 기록합니다.**

이것은:

- ID가 각 저장소의 `.git/config`에 저장됨
- 저장소마다 다른 ID를 유지할 수 있음
- 전역 설정(`~/.gitconfig`)은 수정되지 않음

### ID 전환 시

ID를 전환하면, 확장 프로그램이 다음 순서로 실행합니다:

1. **Git 설정** (항상): `git config --local user.name`과 `user.email` 설정
2. **SSH 키** (`sshKeyPath`가 설정된 경우): ssh-agent에서 다른 키 제거, 선택한 키 추가
3. **GPG 키** (`gpgKeyId`가 설정된 경우): `git config --local user.signingkey` 설정 및 서명 활성화
4. **서브모듈** (활성화된 경우): 모든 서브모듈에 설정 전파 (기본값: 깊이 1)

### 서브모듈 전파의 작동 방식

로컬 설정은 저장소별로 독립적이므로 서브모듈에 자동으로 적용되지 않습니다.
그래서 이 확장 프로그램은 서브모듈 전파 기능을 제공합니다 (자세한 내용은 "고급: 서브모듈 지원" 참조).

---

## 고급: 서브모듈 지원

Git 서브모듈을 사용하는 복잡한 저장소의 경우, ID 관리는 종종 번거롭습니다. 서브모듈에서 커밋하면 Git은 해당 서브모듈의 로컬 설정을 사용하는데, 명시적으로 설정하지 않으면 전역 설정(잘못된 이메일!)을 기본값으로 사용할 수 있습니다.

**Git ID Switcher**는 자동으로 서브모듈을 감지하고 선택한 ID를 적용합니다.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: 이 기능 활성화/비활성화
- `submoduleDepth`: 얼마나 깊이 적용할까요?
  - `1`: 직접 서브모듈만 (가장 일반적)
  - `2+`: 중첩된 서브모듈 (서브모듈 안의 서브모듈)

이렇게 하면 메인 저장소든 vendor 라이브러리든 어디서 커밋하든 ID가 항상 올바르게 유지됩니다.

---

## 문제 해결

### SSH 키가 전환되지 않나요?

1. `ssh-agent`가 실행 중인지 확인:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. 키 경로가 올바른지 확인:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. macOS에서 키체인에 한 번 추가:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### 푸시할 때 ID가 잘못되나요?

1. 원격 URL이 올바른 호스트 별칭을 사용하는지 확인:

   ```bash
   git remote -v
   # 업무 저장소는 git@github-work:... 이어야 함
   ```

2. 필요하면 업데이트:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG 서명이 작동하지 않나요?

1. GPG 키 ID 찾기:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. 서명 테스트:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. ID의 이메일 주소가 GPG 키의 이메일 주소와 일치하는지 확인하세요.

### ID가 감지되지 않나요?

- Git 저장소 안에 있는지 확인
- `settings.json`에 구문 오류가 없는지 확인
- VS Code 창 새로고침 (`Cmd+Shift+P` → "창 새로고침")

### `name` 필드에서 오류가 발생하나요?

`name` 필드에 다음 문자가 포함되면 오류가 발생합니다:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

서비스 정보를 포함하려면 `service` 필드를 사용하세요.

```jsonc
// NG
"name": "김하늘 (개인)"

// OK
"name": "김하늘",
"service": "GitHub"
```

### 새 설정이 표시되지 않나요?

확장 프로그램을 업데이트한 후 새 설정 항목이 설정 UI에 나타나지 않을 수 있습니다.

**해결 방법:** 컴퓨터를 완전히 재시작하세요.

VS Code 등의 에디터는 설정 스키마를 메모리에 캐시하며, "창 새로고침"이나 확장 프로그램 재설치로는 갱신되지 않을 수 있습니다.

### 기본값이 비어있나요?

새로 설치해도 샘플 설정이 나타나지 않는다면, **Settings Sync**가 원인일 수 있습니다.

이전에 빈 설정을 저장했다면 클라우드에 동기화되어 새 설치 시 기본값을 덮어쓸 수 있습니다.

**해결 방법:**

1. 설정 UI에서 해당 설정 항목 찾기
2. 톱니바퀴 아이콘 → "설정 재설정" 클릭
3. Settings Sync와 동기화 (클라우드에서 이전 설정 삭제)

---

## 명령어

| 명령어                                   | 설명              |
| ---------------------------------------- | ----------------- |
| `Git ID Switcher: Select Identity`       | ID 선택기 열기    |
| `Git ID Switcher: Show Current Identity` | 현재 ID 정보 표시 |
| `Git ID Switcher: Show Documentation`    | 문서 표시         |

---

## 설계 철학

> "나는 누구인가?" — 이 확장 프로그램이 답하는 유일한 질문입니다.

**카레산스이 아키텍처**를 기반으로 구축: 단순한 핵심 (100줄),
의도적인 품질 (90% 커버리지, 로깅, 타임아웃)과
의도적인 제약 (GitHub API 없음, 토큰 관리 없음)으로 둘러싸여 있습니다.

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[전체 철학 읽기](../../DESIGN_PHILOSOPHY.md)

---

## 기여

기여를 환영합니다! [CONTRIBUTING.md](../../CONTRIBUTING.md)를 확인해 주세요.

## 라이선스

MIT 라이선스 - [LICENSE](../../../LICENSE)를 확인해 주세요.

## 크레딧

[Null;Variant](https://github.com/nullvariant) 제작
