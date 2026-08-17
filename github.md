# GitHub association

repo: Yr1008/rez
branch: claude/exciting-galileo-d1k2zn
note: Design mirror of the production repo (keyreply/rezonate-landing-page is not reachable from this connection). The mirror is OLDER than the site - authoritative syncs come from the user's attached local folders.

## Last sync
date: 2026-08-17T09:12:00Z
source: GitHub mirror Yr1008/rez @ claude/exciting-galileo-d1k2zn (production repo keyreply/rezonate-landing-page still 404 from this connection)
### Updated in this project (pending push to master)
- NEW: EI Loop.dc.html + EI People A Dark.dc.html - Engagement Intelligence bands on homepage (after live demo) and as Solutions hero
- Homepage: EI bands wired in; "Kira, out loud" photo -> rz/photo-kira-field4.webp, zoomed out + readability scrim; CTA photo -> rz/cta-home3.webp; nav hover/CTA lift removed
- Industry-Sports: full hero scrub choreography (Built for ticketing/memberships/game day/suites + 4 generic cards + Now we're talking), 24/7 dial replaces illogical bars, section gap closed
- Industry-Financial: hero scrub overlap fixed (compact Built for banking/lending/onboarding/collections + cards pushed out), CTA photo -> rz/cta-financial3.webp
- Solutions: EI Loop as hero + EI People band; old video hero + steps band removed
- Cleanup: 36 unused rz/assets media + 12 superseded EI exploration files deleted
- site.css at v=53 across all pages

### 2026-08-17T08:03 (previous)
- Mirror re-checked: still at site.css v=35, no upstream commits - nothing to pull
- Project remains the newer superset; no screens rebuilt

### 2026-08-17T05:07 (previous)
- Probed production repo: not reachable; mirror at v=35, unchanged
- No upstream changes; project superset

### 2026-08-17 (previous)
date: 2026-08-17
source: local folder "rezonate-landing-page-master 4" (attached; older than project - site.css v=46, pre-Jeff copy)
- Verified project is a strict superset of the repo snapshot; no repo-side changes to pull
- Renamed sports demo agents to compliant labels: "Ernie · Fan Engagement", "Marty · Suite Recovery" (tokens unchanged)

### 2026-08-12 (previous)
date: 2026-08-12T08:18:23Z
source: local folder "rezonate-landing-page-master 2" (newer than the mirror)

### Updated in this project
- Full exact sync from the local folder: all 16 pages, index.html, embed/form.html, _redirects, docs, sitemap/robots/llms, package.json, wrangler.jsonc.
- All rz scripts + new css (consent.css, dc-runtime.css, forms.css, i18n-privacy.js) and new media (hero-*4/-3 videos + mobile variants, hc-* persona photos, provider-couple, showcase-caller.webp, cta webps, og-image).
- prepare-deploy.sh now excludes the retired voice-demo pages from publish and writes per-route CSP via harden-csp/check-csp.


## Sync history
- 2026-08-10T04:34:00Z: full restore from local folder "rezonate-landing-page-master 3".
- 2026-08-10T03:56:17Z: restored Rezonate.dc.html and KiraVoiceDemo White.dc.html from the mirror (superseded).

## Screen map
| Screen | Repo file |
| --- | --- |
| Homepage | Rezonate.dc.html |
| Live voice demo (retired from publish) | KiraVoiceDemo White.dc.html, KiraVoiceDemo.dc.html |
| Industry pages | Industry-Healthcare/Financial/Business/Sports.dc.html |
| Solutions / Customers / About / Careers / CaseStudy | matching .dc.html |
| Privacy / Terms / Email-Signature | matching .dc.html |
