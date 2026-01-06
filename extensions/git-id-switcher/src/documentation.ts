/**
 * Documentation Webview Module
 *
 * Displays localized documentation in a Webview panel.
 * Fetches Markdown from external server and renders safely with XSS protection.
 *
 * Security: enableScripts: true with nonce-based CSP, HTML sanitization
 *
 * @author Null;Variant
 * @license MIT
 */

import * as vscode from 'vscode';
import * as crypto from 'crypto';

// ============================================================================
// Constants
// ============================================================================

/** Asset server base URL (monorepo-based structure) */
const ASSET_BASE_URL = 'https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher';

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 10000;

/** Maximum content size in bytes (1MB) - DoS prevention */
const MAX_CONTENT_SIZE = 1024 * 1024;

/** Supported locales for documentation */
const SUPPORTED_LOCALES = [
  'en', 'ja', 'zh-CN', 'zh-TW', 'ko', 'de', 'fr', 'es', 'it', 'pt-BR', 'ru',
  'pl', 'tr', 'uk', 'cs', 'hu', 'bg',
  'ain', 'ryu', 'haw', 'eo', 'tlh', 'tok',
  'x-pirate', 'x-shakespeare', 'x-lolcat',
];

/** VSCode locale to documentation locale mapping */
const LOCALE_MAP: Record<string, string> = {
  'zh-hans': 'zh-CN',
  'zh-hant': 'zh-TW',
  'pt': 'pt-BR',
};

/**
 * Generate a cryptographically secure nonce for CSP
 * @returns Base64-encoded random string
 */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

// ============================================================================
// Security Utilities (Step 1 - Most Critical)
// ============================================================================

/**
 * Sanitize HTML to remove dangerous elements while preserving safe HTML
 *
 * SECURITY: CSP with nonce restricts script execution to our inline script only.
 * We still remove dangerous patterns as defense-in-depth.
 *
 * Removes:
 * - <script> tags (completely)
 * - Event handler attributes (onclick, onerror, etc.)
 * - Dangerous URL schemes (javascript:, data:, vbscript:)
 *
 * @param html - Raw HTML/Markdown that may contain dangerous elements
 * @returns Sanitized HTML
 */
function sanitizeHtml(html: string): string {
  let result = html;

  // Remove script tags completely (including content)
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handler attributes (onclick, onerror, onload, etc.)
  // Match: onclick="..." or onclick='...' or onclick=value
  result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  // Sanitize href and src attributes for dangerous schemes
  result = result.replace(/(href|src)\s*=\s*["']\s*(javascript:|data:|vbscript:)[^"']*["']/gi, '$1="#"');

  return result;
}

/**
 * Escape HTML entities for text content (used only for code blocks)
 *
 * @param text - Raw text
 * @returns Escaped text
 */
function escapeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** GitHub base URL for documentation links (fallback for non-R2 content) */
const GITHUB_BASE_URL = 'https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher';

/**
 * Resolve a relative path against a base path
 *
 * @param basePath - Base path (e.g., 'docs/i18n/ja/README.md')
 * @param relativePath - Relative path (e.g., '../../CONTRIBUTING.md')
 * @returns Resolved path (e.g., 'docs/CONTRIBUTING.md')
 */
function resolveRelativePath(basePath: string, relativePath: string): string {
  // Get directory of base path (remove filename)
  const baseDir = basePath.includes('/')
    ? basePath.substring(0, basePath.lastIndexOf('/'))
    : '';

  // Split base directory into segments
  const baseSegments = baseDir.split('/').filter(s => s);

  // Split relative path into segments
  const relativeSegments = relativePath.split('/');

  // Process each segment
  const resultSegments = [...baseSegments];
  for (const segment of relativeSegments) {
    if (segment === '..') {
      resultSegments.pop();
    } else if (segment !== '.' && segment !== '') {
      resultSegments.push(segment);
    }
  }

  // Join segments
  return resultSegments.join('/');
}

/**
 * Classify a URL and determine how to handle it
 *
 * @param href - The href value from a link
 * @param currentPath - Current document path for relative resolution
 * @returns Classification with resolved path if applicable
 */
function classifyUrl(href: string, currentPath: string): {
  type: 'internal-md' | 'anchor' | 'external';
  resolvedPath?: string;
} {
  // Anchor links
  if (href.startsWith('#')) {
    return { type: 'anchor' };
  }

  // Absolute URLs (external)
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return { type: 'external' };
  }

  // Relative paths
  if (href.startsWith('./') || href.startsWith('../') || !href.includes('://')) {
    const resolved = resolveRelativePath(currentPath, href);

    // Check if it's a markdown file (internal navigation)
    if (resolved.endsWith('.md')) {
      return { type: 'internal-md', resolvedPath: resolved };
    }

    // Non-markdown files - treat as external (open on GitHub)
    return { type: 'external' };
  }

  return { type: 'external' };
}

