/**
 * HTML Templates Module Unit Tests
 *
 * Tests for htmlTemplates.ts pure functions (no VS Code dependency).
 *
 * ## CSP Tests - 2 test functions:
 * 1. testBuildCspString - CSP directive construction
 * 2. testBuildCspStringNonceVariation - Different nonces produce different CSP
 *
 * ## Shared Styles Tests - 1 test function:
 * 3. testGetBaseStyles - Common CSS properties
 *
 * ## Document HTML Tests - 3 test functions:
 * 4. testBuildDocumentHtmlStructure - Basic HTML structure and a11y
 * 5. testBuildDocumentHtmlNavigation - Navigation bar and back button
 * 6. testBuildDocumentHtmlContentEscaping - XSS prevention via escaping
 *
 * ## Loading HTML Tests - 2 test functions:
 * 7. testBuildLoadingHtmlStructure - Loading state structure and a11y
 * 8. testBuildLoadingHtmlAccessibility - ARIA attributes on spinner/status
 *
 * ## Error HTML Tests - 3 test functions:
 * 9. testBuildErrorHtmlNetwork - Network error message
 * 10. testBuildErrorHtmlNotFound - Not found error message
 * 11. testBuildErrorHtmlServer - Server error message
 *
 * ## Lang Attribute Tests - 1 test function:
 * 12. testLangAttributes - lang attribute presence across all templates
 *
 * Total: 12 test functions
 * Coverage: buildCspString, getBaseStyles, buildDocumentHtml,
 *           buildLoadingHtml, buildErrorHtml
 */

import * as assert from 'node:assert';
import {
  buildCspString,
  getBaseStyles,
  buildDocumentHtml,
  buildLoadingHtml,
  buildErrorHtml,
} from '../ui/htmlTemplates';

// ============================================================================
// Test Constants
// ============================================================================

const TEST_CSP_SOURCE = 'https://test.vscode-resource.vscode-cdn.net';
const TEST_NONCE = 'dGVzdC1ub25jZS0xMjM0';

// ============================================================================
// CSP Tests: buildCspString()
// ============================================================================

/**
 * Test CSP directive construction
 */
function testBuildCspString(): void {
  console.log('Testing buildCspString...');

  const csp = buildCspString(TEST_CSP_SOURCE, TEST_NONCE);

  // Should include default-src 'none'
  assert.ok(
    csp.includes("default-src 'none'"),
    'CSP should have default-src none'
  );

  // Should include img-src with cspSource and CDN
  assert.ok(
    csp.includes(`img-src ${TEST_CSP_SOURCE}`),
    'CSP should include cspSource in img-src'
  );
  assert.ok(
    csp.includes('https://assets.nullvariant.com'),
    'CSP should include CDN in img-src'
  );
  assert.ok(
    csp.includes('https://img.shields.io'),
    'CSP should include shields.io in img-src'
  );

  // Should include nonce-based style-src and script-src
  assert.ok(
    csp.includes(`style-src ${TEST_CSP_SOURCE} 'nonce-${TEST_NONCE}'`),
    'CSP should include nonce in style-src'
  );
  assert.ok(
    csp.includes(`script-src 'nonce-${TEST_NONCE}'`),
    'CSP should include nonce in script-src'
  );

  // Should include connect-src and font-src
  assert.ok(
    csp.includes('connect-src https://assets.nullvariant.com'),
    'CSP should include connect-src'
  );
  assert.ok(
    csp.includes(`font-src ${TEST_CSP_SOURCE}`),
    'CSP should include font-src'
  );

  // Directives should be semicolon-separated
  assert.ok(
    csp.includes('; '),
    'CSP directives should be semicolon-separated'
  );

  console.log('  buildCspString passed!');
}

/**
 * Test that different nonces produce different CSP strings
 */
