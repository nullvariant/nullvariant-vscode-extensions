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
  CspValidationError,
  getBaseStyles,
  buildDocumentHtml,
  buildLoadingHtml,
  buildErrorHtml,
} from '../ui/htmlTemplates';

// ============================================================================
// Test Constants
// ============================================================================

const TEST_CSP_SOURCE = 'https://test.vscode-resource.vscode-cdn.net';
// 24 chars = base64 of 16 random bytes (what generateNonce() actually produces).
// Shorter values are rejected by NONCE_PATTERN's ≥22-char minimum.
const TEST_NONCE = 'dGVzdC1ub25jZS0xMjM0NTY=';

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

  // style-src must be nonce-only — cspSource removed to close
  // the `<link rel="stylesheet" href="${cspSource}/…">` bypass.
  assert.ok(
    csp.includes(`style-src 'nonce-${TEST_NONCE}'`),
    'CSP should include nonce in style-src'
  );
  assert.ok(
    !csp.includes(`style-src ${TEST_CSP_SOURCE}`),
    'style-src must not include cspSource'
  );
  assert.ok(
    csp.includes(`script-src 'nonce-${TEST_NONCE}'`),
    'CSP should include nonce in script-src'
  );

  // Defense-in-depth directives not covered by default-src 'none'.
  assert.ok(csp.includes("base-uri 'none'"), 'CSP should have base-uri none');
  assert.ok(csp.includes("form-action 'none'"), 'CSP should have form-action none');
  assert.ok(
    csp.includes("frame-ancestors 'none'"),
    'CSP should have frame-ancestors none'
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

  // Two distinct 24-char base64 nonces (≥22 chars required by NONCE_PATTERN).
  const nonce1 = 'abcdefghijklmnopqrstuvw=';
  const nonce2 = 'ABCDEFGHIJKLMNOPQRSTUVW=';
  const csp1 = buildCspString(TEST_CSP_SOURCE, nonce1);
  const csp2 = buildCspString(TEST_CSP_SOURCE, nonce2);

  assert.notStrictEqual(csp1, csp2, 'Different nonces should produce different CSP');

  // Each should contain its own nonce (without double nonce- prefix)
  assert.ok(csp1.includes(`'nonce-${nonce1}'`), 'CSP1 should contain its nonce');
  assert.ok(csp2.includes(`'nonce-${nonce2}'`), 'CSP2 should contain its nonce');
  assert.ok(!csp1.includes('nonce-nonce-'), 'Should not have double nonce- prefix');

  console.log('  buildCspString (nonce variation) passed!');
}

/**
 * Test CSP input validation — nonce / cspSource format hardening.
 *
 * Attribute breakout via malformed nonce/cspSource must be rejected
 * fail-closed. Checks the full set of dangerous characters that could
 * terminate the `content="…"` attribute or start a new directive.
 */
