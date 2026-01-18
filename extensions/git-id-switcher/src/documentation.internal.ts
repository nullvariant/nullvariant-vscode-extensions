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
  // Root and shared documentation
  'README.md': 'cd4e471b3e96bbafd059be67a8604dfc1e7abd043dfeab127dd7d7bc52849ed5',
  'CHANGELOG.md': 'd028e3d603f95effc531c1e41162ea9fe48f79ccf3d948736be358fd582fe4dd',
  'LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'docs/DESIGN_PHILOSOPHY.md': 'f9718b61ac161cb466dbc76845688e7acacf4e5fdc4b8b9553269dba4a094f6b',
  'docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  // Major languages
  'docs/i18n/en/README.md': 'e89536f73b40093e4c1a0fd4fcdf8c998e0af3aa740dd849c5234221843880b4',
  'docs/i18n/ja/README.md': '554ef7da0677dbad0723948c223784e09f15a46236d7310b422d633df9d252a6',
  'docs/i18n/zh-CN/README.md': '4d15188903c5e4d44f47f7ad986aa51e324b9691d09a5fa1f39adff7d1a7277f',
  'docs/i18n/zh-TW/README.md': 'b412bcdbff254fb0ddf05bc785474f11303c2a7c6a7238b75344b0f48a903206',
  'docs/i18n/ko/README.md': 'e17f46a1af8ed8dcf787ede04b60928a5e99a0820c5624657305766e3a023787',
  'docs/i18n/de/README.md': '905f4d0681bb9d760f4f0b96c3297006aafb872ab64a006d17192041f83ef3a8',
  'docs/i18n/fr/README.md': 'e015fe6533c9f306b4bf54b1ef698a35fc47f2a58087444ced276bc050c46e85',
  'docs/i18n/es/README.md': '189c497ea18fc9ab2abd2286e0f8d78099e2ec590e55a6178ffb16d0834417b9',
  'docs/i18n/it/README.md': '00df278c9f784b759df06c6c69babfb2c046908f4ed9438753aec507e6c72aae',
  'docs/i18n/pt-BR/README.md': 'a37c03a3a8b01fd8e5e870df868d000d4b16193ab1f5b6460dc6366f49166329',
  'docs/i18n/ru/README.md': '33bfe1df04dce44b0a89c8e1800abda43b5986a8d37d871247c7d763c4d371e8',
  // European languages
  'docs/i18n/pl/README.md': '97d08d8cd428d5d1082b76c0dde039070b978620dd3bf8e7329e5c08ca05fa92',
  'docs/i18n/tr/README.md': '4a7b6c1d2bda57318d34fdf7d1bd5b9d725024ece12189ae7f739493d9245f79',
  'docs/i18n/uk/README.md': '9e97e18375dfdc0b42886dde9170f1fae32a63123c94092c2a5786aad16cf2e8',
  'docs/i18n/cs/README.md': '9dab8d3b35483f695c49c58f319534f643c9c4112f700bfe582ff7ca61a6371a',
  'docs/i18n/hu/README.md': 'ebd646d42bedc1b7fbd33c4b389d4cc516c8b18941fcfba8e229b05e6c3e29e5',
  'docs/i18n/bg/README.md': 'fb92c646ffc2712e4a0c57b2260a2cafb4eb0df398fac7f9253871eea4c33c0c',
  // Endangered/minority languages
  'docs/i18n/ain/README.md': '16104bc0ec4b3218f2956c7d2b5e93a186dad56fe0a0b3257a1023eb69c2ced3',
  'docs/i18n/ryu/README.md': '70574661485bc126c2422adecd054df1601650567b788706a641c1dd84071e99',
  'docs/i18n/haw/README.md': '4cf065164637933dd93ceca35b577b89fcab0fd1719b5de797a8f815e1432be4',
  // Constructed languages
  'docs/i18n/eo/README.md': 'f7c1892558dbce8672a99e534828a16bd3322e350b280a1386b1a15fc0b0947e',
  'docs/i18n/tlh/README.md': '9f34e65e1e98e31700ce3d074278084353b1816d5554b7a4466a395062726686',
  'docs/i18n/tok/README.md': '3d2fd4446ba8c2d48a7410e4b6e7f1d98a163d834412ba744916520c33a8f63b',
  // Novelty locales
  'docs/i18n/x-pirate/README.md': 'edc4ccf03dc61dc88504698dea1ea57c144e3e3e712cd748d4b1ceecea6e59ee',
  'docs/i18n/x-shakespeare/README.md': '16380f8d7e472a73ed8720b4368f00bc7130ae2811451d3a086bd7d1e347d223',
  'docs/i18n/x-lolcat/README.md': 'e486f9f1a2ba2738015d504a7220d6fa7084e75c18d763361d15bc5a443d18e0',
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
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify content hash against expected value
 *
 * SECURITY: Uses SHA-256 for cryptographic integrity verification.
 * Returns false for unknown paths (allowlist approach) or hash mismatches.
 *
 * @param path - Document path relative to extension root
 * @param content - Document content to verify
 * @returns Object with verification result and computed hash (for debugging)
 */
