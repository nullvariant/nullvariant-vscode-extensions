# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/git-id-switcher/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      一键切换多个Git身份。管理多个GitHub账户、SSH密钥、GPG签名，并<b>自动将身份应用到Git子模块</b>。
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 多语言支持: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <b>🇨🇳</b> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/git-id-switcher/demo-zh-CN.png" width="600" alt="演示">

## 🎯 为什么选择 Git ID Switcher？

虽然有很多 Git 身份切换工具，但 **Git ID Switcher** 解决了其他工具往往忽略的复杂问题：

1. **子模块的困扰**: 在包含子模块的仓库（如 Hugo 主题、vendor 库）中工作时，通常需要为*每个*子模块手动设置 `git config user.name`。本扩展通过递归地将身份应用到所有活动子模块，优雅地解决了这个问题。
2. **SSH 和 GPG 处理**: 它不仅仅是更改名称；它还会在 ssh-agent 中切换 SSH 密钥并配置 GPG 签名，确保您不会使用错误的签名进行提交。

## 功能特性

- **子模块支持**: 自动将身份传播到 Git 子模块
- **SSH密钥管理**: 自动在 ssh-agent 中切换 SSH 密钥
- **GPG签名支持**: 配置用于提交签名的 GPG 密钥（可选）
- **一键切换身份**: 即时更改 Git user.name 和 user.email
- **状态栏集成**: 随时一目了然地查看当前身份
- **丰富的工具提示**: 包含描述和 SSH 主机的详细身份信息
- **跨平台**: 支持 macOS、Linux 和 Windows
- **多语言**: 支持17种语言

## 🌏 关于多语言支持的想法

> **我重视少数群体的存在价值。**
> 我不想仅仅因为他们人数少就将其抛弃。
> 即使翻译不完美，我也希望您能感受到我们理解和尊重少数语言的意图。

本扩展支持 VSCode 所支持的全部17种语言。此外，对于 README 文档，我们还在尝试翻译成少数民族语言甚至趣味语言。

这不仅仅是"全球化支持"，而是"对语言多样性的尊重"。我希望这能成为一个基础设施，让来自世界各地的开发者跨越语言障碍，提交让世界变得更美好的代码。

---

## 快速开始

管理个人账户和公司发行账户（企业托管用户）的典型设置。

### 步骤 1: 准备 SSH 密钥

首先，为每个账户创建 SSH 密钥（如果已有则跳过）：

```bash
# 个人账户
ssh-keygen -t ed25519 -C "zhangwei@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 工作账户
ssh-keygen -t ed25519 -C "zhangwei@company.example.com" -f ~/.ssh/id_ed25519_work
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

打开扩展设置（`Cmd+,` / `Ctrl+,`）→ 搜索 "Git ID Switcher" → 点击 "在 settings.json 中编辑"：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "张伟",
      "service": "GitHub",
      "email": "zhangwei@personal.example.com",
      "description": "个人项目",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "张伟",
      "service": "GitHub 公司",
      "email": "zhangwei@company.example.com",
      "description": "公司开发（企业托管用户）",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### 步骤 4: 开始使用

1. 点击状态栏（右下角）的身份图标
2. 选择一个身份
3. 完成！Git 配置和 SSH 密钥已切换。

### 使用 SSH 主机别名

克隆仓库时，使用与您的身份对应的主机：

```bash
# 工作身份（使用 github-work 别名）
git clone git@github-work:company/repo.git

# 个人身份（使用默认的 github.com）
git clone git@github.com:zhangwei/repo.git
```

---

## 可选: GPG 签名

如果您使用 GPG 签名提交：

### 步骤 1: 查找您的 GPG 密钥 ID

```bash
gpg --list-secret-keys --keyid-format SHORT
```

输出示例：

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] 张伟 <zhangwei@personal.example.com>
```

密钥 ID 是 `ABCD1234`。

### 步骤 2: 将 GPG 密钥添加到身份

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "张伟",
      "service": "GitHub",
      "email": "zhangwei@personal.example.com",
      "description": "个人项目",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

切换到此身份时，扩展会设置：

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## 完整示例: 4个账户 + SSH + GPG

结合所有功能的完整示例：

### SSH 配置 (`~/.ssh/config`)

