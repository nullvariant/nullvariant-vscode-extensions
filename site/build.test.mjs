// @ts-check
/**
 * Tests for the variant.fit site builder. Run with: pnpm --filter variant-fit-site run test
 */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { after, before, describe, it } from "node:test";

import {
  build,
  escapeHtml,
  localize,
  readExtension,
  readExtensions,
  renderExtension,
  renderIndex,
  renderNotFound,
} from "./build.mjs";

const SITE_DIR = path.dirname(fileURLToPath(import.meta.url));
const runFile = promisify(execFile);

/** A complete manifest: every optional field present. */
const FULL_MANIFEST = {
  name: "sample",
  publisher: "nullvariant",
  displayName: "%extension.displayName%",
  description: "%extension.description%",
  version: "1.2.3",
  license: "MIT",
  homepage: "https://example.com/sample#readme",
  icon: "icon.png",
  contributes: {
    commands: [
      { command: "sample.run", title: "%command.run%", category: "Sample" },
      { command: "sample.stop", title: "Stop" },
    ],
    configuration: [
      {
        properties: {
          "sample.enabled": { type: "boolean", description: "%config.enabled%" },
          "sample.mode": { type: ["string", "null"], markdownDescription: "Mode in **Markdown**" },
          "sample.extra": {},
        },
      },
      {},
    ],
  },
};

const FULL_NLS = {
  "extension.displayName": "Sample",
  "extension.description": "Does one thing.",
  "command.run": "Run",
  "config.enabled": "Turns it on.",
};

/**
 * Writes an extension directory with the given manifest and English strings.
 * @param {string} extensionsDir
 * @param {string} directory
 * @param {string | object} manifest  Object written as JSON, or raw text
 * @param {Record<string, string>} [nls]
 * @returns {Promise<string>}
 */
async function writeExtension(extensionsDir, directory, manifest, nls = {}) {
  const base = path.join(extensionsDir, directory);
  await mkdir(base, { recursive: true });
  await writeFile(path.join(base, "package.json"), typeof manifest === "string" ? manifest : JSON.stringify(manifest));
  await writeFile(path.join(base, "package.nls.json"), JSON.stringify(nls));
  return base;
}

/**
 * @param {string} prefix
 * @returns {Promise<string>}
 */
async function makeTemporaryDirectory(prefix) {
  return mkdtemp(path.join(tmpdir(), prefix));
}

