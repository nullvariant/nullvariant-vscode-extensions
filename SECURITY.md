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

## Security Measures

This repository contains VS Code extensions with the following security measures:

### Git ID Switcher

- **Content Security Policy (CSP)**: Webview content is restricted to prevent XSS attacks
- **HTML Sanitization**: All external content (markdown from R2) is sanitized using `sanitize-html` before rendering
- **No eval()**: Script execution is disabled in webviews (`enableScripts: false` where possible)
- **Minimal Permissions**: Only requests necessary VS Code API permissions
- **Command Injection Prevention**: Git commands use `execFile` with explicit argument arrays, never string interpolation

### CI/CD Security

- **Dependency Pinning**: GitHub Actions are pinned to commit SHAs
- **Automated Security Scanning**: CodeQL analysis runs on every push
- **Daily Vulnerability Scans**: `npm audit` runs daily via scheduled workflow
- **Fork Protection**: Sensitive workflows skip on fork repositories
- **Runtime Security Monitoring**: [StepSecurity Harden-Runner](https://github.com/step-security/harden-runner) monitors all workflow runs for suspicious network egress, file access, and process execution

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

This section documents all secrets used in CI/CD workflows.

### Repository Secrets

| Name | Purpose | Used In | Rotation | Sensitivity |
| ---- | ------- | ------- | -------- | ----------- |
| VSCE_PAT | VS Code Marketplace publishing | publish.yml, unpublish.yml | Annual | High |
| OVSX_PAT | Open VSX publishing | publish.yml, unpublish.yml | Annual | High |
| CODECOV_TOKEN | Coverage reporting | ci.yml | As needed | Medium |
| CLOUDFLARE_API_TOKEN | Cloudflare Pages/R2 deployment | deploy-docs.yml, publish.yml | Annual | High |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare account identifier (public) | deploy-docs.yml, publish.yml | Never | Low (public ID) |

### GitHub App Secrets (6 bots × 2 secrets each)

| Bot | Secrets | Used In |
| --- | ------- | ------- |
| Justice | JUSTICE_BOT_APP_ID, JUSTICE_BOT_PRIVATE_KEY | justice-bot.yml |
| Luna | LUNA_BOT_APP_ID, LUNA_BOT_PRIVATE_KEY | luna-bot.yml |
| Slow | SLOW_BOT_APP_ID, SLOW_BOT_PRIVATE_KEY | slow-bot.yml |
| Blaze | BLAZE_BOT_APP_ID, BLAZE_BOT_PRIVATE_KEY | blaze-bot.yml |
| Ciel | CIEL_BOT_APP_ID, CIEL_BOT_PRIVATE_KEY | ciel-bot.yml |
| Mimi | MIMI_BOT_APP_ID, MIMI_BOT_PRIVATE_KEY | mimi-bot.yml |

**Security Notes for GitHub Apps**:

- Private Keys do not expire, but annual rotation is recommended
- APP_IDs are public identifiers (low sensitivity)
- Private Keys are high sensitivity - treat as passwords
- Each bot has minimal permissions scoped to its specific function

### Environment Protection

Marketplace publishing secrets (VSCE_PAT, OVSX_PAT) are protected by the `production` environment, which requires:

- Tag push matching `git-id-switcher-v*` pattern
- Repository owner approval (optional)

**Note**: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID remain as repository secrets (not environment secrets) because they are also used by deploy-docs.yml, which triggers on main branch push.

### Rotation Procedure

1. **Generate new token** from the provider (Azure DevOps, Open VSX, Cloudflare)
2. **Update GitHub secret** in repository settings
3. **Verify workflow execution** by triggering a test run
4. **Revoke old token** from the provider

### Provider Links

| Secret | Provider | Management URL | Expiration |
| ------ | -------- | -------------- | ---------- |
| VSCE_PAT | Azure DevOps | [Azure DevOps Tokens](https://dev.azure.com/nullvariant/_usersSettings/tokens) | 2027-01-08 |
| OVSX_PAT | Open VSX | [Open VSX Tokens](https://open-vsx.org/user-settings/tokens) | No expiration |
| CLOUDFLARE_API_TOKEN | Cloudflare | [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) | No expiration |
| CODECOV_TOKEN | Codecov | [Codecov Settings](https://app.codecov.io/account/gh/nullvariant/settings) | No expiration |
| GitHub App Keys | GitHub | [GitHub Apps](https://github.com/settings/apps) | No expiration |

**Token Details**:

- **CLOUDFLARE_API_TOKEN**: Named `nullvariant-vscode-extensions-github-actions-deploy`, permissions: Workers R2 Storage:Edit
