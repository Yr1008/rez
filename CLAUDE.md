# Rezonate landing page — standing context

Instructions for future sessions working on this repo. Rezonate (formerly **KeyReply**) is an agentic AI customer-engagement platform for regulated, high-volume industries (healthcare, finance, business, sports/live events). The product/assistant is **Kira**. Live site: **getrezonate.com**.

> Only what's confirmed from the files is stated as fact. Items marked **[convention]** are team process the user told us, not enforced by code — treat as authoritative but not verifiable here.

## What this is / stack
- **Static marketing site. No framework, no bundler, no build step.** Pages are Claude Design Components (`*.dc.html`) rendered client-side by the `support.js` runtime; styling is inline styles plus a few classes.
- ~~`index.html` redirect stub~~ **removed (Aug 2026):** the homepage is served at `/` via a `_redirects` rewrite emitted by `scripts/prepare-deploy.sh` (`/ /Rezonate.dc.html 200`), with 301s from `/Rezonate.dc.html`, `/Rezonate.dc`, and `/index.html` back to `/` — never reintroduce a root redirect stub (it would shadow the rewrite and bounce visitors to /Rezonate.dc again; the deploy script also `rm`s any index.html from dist). Other pages: `Industry-Healthcare|Financial|Business|Sports.dc.html`, `Solutions`, `Customers`, `About`, `Careers`, `CaseStudy`, `Privacy`, `Terms`, `Email-Signature`. The homepage embeds the live demo via the `KiraVoiceDemo White.dc.html` component.
- **Styling:** shared `rz/site.css?v=NN` (secondary pages link it; `Rezonate.dc.html` inlines its own `<style>`). Fonts load from Google Fonts (Bricolage Grotesque + Open Sans).
- **Client JS, all in `rz/`:** `voice-widget.js` (live agent — see below), `consent.js` (cookie banner + GA Consent Mode v2; loads GA `G-CFV0VT8RRK` only after opt-in — the old bare `rz/ga.js` is gone, never re-add an unconditional gtag snippet), `track.js` (GA4 `cta_click`/`form_open`/`form_submit` events), `chat.js`, `cine.js` (cinematic hero engine, see `HERO-SCROLL-GUIDE.md`), `hero-video.js` (desktop autoplay + mobile `-m.mp4` swap via `data-msrc`), `parallax.js`, `smooth.js`, `mobile.js`, `showscrub.js`, `nwt-wave.js`, `indbar.js`, `forms.js` (HubSpot).
- **SEO/AEO:** `llms.txt`, `llms-full.txt`, `sitemap.xml`, `robots.txt`, and `/md/*.md` markdown twins of each page served by content negotiation.

## Run / build / deploy
- **Local:** serve the folder with any static server and open `index.html`. No install, no build.
- **Deploy target: Cloudflare Workers Static Assets via Wrangler** (moved off Vercel, Jul 2026 — `vercel.json` is gone; do not recreate it). `wrangler.jsonc` holds the routes (getrezonate.com + www) and account id; `scripts/prepare-deploy.sh` builds `dist/` (copies live files, excludes source/backup media, emits `_headers` for security + immutable caching and `_redirects` for root-URL routing, fails on >25 MiB assets). Commands: `npm run prepare:deploy`, `npm run deploy:dry-run`, `npm run deploy`. CI: every push to `master` deploys via `.github/workflows/deploy.yml` (needs the `CLOUDFLARE_API_TOKEN` Actions secret). ⚠ The old `/md/*` Accept-header content negotiation was a Vercel rewrite and no longer runs — `md/` files still ship as plainly fetchable URLs.
- **[convention] Work on `master`, push to `master` → auto-deploys to getrezonate.com in a few minutes.** Rollback is easy (revert the commit / redeploy the previous build). **Do NOT use the Vercel preview** — validate on production.
- ⚠ From this session I could **not** reach the `rezonate-landing-page` repo, its `master`, or diff branch `claude/push-code-terminal-kyig66` (GitHub access here is scoped to a design mirror only). Check unmerged commits on that branch directly on GitHub before syncing.

## Design source of truth & sync workflow
- The **Claude Design "Rezonate 8" project** (these `.dc.html` pages) is the **design source of truth**. Workflow: compare the repo against those files and **sync the differences in** — don't hand-author divergent markup.
- `rz/site.css` is shared and cache-busted: **bump `?v=NN` on every `site.css` change**, across all pages that link it. (Currently `v=41`.)