describe("escapeHtml", () => {
  it("escapes every character that can break out of text or attributes", () => {
    assert.equal(escapeHtml(`<a href="x" title='y'>&</a>`), "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
  });

  it("returns an empty string unchanged", () => {
    assert.equal(escapeHtml(""), "");
  });
});

describe("localize", () => {
  const nls = { "extension.displayName": "Example" };

  it("replaces a placeholder with its English text", () => {
    assert.equal(localize("%extension.displayName%", nls), "Example");
  });

  it("returns plain text unchanged", () => {
    assert.equal(localize("Plain", nls), "Plain");
  });

  it("returns text that only starts or ends with % unchanged", () => {
    assert.equal(localize("%start", nls), "%start");
    assert.equal(localize("end%", nls), "end%");
  });

  it("returns a bare %% unchanged instead of looking up an empty key", () => {
    assert.equal(localize("%%", nls), "%%");
  });

  it("returns an empty string for a missing value", () => {
    assert.equal(localize(undefined, nls), "");
  });

  it("fails when the English text is missing", () => {
    assert.throws(() => localize("%missing.key%", nls), /Missing English text for placeholder %missing\.key%/);
  });
});

describe("readExtension", () => {
  /** @type {string} */
  let extensionsDir = "";

  before(async () => {
    extensionsDir = await makeTemporaryDirectory("variant-fit-read-");
  });

  after(async () => {
    await rm(extensionsDir, { recursive: true, force: true });
  });

  it("reads every field of a complete manifest", async () => {
    const base = await writeExtension(extensionsDir, "full", FULL_MANIFEST, FULL_NLS);
    const extension = await readExtension(extensionsDir, "full");
    assert.deepEqual(extension, {
      directory: "full",
      id: "nullvariant.sample",
      publisher: "nullvariant",
      name: "sample",
      displayName: "Sample",
      description: "Does one thing.",
      version: "1.2.3",
      license: "MIT",
      readmeUrl: "https://example.com/sample#readme",
      iconPath: path.join(base, "icon.png"),
      commands: [
        { command: "sample.run", title: "Run", category: "Sample" },
        { command: "sample.stop", title: "Stop", category: "" },
      ],
      settings: [
        { key: "sample.enabled", type: "boolean", description: "Turns it on." },
        { key: "sample.mode", type: "string | null", description: "Mode in **Markdown**" },
        { key: "sample.extra", type: "", description: "" },
      ],
    });
  });

  it("falls back to defaults when optional fields are missing", async () => {
    await writeExtension(extensionsDir, "minimal", { name: "minimal", publisher: "nullvariant", version: "0.0.1" });
    const extension = await readExtension(extensionsDir, "minimal");
    assert.equal(extension.displayName, "minimal");
    assert.equal(extension.description, "");
    assert.equal(extension.license, "");
    assert.equal(
      extension.readmeUrl,
      "https://github.com/nullvariant/nullvariant-vscode-extensions/tree/main/extensions/minimal#readme",
    );
    assert.equal(extension.iconPath, "");
    assert.deepEqual(extension.commands, []);
    assert.deepEqual(extension.settings, []);
  });

  it("reads a configuration written as a single object", async () => {
    await writeExtension(extensionsDir, "single", {
      name: "single",
      publisher: "nullvariant",
      version: "0.0.1",
      contributes: { configuration: { properties: { "single.on": { type: "boolean", description: "On." } } } },
    });
    const extension = await readExtension(extensionsDir, "single");
    assert.deepEqual(extension.settings, [{ key: "single.on", type: "boolean", description: "On." }]);
  });

  for (const field of /** @type {const} */ (["publisher", "name", "version"])) {
    it(`fails when "${field}" is missing`, async () => {
      const manifest = { name: "broken", publisher: "nullvariant", version: "0.0.1", [field]: "" };
      await writeExtension(extensionsDir, `no-${field}`, manifest);
      await assert.rejects(
        readExtension(extensionsDir, `no-${field}`),
        new RegExp(String.raw`extensions/no-${field}/package\.json has no "${field}"`),
      );
    });
  }
});

describe("readExtensions", () => {
  /** @type {string} */
  let extensionsDir = "";

  before(async () => {
    extensionsDir = await makeTemporaryDirectory("variant-fit-list-");
  });

  after(async () => {
    await rm(extensionsDir, { recursive: true, force: true });
  });

  it("lists published extensions in directory-name order and skips the rest", async () => {
    await writeExtension(extensionsDir, "b-second", { name: "second", publisher: "nullvariant", version: "1.0.0" });
    await writeExtension(extensionsDir, "a-first", { name: "first", publisher: "nullvariant", version: "1.0.0" });
    await writeExtension(extensionsDir, "c-unpublished", { name: "unpublished", version: "1.0.0" });
    await mkdir(path.join(extensionsDir, "d-no-manifest"));
    await writeFile(path.join(extensionsDir, "e-file.txt"), "not a directory");

    const extensions = await readExtensions(extensionsDir);
    assert.deepEqual(
      extensions.map((extension) => extension.id),
      ["nullvariant.first", "nullvariant.second"],
    );
  });

  it("fails on a manifest that is not valid JSON", async () => {
    const brokenDir = await makeTemporaryDirectory("variant-fit-broken-");
    try {
      await writeExtension(brokenDir, "broken", "{ not json");
      await assert.rejects(readExtensions(brokenDir), SyntaxError);
    } finally {
      await rm(brokenDir, { recursive: true, force: true });
    }
  });

  it("fails when there is no extension to publish", async () => {
    const emptyDir = await makeTemporaryDirectory("variant-fit-empty-");
    try {
      await assert.rejects(readExtensions(emptyDir), /No extensions found/);
    } finally {
      await rm(emptyDir, { recursive: true, force: true });
    }
  });
});

describe("rendering", () => {
  /** @type {import("./build.mjs").Extension} */
  const extension = {
    directory: "x",
    id: "p.x",
    publisher: "p",
    name: "x",
    displayName: `<img src=x onerror="alert('x')">`,
    description: "d",
    version: "1.0.0",
    license: "",
    readmeUrl: "https://example.com/readme",
    iconPath: "",
    commands: [],
    settings: [],
  };

  it("escapes manifest values in the extension page", () => {
    const html = renderExtension(extension);
    assert.ok(!html.includes("<img src=x"));
    assert.ok(html.includes("<h1>&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;</h1>"));
  });

  it("leaves the license out of the extension page when there is none", () => {
    assert.ok(renderExtension(extension).includes('<p class="meta">Version 1.0.0 · <code>p.x</code></p>'));
  });

  it("shows no icon when the extension has none", () => {
    assert.ok(!renderExtension(extension).includes("<img"));
    assert.ok(!renderIndex([extension]).includes("<img"));
  });

  it("links the 404 page from the site root, since it is served at any depth", () => {
    const html = renderNotFound();
    assert.ok(html.includes('<link rel="stylesheet" href="/style.css">'));
    assert.ok(html.includes('<a href="/">'));
  });
});

describe("build", () => {
  /** @type {string} */
  let root = "";
  /** @type {string} */
  let outDir = "";

  before(async () => {
    root = await makeTemporaryDirectory("variant-fit-build-");
    outDir = path.join(root, "dist");
    const extensionsDir = path.join(root, "extensions");
    const base = await writeExtension(extensionsDir, "sample", FULL_MANIFEST, FULL_NLS);
    await writeFile(path.join(base, "icon.png"), "icon");
    await writeExtension(extensionsDir, "plain", { name: "plain", publisher: "nullvariant", version: "2.0.0" });
  });

  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("writes the index, the extension pages, the 404 page, and the static files", async () => {
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "stale.html"), "left from a previous build");

    const extensions = await build({ repositoryRoot: root, outDir });
    assert.deepEqual(
      extensions.map((extension) => extension.id),
      ["nullvariant.plain", "nullvariant.sample"],
    );

    const index = await readFile(path.join(outDir, "index.html"), "utf8");
    assert.ok(index.includes('href="./sample/"'));
    assert.ok(index.includes('<img src="./sample/icon.png" alt="" width="64" height="64">'));
    assert.ok(index.includes("Does one thing."));

    const page = await readFile(path.join(outDir, "sample", "index.html"), "utf8");
    assert.ok(page.includes("code --install-extension nullvariant.sample"));
    assert.ok(page.includes('<p class="meta">Version 1.2.3 · MIT License · <code>nullvariant.sample</code></p>'));
    assert.ok(page.includes("<td>Sample: Run</td>"));
    assert.ok(page.includes("<td>Stop</td>"));
    assert.ok(page.includes("<td><code>sample.enabled</code></td><td>boolean</td><td>Turns it on.</td>"));
    assert.ok(page.includes('href="../style.css"'));
    assert.equal(await readFile(path.join(outDir, "sample", "icon.png"), "utf8"), "icon");

    await assert.rejects(readFile(path.join(outDir, "plain", "icon.png")), { code: "ENOENT" });
    await assert.rejects(readFile(path.join(outDir, "stale.html")), { code: "ENOENT" });

    const notFound = await readFile(path.join(outDir, "404.html"), "utf8");
    assert.ok(notFound.includes('href="/style.css"'));
    assert.equal(
      await readFile(path.join(outDir, "style.css"), "utf8"),
      await readFile(path.join(SITE_DIR, "static", "style.css"), "utf8"),
    );
    const headers = await readFile(path.join(outDir, "_headers"), "utf8");
    assert.ok(headers.includes("default-src 'none'"));
  });
});

describe("main", () => {
  it("builds the real site from the repository when run as a script", async () => {
    const { stdout } = await runFile(process.execPath, [path.join(SITE_DIR, "build.mjs")]);
    assert.match(stdout, /^Built \d+ extension page\(s\)\n$/);
    const page = await readFile(path.join(SITE_DIR, "dist", "git-id-switcher", "index.html"), "utf8");
    assert.ok(page.includes("code --install-extension nullvariant.git-id-switcher"));
  });
});
