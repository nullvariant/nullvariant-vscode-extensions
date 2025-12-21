# Git ID Switcher 🎭

> *"To switch, or not to switch—that is the question."*
> — A Developer, pondering their Git identity

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Switcheth betwixt thy multiple Git identities with but a single click. Manageth multiple GitHub accounts, SSH keys, GPG signing, and <b>automatically applyeth thine identity unto Git Submodules</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Tongues: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> ... <a href="../../LANGUAGES.md">+20 more</a>
    </td>
  </tr>
</table>

<br>

<img src="demo.png" width="600" alt="Demo">

## Features Most Noble

- **One-Click Identity Switch**: Changeth thy Git user.name and user.email in the twinkling of an eye
- **SSH Key Management**: Automatically switcheth thy SSH keys within the ssh-agent
- **GPG Signing Support**: Configureth thy GPG key for the signing of commits (optional, yet most wise)
- **Submodule Support**: Automatically propagateth thine identity unto all Git submodules
- **Status Bar Integration**: Ever shall thy current identity be visible at a glance
- **Rich Tooltips**: Detailed identity information with description and SSH host
- **Cross-Platform**: Worketh upon macOS, Linux, and Windows—all the stages of the world!
- **Localized**: Supporteth 17 tongues of the realm

## 🚀 Wherefore This Extension?

Whilst many Git identity switchers doth exist upon this mortal coil, **Git ID Switcher** solveth the vexing problems that others do ignore:

1. **The Submodule's Lament**: When working with repositories containing submodules, one must oft set `git config user.name` by hand for *each* submodule—a most tedious affair! This extension handleth it with grace, recursively applying thine identity unto all active submodules.
2. **SSH & GPG Handling**: It doth not merely change thy name; it swappeth thy SSH keys in the agent and configureth GPG signing, that thou might never commit with the wrong signature!

## 🌏 A Soliloquy on Multilingual Support

> *"What's in a language? That which we call a tongue*
> *By any other name would speak as sweet."*
>
> **I do value the existence of minorities.**
> I wish not to discard them merely because they be few in number.
> Even if translations be not perfect, I hope thou canst feel our intent to show respect.

---

## Quick Start, Good Sir or Madam

### Act I: Prepare Thy SSH Keys

```bash
# For the tragedy of personal projects
ssh-keygen -t ed25519 -C "hamlet@elsinore.example.com" -f ~/.ssh/id_ed25519_hamlet

# For the comedy of work
ssh-keygen -t ed25519 -C "macbeth@glamis.example.com" -f ~/.ssh/id_ed25519_macbeth
```

### Act II: Configure Thy SSH

Edit `~/.ssh/config`:

```ssh-config
# The Prince of Denmark's Account
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_hamlet
    IdentitiesOnly yes

# The Thane of Glamis's Account
Host github-macbeth
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_macbeth
    IdentitiesOnly yes
```

### Act III: Configure the Extension

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "hamlet",
      "icon": "💀",
      "name": "Hamlet, Prince of Denmark",
      "email": "hamlet@elsinore.example.com",
      "description": "To code, or not to code",
      "sshKeyPath": "~/.ssh/id_ed25519_hamlet"
    },
    {
      "id": "macbeth",
      "icon": "🗡️",
      "name": "Macbeth, Thane of Glamis",
      "email": "macbeth@glamis.example.com",
      "description": "Is this a merge conflict I see before me?",
      "sshKeyPath": "~/.ssh/id_ed25519_macbeth",
      "sshHost": "github-macbeth"
    },
    {
      "id": "romeo",
      "icon": "❤️",
      "name": "Romeo Montague",
      "email": "romeo@verona.example.com",
      "description": "But soft, what code through yonder window breaks?"
    },
    {
      "id": "juliet",
      "icon": "🌹",
      "name": "Juliet Capulet",
      "email": "juliet@verona.example.com",
      "description": "O Git, Git! Wherefore art thou Git?"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "hamlet",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Act IV: The Performance!

1. Click upon the identity icon in the status bar
2. Select thine identity
3. 'Tis done! Thy Git config and SSH keys have been switched!

---

## Commands

| Command                         | Description                           |
| ------------------------------- | ------------------------------------- |
| `Git ID: Select Identity`       | Open the identity picker              |
| `Git ID: Show Current Identity` | Reveal thy current identity           |

---

## Contributing

We welcome contributions from all players upon this stage! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

MIT License - See [LICENSE](../../LICENSE).

## Credits

Crafted by [Null;Variant](https://github.com/nullvariant)

---

🎭 *"All the world's a stage, and all the devs merely players."* 🎭
