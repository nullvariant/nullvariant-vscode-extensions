# Changelog

All notable changes to the Git Identity Switcher extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Remote URL auto-switching based on identity

## [0.4.1] - 2025-12-11

### Changed

- **Improved Discoverability**: Expanded keywords for better Marketplace search
  - Added action verbs: switch, change, toggle, manage
  - Added common terms: profile, account, workspace, github, gitlab
  - Added technical terms: keygen, ssh-agent, ssh-key, gpg-key, credential
- **Updated Description**: More descriptive text mentioning GitHub/GitLab accounts

## [0.4.0] - 2025-12-11

### Added

- **Demo Screenshot**: Added identity picker screenshot to README and repository

### Changed

- Repository README now showcases Git ID Switcher with visual preview

## [0.3.1] - 2025-12-11

### Changed

- **README Improvements**: Complete rewrite for first-time users
  - Added "Quick Start (Minimal Setup)" section (id/name/email only)
  - SSH and GPG are now clearly documented as optional features
  - Progressive disclosure: minimal setup to advanced configuration
  - Added "Full Example: 7 Accounts" with mixed SSH/GPG configurations
  - Expanded "Configuration Reference" with complete property table
  - Improved "Troubleshooting" section

## [0.3.0] - 2025-12-11

### Added

- **Submodule Support**: Identity config automatically propagates to Git submodules
  - New setting: `gitIdSwitcher.applyToSubmodules` (default: true)
  - New setting: `gitIdSwitcher.submoduleDepth` (default: 1, max: 5)
- **Identity Description**: New `description` property for identities
  - Displayed in quick pick and status bar tooltip
- **SSH Host Alias**: New `sshHost` property for multi-account SSH setups
  - Displayed in status bar tooltip
- **Enhanced Tooltips**: Rich Markdown tooltips with all identity details

### Changed

- Quick pick now shows description alongside email
- Status bar tooltip shows description, SSH host, and all configured details

## [0.2.0] - 2025-12-11

### ⚠️ Breaking Changes

- **Settings keys renamed**: `gitIdentitySwitcher.*` → `gitIdSwitcher.*`
  - Users must update their `settings.json` to use the new keys
- **Command IDs renamed**: `git-identity-switcher.*` → `git-id-switcher.*`
  - Keyboard shortcuts need to be updated

### Added

- Emoji icon display in status bar (uses `icon` property from identity config)
- Default emoji icons for status states:
  - `👤` - Default user icon
  - `❓` - No identity selected
  - `⏳` - Switching in progress
  - `❌` - Error state

### Changed

- Command titles shortened: `Git Identity:` → `Git ID:`

### Migration Guide

1. In `settings.json`, rename:
   - `gitIdentitySwitcher.identities` → `gitIdSwitcher.identities`
   - `gitIdentitySwitcher.defaultIdentity` → `gitIdSwitcher.defaultIdentity`
   - `gitIdentitySwitcher.autoSwitchSshKey` → `gitIdSwitcher.autoSwitchSshKey`
   - `gitIdentitySwitcher.showNotifications` → `gitIdSwitcher.showNotifications`
2. Update any keyboard shortcuts referencing `git-identity-switcher.*`

## [0.1.1] - 2025-12-11

### Changed

- Display name changed from "Git Identity Switcher" to "Git ID Switcher" for consistency

## [0.1.0] - 2025-12-11

### Added

- Initial release
- Identity switching via status bar quick pick
- Git config (user.name, user.email) auto-configuration
- SSH key switching via ssh-agent
- GPG signing key configuration
- Cross-platform support (macOS, Linux, Windows)
- Settings-based identity configuration
- Status bar showing current identity
- Workspace-level identity persistence
- Automatic identity detection from Git config
- Automatic identity detection from ssh-agent

### Configuration Options

- `gitIdentitySwitcher.identities`: List of identities
- `gitIdentitySwitcher.defaultIdentity`: Default identity ID
- `gitIdentitySwitcher.autoSwitchSshKey`: Auto SSH key switching
- `gitIdentitySwitcher.showNotifications`: Show switch notifications

[Unreleased]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.3.1...HEAD
[0.3.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.3.1
[0.3.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.3.0
[0.2.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.2.0
[0.1.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.1.1
[0.1.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.1.0
