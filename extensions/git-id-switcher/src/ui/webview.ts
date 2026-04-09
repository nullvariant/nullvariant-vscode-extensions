/**
 * Webview HTML Generation Module (VS Code Wrappers)
 *
 * Thin wrappers that extract cspSource from VS Code Webview
 * and delegate to pure functions in htmlTemplates.ts.
 *
 * Split from documentation.ts for maintainability (Issue-00069 Phase 5.1).
 * Pure functions extracted to htmlTemplates.ts for testability (Issue-00110).
 *
 * @author Null;Variant
 * @license MIT
 */

import * as vscode from 'vscode';
import * as crypto from 'node:crypto';

import {
  type ErrorType,
  buildCspString,
  buildDocumentHtml,
  buildLoadingHtml,
  buildErrorHtml,
} from './htmlTemplates';

export type { ErrorType } from './htmlTemplates';

// ============================================================================
// Nonce Generation
// ============================================================================

/**
 * Generate a cryptographically secure nonce for CSP
 * @returns Base64-encoded random string
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

// ============================================================================
// CSP Configuration
// ============================================================================

/**
 * Build Content Security Policy header value
 *
 * @param webview - Webview instance for cspSource
 * @param nonce - Nonce for style-src and script-src (required for inline styles/scripts)
 * @returns CSP header string
 */
export function buildCsp(webview: vscode.Webview, nonce: string): string {
  return buildCspString(webview.cspSource, nonce);
}

// ============================================================================
// Hard-coded Fallback (defense-in-depth)
// ============================================================================

/** Template kinds that may request fallback rendering. */
type TemplateKind = 'document' | 'loading' | 'error';

/**
 * Static, interpolation-free fallback HTML used when buildCspString() rejects
 * the live nonce or webview.cspSource (e.g. VS Code ships a cspSource shape
 * that no longer matches CSP_SOURCE_PATTERN). Without this layer, the error
 * template itself can throw and leave the user staring at a blank webview —
 * the one place we MUST keep showing *something*.
 *
 * Contract:
 *  - No template interpolation. Anything dynamic would re-introduce the same
 *    validation-failure class we are trying to escape.
 *  - CSP is `default-src 'none'` only. No nonce → no inline style/script,
 *    no external resources; the page renders as unstyled text but is safe.
 *  - English-only copy so the fallback itself never depends on locale. MUST
 *    remain English-only even after full i18n lands — localising this string
 *    would couple the fallback to the very locale-loader it is meant to
 *    survive.
 *
 * DO NOT refactor this to share code with buildHtmlShell / htmlTemplates.
 * This function exists PRECISELY to stay alive when that code path throws;
 * any shared dependency would re-introduce the failure mode it escapes.
 */
function staticFallbackHtml(): string {
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
 * Invoke a template builder and, if it throws, log the failure and fall back
 * to `staticFallbackHtml()`. Keeps the webview usable even when the CSP
 * format contract is violated (e.g. future VS Code API drift).
 */
function renderWithFallback(
  kind: TemplateKind,
  build: () => string
): string {
  try {
    return build();
  } catch (error) {
    // Log with context but never surface the caller-supplied values — the
    // error message from buildCspString is already scrubbed, and we do not
    // want to echo a potentially attacker-chosen nonce into extension logs.
    console.error(
      `[git-id-switcher] webview ${kind} template failed; serving static fallback`,
      error instanceof Error ? error.message : String(error)
    );
    return staticFallbackHtml();
  }
}

// ============================================================================
// HTML Templates (VS Code Wrappers)
// ============================================================================

/**
 * Generate the document HTML with content
 *
 * @param webview - Webview instance
 * @param content - Rendered HTML content
 * @param locale - Current locale
 * @param currentPath - Current document path (for relative link resolution)
 * @param nonce - CSP nonce for inline styles and scripts
 * @param canGoBack - Whether back navigation is available
 * @returns Complete HTML document
 */
export function getDocumentHtml(
  webview: vscode.Webview,
  content: string,
  locale: string,
  currentPath: string,
  nonce: string,
  canGoBack: boolean
): string {
  return renderWithFallback('document', () =>
    buildDocumentHtml(webview.cspSource, content, locale, currentPath, nonce, canGoBack)
  );
}

/**
 * Generate loading state HTML
 *
 * @param webview - Webview instance
 * @param nonce - CSP nonce for inline styles
 * @returns Loading HTML document
 */
export function getLoadingHtml(webview: vscode.Webview, nonce: string): string {
  return renderWithFallback('loading', () => buildLoadingHtml(webview.cspSource, nonce));
}

/**
 * Generate error state HTML
 *
 * @param webview - Webview instance
 * @param errorType - Type of error
 * @param nonce - CSP nonce for inline styles
 * @returns Error HTML document
 */
export function getErrorHtml(
  webview: vscode.Webview,
  errorType: ErrorType,
  nonce: string
): string {
  return renderWithFallback('error', () => buildErrorHtml(webview.cspSource, errorType, nonce));
}
