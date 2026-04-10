/**
 * Document HTML Template (Pure Function)
 *
 * Generates the documentation webview body and its template-specific styles.
 * The shared skeleton (<!DOCTYPE>…</head>, base stylesheet, outer body tag)
 * lives in `./shell.ts`; this file owns only what is unique to the document
 * view — the nav bar, main/footer layout, and the link-intercept script.
 *
 * Split from the legacy monolithic htmlTemplates.ts.
 *
 * @author Null;Variant
 * @license MIT
 */

import { escapeHtmlEntities } from '../documentationInternal';
import {
  GITHUB_README_URL,
  getFocusVisibleForcedColorsRule,
  getFocusVisibleRule,
} from './baseStyles';
import { buildHtmlShell } from './shell';
import { type SanitizedHtml } from './types';

/**
 * Generate the document HTML with content
 *
 * @param cspSource - Webview CSP source
 * @param content - Pre-sanitized HTML content, typed as `SanitizedHtml` so
 *   the compiler forbids passing a raw `string`. The brand can only originate
 *   at the sanitizer boundary (`renderMarkdown`), making the trust boundary
 *   structurally impossible to bypass. This function injects `content`
 *   verbatim; CSP blocks `<script>` execution but does NOT stop `<img
 *   onerror>` or `javascript:` URLs outside the linkInterceptScript path,
 *   which is exactly why we want the type-level guarantee on top of CSP.
 * @param locale - Current locale
 * @param currentPath - Current document path (for relative link resolution)
 * @param nonce - CSP nonce for inline styles and scripts
 * @param canGoBack - Whether back navigation is available
 * @returns Complete HTML document
 */
