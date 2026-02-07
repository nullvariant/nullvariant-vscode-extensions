# Changelog

All notable changes to the Git Identity Switcher extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.16.17] - 2026-02-07

### Documentation

- **All 26 i18n READMEs restructured to match new ja/en format**:
  - Added Profile Management UI section (add/edit/delete/reorder/SSH key path)
  - Added SSH Key Management section with IdentitiesOnly explanation
  - Improved Quick Start guide with first-ux image and UI-first approach
  - Expanded Troubleshooting section with new entries
  - Added Delete Identity command to Commands table
  - Removed obsolete sections (old Step 4, GPG-only section, "Note: Basic Setup")
  - Updated all screenshot references from old PNG to new per-language WebP format
  - Maintained culturally appropriate sample profile names per language
  - Languages: en, ja, zh-CN, zh-TW, ko, de, fr, es, pt-BR, it, ru, pl, tr, cs, hu, bg, uk, haw, ain, ryu, tlh, tok, eo, x-pirate, x-lolcat, x-shakespeare

## [0.16.16] - 2026-02-07

### Fixed

- **L10n key split and Japanese terminology unification**:
  - Split `'Select Identity'` into separate keys for status bar (`Select Identity`) and QuickPick (`Select an identity`) to enable context-appropriate translations
  - Fixed 7 Japanese translations: unified "ID" to "Profile" for normal UI (notifications, dialogs, placeholders) while keeping "ID" for compact status bar area
  - Added 5 missing l10n keys across all 16 languages: `Select an identity`, workspace trust warnings (2), validation error notifications (2)
  - All 16 bundles now have 98 keys, perfectly matching source `l10n.t()` calls

## [0.16.15] - 2026-02-05

### Changed

- **L10n bundle cleanup and key unification**:
  - Removed ~24 unused keys from all 17 language files
  - Added 6 missing keys (SSH/GPG validation messages)
  - Unified all files to exactly 93 keys
  - Fixed duplicate key issues (e.g., "Select Identity" appeared twice)
  - Keys now use "Identity" terminology; localized values use appropriate "Profile" equivalents

## [0.16.14] - 2026-02-04

### Changed

- **L10n terminology unified to "profile" for better user comprehension**:
  - Updated all 17 language bundle files (`bundle.l10n.*.json`)
  - Changed "identity" → "profile" in user-facing UI text (status bar, QuickPick items, messages)
  - Internal code and settings still use "identity" for backward compatibility

## [0.16.13] - 2026-02-03

### Documentation

- **Removed WebP test image from README**: WebP format support verified successfully on VS Code Marketplace

## [0.16.12] - 2026-02-03

### Documentation

- **Added WebP format test image to README**: Verifies VS Code Marketplace rendering support before using WebP for actual documentation screenshots

## [0.16.11] - 2026-02-02

### Changed

- **New profile creation now returns to the management screen (profile list)** instead of opening the edit screen for the newly created profile

## [0.16.10] - 2026-02-02

### Fixed

- **Profile selector and delete picker now dismiss normally on focus loss**:
  - v0.16.9 applied `ignoreFocusOut` to all QuickPick dialogs, which prevented simple pickers from being dismissed by clicking outside
  - Now only form-style dialogs (new profile, edit, manage) retain focus; simple pickers follow standard VS Code behavior

## [0.16.9] - 2026-02-01

### Fixed

- **All QuickPick dialogs now persist when the editor loses focus**:
  - Previously, switching to another application (e.g., to copy text) would dismiss the QuickPick and discard all entered data
  - Set `ignoreFocusOut = true` on all 5 QuickPick instances: new profile form, edit form, profile selector, delete picker, and manage screen
  - Matches the existing InputBox behavior which already retained focus

## [0.16.8] - 2026-01-31

### Changed

- **SSH key file picker now stores paths in `~/` format instead of absolute paths**:
  - Selecting a key via the 📁 browse button now produces `~/.ssh/id_ed25519` instead of `/Users/name/.ssh/id_ed25519`
  - Improves privacy (no OS username in settings.json) and portability across machines
  - Works on both Unix and Windows (backslashes normalized to forward slashes)
  - Extracted shared `replaceHomeWithTilde()` utility to `pathUtils.ts`, removing duplicate from `pathSanitizer.ts`

### Documentation

- **Updated Japanese README for identity management UI**:
  - Added "Profile Management UI" as first item in Features section
  - Rewrote Quick Start Step 3 from settings.json-first to UI-first approach
  - Added new "Profile Management" section (add/edit/delete/reorder/SSH key path)
  - Added Delete Identity command to Commands table
  - Removed "Note: Basic Setup (No SSH)" section

## [0.16.7] - 2026-01-30

### Fixed

- **Remove forced default icon (👤) for identities without an icon configured**:
  - Status bar now shows only the identity name when no icon is set
  - Previously, identities created without an icon always displayed 👤 in the status bar
  - The default preset profile still shows 👤 as it has `"icon": "👤"` explicitly configured

## [0.16.6] - 2026-01-30

### Fixed

