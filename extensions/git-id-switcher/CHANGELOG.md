# Changelog

All notable changes to the Git Identity Switcher extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.22] - 2026-01-04

### Fixed

- **Documentation Webview HTML Rendering**: Fixed HTML tags displaying as raw text
  - README contains mixed Markdown and HTML (tables, images, badges)
  - Changed from full HTML escaping to sanitization approach
  - Now preserves safe HTML tags while removing dangerous elements (`<script>`, event handlers, `javascript:` URLs)
  - Defense-in-depth: `enableScripts: false` already prevents JS execution

## [0.10.21] - 2026-01-04

### Added

- **Show Documentation Command**: New command to display README in VS Code Webview
  - Command: `Git ID Switcher: Show Documentation` (Command Palette)
  - Automatically detects user's VS Code locale and fetches matching language README
  - Supports all 26 languages with fallback to English
  - Secure implementation: XSS prevention via HTML escaping, CSP headers, `enableScripts: false`
  - DoS protection: 1MB content size limit
  - Footer links to GitHub repository and external browser view

### Changed

- **GitHub Actions**: Added automatic documentation deployment to Cloudflare R2
  - `publish.yml`: Deploy docs on release
  - `deploy-docs.yml`: Deploy docs on README/docs changes (new workflow)

## [0.10.20] - 2026-01-04 [YANKED]

> **Note**: This version was partially published with build errors. Use v0.10.21 instead.

## [0.10.19] - 2026-01-04

### Changed

- **README Screenshots**: Added Quick Pick screenshots to all 26 README files
  - Each language now displays localized Quick Pick UI screenshot in "Step 4: Use It" section
  - Images hosted on CDN: `assets.nullvariant.com/git-id-switcher/quickpick-{lang}.png`
  - Retina-ready: 1200px source displayed at 600px width for 2x resolution

## [0.10.18] - 2026-01-03

### Fixed

- **i18n Validation Bug**: Fixed `service` and `description` fields rejecting Unicode characters (e.g., Japanese, Chinese)
  - Changed validation pattern from ASCII-only to Unicode-safe while still blocking dangerous shell metacharacters
  - Added missing `service` field validation in secondary validation layer
  - This bug prevented identities with non-ASCII service names (e.g., "GitHub 会社用") from being loaded

### Security

- **Validation Consistency**: Added missing `service` field length check (64 characters) in validation.ts for defense-in-depth

## [0.10.17] - 2026-01-03

### Changed

- **README Demo Format**: Changed demo image from WebP to static PNG for better clarity and compatibility

## [0.10.16] - 2026-01-03

### Changed

- **README Demo Format**: Changed demo image from GIF to WebP for ~50% smaller file size

## [0.10.15] - 2026-01-03

### Changed

- **README Demo Image**: Replaced static demo.png with animated demo.gif for better feature showcase

## [0.10.14] - 2026-01-01

### Changed

- **README Structure Improvements** (JA, EN): Improved first-view appeal on marketplace/Open VSX
  - Moved "Why Git ID Switcher?" section before "Features" for immediate differentiation
  - Reordered Features list: Submodule Support → SSH Key Management → GPG Signing → general features
  - Header renamed from "🚀 Why this extension?" to "🎯 Why Git ID Switcher?"
- **README Documentation** (JA, EN): Added 6 missing configuration items to Global Settings table
  - `logging.fileEnabled`: Enable audit logging to file
  - `logging.filePath`: Log file path with example
  - `logging.maxFileSize`: Max file size before rotation (bytes, 1MB-100MB)
  - `logging.maxFiles`: Max rotated log files to keep (1-20)
  - `logging.level`: Log verbosity with threshold-based recording
  - `commandTimeouts`: Custom timeout per command with example
- **Identity Properties Table** (EN): Added icon example `"🏠"` for parity with Japanese version

## [0.10.13] - 2026-01-01

### Changed

