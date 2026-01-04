/**
 * Documentation Webview Module
 *
 * Displays localized documentation in a Webview panel.
 * Fetches Markdown from external server and renders safely with XSS protection.
 *
 * Security: enableScripts: false, strict CSP, HTML escaping
 *
 * @author Null;Variant
 * @license MIT
 */

import * as vscode from 'vscode';

// ============================================================================
// Constants
// ============================================================================

/** Asset server base URL */
const ASSET_BASE_URL = 'https://assets.nullvariant.com/git-id-switcher';

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

/** Localized panel titles */
const PANEL_TITLES: Record<string, string> = {
  'ja': 'Git ID Switcher ドキュメント',
  'zh-CN': 'Git ID Switcher 文档',
  'zh-TW': 'Git ID Switcher 文件',
  'ko': 'Git ID Switcher 문서',
  'de': 'Git ID Switcher Dokumentation',
  'fr': 'Git ID Switcher Documentation',
  'es': 'Git ID Switcher Documentación',
  'it': 'Git ID Switcher Documentazione',
  'pt-BR': 'Git ID Switcher Documentação',
  'ru': 'Git ID Switcher Документация',
};

// ============================================================================
// Security Utilities (Step 1 - Most Critical)
// ============================================================================

/**
 * Escape HTML entities to prevent XSS attacks
 *
 * SECURITY: This MUST be called before any Markdown rendering
 * to neutralize any embedded HTML/script tags in the source.
 *
 * @param text - Raw text that may contain HTML
 * @returns Escaped text safe for HTML insertion
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize URL to prevent javascript: and data: scheme attacks
 *
 * SECURITY: Only allows http:// and https:// URLs.
 * All other schemes are replaced with '#' to prevent XSS.
 *
 * @param url - URL string to validate
 * @returns Safe URL or '#' if invalid
 */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  // Block javascript:, data:, vbscript:, and other dangerous schemes
  return '#';
}

/**
 * Render Markdown to HTML with security-first approach
 *
 * SECURITY FLOW:
 * 1. Escape ALL HTML entities first (neutralizes <script>, <img onerror>, etc.)
 * 2. Extract code blocks/inline code to placeholders (prevent internal transformation)
 * 3. Apply safe Markdown transformations
 * 4. Restore code blocks/inline code
 * 5. Sanitize all URLs in links
 *
 * Supports: headings, bold, italic, links, inline code, code blocks, lists
 *
 * @param raw - Raw Markdown text
 * @returns Safe HTML string
 */
function renderMarkdown(raw: string): string {
  // Step 1: Escape all HTML (CRITICAL - must be first)
  let html = escapeHtml(raw);

  // Step 2: Extract code blocks to placeholders (prevent internal transformation)
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code: string) => {
    const index = codeBlocks.length;
    codeBlocks.push(`<pre><code>${code.trim()}</code></pre>`);
    return `<<CODEBLOCK_${index}>>`;
  });

  // Step 3: Extract inline code to placeholders
  const inlineCodes: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_match, code: string) => {
    const index = inlineCodes.length;
    inlineCodes.push(`<code>${code}</code>`);
    return `<<INLINECODE_${index}>>`;
  });

  // Step 4: Headings (### before ## before #)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Step 5: Bold and Italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Step 6: Links with URL sanitization
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, (_match, text, url) => {
    const safeUrl = sanitizeUrl(url);
    return `<a href="${safeUrl}">${text}</a>`;
  });

  // Step 7: Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Step 8: Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Step 9: Restore inline code
  html = html.replace(/<<INLINECODE_(\d+)>>/g, (_match, index: string) => {
    return inlineCodes[parseInt(index, 10)];
  });

  // Step 10: Restore code blocks
  html = html.replace(/<<CODEBLOCK_(\d+)>>/g, (_match, index: string) => {
    return codeBlocks[parseInt(index, 10)];
  });

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

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
 * Get localized panel title
 *
 * @param locale - Locale code
 * @returns Localized title or default English title
 */
function getPanelTitle(locale: string): string {
  return PANEL_TITLES[locale] ?? 'Git ID Switcher Documentation';
}

// ============================================================================
// HTML Templates (Step 2)
// ============================================================================

/**
 * Build Content Security Policy header value
 *
 * @param webview - Webview instance for cspSource
 * @returns CSP header string
 */
function buildCsp(webview: vscode.Webview): string {
  return [
    `default-src 'none'`,
    `img-src ${webview.cspSource} https://assets.nullvariant.com`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `connect-src https://assets.nullvariant.com`,
    `font-src ${webview.cspSource}`,
  ].join('; ');
}

/**
 * Generate the document HTML with content
 *
 * @param webview - Webview instance
 * @param content - Rendered HTML content
 * @param locale - Current locale
 * @returns Complete HTML document
 */
function getDocumentHtml(
  webview: vscode.Webview,
  content: string,
  locale: string
): string {
  const csp = buildCsp(webview);

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
  ${content}
  <div class="footer">
    <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/tree/main/extensions/git-id-switcher#readme">View on GitHub</a>
    <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher">VS Code Marketplace</a>
  </div>
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
 * Fetch documentation with timeout and fallback
 *
 * @param locale - Target locale
 * @returns Markdown content or null on failure
 */
async function fetchDocumentation(locale: string): Promise<{ content: string; locale: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = `${ASSET_BASE_URL}/docs/i18n/${locale}/README.md`;
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
        return { content, locale };
      }
      // Empty response, try fallback
    }

    // 404: Try English fallback
    if (response.status === 404 && locale !== 'en') {
      return fetchDocumentation('en');
    }

    return null;
  } catch (error) {
    clearTimeout(timeoutId);

    // Network error or timeout, try English fallback if not already
    if (locale !== 'en') {
      return fetchDocumentation('en');
    }

    return null;
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

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
  const panelTitle = getPanelTitle(locale);

  // Create Webview panel
  // SECURITY: enableScripts: false prevents all JavaScript execution
  const panel = vscode.window.createWebviewPanel(
    'gitIdSwitcherDocs',
    panelTitle,
    vscode.ViewColumn.One,
    {
      enableScripts: false,  // SECURITY: No JS needed, disable completely
      retainContextWhenHidden: false,  // Release resources when hidden
    }
  );

  // Show loading state
  panel.webview.html = getLoadingHtml(panel.webview);

  // Fetch and render documentation
  try {
    const result = await fetchDocumentation(locale);

    if (result) {
      const renderedContent = renderMarkdown(result.content);
      panel.webview.html = getDocumentHtml(panel.webview, renderedContent, result.locale);
    } else {
      panel.webview.html = getErrorHtml(panel.webview, 'network');
    }
  } catch (error) {
    console.error('[Git ID Switcher] Documentation fetch error:', error);
    panel.webview.html = getErrorHtml(panel.webview, 'server');
  }
}
