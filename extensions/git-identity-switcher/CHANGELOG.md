# Changelog

All notable changes to the Git Identity Switcher extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.4] - 2025-12-18

### Fixed

- **Homepage Link Improvement**: Added `#readme` anchor to homepage URL
  - Marketplace link now jumps directly to README section
  - Avoids scrolling past l10n files in monorepo directory listing

## [0.5.3] - 2025-12-18

### Added

- **Marketplace Homepage Link**: Added `homepage` field in package.json
  - VSCode Marketplace now links to the extension's subdirectory in the monorepo
  - Provides direct access to extension-specific README and documentation

## [0.5.2] - 2025-12-18

### Added

- **Welcome Notification**: Show localized welcome message on first run
  - Detects example-only identity configuration
  - Offers "Open Settings" button to guide users
  - Supports all 17 languages

## [0.5.1] - 2025-12-18

### Improved

- **Better First-Run Experience**: Added default example identity configuration
  - New installations now show a complete template identity instead of "?"
  - All available properties (id, icon, name, email, description, sshKeyPath, sshHost, gpgKeyId) are shown
  - Uses RFC 2606 reserved domain (`example.com`) for safe placeholder email

## [0.5.0] - 2025-12-18

### Added

- **Full Internationalization**: Added 15 new language translations for VSCode UI
  - Asian languages: 简体中文 (zh-CN), 繁體中文 (zh-TW), 한국어 (ko)
  - European languages: Deutsch (de), Français (fr), Español (es), Português Brasil (pt-BR), Italiano (it), Русский (ru)
  - Additional languages: Polski (pl), Türkçe (tr), Čeština (cs), Magyar (hu), Български (bg), Українська (uk)
- All extension metadata, commands, settings, and runtime UI strings are now localized
- Total supported languages: 17 (including existing English and Japanese)

## [0.4.5] - 2025-12-18

### Security

- **CRITICAL: Fixed Command Injection Vulnerability** (CVE pending)
  - Migrated all `exec()` calls to `execFile()` to prevent shell interpretation
  - User-provided values (name, email, SSH paths, GPG keys) are now safely passed as array arguments
  - Added input validation layer with dangerous character pattern detection
  - Added command allowlist for defense-in-depth security

### Added

- **Security Audit Logging**: New Output Channel "Git ID Switcher Security"
  - Logs identity switches, SSH key operations, validation failures, and blocked commands
  - Accessible via VS Code Output panel
- **Input Validation**: Comprehensive validation for all identity fields
  - Rejects shell metacharacters, newlines, and escape sequences
  - Validates email format, SSH paths, GPG key IDs
- **Command Allowlist**: Only permitted git/ssh commands can be executed
- **CI/CD Security Checks**: Added GitHub Actions workflow for security scanning
  - npm audit on every push
  - CodeQL static analysis
  - Dangerous pattern detection

### Changed

- All command execution now uses `secureExec()` wrapper with timeout and buffer limits
- Identity validation is enforced before any git config changes

### Planned
- Remote URL auto-switching based on identity

## [0.4.4] - 2025-12-17

### Added

- **Localization Support**: Extension is now fully localized
  - Added Japanese (日本語) translation
  - Supports localized commands, settings, notifications, and status bar messages
- **Documentation**: Added "Why this extension?" section to clarify unique value proposition
- **Documentation**: Added "Advanced: Submodule Support" section to explain how identity propagation works

## [0.4.3] - 2025-12-11

### Changed

- **Submodule Fixes**: Improved reliability of recursive submodule identity application

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

[Unreleased]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.5.4...HEAD
[0.5.4]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.5.3...git-id-switcher-v0.5.4
[0.5.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.5.2...git-id-switcher-v0.5.3
[0.5.2]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.5.1...git-id-switcher-v0.5.2
[0.5.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.5.0...git-id-switcher-v0.5.1
[0.5.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.4.5...git-id-switcher-v0.5.0
[0.4.5]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.4.4...git-id-switcher-v0.4.5
[0.4.4]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.4.3...git-id-switcher-v0.4.4
[0.4.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.4.0...git-id-switcher-v0.4.3
[0.4.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.3.1...git-id-switcher-v0.4.0
[0.3.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.3.1
[0.3.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.3.0
[0.2.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.2.0
[0.1.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.1.1
[0.1.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-id-switcher-v0.1.0