- **Reorder settings fields to group required fields first (id, name, email)**:
  - Changed field order from `id, name, service, email, ...` to `id, name, email, service, ...` across all 17 language files
  - Updated `config.identities.markdown` descriptions, individual field key order, and `package.json` schema/default order
  - Required fields (id, name, email) now appear as the first three items, matching the UI edit form order

## [0.16.5] - 2026-01-29

### Fixed

- **Unified `config.identities.markdown` descriptions across all 17 languages**:
  - Aligned markdown overview descriptions with individual field descriptions (the more specific variants)
  - Fixed 5 fields per language: `id` (added character restrictions), `service` (added Bitbucket), `sshKeyPath` (added example), `sshHost` (replaced explanation with examples), `gpgKeyId` (added example)
  - Ensures VS Code Settings UI overview matches InputBox placeholders exactly

## [0.16.4] - 2026-01-29

### Added

- **Profile reorder (Move up / Move down) feature**:
  - Added `moveIdentityInConfig()` function to reorder identity profiles
  - Added inline move up / move down buttons in Manage Profiles UI
  - Added `handleManageMove()` command handler with focus management
  - Boundary handling: first item cannot move up, last item cannot move down
  - Security: ID format validation and audit logging for config changes
  - i18n: Move up / Move down / Failed to reorder tooltips (17 languages)
  - Allow ID editing when only one profile exists (`EditableFieldOrId` type)
  - Fix Codicon display in Edit Identity title

### Tests

- Added 9 E2E tests for `moveIdentityInConfig()`: normal move, boundary, single-element, error, and persistence
- Added 2 E2E tests for moveUp/moveDown button actions in `showManageIdentitiesQuickPick()`

## [0.16.3] - 2026-01-28

### Changed

- **i18n: Unified InputBox placeholders with settings.json descriptions**:
  - Updated `FIELD_PLACEHOLDER_KEYS` in identityManager.ts to match package.nls.json
  - Added Bitbucket to service field examples (17 languages)
  - Added concrete sshHost examples: `github-work`, `gitlab-personal` (17 languages)
  - Added 6 new translation keys to bundle.l10n files (17 languages):
    - `Git user.name (required)`
    - `Git user.email (required)`
    - `Git hosting service (e.g., GitHub, GitLab, Bitbucket)`
    - `Emoji to display in status bar (e.g., 🏠, 💼)`
    - `Note for this identity (e.g., Work, Personal)`
    - `SSH config host alias (e.g., github-work, gitlab-personal)`

## [0.16.2] - 2026-01-28

### Fixed

- **Manage Profiles icon not visible without hover**:
  - Use Codicon in label `$(gear)` instead of iconPath for consistent display
- **Save button disabled state icon**:
  - Changed from `$(loading~spin)` to `$(session-in-progress)` (static icon)

## [0.16.1] - 2026-01-28

### Fixed

- **Critical Bug: Back button inserting "back" string**:
  - Fixed bug where pressing back button in InputBox set "back" as the field value
  - Added `result !== 'back'` check in `handleAddFormFieldEdit()`
- **SSH Key Path Browse Button UX**:
  - Fixed file picker not transferring selected path due to InputBox losing focus
  - Added `ignoreFocusOut: true` to prevent InputBox from closing during file selection
  - Updated tooltip from "Browse..." to "Browse for SSH key path..." (17 languages)

### Changed

- **Japanese "New Profile" Label**:
  - Changed "新しいプロフィール" to "プロフィールを新規作成" for clarity
- **Required Field Hint**:
  - Updated "(fill in required fields)" to "(fill in fields marked with \*)" (17 languages)
- **Save Button Disabled State Icon**:
  - Changed disabled icon from `$(circle-slash)` to `$(loading~spin)` (less negative connotation)
- **InputBox Field Descriptions**:
  - Added concrete examples to id, sshKeyPath, gpgKeyId placeholders (17 languages)
- **InputBox Prompt Wording**:
  - Changed "Press 'Enter' to confirm" to "Press 'Enter' to save" (17 languages)
  - Added skip/clear hints for optional fields

### Removed

- **Dead Code Cleanup**:
  - Removed 7 obsolete translation keys from wizard-style UI (17 languages)

## [0.16.0] - 2026-01-27

### Changed

- **Identity Management UX Overhaul (Phase 5.5)**:
  - Profile list with inline edit/delete buttons replaces abstract action menu
  - All identity fields now editable: sshKeyPath, sshHost, gpgKeyId (in addition to existing fields)
  - New profile creation shows all properties as a list with required/optional markers
  - File picker button for sshKeyPath field with SSH directory default path
  - Back button in title bar (standard VS Code pattern)
  - Esc key now goes back one step instead of cancelling entire wizard
  - Focus position preserved after edit/delete operations
  - Empty state message when no profiles exist
  - Input values preserved when navigating back in wizard

### Security

- **SSH Key Path Validation Enhancement**:
  - Multi-layer validation: dangerous characters → path traversal → SSH directory restriction
  - SSH key paths restricted to `~/.ssh/` directory (user home directory protection)
  - Real-time validation feedback in InputBox