function testBuildCspStringNonceVariation(): void {
  console.log('Testing buildCspString (nonce variation)...');

  const csp1 = buildCspString(TEST_CSP_SOURCE, 'abc123');
  const csp2 = buildCspString(TEST_CSP_SOURCE, 'def456');

  assert.notStrictEqual(csp1, csp2, 'Different nonces should produce different CSP');

  // Each should contain its own nonce (without double nonce- prefix)
  assert.ok(csp1.includes("'nonce-abc123'"), 'CSP1 should contain nonce-abc123');
  assert.ok(csp2.includes("'nonce-def456'"), 'CSP2 should contain nonce-def456');
  assert.ok(!csp1.includes('nonce-nonce-'), 'Should not have double nonce- prefix');

  console.log('  buildCspString (nonce variation) passed!');
}

// ============================================================================
// Shared Styles Tests: getBaseStyles()
// ============================================================================

/**
 * Test common CSS properties
 */
function testGetBaseStyles(): void {
  console.log('Testing getBaseStyles...');

  const styles = getBaseStyles();

  // Should include VS Code CSS variables for theming
  assert.ok(
    styles.includes('var(--vscode-font-family)'),
    'Should use VS Code font family variable'
  );
  assert.ok(
    styles.includes('var(--vscode-foreground)'),
    'Should use VS Code foreground color variable'
  );
  assert.ok(
    styles.includes('var(--vscode-editor-background)'),
    'Should use VS Code background color variable'
  );

  // Should include link styles
  assert.ok(
    styles.includes('var(--vscode-textLink-foreground)'),
    'Should use VS Code link color variable'
  );
  assert.ok(
    styles.includes('var(--vscode-textLink-activeForeground)'),
    'Should use VS Code active link color variable'
  );

  // Should define design tokens for border-radius (Issue-00119)
  // Values matter: they form the SSOT contract, not just the names.
  assert.match(
    styles, /--gis-radius-sm:\s*3px/,
    '--gis-radius-sm must equal 3px'
  );
  assert.match(
    styles, /--gis-radius-md:\s*5px/,
    '--gis-radius-md must equal 5px'
  );

  console.log('  getBaseStyles passed!');
}

/**
 * Count `border-radius: Npx` literal occurrences (excluding `%` values
 * like `50%` which are intentionally not tokenised, and excluding
 * `var(--...)` references).
 */
function countBorderRadiusPxLiterals(html: string): string[] {
  const matches = [...html.matchAll(/border-radius:\s*(\d+px)/g)];
  return matches.map(m => m[1]);
}

/**
 * Test CSS/a11y quality fixes from Issue-00119.
 *
 * Applies to ALL templates (document/loading/error) so the SSOT
 * guarantees cannot regress in one template while passing in another.
 */
function testAllTemplatesCssQuality(): void {
  console.log('Testing all templates (CSS/a11y quality — Issue-00119)...');

  const templates: ReadonlyArray<readonly [string, () => string]> = [
    ['document', (): string => buildDocumentHtml(
      TEST_CSP_SOURCE, '<p>Content</p>', 'en', 'docs/README.md', TEST_NONCE, false
    )],
    ['loading', (): string => buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE)],
    ['error', (): string => buildErrorHtml(TEST_CSP_SOURCE, 'network', TEST_NONCE)],
  ];

  for (const [name, build] of templates) {
    const html = build();

    // No raw `border-radius: Npx` literals allowed. Spinner uses
    // `50%` which does not match the `\d+px` pattern so it is exempt.
    const literals = countBorderRadiusPxLiterals(html);
    assert.strictEqual(
      literals.length, 0,
      `${name}: border-radius must use design tokens, found literals: ${literals.join(', ')}`
    );
  }

  // Document template uses both tokens explicitly.
  const docHtml = buildDocumentHtml(
    TEST_CSP_SOURCE, '<p>Content</p>', 'en', 'docs/README.md', TEST_NONCE, false
  );
  assert.ok(
    docHtml.includes('border-radius: var(--gis-radius-sm)'),
    'Document template should reference --gis-radius-sm via border-radius'
  );
  assert.ok(
    docHtml.includes('border-radius: var(--gis-radius-md)'),
    'Document template should reference --gis-radius-md via border-radius'
  );

  // External link arrow must be scoped to the correct selector and
  // must announce its purpose via CSS alt-text (not silenced).
  const arrowRule =
    /a\[href\^="http"\][^{]*::after\s*\{[^}]*content:\s*" ↗"\s*\/\s*" \(opens externally\)"\s*;[^}]*\}/;
  assert.match(
    docHtml, arrowRule,
    'External link ::after must declare "(opens externally)" CSS alt text'
  );

  // Table cell overflow rules must live inside the `th, td` block,
  // not just anywhere in the stylesheet.
  const cellBlock = /th,\s*td\s*\{([^}]*)\}/.exec(docHtml)?.[1] ?? '';
  assert.ok(
    cellBlock.includes('overflow-wrap: anywhere'),
    'th/td block must declare overflow-wrap: anywhere'
  );
  // word-break: break-word is a non-standard alias of overflow-wrap
  // and is intentionally omitted to avoid duplication.
  assert.ok(
    !cellBlock.includes('word-break: break-word'),
    'th/td should not duplicate word-break: break-word (use overflow-wrap only)'
  );

  console.log('  all templates (CSS/a11y quality) passed!');
}

