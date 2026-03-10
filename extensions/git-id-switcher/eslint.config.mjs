// @ts-check
import eslint from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  /** @type {any} */ (sonarjs.configs?.recommended ?? {}),
  unicorn.configs["recommended"],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // === Security (existing) ===
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // === B1-B7: Basic quality (ts-linter-ruleset-standard) ===
      "no-var": "error", // B1
      "prefer-const": "error", // B2
      // B3/B4: @typescript-eslint/no-unused-vars (below)
      eqeqeq: "error", // B5
      // B6: no-debugger already in eslint.configs.recommended
      "no-console": ["warn", { allow: ["warn", "error"] }], // B7

      // === Guardrail #7: Cognitive Complexity ===
      "sonarjs/cognitive-complexity": ["error", 15],

      // === Guardrail #9: Bit ops / legacy API ===
      "no-bitwise": "error",
      "unicorn/prefer-number-properties": "error",

      // === Guardrail #12: Modern API ===
      "@typescript-eslint/prefer-optional-chain": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-regexp-test": "error",
      "unicorn/prefer-string-starts-ends-with": "error",

      // === Guardrail #14: Promise quality ===
      "prefer-promise-reject-errors": "error",
      "@typescript-eslint/no-floating-promises": "error",

      // === Guardrail #16: SonarQube patterns ===
      "unicorn/prefer-string-replace-all": "error",
      "unicorn/prefer-set-has": "error",
      "unicorn/numeric-separators-style": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      // === Project-specific security rules ===
      "no-magic-numbers": [
        "error",
        {
          ignore: [0, 1, -1, 2, 10, 100, 1000],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[regex]",
          message:
            "Import pattern constants from validators/common.ts instead of inline regex",
        },
      ],
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_|^error$",
        },
      ],

      // === Unicorn overrides (disable overly opinionated rules) ===
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-process-exit": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-abusive-eslint-disable": "off",
      "unicorn/import-style": "off",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-magic-numbers": "off",
      "no-restricted-syntax": "off",
      "no-console": "off",
    },
  },
  {
    files: ["**/validators/common.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "no-magic-numbers": "off",
    },
  },
  // Temporary: existing files with patterns/magic numbers to be refactored
  // Remove files from this list after refactoring (Issue-00071)
  {
    files: [
      "**/core/errors.ts",
      "**/core/submodule.ts",
      "**/logging/fileLogWriter.ts",
      "**/logging/logTypes.ts",
      "**/security/binaryResolver.ts",
      "**/security/flagValidator.ts",
      "**/security/pathSanitizer.ts",
      "**/security/pathTraversalDetector.ts",
      "**/security/pathValidator.ts",
      "**/security/secureExec.ts",
      "**/security/securityLogger.ts",
      "**/security/sensitiveDataDetector.ts",
      "**/ssh/sshAgent.ts",
      "**/ui/documentationInternal.ts",
      "**/ui/documentationPublic.ts",
      "**/ui/webview.ts",
    ],
    rules: {
      "no-magic-numbers": "off",
      "no-restricted-syntax": "off",
    },
  },
  {
    ignores: ["out/**", "node_modules/**", "coverage/**", "scripts/**", ".vscode-test/**", "*.js", "*.mjs"],
  },
];
