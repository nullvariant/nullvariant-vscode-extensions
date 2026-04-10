/**
 * Loading HTML Template (Pure Function)
 *
 * Split from the legacy monolithic htmlTemplates.ts. Owns only
 * the loading-state spinner body and its template-specific styles; the shell
 * (<!DOCTYPE>…</head>, base stylesheet) lives in `./shell.ts`.
 *
 * @author Null;Variant
 * @license MIT
 */

import { buildHtmlShell } from './shell';
import { type SanitizedHtml } from './types';

/**
 * Generate loading state HTML
 *
 * @param cspSource - Webview CSP source
 * @param nonce - CSP nonce for inline styles
 * @returns Loading HTML document
 */
export function buildLoadingHtml(cspSource: string, nonce: string): string {
  const extraStyles = `    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .spinner {
      width: var(--gis-spinner-size);
      height: var(--gis-spinner-size);
      border: var(--gis-spinner-border) solid var(--vscode-panel-border);
      border-top-color: var(--vscode-textLink-foreground);
      border-radius: 50%; /* circle, not a token */
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    /* Scope under body.gis-loading to stay consistent with the
      invariant (template overrides must not leak as bare
       element selectors). Loading view currently only renders one <p>
       but this keeps the template symmetric with document/error. */
    body.gis-loading p {
      margin-top: var(--gis-space-md);
    }`;

  // aria-live="polite" + aria-atomic complements role="status" for AT stacks
  // (older NVDA, some mobile readers) that miss the implicit live region on
  // elements rendered during initial document parse.
  // Brand the body as SanitizedHtml: only static literals, no interpolation.
  const body = `  <main class="loading">
    <div class="spinner" aria-hidden="true"></div>
    <p role="status" aria-live="polite" aria-atomic="true">Loading documentation...</p>
  </main>` as SanitizedHtml;

  return buildHtmlShell({
    cspSource,
    nonce,
    lang: 'en',
    title: 'Loading — Git ID Switcher',
    extraStyles,
    bodyClass: 'gis-loading',
    body,
  });
}