## Voice / live-agent widget
- Lives in `KiraVoiceDemo White.dc.html`, embedded on the homepage as `#live-demo`. Two modes via a pill toggle: **Live agent** (talk to Kira in-browser) and **Hear a recorded call** (`.ogg` playback). Industry tabs: Healthcare · Financial · Business · Sports.
- The orb wraps `<kira-voice-agent demo-token=… convex-url=…>`, a custom element defined by **`rz/voice-widget.js`** (real LiveKit + Convex bundle, ~540 KB). It's **lazy-loaded in `componentDidMount`** from `rz/voice-widget.js?v=20260615-livekit` with a `/voice-widget.js?v=20260615-livekit` fallback, and **self-wires to the `.kvx-call` button child in its `connectedCallback`** — keep that button inside the element.
- **Convex backend:** `https://acoustic-ermine-603.convex.cloud`. Each scenario has its own `demo-token` (also opens the full demo at `demo.keyreply.com/voice-demo/<token>`).
- **Scenario / agent map** (`TOKENS()` in `KiraVoiceDemo White.dc.html`):
  - **Healthcare** — Post-discharge care (Nic), Appointment Booking. *Recorded clips:* `post-discharge.ogg`, `spear-rebooking.ogg`.
  - **Financial** — Utility Billing Assistant. *No recorded clip.*
  - **Business** — David · Asahi Beverages, Restaurant Reservations, Education Recruitment. *No recorded clip.*
  - **Sports** — Ernie · Fan Engagement, Marty · Suite Recovery. *Recorded clip:* `events-inquiry.ogg` (Fan Engagement only).
  - Only three sample clips exist total (`rz/audio/`, `.ogg` served + `.opus` originals).
- **Known bugs (reported on production — verify against live):**
  1. **Live connect takes 5+ seconds with no real "connecting" state** — the code only shows a text hint ("Calling agent… connecting can take a few seconds"); there's no progress/spinner affordance.
  2. **Mic often doesn't capture the caller** — LiveKit capture intermittently fails; root cause is inside the minified widget bundle.
  3. **Finance/Business recorded clips are missing.** In the current source those industries have no `audio`, so the recorded-call tab is *disabled* for them — but production reportedly **falls back to a healthcare clip** instead. Confirm which behavior is live; the fix is to add real finance/business recordings or keep the tab disabled, never to play the wrong industry's audio.

## Brand rules
- **Fonts:** headlines **Bricolage Grotesque** (weights 400–700, display 600 / −0.03em). Body and subheads **Open Sans** — this is decided. Load Open Sans from Google Fonts on every page and set the body / `--sans` variable to Open Sans; keep headlines on Bricolage. If any body copy is still set to Bricolage in the source, fix it, that is the mismatch to correct.
- **Colors (canonical, source of truth = the warm-paper/amber system in the code — do NOT migrate to the toolkit lavender palette):** warm paper #FCFBF9 / #F4F2ED / #EEEDE9, near-black ink #1A1510 / #0E0D0B, muted secondary #75726D, amber accent #EFA12E. **Brand gradient** `linear-gradient(115deg,#B79DE8,#D9605A 55%,#E2683E)` — **one gradient moment per screen**, never a page background.
- **Tagline:** **"Now we're talking."** Sentence case; sentences and taglines end with a period.
- **Punctuation:** **never an em dash (—). Use a spaced dash ( - ).**
- **Logo:** the **colourful five-lens mark on light** backgrounds; the **white/cream wordmark on gradients and dark/mesh**. Never recolor or redraw the five-lens mark.
- Never say "chatbot" (Kira is an AI agent/platform). No emoji, no exclamation marks. Full copy/positioning reference: **`messaging.md`**; visual reference: `Brand Toolkit.dc.html` and `readme.md`.

## Guardrails (get sign-off — do not ship past these)
- **Mayo Clinic Platform section stays HIDDEN until the Mayo PR goes live.** It's currently `display:none` (homepage inline + a `section[data-screen-label="Mayo Clinic Platform"]{display:none}` rule in `site.css`). Anything touching **Mayo, or healthcare claims/stats, needs approval** before it's shown.
- **Sports: no real team names, club logos, or player likeness.** Keep agents/scenarios generic (Ernie, Marty, "Fan Engagement"). ⚠ The repo's demo currently labels suite recovery "Joey · Yankees Suite" — a real club name on production; the compliant label in this project is "Marty · Suite Recovery" (same token) and must win on the next sync.
- **No unapproved client names, logos, or metrics.** Publish only cleared proof points (see `messaging.md`).
- **Everything customer-facing goes to Peiru before publishing.** [convention]
- ⚠ **Never delete `rz/voice-widget.js` or `rz/audio/*`** in cleanups/exports. `voice-widget.js` is referenced only via a dynamic string in `KiraVoiceDemo`, so it looks orphaned but isn't. Keep both the `.ogg` copies (referenced) and the `.opus` originals.

## Verify after every change
1. Push to `master`; wait a few minutes for the Vercel deploy.
2. Open **getrezonate.com** and check **desktop and mobile** (real viewport, not just resized) — layout, spacing, the section you touched. Confirm Open Sans is actually rendering for body copy.
3. **Test the live agents** (each industry tab: connect, confirm mic captures) **and the recorded-call tab** (each clip plays, correct industry).
4. If anything is broken, **roll back immediately** (revert/redeploy the prior build) — don't leave production broken while debugging.
