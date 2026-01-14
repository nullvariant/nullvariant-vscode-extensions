/**
 * Documentation Module Unit Tests
 *
 * Tests for documentation.ts internal functions.
 * PRD-00039-004 Step 3: documentation.ts Unit Tests
 *
 * ## Security Tests (sanitizeHtml) - 6 test functions:
 * 1. testSanitizeHtmlScriptTagRemoval - Script tag removal (various formats, case variations)
 * 2. testSanitizeHtmlEventHandlerRemoval - Event handler attributes (onclick, onerror, onload, etc.)
 * 3. testSanitizeHtmlDangerousUrlSchemes - Dangerous URL schemes (javascript:, data:, vbscript:)
 * 4. testSanitizeHtmlNestedAttacks - Nested attack pattern detection
 * 5. testSanitizeHtmlPreservesSafeHtml - Safe HTML preservation
 * 6. testSanitizeHtmlEdgeCases - Edge cases (empty strings, special characters)
 *
 * ## Markdown Rendering Tests (renderMarkdown) - 8 test functions:
 * 7. testRenderMarkdownHeadings - Heading conversion (h1-h6)
 * 8. testRenderMarkdownCodeBlocks - Code block and inline code rendering
 * 9. testRenderMarkdownTables - Table conversion
 * 10. testRenderMarkdownLinksAndImages - Link and image conversion
 * 11. testRenderMarkdownHrAndBlockquote - Horizontal rules and blockquotes
 * 12. testRenderMarkdownBoldItalic - Bold and italic text
 * 13. testRenderMarkdownLists - List rendering (ordered and unordered)
 * 14. testRenderMarkdownEdgeCases - Edge cases (empty, whitespace, Unicode)
 *
 * ## Locale Detection Tests - 3 test functions:
 * 15. testLocaleMapping - LOCALE_MAP constant verification
 * 16. testGetDocumentLocaleFromString - Locale detection with mapping, fallback, unknown
 * 17. testSupportedLocales - SUPPORTED_LOCALES constant verification
 *
 * ## URL/Path Tests - 3 test functions:
 * 18. testClassifyUrl - URL classification (anchor, internal, external links)
 * 19. testResolveRelativePath - Path resolution and navigation
 * 20. testGetDocumentDisplayName - Filename extraction from path
 *
 * ## Helper Function Tests - 1 test function:
 * 21. testEscapeHtmlEntities - HTML entity escaping
 *
 * Total: 21 test functions (PRD requirement: 15+)
 * Coverage: sanitizeHtml, renderMarkdown, getDocumentLocaleFromString, classifyUrl,
 *           resolveRelativePath, getDocumentDisplayName, escapeHtmlEntities
 */

import * as assert from 'node:assert';
import {
  sanitizeHtml,
  escapeHtmlEntities,
  renderMarkdown,
  resolveRelativePath,
  classifyUrl,
  getDocumentDisplayName,
  getDocumentLocaleFromString,
  SUPPORTED_LOCALES,
  LOCALE_MAP,
} from '../documentation.internal';

// ============================================================================
// Security Tests: sanitizeHtml()
// ============================================================================

/**
 * Test script tag removal - basic cases
 */
function testSanitizeHtmlScriptTagRemoval(): void {
  console.log('Testing sanitizeHtml (script tag removal)...');

  // Basic script tag
  assert.strictEqual(
    sanitizeHtml('<script>alert("xss")</script>'),
    '',
    'Basic script tag should be removed'
  );

  // Script tag with attributes
  assert.strictEqual(
    sanitizeHtml('<script type="text/javascript">malicious()</script>'),
    '',
    'Script tag with attributes should be removed'
  );

  // Script tag with newlines
  assert.strictEqual(
    sanitizeHtml('<script>\nalert("xss")\n</script>'),
    '',
    'Script tag with newlines should be removed'
  );

  // Multiple script tags
  assert.strictEqual(
    sanitizeHtml('<p>Hello</p><script>bad()</script><p>World</p><script>evil()</script>'),
    '<p>Hello</p><p>World</p>',
    'Multiple script tags should be removed'
  );

  // Script tag case variations
  assert.strictEqual(
    sanitizeHtml('<SCRIPT>alert("xss")</SCRIPT>'),
    '',
    'Uppercase script tag should be removed'
  );
  assert.strictEqual(
    sanitizeHtml('<ScRiPt>alert("xss")</ScRiPt>'),
    '',
    'Mixed case script tag should be removed'
  );

  console.log('  sanitizeHtml (script tag removal) passed!');
}

