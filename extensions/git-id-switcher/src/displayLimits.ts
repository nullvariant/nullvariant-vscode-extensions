/**
 * Display Limits Configuration
 *
 * Defines character limits and truncation rules for different display contexts.
 * Each context has different constraints based on available space and UX requirements.
 */

/**
 * Shared Intl.Segmenter instance for grapheme counting.
 * Reused across all functions to avoid repeated instantiation.
 *
 * @remarks
 * Intl.Segmenter is available in Node.js 16+ and modern browsers.
 * VS Code extensions run on Node.js 18+, so this is always available.
 */
const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * Display limits for each UI context
 */
export const DISPLAY_LIMITS = {
  /**
   * Status bar: Compact display, shares space with other extensions
   * Should be short to avoid taking too much horizontal space
   */
  statusBar: {
    maxLength: 25,
    truncateSuffix: '...',
  },

  /**
   * QuickPick label: Main selection text
   * VS Code handles overflow, but we set a reasonable limit
   */
  quickPickLabel: {
    maxLength: 60,
  },

  /**
   * QuickPick detail: Secondary information line
   * Shows description and email
   */
  quickPickDetail: {
    maxLength: 80,
  },

  /**
   * Tooltip: Hover information, can show full details
   * No limit needed as it's a popup
   */
  tooltip: {
    maxLength: null,
  },
} as const;

/**
 * Count grapheme clusters (visible characters) in a string.
 * Uses Intl.Segmenter for accurate emoji and combined character counting.
 *
 * Examples:
 * - "Hello" → 5
 * - "👤" → 1
 * - "👨‍👩‍👧" (family emoji) → 1
 * - "👤👤" → 2
 *
 * @param str - The string to count graphemes in
 * @returns The number of visible characters
 */
export function countGraphemes(str: string): number {
  return [...graphemeSegmenter.segment(str)].length;
}

/**
 * Truncate a string by grapheme clusters with a suffix.
 * Common implementation for all truncation functions.
 *
 * Both text length and suffix length are calculated in graphemes (visible characters),
 * ensuring accurate truncation even with emoji or combined characters.
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length in graphemes (must be positive)
 * @param suffix - Suffix to append when truncated (default: '...')
 * @returns Truncated text if necessary, original text otherwise
 */
function truncateByGraphemes(text: string, maxLength: number, suffix: string = '...'): string {
  const segments = [...graphemeSegmenter.segment(text)];
  if (segments.length <= maxLength) {
    return text;
  }
  // Calculate suffix length in graphemes (not bytes) for accurate truncation
  const suffixGraphemeLength = [...graphemeSegmenter.segment(suffix)].length;
  const targetLength = Math.max(0, maxLength - suffixGraphemeLength);
  const truncatedSegments = segments.slice(0, targetLength);
  return truncatedSegments.map(s => s.segment).join('') + suffix;
}

/**
 * Truncate text for status bar display.
 * If the text exceeds the maximum length, it will be truncated with "...".
 *
 * @param text - The text to truncate
 * @returns Truncated text if necessary, original text otherwise
 */
export function truncateForStatusBar(text: string): string {
  const { maxLength, truncateSuffix } = DISPLAY_LIMITS.statusBar;
  return truncateByGraphemes(text, maxLength, truncateSuffix);
}

/**
 * Truncate text for QuickPick label display.
 *
 * @param text - The text to truncate
 * @returns Truncated text if necessary, original text otherwise
 */
export function truncateForQuickPickLabel(text: string): string {
  return truncateByGraphemes(text, DISPLAY_LIMITS.quickPickLabel.maxLength);
}

/**
 * Truncate text for QuickPick detail display.
 *
 * @param text - The text to truncate
 * @returns Truncated text if necessary, original text otherwise
 */
export function truncateForQuickPickDetail(text: string): string {
  return truncateByGraphemes(text, DISPLAY_LIMITS.quickPickDetail.maxLength);
}

/**
 * Validate that a string is a single grapheme cluster (one visible character).
 * Used for icon/emoji validation.
 *
 * @param value - The string to validate
 * @returns true if the string is exactly one grapheme cluster
 */
export function isSingleGrapheme(value: string): boolean {
  return countGraphemes(value) === 1;
}
