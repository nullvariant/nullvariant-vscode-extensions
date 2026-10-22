# Security Policy

## Scope

This security policy applies to the **nullvariant-vscode-extensions** monorepo, which contains:

- **Git ID Switcher** (`extensions/git-id-switcher/`) - VS Code extension for switching Git identities

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **GitHub Security Advisory (preferred)**
   - Go to Security tab → "Report a vulnerability"
   - We will respond within 48 hours

2. **Email**
   - `security@nullvariant.com`
   - Use PGP encryption if possible (key available on request)

**Please do NOT open a public issue for security vulnerabilities.**

## Reporting Typosquatting

If you find a VS Code extension with a similar name to **Git ID Switcher** from a different publisher, it may be a typosquat attempt. Please report it:

1. **Report to us** via [GitHub Security Advisory](https://github.com/nullvariant/nullvariant-vscode-extensions/security/advisories/new) or email `security@nullvariant.com`
2. **Report to the marketplace**:
   - VS Code Marketplace: Use the "Report" button on the extension page, or email `vscext@microsoft.com`
   - Open VSX: File an issue at [open-vsx/publish-extensions](https://github.com/open-vsx/publish-extensions/issues)

### How to Verify Authenticity

| Check            | Expected Value                                                                      |
| ---------------- | ----------------------------------------------------------------------------------- |
| Publisher        | `nullvariant`                                                                       |
| Extension ID     | `nullvariant.git-id-switcher`                                                       |
| Repository URL   | `https://github.com/nullvariant/nullvariant-vscode-extensions`                      |
| VSIX signature   | Verifiable via `cosign verify-blob` (see [README](README.md#supply-chain-security)) |
| Build provenance | Verifiable via `gh attestation verify` (SLSA Level 3)                               |

## Security Measures

This repository contains VS Code extensions with the following security measures:

### Git ID Switcher

- **Content Security Policy (CSP)**: Webview content is restricted to prevent XSS attacks
- **Content Integrity**: CDN content is verified using SHA-256 hash allowlist before rendering
- **No eval()**: Script execution is disabled in webviews (`enableScripts: false` where possible)
- **Minimal Permissions**: Only requests necessary VS Code API permissions
- **Command Injection Prevention**: Git commands use `execFile` with explicit argument arrays, never string interpolation

### CI/CD Security

- **Dependency Pinning**: GitHub Actions are pinned to commit SHAs
- **Automated Security Scanning**: CodeQL analysis runs on every push
- **Static Code Analysis**: [SonarCloud](https://sonarcloud.io/project/overview?id=nullvariant_nullvariant-vscode-extensions) runs on every push and PR (CI-based analysis)
- **Daily Vulnerability Scans**: `npm audit` runs daily via scheduled workflow
- **Fork Protection**: Sensitive workflows skip on fork repositories
- **SAST (Snyk Code)**: [Snyk](https://snyk.io/) runs static analysis; test fixtures are excluded via `.snyk` policy
- **License & Vulnerability Scanning**: [FOSSA](https://app.fossa.com/) runs license compliance, dependency quality, and security analysis on every commit (GitHub App integration)
- **Secret Detection**: [Gitleaks](https://github.com/gitleaks/gitleaks) scans for hardcoded secrets in both CI (`security.yml`) and pre-commit hooks (`.pre-commit-config.yaml`)
- **Runtime Security Monitoring**: [StepSecurity Harden-Runner](https://github.com/step-security/harden-runner) monitors all workflow runs for suspicious network egress, file access, and process execution
- **Branch Protection**: Main branch requires PR approval (1 reviewer minimum), the `build` checks on Ubuntu, Windows, and macOS, and signed commits. nullvariant-justice[bot] approves pull requests from branches of this repository after CI passes (solo-developer workflow for [OpenSSF Scorecard](https://securityscorecards.dev/) compliance); pull requests from forks are not auto-approved. Dependency bot pull requests are approved after a safety review of the update, which may happen before CI finishes. Approval alone does not merge anything: the required checks still have to pass. Enforced by [Allstar](https://github.com/ossf/allstar/)

## Security Testing

Security-focused tests are included in the test suite:

```bash
npm run test:security
```

This includes tests for:

- Command injection vectors
- XSS prevention in webviews
- CSP policy enforcement

## Secrets Management

This section documents all secrets used in CI/CD workflows. Publishing and deployment credentials live in environment secrets, so only the branches or tags each environment allows can read them.

### Release Flow

1. A pull request that bumps the version in `extensions/git-id-switcher/package.json` is merged to `main`.
2. `auto-tag.yml` gets a one-hour installation token from the `git-id-switcher-release-tagger` GitHub App and pushes the tag `git-id-switcher-v<version>`.
3. `publish.yml` runs its `build` job without any publishing credential. The job checks the version and that the tag commit is on `main`, builds the VSIX, scans the extension directory with Trivy, signs and attests the VSIX, and records its SHA-256.
4. The publish jobs (`github-release`, `marketplace`, `open-vsx`, `docs`) wait for the repository owner's approval of the `production` environment. The `marketplace` and `open-vsx` jobs run only when the repository variables `PUBLISH_TO_MARKETPLACE` and `PUBLISH_TO_OPENVSX` are `true`. All four jobs use the same environment, but each publishing step passes only its own destination's credential, and the jobs that ship the VSIX check it against the recorded SHA-256.

### Repository Secrets

| Name        | Purpose                  | Used In        | Rotation  | Sensitivity |
| ----------- | ------------------------ | -------------- | --------- | ----------- |
| SONAR_TOKEN | SonarCloud code analysis | sonarcloud.yml | As needed | Medium      |

### Environment Secrets

| Environment       | Name                       | Purpose                                               | Used In                                 | Rotation | Sensitivity     |
| ----------------- | -------------------------- | ----------------------------------------------------- | --------------------------------------- | -------- | --------------- |
| `release-tagging` | RELEASE_TAGGER_CLIENT_ID   | Client ID of the `git-id-switcher-release-tagger` App | auto-tag.yml                            | Never    | Low (public ID) |
| `release-tagging` | RELEASE_TAGGER_PRIVATE_KEY | Private key of the release tagging App                | auto-tag.yml                            | Annual   | High            |
| `production`      | VSCE_PAT                   | VS Code Marketplace publishing                        | publish.yml (`marketplace`)             | Annual   | High            |
| `production`      | OVSX_PAT                   | Open VSX publishing and version removal (unpublish)   | publish.yml (`open-vsx`), unpublish.yml | Annual   | High            |
| `production`      | CLOUDFLARE_API_TOKEN       | R2 documentation deployment                           | publish.yml (`docs`)                    | Annual   | High            |
| `production`      | CLOUDFLARE_ACCOUNT_ID      | Cloudflare account identifier (public)                | publish.yml (`docs`)                    | Never    | Low (public ID) |
| `docs-deploy`     | CLOUDFLARE_API_TOKEN       | R2 documentation deployment                           | deploy-docs.yml                         | Annual   | High            |
| `docs-deploy`     | CLOUDFLARE_ACCOUNT_ID      | Cloudflare account identifier (public)                | deploy-docs.yml                         | Never    | Low (public ID) |

The two Cloudflare secrets hold the same values in both environments.

`unpublish.yml` is started by hand, defaults to a dry run, and waits for the `production` approval, so it can only run on a release tag. It removes the requested versions from Open VSX when `PUBLISH_TO_OPENVSX` is `true`; versions on VS Code Marketplace are removed by hand, because `vsce unpublish` can only remove the whole extension.

### GitHub App Secrets (6 bots × 2 secrets each)

| Bot     | Secrets                                     | Used In         |
| ------- | ------------------------------------------- | --------------- |
| Justice | JUSTICE_BOT_APP_ID, JUSTICE_BOT_PRIVATE_KEY | justice-bot.yml |
| Luna    | LUNA_BOT_APP_ID, LUNA_BOT_PRIVATE_KEY       | luna-bot.yml    |
| Slow    | SLOW_BOT_APP_ID, SLOW_BOT_PRIVATE_KEY       | slow-bot.yml    |
| Blaze   | BLAZE_BOT_APP_ID, BLAZE_BOT_PRIVATE_KEY     | blaze-bot.yml   |
| Ciel    | CIEL_BOT_APP_ID, CIEL_BOT_PRIVATE_KEY       | ciel-bot.yml    |
| Mimi    | MIMI_BOT_APP_ID, MIMI_BOT_PRIVATE_KEY       | mimi-bot.yml    |

**Security Notes for GitHub Apps**:

- Private Keys do not expire, but annual rotation is recommended
- APP_IDs and Client IDs are public identifiers (low sensitivity)
- Private Keys are high sensitivity - treat as passwords
- The six bots have Contents and Pull requests (read and write) and no Workflows, Actions, or Administration permission. They use these to open pull requests from their own branches and to comment on, or in Justice's case approve, pull requests. None of them can bypass the `main` branch rules
- The release tagging App has Contents (read and write) only, is installed on this repository only, and has no webhook

### Environment Protection

| Environment       | Who can deploy                     | Approval                          |
| ----------------- | ---------------------------------- | --------------------------------- |
| `production`      | Tags matching `git-id-switcher-v*` | Repository owner (required)       |
| `release-tagging` | The `main` branch                  | None (runs on every version bump) |
| `docs-deploy`     | The `main` branch                  | None                              |

Administrators cannot bypass the `production` environment's protection rules.

### Release Tag Protection

- **Creation**: Only the `git-id-switcher-release-tagger` App can create `git-id-switcher-v*` tags (ruleset `release-tags-create`). Tags pushed by anyone else, including administrators, are rejected.
- **Update and deletion**: Nobody can move or delete an existing `git-id-switcher-v*` tag (ruleset `release-tags-protect`).
- **Immutable releases**: Published GitHub Releases cannot have their assets changed.

### Rotation Procedure

1. **Generate a new credential** from the provider (Azure DevOps, Open VSX, Cloudflare, or the GitHub App's Key pairs)
2. **Update the GitHub secret** in the environment (or repository) the secret belongs to
3. **Verify workflow execution** by triggering a test run
4. **Revoke the old credential** from the provider

### Provider Links

| Secret                     | Provider     | Management URL                                                                 | Expiration    |
| -------------------------- | ------------ | ------------------------------------------------------------------------------ | ------------- |
| RELEASE_TAGGER_PRIVATE_KEY | GitHub       | [GitHub Apps](https://github.com/settings/apps)                                | No expiration |
| VSCE_PAT                   | Azure DevOps | [Azure DevOps Tokens](https://dev.azure.com/nullvariant/_usersSettings/tokens) | 2027-01-08    |
| OVSX_PAT                   | Open VSX     | [Open VSX Tokens](https://open-vsx.org/user-settings/tokens)                   | No expiration |
| CLOUDFLARE_API_TOKEN       | Cloudflare   | [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)        | No expiration |
| SONAR_TOKEN                | SonarCloud   | [SonarCloud Security](https://sonarcloud.io/account/security)                  | No expiration |
| GitHub App Keys            | GitHub       | [GitHub Apps](https://github.com/settings/apps)                                | No expiration |

**Token Details**:

- **CLOUDFLARE_API_TOKEN**: Named `nullvariant-vscode-extensions-github-actions-deploy`, permissions: Workers R2 Storage:Edit, limited to a single account
- **RELEASE_TAGGER_PRIVATE_KEY**: Private key of the `git-id-switcher-release-tagger` GitHub App. `auto-tag.yml` exchanges it for a one-hour installation token to push release tags that trigger the publish workflow (built-in GITHUB_TOKEN pushes do not re-trigger workflows)

## See Also

- [GOVERNANCE.md](GOVERNANCE.md) — Project governance model
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — Garden etiquette
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute
- [AGENTS.md](AGENTS.md) — Constraints for AI-assisted contributions
- [Git ID Switcher Threat Model](extensions/git-id-switcher/docs/THREAT_MODEL.md) — STRIDE-based threat analysis
