// @ts-check
import { createConfig } from "@nullvariant/eslint-config";

// The site uses the shared rules as they are, with no exceptions of its own.
export default [
  ...createConfig(),
  {
    ignores: ["dist/**", "coverage/**"],
  },
];
