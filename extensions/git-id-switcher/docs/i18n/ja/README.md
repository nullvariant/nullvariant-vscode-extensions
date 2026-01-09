# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      ワンクリックで複数のGitプロフィールを切り替え。複数のGitHubアカウント、SSH鍵、GPG署名を管理し、<b>Gitサブモジュールにも自動的にプロフィールを適用</b>します。
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/attestations"><img src="https://img.shields.io/badge/SLSA-Level_3-green" alt="SLSA 3"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml/badge.svg" alt="Security"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
      <a href="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions"><img src="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions/graph/badge.svg" alt="codecov"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <br>
      🌐 多言語対応: <a href="../en/README.md">🇺🇸</a> <b>🇯🇵</b> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-ja.png" width="600" alt="デモ">

## 🎯 なぜ Git ID Switcher？

Gitプロフィール切り替えツールは数多く存在しますが、**Git ID Switcher**は他のツールが見落としがちな複雑な問題を解決します：

1. **サブモジュールの悩み**: サブモジュールを持つリポジトリ（例：Hugoテーマ、ベンダーライブラリ）で作業する際、通常は*各*サブモジュールに対して`git config user.name`を手動で設定する必要があります。この拡張機能は、すべてのアクティブなサブモジュールに再帰的にプロフィールを適用することで、これをエレガントに解決します。
2. **SSH & GPGの処理**: 単に名前を変更するだけでなく、ssh-agent内のSSH鍵を入れ替え、GPG署名を設定するため、間違った署名でコミットすることを防ぎます。

## 機能

- **サブモジュール対応**: Gitサブモジュールにも自動的にプロフィールを伝播
- **SSH鍵管理**: ssh-agentのSSH鍵を自動的に切り替え
- **GPG署名対応**: コミット署名用のGPG鍵を設定（オプション）
- **ワンクリックでプロフィール切り替え**: Git user.nameとuser.emailを瞬時に変更
- **ステータスバー統合**: 現在のプロフィールを常に一目で確認
- **リッチなツールチップ**: 説明やSSHホストを含む詳細なプロフィール情報
- **クロスプラットフォーム**: macOS、Linux、Windowsで動作
- **多言語対応**: 17言語をサポート

## 🌏 多言語への想い

> **私は少数派の存在価値を大切にしています。**
> 少数だからといって切り捨てたくないのです。
> 完璧に翻訳できなくても、少数言語の存在を理解し、敬意を示す意図だけでも感じていただければと思っています。

この拡張機能は、VSCodeがサポートする17言語すべてに対応しています。さらに、READMEドキュメントについては、少数民族の言語やジョーク言語への翻訳にもチャレンジしています。

これはただの「グローバル対応」ではなく、「言語的多様性への敬意」です。そして、言語を超えて、あらゆる場所に住む開発者から世界が良くなるコミットがされていく...そんなインフラになったら嬉しいです。

---

## クイックスタート

個人アカウントと会社発行アカウント（Enterprise Managed User）を使い分ける典型的なセットアップです。

### ステップ 1: SSH鍵を準備

まず、アカウントごとにSSH鍵を作成します（すでにある場合はスキップ）：

```bash
# 個人用
ssh-keygen -t ed25519 -C "kaoru@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 仕事用
ssh-keygen -t ed25519 -C "kaoru.takahashi@company.example.com" -f ~/.ssh/id_ed25519_work
```

各キーの**公開鍵**（`.pub`ファイル）をそれぞれのGitHubアカウントに登録してください。

> **注意**: GitHubに登録するのは `id_ed25519_personal.pub`（公開鍵）です。`id_ed25519_personal`（拡張子なし）は秘密鍵なので、絶対に他人と共有したりアップロードしないでください。

### ステップ 2: SSH configを設定

`~/.ssh/config` を編集：

