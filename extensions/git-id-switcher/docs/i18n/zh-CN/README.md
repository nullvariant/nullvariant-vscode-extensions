# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      一键切换多个 Git 身份。管理多个 GitHub 账户、SSH 密钥、GPG 签名，并<b>自动将身份应用到 Git 子模块</b>。
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <b>🇨🇳</b> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/zh-CN/demo.webp" width="600" alt="演示" loading="lazy">

## 🎯 为什么选择 Git ID Switcher？

虽然有很多 Git 身份切换工具，但 **Git ID Switcher** 解决了其他工具往往忽略的复杂问题：

1. **子模块的困扰**: 在包含子模块的仓库（如 Hugo 主题、vendor 库）中工作时，通常需要为*每个*子模块手动设置 `git config user.name`。本扩展通过递归地将身份应用到所有活动子模块，优雅地解决了这个问题。
2. **SSH 和 GPG 处理**: 它不仅仅是更改名称；它还会在 ssh-agent 中切换 SSH 密钥并配置 GPG 签名，确保您不会使用错误的签名进行提交。

## 功能特性

- **身份管理 UI**: 无需编辑 settings.json，即可添加、编辑、删除和重新排序身份
- **一键切换身份**: 即时更改 Git user.name 和 user.email
- **状态栏集成**: 随时一目了然地查看当前身份
- **同步检查**: 实时检测身份配置与 git config 之间的不匹配，并在状态栏中发出警告
- **子模块支持**: 自动将身份传播到 Git 子模块
- **SSH 密钥管理**: 自动在 ssh-agent 中切换 SSH 密钥
- **GPG 签名支持**: 配置用于提交签名的 GPG 密钥（可选）
- **丰富的工具提示**: 包含描述和 SSH 主机的详细身份信息
- **跨平台**: 支持 macOS、Linux 和 Windows
- **多语言**: 支持 17 种语言

## 🌏 关于多语言支持的想法

> **我重视少数群体的存在价值。**
> 我不想仅仅因为他们人数少就将其抛弃。
> 即使翻译不完美，我也希望您能感受到我们理解和尊重少数语言的意图。

本扩展支持 VS Code 所支持的全部 17 种语言。此外，对于 README 文档，我们还在尝试翻译成少数民族语言甚至趣味语言。

这不仅仅是"全球化支持"，而是"对语言多样性的尊重"。我希望这能成为一个基础设施，让来自世界各地的开发者跨越语言障碍，提交让世界变得更美好的代码。

---

## 快速开始

管理个人账户和公司发行账户（企业托管用户）的典型设置。

### 步骤 1: 准备 SSH 密钥

首先，为每个账户创建 SSH 密钥（如果已有则跳过）：

```bash
# 个人账户
ssh-keygen -t ed25519 -C "zhangchen@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 工作账户
ssh-keygen -t ed25519 -C "zhangchen@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

将每个密钥的**公钥**（`.pub` 文件）注册到相应的 GitHub 账户。

> **注意**: 注册到 GitHub 的是 `id_ed25519_personal.pub`（公钥）。`id_ed25519_personal`（无扩展名）是私钥 - 切勿与他人分享或上传到任何地方。

### 步骤 2: 配置 SSH

编辑 `~/.ssh/config`：

```ssh-config
# 个人 GitHub 账户（默认）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 工作 GitHub 账户
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### 步骤 3: 配置扩展

安装后会立即提供示例身份配置。
按照以下指南，将其编辑为您自己的配置。

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/zh-CN/first-ux.webp" width="600" alt="初始设置步骤（13 步）：从状态栏打开身份管理，进行编辑和新建" loading="lazy">

> **密钥文件不会被发送**: 设置 SSH 密钥路径时，只记录密钥文件的路径（位置）。密钥文件的内容永远不会被上传或发送到外部。

> **如果使用 GPG 签名**: 您也可以在身份编辑界面设置 `gpgKeyId`。
> 有关如何查找 GPG 密钥 ID，请参阅"[故障排除](#gpg-签名不工作)"。

> **提示**: 您也可以直接从 settings.json 进行配置。
> 打开扩展设置（`Cmd+,` / `Ctrl+,`）→ 搜索 "Git ID Switcher" → 点击 "在 settings.json 中编辑"。
> JSON 配置示例请参阅"[完整示例](#完整示例-5-个账户与-ssh--gpg)"。

---

## 完整示例: 5 个账户与 SSH + GPG

