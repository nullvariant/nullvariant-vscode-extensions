# Threat Model

> Based on the [STRIDE](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats) framework.
>
> Last updated: 2026-03-15

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

| Aspect                   | Detail                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker replaces SSH key path to load a malicious key                                                                                                              |
| **Attack Vector**        | Modified `sshKeyPath` in configuration                                                                                                                              |
| **Existing Mitigations** | Path validation pipeline (null bytes, traversal, symlinks, control chars, invisible Unicode); key file type/size/permission validation; only regular files accepted |
| **Residual Risk**        | Low — multi-layer path validation blocks traversal and symlink attacks                                                                                              |

---

## Tampering (T)

### T1: Configuration File Tampering

| Aspect                   | Detail                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker modifies VS Code settings to inject malicious config                                                                       |
| **Attack Vector**        | Direct modification of `.vscode/settings.json`                                                                                      |
| **Existing Mitigations** | JSON schema validation (`configSchema.ts`); field length limits; type enforcement; identity duplicate detection at schema + runtime |
| **Residual Risk**        | Low — VS Code Workspace Trust gates untrusted workspace settings                                                                    |

### T2: Command Argument Injection

| Aspect                   | Detail                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker injects malicious arguments into git/ssh commands                                                                                                                                     |
| **Attack Vector**        | Crafted identity fields (name, email) containing shell metacharacters                                                                                                                          |
| **Existing Mitigations** | `execFile()` bypasses shell interpretation; strict command allowlist; argument count (max 20) and length (max 256) limits; flag injection prevention; flag validator rejects unsafe characters |
| **Residual Risk**        | Very low — `execFile()` + allowlist eliminates shell injection                                                                                                                                 |

### T3: VSIX Binary Tampering

| Aspect                   | Detail                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Supply chain attack replaces legitimate VSIX with malicious version                                                 |
| **Attack Vector**        | Compromised marketplace, CDN, or download source                                                                    |
| **Existing Mitigations** | SLSA Level 3 build provenance; Cosign keyless VSIX signing; Trivy pre-publish scan; CycloneDX SBOM with attestation |
| **Residual Risk**        | Very low — cryptographic verification available via `cosign verify-blob` and `gh attestation verify`                |

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

| Aspect                   | Detail                                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | External binary hangs, blocking extension                                                                                                                 |
| **Attack Vector**        | Unresponsive git server, ssh-agent deadlock                                                                                                               |
| **Existing Mitigations** | Command-specific timeouts (git: 10s, ssh-add: 5s, ssh-keygen: 5s); custom `TimeoutError` class; user-configurable timeouts with range validation (1-300s) |
| **Residual Risk**        | Very low — all external calls have timeouts                                                                                                               |

### D3: Log File Growth

| Aspect                   | Detail                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Log files consume excessive disk space                                                                                           |
| **Attack Vector**        | High-frequency operations triggering repeated logging                                                                            |
| **Existing Mitigations** | Configurable `maxFileSize` (default 10MB) and `maxFiles` (default 5) with rotation; file logging is opt-in (disabled by default) |
| **Residual Risk**        | Very low — rotation prevents unbounded growth                                                                                    |

---

## Elevation of Privilege (E)

### E1: Command Injection via Shell

| Aspect                   | Detail                                                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker executes arbitrary commands through the extension                                                                                                                                           |
| **Attack Vector**        | Shell metacharacters in user input passed to `exec()`                                                                                                                                                |
| **Existing Mitigations** | `execFile()` used exclusively (no shell); strict command allowlist (`git`, `ssh-add`, `ssh-keygen` only); binary path resolution prevents PATH pollution; argument validation with allowlisted flags |
| **Residual Risk**        | Very low — no shell interpretation path exists                                                                                                                                                       |

### E2: PATH Pollution

| Aspect                   | Detail                                                                                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Attacker places malicious binary earlier in PATH                                                                                                                                             |
| **Attack Vector**        | Modified PATH environment variable                                                                                                                                                           |
| **Existing Mitigations** | `binaryResolver.ts` resolves absolute paths using system `which`/`where` from hardcoded locations (`/usr/bin/which`, `C:\Windows\System32\where.exe`); resolved paths are cached per session |
| **Residual Risk**        | Low — hardcoded resolver paths minimize attack surface                                                                                                                                       |

### E3: Workspace Trust Bypass

| Aspect                   | Detail                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Threat**               | Extension operates in untrusted workspace                                                                                         |
| **Attack Vector**        | Opening a malicious repository                                                                                                    |
| **Existing Mitigations** | `workspaceTrust.ts` checks trust status; extension enters restricted mode when untrusted; commands are blocked in restricted mode |
| **Residual Risk**        | Very low — VS Code enforces trust boundary                                                                                        |

---

## Unmitigated Threats (Future Work)

| ID  | Threat                                  | Category        | Notes                                                                   |
| --- | --------------------------------------- | --------------- | ----------------------------------------------------------------------- |
| S3  | Extension impersonation (typosquatting) | Spoofing        | Partially mitigated by Cosign signing; Verified Publisher badge planned |
| T4  | Malicious VS Code extension host        | Tampering       | Out of scope — requires VS Code platform-level mitigation               |
| I3  | Memory inspection of loaded SSH keys    | Info Disclosure | Out of scope — OS-level memory protection required                      |
