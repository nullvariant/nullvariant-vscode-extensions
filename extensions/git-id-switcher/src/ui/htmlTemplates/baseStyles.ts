/**
 * HTML Templates — Shared Base Styles
 *
 * Owns the design-token + body-core CSS shared across every webview
 * template, along with the SSOT links/selectors that templates compose
 * into their own style blocks:
 *  - `getBaseStyles` — design tokens, body core, link colors
 *  - `GITHUB_README_URL` — SSOT for the extension's README destination
 *  - `getFocusVisibleRule` / `getFocusVisibleForcedColorsRule` — WCAG 2.4.7
 *    focus indication helpers
 *
 * Split from shell.ts in Issue-00243 so shell.ts can shrink to the skeleton
 * wrapper alone. Kept in a dedicated module so a future style-token overhaul
 * does not force unrelated shell/csp changes through review.
 *
 * @author Null;Variant
 * @license MIT
 */

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
      /* px-based layout sizing (body padding, footer gap, button padding)
         that must not scale with inherited font-size. */
      --gis-size-btn: 4px 12px;
      --gis-size-body: 20px;
      --gis-size-body-lg: 40px;
      /* font-size tokens. Declared against the document root so nested elements
         do not multiply em values (0.9em inside a 0.9em ancestor shrinks). */
      --gis-font-sm: 0.9em;
      --gis-font-xs: 0.8em;
      /* Document body readability tokens. */
      --gis-width-readable: 800px;
      --gis-line-height-doc: 1.6;
      /* Emphasis border (blockquote left-edge, distinct from the subtle 1px
         panel border). */
      --gis-border-emphasis: 4px solid var(--vscode-textLink-foreground);
      /* Inline code padding scale. */
      --gis-pad-code: 0.2em 0.4em;
      /* Spinner dimensions. */
      --gis-spinner-size: 40px;
      --gis-spinner-border: 3px;
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