结合所有功能的完整示例：

### SSH 配置 (`~/.ssh/config`)

```ssh-config
# 个人账户（默认）
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 工作账户（公司发行的企业托管用户）
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# 客户A 外包项目（Bitbucket）
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# 客户B 驻场项目（Bitbucket）
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS 贡献（GitLab）
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### 扩展设置

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "张晨",
      "email": "zhangchen@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "个人项目",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "张晨",
      "email": "zhangchen@techcorp.example.com",
      "service": "GitHub 公司",
      "icon": "💼",
      "description": "TechCorp 主业",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "张晨",
      "email": "zhangchen@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA 外包项目",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "C.Zhang",
      "email": "c.zhang@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB 驻场项目",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "zhangchen-dev",
      "email": "zhangchen.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "开源贡献",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

注意：第4个身份（`client-b`）使用了缩写名称，第5个（`oss`）使用了开发者昵称。同一个人可以为每个身份设置不同的显示名称。

---

## 身份管理

点击状态栏 → 在列表底部选择"身份管理"打开管理界面。
您可以直接通过 UI 添加、编辑、删除和重新排序身份。

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/zh-CN/identity-management.webp" width="600" alt="身份管理：删除和重新排序操作指南" loading="lazy">

您也可以通过命令面板使用 `Git ID Switcher: Delete Identity` 删除身份。

---

## 命令

| 命令                                     | 描述             |
| ---------------------------------------- | ---------------- |
| `Git ID Switcher: Select Identity`       | 打开身份选择器   |
| `Git ID Switcher: Delete Identity`       | 删除身份         |
| `Git ID Switcher: Show Current Identity` | 显示当前身份信息 |
| `Git ID Switcher: Show Documentation`    | 显示文档         |

---

## 配置参考

### 身份属性

| 属性          | 必需 | 描述                                                |
| ------------- | ---- | --------------------------------------------------- |
| `id`          | ✅   | 唯一标识符（如 `"personal"`、`"work"`）             |
| `name`        | ✅   | Git user.name - 显示在提交中                        |
| `email`       | ✅   | Git user.email - 显示在提交中                       |
| `icon`        |      | 状态栏显示的表情符号（如 `"🏠"`）。仅限单个表情符号 |
| `service`     |      | 服务名称（如 `"GitHub"`、`"GitLab"`）。用于 UI 显示 |
| `description` |      | 在选择器和工具提示中显示的简短描述                  |
| `sshKeyPath`  |      | SSH 私钥路径（如 `"~/.ssh/id_ed25519_work"`）       |
| `sshHost`     |      | SSH 配置主机别名（如 `"github-work"`）              |
| `gpgKeyId`    |      | 用于提交签名的 GPG 密钥 ID                          |

#### 显示限制

- **状态栏**: 超过约 25 个字符的文本将用 `...` 截断
- **`icon`**: 仅允许单个表情符号（字素簇）。不支持多个表情符号或长字符串

### 全局设置

| 设置                                       | 默认值     | 描述                                                                                |
| ------------------------------------------ | ---------- | ----------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | 见示例     | 身份配置列表                                                                        |
| `gitIdSwitcher.defaultIdentity`            | 见示例     | 默认使用的身份 ID                                                                   |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | 切换身份时自动切换 SSH 密钥                                                         |
| `gitIdSwitcher.showNotifications`          | `true`     | 切换身份时显示通知                                                                  |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | 将身份传播到 Git 子模块                                                             |
| `gitIdSwitcher.submoduleDepth`             | `1`        | 嵌套子模块配置的最大深度（1-5）                                                     |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | 在 Git config `user.name` 中包含图标表情符号                                        |
| `gitIdSwitcher.syncCheck.enabled`          | `true`     | 检查所选身份配置是否与实际 git config 一致                                          |
| `gitIdSwitcher.syncCheck.onFocusReturn`    | `true`     | 编辑器窗口重新获得焦点时运行同步检查                                                |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | 将审计日志保存到文件（记录身份切换、SSH 密钥操作等）                                |
| `gitIdSwitcher.logging.filePath`           | `""`       | 日志文件路径（如 `~/.git-id-switcher/security.log`）。空字符串使用默认路径          |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | 轮换前的最大文件大小（字节，1MB-100MB）                                             |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | 保留的轮换日志文件最大数量（1-20）                                                  |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | 启用时，日志中的所有值都会被掩码（最大隐私模式）                                    |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | 日志详细程度（`DEBUG`、`INFO`、`WARN`、`ERROR`、`SECURITY`）。记录选定级别及以上    |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | 每个命令的自定义超时值（毫秒，1 秒-5 分钟）。例：`{"git": 15000, "ssh-add": 10000}` |

#### 关于 `includeIconInGitConfig`

控制设置 `icon` 字段时的行为：

| 值              | 行为                                                      |
| --------------- | --------------------------------------------------------- |
| `false`（默认） | `icon` 仅显示在编辑器 UI 中。Git config 只写入 `name`     |
| `true`          | Git config 写入 `icon + name`。表情符号会出现在提交历史中 |

示例：`icon: "👤"`、`name: "张晨"` 的情况

| includeIconInGitConfig | Git config `user.name` | 提交签名          |
| ---------------------- | ---------------------- | ----------------- |
| `false`                | `张晨`                 | `张晨 <email>`    |
| `true`                 | `👤 张晨`              | `👤 张晨 <email>` |

---

## 工作原理

### Git 配置层次结构

Git 配置有三个层次，下层的设置会覆盖上层：

```text
系统 (/etc/gitconfig)
    ↓ 覆盖
