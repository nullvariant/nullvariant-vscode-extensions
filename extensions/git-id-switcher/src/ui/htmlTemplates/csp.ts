/**
 * HTML Templates — Content Security Policy Builder
 *
 * Owns the CSP trust boundary for the webview shell:
 *  - `CspValidationError` (the narrow-able class thrown on format failures)
 *  - Format patterns for nonce / cspSource / lang
 *  - `assertValidNonce` / `assertValidLang`
 *  - `buildCspString` (assembles the final `content` attribute value)
 *
 * `coerceLang` and `STYLE_CLOSE_PATTERN` were moved to `shell.ts` as
 * they are shell-rendering concerns, not CSP concerns.
 *
 * Split from shell.ts in Issue-00243 so shell.ts can shrink to the skeleton
 * wrapper alone. All functions are pure and free of VS Code dependencies.
 *
 * @author Null;Variant
 * @license MIT
 */

/**
 * Dedicated error class thrown by `buildCspString` when the caller-supplied
 * `nonce` or `cspSource` fails format validation.
 *
 * Exists so the webview fallback layer (`renderWithFallback`) can narrow its
 * catch to "CSP drift only" via `instanceof` instead of swallowing every
 * throw from the builder pipeline. Swallowing arbitrary `Error`s masked
 * logic bugs (escape regressions, unexpected TypeError) in production and
 * reduced observability to zero — the whole point of separating this class.
 */
export class CspValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CspValidationError';
  }
}

/**
 * Allowed character set for a CSP nonce. Base64url + standard base64 alphabet.
 * Must fullmatch — any character outside this set (quotes, whitespace, `;`, `<`)
 * could break out of the meta tag attribute and inject arbitrary CSP directives.
 *
 * Minimum length 22 characters enforces ≥128 bits of entropy (16 random bytes
 * base64-encoded = 24 chars with padding, 22 without). A short or fixed nonce
 * from a buggy caller would pass a format-only check; enforcing length here
 * keeps the trust boundary fail-closed even if generation drifts.
 *
 * Rationale: defense-in-depth against attribute breakout and directive
 * injection even though nonce/cspSource are currently trusted VS Code inputs.
 */
const NONCE_PATTERN = /^[A-Za-z0-9+/=_-]{22,}$/;

/**
 * Allowed shape for `webview.cspSource`. VS Code hands us values like
 * `https://file%2B.vscode-resource.vscode-cdn.net` or `vscode-webview://<guid>`
 * — scheme + host, possibly with `%`-encoding and `*` wildcards. We reject
 * anything containing characters that could terminate the attribute or start a
 * new directive (`'`, `"`, whitespace, `;`, `<`, `>`).
 */
const CSP_SOURCE_PATTERN = /^[A-Za-z][A-Za-z0-9+.-]*:[A-Za-z0-9%*._/:-]+$/;

/**
 * BCP 47 language tag (subset). Accepts either:
 *  - a 2-3 letter primary subtag optionally followed by `-<2-8 alphanumeric>`
 *    subtags (covers `en`, `ja`, `zh-CN`, `pt-BR`, `ain`, `tlh`, …), or
 *  - an `x-…` private-use tag whose subtags are 1-16 alphanumeric
 *    (covers SUPPORTED_LOCALES entries `x-pirate`, `x-shakespeare`,
 *    `x-lolcat`). The subtag length is intentionally wider than RFC 5646's
 *    8-char limit to accommodate the extension's own whimsy locales without
 *    spamming governance. Private-use is enumerated explicitly because the
 *    single-letter `x` primary subtag does not fit the general form.
 *
 * Fullmatch forbids quotes, angle brackets, whitespace, etc. that could
 * break the `<html lang>` attribute. Kept deliberately stricter than the
 * full RFC 5646 grammar — we do not need extlang / grandfathered forms.
 */
const LANG_PATTERN = /^(?:[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*|x(?:-[a-zA-Z0-9]{1,16})+)$/;

/**
 * Validate a CSP nonce at the trust boundary. Used by both `buildCspString`
 * (where the nonce is interpolated into the CSP `content` attribute) and
 * `buildHtmlShell` (where it is interpolated into `<style nonce>` /
 * `<script nonce>` attributes). Exported so the webview layer can assert at
 * the generation site in addition to the consumption site — defense-in-depth.
 *
 * @throws {CspValidationError} with a scrubbed, static message — never echo
 *   attacker-controlled bytes back through error logs.
 */
export function assertValidNonce(nonce: string): void {
  if (!NONCE_PATTERN.test(nonce)) {
    throw new CspValidationError('assertValidNonce: nonce contains disallowed characters');
  }
}

/**
 * Validate a BCP 47 language tag for interpolation into `<html lang="…">`.
 * Exported for defense-in-depth alongside `assertValidNonce`. Callers that
 * may legitimately receive an empty locale (e.g. bootstrap before i18n is
 * ready) should coerce the empty string to a safe default first rather than
 * duplicating the fallback logic (see `coerceLang` in `shell.ts`).
 *
 * @throws {CspValidationError} with a static, scrubbed message.
 */
export function assertValidLang(lang: string): void {
  if (!LANG_PATTERN.test(lang)) {
    throw new CspValidationError('assertValidLang: lang is not a valid BCP 47 tag');
  }
}

/**
 * Build Content Security Policy header value
 *
 * Defense-in-depth:
 *  - `base-uri 'none'` / `form-action 'none'` / `frame-ancestors 'none'` are
 *    emitted explicitly because `default-src 'none'` does NOT cover them per
 *    CSP3 §6.1 (these directives have no fallback to default-src).
 *  - `nonce` and `cspSource` are format-validated before string interpolation
 *    so a compromised caller cannot inject additional directives via attribute
 *    breakout. Both inputs are currently VS Code-controlled, but the rule of
 *    two says a trust boundary we don't own must still be validated.
 *  - `style-src` drops `cspSource` and permits only `'nonce-…'`, closing the
 *    `<link rel="stylesheet" href="${cspSource}/…">` bypass path.
 *
 * @param cspSource - Webview CSP source (webview.cspSource)
 * @param nonce - Nonce for style-src and script-src
 * @returns CSP header string
 * @throws {CspValidationError} if `nonce` or `cspSource` fails format validation
 */
export function buildCspString(cspSource: string, nonce: string): string {
  // Delegate to assertValidNonce — single source of truth for nonce format.
  // The thrown CspValidationError keeps the scrub invariant
  // (static message, no attacker bytes) and `renderWithFallback` narrows on
  // `instanceof CspValidationError`, not on the prefix string.
  assertValidNonce(nonce);
  if (!CSP_SOURCE_PATTERN.test(cspSource)) {
    throw new CspValidationError('buildCspString: cspSource has unexpected format');
  }

  const directives = [
    `default-src 'none'`,
    // default-src 'none' does not cover these; emit explicitly (CSP3 §6.1).
    `base-uri 'none'`,
    `form-action 'none'`,
    `frame-ancestors 'none'`,
    // Allow images from: VSCode, our CDN, shields.io badges, GitHub avatars
    `img-src ${cspSource} https://assets.nullvariant.com https://img.shields.io https://avatars.githubusercontent.com`,
    // style-src is nonce-only: dropping cspSource closes the
    // `<link rel="stylesheet" href="${cspSource}/…">` bypass.
    `style-src 'nonce-${nonce}'`,
    `script-src 'nonce-${nonce}'`,
    `connect-src https://assets.nullvariant.com`,
    `font-src ${cspSource}`,
  ];

  return directives.join('; ');
}
