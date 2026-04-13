/**
 * Documentation Module Internal Functions
 *
 * @internal
 * These functions are exported for unit testing purposes only.
 * They are not part of the public API.
 *
 * This file contains pure functions that do not depend on VS Code APIs,
 * allowing them to be tested in isolation without VS Code environment.
 */

// Type-only import: erased at runtime. htmlTemplates/document.ts has a
// runtime import of `escapeHtmlEntities` from this file, so importing from
// the barrel (`./htmlTemplates`) would create a circular dependency.
// Keep `import type` for the type, and import `isHrefAllowed` directly
// from `linkIntercept.ts` (which has no dependency on this file).
import type { SanitizedHtml } from './htmlTemplates';
import { isHrefAllowed } from './htmlTemplates/linkIntercept';

// ============================================================================
// Constants
// ============================================================================

/**
 * Document hash map for integrity verification (SHA-256)
 * These hashes are generated from the actual CDN content.
 * Update these values when documentation content changes.
 *
 * SECURITY: Allowlist approach - only registered paths with matching hashes are allowed.
 * Unknown paths or hash mismatches result in content rejection.
 */
export const DOCUMENT_HASHES: Record<string, string> = {
  'AGENTS.md': 'c4918e12fd7900bfc41e708992ebc4b7326600ce9327e8020a986fe4dd807f8d',
  'CODE_OF_CONDUCT.md': 'a0e9cb2e004663cdedef4e1adc0e429417ccfc479e367cbc17b869f62ae759d2',
  'CONTRIBUTING.md': 'ed4d1f391ffe04e3031dfc9f16fd8fd5dcd54ba23af3b3202c07adac5ba23da7',
  'extensions/git-id-switcher/CHANGELOG.md': '37d755f6499fcf9880cd1eda3b01f552434828c5279f3e22fc8237284a45bac1',
  'extensions/git-id-switcher/docs/ARCHITECTURE.md': 'd5d879d988054d208739497962a0f937f2f21bdaab51776c4e8363cba99d634c',
  'extensions/git-id-switcher/docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md': 'f9718b61ac161cb466dbc76845688e7acacf4e5fdc4b8b9553269dba4a094f6b',
  'extensions/git-id-switcher/docs/i18n/ain/README.md': '56d58d7e635e0d0e0f0f94b8db6c6b6bf1122b5dd6d521261851256467ac2b4c',
  'extensions/git-id-switcher/docs/i18n/bg/README.md': 'e7fd9618d51bde6c5a7df860f36ea2fd1b47a29a4510ba90c72f082ebf29e86e',
  'extensions/git-id-switcher/docs/i18n/cs/README.md': '49ca86bf3d112706b760242a88cd9f4918234f4e10ea1607a6fe0a2d787a9801',
  'extensions/git-id-switcher/docs/i18n/de/README.md': '11a538e66423bb7a259ecba1034580ffc202efc34b63d3c5c99c4bf993e69a98',
  'extensions/git-id-switcher/docs/i18n/en/README.md': '34c736bd559388bee9b3bb5a1a063ebb1d644271ef0730639bdb430162cb978f',
  'extensions/git-id-switcher/docs/i18n/eo/README.md': '4b1d45ed67b18445c3474fa53fc965f47036f1d61e9e4392adebf25f68d7d23b',
  'extensions/git-id-switcher/docs/i18n/es/README.md': '2a14b19cc594ed8a7cec04557027115bd45f03bc612aa2f71c8cda3b37adb22a',
  'extensions/git-id-switcher/docs/i18n/fr/README.md': '5e280d8ce5994441e7f63cb44d2260f24f9d085bae5f8de361a70283bdcddcd4',
  'extensions/git-id-switcher/docs/i18n/haw/README.md': 'd3d2eec5b0da3f308c9b4bc40e654882a094ecf292bc70d1833c01b23c782454',
  'extensions/git-id-switcher/docs/i18n/hu/README.md': '661cec359103794672ad7a1d96835b4968a60c3207674884ca89d1f44b4b00bc',
  'extensions/git-id-switcher/docs/i18n/it/README.md': 'b1849ac517855f2a425b715a2a779fca1cd24761d7e4e4436922bf6fe64826bb',
  'extensions/git-id-switcher/docs/i18n/ja/README.md': '892362b6772d57da07fa39d460a65a9f5b62bf9279b06116b8d08a1653ca4a82',
  'extensions/git-id-switcher/docs/i18n/ko/README.md': '658ec64074dc3ccd5fa282138db0fcc292df84a0deda3b6e176dbea7f789e6a5',
  'extensions/git-id-switcher/docs/i18n/pl/README.md': 'fc792ebc11a1ddd8e6abe557147eb67cc03a6e7f4082a8acf8ca7dc76dde6d9a',
  'extensions/git-id-switcher/docs/i18n/pt-BR/README.md': '74a3407f7b39b6a5fd46dc874978859116aeea75b27495e0e141ebecfb7055af',
  'extensions/git-id-switcher/docs/i18n/ru/README.md': '7bc7b5cb67bac91db48af5584c5fb60ebdffcad1e5d2672af23a07147635f3f7',
  'extensions/git-id-switcher/docs/i18n/ryu/README.md': 'df6cf3160fe7889ff47d87499b7bbaa37a75ecf9be4eb321e6bcdcc973c265e8',
  'extensions/git-id-switcher/docs/i18n/tlh/README.md': '6aed175cd39673ea119f6d4b3db265232f17cf9a06acce3bafc0e09d3fae7aa9',
  'extensions/git-id-switcher/docs/i18n/tok/README.md': '6def0a0d8eb919c7ba4eaed0d0dc986575220004d46129cc319cf4281ea8f427',
  'extensions/git-id-switcher/docs/i18n/tr/README.md': 'a61e2f327b085ce3fc16e424293287f44f0044971a6c64bb0a24656823673e44',
  'extensions/git-id-switcher/docs/i18n/uk/README.md': '75af537adf56c0d11358d3ffbba5a81420937eab0b0dd099068689ad234ae4e5',
  'extensions/git-id-switcher/docs/i18n/x-lolcat/README.md': 'befd8154ef2d600f1138966d5f27910fb6e7882ec3a01a3c75fce6b3a2b6bd26',
  'extensions/git-id-switcher/docs/i18n/x-pirate/README.md': '25afb022836e864207ab03db5093d51c4d48a270f982fe59751bbaf9552db0b5',
  'extensions/git-id-switcher/docs/i18n/x-shakespeare/README.md': '2a2574b11a7c61b50987985c9fb2b129506cad42f2a01f594bd4f2b9c1a4c410',
  'extensions/git-id-switcher/docs/i18n/zh-CN/README.md': '43f37b334f4c1661a640c78ec9800c8897f13669ee21a6b24214331d5ca249ff',
  'extensions/git-id-switcher/docs/i18n/zh-TW/README.md': '64ecbe61f6bc70f7374ff9855aaa895203706347785f87f7b7dafb73ebc72d5e',
  'extensions/git-id-switcher/docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  'extensions/git-id-switcher/docs/THREAT_MODEL.md': '1947cc3c940b872641a8f291bc7ad52eac02df1e91f8b91f67588149bc6fa6f7',
  'extensions/git-id-switcher/LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'extensions/git-id-switcher/README.md': '77ec3c6635973f7fd372bde860af5530f897cd858ea83e79c3e7efe5b380acc0',
  'GOVERNANCE.md': '806cf32ec9fe9fd964a782927f8eaa7696d408c42d31f554eebd6755bd911c71',
  'LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'README.md': 'a2a0bd14c3293b008da8b5a3dc9c25850943d83b950ce300ffce552d0d6e6e37',
  'SECURITY.md': '6379722a43118cb0ca81625ac8c3b0d0a8878dddd1e190e3a68a498385a35df6',
};

