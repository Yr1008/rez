/* kira-pulse.jsx — "3:07 AM" · the pulse cut.
   Kinetic hype film. Machine-gun type, black/white inversions,
   punch-zooms, screen shake, slot digits, one full-frame gradient drop
   into a raging waveform. No images. 17.6s · Kira (Rezonate). */

(() => {
  const { Stage, Sprite, useTime, Easing: E } = window;

  const lerp = (a, b, p) => a + (b - a) * p;
  const seg = (t, t0, t1, ease = E.easeOutCubic) =>
    t <= t0 ? 0 : t >= t1 ? 1 : ease((t - t0) / (t1 - t0));
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Segoe UI", sans-serif';
  const SERIF = '"Source Serif 4", "Iowan Old Style", "Times New Roman", serif';
  const BRAND_FONT = "'Bricolage Grotesque', 'Bricolage Fallback', system-ui, sans-serif";

  const BLACK = '#0A0908';
  const PAPERW = '#F5F2EC';
  const INKB = '#141210';
  const WHITE = '#F5F2EC';
  const DIM = 'rgba(245,242,236,0.5)';
  const DIMB = 'rgba(20,18,16,0.5)';
  const FAINT = 'rgba(245,242,236,0.3)';
  const GREEN = '#2FA76A';

  const BARS = [
    { g: ['#C9B2F2', '#A98BE0'], b: 0.52 },
    { g: ['#C08AC8', '#CE5F63'], b: 0.80 },
    { g: ['#E06A54', '#D94F49'], b: 1.00 },
    { g: ['#EA8442', '#E2683E'], b: 0.86 },
    { g: ['#F2AC3C', '#E8912F'], b: 0.55 },
  ];
  const GRAD = `linear-gradient(115deg, ${BARS[0].g[0]} 0%, ${BARS[1].g[0]} 26%, ${BARS[2].g[1]} 50%, ${BARS[3].g[1]} 74%, ${BARS[4].g[1]} 100%)`;

  function MarkS({ t, size = 200, amp = 0, speed = 6, breathe = 0.05, phase = 0 }) {
    const w = size * 0.185, gap = size * 0.082;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap }}>
        {BARS.map((bar, k) => {
          const breath = 1 + Math.sin(t * 1.6 + k * 0.9 + phase) * breathe;
          const dance = 1 + amp * (Math.abs(Math.sin(t * speed + k * 1.9 + phase + rnd(k * 9) * 2.2)) - 0.55) * 0.95;
          return (
            <div key={k} style={{
              width: w, height: Math.max(size * 0.09, size * bar.b * breath * Math.max(0.16, dance)), borderRadius: 999,
              background: `linear-gradient(180deg, ${bar.g[0]}, ${bar.g[1]})`,
            }} />
          );
        })}
      </div>
    );
  }

  // hard shot: mounts/unmounts on the cut, optional bg fill
  function Shot({ start, end, bg, children }) {
    const t = useTime();
    if (t < start || t >= end) return null;
    return (
      <div style={{ position: 'absolute', inset: 0, background: bg || 'transparent' }}>
        {children}
      </div>
    );
  }

  // PUNCH type: slams from 1.32→1 in ~3 frames. The dopamine unit.
  function P({ at, x = 960, y = 540, size = 150, children, color = WHITE, ff = SERIF, weight = 600, ls = '-0.025em', align = 'center', z = 10, from = 1.32, dur = 0.14 }) {
    const t = useTime();
    if (t < at) return null;
    const p = seg(t, at, at + dur, E.easeOutQuart);
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: z,
        transform: `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'},-50%) scale(${lerp(from, 1, p)})`,
        transformOrigin: align === 'left' ? '0% 50%' : align === 'right' ? '100% 50%' : '50% 50%',
        fontFamily: ff, fontSize: size, fontWeight: weight, color,
        letterSpacing: ls, lineHeight: 1.06, whiteSpace: 'pre', opacity: Math.min(1, p * 2),
      }}>{children}</div>
    );
  }

  // soft type (tension moments)
  function T({ at, x = 960, y = 540, size = 84, children, color = WHITE, ff = SERIF, weight = 560, ls = '-0.015em', z = 10, o = 1 }) {
    const t = useTime();
    const p = seg(t, at, at + 0.34, E.easeOutQuad);
    if (p <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: z,
        transform: `translate(-50%,-50%) scale(${lerp(1.015, 1, p)})`,
        fontFamily: ff, fontSize: size, fontWeight: weight, color,
        letterSpacing: ls, lineHeight: 1.18, whiteSpace: 'pre', textAlign: 'center',
        opacity: p * o,
      }}>{children}</div>
    );
  }

  function Cap({ at, x = 960, y, children, color = 'rgba(245,242,236,0.6)', z = 12 }) {
    const t = useTime();
    const p = seg(t, at, at + 0.3, E.easeOutQuad);
    if (p <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: z, transform: 'translate(-50%,-50%)',
        fontFamily: SANS, fontSize: 19, fontWeight: 600, color,
        letterSpacing: '0.3em', whiteSpace: 'pre', opacity: p,
      }}>{children}</div>
    );
  }

  // slot-machine digits → lock with a punch
  function Slot({ at, x = 960, y = 470, size = 430, chars = ['8', '2', '%'], color = WHITE, lockGap = 0.14, spin = 0.38 }) {
    const t = useTime();
    if (t < at) return null;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: 10, transform: 'translate(-50%,-50%)',
        display: 'flex', alignItems: 'baseline',
        fontFamily: SERIF, fontWeight: 620, color, lineHeight: 1,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
      }}>
        {chars.map((ch, i) => {
          const lockAt = at + spin + i * lockGap;
          const locked = t >= lockAt;
          const isDigit = /\d/.test(ch);
          const shown = locked || !isDigit ? ch : String(Math.floor(rnd(Math.floor(t * 30) * 7 + i * 13) * 10));
          const pp = seg(t, lockAt, lockAt + 0.12, E.easeOutQuart);
          const preOp = locked ? 1 : 0.35;
          if (!locked && !isDigit) return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
          return (
            <span key={i} style={{
              display: 'inline-block',
              fontSize: ch === '%' ? size * 0.55 : size,
              transform: `scale(${locked ? lerp(1.3, 1, pp) : 1})`,
              opacity: preOp,
              color: ch === '%' ? DIM : color,
            }}>{shown}</span>
          );
        })}
      </div>
    );
  }

  // ── 3:08 booked beat ──────────────────────────────────────────────
  function ShotBooked() {
    const t = useTime();
    const ring = seg(t, 6.94, 7.4, E.easeOutCubic);
    const p = seg(t, 6.92, 7.05, E.easeOutQuart);
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        {ring > 0 && ring < 1 && (
          <div style={{
            position: 'absolute', left: 960, top: 540, zIndex: 6,
            width: 200 + ring * 900, height: 200 + ring * 900,
            transform: 'translate(-50%,-50%)', borderRadius: '50%',
            border: `3px solid rgba(47,167,106,${0.7 * (1 - ring)})`,
          }} />
        )}
        <div style={{
          position: 'absolute', left: 960, top: 540, zIndex: 10, transform: 'translate(-50%,-50%)',
          display: 'flex', alignItems: 'center', gap: 38,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', background: GREEN, flex: '0 0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${Math.max(0.001, lerp(1.4, 1, p))})`,
            boxShadow: '0 0 90px rgba(47,167,106,0.4)',
          }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
              <path d="M4.5 12.5l5 5L19.5 7" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{
            display: 'inline-block',
            fontFamily: SERIF, fontSize: 170, fontWeight: 600, letterSpacing: '-0.025em',
            color: WHITE, lineHeight: 1.06, whiteSpace: 'pre',
            transform: `scale(${lerp(1.32, 1, seg(t, 6.94, 7.08, E.easeOutQuart))})`,
            transformOrigin: '0% 50%',
            opacity: t < 6.94 ? 0 : 1,
          }}>Booked.</span>
        </div>
      </div>
    );
  }

  // ── the raging waveform ──────────────────────────────────────────
  const NBW = 76;
  function ShotWave() {
    const t = useTime();
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute', left: 960, top: 512, transform: 'translate(-50%,-50%)',
          display: 'flex', alignItems: 'center', gap: 9.5,
        }}>
          {Array.from({ length: NBW }).map((_, i) => {
            const c = Math.abs(i - (NBW - 1) / 2) / ((NBW - 1) / 2);
            const bornP = seg(t, 12.52 + c * 0.14, 12.66 + c * 0.14, E.easeOutQuart);
            const env = 40 + 300 * Math.pow(Math.sin(Math.PI * i / (NBW - 1)), 0.72);
            const talk = Math.abs(Math.sin(t * 10.5 + i * 0.47 + rnd(i) * 2.4)) * (0.6 + 0.4 * Math.sin(t * 3.4 + i * 0.15));
            const gi = Math.min(4, Math.floor(i / NBW * 5));
            return (
              <div key={i} style={{
                width: 13, height: Math.max(10, env * (0.16 + 0.84 * talk)), borderRadius: 999,
                background: `linear-gradient(180deg, ${BARS[gi].g[0]}, ${BARS[gi].g[1]})`,
                transform: `scaleY(${Math.max(0.0001, bornP)})`,
                boxShadow: `0 0 40px ${['rgba(169,139,224,0.35)', 'rgba(206,95,99,0.35)', 'rgba(217,79,73,0.38)', 'rgba(226,104,62,0.38)', 'rgba(239,161,46,0.35)'][gi]}`,
              }} />
            );
          })}
        </div>
        <Cap at={13.0} y={886}>REAL-TIME VOICE · TEN CHANNELS · SIXTY LANGUAGES</Cap>
      </div>
    );
  }

  // ── verticals poster wall ─────────────────────────────────────────
  const WALL = [
    { txt: 'Hospitals.', at: 9.55,  x: 150,  y: 232, size: 190, align: 'left'  },
    { txt: 'Banks.',     at: 9.87,  x: 1770, y: 442, size: 190, align: 'right' },
    { txt: 'Stadiums.',  at: 10.19, x: 150,  y: 652, size: 190, align: 'left'  },
    { txt: 'Insurers.',  at: 10.51, x: 1770, y: 862, size: 190, align: 'right' },
  ];
  function ShotWall() {
    const t = useTime();
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        {WALL.map((w, i) => {
          if (t < w.at) return null;
          const isLast = t < (WALL[i + 1] ? WALL[i + 1].at : 99);
          const p = seg(t, w.at, w.at + 0.13, E.easeOutQuart);
          return (
            <div key={i} style={{
              position: 'absolute', left: w.x, top: w.y, zIndex: 10,
              transform: `translate(${w.align === 'right' ? '-100%' : '0'},-50%) scale(${lerp(1.28, 1, p)})`,
              transformOrigin: w.align === 'right' ? '100% 50%' : '0% 50%',
              fontFamily: SERIF, fontSize: w.size, fontWeight: 600, letterSpacing: '-0.025em',
              color: WHITE, opacity: (isLast ? 1 : 0.26) * Math.min(1, p * 2), lineHeight: 1,
              whiteSpace: 'pre',
            }}>{w.txt}</div>
          );
        })}
      </div>
    );
  }

  // ════════════════════════════ FILM ════════════════════════════
  function sceneName(t) {
    if (t < 1.1) return '3:07 AM';
    if (t < 3.0) return 'the message';
    if (t < 4.85) return 'no queue / no hold';
    if (t < 6.0) return 'kira answers';
    if (t < 7.5) return 'booked';
    if (t < 8.4) return '3:08 · done';
    if (t < 9.55) return '82% slam';
    if (t < 11.05) return 'poster wall';
    if (t < 12.42) return 'one kira';
    if (t < 14.4) return 'gradient drop · waveform';
    if (t < 15.6) return 'live in 4 weeks';
    return 'close';
  }

  function Film() {
    const t = useTime();

    // screen shake on the big hits
    let dx = 0, dy = 0;
    for (const h of [4.9, 12.46, 15.68]) {
      const d = t - h;
      if (d > 0 && d < 0.3) {
        const a = (0.3 - d) / 0.3 * 5;
        dx += Math.sin(t * 93) * a;
        dy += Math.cos(t * 81) * a * 0.6;
      }
    }

    return (
      <div
        data-screen-label={`t=${Math.floor(t)}s · ${sceneName(t)}`}
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: BLACK, fontFamily: SANS,
        }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${dx}px,${dy}px)` }}>

          {/* 1 · tension */}
          <Shot start={0} end={1.1}>
            <T at={0.15} y={540} size={84}>3:07 AM.</T>
          </Shot>

          {/* 2 · the message — giant editorial quote */}
          <Shot start={1.1} end={3.0}>
            <T at={1.2} y={470} size={104} ff={SERIF}>
              <span style={{ fontStyle: 'italic' }}>“Move my mother's MRI.</span>
            </T>
            <T at={1.5} y={600} size={104} ff={SERIF}>
              <span style={{ fontStyle: 'italic' }}>Please.”</span>
            </T>
            <Cap at={2.05} y={730} color={FAINT}>MARIA · WHATSAPP · 3:07 AM</Cap>
          </Shot>

          {/* 3–5 · machine gun, inverting */}
          <Shot start={3.0} end={3.55} bg={PAPERW}>
            <P at={3.02} size={210} color={INKB}>No queue.</P>
          </Shot>
          <Shot start={3.55} end={4.1}>
            <P at={3.57} size={210}>No hold.</P>
          </Shot>
          <Shot start={4.1} end={4.85} bg={PAPERW}>
            <P at={4.12} size={130} color={INKB}>No “try again tomorrow.”</P>
          </Shot>

          {/* 6 · KIRA ANSWERS — hit + shake */}
          <Shot start={4.85} end={6.0}>
            <div style={{ position: 'absolute', left: 960, top: 386, transform: 'translate(-50%,-50%)', zIndex: 10 }}>
              <MarkS t={t} size={150} amp={0.65} speed={7.5} />
            </div>
            <P at={4.9} y={618} size={172}>Kira answers.</P>
          </Shot>

          {/* 7 · booked */}
          <Shot start={6.0} end={6.92}>
            <P at={6.04} x={200} y={378} size={120} align="left" color={DIM}>Slot found.</P>
            <P at={6.42} x={1720} y={588} size={120} align="right" color={DIM}>Coverage checked.</P>
          </Shot>
          <Shot start={6.92} end={7.5}><ShotBooked /></Shot>

          {/* 8 · the rhyme */}
          <Shot start={7.5} end={8.4}>
            <T at={7.56} y={498} size={84}>3:08 AM.</T>
            <T at={7.88} y={618} size={64} color={DIM}>One minute, start to finish.</T>
          </Shot>

          {/* 9 · 82% slot slam */}
          <Shot start={8.4} end={9.55}>
            <Slot at={8.44} />
            <T at={8.98} y={764} size={52} color={DIM}>resolved end-to-end. No human.</T>
          </Shot>

          {/* 10 · poster wall */}
          <Shot start={9.55} end={11.05}><ShotWall /></Shot>

          {/* 11 · one kira — inversion */}
          <Shot start={11.05} end={12.42} bg={PAPERW}>
            <div style={{ position: 'absolute', left: 960, top: 420, transform: 'translate(-50%,-50%)', zIndex: 10 }}>
              <MarkS t={t} size={110} amp={0.3} speed={5} />
            </div>
            <P at={11.1} y={620} size={190} color={INKB}>One Kira.</P>
          </Shot>

          {/* 12 · GRADIENT DROP — two frames of pure color */}
          <Shot start={12.42} end={12.52} bg={GRAD} />

          {/* 13 · the waveform rages */}
          <Shot start={12.52} end={14.4}><ShotWave /></Shot>

          {/* 14 · live in four weeks */}
          <Shot start={14.4} end={15.6}>
            <P at={14.44} y={490} size={150}>Live in 4 weeks.</P>
            <T at={14.85} y={646} size={44} color={DIM}>Configured, not coded.</T>
          </Shot>

          {/* 15 · close */}
          <Shot start={15.6} end={17.65}>
            <CloseLockup t={t} />
          </Shot>

        </div>

        {/* grain + vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', opacity: 0.06,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 0.6px, transparent 1px), radial-gradient(rgba(255,255,255,0.3) 0.5px, transparent 0.9px)',
          backgroundSize: '4px 4px, 7px 7px', backgroundPosition: '0 0, 2px 3px',
          mixBlendMode: 'screen',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 51, pointerEvents: 'none',
          background: 'radial-gradient(120% 95% at 50% 46%, transparent 60%, rgba(0,0,0,0.5) 100%)',
        }} />
      </div>
    );
  }

  function CloseLockup({ t }) {
    const markP = seg(t, 15.68, 15.86, E.easeOutQuart);
    const L = (ch, at, i) => {
      const p = seg(t, at, at + 0.36, E.easeOutQuart);
      return (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 112}%)` }}>{ch}</span>
        </span>
      );
    };
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <div style={{
          position: 'absolute', left: 960, top: 500, transform: 'translate(-50%,-50%)', zIndex: 12,
          display: 'flex', alignItems: 'center', gap: 17,
          fontFamily: BRAND_FONT, fontSize: 132, fontWeight: 640, letterSpacing: '-0.045em',
          color: WHITE, lineHeight: 1,
        }}>
          <span style={{ whiteSpace: 'pre' }}>{['r', 'e', 'z'].map((ch, i) => L(ch, 15.74 + (2 - i) * 0.045, i))}</span>
          <div style={{ transform: `scale(${Math.max(0.001, lerp(1.35, 1, markP))})`, opacity: Math.min(1, markP * 2) }}>
            <MarkS t={t} size={95} amp={0.16} speed={4.5} breathe={0.06} />
          </div>
          <span style={{ whiteSpace: 'pre' }}>{['n', 'a', 't', 'e'].map((ch, i) => L(ch, 15.88 + i * 0.045, i + 3))}</span>
        </div>
        <T at={16.3} y={660} size={40} color={DIM}>Every conversation, handled.</T>
        <Cap at={16.7} y={900}>REZONATE.COM</Cap>
      </div>
    );
  }

  function KiraPulseFilm() {
    return (
      <Stage width={1920} height={1080} duration={17.6} background={BLACK} persistKey="kirapulse">
        <Film />
      </Stage>
    );
  }

  window.KiraPulseFilm = KiraPulseFilm;
})();
