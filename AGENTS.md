# Repository Guidelines

## Project Structure & Module Organization

This repository is a static website export for getrezonate.com. Top-level `*.dc.html` files are individual pages, with `index.html` redirecting to `Rezonate.dc.html`. Shared production assets live in `rz/`: `site.css` for global styles, small behavior scripts such as `forms.js`, `mobile.js`, `parallax.js`, and image/audio subfolders such as `rz/logos/`, `rz/cs/`, and `rz/team/`. `assets/` contains standalone shared images. `uploads/` holds source screenshots, generated media, and working references; avoid linking directly to temporary upload names unless intentional. `backup/` is an older export snapshot and should not be edited unless restoring or comparing prior assets.

## Build, Test, and Development Commands

There is no package manager or build step in this workspace. Serve the directory as static files:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. For quick syntax checks, use:

```sh
npx --yes html-validate "*.html" "*.dc.html"
```

For link and asset checks, load key pages in a browser and inspect the console/network panel for 404s or script errors.

## Coding Style & Naming Conventions

Keep edits close to the static-export style already present. HTML page filenames use title case plus `.dc.html` for generated pages, for example `Industry-Healthcare.dc.html`. Use two-space indentation for new multiline HTML/CSS/JS blocks when practical, but avoid reformatting entire generated files. Prefer plain JavaScript in `rz/*.js` without new dependencies. Keep asset names descriptive, lowercase where possible, and store reusable site assets under `rz/`.

## Testing Guidelines

No automated test suite is configured. Before submitting changes, manually verify `Rezonate.dc.html` plus any edited page at desktop and mobile widths. Confirm navigation, modals/forms, media, and scroll interactions still work. When editing CSS or shared scripts, spot-check several industry pages because they share `rz/site.css` and common scripts.

## Commit & Pull Request Guidelines

This checkout does not include Git history, so no repository-specific commit convention can be inferred. Use concise imperative commits such as `Update healthcare hero copy` or `Fix demo modal close state`. Pull requests should include a short summary, changed pages/assets, manual test notes, and before/after screenshots for visual changes.

## Security & Configuration Tips

Do not commit secrets, private customer data, or production credentials. HubSpot form IDs and portal IDs appear in `rz/forms.js`; coordinate before changing them. Keep large experimental media in `uploads/` until approved, then move production-ready assets into `rz/`.
