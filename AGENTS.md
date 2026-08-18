# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **purely static marketing website** for Rezonate (formerly KeyReply). There is no build system, no `package.json`, and no dependencies to install — the source is served as-is (HTML/CSS/JS/assets). Production hosting is Vercel (see `vercel.json`).

### Running the site locally (dev "server")
Serve the repo root over HTTP with any static file server. Python 3 and Node are preinstalled, so nothing needs installing:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/`. The root `index.html` immediately redirects to `Rezonate.dc.html` (the homepage). Interior pages are individual top-level files, e.g. `Industry-Healthcare.dc.html`, `Solutions.dc.html`, `Customers.dc.html`.

### Non-obvious gotchas
- **Page files use a `.dc.html` extension** and are linked directly (no clean-URL routing in local dev). Navigate to the actual filename, e.g. `/Industry-Financial.dc.html`, not `/financial`.
- **`vercel.json` rewrites are NOT applied by a plain static server.** The clean-URL and `Accept: text/markdown` → `/md/*.md` content-negotiation rewrites only run on Vercel. For local dev this is fine; to reproduce the production routing exactly, use `vercel dev` (requires the Vercel CLI + project link) — not needed for normal work.
- **Shared stylesheet is `rz/site.css` and is cache-busted via a `?v=NN` query.** Per project brand rules (`CLAUDE.md`), bump that version number on every `site.css` change so live pages pick it up.
- There are no automated tests, linters, or build steps configured. "Testing" a change means loading the affected `*.dc.html` page in a browser and visually verifying it. Large media (`rz/*.mp4`) are committed directly.
