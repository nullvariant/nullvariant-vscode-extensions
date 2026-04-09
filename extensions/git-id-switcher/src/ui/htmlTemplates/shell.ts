/**
 * HTML Shell Module (Pure Functions)
 *
 * Skeleton-level primitives shared by every documentation webview template:
 *  - Trust-boundary types (SanitizedHtml, BodyClass)
 *  - CSP validators and builder (assertValidNonce/Lang, buildCspString)
 *  - Base stylesheet (getBaseStyles)
 *  - The shell wrapper (buildHtmlShell) that owns <!DOCTYPE>…</head> and
 *    combines getBaseStyles() with per-template extraStyles in a single place.
 *
 * Split from the legacy monolithic htmlTemplates.ts so the
 * per-template files (document/loading/error) carry only their own body and
 * styles. All pure functions, no VS Code dependency — unit-testable in
 * isolation.
 *
 * @author Null;Variant
 * @license MIT
 */

import { escapeHtmlEntities } from '../documentationInternal';

// ============================================================================
// Types
// ============================================================================

/**
 * Branded string type marking HTML that has already passed through a strict
 * allowlist sanitizer (see `renderMarkdown`). The brand exists purely at the
 * type level — there is no runtime tag — and acts as a trust-boundary marker:
 *
 *  - Only the sanitizer is allowed to produce a value of this type (via a
 *    single `as SanitizedHtml` cast at its return site).
 *  - `buildDocumentHtml` accepts only `SanitizedHtml` for its verbatim-injected
 *    `content` parameter, so a plain `string` (raw markdown, untrusted input,
 *    a forgotten sanitizer call) fails at compile time instead of reaching the
 *    webview and relying on CSP as the sole defence.
 *
 * Why not a class/wrapper object? The value flows through HTML string
 * concatenation inside the template, so we need structural `string` identity;
 * a branded alias gives us the type check with zero runtime cost.
 */
export type SanitizedHtml = string & { readonly __brand: 'SanitizedHtml' };

// ============================================================================
// CSP Configuration
// ============================================================================

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
 * SSOT allowlist for body class identifiers consumed by `buildHtmlShell`.
 * The tuple is declared `as const` so the `BodyClass` type below can be
 * derived from it — adding a new template means widening this one array
 * and the compile-time union follows automatically (no dual-definition
 * drift, core-values #2).
 */
const VALID_BODY_CLASSES = new Set([
  'gis-doc',
  'gis-loading',
  'gis-error',
] as const);

/**
 * Compile-time allowlist for the body class identifier on `<body>`, derived
 * from `VALID_BODY_CLASSES` so the runtime set and the type stay in lockstep.
 * The only values that may reach `buildHtmlShell` come from template
 * functions inside this file, so a literal union plus a runtime allowlist
 * check is strictly stronger than escaping an arbitrary `string`: even a
 * future refactor that accidentally forwards external input fails at both
 * compile time and the trust boundary.
 */
export type BodyClass =
  typeof VALID_BODY_CLASSES extends ReadonlySet<infer T> ? T : never;

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
 * ready) should pass the empty string through `coerceLang` first rather than
 * duplicating the fallback logic.
 *
 * @throws {CspValidationError} with a static, scrubbed message.
 */
export function assertValidLang(lang: string): void {
  if (!LANG_PATTERN.test(lang)) {
    throw new CspValidationError('assertValidLang: lang is not a valid BCP 47 tag');
  }
}

/**
 * Coerce a possibly-empty locale to a safe default before validation. Kept
 * separate from `assertValidLang` so that the validator remains fail-closed
 * for *all* callers — only the shell, which owns the rendering contract,
 * opts into the fallback.
 */
function coerceLang(lang: string): string {
  return lang === '' ? 'en' : lang;
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
    `img-src ${cspSource} https://assets.nullvariant.com https://img.shields.io https://*.githubusercontent.com`,
    // style-src is nonce-only: dropping cspSource closes the
    // `<link rel="stylesheet" href="${cspSource}/…">` bypass.
    `style-src 'nonce-${nonce}'`,
    `script-src 'nonce-${nonce}'`,
    `connect-src https://assets.nullvariant.com`,
    `font-src ${cspSource}`,
  ];

  return directives.join('; ');
}