/** Supported locales for documentation */
export const SUPPORTED_LOCALES = [
  'en', 'ja', 'zh-CN', 'zh-TW', 'ko', 'de', 'fr', 'es', 'it', 'pt-BR', 'ru',
  'pl', 'tr', 'uk', 'cs', 'hu', 'bg',
  'ain', 'ryu', 'haw', 'eo', 'tlh', 'tok',
  'x-pirate', 'x-shakespeare', 'x-lolcat',
];

/** VSCode locale to documentation locale mapping */
export const LOCALE_MAP: Record<string, string> = {
  'zh-hans': 'zh-CN',
  'zh-hant': 'zh-TW',
  'pt': 'pt-BR',
};

// ============================================================================
// Security Utilities
// ============================================================================

/**
 * Compute SHA-256 hash of a string
 *
 * @param content - Content to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function computeSha256Hash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  // Use Web Crypto API (available in both Node.js and browser)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Extension CDN path prefix for hash key construction */
const EXTENSION_CDN_PREFIX = 'extensions/git-id-switcher';

/**
 * Convert a document path to its hash key
 *
 * Hash keys follow CDN path structure:
 * - Extension files: extensions/git-id-switcher/{path}
 * - Monorepo root files: {filename} (no prefix)
 *
 * @param path - Document path (e.g., 'docs/i18n/ja/README.md')
 * @param isMonorepoRoot - Whether this is a monorepo root file
 * @returns Hash key for DOCUMENT_HASHES lookup
 */
