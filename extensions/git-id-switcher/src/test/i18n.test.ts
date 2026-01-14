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
  'ja', 'zh-CN', 'zh-TW', 'ko', 'de', 'fr', 'it', 'es',
  'pt-BR', 'ru', 'hu', 'cs', 'pl', 'bg', 'uk', 'tr',
] as const;

/**
 * Extension root path (relative to compiled test output)
 */
function getExtensionRoot(): string {
  return path.resolve(__dirname, '..', '..');
}

// ============================================================================
// Types
// ============================================================================

interface TranslationConfig {
  name: string;
  baseFile: string;
  getLanguageFile: (lang: string) => string;
}

interface KeyGap {
  lang: string;
  keys: string[];
}

interface AggregatedKeyGap {
  key: string;
  languages: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

function readJsonFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function getKeysFromFile(filePath: string): string[] {
  return Object.keys(readJsonFile(filePath));
}

function findKeyDifference(source: string[], target: string[]): string[] {
  const targetSet = new Set(target);
  return source.filter(key => !targetSet.has(key));
}

function aggregateKeyGaps(gaps: KeyGap[]): AggregatedKeyGap[] {
  const keyToLanguages = new Map<string, string[]>();
  for (const { lang, keys } of gaps) {
    for (const key of keys) {
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
// Core Test Logic
// ============================================================================

/**
 * Generic key coverage test for any translation file type.
 * Returns gaps found, or throws assertion error if gaps exist.
 */
function testKeyCoverage(config: TranslationConfig): void {
  console.log(`Testing ${config.name} key coverage...`);
  const extensionRoot = getExtensionRoot();
  const baseFilePath = path.join(extensionRoot, config.baseFile);
  const baseKeys = getKeysFromFile(baseFilePath);
  console.log(`  Base file: ${baseKeys.length} keys`);

  const gaps: KeyGap[] = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    const langFilePath = path.join(extensionRoot, config.getLanguageFile(lang));
    if (!fs.existsSync(langFilePath)) {
      gaps.push({ lang, keys: ['FILE_NOT_FOUND'] });
      console.log(`  [FAIL] ${lang}: FILE NOT FOUND`);
      continue;
    }
    const langKeys = getKeysFromFile(langFilePath);
    const missing = findKeyDifference(baseKeys, langKeys);
    if (missing.length > 0) {
      gaps.push({ lang, keys: missing });
      console.log(`  [FAIL] ${lang}: ${missing.length} missing - ${missing.join(', ')}`);
    } else {
      console.log(`  [PASS] ${lang}: ${langKeys.length} keys (complete)`);
    }
  }

  if (gaps.length > 0) {
    const aggregated = aggregateKeyGaps(gaps);
    const summary = aggregated.map(g => `"${g.key}" (${g.languages.length} langs)`).join(', ');
    assert.fail(`${config.name} coverage failed: ${summary}`);
  }
  console.log(`  All ${SUPPORTED_LANGUAGES.length} languages complete.`);
}

/**
 * Detect obsolete keys in translations that don't exist in base.
 */
function detectObsoleteKeys(config: TranslationConfig): KeyGap[] {
  const extensionRoot = getExtensionRoot();
  const baseKeys = getKeysFromFile(path.join(extensionRoot, config.baseFile));
  const extras: KeyGap[] = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    const langFilePath = path.join(extensionRoot, config.getLanguageFile(lang));
    if (fs.existsSync(langFilePath)) {
      const extra = findKeyDifference(getKeysFromFile(langFilePath), baseKeys);
      if (extra.length > 0) {
        extras.push({ lang, keys: extra });
        console.log(`  [WARN] ${config.name} ${lang}: ${extra.length} obsolete - ${extra.join(', ')}`);
      }
    }
  }
  return extras;
}

// ============================================================================
// Translation Configurations
// ============================================================================

const PACKAGE_NLS_CONFIG: TranslationConfig = {
  name: 'package.nls',
  baseFile: 'package.nls.json',
  getLanguageFile: (lang) => `package.nls.${lang}.json`,
};

const BUNDLE_L10N_CONFIG: TranslationConfig = {
  name: 'bundle.l10n',
  baseFile: path.join('l10n', 'bundle.l10n.json'),
  getLanguageFile: (lang) => path.join('l10n', `bundle.l10n.${lang}.json`),
};

// ============================================================================
// Exported Test Functions
// ============================================================================

function testPackageNlsKeyCoverage(): void {
  testKeyCoverage(PACKAGE_NLS_CONFIG);
}

function testBundleL10nKeyCoverage(): void {
  testKeyCoverage(BUNDLE_L10N_CONFIG);
}

function testNoExtraKeysInTranslations(): void {
  console.log('Testing for obsolete keys...');
  const nlsExtras = detectObsoleteKeys(PACKAGE_NLS_CONFIG);
  const l10nExtras = detectObsoleteKeys(BUNDLE_L10N_CONFIG);
  const total = nlsExtras.length + l10nExtras.length;
  console.log(total === 0 ? '  No obsolete keys found.' : `  Found obsolete keys in ${total} files.`);
}

export function runI18nTests(): void {
  console.log('='.repeat(70));
  console.log('i18n Translation Key Coverage Tests');
  console.log('='.repeat(70));

  const errors: Error[] = [];
  [testPackageNlsKeyCoverage, testBundleL10nKeyCoverage].forEach(test => {
    try { test(); } catch (e) { errors.push(e instanceof Error ? e : new Error(String(e))); }
  });
  testNoExtraKeysInTranslations();

  console.log('='.repeat(70));
  if (errors.length > 0) {
    console.log(`${errors.length} failure(s).`);
    throw errors[0];
  }
  console.log('All i18n tests passed!');
}

export { testPackageNlsKeyCoverage, testBundleL10nKeyCoverage, testNoExtraKeysInTranslations };

if (require.main === module) {
  runI18nTests();
}