/**
 * Render Markdown/HTML hybrid content safely
 *
 * SECURITY APPROACH:
 * - CSP with nonce restricts script execution to our link interceptor only
 * - CSP restricts resource loading to allowed origins
 * - We sanitize dangerous patterns as defense-in-depth
 * - HTML tags from README are preserved (they're our own content from R2)
 *
 * The README contains both Markdown and raw HTML (tables, images, etc.)
 * We preserve HTML while converting Markdown-only sections.
 *
 * @param raw - Raw Markdown/HTML content
 * @returns Safe HTML string
 */
function renderMarkdown(raw: string): string {
  // Step 1: Sanitize dangerous HTML elements
  let html = sanitizeHtml(raw);

  // Step 2: Extract code blocks to placeholders (prevent internal transformation)
  // Use %% delimiters to avoid confusion with HTML tags
  const codeBlocks: string[] = [];
  html = html.replace(/```([^\n\r]*)\r?\n([\s\S]*?)```/g, (_match, _lang, code: string) => {
    const index = codeBlocks.length;
    codeBlocks.push(`<pre><code>${escapeHtmlEntities(code.trim())}</code></pre>`);
    return `%%CODEBLOCK_${index}%%`;
  });

  // Step 3: Extract inline code to placeholders
  // Handle double-backtick inline code first (for content containing single backticks)
  // e.g., `` ` `` renders as a backtick
  const inlineCodes: string[] = [];
  html = html.replace(/``(.+?)``/g, (_match, code: string) => {
    const index = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtmlEntities(code.trim())}</code>`);
    return `%%INLINECODE_${index}%%`;
  });

  // Then handle single-backtick inline code
  html = html.replace(/`([^`]+)`/g, (_match, code: string) => {
    const index = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtmlEntities(code)}</code>`);
    return `%%INLINECODE_${index}%%`;
  });

  // Step 4: Markdown tables (BEFORE other transformations that might break pipe characters)
  html = html.replace(
    /^\|(.+)\|\r?\n\|[-:\s|]+\|\r?\n((?:\|.+\|\r?\n?)+)/gm,
    (_match, headerRow: string, bodyRows: string) => {
      // headerRow is content between outer pipes, split by inner pipes
      const headers = headerRow.split('|').map((c: string) => c.trim());
      const headerHtml = headers.map((h: string) => `<th>${h}</th>`).join('');
      const rows = bodyRows.trim().split(/\r?\n/);
      const bodyHtml = rows.map((row: string) => {
        // Remove leading/trailing | then split, keeping empty cells
        const cells = row.replace(/^\||\|$/g, '').split('|').map((c: string) => c.trim());
        return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join('')}</tr>`;
      }).join('');
      return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
    }
  );

  // Step 5: Horizontal rules (--- or ***)
  html = html.replace(/^---+\s*$/gm, '<hr>');
  html = html.replace(/^\*\*\*+\s*$/gm, '<hr>');

  // Step 6: Headings h1-h6 (process from most specific to least)
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Step 7: Bold and Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<![*])\*([^*]+)\*(?![*])/g, '<em>$1</em>');

  // Step 8: Images ![alt](src) - must be before links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Step 9: Markdown links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Step 10: Blockquotes - merge consecutive lines into single blockquote
  html = html.replace(/(^>\s*.+$(\r?\n^>\s*.+$)*)/gm, (match) => {
    const lines = match.split(/\r?\n/).map((line: string) => line.replace(/^>\s*/, ''));
    return `<blockquote>${lines.join(' ')}</blockquote>`;
  });

  // Step 11: Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Step 12: Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Step 13: Restore inline code
  html = html.replace(/%%INLINECODE_(\d+)%%/g, (_match, index: string) => {
    return inlineCodes[parseInt(index, 10)];
  });

  // Step 14: Restore code blocks
  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_match, index: string) => {
    return codeBlocks[parseInt(index, 10)];
  });

  // Step 15: Convert double newlines to paragraph breaks
  html = html.replace(/\n\n+/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs and paragraphs around block elements
  const blockElements = 'h[1-6]|pre|table|blockquote|hr|ul|ol|li|img';
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(new RegExp(`<p>\\s*(<(?:${blockElements})[^>]*>)`, 'g'), '$1');
  html = html.replace(new RegExp(`(<\\/(?:${blockElements})>)\\s*<\\/p>`, 'g'), '$1');
  html = html.replace(new RegExp(`<p>\\s*(<\\/(?:${blockElements})>)`, 'g'), '$1');
  html = html.replace(new RegExp(`(<(?:${blockElements})[^>]*>)\\s*<\\/p>`, 'g'), '$1');

  return html;
}