全局 (~/.gitconfig)
    ↓ 覆盖
本地 (.git/config)  ← 最高优先级
```

**Git ID Switcher 写入 `--local`（仓库本地）。**

这意味着：

- 身份保存到每个仓库的 `.git/config`
- 每个仓库可以维护不同的身份
- 全局设置（`~/.gitconfig`）不会被修改

### 切换身份时

切换身份时，扩展按顺序执行以下操作：

1. **Git 配置**（始终）: 设置 `git config --local user.name` 和 `user.email`
2. **SSH 密钥**（如果设置了 `sshKeyPath`）: 从 ssh-agent 移除其他密钥，添加选定的密钥
3. **GPG 密钥**（如果设置了 `gpgKeyId`）: 设置 `git config --local user.signingkey` 并启用签名
4. **子模块**（如果启用）: 将配置传播到所有子模块（默认：深度 1）
5. **同步检查**: 验证所应用的身份配置是否与实际 git config 一致

### 同步检查

将所选身份配置与实际的 `git config --local` 值（`user.name`、`user.email`、`user.signingkey`）进行比较，当检测到不匹配时在状态栏中显示警告。

**检查运行时机：**

- 应用身份配置后立即执行
- 工作区文件夹变更时
- 配置变更时
- 编辑器窗口重新获得焦点时（500ms 防抖）

**检测到不匹配时：**

- 状态栏显示带有警告背景色的 ⚠️ 图标
- 工具提示显示不匹配字段的表格（字段、预期值、实际值）
- 点击状态栏会显示解决方案选项：
  - **重新应用身份配置** — 将当前身份配置重新应用到 git config
  - **选择其他身份配置** — 打开身份选择器
  - **忽略** — 在下次检查前暂时忽略警告

**禁用方式：**

将 `gitIdSwitcher.syncCheck.enabled` 设为 `false` 可禁用所有同步检查。
若仅禁用焦点恢复检查，将 `gitIdSwitcher.syncCheck.onFocusReturn` 设为 `false`。

### 子模块传播的工作原理

本地设置是每个仓库独立的，因此不会自动应用到子模块。
这就是本扩展提供子模块传播功能的原因（详见"高级：子模块支持"部分）。

### SSH 密钥管理详情

Git ID Switcher 通过 `ssh-agent` 管理 SSH 密钥：

| 操作     | 执行命令               |
| -------- | ---------------------- |
| 添加密钥 | `ssh-add <keyPath>`    |
| 移除密钥 | `ssh-add -d <keyPath>` |
| 列出密钥 | `ssh-add -l`           |

**重要:** 此扩展**不会**修改 `~/.ssh/config`。SSH 配置需要手动完成（参见"快速开始"的步骤 2）。

### 与现有 SSH 配置的交互

如果您已有 SSH 配置，Git ID Switcher 会与其协同工作：

| 您的设置                              | Git ID Switcher 的行为                           |
| ------------------------------------- | ------------------------------------------------ |
| `~/.ssh/config` 中指定 `IdentityFile` | 两者都可使用；使用 `IdentitiesOnly yes` 防止冲突 |
| 环境变量 `GIT_SSH_COMMAND`            | 使用您的自定义 SSH 命令；ssh-agent 仍然有效      |
| `git config core.sshCommand`          | 同上                                             |
| direnv 设置 SSH 相关环境变量          | 可以共存；ssh-agent 独立运行                     |

**推荐:** 始终在 SSH 配置中使用 `IdentitiesOnly yes`。这可以防止 SSH 尝试多个密钥。

### 为什么需要 `IdentitiesOnly yes`？

如果没有此设置，SSH 可能会按以下顺序尝试密钥：

1. ssh-agent 中加载的密钥（由 Git ID Switcher 管理）
2. `~/.ssh/config` 中指定的密钥
3. 默认密钥（`~/.ssh/id_rsa`、`~/.ssh/id_ed25519` 等）

这可能导致身份验证失败或使用非预期的密钥。

使用 `IdentitiesOnly yes` 后，SSH 将**仅使用指定的密钥**。这确保了 Git ID Switcher 配置的密钥被可靠地使用。

```ssh-config
# 推荐的配置
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← 这一行很重要
```

通过此配置，连接到 `github-work` 主机时将仅使用 `~/.ssh/id_ed25519_work`，不会尝试其他密钥。

---

## 高级：子模块支持

对于使用 Git 子模块的复杂仓库，身份管理通常很麻烦。如果在子模块中提交，Git 会使用该子模块的本地配置，如果未明确设置，可能会默认使用全局配置（错误的邮箱地址！）。

**Git ID Switcher** 自动检测子模块并将选定的身份应用到它们。

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: 启用/禁用此功能
- `submoduleDepth`: 应用到多深？
  - `1`: 仅直接子模块（最常见）
  - `2+`: 嵌套子模块（子模块中的子模块）

这确保无论您是在主仓库还是在 vendor 库中提交，您的身份始终正确。

---

## 故障排除

### SSH 密钥没有切换？

1. 确保 `ssh-agent` 正在运行：

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. 检查密钥路径是否正确：

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. 在 macOS 上，添加到钥匙串一次：

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### 推送时身份错误？

**新克隆时:**

克隆工作仓库时，使用 SSH 配置中设置的主机别名：

```bash
# 工作身份（使用 github-work 别名）
git clone git@github-work:company/repo.git

