# Rezonate Design System

Rezonate (formerly **KeyReply**) is an AI-powered customer engagement platform for regulated, high-volume industries — healthcare, insurance, banking, government, sports. The product is **Kira** (AI voice agents, WhatsApp + 10 channels, governed workflows); the brand is **Rezonate**. Tagline: **Now we're talking.** Value prop: **We reach humans better.** HQ Singapore; US, Brazil, Australia.

Sources: the production marketing site in this project (Rezonate.dc.html + Industry-*, About, Customers, Solutions, Careers, CaseStudy, Privacy, Terms; shared stylesheet `rz/site.css`), brand uploads (LinkedIn header mesh, gradient lens mark, cream wordmark, og-image reference), and content docs in `uploads/2026*.md` (positioning, FAQ, meta, schema). Live domain: getrezonate.com.

## CONTENT FUNDAMENTALS
- Voice: **confident, not corporate; clear without being clinical; warm without trying too hard.** Grounded, human. "Experiencing is believing."
- Sentence case everywhere, and full sentences **end with a period — even taglines**: "Now we're talking." "Built for healthcare."
- Address the reader as **you**; Rezonate speaks as **we**. Kira is referred to by name, like a colleague: "Kira listens, understands and gets it done."
- Short declarative headlines, often two beats: "When AI comes with people skills. Now we're talking." Industry heroes use "Built for ___." / claim pairs ("When customers can bank on your every answer.").
- Numbers carry proof: "82% resolved without a human", "49% fewer no-shows", "24/7". Metrics are named plainly, never hyped.
- **Never "chatbot".** Kira is an AI agent / platform. No emoji anywhere. No exclamation marks. Avoid "cutting-edge", "leading" — use specific, factual claims.
- Kickers/eyebrows are short noun phrases: "The Kira Platform", "What Kira does", "From hello to handled".
- **Positioning:** Rezonate's coined category is **engagement intelligence** — AI that turns population understanding into completed action. Near-zero search volume, so never orphan it: always gloss with a known term ("engagement intelligence platform: AI agents that…"). Signature contrast line: **"Bots answer. CRMs record. Analytics predicts. Engagement intelligence acts, completes, and learns."** Always write **"Rezonate (formerly KeyReply)"** on first mention. Full positioning, canonical definitions, proof stats, client roster, and honesty guardrails (e.g. the Engagement Intelligence *dashboard* is roadmap, not shipped) live in **`messaging.md`** — consult it before writing any copy, stat, or client name.