- **Comprehensive Security Tests**:
  - Defense-in-depth validation tests for all input fields
  - MAX_IDENTITIES limit enforcement tests
  - Audit logging tests for add/edit/delete operations

## [0.15.1] - 2026-01-27

### Changed

- **Identity Management UX Improvements**:
  - Manage menu now shows profile list with inline edit/delete buttons
  - Back button in title bar (standard VS Code pattern)
  - Esc key now goes back one step instead of cancelling entire wizard
  - Focus position preserved after edit/delete operations
  - Empty state message when no profiles exist

## [0.15.0] - 2026-01-26

### Added

- **Identity Management UI**: New in-editor identity management functionality
  - `Git ID Switcher: Select Identity` now includes "Manage identities..." option
  - Add new identities via wizard with ID, Name, and Email input
  - Edit existing identities (name, email fields)
  - Delete identities with confirmation dialog
  - `Git ID Switcher: Delete Identity` command for direct deletion
  - All UI strings localized in 17 languages

### Changed

- **Identity Picker Enhancement**: Added management option with separator in quick pick
  - Select identity or manage identities from single unified UI
  - Management menu provides Add/Edit/Delete options

## [0.14.4] - 2026-01-25

### Changed

- **ARCHITECTURE.md Improvements**: Enhanced documentation maintainability
  - Added "Function Naming Conventions" section with naming rules table
  - Added "ESLint Exclusion Patterns" section documenting intentional lint bypasses
  - Removed concrete values (line counts, file counts, validator counts) to prevent documentation drift
  - Replaced specific numbers with generic terms (e.g., "Multi-Layer" instead of "2 Layers")

### Added

- **PR Template**: Created `.github/PULL_REQUEST_TEMPLATE.md`
  - General checklist (tests, linter, coverage)
  - Naming conventions checklist for function additions/renames
  - Security checklist for validation/security code changes

## [0.14.3] - 2026-01-25

### Security

- **ReDoS Vulnerability Fix**: Replaced regex-based email validation with split-based approach
  - `EMAIL_REGEX` marked as deprecated (kept for backward compatibility)
  - New `isValidEmail()` function uses string operations instead of regex
  - Added length limit (254 chars per RFC 5321)
  - SonarQube: typescript:S5852

### Changed

- **ARCHITECTURE.md Updated**: Synchronized documentation with new directory structure
  - Updated 30+ file path references to reflect Phase 1-5 refactoring
  - Replaced logical grouping diagram with actual directory structure
  - Expanded security layer documentation with all 13 files

## [0.14.2] - 2026-01-23

### Fixed

- **VSIX Packaging Fix**: Added `../**` to `.vscodeignore` to exclude parent directory files
  - Fixes "invalid relative path" error during `vsce publish`
  - Prevents monorepo root files (e.g., `sonar-project.properties`) from being included in VSIX

## [0.14.1] - 2026-01-23

### Security

- **Dependency Vulnerability Fix**: Added npm override to force `diff@^8.0.3`
  - Fixes GHSA-73rr-hh4g-fpgx (CVE-2026-24001): DoS vulnerability in `parsePatch` and `applyPatch` methods
  - `mocha@11.7.5` depends on vulnerable `diff@7.0.0`

## [0.14.0] - 2026-01-22

### Changed

- **Command Palette Display Names**: Unified command category prefix for consistency
  - Changed from `Git ID:` to `Git ID Switcher:` for all commands
  - `Git ID: Select Identity` → `Git ID Switcher: Select Identity`
  - `Git ID: Show Current Identity` → `Git ID Switcher: Show Current Identity`
  - Prevents potential conflicts with other Git ID extensions in the ecosystem

### Added

- **Documentation Command in README**: Added `Git ID Switcher: Show Documentation` to command lists
  - Updated all 26 language README variants with the previously missing command
  - Each language includes appropriately translated descriptions

### ⚠️ Breaking Change

- **Command Search**: Users who search for commands using `Git ID:` prefix will need to update their search to `Git ID Switcher:`
- **Keyboard Shortcuts**: Not affected (command IDs remain unchanged)
- **Settings**: Not affected (configuration keys remain unchanged)

## [0.13.8] - 2026-01-19

### Changed

- **Hash Verification Workflow**: Redesigned for branch protection compliance
  - Added `hash-check.yml` workflow for pre-merge hash validation on PRs
  - Simplified `deploy-docs.yml` to CDN-only deployment (removed auto-commit)
  - Hash keys now align with CDN paths for consistency
  - Added monorepo root file support (README.md, CONTRIBUTING.md, LICENSE)
  - Total files tracked: 38 (32 extension + 6 monorepo root)

### Fixed

- **Hash Key Format**: Fixed hash verification failing due to key format mismatch
  - Added `getHashKey()` function for consistent hash key generation
  - Updated `verifyContentHash()` to support both extension and monorepo root files

## [0.13.7] - 2026-01-19

### Fixed

