# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      一鍵切換多個Git身份。管理多個GitHub帳戶、SSH金鑰、GPG簽署，並<b>自動將身份套用到Git子模組</b>。
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/attestations"><img src="https://img.shields.io/badge/SLSA-Level_3-green" alt="SLSA 3"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml/badge.svg" alt="Security"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
      <br>
      🌐 多語言支持: <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <b>🇹🇼</b> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-zh-TW.png" width="600" alt="示範">

## 🎯 為什麼選擇 Git ID Switcher？

雖然有很多 Git 身份切換工具，但 **Git ID Switcher** 解決了其他工具往往忽略的複雜問題：

1. **子模組的困擾**: 在包含子模組的儲存庫（如 Hugo 主題、vendor 函式庫）中工作時，通常需要為*每個*子模組手動設定 `git config user.name`。本擴充功能透過遞迴地將身份套用到所有活動子模組，優雅地解決了這個問題。
2. **SSH 和 GPG 處理**: 它不僅僅是變更名稱；它還會在 ssh-agent 中切換 SSH 金鑰並設定 GPG 簽署，確保您不會使用錯誤的簽章進行提交。

## 功能特色

- **子模組支援**: 自動將身份傳播到 Git 子模組
- **SSH金鑰管理**: 自動在 ssh-agent 中切換 SSH 金鑰
- **GPG簽署支援**: 設定用於提交簽署的 GPG 金鑰（選用）
- **一鍵切換身份**: 即時變更 Git user.name 和 user.email
- **狀態列整合**: 隨時一目了然地查看目前身份
- **豐富的工具提示**: 包含描述和 SSH 主機的詳細身份資訊
- **跨平台**: 支援 macOS、Linux 和 Windows
- **多語言**: 支援17種語言

## 🌏 關於多語言支援的想法

> **我重視少數群體的存在價值。**
> 我不想僅僅因為他們人數少就將其拋棄。
> 即使翻譯不完美，我也希望您能感受到我們理解和尊重少數語言的意圖。

本擴充功能支援 VSCode 所支援的全部17種語言。此外，對於 README 文件，我們還在嘗試翻譯成少數民族語言甚至趣味語言。

這不僅僅是「全球化支援」，而是「對語言多樣性的尊重」。我希望這能成為一個基礎設施，讓來自世界各地的開發者跨越語言障礙，提交讓世界變得更美好的程式碼。

---

## 快速開始

管理個人帳戶和公司發放帳戶（企業託管使用者）的典型設定。

### 步驟 1: 準備 SSH 金鑰

首先，為每個帳戶建立 SSH 金鑰（如果已有則跳過）：

```bash
# 個人帳戶
ssh-keygen -t ed25519 -C "chenyu@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 工作帳戶
ssh-keygen -t ed25519 -C "chenyu@company.example.com" -f ~/.ssh/id_ed25519_work
```

將每個金鑰的**公鑰**（`.pub` 檔案）註冊到相應的 GitHub 帳戶。

> **注意**: 註冊到 GitHub 的是 `id_ed25519_personal.pub`（公鑰）。`id_ed25519_personal`（無副檔名）是私鑰 - 切勿與他人分享或上傳到任何地方。

### 步驟 2: 設定 SSH

編輯 `~/.ssh/config`：

```ssh-config
# 個人 GitHub 帳戶（預設）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 工作 GitHub 帳戶
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### 步驟 3: 設定擴充功能

開啟擴充功能設定（`Cmd+,` / `Ctrl+,`）→ 搜尋 "Git ID Switcher" → 點擊 "在 settings.json 中編輯"：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "陳雨",
      "service": "GitHub",
      "email": "chenyu@personal.example.com",
      "description": "個人專案",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "陳雨",
      "service": "GitHub 公司",
      "email": "chenyu@company.example.com",
      "description": "公司開發（企業託管使用者）",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### 步驟 4: 開始使用

1. 點擊狀態列（右下角）的身份圖示
2. 選擇一個身份
3. 完成！Git 設定和 SSH 金鑰已切換。

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-zh-TW.png" width="600" alt="Quick Pick">

### 使用 SSH 主機別名

複製儲存庫時，使用與您的身份對應的主機：

```bash
# 工作身份（使用 github-work 別名）
git clone git@github-work:company/repo.git

# 個人身份（使用預設的 github.com）
git clone git@github.com:chenyu/repo.git
```

---

## 選用: GPG 簽署

如果您使用 GPG 簽署提交：

### 步驟 1: 查找您的 GPG 金鑰 ID

```bash
gpg --list-secret-keys --keyid-format SHORT
```

輸出範例：

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] 陳雨 <chenyu@personal.example.com>
```

金鑰 ID 是 `ABCD1234`。

