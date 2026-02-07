# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      한 번의 클릭으로 여러 Git 프로필을 전환합니다. 여러 GitHub 계정, SSH 키, GPG 서명을 관리하고, <b>Git 서브모듈에 자동으로 프로필을 적용</b>합니다.
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

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ko/demo.webp" width="600" alt="데모" loading="lazy">

## 🎯 왜 Git ID Switcher인가요?

Git 프로필 전환 도구는 여럿 존재하지만, **Git ID Switcher**는 다른 도구들이 간과하기 쉬운 복잡한 문제를 해결합니다:

1. **서브모듈의 악몽**: 서브모듈이 있는 저장소(예: Hugo 테마, vendor 라이브러리)에서 작업할 때, 일반적으로 _각_ 서브모듈마다 `git config user.name`을 수동으로 설정해야 합니다. 이 확장 프로그램은 모든 활성 서브모듈에 재귀적으로 프로필을 적용하여 이 문제를 우아하게 해결합니다.
2. **SSH 및 GPG 처리**: 단순히 이름을 변경하는 것이 아닙니다. ssh-agent에서 SSH 키를 교체하고 GPG 서명을 설정하여, 잘못된 서명으로 커밋하는 일을 방지합니다.

## 기능

- **프로필 관리 UI**: settings.json을 편집하지 않고도 프로필의 추가·편집·삭제·정렬이 가능
- **원클릭 프로필 전환**: Git user.name과 user.email을 즉시 변경
- **상태 표시줄 통합**: 현재 프로필을 항상 한눈에 확인
- **서브모듈 지원**: Git 서브모듈에 자동으로 프로필 전파
- **SSH 키 관리**: ssh-agent에서 SSH 키를 자동으로 전환
- **GPG 서명 지원**: 커밋 서명을 위한 GPG 키 설정 (선택 사항)
- **풍부한 툴팁**: 설명과 SSH 호스트를 포함한 상세 프로필 정보
- **크로스 플랫폼**: macOS, Linux, Windows에서 동작
- **다국어 지원**: 17개 언어 지원

## 🌏 다국어 지원에 대한 생각

> **저는 소수의 존재 가치를 소중히 여깁니다.**
> 숫자가 적다는 이유만으로 버리고 싶지 않습니다.
> 완벽하게 번역하지 못하더라도, 소수 언어의 존재를 이해하고 경의를 표하는 의도만이라도 느끼실 수 있기를 바랍니다.

이 확장 프로그램은 VS Code가 지원하는 17개 언어를 모두 지원합니다. 더 나아가, README 문서에서는 소수 민족 언어와 유머 언어로의 번역에도 도전하고 있습니다.

이것은 단순한 "글로벌 대응"이 아니라 "언어적 다양성에 대한 경의"입니다. 그리고 언어를 초월하여, 세계 곳곳에 사는 개발자들이 세상을 더 좋게 만드는 커밋을 보내는...그런 인프라가 되었으면 합니다.

---

## 빠른 시작

개인 계정과 회사 발급 계정(Enterprise Managed User)을 사용 구분하는 일반적인 설정입니다.

### 1단계: SSH 키 준비

먼저, 계정별로 SSH 키를 생성합니다 (이미 있는 경우 건너뛰세요):

```bash
# 개인용
ssh-keygen -t ed25519 -C "haneul@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 업무용
ssh-keygen -t ed25519 -C "haneul.kim@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

각 SSH 키의 **공개 키** (`.pub` 파일)를 해당 GitHub 계정에 등록하세요.

> **주의**: GitHub에 등록하는 것은 `id_ed25519_personal.pub` (공개 키)입니다. `id_ed25519_personal` (확장자 없음)은 개인 키이므로, 절대 다른 사람과 공유하거나 어디에도 업로드하지 마세요.

### 2단계: SSH config 설정

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

설치 직후 샘플 프로필이 준비되어 있습니다.
아래 가이드에 따라 자신에게 맞게 편집하세요.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ko/first-ux.webp" width="600" alt="초기 설정 절차(13단계): 상태 표시줄에서 프로필 관리를 열어 편집 및 새로 만들기" loading="lazy">

> **키 파일은 전송되지 않습니다**: SSH 키 경로를 설정할 때 기록되는 것은 키 파일의 경로(위치)뿐입니다. 키 파일의 내용이 업로드되거나 외부로 전송되는 일은 없습니다.

> **GPG 서명을 사용하는 경우**: 프로필 편집 화면에서 `gpgKeyId`도 설정할 수 있습니다.
> GPG 키 ID 확인 방법은 「[문제 해결](#gpg-서명이-작동하지-않나요)」을 참조하세요.

> **힌트**: settings.json에서 직접 설정할 수도 있습니다.
> 확장 프로그램 설정 열기 (`Cmd+,` / `Ctrl+,`) → "Git ID Switcher" 검색 → "settings.json에서 편집" 클릭.
> JSON 설정 예시는 「[전체 설정 예시](#전체-설정-예시-5개-계정과-ssh--gpg)」를 참조하세요.

---

## 전체 설정 예시: 5개 계정과 SSH + GPG

모든 기능을 결합한 완전한 예시:

### SSH 설정 (`~/.ssh/config`)

```ssh-config
# 개인 계정 (기본값)
Host github-personal
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

