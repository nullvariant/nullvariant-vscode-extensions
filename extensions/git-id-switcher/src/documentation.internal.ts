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
  'extensions/git-id-switcher/CHANGELOG.md': '8870c55611802bd1eb4f723feeb2411b78145782906e087db7dc244fd34231c9',
  'extensions/git-id-switcher/docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md': 'f9718b61ac161cb466dbc76845688e7acacf4e5fdc4b8b9553269dba4a094f6b',
  'extensions/git-id-switcher/docs/i18n/ain/README.md': 'ba7a08107fd1a71c579679b7303c313a3744907d7b793ff6a11ff98599af7826',
  'extensions/git-id-switcher/docs/i18n/bg/README.md': '6eb310b085666b16a06160bd7b4391a470b73ea702f9380c17d1d1f10f8e7812',
  'extensions/git-id-switcher/docs/i18n/cs/README.md': 'd7fe98902892ce4b7dadaf0b0cbd2be94147905200f5914f7d1e8df56b437bc3',
  'extensions/git-id-switcher/docs/i18n/de/README.md': '07bf600d636f9489dc579f6728ebb7371ff1081102a42765b94c6910c973b33b',
  'extensions/git-id-switcher/docs/i18n/en/README.md': 'eb7e767441b4a2704e1105a12807a15ccb8b3ed57632eeb98213a021b5d4d32e',
  'extensions/git-id-switcher/docs/i18n/eo/README.md': 'ee99d1035be717f6eb289754076368b44d8ec7c6d5d6efedf148f3a71a86cad2',
  'extensions/git-id-switcher/docs/i18n/es/README.md': 'cef654ec88adff470598ae6a143faf309ec7861cebfcf43f58cf94d946b1b4da',
  'extensions/git-id-switcher/docs/i18n/fr/README.md': 'd24b192e8d96dc652f18ed1862fde447485d3fb16736b8404bb62e204d31ca30',
  'extensions/git-id-switcher/docs/i18n/haw/README.md': '6c4291f85de187a4a6ff35a32722914eb9380264cb6ad37ccc75109a733fd77c',
  'extensions/git-id-switcher/docs/i18n/hu/README.md': '29e03d403fcf77a563eea5e98ae0bb7ac4801b025508c593cb6fc43379070420',
  'extensions/git-id-switcher/docs/i18n/it/README.md': '93330932fba5e44560dcb1e469fd8f0475fd61bc5b8680e51127bd1ce4d2ac65',
  'extensions/git-id-switcher/docs/i18n/ja/README.md': 'e785777a2388997aac8b1edeacf9da445f25d17c2479618291244cfb43441d36',
  'extensions/git-id-switcher/docs/i18n/ko/README.md': 'a78848120cd4b50d03180bcc9f36e6bd60d90e9f9759e7785c6f746f33b366ec',
  'extensions/git-id-switcher/docs/i18n/pl/README.md': '94e13bbb67eb1aa1d67f85bbb5b8c299bdd0b40c0f6b155dfb6055198eb1b0ee',
  'extensions/git-id-switcher/docs/i18n/pt-BR/README.md': '5666a9b2052e3d3d0be6b936cf6cc0e41711f1033d27f162659f0e8236b0ccee',
  'extensions/git-id-switcher/docs/i18n/ru/README.md': '2ce8ca860101a3d77f199c3eeedaa01e4e0d56fba5cba1bac7c09df7eef09239',
  'extensions/git-id-switcher/docs/i18n/ryu/README.md': 'f031a4460f2aadde49cb0074578093d1af184e8338d19e04c42d4db1d67c3fc7',
  'extensions/git-id-switcher/docs/i18n/tlh/README.md': '0e55c3ce0639033637e51bfcfe071d133c2438f651d33e15f07248c0609ca637',
  'extensions/git-id-switcher/docs/i18n/tok/README.md': '24453c932a6e63436f17d483e6d0bcd1b46778becfc2894c408c0d0a42c020ab',
  'extensions/git-id-switcher/docs/i18n/tr/README.md': 'de910b3cfbe1a095b629087ab206a58280818c02c0a154d943f7df7145c06d21',
  'extensions/git-id-switcher/docs/i18n/uk/README.md': '014c26380fca854f726c2db3e3cf87938018843054b0c89ff21798bce99d3fe0',
  'extensions/git-id-switcher/docs/i18n/x-lolcat/README.md': '0be2d595beea3382db6bb05523bdb444881c79814ee27f29432cb24a6bc981e9',
  'extensions/git-id-switcher/docs/i18n/x-pirate/README.md': '230d24bacd12a55f971e818d8a6258e27bff4b7c83e4983c4734ff12a01bc056',
  'extensions/git-id-switcher/docs/i18n/x-shakespeare/README.md': '7e84c5d4659a8283c7d9965cf62da5868cc95824ec69f7ec5fff6ce57c752e5d',
  'extensions/git-id-switcher/docs/i18n/zh-CN/README.md': '012beb73a93373a1ae4a9653ceae8bdb67c84d090f41b11068a4c6beacc3aefe',
  'extensions/git-id-switcher/docs/i18n/zh-TW/README.md': '1d01027b23b49aebfabb6f2e3c145db45375c2b2afba6162d5cac755d0fec37f',
  'extensions/git-id-switcher/docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  'extensions/git-id-switcher/LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'extensions/git-id-switcher/README.md': '92b067fe1655a74d16f8b95645a6a3b9681917bd909a981071318e51294a246d',
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