- **Multilingual Description Improvements**: Improved setting descriptions for 11 languages
  - Languages updated: French (fr), Spanish (es), Italian (it), Portuguese-BR (pt-BR), Russian (ru), Polish (pl), Czech (cs), Hungarian (hu), Bulgarian (bg), Ukrainian (uk), Turkish (tr)
  - `config.logging.fileEnabled`: Clarified what is recorded (identity switches, SSH key operations, etc.)
  - `config.logging.level`: Clarified threshold-based logging (records selected level and above)
  - All translations now match the improved English/Japanese descriptions from v0.10.10

## [0.10.12] - 2026-01-01

### Removed

- **Revert Title Properties**: Removed non-functional `title` properties from all 13 settings
  - VSCode does NOT support `title` at individual configuration property level
  - VSCode always auto-generates titles from property names (camelCase → Title Case)
  - This was discovered after v0.10.10/v0.10.11 were released
  - Title properties in package.json and nls files were silently ignored by VSCode
  - Valid changes from v0.10.10 remain: terminology unification (SSH鍵/GPG鍵), description improvements

## [0.10.11] - 2026-01-01

### Fixed

- **Build Fix**: Added missing English title keys to package.nls.json
  - v0.10.10 failed to build because title keys were only added to Japanese file

## [0.10.10] - 2026-01-01

### Changed

- **Japanese Setting Titles Localization**: Added explicit `title` properties to all 13 settings
  - VSCode auto-generates titles from property names (e.g., `autoSwitchSshKey` → "Auto Switch Ssh Key")
  - Now uses proper Japanese titles (e.g., "SSH鍵の自動切り替え")
  - Affected settings: identities, defaultIdentity, autoSwitchSshKey, applyToSubmodules, submoduleDepth, showNotifications, includeIconInGitConfig, logging.* (5 settings), commandTimeouts
- **Japanese Description Improvements**: Improved 3 setting descriptions
  - `autoSwitchSshKey`: "ID変更時にSSH鍵も自動的に切り替える"
  - `logging.fileEnabled`: "監査ログをファイルに保存する（ID切り替え、SSH鍵操作などを記録）"
  - `logging.level`: "ログの詳細度を設定（DEBUG=全て記録、ERROR=エラーのみ。選択したレベル以上を記録）"
- **Terminology Unification**: Unified "SSHキー" to "SSH鍵" across all Japanese/Ryukyuan files
  - Updated: package.nls.ja.json, bundle.l10n.ja.json, docs/i18n/ja/README.md, docs/i18n/ryu/README.md

## [0.10.9] - 2025-01-01

### Changed

- **Multilingual Localization Improvements**: Revised translations for 12 languages to match Japanese/English improvements
  - Languages updated: German (de), French (fr), Spanish (es), Italian (it), Portuguese-BR (pt-BR), Russian (ru), Polish (pl), Czech (cs), Hungarian (hu), Bulgarian (bg), Ukrainian (uk), Turkish (tr)
  - Added "(profile)" concept to extension description and status bar messages
  - Added "(required)" markers to required fields (id, name, email)
  - Added examples: icon (🏠, 💼), description (Work, Personal equivalents)
  - Added submodule depth range "(1-5)" to settings
  - Removed redundant "(optional)" from optional fields
  - Renamed notifications category to include "& Display"

## [0.10.8] - 2025-01-01

### Changed

- **English Localization Improvements**: Revised English translations to match Japanese version improvements
  - `extension.description`: Simplified, uses "Git profiles" instead of "GitHub accounts" (platform-agnostic)
  - `config.category.display`: Renamed from "Notifications" to "Notifications & Display"
  - Identity settings: Added "(required)" markers to required fields (id, name, email)
  - Added examples: icon (🏠, 💼), description (Work, Personal)
  - Removed redundant "(optional)" from optional fields
  - Unified terminology: "profile" used in status bar for better UX
  - Simplified notification messages: unified "Switching..." text

## [0.10.7] - 2025-01-01

### Fixed

