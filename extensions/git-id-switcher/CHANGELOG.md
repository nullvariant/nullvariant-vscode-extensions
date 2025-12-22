# Changelog

All notable changes to the Git Identity Switcher extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.4] - 2025-12-22

### Changed

- **Language Selector Update**: Expanded language flags in README header
  - Now shows all 17 VSCode-supported languages as clickable flags
  - Changed from 8 flags to 17 flags (🇺🇸 🇯🇵 🇨🇳 🇹🇼 🇰🇷 🇩🇪 🇫🇷 🇪🇸 🇧🇷 🇮🇹 🇷🇺 🇵🇱 🇹🇷 🇨🇿 🇭🇺 🇧🇬 🇺🇦)
  - Updated "+20 more" to "+8 more" (remaining minority/joke languages)
  - Applied to all 26 README files

### Fixed

- **LANGUAGES.md**: Fixed broken links
  - CONTRIBUTING.md link now points to correct location
  - UNESCO Atlas link updated to working PDF document

## [0.9.3] - 2025-12-22

### Changed

- **i18n README Update (Phase 3)**: All 24 translated READMEs updated to match English v0.9.2
  - Added EMU (Enterprise Managed User) mention in Quick Start
  - Added `service` field to all configuration examples
  - Changed OSS example from GitHub to Bitbucket (GitHub ToS compliance)
  - Added "Display Limitations" section
  - Added `includeIconInGitConfig` setting documentation
  - Added "Git Config Layer Structure" section
  - Added "When Switching Identities" section
  - Added "How Submodule Propagation Works" section
  - Added troubleshooting: name field shell metacharacters error
  - Added troubleshooting: settings cache issue (machine restart)
  - Added troubleshooting: Settings Sync overwriting defaults
- **Icon Update**: Replaced icon.png with high-resolution version (270KB)

## [0.9.2] - 2025-12-21

### Changed

- **English README**: Comprehensive documentation update
  - Added EMU (Enterprise Managed User) mention in Quick Start
  - Added `service` field to all configuration examples
  - Changed OSS example from GitHub to Bitbucket (GitHub ToS compliance)
  - Added "Display Limitations" section (status bar ~25 chars, single emoji)
  - Added `includeIconInGitConfig` setting documentation with behavior table
  - Added "Git Config Layer Structure" section explaining --local writes
  - Added "When Switching Identities" section with step-by-step flow
  - Added "How Submodule Propagation Works" section
  - Added troubleshooting: name field shell metacharacters error
  - Added troubleshooting: settings cache issue (machine restart)
  - Added troubleshooting: Settings Sync overwriting defaults
  - Fixed bitbucket icon to bucket emoji (matches Bitbucket logo)
  - Fixed freelance service from GitHub to GitLab

## [0.9.1] - 2025-12-21

### Fixed

- **Naming Consistency**: Unified old name "Git Identity Switcher" to "Git ID Switcher" across all source files
  - Updated console logs, comments, and error message prefixes in source code
  - Updated all 17 localization files (l10n/bundle.l10n*.json)
  - CHANGELOG entries remain as historical record

## [0.8.1] - 2025-12-21

### Fixed

- **Default Config**: Added `service` field to example identity template
  - New users can now discover the `service` property in settings

## [0.8.0] - 2025-12-21

### Added

- **New `service` Field**: Separate hosting service from identity name (ISSUE-00021)
  - `name` now contains pure identity name (e.g., "Alex")
  - `service` specifies hosting provider (e.g., "GitHub", "GitLab", "Bitbucket")
  - QuickPick displays combined label: "Alex - GitHub"
  - Git author uses only `name`: "Alex <alex@example.com>"
  - Backward compatible: `service` is optional
- **Display Context Limits**: Smart truncation for different UI contexts (ISSUE-00022)
  - Status bar: 25 characters max with "..." suffix
  - QuickPick: Uses VS Code's native truncation
  - Tooltip: No limit (full Markdown support)
- **Grapheme-Based Icon Validation**: Single visible character enforcement
  - Uses `Intl.Segmenter` API for accurate emoji counting
  - Composed emoji (e.g., family emoji) counts as 1 character
  - Prevents multiple emoji in icon field

