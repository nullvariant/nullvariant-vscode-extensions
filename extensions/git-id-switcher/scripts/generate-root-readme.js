#!/usr/bin/env node
/**
 * generate-root-readme.js
 *
 * Generates the root README.md from docs/i18n/en/README.md (SSOT)
 * Transforms relative links to absolute GitHub URLs for external platforms
 * (VS Code Marketplace, Open VSX, GitHub)
 *
 * Usage: node scripts/generate-root-readme.js
 */

const fs = require("node:fs");
const path = require("node:path");

const GITHUB_BASE =
  "https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main";
const EXTENSION_PATH = "extensions/git-id-switcher";

const SOURCE_PATH = path.join(
  __dirname,
  "..",
  "docs",
  "i18n",
  "en",
  "README.md",
);
const OUTPUT_PATH = path.join(__dirname, "..", "README.md");

const AUTO_GENERATED_HEADER = `<!-- 🚨 AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY 🚨
     Source: docs/i18n/en/README.md
     Run: npm run generate:readme -->

`;

/**
 * All link transformations to apply.
 * Each transformation has a pattern (regex) and replacement (string or function).
 */
const TRANSFORMATIONS = [
  // Transform relative language links: ../ja/README.md -> absolute GitHub URL
  {
    pattern: /href="\.\.\/([a-zA-Z-]+)\/README\.md"/g,
    replacement: `href="${GITHUB_BASE}/${EXTENSION_PATH}/docs/i18n/$1/README.md"`,
  },
  // Transform LANGUAGES.md link: ../../LANGUAGES.md -> absolute GitHub URL
  {
    pattern: /href="\.\.\/\.\.\/LANGUAGES\.md"/g,
    replacement: `href="${GITHUB_BASE}/${EXTENSION_PATH}/docs/LANGUAGES.md"`,
  },
  // Remove -en suffix from image filenames: demo-en.png -> demo.png
  {
    pattern: /-en\.png/g,
    replacement: ".png",
  },
  // Transform CONTRIBUTING.md markdown link to absolute GitHub URL
  {
    pattern: /\[CONTRIBUTING\.md\]\([^)]+\)/g,
    replacement: `[CONTRIBUTING.md](${GITHUB_BASE}/CONTRIBUTING.md)`,
  },
  // Transform LICENSE markdown link to absolute GitHub URL
  {
    pattern: /\[LICENSE\]\([^)]+\)/g,
    replacement: `[LICENSE](${GITHUB_BASE}/LICENSE)`,
  },
  // Transform DESIGN_PHILOSOPHY.md markdown-style link to absolute GitHub URL
  {
    pattern: /\(\.\.\/\.\.\/DESIGN_PHILOSOPHY\.md\)/g,
    replacement: `(${GITHUB_BASE}/${EXTENSION_PATH}/docs/DESIGN_PHILOSOPHY.md)`,
  },
  // Transform DESIGN_PHILOSOPHY.md HTML href to absolute GitHub URL
  {
    pattern: /href="\.\.\/\.\.\/DESIGN_PHILOSOPHY\.md"/g,
    replacement: `href="${GITHUB_BASE}/${EXTENSION_PATH}/docs/DESIGN_PHILOSOPHY.md"`,
  },
];

/**
 * Apply all transformations to content
 * @param {string} content - The content to transform
 * @returns {string} - The transformed content
 */
function applyTransformations(content) {
  return TRANSFORMATIONS.reduce(
    (text, { pattern, replacement }) => text.replaceAll(pattern, replacement),
    content,
  );
}

function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`Error: Source file not found: ${SOURCE_PATH}`);
    process.exit(1);
  }

  let content = fs.readFileSync(SOURCE_PATH, "utf-8");
  content = applyTransformations(content);
  content = AUTO_GENERATED_HEADER + content;

  fs.writeFileSync(OUTPUT_PATH, content, "utf-8");

  console.log(`✅ Generated ${OUTPUT_PATH}`);
  console.log(`   Source: ${SOURCE_PATH}`);
}

main();