- **Documentation Hash Mismatch**: Fixed Webview documentation display failing due to outdated hashes
  - Regenerated SHA-256 hashes for all 32 documentation files
  - Added automatic hash update script (`scripts/update-doc-hashes.mjs`) for CI/CD
  - Deploy workflow now auto-updates hashes before CDN deployment

## [0.13.6] - 2026-01-18

### Added

- **Maximum Privacy Mode**: New `gitIdSwitcher.logging.redactAllSensitive` setting
  - When enabled, all string values are masked in security logs
  - Provides maximum privacy for users who want complete log sanitization
  - Default: `false` (existing behavior preserved)
  - Localized descriptions available in 17 languages
  - Documentation updated in 26 language README variants

## [0.13.5] - 2026-01-18

### Security

- **Remove HTML Sanitization**: Removed `sanitizeHtml()` function from documentation rendering
  - CDN content is now trusted based on CSP + SHA-256 hash verification
  - Simplifies codebase while maintaining security through existing defense layers
  - Resolves CodeQL "Incomplete multi-character sanitization" warnings
- **Fix undici vulnerability**: Updated `undici` dependency to fix GHSA-g9mf-h72j-4rw9
  - HTTP request smuggling vulnerability in `@vscode/test-electron` transitive dependency

## [0.13.4] - 2026-01-18

### Security

- **CDN Content Hash Verification**: Added SHA-256 hash verification for all documentation files
  - 32 documents now have cryptographic integrity checks (SHA-256)
  - Uses allowlist approach: unknown paths are rejected
  - Hash mismatches are logged and content is rejected
  - Protects against CDN cache poisoning and MITM attacks on documentation

## [0.13.3] - 2026-01-18

### Changed

- **Platform Badge Redesign**: Unified three separate platform badges into a single badge
  - Replaced individual Windows/macOS/Linux badges with unified `[🖥️ | Win | Mac | Linux]` badge
  - Microsoft removed all Windows icons from Simple Icons due to trademark requirements
  - Uses custom desktop monitor SVG icon with gray/blue two-tone design
  - Applied to all 28 README files (monorepo root, extension root, 26 i18n variants)

## [0.13.2] - 2026-01-18

### Added

- **Multi-Platform CI Support**: CI now runs on Windows, macOS, and Linux
  - Build job: 3-platform matrix strategy (ubuntu, windows, macos)
  - E2E job: Platform-specific execution (xvfb for Linux, native for Windows/macOS)
  - Added Git line ending configuration for Windows (`core.autocrlf false`)
- **Cross-Platform Path Tests**: Added `pathSeparator.test.ts` with platform-aware tests
  - Tests for `path.join`, `path.normalize`, `path.sep`
  - Platform-dependent assertions for backslash handling
- **Platform Badges**: Added Windows/macOS/Linux badges to all 26 language READMEs

## [0.13.1] - 2026-01-18

### Fixed

- **Submodule Detection Bug**: Fixed `listSubmodules()` failing to detect the first submodule
  - Root cause: `gitExec()` applied `stdout.trim()` which removed the leading status character
  - Added `gitExecRaw()` function that preserves raw stdout without trimming
  - `git submodule status` output format requires leading character (` `, `-`, `+`) for status

### Added

- **Comprehensive Submodule Tests**: Added tests for submodule detection scenarios
  - Single submodule detection test
  - Multiple submodules detection test (3 submodules)
  - Nested submodules recursive test (3-level hierarchy)
  - `gitExecRaw()` error handling test

### Changed

- **Improved Test Coverage**: `submodule.ts` coverage increased from 79.78% to 93.53%

## [0.13.0] - 2026-01-17

### Security

- **Security Hardening**: Comprehensive security improvements
  - **Log Path Validation** (Breaking Change)
    - Added `isSecureLogPath()` function with symlink detection via `lstat`
    - Log files now restricted to `globalStorageUri` directory only
    - `filePath` workspace setting is now ignored for security
  - **Binary Path Resolution**
    - Added `binaryResolver.ts` for secure PATH resolution
    - Commands now execute using absolute paths instead of relying on PATH
    - Prevents PATH pollution attacks with fake git/ssh binaries
  - **Audit Logging**
    - Added `securityLogger.logCommandBlocked()` for allowlist violations
    - Improved error handling in `gitExec` (no longer silently fails)
  - **Dependency Cleanup**
    - Removed unused `lodash` and `minimist` from devDependencies
    - Reduces attack surface and supply chain risk

### Breaking Changes

- `gitIdSwitcher.logging.filePath` workspace setting is now ignored
  - Log files are always written to VS Code's `globalStorageUri` for security
  - This prevents malicious repositories from writing to arbitrary paths via `.vscode/settings.json`

## [0.12.3] - 2026-01-14

### Changed

- **SonarCloud CI Integration**: Switched from automatic analysis to CI-based analysis
  - Added GitHub Actions workflow for SonarCloud scanning
  - Enables `sonar-project.properties` configuration (ignored by automatic analysis)
  - Includes test coverage reporting to SonarCloud
  - Test files properly excluded from duplication detection via `sonar.cpd.exclusions`

