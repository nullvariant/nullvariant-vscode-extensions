/**
 * Webview HTML Generation Module
 *
 * Generates HTML templates for documentation Webview panels.
 * Includes CSP (Content Security Policy) configuration and styling.
 *
 * Split from documentation.ts for maintainability (Issue-00069 Phase 5.1).
 *
 * @author Null;Variant
 * @license MIT
 */

import * as vscode from 'vscode';
import * as crypto from 'node:crypto';

// ============================================================================
// Types
// ============================================================================

/** Error types for documentation display */
export type ErrorType = 'network' | 'notfound' | 'server';

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
 * @param nonce - Optional nonce for script-src (required when enableScripts: true)
 * @returns CSP header string
 */
export function buildCsp(webview: vscode.Webview, nonce?: string): string {
  const directives = [
    `default-src 'none'`,
    // Allow images from: VSCode, our CDN, shields.io badges, GitHub avatars
    `img-src ${webview.cspSource} https://assets.nullvariant.com https://img.shields.io https://*.githubusercontent.com`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `connect-src https://assets.nullvariant.com`,
    `font-src ${webview.cspSource}`,
  ];

  // Add script-src with nonce when scripts are enabled
  if (nonce) {
    directives.push(`script-src 'nonce-${nonce}'`);
  }

  return directives.join('; ');
}

// ============================================================================
// HTML Templates
// ============================================================================

/**
 * Generate the document HTML with content
 *
 * @param webview - Webview instance
 * @param content - Rendered HTML content
 * @param locale - Current locale
 * @param currentPath - Current document path (for relative link resolution)
 * @param nonce - CSP nonce for inline scripts
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
  const csp = buildCsp(webview, nonce);

  // Script to intercept link clicks and send messages to extension
  const linkInterceptScript = `
    (function() {
      const vscode = acquireVsCodeApi();

      document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Prevent default navigation
        e.preventDefault();

        // Handle anchor links (scroll within page)
        if (href.startsWith('#')) {
          const target = document.getElementById(href.slice(1));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }

        // Send navigation request to extension
        vscode.postMessage({
          command: 'navigate',
          href: href
        });
      });

      // Handle back button
      document.getElementById('back-btn')?.addEventListener('click', function() {
        vscode.postMessage({ command: 'back' });
      });
    })();
  `;

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git ID Switcher Documentation</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
    a {
      color: var(--vscode-textLink-foreground);
    }
    a:hover {
      color: var(--vscode-textLink-activeForeground);
    }
    /* External link indicator */
    a[href^="http"]:not([href*="assets.nullvariant.com"])::after {
      content: " ↗";
      font-size: 0.8em;
    }
    h1, h2, h3 {
      color: var(--vscode-foreground);
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    h1 { border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 0.3em; }
    code {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
    }
    pre {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    ul {
      padding-left: 1.5em;
    }
    li {
      margin-bottom: 0.5em;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid var(--vscode-panel-border);
      padding: 0.5em 1em;
      text-align: left;
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
      margin: 1em 0;
      padding: 0.5em 1em;
      background-color: var(--vscode-textCodeBlock-background);
      font-style: italic;
    }
    hr {
      border: none;
      border-top: 1px solid var(--vscode-panel-border);
      margin: 2em 0;
    }
    .nav-bar {
      margin-bottom: 1em;
      padding-bottom: 0.5em;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .nav-bar button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      padding: 4px 12px;
      border-radius: 3px;
      cursor: pointer;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    .nav-bar button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .nav-bar button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .nav-bar .current-path {
      margin-left: 1em;
      color: var(--vscode-descriptionForeground);
      font-size: 0.9em;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--vscode-panel-border);
      font-size: 0.9em;
    }
    .footer a {
      margin-right: 1em;
    }
  </style>
</head>
<body>
  <div class="nav-bar">
    <button id="back-btn" ${canGoBack ? '' : 'disabled'}>← Back</button>
    <span class="current-path">${currentPath}</span>
  </div>
  ${content}
  <div class="footer">
    <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/tree/main/extensions/git-id-switcher#readme">View on GitHub</a>
    <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher">VS Code Marketplace</a>
  </div>
  <script nonce="${nonce}">${linkInterceptScript}</script>
</body>
</html>`;
}

/**
 * Generate loading state HTML
 *
 * @param webview - Webview instance
 * @returns Loading HTML document
 */
export function getLoadingHtml(webview: vscode.Webview): string {
  const csp = buildCsp(webview);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
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
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    p {
      margin-top: 1em;
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading documentation...</p>
  </div>
</body>
</html>`;
}

/**
 * Generate error state HTML
 *
 * @param webview - Webview instance
 * @param errorType - Type of error
 * @returns Error HTML document
 */
export function getErrorHtml(
  webview: vscode.Webview,
  errorType: ErrorType
): string {
  const csp = buildCsp(webview);

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

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 40px;
      text-align: center;
    }
    h1 {
      color: var(--vscode-errorForeground);
    }
    a {
      color: var(--vscode-textLink-foreground);
    }
  </style>
</head>
<body>
  <h1>${msg.title}</h1>
  <p>${msg.body}</p>
  <p><a href="https://github.com/nullvariant/nullvariant-vscode-extensions/tree/main/extensions/git-id-switcher#readme">View on GitHub</a></p>
</body>
</html>`;
}