function testBuildCspStringValidation(): void {
  console.log('Testing buildCspString (input validation)...');

  // Error message assertions use anchored regexes that match the exact
  // "buildCspString: nonce " / "buildCspString: cspSource " prefix so a
  // future rewording that conflates the two parameters is caught.
  // The `CspValidationError:` prefix (Issue-00236) lets renderWithFallback
  // narrow its catch via `instanceof` instead of swallowing every throw.
  const NONCE_ERR = /^CspValidationError: buildCspString: nonce /;
  const SOURCE_ERR = /^CspValidationError: buildCspString: cspSource /;

  // Nonce breakout and boundary payloads.
  // Covers attribute breakout (quote/angle), directive injection (semicolon),
  // control-character / whitespace smuggling (newline, tab, NBSP, null byte),
  // non-ASCII and length-floor violations (short nonce passes character
  // class but is below the 22-char entropy minimum).
  const badNonces = [
    `${TEST_NONCE}' ; script-src *`,   // quote + directive injection
    `${TEST_NONCE}"`,                   // double quote
    `${TEST_NONCE} `,                   // trailing whitespace
    `${TEST_NONCE};`,                   // semicolon
    `${TEST_NONCE}<script>`,            // angle bracket
    `${TEST_NONCE}\n; script-src *`,    // newline (CRLF-like smuggling)
    `${TEST_NONCE}\t`,                  // tab
    `${TEST_NONCE}\u00A0`,              // non-breaking space (Unicode)
    `${TEST_NONCE}\0`,                  // null byte
    '日本語テスト字列xxxxxxxxx',            // non-ASCII (also ≥22 chars)
    'tooShort',                         // character class OK but <22 chars
    '',                                 // empty
  ];
  for (const bad of badNonces) {
    assert.throws(
      () => buildCspString(TEST_CSP_SOURCE, bad),
      NONCE_ERR,
      `Malformed nonce should throw: ${JSON.stringify(bad)}`
    );
  }

  // cspSource breakout payloads
  const badSources = [
    `${TEST_CSP_SOURCE}' ; script-src *`,
    `${TEST_CSP_SOURCE} https://evil.example`,  // whitespace → extra source
    `${TEST_CSP_SOURCE};`,
    `${TEST_CSP_SOURCE}"`,
    `${TEST_CSP_SOURCE}\n`,                      // newline
    'no-scheme',                                 // missing scheme
    '',
  ];
  for (const bad of badSources) {
    assert.throws(
      () => buildCspString(bad, TEST_NONCE),
      SOURCE_ERR,
      `Malformed cspSource should throw: ${JSON.stringify(bad)}`
    );
  }

  // Valid shapes must continue to pass (regression guard).
  // Covers: percent-encoded resource URI, vscode-webview scheme, wildcard host,
  // and port number — all shapes VS Code may legitimately hand us.
  const validSources = [
    'https://file%2B.vscode-resource.vscode-cdn.net',
    'vscode-webview://abc-123',
    'https://*.vscode-cdn.net',
    'https://example.com:8080',
  ];
  for (const good of validSources) {
    assert.doesNotThrow(
      () => buildCspString(good, TEST_NONCE),
      `Valid cspSource must be accepted: ${good}`
    );
  }

  // Issue-00236 scrub contract: the CspValidationError message MUST be
  // static — it must not interpolate any caller-supplied nonce/cspSource
  // substring. renderWithFallback logs `error.message` verbatim, so any
  // future "helpful" error builder that echoes raw input would silently
  // leak attacker-chosen bytes into extension logs. Lock the contract
  // here (at the throw site) rather than at the log site.
  const SCRUB_SENTINEL = 'LEAK_SENTINEL_ZZZ';
  try {
    buildCspString(TEST_CSP_SOURCE, `${SCRUB_SENTINEL}' ; x`);
    assert.fail('expected throw');
  } catch (error) {
    assert.ok(error instanceof CspValidationError);
    assert.ok(
      !error.message.includes(SCRUB_SENTINEL),
      'buildCspString error must not echo raw nonce input'
    );
  }
  try {
    buildCspString(`https://${SCRUB_SENTINEL}' ; x`, TEST_NONCE);
    assert.fail('expected throw');
  } catch (error) {
    assert.ok(error instanceof CspValidationError);
    assert.ok(
      !error.message.includes(SCRUB_SENTINEL),
      'buildCspString error must not echo raw cspSource input'
    );
  }

  // Issue-00236: thrown error must be a `CspValidationError` instance so
  // `renderWithFallback` can narrow its catch. A plain `Error` would still
  // match the regex above but break the instanceof guard silently.
  assert.throws(
    () => buildCspString(TEST_CSP_SOURCE, ''),
    (err: unknown) => err instanceof CspValidationError,
    'nonce validation must throw CspValidationError'
  );
  assert.throws(
    () => buildCspString('no-scheme', TEST_NONCE),
    (err: unknown) => err instanceof CspValidationError,
    'cspSource validation must throw CspValidationError'
  );

  console.log('  buildCspString (input validation) passed!');
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
// Cross-Template Invariants: shell skeleton equality (Issue-00190)
// ============================================================================

/**
 * Strip template-specific content (lang, CSP, title, styles, body class,
 * body inner HTML) from a rendered template so only the shared shell
 * skeleton — DOCTYPE, html/head/body tag layout, meta tags, their order —
 * remains. Used to prove all three templates emit a byte-identical shell
 * after buildHtmlShell() extraction (Issue-00186).
 */
function extractShell(html: string): string {
  return html
    .replace(/lang="[^"]*"/, 'lang="__LANG__"')
    .replace(/content="default-src[^"]*"/, 'content="__CSP__"')
    .replace(/<title>[^<]*<\/title>/, '<title>__TITLE__</title>')
    .replace(
      /<style nonce="[^"]*">[\s\S]*?<\/style>/,
      '<style nonce="__NONCE__">__STYLES__</style>'
    )
    // Mask only the class attribute value (so additions of non-class body
    // attributes surface as shell differences), then non-greedily strip
    // body inner HTML. Non-greedy `*?` prevents runaway matching if a
    // template ever embeds the literal `</body>` in its content.
    .replace(/<body class="[^"]*">/, '<body class="__BODY_CLASS__">')
    .replace(
      /<body class="__BODY_CLASS__">[\s\S]*?<\/body>/,
      '<body class="__BODY_CLASS__">__BODY__</body>'
    );
}

