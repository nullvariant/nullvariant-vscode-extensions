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
 * ## Link Intercept Tests (Issue-00195) - 3 test functions:
 * 13. testIsHrefAllowed - href scheme allowlist validation
 * 14. testAllowedHrefSchemes - Allowlist constant pinning
 * 15. testBuildLinkInterceptScript - Script structure and security guards
 *
 * Total: 15 test functions
 * Coverage: buildCspString, getBaseStyles, buildDocumentHtml,
 *           buildLoadingHtml, buildErrorHtml, isHrefAllowed,
 *           buildLinkInterceptScript, ALLOWED_HREF_SCHEMES
 */

import * as assert from 'node:assert';
import {
  type BodyClass,
  type ErrorType,
  type SanitizedHtml,
  ALLOWED_HREF_SCHEMES,
  assertValidLang,
  assertValidNonce,
  buildCspString,
  buildHtmlShell,
  buildLinkInterceptScript,
  CspValidationError,
  getBaseStyles,
  buildDocumentHtml,
  buildLoadingHtml,
  buildErrorHtml,
  isHrefAllowed,
} from '../ui/htmlTemplates';

/**
 * Test-only brand lift. Production code MUST obtain `SanitizedHtml` exclusively
 * through `renderMarkdown` (see documentationInternal.ts), which is the single
 * sanctioned origin of the brand. Tests bypass the sanitizer because they
 * exercise `buildDocumentHtml`'s structural contract (shell, nav, escaping),
 * not the sanitizer's correctness — `renderMarkdown` has its own dedicated
 * test suite in documentation.test.ts.
 */