```ssh-config
# 个人账户（默认）
Host github.com
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

# Bitbucket 账户
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### 扩展设置

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "张伟",
      "service": "GitHub",
      "email": "zhangwei@personal.example.com",
      "description": "个人项目",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "张伟",
      "service": "GitHub 公司",
      "email": "zhangwei@company.example.com",
      "description": "公司开发（企业托管用户）",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "张伟",
      "service": "Bitbucket",
      "email": "zhangwei@bitbucket.example.com",
      "description": "Bitbucket 项目",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "张伟",
      "service": "GitLab",
      "email": "zhangwei@freelance.example.com",
      "description": "自由职业项目"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

注意：最后一个身份（`freelance`）没有 SSH — 它只切换 Git 配置。这在使用同一个 GitHub 账户但需要不同提交者信息时很有用。

---

## 配置参考

### 身份属性

| 属性          | 必需 | 描述                                                   |
| ------------- | ---- | ------------------------------------------------------ |
| `id`          | ✅   | 唯一标识符（如 `"work"`, `"personal"`）                |
| `name`        | ✅   | Git user.name - 显示在提交中                           |
| `email`       | ✅   | Git user.email - 显示在提交中                          |
| `icon`        |      | 状态栏显示的表情符号（如 `"💼"`）。仅限单个表情符号    |
| `service`     |      | 服务名称（如 `"GitHub"`, `"GitLab"`）。用于 UI 显示    |
| `description` |      | 在选择器和工具提示中显示的简短描述                     |
| `sshKeyPath`  |      | SSH 私钥路径（如 `"~/.ssh/id_ed25519_work"`）          |
| `sshHost`     |      | SSH 配置主机别名（如 `"github-work"`）                 |
| `gpgKeyId`    |      | 用于提交签名的 GPG 密钥 ID                             |

#### 显示限制

- **状态栏**: 超过约25个字符的文本将用 `...` 截断
- **`icon`**: 仅允许单个表情符号（字素簇）。不支持多个表情符号或长字符串

### 全局设置

| 设置                                   | 默认值     | 描述                                           |
| -------------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`             | 见示例     | 身份配置列表                                   |
| `gitIdSwitcher.defaultIdentity`        | 见示例     | 默认使用的身份 ID                              |
| `gitIdSwitcher.autoSwitchSshKey`       | `true`     | 切换身份时自动切换 SSH 密钥                    |
| `gitIdSwitcher.showNotifications`      | `true`     | 切换身份时显示通知                             |
| `gitIdSwitcher.applyToSubmodules`      | `true`     | 将身份传播到 Git 子模块                        |
| `gitIdSwitcher.submoduleDepth`         | `1`        | 嵌套子模块配置的最大深度（1-5）                |
| `gitIdSwitcher.includeIconInGitConfig` | `false`    | 在 Git config `user.name` 中包含图标表情符号  |

#### 关于 `includeIconInGitConfig`

控制设置 `icon` 字段时的行为：

| 值 | 行为 |
|----|------|
| `false`（默认） | `icon` 仅显示在编辑器 UI 中。Git config 只写入 `name` |
| `true` | Git config 写入 `icon + name`。表情符号会出现在提交历史中 |

示例：`icon: "👤"`, `name: "张伟"` 的情况

| includeIconInGitConfig | Git config `user.name` | 提交签名 |
|------------------------|------------------------|----------|
| `false` | `张伟` | `张伟 <email>` |
| `true` | `👤 张伟` | `👤 张伟 <email>` |

### 注意: 基本设置（无 SSH）

如果不需要 SSH 密钥切换（例如，在单个 GitHub 账户上使用不同的提交者信息），可以使用最小配置：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "张伟",
      "email": "zhangwei@personal.example.com",
      "description": "个人项目"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "张伟",
      "email": "zhangwei@company.example.com",
      "description": "工作开发"
    }
  ]
}
```

此设置仅切换 `git config user.name` 和 `user.email`。

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

### 子模块传播的工作原理

本地设置是每个仓库独立的，因此不会自动应用到子模块。
这就是本扩展提供子模块传播功能的原因（详见"高级: 子模块支持"部分）。

---

## 高级: 子模块支持

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
// NG
"name": "张伟 (个人)"

// OK
"name": "张伟",
"service": "GitHub"
```

### 新设置未显示？

更新扩展后，新的设置项可能不会出现在设置界面中。

**解决方案：** 完全重启您的电脑。

VS Code 等编辑器会将设置架构缓存在内存中，"重新加载窗口"或重新安装扩展可能不足以刷新它。

### 默认值为空？

如果新安装后示例设置也没有出现，**Settings Sync** 可能是原因。

如果您之前保存了空设置，它们可能已同步到云端，并在新安装时覆盖了默认值。

**解决方案：**

1. 在设置界面中找到该设置项
2. 点击齿轮图标 → "重置设置"
3. 与 Settings Sync 同步（这会从云端删除旧设置）

---

## 命令

| 命令                            | 描述                 |
| ------------------------------- | -------------------- |
| `Git ID: Select Identity`       | 打开身份选择器       |
| `Git ID: Show Current Identity` | 显示当前身份信息     |

---

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 许可证

MIT 许可证 - 请查看 [LICENSE](../../../LICENSE)。

## 致谢

由 [Null;Variant](https://github.com/nullvariant) 创建
