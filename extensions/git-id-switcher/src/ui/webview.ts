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
  return buildDocumentHtml(webview.cspSource, content, locale, currentPath, nonce, canGoBack);
}

/**
 * Generate loading state HTML
 *
 * @param webview - Webview instance
 * @param nonce - CSP nonce for inline styles
 * @returns Loading HTML document
 */
export function getLoadingHtml(webview: vscode.Webview, nonce: string): string {
  return buildLoadingHtml(webview.cspSource, nonce);
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
  return buildErrorHtml(webview.cspSource, errorType, nonce);
}