```ssh-config
# 個人用GitHubアカウント（デフォルト）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 仕事用GitHubアカウント
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### ステップ 3: 拡張機能を設定

拡張機能の設定を開き（`Cmd+,` / `Ctrl+,`）→「Git ID Switcher」を検索 →「settings.jsonで編集」をクリック：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "高橋カオル",
      "service": "GitHub",
      "email": "kaoru@personal.example.com",
      "description": "個人プロジェクト",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "高橋カオル",
      "service": "GitHub 会社用",
      "email": "kaoru.takahashi@company.example.com",
      "description": "会社の開発用",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### ステップ 4: 使ってみる

1. ステータスバー（右下）のプロフィールアイコンをクリック
2. プロフィールを選択
3. 完了！Git configとSSH鍵が切り替わりました。

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-ja.png" width="600" alt="Quick Pick">

### SSHホストエイリアスの使い方

リポジトリをクローンする際、プロフィールに対応したホストを使用します：

```bash
# 仕事用プロフィール（github-workエイリアスを使用）
git clone git@github-work:company/repo.git

# 個人用プロフィール（デフォルトのgithub.comを使用）
git clone git@github.com:kaoru/repo.git
```

---

## オプション: GPG署名

GPGでコミットに署名する場合：

### ステップ 1: GPG鍵IDを確認

```bash
gpg --list-secret-keys --keyid-format SHORT
```

出力例：

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] 高橋カオル <kaoru@personal.example.com>
```

キーIDは`ABCD1234`です。

### ステップ 2: プロフィールにGPG鍵を追加

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "高橋カオル",
      "service": "GitHub",
      "email": "kaoru@personal.example.com",
      "description": "個人プロジェクト",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

このプロフィールに切り替えると、拡張機能は以下を設定します：

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## フル設定例: 4アカウントとSSH + GPG

すべてを組み合わせた完全な例：

### SSH設定 (`~/.ssh/config`)

```ssh-config
# 個人用アカウント（デフォルト）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 仕事用アカウント（会社発行のEnterprise Managed User）
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Bitbucket用アカウント
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### 拡張機能の設定

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "高橋カオル",
      "service": "GitHub",
      "email": "kaoru@personal.example.com",
      "description": "個人プロジェクト",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "高橋カオル",
      "service": "GitHub 会社用",
      "email": "kaoru.takahashi@company.example.com",
      "description": "会社の開発用",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "高橋カオル",
      "service": "Bitbucket",
      "email": "kaoru@bitbucket.example.com",
      "description": "Bitbucketプロジェクト",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "高橋カオル",
      "service": "GitLab",
      "email": "kaoru@freelance.example.com",
      "description": "フリーランス案件"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

注意：最後のプロフィール（`freelance`）にはSSHがありません。同じGitHubアカウントで異なるコミット者情報を使い分ける場合など、Git configのみの切り替えも可能です。

---

## 設定リファレンス

### プロフィールのプロパティ

| プロパティ    | 必須 | 説明                                                     |
| ------------- | ---- | -------------------------------------------------------- |
| `id`          | ✅    | 一意の識別子（例：`"personal"`, `"work"`）                |
| `name`        | ✅    | Git user.name - コミットに表示                           |
| `email`       | ✅    | Git user.email - コミットに表示                          |
| `icon`        |      | ステータスバーに表示される絵文字（例：`"🏠"`）。単一の絵文字のみ |
| `service`     |      | サービス名（例：`"GitHub"`, `"GitLab"`）。UI表示に使用   |
| `description` |      | ピッカーとツールチップに表示される短い説明               |
| `sshKeyPath`  |      | SSHプライベートキーへのパス（例：`"~/.ssh/id_ed25519_work"`） |
| `sshHost`     |      | SSH configのHostエイリアス（例：`"github-work"`）       |
| `gpgKeyId`    |      | コミット署名用のGPG鍵ID                                |

#### 表示に関する制限

- **ステータスバー**: 約25文字を超える場合は `...` で省略されます
- **`icon`**: 単一の絵文字（書記素クラスター）のみ使用可能。複数の絵文字や長い文字列は使用できません

### グローバル設定

| 設定                              | デフォルト | 説明                                         |
| --------------------------------- | ---------- | -------------------------------------------- |
| `gitIdSwitcher.identities`        | サンプル参照 | プロフィール設定のリスト                     |
| `gitIdSwitcher.defaultIdentity`   | サンプル参照 | 使用するデフォルトプロフィールのID           |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`     | プロフィール変更時にSSH鍵を自動切り替え     |
| `gitIdSwitcher.showNotifications` | `true`     | プロフィール切り替え時に通知を表示           |
| `gitIdSwitcher.applyToSubmodules` | `true`     | Gitサブモジュールにプロフィールを伝播        |
| `gitIdSwitcher.submoduleDepth`    | `1`        | ネストされたサブモジュール設定の最大深度（1-5） |
| `gitIdSwitcher.includeIconInGitConfig` | `false` | アイコン絵文字をGit configの`user.name`に含めるか |
| `gitIdSwitcher.logging.fileEnabled` | `false` | 監査ログをファイルに保存する（ID切り替え、SSH鍵操作などを記録） |
| `gitIdSwitcher.logging.filePath` | `""` | ログファイルのパス（例：`~/.git-id-switcher/security.log`）。空文字列の場合はデフォルトパスを使用 |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | ローテーション前の最大ファイルサイズ（バイト単位、1MB-100MB） |
| `gitIdSwitcher.logging.maxFiles` | `5` | 保持するローテーションファイルの最大数（1-20） |
| `gitIdSwitcher.logging.level` | `"INFO"` | ログの詳細度（`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`）。選択したレベル以上を記録 |
| `gitIdSwitcher.commandTimeouts` | `{}` | コマンドごとのカスタムタイムアウト値（ミリ秒単位、1秒-5分）。例：`{"git": 15000, "ssh-add": 10000}` |

