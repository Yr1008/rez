# Rezonate Hero Scroll — How It Works (handoff for Claude Code)

All five cinematic heroes (homepage + 4 industry pages) run on **one shared engine: `rz/cine.js`**.
There is no per-page JS. You tweak a hero entirely through **HTML attributes** on the markup;
`cine.js` reads those attributes and drives everything off scroll position.

---

## 1. The core idea

A hero is a **tall section** (`height: 340–380vh`) containing a **`position:sticky; top:0; height:100vh`** stage.
As you scroll the tall section past the viewport, the sticky stage stays pinned and we compute a
**scroll progress `p` from 0 → 1** across the section. Everything (which frame shows, text, cards,
zoom, progress bar) is a pure function of `p`. Scroll up and it all runs backwards. Nothing is
time-based, so it's frame-accurate in both directions and only moves when the user scrolls.

`p` is **smoothed** before use: `cine.js` keeps an eased value `sp` that chases the real scroll
`tp` (`sp += (tp - sp) * EASE`). That's what fills the gaps between chunky trackpad/wheel ticks so
frames advance smoothly instead of jumping. `EASE` comes from the section's `data-ease` (default
`0.05`; all current heroes use `0.085`). **Lower = heavier/laggier glide, higher = snappier/tighter.**

---

## 2. The "video" is actually a JPG frame sequence (canvas scrub)

We do **not** scrub a real `<video>` for the heroes. Seeking an MP4 on scroll stutters (long-GOP
seeks can freeze ~400ms). Instead each hero ships a folder of **sequential JPG frames**
(`f00.jpg, f01.jpg, …`) and we draw the frame nearest the scroll position onto a `<canvas>`.
Instant first frame, smooth both ways, zero playback.

Markup (this is the whole "video"):

```html
<canvas data-seq
        data-seq-dir="rz/seq/sports"   <!-- folder of frames -->
        data-seq-count="96"            <!-- how many frames: f00..f95 -->
        style="position:absolute;inset:0;width:100%;height:100%;
               object-fit:cover;object-position:center 35%;
               background:#06070a url(rz/poster-sports.jpg) center/cover">
</canvas>
```

- **`data-seq-dir`** — folder. `cine.js` loads `dir + '/f' + NN + '.jpg'` (NN is zero-padded to 2 digits).
- **`data-seq-count`** — number of frames in that folder. Must match the actual file count.
- **`object-position`** — the crop. `cine.js` reads the Y value and crops the canvas identically, so
  changing `center 35%` → `center 18%` reframes the shot (e.g. to keep a face below the menu bar).
- **`background: … url(poster.jpg)`** — the CSS poster shows instantly while frames decode; it's
  covered as soon as the real target frame is ready.
- **`data-seq-sharp`** (optional flag) — snap to the nearest crisp frame instead of cross-dissolving
  between two. **Use it for moving-camera footage** (panning/tracking shots) — dissolving two
  spatially different frames ghosts/double-images and reads as a skip. Omit it for subtle motion
  (talking head) where the crossfade looks smoother. Sports uses 96 frames; if it ever looks like it
  skips, add `data-seq-sharp`.

**Frame budget:** frames map across `p/0.92` (the last ~8% of scroll is "settle"/outro). 48 frames
is the baseline; 96 (home, sports) gives a longer, smoother motion for faster/bigger camera moves.
More frames = smoother but heavier download.

### Current heroes
| Page | Folder | Frames | Section height |
|---|---|---|---|
| Homepage (`Rezonate.dc.html`) | `rz/seq/homehero` | 96 | 380vh |
| Healthcare | `rz/seq/healthcare` | 48 | 340vh |
| Financial | `rz/seq/finance` | 48 | 340vh |
| Business | `rz/seq/homehero` (placeholder — reuses homepage footage) | 96 | 340vh |
| Sports | `rz/seq/sports` | 96 | 380vh |

**To swap the footage on any hero:** export the new clip to JPG frames named `f00.jpg…fNN.jpg`,
drop them in a folder under `rz/seq/`, point `data-seq-dir` at it and set `data-seq-count` to the
count. Update the `poster` too. Keep frames ~1600–1920px wide; the canvas renders at device
resolution so the source is the quality ceiling.

### (Legacy) real-video scrub — still in the engine, unused
`cine.js` also supports `<video data-scrub>` (drives `currentTime` off `p`, never plays). No hero
uses it now — the frame sequence replaced it because it's smoother. Prefer frames for new heroes.

---

## 3. The choreography timeline (what happens as `p` goes 0→1)

Everything keys off `p`. Approximate windows (all in `render(p)` in `cine.js`):

| `p` range | What animates |
|---|---|
| 0 → 0.62 | `#cinevid-wrap` **dolly**: scales 1.14 → 1.06 + slight rise (the slow push-in). |
| 0 → 0.06 | `#cinecue` scroll hint fades out. |
| 0.07 → 0.18 | `#cinehead` (the big opening headline) rises and fades out. |
| 0.14 → 0.80 | `#cinelabelwrap` / `#cineword` word-cycle visible. |
| 0.16 → 0.78 | `#cineword` swaps through `data-words` (one word per slice). |
| 0.18 → 0.78 | `#cinestat` swaps through `data-words` stat pairs (`num::label`). |
| `data-cardbase` → +`data-cardspan` | `.cine-card` screens fly in one after another. |
| 0.84 → 0.97 | `#cineclose` outro headline/CTA rises in; cards & labels fade out. |
| 0 → 1 | `#cineprog` progress bar width = `p`. |