// ============================================================================
// Locale Detection (Step 3)
// ============================================================================

/**
 * Get the documentation locale based on VSCode's language setting
 *
 * @returns Locale code for documentation (e.g., 'ja', 'en')
 */
function getDocumentLocale(): string {
  const vscodeLocale = vscode.env.language; // e.g., "ja", "zh-hans", "en-US"

  // 1. Check mapping table (zh-hans → zh-CN, etc.)
  if (LOCALE_MAP[vscodeLocale]) {
    return LOCALE_MAP[vscodeLocale];
  }

  // 2. Check if exact match exists
  if (SUPPORTED_LOCALES.includes(vscodeLocale)) {
    return vscodeLocale;
  }

  // 3. Try base locale (en-US → en)
  const baseLocale = vscodeLocale.split('-')[0];
  if (SUPPORTED_LOCALES.includes(baseLocale)) {
    return baseLocale;
  }

  // 4. Fallback to English
  return 'en';
}

/**
 * Extract document display name from path
 *
 * @param path - Document path (e.g., 'docs/i18n/ja/README.md', 'CONTRIBUTING.md')
 * @returns Display name (e.g., 'README', 'CONTRIBUTING')
 */
function getDocumentDisplayName(path: string): string {
  // Extract filename from path
  const filename = path.includes('/') ? path.substring(path.lastIndexOf('/') + 1) : path;
  // Remove .md extension
  return filename.replace(/\.md$/i, '');
}

// ============================================================================
// HTML Templates (Step 2)
// ============================================================================

/**
 * Build Content Security Policy header value
 *
 * @param webview - Webview instance for cspSource
 * @param nonce - Optional nonce for script-src (required when enableScripts: true)
 * @returns CSP header string
 */