## VISUAL FOUNDATIONS
- **Color**: warm paper surfaces (#FCFBF9 / #F4F2ED / #EEEDE9) with near-black ink (#1A1510) and muted secondary (#75726D). Dark sections use #0E0D0B. Amber #EFA12E is the working accent (chips, live dots, highlights). The **brand gradient** (violet #B79DE8 → coral #D9605A → ember #E2683E → amber #EFA12E) appears **once per screen**: gradient text, icon chip, orb, or CTA ring — never as a page background.
- **The mesh**: soft violet field with an ember core (assets/mesh-light.png) — brand-moment texture for social/marketing headers, not UI backgrounds. Charcoal type on light mesh; cream wordmark on its saturated core.
- **Type**: Bricolage Grotesque only, 400–700. Display = 600 weight, −.03em tracking, line-height ~.98, text-wrap balance. Body 15–17px #75726D. Two eyebrow forms: pill (13/500 in a rgba(0,0,0,.05) capsule, radius 11px) and uppercase kicker (12/700, .14em tracking).
- **Geometry**: section shells radius 44px overlapping upward (margin-top −44px + up-shadow); cards 22px; small elements 16/12px; buttons and chips are full pills (999px).
- **Shadows**: long-throw and warm — e.g. `0 30px 60px -46px rgba(20,18,14,.5)`; sections cast `0 -24px 46px -30px rgba(0,0,0,.22)` upward. No hard borders on light: hairlines are rgba(20,18,14,.08–.12).
- **Buttons**: pill, 600 weight; variants dark (ink bg), white (with inner hairline), glass (blur + rgba(255,255,255,.14), dark heroes only), glow (ink bg + conic gradient border, breathing shadow). ALL get a conic **gradient halo on hover** (::after blur ring). Hero CTAs are 48px tall, min-width 178px.
- **Glass**: dark "liquid glass" cards (.lqcard): blur(22px) saturate(140%) over rgba(9,9,12,.5–.64), radius 24px — used for floating channel cards over video.
- **Motion**: reveals rise 22px + fade (data-rv, staggered data-d 1–5); content columns drift gently on scroll (data-py .06–.09, desktop only); full-bleed imagery drifts (data-par −.06–−.08); count-ups on stats (.cnum); hovers lift −6/−10px with deeper shadow; breathing (scale 1↔1.02) on live elements; easing cubic-bezier(.16,.84,.44,1). Nothing bounces.
- **Imagery**: warm, human, candid photography (people mid-conversation); gradient-texture orbs stand in for agents (never avatars/faces). Video heroes sit under an even dark wash for white type.
- **Layout**: fixed pill nav (max 660px) floating 15px from top; content max 1180px; sections stack as rounded shells alternating paper/cream/stone with occasional dark or full-bleed moments.

## ICONOGRAPHY
- Inline **stroke SVGs in the Lucide style**: 24 viewBox, stroke currentColor, stroke-width 2–2.4, round caps/joins, typically 13–20px rendered. No icon font, no PNG icons, no emoji, no unicode-as-icon.
- Icon chips: 30px, radius 9px, 1.5px gradient border wrap around a dark tile with a white stroke glyph.
- Waveform bars are the signature motif (voice made visible): rounded 4–9px bars, animated scaleY, in amber/white on dark or the gradient hues.
- The five-lens mark (assets/mark-gradient.png) is the logo-level mark: never recolor, never redraw.

## Index
- `messaging.md` — positioning & copy reference (the category, canonical definitions, voice patterns, proof register, client roster, honesty guardrails)
- `styles.css` → tokens/colors.css, tokens/typography.css, tokens/geometry.css
- `assets/` — mesh-light.png, mark-gradient.png, wordmark-cream.png, wordmark-white-nav.webp, og-image.jpg, orb-*.webp, favicon-64.png
- `guidelines/` — foundation specimen cards (colors, type, geometry, motifs)
- `components/core/` — Button, Eyebrow, Chip, Stat, Waveform, Orb, GlassCard (+ .d.ts, .prompt.md, cards)
- `ui_kits/website/` — marketing-site screen recreation (`index.html`) + faithful voice-demo screen (`KiraVoiceDemo.html`)
- `SKILL.md` — agent-skill entrypoint. Brand quick-facts also in `CLAUDE.md`.
- Live site pages (source of truth): `Rezonate.dc.html`, `Industry-*.dc.html`, `rz/site.css`.

## THE VOICE DEMO (KiraVoiceDemo)
The signature product surface on the homepage (`#live-demo`), imported as the `KiraVoiceDemo White` DC. How it works — mirror this in any recreation:
- **Two modes** via a pill toggle: **Live agent** (talk to Kira in-browser) and **Hear a recorded call** (real `.ogg` sample playback). The recorded toggle is disabled for industries with no samples.
- **Industry tabs** (Healthcare · Financial · Business · Sports), each a pill with a gradient orb dot. Industry→orb mapping: Healthcare `orb-spray`, Financial `orb-mick`, Business `orb-vivid`, Sports `orb-lime`.
- **Live stage**: a big center agent orb flanked by two dimmed side orbs (prev/next industry, swipeable on touch). The orb wraps a `<kira-voice-agent>` web component (loaded lazily from `rz/voice-widget.js`, LiveKit-backed) exposing a **conic-gradient-ring call button**. Idle = dark `#141210` center; **live call = green center + green breathing ripple** (`rgba(62,210,126)`); hover-during-live = red (hang up). Below: agent name, use-case chips, and a mic-privacy hint.
- **Recorded stage**: sample cards — orb + white play button that becomes animated equalizer bars while playing (`.ogg` via a hidden `<audio>`).
- Heading is always `Don't read about it. Talk to it.` with the gradient on “Talk to it.” Footer pairs a glow “Request a demo” with a soft “Customer stories”.
The `Orb` component and `ui_kits/website/KiraVoiceDemo.html` both reflect this exact treatment.

## Intentional additions
- None. Components mirror what the live site defines. Fonts load from Google Fonts (no binaries were provided) — flag: supply licensed woff2 files to self-host.