# 클라이언트 A 수주 업무 (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# 클라이언트 B 상주 프로젝트 (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS 기여 (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
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
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "김하늘",
      "email": "haneul.kim@techcorp.example.com",
      "service": "GitHub 회사",
      "icon": "💼",
      "description": "TechCorp 본업",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "김하늘",
      "email": "haneul@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA 외주",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "H.Kim",
      "email": "h.kim@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB 상주",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "haneul-dev",
      "email": "haneul.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "오픈소스 기여",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

참고: 4번째 프로필(`client-b`)은 약칭, 5번째(`oss`)는 개발자 핸들을 사용합니다. 같은 사람이라도 프로필마다 다른 표시 이름을 설정할 수 있습니다.

---

## 프로필 관리

상태 표시줄 클릭 → 목록 하단의 「프로필 관리」에서 관리 화면을 엽니다.
프로필의 추가·편집·삭제·정렬을 모두 UI에서 직접 조작할 수 있습니다.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ko/identity-management.webp" width="600" alt="프로필 관리: 삭제 및 정렬 조작 가이드" loading="lazy">

명령 팔레트에서 `Git ID Switcher: Delete Identity`로 프로필을 삭제할 수도 있습니다.

---

## 명령어

| 명령어                                   | 설명                  |
| ---------------------------------------- | --------------------- |
| `Git ID Switcher: Select Identity`       | 프로필 선택기 열기    |
| `Git ID Switcher: Delete Identity`       | 프로필 삭제           |
| `Git ID Switcher: Show Current Identity` | 현재 프로필 정보 표시 |
| `Git ID Switcher: Show Documentation`    | 문서 표시             |

---

## 설정 레퍼런스

### 프로필 속성

| 속성          | 필수 | 설명                                                           |
| ------------- | ---- | -------------------------------------------------------------- |
| `id`          | ✅   | 고유 식별자 (예: `"personal"`, `"work"`)                       |
| `name`        | ✅   | Git user.name - 커밋에 표시                                    |
| `email`       | ✅   | Git user.email - 커밋에 표시                                   |
| `icon`        |      | 상태 표시줄에 표시되는 이모지 (예: `"🏠"`). 단일 이모지만 허용 |
| `service`     |      | 서비스 이름 (예: `"GitHub"`, `"GitLab"`). UI 표시에 사용       |
| `description` |      | 선택기와 툴팁에 표시되는 짧은 설명                             |
| `sshKeyPath`  |      | SSH 개인 키 경로 (예: `"~/.ssh/id_ed25519_work"`)              |
| `sshHost`     |      | SSH config의 Host 별칭 (예: `"github-work"`)                   |
| `gpgKeyId`    |      | 커밋 서명용 GPG 키 ID                                          |

#### 표시 제한

- **상태 표시줄**: 약 25자를 초과하면 `...`으로 생략됩니다
- **`icon`**: 단일 이모지(자소 클러스터)만 사용 가능. 여러 이모지나 긴 문자열은 사용할 수 없습니다

### 글로벌 설정

| 설정                                       | 기본값     | 설명                                                                                |
| ------------------------------------------ | ---------- | ----------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | 샘플 참조  | 프로필 설정 목록                                                                    |
| `gitIdSwitcher.defaultIdentity`            | 샘플 참조  | 사용할 기본 프로필의 ID                                                             |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | 프로필 변경 시 SSH 키 자동 전환                                                     |
| `gitIdSwitcher.showNotifications`          | `true`     | 프로필 전환 시 알림 표시                                                            |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | Git 서브모듈에 프로필 전파                                                          |
| `gitIdSwitcher.submoduleDepth`             | `1`        | 중첩된 서브모듈 설정의 최대 깊이 (1-5)                                              |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | Git config의 `user.name`에 아이콘 이모지 포함 여부                                  |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | 감사 로그를 파일에 저장 (프로필 전환, SSH 키 조작 등을 기록)                        |
| `gitIdSwitcher.logging.filePath`           | `""`       | 로그 파일 경로 (예: `~/.git-id-switcher/security.log`). 빈 문자열은 기본 경로 사용  |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | 로테이션 전 최대 파일 크기 (바이트, 1MB-100MB)                                      |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | 보관할 로테이션 로그 파일의 최대 수 (1-20)                                          |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | 활성화 시 로그의 모든 값을 마스킹 (최대 프라이버시 모드)                            |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | 로그 상세도 (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). 선택한 수준 이상을 기록 |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | 명령별 커스텀 타임아웃 (밀리초, 1초-5분). 예: `{"git": 15000, "ssh-add": 10000}`    |

