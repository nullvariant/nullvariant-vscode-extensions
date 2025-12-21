# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      한 번의 클릭으로 여러 Git ID를 전환합니다. 여러 GitHub 계정, SSH 키, GPG 서명을 관리하고, <b>Git 서브모듈에 자동으로 ID를 적용</b>합니다.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 다국어 지원: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <b>🇰🇷</b> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> ... <a href="../../LANGUAGES.md">+20 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/docs/i18n/ko/demo.png" width="600" alt="데모">

## 기능

- **원클릭 ID 전환**: Git user.name과 user.email을 즉시 변경
- **SSH 키 관리**: ssh-agent에서 SSH 키를 자동으로 전환
- **GPG 서명 지원**: 커밋 서명을 위한 GPG 키 설정 (선택 사항)
- **서브모듈 지원**: Git 서브모듈에 자동으로 ID 전파
- **상태 표시줄 통합**: 현재 ID를 한눈에 확인
- **풍부한 툴팁**: 설명과 SSH 호스트를 포함한 상세 ID 정보
- **크로스 플랫폼**: macOS, Linux, Windows 지원
- **다국어**: 17개 언어 지원

## 🚀 왜 이 확장 프로그램인가요?

많은 Git ID 전환 도구가 있지만, **Git ID Switcher**는 다른 도구들이 종종 무시하는 복잡한 문제를 해결합니다:

1. **서브모듈의 악몽**: 서브모듈이 있는 저장소(예: Hugo 테마, vendor 라이브러리)에서 작업할 때, 일반적으로 *각* 서브모듈마다 `git config user.name`을 수동으로 설정해야 합니다. 이 확장 프로그램은 모든 활성 서브모듈에 재귀적으로 ID를 적용하여 이 문제를 우아하게 해결합니다.
2. **SSH 및 GPG 처리**: 단순히 이름을 변경하는 것이 아닙니다. ssh-agent에서 SSH 키를 교체하고 GPG 서명을 설정하여 잘못된 서명으로 커밋하는 일이 없도록 합니다.

## 🌏 다국어 지원에 대한 생각

> **저는 소수의 존재 가치를 소중히 여깁니다.**
> 숫자가 적다는 이유만으로 그들을 버리고 싶지 않습니다.
> 번역이 완벽하지 않더라도, 소수 언어를 이해하고 존중하려는 우리의 의도를 느끼실 수 있기를 바랍니다.

이 확장 프로그램은 VSCode가 지원하는 17개 언어를 모두 지원합니다. 또한 README 문서의 경우, 소수 민족 언어와 재미있는 언어로의 번역도 도전하고 있습니다.

이것은 단순한 "글로벌 지원"이 아니라 "언어 다양성에 대한 존중"입니다. 이것이 언어 장벽을 초월하여 세상을 더 좋게 만드는 커밋이 전 세계 개발자들로부터 나오는 인프라가 되기를 바랍니다.

---

## 빠른 시작

여러 GitHub 계정을 관리하기 위한 일반적인 설정입니다.

### 1단계: SSH 키 준비

먼저 각 계정에 대한 SSH 키를 만듭니다 (이미 있다면 건너뛰세요):

```bash
# 개인용
ssh-keygen -t ed25519 -C "kim.min@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 업무용
ssh-keygen -t ed25519 -C "kim.min@company.example.com" -f ~/.ssh/id_ed25519_work
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

VS Code 설정 열기(`Cmd+,` / `Ctrl+,`) → "Git ID Switcher" 검색 → "settings.json에서 편집" 클릭:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "김민",
      "email": "kim.min@personal.example.com",
      "description": "개인 프로젝트",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "김민",
      "email": "kim.min@company.example.com",
      "description": "업무 개발",
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

### SSH 호스트 별칭 사용

저장소를 클론할 때, ID에 해당하는 호스트를 사용합니다:

```bash
# 업무 ID (github-work 별칭 사용)
git clone git@github-work:company/repo.git