# 个人身份（使用默认的 github.com）
git clone git@github.com:yourname/repo.git
```

**对于现有仓库:**

1. 检查远程 URL 是否使用正确的主机别名：

   ```bash
   git remote -v
   # 工作仓库应显示 git@github-work:...
   ```

2. 如需更新：

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG 签名不工作？

1. 查找您的 GPG 密钥 ID：

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. 测试签名：

   ```bash
   echo "test" | gpg --clearsign
   ```

3. 确保身份中的邮箱地址与 GPG 密钥的邮箱地址匹配。

### 身份未检测到？

- 确保您在 Git 仓库中
- 检查 `settings.json` 是否有语法错误
- 重新加载 VS Code 窗口（`Cmd+Shift+P` → "重新加载窗口"）

### `name` 字段出错？

`name` 字段中包含以下字符会导致错误：

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

如果要包含服务信息，请使用 `service` 字段。

```jsonc
// 错误
"name": "张晨 (个人)"

// 正确
"name": "张晨",
"service": "GitHub"
```

### 新设置未显示？

更新扩展后，新的设置项可能不会出现在设置界面中。

**解决方案：** 完全重启您的电脑。

VS Code 等编辑器会将设置架构缓存在内存中，"重新加载窗口"或重新安装扩展可能不足以刷新它。

### 默认值（identities 等）为空？

如果新安装后示例设置也没有出现，**Settings Sync** 可能是原因。

如果您之前保存了空设置，它们可能已同步到云端，并在新安装时覆盖了默认值。

**解决方案：**

1. 在设置界面中找到该设置项
2. 点击齿轮图标 → "重置设置"
3. 与 Settings Sync 同步（这会从云端删除旧设置）

---

## 设计理念

> **"我是谁？"** — 这是本扩展唯一回答的问题

基于**枯山水架构**构建：简单的核心（100 行），
被刻意的质量（90% 覆盖率、日志、超时处理）
和有意的约束（无 GitHub API、无令牌管理）所包围。

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[阅读完整理念](../../DESIGN_PHILOSOPHY.md)

---

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 许可证

MIT 许可证 - 请查看 [LICENSE](../../../LICENSE)。

## 致谢

由 [Null;Variant](https://github.com/nullvariant) 创建