## [0.12.2] - 2026-01-14

### Fixed

- **SonarCloud Quality Gate**: Fixed duplication detection configuration
  - Added `.sonarcloud.properties` for automatic analysis (GitHub App)
  - `sonar-project.properties` is ignored by automatic analysis
  - Excluded test directory from duplication detection
  - Test code intentionally has duplication for readability and isolation

## [0.12.1] - 2026-01-14

### Internal

- **Code Quality Improvements**: Use `node:` prefix for Node.js built-in modules
  - `child_process` → `node:child_process` in secureExec.ts
  - `util` → `node:util` in secureExec.ts
  - `assert` → `node:assert` in all test files

## [0.12.0] - 2026-01-14

### Removed

- **Workspace Trust**: Removed custom Workspace Trust implementation (introduced in v0.11.0)
  - VS Code's default behavior (complete extension disable in untrusted workspaces) is more secure than partial functionality restrictions
  - Removed `gitIdSwitcher.disableWorkspaceTrust` setting
  - Removed confirmation dialogs for untrusted workspaces
  - Removed trust-related localized messages from all 17 languages
  - Removed Workspace Trust section from all 26 README documentation files

### Security

- **Improved Security Posture**: Relying on VS Code's native Workspace Trust (complete disable) instead of custom partial restrictions provides stronger security guarantees

## [0.11.3] - 2026-01-14

### Added

- **SonarCloud Quality Gate Badge**
  - Added SonarCloud Quality Gate Status badge to all 28 README files (monorepo root + 27 language variants)
  - Badge positioned between codecov and Harden-Runner badges

## [0.11.2] - 2026-01-14

### Added

- **i18n: Complete Translation Coverage**
  - Added missing `command.showDocumentation` translations to 15 languages (zh-CN, zh-TW, ko, de, fr, es, it, pt-BR, ru, pl, hu, cs, bg, uk, tr)
  - All package.nls translation keys now have 100% coverage across 17 languages
  - Test coverage added to verify i18n key consistency

## [0.11.1] - 2026-01-12

### Fixed

- **Empty String Validation**
  - Empty strings in optional fields (`service`, `sshKeyPath`, `sshHost`, `gpgKeyId`) are now treated as "not set" instead of triggering validation errors
  - This eliminates unnecessary warnings when using default settings
  - Required fields (`id`, `name`, `email`) still correctly reject empty strings

### Added

- **configSchema Tests**
  - Added comprehensive test suite for `configSchema.ts` (68 test cases)
  - Covers empty string handling, malicious value rejection, format validation, and edge cases
  - Test coverage improved to 92.99%

### Documentation

- **SSH Interaction Sections (en, ja)**
  - Added "SSH Key Management Details" section explaining ssh-agent commands
  - Added "Interaction with Existing SSH Config" section for compatibility guide
  - Added "Why `IdentitiesOnly yes`?" section with recommended configuration

## [0.11.0] - 2026-01-11

### Security

- **Workspace Trust**: Added support for VS Code Workspace Trust
  - Dangerous operations (Git config changes, SSH key operations) are blocked in untrusted workspaces
  - Identity switching requires explicit user confirmation in untrusted workspaces
  - New setting `gitIdSwitcher.disableWorkspaceTrust` for emergency bypass (not recommended)

### Added

- Confirmation dialog for identity switching in untrusted workspaces
- Localized trust-related messages in 17 languages

### Documentation

- Added Workspace Trust section to README (en, ja)

## [0.10.48] - 2026-01-10

### Fixed

- **Marketplace DESIGN_PHILOSOPHY.md Links**
  - Fixed 404 errors for Karesansui Architecture badge links in VS Code Marketplace
  - Changed from relative paths (`docs/DESIGN_PHILOSOPHY.md`) to absolute GitHub URLs
  - `generate-root-readme.js` now generates absolute URLs consistent with other link transformations

## [0.10.47] - 2026-01-10

### Fixed

- **Badge Design Restoration**
  - Restored `🌐 Languages | 17+9 more` two-tone badge (was incorrectly changed to `🌐 26 Languages`)
  - The `17+9` format intentionally shows: 17 VSCode UI languages + 9 additional (minority/joke/special)

## [0.10.46] - 2026-01-10

### Changed

- **Full 26 Language Links**
  - Replaced `17+9 more` badge with `26 Languages` badge
  - Now displaying all 26 language links with their emojis instead of just 17 VSCode UI languages
  - Each language README shows its own emoji in bold, with other 25 languages as clickable links
  - Minority (🌺🐻🐉), Special (🌍), and Joke (✨🖖🐱🏴‍☠️🎭) languages now visible alongside UI language flags

## [0.10.45] - 2026-01-10

### Changed

- **Languages Badge Redesign**
  - Replaced language-specific text labels with unified shields.io badge `[🌐 Languages | 17+9 more]`
  - Updated all 26 i18n README files with consistent badge format
  - Fixed language count from `17+8` to `17+9` (actual total: 26 languages)
  - Added Karesansui Architecture badge to monorepo root README

