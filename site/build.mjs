// @ts-check
/**
 * Builds the static site served at https://variant.fit from the extension
 * manifests in this monorepo. Each extension's package.json and its English
 * package.nls.json are the single source of truth: the site copies no prose,
 * so the pages cannot drift from what the Marketplace shows.
 *
 * Uses only the Node.js standard library, so the site ships no runtime dependency.
 *
 * @sideeffect Removes and rewrites the output directory (default: site/dist).
 */
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SITE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_URL = "https://github.com/nullvariant/nullvariant-vscode-extensions";
const SITE_TITLE = "Null;Variant VS Code Extensions";
const LIST_ICON_SIZE = 64;
const PAGE_ICON_SIZE = 96;

/**
 * @typedef {object} ManifestProperty
 * @property {string | string[]} [type]
 * @property {string} [description]
 * @property {string} [markdownDescription]
 */
/**
 * @typedef {object} ManifestConfiguration
 * @property {Record<string, ManifestProperty>} [properties]
 */
/**
 * @typedef {object} ManifestCommand
 * @property {string} command
 * @property {string} title
 * @property {string} [category]
 */
/**
 * The fields of an extension's package.json that the site reads.
 * @typedef {object} Manifest
 * @property {string} [name]
 * @property {string} [publisher]
 * @property {string} [displayName]
 * @property {string} [description]
 * @property {string} [version]
 * @property {string} [license]
 * @property {string} [homepage]
 * @property {string} [icon]
 * @property {{ commands?: ManifestCommand[], configuration?: ManifestConfiguration | ManifestConfiguration[] }} [contributes]
 */
/** @typedef {{ command: string, title: string, category: string }} Command */
/** @typedef {{ key: string, type: string, description: string }} Setting */
/**
 * @typedef {object} Extension
 * @property {string} directory   Directory name under extensions/
 * @property {string} id          Marketplace item name, e.g. nullvariant.git-id-switcher
 * @property {string} publisher
 * @property {string} name
 * @property {string} displayName
 * @property {string} description
 * @property {string} version
 * @property {string} license
 * @property {string} readmeUrl
 * @property {string} iconPath    Absolute path of the icon in the repository, or ""
 * @property {Command[]} commands
 * @property {Setting[]} settings
 */

/**
 * Escapes text for safe use in HTML text and double-quoted attributes.
 * Every value taken from a manifest passes through here.
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Replaces a VS Code localization placeholder (%key%) with its English text.
 * A missing key fails the build, so a page never shows a raw placeholder.
 * @param {string | undefined} value
 * @param {Record<string, string>} nls
 * @returns {string}
 */
export function localize(value, nls) {
  if (value === undefined) {
    return "";
  }
  if (!value.startsWith("%") || !value.endsWith("%") || value.length <= 2) {
    return value;
  }
  const key = value.slice(1, -1);
  const text = nls[key];
  if (text === undefined) {
    throw new Error(`Missing English text for placeholder ${value}`);
  }
  return text;
}

/**
 * @param {string} filePath
 * @returns {Promise<unknown>}
 */
async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

/**
 * Returns a manifest field the site cannot do without, or fails the build.
 * @param {Manifest} manifest
 * @param {"name" | "publisher" | "version"} field
 * @param {string} directory
 * @returns {string}
 */
function requireField(manifest, field, directory) {
  const value = manifest[field];
  if (value === undefined || value === "") {
    throw new Error(`extensions/${directory}/package.json has no "${field}"`);
  }
  return value;
}

/**
 * @param {Manifest} manifest
 * @param {Record<string, string>} nls
 * @returns {Setting[]}
 */
function readSettings(manifest, nls) {
  const configuration = manifest.contributes?.configuration ?? [];
  const groups = Array.isArray(configuration) ? configuration : [configuration];
  return groups.flatMap((group) =>
    Object.entries(group.properties ?? {}).map(([key, property]) => ({
      key,
      type: Array.isArray(property.type) ? property.type.join(" | ") : (property.type ?? ""),
      description: localize(property.description ?? property.markdownDescription, nls),
    })),
  );
}

/**
 * Reads one extension's manifest into the shape the pages need.
 * @param {string} extensionsDir
 * @param {string} directory
 * @returns {Promise<Extension>}
 */