export function getHashKey(path: string, isMonorepoRoot: boolean = false): string {
  if (isMonorepoRoot) {
    // Monorepo root files use filename only
    return path;
  }
  // Extension files use CDN path prefix
  return `${EXTENSION_CDN_PREFIX}/${path}`;
}

/**
 * Verify content hash against expected value
 *
 * SECURITY: Uses SHA-256 for cryptographic integrity verification.
 * Returns false for unknown paths (allowlist approach) or hash mismatches.
 *
 * @param path - Document path relative to extension root
 * @param content - Document content to verify
 * @param isMonorepoRoot - Whether this is a monorepo root file
 * @returns Object with verification result and computed hash (for debugging)
 */
export async function verifyContentHash(
  path: string,
  content: string,
  isMonorepoRoot: boolean = false
): Promise<{
  valid: boolean;
  expectedHash: string | undefined;
  actualHash: string;
  hashKey: string;
}> {
  const hashKey = getHashKey(path, isMonorepoRoot);
  const expectedHash = DOCUMENT_HASHES[hashKey];
  const actualHash = await computeSha256Hash(content);

  if (!expectedHash) {
    // Unknown path - reject (allowlist approach)
    return { valid: false, expectedHash: undefined, actualHash, hashKey };
  }

  const valid = actualHash === expectedHash;
  return { valid, expectedHash, actualHash, hashKey };
}

/**
 * Log hash verification failure with appropriate message
 *
 * @param path - Document path that failed verification
 * @param hashResult - Result containing expected and actual hashes
 */
export function logHashFailure(
  path: string,
  hashResult: { expectedHash: string | undefined; actualHash: string; hashKey: string }
): void {
  if (hashResult.expectedHash === undefined) {
    console.warn(`[Git ID Switcher] Unknown document path rejected: ${path} (hash key: ${hashResult.hashKey})`);
  } else {
    console.warn(
      `[Git ID Switcher] Hash mismatch for ${path} (hash key: ${hashResult.hashKey}): ` +
        `expected ${hashResult.expectedHash}, got ${hashResult.actualHash}`
    );
  }
}

/**
 * Validate content size against maximum allowed size
 *
 * @param contentLength - Content-Length header value (may be null)
 * @param actualLength - Actual content length in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns true if content size is valid, false if too large
 */
export function isContentSizeValid(
  contentLength: string | null,
  actualLength: number,
  maxSize: number
): boolean {
  if (contentLength && Number.parseInt(contentLength, 10) > maxSize) {
    console.warn('[Git ID Switcher] Documentation too large, rejecting');
    return false;
  }
  if (actualLength > maxSize) {
    console.warn('[Git ID Switcher] Documentation content too large, rejecting');
    return false;
  }
  return true;
}

/**
 * Escape HTML entities for text content (used only for code blocks)
 *
 * @param text - Raw text
 * @returns Escaped text
 */