/**
 * Test event handler attribute removal
 */
function testSanitizeHtmlEventHandlerRemoval(): void {
  console.log('Testing sanitizeHtml (event handler removal)...');

  // onclick attribute
  assert.strictEqual(
    sanitizeHtml('<a href="#" onclick="alert(1)">Link</a>'),
    '<a href="#">Link</a>',
    'onclick attribute should be removed'
  );

  // onerror attribute
  assert.strictEqual(
    sanitizeHtml('<img src="x" onerror="alert(1)">'),
    '<img src="x">',
    'onerror attribute should be removed'
  );

  // onload attribute
  assert.strictEqual(
    sanitizeHtml('<body onload="init()">'),
    '<body>',
    'onload attribute should be removed'
  );

  // onmouseover attribute
  assert.strictEqual(
    sanitizeHtml('<div onmouseover="highlight()">Text</div>'),
    '<div>Text</div>',
    'onmouseover attribute should be removed'
  );

  // onfocus attribute
  assert.strictEqual(
    sanitizeHtml('<input onfocus="steal()">'),
    '<input>',
    'onfocus attribute should be removed'
  );

  // Multiple event handlers
  assert.strictEqual(
    sanitizeHtml('<div onclick="a()" onmouseover="b()">Text</div>'),
    '<div>Text</div>',
    'Multiple event handlers should be removed'
  );

  // Event handler with single quotes
  assert.strictEqual(
    sanitizeHtml("<a onclick='alert(1)'>Link</a>"),
    '<a>Link</a>',
    'Event handler with single quotes should be removed'
  );

  console.log('  sanitizeHtml (event handler removal) passed!');
}

/**
 * Test dangerous URL scheme neutralization
 */
function testSanitizeHtmlDangerousUrlSchemes(): void {
  console.log('Testing sanitizeHtml (dangerous URL schemes)...');

  // javascript: scheme in href
  assert.strictEqual(
    sanitizeHtml('<a href="javascript:alert(1)">Click</a>'),
    '<a href="#">Click</a>',
    'javascript: scheme should be neutralized'
  );

  // data: scheme in src
  assert.strictEqual(
    sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>">'),
    '<img src="#">',
    'data: scheme should be neutralized'
  );

  // vbscript: scheme
  assert.strictEqual(
    sanitizeHtml('<a href="vbscript:msgbox(1)">Click</a>'),
    '<a href="#">Click</a>',
    'vbscript: scheme should be neutralized'
  );

  // Whitespace before scheme
  assert.strictEqual(
    sanitizeHtml('<a href="  javascript:alert(1)">Click</a>'),
    '<a href="#">Click</a>',
    'Whitespace before dangerous scheme should be handled'
  );

  // Case variations
  assert.strictEqual(
    sanitizeHtml('<a href="JAVASCRIPT:alert(1)">Click</a>'),
    '<a href="#">Click</a>',
    'Uppercase javascript: should be neutralized'
  );
  assert.strictEqual(
    sanitizeHtml('<a href="JavaScript:alert(1)">Click</a>'),
    '<a href="#">Click</a>',
    'Mixed case JavaScript: should be neutralized'
  );

  console.log('  sanitizeHtml (dangerous URL schemes) passed!');
}

/**
 * Test nested/complex attack patterns
 */
function testSanitizeHtmlNestedAttacks(): void {
  console.log('Testing sanitizeHtml (nested attacks)...');

  // Simple event handler with encoded content (without escaped quotes)
  assert.strictEqual(
    sanitizeHtml('<img src="x" onerror="eval(atob(data))">'),
    '<img src="x">',
    'Event handler with function call should be removed'
  );

  // Multiple dangerous patterns
  assert.strictEqual(
    sanitizeHtml('<a href="javascript:void(0)" onclick="evil()">Click</a>'),
    '<a href="#">Click</a>',
    'Multiple dangerous patterns should all be removed'
  );

  // Nested tags with script
  const nestedInput = '<div><span onclick="a()"><script>b()</script></span></div>';
  const nestedResult = sanitizeHtml(nestedInput);
  assert.ok(
    !nestedResult.includes('onclick') && !nestedResult.includes('<script>'),
    'Nested dangerous patterns should all be removed'
  );

  // SVG with event handler
  assert.strictEqual(
    sanitizeHtml('<svg onload="alert(1)"><circle r="10"/></svg>'),
    '<svg><circle r="10"/></svg>',
    'SVG event handlers should be removed'
  );

  // Event handler with complex but no escaped quotes
  assert.strictEqual(
    sanitizeHtml('<div onmouseover="doSomething(this, 123)">Text</div>'),
    '<div>Text</div>',
    'Event handler with parameters should be removed'
  );

  console.log('  sanitizeHtml (nested attacks) passed!');
}