## [0.10.44] - 2026-01-10

### Fixed

- **Root README Badge Link**
  - Fixed broken DESIGN_PHILOSOPHY.md link in header badge section
  - `generate-root-readme.js` now transforms both markdown `(...)` and HTML `href="..."` links

## [0.10.43] - 2026-01-10

### Added

- **Karesansui Architecture Documentation**
  - Added `docs/DESIGN_PHILOSOPHY.md` with full design philosophy poem
  - Documents the "Karesansui (Zen Garden) Architecture" approach
  - Explains core concepts: Stone (core), Sand Patterns (quality), Accents (differentiation), and Stones We Don't Place (intentional constraints)

- **Design Philosophy Section in READMEs**
  - Added Design Philosophy section to all 26 language README files
  - Each section includes localized summary and link to full philosophy

- **Karesansui Architecture Badge**
  - Added clickable badge (🪨 Karesansui | Architecture) to header section of all READMEs
  - Badge links to DESIGN_PHILOSOPHY.md
  - Multiple badge style samples available in DESIGN_PHILOSOPHY.md

## [0.10.42] - 2026-01-09

### Added

- **Harden-Runner Badge**
  - Added Harden-Runner badge to all 28 README files (monorepo root + 27 language variants)

## [0.10.41] - 2026-01-09

### Security

- **CI/CD: Environment Protection for Marketplace Publishing**
  - Added `production` environment to publish.yml and unpublish.yml
  - Marketplace secrets (VSCE_PAT, OVSX_PAT) now protected by GitHub Environment
  - Requires tag push matching `git-id-switcher-v*` pattern
  - Implements least privilege principle for CI/CD secrets

### Added

- **Secrets Management Documentation**
  - Added comprehensive Secrets Management section to SECURITY.md
  - Documents all 15 secrets used in CI/CD workflows
  - Includes rotation procedures and provider links
  - Added sensitivity levels for each secret

## [0.10.40] - 2026-01-09

### Changed

- **CI/CD: E2E Test Integration**
  - Added E2E test job to CI workflow running in parallel with build job
  - Uses `xvfb-run` for headless VS Code extension testing on Linux CI
  - Set `continue-on-error: true` as E2E tests can be flaky due to environment

## [0.10.39] - 2026-01-08

### Added

- **Codecov Integration**
  - Added code coverage reporting to CI workflow using c8
  - Coverage data automatically uploaded to Codecov on every CI run
  - Added Codecov badge to all 28 README files (monorepo root + 27 language variants)

## [0.10.38] - 2026-01-08

### Added

- **Security Badges**
  - Added SLSA level 3 badge (supply chain security attestation)
  - Added Security badge (CodeQL analysis workflow status)
  - Added CI badge (build and test workflow status)
  - Updated all 28 README files (monorepo root + 27 language variants)

## [0.10.37] - 2026-01-08

### Changed

- **CI/CD: Attach SLSA Provenance to releases**
  - Provenance bundle (`.intoto.jsonl`) now included in release assets
  - Enables OpenSSF Scorecard Signed-Releases detection
  - Provenance also stored in GitHub Attestation API for `gh attestation verify`

## [0.10.36] - 2026-01-08

### Added

