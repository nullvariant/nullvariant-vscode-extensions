# Threat Model

> Based on the [STRIDE](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats) framework.
>
> Last updated: 2026-03-17

---

## Scope

This threat model covers the Git ID Switcher VS Code extension. The extension manages Git identities (name, email, SSH keys, GPG keys) and interacts with external binaries (`git`, `ssh-add`, `ssh-keygen`) via child processes.

### Trust Boundaries

```text
┌─────────────────────────────────────────────────┐
│  VS Code Extension Host (trusted runtime)       │
│  ┌───────────────────────────────────────────┐  │
│  │  Git ID Switcher                          │  │
│  │  ┌─────────────┐  ┌────────────────────┐  │  │
│  │  │ User Config  │  │ Security Layer     │  │  │
│  │  │ (settings)   │  │ (validators,       │  │  │
│  │  │              │  │  allowlist,         │  │  │
│  │  │              │  │  secureExec)        │  │  │
│  │  └──────┬───────┘  └────────┬───────────┘  │  │
│  └─────────┼───────────────────┼──────────────┘  │
│            │ trust boundary    │                  │
└────────────┼───────────────────┼──────────────────┘
             │                   │
     ┌───────▼───────┐  ┌───────▼───────┐
     │ User Settings │  │ External      │
     │ (JSON)        │  │ Binaries      │
     │               │  │ (git, ssh-add,│
     │               │  │  ssh-keygen)  │
     └───────────────┘  └───────────────┘
```

---

## Spoofing (S)

### S1: Git Identity Forgery

| Aspect                   | Detail                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker modifies Git identity to impersonate another developer                                                                                      |
| **Attack Vector**        | Malicious workspace settings override identity config                                                                                                |
| **Existing Mitigations** | VS Code Workspace Trust integration; extension enters restricted mode in untrusted workspaces; identity changes are logged via security audit logger |
| **Residual Risk**        | Low — trusted workspaces can modify identity by design                                                                                               |

### S2: SSH Key Substitution

| Aspect                   | Detail                                                                                                                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker replaces SSH key path to load a malicious key                                                                                                                                                                        |
| **Attack Vector**        | Modified `sshKeyPath` in configuration                                                                                                                                                                                        |
| **Existing Mitigations** | Path validation pipeline (null bytes, traversal, symlinks, control chars, invisible Unicode incl. Bidi override — CVE-2021-42574); SSH key basename exact-match; key file type/size/permission validation; regular files only |
| **Residual Risk**        | Very low — multi-layer path validation blocks traversal, symlink, and Trojan Source attacks; SSH key matching is exact                                                                                                        |

### S3: Extension Impersonation (Typosquatting)

| Aspect                   | Detail                                                                                                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker publishes a fake extension with a similar name to trick users into installing it                                                                                                                                                                                 |
| **Attack Vector**        | VS Code Marketplace / Open VSX typosquatting (similar publisher name, extension name, or icon)                                                                                                                                                                            |
| **Existing Mitigations** | Cosign keyless VSIX signing (users can cryptographically verify authenticity); SLSA Level 3 build provenance; README fingerprint section (Publisher ID, Extension ID, repository URL); SECURITY.md typosquat reporting procedure; CI-enforced package.json URL validation |
| **Residual Risk**        | Medium — most users do not verify signatures; Verified Publisher badge planned for additional visual trust signal                                                                                                                                                         |

---

## Tampering (T)

### T1: Configuration File Tampering

| Aspect                   | Detail                                                                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker modifies VS Code settings to inject malicious config                                                                                                                                                                                  |
| **Attack Vector**        | Direct modification of `.vscode/settings.json`                                                                                                                                                                                                 |
| **Existing Mitigations** | JSON schema validation (`configSchema.ts`); field length limits; type enforcement; identity duplicate detection at schema + runtime; prototype pollution defense (`__proto__`, `constructor`, `prototype` keys rejected via `Object.hasOwn()`) |
| **Residual Risk**        | Low — VS Code Workspace Trust gates untrusted workspace settings                                                                                                                                                                               |

### T2: Command Argument Injection

| Aspect                   | Detail                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker injects malicious arguments into git/ssh commands                                                                                                                                     |
| **Attack Vector**        | Crafted identity fields (name, email) containing shell metacharacters                                                                                                                          |
| **Existing Mitigations** | `execFile()` bypasses shell interpretation; strict command allowlist; argument count (max 20) and length (max 256) limits; flag injection prevention; flag validator rejects unsafe characters |
| **Residual Risk**        | Very low — `execFile()` + allowlist eliminates shell injection                                                                                                                                 |

### T3: VSIX Binary Tampering

| Aspect                   | Detail                                                                                                                                                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Supply chain attack replaces legitimate VSIX with malicious version                                                                                                                                                                                                    |
| **Attack Vector**        | Compromised marketplace, CDN, or download source                                                                                                                                                                                                                       |
| **Existing Mitigations** | SLSA Level 3 build provenance; Cosign keyless VSIX signing (failure blocks release); Harden Runner egress-policy `block` on publish job with explicit allowed-endpoints; Trivy pre-publish scan; CycloneDX SBOM with attestation; npm audit `high` severity gate in CI |
| **Residual Risk**        | Very low — cryptographic verification available via `cosign verify-blob` and `gh attestation verify`; egress blocking limits exfiltration during build                                                                                                                 |

---

## Repudiation (R)

### R1: Identity Switch Denial

| Aspect                   | Detail                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Threat**               | User denies having switched Git identity                                                                                                                                                   |
| **Attack Vector**        | No audit trail of identity operations                                                                                                                                                      |
| **Existing Mitigations** | Security audit logger records `IDENTITY_SWITCH`, `SSH_KEY_LOAD`, `SSH_KEY_REMOVE`, `CONFIG_CHANGE` events with timestamps; dual logging to Output Channel + file; sensitive data redaction |
| **Residual Risk**        | Low — file logging is opt-in; Output Channel logs are ephemeral                                                                                                                            |

