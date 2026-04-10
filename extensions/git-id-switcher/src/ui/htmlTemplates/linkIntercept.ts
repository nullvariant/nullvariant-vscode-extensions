/**
 * Webview Link Intercept Script
 *
 * Client-side JavaScript injected into the webview via `<script nonce>`.
 * Intercepts link clicks and back-button presses, posting messages to the
 * extension host. Extracted from document.ts (Issue-00195) so the security
 * logic (href scheme allowlist) is isolated and testable.
 *
 * SECURITY: Only `http:`, `https:`, and relative paths (no `://`) are
 * forwarded to the extension host. Dangerous schemes (`javascript:`,
 * `data:`, `file:`, `vscode-resource:`, etc.) are silently dropped at the
 * client boundary before `postMessage` — defense-in-depth alongside the
 * host-side `classifyUrl` reject.
 *
 * @author Null;Variant
 * @license MIT
 */

/**
 * Href schemes that are safe to forward to the extension host.
 * Everything else is silently dropped.
 *
 * Exported for testing only — not part of the webview runtime (the script
 * string embeds a copy of the list as a JS literal).
 */
export const ALLOWED_HREF_SCHEMES = ['http:', 'https:'] as const;

/**
 * Check whether an href value is safe to forward to the extension host.
 *
 * Allowed:
 *  - Anchor links (`#…`)
 *  - Relative paths (no `://` substring)
 *  - `http:` / `https:` absolute URLs
 *
 * Rejected (returns `false`):
 *  - `javascript:`, `data:`, `file:`, `vscode-resource:`, or any other
 *    scheme not in the allowlist.
 *
 * Exported so the host-side code and tests can reuse the same logic.
 */
export function isHrefAllowed(href: string): boolean {
  // Anchor links are always safe (handled in-page, never posted).
  if (href.startsWith('#')) {
    return true;
  }

  // No scheme separator → relative path → safe, unless a colon appears
  // before the first slash (scheme-like prefix without double-slash that
  // browsers still interpret, e.g. `javascript:alert(1)`).
  if (!href.includes('://')) {
    const colonIndex = href.indexOf(':');
    if (colonIndex === -1) return true;
    const slashIndex = href.indexOf('/');
    // Colon with no slash at all, or colon before first slash → scheme
    return slashIndex !== -1 && colonIndex > slashIndex;
  }

  // Absolute URL — only http(s) allowed.
  try {
    const url = new URL(href);
    return (ALLOWED_HREF_SCHEMES as readonly string[]).includes(url.protocol);
  } catch {
    // Malformed URL → reject.
    return false;
  }
}

/**
 * Build the link-intercept `<script>` body for injection into the webview.
 *
 * The returned string is a self-invoking function that:
 *  1. Acquires the VS Code API.
 *  2. Listens for `click` events on `<a>` and the back button.
 *  3. Validates `href` against a scheme allowlist before posting.
 *
 * Keyboard policy: only Enter activates `<a>` (native click fires on
 * Enter). Space is intentionally NOT handled — per ARIA Authoring
 * Practices, Space on `<a>` performs page scroll; synthesising navigation
 * would violate WCAG 3.2.5 (Change on Request). The back `<button>`
 * fires native click on both Enter and Space.
 *
 * Why `aria-disabled` on back-btn (not `[disabled]`): Safari/VoiceOver
 * removes focus from `[disabled]` buttons entirely, trapping keyboard
 * users who tab to the nav bar.
 */
export function buildLinkInterceptScript(): string {
  return `
    (function() {
      var ALLOWED_SCHEMES = ['http:', 'https:'];

      function isHrefSafe(href) {
        if (href.startsWith('#')) return true;
        if (!href.includes('://')) {
          var colonIdx = href.indexOf(':');
          if (colonIdx === -1) return true;
          var slashIdx = href.indexOf('/');
          return slashIdx !== -1 && colonIdx > slashIdx;
        }
        try {
          var url = new URL(href);
          return ALLOWED_SCHEMES.indexOf(url.protocol) !== -1;
        } catch (e) {
          return false;
        }
      }

      var vscode = acquireVsCodeApi();

      document.addEventListener('click', function(e) {
        var backBtn = e.target.closest && e.target.closest('#back-btn');
        if (backBtn) {
          if (backBtn.getAttribute('aria-disabled') === 'true') {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          vscode.postMessage({ command: 'back' });
          return;
        }

        var link = e.target.closest && e.target.closest('a');
        if (!link) return;
        var href = link.getAttribute('href');
        if (!href) return;

        e.preventDefault();

        if (href.startsWith('#')) {
          var target = document.getElementById(href.slice(1));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            // Move AT reading position to the scroll target so
            // screen-reader users land at the anchored section.
            if (!target.getAttribute('tabindex')) {
              target.setAttribute('tabindex', '-1');
            }
            target.focus({ preventScroll: true });
          }
          return;
        }

        if (!isHrefSafe(href)) return;

        vscode.postMessage({ command: 'navigate', href: href });
      });
    })();
  `;
}
