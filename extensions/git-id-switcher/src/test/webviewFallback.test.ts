/**
 * Webview Fallback Tests (Issue-00236)
 *
 * Verifies that `renderWithFallback`:
 *  - returns the builder output on success
 *  - returns `staticFallbackHtml()` when the builder throws a
 *    `CspValidationError`
 *  - re-throws any other error so non-CSP logic bugs (TypeError, escape
 *    regressions, etc.) stay loud instead of being silently swallowed
 *    under the CSP drift defence
 *
 * The narrow catch is the whole point of Issue-00236 — a broad catch
 * masked production bugs with zero observability.
 */

import * as assert from 'node:assert';
import { CspValidationError } from '../ui/htmlTemplates';
import {
  type TemplateKind,
  renderWithFallback,
  staticFallbackHtml,
} from '../ui/webviewFallback';

/**
 * Run `fn` with `console.error` replaced by a capture buffer. Restores the
 * original in `finally` so an unexpected throw inside `fn` cannot leak the
 * silenced console into later tests. Returns every call's argument tuple so
 * the caller can assert on both call count AND content (scrub contract).
 */
function withCapturedConsoleError<T>(fn: (captured: unknown[][]) => T): T {
  const original = console.error;
  const captured: unknown[][] = [];
  console.error = (...args: unknown[]): void => {
    captured.push(args);
  };
  try {
    return fn(captured);
  } finally {
    console.error = original;
  }
}

function testRenderWithFallbackReturnsBuilderOutputOnSuccess(): void {
  console.log('Testing renderWithFallback (happy path)...');
  const out = renderWithFallback('document', () => '<p>ok</p>');
  assert.strictEqual(out, '<p>ok</p>');
  console.log('  renderWithFallback (happy path) passed!');
}

function testRenderWithFallbackServesStaticOnCspValidationError(): void {
  console.log('Testing renderWithFallback (CspValidationError → static fallback)...');

  // Exercise every TemplateKind so a future `kind`-dependent log format
  // regression (or a missed wrapper in webview.ts) is caught here rather
  // than in production logs. The scrub contract (error.message must not
  // include raw caller input) is enforced upstream in buildCspString —
  // see the "buildCspString messages are static / scrub contract" check
  // in htmlTemplates.test.ts — so this test only asserts routing +
  // per-kind log-line tagging.
  const kinds: TemplateKind[] = ['document', 'loading', 'error'];

  withCapturedConsoleError((captured) => {
    for (const kind of kinds) {
      const out = renderWithFallback(kind, () => {
        throw new CspValidationError(
          'buildCspString: nonce contains disallowed characters'
        );
      });
      assert.strictEqual(
        out,
        staticFallbackHtml(),
        `CspValidationError must yield the interpolation-free static fallback (${kind})`
      );
    }

    assert.strictEqual(
      captured.length,
      kinds.length,
      'CSP drift must be logged exactly once per render attempt'
    );
    for (const [i, args] of captured.entries()) {
      assert.ok(
        typeof args[0] === 'string' && args[0].includes(`webview ${kinds[i]}`),
        `log line must include "webview ${kinds[i]}"`
      );
    }
  });

  console.log('  renderWithFallback (CspValidationError → static fallback) passed!');
}

function testRenderWithFallbackRethrowsNonCspErrors(): void {
  console.log('Testing renderWithFallback (non-CSP errors rethrow)...');

  // TypeError — the class of bug Issue-00236 was filed to stop masking.
  const typeErr = new TypeError('unexpected undefined in escape pipeline');
  assert.throws(
    () => renderWithFallback('document', () => {
      throw typeErr;
    }),
    (err: unknown) => err === typeErr,
    'TypeError from builder must propagate (not be swallowed by fallback)'
  );

  // A subclass of Error that is NOT CspValidationError must also escape.
  class UnrelatedError extends Error {}
  const unrelated = new UnrelatedError('render regression');
  assert.throws(
    () => renderWithFallback('error', () => {
      throw unrelated;
    }),
    (err: unknown) => err === unrelated,
    'non-CspValidationError must propagate'
  );

  console.log('  renderWithFallback (non-CSP errors rethrow) passed!');
}

function testStaticFallbackHtmlIsInterpolationFreeAndSafe(): void {
  console.log('Testing staticFallbackHtml (contract)...');
  const html = staticFallbackHtml();
  assert.ok(html.startsWith('<!DOCTYPE html>'), 'must be a full HTML document');
  assert.ok(
    html.includes(`content="default-src 'none'"`),
    'fallback CSP must be the interpolation-free default-src none'
  );
  assert.ok(
    !/\$\{[^}]*\}/.test(html),
    'fallback must contain no template interpolation markers'
  );
  // Defence against future "helpful" refactors that inline nonce or the
  // webview cspSource token into the fallback — the whole point is that
  // this HTML survives when those values are malformed.
  assert.ok(
    !/nonce/i.test(html),
    'fallback must not reference any nonce (the pipeline it is meant to escape)'
  );
  assert.ok(
    !html.includes('vscode-webview') && !html.includes('vscode-cdn'),
    'fallback must not reference vscode webview/cdn scheme tokens'
  );
  assert.ok(html.includes('<html lang="en">'), 'fallback must be english-only');
  console.log('  staticFallbackHtml (contract) passed!');
}

export function runWebviewFallbackTests(): void {
  console.log('\n--- Webview Fallback Tests (Issue-00236) ---');
  testRenderWithFallbackReturnsBuilderOutputOnSuccess();
  testRenderWithFallbackServesStaticOnCspValidationError();
  testRenderWithFallbackRethrowsNonCspErrors();
  testStaticFallbackHtmlIsInterpolationFreeAndSafe();
  console.log('--- Webview Fallback Tests passed ---\n');
}
