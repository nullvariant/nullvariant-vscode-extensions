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
- [Webview Content Security Policy](#webview-content-security-policy)
- [Extension Capabilities](#extension-capabilities)

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

| Layer      | Location                   | Trigger                           |
| ---------- | -------------------------- | --------------------------------- |
| 1. Schema  | `identity/configSchema.ts` | Configuration validation          |
| 2. Runtime | `identity/identity.ts`     | Before adding to valid identities |

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
.map(async (identity) => {
  try {
    await removeSshKey(identity.sshKeyPath!);
  } catch {
    // Ignore individual errors
  }
})
```

**This is correct.** SSH key removal is best-effort cleanup. The key may:

- Already be unloaded
- Have never been loaded
- Belong to a different agent

Surfacing these errors would confuse users with irrelevant messages.

### Signing Config: Three Keys as One Group

`core/signingPlan.ts` treats `gpg.format`, `user.signingkey` and `commit.gpgsign` as one group. The extension puts back the values it found only when all three still hold what it wrote; if any one was changed by hand, all three are left alone.

**Do not restore the keys one by one.** Restoring only the keys that still match would leave the signing method and the key taken from different sources (for example `gpg.format ssh` from the extension with a GPG key ID written by the user).

### A Failed Read Is Never "Not Set"

`core/localGitConfig.ts` reads a value as one of three kinds: a value, absent (`git config --get` exits 1), or an error. Values are read with `-z`: the value is exactly what comes before the NUL git ends it with (a value can end with a space, `\r` or a newline), and output that is not one NUL-terminated value is an error. A read is also an error when git printed anything on standard error (it warns and goes on when it cannot read a config file) and when the value holds U+FFFD (bytes that are not UTF-8: writing such a value back would write another value). Other git output loses only the one `\n` git adds after it. An error is never treated as absent:

- The switch stops before writing anything if a value cannot be read
- Sync Check reports the state as unknown, never as synced
- A record that has to be rebuilt after a failed rollback from values that cannot be read is dropped, so those values are never removed automatically

`git config --unset` exits 5 both when the key is not set and when several lines match it; the port reads the key again and reports success only when it is not set.

Treating a failed read as "not set" would record the wrong value to put back and could remove the user's own settings later.

### Signing Keys From User Settings Only

`identity/signingKeySource.ts` replaces `gpgKeyId` and `sshSigningKeyPath` of each identity with the values of the identity in the user settings (`inspect().globalValue`) that has the same `id`, `name` and `email`, and drops them if there is none. The `identities` setting can also come from a workspace's `.vscode/settings.json`; the signing key must not be chosen by a repository. Matching the `id` alone is not enough: a workspace could take the `id` of one of the user's identities and pair its signing key with another name and email. A different value, or a user identity with the same `id` but another name or email, is logged and not used.

The fields other than the signing fields are validated first, then the identity is rebuilt without any signing field and the user's signing fields are copied into it as they are, of whatever type (a number is not turned into "not set"), then the identity is validated as a whole. User signing keys that are invalid, or both `gpgKeyId` and `sshSigningKeyPath`, make the identity invalid: it is skipped, never applied without signing. A value in the workspace's signing fields, of any type, is never validated nor kept, so it cannot make an identity invalid either.

The identity screens write the user settings, so `identity/identityConfig.ts` starts every write (add, edit, delete, reorder) from the identities in the user settings (or the default, when the user has none), never from the merged configuration: writing the merged value back would move a workspace's identities, signing keys included, into the user settings. The screens also list, confirm and reload from the same validated user identities (`getManagedIdentities()`), so the identity shown is the one changed. An identity defined only in workspace settings is not edited from the screens. The screens list an ID once, so when the user settings hold several entries with the same ID, deleting, editing or moving it is refused: the entry the user confirmed cannot be told from the others.

**Do not read signing keys from the merged configuration, and do not write the merged configuration back.**

### Binary Path Cache with TTL

`security/binaryResolver.ts` caches resolved binary paths with a **30-minute TTL**:

```typescript
interface CacheEntry {
  path: string;
  resolvedAt: number;
}
```

**Why TTL?** VS Code sessions can last days. Without TTL, a binary replaced after initial resolution would continue to be trusted. The 30-minute window balances security (periodic re-verification) with performance (no per-command filesystem checks).

`clearPathCache()` ignores TTL and clears immediately (used during identity switching).

### Security Event Rate Limiter

`security/securityLogger.ts` includes a per-event-type rate limiter:

- **Window**: 10 seconds, **Max events**: 10 per event type
- Excess events are dropped with a count; next allowed event includes `dropped: N events`

**Why?** Prevents log flooding from rapid validation failures (e.g., malformed config triggering repeated errors). Without rate limiting, an attacker could cause I/O exhaustion via log writes.

### O_NOFOLLOW Symlink Protection

`logging/fileLogWriter.ts` uses `O_NOFOLLOW` when opening log files:

```typescript
fs.constants.O_WRONLY |
  fs.constants.O_CREAT |
  fs.constants.O_APPEND |
  fs.constants.O_NOFOLLOW;
```

Combined with post-open `fstat()` symlink verification. This mitigates TOCTOU between `isSecureLogPath()` and the actual file open.

**Platform note**: `O_NOFOLLOW` is Unix-only. On Windows, symlink creation requires admin privileges, making the risk inherently lower.

### git.path Binary Verification

When `git.path` VS Code setting provides a binary path, `binaryResolver.ts` verifies it by running `execFile(absolutePath, ['--version'])` and checking the output starts with `git version`. This prevents a user-configured path from pointing to a non-git binary.

**Note**: Uses `execFile()` directly (not `secureExec()`) to avoid circular dependency.

### ESLint `no-restricted-imports` for child_process

`eslint.config.mjs` prohibits importing `exec` and `execSync` from `child_process`/`node:child_process`. Only `execFile` and `execFileSync` are permitted.

This is a lint-time enforcement of the architectural decision to never use shell-based execution. The grep-based CI check remains as defense-in-depth.

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

### ESLint Security Enforcement

These rules actively prevent dangerous patterns:

| Rule                    | Target                                      | Reason                                                            |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| `no-restricted-imports` | `exec`, `execSync` from `child_process`     | Shell-based execution enables command injection; use `execFile()` |
| `no-eval`               | `eval()`, `new Function()`                  | Dynamic code execution enables injection                          |
| `no-implied-eval`       | `setTimeout(string)`, `setInterval(string)` | Implicit eval via string arguments                                |

---

## Module Responsibilities

### Security Layer (`src/security/`)

| File                       | Single Responsibility                 |
| -------------------------- | ------------------------------------- |
| `pathValidator.ts`         | Path validation pipeline orchestrator |
| `secureExec.ts`            | Safe command execution with timeout   |
| `securityLogger.ts`        | Structured security event logging     |
| `commandAllowlist.ts`      | Allowed commands for secureExec       |
| `gitConfigRules.ts`        | Per-key rules for `git config` args   |
| `sshKeygenRules.ts`        | The three accepted `ssh-keygen` forms |
| `drivePathValidator.ts`    | Windows drive path (`C:/`) checks     |
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

### SSH Key Validation (`src/ssh/sshAgent.ts`, `src/ssh/keyFileValidator.ts`)

Several validation functions exist. The path check stays next to the ssh-agent
calls in `sshAgent.ts`; the checks on the key file itself live together in
`keyFileValidator.ts`:

| Function                            | File                  | Purpose                                                                                                 |
| ----------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| `expandKeyPathOrThrow()`            | `sshAgent.ts`         | Path format and security validation                                                                     |
| `validateKeyFileType()`             | `keyFileValidator.ts` | Resolved target must be a regular file (not directory/device); symlinks are resolved upstream           |
| `validateKeyFileSize()`             | `keyFileValidator.ts` | Size limits for DoS protection                                                                          |
| `findInsecurePermission()`          | `keyFileValidator.ts` | Unix only - the permission rules of a private and a public key file (shared with the signing key check) |
| `validateKeyFilePermissions()`      | `keyFileValidator.ts` | Unix only - no group/others access                                                                      |
| `validateKeyFileBeforeAddToAgent()` | `keyFileValidator.ts` | Orchestrates all validations + format check                                                             |

**Do not merge** these functions. Separation enables:

- Granular error messages
- Independent testing
- Clear failure attribution

Key paths are accepted outside `~/.ssh/`: an absolute path, a path starting with `~/` (never `~user`), or a Windows drive path (`C:\` or `C:/`). One prefix rule (`validators/common.ts` `hasKeyPathPrefix()`) is used by the settings schema, the identity form and the checks before a key is used; a drive path is accepted when a key is used on Windows only, where it is read with the Windows path rules. The path checks (traversal, control characters, shell metacharacters, symlink resolution) and the file checks above are what keep a path safe, not the directory it is in.

### Authentication Key and Signing Key

| Field               | Used by                        | ssh-agent                                   | Accepted file                                                                     |
| ------------------- | ------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------- |
| `sshKeyPath`        | SSH (push, pull) via ssh-agent | Added and removed when `autoSwitchSshKey`   | Private key                                                                       |
| `sshSigningKeyPath` | Git, as `user.signingkey`      | Never added; Git reads it or finds it there | Private key without a passphrase, or public key whose private key is in ssh-agent |

When `autoSwitchSshKey` removes the authentication keys of the configured identities from ssh-agent, it does not remove the key the selected identity signs with (`sshSigningKeyPath`, or the private key of its `.pub` file): git may sign with it from ssh-agent.

Before SSH signing config is written, `git --version` must be 2.34 or later (the first version that signs with `gpg.format ssh`); otherwise the switch stops before anything is written. Then `ssh/signingKeyCheck.ts` checks an SSH signing key before git is told to use it, by the result, not by predicting what OpenSSH will do:

1. The path must be absolute on the platform the extension runs on (a drive path such as `C:/...` is not on POSIX), and the key file a regular file of at most 1 MiB
2. The key file and the `.pub` file next to it, if there is one, must be owned by the current user or root (Unix)
3. If the key file and the `.pub` file next to it have the same size, modification time, permissions and owner as at the last check that passed (kept in the VS Code global state, `gitIdSwitcher.checkedSigningKeys`, as keys belong to the user), the check is done
4. The permissions (Unix), by the rules of `keyFileValidator.ts` (`findInsecurePermission()`): a key file named `.pub` must not be writable by group or others nor executable; any other key file is taken as a private key and must not be accessible by group or others nor executable. The `.pub` file next to it, if there is one, follows the public key rules
5. The public key the setting names: `ssh-keygen -y -P ''` of a private key (never asking for a passphrase), or else the file read as one public key line
6. The key signs a fixed test text on standard input as git signs a commit (`ssh-keygen -Y sign -n git -f <path>`, the value written to `user.signingkey`), with `SSH_ASKPASS_REQUIRE=never` (no askpass program) and a 30 second timeout (a hardware key may wait for a touch; a prompt on a terminal the extension host has is stopped by it)
7. The public key in the signature must be the one from step 5; otherwise OpenSSH signed with another key (a stale `.pub` file next to the private key, whose key is in ssh-agent), and the switch stops

A private key with a passphrase has no public key that step 5 can read: it is not accepted, and its `.pub` file (with the key in ssh-agent) is. Checking only when the files changed keeps a hardware key from asking for a touch on every switch; what this leaves open is listed in the threat model (`docs/THREAT_MODEL.md`, Limits).

| File                  | Single Responsibility                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `signingKeyCheck.ts`  | The signing key check above (behind dependencies; the real ones in the module)                |
| `keyFileValidator.ts` | Checks of an authentication key file before `ssh-add`; the key file permission rules both use |
| `sshAgent.ts`         | Adds and removes the authentication key in ssh-agent                                          |

### Commit Signing Config (`src/core/`)

| File                        | Single Responsibility                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `signingPlan.ts`            | Pure plan: which `--local` operations a switch needs, from the current values, the record, and the next identity               |
| `repositoryConfigWriter.ts` | Write an identity to one repository (root or submodule): write, keep the record, put values back on a failed write; its errors |
| `signingRecordStore.ts`     | Record of what the extension found and wrote, per repository, in the VS Code workspace state (`gitIdSwitcher.signingRecords`)  |
| `localGitConfig.ts`         | Read and write `--local` git config of one repository through the allowlist; tells "not set" from a failed read                |
| `repositoryCheck.ts`        | Whether the workspace folder is in a work tree, outside any repository, or that cannot be told                                 |
| `mementoPort.ts`            | The part of VS Code's Memento the record stores use                                                                            |
| `serialRunner.ts`           | Runs identity switches one at a time                                                                                           |

Keys written on switch, all with `git config --local`:

| Key               | Written when                      | Value                                                                                         |
| ----------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `user.name`       | Always                            | `name` (with `icon` if `includeIconInGitConfig`)                                              |
| `user.email`      | Always                            | `email`                                                                                       |
| `gpg.format`      | `gpgKeyId` or `sshSigningKeyPath` | `openpgp` for `gpgKeyId`, `ssh` for `sshSigningKeyPath`                                       |
| `user.signingkey` | `gpgKeyId` or `sshSigningKeyPath` | The GPG key ID, or the SSH key path with `~/` expanded and normalized (symlinks not resolved) |
| `commit.gpgsign`  | `gpgKeyId` or `sshSigningKeyPath` | `true`                                                                                        |

For an identity without a signing key, the three signing keys are put back to the values recorded before the extension wrote them (unset if they were not set), in the order `commit.gpgsign`, `user.signingkey`, `gpg.format`. Without a record, or when any of the three was changed by hand, nothing is put back.

`applyIdentityToRepository()` works in this order:

1. Read every value first; stop if any read fails (nothing is written, and the record is kept)
2. Plan; stop if a current value could not be written back later (it would be lost by a later restore)
3. Write `user.name`, `user.email`, then the signing operations
4. On success, store the new record; if that fails, git config stays written and the switch warns that the values will not be put back for another identity (this is not a failed write). On a failed write, put back the earlier writes in reverse order and keep the old record; if putting back is not complete, rebuild the record from the values found in the repository: the record (new or old) that matches all three signing values, or no record when they are a mix, so they are treated as the user's

At startup, in the same queue as the switches, records of repositories that are gone (the folder, or its `.git` entry and, for a submodule removed with `git submodule deinit`, the repository git keeps for it under the parent's `.git/modules/<path>`) are removed, and so is stored data that is not a record. A repository that cannot be told present or gone keeps its record.

Sync Check reports leftover signing values in the repository root and, with submodule support on, in each submodule that has a record. For a signing identity it also checks that the three signing keys are in the repository's `--local` config. A switch moves the switch generation on when it starts and when it ends, and a Sync Check started outside the switch queue (window focus, a settings change) shows its result only if the identity it checked is still current and the generation has not moved meanwhile.

In `services/switcher.ts`, a switch is queued by identity ID. When its turn comes, the identity is read again from the validated settings, and it is applied also when it is the current identity (values changed by hand since are written again; an unchanged signing key is not checked again, see above). The repository check tells three answers apart: in a work tree (git config is written), outside any repository (the switch goes on without git config), and not known (the switch stops, and the previous identity stays). `git rev-parse --is-inside-work-tree` must print `true` or `false`; its exit 128 counts as "outside" only when `GIT_DIR`, `GIT_WORK_TREE` and `GIT_COMMON_DIR` are not set (an empty value counts as set) and no `.git` entry exists in the folder or above it. Submodules are listed from the repository root; a listing that failed, a line of it that cannot be read (such as a submodule with merge conflicts, `U`), or submodules that could not be written, leave the switch successful for the root and are shown as a warning. A submodule that is not initialized is left out on purpose.

Limitations (the threat model lists all of them, `docs/THREAT_MODEL.md`, Limits):

- `user.name` and `user.email` have no `unset` in the allowlist, so a name or email that was not set before a failed switch stays written, and the error says that some values could not be put back
- A record that cannot be saved fails the switch like a failed write: without it the values could not be put back for another identity, so they are put back now
- Each key is read once before the writes. Another process (a terminal, another VS Code window) changing git config during a switch is out of the threat scope: its change can be overwritten, also by a rollback
- The record lives in the VS Code workspace state, so it belongs to the workspace that wrote it. Values written while the repository was open in another workspace, or by a version that kept no record, are treated as the user's and are not put back
- Values in `--global` or system config are never written or put back; an identity without a signing key leaves signing to them

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

- External dependency (ssh-agent process, VS Code API)
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

| Prefix        | Returns            | Behavior                       | Example                           |
| ------------- | ------------------ | ------------------------------ | --------------------------------- |
| `is*()`       | `boolean`          | Pure check, no side effects    | `isValidEmail()`                  |
| `has*()`      | `boolean`          | Existence/presence check       | `hasNullByte()`                   |
| `validate*()` | `ValidationResult` | Returns result object          | `validatePathSecurity()`          |
| `*OrThrow()`  | `T` or throws      | Exception on failure           | `parseOrThrow()`                  |
| `assert*()`   | `void` or throws   | Guard, throws on failure       | `assertWithinWorkspaceBoundary()` |
| `detect*()`   | `T \| null`        | Returns detected issue or null | `detectUnsafeCharsInFlag()`       |
| `check*()`    | varies             | Queries external state         | `checkKeyLoadedInAgent()`         |

### Prohibited Patterns

These patterns are **not allowed** in this codebase:

| Pattern                        | Problem                            | Use Instead                   |
| ------------------------------ | ---------------------------------- | ----------------------------- |
| `check*()` for pure predicates | Ambiguous - implies external state | `is*()` or `has*()`           |
| `is*()` returning non-boolean  | Violates boolean contract          | `validate*()` or `get*()`     |
| `validate*()` returning `void` | No way to get error details        | `assert*()` or return result  |
| `is*Valid*()` redundant prefix | Redundant naming                   | `isValid*()` or `validate*()` |

### Terminology

| Term     | Meaning                                              | Example                  |
| -------- | ---------------------------------------------------- | ------------------------ |
| `valid`  | Format/structure is correct                          | `isValidEmail()`         |
| `secure` | Resistant to security attacks                        | `validatePathSecurity()` |
| `safe`   | Safe for specific context (e.g., a command argument) | `validatePathSafety()`   |

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

### `git config` Argument Rules

`git config` arguments are not checked token by token. `security/gitConfigRules.ts` reads them as one grammar and checks them against one rule table (the length and path checks that apply to every argument run first):

| Form                     | Operation | Scope option              |
| ------------------------ | --------- | ------------------------- |
| `-z --get <key>`         | get       | (none: all scopes merged) |
| `-z --local --get <key>` | get       | `--local`                 |
| `--local <key> <value>`  | set       | `--local`                 |
| `--local --unset <key>`  | unset     | `--local`                 |

Any other form is rejected, including every `--global` form, a write without a scope, and a read without `-z` (its value would end with the newline git adds). The rule table holds, for each key (`user.name`, `user.email`, `user.signingkey`, `commit.gpgsign`, `gpg.format`), the operations it allows, the scope option each may use, and the values it may be set to. Only the three signing keys can be unset; `user.name` and `user.email` have no `unset`. The value rules: `commit.gpgsign`: `true` or `false`; `gpg.format`: `openpgp` or `ssh`; `user.signingkey`: a GPG key ID, or a key path that is absolute, starts with `~/`, or is a Windows drive path (`C:/` or `C:\`, what `~/` expands to on Windows). The same value rule decides whether a value found in a repository can be written back later; a switch stops if it cannot.

---

### `ssh-keygen` Argument Rules

`security/sshKeygenRules.ts` accepts three forms only: `-lf <absolute path>` (the fingerprint of a key file), `-y -P '' -f <absolute path>` (the public key of a private key file; with the empty passphrase it never asks for one) and `-Y sign -n git -f <absolute path>` (sign standard input in the `git` namespace and print the signature). None of them writes a file. Only the signing form takes standard input, and only the fixed test text of the signing key check; every other command takes none. Every other option is rejected. The path checks of every argument, Windows drive paths included, run first, as for the other commands.

---

## File Size Rationale

Some files exceed typical "small file" guidelines:

| File                        | Rationale                                             |
| --------------------------- | ----------------------------------------------------- |
| `security/secureExec.ts`    | Single responsibility with extensive timeout handling |
| `ssh/sshAgent.ts`           | Complex external process interaction                  |
| `security/pathValidator.ts` | Multiple validators with documentation                |

These files are large because splitting them would:

- Scatter related security logic
- Make audit more difficult
- Introduce unnecessary abstraction layers

**Large file size is acceptable when it preserves cohesion.** A file is split
only along a seam where the two halves change for different reasons — for
example, the key file checks moved from `ssh/sshAgent.ts` to
`ssh/keyFileValidator.ts` as one unit, so they stay together for audit.

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
│   ├── localGitConfig.ts          # --local git config of one repository
│   ├── repositoryCheck.ts         # In a work tree, outside, or not known
│   ├── signingPlan.ts             # Commit signing plan (pure)
│   ├── repositoryConfigWriter.ts  # Write an identity to one repository
│   ├── signingRecordStore.ts      # Record of the signing config written
│   ├── mementoPort.ts             # The part of VS Code's Memento the stores use
│   ├── serialRunner.ts            # Runs identity switches one at a time
│   ├── syncChecker.ts             # Profile vs git config comparison
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
│   ├── gitConfigRules.ts          # Per-key rules for git config arguments
│   ├── sshKeygenRules.ts          # The accepted ssh-keygen forms and standard input
│   ├── drivePathValidator.ts      # Windows drive path checks
│   ├── binaryResolver.ts          # Absolute binary path resolution
│   ├── flagValidator.ts           # Command-line flag validation
│   ├── securityLogger.ts          # Structured security audit logging
│   └── sensitiveDataDetector.ts   # Secret detection in logs
├── identity/                      # Identity management
│   ├── identity.ts                # Identity type and display helpers
│   ├── identityConfig.ts          # Reading/writing identities in settings
│   ├── signingKeySource.ts        # Signing keys from user settings only
│   ├── identityFields.ts          # Editable field definitions for the form
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
│   ├── sshAgent.ts                # SSH key add/remove/list
│   ├── signingKeyCheck.ts         # Has the signing key sign, as git would
│   └── keyFileValidator.ts        # Key file checks before ssh-add
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

## Webview Content Security Policy

The authoritative CSP implementation lives in `src/ui/htmlTemplates/csp.ts` (`buildCspString`). The current policy:

```text
default-src 'none';
base-uri 'none';
form-action 'none';
frame-ancestors 'none';
img-src ${cspSource} https://assets.nullvariant.com https://img.shields.io https://avatars.githubusercontent.com;
style-src 'nonce-${nonce}';
script-src 'nonce-${nonce}';
connect-src https://assets.nullvariant.com;
font-src ${cspSource};
```

### Policy Rationale

| Directive         | Value                                 | Why                                                                        |
| ----------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `default-src`     | `'none'`                              | Deny everything by default                                                 |
| `base-uri`        | `'none'`                              | Not covered by `default-src`; prevents `<base>` injection (CSP3 §6.1)      |
| `form-action`     | `'none'`                              | Not covered by `default-src`; prevents form submission to attacker origins |
| `frame-ancestors` | `'none'`                              | Not covered by `default-src`; prevents clickjacking via iframe embedding   |
| `img-src`         | `cspSource`, CDN, shields.io, avatars | VS Code resources, CDN assets, README badges, GitHub contributor avatars   |
| `style-src`       | `'nonce-...'`                         | Nonce-only; `cspSource` removed to close stylesheet bypass                 |
| `script-src`      | `'nonce-...'`                         | Only allow scripts with a per-render cryptographic nonce                   |
| `connect-src`     | CDN only                              | Fetch README/documentation from CDN; no other network access               |
| `font-src`        | `cspSource`                           | Allow VS Code bundled fonts only                                           |

### CSP Prohibited Patterns

- `'unsafe-inline'` — Enables XSS via injected `<script>` tags
- `'unsafe-eval'` — Enables code injection via `eval()`
- `*` or `https:` in any directive — Allows loading from arbitrary origins
- Wildcard subdomains (e.g. `*.githubusercontent.com`) — Only specific subdomains are allowed

---

## Extension Capabilities

This extension follows the principle of least privilege. The following table documents what the extension can and cannot do:

### Granted Capabilities

| Capability            | Mechanism                       | Purpose                                                                                                                             |
| --------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Read/write Git config | `git config` via `secureExec`   | Set user.name, user.email, gpg.format, user.signingkey, commit.gpgsign (`--local` only)                                             |
| SSH agent management  | `ssh-add` via `secureExec`      | Load/unload the authentication key (`sshKeyPath`) when switching identity                                                           |
| SSH key inspection    | `ssh-keygen` via `secureExec`   | Key fingerprint (`-lf`); the signing key check: its public key (`-y -P ''`) and a signature of a fixed test text (`-Y sign -n git`) |
| File system read      | Node.js `fs` (validated paths)  | Read SSH key files, write log files                                                                                                 |
| VS Code settings      | Configuration API               | Store identity definitions; signing keys from user settings only                                                                    |
| VS Code state         | Memento API (workspace, global) | Record of the signing config written (workspace); signing keys that passed the check (global)                                       |
| Status bar            | StatusBarItem API               | Display current identity                                                                                                            |

### Explicitly Denied Capabilities

| Capability                    | Why                                                                |
| ----------------------------- | ------------------------------------------------------------------ |
| Network access                | No telemetry, no external API calls, zero production dependencies  |
| Webview content               | No HTML rendering (CSP policy defined above for future use)        |
| Terminal access               | No terminal creation or terminal command execution                 |
| Task execution                | No task providers registered                                       |
| Debug adapter                 | No debugging capabilities                                          |
| File system write (arbitrary) | Log paths validated via `isSecureLogPath()` with symlink detection |
| Shell execution               | `execFile()` only; `exec()` is prohibited                          |

---

## Questions?

If you're unsure whether something is intentional:

1. Check this document
2. Look for code comments
3. Open an issue to discuss before changing

The maintainers would rather explain a pattern than debug a regression.