- **OpenSSF Best Practices Badge**
  - Added OpenSSF Best Practices passing badge to all READMEs (28 files)
  - Project registered at bestpractices.dev (project #11709)

### Changed

- **CI/CD: Pin GitHub Actions to SHA hashes**
  - All actions in bot workflows now pinned to SHA for improved Scorecard Pinned-Dependencies score
  - Added explicit permissions to bot workflows for OpenSSF Scorecard compliance

### Security

- **Mend Bolt Integration**
  - Configured Mend Bolt for automated security scanning
  - Updated `minimist` to v1.2.6 (security fix)

## [0.10.35] - 2026-01-07

### Added

- **OpenSSF Scorecard Integration**
  - Added OpenSSF Scorecard GitHub Action for automated security scoring
  - Added OpenSSF Scorecard badge to READMEs
  - Configured branch protection score improvements

- **SLSA Provenance Attestation**
  - Added SLSA Provenance attestation for releases
  - Enhances supply chain security with verifiable build provenance

- **Root README Auto-Generation**
  - Added script to auto-generate root README.md from `docs/i18n/en/README.md`
  - Transforms relative URLs to absolute URLs for external platforms
  - GitHub Actions workflow for automatic regeneration on push/PR

### Changed

- **CI/CD: Pin Wrangler Version**
  - Pinned wrangler version for improved Pinned-Dependencies score

- **Dependency Updates**
  - Updated `actions/checkout` from 4.2.2 to 6.0.1
  - Updated `actions/setup-node` from 4.3.0 to 6.1.0
  - Updated `actions/upload-artifact` from 4.6.0 to 6.0.0
  - Updated `softprops/action-gh-release` from 2.2.1 to 2.5.0
  - Updated `github/codeql-action` to latest
  - Added GitHub Actions dependency grouping for Renovate

### Fixed

- **CI/CD: R2 Paths**
  - Updated R2 paths in publish.yml to monorepo structure

## [0.10.34] - 2026-01-06

### Changed

- **Documentation Webview: Unified English Path**
  - English README now served from `docs/i18n/en/README.md` (same structure as other languages)
  - Enables consistent in-Webview navigation between all languages
  - English fallback path also updated to i18n directory

### Added

- **English i18n README** (`docs/i18n/en/README.md`)
  - Contains relative language links for Webview navigation
  - Uses `-en` suffix for English-specific images (`demo-en.png`, `quickpick-en.png`)

- **Language Link Updates**
  - All 25 language READMEs updated to link to `../en/README.md`
  - LANGUAGES.md updated to link to `i18n/en/README.md`

## [0.10.33] - 2026-01-06

### Fixed

- **ESLint Error**: Wrapped lexical declaration in case block with braces (`no-case-declarations`)

## [0.10.32] - 2026-01-06

### Added

- **Documentation Webview: In-Webview Navigation**
  - Relative markdown links (e.g., `../../CONTRIBUTING.md`) now open within Webview instead of external browser
  - Panel title dynamically updates to show current document name (e.g., "README" → "CONTRIBUTING")
  - Back button with navigation history stack for returning to previous documents
  - Error handling: shows error page if previously visited document becomes unavailable

### Changed

- **Panel Title**: Now displays document name instead of localized "Documentation" title
  - Consistent title from initial load through navigation
  - Removed unused `PANEL_TITLES` constant and `getPanelTitle()` function

### Security

- All navigation security measures maintained:
  - CSP nonce-based script execution
  - Command whitelist (`navigate`, `back` only)
  - URL classification and validation

## [0.10.31] - 2026-01-05

### Changed

- **Documentation Webview URL**: Updated R2 fetch URLs to new monorepo-based structure
  - Base URL: `assets.nullvariant.com/git-id-switcher` → `assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher`
  - English README: `docs/i18n/en/README.md` → `README.md` (extension root)
  - Other languages: unchanged relative path (`docs/i18n/{locale}/README.md`)

## [0.10.30] - 2026-01-05

### Changed

- **README Image URLs**: Migrated to new R2 directory structure
  - Old: `assets.nullvariant.com/git-id-switcher/images/`
  - New: `assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/`
  - Monorepo-based path structure for better organization and analytics
  - Affects all 28 README files (English root + 26 language translations + monorepo root)

## [0.10.29] - 2026-01-04

### Fixed

- **Documentation Webview: relative URL conversion**:
  - Convert relative paths (e.g., `../zh-CN/README.md`) to absolute GitHub URLs for Webview display
  - Preserves relative paths in source READMEs for GitHub/local viewing

## [0.10.28] - 2026-01-04

### Fixed

- **Documentation Webview: double-backtick inline code support**:
  - Added support for ``` `` ` `` ``` syntax (backtick inside inline code)
  - Process double-backtick patterns before single-backtick patterns

## [0.10.27] - 2026-01-04

### Fixed

- **Documentation Webview rendering stability**:
  - Fixed table headers: all header cells now display correctly (removed incorrect `slice(1, -1)`)
  - Fixed placeholder format: changed from `<<>>` to `%%` to avoid HTML tag confusion
  - Added `img` to block element cleanup list

## [0.10.26] - 2026-01-04

### Fixed

- **Documentation Webview: complete HTML element support**:
  - Fixed tables: empty cells no longer cause column misalignment
  - Added h4, h5, h6 heading support
  - Added image support (`![alt](src)`)

## [0.10.25] - 2026-01-04

### Fixed

- **Documentation Webview Markdown rendering overhaul**:
  - Fixed blockquotes: consecutive `>` lines now merge into single blockquote
  - Fixed code blocks: removed unwanted line breaks inside `<pre>` blocks
  - Fixed tables: moved table parsing before other transformations
  - Replaced `<br>` approach with proper `<p>` paragraph handling
  - Cleaner HTML output with proper block element handling

## [0.10.24] - 2026-01-04

### Fixed

- **Documentation Webview Markdown rendering improvements**:
  - Added Markdown table support (header/body rows converted to HTML `<table>`)
  - Added horizontal rule support (`---`, `***` → `<hr>`)
  - Added ordered list support (`1.`, `2.`, etc. → `<li>`)
  - Added blockquote support (`>` → `<blockquote>`)
  - Added CSS styling for tables, blockquotes, and horizontal rules
  - Fixed single newlines now convert to `<br>` for better readability

## [0.10.23] - 2026-01-04

### Fixed

- **Documentation Webview badges not displaying**: Added `img.shields.io` to CSP `img-src` directive
- **Code blocks with hyphenated language names broken**: Fixed regex to match `ssh-config`, `c++`, etc.
  - Changed from `\w*` to `[^\n\r]*` to capture any language identifier
  - Also handle Windows line endings (`\r\n`)

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
  - Images hosted on CDN: `assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-{lang}.png`
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
  - Affected settings: identities, defaultIdentity, autoSwitchSshKey, applyToSubmodules, submoduleDepth, showNotifications, includeIconInGitConfig, logging.\* (5 settings), commandTimeouts
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
  - Debugging: Log settings (logging.\*)
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
  - Updated all 17 localization files (l10n/bundle.l10n\*.json)
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

[Unreleased]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.17...HEAD
[0.16.17]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.16...git-id-switcher-v0.16.17
[0.16.16]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.15...git-id-switcher-v0.16.16
[0.16.15]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.14...git-id-switcher-v0.16.15
[0.16.14]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.13...git-id-switcher-v0.16.14
[0.16.13]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.12...git-id-switcher-v0.16.13
[0.16.12]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.11...git-id-switcher-v0.16.12
[0.16.11]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.10...git-id-switcher-v0.16.11
[0.16.10]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.9...git-id-switcher-v0.16.10
[0.16.9]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.8...git-id-switcher-v0.16.9
[0.16.8]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.7...git-id-switcher-v0.16.8
[0.16.7]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.6...git-id-switcher-v0.16.7
[0.16.6]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.5...git-id-switcher-v0.16.6
[0.16.5]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.4...git-id-switcher-v0.16.5
[0.16.4]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.3...git-id-switcher-v0.16.4
[0.16.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.2...git-id-switcher-v0.16.3
[0.16.2]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.1...git-id-switcher-v0.16.2
[0.16.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.16.0...git-id-switcher-v0.16.1
[0.16.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.15.1...git-id-switcher-v0.16.0
[0.15.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.15.0...git-id-switcher-v0.15.1
[0.15.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.14.4...git-id-switcher-v0.15.0
[0.14.4]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.14.3...git-id-switcher-v0.14.4
[0.14.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.14.2...git-id-switcher-v0.14.3
[0.14.2]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.14.1...git-id-switcher-v0.14.2
[0.14.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.14.0...git-id-switcher-v0.14.1
[0.14.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.8...git-id-switcher-v0.14.0
[0.13.8]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.7...git-id-switcher-v0.13.8
[0.13.7]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.6...git-id-switcher-v0.13.7
[0.13.6]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.5...git-id-switcher-v0.13.6
[0.13.5]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.4...git-id-switcher-v0.13.5
[0.13.4]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.3...git-id-switcher-v0.13.4
[0.13.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.2...git-id-switcher-v0.13.3
[0.13.2]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.1...git-id-switcher-v0.13.2
[0.13.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.13.0...git-id-switcher-v0.13.1
[0.13.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.12.3...git-id-switcher-v0.13.0
[0.12.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.12.2...git-id-switcher-v0.12.3
[0.12.2]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.12.1...git-id-switcher-v0.12.2
[0.12.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.12.0...git-id-switcher-v0.12.1
[0.12.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.11.3...git-id-switcher-v0.12.0
[0.11.3]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.11.2...git-id-switcher-v0.11.3
[0.11.2]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.11.1...git-id-switcher-v0.11.2
[0.11.1]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.11.0...git-id-switcher-v0.11.1
[0.11.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.48...git-id-switcher-v0.11.0
[0.10.48]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.47...git-id-switcher-v0.10.48
[0.10.47]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.46...git-id-switcher-v0.10.47
[0.10.46]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.45...git-id-switcher-v0.10.46
[0.10.45]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.44...git-id-switcher-v0.10.45
[0.10.44]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.43...git-id-switcher-v0.10.44
[0.10.43]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.42...git-id-switcher-v0.10.43
[0.10.42]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.41...git-id-switcher-v0.10.42
[0.10.41]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.40...git-id-switcher-v0.10.41
[0.10.40]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.39...git-id-switcher-v0.10.40
[0.10.39]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.38...git-id-switcher-v0.10.39
[0.10.38]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.37...git-id-switcher-v0.10.38
[0.10.37]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.36...git-id-switcher-v0.10.37
[0.10.36]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.35...git-id-switcher-v0.10.36
[0.10.35]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.34...git-id-switcher-v0.10.35
[0.10.34]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.33...git-id-switcher-v0.10.34
[0.10.33]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.32...git-id-switcher-v0.10.33
[0.10.32]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.31...git-id-switcher-v0.10.32
[0.10.31]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.30...git-id-switcher-v0.10.31
[0.10.30]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.29...git-id-switcher-v0.10.30
[0.10.29]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.28...git-id-switcher-v0.10.29
[0.10.28]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.27...git-id-switcher-v0.10.28
[0.10.27]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.26...git-id-switcher-v0.10.27
[0.10.26]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.25...git-id-switcher-v0.10.26
[0.10.25]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.24...git-id-switcher-v0.10.25
[0.10.24]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.23...git-id-switcher-v0.10.24
[0.10.23]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.22...git-id-switcher-v0.10.23
[0.10.22]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.21...git-id-switcher-v0.10.22
[0.10.21]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.20...git-id-switcher-v0.10.21
[0.10.20]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-id-switcher-v0.10.19...git-id-switcher-v0.10.20
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
