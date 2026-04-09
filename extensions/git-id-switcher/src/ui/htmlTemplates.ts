/**
 * HTML Template Builder Module (Pure Functions)
 *
 * Generates HTML templates for documentation Webview panels.
 * All functions are pure (no VS Code dependency) for unit testability.
 * VS Code-dependent wrappers live in webview.ts.
 *
 * Extracted from webview.ts for testability (Issue-00110).
 *
 * @author Null;Variant
 * @license MIT
 */

import { escapeHtmlEntities } from './documentationInternal';

// ============================================================================
// Types
// ============================================================================

/** Error types for documentation display */
export type ErrorType = 'network' | 'notfound' | 'server';

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
 * the generation site in addition to the consumption site — defense-in-depth
 * per Issue-00191.
 *
 * @throws {CspValidationError} with a scrubbed, static message (Issue-00236
 *   contract: never echo attacker-controlled bytes back through error logs).
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
  // The thrown CspValidationError keeps the Issue-00236 scrub invariant
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
 * decides the winner (Issue-00189).
 */
export function getBaseStyles(): string {
  return `:root {
      --gis-radius-sm: 3px;
      --gis-radius-md: 5px;
      /* Unified 1px panel border used across h1/th,td/hr/nav/footer (Issue-00192). */
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

// ============================================================================
// HTML Shell
// ============================================================================

/**
 * Options for the shared HTML shell wrapper.
 *
 * The shell owns <!DOCTYPE>, <html>, <head> (charset/CSP/viewport/title/style)
 * and the outer <body> tags. Each template provides its own styles and body
 * content, keeping the skeleton in a single place (Issue-00186).
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
  /** Full CSS content placed inside the single <style nonce> block. */
  readonly styles: string;
  /**
   * Body class identifier. Compile-time restricted to the `BodyClass` union
   * and runtime-checked against `VALID_BODY_CLASSES` so a future caller that
   * erases the type cannot inject attacker-controlled bytes into the `<body
   * class>` attribute (Issue-00191). Template-specific body CSS MUST be
   * scoped by this class so template overrides raise specificity beyond the
   * base `body` rule in getBaseStyles() (Issue-00189).
   */
  readonly bodyClass: BodyClass;
  /** Raw HTML inserted between <body> and </body> (may include <script>). */
  readonly body: string;
}

/**
 * Build the shared HTML shell for all webview templates.
 *
 * Centralises the <!DOCTYPE>…</head> skeleton previously duplicated across
 * document/loading/error templates so meta tag additions, CSP changes, and
 * a11y fixes happen in exactly one place.
 */
function buildHtmlShell(opts: Readonly<HtmlShellOptions>): string {
  // Defense-in-depth: validate every attribute-interpolated input at the
  // shell boundary, not just at the caller that generates it. nonce and lang
  // land in attribute context (`<style nonce>`, `<html lang>`), where a
  // single stray `"` or `>` permits breakout; bodyClass is allowlist-checked
  // because it is under our compile-time control (Issue-00191).
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
    ${opts.styles}
  </style>
</head>
<body class="${opts.bodyClass}">
${opts.body}
</body>
</html>`;
}

// ============================================================================
// HTML Templates
// ============================================================================

/**
 * Generate the document HTML with content
 *
 * @param cspSource - Webview CSP source
 * @param content - Pre-sanitized HTML content, typed as `SanitizedHtml` so
 *   the compiler forbids passing a raw `string`. The brand can only originate
 *   at the sanitizer boundary (`renderMarkdown`), making the trust boundary
 *   structurally impossible to bypass. This function injects `content`
 *   verbatim; CSP blocks `<script>` execution but does NOT stop `<img
 *   onerror>` or `javascript:` URLs outside the linkInterceptScript path,
 *   which is exactly why we want the type-level guarantee on top of CSP.
 * @param locale - Current locale
 * @param currentPath - Current document path (for relative link resolution)
 * @param nonce - CSP nonce for inline styles and scripts
 * @param canGoBack - Whether back navigation is available
 * @returns Complete HTML document
 */
export function buildDocumentHtml(
  cspSource: string,
  content: SanitizedHtml,
  locale: string,
  currentPath: string,
  nonce: string,
  canGoBack: boolean
): string {
  // Script to intercept link clicks / keyboard activation and back button.
  //
  // Keyboard policy for <a>: only Enter activates. Native <a> already fires
  // a synthetic click on Enter, so the click listener covers it with zero
  // extra code. Space is intentionally NOT handled — on <a> Space performs
  // page scroll per the ARIA Authoring Practices, and synthesising
  // navigation there would break user expectations (WCAG 3.2.5 Change on
  // Request). The back button is a <button>, where both Enter and Space
  // DO fire a native click, so its activation also flows through the
  // click listener.
  //
  // Why aria-disabled on back-btn (not [disabled]): Safari/VoiceOver remove
  // focus from [disabled] buttons entirely, trapping keyboard users who
  // tab-land on the nav bar. aria-disabled keeps the button in the focus
  // order and we guard the click handler instead.
  const linkInterceptScript = `
    (function() {
      const vscode = acquireVsCodeApi();

      document.addEventListener('click', function(e) {
        // Back button takes precedence: if the click path traverses the
        // back button, handle it first so link-in-button edge cases (a
        // sanitizer future-regression adding <a> inside the button) cannot
        // bypass the aria-disabled guard below.
        const backBtn = e.target.closest && e.target.closest('#back-btn');
        if (backBtn) {
          if (backBtn.getAttribute('aria-disabled') === 'true') {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          vscode.postMessage({ command: 'back' });
          return;
        }

        const link = e.target.closest && e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;

        e.preventDefault();

        if (href.startsWith('#')) {
          const target = document.getElementById(href.slice(1));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }

        vscode.postMessage({ command: 'navigate', href: href });
      });
    })();
  `;

  const styles = `${getBaseStyles()}
    /* External link indicator.
       The "/ <alt-text>" syntax (CSS Generated Content L3) provides the
       screen-reader announcement for the decorative arrow glyph. We
       announce "(opens externally)" rather than silencing it so AT
       users receive the same "external link" signal as sighted users.
       Note: VS Code webview is Electron/Chromium so this syntax is
       supported; it is not portable to Firefox. */
    a[href^="http"]:not([href*="assets.nullvariant.com"])::after {
      content: " ↗" / " (opens externally)";
      font-size: var(--gis-font-xs);
    }
    h1, h2, h3 {
      color: var(--vscode-foreground);
      margin-top: var(--gis-space-lg);
      margin-bottom: var(--gis-space-sm);
    }
    h1 { border-bottom: var(--gis-border-subtle); padding-bottom: var(--gis-space-xs); }
    code {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 0.2em 0.4em;
      border-radius: var(--gis-radius-sm);
      font-family: var(--vscode-editor-font-family);
    }
    pre {
      background-color: var(--vscode-textCodeBlock-background);
      padding: var(--gis-space-md);
      border-radius: var(--gis-radius-md);
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    ul {
      padding-left: var(--gis-space-lg);
    }
    li {
      margin-bottom: var(--gis-space-sm);
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: var(--gis-space-md) 0;
    }
    th, td {
      border: var(--gis-border-subtle);
      padding: var(--gis-space-sm) var(--gis-space-md);
      text-align: left;
      /* Prevent long tokens (URLs, hashes) from pushing the table
         wider than its container. overflow-wrap: anywhere is sufficient;
         we deliberately do NOT use table-layout: fixed (which would
         force equal column widths regardless of content). */
      overflow-wrap: anywhere;
    }
    th {
      background-color: var(--vscode-textCodeBlock-background);
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: var(--vscode-textCodeBlock-background);
    }
    blockquote {
      border-left: 4px solid var(--vscode-textLink-foreground);
      margin: var(--gis-space-md) 0;
      padding: var(--gis-space-sm) var(--gis-space-md);
      background-color: var(--vscode-textCodeBlock-background);
      font-style: italic;
    }
    hr {
      border: none;
      border-top: var(--gis-border-subtle);
      margin: var(--gis-space-xl) 0;
    }
    .nav-bar {
      margin-bottom: var(--gis-space-md);
      padding-bottom: var(--gis-space-sm);
      border-bottom: var(--gis-border-subtle);
    }
    .nav-bar button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      padding: var(--gis-pad-btn);
      border-radius: var(--gis-radius-sm);
      cursor: pointer;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    .nav-bar button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    /* aria-disabled is used instead of the [disabled] attribute so
       Safari/VoiceOver keep the button in the focus order (Issue-00188).
       Uses a theme-aware foreground color instead of opacity so the
       focus-visible outline retains full contrast (WCAG 1.4.11) when
       the button is both focused and disabled. */
    .nav-bar button[aria-disabled="true"] {
      color: var(--vscode-disabledForeground, var(--vscode-descriptionForeground));
      cursor: not-allowed;
    }
    .nav-bar .current-path {
      margin-left: var(--gis-space-md);
      color: var(--vscode-descriptionForeground);
      font-size: var(--gis-font-sm);
    }
    /* WCAG 2.4.7 Focus Visible: a single SSOT focus ring shared by
       every focusable element in the document template. Uses VS Code
       theme tokens so it adapts to light/dark/high-contrast themes. */
    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }
    /* Forced-colors (Windows High Contrast) overrides.
       - The nth-child(even) zebra uses a theme background that collapses to
         Canvas in forced-colors, flattening rows. Explicitly reset to
         Canvas so rows keep the system background rather than an opaque
         panel color that would fight cell borders.
       - Focus outlines must use the system Highlight color per WCAG 1.4.3. */
    @media (forced-colors: active) {
      /* Both th and zebra rows share --vscode-textCodeBlock-background
         in the default theme; under forced-colors that token collapses and
         can fight cell borders. Flatten them to Canvas so the system
         palette drives row/cell backgrounds uniformly. */
      tr:nth-child(even),
      th {
        background-color: Canvas;
      }
      a:focus-visible,
      button:focus-visible {
        outline-color: Highlight;
      }
    }
    .footer {
      margin-top: var(--gis-pad-body-lg);
      padding-top: var(--gis-pad-body);
      border-top: var(--gis-border-subtle);
      font-size: var(--gis-font-sm);
    }
    .footer a {
      margin-right: var(--gis-space-md);
    }
    /* Template-specific body layout — scoped by body.gis-doc class to
       raise specificity above the base body rule, making cascade order
       irrelevant (Issue-00189). */
    body.gis-doc {
      padding: var(--gis-pad-body);
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }`;

  // aria-disabled (not [disabled]) preserves tab focus under Safari/VoiceOver.
  // The ← glyph lives inside an aria-hidden span so AT announces only the
  // button's aria-label ("Go back") instead of reading the arrow as a
  // standalone token before the word "Back".
  const body = `  <nav class="nav-bar" aria-label="Document navigation">
    <button id="back-btn" type="button" aria-label="Go back" aria-disabled="${canGoBack ? 'false' : 'true'}"><span aria-hidden="true">← </span>Back</button>
    <span class="current-path" aria-current="page">${escapeHtmlEntities(currentPath)}</span>
  </nav>
  <main>
${content}
  </main>
  <footer class="footer">
    <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/tree/main/extensions/git-id-switcher#readme" aria-label="View Git ID Switcher on GitHub">View on GitHub</a>
    <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher">VS Code Marketplace</a>
  </footer>
  <script nonce="${nonce}">${linkInterceptScript}</script>`;

  return buildHtmlShell({
    cspSource,
    nonce,
    lang: locale,
    title: 'Git ID Switcher Documentation',
    styles,
    bodyClass: 'gis-doc',
    body,
  });
}

/**
 * Generate loading state HTML
 *
 * @param cspSource - Webview CSP source
 * @param nonce - CSP nonce for inline styles
 * @returns Loading HTML document
 */
export function buildLoadingHtml(cspSource: string, nonce: string): string {
  const styles = `${getBaseStyles()}
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--vscode-panel-border);
      border-top-color: var(--vscode-textLink-foreground);
      border-radius: 50%; /* circle, not a token */
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    p {
      margin-top: var(--gis-space-md);
    }`;

  // aria-live="polite" + aria-atomic complements role="status" for AT stacks
  // (older NVDA, some mobile readers) that miss the implicit live region on
  // elements rendered during initial document parse.
  const body = `  <main class="loading">
    <div class="spinner" aria-hidden="true"></div>
    <p role="status" aria-live="polite" aria-atomic="true">Loading documentation...</p>
  </main>`;

  return buildHtmlShell({
    cspSource,
    nonce,
    lang: 'en',
    title: 'Loading — Git ID Switcher',
    styles,
    bodyClass: 'gis-loading',
    body,
  });
}

/**
 * Generate error state HTML
 *
 * @param cspSource - Webview CSP source
 * @param errorType - Type of error
 * @param nonce - CSP nonce for inline styles
 * @returns Error HTML document
 */
export function buildErrorHtml(
  cspSource: string,
  errorType: ErrorType,
  nonce: string
): string {
  const messages = {
    network: {
      title: 'Network Error',
      body: 'Could not connect to the documentation server. Please check your internet connection.',
    },
    notfound: {
      title: 'Document Not Found',
      body: 'The documentation for this language is not available.',
    },
    server: {
      title: 'Server Error',
      body: 'The documentation server is currently unavailable. Please try again later.',
    },
  };
  const msg = messages[errorType];

  const styles = `${getBaseStyles()}
    /* Template-specific body layout — scoped by body.gis-error class
       to raise specificity above the base body rule (Issue-00189). */
    body.gis-error {
      padding: var(--gis-pad-body-lg);
      text-align: center;
    }
    h1 {
      color: var(--vscode-errorForeground);
    }
    /* WCAG 2.4.7 Focus Visible — error template has no other focusable
       controls but still needs a visible focus ring on the fallback link. */
    a:focus-visible {
      outline: 2px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }
    @media (forced-colors: active) {
      a:focus-visible {
        outline-color: Highlight;
      }
    }`;

  // role="alert" wraps only the body <p>, not the <h1>. Putting a heading
  // inside role="alert" causes JAWS to drop it from the heading list and
  // some AT to re-read the title as both "alert" and "heading level 1".
  // The <h1> remains the landmark heading; the alert announces only the
  // detail message, which is the part that needs to interrupt the user.
  const body = `  <main>
    <h1>${msg.title}</h1>
    <p role="alert">${msg.body}</p>
    <p><a href="https://github.com/nullvariant/nullvariant-vscode-extensions/tree/main/extensions/git-id-switcher#readme" aria-label="View Git ID Switcher on GitHub">View on GitHub</a></p>
  </main>`;

  return buildHtmlShell({
    cspSource,
    nonce,
    lang: 'en',
    title: `${msg.title} — Git ID Switcher`,
    styles,
    bodyClass: 'gis-error',
    body,
  });
}
