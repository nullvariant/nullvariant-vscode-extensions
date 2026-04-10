/**
 * HTML Shell Wrapper (Pure Function)
 *
 * Owns the `<!DOCTYPE>…</head>` skeleton shared across every documentation
 * webview template. Combines `getBaseStyles()` with per-template
 * `extraStyles` in a single place so templates cannot drift on the base
 * layer, and re-validates every attribute-interpolated input at the
 * boundary (defense-in-depth against a future caller that erases the
 * compile-time types).
 *
 * Split from the legacy monolithic htmlTemplates.ts (Issue-00194) and then
 * further narrowed in Issue-00243: types live in `./types`, CSP validators
 * in `./csp`, base styles in `./baseStyles`. This file now contains only
 * the shell wrapper and its options interface.
 *
 * @author Null;Variant
 * @license MIT
 */

import { escapeHtmlEntities } from '../documentationInternal';
import { getBaseStyles } from './baseStyles';
import {
  CspValidationError,
  assertValidLang,
  assertValidNonce,
  buildCspString,
  coerceLang,
} from './csp';
import { type BodyClass, type SanitizedHtml, VALID_BODY_CLASSES } from './types';

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