/**
 * All three templates must share a byte-identical shell skeleton.
 *
 * Regression guard for Issue-00186 (buildHtmlShell extraction): if any
 * future change adds a meta tag, reorders head children, or drops the
 * viewport meta from just one template, this assertion fails immediately
 * instead of silently diverging across templates.
 */
function testShellSkeletonIsShared(): void {
  console.log('Testing shell skeleton invariance across templates...');

  const docShell = extractShell(
    buildDocumentHtml(
      TEST_CSP_SOURCE, '<p>Content</p>', 'en', 'docs/README.md', TEST_NONCE, false
    )
  );
  const loadingShell = extractShell(buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE));
  const errorShell = extractShell(buildErrorHtml(TEST_CSP_SOURCE, 'network', TEST_NONCE));

  assert.strictEqual(
    loadingShell, docShell,
    'Loading shell skeleton must match document shell skeleton'
  );
  assert.strictEqual(
    errorShell, docShell,
    'Error shell skeleton must match document shell skeleton'
  );

  // Positive check — the stripped shell must still contain the shared
  // skeleton markers; otherwise extractShell masked too aggressively and
  // equality would be trivially true.
  for (const shell of [docShell, loadingShell, errorShell]) {
    assert.ok(shell.includes('<!DOCTYPE html>'), 'Shell should retain DOCTYPE');
    assert.ok(shell.includes('<meta charset="UTF-8">'), 'Shell should retain charset meta');
    assert.ok(
      shell.includes('<meta name="viewport"'),
      'Shell should retain viewport meta'
    );
    assert.ok(
      shell.includes('http-equiv="Content-Security-Policy"'),
      'Shell should retain CSP meta'
    );
  }

  console.log('  shell skeleton invariance passed!');
}

/**
 * Body class-based override invariant (Issue-00189).
 *
 * Each template must declare its body layout under a `body.gis-*` class
 * selector, not a bare `body { … }` override. The base body rule in
 * getBaseStyles() remains unscoped, so class-based selectors win on
 * specificity regardless of style-block order.
 */
