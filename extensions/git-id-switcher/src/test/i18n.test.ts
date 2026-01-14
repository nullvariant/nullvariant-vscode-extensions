/**
 * i18n Translation Key Coverage Tests
 *
 * This test file ensures all translation keys in the base English files
 * are present in all supported language files.
 *
 * ## Two i18n Systems:
 * 1. package.nls.*.json - Settings names (used by VS Code for package.json)
 * 2. l10n/bundle.l10n.*.json - Source code strings (used by vscode.l10n.t())
 *
 * ## Supported Languages (16):
 * ja, zh-CN, zh-TW, ko, de, fr, it, es, pt-BR, ru, hu, cs, pl, bg, uk, tr
 *
 * ## Test Functions:
 * 1. testPackageNlsKeyCoverage - Validates package.nls.*.json key coverage
 * 2. testBundleL10nKeyCoverage - Validates l10n/bundle.l10n.*.json key coverage
 * 3. testNoExtraKeysInTranslations - Detects obsolete keys in translations
 *
 * Total: 3 test functions
 */

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Constants
// ============================================================================

/**
 * Supported language codes (16 languages)
 * These match the package.nls.*.json and l10n/bundle.l10n.*.json files
 */
const SUPPORTED_LANGUAGES = [
  'ja',
  'zh-CN',
  'zh-TW',
  'ko',
  'de',
  'fr',
  'it',
  'es',
  'pt-BR',
  'ru',
  'hu',
  'cs',
  'pl',
  'bg',
  'uk',
  'tr',
] as const;

/**
 * Extension root path (relative to compiled test output)
 */