// ============================================================================
// Shared Styles
// ============================================================================

/**
 * Base styles shared across all HTML templates
 *
 * Contains:
 *  - Design tokens (CSS custom properties) for consistent radii/spacing
 *  - body core (font + theme colors only — layout belongs to each template)
 *  - link colors
 *
 * Template-specific body overrides (padding, max-width, text-align, etc.)
 * MUST live in the template function itself, scoped by a `body.gis-*`
 * class selector (e.g. body.gis-doc) so specificity — not cascade order —
 * decides the winner.
 */
export function getBaseStyles(): string {
  return `:root {
      --gis-radius-sm: 3px;
      --gis-radius-md: 5px;
      /* Unified 1px panel border used across h1/th,td/hr/nav/footer. */
      --gis-border-subtle: 1px solid var(--vscode-panel-border);
      /* em-based spacing scale. em is intentional so spacing follows text size.
         Use font-size tokens (below) to avoid em-chain multiplication in nested
         elements. */
      --gis-space-xs: 0.3em;
      --gis-space-sm: 0.5em;
      --gis-space-md: 1em;
      --gis-space-lg: 1.5em;
      --gis-space-xl: 2em;
      /* px-based layout spacing (body padding, footer gap, button padding) that
         must not scale with inherited font-size. */
      --gis-pad-btn: 4px 12px;
      --gis-pad-body: 20px;
      --gis-pad-body-lg: 40px;
      /* font-size tokens. Declared against the document root so nested elements
         do not multiply em values (0.9em inside a 0.9em ancestor shrinks). */
      --gis-font-sm: 0.9em;
      --gis-font-xs: 0.8em;
    }
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    a {
      color: var(--vscode-textLink-foreground);
    }
    a:hover {
      color: var(--vscode-textLink-activeForeground);
    }`;
}

/**
 * SSOT for the extension's public GitHub README URL. Multiple templates
 * (document footer, error fallback link) render the same destination; a
 * single constant ensures a future repository move touches exactly one
 * line instead of hunting through each template's body string
 * (core-values #2 SSOT).
 */
export const GITHUB_README_URL =
  'https://github.com/nullvariant/nullvariant-vscode-extensions/tree/main/extensions/git-id-switcher#readme';

/**
 * Shared `:focus-visible` outline rule — the SSOT for the WCAG 2.4.7 focus
 * indication used across every template. Returns only the non-forced-colors
 * rule so each template can compose its own `@media (forced-colors: active)`
 * block alongside any template-specific overrides (e.g. the document
 * template's zebra reset). The matching forced-colors override for the
 * ring itself lives in `getFocusVisibleForcedColorsRule`.
 *
 * Extracted when a second identical copy of the outline rule appeared in
 * `error.ts` (core-values #4 2nd-occurrence signal).
 */
export function getFocusVisibleRule(selectors: string): string {
  return `    /* WCAG 2.4.7 Focus Visible — shared ring. */
    ${selectors} {
      outline: 2px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }`;
}

/**
 * Forced-colors override for the focus ring. Kept separate from
 * `getFocusVisibleRule` so templates can emit exactly one
 * `@media (forced-colors: active)` block that bundles this override with
 * any template-local adjustments (e.g. document's zebra reset), avoiding
 * duplicate media queries.
 */
export function getFocusVisibleForcedColorsRule(selectors: string): string {
  return `      ${selectors} {
        outline-color: Highlight;
      }`;
}

// ============================================================================
// HTML Shell
// ============================================================================

/**
 * Options for the shared HTML shell wrapper.
 *
 * The shell owns <!DOCTYPE>, <html>, <head> (charset/CSP/viewport/title/style)
 * and the outer <body> tags. Each template provides only its own extra
 * styles and body content — the shell prepends getBaseStyles() internally so
 * templates cannot forget to include the design-token layer.
 */
