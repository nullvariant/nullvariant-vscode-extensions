# Git ID Switcher

<table>
  <tr>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-identity-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      ワンクリックで複数のGitプロフィールを切り替え。複数のGitHubアカウント、SSHキー、GPG署名を管理し、<b>Gitサブモジュールにも自動的にプロフィールを適用</b>します。
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 <a href="../../../README.md">🇺🇸</a> <b>🇯🇵</b> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> ... <a href="../../LANGUAGES.md">+20 more</a>
    </td>
  </tr>
</table>

![デモ](https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-identity-switcher/docs/i18n/ja/demo.png)

## 機能

- **ワンクリックでプロフィール切り替え**: Git user.nameとuser.emailを瞬時に変更
- **SSHキー管理**: ssh-agentのSSHキーを自動的に切り替え（オプション）
- **GPG署名対応**: コミット署名用のGPGキーを設定（オプション）
- **サブモジュール対応**: Gitサブモジュールにも自動的にプロフィールを伝播
- **ステータスバー統合**: 現在のプロフィールを常に一目で確認
- **リッチなツールチップ**: 説明やSSHホストを含む詳細なプロフィール情報
- **クロスプラットフォーム**: macOS、Linux、Windowsで動作
- **多言語対応**: 17言語をサポート

## 🚀 この拡張機能を作った理由

Gitプロフィール切り替えツールは数多く存在しますが、**Git ID Switcher**は他のツールが見落としがちな複雑な問題を解決します：

1. **サブモジュールの悩み**: サブモジュールを持つリポジトリ（例：Hugoテーマ、ベンダーライブラリ）で作業する際、通常は*各*サブモジュールに対して`git config user.name`を手動で設定する必要があります。この拡張機能は、すべてのアクティブなサブモジュールに再帰的にプロフィールを適用することで、これをエレガントに解決します。
2. **SSH & GPGの処理**: 単に名前を変更するだけでなく、ssh-agent内のSSHキーを入れ替え、GPG署名を設定するため、間違った署名でコミットすることを防ぎます。

## 🌏 多言語への想い

> **私は少数派の存在価値を大切にしています。**
> 少数だからといって切り捨てたくないのです。
> 完璧に翻訳できなくても、少数言語の存在を理解し、敬意を示す意図だけでも感じていただければと思っています。

この拡張機能は、VSCodeがサポートする17言語すべてに対応しています。さらに、READMEドキュメントについては、少数民族の言語やジョーク言語への翻訳にもチャレンジしています。

これはただの「グローバル対応」ではなく、「言語的多様性への敬意」です。そして、言語を超えて、あらゆる場所に住む開発者から世界が良くなるコミットがされていく...そんなインフラになったら嬉しいです。

---

## クイックスタート（最小構成）

最もシンプルな設定は`id`、`name`、`email`のみ必要です。SSHやGPGの設定は不要です。

### ステップ 1: settings.jsonに追加

VS Code設定を開き（`Cmd+,` / `Ctrl+,`）→「Git ID Switcher」を検索 →「settings.jsonで編集」をクリック。

インストール直後は以下のようなサンプルプロフィールが設定されています：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "example",
      "icon": "👤",
      "name": "Your Name",
      "email": "you@example.com",
      "description": "Edit this or add your own identity",
      "sshKeyPath": "",
      "sshHost": "",
      "gpgKeyId": ""
    }
  ]
}
```

これを編集して、あなた自身のプロフィールを設定しましょう。例えば個人用と職場用を追加：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "山田太郎",
      "email": "taro@personal.example.com"
    },
    {
      "id": "work",
      "name": "山田太郎",
      "email": "taro.yamada@company.example.com"
    }
  ]
}
```

### ステップ 2: 使ってみる

1. ステータスバー（右下）のプロフィールアイコンをクリック
2. プロフィールを選択
3. 完了！Git configが切り替わりました。

この基本設定では`git config user.name`と`user.email`を変更するだけです。

---

## オプション: ビジュアルプロフィールを追加

アイコンと説明でプロフィールを認識しやすくしましょう。デフォルトのサンプル設定にはすでに絵文字が含まれています：

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "山田太郎",
      "email": "taro@personal.example.com",
      "description": "個人プロジェクト"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "山田太郎",
      "email": "taro.yamada@company.example.com",
      "description": "会社の開発用"
    }
  ]
}
```

- `icon`: ステータスバーに表示される絵文字
- `description`: ピッカーとツールチップに表示

---

## オプション: SSHキー切り替え

異なるSSHキーを持つ複数のGitHub/GitLabアカウントがある場合：

### ステップ 1: SSHホストエイリアスを設定

`~/.ssh/config`を編集：

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

### ステップ 2: プロフィールにSSH設定を追加

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "山田太郎",
      "email": "taro@personal.example.com",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "name": "山田太郎",
      "email": "taro.yamada@company.example.com",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ]
}
```