function getExtensionRoot(): string {
  // When compiled, this file is at out/test/i18n.test.js
  // Extension root is 2 levels up
  return path.resolve(__dirname, '..', '..');
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Read and parse a JSON file
 */
function readJsonFile(filePath: string): Record<string, string> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read JSON file: ${filePath} (${message})`);
  }
}

/**
 * Get keys from a JSON file
 */
function getKeysFromFile(filePath: string): string[] {
  const json = readJsonFile(filePath);
  return Object.keys(json);
}

/**
 * Find missing keys between base and translation
 */
function findMissingKeys(baseKeys: string[], translationKeys: string[]): string[] {
  const translationKeySet = new Set(translationKeys);
  return baseKeys.filter(key => !translationKeySet.has(key));
}

/**
 * Find extra keys in translation that don't exist in base
 */
function findExtraKeys(baseKeys: string[], translationKeys: string[]): string[] {
  const baseKeySet = new Set(baseKeys);
  return translationKeys.filter(key => !baseKeySet.has(key));
}

/**
 * Aggregate missing keys across all languages to identify common gaps
 */
function aggregateMissingKeys(
  allMissing: { lang: string; missingKeys: string[] }[]
): { key: string; languages: string[] }[] {
  const keyToLanguages = new Map<string, string[]>();

  for (const { lang, missingKeys } of allMissing) {
    for (const key of missingKeys) {
      if (key === 'FILE_NOT_FOUND') continue;
      const langs = keyToLanguages.get(key) || [];
      langs.push(lang);
      keyToLanguages.set(key, langs);
    }
  }

  return Array.from(keyToLanguages.entries())
    .map(([key, languages]) => ({ key, languages }))
    .sort((a, b) => b.languages.length - a.languages.length);
}

// ============================================================================
// Test Functions
// ============================================================================

/**
 * Test 1: package.nls.*.json key coverage
 *
 * Validates that all keys in package.nls.json (English base) exist in
 * all 16 language-specific package.nls.{lang}.json files.
 */
function testPackageNlsKeyCoverage(): void {
  console.log('Testing package.nls.*.json key coverage...');

  const extensionRoot = getExtensionRoot();
  const baseFilePath = path.join(extensionRoot, 'package.nls.json');
  const baseKeys = getKeysFromFile(baseFilePath);

  console.log(`  Base file (package.nls.json): ${baseKeys.length} keys`);

  const allMissing: { lang: string; missingKeys: string[] }[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    const langFilePath = path.join(extensionRoot, `package.nls.${lang}.json`);

    // Check if file exists
    if (!fs.existsSync(langFilePath)) {
      allMissing.push({ lang, missingKeys: ['FILE_NOT_FOUND'] });
      console.log(`  [FAIL] package.nls.${lang}.json: FILE NOT FOUND`);
      continue;
    }

    const langKeys = getKeysFromFile(langFilePath);
    const missingKeys = findMissingKeys(baseKeys, langKeys);

    if (missingKeys.length > 0) {
      allMissing.push({ lang, missingKeys });
      console.log(`  [FAIL] package.nls.${lang}.json: ${missingKeys.length} missing keys`);
      missingKeys.forEach(key => console.log(`         - ${key}`));
    } else {
      console.log(`  [PASS] package.nls.${lang}.json: ${langKeys.length} keys (complete)`);
    }
  }

  if (allMissing.length > 0) {
    const totalMissingKeys = allMissing.reduce((sum, { missingKeys }) => sum + missingKeys.length, 0);
    const aggregated = aggregateMissingKeys(allMissing);
    const keysSummary = aggregated
      .map(({ key, languages }) => `  - "${key}" (missing in ${languages.length} languages)`)
      .join('\n');

    assert.fail(
      `package.nls.*.json translation key coverage failed!\n` +
        `\nMissing keys (sorted by frequency):\n${keysSummary}\n\n` +
        `Summary: ${aggregated.length} unique key(s) missing, ${totalMissingKeys} total gap(s) across ${allMissing.length}/${SUPPORTED_LANGUAGES.length} languages.`
    );
  }

  console.log(
    `  All ${SUPPORTED_LANGUAGES.length} languages have complete package.nls translations.`
  );
}

/**
 * Test 2: l10n/bundle.l10n.*.json key coverage
 *
 * Validates that all keys in l10n/bundle.l10n.json (English base) exist in
 * all 16 language-specific l10n/bundle.l10n.{lang}.json files.
 */
function testBundleL10nKeyCoverage(): void {
  console.log('Testing l10n/bundle.l10n.*.json key coverage...');

  const extensionRoot = getExtensionRoot();
  const baseFilePath = path.join(extensionRoot, 'l10n', 'bundle.l10n.json');
  const baseKeys = getKeysFromFile(baseFilePath);

  console.log(`  Base file (bundle.l10n.json): ${baseKeys.length} keys`);

  const allMissing: { lang: string; missingKeys: string[] }[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    const langFilePath = path.join(extensionRoot, 'l10n', `bundle.l10n.${lang}.json`);

    // Check if file exists
    if (!fs.existsSync(langFilePath)) {
      allMissing.push({ lang, missingKeys: ['FILE_NOT_FOUND'] });
      console.log(`  [FAIL] bundle.l10n.${lang}.json: FILE NOT FOUND`);
      continue;
    }

    const langKeys = getKeysFromFile(langFilePath);
    const missingKeys = findMissingKeys(baseKeys, langKeys);

    if (missingKeys.length > 0) {
      allMissing.push({ lang, missingKeys });
      console.log(`  [FAIL] bundle.l10n.${lang}.json: ${missingKeys.length} missing keys`);
      missingKeys.forEach(key => console.log(`         - ${key}`));
    } else {
      console.log(`  [PASS] bundle.l10n.${lang}.json: ${langKeys.length} keys (complete)`);
    }
  }

  if (allMissing.length > 0) {
    const totalMissingKeys = allMissing.reduce((sum, { missingKeys }) => sum + missingKeys.length, 0);
    const aggregated = aggregateMissingKeys(allMissing);
    const keysSummary = aggregated
      .map(({ key, languages }) => `  - "${key}" (missing in ${languages.length} languages)`)
      .join('\n');

    assert.fail(
      `l10n/bundle.l10n.*.json translation key coverage failed!\n` +
        `\nMissing keys (sorted by frequency):\n${keysSummary}\n\n` +
        `Summary: ${aggregated.length} unique key(s) missing, ${totalMissingKeys} total gap(s) across ${allMissing.length}/${SUPPORTED_LANGUAGES.length} languages.`
    );
  }

  console.log(
    `  All ${SUPPORTED_LANGUAGES.length} languages have complete bundle.l10n translations.`
  );
}

/**
 * Test 3: No extra (obsolete) keys in translations
 *
 * Detects keys that exist in translation files but not in the English base.
 * These are likely obsolete keys from removed features.
 */
function testNoExtraKeysInTranslations(): void {
  console.log('Testing for obsolete keys in translations...');

  const extensionRoot = getExtensionRoot();

  // Check package.nls files
  const packageNlsBaseKeys = getKeysFromFile(path.join(extensionRoot, 'package.nls.json'));
  const packageNlsExtras: { lang: string; extraKeys: string[] }[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    const langFilePath = path.join(extensionRoot, `package.nls.${lang}.json`);
    if (fs.existsSync(langFilePath)) {
      const langKeys = getKeysFromFile(langFilePath);
      const extraKeys = findExtraKeys(packageNlsBaseKeys, langKeys);
      if (extraKeys.length > 0) {
        packageNlsExtras.push({ lang, extraKeys });
        console.log(`  [WARN] package.nls.${lang}.json: ${extraKeys.length} obsolete keys`);
        extraKeys.forEach(key => console.log(`         - ${key}`));
      }
    }
  }

  // Check l10n files
  const l10nBaseKeys = getKeysFromFile(path.join(extensionRoot, 'l10n', 'bundle.l10n.json'));
  const l10nExtras: { lang: string; extraKeys: string[] }[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    const langFilePath = path.join(extensionRoot, 'l10n', `bundle.l10n.${lang}.json`);
    if (fs.existsSync(langFilePath)) {
      const langKeys = getKeysFromFile(langFilePath);
      const extraKeys = findExtraKeys(l10nBaseKeys, langKeys);
      if (extraKeys.length > 0) {
        l10nExtras.push({ lang, extraKeys });
        console.log(`  [WARN] bundle.l10n.${lang}.json: ${extraKeys.length} obsolete keys`);
        extraKeys.forEach(key => console.log(`         - ${key}`));
      }
    }
  }

  // This is a warning test - we don't fail on extra keys, just report them
  const totalExtras = packageNlsExtras.length + l10nExtras.length;
  if (totalExtras === 0) {
    console.log('  No obsolete keys found in any translation files.');
  } else {
    console.log(`  Found obsolete keys in ${totalExtras} files. Consider cleanup.`);
  }
}

// ============================================================================
// Test Runner
// ============================================================================

/**
 * Run all i18n tests
 *
 * Runs all tests and collects errors, then reports them at the end.
 * This ensures all tests run even if some fail.
 */
export function runI18nTests(): void {
  console.log('='.repeat(70));
  console.log('i18n Translation Key Coverage Tests');
  console.log('='.repeat(70));

  const errors: Error[] = [];

  // Run package.nls tests
  try {
    testPackageNlsKeyCoverage();
  } catch (error) {
    errors.push(error instanceof Error ? error : new Error(String(error)));
  }

  // Run bundle.l10n tests
  try {
    testBundleL10nKeyCoverage();
  } catch (error) {
    errors.push(error instanceof Error ? error : new Error(String(error)));
  }

  // Run obsolete keys detection (this doesn't throw)
  testNoExtraKeysInTranslations();

  console.log('='.repeat(70));

  if (errors.length > 0) {
    console.log(`i18n tests completed with ${errors.length} failure(s).`);
    console.log('='.repeat(70));
    // Re-throw the first error to fail the test suite
    throw errors[0];
  }

  console.log('All i18n tests passed!');
  console.log('='.repeat(70));
}

// Export individual test functions for VS Code test runner
export { testPackageNlsKeyCoverage, testBundleL10nKeyCoverage, testNoExtraKeysInTranslations };

// Run tests when executed directly
if (require.main === module) {
  runI18nTests();
}