function testBodyClassOverrides(): void {
  console.log('Testing body class overrides (Issue-00189)...');

  const cases: ReadonlyArray<readonly [string, string, () => string]> = [
    ['document', 'gis-doc', (): string => buildDocumentHtml(
      TEST_CSP_SOURCE, '<p>Content</p>', 'en', 'docs/README.md', TEST_NONCE, false
    )],
    ['loading', 'gis-loading', (): string => buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE)],
    ['error', 'gis-error', (): string => buildErrorHtml(TEST_CSP_SOURCE, 'network', TEST_NONCE)],
  ];

  for (const [name, cls, build] of cases) {
    const html = build();
    assert.ok(
      html.includes(`<body class="${cls}">`),
      `${name}: <body> must carry class="${cls}"`
    );
    // Guard: no bare `<body>` without class.
    assert.ok(
      !/<body>\s/.test(html),
      `${name}: must not emit a bare <body> without class`
    );
  }

  // Document & error templates must scope their overrides via the class
  // selector. Loading has no body override, only the base rule.
  const docHtml = buildDocumentHtml(
    TEST_CSP_SOURCE, '<p>Content</p>', 'en', 'docs/README.md', TEST_NONCE, false
  );
  assert.match(
    docHtml, /body\.gis-doc\s*\{/,
    'Document template must scope override under body.gis-doc'
  );
  const errorHtml = buildErrorHtml(TEST_CSP_SOURCE, 'network', TEST_NONCE);
  assert.match(
    errorHtml, /body\.gis-error\s*\{/,
    'Error template must scope override under body.gis-error'
  );

  console.log('  body class overrides passed!');
}

/**
 * Design token coverage (Issue-00192).
 *
 * Verify magic numbers previously scattered across templates are now
 * token references. Presence of the tokens in :root is a necessary
 * condition; the negative check ensures literal `1px solid var(--vscode-panel-border)`
 * no longer recurs (SSOT enforcement for core-values #4).
 */
function testDesignTokenCoverage(): void {
  console.log('Testing design token coverage (Issue-00192)...');

  const styles = getBaseStyles();
  // Values matter: tokens form the SSOT contract, not just the names.
  // `--gis-space-xs: 999em` would pass a name-only check and silently
  // break every consumer.
  const tokenSpec: ReadonlyArray<readonly [string, RegExp]> = [
    ['--gis-border-subtle', /--gis-border-subtle:\s*1px solid var\(--vscode-panel-border\)/],
    ['--gis-space-xs', /--gis-space-xs:\s*0\.3em\b/],
    ['--gis-space-sm', /--gis-space-sm:\s*0\.5em\b/],
    ['--gis-space-md', /--gis-space-md:\s*1em\b/],
    ['--gis-space-lg', /--gis-space-lg:\s*1\.5em\b/],
    ['--gis-space-xl', /--gis-space-xl:\s*2em\b/],
    ['--gis-pad-btn', /--gis-pad-btn:\s*4px 12px\b/],
    ['--gis-pad-body', /--gis-pad-body:\s*20px\b/],
    ['--gis-pad-body-lg', /--gis-pad-body-lg:\s*40px\b/],
    ['--gis-font-sm', /--gis-font-sm:\s*0\.9em\b/],
    ['--gis-font-xs', /--gis-font-xs:\s*0\.8em\b/],
  ];
  for (const [name, re] of tokenSpec) {
    assert.match(styles, re, `${name} value contract violated`);
  }

  // The literal `1px solid var(--vscode-panel-border)` must exist exactly
  // ONCE per template — inside the --gis-border-subtle token definition
  // — and nowhere else. Checked across all three templates because
  // getBaseStyles() is inlined into each, and SSOT enforcement must hold
  // uniformly.
  const literalPattern = /1px solid var\(--vscode-panel-border\)/g;
  const allTemplates: ReadonlyArray<readonly [string, string]> = [
    ['document', buildDocumentHtml(
      TEST_CSP_SOURCE, '<p>Content</p>', 'en', 'docs/README.md', TEST_NONCE, false
    )],
    ['loading', buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE)],
    ['error', buildErrorHtml(TEST_CSP_SOURCE, 'network', TEST_NONCE)],
  ];
  for (const [name, html] of allTemplates) {
    const matches = html.match(literalPattern) ?? [];
    assert.strictEqual(
      matches.length, 1,
      `${name}: literal "1px solid var(--vscode-panel-border)" must appear exactly once (in token definition), found ${matches.length}`
    );
  }
  // Only the document template actually consumes --gis-border-subtle
  // (loading/error have no panel-border rules). Asserted separately to
  // confirm the token is wired up, not merely defined.
  const docHtml = allTemplates[0][1];
  assert.ok(
    docHtml.includes('var(--gis-border-subtle)'),
    'Document template must reference --gis-border-subtle'
  );

  console.log('  design token coverage passed!');
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

  // Issue-00186: every template must declare a <title> inside <head> so
  // tabs / screen readers / browser history have a discoverable label.
  // Regression guard: before this Issue, loading/error had no <title>.
  const requireTitleInHead = (html: string, expected: string, name: string): void => {
    const head = /<head>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? '';
    assert.ok(
      head.includes(`<title>${expected}</title>`),
      `${name}: <title>${expected}</title> must live inside <head>`
    );
    const titleCount = (html.match(/<title>/g) ?? []).length;
    assert.strictEqual(titleCount, 1, `${name}: exactly one <title> per document`);
  };

  requireTitleInHead(docHtml, 'Git ID Switcher Documentation', 'document');
  requireTitleInHead(loadingHtml, 'Loading — Git ID Switcher', 'loading');
  requireTitleInHead(errorHtml, 'Network Error — Git ID Switcher', 'error(network)');
  // errorType must be reflected in the title dynamically.
  requireTitleInHead(
    buildErrorHtml(TEST_CSP_SOURCE, 'notfound', TEST_NONCE),
    'Document Not Found — Git ID Switcher',
    'error(notfound)'
  );
  requireTitleInHead(
    buildErrorHtml(TEST_CSP_SOURCE, 'server', TEST_NONCE),
    'Server Error — Git ID Switcher',
    'error(server)'
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
    testBuildCspStringValidation();

    // Shared Styles Tests
    console.log('\n--- Shared Styles Tests ---');
    testGetBaseStyles();

    // Document HTML Tests
    console.log('\n--- Document HTML Tests ---');
    testBuildDocumentHtmlStructure();
    testBuildDocumentHtmlNavigation();
    testBuildDocumentHtmlContentEscaping();
    testAllTemplatesCssQuality();

    // Cross-Template Invariants
    console.log('\n--- Cross-Template Invariants ---');
    testShellSkeletonIsShared();
    testBodyClassOverrides();
    testDesignTokenCoverage();

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
