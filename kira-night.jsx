/* kira-night.jsx — "3:07 AM" · the night cut.
   One idea per shot. Hard cuts on a beat. Black void, white serif,
   photography full-bleed, one color moment. 20s · Kira (Rezonate).

   SHOT LIST
   1  0.00  "3:07 AM."                 (type, small — confidence)
   2  1.30  night photo, full bleed    (caption: MARIA · CEDAR FALLS)
   3  3.05  her message, huge bubble
   4  4.70  "Every line is closed."
   5  5.90  "Kira answers." + mark
   6  7.30  the reply + "Yes, please."
   7  9.30  ✓ Booked.
   8  10.40 "3:08 AM."                 (the rhyme)
   9  11.50 relief photo, full bleed   (HANDLED WHILE THE WORLD SLEPT)
   10 13.30 82% resolved end-to-end
   11 14.60 Hospitals. / Banks. / Stadiums.   (metronome)
   14 16.70 the waveform — the color moment
   15 18.20 rez●nate · quiet close */

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
  const WHITE = '#F5F2EC';
  const DIM = 'rgba(245,242,236,0.5)';
  const FAINT = 'rgba(245,242,236,0.3)';

  const BARS = [
    { g: ['#C9B2F2', '#A98BE0'], b: 0.52 },
    { g: ['#C08AC8', '#CE5F63'], b: 0.80 },
    { g: ['#E06A54', '#D94F49'], b: 1.00 },
    { g: ['#EA8442', '#E2683E'], b: 0.86 },
    { g: ['#F2AC3C', '#E8912F'], b: 0.55 },
  ];

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

  // ── type: opacity + 1.5% settle. Nothing else. ────────────────────
  function T({ at, x = 960, y, size, children, ff = SERIF, color = WHITE, weight = 560, ls = '-0.02em', align = 'center', z = 10, o = 1 }) {
    const t = useTime();
    const p = seg(t, at, at + 0.34, E.easeOutQuad);
    if (p <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: z,
        transform: `translate(${align === 'center' ? '-50%' : '0'},-50%) scale(${lerp(1.015, 1, p)})`,
        fontFamily: ff, fontSize: size, fontWeight: weight, color,
        letterSpacing: ls, lineHeight: 1.14, whiteSpace: 'pre',
        textAlign: align, opacity: p * o,
      }}>{children}</div>
    );
  }

  // tiny caps caption — film subtitle language
  function Cap({ at, x = 960, y, children, align = 'center', z = 12 }) {
    const t = useTime();
    const p = seg(t, at, at + 0.4, E.easeOutQuad);
    if (p <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: z,
        transform: `translate(${align === 'center' ? '-50%' : '0'},-50%)`,
        fontFamily: SANS, fontSize: 19, fontWeight: 600, color: 'rgba(245,242,236,0.66)',
        letterSpacing: '0.3em', whiteSpace: 'pre', opacity: p,
      }}>{children}</div>
    );
  }

  function Shot({ start, end, fade = 0, children }) {
    const t = useTime();
    if (t < start || t >= end) return null;
    const o = fade > 0 ? seg(t, start, start + fade, E.easeOutQuad) : 1;
    return <div style={{ position: 'absolute', inset: 0, opacity: o }}>{children}</div>;
  }

  function KenPhoto({ start, src, from = 1.07, panX = 0, panY = 0 }) {
    const t = useTime();
    const life = Math.min(1, Math.max(0, (t - start) / 2.2));
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: BLACK }}>
        <img src={src} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${lerp(from, 1.0, life)}) translate(${panX * life}px,${panY * life}px)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,9,8,0.12) 0%, rgba(10,9,8,0) 40%, rgba(10,9,8,0.42) 100%)',
        }} />
      </div>
    );
  }

  // ════════════════════════════ SHOTS ════════════════════════════

  // 1 · 3:07 AM
  function ShotTime({ at, label }) {
    return (
      <T at={at} y={540} size={84} weight={560} ls="-0.01em">{label}</T>
    );
  }

  // 3 · her message — huge, floating
  function ShotMessage() {
    const t = useTime();
    const p = seg(t, 3.1, 3.55, E.easeOutQuart);
    if (p <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: 960, top: 540, zIndex: 10,
        transform: `translate(-50%,-50%) translateY(${(1 - p) * 24}px)`,
        opacity: p,
      }}>
        <div style={{
          background: '#E9E5DE', color: '#171614',
          fontFamily: SANS, fontSize: 54, fontWeight: 520, letterSpacing: '-0.02em', lineHeight: 1.32,
          padding: '44px 62px', borderRadius: '48px 48px 48px 14px',
          maxWidth: 1240, whiteSpace: 'pre',
          boxShadow: '0 90px 180px -60px rgba(0,0,0,0.9)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          I need to move my mother's MRI.{'\n'}Please — anything this week?
        </div>
        <div style={{
          marginTop: 26, fontFamily: SANS, fontSize: 21, fontWeight: 600,
          color: FAINT, letterSpacing: '0.26em', paddingLeft: 8,
        }}>EMMA · WHATSAPP · 3:07 AM</div>
      </div>
    );
  }

  // 6 · the reply
  function ShotReply() {
    const t = useTime();
    const p = seg(t, 7.4, 7.85, E.easeOutQuart);
    const yes = seg(t, 8.55, 8.95, E.easeOutQuart);
    if (p <= 0) return null;
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <div style={{
          position: 'absolute', left: 960, top: 468,
          transform: `translate(-50%,-50%) translateY(${(1 - p) * 24}px)`,
          opacity: p,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, paddingLeft: 6 }}>
            <MarkS t={t} size={34} amp={t < 8.4 ? 0.55 : 0.1} speed={7.5} />
            <span style={{ fontFamily: SANS, fontSize: 21, fontWeight: 600, color: FAINT, letterSpacing: '0.26em' }}>KIRA</span>
          </div>
          <div style={{
            background: '#221F1B', color: WHITE,
            fontFamily: SANS, fontSize: 54, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.32,
            padding: '44px 62px', borderRadius: '48px 48px 14px 48px',
            whiteSpace: 'pre',
            boxShadow: '0 90px 180px -60px rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            Dr. Tan has Thursday at 9:40 AM —{'\n'}shall I book it?
          </div>
        </div>
        {yes > 0 && (
          <div style={{
            position: 'absolute', left: 1490, top: 812,
            transform: `translate(-100%,-50%) scale(${lerp(0.92, 1, yes)})`,
            transformOrigin: '100% 50%', opacity: yes,
            background: '#E9E5DE', color: '#171614',
            fontFamily: SANS, fontSize: 40, fontWeight: 520, letterSpacing: '-0.02em',
            padding: '26px 44px', borderRadius: '40px 40px 40px 12px',
            boxShadow: '0 60px 120px -50px rgba(0,0,0,0.9)',
          }}>Yes, please.</div>
        )}
      </div>
    );
  }

  // 7 · booked
  function ShotBooked() {
    const t = useTime();
    const p = seg(t, 9.4, 9.75, E.easeOutBack);
    if (p <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: 960, top: 540, zIndex: 10,
        transform: 'translate(-50%,-50%)',
        display: 'flex', alignItems: 'center', gap: 34,
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%', background: '#2FA76A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${Math.max(0.001, p)})`,
          boxShadow: '0 0 80px rgba(47,167,106,0.35)',
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M4.5 12.5l5 5L19.5 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <T at={9.55} x={1030} y={540} size={110} align="left" weight={560}>Booked.</T>
      </div>
    );
  }

  // 10 · 82%
  function Shot82() {
    const t = useTime();
    const p = seg(t, 13.4, 14.1, E.easeOutExpo);
    const cnt = Math.round(82 * p);
    if (p <= 0) return null;
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <div style={{
          position: 'absolute', left: 960, top: 488, transform: 'translate(-50%,-50%)',
          fontFamily: SERIF, fontSize: 300, fontWeight: 600, letterSpacing: '-0.03em',
          color: WHITE, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        }}>
          {cnt}<span style={{ fontSize: 170, color: DIM }}>%</span>
        </div>
        <T at={13.75} y={724} size={47} color={DIM} weight={480}>resolved end-to-end. No human needed.</T>
      </div>
    );
  }

  // 14 · the color moment
  const NB = 64;
  function ShotWave() {
    const t = useTime();
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <div style={{
          position: 'absolute', left: 960, top: 505, transform: 'translate(-50%,-50%)',
          display: 'flex', alignItems: 'center', gap: 13,
        }}>
          {Array.from({ length: NB }).map((_, i) => {
            const c = Math.abs(i - (NB - 1) / 2) / ((NB - 1) / 2);
            const bornP = seg(t, 16.78 + c * 0.3, 17.02 + c * 0.3, E.easeOutCubic);
            const env = 34 + 240 * Math.pow(Math.sin(Math.PI * i / (NB - 1)), 0.8);
            const talk = Math.abs(Math.sin(t * 7.5 + i * 0.44 + rnd(i) * 2.2)) * (0.66 + 0.34 * Math.sin(t * 2.6 + i * 0.12));
            const gi = Math.min(4, Math.floor(i / NB * 5));
            return (
              <div key={i} style={{
                width: 12, height: Math.max(10, env * (0.2 + 0.8 * talk)), borderRadius: 999,
                background: `linear-gradient(180deg, ${BARS[gi].g[0]}, ${BARS[gi].g[1]})`,
                transform: `scaleY(${Math.max(0.0001, bornP)})`,
                boxShadow: `0 0 34px ${['rgba(169,139,224,0.3)', 'rgba(206,95,99,0.3)', 'rgba(217,79,73,0.32)', 'rgba(226,104,62,0.32)', 'rgba(239,161,46,0.3)'][gi]}`,
              }} />
            );
          })}
        </div>
        <Cap at={17.3} y={862}>REAL-TIME VOICE · TEN CHANNELS · SIXTY LANGUAGES</Cap>
      </div>
    );
  }

  // 15 · quiet close
  function ShotClose() {
    const t = useTime();
    const markP = seg(t, 18.5, 18.95, E.easeOutBack);
    const L = (ch, at, i) => {
      const p = seg(t, at, at + 0.4, E.easeOutQuart);
      return (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 112}%)` }}>{ch}</span>
        </span>
      );
    };
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <div style={{
          position: 'absolute', left: 960, top: 505, transform: 'translate(-50%,-50%)', zIndex: 12,
          display: 'flex', alignItems: 'center', gap: 17,
          fontFamily: BRAND_FONT, fontSize: 128, fontWeight: 640, letterSpacing: '-0.045em',
          color: WHITE, lineHeight: 1,
        }}>
          <span style={{ whiteSpace: 'pre' }}>{['r', 'e', 'z'].map((ch, i) => L(ch, 18.42 + (2 - i) * 0.05, i))}</span>
          <div style={{ transform: `scale(${Math.max(0.001, markP)})` }}>
            <MarkS t={t} size={92} amp={0.14} speed={4.5} breathe={0.06} />
          </div>
          <span style={{ whiteSpace: 'pre' }}>{['n', 'a', 't', 'e'].map((ch, i) => L(ch, 18.58 + i * 0.05, i + 3))}</span>
        </div>
        <T at={19.0} y={664} size={40} color={DIM} weight={480}>Every conversation, handled.</T>
        <Cap at={19.4} y={905}>REZONATE.COM</Cap>
      </div>
    );
  }

  // ════════════════════════════ FILM ════════════════════════════
  function sceneName(t) {
    if (t < 1.3) return '3:07 AM';
    if (t < 3.05) return 'the night';
    if (t < 4.7) return 'her message';
    if (t < 5.9) return 'every line closed';
    if (t < 7.3) return 'kira answers';
    if (t < 9.3) return 'the reply';
    if (t < 10.4) return 'booked';
    if (t < 11.5) return '3:08 AM';
    if (t < 13.3) return 'relief';
    if (t < 14.6) return '82%';
    if (t < 16.7) return 'verticals';
    if (t < 18.2) return 'the waveform';
    return 'close';
  }

  function Film() {
    const t = useTime();
    return (
      <div
        data-screen-label={`t=${Math.floor(t)}s · ${sceneName(t)}`}
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: BLACK, fontFamily: SANS,
        }}>

        {/* 1 · 3:07 AM */}
        <Shot start={0} end={1.3}><ShotTime at={0.15} label="3:07 AM." /></Shot>

        {/* 2 · the night — location title */}
        <Shot start={1.3} end={3.05} fade={0.22}>
          <Cap at={1.5} y={505}>MARIA · CEDAR FALLS</Cap>
          <T at={1.85} y={576} size={44} color={DIM} weight={480}>She can't sleep.</T>
        </Shot>

        {/* 3 · her message */}
        <Shot start={3.05} end={4.7}><ShotMessage /></Shot>

        {/* 4 · every line is closed */}
        <Shot start={4.7} end={5.9}>
          <T at={4.78} y={540} size={124}>Every line is closed.</T>
        </Shot>

        {/* 5 · kira answers */}
        <Shot start={5.9} end={7.3}>
          <div style={{ position: 'absolute', left: 960, top: 400, transform: 'translate(-50%,-50%)' }}>
            <MarkS t={t} size={130} amp={0.6} speed={7} />
          </div>
          <T at={6.0} y={604} size={124}>Kira answers.</T>
        </Shot>

        {/* 6 · the reply */}
        <Shot start={7.3} end={9.3}><ShotReply /></Shot>

        {/* 7 · booked */}
        <Shot start={9.3} end={10.4}><ShotBooked /></Shot>

        {/* 8 · 3:08 AM — the rhyme */}
        <Shot start={10.4} end={11.5}><ShotTime at={10.5} label="3:08 AM." /></Shot>

        {/* 9 · relief — pure type */}
        <Shot start={11.5} end={13.3} fade={0.22}>
          <T at={11.6} y={505} size={104}>Handled,</T>
          <T at={11.95} y={632} size={104} color={DIM}>while the world slept.</T>
        </Shot>

        {/* 10 · 82% */}
        <Shot start={13.3} end={14.6}><Shot82 /></Shot>

        {/* 11–13 · the verticals, metronome */}
        <Shot start={14.6} end={15.3}><T at={14.64} y={540} size={150}>Hospitals.</T></Shot>
        <Shot start={15.3} end={16.0}><T at={15.34} y={540} size={150}>Banks.</T></Shot>
        <Shot start={16.0} end={16.7}><T at={16.04} y={540} size={150}>Stadiums.</T></Shot>

        {/* 14 · the color moment */}
        <Shot start={16.7} end={18.2}><ShotWave /></Shot>

        {/* 15 · quiet close */}
        <Shot start={18.2} end={20.05}><ShotClose /></Shot>

        {/* filmic: grain + vignette */}
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

  function KiraNightFilm() {
    return (
      <Stage width={1920} height={1080} duration={20} background={BLACK} persistKey="kiranight">
        <Film />
      </Stage>
    );
  }

  window.KiraNightFilm = KiraNightFilm;
})();
