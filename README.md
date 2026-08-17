# Rezonate Landing Page

Static landing-page site for `getrezonate.com`, deployed to Cloudflare Workers Static Assets with Wrangler.

## Project Structure

- `*.dc.html` - exported site pages. `Rezonate.dc.html` is the primary landing page.
- `index.html` - lightweight redirect to `Rezonate.dc.html`.
- `rz/` - production assets and shared scripts.
  - `rz/site.css` - global styling.
  - `rz/cine.js` - cinematic scroll-scrub hero engine.
  - `rz/seq/` - frame sequences used for scroll-linked hero scrubbing.
  - `rz/forms.js`, `rz/chat.js`, `rz/mobile.js` - shared browser behavior.
- `assets/` - small shared assets.
- `scripts/prepare-deploy.sh` - builds the deployable `dist/` bundle.
- `wrangler.jsonc` - Cloudflare Worker Static Assets configuration.

Ignored working folders such as `backup/`, `uploads/`, `screenshots/`, and generated `dist/` are intentionally not committed.

## Local Development

This repo does not use Vite or a frontend build system. Serve it as static files:

```sh
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

For a deploy-bundle preview:

```sh
npm run prepare:deploy
python3 -m http.server 8000 -d dist
```

## Deployment

Install dependencies if needed:

```sh
npm install
```

Run a dry run:

```sh
npm run deploy:dry-run
```

Deploy to Cloudflare:

```sh
npm run deploy
```

The deploy script copies only live site files into `dist/`, excludes source/backup material, and fails if any asset exceeds Cloudflare's 25 MiB static asset limit.

### Continuous Deployment

Every push to `master` deploys the prepared `dist/` bundle through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Before the first automated deployment, add a repository Actions secret named `CLOUDFLARE_API_TOKEN`. Create a scoped Cloudflare API token with permissions to edit Workers and Worker routes for the KeyReply account. The Cloudflare account ID is committed in `wrangler.jsonc`; do not add it as a secret.

## Performance Guidelines

The hero animation is intentionally implemented as frame sequences for precise scroll-linked scrubbing. Keep this interaction smooth:

- Do not replace `rz/seq/*` with video unless precise frame scrubbing is no longer required.
- Keep initial hero frame loading conservative in `rz/cine.js`.
- Use WebP or AVIF for large photographic assets.
- Update cache-busting query strings when changing immutable assets referenced by HTML, for example `rz/cine.js?v=59`.
- Avoid adding eager third-party scripts to the page head unless they are required for first interaction.

## Contribution Guidelines

- Keep changes focused and avoid reformatting generated `.dc.html` files.
- Preserve existing file naming patterns, especially top-level `*.dc.html` page files and `rz/*` asset paths.
- Test at desktop and mobile widths before deploying.
- Verify key pages after shared CSS or JavaScript edits: `Rezonate.dc.html`, `Solutions.dc.html`, and at least one `Industry-*.dc.html` page.
- Do not commit secrets, `.env` files, Cloudflare credentials, local build output, uploads, or backup exports.

## Validation Checklist

Before pushing changes:

```sh
node --check rz/cine.js
npm run prepare:deploy
npm run deploy:dry-run
```

After deployment, verify:

```sh
curl -L https://getrezonate.com/Rezonate.dc | head
```
