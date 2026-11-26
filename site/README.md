# variant.fit

The public site for the extensions in this monorepo, served at <https://variant.fit>. It is also the verified domain of the `nullvariant` publisher on the Visual Studio Marketplace.

## What it shows

One page per extension: what it does, how to install it, its commands, and its settings, with links to the README, changelog, security policy, and issues.

Every piece of text comes from the extension's `package.json` and its English `package.nls.json`. The site copies no prose, so it shows exactly what the Marketplace shows. To change a description, change the extension's manifest.

## How it is built

`build.mjs` uses only the Node.js standard library, so the site ships no runtime dependency.

```bash
pnpm --filter variant-fit-site run build          # writes site/dist
pnpm --filter variant-fit-site run lint           # shared rules from packages/eslint-config
pnpm --filter variant-fit-site run typecheck      # JSDoc types, strict
pnpm --filter variant-fit-site run test:coverage  # fails below 100% line, branch, and function coverage
```

The CI workflow runs all four on Linux, Windows, and macOS, and uploads the coverage to Codecov and SonarCloud.

`static/` holds the stylesheet and the `_headers` file. The headers set a Content Security Policy that allows only this site's own stylesheet and images: the pages have no scripts, forms, frames, or third-party resources.

## How it is served

A Cloudflare Worker named `variant-fit` serves `site/dist` as static assets, with no server code (`wrangler.jsonc`). The Worker answers only on the custom domain; its workers.dev and preview URLs are disabled.

The `Deploy Site` workflow (`.github/workflows/deploy-site.yml`) builds and deploys the site when `main` changes the site or an extension's manifest, English strings, or icon. The Cloudflare token lives in the `site-deploy` environment, which only `main` can use.