// ============================================================================
// Document HTML Tests: buildDocumentHtml()
// ============================================================================

/**
 * Test basic HTML structure and a11y
 */
function testBuildDocumentHtmlStructure(): void {
  console.log('Testing buildDocumentHtml (structure)...');

  const html = buildDocumentHtml(
    TEST_CSP_SOURCE,
    '<p>Test content</p>',
    'en',
    'docs/README.md',
    TEST_NONCE,
    false
  );

  // DOCTYPE and basic structure
  assert.ok(html.includes('<!DOCTYPE html>'), 'Should have DOCTYPE');
  assert.ok(html.includes('<html lang="en">'), 'Should have lang attribute on html element');
  assert.ok(html.includes('<meta charset="UTF-8">'), 'Should have charset meta');
  assert.ok(html.includes('Content-Security-Policy'), 'Should have CSP meta');

  // Content should be included
  assert.ok(html.includes('<p>Test content</p>'), 'Should include content');

  // Title
  assert.ok(
    html.includes('<title>Git ID Switcher Documentation</title>'),
    'Should have title'
  );

  // Nonce on style and script
  assert.ok(
    html.includes(`<style nonce="${TEST_NONCE}">`),
    'Style should have nonce'
  );
  assert.ok(
    html.includes(`<script nonce="${TEST_NONCE}">`),
    'Script should have nonce'
  );

  // Footer links
  assert.ok(html.includes('View on GitHub'), 'Should have GitHub link');
  assert.ok(html.includes('VS Code Marketplace'), 'Should have Marketplace link');

  console.log('  buildDocumentHtml (structure) passed!');
}

/**
 * Test navigation bar and back button
 */
function testBuildDocumentHtmlNavigation(): void {
  console.log('Testing buildDocumentHtml (navigation)...');

  // nav element with aria-label (semantic HTML)
  const htmlWithBack = buildDocumentHtml(
    TEST_CSP_SOURCE, '<p>Content</p>', 'ja', 'docs/test.md', TEST_NONCE, true
  );
  assert.ok(
    htmlWithBack.includes('<nav class="nav-bar" aria-label="Document navigation">'),
    'Should use nav element with aria-label'
  );

  // Back button enabled when canGoBack=true
  assert.ok(
    htmlWithBack.includes('<button id="back-btn" >'),
    'Back button should be enabled when canGoBack is true'
  );

  // Back button disabled when canGoBack=false
  const htmlNoBack = buildDocumentHtml(
    TEST_CSP_SOURCE, '<p>Content</p>', 'en', 'docs/test.md', TEST_NONCE, false
  );
  assert.ok(
    htmlNoBack.includes('<button id="back-btn" disabled>'),
    'Back button should be disabled when canGoBack is false'
  );

  // Current path should be displayed (escaped)
  assert.ok(
    htmlWithBack.includes('docs/test.md'),
    'Should display current path'
  );

  // Locale should be reflected in lang attribute
  assert.ok(
    htmlWithBack.includes('<html lang="ja">'),
    'Should use provided locale in lang attribute'
  );

  console.log('  buildDocumentHtml (navigation) passed!');
}