#### `includeIconInGitConfig` について

`icon` フィールドを設定した場合の動作を制御します：

| 値 | 動作 |
|----|------|
| `false`（デフォルト） | `icon`はエディタUIのみに表示。Git configには`name`のみ書き込み |
| `true` | Git configに`icon + name`を書き込み。コミット履歴にも絵文字が残る |

例：`icon: "👤"`, `name: "高橋カオル"` の場合

| includeIconInGitConfig | Git config `user.name` | コミット署名 |
|------------------------|------------------------|-------------|
| `false` | `高橋カオル` | `高橋カオル <email>` |
| `true` | `👤 高橋カオル` | `👤 高橋カオル <email>` |

### 補足: 基本設定のみ（SSHなし）

SSH鍵切り替えが不要な場合（単一のGitHubアカウントで異なるコミット者情報を使い分けるなど）、最小構成で利用できます：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "高橋カオル",
      "email": "kaoru@personal.example.com",
      "description": "個人プロジェクト"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "高橋カオル",
      "email": "kaoru.takahashi@company.example.com",
      "description": "会社の開発用"
    }
  ]
}
```

この設定では`git config user.name`と`user.email`のみを切り替えます。

---

## 仕組み

### Git configのレイヤー構造

Gitの設定には3つのレイヤーがあり、下位の設定を上位が上書きします：

```text
システム (/etc/gitconfig)
    ↓ 上書き
グローバル (~/.gitconfig)
    ↓ 上書き
