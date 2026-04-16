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
  'extensions/git-id-switcher/CHANGELOG.md': 'b21b41b76f4a9a6413290e8241f141f8343c8a2c4bf7e74114112adf672d8905',
  'extensions/git-id-switcher/docs/ARCHITECTURE.md': 'd5d879d988054d208739497962a0f937f2f21bdaab51776c4e8363cba99d634c',
  'extensions/git-id-switcher/docs/CONTRIBUTING.md': '7d6ad2bc4d8c838790754cb9df848cb65f9fdce7e1a13e5c965b83a3d5b6378c',
  'extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md': 'f9718b61ac161cb466dbc76845688e7acacf4e5fdc4b8b9553269dba4a094f6b',
  'extensions/git-id-switcher/docs/i18n/ain/README.md': '0c638970cc577a25b980041fd0c5f9b79d39208bb69a6cc00a11cc6d4d83b2d8',
  'extensions/git-id-switcher/docs/i18n/bg/README.md': '63cb98db0328666baf239eda99dd642cd53e68a2d78030a335683ce40c6a527e',
  'extensions/git-id-switcher/docs/i18n/cs/README.md': '07e1054e61d43b41c7841ef46bc1118249e1c6885d5f4f349d242c3addaf8d2e',
  'extensions/git-id-switcher/docs/i18n/de/README.md': '1c63e2de0e1000ffbdb73a7e557e1fd1409f2a9465e413b8f484c1fe798918aa',
  'extensions/git-id-switcher/docs/i18n/en/README.md': '2ac255601a854e3915d5f03b30bec1b8ea9ebf9d44acabfe298e1ef76892d74e',
  'extensions/git-id-switcher/docs/i18n/eo/README.md': '643d73b77910c3eb8d3ed25a762bed14d856701f420a71c0bfedcc61afc17697',
  'extensions/git-id-switcher/docs/i18n/es/README.md': '67b6cc576fee5aa30831e15223de832f5b7961764d47e645ed8bfd6166b9e862',
  'extensions/git-id-switcher/docs/i18n/fr/README.md': '0efd22ac58d0fa2cac8ed7e4e820bdceb48de82465a9aa0023fdb1321fe29cea',
  'extensions/git-id-switcher/docs/i18n/haw/README.md': '80738803e9f673a00815921896cfd305a4378d04405e13bdc0cd8843523d372b',
  'extensions/git-id-switcher/docs/i18n/hu/README.md': 'ec1fd0786deb9e9dfde06df11ad8fc93320bd669489e124aaa09ccb77a571d41',
  'extensions/git-id-switcher/docs/i18n/it/README.md': '5efa2399a110b2f35ebb5484c6daa3c7bc2a29bb1a2deda305b44a35e2948aec',
  'extensions/git-id-switcher/docs/i18n/ja/README.md': 'dbb76d355ac7d0fdf13a4b5c10cd10a4f255297ddddee849d22395dd23e773b6',
  'extensions/git-id-switcher/docs/i18n/ko/README.md': 'ed76c11cfe55c8cf916dcf4ee0536c5795e9958954ddad3c5be6b0261abd8308',
  'extensions/git-id-switcher/docs/i18n/pl/README.md': '6482aca9402770730edb0fb9bdb4d12239026c225e291932fea62fe2612308f9',
  'extensions/git-id-switcher/docs/i18n/pt-BR/README.md': '12bef72da576bd4fa97394f08a095a4ae62e304ae7546cb3d21948580f5770a6',
  'extensions/git-id-switcher/docs/i18n/ru/README.md': '7b13bdd4012e64768ab466a12756097655a9aad13e989bfa2f2691a4957cfd52',
  'extensions/git-id-switcher/docs/i18n/ryu/README.md': '471c4be0dd95e28f5cb6edd24aff4656133c803572ae45da63a1a5d2d3188914',
  'extensions/git-id-switcher/docs/i18n/tlh/README.md': '475e34b837dec6ba19216892dbf55700852f870c0989659d6e1646ccfd8dbd00',
  'extensions/git-id-switcher/docs/i18n/tok/README.md': 'fea76a3e2615d9b2ec265e0f2e3ba56106c79a01f855cac96670c1b9e49ed0f2',
  'extensions/git-id-switcher/docs/i18n/tr/README.md': 'e57bc6a550ccc35e155d4f40a51d4714d802dffa0b33ea372af3005a551aa5f8',
  'extensions/git-id-switcher/docs/i18n/uk/README.md': '421c7a43bbbadbb8f936e0328ba58a18fdca26aac2d60f84d26e050ad6d631c4',
  'extensions/git-id-switcher/docs/i18n/x-lolcat/README.md': '2e24b3deb949fdc0de74a09d5ddee9c3f142d23e6f286213e4272f112bbc361b',
  'extensions/git-id-switcher/docs/i18n/x-pirate/README.md': 'c3d91cd293dc07dac59166bd4f6cd2d37747e4c1ad3deb1067947601b247a01a',
  'extensions/git-id-switcher/docs/i18n/x-shakespeare/README.md': '2753c710e867542c7840070377946e3345f88aec211053a628033c5cd5599be8',
  'extensions/git-id-switcher/docs/i18n/zh-CN/README.md': '1086c9e40ada92c728e2bb0adc0373f322a29d227943a110b4e307df2c42673f',
  'extensions/git-id-switcher/docs/i18n/zh-TW/README.md': 'c3ea971daaaf1ad2a956ea5559d92b5b201c6cac11d5935d7fff43a87522f21b',
  'extensions/git-id-switcher/docs/LANGUAGES.md': 'da50222843094479fd826837038dd62d619ecbc87d67f0b2c299973587abe8e9',
  'extensions/git-id-switcher/docs/THREAT_MODEL.md': '1947cc3c940b872641a8f291bc7ad52eac02df1e91f8b91f67588149bc6fa6f7',
  'extensions/git-id-switcher/LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'extensions/git-id-switcher/README.md': 'd34dfb2a9ce27f3008a628105f9d355c84c6e827c094aa8d175bf9b60cfb4508',
  'GOVERNANCE.md': '2cc1f0b74f88203be7b466bb41a6776a94f59b2abbbd251bb953314393216584',
  'LICENSE': 'e2383295422577622666fa2ff00e5f03abd8f2772d74cca5d5443020ab23d03d',
  'README.md': '1cac085ef93a167dc1dbda72c535050fbf4ce3041cb73f6f25ddd0ce9371747c',
  'SECURITY.md': 'c8f8d620a9f657b659a1c468274c9c65cca026f4d10faac3df31729e76413704',
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