### 步驟 2: 將 GPG 金鑰加入身份

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "陳雨",
      "service": "GitHub",
      "email": "chenyu@personal.example.com",
      "description": "個人專案",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

切換到此身份時，擴充功能會設定：

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## 完整範例: 4個帳戶 + SSH + GPG

結合所有功能的完整範例：

### SSH 設定 (`~/.ssh/config`)

```ssh-config
# 個人帳戶（預設）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 工作帳戶（公司發放的企業託管使用者）
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Bitbucket 帳戶
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### 擴充功能設定

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "陳雨",
      "service": "GitHub",
      "email": "chenyu@personal.example.com",
      "description": "個人專案",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "陳雨",
      "service": "GitHub 公司",
      "email": "chenyu@company.example.com",
      "description": "公司開發（企業託管使用者）",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "陳雨",
      "service": "Bitbucket",
      "email": "chenyu@bitbucket.example.com",
      "description": "Bitbucket 專案",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "陳雨",
      "service": "GitLab",
      "email": "chenyu@freelance.example.com",
      "description": "自由接案專案"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

注意：最後一個身份（`freelance`）沒有 SSH — 它只切換 Git 設定。這在使用同一個 GitHub 帳戶但需要不同提交者資訊時很有用。

---

## 設定參考

### 身份屬性

| 屬性          | 必需 | 描述                                                   |
| ------------- | ---- | ------------------------------------------------------ |
| `id`          | ✅   | 唯一識別碼（如 `"work"`, `"personal"`）                |
| `name`        | ✅   | Git user.name - 顯示在提交中                           |
| `email`       | ✅   | Git user.email - 顯示在提交中                          |
| `icon`        |      | 狀態列顯示的表情符號（如 `"💼"`）。僅限單一表情符號    |
| `service`     |      | 服務名稱（如 `"GitHub"`, `"GitLab"`）。用於 UI 顯示    |
| `description` |      | 在選擇器和工具提示中顯示的簡短描述                     |
| `sshKeyPath`  |      | SSH 私鑰路徑（如 `"~/.ssh/id_ed25519_work"`）          |
| `sshHost`     |      | SSH 設定主機別名（如 `"github-work"`）                 |
| `gpgKeyId`    |      | 用於提交簽署的 GPG 金鑰 ID                             |

#### 顯示限制

- **狀態列**: 超過約25個字元的文字將用 `...` 截斷
- **`icon`**: 僅允許單一表情符號（字素叢集）。不支援多個表情符號或長字串

### 全域設定

| 設定                                   | 預設值     | 描述                                           |
| -------------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`             | 見範例     | 身份設定列表                                   |
| `gitIdSwitcher.defaultIdentity`        | 見範例     | 預設使用的身份 ID                              |
| `gitIdSwitcher.autoSwitchSshKey`       | `true`     | 切換身份時自動切換 SSH 金鑰                    |
| `gitIdSwitcher.showNotifications`      | `true`     | 切換身份時顯示通知                             |
| `gitIdSwitcher.applyToSubmodules`      | `true`     | 將身份傳播到 Git 子模組                        |
| `gitIdSwitcher.submoduleDepth`         | `1`        | 巢狀子模組設定的最大深度（1-5）                |
| `gitIdSwitcher.includeIconInGitConfig` | `false`    | 在 Git config `user.name` 中包含圖示表情符號  |
| `gitIdSwitcher.logging.fileEnabled` | `false` | 啟用稽核日誌（身份切換、SSH 操作等記錄） |
| `gitIdSwitcher.logging.filePath` | `""` | 日誌檔案路徑（如：`~/.git-id-switcher/security.log`）。空白則使用預設位置 |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | 輪換前的最大檔案大小（位元組，1MB-100MB） |
| `gitIdSwitcher.logging.maxFiles` | `5` | 保留的輪換日誌檔案最大數量（1-20） |
| `gitIdSwitcher.logging.level` | `"INFO"` | 日誌等級：`DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`。記錄選定等級及以上 |
| `gitIdSwitcher.commandTimeouts` | `{}` | 每個指令的自訂逾時值（毫秒，1秒-5分鐘）。例：`{"git": 15000, "ssh-add": 10000}` |

#### 關於 `includeIconInGitConfig`

控制設定 `icon` 欄位時的行為：

| 值 | 行為 |
|----|------|
| `false`（預設） | `icon` 僅顯示在編輯器 UI 中。Git config 只寫入 `name` |
| `true` | Git config 寫入 `icon + name`。表情符號會出現在提交歷史中 |

範例：`icon: "👤"`, `name: "陳雨"` 的情況

| includeIconInGitConfig | Git config `user.name` | 提交簽章 |
|------------------------|------------------------|----------|
| `false` | `陳雨` | `陳雨 <email>` |
| `true` | `👤 陳雨` | `👤 陳雨 <email>` |

### 注意: 基本設定（無 SSH）