interface HtmlShellOptions {
  readonly cspSource: string;
  readonly nonce: string;
  /**
   * BCP 47 language tag or the empty string. Empty is coerced to `'en'`
   * inside `buildHtmlShell` before validation; any other non-conforming
   * value throws `CspValidationError`.
   */
  readonly lang: string;
  readonly title: string;
  /**
   * Template-specific CSS. `buildHtmlShell` prepends `getBaseStyles()`
   * automatically, so templates must NOT include design tokens or the base
   * body rule themselves — doing so would produce duplicate `:root` blocks
   * and break the SSOT guarantee tested by testDesignTokenCoverage.
   */
  readonly extraStyles: string;
  /**
   * Body class identifier. Compile-time restricted to the `BodyClass` union
   * and runtime-checked against `VALID_BODY_CLASSES` so a future caller that
   * erases the type cannot inject attacker-controlled bytes into the `<body
   * class>` attribute. Template-specific body CSS MUST be
   * scoped by this class so template overrides raise specificity beyond the
   * base `body` rule in getBaseStyles().
   */
  readonly bodyClass: BodyClass;
  /**
   * Pre-trusted HTML inserted between `<body>` and `</body>` (may include
   * `<script>`). Typed as `SanitizedHtml` so the shell's trust boundary is
   * symmetric with `buildDocumentHtml#content`: a plain `string` (raw
   * markdown, attacker-controlled bytes, a forgotten sanitizer call) fails
   * at compile time instead of being concatenated into the webview HTML.
   * Templates obtain the brand by constructing their body as a backtick
   * literal with only statically-authored markup and the already-branded
   * `content` parameter, then casting once at the `buildHtmlShell` call
   * site.
   */
  readonly body: SanitizedHtml;
}

/**
 * Build the shared HTML shell for all webview templates.
 *
 * Centralises the <!DOCTYPE>…</head> skeleton previously duplicated across
 * document/loading/error templates so meta tag additions, CSP changes, and
 * a11y fixes happen in exactly one place. Also owns the `getBaseStyles() +
 * extraStyles` concatenation so templates cannot drift on the base layer
 * (core-values #4 — 3rd occurrence triggered abstraction).
 */
export function buildHtmlShell(opts: Readonly<HtmlShellOptions>): string {
  // Defense-in-depth: validate every attribute-interpolated input at the
  // shell boundary, not just at the caller that generates it. nonce and lang
  // land in attribute context (`<style nonce>`, `<html lang>`), where a
  // single stray `"` or `>` permits breakout; bodyClass is allowlist-checked
  // because it is under our compile-time control.
  assertValidNonce(opts.nonce);
  const lang = coerceLang(opts.lang);
  assertValidLang(lang);
  // Defense-in-depth: the BodyClass union makes this branch unreachable
  // under the normal type contract, but the runtime allowlist guards against
  // a future caller that erases the type.
  /* c8 ignore start */
  if (!VALID_BODY_CLASSES.has(opts.bodyClass)) {
    throw new CspValidationError('buildHtmlShell: bodyClass is not in the allowlist');
  }
  /* c8 ignore stop */

  // Defense-in-depth: `extraStyles` flows verbatim into a `<style>` raw-text
  // element where CSP cannot intervene — the only breakout condition is the
  // `</style` substring itself (HTML5 raw-text element rule, case-insensitive).
  // All current callers pass backtick literals with no dynamic input, so this
  // check is free; it exists to fail-closed if a future refactor threads a
  // dynamic value through `extraStyles` without first adopting a sanitizer
  // brand. `body` is deliberately NOT covered here because document.ts
  // legitimately embeds a `</script>` closing tag and `body` has a separate
  // trust boundary (`SanitizedHtml` on `buildDocumentHtml#content`).
  if (/<\/style/i.test(opts.extraStyles)) {
    throw new CspValidationError('buildHtmlShell: extraStyles contains </style sequence');
  }

  const csp = buildCspString(opts.cspSource, opts.nonce);

  // lang and bodyClass are post-validation fixed-shape values, so the
  // escapeHtmlEntities wrapper is redundant — the allowlist IS the escape.
  // Removing the call makes the trust boundary explicit: if `lang` ever
  // flows in without passing assertValidLang, the failure is structural
  // rather than silently masked by a downstream escaper.
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtmlEntities(opts.title)}</title>
  <style nonce="${opts.nonce}">
    ${getBaseStyles()}
${opts.extraStyles}
  </style>
</head>
<body class="${opts.bodyClass}">
${opts.body}
</body>
</html>`;
}