- `sshKeyPath`: SSHプライベートキーへのパス（切り替え時にssh-agentに追加）
- `sshHost`: SSH configのHostエイリアス（ツールチップに表示、どのホストを使うか思い出すのに便利）

### SSHホストエイリアスの使い方

`sshHost`を持つプロフィールのリポジトリをクローンする場合：

```bash
# 仕事用プロフィール（github-workエイリアスを使用）
git clone git@github-work:company/repo.git

# 個人用プロフィール（デフォルトのgithub.comを使用）
git clone git@github.com:you/repo.git
```

---

## オプション: GPG署名

GPGでコミットに署名する場合：

### ステップ 1: GPGキーIDを確認

```bash
gpg --list-secret-keys --keyid-format SHORT
```

出力例：

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] 山田太郎 <taro@personal.example.com>
```

キーIDは`ABCD1234`です。

### ステップ 2: プロフィールにGPGキーを追加

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "山田太郎",
      "email": "taro@personal.example.com",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

このプロフィールに切り替えると、拡張機能は以下を設定します：

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## フル設定例: 複数アカウントとSSH + GPG

すべてを組み合わせた完全な例：

### SSH設定 (`~/.ssh/config`)

```ssh-config
# 個人用アカウント（デフォルト）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 仕事用アカウント
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# OSS活動用アカウント
Host github-oss
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### 拡張機能の設定

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "山田太郎",
      "email": "taro@personal.example.com",
      "description": "個人プロジェクト",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "山田太郎",
      "email": "taro.yamada@company.example.com",
      "description": "会社の開発用",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "oss",
      "icon": "🌟",
      "name": "TaroYamada",
      "email": "taro.oss@example.com",
      "description": "オープンソース活動",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "github-oss"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "山田太郎",
      "email": "taro@freelance.example.com",
      "description": "フリーランス案件"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

注意：最後のプロフィール（`freelance`）にはSSHやGPGがありません。Git configのみを切り替えます。

---

## 設定リファレンス

### プロフィールのプロパティ

| プロパティ    | 必須 | 説明                                                     |
| ------------- | ---- | -------------------------------------------------------- |
| `id`          | ✅    | 一意の識別子（例：`"personal"`, `"work"`）                |
| `name`        | ✅    | Git user.name - コミットに表示                           |
| `email`       | ✅    | Git user.email - コミットに表示                          |
| `icon`        |      | ステータスバーに表示される絵文字（例：`"🏠"`）            |
| `description` |      | ピッカーとツールチップに表示される短い説明               |
| `sshKeyPath`  |      | SSHプライベートキーへのパス（例：`"~/.ssh/id_ed25519_work"`） |
| `sshHost`     |      | SSH configのHostエイリアス（例：`"github-work"`）       |
| `gpgKeyId`    |      | コミット署名用のGPGキーID                                |

### グローバル設定

| 設定                              | デフォルト | 説明                                         |
| --------------------------------- | ---------- | -------------------------------------------- |
| `gitIdSwitcher.identities`        | `[]`       | プロフィール設定のリスト                     |
| `gitIdSwitcher.defaultIdentity`   | `""`       | 使用するデフォルトプロフィールのID           |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`     | プロフィール変更時にSSHキーを自動切り替え     |
| `gitIdSwitcher.showNotifications` | `true`     | プロフィール切り替え時に通知を表示           |
| `gitIdSwitcher.applyToSubmodules` | `true`     | Gitサブモジュールにプロフィールを伝播        |
| `gitIdSwitcher.submoduleDepth`    | `1`        | ネストされたサブモジュール設定の最大深度（1-5） |

---

## 仕組み

プロフィールを切り替えると、拡張機能は以下を（順番に）実行します：

1. **Git Config**（常時）: `git config --local user.name`と`user.email`を設定
2. **SSHキー**（`sshKeyPath`設定時）: 他のキーをssh-agentから削除し、選択したキーを追加
3. **GPGキー**（`gpgKeyId`設定時）: `git config --local user.signingkey`を設定し、署名を有効化
4. **サブモジュール**（有効時）: すべてのサブモジュールに設定を伝播（デフォルト：深度1）

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

### SSHキーが切り替わらない？

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

1. GPGキーIDを確認：

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. 署名をテスト：

   ```bash
   echo "test" | gpg --clearsign
   ```

3. プロフィールのメールアドレスがGPGキーのメールアドレスと一致していることを確認

### プロフィールが検出されない？

- Gitリポジトリ内にいることを確認
- `settings.json`に構文エラーがないか確認
- VS Codeウィンドウをリロード（`Cmd+Shift+P` → 「ウィンドウの再読み込み」）

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

MITライセンス - [LICENSE](../../LICENSE)をご覧ください。

## クレジット

[Null;Variant](https://github.com/nullvariant) によって作成
