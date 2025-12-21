/**
 * Display Limits Configuration
 *
 * Defines character limits and truncation rules for different display contexts.
 * Each context has different constraints based on available space and UX requirements.
 */

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
  // Intl.Segmenter is available in Node.js 16+ and modern browsers
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return [...segmenter.segment(str)].length;
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

  // Count graphemes for accurate length measurement
  const graphemeCount = countGraphemes(text);

  if (graphemeCount <= maxLength) {
    return text;
  }

  // Truncate by grapheme clusters, not bytes
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const segments = [...segmenter.segment(text)];
  const truncatedSegments = segments.slice(0, maxLength - truncateSuffix.length);

  return truncatedSegments.map(s => s.segment).join('') + truncateSuffix;
}

/**
 * Truncate text for QuickPick label display.
 *
 * @param text - The text to truncate
 * @returns Truncated text if necessary, original text otherwise
 */
export function truncateForQuickPickLabel(text: string): string {
  const { maxLength } = DISPLAY_LIMITS.quickPickLabel;
  const graphemeCount = countGraphemes(text);

  if (graphemeCount <= maxLength) {
    return text;
  }

  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const segments = [...segmenter.segment(text)];
  const truncatedSegments = segments.slice(0, maxLength - 3);

  return truncatedSegments.map(s => s.segment).join('') + '...';
}

/**
 * Truncate text for QuickPick detail display.
 *
 * @param text - The text to truncate
 * @returns Truncated text if necessary, original text otherwise
 */
export function truncateForQuickPickDetail(text: string): string {
  const { maxLength } = DISPLAY_LIMITS.quickPickDetail;
  const graphemeCount = countGraphemes(text);

  if (graphemeCount <= maxLength) {
    return text;
  }

  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const segments = [...segmenter.segment(text)];
  const truncatedSegments = segments.slice(0, maxLength - 3);

  return truncatedSegments.map(s => s.segment).join('') + '...';
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