### Changed

- Icon validation uses grapheme clusters instead of byte length
- Status bar text automatically truncates long names

## [0.7.1] - 2025-12-19

### Changed

- **Marketplace Keywords**: Added i18n/l10n related keywords for better discoverability
  - `i18n`, `l10n`, `localization`, `multilingual`, `internationalization`

## [0.7.0] - 2025-12-19

### Added

- **Tier 3 Documentation i18n**: Added 9 additional README translations
  - **Minority Languages**: Hawaiian (haw), Ainu (ain), Ryukyuan (ryu)
    - Each with language-specific disclaimer and cultural resource links
    - Selection based on personal connections, not comprehensiveness
  - **Joke Languages**: Pirate (x-pirate), LOLcat (x-lolcat), Shakespearean (x-shakespeare)
    - Fun themed identity examples (captains, famous cats, Shakespeare characters)
  - **Constructed Languages**: Klingon (tlh), Toki Pona (tok), Esperanto (eo)
    - Vocabulary reference tables for language learners
- **LANGUAGES.md**: Updated with "Why only three minority languages?" section
  - Explains selection rationale based on personal experiences
  - Links to language revitalization resources

## [0.6.1] - 2025-12-18

### Fixed

- **Allow semicolon in identity names**: Names like "Null;Variant" are now valid
  - Semicolon was incorrectly flagged as a "shell metacharacter"
  - Since we use `execFile()` (no shell), semicolon poses no security risk
  - Other shell metacharacters (`$`, backticks, `|`, etc.) remain blocked

## [0.6.0] - 2025-12-18

### Added

- **Tier 2 Documentation i18n**: Full README translations for all 17 VSCode languages
  - Asian languages: 简体中文 (zh-CN), 繁體中文 (zh-TW), 한국어 (ko)
  - European languages: Deutsch (de), Français (fr), Español (es), Português Brasil (pt-BR), Italiano (it), Русский (ru)
  - Additional languages: Polski (pl), Türkçe (tr), Čeština (cs), Magyar (hu), Български (bg), Українська (uk)
- **LANGUAGES.md**: Added comprehensive language support overview document
  - Documents Tier 1 (VSCode UI) and Tier 2 (README) language support
  - Includes planned minority languages (Hawaiian, Māori, Welsh, etc.)
  - Contribution guidelines for translators

### Changed

- **Localized Example Names**: All README translations use culturally appropriate gender-neutral names
  - Chinese: 陳雨 (zh-TW), 张雨 (zh-CN)
  - Korean: 김민
  - European languages: Alex + locale-specific surname

## [0.5.6] - 2025-12-18

### Changed

- **Marketplace Description Update**: Aligned extension descriptions with README
  - Japanese: Changed "Git ID" terminology to "プロフィール" to match README
  - English/Japanese: Added "with one click" / "ワンクリックで" to descriptions

## [0.5.5] - 2025-12-18

### Changed

- **README Improvements**: Use gender-neutral example names
  - English: Alex Smith (Alex = Alexander/Alexandra)
  - Japanese: Kaoru Takahashi (Kaoru is unisex)
  - Shows consideration for gender diversity

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
- **Command IDs renamed**: `git-id-switcher.*` → `git-id-switcher.*`
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
2. Update any keyboard shortcuts referencing `git-id-switcher.*`

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

[Unreleased]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.4...HEAD
[0.9.4]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.3...git-id-switcher-v0.9.4
[0.9.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.2...git-id-switcher-v0.9.3
[0.9.2]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.1...git-id-switcher-v0.9.2
[0.9.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.8.1...git-id-switcher-v0.9.1
[0.8.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.8.0...git-id-switcher-v0.8.1
[0.8.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.7.1...git-id-switcher-v0.8.0
[0.7.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.7.0...git-id-switcher-v0.7.1
[0.7.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.6.1...git-id-switcher-v0.7.0
[0.6.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.6.0...git-id-switcher-v0.6.1
[0.6.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.5.6...git-id-switcher-v0.6.0
[0.5.6]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.5.5...git-id-switcher-v0.5.6
[0.5.5]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.5.4...git-id-switcher-v0.5.5
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