/**
 * Test that safe HTML is preserved
 */
function testSanitizeHtmlPreservesSafeHtml(): void {
  console.log('Testing sanitizeHtml (preserves safe HTML)...');

  // Normal paragraph
  assert.strictEqual(
    sanitizeHtml('<p>Hello World</p>'),
    '<p>Hello World</p>',
    'Normal paragraph should be preserved'
  );

  // Safe links
  assert.strictEqual(
    sanitizeHtml('<a href="https://example.com">Link</a>'),
    '<a href="https://example.com">Link</a>',
    'Safe https link should be preserved'
  );

  // Images with safe src
  assert.strictEqual(
    sanitizeHtml('<img src="https://example.com/img.png" alt="Image">'),
    '<img src="https://example.com/img.png" alt="Image">',
    'Safe image should be preserved'
  );

  // Tables
  const tableHtml = '<table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>';
  assert.strictEqual(
    sanitizeHtml(tableHtml),
    tableHtml,
    'Tables should be preserved'
  );

  // Code blocks
  assert.strictEqual(
    sanitizeHtml('<pre><code>const x = 1;</code></pre>'),
    '<pre><code>const x = 1;</code></pre>',
    'Code blocks should be preserved'
  );

  console.log('  sanitizeHtml (preserves safe HTML) passed!');
}

/**
 * Test edge cases for sanitizeHtml
 */
function testSanitizeHtmlEdgeCases(): void {
  console.log('Testing sanitizeHtml (edge cases)...');

  // Empty string
  assert.strictEqual(
    sanitizeHtml(''),
    '',
    'Empty string should return empty string'
  );

  // Whitespace only
  assert.strictEqual(
    sanitizeHtml('   '),
    '   ',
    'Whitespace only should be preserved'
  );

  // No HTML at all
  assert.strictEqual(
    sanitizeHtml('Just plain text'),
    'Just plain text',
    'Plain text should be unchanged'
  );

  // Self-closing tags (safe)
  assert.strictEqual(
    sanitizeHtml('<br><hr><img src="test.png">'),
    '<br><hr><img src="test.png">',
    'Safe self-closing tags should be preserved'
  );

  // Deeply nested safe HTML
  const deepNested = '<div><p><span><strong>Bold</strong></span></p></div>';
  assert.strictEqual(
    sanitizeHtml(deepNested),
    deepNested,
    'Deeply nested safe HTML should be preserved'
  );

  // CodeQL-flagged edge cases: whitespace variations in script tags
  assert.strictEqual(
    sanitizeHtml('<script>alert(1)</script >'),
    '',
    'Script tag with whitespace before closing > should be removed'
  );
  assert.strictEqual(
    sanitizeHtml('<script>alert(1)</ script>'),
    '',
    'Script tag with space after </ should be removed'
  );
  assert.strictEqual(
    sanitizeHtml('<script>alert(1)</script\n>'),
    '',
    'Script tag with newline before closing > should be removed'
  );
  assert.strictEqual(
    sanitizeHtml('<script>alert(1)</script\t>'),
    '',
    'Script tag with tab before closing > should be removed'
  );

  // Orphan script tags (malformed HTML)
  assert.strictEqual(
    sanitizeHtml('<script>unclosed'),
    'unclosed',
    'Orphan opening script tag should be removed'
  );
  assert.strictEqual(
    sanitizeHtml('text</script>more text'),
    'textmore text',
    'Orphan closing script tag should be removed'
  );

  // Recursive event handler attempts
  assert.strictEqual(
    sanitizeHtml('<div onclick="x" onclick="y">text</div>'),
    '<div>text</div>',
    'Multiple onclick attributes should all be removed'
  );

  console.log('  sanitizeHtml (edge cases) passed!');
}

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

  // Code block escapes HTML (use non-script tags since sanitizeHtml runs first)
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
    // Security Tests (Priority: Critical)
    console.log('--- Security Tests ---');
    testSanitizeHtmlScriptTagRemoval();
    testSanitizeHtmlEventHandlerRemoval();
    testSanitizeHtmlDangerousUrlSchemes();
    testSanitizeHtmlNestedAttacks();
    testSanitizeHtmlPreservesSafeHtml();
    testSanitizeHtmlEdgeCases();

    // Markdown Rendering Tests
    console.log('\n--- Markdown Rendering Tests ---');
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
