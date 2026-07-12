/* kira-stopmotion.jsx — "Every conversation, handled."
   Apple-style stop-motion brand film for Kira (Rezonate).
   All motion is quantized to 12fps steps with deterministic per-frame
   wobble — nothing tweens smoothly, everything is hand-placed paper craft. */

(() => {
  const { Stage, Sprite, useTime } = window;

  // ── stop-motion core ──────────────────────────────────────────────
  const FPS = 12;
  const fr = (t) => Math.floor(t * FPS + 1e-6);           // global frame index
  const qt = (t) => fr(t) / FPS;                          // quantized seconds
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const SETTLE = [0.5, 1.18, 0.9, 1.06, 1];               // pop-in (frames)
  const OUTK   = [1.12, 0.6, 0.18];                       // pop-out (frames)
  const DROP   = [-26, 8, -3, 1, 0];                      // little drop-bounce

  // scale at time t for an element popping at `at`, leaving at `out`. null = not rendered.
  function popScale(t, at, out) {
    const f = fr(t) - fr(at);
    if (f < 0) return null;
    if (out != null) {
      const fo = fr(t) - fr(out);
      if (fo >= 0) return fo < OUTK.length ? OUTK[fo] : null;
    }
    return f < SETTLE.length ? SETTLE[f] : 1;
  }
  function popDy(t, at) { const f = fr(t) - fr(at); return f < 0 ? 0 : (f < DROP.length ? DROP[f] : 0); }

  // per-frame hand-wobble
  function wob(f, id, ampR, ampT) {
    return {
      r: (rnd(f * 7.13 + id * 91.7) - 0.5) * 2 * ampR,
      x: (rnd(f * 3.71 + id * 47.3) - 0.5) * 2 * ampT,
      y: (rnd(f * 5.29 + id * 23.9) - 0.5) * 2 * ampT,
    };
  }

  function hexLerp(a, b, p) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (sh) => Math.round(((pa >> sh) & 255) + (((pb >> sh) & 255) - ((pa >> sh) & 255)) * p);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  }
  const PALETTE = ['#B79DE8', '#C97599', '#D9605A', '#E2683E', '#EFA12E'];
  function paletteAt(p) {
    const seg = Math.min(3, Math.floor(p * 4));
    return hexLerp(PALETTE[seg], PALETTE[seg + 1], p * 4 - seg);
  }

  const INK = '#141414', CREAM = '#ECEAE5', PANEL = '#E4E2DD', DARK = '#0E0D0B', PAPER = '#FBF8EF';
  const GREEN = '#0E9E76';

  // ── Pop: stop-motion placed element (centered at x,y) ─────────────
  function Pop({ x, y, at, out, id = 0, rot = 0, amp = 1, z = 5, shadow = false, dy = 0, style, children }) {
    const t = useTime();
    const s = popScale(t, at, out);
    if (s == null) return null;
    const f = fr(t);
    const settled = f - fr(at) >= 2;
    const w = settled ? wob(f, id, 1.5 * amp, 2.4 * amp) : { r: 0, x: 0, y: 0 };
    const drop = popDy(t, at);
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: z,
        transform: `translate(-50%,-50%) translate(${w.x}px,${w.y + drop + dy}px) rotate(${rot + w.r}deg) scale(${s})`,
        filter: shadow ? 'drop-shadow(0 14px 20px rgba(30,12,0,0.15))' : undefined,
        ...style,
      }}>
        {children}
      </div>
    );
  }

  // word inside a caption — pops in place, layout width always reserved
  function PopSpan({ at, out, id = 0, children, style }) {
    const t = useTime();
    const s = popScale(t, at, out);
    const f = fr(t);
    const settled = s != null && f - fr(at) >= 2;
    const w = settled ? wob(f, id, 1.1, 1.4) : { r: 0, x: 0, y: 0 };
    return (
      <span style={{
        display: 'inline-block',
        transform: s == null ? 'scale(0)' : `translate(${w.x}px,${w.y}px) rotate(${w.r}deg) scale(${s})`,
        opacity: s == null ? 0 : 1,
        ...style,
      }}>{children}</span>
    );
  }

  function Caption({ words, x = 960, y, at, out, size = 64, color = INK, weight = 640, gapF = 2, id = 0 }) {
    return (
      <div style={{
        position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', zIndex: 20,
        display: 'flex', gap: '0.30em', justifyContent: 'center', whiteSpace: 'pre',
        fontSize: size, fontWeight: weight, color, letterSpacing: '-0.035em', lineHeight: 1,
      }}>
        {words.map((wd, i) => (
          <PopSpan key={i} at={at + (i * gapF) / FPS} out={out != null ? out + (i % 3) / FPS : undefined} id={id + i * 7}>{wd}</PopSpan>
        ))}
      </div>
    );
  }

  // ── the Kira mark (5 dancing pills) ───────────────────────────────
  const BARS = [
    { g: ['#C9B2F2', '#A98BE0'], b: 0.52 },
    { g: ['#C08AC8', '#CE5F63'], b: 0.80 },
    { g: ['#E06A54', '#D94F49'], b: 1.00 },
    { g: ['#EA8442', '#E2683E'], b: 0.86 },
    { g: ['#F2AC3C', '#E8912F'], b: 0.55 },
  ];
  const BORN_ORDER = [2, 1, 3, 0, 4], BORN_OFFS = [0, 0.4, 0.7, 1.0, 1.3];

  function Mark({ size = 170, dance = 0, speed = 5, bornAt = null, crouch = 0, phase = 0, t }) {
    const st = qt(t);
    const w = size * 0.185, gap = size * 0.082;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap }}>
        {BARS.map((bar, k) => {
          let s = 1;
          if (bornAt != null) {
            const ps = popScale(t, bornAt + BORN_OFFS[BORN_ORDER.indexOf(k)]);
            s = ps == null ? 0 : ps;
          }
          const wave = Math.abs(Math.sin(st * speed + k * 1.9 + phase + rnd(k * 9 + phase) * 2.2));
          let mul = 1 + dance * (wave - 0.55) * 0.95;
          mul = Math.max(0.2, mul) * (1 - 0.5 * crouch);
          return (
            <div key={k} style={{
              width: w, height: Math.max(8, size * bar.b * mul), borderRadius: 999,
              background: `linear-gradient(180deg, ${bar.g[0]}, ${bar.g[1]})`,
              transform: `scale(${s})`,
            }} />
          );
        })}
      </div>
    );
  }

  // ── small props ───────────────────────────────────────────────────
  function Bubble({ text, variant = 'white', tail = 'left', size = 27 }) {
    const styles = {
      white:  { bg: '#FFFFFF', fg: INK },
      dark:   { bg: INK, fg: '#F5F1EA' },
      purple: { bg: '#D8C8F4', fg: '#3A2B58' },
      amber:  { bg: '#F5CE84', fg: '#4A3208' },
    }[variant];
    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          background: styles.bg, color: styles.fg, fontSize: size, fontWeight: 600,
          letterSpacing: '-0.015em', padding: '16px 26px', borderRadius: 24, whiteSpace: 'nowrap',
          boxShadow: '0 2px 0 rgba(0,0,0,0.04)',
        }}>{text}</div>
        <div style={{
          position: 'absolute', bottom: -7, [tail]: 26, width: 18, height: 18,
          background: styles.bg, transform: 'rotate(45deg)', borderRadius: 4,
        }} />
      </div>
    );
  }

  function Chip({ label, dot }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 11, background: INK, color: '#F5F1EA',
        fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em', padding: '13px 24px', borderRadius: 999,
      }}>
        <span style={{ width: 11, height: 11, borderRadius: 99, background: dot }} />
        {label}
      </div>
    );
  }

  function CheckBadge({ size = 46, color = GREEN }) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 0 rgba(0,0,0,0.08)',
      }}>
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
          <path d="M4.5 12.5l5 5L19.5 7" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  function Ring({ at, x, y, size = 420, color = INK, width = 7 }) {
    const t = useTime();
    const f = fr(t) - fr(at);
    if (f < 0 || f > 4) return null;
    const s = [0.35, 0.8, 1.25, 1.7, 2.1][f], o = [0.9, 0.7, 0.45, 0.22, 0.08][f];
    return (
      <div style={{
        position: 'absolute', left: x, top: y, width: size, height: size, zIndex: 3,
        transform: `translate(-50%,-50%) scale(${s})`,
        border: `${width}px solid ${color}`, borderRadius: '50%', opacity: o,
      }} />
    );
  }

  function Dust({ at, x, y, colors = PALETTE, n = 8, spread = 190 }) {
    const t = useTime();
    const f = fr(t) - fr(at);
    if (f < 0 || f > 3) return null;
    const R = [55, 110, 155, 185];
    const S = [1, 0.85, 0.55, 0.25];
    return (
      <div style={{ position: 'absolute', left: x, top: y, zIndex: 30 }}>
        {Array.from({ length: n }).map((_, i) => {
          const a = (i / n) * Math.PI * 2 + rnd(i * 13 + at) * 0.9;
          const r = R[f] * (0.75 + rnd(i * 7 + at) * 0.5) * (spread / 190);
          const sz = (10 + rnd(i * 3 + at) * 10) * S[f];
          const round = i % 2 === 0;
          return (
            <div key={i} style={{
              position: 'absolute', left: Math.cos(a) * r, top: Math.sin(a) * r,
              width: sz, height: sz, background: colors[i % colors.length],
              borderRadius: round ? '50%' : 3,
              transform: `translate(-50%,-50%) rotate(${rnd(i + f) * 90}deg)`,
            }} />
          );
        })}
      </div>
    );
  }

  // stepped camera
  function Cam({ zoom = 1, children }) {
    return (
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 52%' }}>
        {children}
      </div>
    );
  }
  // quantize a smooth zoom curve to chunky 2-frame steps
  const steppedZoom = (t, fn) => fn(Math.floor(fr(t) / 2) * 2 / FPS);
  const zlerp = (keysT, keysV) => (x) => {
    if (x <= keysT[0]) return keysV[0];
    for (let i = 0; i < keysT.length - 1; i++) {
      if (x >= keysT[i] && x <= keysT[i + 1]) {
        const p = (x - keysT[i]) / (keysT[i + 1] - keysT[i]);
        return keysV[i] + (keysV[i + 1] - keysV[i]) * p;
      }
    }
    return keysV[keysV.length - 1];
  };

  // ════════════════════════════════════════════════════════════════
  // SCENE 1 (0–15s) · cream · birth → chaos → snap-to-order
  // ════════════════════════════════════════════════════════════════
  const SNAP = 10.33;
  const SNAPK = [0, 0.45, 0.8, 1];

  const BUBBLES = [
    { q: 'Reschedule my MRI?',     cx: 430,  cy: 330, r: -8,  at: 5.2,  gx: 250,  gy: 300, v: 'white',  tail: 'left'  },
    { q: 'Card declined — help!',  cx: 1500, cy: 340, r: 7,   at: 5.7,  gx: 1670, gy: 300, v: 'dark',   tail: 'right' },
    { q: 'Refill my Rx, please',   cx: 300,  cy: 560, r: -12, at: 6.2,  gx: 250,  gy: 470, v: 'white',  tail: 'left'  },
    { q: "Where's my refund?",     cx: 1620, cy: 560, r: 10,  at: 6.7,  gx: 1670, gy: 470, v: 'white',  tail: 'right' },
    { q: 'Renew my season pass',   cx: 460,  cy: 800, r: 9,   at: 7.0,  gx: 250,  gy: 640, v: 'purple', tail: 'left'  },
    { q: 'Reset my password',      cx: 1460, cy: 810, r: -7,  at: 7.25, gx: 1670, gy: 640, v: 'white',  tail: 'right' },
    { q: 'Gate 4 or gate 5?',      cx: 900,  cy: 260, r: -5,  at: 7.5,  gx: 570,  gy: 300, v: 'dark',   tail: 'left'  },
    { q: 'Is Dr. Tan in Friday?',  cx: 1080, cy: 885, r: 8,   at: 7.75, gx: 1350, gy: 810, v: 'white',  tail: 'right' },
    { q: 'Payment due today?',     cx: 640,  cy: 430, r: 12,  at: 8.0,  gx: 570,  gy: 470, v: 'white',  tail: 'left'  },
    { q: 'Resend my tickets',      cx: 1290, cy: 430, r: -10, at: 8.17, gx: 1350, gy: 470, v: 'amber',  tail: 'right' },
    { q: "Laptop won't boot",      cx: 250,  cy: 935, r: -6,  at: 8.33, gx: 250,  gy: 810, v: 'white',  tail: 'left'  },
    { q: 'Update my address',      cx: 1680, cy: 930, r: 5,   at: 8.5,  gx: 1670, gy: 810, v: 'white',  tail: 'right' },
    { q: 'Cancel order #4417',     cx: 700,  cy: 945, r: -11, at: 8.58, gx: 570,  gy: 810, v: 'dark',   tail: 'left'  },
    { q: 'New starter Monday',     cx: 1240, cy: 300, r: -13, at: 8.67, gx: 1350, gy: 300, v: 'white',  tail: 'right' },
    { q: 'Talk to a human?',       cx: 560,  cy: 660, r: 6,   at: 8.75, gx: 570,  gy: 640, v: 'white',  tail: 'left'  },
    { q: 'Am I covered for this?', cx: 1390, cy: 700, r: -9,  at: 8.83, gx: 1350, gy: 640, v: 'white',  tail: 'right' },
  ];
  const CHIPS = [
    { label: 'WhatsApp', dot: '#3ED27E', x: 500,  y: 205, r: -6,  at: 6.0  },
    { label: 'Voice',    dot: '#EFA12E', x: 1430, y: 208, r: 7,   at: 6.45 },
    { label: 'SMS',      dot: '#B79DE8', x: 960,  y: 965, r: -4,  at: 6.9  },
    { label: 'Teams',    dot: '#7B83EB', x: 168,  y: 655, r: -11, at: 7.35 },
    { label: 'Slack',    dot: '#E2683E', x: 1755, y: 660, r: 9,   at: 8.05 },
    { label: 'Email',    dot: '#D9605A', x: 1758, y: 418, r: -8,  at: 8.45 },
  ];

  function markParamsS1(t) {
    if (t < 2.4)  return { dance: 0.30, speed: 3.0 };
    if (t < 4.4)  return { dance: 1.00, speed: 7.0 };   // first "speech"
    if (t < 5.0)  return { dance: 0.30, speed: 3.0 };
    if (t < 10.0) {                                     // chaos builds
      const n = BUBBLES.filter(b => b.at <= t).length + CHIPS.filter(c => c.at <= t).length;
      return { dance: 0.35 + 0.55 * (n / 22), speed: 4 + 3 * (n / 22) };
    }
    if (t < SNAP) return { dance: 0, speed: 0, crouch: 1 };  // inhale
    if (t < 12.8) return { dance: 1.0, speed: 8.0 };         // triumphant
    return { dance: 0.4, speed: 4 };
  }

  function SceneOne({ cap }) {
    const t = useTime();
    const f = fr(t);
    const zoom = steppedZoom(t, zlerp([0, 3.8, 5.0, 10.1, 10.4, 11.2, 15], [1.07, 1.12, 1.0, 1.0, 1.09, 1.02, 1.05]));

    // mark transform state
    const mp = markParamsS1(t);
    // tilt toward the latest arrival
    let tilt = 0;
    if (t >= 5 && t < 10) {
      const evts = [...BUBBLES.map(b => ({ at: b.at, x: b.cx })), ...CHIPS.map(c => ({ at: c.at, x: c.x }))];
      for (const e of evts) {
        const df = fr(t) - fr(e.at);
        if (df >= 0 && df < 5) tilt = (e.x < 960 ? -1 : 1) * 5.5 * (1 - df / 5);
      }
    }
    // snap pulse
    let pulse = 1;
    const pf = fr(t) - fr(SNAP);
    if (pf >= 0 && pf < 4) pulse = [1.34, 1.12, 1.05, 1.02][pf];
    // anticipation squash
    const squash = mp.crouch ? 'scale(1.07, 0.86)' : '';
    // celebratory double-hop near the end
    let hop = 0;
    for (const h of [13.9, 14.35]) {
      const hf = fr(t) - fr(h);
      if (hf >= 0 && hf < 5) hop = [0, -36, -54, -34, 0][hf];
    }
    const mw = wob(f, 99, 0.9, 1.6);

    // bubble snap progress
    const sf = fr(t) - fr(SNAP + 0.08);
    const S = sf < 0 ? 0 : (sf < SNAPK.length ? SNAPK[sf] : 1);

    return (
      <div style={{ position: 'absolute', inset: 0, background: CREAM }}>
        <Cam zoom={zoom}>
          {/* captions */}
          {cap && <Caption words={['Questions,', 'from', 'everywhere.']} y={150} at={7.3} out={10.0} size={66} id={200} />}
          {cap && <Caption words={['Meet', 'Kira.']} y={150} at={10.9} out={14.3} size={96} id={220} />}

          {/* chat bubbles: chaos → grid */}
          {BUBBLES.map((b, i) => {
            const x = b.cx + (b.gx - b.cx) * S;
            const y = b.cy + (b.gy - b.cy) * S;
            const rot = b.r * (1 - S);
            // hop when its check lands
            const cAt = 11.1 + i / FPS;
            const cf = fr(t) - fr(cAt);
            const dy = (cf === 1 || cf === 2) ? -9 : 0;
            return (
              <Pop key={i} x={x} y={y} at={b.at} out={13.75 + rnd(i * 3.3) * 0.5} id={i + 10}
                   rot={rot} amp={S > 0.9 ? 0.45 : 1.15} dy={dy} shadow z={6}>
                <Bubble text={b.q} variant={b.v} tail={b.tail} />
              </Pop>
            );
          })}

          {/* channel chips (chaos only — swept away by the snap) */}
          {CHIPS.map((c, i) => (
            <Pop key={i} x={c.x} y={c.y} at={c.at} out={SNAP + (i % 3) / FPS} id={i + 60} rot={c.r} amp={1.2} shadow z={7}>
              <Chip label={c.label} dot={c.dot} />
            </Pop>
          ))}

          {/* checkmarks tick across the grid */}
          {t >= SNAP && BUBBLES.map((b, i) => (
            <Pop key={'c' + i} x={b.gx + 148} y={b.gy - 46} at={11.1 + i / FPS} out={13.7 + rnd(i * 5.1) * 0.4}
                 id={i + 300} amp={0.5} z={9}>
              <CheckBadge />
            </Pop>
          ))}

          {/* the protagonist */}
          <Ring at={SNAP} x={960} y={565} size={430} />
          <Dust at={SNAP} x={960} y={565} />
          <div style={{
            position: 'absolute', left: 960, top: 565, zIndex: 8,
            transform: `translate(-50%,-50%) translate(${mw.x}px,${mw.y + hop}px) rotate(${tilt + mw.r}deg) scale(${pulse}) ${squash}`,
            filter: 'drop-shadow(0 18px 26px rgba(30,12,0,0.16))',
          }}>
            <Mark t={t} size={190} bornAt={0.5} dance={mp.dance} speed={mp.speed} crouch={mp.crouch || 0} />
          </div>
        </Cam>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE 2 (15–21s) · dark · live voice call + barge-in
  // ════════════════════════════════════════════════════════════════
  const NBARS = 30;
  const W1 = ['Hi', 'Maria', '—', 'your', 'appointment’s', 'moved', 'to', 'Tuesday', 'at', '2:15.'];
  const W1HL = [7, 9];
  const W2 = ['Done.', 'Thursday', 'at', '2:15.'];
  const W2HL = [1];

  function SceneVoice({ cap }) {
    const t = useTime();
    const st = qt(t);
    const zoom = steppedZoom(t, zlerp([15, 18.2, 18.5, 19.4, 21], [1.0, 1.04, 1.1, 1.05, 1.08]));

    const listening = t >= 18.35 && t < 19.4;   // barge-in: Kira shuts up
    const speaking = (t >= 16.0 && t < 18.35) || (t >= 19.4 && t < 20.5);

    return (
      <div style={{ position: 'absolute', inset: 0, background: DARK }}>
        <Cam zoom={zoom}>
          {/* LIVE chip */}
          <Pop x={960} y={185} at={15.4} out={20.6} id={400} amp={0.6} z={10}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 28px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.78)', fontSize: 22, fontWeight: 600, letterSpacing: '0.18em',
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: 99, background: '#E5484D',
                opacity: (Math.floor(fr(t) / 4) % 2) ? 0.35 : 1,
              }} />
              LIVE · VOICE CALL
            </div>
          </Pop>

          {/* the big waveform */}
          <div style={{
            position: 'absolute', left: 960, top: 520, transform: 'translate(-50%,-50%)',
            display: 'flex', alignItems: 'center', gap: 15, zIndex: 6,
          }}>
            {Array.from({ length: NBARS }).map((_, i) => {
              const born = popScale(t, 15.25 + i / 24, 20.55 + i / 40);
              if (born == null) return <div key={i} style={{ width: 25 }} />;
              const env = 40 + 155 * Math.pow(Math.sin(Math.PI * i / (NBARS - 1)), 0.7);
              let mul;
              if (listening) mul = 0.14 + 0.06 * Math.abs(Math.sin(st * 3 + i * 0.8));
              else if (speaking) mul = 0.28 + 0.72 * Math.abs(Math.sin(st * 7.5 + i * 0.55 + rnd(i) * 2.1));
              else mul = 0.2 + 0.1 * Math.abs(Math.sin(st * 2.2 + i * 0.5));
              return (
                <div key={i} style={{
                  width: 25, height: Math.max(10, env * mul), borderRadius: 999,
                  background: `linear-gradient(180deg, ${paletteAt(i / (NBARS - 1))}, ${paletteAt(Math.min(1, i / (NBARS - 1) + 0.12))})`,
                  transform: `scaleX(${born})`,
                  boxShadow: '0 0 24px rgba(226,104,62,0.25)',
                }} />
              );
            })}
          </div>

          {/* transcript 1 */}
          <div style={{
            position: 'absolute', left: 960, top: 790, transform: 'translate(-50%,-50%)', zIndex: 8,
            display: 'flex', gap: '0.3em', whiteSpace: 'pre', fontSize: 50, fontWeight: 500,
            color: '#F5F1EA', letterSpacing: '-0.02em',
            opacity: listening ? 0.3 : 1,
          }}>
            {W1.map((wd, i) => (
              <PopSpan key={i} at={16.1 + (i * 2) / FPS} out={19.35 + (i % 4) / FPS} id={500 + i * 3}
                       style={W1HL.includes(i) ? { color: '#EFA12E' } : undefined}>{wd}</PopSpan>
            ))}
          </div>

          {/* barge-in bubble from the caller */}
          <Pop x={1420} y={330} at={18.35} out={20.5} id={470} rot={5} amp={0.8} shadow z={9}>
            <Bubble text="Actually — Thursday?" variant="white" tail="right" size={30} />
          </Pop>
          <Ring at={18.35} x={1420} y={330} size={240} color="rgba(255,255,255,0.7)" width={5} />

          {/* transcript 2 */}
          <div style={{
            position: 'absolute', left: 960, top: 790, transform: 'translate(-50%,-50%)', zIndex: 8,
            display: 'flex', gap: '0.3em', whiteSpace: 'pre', fontSize: 54, fontWeight: 560,
            color: '#F5F1EA', letterSpacing: '-0.02em',
          }}>
            {W2.map((wd, i) => (
              <PopSpan key={i} at={19.55 + (i * 2) / FPS} out={20.6 + (i % 3) / FPS} id={560 + i * 3}
                       style={W2HL.includes(i) ? { color: '#EFA12E' } : undefined}>{wd}</PopSpan>
            ))}
          </div>

          {cap && (
            <Caption words={['Real-time', 'voice.', 'Barge-in', 'ready.']} y={935} at={19.7} out={20.75}
                     size={34} color="rgba(255,255,255,0.55)" weight={500} id={600} />
          )}
        </Cam>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE 3 (21–26.5s) · panel · governed workflow + stamps
  // ════════════════════════════════════════════════════════════════
  const NODES = [
    { x: 420,  at: 21.3, label: 'Intake' },
    { x: 780,  at: 21.8, label: 'Verify' },
    { x: 1140, at: 22.3, label: 'Schedule' },
    { x: 1500, at: 22.8, label: 'Hand-off' },
  ];
  const NODE_Y = 570;
  const STAMPS = [
    { txt: 'HIPAA', sub: 'COMPLIANT', x: 660,  y: 350, r: -10, at: 24.2 },
    { txt: 'SOC 2', sub: 'TYPE II',   x: 1010, y: 310, r: 7,   at: 24.8 },
    { txt: 'GDPR',  sub: 'READY',     x: 1340, y: 380, r: -6,  at: 25.4 },
  ];

  function NodeIcon({ kind }) {
    const s = { stroke: INK, strokeWidth: 3.4, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (kind === 0) return <svg width="46" height="46" viewBox="0 0 46 46"><path {...s} d="M8 10h30a3 3 0 013 3v16a3 3 0 01-3 3H20l-8 7v-7H8a3 3 0 01-3-3V13a3 3 0 013-3z" /><path {...s} d="M14 19h18M14 26h11" /></svg>;
    if (kind === 1) return <svg width="46" height="46" viewBox="0 0 46 46"><path {...s} d="M23 5l14 5v11c0 9-6 16-14 19C15 37 9 30 9 21V10l14-5z" /><path {...s} d="M16.5 22.5l4.5 4.5 9-10" /></svg>;
    if (kind === 2) return <svg width="46" height="46" viewBox="0 0 46 46"><rect {...s} x="6" y="9" width="34" height="31" rx="4" /><path {...s} d="M6 18h34M15 5v8M31 5v8" /><circle cx="23" cy="29" r="3.4" fill={INK} /></svg>;
    return <svg width="46" height="46" viewBox="0 0 46 46"><circle {...s} cx="23" cy="16" r="7" /><path {...s} d="M9 39c1.5-8 7-12 14-12s12.5 4 14 12" /></svg>;
  }

  function SceneFlow({ cap }) {
    const t = useTime();
    const zoom = steppedZoom(t, zlerp([21, 24, 24.3, 26.5], [1.04, 1.08, 1.0, 1.03]));

    // hopping packet: node0→1→2→3
    let packet = null;
    const hops = [23.1, 23.55, 24.0];
    for (let h = 0; h < hops.length; h++) {
      const hf = fr(t) - fr(hops[h]);
      if (hf >= 0 && hf < 6) {
        const p = Math.min(1, hf / 5);
        const x = NODES[h].x + (NODES[h + 1].x - NODES[h].x) * p;
        const y = NODE_Y - 90 - Math.sin(Math.PI * p) * 60;
        packet = { x, y };
      }
    }
    const packetDone = fr(t) >= fr(24.5);

    return (
      <div style={{ position: 'absolute', inset: 0, background: PANEL }}>
        <Cam zoom={zoom}>
          {cap && <Caption words={['Every', 'step,', 'governed.']} y={170} at={21.5} out={26.05} size={72} id={700} />}

          {/* connector dashes */}
          {NODES.slice(0, 3).map((n, gi) => (
            Array.from({ length: 3 }).map((_, j) => {
              const x0 = n.x + 92, x1 = NODES[gi + 1].x - 92;
              const x = x0 + ((x1 - x0) / 3) * (j + 0.5);
              return (
                <Pop key={gi + '-' + j} x={x} y={NODE_Y} at={n.at + 0.32 + j / FPS} out={26.15 + (j % 2) / FPS}
                     id={800 + gi * 10 + j} amp={0.5} z={4}>
                  <div style={{ width: 34, height: 9, borderRadius: 5, background: '#9B968D' }} />
                </Pop>
              );
            })
          ))}

          {/* nodes */}
          {NODES.map((n, i) => (
            <Pop key={i} x={n.x} y={NODE_Y} at={n.at} out={26.1 + (i % 3) / FPS} id={760 + i} amp={0.7} shadow z={6}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 132, height: 132, borderRadius: 30, background: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 0 rgba(0,0,0,0.05)',
                }}>
                  <NodeIcon kind={i} />
                </div>
                <div style={{ fontSize: 27, fontWeight: 600, color: '#5B5851', letterSpacing: '-0.01em' }}>{n.label}</div>
              </div>
            </Pop>
          ))}

          {/* the work, hopping through the flow */}
          {packet && !packetDone && (
            <div style={{
              position: 'absolute', left: packet.x, top: packet.y, zIndex: 8,
              transform: 'translate(-50%,-50%)',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 99, background: '#EFA12E', boxShadow: '0 3px 0 rgba(0,0,0,0.1)' }} />
            </div>
          )}
          {/* lands as a check on the last node */}
          <Pop x={NODES[3].x + 58} y={NODE_Y - 58} at={24.5} out={26.2} id={880} amp={0.5} z={9}>
            <CheckBadge size={52} />
          </Pop>
          <Dust at={24.5} x={NODES[3].x + 58} y={NODE_Y - 58} n={6} spread={110} />

          {/* compliance stamps slam in */}
          {STAMPS.map((s, i) => (
            <React.Fragment key={i}>
              <Pop x={s.x} y={s.y} at={s.at} out={26.25 + (i % 2) / FPS} id={900 + i * 7} rot={s.r} amp={0.5} z={12}>
                <div style={{
                  width: 190, height: 190, borderRadius: '50%',
                  border: '6px solid #B04A3C', color: '#B04A3C',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  background: 'rgba(255,255,255,0.35)',
                }}>
                  <div style={{
                    position: 'absolute', inset: 9, border: '2.5px solid #B04A3C', borderRadius: '50%', opacity: 0.75,
                  }} />
                  <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '0.02em' }}>{s.txt}</div>
                  <div style={{ fontSize: 16, fontWeight: 650, letterSpacing: '0.24em' }}>{s.sub}</div>
                </div>
              </Pop>
              <Ring at={s.at} x={s.x} y={s.y} size={230} color="#B04A3C" width={5} />
              <Dust at={s.at} x={s.x} y={s.y} colors={['#B04A3C', '#E2683E', '#EFA12E']} n={6} spread={130} />
            </React.Fragment>
          ))}
        </Cam>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE 4 (26.5–36s) · dark · scale wall → collapse → wordmark
  // ════════════════════════════════════════════════════════════════
  const GRID_STEPS = [
    { at: 26.7, rows: 1, cols: 1, size: 175, sx: 0,   sy: 0   },
    { at: 27.6, rows: 1, cols: 5, size: 120, sx: 330, sy: 0   },
    { at: 28.6, rows: 3, cols: 5, size: 96,  sx: 330, sy: 250 },
    { at: 29.6, rows: 5, cols: 9, size: 58,  sx: 200, sy: 168 },
  ];
  const WALL_C = { x: 960, y: 645 };
  const COLLAPSE = 31.4;
  const TARGET = 26410;

  function counterVal(t) {
    const p = Math.max(0, Math.min(1, (qt(t) - 27.2) / 3.2));
    return Math.round(Math.exp(Math.log(TARGET) * Math.pow(p, 1.35)));
  }

  const MARK_HOME = { x: 960, y: 645, size: 175 };   // wall center
  const MARK_END  = { x: 902, y: 540, size: 148 };   // the "o" in rezonate
  const HOP_AT = 32.0;

  function SceneFinale({ cap }) {
    const t = useTime();
    const f = fr(t);
    const zoom = steppedZoom(t, zlerp([26.5, 29.5, 30.8, 31.4, 32.6, 36], [1.12, 1.0, 1.02, 1.06, 1.0, 1.02]));

    // which grid step
    let step = 0;
    for (let i = 0; i < GRID_STEPS.length; i++) if (t >= GRID_STEPS[i].at) step = i;
    const g = GRID_STEPS[step];

    // hero mark hop to wordmark slot (4 stepped positions)
    const hf = fr(t) - fr(HOP_AT);
    const hp = hf < 0 ? 0 : Math.min(1, hf / 4);
    const hero = {
      x: MARK_HOME.x + (MARK_END.x - MARK_HOME.x) * hp,
      y: MARK_HOME.y + (MARK_END.y - MARK_HOME.y) * hp - Math.sin(Math.PI * hp) * 70,
      size: MARK_HOME.size + (MARK_END.size - MARK_HOME.size) * hp,
    };
    const heroDance = t < 30.9 ? 0.75 : (t >= 34.3 && t < 35.5 ? 0.9 : 0.25);
    const mw = wob(f, 77, 0.8, 1.4);

    const val = counterVal(t);
    const showCounter = t >= 27.35 && qt(t) < 31.55;

    const letterStyle = {
      fontSize: 212, fontWeight: 640, letterSpacing: '-0.045em', color: PAPER, lineHeight: 1,
    };

    return (
      <div style={{ position: 'absolute', inset: 0, background: DARK }}>
        <Cam zoom={zoom}>
          {/* counter */}
          {showCounter && (
            <div style={{
              position: 'absolute', left: 960, top: 128, transform: `translate(-50%,-50%) translate(${wob(f, 55, 0, 2).x}px,${wob(f, 55, 0, 2).y}px) rotate(${wob(f, 55, 0.6, 0).r}deg)`,
              zIndex: 12, textAlign: 'center',
            }}>
              <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: '-0.04em', color: PAPER, lineHeight: 1 }}>
                {val.toLocaleString('en-US')}
              </div>
            </div>
          )}
          {showCounter && cap && (
            <Caption words={['conversations,', 'right', 'now']} y={238} at={30.6} out={31.45}
                     size={40} color="rgba(255,255,255,0.6)" weight={500} id={950} />
          )}

          {/* the wall of Kiras */}
          {Array.from({ length: g.rows }).map((_, r) =>
            Array.from({ length: g.cols }).map((_, c) => {
              const isCenter = r === (g.rows - 1) / 2 && c === (g.cols - 1) / 2;
              if (isCenter) return null;    // hero mark rendered separately
              const x = WALL_C.x + (c - (g.cols - 1) / 2) * g.sx;
              const y = WALL_C.y + (r - (g.rows - 1) / 2) * g.sy;
              const d = Math.hypot(x - WALL_C.x, y - WALL_C.y);
              const dMax = Math.hypot(((g.cols - 1) / 2) * g.sx, ((g.rows - 1) / 2) * g.sy) || 1;
              const at = g.at + (d / dMax) * 0.3;
              const out = COLLAPSE + (1 - d / dMax) * 0.3;
              const ws = wob(f, r * 31 + c * 7, 1.2, 2);
              const s = popScale(t, at, out);
              if (s == null) return null;
              return (
                <div key={r + '-' + c} style={{
                  position: 'absolute', left: x, top: y, zIndex: 6,
                  transform: `translate(-50%,-50%) translate(${ws.x}px,${ws.y}px) rotate(${ws.r}deg) scale(${s})`,
                }}>
                  <Mark t={t} size={g.size} dance={0.75} speed={4.5} phase={rnd(r * 13 + c * 29) * 6} />
                </div>
              );
            })
          )}

          {/* hero mark (persists, becomes the "o") */}
          <div style={{
            position: 'absolute', left: hero.x, top: hero.y, zIndex: 10,
            transform: `translate(-50%,-50%) translate(${mw.x}px,${mw.y}px) rotate(${mw.r}deg)`,
            filter: 'drop-shadow(0 0 34px rgba(226,104,62,0.3))',
          }}>
            <Mark t={t} size={hero.size} dance={heroDance} speed={t >= 34.3 ? 7 : 4} />
          </div>

          {/* wordmark letters pop outward from the mark */}
          <div style={{
            position: 'absolute', right: 1920 - (MARK_END.x - 104), top: MARK_END.y, zIndex: 9,
            transform: 'translateY(-53%)', whiteSpace: 'pre', ...letterStyle,
          }}>
            {['r', 'e', 'z'].map((ch, i) => (
              <PopSpan key={i} at={32.6 + ((2 - i) * 1) / FPS} id={980 + i * 3}>{ch}</PopSpan>
            ))}
          </div>
          <div style={{
            position: 'absolute', left: MARK_END.x + 104, top: MARK_END.y, zIndex: 9,
            transform: 'translateY(-53%)', whiteSpace: 'pre', ...letterStyle,
          }}>
            {['n', 'a', 't', 'e'].map((ch, i) => (
              <PopSpan key={i} at={32.95 + (i * 1) / FPS} id={992 + i * 3}>{ch}</PopSpan>
            ))}
          </div>

          {cap && (
            <Caption words={['Every', 'conversation,', 'handled.']} y={745} at={33.8} size={48}
                     color="rgba(255,255,255,0.62)" weight={500} id={1000} />
          )}
        </Cam>
      </div>
    );
  }

  // ── grain + vignette ──────────────────────────────────────────────
  function Grain() {
    const t = useTime();
    const f = fr(t);
    const dx = Math.floor(rnd(f * 13.3) * 8), dy = Math.floor(rnd(f * 17.7) * 8);
    return (
      <React.Fragment>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, opacity: 0.055,
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.9) 1px, transparent 1.2px)',
          backgroundSize: '5px 5px', backgroundPosition: `${dx}px ${dy}px`, mixBlendMode: 'multiply',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 41,
          background: 'radial-gradient(120% 92% at 50% 42%, transparent 62%, rgba(8,5,2,0.18) 100%)',
        }} />
      </React.Fragment>
    );
  }

  // ── root ──────────────────────────────────────────────────────────
  function sceneName(t) {
    if (t < 15) return 'birth → chaos → order';
    if (t < 21) return 'live voice';
    if (t < 26.5) return 'governed workflow';
    return 'scale → wordmark';
  }

  function Film({ cap, grain }) {
    const t = useTime();
    return (
      <div
        data-screen-label={`t=${Math.floor(t)}s · ${sceneName(t)}`}
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', system-ui, sans-serif",
        }}>
        <Sprite start={0} end={15}><SceneOne cap={cap} /></Sprite>
        <Sprite start={15} end={21}><SceneVoice cap={cap} /></Sprite>
        <Sprite start={21} end={26.5}><SceneFlow cap={cap} /></Sprite>
        <Sprite start={26.5} end={36.05}><SceneFinale cap={cap} /></Sprite>
        {grain && <Grain />}
      </div>
    );
  }

  function KiraStopMotion({ captions = true, grain = true }) {
    const cap = captions !== false && captions !== 'false';
    const grn = grain !== false && grain !== 'false';
    return (
      <Stage width={1920} height={1080} duration={36} background={DARK} persistKey="kirastopmotion">
        <Film cap={cap} grain={grn} />
      </Stage>
    );
  }

  window.KiraStopMotion = KiraStopMotion;
})();
