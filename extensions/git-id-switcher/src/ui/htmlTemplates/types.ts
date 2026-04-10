/**
 * HTML Templates — Trust-Boundary Types
 *
 * Zero-runtime module holding the branded/union types that mark values as
 * "safe to interpolate into the webview HTML". Kept separate from the
 * modules that *produce* or *validate* those values so that:
 *  - A type-only consumer (e.g. a future template) can import the brand
 *    without pulling in regex tables or style strings.
 *  - The trust boundary has exactly one canonical declaration site, so a
 *    brand drift (renaming, accidental re-definition) shows up as a single
 *    compile error rather than a silent string-coerced fall-through.
 *
 * Split from shell.ts in Issue-00243 so that shell.ts can shrink to the
 * skeleton wrapper (`buildHtmlShell`) alone.
 *
 * @author Null;Variant
 * @license MIT
 */

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

/**
 * SSOT allowlist for body class identifiers consumed by `buildHtmlShell`.
 * The tuple is declared `as const` so the `BodyClass` type below can be
 * derived from it — adding a new template means widening this one array
 * and the compile-time union follows automatically (no dual-definition
 * drift, core-values #2).
 */
export const VALID_BODY_CLASSES = new Set([
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
