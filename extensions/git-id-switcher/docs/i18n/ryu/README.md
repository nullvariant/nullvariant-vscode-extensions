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

- [UNESCO Atlas of World's Languages in Danger](https://en.wal.unesco.org/)
- [沖縄県 しまくとぅば普及推進](https://www.pref.okinawa.jp/site/bunka-sports/bunka/shinko/simakutuba/index.html)
- [しまくとぅばの日（9月18日）](https://www.pref.okinawa.jp/site/bunka-sports/bunka/shinko/simakutuba/simakutubaday.html)
- [琉球大学 琉球語研究](https://rlang.lib.u-ryukyu.ac.jp/)
- [国立国語研究所 危機言語プロジェクト](https://www.ninjal.ac.jp/)

---

<table>
  <tr>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      ちゅーちゅクリックさーに Git ID 変えーいびーん。GitHub アカウント、SSH キー、GPG 署名、<b>Git Submodule んかい自動的にID適用</b>さびーん。
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 くとぅば: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> ... <a href="../../LANGUAGES.md">+20</a>
    </td>
  </tr>
</table>

<br>

<img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/docs/demo.png" width="600" alt="Demo">

## 機能 (Features)

- **ちゅーちゅクリックさーにID切り替え**: Git user.name とぅ user.email ふぃっちー変えーいびーん
- **SSHキー管理**: ssh-agentぬSSHキー自動的に切り替え
- **GPG署名対応**: コミット署名用ぬGPGキー設定（オプション）
- **サブモジュール対応**: Gitサブモジュールんかいも自動的にID適用
- **ステータスバー**: 今ぬIDいちなん分かいびーん
- **リッチなツールチップ**: IDぬ詳細情報
- **クロスプラットフォーム**: macOS、Linux、Windowsんかい動ちゃびーん
- **多言語対応**: 17言語サポート

## 🚀 ぬーんちくぬ Extension 作たがやー?

Git ID 切り替えツールやいっぺーあいびーしが、**Git ID Switcher** や他ぬツールぬ見落としがちな問題解決さびーん:

1. **サブモジュールぬ悩み**: サブモジュール持っちょーるリポジトリ（例：Hugoテーマ、ベンダーライブラリ）んかい仕事すーる時、普通や*うぬうぬ*サブモジュールんかい`git config user.name`手動で設定せんといかんさー。くぬ拡張機能や、全部ぬサブモジュールんかいID適用さーに、くぬ問題解決さびーん。
2. **SSH & GPG**: 名前変えーるだけやあらん、ssh-agentぬSSHキー入れ替えーてぃ、GPG署名設定さーに、間違った署名んかいコミットすーるくとぅ防じゃびーん。

## 🌏 多言語んかいぬ想い

> **わんねー少数派ぬ存在価値大切にしょーいびーん。**
> 少数やしんち切り捨てーぶさーねーやいびらん。
> 完璧に翻訳でーきらんてぃん、少数言語ぬ存在理解さーに、敬意示す気持ちだきん感じてぃくぃみそーれー。

くぬ拡張機能や、VSCodeがサポートすーる17言語全部んかい対応しょーいびーん。さらに、READMEドキュメントについてぃや、少数民族ぬ言語やジョーク言語んかいぬ翻訳んかいもチャレンジしょーいびーん。

くれーただぬ「グローバル対応」やあらん、「言語的多様性んかいぬ敬意」やいびーん。

---

## クイックスタート

### ステップ 1: SSHキー準備

```bash
# 個人用
ssh-keygen -t ed25519 -C "tarou@personal.example.com" -f ~/.ssh/id_ed25519_personal

# 仕事用
ssh-keygen -t ed25519 -C "tarou@company.example.com" -f ~/.ssh/id_ed25519_work
```

### ステップ 2: SSH config 設定

`~/.ssh/config` 編集:

```ssh-config
# 個人用アカウント
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
```

### ステップ 3: 拡張機能設定

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "比嘉太郎",
      "email": "tarou@personal.example.com",
      "description": "個人プロジェクト",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "比嘉太郎",
      "email": "tarou@company.example.com",
      "description": "会社ぬ仕事",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### ステップ 4: 使てぃみーん!

1. ステータスバー（右下）ぬIDアイコンクリック
2. ID選ぶん
3. 終わい! Git configとぅSSHキー切り替わたん。

---

## コマンド

| コマンド                        | 説明                           |
| ------------------------------- | ------------------------------ |
| `Git ID: Select Identity`       | IDピッカー開ちゅん             |
| `Git ID: Show Current Identity` | 今ぬID情報表示                 |

---

## 貢献

[CONTRIBUTING.md](../../CONTRIBUTING.md) 見てぃくぃみそーれー。

## ライセンス

MIT License - [LICENSE](../../LICENSE) 見てぃくぃみそーれー。

## クレジット

[Null;Variant](https://github.com/nullvariant) が作たん

---

🌴 **にふぇーでーびる!** 🌴