function buildCsp(webview: vscode.Webview, nonce?: string): string {
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
function getDocumentHtml(
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
function getLoadingHtml(webview: vscode.Webview): string {
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
function getErrorHtml(
  webview: vscode.Webview,
  errorType: 'network' | 'notfound' | 'server'
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

// ============================================================================
// Document Fetching (Step 4)
// ============================================================================

/**
 * Fetch a document by path from R2
 *
 * @param path - Document path relative to extension root (e.g., 'README.md', 'docs/i18n/ja/README.md')
 * @returns Markdown content or null on failure
 */
async function fetchDocumentByPath(path: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = `${ASSET_BASE_URL}/${path}`;
    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (response.ok) {
      // DoS prevention: Check Content-Length header before reading body
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_CONTENT_SIZE) {
        console.warn('[Git ID Switcher] Documentation too large, rejecting');
        return null;
      }

      const content = await response.text();

      // Double-check actual content size (header may be missing or wrong)
      if (content.length > MAX_CONTENT_SIZE) {
        console.warn('[Git ID Switcher] Documentation content too large, rejecting');
        return null;
      }

      if (content.trim().length > 0) {
        return content;
      }
    }

    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Fetch documentation with locale-based fallback
 *
 * @param locale - Target locale
 * @returns Markdown content with actual locale and path, or null on failure
 */
async function fetchDocumentation(locale: string): Promise<{ content: string; locale: string; path: string } | null> {
  // All languages are in docs/i18n/{locale}/
  const path = `docs/i18n/${locale}/README.md`;

  const content = await fetchDocumentByPath(path);

  if (content) {
    return { content, locale, path };
  }

  // 404: Try English fallback
  if (locale !== 'en') {
    const fallbackContent = await fetchDocumentByPath('docs/i18n/en/README.md');
    if (fallbackContent) {
      return { content: fallbackContent, locale: 'en', path: 'docs/i18n/en/README.md' };
    }
  }

  return null;
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Navigation state for the documentation viewer
 */
interface NavigationState {
  currentPath: string;
  currentLocale: string;
  history: string[];  // Stack of previous paths for back navigation
}

/**
 * Update Webview with document content
 */
async function updateWebviewContent(
  panel: vscode.WebviewPanel,
  state: NavigationState,
  nonce: string
): Promise<boolean> {
  const content = await fetchDocumentByPath(state.currentPath);

  if (content) {
    const renderedContent = renderMarkdown(content);
    panel.webview.html = getDocumentHtml(
      panel.webview,
      renderedContent,
      state.currentLocale,
      state.currentPath,
      nonce,
      state.history.length > 0
    );
    return true;
  }

  return false;
}

/**
 * Handle navigation to a new document
 */
async function handleNavigation(
  panel: vscode.WebviewPanel,
  state: NavigationState,
  href: string,
  nonce: string
): Promise<void> {
  const classification = classifyUrl(href, state.currentPath);

  switch (classification.type) {
    case 'internal-md':
      if (classification.resolvedPath) {
        // Show loading
        panel.webview.html = getLoadingHtml(panel.webview);

        // Try to fetch the document
        const content = await fetchDocumentByPath(classification.resolvedPath);

        if (content) {
          // Push current path to history before navigating
          state.history.push(state.currentPath);
          state.currentPath = classification.resolvedPath;

          // Update panel title to show current document name
          panel.title = getDocumentDisplayName(state.currentPath);

          const renderedContent = renderMarkdown(content);
          panel.webview.html = getDocumentHtml(
            panel.webview,
            renderedContent,
            state.currentLocale,
            state.currentPath,
            nonce,
            state.history.length > 0
          );
        } else {
          // Document not found - offer to open on GitHub
          const githubUrl = `${GITHUB_BASE_URL}/${classification.resolvedPath}`;
          const choice = await vscode.window.showWarningMessage(
            `Document not found on R2. Open on GitHub?`,
            'Open on GitHub',
            'Cancel'
          );
          if (choice === 'Open on GitHub') {
            vscode.env.openExternal(vscode.Uri.parse(githubUrl));
          }
          // Restore current view
          await updateWebviewContent(panel, state, nonce);
        }
      }
      break;

    case 'external': {
      // Open external URLs in browser
      let externalUrl = href;

      // If it's a relative non-markdown path, convert to GitHub URL
      if (!href.startsWith('http://') && !href.startsWith('https://')) {
        const resolved = resolveRelativePath(state.currentPath, href);
        externalUrl = `${GITHUB_BASE_URL}/${resolved}`;
      }

      vscode.env.openExternal(vscode.Uri.parse(externalUrl));
      break;
    }

    case 'anchor':
      // Anchor links are handled in the Webview JS
      break;
  }
}

/**
 * Handle back navigation
 */
async function handleBack(
  panel: vscode.WebviewPanel,
  state: NavigationState,
  nonce: string
): Promise<void> {
  if (state.history.length > 0) {
    const previousPath = state.history.pop()!;
    state.currentPath = previousPath;

    // Update panel title to show current document name
    panel.title = getDocumentDisplayName(state.currentPath);

    panel.webview.html = getLoadingHtml(panel.webview);
    const success = await updateWebviewContent(panel, state, nonce);

    if (!success) {
      // Document no longer available - show error
      panel.webview.html = getErrorHtml(panel.webview, 'network');
    }
  }
}

/**
 * Show documentation in a Webview panel
 *
 * Called from the command palette via 'git-id-switcher.showDocumentation'
 *
 * @param context - Extension context (reserved for future use)
 */
export async function showDocumentation(
  context: vscode.ExtensionContext
): Promise<void> {
  // Reserved for future use (e.g., caching, state management)
  void context;

  const locale = getDocumentLocale();
  const initialPath = `docs/i18n/${locale}/README.md`;

  // Generate nonce for CSP
  const nonce = generateNonce();

  // Create Webview panel with initial document name as title
  // SECURITY: enableScripts: true for link interception, CSP restricts to nonce-only
  const panel = vscode.window.createWebviewPanel(
    'gitIdSwitcherDocs',
    getDocumentDisplayName(initialPath),
    vscode.ViewColumn.One,
    {
      enableScripts: true,  // Required for link click interception
      retainContextWhenHidden: false,  // Release resources when hidden
    }
  );

  // Navigation state
  const state: NavigationState = {
    currentPath: initialPath,
    currentLocale: locale,
    history: [],
  };

  // Show loading state
  panel.webview.html = getLoadingHtml(panel.webview);

  // Handle messages from Webview
  panel.webview.onDidReceiveMessage(
    async (message: { command: string; href?: string }) => {
      // Security: Whitelist allowed commands
      if (message.command === 'navigate' && message.href) {
        await handleNavigation(panel, state, message.href, nonce);
      } else if (message.command === 'back') {
        await handleBack(panel, state, nonce);
      }
    },
    undefined,
    context.subscriptions
  );

  // Fetch and render initial documentation
  try {
    const result = await fetchDocumentation(locale);

    if (result) {
      state.currentPath = result.path;
      state.currentLocale = result.locale;

      // Update panel title to show current document name
      panel.title = getDocumentDisplayName(state.currentPath);

      const renderedContent = renderMarkdown(result.content);
      panel.webview.html = getDocumentHtml(
        panel.webview,
        renderedContent,
        result.locale,
        result.path,
        nonce,
        false
      );
    } else {
      panel.webview.html = getErrorHtml(panel.webview, 'network');
    }
  } catch (error) {
    console.error('[Git ID Switcher] Documentation fetch error:', error);
    panel.webview.html = getErrorHtml(panel.webview, 'server');
  }
}
