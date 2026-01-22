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
  'AGENTS.md': '54f16b767e57686b3eb46a2b4aa02b378554cc492c32c49ed96588f6d184b6b8',
  'CODE_OF_CONDUCT.md': 'a5eb286c902437bbe0f6d409894f20e51c172fa869fe2f151bfa388f9d911b54',
  'CONTRIBUTING.md': '4150f8810aec7b2e8eff9f3c69ee1bae1374843f50a812efa6778cba27a833cd',
  'extensions/git-id-switcher/CHANGELOG.md': '1d2910df3d7ff8947ca614e80af194ce778d0d55e537f046489010f2479dbbf5',
  'extensions/git-id-switcher/docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md': 'f9718b61ac161cb466dbc76845688e7acacf4e5fdc4b8b9553269dba4a094f6b',
  'extensions/git-id-switcher/docs/i18n/ain/README.md': '8ffe8c8e8419c11978515a5e866dc07307a349e3d87b9be5fb60473774d6b2e7',
  'extensions/git-id-switcher/docs/i18n/bg/README.md': 'a10dfebfb7df810eb79c6d2c6a3179b04f42165582fd8731d4c2b6e4237b0389',
  'extensions/git-id-switcher/docs/i18n/cs/README.md': '3624f4ea20dbfadb4b63a47996943b8f4e084aebbd63e95d9fbaf4a09738ee61',
  'extensions/git-id-switcher/docs/i18n/de/README.md': '651d4329852cf4270bc4052dfa04d47d39dc30a6804f18fa0969b2abf802302e',
  'extensions/git-id-switcher/docs/i18n/en/README.md': '2a8bd766681ff6183cc4b78d30858ac21046bcb82422fee9b6ad77c05c1b8627',
  'extensions/git-id-switcher/docs/i18n/eo/README.md': '19a67aa820a79bc8324c714b270ece290229e94186c54b7203f6d67b226d7e4f',
  'extensions/git-id-switcher/docs/i18n/es/README.md': 'f2a7730f1c9cc744c4d0536dcaed5a29ad5b7151379e390acac6beab77a2f1ae',
  'extensions/git-id-switcher/docs/i18n/fr/README.md': 'df3e7723a295fe5972b5153d463f741d14b248c0178f6055251a544e5cc965da',
  'extensions/git-id-switcher/docs/i18n/haw/README.md': 'cc604de2dc7d2274645243662ec17e52c11c7a42f568cb3f26d0adeb24700bfc',
  'extensions/git-id-switcher/docs/i18n/hu/README.md': '1060cf2418b7d8a09ddecf18aebab182441d734626d41dad7be90f7d206c4aaf',
  'extensions/git-id-switcher/docs/i18n/it/README.md': 'c9b5593bb1058ce8d5d72c485b937f4c95070fba7d2d5fc37f9ac37fbf458995',
  'extensions/git-id-switcher/docs/i18n/ja/README.md': '1b54b31e7d6214c2c92096f25ab500ea811e476a434b594a3f7180755590e987',
  'extensions/git-id-switcher/docs/i18n/ko/README.md': '5e9b08c8a6a103ad99b9026ca38195e10d8bd17c40e1f72f80d205fa5d6845d1',
  'extensions/git-id-switcher/docs/i18n/pl/README.md': 'bf7eefb06ee175ad35691bd989b5a6a1992f239aa519092c157362bebdb41034',
  'extensions/git-id-switcher/docs/i18n/pt-BR/README.md': '19419f9da3a61fd629b584b88828ca0066a8a14cdf12acc1d53dbf7d7800ede2',
  'extensions/git-id-switcher/docs/i18n/ru/README.md': 'fb0aeaba9314f8ee2b2e8e3adba3673a768f1f5e5c6868ab508690245268717f',
  'extensions/git-id-switcher/docs/i18n/ryu/README.md': 'a8740a47bf9d66be5d5d03029aa8bdf52e32229f327dc2c311e71ccf0d5a01fd',
  'extensions/git-id-switcher/docs/i18n/tlh/README.md': 'fdcb9aa525413ad95fe98fbf24078747298ab5edd54cffa884fe1546fb3b29ae',
  'extensions/git-id-switcher/docs/i18n/tok/README.md': 'd2dc0e4a586ffeb275d8881859c8d3233379286767ce677c3ae5c18b2aa590db',
  'extensions/git-id-switcher/docs/i18n/tr/README.md': '96734afa1039f7e8d5cce952163cbae90fda653a6b6ac755cd69291a191074e6',
  'extensions/git-id-switcher/docs/i18n/uk/README.md': '0cef486ada86571de88930720ee801bfbb45a217edc4d79d1e0881b7ac04e8b0',
  'extensions/git-id-switcher/docs/i18n/x-lolcat/README.md': '5c62a43800a6c2b7f4e3ee73ea86f0b87399aeca2fa3dc869534c91f71995203',
  'extensions/git-id-switcher/docs/i18n/x-pirate/README.md': 'eb2ac8970ffd5771d5c27410ed558beaae2977884bb0c592f085f8aff64e9795',
  'extensions/git-id-switcher/docs/i18n/x-shakespeare/README.md': '954161532e23da352395497fd23407829db352eb9ec58b82f0f48d7ea9b308b7',
  'extensions/git-id-switcher/docs/i18n/zh-CN/README.md': '8ca3e6e3340fedfb1a0257eac64f889bca87734d39976af9e52888243742e136',
  'extensions/git-id-switcher/docs/i18n/zh-TW/README.md': '530ea1689e592930dea4dd2a5edc94e7d844bf7c705ec8f21022c01f6476d640',
  'extensions/git-id-switcher/docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  'extensions/git-id-switcher/LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'extensions/git-id-switcher/README.md': '47573fad13a1c7b9c15e31947f40343dcbd28bc2e5fb60db55a8883130e7fdc3',
  'LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'README.md': '65c7c62bae6132227288b5a230c21b9be5591f5e55da9143f0f7405e9e6bb190',
  'SECURITY.md': '72dbadafd9a5caaa4e16f6b1f19a5255f7f84310432bf3c8207c163f5f8088da',
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
  // Content is trusted (self-managed CDN with hash verification)
  let html = raw;

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
