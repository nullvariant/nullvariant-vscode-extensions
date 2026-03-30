/**
 * Markdown escape utilities for tooltip rendering.
 *
 * Pure functions with no VS Code dependency — safe for unit testing.
 */

/**
 * Escape Markdown special characters in user-supplied text.
 * Prevents accidental formatting when values contain *, _, `, etc.
 * Also escapes pipe characters for safe use inside Markdown table cells,
 * and strips newline characters to prevent Markdown structure injection.
 */
export function escapeMarkdownInline(value: string): string {
  return value.replaceAll('\\', String.raw`\\`)
    .replaceAll('*', String.raw`\*`)
    .replaceAll('_', String.raw`\_`)
    .replaceAll('`', String.raw`\``)
    .replaceAll('[', String.raw`\[`)
    .replaceAll(']', String.raw`\]`)
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('|', String.raw`\|`)
    .replaceAll('\n', ' ')
    .replaceAll('\r', '');
}
