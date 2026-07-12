/* kira-intro.jsx — "2:47 AM" — the ad cut.
   Cinematic photo hook (first-second stop-the-scroll), live resolution,
   industry breadth, voice, connectors, 82% proof over crowd, CTA close.
   Editorial serif + SF sans, warm paper, film grain + vignette.
   18.2s · 1920×1080 · Kira (Rezonate). */

(() => {
  const { Stage, Sprite, useTime, Easing: E } = window;

  // ── helpers ───────────────────────────────────────────────────────
  const lerp = (a, b, p) => a + (b - a) * p;
  const quint = (p) => 1 - Math.pow(1 - p, 5);
  const seg = (t, t0, t1, ease = quint) =>
    t <= t0 ? 0 : t >= t1 ? 1 : ease((t - t0) / (t1 - t0));
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Segoe UI", sans-serif';
  const SERIF = '"Source Serif 4", "Iowan Old Style", "Times New Roman", serif';
  const BRAND_FONT = "'Bricolage Grotesque', 'Bricolage Fallback', system-ui, sans-serif";

  const INK = '#1F1D1A';
  const GRAY = '#8A8680';
  const FAINT = '#B7B2AA';
  const HAIR = '#E9E4DC';
  const IMSG = '#EBE8E2';
  const GREEN = '#2FA76A';

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

  function Reveal({ at, out, x = 960, y, size = 96, color = INK, weight = 600, ls = -0.028, dur = 0.9, z = 20, stagger = 0.085, ff = SANS, style, children }) {
    const t = useTime();
    const words = React.Children.toArray(children);
    const oP = out != null ? seg(t, out, out + 0.42, E.easeInQuart) : 0;
    const pAll = seg(t, at, at + dur);
    if (pAll <= 0 || oP >= 1) return null;
    const track = lerp(ls + 0.02, ls, pAll);
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: z, transform: 'translate(-50%,-50%)',
        display: 'flex', gap: '0.28em', justifyContent: 'center', whiteSpace: 'pre',
        fontSize: size, fontWeight: weight, color, lineHeight: 1.12, fontFamily: ff,
        letterSpacing: track + 'em',
        opacity: 1 - oP, filter: oP > 0 ? `blur(${oP * 10}px)` : 'none',
        ...style,
      }}>
        {words.map((wd, i) => {
          const p = seg(t, at + i * stagger, at + i * stagger + dur * 0.72);
          return (
            <span key={i} style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px)`,
              filter: p < 1 ? `blur(${(1 - p) * 9}px)` : 'none',
            }}>{wd}</span>
          );
        })}
      </div>
    );
  }

  const springIn = (t, at, dur = 0.55) => seg(t, at, at + dur, E.easeOutBack);

  // Ken Burns photo layer
  function Photo({ src, at = 0, out, from = 1.1, to = 1.02, panX = 0, panY = 0, dim = 0, scrim, z = 2, opacity = 1 }) {
    const t = useTime();
    const inP = seg(t, at, at + 0.6, E.easeOutQuad);
    const oP = out != null ? seg(t, out, out + 0.5, E.easeInQuad) : 0;
    if (inP <= 0 || oP >= 1) return null;
    const life = Math.min(1, Math.max(0, (t - at) / 6));
    const s = lerp(from, to, life);
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: z, opacity: inP * (1 - oP) * opacity, overflow: 'hidden' }}>
        <img src={src} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${s}) translate(${panX * life}px, ${panY * life}px)`,
        }} />
        {dim > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(8,7,6,${dim})` }} />}
        {scrim && <div style={{ position: 'absolute', inset: 0, background: scrim }} />}
      </div>
    );
  }

  // warm paper background, tint-shifting per scene, ink finale
  const TINTS = [
    { at: 0.0,  c: [245, 242, 235] },
    { at: 6.6,  c: [245, 242, 235] },
    { at: 7.5,  c: [229, 234, 226] },
    { at: 9.4,  c: [229, 234, 226] },
    { at: 10.3, c: [243, 236, 230] },
    { at: 11.3, c: [243, 236, 230] },
    { at: 12.1, c: [245, 242, 235] },
    { at: 15.1, c: [245, 242, 235] },
    { at: 15.75, c: [16, 15, 14] },
  ];
  function Paper() {
    const t = useTime();
    let c = TINTS[TINTS.length - 1].c;
    for (let i = 0; i < TINTS.length - 1; i++) {
      if (t <= TINTS[i + 1].at) {
        const p = seg(t, TINTS[i].at, TINTS[i + 1].at, E.easeInOutCubic);
        c = [0, 1, 2].map(k => Math.round(lerp(TINTS[i].c[k], TINTS[i + 1].c[k], p)));
        break;
      }
    }
    const dark = c[0] < 100;
    return (
      <React.Fragment>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: `rgb(${c[0]},${c[1]},${c[2]})` }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(120% 100% at 50% 36%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0) 70%)',
          opacity: dark ? 0 : 1,
        }} />
      </React.Fragment>
    );
  }

  function Check({ size = 44 }) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', background: GREEN, flex: '0 0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 20px -6px rgba(47,167,106,0.45)',
      }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <path d="M4.5 12.5l5 5L19.5 7" stroke="#fff" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // CHAT geometry — bubbles are EDGE-anchored inside the card
  // ════════════════════════════════════════════════════════════════
  const CARD = { x: 960, y: 555, w: 820, h: 600, r: 38 };
  const CARD_L = CARD.x - CARD.w / 2;
  const CARD_R = CARD.x + CARD.w / 2;
  const PAD = 36;
  const DOCK = { x: CARD_L + PAD, y: 412 };

  function PatientBubble() {
    return (
      <div style={{
        background: IMSG, color: '#191817', fontSize: 28, fontWeight: 510,
        letterSpacing: '-0.014em', lineHeight: 1.36, padding: '18px 26px',
        borderRadius: '24px 24px 24px 7px', width: 'max-content', maxWidth: 560,
        fontFamily: SANS,
      }}>
        I need to move my mother's MRI.{'\n'}Please — anything this week?
      </div>
    );
  }

  // ── SCENE A · 0–3.05 · the hook (cinematic photo) ────────────────
  function SceneA() {
    const t = useTime();
    const bIn = springIn(t, 1.55, 0.6);
    const dock = seg(t, 2.52, 3.06, E.easeInOutQuart);
    const bx = lerp(1075, DOCK.x, dock), by = lerp(700, DOCK.y, dock);

    // the time slams in FAST (ad hook) — colon blinks like a live clock
    const p1 = seg(t, 0.22, 0.85, E.easeOutQuart);
    const oP = seg(t, 2.42, 2.8, E.easeInQuart);
    const colonOn = Math.floor(t * 2) % 2 === 0;

    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <Photo src="rz/showcase-caller.jpg" at={0} out={2.55} from={1.14} to={1.04} panX={-16}
          dim={0.30}
          scrim="linear-gradient(168deg, rgba(8,7,6,0.62) 22%, rgba(8,7,6,0.12) 58%, rgba(8,7,6,0.55) 100%)" />

        {p1 > 0 && oP < 1 && (
          <div style={{
            position: 'absolute', left: 132, top: 318, zIndex: 20,
            transform: `translateY(${(1 - p1) * 46}px) scale(${lerp(1.06, 1, p1)})`,
            transformOrigin: '0% 50%',
            display: 'flex', alignItems: 'baseline', gap: 18,
            opacity: p1 * (1 - oP),
            filter: (p1 < 1 || oP > 0) ? `blur(${(1 - p1) * 12 + oP * 10}px)` : 'none',
            color: '#F7F4EE', lineHeight: 1, fontFamily: SERIF,
            textShadow: '0 4px 44px rgba(0,0,0,0.45)',
          }}>
            <span style={{ fontSize: 224, fontWeight: 600, letterSpacing: '-0.018em' }}>
              2<span style={{ opacity: colonOn ? 1 : 0.25 }}>:</span>47
            </span>
            <span style={{ fontSize: 118, fontWeight: 560, color: 'rgba(247,244,238,0.55)' }}>AM</span>
          </div>
        )}
        <Reveal at={0.95} out={2.42} x={134} y={528} size={49} weight={480} color="rgba(247,244,238,0.82)" ls={-0.014} stagger={0.1} ff={SERIF}
          style={{ transform: 'translate(0,-50%)', justifyContent: 'flex-start', textShadow: '0 2px 30px rgba(0,0,0,0.4)' }}>
          <span>Your</span><span>lines</span><span>are</span><span>closed.</span>
        </Reveal>
        <Reveal at={1.25} out={2.42} x={134} y={592} size={27} weight={540} color="rgba(247,244,238,0.45)" ls={0.02} stagger={0.08}
          style={{ transform: 'translate(0,-50%)', justifyContent: 'flex-start' }}>
          <span>She's still waiting.</span>
        </Reveal>

        {bIn > 0 && (
          <div style={{
            position: 'absolute', left: bx, top: by, zIndex: 30,
            transform: `translate(0,-50%) scale(${bIn < 1 ? lerp(0.55, 1, bIn) : lerp(1.06, 1, dock)})`,
            transformOrigin: '20% 100%',
            opacity: Math.min(1, bIn * 1.4),
            filter: 'drop-shadow(0 26px 44px rgba(0,0,0,0.35))',
          }}>
            <div style={{
              fontSize: 18, fontWeight: 590, color: 'rgba(247,244,238,0.75)', letterSpacing: '0.01em',
              marginBottom: 10, opacity: 1 - dock, fontFamily: SANS,
            }}>Maria · WhatsApp</div>
            <PatientBubble />
          </div>
        )}
      </div>
    );
  }

  // ── SCENE B · 2.65–6.95 · Kira resolves it ───────────────────────
  function MiniWave({ t, active }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 28 }}>
        {[0.45, 0.8, 1, 0.7, 0.4].map((b, i) => {
          const a = active ? Math.abs(Math.sin(t * 9 + i * 1.3)) : 0.16;
          return <div key={i} style={{
            width: 4.5, height: Math.max(5, 26 * b * (0.22 + 0.78 * a)), borderRadius: 99,
            background: active ? INK : '#CBC6BE',
          }} />;
        })}
      </div>
    );
  }

  function SceneB() {
    const t = useTime();
    const cardIn = seg(t, 2.72, 3.35);
    const outP = seg(t, 6.6, 6.96, E.easeInQuart);

    const dotsIn = springIn(t, 3.2, 0.4);
    const dotsOut = seg(t, 3.85, 3.97, E.easeInQuad);
    const kiraIn = springIn(t, 3.95, 0.58);
    const yesIn = springIn(t, 4.85, 0.52);
    const confirmIn = springIn(t, 5.42, 0.62);
    const speaking = t > 3.92 && t < 5.35;
    const macro = 1 + seg(t, 3.0, 6.6, E.linear) * 0.05;

    // specular light sweep across the card after the confirmation lands
    const sweep = seg(t, 5.95, 6.55, E.easeInOutCubic);

    return (
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outP }}>
        <div style={{
          position: 'absolute', inset: 0,
          transform: `scale(${macro * lerp(1, 1.045, outP)})`, transformOrigin: '50% 52%',
          filter: outP > 0 ? `blur(${outP * 14}px)` : 'none',
        }}>
          <div style={{
            position: 'absolute', left: CARD.x, top: CARD.y, zIndex: 10,
            width: CARD.w, height: CARD.h,
            transform: `translate(-50%,-50%) scale(${lerp(0.96, 1, cardIn)}) perspective(1600px) rotateX(${(1 - cardIn) * 6}deg)`,
            opacity: cardIn,
            background: 'linear-gradient(180deg, #FFFFFF, #FDFCFA)',
            borderRadius: CARD.r, border: `1px solid ${HAIR}`,
            boxShadow: '0 80px 140px -50px rgba(31,29,26,0.22), 0 24px 48px -24px rgba(31,29,26,0.09), inset 0 1px 0 rgba(255,255,255,0.9)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 15, padding: '22px 32px',
              borderBottom: `1px solid #F1EEE9`,
            }}>
              <MarkS t={t} size={34} amp={speaking ? 0.5 : 0.07} speed={7} breathe={0.04} />
              <div style={{ fontSize: 24, fontWeight: 640, letterSpacing: '-0.02em', color: INK, fontFamily: SANS }}>Kira</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: GREEN }} />
                <span style={{ fontSize: 18, fontWeight: 530, color: GRAY, letterSpacing: '-0.01em', fontFamily: SANS }}>Northside Health</span>
              </div>
              <div style={{ marginLeft: 'auto' }}><MiniWave t={t} active={speaking} /></div>
            </div>
            {/* light sweep */}
            {sweep > 0 && sweep < 1 && (
              <div style={{
                position: 'absolute', top: -80, bottom: -80, width: 220, zIndex: 5,
                left: lerp(-260, CARD.w + 60, sweep),
                background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
                transform: 'rotate(8deg)',
              }} />
            )}
          </div>

          {t >= 3.06 && (
            <div style={{ position: 'absolute', left: DOCK.x, top: DOCK.y, zIndex: 12, transform: 'translate(0,-50%)' }}>
              <PatientBubble />
            </div>
          )}
          {t >= 3.06 && (
            <div style={{
              position: 'absolute', left: DOCK.x + 4, top: 486, zIndex: 12,
              fontSize: 16, fontWeight: 560, color: FAINT, letterSpacing: '0.01em', fontFamily: SANS,
              opacity: seg(t, 3.12, 3.42, E.easeOutQuad),
            }}>2:47 AM</div>
          )}

          {dotsIn > 0 && dotsOut < 1 && (
            <div style={{
              position: 'absolute', left: CARD_R - PAD, top: 546, zIndex: 12,
              transform: `translate(-100%,-50%) scale(${lerp(0.5, 1, dotsIn)})`,
              transformOrigin: '100% 100%',
              opacity: dotsIn * (1 - dotsOut),
              background: IMSG, borderRadius: '22px 22px 7px 22px', padding: '17px 23px',
              display: 'flex', gap: 7,
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 9.5, height: 9.5, borderRadius: 99, background: '#ABA69E',
                  transform: `translateY(${Math.sin(t * 9 - i * 0.9) * 3.4}px)`,
                }} />
              ))}
            </div>
          )}

          {kiraIn > 0 && (
            <div style={{
              position: 'absolute', left: CARD_R - PAD, top: 560, zIndex: 12,
              transform: `translate(-100%,-50%) scale(${lerp(0.55, 1, kiraIn)})`,
              transformOrigin: '100% 100%', opacity: Math.min(1, kiraIn * 1.4),
            }}>
              <div style={{
                background: INK, color: '#FCFBF9', fontSize: 28, fontWeight: 500,
                letterSpacing: '-0.012em', lineHeight: 1.38, padding: '18px 26px',
                borderRadius: '24px 24px 7px 24px', width: 'max-content', maxWidth: 620,
                fontFamily: SANS,
              }}>
                Of course. Dr. Tan has Thursday{'\n'}at 9:40 AM — shall I book it?
              </div>
            </div>
          )}

          {yesIn > 0 && (
            <div style={{
              position: 'absolute', left: DOCK.x, top: 668, zIndex: 12,
              transform: `translate(0,-50%) scale(${lerp(0.55, 1, yesIn)})`,
              transformOrigin: '0% 100%', opacity: Math.min(1, yesIn * 1.4),
            }}>
              <div style={{
                background: IMSG, color: '#191817', fontSize: 28, fontWeight: 510,
                letterSpacing: '-0.014em', padding: '16px 26px',
                borderRadius: '24px 24px 24px 7px', width: 'max-content', fontFamily: SANS,
              }}>Yes, please.</div>
            </div>
          )}

          {confirmIn > 0 && (
            <div style={{
              position: 'absolute', left: 960, top: 786, zIndex: 13,
              transform: `translate(-50%,-50%) scale(${lerp(0.62, 1, confirmIn)})`,
              opacity: Math.min(1, confirmIn * 1.4),
              display: 'flex', alignItems: 'center', gap: 20,
              background: '#FFFFFF', border: `1px solid ${HAIR}`, borderRadius: 24,
              boxShadow: '0 30px 60px -26px rgba(31,29,26,0.16)',
              padding: '20px 30px', width: 700, fontFamily: SANS,
            }}>
              <Check size={50} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 650, letterSpacing: '-0.022em', color: INK }}>MRI — rescheduled</div>
                <div style={{ fontSize: 19, fontWeight: 500, color: GRAY, marginTop: 4, letterSpacing: '-0.01em' }}>Thu · 9:40 AM · Dr. Tan · Imaging, Level 2</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 560, color: FAINT }}>2:48 AM</div>
            </div>
          )}

          <Reveal at={6.0} y={988} size={46} weight={560} ls={-0.02} stagger={0.075} ff={SERIF}>
            <span>No hold. No handoff.</span>
            <span style={{ color: GRAY, fontWeight: 480 }}>Handled by 2:48.</span>
          </Reveal>
        </div>
      </div>
    );
  }

  // ── SCENE M · 6.85–9.85 · same Kira, every industry ──────────────
  const VERTS = [
    {
      tag: 'GAME DAY · SPORTS', x: 425,
      q: "Can I move our four seats\nto Saturday's game?",
      a: 'Seats moved — Sec 214, Row F',
      at: 7.0,
    },
    {
      tag: 'CARDS · BANKING', x: 960,
      q: 'My card was declined abroad —\nI board in an hour.',
      a: 'Unblocked — identity verified',
      at: 7.62,
    },
    {
      tag: 'CLAIMS · INSURANCE', x: 1495,
      q: 'Is physiotherapy covered\non my plan?',
      a: 'Confirmed — claim pre-filed',
      at: 8.24,
    },
  ];

  function SceneM() {
    const t = useTime();
    const outP = seg(t, 9.5, 9.86, E.easeInQuart);

    return (
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outP }}>
        <div style={{
          position: 'absolute', inset: 0,
          transform: `scale(${lerp(1, 1.04, outP)})`, transformOrigin: '50% 50%',
          filter: outP > 0 ? `blur(${outP * 12}px)` : 'none',
        }}>
          {VERTS.map((v, i) => {
            const p = springIn(t, v.at, 0.58);
            if (p <= 0) return null;
            const chk = springIn(t, v.at + 0.52, 0.5);
            return (
              <div key={i} style={{
                position: 'absolute', left: v.x, top: 500, zIndex: 10,
                width: 486,
                transform: `translate(-50%,-50%) scale(${lerp(0.8, 1, p)}) translateY(${(1 - p) * 46}px)`,
                opacity: Math.min(1, p * 1.5),
                background: 'linear-gradient(180deg, #FFFFFF, #FDFCFA)',
                border: `1px solid ${HAIR}`, borderRadius: 30,
                boxShadow: '0 50px 100px -40px rgba(31,29,26,0.22), 0 16px 36px -20px rgba(31,29,26,0.09)',
                padding: '30px 34px 28px', fontFamily: SANS,
              }}>
                <div style={{
                  fontSize: 15, fontWeight: 640, letterSpacing: '0.22em', color: FAINT, marginBottom: 20,
                }}>{v.tag}</div>
                <div style={{
                  background: IMSG, color: '#191817', fontSize: 24, fontWeight: 510,
                  letterSpacing: '-0.014em', lineHeight: 1.36, padding: '16px 22px',
                  borderRadius: '20px 20px 20px 6px', width: 'max-content', maxWidth: 418,
                  whiteSpace: 'pre-line',
                }}>{v.q}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, marginTop: 22,
                  opacity: chk, transform: `scale(${lerp(0.8, 1, chk)})`, transformOrigin: '0% 50%',
                }}>
                  <Check size={40} />
                  <div style={{ fontSize: 22, fontWeight: 630, letterSpacing: '-0.018em', color: INK }}>{v.a}</div>
                </div>
              </div>
            );
          })}

          <Reveal at={8.95} y={880} size={58} weight={560} ls={-0.02} stagger={0.09} ff={SERIF}>
            <span>Same Kira.</span>
            <span style={{ color: GRAY, fontWeight: 480 }}>Every industry.</span>
          </Reveal>
        </div>
      </div>
    );
  }

  // ── SCENE C · 9.75–11.6 · voice ──────────────────────────────────
  const NB = 72;
  function WaveBars({ t, mirror = false, wave }) {
    return (
      <div style={{
        display: 'flex', alignItems: mirror ? 'flex-start' : 'flex-end', gap: 8.5,
        transform: mirror ? 'scaleY(-1)' : 'none',
        opacity: mirror ? 0.09 : 1,
        maskImage: mirror ? 'linear-gradient(180deg, #000, transparent 62%)' : 'none',
        WebkitMaskImage: mirror ? 'linear-gradient(180deg, #000, transparent 62%)' : 'none',
        height: mirror ? 120 : 'auto',
      }}>
        {Array.from({ length: NB }).map((_, i) => {
          const c = Math.abs(i - (NB - 1) / 2) / ((NB - 1) / 2);
          const bornP = seg(t, 9.76 + c * 0.26, 10.04 + c * 0.26, E.easeOutCubic);
          const dieP = seg(t, 11.24 + (1 - c) * 0.18, 11.48 + (1 - c) * 0.18, E.easeInQuad);
          const env = 30 + 200 * Math.pow(Math.sin(Math.PI * i / (NB - 1)), 0.8);
          const talk = Math.abs(Math.sin(t * 8.5 + i * 0.42 + rnd(i) * 2.2)) * (0.68 + 0.32 * Math.sin(t * 2.9 + i * 0.11));
          const grow = seg(t, 10.02, 10.37, E.easeOutCubic);
          const mul = lerp(0.12, 0.18 + 0.82 * talk, grow);
          const gi = Math.min(4, Math.floor(i / NB * 5));
          return (
            <div key={i} style={{
              width: 7, height: Math.max(8, env * mul), borderRadius: 999,
              background: wave === 'ink' ? INK : `linear-gradient(180deg, ${BARS[gi].g[0]}, ${BARS[gi].g[1]})`,
              opacity: 0.35 + 0.65 * Math.pow(1 - c, 0.5),
              transform: `scaleY(${Math.max(0.0001, bornP * (1 - dieP))})`,
            }} />
          );
        })}
      </div>
    );
  }

  function SceneC({ wave }) {
    const t = useTime();
    const outP = seg(t, 11.28, 11.64, E.easeInQuart);
    return (
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outP }}>
        <Reveal at={9.92} out={11.24} y={278} size={98} weight={560} ls={-0.02} stagger={0.1} ff={SERIF}>
          <span>And</span><span>it</span><span>speaks.</span>
        </Reveal>

        <div style={{
          position: 'absolute', left: 960, top: 565, transform: 'translate(-50%,-100%) translateY(122px)',
          zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <WaveBars t={t} wave={wave} />
          <WaveBars t={t} mirror wave={wave} />
        </div>

        <Reveal at={10.24} out={11.24} y={852} size={31} weight={520} color={GRAY} ls={-0.012} stagger={0.09}>
          <span>Real-time voice</span>
          <span style={{ color: FAINT }}>·</span>
          <span>Barge-in ready</span>
          <span style={{ color: FAINT }}>·</span>
          <span>60+ languages</span>
        </Reveal>
      </div>
    );
  }

  // ── SCENE D · 11.5–13.8 · connector marquee ──────────────────────
  const TILE_LOGOS = [
    { img: 'rz/integrations/epic.webp', w: 84 },
    { dot: '#3ED27E', label: 'WhatsApp' },
    { img: 'rz/integrations/salesforce.webp', w: 104 },
    { img: 'rz/integrations/pointclickcare.webp', w: 132 },
    { dot: '#7B83EB', label: 'Teams' },
    { img: 'rz/integrations/microsoft-dynamics.webp', w: 138 },
    { img: 'rz/integrations/hubspot.webp', w: 116 },
    { dot: '#E2683E', label: 'Slack' },
    { img: 'rz/integrations/cisco.webp', w: 92 },
    { img: 'rz/integrations/advancedmd.webp', w: 128 },
  ];
  const ROWA = [0, 2, 4, 6, 8, 1, 3, 5];
  const ROWB = [9, 7, 5, 3, 1, 8, 0, 2];

  function TileRow({ t, idxs, y, dir, speed, born }) {
    const TW = 236, LOOP = TW * idxs.length;
    const inP = seg(t, born, born + 0.7, E.easeOutCubic);
    if (inP <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: 0, right: 0, top: y, zIndex: 6, height: 150,
        opacity: inP,
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
      }}>
        {idxs.concat(idxs).map((li, i) => {
          const item = TILE_LOGOS[li];
          const base = i * TW;
          const travel = (t - born) * speed * dir + (1 - inP) * 40 * dir;
          const x = ((base + travel) % LOOP + LOOP) % LOOP - 240;
          if (x < -260 || x > 1980) return null;
          return (
            <div key={i} style={{
              position: 'absolute', left: x, top: 0, width: 208, height: 148,
              background: '#FFFFFF', border: `1px solid ${HAIR}`, borderRadius: 30,
              boxShadow: '0 22px 44px -24px rgba(31,29,26,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: SANS,
            }}>
              {item.img
                ? <img src={item.img} alt="" style={{ width: item.w, height: 'auto', maxHeight: 64, objectFit: 'contain', display: 'block' }} />
                : <React.Fragment>
                    <span style={{ width: 13, height: 13, borderRadius: 99, background: item.dot }} />
                    <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: INK }}>{item.label}</span>
                  </React.Fragment>}
            </div>
          );
        })}
      </div>
    );
  }

  const BADGES = [
    { src: 'rz/logos/hipaa.webp',     h: 66, w: 124 },
    { src: 'rz/logos/aicpa-soc.webp', h: 76, w: 77 },
    { src: 'rz/logos/iso-27001.webp', h: 76, w: 76 },
  ];

  function SceneD() {
    const t = useTime();
    const outP = seg(t, 13.46, 13.82, E.easeInQuart);

    return (
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outP }}>
        <TileRow t={t} idxs={ROWA} y={196} dir={-1} speed={34} born={11.62} />
        <TileRow t={t} idxs={ROWB} y={738} dir={1} speed={30} born={11.74} />

        <Reveal at={11.78} out={13.42} y={505} size={92} weight={560} ls={-0.02} stagger={0.08} ff={SERIF}>
          <span>Plugged</span><span>into</span><span>everything</span><span>you</span><span>run.</span>
        </Reveal>
        <Reveal at={12.2} out={13.42} y={600} size={30} weight={520} color={GRAY} ls={-0.01} stagger={0.08}>
          <span>Governed end to end</span>
          <span style={{ color: FAINT }}>—</span>
          <span>every action logged, every rule enforced.</span>
        </Reveal>

        {BADGES.map((b, i) => {
          const p = seg(t, 12.55 + i * 0.09, 13.0 + i * 0.09, E.easeOutQuart);
          return (
            <img key={i} src={b.src} alt="" width={b.w} height={b.h} style={{
              position: 'absolute', left: 960 + (i - 1) * 185, top: lerp(672, 660, p), zIndex: 8,
              width: b.w, height: b.h, transform: 'translate(-50%,-50%)', opacity: p * 0.9,
            }} />
          );
        })}
      </div>
    );
  }

  // ── SCENE E · 13.7–15.5 · proof over the crowd ───────────────────
  function SceneE() {
    const t = useTime();
    const outP = seg(t, 15.12, 15.52, E.easeInQuart);
    const p = seg(t, 13.8, 14.82, E.easeOutExpo);
    const cnt = Math.round(82 * p);
    const inP = seg(t, 13.8, 14.35);

    return (
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outP }}>
        {/* the one calm person in a rushing crowd — faint, editorial */}
        <Photo src="rz/photo-crowd2.webp" at={13.7} from={1.06} to={1.0} panY={-10} z={2} opacity={0.16}
          scrim="radial-gradient(88% 72% at 50% 46%, rgba(245,242,235,0.2) 0%, rgba(245,242,235,0.94) 78%)" />

        <div style={{
          position: 'absolute', left: 960, top: 470, zIndex: 10,
          transform: `translate(-50%,-50%) translateY(${(1 - inP) * 40}px)`,
          fontSize: 340, fontWeight: 620, letterSpacing: '-0.03em', color: INK, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', opacity: inP, fontFamily: SERIF,
          filter: inP < 1 ? `blur(${(1 - inP) * 12}px)` : 'none',
        }}>
          {cnt}<span style={{ fontSize: 190, fontWeight: 580, color: '#8A8680' }}>%</span>
        </div>
        <Reveal at={14.12} out={15.08} y={732} size={50} weight={480} color={GRAY} ls={-0.016} stagger={0.07} ff={SERIF}>
          <span>of conversations resolved</span>
          <span style={{ color: INK, fontWeight: 600 }}>without a human.</span>
        </Reveal>
        <Reveal at={14.4} out={15.08} y={832} size={23} weight={600} color={FAINT} ls={0.18} stagger={0.08}>
          <span>24/7</span><span>·</span><span>60+ LANGUAGES</span><span>·</span><span>LIVE IN ~4 WEEKS</span>
        </Reveal>
      </div>
    );
  }

  // ── SCENE F · 15.4–18.2 · title card + CTA ───────────────────────
  function SceneF() {
    const t = useTime();
    const markP = springIn(t, 15.86, 0.62);
    const ctaP = springIn(t, 16.95, 0.6);
    const pulse = 1 + Math.sin(Math.max(0, t - 17.55) * 3.2) * 0.018;

    const L = (ch, at, i) => {
      const p = seg(t, at, at + 0.52, E.easeOutQuart);
      return (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 115}%)` }}>{ch}</span>
        </span>
      );
    };

    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* soft warm bloom behind the lockup */}
        <div style={{
          position: 'absolute', left: 960, top: 470, zIndex: 2, width: 1300, height: 700,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(226,104,62,0.13) 0%, rgba(169,139,224,0.05) 55%, transparent 78%)',
          opacity: markP,
        }} />

        <div style={{
          position: 'absolute', left: 960, top: 460, zIndex: 12, transform: 'translate(-50%,-50%)',
          display: 'flex', alignItems: 'center', gap: 24,
          fontSize: 182, fontWeight: 640, letterSpacing: '-0.048em', color: '#F7F4EE', lineHeight: 1,
          fontFamily: BRAND_FONT,
        }}>
          <span style={{ whiteSpace: 'pre' }}>{['r', 'e', 'z'].map((ch, i) => L(ch, 16.0 + (2 - i) * 0.055, i))}</span>
          <div style={{ transform: `scale(${Math.max(0.001, markP)})`, filter: 'drop-shadow(0 0 44px rgba(226,104,62,0.35))' }}>
            <MarkS t={t} size={134} amp={t > 16.6 ? 0.55 : 0.14} speed={6} breathe={0.06} />
          </div>
          <span style={{ whiteSpace: 'pre' }}>{['n', 'a', 't', 'e'].map((ch, i) => L(ch, 16.18 + i * 0.055, i + 3))}</span>
        </div>
        <Reveal at={16.55} y={640} size={44} weight={480} color="rgba(247,244,238,0.6)" ls={-0.012} stagger={0.09} ff={SERIF}>
          <span>Every</span><span>conversation,</span><span>handled.</span>
        </Reveal>

        {/* CTA */}
        {ctaP > 0 && (
          <div style={{
            position: 'absolute', left: 960, top: 790, zIndex: 14,
            transform: `translate(-50%,-50%) scale(${lerp(0.7, 1, ctaP) * pulse})`,
            opacity: Math.min(1, ctaP * 1.4),
            display: 'flex', alignItems: 'center', gap: 16,
            background: '#F7F4EE', color: '#141210',
            borderRadius: 999, padding: '24px 44px',
            fontSize: 31, fontWeight: 640, letterSpacing: '-0.02em', fontFamily: SANS,
            boxShadow: '0 24px 70px -18px rgba(226,104,62,0.4), 0 10px 34px -12px rgba(0,0,0,0.5)',
          }}>
            See Kira live
            <span style={{ fontWeight: 480, color: '#8A8680' }}>rezonate.com</span>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M4 12h15M13 6l6 6-6 6" stroke="#141210" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <Reveal at={17.3} y={905} size={20} weight={560} color="rgba(247,244,238,0.35)" ls={0.2} stagger={0.06}>
          <span>SOC 2 TYPE II</span><span>·</span><span>HIPAA</span><span>·</span><span>DEPLOYS IN ~4 WEEKS</span>
        </Reveal>
      </div>
    );
  }

  // ── film overlays: grain + vignette ──────────────────────────────
  function Filmic() {
    return (
      <React.Fragment>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', opacity: 0.05,
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.85) 0.6px, transparent 1px), radial-gradient(rgba(0,0,0,0.6) 0.5px, transparent 0.9px)',
          backgroundSize: '4px 4px, 7px 7px',
          backgroundPosition: '0 0, 2px 3px',
          mixBlendMode: 'multiply',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 51, pointerEvents: 'none',
          background: 'radial-gradient(115% 92% at 50% 44%, transparent 64%, rgba(10,8,5,0.15) 100%)',
        }} />
      </React.Fragment>
    );
  }

  // ── root ──────────────────────────────────────────────────────────
  function sceneName(t) {
    if (t < 3.05) return 'hook · 2:47 AM';
    if (t < 6.95) return 'kira resolves it';
    if (t < 9.85) return 'every industry';
    if (t < 11.6) return 'voice';
    if (t < 13.8) return 'connectors + governance';
    if (t < 15.5) return 'proof · 82%';
    return 'title card + CTA';
  }

  function Film({ wave }) {
    const t = useTime();
    const push = 1 + Math.min(t / 18.2, 1) * 0.04;
    return (
      <div
        data-screen-label={`t=${Math.floor(t)}s · ${sceneName(t)}`}
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden', background: '#F5F2EB',
          fontFamily: SANS,
        }}>
        <Paper />
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 47%' }}>
          <Sprite start={0} end={3.15}><SceneA /></Sprite>
          <Sprite start={2.65} end={7.0}><SceneB /></Sprite>
          <Sprite start={6.85} end={9.9}><SceneM /></Sprite>
          <Sprite start={9.7} end={11.68}><SceneC wave={wave} /></Sprite>
          <Sprite start={11.45} end={13.85}><SceneD /></Sprite>
          <Sprite start={13.65} end={15.55}><SceneE /></Sprite>
          <Sprite start={15.35} end={18.2}><SceneF /></Sprite>
        </div>
        <Filmic />
      </div>
    );
  }

  function KiraIntroFilm({ wave = 'ink' }) {
    return (
      <Stage width={1920} height={1080} duration={18.2} background="#F5F2EB" persistKey="kiraintro">
        <Film wave={wave} />
      </Stage>
    );
  }

  window.KiraIntroFilm = KiraIntroFilm;
})();
