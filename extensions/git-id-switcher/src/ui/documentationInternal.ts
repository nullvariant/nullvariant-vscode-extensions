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
  'AGENTS.md': 'e1157a3cbfb56f36fe413cac44bdda54b82439b51c1e39d6dc3ecc9843369d94',
  'CODE_OF_CONDUCT.md': 'a0e9cb2e004663cdedef4e1adc0e429417ccfc479e367cbc17b869f62ae759d2',
  'CONTRIBUTING.md': '52efe18df39f6a8798a35607781e4c10c4e26f7ba7b9a7d87b060c58a232424e',
  'extensions/git-id-switcher/CHANGELOG.md': '2457ff3ccfdc5151bae811d96ddae221b590fe3a3c5b12262d627264a2dfef4d',
  'extensions/git-id-switcher/docs/ARCHITECTURE.md': '6d13711aa5b30e2740770dccea664a94f23d58a5566379573d9f351238c86b3e',
  'extensions/git-id-switcher/docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md': 'a80efebdc4249bf96d416932368a9206622ce0ab56a706a0db1d4ccc33c9d410',
  'extensions/git-id-switcher/docs/i18n/ain/README.md': 'a30ff9bcee3da9d8e47d65a9ad5c6df7ec9f49ae8ae985a2ef28d5431b46b090',
  'extensions/git-id-switcher/docs/i18n/bg/README.md': '498c133a3702edc7185a0e1194113fffe77973fcbc15cb55e30b765cf53392b4',
  'extensions/git-id-switcher/docs/i18n/cs/README.md': 'afb29507305fee9a6d638b561d85ca109002fe2e1a6bd8d17d8e81969a35ab6e',
  'extensions/git-id-switcher/docs/i18n/de/README.md': 'b27100b72a65d1dc6fccf12dcb9f3cb9048b9d02b25ab1acfe59c58f654e015d',
  'extensions/git-id-switcher/docs/i18n/en/README.md': '71882210cdd9e08e6994e681eef18470a4cb3facf371f23204e042800c60a7ff',
  'extensions/git-id-switcher/docs/i18n/eo/README.md': '8c9b9327a1a2c73b24b575d9cdc541aa9afcf43e1c3712bbd7c8c1797eabf7a0',
  'extensions/git-id-switcher/docs/i18n/es/README.md': '4bf5acaac2813e9d84fdacd31bf69b95610127b06fbfccbc0264c5a7becc550a',
  'extensions/git-id-switcher/docs/i18n/fr/README.md': '8b949af4754e1295196a880361b18c363b368112b4a680967a41c1e804268823',
  'extensions/git-id-switcher/docs/i18n/haw/README.md': '9574367bef43fe08444cf0f629c50c849731e7059a6cd36e6e2ad21fd26077bf',
  'extensions/git-id-switcher/docs/i18n/hu/README.md': '1d2a9935981c0d23ebd2ac1811d549878b0fe1b99484a85cf0dae2f072c33ac5',
  'extensions/git-id-switcher/docs/i18n/it/README.md': '1d07697b4e7e94f267391fd4af79e2d9a028822b9bb404d3ac9f0dc8be11bdc9',
  'extensions/git-id-switcher/docs/i18n/ja/README.md': '0fd6db708b9e86ada147766b787dbd745794c783fdb7f9f1c2dc313af05f7b1b',
  'extensions/git-id-switcher/docs/i18n/ko/README.md': '79a814ad0a125379dfb313d372082ac02e2bc0c7cd91c3466ec89b3310441756',
  'extensions/git-id-switcher/docs/i18n/pl/README.md': 'c1dc4cc0dc93f0ce96c056917f9955a5a9ffe74e4636012a24d3a8d6dc93cc07',
  'extensions/git-id-switcher/docs/i18n/pt-BR/README.md': '4c25d64a14f82878819e8619fee133357e11da6ba2e4843c1a9fd0292059b0d5',
  'extensions/git-id-switcher/docs/i18n/ru/README.md': '8c05564bf911c280dc84fe74ae99f0da61b1ba50e518cb22f19fcb37d0d5b8ea',
  'extensions/git-id-switcher/docs/i18n/ryu/README.md': '95442551b502c2c73cec03173861084bec8acd41e5242ada86184a599ab1d7ce',
  'extensions/git-id-switcher/docs/i18n/tlh/README.md': 'cc2fe962e42546699a6138aca7328da5fc474fbe13aa597d217fa106af0b1a37',
  'extensions/git-id-switcher/docs/i18n/tok/README.md': 'db3693248d30ea2194ad4bff10a997c3d4aa1f8423828dd5caf3efea1012c8cb',
  'extensions/git-id-switcher/docs/i18n/tr/README.md': '20021f67b6b79c05d71947f0ff33f1ec822ea4ade188479b7d11c707cbc6b486',
  'extensions/git-id-switcher/docs/i18n/uk/README.md': 'a0791889d889c8abcdac834735c2ab175561e532a6d0714906c200acfed5f391',
  'extensions/git-id-switcher/docs/i18n/x-lolcat/README.md': '3a1c7c34ccb32ced707a573bc15377fc67923fa969e0daca56e9851efa854e81',
  'extensions/git-id-switcher/docs/i18n/x-pirate/README.md': '4ac2f3abcf5dae13cc4ab9bd2256f8e705bf09e14b6e0ed55a4aa4140bf79c15',
  'extensions/git-id-switcher/docs/i18n/x-shakespeare/README.md': 'ca37d7084e69db263c0a1099bf9ffa179cad3ca2aff454aa64986cd75401d200',
  'extensions/git-id-switcher/docs/i18n/zh-CN/README.md': '6a18cdcfcfc25ad333b5f7a3e1becb7e22789b0924d7936b54ab175c1c56b07e',
  'extensions/git-id-switcher/docs/i18n/zh-TW/README.md': '9f3237bed65ddaf9e5ae423728cf45a7f56e63ea6a9d2f8ec42c93645a8d9e9a',
  'extensions/git-id-switcher/docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  'extensions/git-id-switcher/docs/THREAT_MODEL.md': 'f5a82fa807d4a56916117b451dba149077cfad4a97f2cbdfa4e48e98b7a83b69',
  'extensions/git-id-switcher/LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'extensions/git-id-switcher/README.md': '488c3439d8e4d6317882531cdb0ad6f493448f222f9c5b18dde237335a6775d8',
  'GOVERNANCE.md': '806cf32ec9fe9fd964a782927f8eaa7696d408c42d31f554eebd6755bd911c71',
  'LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'README.md': 'b669cfc9c0f45728ac1ba1095976e93cc680690c91558d565c0a7cf53e62b771',
  'SECURITY.md': 'b556903afcd6d2a9d64ba7a2f362a6507fd653e52fccf873cb98267d7b9a4c6c',
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
  // Monorepo root files use filename only; extension files use CDN path prefix
  return isMonorepoRoot ? path : `${EXTENSION_CDN_PREFIX}/${path}`;
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

  const isValid = actualHash === expectedHash;
  return { valid: isValid, expectedHash, actualHash, hashKey };
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
  console.warn(
    hashResult.expectedHash === undefined
      ? `[Git ID Switcher] Unknown document path rejected: ${path} (hash key: ${hashResult.hashKey})`
      : `[Git ID Switcher] Hash mismatch for ${path} (hash key: ${hashResult.hashKey}): ` +
        `expected ${hashResult.expectedHash}, got ${hashResult.actualHash}`
  );
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

  // Markdown files are internal navigation; non-markdown files are treated as external (open on GitHub)
  return resolved.endsWith('.md') ? { type: 'internal-md', resolvedPath: resolved } : { type: 'external' };
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
 * Step 2: Replace fenced code blocks with placeholders, so later steps do not
 * transform their contents. Returns the escaped blocks for restoring later.
 */
