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

// Import internal functions (testable without VS Code)
import {
  renderMarkdown,
  resolveRelativePath,
  classifyUrl,
  getDocumentDisplayName,
  getDocumentLocaleFromString,
  verifyContentHash,
  logHashFailure,
  isContentSizeValid,
} from './documentation.internal';

// Import Webview HTML generation (separated for maintainability)
import {
  generateNonce,
  getDocumentHtml,
  getLoadingHtml,
  getErrorHtml,
} from './ui/webview';

// Re-export for backward compatibility
export { generateNonce, getDocumentHtml, getLoadingHtml, getErrorHtml } from './ui/webview';
export type { ErrorType } from './ui/webview';

// ============================================================================
// Constants
// ============================================================================

/** Asset server base URL (monorepo-based structure) */
const ASSET_BASE_URL = 'https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher';

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 10000;

/** Maximum content size in bytes (1MB) - DoS prevention */
const MAX_CONTENT_SIZE = 1024 * 1024;

/** GitHub base URL for documentation links (fallback for non-R2 content) */
const GITHUB_BASE_URL = 'https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main/extensions/git-id-switcher';

// ============================================================================
// Locale Detection
// ============================================================================

/**
 * Get the documentation locale based on VSCode's language setting
 *
 * @returns Locale code for documentation (e.g., 'ja', 'en')
 */
function getDocumentLocale(): string {
  const vscodeLocale = vscode.env.language; // e.g., "ja", "zh-hans", "en-US"
  return getDocumentLocaleFromString(vscodeLocale);
}

// ============================================================================
// Document Fetching
// ============================================================================

/**
 * Check if running in CI/test environment
 * @returns true if in CI environment (GitHub Actions, etc.)
 */
function isTestEnvironment(): boolean {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

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

    // Add header for CI/test environment access (for analytics filtering)
    const headers: Record<string, string> = {};
    if (isTestEnvironment()) {
      headers['X-Test-Environment'] = 'true';
    }

    const response = await fetch(url, { signal: controller.signal, headers });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const contentLength = response.headers.get('content-length');
    const content = await response.text();

    if (!isContentSizeValid(contentLength, content.length, MAX_CONTENT_SIZE)) {
      return null;
    }

    if (content.trim().length === 0) {
      return null;
    }

    // Verify content hash for integrity (allowlist approach)
    const hashResult = await verifyContentHash(path, content);
    if (!hashResult.valid) {
      logHashFailure(path, hashResult);
      return null;
    }

    return content;
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
          const openOnGitHubButton = vscode.l10n.t('Open on GitHub');
          const choice = await vscode.window.showWarningMessage(
            vscode.l10n.t('Internal document not found. Open on GitHub?'),
            openOnGitHubButton,
            vscode.l10n.t('Cancel')
          );
          if (choice === openOnGitHubButton) {
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
