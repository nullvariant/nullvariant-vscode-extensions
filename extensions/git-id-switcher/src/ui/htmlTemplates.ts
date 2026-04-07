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

// ============================================================================
// CSP Configuration
// ============================================================================

/**
 * Build Content Security Policy header value
 *
 * @param cspSource - Webview CSP source (webview.cspSource)
 * @param nonce - Nonce for style-src and script-src
 * @returns CSP header string
 */
export function buildCspString(cspSource: string, nonce: string): string {
  const directives = [
    `default-src 'none'`,
    // Allow images from: VSCode, our CDN, shields.io badges, GitHub avatars
    `img-src ${cspSource} https://assets.nullvariant.com https://img.shields.io https://*.githubusercontent.com`,
    `style-src ${cspSource} 'nonce-${nonce}'`,
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
 * MUST live in the template function itself, clearly marked by a
 * "Template-specific body overrides" comment, not here.
 */
export function getBaseStyles(): string {
  return `:root {
      --gis-radius-sm: 3px;
      --gis-radius-md: 5px;
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
// HTML Templates
// ============================================================================

/**
 * Generate the document HTML with content
 *
 * @param cspSource - Webview CSP source
 * @param content - Rendered HTML content
 * @param locale - Current locale
 * @param currentPath - Current document path (for relative link resolution)
 * @param nonce - CSP nonce for inline styles and scripts
 * @param canGoBack - Whether back navigation is available
 * @returns Complete HTML document
 */
export function buildDocumentHtml(
  cspSource: string,
  content: string,
  locale: string,
  currentPath: string,
  nonce: string,
  canGoBack: boolean
): string {
  const csp = buildCspString(cspSource, nonce);

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
<html lang="${escapeHtmlEntities(locale)}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git ID Switcher Documentation</title>
  <style nonce="${nonce}">
    ${getBaseStyles()}
    /* External link indicator.
       The "/ <alt-text>" syntax (CSS Generated Content L3) provides the
       screen-reader announcement for the decorative arrow glyph. We
       announce "(opens externally)" rather than silencing it so AT
       users receive the same "external link" signal as sighted users.
       Note: VS Code webview is Electron/Chromium so this syntax is
       supported; it is not portable to Firefox. */
    a[href^="http"]:not([href*="assets.nullvariant.com"])::after {
      content: " ↗" / " (opens externally)";
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
      border-radius: var(--gis-radius-sm);
      font-family: var(--vscode-editor-font-family);
    }
    pre {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 1em;
      border-radius: var(--gis-radius-md);
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
      border-radius: var(--gis-radius-sm);
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
    /* Template-specific body overrides (layout for document template) */
    body {
      padding: 20px;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <nav class="nav-bar" aria-label="Document navigation">
    <button id="back-btn" ${canGoBack ? '' : 'disabled'}>← Back</button>
    <span class="current-path">${escapeHtmlEntities(currentPath)}</span>
  </nav>
  ${content}
  <footer class="footer">
    <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/tree/main/extensions/git-id-switcher#readme">View on GitHub</a>
    <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher">VS Code Marketplace</a>
  </footer>
  <script nonce="${nonce}">${linkInterceptScript}</script>
</body>
</html>`;
}

/**
 * Generate loading state HTML
 *
 * @param cspSource - Webview CSP source
 * @param nonce - CSP nonce for inline styles
 * @returns Loading HTML document
 */
export function buildLoadingHtml(cspSource: string, nonce: string): string {
  const csp = buildCspString(cspSource, nonce);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style nonce="${nonce}">
    ${getBaseStyles()}
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
      margin-top: 1em;
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner" aria-hidden="true"></div>
    <p role="status">Loading documentation...</p>
  </div>
</body>
</html>`;
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
  const csp = buildCspString(cspSource, nonce);

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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style nonce="${nonce}">
    ${getBaseStyles()}
    /* Template-specific body overrides (layout for error template) */
    body {
      padding: 40px;
      text-align: center;
    }
    h1 {
      color: var(--vscode-errorForeground);
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