如果不需要 SSH 金鑰切換（例如，在單一 GitHub 帳戶上使用不同的提交者資訊），可以使用最小設定：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "陳雨",
      "email": "chenyu@personal.example.com",
      "description": "個人專案"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "陳雨",
      "email": "chenyu@company.example.com",
      "description": "工作開發"
    }
  ]
}
```

此設定僅切換 `git config user.name` 和 `user.email`。

---

## 運作原理

### Git 設定層次結構

Git 設定有三個層次，下層的設定會覆蓋上層：

```text
系統 (/etc/gitconfig)
    ↓ 覆蓋
全域 (~/.gitconfig)
    ↓ 覆蓋
本機 (.git/config)  ← 最高優先順序
```

**Git ID Switcher 寫入 `--local`（儲存庫本機）。**

這意味著：

- 身份儲存到每個儲存庫的 `.git/config`
- 每個儲存庫可以維護不同的身份
- 全域設定（`~/.gitconfig`）不會被修改

### 切換身份時

切換身份時，擴充功能按順序執行以下操作：

1. **Git 設定**（始終）: 設定 `git config --local user.name` 和 `user.email`
2. **SSH 金鑰**（如果設定了 `sshKeyPath`）: 從 ssh-agent 移除其他金鑰，加入選定的金鑰
3. **GPG 金鑰**（如果設定了 `gpgKeyId`）: 設定 `git config --local user.signingkey` 並啟用簽署
4. **子模組**（如果啟用）: 將設定傳播到所有子模組（預設：深度 1）

### 子模組傳播的運作原理

本機設定是每個儲存庫獨立的，因此不會自動套用到子模組。
這就是本擴充功能提供子模組傳播功能的原因（詳見「進階: 子模組支援」部分）。

---

## 進階: 子模組支援

對於使用 Git 子模組的複雜儲存庫，身份管理通常很麻煩。如果在子模組中提交，Git 會使用該子模組的本機設定，如果未明確設定，可能會預設使用全域設定（錯誤的電子郵件地址！）。

**Git ID Switcher** 自動偵測子模組並將選定的身份套用到它們。

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: 啟用/停用此功能
- `submoduleDepth`: 套用到多深？
  - `1`: 僅直接子模組（最常見）
  - `2+`: 巢狀子模組（子模組中的子模組）

這確保無論您是在主儲存庫還是在 vendor 函式庫中提交，您的身份始終正確。

---

## 疑難排解

### SSH 金鑰沒有切換？

1. 確保 `ssh-agent` 正在執行：

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. 檢查金鑰路徑是否正確：

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. 在 macOS 上，加入到鑰匙圈一次：

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### 推送時身份錯誤？

1. 檢查遠端 URL 是否使用正確的主機別名：

   ```bash
   git remote -v
   # 工作儲存庫應顯示 git@github-work:...
   ```

2. 如需更新：

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG 簽署不運作？

1. 查找您的 GPG 金鑰 ID：

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. 測試簽署：

   ```bash
   echo "test" | gpg --clearsign
   ```

3. 確保身份中的電子郵件地址與 GPG 金鑰的電子郵件地址相符。

### 身份未偵測到？

- 確保您在 Git 儲存庫中
- 檢查 `settings.json` 是否有語法錯誤
- 重新載入 VS Code 視窗（`Cmd+Shift+P` → "重新載入視窗"）

### `name` 欄位出錯？

`name` 欄位中包含以下字元會導致錯誤：

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

如果要包含服務資訊，請使用 `service` 欄位。

```jsonc
// NG
"name": "陳雨 (個人)"

// OK
"name": "陳雨",
"service": "GitHub"
```

### 新設定未顯示？

更新擴充功能後，新的設定項目可能不會出現在設定介面中。

**解決方案：** 完全重新啟動您的電腦。

VS Code 等編輯器會將設定架構快取在記憶體中，「重新載入視窗」或重新安裝擴充功能可能不足以重新整理它。

### 預設值為空？

如果新安裝後範例設定也沒有出現，**Settings Sync** 可能是原因。

如果您之前儲存了空設定，它們可能已同步到雲端，並在新安裝時覆蓋了預設值。

**解決方案：**

1. 在設定介面中找到該設定項目
2. 點擊齒輪圖示 → "重設設定"
3. 與 Settings Sync 同步（這會從雲端刪除舊設定）

---

## 命令

| 命令                            | 描述                 |
| ------------------------------- | -------------------- |
| `Git ID: Select Identity`       | 開啟身份選擇器       |
| `Git ID: Show Current Identity` | 顯示目前身份資訊     |

---

## 貢獻

歡迎貢獻！請查看 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 授權條款

MIT 授權條款 - 請查看 [LICENSE](../../../LICENSE)。

## 致謝

由 [Null;Variant](https://github.com/nullvariant) 建立
