# Git ID Switcher

> **⚠️ しまくとぅば翻訳について**
>
> この翻訳は実験的なものであり、誤りを含む可能性があります。
> ネイティブスピーカーの方からの修正PRを心よりお待ちしています。
>
> くぬ翻訳や実験的やいびーん、間違いぬあいびーくとぅあいびーん。
> うちなーぐち分かいるちゅーぬ修正PR待っちょーいびーん。

---

## 📚 しまくとぅばについて学ぶ / Learn More About Ryukyuan Languages

> 琉球諸語（しまくとぅば）は、沖縄・奄美諸島で話されてきた言語群です。沖縄語、宮古語、八重山語、与那国語、奄美語などが含まれます。ユネスコにより危機言語に分類されていますが、復興の取り組みが進められています。

- [UNESCO Atlas of World's Languages in Danger (PDF)](https://unesdoc.unesco.org/ark:/48223/pf0000187026)
- [沖縄県 しまくとぅば普及推進計画](https://www.pref.okinawa.jp/shigoto/kankotokusan/1011671/1011741/1011777/1011778.html)
- [しまくとぅばの日 - Wikipedia](https://ja.wikipedia.org/wiki/%E3%81%97%E3%81%BE%E3%81%8F%E3%81%A8%E3%81%85%E3%81%B0%E3%81%AE%E6%97%A5)
- [琉球大学 人文社会学部](https://www.hs.u-ryukyu.ac.jp/)
- [国立国語研究所 危機言語プロジェクト](https://www.ninjal.ac.jp/)

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      ちゅーちゅクリックさーに複数ぬGitプロフィール切り替えーいびーん。複数ぬGitHubアカウント、SSH鍵、GPG署名管理さーに、<b>Gitサブモジュールんかいも自動的にプロフィール適用</b>さびーん。
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <b>🐉</b> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ryu/demo.webp" width="600" alt="デモ" loading="lazy">

## 🎯 ぬーんちくぬ Git ID Switcher?

Gitプロフィール切り替えツールやいっぺーあいびーしが、**Git ID Switcher** や他ぬツールぬ見落としがちな問題解決さびーん:

1. **サブモジュールぬ悩み**: サブモジュール持っちょーるリポジトリ（例：Hugoテーマ、ベンダーライブラリ）んかい仕事すーる時、普通や*うぬうぬ*サブモジュールんかい`git config user.name`手動で設定せんといかんさー。くぬ拡張機能や、全部ぬアクティブなサブモジュールんかい再帰的にプロフィール適用さーに、くぬ問題エレガントに解決さびーん。
2. **SSH & GPG処理**: 単に名前変えーるだけやあらん、ssh-agent内ぬSSH鍵入れ替えーてぃ、GPG署名設定さーに、間違った署名んかいコミットすーるくとぅ防じゃびーん。

## 機能

- **プロフィール管理UI**: settings.json編集せんでぃ、プロフィールぬ追加・編集・削除・並べ替えがUI可能
- **ちゅーちゅクリックさーにプロフィール切り替え**: Git user.nameとぅuser.emailふぃっちー変えーいびーん
- **ステータスバー統合**: 今ぬプロフィールいちなん分かいびーん
- **サブモジュール対応**: Gitサブモジュールんかいも自動的にプロフィール伝播
- **SSH鍵管理**: ssh-agentぬSSH鍵自動的に切り替え
- **GPG署名対応**: コミット署名用ぬGPG鍵設定（オプション）
- **リッチなツールチップ**: 説明やSSHホスト含む詳細なプロフィール情報
- **クロスプラットフォーム**: macOS、Linux、Windowsんかい動ちゃびーん
- **多言語対応**: 17言語サポート

## 🌏 多言語んかいぬ想い

> **わんねー少数派ぬ存在価値大切にしょーいびーん。**
> 少数やしんち切り捨てーぶさーねーやいびらん。
> 完璧に翻訳でーきらんてぃん、少数言語ぬ存在理解さーに、敬意示す気持ちだきん感じてぃくぃみそーれー。

くぬ拡張機能や、VS Codeがサポートすーる17言語全部んかい対応しょーいびーん。さらに、READMEドキュメントについてぃや、少数民族ぬ言語やジョーク言語んかいぬ翻訳んかいもチャレンジしょーいびーん。

くれーただぬ「グローバル対応」やあらん、「言語的多様性んかいぬ敬意」やいびーん。そしてぃ、言語ば超えーてぃ、あらゆる場所んかいいーる開発者から世界がゆーなーるコミットがさりてぃいちゅん...そんなインフラになーたら嬉しいびーん。

---

## クイックスタート

個人アカウントとぅ会社発行アカウント（Enterprise Managed User）使い分けーる典型的なセットアップやいびーん。

### ステップ 1: SSH鍵準備

まず、アカウントぬうぬうぬんかいSSH鍵作てぃくぃみそーれー（あいねーとばしてぃんでぃーびる）:

```bash
# 個人用
ssh-keygen -t ed25519 -C "makoto@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 仕事用
ssh-keygen -t ed25519 -C "makoto.higa@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

うぬうぬぬSSH鍵ぬ**公開鍵**（`.pub`ファイル）ばそれぞれぬGitHubアカウントんかい登録しくぃみそーれー。

> **メモ**: GitHubんかい登録すーるんや`id_ed25519_personal.pub`（公開鍵）やいびーん。`id_ed25519_personal`（拡張子なし）や秘密鍵やくとぅ、絶対ん他人とぅ共有したり、アップロードさんようにしくぃみそーれー。

### ステップ 2: SSH config設定

`~/.ssh/config` 編集:

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

### ステップ 3: 拡張機能設定

インストール直後やサンプルプロフィール用意さりてぃいびーん。
以下ぬガイドんかい沿ってぃ、くれー自分用んかい編集しくぃみそーれー。

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ryu/first-ux.webp" width="600" alt="初回セットアップ手順（13ステップ）：ステータスバーからプロフィール管理開ちゅん、編集・新規作成すーる流れ" loading="lazy">

> **鍵ファイルや送信さらん**: SSH鍵パスぬ設定んかい記録さーるんや鍵ファイルぬパス（場所）だけやいびーん。鍵ファイルぬ中身がアップロードさりたり外部んかい送信さりーるくとぅやあいびらん。

> **GPG署名使う場合**: プロフィール編集画面んかい`gpgKeyId`も設定でぃちゅん。
> GPG鍵IDぬ確認方法や「[トラブルシューティング](#gpg署名動かん)」見てぃくぃみそーれー。

> **ヒント**: settings.jsonから直接設定すーるくとぅもでぃちゅん。
> 拡張機能ぬ設定開ちゅん（`Cmd+,` / `Ctrl+,`）→「Git ID Switcher」検索 →「settings.jsonで編集」クリック。
> JSON形式んかいぬ設定例や「[フル設定例](#フル設定例-5アカウントとぅssh--gpg)」見てぃくぃみそーれー。

---

## フル設定例: 5アカウントとぅSSH + GPG

全部まとめた完全な例やいびーん:

### SSH設定 (`~/.ssh/config`)

```ssh-config
# 個人用アカウント（デフォルト）
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# 仕事用アカウント（会社発行ぬEnterprise Managed User）
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# クライアントA 受託開発（Bitbucket）
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# クライアントB 常駐プロジェクト（Bitbucket）
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS活動（GitLab）
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### 拡張機能設定

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "比嘉真",
      "email": "makoto@personal.example.com",
      "service": "GitHub",
      "icon": "🐉",
      "description": "わん ぬ プロジェクト",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "比嘉真",
      "email": "makoto.higa@techcorp.example.com",
      "service": "GitHub しくち",
      "icon": "🌊",
      "description": "TechCorp めー ぬ しくち",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "比嘉真",
      "email": "makoto@clienta.example.com",
      "service": "Bitbucket",
      "icon": "☀️",
      "description": "ClientA うきー",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "M.比嘉",
      "email": "m.higa@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏝️",
      "description": "ClientB じょーちゅー",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "makoto-dev",
      "email": "makoto.dev@example.com",
      "service": "GitLab",
      "icon": "🦁",
      "description": "OSS てぃーだち",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

メモ: 4番目ぬプロフィール（`client-b`）や省略名、5番目（`oss`）やハンドルネーム使とーいびーん。同じ人やてぃんプロフィールごとぅ違う表示名設定出来やいびーん。

---

## プロフィール管理

ステータスバークリック → 一覧下部ぬ「プロフィール管理」んかい管理画面開ちゅん。
プロフィールぬ追加・編集・削除・並べ替えや全部UIから直接操作でぃちゅん。

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/ryu/identity-management.webp" width="600" alt="プロフィール管理：削除・並べ替えぬ操作ガイド" loading="lazy">

コマンドパレットから`Git ID Switcher: Delete Identity`んかいプロフィール削除すーるくとぅもでぃちゅん。

---

## コマンド

| コマンド                                 | 説明                         |
| ---------------------------------------- | ---------------------------- |
| `Git ID Switcher: Select Identity`       | プロフィールピッカー開ちゅん |
| `Git ID Switcher: Delete Identity`       | プロフィール削除             |
| `Git ID Switcher: Show Current Identity` | 今ぬプロフィール情報表示     |
| `Git ID Switcher: Show Documentation`    | ドキュメント表示             |

---

## 設定リファレンス

### プロフィールぬプロパティ

| プロパティ    | 必須 | 説明                                                               |
| ------------- | ---- | ------------------------------------------------------------------ |
| `id`          | ✅   | 一意ぬ識別子（例：`"personal"`, `"work"`）                         |
| `name`        | ✅   | Git user.name - コミットんかい表示                                 |
| `email`       | ✅   | Git user.email - コミットんかい表示                                |
| `icon`        |      | ステータスバーんかい表示さーる絵文字（例：`"🐉"`）。単一絵文字のみ |
| `service`     |      | サービス名（例：`"GitHub"`, `"GitLab"`）。UI表示んかい使用         |
| `description` |      | ピッカーとぅツールチップんかい表示さーる短い説明                   |
| `sshKeyPath`  |      | SSHプライベートキーぬパス（例：`"~/.ssh/id_ed25519_work"`）        |
| `sshHost`     |      | SSH configぬHostエイリアス（例：`"github-work"`）                  |
| `gpgKeyId`    |      | コミット署名用ぬGPG鍵ID                                            |

#### 表示んかい関すーる制限

- **ステータスバー**: 約25文字超えーる場合や`...`んかい省略さーるん
- **`icon`**: 単一ぬ絵文字（書記素クラスター）のみ使用可能。複数ぬ絵文字や長い文字列や使用でーきらん

### グローバル設定

| 設定                                       | デフォルト   | 説明                                                                                                      |
| ------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | サンプル参照 | プロフィール設定ぬリスト                                                                                  |
| `gitIdSwitcher.defaultIdentity`            | サンプル参照 | 使用すーるデフォルトプロフィールぬID                                                                      |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`       | プロフィール変更時んかいSSH鍵自動切り替え                                                                 |
| `gitIdSwitcher.showNotifications`          | `true`       | プロフィール切り替え時んかい通知表示                                                                      |
| `gitIdSwitcher.applyToSubmodules`          | `true`       | Gitサブモジュールんかいプロフィール伝播                                                                   |
| `gitIdSwitcher.submoduleDepth`             | `1`          | ネストさりたサブモジュール設定ぬ最大深度（1-5）                                                           |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`      | アイコン絵文字ばGit configぬ`user.name`んかい含めーるか                                                   |
| `gitIdSwitcher.logging.fileEnabled`        | `false`      | 監査ログばファイルんかい保存すーる（ID切り替え、SSH鍵操作んかい記録）                                     |
| `gitIdSwitcher.logging.filePath`           | `""`         | ログファイルぬパス（例：`~/.git-id-switcher/security.log`）。空文字列ぬ場合やデフォルトパス使用           |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`   | ローテーション前ぬ最大ファイルサイズ（バイト単位、1MB-100MB）                                             |
| `gitIdSwitcher.logging.maxFiles`           | `5`          | 保持すーるローテーションファイルぬ最大数（1-20）                                                          |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`      | 有効にすーると、ログ内ぬ全部ぬ値ばマスクさびーん（最大プライバシーモード）                                |
| `gitIdSwitcher.logging.level`              | `"INFO"`     | ログぬ詳細度（`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`）。選択したレベル以上ば記録                    |
| `gitIdSwitcher.commandTimeouts`            | `{}`         | コマンドぬうぬうぬぬカスタムタイムアウト値（ミリ秒単位、1秒-5分）。例：`{"git": 15000, "ssh-add": 10000}` |

#### `includeIconInGitConfig`について

`icon`フィールド設定した場合ぬ動作制御さびーん:

| 値                    | 動作                                                                      |
| --------------------- | ------------------------------------------------------------------------- |
| `false`（デフォルト） | `icon`やエディタUIのみんかい表示。Git configんかいや`name`のみ書き込み    |
| `true`                | Git configんかい`icon + name`ば書き込み。コミット履歴んかいも絵文字残いん |

例：`icon: "👤"`, `name: "比嘉真"` ぬ場合

| includeIconInGitConfig | Git config `user.name` | コミット署名        |
| ---------------------- | ---------------------- | ------------------- |
| `false`                | `比嘉真`               | `比嘉真 <email>`    |
| `true`                 | `👤 比嘉真`            | `👤 比嘉真 <email>` |

---

## 仕組み

### Git configぬレイヤー構造

Gitぬ設定んかいや3つぬレイヤーあいん、下位ぬ設定ば上位が上書きさびーん:

```text
システム (/etc/gitconfig)
    ↓ 上書き
グローバル (~/.gitconfig)
    ↓ 上書き
ローカル (.git/config)  ← 最優先
```

**Git ID Switcherや`--local`（リポジトリローカル）んかい書き込みさびーん。**

くぬ意味:

- うぬうぬぬリポジトリぬ`.git/config`んかいプロフィール保存さーるん
- リポジトリぬうぬうぬんかい異なーるプロフィール維持でぃちゅん
- グローバル設定（`~/.gitconfig`）や変更さらん

### プロフィール切り替え時ぬ動作

プロフィール切り替えーる時、拡張機能や以下ば（順番に）実行さびーん:

1. **Git Config**（常時）: `git config --local user.name`とぅ`user.email`ば設定
2. **SSH鍵**（`sshKeyPath`設定時）: 他ぬ鍵ばssh-agentから削除さーに、選択した鍵ば追加
3. **GPG鍵**（`gpgKeyId`設定時）: `git config --local user.signingkey`ば設定さーに、署名ば有効化
4. **サブモジュール**（有効時）: 全部ぬサブモジュールんかい設定ば伝播（デフォルト：深度1）

### サブモジュール伝播ぬ仕組み

ローカル設定やリポジトリ単位やくとぅ、サブモジュールんかいや自動的に適用さらん。
やくとぅ、本拡張機能やサブモジュールんかいぬ伝播機能提供しょーいびーん（詳細や「上級者向け: サブモジュールサポート」見てぃくぃみそーれー）。

### SSH鍵管理ぬ詳細

Git ID Switcherや`ssh-agent`通じてぃSSH鍵管理さびーん:

| 操作     | 実行コマンド           |
| -------- | ---------------------- |
| 鍵ば追加 | `ssh-add <keyPath>`    |
| 鍵ば削除 | `ssh-add -d <keyPath>` |
| 鍵ぬ一覧 | `ssh-add -l`           |

**重要:** くぬ拡張機能や`~/.ssh/config`ば**変更さらん**。SSH configぬ設定や手動んかい行う必要あいびーん（「クイックスタート」ぬステップ2見てぃくぃみそーれー）。

### 既存ぬSSH設定とぅぬ相互作用

あいねーSSH設定あーる場合、Git ID Switcherや以下ぬようんかい動ちゃびーん:

| 設定                                    | Git ID Switcherぬ動作                                |
| --------------------------------------- | ---------------------------------------------------- |
| `~/.ssh/config`んかい`IdentityFile`指定 | 両方が使用可能；`IdentitiesOnly yes`んかい競合防止   |
| 環境変数`GIT_SSH_COMMAND`ば設定         | カスタムSSHコマンド使用；ssh-agentや引き続き動ちゅん |
| `git config core.sshCommand`ば設定      | 上記とぅ同様                                         |
| direnvんかいSSH関連ぬ環境変数設定       | 共存可能；ssh-agentや独立さーに動ちゅん              |

**推奨:** SSH configんかいや常に`IdentitiesOnly yes`設定しくぃみそーれー。くれーにゆてぃ、SSHが複数ぬ鍵試行すーるくとぅ防じゃびーん。

### ぬーんち`IdentitiesOnly yes`?

くぬ設定無い場合、SSHや以下ぬ順序んかい鍵試行すーる可能性あいびーん:

1. ssh-agentんかい読み込まりた鍵（Git ID Switcherが管理）
2. `~/.ssh/config`んかい指定さりた鍵
3. デフォルトぬ鍵（`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`んかい）

くれーにゆてぃ、認証失敗や意図さらん鍵ぬ使用が発生すーる可能性あいびーん。

`IdentitiesOnly yes`設定すーると、SSHや**指定さりた鍵のみ**使用さびーん。くれーにゆてぃ、Git ID Switcherんかい設定した鍵が確実に使用さーるん。

```ssh-config
# 推奨さーる設定
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← くぬ行が重要
```

くぬ設定にゆてぃ、`github-work`ホストんかいぬ接続時んかいや`~/.ssh/id_ed25519_work`のみが使用さーり、他ぬ鍵や試行さらん。

---

## 上級者向け: サブモジュールサポート

Gitサブモジュール使用すーる複雑なリポジトリんかいや、プロフィール管理がしばしば厄介やいびーん。サブモジュール内んかいコミットすーると、Gitやそぬサブモジュールぬローカル設定使用さびーしが、明示的に設定さりてぃいらんちゃーグローバル設定（間違ったメールアドレス！）がデフォルトになーる可能性あいびーん。

**Git ID Switcher**や自動的にサブモジュール検出さーに、選択したプロフィール適用さびーん。

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: くぬ機能ぬ有効/無効切り替え
- `submoduleDepth`: どぬ深さまで適用すーるか？
  - `1`: 直接ぬサブモジュールのみ（最も一般的）
  - `2+`: ネストさりたサブモジュール（サブモジュール内ぬサブモジュール）

くれーにゆてぃ、メインリポジトリんかいコミットしてぃん、ベンダーライブラリんかいコミットしてぃん、プロフィールや常に正しく設定さーるん。

---

## トラブルシューティング

### SSH鍵切り替わらん?

1. `ssh-agent`が実行さりてぃいーる確認:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. 鍵ぬパスが正しいか確認:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. macOSんかいや、一回Keychainんかい追加:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### プッシュ時んかい間違ったプロフィール?

**新規クローン時:**

仕事用リポジトリクローンすーる時や、SSH configんかい設定したホストエイリアス使用さびーん:

```bash
# 仕事用（github-workエイリアス使用）
git clone git@github-work:company/repo.git

# 個人用（デフォルトぬgithub.com使用）
git clone git@github.com:makoto/repo.git
```

**既存リポジトリぬ場合:**

1. リモートURLが正しいホストエイリアス使っちょーる確認:

   ```bash
   git remote -v
   # 仕事用リポジトリなら git@github-work:... となっちょーるべき
   ```

2. 必要んかい応じてぃ更新:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG署名動かん?

1. GPG鍵ID確認:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. 署名テスト:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. プロフィールぬメールアドレスがGPG鍵ぬメールアドレスとぅ一致しちょーる確認

### プロフィール検出さらん?

- Gitリポジトリ内んかいいーる確認
- `settings.json`んかい構文エラー無いか確認
- VS Codeウィンドウリロード（`Cmd+Shift+P` → 「ウィンドウの再読み込み」）

### `name`フィールドんかいエラー発生?

`name`フィールドんかい以下ぬ文字含まりてぃいーるとぅエラーなーいびーん:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

サービス名含めーぶさい場合や`service`フィールド使用しくぃみそーれー。

```jsonc
// ダメ
"name": "比嘉真 (個人)"

// いっぺー
"name": "比嘉真",
"service": "GitHub"
```

### 新しい設定項目表示さらん?

拡張機能更新しても、新しい設定項目が設定画面んかい表示さらん場合あいびーん。

**解決策:** マシン全体リスタートしくぃみそーれー。

VS Codeんかいぬエディタや設定スキーマばメモリんかいキャッシュしちょーり、「ウィンドウの再読み込み」や拡張機能ぬ再インストールだけやぬーらん場合あいびーん。

### デフォルト値（identities等）空っぽ?

新規インストールんかいもサンプル設定表示さらん場合、**Settings Sync**が原因かもしらん。

過去んかい空ぬ設定保存しちょーたら、そぬ設定がクラウドんかい同期さーり、新規インストール時デフォルト値ば上書きしちょーる可能性あいん。

**解決策:**

1. 設定画面んかい該当ぬ設定項目探すん
2. 歯車アイコン → 「設定をリセット」選ぶん
3. Settings Syncんかい同期（古い設定がクラウドから削除さーるん）

---

## 設計哲学

> **「わんねー誰やが?」** — くぬ拡張機能が答えーる唯一ぬ問い

**枯山水アーキテクチャ**んかい設計しちょーいびーん。コアや100行んかい書けーる単純さ。
やくとぅ、残りば品質（テスト90%、ログ、タイムアウト）とぅ
意図的な制約（GitHub API連携なし、トークン管理なし）んかい費やせーるん。

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[設計哲学ぬ全文読みやびーん](../../DESIGN_PHILOSOPHY.md)

---

## 貢献

貢献歓迎さびーん！[CONTRIBUTING.md](../../CONTRIBUTING.md)見てぃくぃみそーれー。

## ライセンス

MITライセンス - [LICENSE](../../../LICENSE)見てぃくぃみそーれー。

## クレジット

[Null;Variant](https://github.com/nullvariant)にゆてぃ作成

---

🌴 **にふぇーでーびる!** 🌴