/**
 * Test XSS prevention via HTML escaping
 */
function testBuildDocumentHtmlContentEscaping(): void {
  console.log('Testing buildDocumentHtml (escaping)...');

  // Locale with XSS payload should be escaped
  const html = buildDocumentHtml(
    TEST_CSP_SOURCE,
    '<p>Safe content</p>',
    '"><script>alert(1)</script>',
    'docs/<script>alert(2)</script>.md',
    TEST_NONCE,
    false
  );

  // Locale should be escaped in lang attribute
  assert.ok(
    !html.includes('lang=""><script>'),
    'Locale XSS payload should be escaped'
  );
  assert.ok(
    html.includes('&lt;script&gt;'),
    'Script tags in locale should be HTML-escaped'
  );

  // Path should be escaped in display
  assert.ok(
    html.includes('&lt;script&gt;alert(2)&lt;/script&gt;'),
    'Script tags in path should be HTML-escaped'
  );

  console.log('  buildDocumentHtml (escaping) passed!');
}

// ============================================================================
// Loading HTML Tests: buildLoadingHtml()
// ============================================================================

/**
 * Test loading state structure and a11y
 */
function testBuildLoadingHtmlStructure(): void {
  console.log('Testing buildLoadingHtml (structure)...');

  const html = buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE);

  // Basic structure
  assert.ok(html.includes('<!DOCTYPE html>'), 'Should have DOCTYPE');
  assert.ok(html.includes('<meta charset="UTF-8">'), 'Should have charset meta');
  assert.ok(html.includes('Content-Security-Policy'), 'Should have CSP meta');
  assert.ok(html.includes(`<style nonce="${TEST_NONCE}">`), 'Style should have nonce');

  // Loading content
  assert.ok(html.includes('Loading documentation...'), 'Should have loading text');
  assert.ok(html.includes('class="spinner"'), 'Should have spinner element');
  assert.ok(html.includes('class="loading"'), 'Should have loading container');

  // Animation
  assert.ok(html.includes('@keyframes spin'), 'Should have spinner animation');

  console.log('  buildLoadingHtml (structure) passed!');
}

/**
 * Test ARIA attributes on spinner and status
 */
function testBuildLoadingHtmlAccessibility(): void {
  console.log('Testing buildLoadingHtml (accessibility)...');

  const html = buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE);

  // Spinner should be hidden from screen readers (decorative)
  assert.ok(
    html.includes('aria-hidden="true"'),
    'Spinner should have aria-hidden="true"'
  );
  assert.ok(
    html.includes('<div class="spinner" aria-hidden="true">'),
    'aria-hidden should be on the spinner div'
  );

  // Loading text should have role=status for screen reader announcement
  assert.ok(
    html.includes('role="status"'),
    'Loading text should have role="status"'
  );
  assert.ok(
    html.includes('<p role="status">Loading documentation...</p>'),
    'role="status" should be on the loading paragraph'
  );

  console.log('  buildLoadingHtml (accessibility) passed!');
}

// ============================================================================
// Error HTML Tests: buildErrorHtml()
// ============================================================================

/**
 * Test network error message
 */
function testBuildErrorHtmlNetwork(): void {
  console.log('Testing buildErrorHtml (network)...');

  const html = buildErrorHtml(TEST_CSP_SOURCE, 'network', TEST_NONCE);

  assert.ok(html.includes('<h1>Network Error</h1>'), 'Should show Network Error title');
  assert.ok(
    html.includes('check your internet connection'),
    'Should show network error guidance'
  );
  assert.ok(html.includes('View on GitHub'), 'Should have GitHub fallback link');
  assert.ok(html.includes('var(--vscode-errorForeground)'), 'Title should use error color');

  console.log('  buildErrorHtml (network) passed!');
}

/**
 * Test not found error message
 */
function testBuildErrorHtmlNotFound(): void {
  console.log('Testing buildErrorHtml (notfound)...');

  const html = buildErrorHtml(TEST_CSP_SOURCE, 'notfound', TEST_NONCE);

  assert.ok(html.includes('<h1>Document Not Found</h1>'), 'Should show Not Found title');
  assert.ok(
    html.includes('not available'),
    'Should indicate document unavailability'
  );

  console.log('  buildErrorHtml (notfound) passed!');
}