export async function verifyContentHash(path: string, content: string): Promise<{
  valid: boolean;
  expectedHash: string | undefined;
  actualHash: string;
}> {
  const expectedHash = DOCUMENT_HASHES[path];
  const actualHash = await computeSha256Hash(content);

  if (!expectedHash) {
    // Unknown path - reject (allowlist approach)
    return { valid: false, expectedHash: undefined, actualHash };
  }

  const valid = actualHash === expectedHash;
  return { valid, expectedHash, actualHash };
}

/**
 * Sanitize HTML to remove dangerous elements while preserving safe HTML
 *
 * SECURITY: CSP with nonce restricts script execution to our inline script only.
 * We still remove dangerous patterns as defense-in-depth.
 *
 * Removes:
 * - <script> tags (completely, including malformed variants)
 * - Event handler attributes (onclick, onerror, etc.)
 * - Dangerous URL schemes (javascript:, data:, vbscript:)
 * - Unquoted href/src attributes (href=javascript:... bypass prevention)
 * - srcset attributes (image source injection prevention)
 * - data-* attributes (custom data attribute injection prevention)
 *
 * Uses loop-based sanitization to handle nested/recursive attack patterns.
 *
 * @param html - Raw HTML/Markdown that may contain dangerous elements
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  let result = html;
  let previous: string;

  // Loop until no more changes (handles nested/recursive patterns)
  do {
    previous = result;

    // Remove script tags completely (including content)
    // Use [ \t\n\r]* (explicit whitespace chars) instead of \s* to avoid ReDoS
    result = result.replaceAll(/<script\b[^]*?<\/[ \t\n\r]*script[ \t\n\r]*>/gi, '');
    // Remove orphan opening script tags
    result = result.replaceAll(/<script\b[^>]*>/gi, '');
    // Remove orphan closing script tags (use explicit whitespace for ReDoS safety)
    result = result.replaceAll(/<\/[ \t\n\r]*script[ \t\n\r]*>/gi, '');

    // Remove event handler attributes (onclick, onerror, onload, etc.)
    // Explicit loop to ensure complete removal of nested/overlapping patterns
    while (/ on\w+=/i.test(result)) {
      result = result.replaceAll(/ on\w+="[^"]*"/gi, '');
      result = result.replaceAll(/ on\w+='[^']*'/gi, '');
      result = result.replaceAll(/ on\w+=[^\s>"']+/gi, '');
    }

  } while (result !== previous);

  // Sanitize href and src attributes for dangerous schemes (quoted)
  // Use ` *` (literal space) for optional leading whitespace inside quotes - safe because followed by literal
  result = result.replaceAll(/(href|src)=" *(javascript:|data:|vbscript:)[^"]*"/gi, '$1="#"');
  result = result.replaceAll(/(href|src)=' *(javascript:|data:|vbscript:)[^']*'/gi, '$1="#"');

  // Remove unquoted href/src attributes (bypass prevention for href=javascript:alert(1))
  result = result.replaceAll(/(href|src)=(?!["'])[^\s>]*/gi, '$1="#"');

  // Remove srcset attributes completely (image source injection prevention)
  result = result.replaceAll(/ srcset="[^"]*"/gi, '');
  result = result.replaceAll(/ srcset='[^']*'/gi, '');
  result = result.replaceAll(/ srcset=[^\s>"']+/gi, '');

  // Remove data-* attributes (custom data attribute injection prevention)
  result = result.replaceAll(/ data-[a-z0-9-]+="[^"]*"/gi, '');
  result = result.replaceAll(/ data-[a-z0-9-]+='[^']*'/gi, '');
  result = result.replaceAll(/ data-[a-z0-9-]+=[^\s>"']+/gi, '');

  return result;
}

/**
 * Escape HTML entities for text content (used only for code blocks)
 *
 * @param text - Raw text
 * @returns Escaped text
 */
export function escapeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
export function classifyUrl(href: string, currentPath: string): {
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
 * Extract document display name from path
 *
 * @param path - Document path (e.g., 'docs/i18n/ja/README.md', 'CONTRIBUTING.md')
 * @returns Display name (e.g., 'README', 'CONTRIBUTING')
 */
export function getDocumentDisplayName(path: string): string {
  // Extract filename from path
  const filename = path.includes('/') ? path.substring(path.lastIndexOf('/') + 1) : path;
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
 * @returns Safe HTML string
 */
export function renderMarkdown(raw: string): string {
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
        // Regex uses non-capturing groups for explicit precedence: (^|) OR (|$)
        const cells = row.replace(/(?:^\|)|(?:\|$)/g, '').split('|').map((c: string) => c.trim());
        const cellsHtml = cells.map((c: string) => '<td>' + c + '</td>').join('');
        return '<tr>' + cellsHtml + '</tr>';
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
    return inlineCodes[Number.parseInt(index, 10)];
  });

  // Step 14: Restore code blocks
  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_match, index: string) => {
    return codeBlocks[Number.parseInt(index, 10)];
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
