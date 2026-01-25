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
- [Function Naming Conventions](#function-naming-conventions)
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

### Key Files (Expected to Be Large)

- `security/secureExec.ts`
- `ssh/sshAgent.ts`
- `security/pathValidator.ts`

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

| Layer                 | File                         | Purpose                               |
| --------------------- | ---------------------------- | ------------------------------------- |
| 1. Common             | `validators/common.ts`       | `hasNullByte()` utility               |
| 2. Path Security      | `security/pathValidator.ts`  | `validateNoNullBytes()` in pipeline   |
| 3. Path Normalization | `security/pathNormalizer.ts` | Defense-in-depth before normalization |

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

### Identity Duplicate Detection (Multi-Layer)

| Layer      | Location                    | Trigger                           |
| ---------- | --------------------------- | --------------------------------- |
| 1. Schema  | `identity/configSchema.ts`  | Configuration validation          |
| 2. Runtime | `identity/identity.ts`      | Before adding to valid identities |

Layer 2 has explicit comment:

```typescript
// Check for duplicate IDs (defense-in-depth: schema validation also checks this)
```

**Do not remove "redundant" checks.** They protect different trust boundaries.

### Silent Error Handling in SSH Agent

In `ssh/sshAgent.ts`, some errors are intentionally swallowed:

```typescript
// removeSshKey
try {
  await sshAgentExec(['-d', expandedPath]);
} catch (error) {
  // Ignore errors (key might not be loaded)
}

// removeAllIdentityKeys
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

**Many coverage exclusion markers** exist across the codebase. When you see these markers: The code is intentionally excluded from coverage requirements. Don't remove them or try to add tests that exercise them.

### Comment Patterns

| Pattern                      | Example Files                               | Purpose                                        |
| ---------------------------- | ------------------------------------------- | ---------------------------------------------- |
| `// SECURITY:`               | `ssh/sshAgent.ts`, `security/secureExec.ts` | Security-critical code explanation             |
| `// Note: Defense-in-depth.` | `security/pathValidator.ts`                 | Explains why seemingly unreachable code exists |
| `@see https://owasp.org/...` | Multiple                                    | Links to security references                   |

### ESLint Exclusion Patterns

These exclusions are intentional and should not be removed:

| Rule Disabled                                | Location                     | Reason                                                    |
| -------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| `no-control-regex`                           | `validators/common.ts`       | Control char regex is intentional for security validation |
| `@typescript-eslint/no-require-imports`      | `core/vscodeLoader.ts`       | VS Code API requires dynamic import                       |
| `@typescript-eslint/no-unsafe-member-access` | `security/securityLogger.ts` | Dynamic property access for log sanitization              |

**Do not strip comments** for "cleaner code."

---

## Module Responsibilities

### Security Layer (`src/security/`)

| File                       | Single Responsibility                 |
| -------------------------- | ------------------------------------- |
| `pathValidator.ts`         | Path validation pipeline orchestrator |
| `secureExec.ts`            | Safe command execution with timeout   |
| `securityLogger.ts`        | Structured security event logging     |
| `commandAllowlist.ts`      | Allowed commands for secureExec       |
| `binaryResolver.ts`        | Absolute binary path resolution       |
| `pathNormalizer.ts`        | Path normalization with security      |
| `pathSymlinkResolver.ts`   | Symlink detection (TOCTOU mitigation) |
| `pathUnicodeDetector.ts`   | Invisible Unicode attack detection    |
| `pathTraversalDetector.ts` | Path traversal attack detection       |
| `pathSanitizer.ts`         | Path sanitization utilities           |
| `pathUtils.ts`             | SSH key path utilities                |
| `flagValidator.ts`         | Command-line flag validation          |
| `sensitiveDataDetector.ts` | Secret detection in logs              |

**pathValidator.ts** orchestrates multiple individual validators:

| Category          | Examples                                                  |
| ----------------- | --------------------------------------------------------- |
| Basic checks      | Empty, whitespace, null bytes, length                     |
| Prefix validation | Tilde pattern, allowed prefixes                           |
| Windows-specific  | Drive letters, UNC paths, device paths, reserved names    |
| Unicode attacks   | Control chars, invisible Unicode (pre/post normalization) |
| Traversal attacks | `..`, `//`, `\`, trailing dot, trailing `/.`              |

**Do not consolidate** into a single monolithic validator. Separation enables:

- Independent testing per validator
- Audit trail showing exactly which check failed
- Adding/removing checks doesn't affect others

### SSH Key Validation (`src/ssh/sshAgent.ts`)

Several validation functions exist:

| Function                       | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `validateKeyPath()`            | Path format and security validation                 |
| `validateKeyFileType()`        | Must be regular file (not directory/symlink/device) |
| `validateKeyFileSize()`        | Size limits for DoS protection                      |
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
export const MAX_IDENTITIES = ...; // Hardcoded limit
export const PATH_MAX = ...;       // POSIX limit
```

These are **security limits**, not user preferences. Making them configurable would allow:

- DoS via excessive identities
- Resource exhaustion attacks
- Buffer overflow attempts

### Unreachable Validators

Several validators are marked as defense-in-depth and will never execute in normal operation:

```typescript
// security/pathValidator.ts
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

`ssh/sshAgent.ts` has limited test coverage due to:

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

| Area                     | Issue                   | Safe to Change                           |
| ------------------------ | ----------------------- | ---------------------------------------- |
| Error message formatting | Inconsistent patterns   | Yes - standardize format                 |
| Path utility functions   | Some duplication exists | Yes - extract to `security/pathUtils.ts` |

### Do Not Touch

| Pattern                           | Reason                      |
| --------------------------------- | --------------------------- |
| Multi-layer null byte checks      | Defense-in-depth            |
| Pre/post normalization validators | Different security contexts |
| Multi-layer duplicate detection   | Trust boundary protection   |
| Silent catches in ssh/sshAgent.ts | Best-effort cleanup         |
| Hardcoded security limits         | DoS protection              |

---

## Architecture Decisions

### Why No Dependency Injection Framework?

The codebase uses manual dependency injection (constructor parameters) rather than a DI framework because:

1. VS Code extensions have size constraints
2. Framework overhead exceeds benefit for this scale
3. Explicit wiring is more debuggable

### Why Synchronous Path Validation?

Path validation in `security/pathValidator.ts` is synchronous despite Node.js favoring async:

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

All command execution goes through `security/secureExec.ts` which uses `execFile()`:

- `exec()` passes commands through a shell, enabling injection
- `execFile()` executes binaries directly with argument arrays
- Combined with `security/commandAllowlist.ts` for defense-in-depth

---

## Function Naming Conventions

Consistent naming helps developers understand function behavior at a glance. This codebase follows strict conventions defined in `validators/common.ts`.

### Naming Rules

| Prefix        | Returns            | Behavior                       | Example                            |
| ------------- | ------------------ | ------------------------------ | ---------------------------------- |
| `is*()`       | `boolean`          | Pure check, no side effects    | `isValidEmail()`                   |
| `has*()`      | `boolean`          | Existence/presence check       | `hasNullByte()`                    |
| `validate*()` | `ValidationResult` | Returns result object          | `validatePathSecurity()`           |
| `*OrThrow()`  | `T` or throws      | Exception on failure           | `parseOrThrow()`                   |
| `assert*()`   | `void` or throws   | Guard, throws on failure       | `assertWithinWorkspaceBoundary()`  |
| `detect*()`   | `T \| null`        | Returns detected issue or null | `detectUnsafeCharsInFlag()`        |
| `check*()`    | varies             | Queries external state         | `checkKeyLoadedInAgent()`          |

### Prohibited Patterns

These patterns are **not allowed** in this codebase:

| Pattern                          | Problem                            | Use Instead                     |
| -------------------------------- | ---------------------------------- | ------------------------------- |
| `check*()` for pure predicates   | Ambiguous - implies external state | `is*()` or `has*()`             |
| `is*()` returning non-boolean    | Violates boolean contract          | `validate*()` or `get*()`       |
| `validate*()` returning `void`   | No way to get error details        | `assert*()` or return result    |
| `is*Valid*()` redundant prefix   | Redundant naming                   | `isValid*()` or `validate*()`   |

### Terminology

| Term     | Meaning                                   | Example                    |
| -------- | ----------------------------------------- | -------------------------- |
| `valid`  | Format/structure is correct               | `isValidEmail()`           |
| `secure` | Resistant to security attacks             | `validatePathSecurity()`   |
| `safe`   | Safe for specific context (e.g., shell)   | `isShellSafePath()`        |

For detailed documentation and examples, see the module comment in `validators/common.ts`.

---

## Security Constants

Security limits and validation patterns are centralized to prevent inconsistency:

- **Field length limits**: Centralized in `core/constants.ts`
- **Validation patterns**: Centralized in `validators/common.ts`

For specific values, refer to the source code. This document intentionally omits concrete numbers to prevent documentation drift.

### Why No Concrete Values Here?

Documenting specific limits (e.g., "max 64 characters") creates maintenance burden:

- Values change but docs don't get updated
- Multiple sources of truth lead to confusion
- Developers may reference outdated docs instead of code

The source files (`constants.ts`, `common.ts`) are the single source of truth.

---

## Command Execution Flow

```text
User Action
    │
    ▼
┌───────────────────────────────┐
│   commands/handlers.ts        │  VS Code command triggered
└───────────────────────────────┘
    │
    ▼
┌───────────────────────────────┐
│   services/switcher.ts        │  Business logic
└───────────────────────────────┘
    │
    ▼
┌───────────────────────────────┐
│   security/secureExec.ts      │  Command execution gateway
│   ┌───────────────────────────┤
│   │ 1. Command allowlist check (security/commandAllowlist.ts)
│   │ 2. Binary path resolution (security/binaryResolver.ts)
│   │ 3. Argument validation
│   │ 4. Timeout configuration
│   │ 5. execFile() execution
│   └───────────────────────────┤
└───────────────────────────────┘
    │
    ▼
┌───────────────────────────────┐
│   External Binary             │  git, ssh-add, ssh-keygen
└───────────────────────────────┘
```

**Security checkpoints:**

1. **Allowlist**: Only `git`, `ssh-add`, `ssh-keygen` are permitted
2. **Path resolution**: Absolute paths prevent PATH pollution
3. **No shell**: `execFile()` bypasses shell interpretation
4. **Timeout**: Prevents hanging processes (DoS protection)

---

## File Size Rationale

Some files exceed typical "small file" guidelines:

| File                        | Rationale                                             |
| --------------------------- | ----------------------------------------------------- |
| `security/secureExec.ts`    | Single responsibility with extensive timeout handling |
| `ssh/sshAgent.ts`           | Complex external process interaction + validation     |
| `security/pathValidator.ts` | Multiple validators with documentation                |

These files are large because splitting them would:

- Scatter related security logic
- Make audit more difficult
- Introduce unnecessary abstraction layers

**Large file size is acceptable when it preserves cohesion.**

---

## Directory Structure

> **Note**: Files are organized by responsibility into dedicated directories.

```text
src/
├── core/                          # Foundation
│   ├── extension.ts               # Extension entry point
│   ├── constants.ts               # Shared constants (security limits)
│   ├── errors.ts                  # Custom error types
│   ├── gitConfig.ts               # Git config read/write
│   ├── vscodeLoader.ts            # VS Code API loader
│   ├── workspaceTrust.ts          # Workspace trust integration
│   ├── configChangeDetector.ts    # Config change watcher
│   └── submodule.ts               # Git submodule support
├── security/                      # Security
│   ├── pathValidator.ts           # Path validation orchestrator
│   ├── pathNormalizer.ts          # Path normalization with security
│   ├── pathSymlinkResolver.ts     # Symlink detection (TOCTOU mitigation)
│   ├── pathTraversalDetector.ts   # Path traversal attack detection
│   ├── pathUnicodeDetector.ts     # Invisible Unicode attack detection
│   ├── pathSanitizer.ts           # Path sanitization utilities
│   ├── pathUtils.ts               # SSH key path utilities
│   ├── secureExec.ts              # Safe command execution with timeout
│   ├── commandAllowlist.ts        # Allowed commands for secureExec
│   ├── binaryResolver.ts          # Absolute binary path resolution
│   ├── flagValidator.ts           # Command-line flag validation
│   ├── securityLogger.ts          # Structured security audit logging
│   └── sensitiveDataDetector.ts   # Secret detection in logs
├── identity/                      # Identity management
│   ├── identity.ts                # Identity loading & validation
│   ├── configSchema.ts            # JSON schema validation
│   └── inputValidator.ts          # Identity input validation
├── ui/                            # User interface
│   ├── webview.ts                 # Webview panel integration
│   ├── identityPicker.ts          # Quick pick identity selector
│   ├── identityStatusBar.ts       # Status bar display
│   ├── displayLimits.ts           # Text truncation for UI
│   ├── documentationPublic.ts     # Documentation command handler (public API)
│   └── documentationInternal.ts   # Documentation utilities (internal)
├── logging/                       # Logging
│   ├── logTypes.ts                # Log type definitions
│   └── fileLogWriter.ts           # File-based log writer
├── ssh/                           # SSH key management
│   └── sshAgent.ts                # SSH key add/remove/list
├── services/                      # Business logic
│   ├── detection.ts               # Identity auto-detection from git
│   └── switcher.ts                # Identity switching logic
├── commands/                      # VS Code commands
│   └── handlers.ts                # VS Code command handlers
├── validators/                    # Shared validation
│   └── common.ts                  # Shared validation utilities
└── test/                          # Unit and E2E tests
    └── e2e/                       # End-to-end tests
```

---

## Questions?

If you're unsure whether something is intentional:

1. Check this document
2. Look for code comments
3. Open an issue to discuss before changing

The maintainers would rather explain a pattern than debug a regression.
