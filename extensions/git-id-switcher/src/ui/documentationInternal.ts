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
  'AGENTS.md': 'cb8170851742743e584cf21ff3427c78dc1c9471fd56d25a19abc174ed4fdd61',
  'CODE_OF_CONDUCT.md': 'a5eb286c902437bbe0f6d409894f20e51c172fa869fe2f151bfa388f9d911b54',
  'CONTRIBUTING.md': '4150f8810aec7b2e8eff9f3c69ee1bae1374843f50a812efa6778cba27a833cd',
  'extensions/git-id-switcher/CHANGELOG.md': 'c67ad4a778f2be5f7f3984a2c94d07014a9f4660322fd03fa621448c3eadc29d',
  'extensions/git-id-switcher/docs/ARCHITECTURE.md': 'a12dd717f83b28b648972a826701a29fcfd575e351c487f8c421402f80ac3d25',
  'extensions/git-id-switcher/docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md': 'f9718b61ac161cb466dbc76845688e7acacf4e5fdc4b8b9553269dba4a094f6b',
  'extensions/git-id-switcher/docs/i18n/ain/README.md': '6f196c1560aea19a77d0323e87db0f0cda053c8585bf2f010f5a0e3bfd541f69',
  'extensions/git-id-switcher/docs/i18n/bg/README.md': '94ce01af0e226cbdc1aeaa7658f677b15555a5d48f6e731503dffad7f92a86d7',
  'extensions/git-id-switcher/docs/i18n/cs/README.md': '2d465b19f0bdc7d2cad188e268a757cf6854b5b5478a8962e3f1d2bf2f36b59d',
  'extensions/git-id-switcher/docs/i18n/de/README.md': 'b5bd2cc3d8db1f13b7bc65497b1b8e287a3581e3030c28ac1964f6809c2e372b',
  'extensions/git-id-switcher/docs/i18n/en/README.md': '922b2c0c5e7696fd82cf6fa5325dcd637b9d0679e93d008195ff36985737cca8',
  'extensions/git-id-switcher/docs/i18n/eo/README.md': '95b14e0450e2d021b7b8cc5b3d7533dbab4b54f9769d3e593fd0a2b61f922df1',
  'extensions/git-id-switcher/docs/i18n/es/README.md': 'bed053d42e47f38d8aa1b75eecb83f88e31247f85856430f575216127c49719b',
  'extensions/git-id-switcher/docs/i18n/fr/README.md': '9b8fdbd0176063b42263ed145fdd10ba0792891c6eeceb06c25edbedcf73fe49',
  'extensions/git-id-switcher/docs/i18n/haw/README.md': 'e92ac1fdbab13697a909eca30120da6f9729f3352a4bb34b8fa2852d413d121c',
  'extensions/git-id-switcher/docs/i18n/hu/README.md': '1a5ccbd44e3e713c717033724350e9df288fe444d06f8ca282b56f20eeef9f8b',
  'extensions/git-id-switcher/docs/i18n/it/README.md': 'f8f7158a1102491d6c0103ca857d93a0b88603d6482a27fe0f58e0e8ac955f23',
  'extensions/git-id-switcher/docs/i18n/ja/README.md': '38e91ef38aaa9de783ade84521b86babdac0805faf0f6dcb3fa47c6fcb586ed7',
  'extensions/git-id-switcher/docs/i18n/ko/README.md': '0b2dc8661c84362c349f18e5db4355df0ae544d4c118a2b72bda1f7a6bbc98f3',
  'extensions/git-id-switcher/docs/i18n/pl/README.md': 'baf0dc5a921d2801bfdb1e391ad60bb68681345dd45f52511105a3bd52eef6a1',
  'extensions/git-id-switcher/docs/i18n/pt-BR/README.md': '9b29abccf5b4a8561df186eb103d19a70ce833ab40aab302cdb7ef27ae60b064',
  'extensions/git-id-switcher/docs/i18n/ru/README.md': '4dd086c1749a6a7ef52fd7c8810954b99557afa948200bcdf687822bb0cf378b',
  'extensions/git-id-switcher/docs/i18n/ryu/README.md': '528171960c9f1e9ef8026e3176eb0e69f9561fcb6f2e2c5bb9cc26d9793fcdd8',
  'extensions/git-id-switcher/docs/i18n/tlh/README.md': 'be46e33664fbd50822c7b655992f2aba8788f12812f0d0f5a6d7ad6eaf105776',
  'extensions/git-id-switcher/docs/i18n/tok/README.md': 'ad13aacb1d5d179d460a5985d3771d1625eccdceef438bf8d7c93f4b4a2b8f30',
  'extensions/git-id-switcher/docs/i18n/tr/README.md': '30cd1c8e1341b1d2c3ac16a51af4648ad3b0b7841e65601fc53c163241a287ba',
  'extensions/git-id-switcher/docs/i18n/uk/README.md': '25ec7c4d21729f5e346a179bc9fd2cfcd962f7399fa152092b5dfa600c9d2ac1',
  'extensions/git-id-switcher/docs/i18n/x-lolcat/README.md': '29c74495de89fdd4adc66221baf068fbd9fd66e298f33e15ad28159761511810',
  'extensions/git-id-switcher/docs/i18n/x-pirate/README.md': '6d57eed3d854af7679a997dffe06104ca1d80aa2d137d0b68f960a7bf893744c',
  'extensions/git-id-switcher/docs/i18n/x-shakespeare/README.md': '0bc476ff86aa214f686ad75c869ccbea85855c28b766c10b72bb677fc5c0fc59',
  'extensions/git-id-switcher/docs/i18n/zh-CN/README.md': '63989f6f10ef4563b3369ff540789eec22d725812e95ed54a6237c2be82abdec',
  'extensions/git-id-switcher/docs/i18n/zh-TW/README.md': '2608cb3f44f5a79364c9a120f705154658c4e7c320373cf13318b0fffd05675b',
  'extensions/git-id-switcher/docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  'extensions/git-id-switcher/LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'extensions/git-id-switcher/README.md': 'fae09340353a6be78d6396d9591a211060c1574a1439966c0f40339dc83ff8f5',
  'LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'README.md': 'e6c0c4e5924873eabd0e49973e29457abc5e8171ba4ff9da77700e6a19c28f9d',
  'SECURITY.md': '87496fc22c667ebc9911a27ef520d1e2918229f7c44bb0f717151995dfd4893b',
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
    .replaceAll('>', '&gt;');
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
