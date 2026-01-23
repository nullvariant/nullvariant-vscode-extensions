# Architecture Guide

> **"Safety First, Quality Second, Production Third"**
>
> This codebase embodies this manufacturing principle.
> Security is never sacrificed for elegance or speed.

---

> **Audience**: Developers modifying this codebase
>
> This document explains technical design patterns and intentional complexity.
> For philosophy, see [DESIGN_PHILOSOPHY.md](./DESIGN_PHILOSOPHY.md).
> For contribution process, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Table of Contents

- [Document Map](#document-map)
- [Intentional Patterns](#intentional-patterns)
- [Code Markers](#code-markers)
- [Module Responsibilities](#module-responsibilities)
- [Patterns That Look Wrong But Aren't](#patterns-that-look-wrong-but-arent)
- [Testing Philosophy](#testing-philosophy)
- [Refactoring Guidelines](#refactoring-guidelines)
- [Architecture Decisions](#architecture-decisions)
- [Security Constants](#security-constants)
- [Command Execution Flow](#command-execution-flow)
- [File Size Rationale](#file-size-rationale)
- [Directory Structure](#directory-structure)

---

## Quick Reference

### Should I Change This Code?

| If you see...                      | Then...                           |
| ---------------------------------- | --------------------------------- |
| `/* c8 ignore */` comment          | Don't try to add tests for it     |
| `// defense-in-depth` comment      | Don't remove "redundant" checks   |
| `// SECURITY:` comment             | Read carefully before modifying   |
| Silent `catch` block in SSH code   | It's intentional, leave it        |
| Multiple validators for same thing | Defense-in-depth, keep all layers |

### Key File Sizes (Expected to Be Large)

- `secureExec.ts` ~657 lines
- `sshAgent.ts` ~620 lines
- `pathSecurity.ts` ~591 lines

---

## Document Map

| Document             | Purpose                      | Audience       |
| -------------------- | ---------------------------- | -------------- |
| DESIGN_PHILOSOPHY.md | Why we build this way        | Anyone curious |
| **ARCHITECTURE.md**  | How the code is structured   | Developers     |
| CONTRIBUTING.md      | What to do when contributing | Contributors   |

---

## Intentional Patterns

This codebase contains patterns that may appear redundant or over-engineered. **They are intentional.** This section catalogs them so you don't "fix" what isn't broken.

### Multi-Layer Validation (Defense-in-Depth)

The same check may appear at multiple layers. This is by design.

#### Null Byte Validation

| Layer                 | File                   | Purpose                               |
| --------------------- | ---------------------- | ------------------------------------- |
| 1. Common             | `validators/common.ts` | `hasNullByte()` utility               |
| 2. Path Security      | `pathSecurity.ts`      | `validateNoNullBytes()` in pipeline   |
| 3. Path Normalization | `path/normalize.ts`    | Defense-in-depth before normalization |

**Why multiple layers?**

- Layer 1 provides reusable detection
- Layer 2 catches user input errors early in path validation pipeline
- Layer 3 is defense-in-depth (should never trigger if layer 2 works)

**Code marker**: `/* c8 ignore start - Defense-in-depth */`

#### Control Character Validation

Two validation phases exist in the path validation pipeline:

| Phase              | Validators                                                                                 | Purpose                                                |
| ------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Pre-normalization  | `validateNoControlChars`, `validateNoInvisibleUnicode`                                     | Catch attacks before normalization                     |
| Post-normalization | `validateNoControlCharsAfterNormalization`, `validateNoInvisibleUnicodeAfterNormalization` | Catch edge cases where normalization introduces issues |

**Do not remove post-normalization validators.** Unicode NFC normalization can theoretically introduce new characters.

#### PATH_MAX Validation

Checked at multiple points because:

1. Path expansion (`~` → `/home/username`) changes length
2. Path concatenation may exceed limits
3. Different operations have different length tolerances

### Identity Duplicate Detection (2 Layers)

| Layer      | Location                  | Trigger                           |
| ---------- | ------------------------- | --------------------------------- |
| 1. Schema  | `configSchema.ts:361-377` | Configuration validation          |
| 2. Runtime | `identity.ts:126-138`     | Before adding to valid identities |

Layer 2 has explicit comment:

```typescript
// Check for duplicate IDs (defense-in-depth: schema validation also checks this)
```

**Do not remove "redundant" checks.** They protect different trust boundaries.

### Silent Error Handling in SSH Agent

In `sshAgent.ts`, some errors are intentionally swallowed:

```typescript
// removeSshKey (line 243)
try {
  await sshAgentExec(['-d', expandedPath]);
} catch (error) {
  // Ignore errors (key might not be loaded)
}

// removeAllIdentityKeys (line 257)
.map(identity =>
  removeSshKey(identity.sshKeyPath!).catch(() => {
    // Ignore individual errors
  })
)
```

**This is correct.** SSH key removal is best-effort cleanup. The key may:

- Already be unloaded
- Have never been loaded
- Belong to a different agent

Surfacing these errors would confuse users with irrelevant messages.

---

## Code Markers

### Coverage Exclusion Markers

| Marker                                      | Meaning                                       |
| ------------------------------------------- | --------------------------------------------- |
| `/* c8 ignore start - Defense-in-depth */`  | Intentionally unreachable in normal operation |
| `/* c8 ignore start - VS Code API */`       | Cannot be unit tested without VS Code         |
| `/* c8 ignore start - Error path */`        | Defensive error handling                      |
| `/* c8 ignore start - Platform-specific */` | Platform-specific branches                    |

**159 coverage exclusion markers** exist across the codebase. When you see these markers: The code is intentionally excluded from coverage requirements. Don't remove them or try to add tests that exercise them.

### Comment Patterns

| Pattern                      | Example Files                  | Purpose                                        |
| ---------------------------- | ------------------------------ | ---------------------------------------------- |
| `// SECURITY:`               | `sshAgent.ts`, `secureExec.ts` | Security-critical code explanation             |
| `// Note: Defense-in-depth.` | `pathSecurity.ts`              | Explains why seemingly unreachable code exists |
| `@see https://owasp.org/...` | Multiple                       | Links to security references                   |

**Do not strip comments** for "cleaner code."

---

## Module Responsibilities

### Security Layer (`src/`)

| File                  | Lines | Single Responsibility                    |
| --------------------- | ----- | ---------------------------------------- |
| `pathSecurity.ts`     | ~591  | Path validation pipeline (19 validators) |
| `secureExec.ts`       | ~657  | Safe command execution with timeout      |
| `securityLogger.ts`   | -     | Structured security event logging        |
| `commandAllowlist.ts` | -     | Allowed commands for secureExec          |
| `binaryResolver.ts`   | -     | Absolute binary path resolution          |

### Path Security Sub-modules (`src/path/security/`)

| File           | Responsibility                                    |
| -------------- | ------------------------------------------------- |
| `unicode.ts`   | Invisible Unicode and control character detection |
| `traversal.ts` | Path traversal attack detection                   |

**pathSecurity.ts** orchestrates 19 individual validators:

| Category          | Count | Examples                                                  |
| ----------------- | ----- | --------------------------------------------------------- |
| Basic checks      | 4     | Empty, whitespace, null bytes, length                     |
| Prefix validation | 2     | Tilde pattern, allowed prefixes                           |
| Windows-specific  | 4     | Drive letters, UNC paths, device paths, reserved names    |
| Unicode attacks   | 4     | Control chars, invisible Unicode (pre/post normalization) |
| Traversal attacks | 5     | `..`, `//`, `\`, trailing dot, trailing `/.`              |

**Do not consolidate** into a single monolithic validator. Separation enables:

- Independent testing per validator
- Audit trail showing exactly which check failed
- Adding/removing checks doesn't affect others

### SSH Key Validation (`src/sshAgent.ts`)

5 separate validation functions exist:

| Function                       | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `validateKeyPath()`            | Path format and security validation                 |
| `validateKeyFileType()`        | Must be regular file (not directory/symlink/device) |
| `validateKeyFileSize()`        | 10 bytes min, 1MB max (DoS protection)              |
| `validateKeyFilePermissions()` | Unix only - no group/others access                  |
| `validateKeyFileForSshAdd()`   | Orchestrates all validations + format check         |

**Do not merge** these functions. Separation enables:

- Granular error messages
- Independent testing
- Clear failure attribution

---

## Patterns That Look Wrong But Aren't

### "Excessive" Type Checking

```typescript
if (typeof value !== "string") {
  throw new Error("Expected string");
}
```

These checks may seem unnecessary when TypeScript guarantees types. They exist because:

1. Data crosses trust boundaries (user config, external APIs)
2. Runtime behavior may differ from compile-time types
3. Defense against `any` type pollution

### "Redundant" Logging

Security events are logged at multiple points:

- Entry to security-sensitive functions
- Before external command execution
- After validation failures

This creates an audit trail. **Do not optimize away** "redundant" logs.

### Constants That Could Be Configurable

Some values are hardcoded despite being potential user preferences:

```typescript
// constants.ts
export const MAX_IDENTITIES = 1000; // Hardcoded limit
export const PATH_MAX = 4096; // POSIX limit
```

These are **security limits**, not user preferences. Making them configurable would allow:

- DoS via excessive identities
- Resource exhaustion attacks
- Buffer overflow attempts

### Unreachable Validators

Several validators are marked as defense-in-depth and will never execute in normal operation:

```typescript
// pathSecurity.ts line 157
/* c8 ignore start - Defense-in-depth: unreachable due to prior validators */
const validateNoUNCPath: Validator = (state) => { ... }
```

These exist because:

1. Pipeline order might change in the future
2. Direct calls to individual validators bypass the pipeline
3. Security code should be paranoid

---

## Testing Philosophy

### What We Test

| Category            | Coverage Target | Notes                   |
| ------------------- | --------------- | ----------------------- |
| Security validators | 100%            | Non-negotiable          |
| Business logic      | 90%+            | Core functionality      |
| UI rendering        | Best-effort     | VS Code API limitations |

### What We Don't Test (And Why)

1. **Defense-in-depth fallbacks**: By design, they should never execute
2. **VS Code API wrappers**: Require integration testing
3. **Platform-specific branches**: CI may not cover all platforms
4. **Silent error paths**: Intentionally opaque

### Known Gaps

`sshAgent.ts` (620 lines) has limited test coverage due to:

- External dependency (ssh-agent process)
- Platform-specific behavior (macOS Keychain integration)
- Transient state management

This is a known gap, not an oversight.

---

## Refactoring Guidelines

### Before You Refactor

1. **Check for markers**: Look for `/* c8 ignore */` and `// defense-in-depth` comments
2. **Understand the layer**: Is this code at a trust boundary?
3. **Read this document**: Is the pattern listed as intentional?

### Safe Refactoring Targets

These are legitimate improvement opportunities:

| Area                     | Issue                                               | Safe to Change                   |
| ------------------------ | --------------------------------------------------- | -------------------------------- |
| `SSH_HOST_REGEX`         | Duplicated in `validation.ts` and `configSchema.ts` | Yes - extract to shared constant |
| Error message formatting | Inconsistent patterns                               | Yes - standardize format         |
| Path utility functions   | Some duplication exists                             | Yes - extract to `pathUtils.ts`  |

### Do Not Touch

| Pattern                           | Reason                      |
| --------------------------------- | --------------------------- |
| Multi-layer null byte checks      | Defense-in-depth            |
| Pre/post normalization validators | Different security contexts |
| 2-layer duplicate detection       | Trust boundary protection   |
| Silent catches in sshAgent        | Best-effort cleanup         |
| Hardcoded security limits         | DoS protection              |

---

## Architecture Decisions

### Why No Dependency Injection Framework?

The codebase uses manual dependency injection (constructor parameters) rather than a DI framework because:

1. VS Code extensions have size constraints
2. Framework overhead exceeds benefit for this scale
3. Explicit wiring is more debuggable

### Why Synchronous Path Validation?

Path validation in `pathSecurity.ts` is synchronous despite Node.js favoring async:

1. Validation is CPU-bound, not I/O-bound
2. Synchronous code is easier to reason about for security
3. Async validation introduces timing windows

Note: `isSecureLogPath()` is async because it performs file system operations (symlink detection).

### Why Not Use `eval()` or Dynamic Code?

The codebase explicitly avoids:

- `eval()`
- `new Function()`
- Dynamic `require()`

This is defense against code injection, even at the cost of flexibility.

### Why `execFile()` Instead of `exec()`?

All command execution goes through `secureExec.ts` which uses `execFile()`:

- `exec()` passes commands through a shell, enabling injection
- `execFile()` executes binaries directly with argument arrays
- Combined with `commandAllowlist.ts` for defense-in-depth

---

## Security Constants

All security limits are centralized in `constants.ts`:

| Constant                   | Value | Purpose                             |
| -------------------------- | ----- | ----------------------------------- |
| `PATH_MAX`                 | 4096  | POSIX path length limit             |
| `MAX_IDENTITIES`           | 1000  | Maximum identities (DoS protection) |
| `MAX_PATTERN_CHECK_LENGTH` | 1000  | Pattern matching limit              |
| `MAX_LOG_STRING_LENGTH`    | 50    | Log truncation limit                |
| `MIN_SECRET_LENGTH`        | 32    | Secret detection minimum            |
| `MAX_SECRET_LENGTH`        | 256   | Secret detection maximum            |
| `MAX_ID_LENGTH`            | 64    | Identity ID maximum length          |

Additional constants in `secureExec.ts`:

| Constant                         | Value    | Purpose                         |
| -------------------------------- | -------- | ------------------------------- |
| `COMMAND_TIMEOUTS.git`           | 10000ms  | Git command timeout             |
| `COMMAND_TIMEOUTS['ssh-add']`    | 5000ms   | SSH key operations timeout      |
| `COMMAND_TIMEOUTS['ssh-keygen']` | 5000ms   | Key fingerprint timeout         |
| `DEFAULT_TIMEOUT`                | 30000ms  | Fallback timeout                |
| `TIMEOUT_LIMITS.MIN`             | 1000ms   | Minimum allowed timeout         |
| `TIMEOUT_LIMITS.MAX`             | 300000ms | Maximum allowed timeout (5 min) |

---

## Command Execution Flow

```
User Action
    │
    ▼
┌─────────────────────┐
│   handlers.ts       │  VS Code command triggered
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   switcher.ts       │  Business logic
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   secureExec.ts     │  Command execution gateway
│   ┌─────────────────┤
│   │ 1. Command allowlist check
│   │ 2. Binary path resolution (binaryResolver.ts)
│   │ 3. Argument validation
│   │ 4. Timeout configuration
│   │ 5. execFile() execution
│   └─────────────────┤
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   External Binary   │  git, ssh-add, ssh-keygen
└─────────────────────┘
```

**Security checkpoints:**

1. **Allowlist**: Only `git`, `ssh-add`, `ssh-keygen` are permitted
2. **Path resolution**: Absolute paths prevent PATH pollution
3. **No shell**: `execFile()` bypasses shell interpretation
4. **Timeout**: Prevents hanging processes (DoS protection)

---

## File Size Rationale

Some files exceed typical "small file" guidelines:

| File              | Lines | Rationale                                             |
| ----------------- | ----- | ----------------------------------------------------- |
| `secureExec.ts`   | ~657  | Single responsibility with extensive timeout handling |
| `sshAgent.ts`     | ~620  | Complex external process interaction + validation     |
| `pathSecurity.ts` | ~591  | 19 validators with documentation                      |

These files are large because splitting them would:

- Scatter related security logic
- Make audit more difficult
- Introduce unnecessary abstraction layers

**Large file size is acceptable when it preserves cohesion.**

---

## Directory Structure

> **Note**: This is a logical grouping. Most files are in `src/` root for flat import paths.

```
src/
├── Security
│   ├── pathSecurity.ts          # Path validation orchestration (19 validators)
│   ├── secureExec.ts            # Safe command execution with timeout
│   ├── commandAllowlist.ts      # Allowed commands for secureExec
│   ├── binaryResolver.ts        # Absolute binary path resolution
│   ├── securityLogger.ts        # Structured security audit logging
│   ├── sensitiveDataDetector.ts # Secret detection in logs
│   ├── flagValidator.ts         # Command-line flag validation
│   ├── pathSanitizer.ts         # Path sanitization utilities
│   ├── path/
│   │   ├── normalize.ts         # Path normalization with security
│   │   ├── symlink.ts           # Symlink detection (TOCTOU mitigation)
│   │   └── security/
│   │       ├── unicode.ts       # Invisible Unicode attack detection
│   │       └── traversal.ts     # Path traversal attack detection
│   └── validators/
│       └── common.ts            # Shared validation utilities
├── SSH & Identity
│   ├── sshAgent.ts              # SSH key management (add/remove/list)
│   ├── identity.ts              # Identity loading & validation
│   ├── configSchema.ts          # JSON schema validation
│   ├── validation.ts            # Legacy validation utilities
│   └── pathUtils.ts             # SSH key path utilities
├── Services (src/services/)
│   ├── detection.ts             # Identity auto-detection from git
│   └── switcher.ts              # Identity switching logic
├── Commands (src/commands/)
│   └── handlers.ts              # VS Code command handlers
├── UI
│   ├── ui/webview.ts            # Webview panel integration
│   ├── quickPick.ts             # Quick pick identity selector
│   ├── statusBar.ts             # Status bar display
│   ├── displayLimits.ts         # Text truncation for UI
│   └── documentation.ts         # Documentation command handler
├── Logging
│   ├── fileLogWriter.ts         # File-based log writer
│   └── logTypes.ts              # Log type definitions
├── Core
│   ├── extension.ts             # Extension entry point
│   ├── gitConfig.ts             # Git config read/write
│   ├── constants.ts             # Shared constants (security limits)
│   ├── errors.ts                # Custom error types
│   ├── vscodeLoader.ts          # VS Code API loader
│   ├── workspaceTrust.ts        # Workspace trust integration
│   ├── configChangeDetector.ts  # Config change watcher
│   └── submodule.ts             # Git submodule support
└── test/                        # Unit and E2E tests
```

---

## Questions?

If you're unsure whether something is intentional:

1. Check this document
2. Look for code comments
3. Open an issue to discuss before changing

The maintainers would rather explain a pattern than debug a regression.
