# Website audit — aesthetics, motion, brand consistency, performance

Audited against the code that is actually live: `origin/main` (`d14d928`, Claude Design
export: rezonate 8 (11)), whose homepage is still byte-identical to
`https://rez-hazel.vercel.app/Rezonate.dc.html` and to the earlier `claude/rezonate-8-10`
export. The new files on that push are the companion briefs `Design Audit.dc.html` and
`Homepage Options.dc.html`. The older default branch (`claude/exciting-galileo-d1k2zn`) is
a month behind and was **not** used.

Everything below is measured rather than estimated: byte sizes from the files on disk, runtime
numbers from headless Chrome against a local server at 1440×900 and 390×844, and the security
findings from serving the real `npm run prepare:deploy` bundle with its own `_headers` applied.

Items marked **✅ fixed** are addressed in this branch. Items marked **▲ open** are not.

---

## 1. The site had almost no motion, because it had been switched off

Every page authors scroll-reveal hooks — `data-rv` with `data-d="1..5"` stagger — 33 of them on
the homepage, 28 on Healthcare, 30 on About, around 150 across the site. **None of them did
anything.** The end of the shared stylesheet disabled the whole system with `!important`:

```899:900:rz/site.css
[data-rv]{opacity:1 !important;transform:none !important;filter:none !important;will-change:auto !important}
[data-rv][data-in="1"]{animation:none !important}
```

Verified at runtime before the change: 33 elements matched `[data-rv]` on the homepage and **0**
were ever in a hidden state, so nothing could animate in.

This is the single biggest reason the pages read as flat next to Whisper Flow or ElevenLabs, and
it is worth being precise about why it happened, because two previous attempts failed for real
reasons that any fix has to survive:

1. The first version set `opacity:0` on every `[data-rv]` up front and then relied on a
   `setInterval` scan every 300 ms, so **above-the-fold content visibly shifted in about a second
   after load**.
2. The second left elements **permanently at `opacity:0` on the cinematic pages** (home, sports,
   healthcare, business). Those `[data-rv]` elements sit inside the `cine.js`-driven sticky hero,
   where the container's transforms and clipping mean the `IntersectionObserver` never reports
   them as intersecting — and `cine.js` is *also* writing `opacity` and `transform` on the same
   elements every frame, so the two systems were fighting for the same properties.

**✅ fixed** — rebuilt in `rz/premium.js` against both causes rather than papered over:

- The cinematic hero is excluded outright. `cine.js` owns everything inside `#cinehero`.
- A rect-based scroll sweep backstops anything the observer misses;
  `getBoundingClientRect()` reports real on-screen geometry through transforms and clipping. It
  detaches itself once nothing is pending, so steady-state cost is zero.
- A watchdog reveals anything hidden *while on screen* on a staggered schedule, plus on `load`
  and `resize`, so late layout from fonts or images cannot leave something behind.
- The hidden state is gated behind `html.rv-on`, added only once the script has taken
  responsibility. **The CSS default is "visible"**, so a blocked, failed or throwing script can
  never strand content invisible again.

Measured after the change, across all 14 sitemap pages: elements hidden while on screen at load
= **0**; elements still hidden after a full scroll = **0**; console errors = **0**.

## 2. Brand implementation did not match the brand spec

`CLAUDE.md` defines the palette precisely. The stylesheet did not implement it.