export async function readExtension(extensionsDir, directory) {
  const base = path.join(extensionsDir, directory);
  const manifest = /** @type {Manifest} */ (await readJson(path.join(base, "package.json")));
  const nls = /** @type {Record<string, string>} */ (await readJson(path.join(base, "package.nls.json")));
  const publisher = requireField(manifest, "publisher", directory);
  const name = requireField(manifest, "name", directory);

  return {
    directory,
    id: `${publisher}.${name}`,
    publisher,
    name,
    displayName: localize(manifest.displayName, nls) || name,
    description: localize(manifest.description, nls),
    version: requireField(manifest, "version", directory),
    license: manifest.license ?? "",
    readmeUrl: manifest.homepage ?? `${REPOSITORY_URL}/tree/main/extensions/${directory}#readme`,
    iconPath: manifest.icon ? path.join(base, manifest.icon) : "",
    commands: (manifest.contributes?.commands ?? []).map((command) => ({
      command: command.command,
      title: localize(command.title, nls),
      category: localize(command.category, nls),
    })),
    settings: readSettings(manifest, nls),
  };
}

/**
 * Tells whether a directory under extensions/ holds a published extension:
 * a package.json with a publisher.
 * @param {string} directoryPath
 * @returns {Promise<boolean>}
 */
async function isExtension(directoryPath) {
  try {
    const manifest = /** @type {Manifest} */ (await readJson(path.join(directoryPath, "package.json")));
    return Boolean(manifest.publisher);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * Lists the extensions in the monorepo, in directory-name order.
 * @param {string} extensionsDir
 * @returns {Promise<Extension[]>}
 */
export async function readExtensions(extensionsDir) {
  const entries = await readdir(extensionsDir, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted((a, b) => a.localeCompare(b));
  const published = await Promise.all(directories.map((directory) => isExtension(path.join(extensionsDir, directory))));
  const extensionDirectories = directories.filter((_, index) => published[index]);
  const extensions = await Promise.all(
    extensionDirectories.map((directory) => readExtension(extensionsDir, directory)),
  );
  if (extensions.length === 0) {
    throw new Error(`No extensions found under ${extensionsDir}`);
  }
  return extensions;
}

/**
 * Wraps page content in the shared document skeleton.
 * @param {{ title: string, description: string, body: string, root: string }} page
 *   root is the path from the page to the site root: "./", "../", or "/" for
 *   the 404 page, which is served at any depth.
 * @returns {string}
 */
export function renderDocument({ title, description, body, root }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="stylesheet" href="${root}style.css">
</head>
<body>
<header class="site-header"><a href="${root}">${escapeHtml(SITE_TITLE)}</a></header>
<main>
${body}
</main>
<footer class="site-footer">
<p>Published on the Visual Studio Marketplace as <code>nullvariant</code>. Source code: <a href="${REPOSITORY_URL}">nullvariant/nullvariant-vscode-extensions</a> on GitHub.</p>
</footer>
</body>
</html>
`;
}

/**
 * @param {Extension} extension
 * @returns {string}
 */
function marketplaceUrl(extension) {
  return `https://marketplace.visualstudio.com/items?itemName=${encodeURIComponent(extension.id)}`;
}

/**
 * @param {Extension} extension
 * @returns {string}
 */
function openVsxUrl(extension) {
  return `https://open-vsx.org/extension/${encodeURIComponent(extension.publisher)}/${encodeURIComponent(extension.name)}`;
}

/**
 * @param {Extension} extension
 * @param {string} source
 * @param {number} size
 * @returns {string}
 */
function renderIcon(extension, source, size) {
  return extension.iconPath ? `<img src="${source}" alt="" width="${size}" height="${size}">` : "";
}

/**
 * @param {Extension[]} extensions
 * @returns {string}
 */
export function renderIndex(extensions) {
  const items = extensions
    .map((extension) => {
      const pagePath = `./${escapeHtml(extension.name)}/`;
      return `<li>
<a class="extension-link" href="${pagePath}">
${renderIcon(extension, `${pagePath}icon.png`, LIST_ICON_SIZE)}
<span><strong>${escapeHtml(extension.displayName)}</strong><br>${escapeHtml(extension.description)}</span>
</a>
</li>`;
    })
    .join("\n");
  return renderDocument({
    title: SITE_TITLE,
    description: "Visual Studio Code extensions published by nullvariant: what each one does and how to use it.",
    root: "./",
    body: `<h1>${escapeHtml(SITE_TITLE)}</h1>
<p>Extensions for Visual Studio Code published by <code>nullvariant</code> on the Visual Studio Marketplace and Open VSX.</p>
<ul class="extensions">
${items}
</ul>`,
  });
}

/**
 * @param {Command} command
 * @returns {string}
 */
function renderCommandRow(command) {
  const title = command.category ? `${command.category}: ${command.title}` : command.title;
  return `<tr><td>${escapeHtml(title)}</td><td><code>${escapeHtml(command.command)}</code></td></tr>`;
}

/**
 * @param {Setting} setting
 * @returns {string}
 */
function renderSettingRow(setting) {
  return `<tr><td><code>${escapeHtml(setting.key)}</code></td><td>${escapeHtml(setting.type)}</td><td>${escapeHtml(setting.description)}</td></tr>`;
}

/**
 * @param {Extension} extension
 * @returns {string}
 */
export function renderExtension(extension) {
  const meta = [`Version ${extension.version}`, extension.license ? `${extension.license} License` : ""]
    .filter(Boolean)
    .map((item) => escapeHtml(item))
    .join(" · ");
  return renderDocument({
    title: `${extension.displayName} — ${SITE_TITLE}`,
    description: extension.description,
    root: "../",
    body: `<div class="extension-heading">
${renderIcon(extension, "./icon.png", PAGE_ICON_SIZE)}
<div>
<h1>${escapeHtml(extension.displayName)}</h1>
<p class="lead">${escapeHtml(extension.description)}</p>
<p class="meta">${meta} · <code>${escapeHtml(extension.id)}</code></p>
</div>
</div>

<h2>Install</h2>
<p>Install from the <a href="${escapeHtml(marketplaceUrl(extension))}">Visual Studio Marketplace</a> or <a href="${escapeHtml(openVsxUrl(extension))}">Open VSX</a>, or run:</p>
<pre><code>code --install-extension ${escapeHtml(extension.id)}</code></pre>

<h2>Usage</h2>
<p>Configure the extension in the settings below, then run its commands from the Command Palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, or <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on macOS). The <a href="${escapeHtml(extension.readmeUrl)}">README</a> walks through setup step by step, with full examples and troubleshooting.</p>

<h2>Commands</h2>
<div class="table-scroll">
<table>
<thead><tr><th>Command Palette title</th><th>Command ID</th></tr></thead>
<tbody>
${extension.commands.map((command) => renderCommandRow(command)).join("\n")}
</tbody>
</table>
</div>

<h2>Settings</h2>
<div class="table-scroll">
<table>
<thead><tr><th>Setting</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
${extension.settings.map((setting) => renderSettingRow(setting)).join("\n")}
</tbody>
</table>
</div>

<h2>Links</h2>
<ul>
<li><a href="${escapeHtml(extension.readmeUrl)}">README</a></li>
<li><a href="${REPOSITORY_URL}/blob/main/extensions/${escapeHtml(extension.directory)}/CHANGELOG.md">Changelog</a></li>
<li><a href="${REPOSITORY_URL}/blob/main/SECURITY.md">Security policy and how to verify the genuine extension</a></li>
<li><a href="${REPOSITORY_URL}/issues">Issues</a></li>
</ul>`,
  });
}

/**
 * @returns {string}
 */
export function renderNotFound() {
  return renderDocument({
    title: `Not Found — ${SITE_TITLE}`,
    description: "The page was not found.",
    root: "/",
    body: `<h1>Not Found</h1>
<p>There is no page at this address. See the <a href="/">list of extensions</a>.</p>`,
  });
}

/**
 * Builds the whole site into outDir.
 * @param {{ repositoryRoot?: string | undefined, outDir?: string | undefined }} [options]
 *   Each option falls back to its default when omitted or undefined.
 * @returns {Promise<Extension[]>}
 */
export async function build({ repositoryRoot = path.join(SITE_DIR, ".."), outDir = path.join(SITE_DIR, "dist") } = {}) {
  const extensions = await readExtensions(path.join(path.resolve(repositoryRoot), "extensions"));
  const out = path.resolve(outDir);

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  const staticFiles = await readdir(path.join(SITE_DIR, "static"));
  await Promise.all([
    ...staticFiles.map((file) => copyFile(path.join(SITE_DIR, "static", file), path.join(out, file))),
    writeFile(path.join(out, "index.html"), renderIndex(extensions)),
    writeFile(path.join(out, "404.html"), renderNotFound()),
    ...extensions.map((extension) => writeExtensionPage(out, extension)),
  ]);
  return extensions;
}

/**
 * Writes one extension's page directory: index.html and, if it has one, its icon.
 * @param {string} out
 * @param {Extension} extension
 * @returns {Promise<void>}
 */
async function writeExtensionPage(out, extension) {
  const pageDir = path.join(out, extension.name);
  await mkdir(pageDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(pageDir, "index.html"), renderExtension(extension)),
    extension.iconPath ? copyFile(extension.iconPath, path.join(pageDir, "icon.png")) : undefined,
  ]);
}

/**
 * Command-line entry: builds the site from this repository into site/dist.
 * It takes no arguments, so no path from outside reaches the build (which
 * empties its output directory first).
 * @returns {Promise<void>}
 */
export async function main() {
  const extensions = await build();
  process.stdout.write(`Built ${extensions.length} extension page(s)\n`);
}

if (import.meta.main) {
  await main();
}
