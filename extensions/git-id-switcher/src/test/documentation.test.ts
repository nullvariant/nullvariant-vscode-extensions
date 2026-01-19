/**
 * Documentation Module Unit Tests
 *
 * Tests for documentation.ts internal functions.
 *
 * ## Markdown Rendering Tests (renderMarkdown) - 8 test functions:
 * 1. testRenderMarkdownHeadings - Heading conversion (h1-h6)
 * 2. testRenderMarkdownCodeBlocks - Code block and inline code rendering
 * 3. testRenderMarkdownTables - Table conversion
 * 4. testRenderMarkdownLinksAndImages - Link and image conversion
 * 5. testRenderMarkdownHrAndBlockquote - Horizontal rules and blockquotes
 * 6. testRenderMarkdownBoldItalic - Bold and italic text
 * 7. testRenderMarkdownLists - List rendering (ordered and unordered)
 * 8. testRenderMarkdownEdgeCases - Edge cases (empty, whitespace, Unicode)
 *
 * ## Locale Detection Tests - 3 test functions:
 * 9. testLocaleMapping - LOCALE_MAP constant verification
 * 10. testGetDocumentLocaleFromString - Locale detection with mapping, fallback, unknown
 * 11. testSupportedLocales - SUPPORTED_LOCALES constant verification
 *
 * ## URL/Path Tests - 3 test functions:
 * 12. testClassifyUrl - URL classification (anchor, internal, external links)
 * 13. testResolveRelativePath - Path resolution and navigation
 * 14. testGetDocumentDisplayName - Filename extraction from path
 *
 * ## Helper Function Tests - 1 test function:
 * 15. testEscapeHtmlEntities - HTML entity escaping
 *
 * ## Hash Verification Tests - 5 test functions:
 * 16. testDocumentHashes - DOCUMENT_HASHES constant verification
 * 17. testComputeSha256Hash - SHA-256 hash computation
 * 18. testVerifyContentHash - Content hash verification
 * 19. testLogHashFailure - Hash failure logging
 * 20. testIsContentSizeValid - Content size validation
 *
 * Total: 20 test functions
 * Coverage: renderMarkdown, getDocumentLocaleFromString, classifyUrl,
 *           resolveRelativePath, getDocumentDisplayName, escapeHtmlEntities,
 *           computeSha256Hash, verifyContentHash, logHashFailure, isContentSizeValid
 */

import * as assert from 'node:assert';
import {
  escapeHtmlEntities,
  renderMarkdown,
  resolveRelativePath,
  classifyUrl,
  getDocumentDisplayName,
  getDocumentLocaleFromString,
  SUPPORTED_LOCALES,
  LOCALE_MAP,
  DOCUMENT_HASHES,
  computeSha256Hash,
  verifyContentHash,
  logHashFailure,
  isContentSizeValid,
  getHashKey,
} from '../documentation.internal';

// ============================================================================
// Markdown Rendering Tests: renderMarkdown()
// ============================================================================

/**
 * Test heading conversion (h1-h6)
 */
function testRenderMarkdownHeadings(): void {
  console.log('Testing renderMarkdown (headings)...');

  assert.ok(
    renderMarkdown('# Heading 1').includes('<h1>Heading 1</h1>'),
    'H1 should be converted'
  );
  assert.ok(
    renderMarkdown('## Heading 2').includes('<h2>Heading 2</h2>'),
    'H2 should be converted'
  );
  assert.ok(
    renderMarkdown('### Heading 3').includes('<h3>Heading 3</h3>'),
    'H3 should be converted'
  );
  assert.ok(
    renderMarkdown('#### Heading 4').includes('<h4>Heading 4</h4>'),
    'H4 should be converted'
  );
  assert.ok(
    renderMarkdown('##### Heading 5').includes('<h5>Heading 5</h5>'),
    'H5 should be converted'
  );
  assert.ok(
    renderMarkdown('###### Heading 6').includes('<h6>Heading 6</h6>'),
    'H6 should be converted'
  );

  console.log('  renderMarkdown (headings) passed!');
}

/**
 * Test code block and inline code rendering
 */