ローカル (.git/config)  ← 最優先
```

**Git ID Switcherは `--local`（リポジトリローカル）に書き込みます。**

つまり：

- 各リポジトリの `.git/config` にプロフィールを保存
- リポジトリごとに異なるプロフィールを維持可能
- グローバル設定（`~/.gitconfig`）は変更しない

### プロフィール切り替え時の動作

プロフィールを切り替えると、拡張機能は以下を（順番に）実行します：

1. **Git Config**（常時）: `git config --local user.name`と`user.email`を設定
2. **SSH鍵**（`sshKeyPath`設定時）: 他のキーをssh-agentから削除し、選択したキーを追加
3. **GPG鍵**（`gpgKeyId`設定時）: `git config --local user.signingkey`を設定し、署名を有効化
4. **サブモジュール**（有効時）: すべてのサブモジュールに設定を伝播（デフォルト：深度1）

### サブモジュール伝播の仕組み

ローカル設定はリポジトリ単位のため、サブモジュールには自動的に適用されません。
そのため、本拡張機能はサブモジュールへの伝播機能を提供しています（詳細は「上級者向け: サブモジュールサポート」を参照）。

---

## 上級者向け: サブモジュールサポート

Gitサブモジュールを使用する複雑なリポジトリでは、プロフィール管理がしばしば厄介です。サブモジュール内でコミットすると、Gitはそのサブモジュールのローカル設定を使用しますが、明示的に設定されていない場合はグローバル設定（間違ったメールアドレス！）がデフォルトになる可能性があります。

**Git ID Switcher**は自動的にサブモジュールを検出し、選択したプロフィールを適用します。

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: この機能の有効/無効を切り替え
- `submoduleDepth`: どの深さまで適用するか？
  - `1`: 直接のサブモジュールのみ（最も一般的）
  - `2+`: ネストされたサブモジュール（サブモジュール内のサブモジュール）

これにより、メインリポジトリでコミットしても、ベンダーライブラリでコミットしても、プロフィールは常に正しく設定されます。

---

## トラブルシューティング

### SSH鍵が切り替わらない？

1. `ssh-agent`が実行されていることを確認：

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. キーパスが正しいか確認：

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. macOSでは、一度Keychainに追加：

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### プッシュ時に間違ったプロフィール？

1. リモートURLが正しいホストエイリアスを使用しているか確認：

   ```bash
   git remote -v
   # 仕事用リポジトリなら git@github-work:... となっているべき
   ```

2. 必要に応じて更新：

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG署名が動作しない？

1. GPG鍵IDを確認：

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. 署名をテスト：

   ```bash
   echo "test" | gpg --clearsign
   ```

3. プロフィールのメールアドレスがGPG鍵のメールアドレスと一致していることを確認

### プロフィールが検出されない？

- Gitリポジトリ内にいることを確認
- `settings.json`に構文エラーがないか確認
- VS Codeウィンドウをリロード（`Cmd+Shift+P` → 「ウィンドウの再読み込み」）

### `name` フィールドでエラーが発生する？

`name` フィールドに以下の文字が含まれているとエラーになります：

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

サービス名を含めたい場合は `service` フィールドを使用してください。

```jsonc
// NG
"name": "高橋カオル (個人)"

// OK
"name": "高橋カオル",
"service": "GitHub"
```

### 新しい設定項目が表示されない？

拡張機能を更新しても、新しい設定項目が設定画面に表示されない場合があります。

**解決策:** マシン全体を再起動してください。

VS Codeなどのエディタは設定スキーマをメモリにキャッシュしており、「ウィンドウの再読み込み」や拡張機能の再インストールだけでは更新されないことがあります。

### デフォルト値（identities等）が空っぽ？

新規インストールでもサンプル設定が表示されない場合、**Settings Sync**が原因の可能性があります。

過去に空の設定を保存していた場合、その設定がクラウドに同期され、新規インストール時にデフォルト値を上書きしてしまいます。

**解決策:**

1. 設定画面で該当の設定項目を見つける
2. 歯車アイコン → 「設定をリセット」を選択
3. Settings Syncで同期（古い設定がクラウドから削除される）

---

## コマンド

| コマンド                        | 説明                           |
| ------------------------------- | ------------------------------ |
| `Git ID: Select Identity`       | プロフィールピッカーを開く     |
| `Git ID: Show Current Identity` | 現在のプロフィール情報を表示   |

---

## 貢献

貢献を歓迎します！[CONTRIBUTING.md](../../CONTRIBUTING.md)をご覧ください。

## ライセンス

MITライセンス - [LICENSE](../../../LICENSE)をご覧ください。

## クレジット

[Null;Variant](https://github.com/nullvariant) によって作成
