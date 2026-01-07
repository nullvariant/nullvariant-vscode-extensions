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
   - security@nullvariant.com
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

## Security Testing

Security-focused tests are included in the test suite:

```bash
npm run test:security
```

This includes tests for:
- Command injection vectors
- XSS prevention in webviews
- CSP policy enforcement