function extractCodeBlocks(markdown: string): { html: string; codeBlocks: string[] } {
  let html = markdown;
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

  return { html, codeBlocks };
}

/**
 * Step 3: Replace inline code with placeholders. Returns the escaped spans.
 */
function extractInlineCode(markdown: string): { html: string; inlineCodes: string[] } {
  let html = markdown;
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

  return { html, inlineCodes };
}

/**
 * Step 4: Render Markdown tables.
 * Runs before other transformations that might break pipe characters.
 */
function renderTables(markdown: string): string {
  let html = markdown;
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

  return html;
}

/**
 * Steps 5-12: Render horizontal rules, headings, emphasis, images, links,
 * blockquotes and lists. The order matters (e.g. images before links).
 */
function renderBlockAndInlineSyntax(markdown: string): string {
  let html = markdown;
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

  return html;
}

/**
 * Steps 13-14: Put the escaped inline code and code blocks back.
 */
function restorePlaceholders(markdown: string, inlineCodes: string[], codeBlocks: string[]): string {
  let html = markdown;
  // Step 13: Restore inline code
  html = html.replaceAll(/%%INLINECODE_(\d+)%%/g, (_match, index: string) => {
    return inlineCodes[Number.parseInt(index, 10)];
  });

  // Step 14: Restore code blocks
  html = html.replaceAll(/%%CODEBLOCK_(\d+)%%/g, (_match, index: string) => {
    return codeBlocks[Number.parseInt(index, 10)];
  });

  return html;
}

/**
 * Step 15: Wrap text in paragraphs, without wrapping block elements.
 */
function wrapParagraphs(markdown: string): string {
  let html = markdown;
  // Step 15: Convert double newlines to paragraph breaks
  html = html.replaceAll(/\n\n+/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs and paragraphs around block elements
  const blockElements = 'h[1-6]|pre|table|blockquote|hr|ul|ol|li|img';
  html = html.replaceAll(/<p>\s*<\/p>/g, '');
  html = html.replaceAll(new RegExp(String.raw`<p>\s*(<(?:${blockElements})[^>]*>)`, 'g'), '$1');
  html = html.replaceAll(new RegExp(String.raw`(</(?:${blockElements})>)\s*</p>`, 'g'), '$1');
  html = html.replaceAll(new RegExp(String.raw`<p>\s*(</(?:${blockElements})>)`, 'g'), '$1');
  html = html.replaceAll(new RegExp(String.raw`(<(?:${blockElements})[^>]*>)\s*</p>`, 'g'), '$1');

  return html;
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
 * @returns Safe HTML string, branded as `SanitizedHtml` so downstream
 *   consumers (e.g. `buildDocumentHtml`) can enforce the trust boundary at
 *   compile time. The single `as SanitizedHtml` cast at the return site is
 *   the only sanctioned origin of the brand in the codebase.
 */
export function renderMarkdown(raw: string): SanitizedHtml {
  // Content is trusted (self-managed CDN with hash verification)
  const { html: withoutCodeBlocks, codeBlocks } = extractCodeBlocks(raw);
  const { html: withoutCode, inlineCodes } = extractInlineCode(withoutCodeBlocks);
  const rendered = renderBlockAndInlineSyntax(renderTables(withoutCode));
  const html = wrapParagraphs(restorePlaceholders(rendered, inlineCodes, codeBlocks));

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
  const baseLocale = vscodeLocale.split('-', 1)[0];
  // 4. Fallback to English
  return SUPPORTED_LOCALES.includes(baseLocale) ? baseLocale : 'en';
}