#### `includeIconInGitConfig`에 대해

`icon` 필드를 설정한 경우의 동작을 제어합니다:

| 값               | 동작                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `false` (기본값) | `icon`은 에디터 UI에만 표시. Git config에는 `name`만 기록        |
| `true`           | Git config에 `icon + name`을 기록. 커밋 이력에도 이모지가 표시됨 |

예시: `icon: "👤"`, `name: "김하늘"`의 경우

| includeIconInGitConfig | Git config `user.name` | 커밋 서명           |
| ---------------------- | ---------------------- | ------------------- |
| `false`                | `김하늘`               | `김하늘 <email>`    |
| `true`                 | `👤 김하늘`            | `👤 김하늘 <email>` |

---

## 작동 방식

### Git config의 레이어 구조

Git 설정에는 세 개의 레이어가 있으며, 하위 설정을 상위가 덮어씁니다:

```text
시스템 (/etc/gitconfig)
    ↓ 덮어씀
글로벌 (~/.gitconfig)
    ↓ 덮어씀
로컬 (.git/config)  ← 최우선
```

**Git ID Switcher는 `--local` (저장소 로컬)에 기록합니다.**

즉:

- 각 저장소의 `.git/config`에 프로필을 저장합니다
- 저장소마다 다른 프로필을 유지할 수 있습니다
- 글로벌 설정 (`~/.gitconfig`)은 변경하지 않습니다

### 프로필 전환 시 동작

프로필을 전환하면 확장 프로그램이 다음을 순서대로 실행합니다:

1. **Git Config** (항상): `git config --local user.name`과 `user.email`을 설정
2. **SSH 키** (`sshKeyPath` 설정 시): 다른 키를 ssh-agent에서 제거하고 선택한 키를 추가
3. **GPG 키** (`gpgKeyId` 설정 시): `git config --local user.signingkey`를 설정하고 서명을 활성화
4. **서브모듈** (활성화 시): 모든 서브모듈에 설정을 전파 (기본값: 깊이 1)

### 서브모듈 전파의 작동 방식

로컬 설정은 저장소 단위이므로, 서브모듈에는 자동으로 적용되지 않습니다.
그래서 본 확장 프로그램은 서브모듈 전파 기능을 제공합니다 (자세한 내용은 「고급: 서브모듈 지원」을 참조).

### SSH 키 관리 상세

Git ID Switcher는 `ssh-agent`를 통해 SSH 키를 관리합니다:

| 조작    | 실행 명령              |
| ------- | ---------------------- |
| 키 추가 | `ssh-add <keyPath>`    |
| 키 제거 | `ssh-add -d <keyPath>` |
| 키 목록 | `ssh-add -l`           |

**중요:** 이 확장 프로그램은 `~/.ssh/config`를 **변경하지 않습니다**. SSH config 설정은 수동으로 해야 합니다 (「빠른 시작」의 2단계 참조).

### 기존 SSH 설정과의 상호작용

이미 SSH 설정이 있는 경우, Git ID Switcher는 다음과 같이 동작합니다:

| 사용자의 설정                           | Git ID Switcher의 동작                                |
| --------------------------------------- | ----------------------------------------------------- |
| `~/.ssh/config`에서 `IdentityFile` 지정 | 양쪽 모두 사용 가능; `IdentitiesOnly yes`로 충돌 방지 |
| 환경 변수 `GIT_SSH_COMMAND` 설정        | 커스텀 SSH 명령을 사용; ssh-agent는 계속 동작         |
| `git config core.sshCommand` 설정       | 위와 동일                                             |
| direnv로 SSH 관련 환경 변수 설정        | 공존 가능; ssh-agent는 독립적으로 동작                |

**권장:** SSH config에서는 항상 `IdentitiesOnly yes`를 설정하세요. 이렇게 하면 SSH가 여러 키를 시도하는 것을 방지합니다.

### `IdentitiesOnly yes`가 필요한 이유

이 설정이 없으면 SSH가 다음 순서로 키를 시도할 수 있습니다:

1. ssh-agent에 로드된 키 (Git ID Switcher가 관리)
2. `~/.ssh/config`에서 지정된 키
3. 기본 키 (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` 등)

이로 인해 인증 실패나 의도하지 않은 키 사용이 발생할 수 있습니다.

`IdentitiesOnly yes`를 설정하면 SSH는 **지정된 키만** 사용합니다. 이를 통해 Git ID Switcher에서 설정한 키가 확실히 사용됩니다.

```ssh-config
# 권장 설정
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← 이 줄이 중요
```

이 설정을 통해 `github-work` 호스트에 연결할 때 `~/.ssh/id_ed25519_work`만 사용되며, 다른 키는 시도되지 않습니다.

---

## 고급: 서브모듈 지원

Git 서브모듈을 사용하는 복잡한 저장소에서는 프로필 관리가 종종 골칫거리입니다. 서브모듈 내에서 커밋할 때 Git은 해당 서브모듈의 로컬 설정을 사용하지만, 명시적으로 설정하지 않으면 글로벌 설정(잘못된 이메일 주소!)이 기본값으로 사용될 수 있습니다.

**Git ID Switcher**는 자동으로 서브모듈을 감지하고 선택한 프로필을 적용합니다.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: 이 기능의 활성화/비활성화
- `submoduleDepth`: 어느 깊이까지 적용할 것인가?
  - `1`: 직접적인 서브모듈만 (가장 일반적)
  - `2+`: 중첩 서브모듈 (서브모듈 안의 서브모듈)

이를 통해 메인 저장소에서 커밋하든, vendor 라이브러리에서 커밋하든, 프로필이 항상 올바르게 설정됩니다.

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

3. macOS에서는 키체인에 한 번 추가:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### 푸시 시 프로필이 잘못되나요?

**새로 클론할 때:**

업무 저장소를 클론할 때는 SSH config에서 설정한 호스트 별칭을 사용합니다:

```bash
# 업무용 (github-work 별칭 사용)
git clone git@github-work:company/repo.git

# 개인용 (기본 github.com 사용)
git clone git@github.com:yourname/repo.git
```

**기존 저장소의 경우:**

1. 리모트 URL이 올바른 호스트 별칭을 사용하고 있는지 확인:

   ```bash
   git remote -v
   # 업무 저장소라면 git@github-work:... 이어야 합니다
   ```

2. 필요하면 업데이트:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG 서명이 작동하지 않나요?

1. GPG 키 ID 확인:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. 서명 테스트:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. 프로필의 이메일 주소가 GPG 키의 이메일 주소와 일치하는지 확인하세요

### 프로필이 감지되지 않나요?

- Git 저장소 안에 있는지 확인
- `settings.json`에 구문 오류가 없는지 확인
- VS Code 창 다시 로드 (`Cmd+Shift+P` → "창 다시 로드")

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

확장 프로그램을 업데이트해도 새 설정 항목이 설정 화면에 나타나지 않을 수 있습니다.

**해결 방법:** 컴퓨터를 완전히 재시작하세요.

VS Code 등의 에디터는 설정 스키마를 메모리에 캐시하며, "창 다시 로드"나 확장 프로그램 재설치만으로는 갱신되지 않는 경우가 있습니다.

### 기본값(identities 등)이 비어 있나요?

새로 설치해도 샘플 설정이 나타나지 않는다면, **Settings Sync**가 원인일 수 있습니다.

이전에 빈 설정을 저장한 적이 있다면, 클라우드에 동기화되어 새로 설치할 때 기본값을 덮어쓸 수 있습니다.

**해결 방법:**

1. 설정 화면에서 해당 설정 항목 찾기
2. 톱니바퀴 아이콘 → "설정 초기화" 클릭
3. Settings Sync로 동기화 (클라우드에서 이전 설정이 삭제됩니다)

---

## 설계 철학

> **「나는 누구인가」를 전환하다** — 이 확장 프로그램이 답하는 유일한 물음

**가레산스이 아키텍처**로 설계되어 있습니다. 코어는 100줄로 쓸 수 있는 단순함.
그렇기에 나머지를 품질(테스트 90%, 로깅, 타임아웃)과
의도적인 제약(GitHub API 연동 없음, 토큰 관리 없음)에 쏟을 수 있습니다.

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[설계 철학 전문 읽기](../../DESIGN_PHILOSOPHY.md)

---

## 기여

기여를 환영합니다! [CONTRIBUTING.md](../../CONTRIBUTING.md)를 확인해 주세요.

## 라이선스

MIT 라이선스 - [LICENSE](../../../LICENSE)를 확인해 주세요.

## 크레딧

[Null;Variant](https://github.com/nullvariant)에 의해 제작