- **Japanese Localization**: Add icon examples to markdown description in settings
  - `config.identities.markdown`: Added "(例: 🏠, 💼)" to icon field description

## [0.10.6] - 2025-01-01

### Changed

- **Japanese Localization Improvements**: Revised Japanese translations for clarity and consistency
  - `extension.description`: Simplified and made more concise
  - `config.category.display`: Renamed from "通知" to "通知と表示" to better reflect contents
  - Identity settings: Added "(必須)" markers to required fields (id, name, email)
  - Improved descriptions with examples (icon: 🏠, 💼; description: 会社用, 個人用)
  - Removed redundant "(オプション)" from optional fields
  - Unified terminology: "プロフィール" added to status bar for better UX
  - Simplified notification messages: "〜しています" → "〜中"

## [0.10.5] - 2025-12-31

### Changed

- **i18n File Key Ordering**: Reorganized translation file key order to match settings UI
  - `package.nls.*.json` (17 languages): Keys now follow settings panel appearance order
  - `l10n/bundle.l10n.*.json` (17 languages): Keys now follow UI context grouping
  - Improves maintainability and makes diff reviews easier
  - No functional changes to translations

## [0.10.4] - 2025-12-31

### Fixed

- **Notification Localization**: Add missing `l10n` field to package.json
  - Notification messages (e.g., "Switched to {identity}") were always displayed in English
  - Now properly loads translation bundles from `l10n/` directory
  - All 17 supported languages now work for runtime messages

## [0.10.3] - 2025-12-31

### Changed

- **Settings Categorization**: Reorganized settings into 5 logical categories for better UX
  - Identity: Core settings (identities, defaultIdentity, autoSwitchSshKey)
  - Submodule: Submodule-related settings (applyToSubmodules, submoduleDepth)
  - Notifications: Display/notification settings (showNotifications, includeIconInGitConfig)
  - Debugging: Log settings (logging.*)
  - Other: Advanced settings (commandTimeouts)
- Settings now use `order` property for consistent display order
- Category names localized for all 17 supported languages

## [0.10.2] - 2025-12-31

### Security

- **Command Allowlist Hardening**: Fix critical vulnerabilities in argument validation
  - **[CRITICAL] Subcommand Bypass Fix**: Subcommand arguments are now validated instead of immediately returning `allowed: true`
  - **[HIGH] Path Argument Bypass Fix**: Path-like arguments no longer unconditionally bypass allowlist
  - **[HIGH] Submodule Command Restriction**: Block dangerous commands like `git submodule update/init/add/foreach`

### Added

- **`allowPathPositionals` Option**: New restrictive option for path-only positional arguments
  - More secure than `allowAnyPositional` for commands like `git submodule status <path>`
  - Prevents non-path strings (e.g., 'update', 'init') from bypassing allowlist
- **`allowedOptionsWithValues` Option**: Explicit control over which options accept arbitrary values
  - Used for `git config user.name`, `git config user.email`, etc.
  - Values following these options are allowed but flag injection is blocked
- **Command Allowlist Tests**: New test suite for comprehensive allowlist validation

### Changed

- **Strict Flag Validation**: Flags must be explicitly in `allowedArgs` or valid combined flags
- **Enhanced Path Detection**: Arguments containing `/` are now checked by `isSecurePath()`
- **Improved Error Messages**: More descriptive rejection reasons including path validation details

## [0.10.1] - 2025-12-31

### Fixed

- **TypeScript Build Error**: Fix unused variable `key` in `formatLogLine()` replacer function
  - Renamed to `_key` to indicate intentionally unused parameter
  - Fixes TS6133 error in CI build

## [0.10.0] - 2025-12-31

### Added

- **Structured Logging System**: New logging infrastructure for audit trails
  - `LogLevel` enum: DEBUG, INFO, WARN, ERROR, SECURITY
  - `StructuredLog` interface for consistent log format
  - `ILogWriter` interface for dependency injection
  - `FileLogWriter` class for file-based log persistence with rotation
