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

const fs = require('fs');
const path = require('path');

const GITHUB_BASE = 'https://github.com/nullvariant/nullvariant-vscode-extensions/blob/main';
const EXTENSION_PATH = 'extensions/git-id-switcher';

const SOURCE_PATH = path.join(__dirname, '..', 'docs', 'i18n', 'en', 'README.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'README.md');

const AUTO_GENERATED_HEADER = `<!-- 🚨 AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY 🚨
     Source: docs/i18n/en/README.md
     Run: npm run generate:readme -->

`;

/**
 * Transform relative language links to absolute GitHub URLs
 * ../ja/README.md -> https://github.com/.../docs/i18n/ja/README.md
 */
function transformLanguageLinks(content) {
  // Match href="../XX/README.md" or href="../XX-YY/README.md"
  return content.replace(
    /href="\.\.\/([a-zA-Z-]+)\/README\.md"/g,
    `href="${GITHUB_BASE}/${EXTENSION_PATH}/docs/i18n/$1/README.md"`
  );
}

/**
 * Transform LANGUAGES.md link to absolute GitHub URL
 * ../../LANGUAGES.md -> https://github.com/.../docs/LANGUAGES.md
 */
function transformLanguagesLink(content) {
  return content.replace(
    /href="\.\.\/\.\.\/LANGUAGES\.md"/g,
    `href="${GITHUB_BASE}/${EXTENSION_PATH}/docs/LANGUAGES.md"`
  );
}

/**
 * Remove -en suffix from image filenames
 * demo-en.png -> demo.png
 * quickpick-en.png -> quickpick.png
 */
function removeEnSuffixFromImages(content) {
  return content.replace(/-en\.png/g, '.png');
}

/**
 * Transform CONTRIBUTING.md link to absolute GitHub URL
 * ../../CONTRIBUTING.md -> https://github.com/.../CONTRIBUTING.md
 */
function transformContributingLink(content) {
  return content.replace(
    /\[CONTRIBUTING\.md\]\([^)]+\)/g,
    `[CONTRIBUTING.md](${GITHUB_BASE}/CONTRIBUTING.md)`
  );
}

/**
 * Transform LICENSE link to absolute GitHub URL
 * ../../../../../LICENSE -> https://github.com/.../LICENSE
 */
function transformLicenseLink(content) {
  return content.replace(
    /\[LICENSE\]\([^)]+\)/g,
    `[LICENSE](${GITHUB_BASE}/LICENSE)`
  );
}

/**
 * Transform DESIGN_PHILOSOPHY.md link to correct relative path
 * ../../DESIGN_PHILOSOPHY.md -> docs/DESIGN_PHILOSOPHY.md
 * (from root README perspective)
 */
function transformDesignPhilosophyLink(content) {
  return content.replace(
    /\(\.\.\/\.\.\/DESIGN_PHILOSOPHY\.md\)/g,
    `(docs/DESIGN_PHILOSOPHY.md)`
  );
}

function main() {
  // Read source file
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`Error: Source file not found: ${SOURCE_PATH}`);
    process.exit(1);
  }

  let content = fs.readFileSync(SOURCE_PATH, 'utf-8');

  // Apply transformations
  content = transformLanguageLinks(content);
  content = transformLanguagesLink(content);
  content = removeEnSuffixFromImages(content);
  content = transformContributingLink(content);
  content = transformLicenseLink(content);
  content = transformDesignPhilosophyLink(content);

  // Add auto-generated header
  content = AUTO_GENERATED_HEADER + content;

  // Write output file
  fs.writeFileSync(OUTPUT_PATH, content, 'utf-8');

  console.log(`✅ Generated ${OUTPUT_PATH}`);
  console.log(`   Source: ${SOURCE_PATH}`);
}

main();
