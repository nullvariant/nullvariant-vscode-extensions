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
  'AGENTS.md': 'c0291560e5a6701d62da86301dd264b422a99bc21c11ba005f333bb8d5978cdc',
  'CODE_OF_CONDUCT.md': 'a0e9cb2e004663cdedef4e1adc0e429417ccfc479e367cbc17b869f62ae759d2',
  'CONTRIBUTING.md': 'a11879b44f0357effe35c11c510a04d2794d0d944080e10e7e1d2800af8b7594',
  'extensions/git-id-switcher/CHANGELOG.md': '9fbb96e11b2c21762c28c7255b7192810093aa372d02cf3cbacc70d81c88a744',
  'extensions/git-id-switcher/docs/ARCHITECTURE.md': '104e85c444d68b511718e9c77a8441f406ba378787a0fe0f3bc8a98176069e19',
  'extensions/git-id-switcher/docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md': 'a80efebdc4249bf96d416932368a9206622ce0ab56a706a0db1d4ccc33c9d410',
  'extensions/git-id-switcher/docs/i18n/ain/README.md': '1d01dca6762324252eb3e3827fe125625c834d3207b2b5d0e45888944463d60c',
  'extensions/git-id-switcher/docs/i18n/bg/README.md': '4365b6f0f13932a63df76954e0cd74229d180426e611ce704430498375e9d90d',
  'extensions/git-id-switcher/docs/i18n/cs/README.md': '372a702da28ae4b1643d2bc1d49cbaef61eac85fde0349574c2e9c80919877ed',
  'extensions/git-id-switcher/docs/i18n/de/README.md': 'a2960ab0554dcffb64c3edfc4f5a1c26491532489c3363208153b62f99146bc1',
  'extensions/git-id-switcher/docs/i18n/en/README.md': '92ab1cdbfb91c7c478f99e8bd78d85eb233b423a6f015eccae521aff5f558220',
  'extensions/git-id-switcher/docs/i18n/eo/README.md': '422c3222ae7ed76c88b158e071d6c94d8792476a39400f6db89e14ab003b0505',
  'extensions/git-id-switcher/docs/i18n/es/README.md': 'aaf40d32033308ee6e25e1f7b6e526ef7dcd7b3dcb661ebff0b7aea0577791ed',
  'extensions/git-id-switcher/docs/i18n/fr/README.md': '9c422c05b68cc62351990200f48d80b25a0bbb694a37da7097fad09323f94b13',
  'extensions/git-id-switcher/docs/i18n/haw/README.md': '4dcf5fa339e1b1d4f8b5bf7e9dd82688cafddf2029187d3f34c615fed2479d2b',
  'extensions/git-id-switcher/docs/i18n/hu/README.md': 'e7d05ffafa608467a092eb952cd3254548f09f2bf617bf937a7a90d4a5b48c47',
  'extensions/git-id-switcher/docs/i18n/it/README.md': '92c6c045ba4cf395a234355cdf2c18260f6774094f458bba02cf67c03c79b271',
  'extensions/git-id-switcher/docs/i18n/ja/README.md': '7d1a8192e17a12f3b818c3af9a8352df9f02f9d95c3fec9bbe1b879690e5313c',
  'extensions/git-id-switcher/docs/i18n/ko/README.md': 'e763b77e24274d0dada47aecf753c0c1cd5b3cc319d4db73abcbdf562c18c3a0',
  'extensions/git-id-switcher/docs/i18n/pl/README.md': 'e4f3c9d8ce5c4089d1f1c28a29635255d45d3361afdeb3ab97cc73ae15327e52',
  'extensions/git-id-switcher/docs/i18n/pt-BR/README.md': 'aadaf42e8ab9591becbeba8e127eaa5532fd42275d0aea155d732c5348220052',
  'extensions/git-id-switcher/docs/i18n/ru/README.md': '97998149b6f52dbb6bc60cf2d13b3f676aa7dbfe984b31f4f79e0c361e98a1ec',
  'extensions/git-id-switcher/docs/i18n/ryu/README.md': 'dc20f33b11050d4dd95c922ad3210f8ca2518cbb2e4e707f7481ae635ac6719c',
  'extensions/git-id-switcher/docs/i18n/tlh/README.md': '725a7694ab6ac63236fec2d0412a6f1b09a57d7910ee19b8c5ee9dca745a81a1',
  'extensions/git-id-switcher/docs/i18n/tok/README.md': '861a6f16c0067d7cd49c0b4b47ca9f9359b92ae353a61aebd0eacd5058b4b763',
  'extensions/git-id-switcher/docs/i18n/tr/README.md': '91a951ebfa4c0268a33ab7f203c68fcd1bf033da838a23fe7ab8ba623e45dbf8',
  'extensions/git-id-switcher/docs/i18n/uk/README.md': '0c360c64c2cd46c516cba04324a89c9a3885fe7fb1fc1eacb71202a5558147df',
  'extensions/git-id-switcher/docs/i18n/x-lolcat/README.md': '11629ac580b2dd5f7834bf91d40bbdddf55f6580fd31b9f47687f5d1253b784e',
  'extensions/git-id-switcher/docs/i18n/x-pirate/README.md': '3cd3a74ab1529f4cd6a3a59fa9ce3878397929bc2a146a352b190f97f360735e',
  'extensions/git-id-switcher/docs/i18n/x-shakespeare/README.md': 'e2f74674b0c2ac1d7f6eeed9d08000dcc20edcb1f834feb8c3e8475ff72d6a64',
  'extensions/git-id-switcher/docs/i18n/zh-CN/README.md': '167693ef3856c61d0dd608ad1e748e42e0003c7f3cbd21fa02e3bb8657ead992',
  'extensions/git-id-switcher/docs/i18n/zh-TW/README.md': 'f743d9ab96ddfa55f932518b47dc6d0e06e2e77f4306eb2e505158ab1d3f524f',
  'extensions/git-id-switcher/docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  'extensions/git-id-switcher/docs/THREAT_MODEL.md': '8a12db941888ad95e73e29ffead5258507b2a599ce0a8737bed77521db26089a',
  'extensions/git-id-switcher/LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'extensions/git-id-switcher/README.md': '1c344a5030bb54bb712f246389c2fd1613d621d9053818bba2a8d367bcd070d2',
  'GOVERNANCE.md': '806cf32ec9fe9fd964a782927f8eaa7696d408c42d31f554eebd6755bd911c71',
  'LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'README.md': 'ce9fa024481bac5200906a032e49e91c7805f0ac1a97709e9da58a49dbbdbef3',
  'SECURITY.md': 'c97bdb5d7b9cd4fe247f463a50910419af147bda7d826dea945b9ba262a4f077',
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
  if (SUPPORTED_LOCALES.includes(baseLocale)) {
    return baseLocale;
  }

  // 4. Fallback to English
  return 'en';
}
