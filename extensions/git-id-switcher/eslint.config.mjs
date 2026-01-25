// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      // Prevent magic numbers - force use of named constants (Phase 0 of Issue-00071)
      "no-magic-numbers": [
        "warn",
        {
          ignore: [0, 1, -1, 2, 10, 100, 1000],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
      // Prevent inline regex literals - force use of shared patterns (Phase 0 of Issue-00071)
      "no-restricted-syntax": [
        "warn",
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
      // Tests naturally use magic numbers and regex literals for test data
      "no-magic-numbers": "off",
      "no-restricted-syntax": "off",
    },
  },
  // validators/common.ts is the canonical location for shared patterns and constants
  {
    files: ["**/validators/common.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "no-magic-numbers": "off",
    },
  },
  // Temporary: existing files with patterns/magic numbers to be refactored in Phase 1-3
  // Remove files from this list after refactoring (Issue-00071)
  {
    files: [
      "**/core/errors.ts",
      "**/core/submodule.ts",
      "**/identity/inputValidator.ts",
      "**/identity/configSchema.ts",
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
    ignores: ["out/**", "node_modules/**", "*.js"],
  }
);
