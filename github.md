# GitHub association

repo: Yr1008/rez
branch: claude/exciting-galileo-d1k2zn
note: Design mirror of the production repo (keyreply/rezonate-landing-page is not reachable from this connection). The mirror is OLDER than the site - authoritative syncs come from the user's attached local folders.

## Last sync
date: 2026-08-18T05:27:00Z
source: GitHub mirror Yr1008/rez @ claude/exciting-galileo-d1k2zn
### Updated in this project
- LEGAL FIX: Privacy + Terms + rz/i18n-privacy.js said "Rezonate Pte Ltd" - the registered entity is KeyReply Pte Ltd; now "KeyReply Pte Ltd, operating as Rezonate" (EN + PT). The mirror carries the same mistake - include this in the next push.
- Also pending from Aug 17: EI bands, industry-specific journey maps, sports hero scrub, photo swaps, brand-rule fixes, 48-file cleanup

### 2026-08-17T09:12 (previous)
- EI Loop + EI People bands wired (home + Solutions hero); sports/financial hero scrub; journey maps made industry-specific; cleanup; site.css v=53

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