You don't edit these numbers often — you mostly edit the **content** in the markup below.

### Word cycle (`#cineword`)
```html
<span id="cineword"
      data-words="callers|patients|members|fans"
      data-accents="#fff|#D11A2A|#fff|#D11A2A"></span>
```
`data-words` = pipe-separated words shown in sequence as you scroll. `data-accents` = matching color
per word (optional). Add/remove words freely; they're evenly spread across the 0.16–0.78 window.

### Stat cycle (`#cinestat`)
```html
<div id="cinestat" data-words="0::seats left unsold|2×::faster fan response|60+::languages, one team">
```
Each entry is `BIGNUMBER::label`, pipe-separated. `cine.js` splits on `::` into `#cinestatnum` /
`#cinestatlbl`.

---

## 4. Floating UI cards (`.cine-card`)

The little glass cards that fly over the footage:

```html
<div class="cine-card" data-x="-34" data-y="-13" data-rot="0"
     style="position:absolute;left:50%;top:50%;width:288px;opacity:0">
  <div class="lqcard"> … card contents … </div>
</div>
```

- **`data-x` / `data-y`** — final resting offset in **vw / vh** from screen center. Negative x = left,
  negative y = up. This is how you place "two cards on the left, one on the right" without covering a
  face — give the right card a positive `data-x`, push it down with a positive `data-y`.
- **`data-rot`** — tilt in degrees.
- Cards stagger in order of DOM appearance. Timing is controlled per-section by two attributes on
  `#cinehero`:
  - **`data-cardbase`** (default `0.16`) — `p` at which the **first** card starts entering.
  - **`data-cardspan`** (default `0.56`) — total `p` window the cards spread across. Smaller span =
    cards appear closer together / sooner. Sports uses `data-cardbase="0.12" data-cardspan="0.52"`
    (earlier + tighter) — that was the fix for "cards take too long to come on the video."

`.lqcard` is the liquid-glass card style (defined in `rz/site.css`). Reuse it for visual consistency.

---

## 5. Section-level knobs (attributes on `#cinehero`)

```html
<section id="cinehero" data-ease="0.085" data-cardbase="0.12" data-cardspan="0.52"
         style="height:380vh;background:#06070a">
```

| Attribute | Effect | Tuning |
|---|---|---|
| `height` (inline style) | **Scroll length** of the whole hero. | Taller = slower/longer scrub (more scroll per frame). 340vh standard, 380vh for the bigger 96-frame heroes. |
| `data-ease` | Smoothing of the scroll glide. | 0.085 current. Lower = floatier, higher = tighter. |
| `data-cardbase` | When first card enters (`p`). | Lower = cards come sooner. |
| `data-cardspan` | Window cards spread over (`p`). | Lower = cards bunch up / finish sooner. |

**"Video feels too fast / skipping frames"** → increase `height` (more scroll distance per frame) and/or
add more frames to the sequence. **"Too slow"** → decrease `height`. **"Glitchy/ghosting on a pan"**
→ add `data-seq-sharp` to the canvas.

---

## 6. Required DOM contract (IDs `cine.js` looks for)

Inside the sticky stage, `cine.js` drives these by id (all optional except the canvas):

```
#cinevid-wrap        the dolly wrapper (gets the scale/translate)
  canvas[data-seq]   the frame-sequence canvas  (the footage)
#cinescrim2          darken layer (currently kept at 0 opacity)
#cinehead            opening headline (phase A, fades out early)
#cinelabelwrap       wrapper for the word cycle
  #cineword          cycling word  (data-words / data-accents)
#cinestat            cycling stat   (data-words "num::label")
  #cinestatnum, #cinestatlbl
.cine-card           floating screens (data-x/data-y/data-rot)
.cine-beat           optional fade-in beats (data-in / data-out in p)
#cineclose           outro block (headline + CTA, enters ~0.84)
#cinecue             scroll hint (fades out at start)
#cineprog            progress bar (width = p)
```

If you add a new hero, copy an existing page's `#cinehero` block wholesale and just change the
sequence folder, counts, headline, words, stats, and cards. The engine wires itself up
automatically — it polls for `#cinehero` + a `canvas[data-seq]` and boots when both exist
(the markup streams in, so it retries for a few seconds).

---

## 7. Where things live

- `rz/cine.js` — the engine (don't usually need to touch it; it's all attribute-driven).
- `rz/seq/<name>/f00.jpg…` — frame sequences (the footage).
- `rz/poster-<name>.jpg` — instant poster per hero.
- `rz/site.css` — `.lqcard`, `.eyebrow`, `.serif-i`, etc. shared styles.
- Each page (`Rezonate.dc.html`, `Industry-*.dc.html`) loads `cine.js` in its `<helmet>` and holds
  its own `#cinehero` markup.

### TL;DR for a quick tweak
- **Change the clip** → new JPG frames in a `rz/seq/<name>/` folder + update `data-seq-dir` / `data-seq-count` / poster.
- **Reframe (face cut off)** → change canvas `object-position` Y%.
- **Speed of scrub** → change section `height`.
- **Glide feel** → `data-ease`.
- **Card position** → `data-x` / `data-y` / `data-rot`. **Card timing** → `data-cardbase` / `data-cardspan`.
- **Words / stats** → `data-words` (+ `data-accents`).
- **Pan ghosting** → add `data-seq-sharp` to the canvas.