const asSanitizedHtml = (s: string): SanitizedHtml => s as SanitizedHtml;

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

  // img-src: extract the directive to scope assertions precisely.
  const imgSrc = csp.split('; ').find(d => d.startsWith('img-src')) ?? '';
  assert.ok(
    imgSrc.includes(`img-src ${TEST_CSP_SOURCE}`),
    'img-src should include cspSource'
  );
  assert.ok(
    imgSrc.includes('https://assets.nullvariant.com'),
    'img-src should include CDN'
  );
  assert.ok(
    imgSrc.includes('https://img.shields.io'),
    'img-src should include shields.io'
  );
  assert.ok(
    imgSrc.includes('https://avatars.githubusercontent.com'),
    'img-src should include avatars.githubusercontent.com'
  );

  // img-src absence checks — wildcard *.githubusercontent.com must not
  // appear; only the avatars subdomain is needed. raw.githubusercontent.com
  // would allow loading arbitrary files from attacker-controlled
  // repositories (Issue-00196).
  assert.ok(
    !imgSrc.includes('*.githubusercontent.com'),
    'img-src must not contain wildcard *.githubusercontent.com'
  );
  assert.ok(
    !imgSrc.includes('raw.githubusercontent.com'),
    'img-src must not include raw.githubusercontent.com'
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
  // The `CspValidationError:` prefix lets renderWithFallback
  // narrow its catch via `instanceof` instead of swallowing every throw.
  // Nonce validation was de-duplicated into assertValidNonce (
  // SSOT consolidation), so the error prefix is `assertValidNonce:` rather
  // than `buildCspString:`. Thescrub invariant (static message,
  // no attacker bytes) and the `instanceof CspValidationError` narrowing
  // used by renderWithFallback remain unchanged.
  const NONCE_ERR = /^CspValidationError: assertValidNonce: nonce /;
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

  //scrub contract: the CspValidationError message MUST be
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

  // : thrown error must be a `CspValidationError` instance so
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

  // Should define design tokens for border-radius
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
 * Test CSS/a11y quality fixes from .
 *
 * Applies to ALL templates (document/loading/error) so the SSOT
 * guarantees cannot regress in one template while passing in another.
 */
function testAllTemplatesCssQuality(): void {
  console.log('Testing all templates (CSS/a11y quality — )...');

  const templates: ReadonlyArray<readonly [string, () => string]> = [
    ['document', (): string => buildDocumentHtml(
      TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, false
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
    TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, false
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
// Cross-Template Invariants: shell skeleton equality
// ============================================================================

/**
 * Strip template-specific content (lang, CSP, title, styles, body class,
 * body inner HTML) from a rendered template so only the shared shell
 * skeleton — DOCTYPE, html/head/body tag layout, meta tags, their order —
 * remains. Used to prove all three templates emit a byte-identical shell
 * after buildHtmlShell() extraction.
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
 * Regression guard for(buildHtmlShell extraction): if any
 * future change adds a meta tag, reorders head children, or drops the
 * viewport meta from just one template, this assertion fails immediately
 * instead of silently diverging across templates.
 */
function testShellSkeletonIsShared(): void {
  console.log('Testing shell skeleton invariance across templates...');

  const docShell = extractShell(
    buildDocumentHtml(
      TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, false
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
 * Body class-based override invariant.
 *
 * Each template must declare its body layout under a `body.gis-*` class
 * selector, not a bare `body { … }` override. The base body rule in
 * getBaseStyles() remains unscoped, so class-based selectors win on
 * specificity regardless of style-block order.
 */
function testBodyClassOverrides(): void {
  console.log('Testing body class overrides...');

  const cases: ReadonlyArray<readonly [string, string, () => string]> = [
    ['document', 'gis-doc', (): string => buildDocumentHtml(
      TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, false
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

  // All three templates must scope their overrides via the class selector.
  // Loading's <p> override was bare (`p { margin-top: ... }`) prior to
  //and has since been pinned under `body.gis-loading p` to stay
  // symmetric with document/error; asserting it here prevents the scoping
  // from silently regressing to a bare element selector again.
  const docHtml = buildDocumentHtml(
    TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, false
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
  const loadingHtml = buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE);
  assert.match(
    loadingHtml, /body\.gis-loading\s+p\s*\{/,
    'Loading template must scope <p> override under body.gis-loading'
  );
  // Negative guard: within the loading <style> block, no bare `p {` selector
  // may remain. Slice between the style tags so the assertion ignores any
  // future <p> in the body markup itself.
  const styleOpen = loadingHtml.indexOf('<style');
  const styleClose = loadingHtml.indexOf('</style>', styleOpen);
  const loadingStyleBlock = loadingHtml.slice(styleOpen, styleClose);
  assert.ok(
    !/(^|\n)\s*p\s*\{/.test(loadingStyleBlock),
    'Loading style block must not contain a bare `p {` selector'
  );

  console.log('  body class overrides passed!');
}

/**
 * Design token coverage.
 *
 * Verify magic numbers previously scattered across templates are now
 * token references. Presence of the tokens in :root is a necessary
 * condition; the negative check ensures literal `1px solid var(--vscode-panel-border)`
 * no longer recurs (SSOT enforcement for core-values #4).
 */
function testDesignTokenCoverage(): void {
  console.log('Testing design token coverage...');

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
    ['--gis-size-btn', /--gis-size-btn:\s*4px 12px\b/],
    ['--gis-size-body', /--gis-size-body:\s*20px\b/],
    ['--gis-size-body-lg', /--gis-size-body-lg:\s*40px\b/],
    ['--gis-font-sm', /--gis-font-sm:\s*0\.9em\b/],
    ['--gis-font-xs', /--gis-font-xs:\s*0\.8em\b/],
    ['--gis-width-readable', /--gis-width-readable:\s*800px\b/],
    ['--gis-line-height-doc', /--gis-line-height-doc:\s*1\.6\b/],
    ['--gis-border-emphasis', /--gis-border-emphasis:\s*4px solid var\(--vscode-textLink-foreground\)/],
    ['--gis-pad-code', /--gis-pad-code:\s*0\.2em 0\.4em\b/],
    ['--gis-spinner-size', /--gis-spinner-size:\s*40px\b/],
    ['--gis-spinner-border', /--gis-spinner-border:\s*3px\b/],
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
      TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, false
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
  // The literal `4px solid var(--vscode-textLink-foreground)` must appear
  // exactly once per template — inside the --gis-border-emphasis token
  // definition. Same SSOT enforcement as above.
  const emphasisPattern = /4px solid var\(--vscode-textLink-foreground\)/g;
  for (const [name, html] of allTemplates) {
    const matches = html.match(emphasisPattern) ?? [];
    assert.strictEqual(
      matches.length, 1,
      `${name}: literal "4px solid var(--vscode-textLink-foreground)" must appear exactly once (in token definition), found ${matches.length}`
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
    asSanitizedHtml('<p>Test content</p>'),
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
    TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'ja', 'docs/test.md', TEST_NONCE, true
  );
  assert.ok(
    htmlWithBack.includes('<nav class="nav-bar" aria-label="Document navigation">'),
    'Should use nav element with aria-label'
  );

  // Back button enabled: aria-disabled="false" (not the [disabled] attribute),
  // so Safari/VoiceOver keep it in focus order.
  assert.ok(
    htmlWithBack.includes('aria-disabled="false"'),
    'Back button should have aria-disabled="false" when canGoBack is true'
  );
  assert.ok(
    !/<button id="back-btn"[^>]*\sdisabled(>|\s)/.test(htmlWithBack),
    'Back button must NOT use the native [disabled] attribute'
  );

  // Back button disabled when canGoBack=false — aria-disabled="true"
  const htmlNoBack = buildDocumentHtml(
    TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/test.md', TEST_NONCE, false
  );
  assert.ok(
    htmlNoBack.includes('aria-disabled="true"'),
    'Back button should have aria-disabled="true" when canGoBack is false'
  );
  assert.ok(
    !/<button id="back-btn"[^>]*\sdisabled(>|\s)/.test(htmlNoBack),
    'Back button must NOT use the native [disabled] attribute when disabled'
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

  // : XSS payloads in `locale` no longer rely on downstream
  // escaping — they are rejected fail-closed at the shell boundary via
  // assertValidLang. This is strictly stronger than escaping because the
  // error surfaces immediately instead of depending on the escaper staying
  // correct forever.
  assert.throws(
    () =>
      buildDocumentHtml(
        TEST_CSP_SOURCE,
        asSanitizedHtml('<p>Safe content</p>'),
        '"><script>alert(1)</script>',
        'docs/README.md',
        TEST_NONCE,
        false
      ),
    (err: unknown) => err instanceof CspValidationError,
    'Locale XSS payload must throw CspValidationError at the shell boundary'
  );

  // Path still flows through escapeHtmlEntities (it is markdown-derived
  // free text, not an allowlisted attribute) so the escape contract on
  // that field must keep working.
  const html = buildDocumentHtml(
    TEST_CSP_SOURCE,
    asSanitizedHtml('<p>Safe content</p>'),
    'en',
    'docs/<script>alert(2)</script>.md',
    TEST_NONCE,
    false
  );
  assert.ok(
    html.includes('&lt;script&gt;alert(2)&lt;/script&gt;'),
    'Script tags in path should be HTML-escaped'
  );

  console.log('  buildDocumentHtml (escaping) passed!');
}

/**
 * : defense-in-depth validation of nonce / lang at the
 * buildHtmlShell boundary via the exported assertValid* helpers.
 *
 * Covered:
 *  - assertValidNonce rejects the same breakout payloads as buildCspString
 *    (quote, angle bracket, semicolon, whitespace, length floor)
 *  - assertValidLang rejects XSS payloads and accepts every entry in
 *    SUPPORTED_LOCALES (including `x-*` private-use tags)
 *  - assertValidLang's errors are scrubbed (no attacker bytes in message)
 *  - buildDocumentHtml propagates nonce rejection to the shell boundary
 *  - buildLoadingHtml / buildErrorHtml also validate nonce at the shell
 */
function testShellInputValidation(): void {
  console.log('Testing buildHtmlShell input validation...');

  // --- assertValidNonce ---
  const badNonces = [
    `${TEST_NONCE}"`,
    `${TEST_NONCE}>`,
    `${TEST_NONCE}<script>`,
    `${TEST_NONCE} `,
    `${TEST_NONCE};`,
    `${TEST_NONCE}\n`,
    `${TEST_NONCE}\r`,              // CR
    `${TEST_NONCE}\t`,              // tab
    `${TEST_NONCE}\u00A0`,          // NBSP
    `${TEST_NONCE}\u2028`,          // line separator (JS-specific hazard)
    `${TEST_NONCE}\u0000`,          // NUL
    'tooShort',
    '',
  ];
  for (const bad of badNonces) {
    assert.throws(
      () => assertValidNonce(bad),
      (err: unknown) => err instanceof CspValidationError,
      `assertValidNonce must reject: ${JSON.stringify(bad)}`
    );
  }
  assert.doesNotThrow(
    () => assertValidNonce(TEST_NONCE),
    'assertValidNonce must accept a valid 24-char base64 nonce'
  );

  // --- assertValidLang happy path ---
  // Every entry in the extension's SUPPORTED_LOCALES must pass. Hardcoded
  // rather than imported so a future accidental narrowing of LANG_PATTERN
  // that silently drops `x-*` tags is caught here even if the import path
  // changes.
  const validLangs = [
    'en', 'ja', 'zh-CN', 'zh-TW', 'ko', 'de', 'fr', 'es', 'it', 'pt-BR',
    'ru', 'pl', 'tr', 'uk', 'cs', 'hu', 'bg',
    'ain', 'ryu', 'haw', 'eo', 'tlh', 'tok',
    'x-pirate', 'x-shakespeare', 'x-lolcat',
  ];
  for (const good of validLangs) {
    assert.doesNotThrow(
      () => assertValidLang(good),
      `assertValidLang must accept SUPPORTED_LOCALES entry: ${good}`
    );
  }

  // --- assertValidLang rejection ---
  const badLangs = [
    '"><script>alert(1)</script>',
    'en"',
    'en>',
    'en ',
    'en;',
    'en\n',
    'a',                 // 1-char primary subtag (not x-*)
    'toolong',           // 7-char primary subtag
    'en-',               // trailing hyphen
    'en--US',            // empty subtag between hyphens
    '',                  // empty (coerce happens in shell, not here)
    'x',                 // bare x without private-use subtag
    'x-',                // trailing hyphen after x
    'en\u0000',          // NUL smuggling
    'en\u00A0',          // NBSP
    'en\r\n',            // CRLF
    'en\u2028',          // line separator
  ];
  for (const bad of badLangs) {
    assert.throws(
      () => assertValidLang(bad),
      (err: unknown) => err instanceof CspValidationError,
      `assertValidLang must reject: ${JSON.stringify(bad)}`
    );
  }

  // --- scrub contract: message must not echo attacker bytes ---
  const SCRUB_SENTINEL = 'LEAK_SENTINEL_LANG_ZZZ';
  try {
    assertValidLang(`"><script>${SCRUB_SENTINEL}`);
    assert.fail('expected throw');
  } catch (error) {
    assert.ok(error instanceof CspValidationError);
    assert.ok(
      !error.message.includes(SCRUB_SENTINEL),
      'assertValidLang error must not echo raw lang input'
    );
  }

  // --- buildDocumentHtml propagates nonce rejection ---
  assert.throws(
    () =>
      buildDocumentHtml(
        TEST_CSP_SOURCE,
        asSanitizedHtml('<p>x</p>'),
        'en',
        'docs/README.md',
        `${TEST_NONCE}"><script>`,
        false
      ),
    (err: unknown) => err instanceof CspValidationError,
    'buildDocumentHtml must reject nonce breakout at the shell boundary'
  );

  // --- buildLoadingHtml / buildErrorHtml also validate nonce ---
  assert.throws(
    () => buildLoadingHtml(TEST_CSP_SOURCE, 'short'),
    (err: unknown) => err instanceof CspValidationError,
    'buildLoadingHtml must reject malformed nonce'
  );
  assert.throws(
    () => buildErrorHtml(TEST_CSP_SOURCE, 'network', 'short'),
    (err: unknown) => err instanceof CspValidationError,
    'buildErrorHtml must reject malformed nonce'
  );

  // --- empty lang is coerced to 'en' inside the shell ---
  // Passed through buildDocumentHtml to exercise the shell path, not the
  // raw assertValidLang (which stays fail-closed on empty).
  const coercedHtml = buildDocumentHtml(
    TEST_CSP_SOURCE,
    asSanitizedHtml('<p>x</p>'),
    '',
    'docs/README.md',
    TEST_NONCE,
    false
  );
  assert.ok(
    coercedHtml.includes('<html lang="en">'),
    'Empty locale must be coerced to lang="en" at the shell boundary'
  );

  console.log('  buildHtmlShell input validation passed!');
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
    /<p role="status"[^>]*>Loading documentation\.\.\.<\/p>/.test(html),
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
    TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'ja', 'docs/README.md', TEST_NONCE, false
  );
  assert.ok(
    docHtml.includes('<html lang="ja">'),
    'Document HTML should use provided locale as lang'
  );

  const docHtmlEn = buildDocumentHtml(
    TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, false
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

  // : every template must declare a <title> inside <head> so
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
// : Existing template a11y improvements
// ============================================================================

/**
 * Cover the a11y contract introduced by :
 *  - back-btn uses aria-label="Go back" with ← inside aria-hidden span
 *  - document/error templates wrap body content in <main> landmark
 *  - error template wraps message in div role="alert" (not on <h1>)
 *  - loading status has aria-live="polite" + aria-atomic="true"
 *  - footer GitHub link has descriptive aria-label
 *  - nav-bar current-path carries aria-current="page"
 *  - focus-visible rule is present in document & error styles
 *  - @media (forced-colors: active) overrides zebra + focus outline
 *  - linkInterceptScript handles keydown in addition to click
 */
function testIssue00188A11yImprovements(): void {
  console.log('Testinga11y improvements...');

  const docHtmlCanBack = buildDocumentHtml(
    TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, true
  );
  const docHtmlNoBack = buildDocumentHtml(
    TEST_CSP_SOURCE, asSanitizedHtml('<p>Content</p>'), 'en', 'docs/README.md', TEST_NONCE, false
  );
  const loadingHtml = buildLoadingHtml(TEST_CSP_SOURCE, TEST_NONCE);

  // (2) back-btn: aria-label="Go back" + arrow inside aria-hidden span
  assert.ok(
    docHtmlCanBack.includes('aria-label="Go back"'),
    'back-btn must carry aria-label="Go back"'
  );
  assert.ok(
    /<span aria-hidden="true">←\s*<\/span>/.test(docHtmlCanBack),
    'back-btn decorative arrow must live inside aria-hidden span'
  );

  // (8) aria-disabled both directions (fixed value contract, not a union).
  assert.ok(
    /id="back-btn"[^>]*aria-disabled="false"/.test(docHtmlCanBack),
    'canGoBack=true must emit aria-disabled="false"'
  );
  assert.ok(
    /id="back-btn"[^>]*aria-disabled="true"/.test(docHtmlNoBack),
    'canGoBack=false must emit aria-disabled="true"'
  );
  // Disabled-state style uses color (not opacity) so focus ring contrast
  // is preserved when the button is both focused and disabled.
  assert.ok(
    docHtmlCanBack.includes('.nav-bar button[aria-disabled="true"]'),
    'nav-bar must style disabled state via aria-disabled selector'
  );
  assert.ok(
    !/\.nav-bar button\[aria-disabled="true"\]\s*\{[^}]*opacity:/.test(docHtmlCanBack),
    'disabled back-btn must not use opacity (kills focus ring contrast)'
  );

  // (10) document body wrapped in exactly one <main> landmark.
  assert.strictEqual(
    (docHtmlCanBack.match(/<main[>\s]/g) ?? []).length, 1,
    'document template must contain exactly one <main> landmark'
  );
  assert.ok(
    /<main>\s*\n?\s*<p>Content<\/p>\s*<\/main>/.test(docHtmlCanBack),
    'document <main> must directly wrap the sanitized content'
  );

  // (11) error: all three errorTypes must preserve
  //      <main>…<h1>…<p role="alert">…</main> parametrically.
  //      h1 lives OUTSIDE role="alert" (JAWS heading-list regression guard).
  const errorCases = [
    ['network', 'Network Error'],
    ['notfound', 'Document Not Found'],
    ['server', 'Server Error'],
  ] as const;
  for (const [errorType, title] of errorCases) {
    const errHtml = buildErrorHtml(TEST_CSP_SOURCE, errorType, TEST_NONCE);
    assert.strictEqual(
      (errHtml.match(/<main[>\s]/g) ?? []).length, 1,
      `error(${errorType}): exactly one <main> landmark required`
    );
    assert.ok(
      errHtml.includes(`<h1>${title}</h1>`),
      `error(${errorType}): <h1> must contain the error title`
    );
    // role="alert" is on a <p>, not the <h1> or a wrapping <div>.
    assert.ok(
      /<p role="alert">/.test(errHtml),
      `error(${errorType}): role="alert" must live on a <p> element`
    );
    assert.ok(
      !/<h1[^>]*role="alert"/.test(errHtml),
      `error(${errorType}): <h1> must NOT carry role="alert"`
    );
    assert.ok(
      !/<div role="alert">/.test(errHtml),
      `error(${errorType}): role="alert" must not wrap the heading in a div`
    );
    // Footer GitHub link must carry descriptive aria-label.
    assert.ok(
      errHtml.includes('aria-label="View Git ID Switcher on GitHub"'),
      `error(${errorType}): GitHub link must carry descriptive aria-label`
    );
  }

  // (9) loading status: aria-live + aria-atomic AND status <p> must NOT be
  //     aria-hidden (spinner is hidden, status is announced — the contract
  //     is a two-sided split).
  assert.ok(
    /role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/.test(loadingHtml),
    'loading status must have aria-live="polite" and aria-atomic="true"'
  );
  assert.ok(
    !/<p[^>]*aria-hidden/.test(loadingHtml),
    'loading status <p> must NOT be aria-hidden (it is the announced region)'
  );
  assert.ok(
    /<main class="loading">/.test(loadingHtml),
    'loading template must use <main class="loading"> landmark'
  );

  // (12) document footer GitHub link aria-label
  assert.ok(
    docHtmlCanBack.includes('aria-label="View Git ID Switcher on GitHub"'),
    'document footer GitHub link must carry descriptive aria-label'
  );

  // (13) current-path aria-current="page"
  assert.ok(
    /class="current-path" aria-current="page"/.test(docHtmlCanBack),
    'nav-bar current-path must carry aria-current="page"'
  );

  // (5) :focus-visible — document must bind BOTH a and button into a single
  // SSOT selector (regression guard: if one gets dropped, this fails).
  assert.match(
    docHtmlCanBack,
    /a:focus-visible\s*,\s*\n?\s*button:focus-visible\s*\{[\s\S]*?outline:\s*2px solid var\(--vscode-focusBorder\)/,
    'document template must bind a + button to :focus-visible SSOT rule'
  );
  const errorHtmlNetwork = buildErrorHtml(TEST_CSP_SOURCE, 'network', TEST_NONCE);
  assert.match(
    errorHtmlNetwork, /a:focus-visible\s*\{[\s\S]*?outline:\s*2px solid var\(--vscode-focusBorder\)/,
    'error template must define a:focus-visible outline'
  );

  // (6)(7) forced-colors media query — extract the block body first, then
  //        assert on its inner contents so greedy matches cannot leak across
  //        the `}` boundary into unrelated rules.
  const forcedColorsBlock = (html: string): string => {
    const m = /@media \(forced-colors: active\)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/.exec(html);
    return m?.[1] ?? '';
  };
  const docForced = forcedColorsBlock(docHtmlCanBack);
  assert.ok(docForced.length > 0, 'document template must declare forced-colors media query');
  assert.match(
    docForced, /tr:nth-child\(even\)[\s\S]*?background-color:\s*Canvas/,
    'document forced-colors: nth-child(even) must reset to Canvas'
  );
  assert.match(
    docForced, /\bth\b[\s\S]*?background-color:\s*Canvas/,
    'document forced-colors: th must also reset to Canvas (parity with zebra)'
  );
  assert.match(
    docForced, /outline-color:\s*Highlight/,
    'document forced-colors: focus outline must use Highlight'
  );
  const errorForced = forcedColorsBlock(errorHtmlNetwork);
  assert.match(
    errorForced, /outline-color:\s*Highlight/,
    'error forced-colors: focus outline must use Highlight'
  );

  // (1) Keyboard policy: Space on <a> must NOT be synthesised as
  //     activation (WCAG 3.2.5). Native Enter on <a> and Enter/Space on
  //     <button> flow through the click listener alone.
  assert.ok(
    !docHtmlCanBack.includes("addEventListener('keydown'"),
    'linkInterceptScript must NOT register a keydown listener (Space on <a> is page scroll)'
  );
  // Back button guard: must read aria-disabled, not the [disabled] attribute.
  assert.ok(
    docHtmlCanBack.includes("getAttribute('aria-disabled')"),
    'back-btn handler must guard on aria-disabled state'
  );
  // The back-btn click path must be reached before the generic <a> fallback.
  assert.ok(
    /closest\(['"]#back-btn['"]\)[\s\S]*closest\(['"]a['"]\)/.test(docHtmlCanBack),
    'back-btn branch must precede the generic <a> branch in click handler'
  );

  console.log(' a11y improvements passed!');
}

// ============================================================================
// Barrel Surface & buildHtmlShell Direct Tests
// ============================================================================

/**
 * Pin the `../ui/htmlTemplates` barrel's re-export surface so a future
 * refactor that drops a symbol (or introduces a duplicate class under the
 * same name) is caught immediately. Prior tothe barrel covered
 * BodyClass / ErrorType / buildHtmlShell only transitively via consumer
 * imports, leaving them untouched by the test suite — which defeats the
 * purpose of a barrel as an external contract.
 */
function testBarrelReExportSurface(): void {
  console.log('Testing barrel re-export surface...');

  // Value symbols: runtime typeof locks the shape.
  assert.strictEqual(typeof buildHtmlShell, 'function', 'buildHtmlShell must be re-exported');
  assert.strictEqual(typeof assertValidLang, 'function', 'assertValidLang must be re-exported');
  assert.strictEqual(typeof assertValidNonce, 'function', 'assertValidNonce must be re-exported');
  assert.strictEqual(typeof buildCspString, 'function', 'buildCspString must be re-exported');
  assert.strictEqual(typeof getBaseStyles, 'function', 'getBaseStyles must be re-exported');
  assert.strictEqual(typeof buildDocumentHtml, 'function', 'buildDocumentHtml must be re-exported');
  assert.strictEqual(typeof buildLoadingHtml, 'function', 'buildLoadingHtml must be re-exported');
  assert.strictEqual(typeof buildErrorHtml, 'function', 'buildErrorHtml must be re-exported');
  assert.strictEqual(typeof buildLinkInterceptScript, 'function', 'buildLinkInterceptScript must be re-exported');
  assert.strictEqual(typeof isHrefAllowed, 'function', 'isHrefAllowed must be re-exported');
  assert.ok(Array.isArray(ALLOWED_HREF_SCHEMES), 'ALLOWED_HREF_SCHEMES must be re-exported');
  assert.ok(
    CspValidationError.prototype instanceof Error,
    'CspValidationError must extend Error'
  );

  // Type-only symbols: assignment proves compile-time availability and
  // structural value. A future drop/rename of the type in the barrel would
  // fail to compile before this test ever runs.
  // Assignment + runtime assertion proves compile-time type availability
  // without tripping `sonarjs/void-use`. If the barrel ever stops exporting
  // one of these types the file fails to compile before reaching runtime.
  const bodyClass: BodyClass = 'gis-doc';
  const errorType: ErrorType = 'network';
  const sanitized: SanitizedHtml = asSanitizedHtml('<p>x</p>');
  assert.strictEqual(bodyClass, 'gis-doc');
  assert.strictEqual(errorType, 'network');
  assert.strictEqual(sanitized, '<p>x</p>');

  console.log('  barrel re-export surface passed!');
}

/**
 * `buildHtmlShell` is the trust boundary that every template funnels
 * through.added a defense-in-depth `</style` raw-text
 * breakout guard on `extraStyles` — pin it here so a future refactor
 * cannot quietly delete the check.
 *
 * The happy path (`extraStyles: ''` is legal, getBaseStyles is always
 * prepended) is asserted alongside the negative cases so a regression
 * that makes the check too aggressive (e.g. rejecting legitimate
 * `body { }` rules) is also caught.
 */
function testBuildHtmlShellExtraStylesGuard(): void {
  console.log('Testing buildHtmlShell (extraStyles </style guard)...');

  // Happy path: empty extraStyles must still produce a well-formed shell
  // with getBaseStyles prepended. This also pins the "base layer is always
  // injected by the shell, not the template" contract introduced by the
  // extraStyles refactor.
  const happy = buildHtmlShell({
    cspSource: TEST_CSP_SOURCE,
    nonce: TEST_NONCE,
    lang: 'en',
    title: 'Shell Contract Test',
    extraStyles: '',
    bodyClass: 'gis-doc',
    body: asSanitizedHtml('<main>hi</main>'),
  });
  assert.ok(happy.includes('<!DOCTYPE html>'), 'shell must emit DOCTYPE');
  assert.ok(happy.includes(':root {'), 'shell must prepend getBaseStyles (:root block)');
  assert.ok(happy.includes('<body class="gis-doc">'), 'shell must emit body class');

  // Negative path: every case-variant of `</style` must fail-closed with
  // CspValidationError so renderWithFallback can narrow on instanceof and
  // fall through to staticFallbackHtml.
  const breakoutPayloads = [
    'body { } </style><script>alert(1)</script>',
    'x </STYLE',
    'a</Style>b',
    '</style ',
  ];
  for (const payload of breakoutPayloads) {
    assert.throws(
      () => buildHtmlShell({
        cspSource: TEST_CSP_SOURCE,
        nonce: TEST_NONCE,
        lang: 'en',
        title: 't',
        extraStyles: payload,
        bodyClass: 'gis-doc',
        body: '' as SanitizedHtml,
      }),
      (e: unknown) =>
        e instanceof CspValidationError &&
        /extraStyles contains <\/style sequence/.test(e.message),
      `extraStyles </style breakout must fail-closed: ${JSON.stringify(payload)}`
    );
  }

  console.log('  buildHtmlShell (extraStyles </style guard) passed!');
}

// ============================================================================
// Link Intercept Tests (Issue-00195)
// ============================================================================

/**
 * Test `isHrefAllowed` — the host-side mirror of the client-side scheme
 * allowlist. Verifies that only safe href values pass through.
 */
function testIsHrefAllowed(): void {
  console.log('Testing isHrefAllowed...');

  // Allowed: anchor links
  assert.strictEqual(isHrefAllowed('#section'), true, '#section should be allowed');
  assert.strictEqual(isHrefAllowed('#'), true, '# alone should be allowed');

  // Allowed: relative paths
  assert.strictEqual(isHrefAllowed('./file.md'), true, 'Relative ./file.md should be allowed');
  assert.strictEqual(isHrefAllowed('../parent/file.md'), true, 'Relative ../parent should be allowed');
  assert.strictEqual(isHrefAllowed('file.md'), true, 'Bare filename should be allowed');
  assert.strictEqual(isHrefAllowed('docs/README.md'), true, 'Path without ./ should be allowed');

  // Allowed: http(s) absolute URLs
  assert.strictEqual(isHrefAllowed('https://example.com'), true, 'https should be allowed');
  assert.strictEqual(isHrefAllowed('http://example.com'), true, 'http should be allowed');
  assert.strictEqual(isHrefAllowed('https://github.com/user/repo'), true, 'https with path should be allowed');

  // Rejected: javascript: scheme
  assert.strictEqual(isHrefAllowed('javascript:alert(1)'), false, 'javascript: should be rejected');
  assert.strictEqual(isHrefAllowed('javascript:void(0)'), false, 'javascript:void(0) should be rejected');

  // Rejected: data: scheme
  assert.strictEqual(isHrefAllowed('data:text/html,<h1>XSS</h1>'), false, 'data: should be rejected');
  assert.strictEqual(isHrefAllowed('data:application/pdf;base64,abc'), false, 'data:application should be rejected');

  // Rejected: file: scheme
  assert.strictEqual(isHrefAllowed('file:///etc/passwd'), false, 'file:/// should be rejected');

  // Rejected: vscode-resource: scheme
  assert.strictEqual(isHrefAllowed('vscode-resource://extension/path'), false, 'vscode-resource: should be rejected');

  // Rejected: insecure/dangerous protocol schemes
  assert.strictEqual(isHrefAllowed('sftp://files.example.com'), false, 'sftp:// should be rejected');
  assert.strictEqual(isHrefAllowed('ssh://git@github.com/repo'), false, 'ssh:// should be rejected');

  // Rejected: malformed URLs
  assert.strictEqual(isHrefAllowed('ht!tp://bad'), false, 'Malformed URL should be rejected');

  // Rejected: case-insensitive scheme detection
  assert.strictEqual(isHrefAllowed('JAVASCRIPT:alert(1)'), false, 'Upper-case JAVASCRIPT: should be rejected');
  assert.strictEqual(isHrefAllowed('JavaScript:void(0)'), false, 'Mixed-case JavaScript: should be rejected');
  assert.strictEqual(isHrefAllowed('DATA:text/html,test'), false, 'Upper-case DATA: should be rejected');

  // Edge case: empty href is a relative path (harmless no-op)
  assert.strictEqual(isHrefAllowed(''), true, 'Empty href is a relative path (no scheme)');

  console.log('  isHrefAllowed passed!');
}

/**
 * Test `ALLOWED_HREF_SCHEMES` constant — pin the allowlist so additions
 * require a conscious decision (new schemes widen the attack surface).
 */
function testAllowedHrefSchemes(): void {
  console.log('Testing ALLOWED_HREF_SCHEMES...');

  assert.deepStrictEqual(
    [...ALLOWED_HREF_SCHEMES],
    ['http:', 'https:'],
    'ALLOWED_HREF_SCHEMES must contain exactly http: and https:'
  );

  console.log('  ALLOWED_HREF_SCHEMES passed!');
}

/**
 * Test `buildLinkInterceptScript` — verifies the generated script string
 * contains the expected security guards and structural elements.
 */
function testBuildLinkInterceptScript(): void {
  console.log('Testing buildLinkInterceptScript...');

  const script = buildLinkInterceptScript();

  // Must be a self-invoking function
  assert.ok(script.includes('(function()'), 'Script must be IIFE');

  // Must contain the scheme allowlist
  assert.ok(script.includes("'http:'"), 'Script must include http: in allowlist');
  assert.ok(script.includes("'https:'"), 'Script must include https: in allowlist');

  // Must contain the isHrefSafe guard
  assert.ok(script.includes('isHrefSafe'), 'Script must include isHrefSafe guard');

  // Must check isHrefSafe before postMessage navigate
  assert.ok(
    /isHrefSafe[\s\S]*postMessage\(\{[\s\S]*command:\s*['"]navigate['"]/.test(script),
    'isHrefSafe check must precede navigate postMessage'
  );

  // Must NOT register a keydown listener (WCAG 3.2.5)
  assert.ok(
    !script.includes("addEventListener('keydown'"),
    'Script must NOT register keydown listener'
  );

  // Back button must use aria-disabled guard
  assert.ok(
    script.includes("getAttribute('aria-disabled')"),
    'Script must guard back-btn on aria-disabled'
  );

  // Anchor scroll must move focus for AT users (tabindex + focus)
  assert.ok(
    script.includes("setAttribute('tabindex'"),
    'Anchor scroll must set tabindex for AT focus'
  );
  assert.ok(
    script.includes('.focus('),
    'Anchor scroll must call focus() for AT reading position'
  );

  console.log('  buildLinkInterceptScript passed!');
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
    testShellInputValidation();
    testAllTemplatesCssQuality();

    // Cross-Template Invariants
    console.log('\n--- Cross-Template Invariants ---');
    testShellSkeletonIsShared();
    testBodyClassOverrides();
    testDesignTokenCoverage();
    testBarrelReExportSurface();
    testBuildHtmlShellExtraStylesGuard();

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

    //A11y Improvements
    console.log('\n---A11y Improvements ---');
    testIssue00188A11yImprovements();

    // Link Intercept Tests (Issue-00195)
    console.log('\n--- Link Intercept Tests ---');
    testIsHrefAllowed();
    testAllowedHrefSchemes();
    testBuildLinkInterceptScript();

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
