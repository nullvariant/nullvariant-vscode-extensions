#!/usr/bin/env node
/**
 * Update DOCUMENT_HASHES in documentation.internal.ts
 *
 * Target files:
 * - ALL .md files (anywhere in the extension directory)
 * - LICENSE (only non-.md exception, explicitly included)
 *
 * This ensures any new .md file is automatically detected.
 *
 * Usage: node scripts/update-doc-hashes.mjs
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'glob';

const HASH_FILE = 'src/documentation.internal.ts';

/**
 * Compute SHA-256 hash of file content
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
async function computeSha256(filePath) {
  const content = await readFile(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

async function main() {
  // Discover ALL .md files + LICENSE (the only non-.md exception)
  const allFiles = await glob([
    '**/*.md',   // All .md files anywhere
    'LICENSE',   // Only non-.md exception
  ], {
    ignore: [
      'node_modules/**',
      'out/**',
      '.vscode-test/**',
    ],
  });

  if (allFiles.length === 0) {
    console.error('Error: No files found. Are you running from the correct directory?');
    process.exit(1);
  }

  // Compute hashes for all discovered files
  const hashes = {};
  for (const file of allFiles.sort()) {
    hashes[file] = await computeSha256(file);
  }

  // Generate DOCUMENT_HASHES entries
  const entries = Object.entries(hashes)
    .map(([path, hash]) => `  '${path}': '${hash}',`)
    .join('\n');

  const hashBlock = `export const DOCUMENT_HASHES: Record<string, string> = {\n${entries}\n};`;

  // Read and update the file
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
    console.log(`DOCUMENT_HASHES is already up to date (${Object.keys(hashes).length} files)`);
    process.exit(0);  // Success - no changes needed
  }

  await writeFile(HASH_FILE, content);
  console.log(`Regenerated DOCUMENT_HASHES with ${Object.keys(hashes).length} files`);

  // List all files for verification
  console.log('\nFiles included:');
  for (const file of Object.keys(hashes).sort()) {
    console.log(`  - ${file}`);
  }
}

main().catch(err => {
  console.error('Error updating hashes:', err);
  process.exit(1);
});