| Brand spec | Was in `rz/site.css` | |
| --- | --- | --- |
| amber `#EFA12E` | `--amber:#FFB24D` — and the correct value retyped as a literal 6× | ✅ fixed |
| paper `#FCFBF9` / `#F4F2ED` / `#EEEDE9` | `--bg:#F4F3F0`, `--panel:#ECEBE7` — none of the three existed | ✅ fixed |
| charcoal `#26211F` | absent | ✅ fixed |
| healthcare `#5FD7A0` | `#0E9E76`, `#1F8A5B`, `#0b6b4f`, `#3ED27E` — four greens, none the brand's | ✅ token added, ▲ call sites open |
| finance `#F4CE7A` | absent; `#2F6FE0` used as an accent | ✅ token added, ▲ call sites open |
| live events `#F0876A` | `#E2630F` | ✅ token added, ▲ call sites open |
| travel/business `#7FB4EC` | absent | ✅ token added, ▲ call sites open |
| ink `#1A1510` | correct in `site.css`, but `#141414` in the homepage's inline `:root` | ✅ fixed |
| display tracking `-0.03em` | `-0.035em` | ✅ fixed |
| Bricolage Grotesque only | homepage and `Solutions` listed `'Open Sans'` in the stack | ✅ fixed on homepage. See the Open Sans note below. |

Quantitatively: **107 hex literals against 78 `var()` references** — roughly 42% of colour usage
bypassed the token layer, while `--bg`, `--panel`, `--amber`, `--warm1`, `--warm2` and `--ri`
were declared and **never read through `var()` even once**.

The `'Open Sans'` fallback deserves a note: it was never loaded, so on any font failure text fell
through to `system-ui` rather than to the metric-matched `Bricolage Fallback` — a layout-shift
risk as well as a brand-rule violation.

**Disagreement with `Design Audit.dc.html`.** That brief says body copy should be Open Sans and
asks to load it site-wide. `Brand Toolkit.dc.html` is explicit: "Bricolage Grotesque carries
everything" and "No second typeface." `CLAUDE.md` and `readme.md` say the same, weights 400–700
only. The unused `tokens/typography.css` listing `--body:'Open Sans'` is the drift, not the spec.
This branch does **not** reintroduce Open Sans. A human override is required before that changes.

**Also fixed: 21 Unicode glyphs used as icons.** Every FAQ row and the "More about Rezonate"
toggle rendered `U+25BE BLACK DOWN-POINTING SMALL TRIANGLE` inside `<span class="chev">`. The
iconography rule is inline stroke SVG in the Lucide style and explicitly no unicode-as-icon; a
text glyph also renders at whatever weight and baseline the font gives it rather than matching
the icon set. Replaced with inline stroke SVG, keeping the existing 30px box and 180° open
rotation.

**▲ Open:** `--r` (44px, the section radius) is still **never applied anywhere in the CSS** —
pages hardcode `border-radius:44px` inline — and one-off radii remain at 13px, 14px, 20px and
26px against a documented 44 / 22 / 16 / 12 / 999 system.

## 3. Aesthetics: what actually read as unfinished

From the rendered page rather than the code:

- **Large flat fills with nothing in them.** The featured-story section put a floating card in
  the middle of roughly a full viewport of empty cream, with a small unanchored pill below it.
  **✅ partly addressed** — a CSS-only aurora (two counter-drifting blurred radial fields, built
  from the element's own pseudo-elements, zero extra requests) now gives that section and
  `#capabilities` depth. The underlying spacing rhythm is **▲ open**: padding is per-section
  inline values rather than a scale.
- **No seam between the stacked shells.** Sections overlap upward by −44px but read as a flat
  colour change. **✅ addressed** — a gradient hairline (`data-seam`) on three shell overlaps.
- **The gradient, the one piece of brand equity with real presence, appeared almost nowhere on
  light sections.** The dark platform diagram is the strongest-looking part of the page precisely
  because it uses it.
- **Nothing responded to the pointer** beyond a few one-off card transitions, each with its own
  curve. **✅ addressed** — one shared lift, a pointer-tracked spotlight, and a gradient edge ring
  on raised surfaces; magnetic lean on primary CTAs.
- **Display headings just appeared.** **✅ addressed** — per-word mask reveals on the four section
  claims, which is the most recognisable "crafted" motion cue and the one competitors lean on.
- **▲ The hero still eats 34% of the page's scroll** and its choreography is gated on a real user
  interaction: `cine.js` holds progress at 0 and actively snaps the page back to `scrollY = 0`
  until a `wheel` / `touchstart` / `keydown` / `pointerdown` event fires. Arriving via an anchor
  link, or any programmatic scroll, leaves the hero frozen on its first frame with
  "SCROLL TO BEGIN" still showing. This is confirmed: a screenshot harness driving
  `window.scrollTo` never advances the hero until a genuine wheel event is dispatched.
- **▲ Mobile still loses the product.** `#cinestage`, `#cineclose`, `#cinecue` and the
  `.cine-card` set are all `display:none` below 640–1024px. Mobile readers get copy where desktop
  readers get the product.

One thing that looked like a defect and is not: the capability card backgrounds show a fine
cross-hatch that reads as compression banding at a glance. Inspected at 1:1, the grid is
deliberate texture in the source art (`rz/grad-terra2.webp` and siblings carry 90k+ distinct
colours), so there is nothing to re-encode.

## 4. Motion quality where motion did exist

43 `@keyframes`, 44 `animation:` and 50 `transition:` declarations.

- The brand easing `cubic-bezier(.16,.84,.44,1)` was used 6 times against **25 other curves**, so
  nothing shared a motion signature. **✅ fixed** — one easing and duration scale as tokens.
- `prefers-reduced-motion` was honoured in 11 places, leaving roughly **28 animation families
  unguarded** (`wb`, `pmesh1/2`, `pfloat`, `tintfloat`, `mctapulse`, `ekgmove`, `sbar`, `pring`,
  `rzKenBurns`, `logoscroll`, `indbarpulse`, `indlit` and more). **✅ fixed** — one umbrella that
  also covers the older decorative loops.
- **▲ Three scroll-driven systems still stack on desktop.** `cine.js` runs a *continuous*
  `requestAnimationFrame` loop the entire time the hero is on screen; `parallax.js` reads
  `getBoundingClientRect()` for every tracked element every active frame; `smooth.js` hijacks
  `wheel` with `preventDefault()` and writes `scrollTop` on a lerp each frame, which means every
  lerp step re-triggers the other two. Around 10 scroll-related listeners on a hero page.
- **▲ Hero video autoplay is still implemented three times**: an inline IIFE in the page,
  `rz/hero-video.js`, and again inside `cine.js`'s mobile branch.
- **▲ `!important` is up to 353** (from 175 a month ago), concentrated in the responsive tail.
  Four conflicting mobile definitions of `.h-hero` font-size are resolved only by source order.

## 5. Performance

Homepage, headless Chrome, local server, cold cache. A lot of the infrastructure had already been
done well before this audit — immutable cache headers for `/rz/*` and `/assets/*`, mobile video
variants, `preload="none"` on the hero, `uploads/` out of the deploy — so the remaining wins were
narrower than they first looked.

Homepage, cold cache, bytes counted off the wire (the local server sends no
compression, so text is uncompressed in both columns and the comparison is like-for-like):

| | Before | After | |
| --- | --- | --- | --- |
| Desktop | 5,475 KB | **4,111 KB** | −25% |
| Mobile | 2,839 KB | **2,539 KB** | −11% |
| Third-party requests | 4 origins (React ×2 from unpkg, Google Fonts CSS + 2 woff2) | **0** | |

The desktop figure understates the improvement slightly: the "before" column cannot see the
React bytes, because a cross-origin response without an exposed `content-length` reports zero. The
real before figure is ~142 KB higher.

**✅ React was loaded from `unpkg.com`.** Every page's `support.js` fetched React and ReactDOM
(~142 KB) from a third party before the runtime could render anything — while byte-identical UMD
builds were **already committed** at `rz/react-18.3.1.min.js` and `rz/react-dom-18.3.1.min.js`
and referenced by nothing. Now served from our own origin, integrity hashes unchanged. See §6:
this was also a latent outage.

**✅ Fonts were two chained third-party round trips.** `fonts.googleapis.com` for the CSS, then
`fonts.gstatic.com` for the files, with no preload, so the typeface was discovered only after the
font CSS parsed. Now self-hosted and preloaded. The homepage was additionally on
**`display=optional`**, which permits a browser on a slow connection to never apply the brand
typeface at all — a brand-consistency bug rather than a performance setting. Now `swap`
throughout. The three imported fragments (`FeaturedStories`, `EI Loop`, `EI People A Dark`) each
carried their own Google Fonts link in their helmet, which lands in the host page's head, so
those were stripped too.

**✅ A second, non-brand typeface was being downloaded on the homepage.** `EI Loop` and
`EI People A Dark` each requested `family=Open+Sans:wght@400;500;600;700` alongside Bricolage,
and both are imported into the homepage and `Solutions` — 47 KB of a face the brand does not use.
`Newsroom` and `Insights`, both in the sitemap, requested it too. The hero kicker and both EI
sections were genuinely *set* in it, so this was a visible brand inconsistency as well as weight;
they are now in the brand face. Separately, `KiraVoiceDemo` requests weight **800**, which the
brand excludes (400–700) — ▲ open, though that page is excluded from the deploy.

**✅ Two hero videos were left at double the bitrate of the others.** Four of six had already
been re-encoded; the homepage and sports clips ran at 2.18 and 2.58 Mbps against 1.14–1.36 Mbps
for the rest, and the homepage one is the heaviest asset on the most-visited page. Re-encoded at
CRF 32 into the same band, measured at SSIM 0.979/0.981 mean against the originals, on footage
that is heavily defocused and sits under a dark wash with type over it.

| | Before | After |
| --- | --- | --- |
| `hero-home-1080.mp4` | 1,879 KB | 1,143 KB |
| `hero-sports3.mp4` | 2,218 KB | 1,362 KB |
| `hero-home-m.mp4` | 753 KB | 549 KB |
| `hero-sports3-m.mp4` | 707 KB | 542 KB |

**▲ Immutable caching is applied to unversioned filenames.** `_headers` sets
`Cache-Control: public, max-age=31536000, immutable` on all of `/rz/*`, but many references carry
no version query — `<source src="rz/hero-home-1080.mp4">` had none. Any byte change to such a
file **never reaches a returning visitor**. The four video references were bumped as part of the
re-encode, but the general pattern needs either content-hashed filenames or a version query on
every reference.

**▲ Dead deploy weight.** `rz/logos/iso-27001.png` (1,070 KB at 1620×1621), 
`rz/team/aia-chiakimgeok.jpg` (498 KB at 3000×3000), the `rz/cs/*.jpg` set and
`rz/brand/mesh-light.png` (4,482 KB at 3301×834, referenced only by the internal Brand Toolkit
page) are shipped but referenced by no page in the sitemap — their `.webp` siblings are what get
used. This costs deploy size, not page load.

**▲ The client-side runtime remains the largest structural cost.** `support.js` is a blocking
script in every page's real `<head>`, and the markup is hidden by an injected
`x-dc{display:none!important}` until React renders. All of the hero's anti-flash machinery —
`cine-lock`, `scrollRestoration='manual'`, snapping `scrollY` back to 0 — exists to paper over
the resulting boot race.

## 6. The CSP-hardened deployment does not work — and never did

This is the most serious finding, and it is invisible today.

The repository has a real security pipeline: `scripts/prepare-deploy.sh` builds a `dist/` bundle,
`scripts/harden-csp.mjs` externalises inline styles and scripts, `scripts/check-csp.mjs`
validates the policy, and `_headers` ships a strict CSP for the Cloudflare Workers target
described in `wrangler.jsonc`. `npm run prepare:deploy` passes cleanly.

**The site does not run under that policy.** Serving the real `dist/` bundle with its own
`_headers` applied, on the unmodified code:

- `script-src 'self' https://www.googletagmanager.com` does not allow `unpkg.com`, so React never
  loads: `[dc] failed to load React or boot`.
- Because the runtime hides all markup until React renders, the result is a **completely blank
  page** — 259 characters of rendered text, all of it the consent banner, which is a plain script
  and survives.

The reason nobody has noticed is that the live deployment is on Vercel, which sends no CSP at
all (confirmed in the response headers), so `unpkg.com` loads and the site works. The strict
policy only takes effect on the Cloudflare path, and on that path the current code is a blank
page.

Serving React from our own origin fixes that specific blocker: rendered text goes from 259 to
6,898 characters and the page paints. **▲ But a second blocker remains and is architectural.**
The runtime evaluates each page's `DCLogic` class from a string, which needs `'unsafe-eval'`:

```
Evaluating a string as JavaScript violates the following Content Security Policy directive
because 'unsafe-eval' is not an allowed source of script: script-src 'self' …
[dc-runtime] logic class eval FAILED for Rezonate — the template renders with props only.
```

So under CSP the page renders but is **not interactive**: no accordions, no mobile menu, no
carousel. `check-csp.mjs` deliberately rejects `'unsafe-eval'`, and it is right to — granting it
would be a real security regression to work around an authoring choice. There are two honest
options, and both are larger than this branch:

1. **Prerender `<x-dc>` templates to plain HTML at deploy time.** This removes the blocking
   runtime, the `unsafe-eval` requirement, the FOUC, the `<dc-import>` fetch waterfall and most
   of `cine.js`'s defensive code in one move. It is the same change as §7 item 1.
2. Keep the runtime and accept that the Cloudflare target cannot use a strict `script-src`.

Two smaller CSP issues also remain **▲ open**: several scripts inject `<style>` elements at
runtime (`mobile.js`'s `#rz-navfix`, `chat.js`, `consent.js`), which `style-src 'self'` blocks, so
the mobile nav is unstyled on that path; and 26 runtime `setAttribute('style', …)` writes are
blocked by `style-src-attr 'none'`. Note the distinction, since it matters for any fix:
`element.style.setProperty()` and `element.style.prop = …` are **not** blocked, only the
`style` content attribute. Everything added in this branch uses `setProperty` for that reason.

## 7. Accessibility

Several items were already fixed before this audit: `lang="en"` is present on every page, and a
`:focus-visible` ring exists at `rz/site.css:921`.

- **✅ No skip link existed** on any page. Added.
- **▲ The `#kiravoice` accordions are still `<div onClick>`** with no `role`, tab stop,
  `aria-expanded` or keyboard handling. `premium.js` now adds `role="button"`, `tabindex="0"`,
  `aria-expanded` and Enter/Space handling at runtime, which is a mitigation rather than a fix —
  the markup should carry it.
- **▲ `<nav>` has no accessible name** in markup (added at runtime for the same reason).
- **▲ The nav links to `Rezonate.dc.html#industries`** and no element on the page has
  `id="industries"`.
- **✅ "Used by leading organizations worldwide"** is now an `<h2>` (visually unchanged), so the
  logo section is in the document outline.
- **▲ The decorative hero `<video>`** is not `aria-hidden` in markup.

## 8. Two pre-existing console errors on `Solutions`

Confirmed present on the live site, so not introduced here, and both cosmetic:

- A request for `data:image/jpeg` with no payload fails with `net::ERR_INVALID_URL`. The one
  authored data URI on the page is valid (592 base64 characters decoding to a well-formed
  442-byte JPEG), so this is constructed at runtime, most likely a background-image built from an
  empty interpolated value.
- A `404` for `/favicon.ico`, despite the page declaring two `rel="icon"` links.

---

## Applied from `Design Audit.dc.html` / `Homepage Options.dc.html`

Rule-compliance items the new brief said to apply regardless of option picks, plus the
most-enterprise option in each group that does not fight the toolkit:

- **✅ Footer / hero tagline period.** The giant "Now we're talking" (and the industry `.nwt-pan`
  lockups) now end with a period, site-wide.
- **✅ FAQ headline, option 1g.** All ink, one amber underline under "answered." The four-color
  gradient is gone, so that screen no longer has a second gradient moment.
- **✅ Logo wall, option 1a.** Static ink-normalized grid of the eight named logos; color returns
  on hover. The unnamed `c1/c5/c8/c9` duplicates and the marquee are gone.
- **✅ Capability chips on the palette.** The dusty-rose `#A4544E` chips are now ink on a paper
  wash.
- **✅ Capability numbers count up** via the existing `.cnum` path (`82%`, `49%`, `60+`), skipped
  under `prefers-reduced-motion`.
- **✅ `--grad` aligned to the toolkit recipe** (`115deg, #B79DE8, #D9605A 55%, #E2683E`). Amber
  remains a named token for single-hue use; it is no longer a fourth stop on the brand ramp.

**Motion pack, this pass.** The site still coasts after the hero unless motion *explains* something. Added:

- Capability cards are one family, three hues walking the brand gradient, with a live waveform on each card. The three unrelated textures are gone.
- `#kiravoice` phones run: the call timer ticks, the last iMessage arrives, the "Kira is on the line" bars move, and a five-line transcript types itself as the section is scrolled.
- The platform diagram draws in on entry; "Loop closed" lights when the stroke finishes.
- A Hear Kira waveform pill sits in the nav (and the mobile sheet) and jumps to `#kiravoice`. `cine.js` no longer pins `scrollY` to 0 when that hash is the destination.
- Reveal direction now varies (`left` / `right` / `scale`) instead of one fade everywhere.
- The Trusted-by seam is a thin animated wave — the footer motif, reused small.
- Mobile keeps the call phone (it used to hide both) and the hero type floor is 32–40px, not 17–22.

Not done, because they are product decisions or need a pick:

- Remounting the live demo as homepage act two (`KiraVoiceDemo` is excluded from publish; the
  widget has known bugs).
- "Hear Kira" nav pill and micro-players in the capability cards.
- Capability-card texture restyle (options 1d / 1e / 1f).
- Waveform as a site-wide kinetic signature, platform-diagram draw-in, animated phones.
- Deploy-time prerender.

---

## What is left, in priority order

1. **Decide the runtime question.** Prerendering `<x-dc>` to static HTML at deploy time is the
   single highest-leverage change left: it unblocks the CSP deployment (§6), removes ~200 KB of
   blocking JS, deletes the FOUC and the hero's anti-flash workarounds, and makes the pages
   crawlable without JS. Everything else in this list is smaller.
2. **Fix the hero's interaction gate** so anchor navigation and programmatic scroll advance the
   choreography, and revisit 360vh as the price of the opening.
3. **Bring the product to mobile.** The phone mockups and the industry choreography are the
   proof; hiding them below 1024px concedes the mobile story.
4. **Adopt a spacing scale.** Section padding is currently per-section inline values, which is
   why the vertical rhythm reads as unmotivated even where the sections themselves look good.
5. **Consolidate the responsive layer.** One documented breakpoint set, classes instead of the
   `[style*="grid-template-columns:…"]` selectors that match inline style strings, and one fluid
   `clamp()` in place of the four competing `.h-hero` scales. This is what will bring the 353
   `!important` declarations down.
6. **Route the industry accent tokens to their call sites.** The four accents now exist; the
   four different greens and the off-palette blue and orange are still hardcoded.
7. **Version every asset reference, or content-hash the filenames**, so immutable caching stops
   pinning stale bytes.
8. **Move the runtime a11y patches into the markup**, and drop the dead `#industries` anchor.
9. **Stop shipping the unreferenced large rasters.**
