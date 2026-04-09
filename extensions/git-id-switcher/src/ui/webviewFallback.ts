/**
 * Webview Fallback Module (Pure Functions)
 *
 * Defense-in-depth layer invoked by webview.ts when a template builder
 * throws due to CSP format drift. Split out of webview.ts so it can be
 * unit-tested without the vscode top-level import dependency.
 *
 * Pure (no vscode). Any dependency added here MUST also be dependency-free
 * — this module exists to stay alive when the main builder pipeline fails.
 *
 * @author Null;Variant
 * @license MIT
 */

import { CspValidationError } from './htmlTemplates';

/** Template kinds that may request fallback rendering. */
export type TemplateKind = 'document' | 'loading' | 'error';

/**
 * Static, interpolation-free fallback HTML used when `buildCspString()`
 * rejects the live nonce or webview.cspSource (e.g. VS Code ships a
 * cspSource shape that no longer matches CSP_SOURCE_PATTERN). Without this
 * layer, the error template itself can throw and leave the user staring at
 * a blank webview — the one place we MUST keep showing *something*.
 *
 * Contract:
 *  - No template interpolation. Anything dynamic would re-introduce the
 *    same validation-failure class we are trying to escape.
 *  - CSP is `default-src 'none'` only. No nonce → no inline style/script,
 *    no external resources; the page renders as unstyled text but is safe.
 *  - English-only copy so the fallback itself never depends on locale.
 *    MUST remain English-only even after full i18n lands — localising this
 *    string would couple the fallback to the very locale-loader it is
 *    meant to survive.
 *
 * DO NOT refactor this to share code with buildHtmlShell / htmlTemplates.
 * This function exists PRECISELY to stay alive when that code path throws;
 * any shared dependency would re-introduce the failure mode it escapes.
 */
export function staticFallbackHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git ID Switcher</title>
</head>
<body>
  <h1>Documentation unavailable</h1>
  <p>The documentation view could not be rendered safely. Please report this on GitHub.</p>
</body>
</html>`;
}

/**
 * Invoke a template builder and, if it throws a `CspValidationError`, log
 * the failure and fall back to `staticFallbackHtml()`. Any other error
 * (logic bug, TypeError, escape regression) is re-thrown so the extension
 * host surfaces it instead of silently masking observability.
 *
 * Narrow catch rationale: a broad `catch (error)` would swallow non-CSP
 * bugs (Issue-00236). Limiting the fallback to `CspValidationError`
 * preserves the CSP drift defence while keeping logic bugs loud.
 */
export function renderWithFallback(
  kind: TemplateKind,
  build: () => string
): string {
  try {
    return build();
  } catch (error) {
    if (error instanceof CspValidationError) {
      // Log with context but never surface the caller-supplied values —
      // the error message from buildCspString is already scrubbed, and we
      // do not want to echo a potentially attacker-chosen nonce into
      // extension logs.
      console.error(
        `[git-id-switcher] webview ${kind} template CSP validation failed; serving static fallback`,
        error.message
      );
      return staticFallbackHtml();
    }
    throw error;
  }
}