- **File Logging Settings**: New configuration options
  - `gitIdSwitcher.logging.fileEnabled`: Enable file logging (default: false)
  - `gitIdSwitcher.logging.filePath`: Log file path (e.g., `~/.git-id-switcher/security.log`)
  - `gitIdSwitcher.logging.maxFileSize`: Max file size before rotation (default: 10MB)
  - `gitIdSwitcher.logging.maxFiles`: Max rotated files to keep (default: 5)
  - `gitIdSwitcher.logging.level`: Minimum log level (DEBUG, INFO, WARN, ERROR, SECURITY)
- **Log Rotation**: Automatic log file rotation when size limit reached
  - Configurable max file size and retention count
  - Timestamp-based rotated file naming
  - Retry limit (3) to prevent infinite rotation loops

### Security

- **Path Validation**: File log paths validated with `isSecurePath()` for security
- **Circular Reference Handling**: `WeakSet`-based detection in JSON serialization
- **SECURITY Level Always Logged**: Security events bypass minimum level filter

### Changed

- **SecurityLogger Refactored**: Split into focused methods (SRP)
  - `writeToFile()`: Structured log file output
  - `writeToOutputChannel()`: VS Code Output Channel
  - `showErrorNotification()`: Error notifications
- **Type-Safe Log Level Parsing**: Added `parseLogLevel()` function

## [0.9.10] - 2025-12-30

### Fixed

- **Name Validation Regression**: Allow semicolon (;) in identity names
  - Fixes "Null;Variant" and similar names being incorrectly rejected
  - Schema validation was stricter than intended (contradicted validation.ts comment)

## [0.9.9] - 2025-12-30

### Fixed

- **ESLint Rule Compatibility**: Add `@typescript-eslint/no-var-requires` to eslint-disable comments
  - Fixes lint errors in CI/CD pipeline
  - Corrects incomplete eslint-disable annotations for dynamic require()

## [0.9.8] - 2025-12-30

### Security

This release includes comprehensive security hardening across multiple areas.

#### Path & File Security

- **Path Traversal Prevention**: Added `isSecurePath()` with comprehensive attack detection
  - Unicode normalization timing attacks
  - Control/invisible character obfuscation
  - Windows UNC paths, device paths, reserved names
  - Trailing dot attacks, whitespace obfuscation
- **Secure Path Normalization**: Added `pathUtils.ts` with symlink resolution
  - ELOOP detection for symlink loops
  - PATH_MAX enforcement (4096 bytes)
  - Home directory escape prevention