/**
 * Test server error message
 */
function testBuildErrorHtmlServer(): void {
  console.log('Testing buildErrorHtml (server)...');

  const html = buildErrorHtml(TEST_CSP_SOURCE, 'server', TEST_NONCE);

  assert.ok(html.includes('<h1>Server Error</h1>'), 'Should show Server Error title');
  assert.ok(
    html.includes('currently unavailable'),
    'Should indicate server unavailability'
  );

  console.log('  buildErrorHtml (server) passed!');
}

// ============================================================================
// Lang Attribute Tests
// ============================================================================

/**
 * Test lang attribute presence across all templates (WCAG 2.1 SC 3.1.1)
 */
function testLangAttributes(): void {
  console.log('Testing lang attributes (WCAG 2.1 SC 3.1.1)...');

  // Document HTML uses provided locale
  const docHtml = buildDocumentHtml(
    TEST_CSP_SOURCE, '<p>Content</p>', 'ja', 'docs/README.md', TEST_NONCE, false
  );
  assert.ok(
    docHtml.includes('<html lang="ja">'),
    'Document HTML should use provided locale as lang'
  );

  const docHtmlEn = buildDocumentHtml(
    TEST_CSP_SOURCE, '<p>Content</p>', 'en', 'docs/README.md', TEST_NONCE, false
  );
  assert.ok(
    docHtmlEn.includes('<html lang="en">'),
    'Document HTML should reflect en locale'
  );

  // Loading HTML has fixed lang="en" (UI text is English)
  const loadingHtml = buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE);
  assert.ok(
    loadingHtml.includes('<html lang="en">'),
    'Loading HTML should have lang="en"'
  );

  // Error HTML has fixed lang="en" (error messages are English)
  const errorHtml = buildErrorHtml(TEST_CSP_SOURCE, 'network', TEST_NONCE);
  assert.ok(
    errorHtml.includes('<html lang="en">'),
    'Error HTML should have lang="en"'
  );

  // All three should NOT have bare <html> without lang
  assert.ok(
    !docHtml.includes('<html>'),
    'Document HTML should not have bare html tag'
  );
  assert.ok(
    !loadingHtml.includes('<html>'),
    'Loading HTML should not have bare html tag'
  );
  assert.ok(
    !errorHtml.includes('<html>'),
    'Error HTML should not have bare html tag'
  );

  console.log('  lang attributes passed!');
}

// ============================================================================
// Test Runner
// ============================================================================

/**
 * Run all HTML template tests
 */
export function runHtmlTemplatesTests(): void {
  console.log('\n========================================');
  console.log('   HTML Templates Module Unit Tests     ');
  console.log('========================================\n');

  try {
    // CSP Tests
    console.log('--- CSP Tests ---');
    testBuildCspString();
    testBuildCspStringNonceVariation();

    // Shared Styles Tests
    console.log('\n--- Shared Styles Tests ---');
    testGetBaseStyles();

    // Document HTML Tests
    console.log('\n--- Document HTML Tests ---');
    testBuildDocumentHtmlStructure();
    testBuildDocumentHtmlNavigation();
    testBuildDocumentHtmlContentEscaping();
    testAllTemplatesCssQuality();

    // Loading HTML Tests
    console.log('\n--- Loading HTML Tests ---');
    testBuildLoadingHtmlStructure();
    testBuildLoadingHtmlAccessibility();

    // Error HTML Tests
    console.log('\n--- Error HTML Tests ---');
    testBuildErrorHtmlNetwork();
    testBuildErrorHtmlNotFound();
    testBuildErrorHtmlServer();

    // Lang Attribute Tests
    console.log('\n--- Lang Attribute Tests ---');
    testLangAttributes();

    console.log('\n========================================');
    console.log('   All HTML template tests passed!     ');
    console.log('========================================\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n Test failed:', errorMessage);
    throw error;
  }
}

// Run tests when executed directly
if (require.main === module) {
  runHtmlTemplatesTests();
}
