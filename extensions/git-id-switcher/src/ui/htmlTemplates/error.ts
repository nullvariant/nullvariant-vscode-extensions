/**
 * Error HTML Template (Pure Function)
 *
 * Split from the legacy monolithic htmlTemplates.ts. Owns only
 * the error-state body, its template-specific styles, and the ERROR_MESSAGES
 * catalogue (promoted from a function-local constant to a module constant so
 * future i18n work or test introspection can consume it without reaching
 * inside the function body.
 *
 * @author Null;Variant
 * @license MIT
 */

import {
  GITHUB_README_URL,
  getFocusVisibleForcedColorsRule,
  getFocusVisibleRule,
} from './baseStyles';
import { buildHtmlShell } from './shell';
import { type SanitizedHtml } from './types';

/** Error types for documentation display. */
export type ErrorType = 'network' | 'notfound' | 'server';

/**
 * Localisable error message catalogue keyed by {@link ErrorType}.
 *
 * Promoted from a function-local constant so:
 *  - tests can assert on the canonical strings without parsing HTML;
 *  - a future i18n hook (per-locale override) has a single SSOT to target
 *    instead of threading a parameter through every caller.
 *
 * Kept `as const` so the value types narrow to literals — if a future
 * refactor tries to mutate an entry, the compiler will reject it at the
 * call site.
 */
const ERROR_MESSAGES = {
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
} as const satisfies Record<ErrorType, { readonly title: string; readonly body: string }>;

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
  const msg = ERROR_MESSAGES[errorType];

  const extraStyles = `    /* Template-specific body layout — scoped by body.gis-error class
       to raise specificity above the base body rule. */
    body.gis-error {
      padding: var(--gis-pad-body-lg);
      text-align: center;
    }
    h1 {
      color: var(--vscode-errorForeground);
    }
${getFocusVisibleRule('a:focus-visible')}
    @media (forced-colors: active) {
${getFocusVisibleForcedColorsRule('a:focus-visible')}
    }`;

  // role="alert" wraps only the body <p>, not the <h1>. Putting a heading
  // inside role="alert" causes JAWS to drop it from the heading list and
  // some AT to re-read the title as both "alert" and "heading level 1".
  // The <h1> remains the landmark heading; the alert announces only the
  // detail message, which is the part that needs to interrupt the user.
  // Brand the body as SanitizedHtml: `msg.title`/`msg.body` are `as const`
  // catalogue literals (no external input), the link href is the SSOT
  // constant, and the rest is static markup.
  const body = `  <main>
    <h1>${msg.title}</h1>
    <p role="alert">${msg.body}</p>
    <p><a href="${GITHUB_README_URL}" aria-label="View Git ID Switcher on GitHub">View on GitHub</a></p>
  </main>` as SanitizedHtml;

  return buildHtmlShell({
    cspSource,
    nonce,
    lang: 'en',
    title: `${msg.title} — Git ID Switcher`,
    extraStyles,
    bodyClass: 'gis-error',
    body,
  });
}
