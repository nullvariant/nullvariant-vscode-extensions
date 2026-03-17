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
  'extensions/git-id-switcher/CHANGELOG.md': 'b74e9b9d80cee8c470e2606d53b9ca83e6b2cbde255e2d673c0a847323688093',
  'extensions/git-id-switcher/docs/ARCHITECTURE.md': 'db6ba2f7809b2c7aa831eda3a4b9bb80521577e4e267c7b6ccad17ffba847548',
  'extensions/git-id-switcher/docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md': 'f9718b61ac161cb466dbc76845688e7acacf4e5fdc4b8b9553269dba4a094f6b',
  'extensions/git-id-switcher/docs/i18n/ain/README.md': '76a662384d69a36e09f515df88c629279083c120bf4335327cb12c35eb69c2a9',
  'extensions/git-id-switcher/docs/i18n/bg/README.md': '72abcc82739cc62b5377ad32a032501b1bebebb60b31cb05a3a8d7ac3af32573',
  'extensions/git-id-switcher/docs/i18n/cs/README.md': 'a787ac5bf72a815aa23674c637e6c711f19bc98d88b215d3218c8bd7b418f48e',
  'extensions/git-id-switcher/docs/i18n/de/README.md': 'c95c6d16a2557af63a0aef831d739ccae2bd715cd980804bc703a2840f8f786b',
  'extensions/git-id-switcher/docs/i18n/en/README.md': 'a28ec4898e52b59c7e89f36ffe9a74db7ac6928411d4e33fc71f4192f57890e6',
  'extensions/git-id-switcher/docs/i18n/eo/README.md': 'cc6a20cef9719e0080969b7b19842f8aaf641ccecf80653951131e5707b84335',
  'extensions/git-id-switcher/docs/i18n/es/README.md': '44d180a02ba7a39091b65c06148e00a4aa1987c99a27a07fad800bc9ef9d237d',
  'extensions/git-id-switcher/docs/i18n/fr/README.md': '585d28031c17177750a8a5168d4fcfd3e8bad57403b7eb281bf53406ddd50ebd',
  'extensions/git-id-switcher/docs/i18n/haw/README.md': 'ffa8765a9eb436cafde8f19e26b8ec8c1f87866ecaeae2216da0847cac8d455e',
  'extensions/git-id-switcher/docs/i18n/hu/README.md': 'ce1b7a734b18e33f428a3d56c731b044691ed1e463002c70a51a86c4a044c99b',
  'extensions/git-id-switcher/docs/i18n/it/README.md': 'b37387f11923630d198f1261209f0c868bf3a34bab4969d9b37c912d02ce4c50',
  'extensions/git-id-switcher/docs/i18n/ja/README.md': '4815d3f2fe4c23ab9b2d81423896b8574cf955991b9ce1ba11e7c1788ed22d37',
  'extensions/git-id-switcher/docs/i18n/ko/README.md': '322fc31afaf539d182297e43f0af94804b6eeef90b663dba7cbc10b92e6920ca',
  'extensions/git-id-switcher/docs/i18n/pl/README.md': '0b41f3e1cd5d7cb7ba36be4ae16a1cf1a7fcb7fabee3c97e804e10a79c4175ed',
  'extensions/git-id-switcher/docs/i18n/pt-BR/README.md': '5061c56a5067366110d147cd9cc75b3409bb1fcb27f1b379b77cdcca8a6b154b',
  'extensions/git-id-switcher/docs/i18n/ru/README.md': 'd13729fea5325e2acdf8016c86a900ccae2b6c53ab582cd54237c8ba1508d438',
  'extensions/git-id-switcher/docs/i18n/ryu/README.md': '26532f501d0915304d58e8881c708048459d7c10450bc686059901823269eedc',
  'extensions/git-id-switcher/docs/i18n/tlh/README.md': '55a17fa9f9a63ff3639a3b9d558de31fe8df79fd0885fe6e0538dac5bedf6a66',
  'extensions/git-id-switcher/docs/i18n/tok/README.md': 'd53ea625f17ed62dfeedb193d409cdf0a9e37f75e19bb968c466f100b65c3c06',
  'extensions/git-id-switcher/docs/i18n/tr/README.md': '50e48fb69ead89f3f2a2ec59e70e3baf516af2b4801044c375006ae8337287b6',
  'extensions/git-id-switcher/docs/i18n/uk/README.md': '884def8079f352db0638e0e504576750c3aa1685f8cb3bc8b90bbfd64c5fb1c4',
  'extensions/git-id-switcher/docs/i18n/x-lolcat/README.md': '580bbc1c69cfe2e17a724d958d5a9e34f8fe6a638602f6dfcb4fdc19b21718ec',
  'extensions/git-id-switcher/docs/i18n/x-pirate/README.md': '40a3e0401ca928711692a2722be628115a4d17c041931d5ef469fde8e185ada2',
  'extensions/git-id-switcher/docs/i18n/x-shakespeare/README.md': 'a31481bca7c7aec314343a7644e05b38c7e30b476a8d19c1dd7bf4b800b511ee',
  'extensions/git-id-switcher/docs/i18n/zh-CN/README.md': '9bbc9da169a35f685314916ecdb099c99c6e805b802773c064030c7803d1ce31',
  'extensions/git-id-switcher/docs/i18n/zh-TW/README.md': 'fef511e957c27c33acb3c55190b3e5f25ea40279874992d0d6caa9ba179527a8',
  'extensions/git-id-switcher/docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  'extensions/git-id-switcher/docs/THREAT_MODEL.md': '1947cc3c940b872641a8f291bc7ad52eac02df1e91f8b91f67588149bc6fa6f7',
  'extensions/git-id-switcher/LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'extensions/git-id-switcher/README.md': '1564cb9ee9e7557c8e166e7705f781c5b2b09df63dc879bfdcbfd82e355d3b01',
  'LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'README.md': '0ef369d8edab407d769f764342e898cebb2d17feb558169093d56dfd1989228a',
  'SECURITY.md': 'b5df8a04b199315ccc25ff1421641411357de7ed3c2ec58d18b29edc45614550',
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
