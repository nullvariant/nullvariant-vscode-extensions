# Changelog

All notable changes to the Git Identity Switcher extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Submodule support (auto-apply identity to submodules)
- Remote URL auto-switching based on identity

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

[Unreleased]: https://github.com/nullvariant/nullvariant-vscode-extensions/compare/git-identity-switcher-v0.1.0...HEAD
[0.1.0]: https://github.com/nullvariant/nullvariant-vscode-extensions/releases/tag/git-identity-switcher-v0.1.0