---

## Information Disclosure (I)

### I1: SSH Key Path Leakage

| Aspect                   | Detail                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | SSH key filesystem paths exposed in logs or error messages                                                                                                                |
| **Attack Vector**        | Verbose error messages, debug logs                                                                                                                                        |
| **Existing Mitigations** | `sensitiveDataDetector.ts` redacts paths in logs; `MAX_LOG_STRING_LENGTH` truncation; `redactAllSensitive` mode for maximum privacy; path sanitization in security logger |
| **Residual Risk**        | Low — paths visible in VS Code settings by design (user's own data)                                                                                                       |

### I2: GPG Key ID Exposure

| Aspect                   | Detail                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | GPG key IDs leaked through logs or UI                                                                                           |
| **Attack Vector**        | Status bar display, notification messages                                                                                       |
| **Existing Mitigations** | GPG key IDs are intentionally displayed (they are public identifiers); sensitive data detector masks longer secret-like strings |
| **Residual Risk**        | Accepted — GPG key IDs are public by design                                                                                     |

---

## Denial of Service (D)

### D1: Resource Exhaustion via Identities

| Aspect                   | Detail                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker creates thousands of identities to exhaust memory                                                             |
| **Attack Vector**        | Malicious workspace configuration                                                                                      |
| **Existing Mitigations** | `MAX_IDENTITIES` limit (hardcoded, not configurable); field length limits on all string fields; icon byte length limit |
| **Residual Risk**        | Very low — hardcoded limits prevent abuse                                                                              |

### D2: Command Execution Hang

| Aspect                   | Detail                                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | External binary hangs, blocking extension                                                                                                                                                                                                                         |
| **Attack Vector**        | Unresponsive git server, ssh-agent deadlock                                                                                                                                                                                                                       |
| **Existing Mitigations** | Command-specific timeouts (git: 10s, ssh-add: 5s, ssh-keygen: 5s); custom `TimeoutError` class; user-configurable timeouts with range validation (1-300s); `ssh-add -D` (bulk key deletion) removed from allowlist — only individual key removal (`-d`) permitted |
| **Residual Risk**        | Very low — all external calls have timeouts                                                                                                                                                                                                                       |

### D3: Log File Growth

| Aspect                   | Detail                                                                                                                                                                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Log files consume excessive disk space or symlink-based log tampering                                                                                                                                                                                                               |
| **Attack Vector**        | High-frequency operations triggering repeated logging; symlink replacement of log file between check and open                                                                                                                                                                       |
| **Existing Mitigations** | Configurable `maxFileSize` and `maxFiles` with rotation (range-validated: 100KB-100MB, 1-100 files); file logging is opt-in; per-event-type rate limiter (10 events/10s window) prevents log flooding; `O_NOFOLLOW` flag on file open + `fstat()` symlink check (TOCTOU mitigation) |
| **Residual Risk**        | Very low — rotation + rate limiting + symlink protection prevent abuse                                                                                                                                                                                                              |

---

## Elevation of Privilege (E)

### E1: Command Injection via Shell

| Aspect                   | Detail                                                                                                                                                                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker executes arbitrary commands through the extension                                                                                                                                                                                                                       |
| **Attack Vector**        | Shell metacharacters in user input passed to `exec()`                                                                                                                                                                                                                            |
| **Existing Mitigations** | `execFile()` used exclusively (no shell); strict command allowlist (`git`, `ssh-add`, `ssh-keygen` only); binary path resolution prevents PATH pollution; argument validation with allowlisted flags; ESLint `no-restricted-imports` enforces `exec`/`execSync` ban at lint time |
| **Residual Risk**        | Very low — no shell interpretation path exists; lint-time enforcement prevents regressions                                                                                                                                                                                       |

### E2: PATH Pollution

| Aspect                   | Detail                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker places malicious binary earlier in PATH                                                                                                                                                                                                                                                                                                                                                                          |
| **Attack Vector**        | Modified PATH environment variable                                                                                                                                                                                                                                                                                                                                                                                        |
| **Existing Mitigations** | `binaryResolver.ts` resolves absolute paths using system `which`/`where` from hardcoded locations (`/usr/bin/which`, `C:\Windows\System32\where.exe`); resolved paths cached with 30-minute TTL (re-verified periodically); `git.path` setting validated via `git --version` output check; `which` fallback triggers user-visible warning (session-once); ESLint `no-restricted-imports` blocks `exec`/`execSync` imports |
| **Residual Risk**        | Very low — TTL-based cache prevents stale binary paths; `git.path` spoofing detected by version check                                                                                                                                                                                                                                                                                                                     |

### E3: Workspace Trust Bypass

| Aspect                   | Detail                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Extension operates in untrusted workspace                                                                                         |
| **Attack Vector**        | Opening a malicious repository                                                                                                    |
| **Existing Mitigations** | `workspaceTrust.ts` checks trust status; extension enters restricted mode when untrusted; commands are blocked in restricted mode |
| **Residual Risk**        | Very low — VS Code enforces trust boundary                                                                                        |

---

## Unmitigated Threats (Future Work)

| ID  | Threat                               | Category        | Notes                                                     |
| --- | ------------------------------------ | --------------- | --------------------------------------------------------- |
| T4  | Malicious VS Code extension host     | Tampering       | Out of scope — requires VS Code platform-level mitigation |
| I3  | Memory inspection of loaded SSH keys | Info Disclosure | Out of scope — OS-level memory protection required        |