export function escapeHtmlEntities(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Resolve a relative path against a base path
 *
 * @param basePath - Base path (e.g., 'docs/i18n/ja/README.md')
 * @param relativePath - Relative path (e.g., '../../CONTRIBUTING.md')
 * @returns Resolved path (e.g., 'docs/CONTRIBUTING.md')
 */
export function resolveRelativePath(basePath: string, relativePath: string): string {
  // Get directory of base path (remove filename)
  const baseDir = basePath.includes('/')
    ? basePath.slice(0, Math.max(0, basePath.lastIndexOf('/')))
    : '';

  // Split base directory into segments
  const baseSegments = baseDir.split('/').filter(Boolean);

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
 * Classify a URL and determine how to handle it.
 *
 * SECURITY: Dangerous schemes (`javascript:`, `data:`, `file:`,
 * `vscode-resource:`, etc.) are rejected with type `'rejected'` so the
 * caller never passes them to `vscode.env.openExternal`. This is
 * defense-in-depth alongside the client-side allowlist in
 * `linkIntercept.ts`. // defense-in-depth
 *
 * @param href - The href value from a link
 * @param currentPath - Current document path for relative resolution
 * @returns Classification with resolved path if applicable
 */
export function classifyUrl(href: string, currentPath: string): {
  type: 'internal-md' | 'anchor' | 'external' | 'rejected';
  resolvedPath?: string;
} {
  // Anchor links
  if (href.startsWith('#')) {
    return { type: 'anchor' };
  }

  // Delegate scheme validation to the SSOT allowlist (linkIntercept.ts).
  // isHrefAllowed returns true for anchors (handled above), http(s),
  // and relative paths — false for everything else. // defense-in-depth
  if (!isHrefAllowed(href)) {
    return { type: 'rejected' };
  }

  // Absolute URLs (external) — only http(s) reach here
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return { type: 'external' };
  }

  // Relative paths — safe to resolve
  const resolved = resolveRelativePath(currentPath, href);

  // Check if it's a markdown file (internal navigation)
  if (resolved.endsWith('.md')) {
    return { type: 'internal-md', resolvedPath: resolved };
  }

  // Non-markdown files - treat as external (open on GitHub)
  return { type: 'external' };
}

/**
 * Extract document display name from path
 *
 * @param path - Document path (e.g., 'docs/i18n/ja/README.md', 'CONTRIBUTING.md')
 * @returns Display name (e.g., 'README', 'CONTRIBUTING')
 */
export function getDocumentDisplayName(path: string): string {
  // Extract filename from path
  const filename = path.includes('/') ? path.slice(Math.max(0, path.lastIndexOf('/') + 1)) : path;
  // Remove .md extension
  return filename.replace(/\.md$/i, '');
}

// ============================================================================
// Markdown Rendering
// ============================================================================

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
 * @returns Safe HTML string, branded as `SanitizedHtml` so downstream
 *   consumers (e.g. `buildDocumentHtml`) can enforce the trust boundary at
 *   compile time. The single `as SanitizedHtml` cast at the return site is
 *   the only sanctioned origin of the brand in the codebase.
 */
export function renderMarkdown(raw: string): SanitizedHtml {
  // Content is trusted (self-managed CDN with hash verification)
  let html = raw;

  // Step 2: Extract code blocks to placeholders (prevent internal transformation)
  // Use split-based approach instead of regex to eliminate ReDoS risk
  const codeBlocks: string[] = [];
  const codeBlockParts = html.split('```');
  if (codeBlockParts.length >= 3) {
    const result: string[] = [codeBlockParts[0]];
    for (let i = 1; i < codeBlockParts.length - 1; i += 2) {
      // Odd indices are inside code blocks, even indices are outside
      const codeWithLang = codeBlockParts[i];
      const afterCode = codeBlockParts[i + 1];
      // Remove language identifier (first line)
      const newlineIndex = codeWithLang.search(/\r?\n/);
      const code = newlineIndex >= 0 ? codeWithLang.slice(newlineIndex + 1) : codeWithLang;
      const index = codeBlocks.length;
      codeBlocks.push(`<pre><code>${escapeHtmlEntities(code.trim())}</code></pre>`);
      result.push(`%%CODEBLOCK_${index}%%`, afterCode);
    }
    // Handle unclosed code block (odd number of ```)
    if (codeBlockParts.length % 2 === 0) {
      result.push('```' + codeBlockParts.at(-1));
    }
    html = result.join('');
  }

  // Step 3: Extract inline code to placeholders
  // Handle double-backtick inline code first (for content containing single backticks)
  // e.g., `` ` `` renders as a backtick
  const inlineCodes: string[] = [];
  html = html.replaceAll(/``(.+?)``/g, (_match, code: string) => {
    const index = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtmlEntities(code.trim())}</code>`);
    return `%%INLINECODE_${index}%%`;
  });

  // Then handle single-backtick inline code
  html = html.replaceAll(/`([^`]+)`/g, (_match, code: string) => {
    const index = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtmlEntities(code)}</code>`);
    return `%%INLINECODE_${index}%%`;
  });

  // Step 4: Markdown tables (BEFORE other transformations that might break pipe characters)
  html = html.replaceAll(
    /^\|(.+)\|\r?\n\|[-:\s|]+\|\r?\n((?:\|.+\|\r?\n?)+)/gm,
    (_match, headerRow: string, bodyRows: string) => {
      // headerRow is content between outer pipes, split by inner pipes
      const headers = headerRow.split('|').map((c: string) => c.trim());
      const headerHtml = headers.map((h: string) => `<th>${h}</th>`).join('');
      const rows = bodyRows.trim().split(/\r?\n/);
      const bodyHtml = rows.map((row: string) => {
        // Remove leading/trailing | then split, keeping empty cells
        // Regex uses non-capturing groups for explicit precedence: (^|) OR (|$)
        const cells = row.replaceAll(/(?:^\|)|(?:\|$)/g, '').split('|').map((c: string) => c.trim());
        const cellsHtml = cells.map((c: string) => '<td>' + c + '</td>').join('');
        return '<tr>' + cellsHtml + '</tr>';
      }).join('');
      return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
    }
  );

  // Step 5: Horizontal rules (--- or ***)
  html = html.replaceAll(/^---+\s*$/gm, '<hr>');
  html = html.replaceAll(/^\*\*\*+\s*$/gm, '<hr>');

  // Step 6: Headings h1-h6 (process from most specific to least)
  html = html.replaceAll(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replaceAll(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replaceAll(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replaceAll(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replaceAll(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replaceAll(/^# (.+)$/gm, '<h1>$1</h1>');

  // Step 7: Bold and Italic
  html = html.replaceAll(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replaceAll(/(?<![*])\*([^*]+)\*(?![*])/g, '<em>$1</em>');

  // Step 8: Images ![alt](src) - must be before links
  html = html.replaceAll(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Step 9: Markdown links [text](url)
  // ReDoS-safe: negated char class [^\]] cannot backtrack (each char is ] or not)
  html = html.replaceAll(/\[([^\]]{1,1000})\]\(([^)]{1,2000})\)/g, '<a href="$2">$1</a>');

  // Step 10: Blockquotes - merge consecutive lines into single blockquote
  // ReDoS-safe: [^\r\n]{1,1000} bounded by line length and count
  html = html.replaceAll(/(^>\s*[^\r\n]{1,1000}$(\r?\n^>\s*[^\r\n]{1,1000}$){0,100})/gm, (match) => {
    const lines = match.split(/\r?\n/).map((line: string) => line.replaceAll(/^>\s*/g, ''));
    return `<blockquote>${lines.join(' ')}</blockquote>`;
  });

  // Step 11: Ordered lists
  // ReDoS-safe: [^\r\n]{1,1000} bounded by line length
  html = html.replaceAll(/^\d+\.\s+([^\r\n]{1,1000})$/gm, '<li>$1</li>');

  // Step 12: Unordered lists
  html = html.replaceAll(/^- (.+)$/gm, '<li>$1</li>');

  // Step 13: Restore inline code
  html = html.replaceAll(/%%INLINECODE_(\d+)%%/g, (_match, index: string) => {
    return inlineCodes[Number.parseInt(index, 10)];
  });

  // Step 14: Restore code blocks
  html = html.replaceAll(/%%CODEBLOCK_(\d+)%%/g, (_match, index: string) => {
    return codeBlocks[Number.parseInt(index, 10)];
  });

  // Step 15: Convert double newlines to paragraph breaks
  html = html.replaceAll(/\n\n+/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs and paragraphs around block elements
  const blockElements = String.raw`h[1-6]|pre|table|blockquote|hr|ul|ol|li|img`;
  html = html.replaceAll(/<p>\s*<\/p>/g, '');
  html = html.replaceAll(new RegExp(String.raw`<p>\s*(<(?:${blockElements})[^>]*>)`, 'g'), '$1');
  html = html.replaceAll(new RegExp(String.raw`(</(?:${blockElements})>)\s*</p>`, 'g'), '$1');
  html = html.replaceAll(new RegExp(String.raw`<p>\s*(</(?:${blockElements})>)`, 'g'), '$1');
  html = html.replaceAll(new RegExp(String.raw`(<(?:${blockElements})[^>]*>)\s*</p>`, 'g'), '$1');

  // Single sanctioned origin of the SanitizedHtml brand. All other callers
  // MUST go through this function; do not introduce additional casts.
  return html as SanitizedHtml;
}

// ============================================================================
// Locale Detection (Pure Logic)
// ============================================================================

/**
 * Get the documentation locale based on a given locale string
 *
 * This is the pure logic version that doesn't depend on VS Code.
 * Used for testing and called by getDocumentLocale() in documentation.ts
 *
 * @param vscodeLocale - The locale string (e.g., "ja", "zh-hans", "en-US")
 * @returns Locale code for documentation (e.g., 'ja', 'en')
 */
export function getDocumentLocaleFromString(vscodeLocale: string): string {
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