# 개인 ID (기본 github.com 사용)
git clone git@github.com:kimmin/repo.git
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
uid         [ultimate] 김민 <kim.min@personal.example.com>
```

키 ID는 `ABCD1234`입니다.

### 2단계: ID에 GPG 키 추가

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "김민",
      "email": "kim.min@personal.example.com",
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

# 업무 계정
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# 오픈소스 활동 계정
Host github-oss
    HostName github.com
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
      "icon": "🏠",
      "name": "김민",
      "email": "kim.min@personal.example.com",
      "description": "개인 프로젝트",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "김민",
      "email": "kim.min@company.example.com",
      "description": "업무 개발",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "oss",
      "icon": "🌟",
      "name": "kimmin-oss",
      "email": "kimmin.oss@example.com",
      "description": "오픈소스 기여",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "github-oss"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "김민",
      "email": "kim.min@freelance.example.com",
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

| 속성          | 필수 | 설명                                                   |
| ------------- | ---- | ------------------------------------------------------ |
| `id`          | ✅   | 고유 식별자 (예: `"work"`, `"personal"`)               |
| `name`        | ✅   | Git user.name - 커밋에 표시됨                          |
| `email`       | ✅   | Git user.email - 커밋에 표시됨                         |
| `icon`        |      | 상태 표시줄에 표시되는 이모지 (예: `"💼"`)              |
| `description` |      | 선택기와 툴팁에 표시되는 짧은 설명                     |
| `sshKeyPath`  |      | SSH 개인 키 경로 (예: `"~/.ssh/id_ed25519_work"`)      |
| `sshHost`     |      | SSH 설정 호스트 별칭 (예: `"github-work"`)             |
| `gpgKeyId`    |      | 커밋 서명용 GPG 키 ID                                  |

### 전역 설정

| 설정                              | 기본값     | 설명                                       |
| --------------------------------- | ---------- | ------------------------------------------ |
| `gitIdSwitcher.identities`        | 예시 참조  | ID 설정 목록                               |
| `gitIdSwitcher.defaultIdentity`   | 예시 참조  | 기본으로 사용할 ID                         |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`     | ID 전환 시 SSH 키 자동 전환                |
| `gitIdSwitcher.showNotifications` | `true`     | ID 전환 시 알림 표시                       |
| `gitIdSwitcher.applyToSubmodules` | `true`     | Git 서브모듈에 ID 전파                     |
| `gitIdSwitcher.submoduleDepth`    | `1`        | 중첩된 서브모듈 설정의 최대 깊이 (1-5)     |

### 참고: 기본 설정 (SSH 없음)

SSH 키 전환이 필요 없는 경우 (예: 단일 GitHub 계정에서 다른 커미터 정보 사용), 최소 설정을 사용할 수 있습니다:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "김민",
      "email": "kim.min@personal.example.com",
      "description": "개인 프로젝트"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "김민",
      "email": "kim.min@company.example.com",
      "description": "업무 개발"
    }
  ]
}
```

이 설정은 `git config user.name`과 `user.email`만 전환합니다.

---

## 작동 방식

ID를 전환하면, 확장 프로그램이 다음 순서로 실행합니다:

1. **Git 설정** (항상): `git config --local user.name`과 `user.email` 설정
2. **SSH 키** (`sshKeyPath`가 설정된 경우): ssh-agent에서 다른 키 제거, 선택한 키 추가
3. **GPG 키** (`gpgKeyId`가 설정된 경우): `git config --local user.signingkey` 설정 및 서명 활성화
4. **서브모듈** (활성화된 경우): 모든 서브모듈에 설정 전파 (기본값: 깊이 1)

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

---

## 명령어

| 명령어                          | 설명                 |
| ------------------------------- | -------------------- |
| `Git ID: Select Identity`       | ID 선택기 열기       |
| `Git ID: Show Current Identity` | 현재 ID 정보 표시    |

---

## 기여

기여를 환영합니다! [CONTRIBUTING.md](../../CONTRIBUTING.md)를 확인해 주세요.

## 라이선스

MIT 라이선스 - [LICENSE](../../LICENSE)를 확인해 주세요.

## 크레딧

[Null;Variant](https://github.com/nullvariant) 제작
