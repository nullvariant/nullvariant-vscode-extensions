// @ts-check
/**
 * ESLint rules shared by every package in this monorepo. Rules that hold
 * regardless of language or runtime live here; each package adds the rules
 * that belong to its language (TypeScript) or platform (VS Code extensions).
 */
import eslint from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";

/** @typedef {import("eslint").Linter.Config} Config */

/** Highest cognitive complexity a function may have. */
const MAX_COGNITIVE_COMPLEXITY = 15;

/** @type {import("eslint").Linter.RulesRecord} */
const rules = {
  // === Security ===
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",

  // === Basic quality ===
  "no-var": "error",
  "prefer-const": "error",
  eqeqeq: "error",
  // no-debugger is already in eslint.configs.recommended
  "no-console": ["warn", { allow: ["warn", "error"] }],

  // === Cognitive complexity ===
  "sonarjs/cognitive-complexity": ["error", MAX_COGNITIVE_COMPLEXITY],

  // === Bit operations and legacy APIs ===
  "no-bitwise": "error",
  "unicorn/prefer-number-properties": "error",

  // === Modern APIs ===
  "unicorn/prefer-node-protocol": "error",
  "unicorn/prefer-regexp-test": "error",
  "unicorn/prefer-string-starts-ends-with": "error",

  // === Promise quality ===
  "prefer-promise-reject-errors": "error",

  // === SonarQube patterns ===
  "no-duplicate-imports": "error",
  "unicorn/prefer-string-replace-all": "error",
  "unicorn/prefer-set-has": "error",
  "unicorn/numeric-separators-style": "error",

  // === Magic numbers ===
  "no-magic-numbers": [
    "error",
    {
      ignore: [0, 1, -1, 2, 10, 100, 1000],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
    },
  ],

  // === Unicorn rules this codebase opts out of ===
  "unicorn/no-null": "off",
  "unicorn/name-replacements": "off",
  // Taste rules about comment layout; the codebase keeps the common JSDoc
  // style (asterisk prefixes, one-line /** ... */ summaries)
  "unicorn/no-asterisk-prefix-in-documentation-comments": "off",
  "unicorn/single-line-block-comment-style": "off",
  "unicorn/no-abusive-eslint-disable": "off",
  "unicorn/import-style": "off",
};

/**
 * Builds the shared configuration.
 *
 * @param {{ languagePresets?: Config[] }} [options]
 *   Presets for the package's language (for example typescript-eslint's
 *   recommended configs). They sit between ESLint's and the plugins'
 *   recommended configs, so the plugins and the shared rules can override them.
 * @returns {Config[]}
 */
export function createConfig({ languagePresets = [] } = {}) {
  return [
    eslint.configs.recommended,
    ...languagePresets,
    /** @type {Config} */ (sonarjs.configs?.recommended ?? {}),
    unicorn.configs["recommended"],
    {
      rules,
      linterOptions: {
        reportUnusedDisableDirectives: "warn",
      },
    },
  ];
}