function testRenderMarkdownCodeBlocks(): void {
  console.log('Testing renderMarkdown (code blocks)...');

  // Inline code
  const inlineResult = renderMarkdown('Use `const` for constants');
  assert.ok(
    inlineResult.includes('<code>const</code>'),
    'Inline code should be converted'
  );

  // Code block
  const codeBlockResult = renderMarkdown('```javascript\nconst x = 1;\n```');
  assert.ok(
    codeBlockResult.includes('<pre><code>'),
    'Code block should have pre and code tags'
  );
  assert.ok(
    codeBlockResult.includes('const x = 1;'),
    'Code content should be preserved'
  );

  // Code block escapes HTML entities
  const escapeResult = renderMarkdown('```\n<div class="test">content</div>\n```');
  assert.ok(
    escapeResult.includes('&lt;div') && escapeResult.includes('&gt;'),
    'HTML in code blocks should be escaped'
  );

  // Double-backtick inline code (for content with backticks)
  const doubleBacktickResult = renderMarkdown('Use `` ` `` for inline code');
  assert.ok(
    doubleBacktickResult.includes('<code>'),
    'Double backtick inline code should work'
  );

  console.log('  renderMarkdown (code blocks) passed!');
}

/**
 * Test table conversion
 */
function testRenderMarkdownTables(): void {
  console.log('Testing renderMarkdown (tables)...');

  const tableMarkdown = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |
| Cell 3 | Cell 4 |`;

  const result = renderMarkdown(tableMarkdown);

  assert.ok(result.includes('<table>'), 'Table tag should be present');
  assert.ok(result.includes('<thead>'), 'Thead should be present');
  assert.ok(result.includes('<tbody>'), 'Tbody should be present');
  assert.ok(result.includes('<th>Header 1</th>'), 'Header cells should be converted');
  assert.ok(result.includes('<td>Cell 1</td>'), 'Data cells should be converted');

  console.log('  renderMarkdown (tables) passed!');
}

/**
 * Test link and image conversion
 */
function testRenderMarkdownLinksAndImages(): void {
  console.log('Testing renderMarkdown (links and images)...');

  // Regular link
  const linkResult = renderMarkdown('[Example](https://example.com)');
  assert.ok(
    linkResult.includes('<a href="https://example.com">Example</a>'),
    'Links should be converted'
  );

  // Image
  const imageResult = renderMarkdown('![Alt text](image.png)');
  assert.ok(
    imageResult.includes('<img src="image.png" alt="Alt text">'),
    'Images should be converted'
  );

  // Link with special characters in text
  const specialResult = renderMarkdown('[Click Here!](https://example.com)');
  assert.ok(
    specialResult.includes('Click Here!'),
    'Link text with special chars should be preserved'
  );

  console.log('  renderMarkdown (links and images) passed!');
}

/**
 * Test horizontal rules and blockquotes
 */
function testRenderMarkdownHrAndBlockquote(): void {
  console.log('Testing renderMarkdown (hr and blockquote)...');

  // Horizontal rule with ---
  const hrResult1 = renderMarkdown('Text above\n\n---\n\nText below');
  assert.ok(
    hrResult1.includes('<hr>'),
    'Horizontal rule (---) should be converted'
  );

  // Horizontal rule with ***
  const hrResult2 = renderMarkdown('Text above\n\n***\n\nText below');
  assert.ok(
    hrResult2.includes('<hr>'),
    'Horizontal rule (***) should be converted'
  );

  // Blockquote
  const blockquoteResult = renderMarkdown('> This is a quote');
  assert.ok(
    blockquoteResult.includes('<blockquote>'),
    'Blockquote should be converted'
  );
  assert.ok(
    blockquoteResult.includes('This is a quote'),
    'Blockquote content should be preserved'
  );

  // Multi-line blockquote
  const multiLineQuote = renderMarkdown('> Line 1\n> Line 2');
  assert.ok(
    multiLineQuote.includes('<blockquote>'),
    'Multi-line blockquote should be converted'
  );

  console.log('  renderMarkdown (hr and blockquote) passed!');
}

/**
 * Test bold and italic text
 */
function testRenderMarkdownBoldItalic(): void {
  console.log('Testing renderMarkdown (bold and italic)...');

  // Bold text
  const boldResult = renderMarkdown('This is **bold** text');
  assert.ok(
    boldResult.includes('<strong>bold</strong>'),
    'Bold text should be converted'
  );

  // Italic text
  const italicResult = renderMarkdown('This is *italic* text');
  assert.ok(
    italicResult.includes('<em>italic</em>'),
    'Italic text should be converted'
  );

  // Combined bold and italic
  const combinedResult = renderMarkdown('**bold** and *italic*');
  assert.ok(
    combinedResult.includes('<strong>bold</strong>') && combinedResult.includes('<em>italic</em>'),
    'Combined bold and italic should work'
  );

  console.log('  renderMarkdown (bold and italic) passed!');
}

/**
 * Test list rendering
 */
function testRenderMarkdownLists(): void {
  console.log('Testing renderMarkdown (lists)...');

  // Unordered list
  const unorderedResult = renderMarkdown('- Item 1\n- Item 2\n- Item 3');
  assert.ok(
    unorderedResult.includes('<li>Item 1</li>'),
    'Unordered list items should be converted'
  );

  // Ordered list
  const orderedResult = renderMarkdown('1. First\n2. Second\n3. Third');
  assert.ok(
    orderedResult.includes('<li>First</li>'),
    'Ordered list items should be converted'
  );

  console.log('  renderMarkdown (lists) passed!');
}

/**
 * Test renderMarkdown edge cases
 */
function testRenderMarkdownEdgeCases(): void {
  console.log('Testing renderMarkdown (edge cases)...');

  // Empty string
  const emptyResult = renderMarkdown('');
  assert.ok(
    typeof emptyResult === 'string',
    'Empty string should return string'
  );

  // Only whitespace
  const whitespaceResult = renderMarkdown('   \n   ');
  assert.ok(
    typeof whitespaceResult === 'string',
    'Whitespace only should return string'
  );

  // Mixed content (HTML + Markdown)
  const mixedResult = renderMarkdown('<div>HTML</div>\n\n# Markdown Heading');
  assert.ok(
    mixedResult.includes('<div>HTML</div>') && mixedResult.includes('<h1>Markdown Heading</h1>'),
    'Mixed HTML and Markdown should both be processed'
  );

  // Unicode content
  const unicodeResult = renderMarkdown('# 日本語見出し\n\nこれは**太字**です。');
  assert.ok(
    unicodeResult.includes('<h1>日本語見出し</h1>') && unicodeResult.includes('<strong>太字</strong>'),
    'Unicode content should be preserved'
  );

  console.log('  renderMarkdown (edge cases) passed!');
}

// ============================================================================
// Locale Detection Tests
// ============================================================================

/**
 * Test locale mapping (LOCALE_MAP)
 */
function testLocaleMapping(): void {
  console.log('Testing locale mapping...');

  // zh-hans → zh-CN
  assert.strictEqual(
    LOCALE_MAP['zh-hans'],
    'zh-CN',
    'zh-hans should map to zh-CN'
  );

  // zh-hant → zh-TW
  assert.strictEqual(
    LOCALE_MAP['zh-hant'],
    'zh-TW',
    'zh-hant should map to zh-TW'
  );

  // pt → pt-BR
  assert.strictEqual(
    LOCALE_MAP['pt'],
    'pt-BR',
    'pt should map to pt-BR'
  );

  console.log('  Locale mapping passed!');
}

/**
 * Test getDocumentLocaleFromString function
 */
function testGetDocumentLocaleFromString(): void {
  console.log('Testing getDocumentLocaleFromString...');

  // Exact match
  assert.strictEqual(
    getDocumentLocaleFromString('ja'),
    'ja',
    'Japanese should return ja'
  );
  assert.strictEqual(
    getDocumentLocaleFromString('en'),
    'en',
    'English should return en'
  );

  // Locale mapping (zh-hans → zh-CN)
  assert.strictEqual(
    getDocumentLocaleFromString('zh-hans'),
    'zh-CN',
    'zh-hans should map to zh-CN'
  );
  assert.strictEqual(
    getDocumentLocaleFromString('zh-hant'),
    'zh-TW',
    'zh-hant should map to zh-TW'
  );
  assert.strictEqual(
    getDocumentLocaleFromString('pt'),
    'pt-BR',
    'pt should map to pt-BR'
  );

  // Base locale extraction (en-US → en)
  assert.strictEqual(
    getDocumentLocaleFromString('en-US'),
    'en',
    'en-US should fall back to en'
  );
  assert.strictEqual(
    getDocumentLocaleFromString('de-DE'),
    'de',
    'de-DE should fall back to de'
  );

  // Unknown locale fallback to English
  assert.strictEqual(
    getDocumentLocaleFromString('xx-YY'),
    'en',
    'Unknown locale should fall back to en'
  );
  assert.strictEqual(
    getDocumentLocaleFromString('unknown'),
    'en',
    'Completely unknown locale should fall back to en'
  );

  console.log('  getDocumentLocaleFromString passed!');
}

/**
 * Test supported locales
 */
function testSupportedLocales(): void {
  console.log('Testing supported locales...');

  // Major locales should be supported
  assert.ok(SUPPORTED_LOCALES.includes('en'), 'English should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('ja'), 'Japanese should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('zh-CN'), 'Simplified Chinese should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('zh-TW'), 'Traditional Chinese should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('ko'), 'Korean should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('de'), 'German should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('fr'), 'French should be supported');

  // Novelty locales should be supported
  assert.ok(SUPPORTED_LOCALES.includes('x-pirate'), 'Pirate locale should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('x-shakespeare'), 'Shakespeare locale should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('x-lolcat'), 'Lolcat locale should be supported');

  // Endangered/constructed languages
  assert.ok(SUPPORTED_LOCALES.includes('ain'), 'Ainu should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('eo'), 'Esperanto should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('tlh'), 'Klingon should be supported');
  assert.ok(SUPPORTED_LOCALES.includes('tok'), 'Toki Pona should be supported');

  console.log('  Supported locales passed!');
}

// ============================================================================
// URL Classification Tests
// ============================================================================

/**
 * Test URL classification
 */
function testClassifyUrl(): void {
  console.log('Testing classifyUrl...');

  // Anchor links
  const anchorResult = classifyUrl('#section', 'docs/README.md');
  assert.strictEqual(anchorResult.type, 'anchor', 'Anchor links should be classified');

  const anchorDeepResult = classifyUrl('#deeply-nested-section', 'docs/README.md');
  assert.strictEqual(anchorDeepResult.type, 'anchor', 'Deep anchor links should be classified');

  // External links (absolute URLs)
  const externalResult = classifyUrl('https://example.com', 'docs/README.md');
  assert.strictEqual(externalResult.type, 'external', 'HTTPS links should be external');

  const httpResult = classifyUrl('http://example.com', 'docs/README.md');
  assert.strictEqual(httpResult.type, 'external', 'HTTP links should be external');

  const externalWithPath = classifyUrl('https://github.com/user/repo/blob/main/file.md', 'docs/README.md');
  assert.strictEqual(externalWithPath.type, 'external', 'HTTPS with path should be external');

  // Internal markdown links
  const internalMdResult = classifyUrl('./CONTRIBUTING.md', 'docs/README.md');
  assert.strictEqual(internalMdResult.type, 'internal-md', 'Relative .md links should be internal');
  assert.strictEqual(internalMdResult.resolvedPath, 'docs/CONTRIBUTING.md', 'Path should be resolved');

  // Parent directory navigation
  const parentResult = classifyUrl('../LICENSE.md', 'docs/i18n/ja/README.md');
  assert.strictEqual(parentResult.type, 'internal-md', 'Parent dir .md links should be internal');
  assert.strictEqual(parentResult.resolvedPath, 'docs/i18n/LICENSE.md', 'Parent path should be resolved');

  // Non-markdown relative links (external)
  const nonMdResult = classifyUrl('./image.png', 'docs/README.md');
  assert.strictEqual(nonMdResult.type, 'external', 'Non-.md relative links should be external');

  // Direct filename without ./ prefix
  const directMdResult = classifyUrl('OTHER.md', 'docs/README.md');
  assert.strictEqual(directMdResult.type, 'internal-md', 'Direct .md filename should be internal');

  // Non-markdown direct link
  const directNonMdResult = classifyUrl('script.js', 'docs/README.md');
  assert.strictEqual(directNonMdResult.type, 'external', 'Direct non-.md filename should be external');

  // Non-http/https URLs with :// (ftp, file, ssh, etc.) - hits final fallback return
  const ftpResult = classifyUrl('ftp://files.example.com/data', 'docs/README.md');
  assert.strictEqual(ftpResult.type, 'external', 'FTP links should be external');

  const fileResult = classifyUrl('file:///local/path', 'docs/README.md');
  assert.strictEqual(fileResult.type, 'external', 'File protocol links should be external');

  const sshResult = classifyUrl('ssh://git@github.com/repo', 'docs/README.md');
  assert.strictEqual(sshResult.type, 'external', 'SSH links should be external');

  console.log('  classifyUrl passed!');
}

// ============================================================================
// Path Resolution Tests
// ============================================================================

/**
 * Test relative path resolution
 */
function testResolveRelativePath(): void {
  console.log('Testing resolveRelativePath...');

  // Same directory
  assert.strictEqual(
    resolveRelativePath('docs/README.md', './CONTRIBUTING.md'),
    'docs/CONTRIBUTING.md',
    'Same directory resolution should work'
  );

  // Parent directory
  assert.strictEqual(
    resolveRelativePath('docs/i18n/ja/README.md', '../LICENSE.md'),
    'docs/i18n/LICENSE.md',
    'Parent directory resolution should work'
  );

  // Multiple parent directories
  assert.strictEqual(
    resolveRelativePath('docs/i18n/ja/README.md', '../../CONTRIBUTING.md'),
    'docs/CONTRIBUTING.md',
    'Multiple parent directory resolution should work'
  );

  // Root-relative (from nested path)
  assert.strictEqual(
    resolveRelativePath('docs/i18n/ja/README.md', '../../../LICENSE.md'),
    'LICENSE.md',
    'Root-relative resolution should work'
  );

  // Simple filename (no directory)
  assert.strictEqual(
    resolveRelativePath('README.md', './OTHER.md'),
    'OTHER.md',
    'Simple filename resolution should work'
  );

  console.log('  resolveRelativePath passed!');
}

/**
 * Test document display name extraction
 */
function testGetDocumentDisplayName(): void {
  console.log('Testing getDocumentDisplayName...');

  assert.strictEqual(
    getDocumentDisplayName('docs/i18n/ja/README.md'),
    'README',
    'Should extract README from path'
  );

  assert.strictEqual(
    getDocumentDisplayName('CONTRIBUTING.md'),
    'CONTRIBUTING',
    'Should extract CONTRIBUTING from simple path'
  );

  assert.strictEqual(
    getDocumentDisplayName('docs/deep/path/FILE.md'),
    'FILE',
    'Should extract FILE from deep path'
  );

  console.log('  getDocumentDisplayName passed!');
}

// ============================================================================
// Helper Function Tests
// ============================================================================

/**
 * Test HTML entity escaping
 */
function testEscapeHtmlEntities(): void {
  console.log('Testing escapeHtmlEntities...');

  // Basic escaping
  assert.strictEqual(
    escapeHtmlEntities('<script>'),
    '&lt;script&gt;',
    'Angle brackets should be escaped'
  );

  assert.strictEqual(
    escapeHtmlEntities('a & b'),
    'a &amp; b',
    'Ampersand should be escaped'
  );

  assert.strictEqual(
    escapeHtmlEntities('<a href="test">'),
    '&lt;a href="test"&gt;',
    'Full tag should be escaped'
  );

  // Edge cases
  assert.strictEqual(
    escapeHtmlEntities(''),
    '',
    'Empty string should return empty'
  );

  assert.strictEqual(
    escapeHtmlEntities('No special chars'),
    'No special chars',
    'Text without special chars should be unchanged'
  );

  assert.strictEqual(
    escapeHtmlEntities('<<<>>>'),
    '&lt;&lt;&lt;&gt;&gt;&gt;',
    'Multiple special chars should all be escaped'
  );

  assert.strictEqual(
    escapeHtmlEntities('a && b && c'),
    'a &amp;&amp; b &amp;&amp; c',
    'Multiple ampersands should all be escaped'
  );

  console.log('  escapeHtmlEntities passed!');
}

// ============================================================================
// Hash Verification Tests
// ============================================================================

/**
 * Test DOCUMENT_HASHES constant
 *
 * Hash keys follow CDN path structure:
 * - Extension files: extensions/git-id-switcher/{path}
 * - Monorepo root files: {filename} (no prefix)
 */
function testDocumentHashes(): void {
  console.log('Testing DOCUMENT_HASHES...');

  // Should have entries
  const hashCount = Object.keys(DOCUMENT_HASHES).length;
  assert.ok(hashCount > 0, 'DOCUMENT_HASHES should have entries');
  // Note: Exact count may vary as documentation is updated

  // All hashes should be 64-character hex strings (SHA-256)
  for (const [path, hash] of Object.entries(DOCUMENT_HASHES)) {
    assert.strictEqual(hash.length, 64, `Hash for ${path} should be 64 characters`);
    assert.ok(/^[0-9a-f]+$/.test(hash), `Hash for ${path} should be lowercase hex`);
  }

  // Should include key extension documents (CDN path format)
  const EXT_PREFIX = 'extensions/git-id-switcher';
  assert.ok(`${EXT_PREFIX}/README.md` in DOCUMENT_HASHES, 'Should include extension README.md');
  assert.ok(`${EXT_PREFIX}/CHANGELOG.md` in DOCUMENT_HASHES, 'Should include extension CHANGELOG.md');
  assert.ok(`${EXT_PREFIX}/LICENSE` in DOCUMENT_HASHES, 'Should include extension LICENSE');
  assert.ok(`${EXT_PREFIX}/docs/i18n/en/README.md` in DOCUMENT_HASHES, 'Should include English README');
  assert.ok(`${EXT_PREFIX}/docs/i18n/ja/README.md` in DOCUMENT_HASHES, 'Should include Japanese README');

  // Should include monorepo root documents (filename only)
  assert.ok('README.md' in DOCUMENT_HASHES, 'Should include monorepo README.md');
  assert.ok('LICENSE' in DOCUMENT_HASHES, 'Should include monorepo LICENSE');

  // Test getHashKey utility
  assert.strictEqual(
    getHashKey('docs/i18n/ja/README.md', false),
    `${EXT_PREFIX}/docs/i18n/ja/README.md`,
    'getHashKey should prefix extension files'
  );
  assert.strictEqual(
    getHashKey('README.md', true),
    'README.md',
    'getHashKey should not prefix monorepo root files'
  );

  console.log('  DOCUMENT_HASHES passed!');
}

/**
 * Test computeSha256Hash function
 */
async function testComputeSha256Hash(): Promise<void> {
  console.log('Testing computeSha256Hash...');

  // Known test vector: SHA-256 of empty string
  const emptyHash = await computeSha256Hash('');
  assert.strictEqual(
    emptyHash,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Empty string hash should match known value'
  );

  // Known test vector: SHA-256 of "hello"
  const helloHash = await computeSha256Hash('hello');
  assert.strictEqual(
    helloHash,
    '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    'Hash of "hello" should match known value'
  );

  // Hash should be deterministic
  const hash1 = await computeSha256Hash('test content');
  const hash2 = await computeSha256Hash('test content');
  assert.strictEqual(hash1, hash2, 'Same content should produce same hash');

  // Different content should produce different hash
  const hashA = await computeSha256Hash('content A');
  const hashB = await computeSha256Hash('content B');
  assert.notStrictEqual(hashA, hashB, 'Different content should produce different hash');

  // Hash format validation
  assert.strictEqual(hash1.length, 64, 'Hash should be 64 characters');
  assert.ok(/^[0-9a-f]+$/.test(hash1), 'Hash should be lowercase hex');

  // Unicode content
  const unicodeHash = await computeSha256Hash('日本語テスト');
  assert.strictEqual(unicodeHash.length, 64, 'Unicode hash should be 64 characters');

  console.log('  computeSha256Hash passed!');
}

/**
 * Test verifyContentHash function
 *
 * verifyContentHash converts path to hash key internally using getHashKey:
 * - Extension files: extensions/git-id-switcher/{path}
 * - Monorepo root files: {filename} (when isMonorepoRoot=true)
 */
async function testVerifyContentHash(): Promise<void> {
  console.log('Testing verifyContentHash...');

  const EXT_PREFIX = 'extensions/git-id-switcher';

  // Unknown path should return invalid with undefined expectedHash
  const unknownResult = await verifyContentHash('unknown/path.md', 'any content');
  assert.strictEqual(unknownResult.valid, false, 'Unknown path should be invalid');
  assert.strictEqual(unknownResult.expectedHash, undefined, 'Unknown path should have undefined expectedHash');
  assert.strictEqual(unknownResult.actualHash.length, 64, 'Should still compute actual hash');
  assert.strictEqual(unknownResult.hashKey, `${EXT_PREFIX}/unknown/path.md`, 'Hash key should be computed');

  // Known path with wrong content should return invalid with hash mismatch
  // Note: path 'README.md' (extension file) maps to key 'extensions/git-id-switcher/README.md'
  const mismatchResult = await verifyContentHash('README.md', 'wrong content');
  assert.strictEqual(mismatchResult.valid, false, 'Wrong content should be invalid');
  assert.ok(mismatchResult.expectedHash !== undefined, 'Known path should have expectedHash');
  assert.notStrictEqual(mismatchResult.expectedHash, mismatchResult.actualHash, 'Hashes should not match');
  assert.strictEqual(mismatchResult.hashKey, `${EXT_PREFIX}/README.md`, 'Hash key should include prefix');

  // Valid case: create content that matches hash for a test path
  // Use computeSha256Hash to get the actual hash for test content
  const testContent = 'test content for hash verification';
  const testHash = await computeSha256Hash(testContent);

  // Create a temporary test by checking the logic flow
  // Since we can't modify DOCUMENT_HASHES, test with a real path
  // by verifying the structure of a valid response
  // Note: Hash key format is 'extensions/git-id-switcher/README.md'
  const extReadmeHashKey = `${EXT_PREFIX}/README.md`;
  const extReadmeHash = DOCUMENT_HASHES[extReadmeHashKey];
  assert.ok(extReadmeHash !== undefined, 'Extension README.md should have a hash');
  assert.strictEqual(extReadmeHash.length, 64, 'Hash should be 64 characters');

  // Test that actualHash is computed correctly
  const verifyResult = await verifyContentHash('README.md', testContent);
  assert.strictEqual(verifyResult.actualHash, testHash, 'Actual hash should match computed hash');
  assert.strictEqual(verifyResult.expectedHash, extReadmeHash, 'Expected hash should be from DOCUMENT_HASHES');
  assert.strictEqual(verifyResult.hashKey, extReadmeHashKey, 'Hash key should be returned');

  // Result structure validation
  assert.ok('valid' in unknownResult, 'Result should have valid property');
  assert.ok('expectedHash' in unknownResult, 'Result should have expectedHash property');
  assert.ok('actualHash' in unknownResult, 'Result should have actualHash property');
  assert.ok('hashKey' in unknownResult, 'Result should have hashKey property');

  // Test monorepo root file (isMonorepoRoot = true)
  const monorepoReadmeHash = DOCUMENT_HASHES['README.md'];
  assert.ok(monorepoReadmeHash !== undefined, 'Monorepo README.md should have a hash');
  const monorepoResult = await verifyContentHash('README.md', testContent, true);
  assert.strictEqual(monorepoResult.hashKey, 'README.md', 'Monorepo root should use filename as key');
  assert.strictEqual(monorepoResult.expectedHash, monorepoReadmeHash, 'Should use monorepo hash');

  // Edge case: empty content
  const emptyContentResult = await verifyContentHash('README.md', '');
  assert.strictEqual(emptyContentResult.valid, false, 'Empty content should not match');
  assert.strictEqual(
    emptyContentResult.actualHash,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Empty content should have known empty string hash'
  );

  console.log('  verifyContentHash passed!');
}

/**
 * Test logHashFailure function
 */
function testLogHashFailure(): void {
  console.log('Testing logHashFailure...');

  // Test with undefined expectedHash (unknown path)
  // Should not throw, just log to console
  logHashFailure('unknown/path.md', {
    expectedHash: undefined,
    actualHash: 'abc123',
    hashKey: 'extensions/git-id-switcher/unknown/path.md',
  });

  // Test with defined expectedHash (hash mismatch)
  logHashFailure('README.md', {
    expectedHash: 'expected123',
    actualHash: 'actual456',
    hashKey: 'extensions/git-id-switcher/README.md',
  });

  // Function should complete without errors
  console.log('  logHashFailure passed!');
}

/**
 * Test isContentSizeValid function
 */
function testIsContentSizeValid(): void {
  console.log('Testing isContentSizeValid...');

  const MAX_SIZE = 1000;

  // Valid: content length header within limit
  assert.strictEqual(
    isContentSizeValid('500', 500, MAX_SIZE),
    true,
    'Content within limit should be valid'
  );

  // Valid: no content length header, actual within limit
  assert.strictEqual(
    isContentSizeValid(null, 500, MAX_SIZE),
    true,
    'No header, actual within limit should be valid'
  );

  // Invalid: content length header exceeds limit
  assert.strictEqual(
    isContentSizeValid('2000', 500, MAX_SIZE),
    false,
    'Header exceeding limit should be invalid'
  );

  // Invalid: actual length exceeds limit (header missing)
  assert.strictEqual(
    isContentSizeValid(null, 2000, MAX_SIZE),
    false,
    'Actual exceeding limit should be invalid'
  );

  // Invalid: actual length exceeds limit (header lies)
  assert.strictEqual(
    isContentSizeValid('500', 2000, MAX_SIZE),
    false,
    'Actual exceeding limit should be invalid even if header is within'
  );

  // Edge case: exactly at limit
  assert.strictEqual(
    isContentSizeValid('1000', 1000, MAX_SIZE),
    true,
    'Exactly at limit should be valid'
  );

  // Edge case: one over limit
  assert.strictEqual(
    isContentSizeValid('1001', 1000, MAX_SIZE),
    false,
    'One over limit in header should be invalid'
  );

  console.log('  isContentSizeValid passed!');
}

// ============================================================================
// Test Runner
// ============================================================================

/**
 * Run all documentation tests
 */
export async function runDocumentationTests(): Promise<void> {
  console.log('\n========================================');
  console.log('   Documentation Module Unit Tests     ');
  console.log('========================================\n');

  try {
    // Markdown Rendering Tests
    console.log('--- Markdown Rendering Tests ---');
    testRenderMarkdownHeadings();
    testRenderMarkdownCodeBlocks();
    testRenderMarkdownTables();
    testRenderMarkdownLinksAndImages();
    testRenderMarkdownHrAndBlockquote();
    testRenderMarkdownBoldItalic();
    testRenderMarkdownLists();
    testRenderMarkdownEdgeCases();

    // Locale Tests
    console.log('\n--- Locale Detection Tests ---');
    testLocaleMapping();
    testGetDocumentLocaleFromString();
    testSupportedLocales();

    // URL/Path Tests
    console.log('\n--- URL Classification Tests ---');
    testClassifyUrl();
    testResolveRelativePath();
    testGetDocumentDisplayName();

    // Helper Function Tests
    console.log('\n--- Helper Function Tests ---');
    testEscapeHtmlEntities();

    // Hash Verification Tests
    console.log('\n--- Hash Verification Tests ---');
    testDocumentHashes();
    await testComputeSha256Hash();
    await testVerifyContentHash();
    testLogHashFailure();
    testIsContentSizeValid();

    console.log('\n========================================');
    console.log('   All documentation tests passed!     ');
    console.log('========================================\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n Test failed:', errorMessage);
    throw error;
  }
}

// Run tests when executed directly
if (require.main === module) {
  runDocumentationTests().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
    process.exit(1);
  });
}