export function buildDocumentHtml(
  cspSource: string,
  content: SanitizedHtml,
  locale: string,
  currentPath: string,
  nonce: string,
  canGoBack: boolean
): string {
  // Script to intercept link clicks / keyboard activation and back button.
  //
  // Keyboard policy for <a>: only Enter activates. Native <a> already fires
  // a synthetic click on Enter, so the click listener covers it with zero
  // extra code. Space is intentionally NOT handled — on <a> Space performs
  // page scroll per the ARIA Authoring Practices, and synthesising
  // navigation there would break user expectations (WCAG 3.2.5 Change on
  // Request). The back button is a <button>, where both Enter and Space
  // DO fire a native click, so its activation also flows through the
  // click listener.
  //
  // Why aria-disabled on back-btn (not [disabled]): Safari/VoiceOver remove
  // focus from [disabled] buttons entirely, trapping keyboard users who
  // tab-land on the nav bar. aria-disabled keeps the button in the focus
  // order and we guard the click handler instead.
  const linkInterceptScript = `
    (function() {
      const vscode = acquireVsCodeApi();

      document.addEventListener('click', function(e) {
        // Back button takes precedence: if the click path traverses the
        // back button, handle it first so link-in-button edge cases (a
        // sanitizer future-regression adding <a> inside the button) cannot
        // bypass the aria-disabled guard below.
        const backBtn = e.target.closest && e.target.closest('#back-btn');
        if (backBtn) {
          if (backBtn.getAttribute('aria-disabled') === 'true') {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          vscode.postMessage({ command: 'back' });
          return;
        }

        const link = e.target.closest && e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;

        e.preventDefault();

        if (href.startsWith('#')) {
          const target = document.getElementById(href.slice(1));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }

        vscode.postMessage({ command: 'navigate', href: href });
      });
    })();
  `;

  const extraStyles = `    /* External link indicator.
       The "/ <alt-text>" syntax (CSS Generated Content L3) provides the
       screen-reader announcement for the decorative arrow glyph. We
       announce "(opens externally)" rather than silencing it so AT
       users receive the same "external link" signal as sighted users.
       Note: VS Code webview is Electron/Chromium so this syntax is
       supported; it is not portable to Firefox. */
    a[href^="http"]:not([href*="assets.nullvariant.com"])::after {
      content: " ↗" / " (opens externally)";
      font-size: var(--gis-font-xs);
    }
    h1, h2, h3 {
      color: var(--vscode-foreground);
      margin-top: var(--gis-space-lg);
      margin-bottom: var(--gis-space-sm);
    }
    h1 { border-bottom: var(--gis-border-subtle); padding-bottom: var(--gis-space-xs); }
    code {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 0.2em 0.4em;
      border-radius: var(--gis-radius-sm);
      font-family: var(--vscode-editor-font-family);
    }
    pre {
      background-color: var(--vscode-textCodeBlock-background);
      padding: var(--gis-space-md);
      border-radius: var(--gis-radius-md);
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    ul {
      padding-left: var(--gis-space-lg);
    }
    li {
      margin-bottom: var(--gis-space-sm);
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: var(--gis-space-md) 0;
    }
    th, td {
      border: var(--gis-border-subtle);
      padding: var(--gis-space-sm) var(--gis-space-md);
      text-align: left;
      /* Prevent long tokens (URLs, hashes) from pushing the table
         wider than its container. overflow-wrap: anywhere is sufficient;
         we deliberately do NOT use table-layout: fixed (which would
         force equal column widths regardless of content). */
      overflow-wrap: anywhere;
    }
    th {
      background-color: var(--vscode-textCodeBlock-background);
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: var(--vscode-textCodeBlock-background);
    }
    blockquote {
      border-left: 4px solid var(--vscode-textLink-foreground);
      margin: var(--gis-space-md) 0;
      padding: var(--gis-space-sm) var(--gis-space-md);
      background-color: var(--vscode-textCodeBlock-background);
      font-style: italic;
    }
    hr {
      border: none;
      border-top: var(--gis-border-subtle);
      margin: var(--gis-space-xl) 0;
    }
    .nav-bar {
      margin-bottom: var(--gis-space-md);
      padding-bottom: var(--gis-space-sm);
      border-bottom: var(--gis-border-subtle);
    }
    .nav-bar button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      padding: var(--gis-pad-btn);
      border-radius: var(--gis-radius-sm);
      cursor: pointer;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    .nav-bar button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    /* aria-disabled is used instead of the [disabled] attribute so
       Safari/VoiceOver keep the button in the focus order.
       Uses a theme-aware foreground color instead of opacity so the
       focus-visible outline retains full contrast (WCAG 1.4.11) when
       the button is both focused and disabled. */
    .nav-bar button[aria-disabled="true"] {
      color: var(--vscode-disabledForeground, var(--vscode-descriptionForeground));
      cursor: not-allowed;
    }
    .nav-bar .current-path {
      margin-left: var(--gis-space-md);
      color: var(--vscode-descriptionForeground);
      font-size: var(--gis-font-sm);
    }
${getFocusVisibleRule('a:focus-visible, button:focus-visible')}
    /* Forced-colors (Windows High Contrast) overrides.
       - The nth-child(even) zebra uses a theme background that collapses to
         Canvas in forced-colors, flattening rows. Explicitly reset to
         Canvas so rows keep the system background rather than an opaque
         panel color that would fight cell borders.
       - Focus outlines must use the system Highlight color per WCAG 1.4.3. */
    @media (forced-colors: active) {
      tr:nth-child(even),
      th {
        background-color: Canvas;
      }
${getFocusVisibleForcedColorsRule('a:focus-visible, button:focus-visible')}
    }
    .footer {
      margin-top: var(--gis-pad-body-lg);
      padding-top: var(--gis-pad-body);
      border-top: var(--gis-border-subtle);
      font-size: var(--gis-font-sm);
    }
    .footer a {
      margin-right: var(--gis-space-md);
    }
    /* Template-specific body layout — scoped by body.gis-doc class to
       raise specificity above the base body rule, making cascade order
       irrelevant. */
    body.gis-doc {
      padding: var(--gis-pad-body);
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }`;

  // aria-disabled (not [disabled]) preserves tab focus under Safari/VoiceOver.
  // The ← glyph lives inside an aria-hidden span so AT announces only the
  // button's aria-label ("Go back") instead of reading the arrow as a
  // standalone token before the word "Back".
  // Brand the body as SanitizedHtml: every interpolated value is either a
  // static literal, an already-escaped attribute (escapeHtmlEntities), or
  // the pre-branded `content` parameter. A stray raw string from a future
  // refactor fails at this cast site instead of at the webview.
  const body = `  <nav class="nav-bar" aria-label="Document navigation">
    <button id="back-btn" type="button" aria-label="Go back" aria-disabled="${canGoBack ? 'false' : 'true'}"><span aria-hidden="true">← </span>Back</button>
    <span class="current-path" aria-current="page">${escapeHtmlEntities(currentPath)}</span>
  </nav>
  <main>
${content}
  </main>
  <footer class="footer">
    <a href="${GITHUB_README_URL}" aria-label="View Git ID Switcher on GitHub">View on GitHub</a>
    <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher">VS Code Marketplace</a>
  </footer>
  <script nonce="${nonce}">${linkInterceptScript}</script>` as SanitizedHtml;

  return buildHtmlShell({
    cspSource,
    nonce,
    lang: locale,
    title: 'Git ID Switcher Documentation',
    extraStyles,
    bodyClass: 'gis-doc',
    body,
  });
}