- **SSH Key File Validation**: Added multi-layer validation before `ssh-add`
  - File existence, type, and size limits (10B - 1MB)
  - Unix permission check (reject group/others access)
  - SSH key format validation (OpenSSH, PEM, PKCS#8, PuTTY)

#### Input Validation

- **Identity Validation on Load**: `getIdentitiesWithValidation()` validates at startup
  - Invalid identities filtered and logged
  - Duplicate ID detection
  - DoS protection with array/field count limits
- **Submodule Path Validation**: Strengthened path security
  - Symlink escape detection after resolution
  - Control character rejection
  - Depth clamping with MAX_SUBMODULE_DEPTH=5
- **Combined Flag Validation**: Enhanced command allowlist security
  - Unicode normalization (NFC) for combining characters
  - Invisible Unicode character detection
  - Flag-value concatenation detection (e.g., `-f/path`)

#### Error Handling & Logging

- **SecurityError Class**: Prevent information leakage through errors
  - Separate user-visible messages from internal details
  - Stack trace sanitization (macOS, Linux, Windows, WSL paths)
  - Safe error message internationalization with `vscode.l10n.t()`
- **Log Sanitization**: Comprehensive sensitive data protection
  - Platform-specific sensitive directory patterns
  - Secret-like string detection (API keys, tokens, base64)
  - Windows UNC path server name masking
  - Control character detection and masking
- **Config Change Audit Logging**: Track configuration changes
  - CONFIG_KEYS tracking with before/after values
  - Identity array change summarization
  - DoS protection (max 1000 identities, max 100 changes)

#### Command Execution

- **Command-Specific Timeouts**: Prevent resource exhaustion
  - git: 10s, ssh-add: 5s, ssh-keygen: 5s, default: 30s
  - User-configurable via `gitIdSwitcher.commandTimeouts` setting
  - TimeoutError class with ETIMEDOUT code
- **Enhanced Timeout Validation**: Additional security checks
  - Command name validation (DoS protection, character restrictions)
  - NaN/Infinity checks for timeout values
  - Integer validation to prevent precision attacks

### Added

- **New Setting**: `gitIdSwitcher.commandTimeouts` for custom command timeouts
  - Supports per-command timeout configuration
  - Validation: 1s minimum, 5m maximum

### Changed

- **Architecture Improvements** (SOLID principles):
  - SRP: Extracted `ConfigChangeDetector` class from `SecurityLogger`
  - DIP: Added `ISecurityLogger` interface for dependency injection
  - OCP: Timeout configuration externalized to VS Code settings

### Fixed

- **VS Code Module Lazy Loading**: Use dynamic `require()` for vscode module
  - Allows security tests to run outside VS Code extension host
  - Fixes `Cannot find module 'vscode'` error in CI/CD environments

## [0.9.7] - 2025-12-27

### Changed

- **Images moved to CDN**: README images now served from `assets.nullvariant.com`
  - Reduces VSIX package size
  - Enables README view analytics

### Removed

- Demo images removed from repository (now hosted on CDN)

## [0.9.6] - 2025-12-22

### Fixed

- **i18n README Links**: Fixed broken links in all 25 translated READMEs
  - LICENSE link path corrected (was pointing to wrong directory)
  - UNESCO Atlas link updated to working PDF version
  - Ainu Foundation URL updated to new domain (ff-ainu.or.jp)
  - Ainu Culture Research Center URL updated
  - Okinawa shimakutuba links updated to current URLs
  - Ryukyu University link updated to Faculty of Humanities
  - Removed Duolingo Hawaiian link (redirects incorrectly by region)

## [0.9.5] - 2025-12-22

### Changed

- **Icon Update**: Replaced icon with richer design

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

[Unreleased]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.19...HEAD
[0.10.19]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.18...git-id-switcher-v0.10.19
[0.10.18]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.17...git-id-switcher-v0.10.18
[0.10.17]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.16...git-id-switcher-v0.10.17
[0.10.16]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.15...git-id-switcher-v0.10.16
[0.10.15]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.14...git-id-switcher-v0.10.15
[0.10.14]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.13...git-id-switcher-v0.10.14
[0.10.13]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.12...git-id-switcher-v0.10.13
[0.10.12]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.11...git-id-switcher-v0.10.12
[0.10.11]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.10...git-id-switcher-v0.10.11
[0.10.10]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.9...git-id-switcher-v0.10.10
[0.10.9]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.8...git-id-switcher-v0.10.9
[0.10.8]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.7...git-id-switcher-v0.10.8
[0.10.7]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.6...git-id-switcher-v0.10.7
[0.10.6]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.5...git-id-switcher-v0.10.6
[0.10.5]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.4...git-id-switcher-v0.10.5
[0.10.4]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.3...git-id-switcher-v0.10.4
[0.10.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.2...git-id-switcher-v0.10.3
[0.10.2]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.1...git-id-switcher-v0.10.2
[0.10.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.0...git-id-switcher-v0.10.1
[0.10.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.10...git-id-switcher-v0.10.0
[0.9.10]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.9...git-id-switcher-v0.9.10
[0.9.9]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.8...git-id-switcher-v0.9.9
[0.9.8]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.7...git-id-switcher-v0.9.8
[0.9.7]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.6...git-id-switcher-v0.9.7
[0.9.6]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.5...git-id-switcher-v0.9.6
[0.9.5]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.9.4...git-id-switcher-v0.9.5
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
