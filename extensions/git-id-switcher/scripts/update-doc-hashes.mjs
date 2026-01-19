#!/usr/bin/env node
/**
 * Update DOCUMENT_HASHES in documentation.internal.ts
 *
 * Target files:
 * - Extension: ALL .md files + LICENSE (anywhere in the extension directory)
 * - Monorepo root: ALL *.md files + LICENSE (auto-detected via glob)
 *
 * Hash keys (CDN path based):
 * - Extension files: extensions/git-id-switcher/{relative_path}
 * - Monorepo root files: {filename} (e.g., README.md, CONTRIBUTING.md)
 *
 * This ensures DOCUMENT_HASHES keys match CDN paths exactly.
 *
 * Usage: node scripts/update-doc-hashes.mjs
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, access } from 'node:fs/promises';
import { glob } from 'glob';

const HASH_FILE = 'src/documentation.internal.ts';

// Extension identifier for CDN path construction
const EXTENSION_CDN_PREFIX = 'extensions/git-id-switcher';

// Monorepo root relative path (from extension directory)
const MONOREPO_ROOT = '../..';

/**
 * Compute SHA-256 hash of file content
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
async function computeSha256(filePath) {
  const content = await readFile(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} true if file exists
 */
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // ========================================
  // 1. Discover extension files
  // ========================================
  const extensionFiles = await glob([
    '**/*.md',   // All .md files anywhere
    'LICENSE',   // Only non-.md exception
  ], {
    ignore: [
      'node_modules/**',
      'out/**',
      '.vscode-test/**',
    ],
  });

  if (extensionFiles.length === 0) {
    console.error('Error: No extension files found. Are you running from the correct directory?');
    process.exit(1);
  }

  // ========================================
  // 2. Compute hashes for extension files
  // ========================================
  const hashes = {};

  for (const file of extensionFiles.sort()) {
    // CDN key for extension files: extensions/git-id-switcher/{file}
    const cdnKey = `${EXTENSION_CDN_PREFIX}/${file}`;
    hashes[cdnKey] = await computeSha256(file);
  }

  console.log(`Found ${extensionFiles.length} extension files`);

  // ========================================
  // 3. Discover monorepo root files
  // ========================================
  const monorepoFiles = await glob([
    '*.md',      // All .md files at monorepo root (not recursive)
    'LICENSE',   // LICENSE file
  ], {
    cwd: MONOREPO_ROOT,
  });

  console.log(`Found ${monorepoFiles.length} monorepo root files`);

  // ========================================
  // 4. Compute hashes for monorepo root files
  // ========================================
  for (const file of monorepoFiles.sort()) {
    const localPath = `${MONOREPO_ROOT}/${file}`;

    // Verify file exists (defensive check)
    if (!(await fileExists(localPath))) {
      console.warn(`Warning: Monorepo file not found: ${file}`);
      continue;
    }

    // CDN key for monorepo root: just the filename
    hashes[file] = await computeSha256(localPath);
  }

  // ========================================
  // 5. Generate DOCUMENT_HASHES block
  // ========================================
  const totalFiles = Object.keys(hashes).length;

  // Sort entries by key for consistent diffs
  const entries = Object.entries(hashes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, hash]) => `  '${path}': '${hash}',`)
    .join('\n');

  const hashBlock = `export const DOCUMENT_HASHES: Record<string, string> = {\n${entries}\n};`;

  // ========================================
  // 6. Read and update the file
  // ========================================
  let content;
  try {
    content = await readFile(HASH_FILE, 'utf-8');
  } catch (error) {
    console.error(`Error: Cannot read ${HASH_FILE}:`, error.message);
    process.exit(1);
  }

  // Check if DOCUMENT_HASHES block exists
  const hashBlockRegex = /export const DOCUMENT_HASHES: Record<string, string> = \{[\s\S]*?\};/;
  if (!hashBlockRegex.test(content)) {
    console.error('Error: Could not find DOCUMENT_HASHES block in file');
    process.exit(1);
  }

  // Replace DOCUMENT_HASHES block
  const originalContent = content;
  content = content.replace(hashBlockRegex, hashBlock);

  // Check if there are actual changes
  if (content === originalContent) {
    console.log(`\nDOCUMENT_HASHES is already up to date (${totalFiles} files)`);
    process.exit(0);  // Success - no changes needed
  }

  await writeFile(HASH_FILE, content);
  console.log(`\nRegenerated DOCUMENT_HASHES with ${totalFiles} files`);

  // ========================================
  // 7. List all files for verification
  // ========================================
  console.log('\nFiles included:');

  // Separate extension and monorepo files for clarity
  const extensionKeys = Object.keys(hashes)
    .filter(k => k.startsWith(EXTENSION_CDN_PREFIX))
    .sort();
  const monorepoKeys = Object.keys(hashes)
    .filter(k => !k.startsWith(EXTENSION_CDN_PREFIX))
    .sort();

  if (extensionKeys.length > 0) {
    console.log('\n  [Extension files]');
    for (const key of extensionKeys) {
      console.log(`    - ${key}`);
    }
  }

  if (monorepoKeys.length > 0) {
    console.log('\n  [Monorepo root files]');
    for (const key of monorepoKeys) {
      console.log(`    - ${key}`);
    }
  }
}

main().catch(err => {
  console.error('Error updating hashes:', err);
  process.exit(1);
});
