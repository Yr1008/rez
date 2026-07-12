/* kira-film.jsx — "Every conversation, handled."
   Apple-keynote-style brand film for Kira (Rezonate).
   Clean white. Black kinetic type. Black waveform. The gradient mark
   is the only color. 13.5s, loops. */

(() => {
  const { Stage, Sprite, useTime, Easing: E } = window;

  // ── helpers ───────────────────────────────────────────────────────
  const lerp = (a, b, p) => a + (b - a) * p;
  const seg = (t, t0, t1, ease = E.easeInOutCubic) =>
    t <= t0 ? 0 : t >= t1 ? 1 : ease((t - t0) / (t1 - t0));
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const zlerp = (kt, kv, ease = E.linear) => (x) => {
    if (x <= kt[0]) return kv[0];
    for (let i = 0; i < kt.length - 1; i++) {
      if (x >= kt[i] && x <= kt[i + 1]) {
        const p = (x - kt[i]) / (kt[i + 1] - kt[i]);
        return kv[i] + (kv[i + 1] - kv[i]) * ease(p);
      }
    }
    return kv[kv.length - 1];
  };

  const INK = '#1D1D1F';          // apple ink
  const GRAY = '#86868B';         // apple secondary
  const HAIR = '#E8E6E1';         // hairline
  const ACCENT = '#E2683E';       // brand orange (highlight word)

  // ── the Kira mark (the only color in the film) ────────────────────
  const BARS = [
    { g: ['#C9B2F2', '#A98BE0'], sh: 'rgba(169,139,224,0.35)', b: 0.52 },
    { g: ['#C08AC8', '#CE5F63'], sh: 'rgba(206,95,99,0.35)',  b: 0.80 },
    { g: ['#E06A54', '#D94F49'], sh: 'rgba(217,79,73,0.38)',  b: 1.00 },
    { g: ['#EA8442', '#E2683E'], sh: 'rgba(226,104,62,0.38)', b: 0.86 },
    { g: ['#F2AC3C', '#E8912F'], sh: 'rgba(239,161,46,0.35)', b: 0.55 },
  ];

  function MarkS({ t, size = 200, amp = 0, speed = 6, breathe = 0.05, shadow = 1, phase = 0, born = null, bornDur = 0.42 }) {
    const w = size * 0.185, gap = size * 0.082;
    const bornOrd = [3, 1, 0, 2, 4]; // center-out
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap }}>
        {BARS.map((bar, k) => {
          let bs = 1;
          if (born != null) bs = seg(t, born + bornOrd[k] * 0.06, born + bornOrd[k] * 0.06 + bornDur, E.easeOutBack);
          const breath = 1 + Math.sin(t * 1.6 + k * 0.9 + phase) * breathe;
          const dance = 1 + amp * (Math.abs(Math.sin(t * speed + k * 1.9 + phase + rnd(k * 9) * 2.2)) - 0.55) * 0.95;
          const h = Math.max(size * 0.09, size * bar.b * breath * Math.max(0.16, dance));
          return (
            <div key={k} style={{
              width: w, height: h, borderRadius: 999,
              background: `linear-gradient(180deg, ${bar.g[0]}, ${bar.g[1]})`,
              boxShadow: shadow ? `0 ${size * 0.05}px ${size * 0.16}px ${bar.sh}` : 'none',
              transform: `scaleY(${Math.max(0.0001, bs)})`,
            }} />
          );
        })}
      </div>
    );
  }

  // ── type ──────────────────────────────────────────────────────────
  function Slam({ at, children, x = 960, y, size = 120, dur = 0.42, color = INK, weight = 680, out, style }) {
    const t = useTime();
    const p = seg(t, at, at + dur, E.easeOutExpo);
    const o = out != null ? 1 - seg(t, out, out + 0.3, E.easeInCubic) : 1;
    if (p <= 0 || o <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: 20,
        transform: `translate(-50%,-50%) scale(${lerp(1.5, 1, p)})`,
        opacity: p * o,
        filter: `blur(${(1 - p) * 16}px)`,
        fontSize: size, fontWeight: weight, letterSpacing: '-0.045em', color,
        whiteSpace: 'pre', lineHeight: 1,
        ...style,
      }}>{children}</div>
    );
  }

  function Rise({ at, children, x = 960, y, size = 96, dur = 0.6, color = INK, weight = 650, out, ls = '-0.04em', z = 20 }) {
    const t = useTime();
    const p = seg(t, at, at + dur, E.easeOutQuart);
    const o = out != null ? 1 - seg(t, out, out + 0.32, E.easeInCubic) : 1;
    if (p <= 0 || o <= 0) return null;
    return (
      <div style={{
        position: 'absolute', left: x, top: y, zIndex: z,
        transform: 'translate(-50%,-50%)', overflow: 'hidden', padding: '0.14em 0.4em',
      }}>
        <div style={{
          fontSize: size, fontWeight: weight, letterSpacing: ls, color, lineHeight: 1.06,
          whiteSpace: 'pre', opacity: o,
          transform: `translateY(${(1 - p) * 112}%)`,
        }}>{children}</div>
      </div>
    );
  }

  function Words({ words, at, gap = 0.09, x = 960, y, size = 50, color = INK, weight = 550, out, dim = 1, hl = [], z = 12 }) {
    const t = useTime();
    return (
      <div style={{
        position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', zIndex: z,
        display: 'flex', gap: '0.3em', whiteSpace: 'pre', justifyContent: 'center',
        fontSize: size, fontWeight: weight, letterSpacing: '-0.025em', opacity: dim,
      }}>
        {words.map((wd, i) => {
          const p = seg(t, at + i * gap, at + i * gap + 0.3, E.easeOutCubic);
          const o = out != null ? 1 - seg(t, out + (i % 4) * 0.03, out + (i % 4) * 0.03 + 0.22, E.easeInCubic) : 1;
          return (
            <span key={i} style={{
              display: 'inline-block',
              opacity: p * o,
              filter: `blur(${(1 - p) * 8}px)`,
              transform: `translateY(${(1 - p) * 14}px)`,
              color: hl.includes(i) ? ACCENT : color,
            }}>{wd}</span>
          );
        })}
      </div>
    );
  }

  // clean white card pill
  function Pill({ label, dot, size = 26 }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#FFFFFF', border: `1px solid ${HAIR}`,
        boxShadow: '0 12px 32px -14px rgba(29,29,31,0.18)',
        color: INK, fontSize: size, fontWeight: 590, letterSpacing: '-0.02em',
        padding: '15px 28px', borderRadius: 999, whiteSpace: 'nowrap',
      }}>
        {dot && <span style={{ width: 11, height: 11, borderRadius: 99, background: dot }} />}
        {label}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE A (0–4.0) · black pulse → mark → torrent → implode
  // ════════════════════════════════════════════════════════════════
  const STREAM_TEXTS = [
    ["Where's my refund?", 'Reschedule my MRI', { l: 'WhatsApp', d: '#3ED27E' }, 'Reset my password', 'Gate 4 or gate 5?', 'Pause my plan'],
    ['Card declined — help', { l: 'Voice', d: '#EFA12E' }, 'Renew my season pass', 'Payment due today?', 'Book a follow-up', 'Verify my account'],
    ['Resend my tickets', "Laptop won't boot", { l: 'SMS', d: '#B79DE8' }, 'Talk to a human?', 'Refill my Rx', 'Change my flight?'],
    ['Update my address', 'Is Dr. Tan in Friday?', { l: 'Teams', d: '#7B83EB' }, 'Cancel order #4417', 'Am I covered?', 'Missed my payment'],
  ];
  const LANES = [
    { y: 245, dir: 1,  sp: 420 },
    { y: 405, dir: -1, sp: 520 },
    { y: 712, dir: 1,  sp: 470 },
    { y: 872, dir: -1, sp: 385 },
  ];
  const SLOT = 470, LOOPW = SLOT * 6;

  function SceneA() {
    const t = useTime();

    const dotIn = seg(t, 0.1, 0.42, E.easeOutBack);
    let pump = 1;
    for (const pa of [0.5, 0.82]) {
      const p = seg(t, pa, pa + 0.34, E.easeOutCubic);
      if (p > 0 && p < 1) pump = 1 + Math.sin(p * Math.PI) * 0.5;
    }
    const stretch = seg(t, 1.0, 1.26, E.easeInOutQuart);
    const markBorn = 1.18;

    const rise = seg(t, 1.72, 2.24, E.easeInOutQuart);
    const my = lerp(560, 168, rise);
    const mScale = lerp(1, 0.4, rise);
    const amp = seg(t, 1.4, 1.8, E.easeOutCubic) * (0.55 + 0.45 * seg(t, 2.2, 3.4, E.easeInQuad));

    const streamIn = seg(t, 1.78, 2.2, E.easeOutCubic);
    const accel = 1.4 + seg(t, 2.2, 3.5, E.easeInQuad) * 2.6;

    const imp = seg(t, 3.45, 3.95, E.easeInExpo);
    const impScale = Math.max(0.001, 1 - imp * 0.999);
    const fadeIn = seg(t, 0, 0.22, E.easeOutQuad);

    return (
      <div style={{ position: 'absolute', inset: 0, opacity: fadeIn }}>
        <div style={{
          position: 'absolute', inset: 0,
          transform: `scale(${impScale})`, transformOrigin: '50% 50%',
          filter: imp > 0 ? `blur(${imp * 26}px)` : 'none',
          opacity: 1 - seg(t, 3.72, 3.96, E.easeInQuad),
        }}>
          {/* ripple rings — hairline gray */}
          {[0.5, 0.82].map((pa, i) => {
            const p = seg(t, pa, pa + 1.0, E.easeOutCubic);
            if (p <= 0 || p >= 1) return null;
            return (
              <div key={i} style={{
                position: 'absolute', left: 960, top: 560, zIndex: 4,
                width: 60 + p * 820, height: 60 + p * 820,
                transform: 'translate(-50%,-50%)',
                border: '1.5px solid rgba(29,29,31,0.28)', borderRadius: '50%',
                opacity: (1 - p) * 0.8,
              }} />
            );
          })}

          {/* black pulse dot → stretches into the mark's center bar */}
          {t < markBorn + 0.15 && (
            <div style={{
              position: 'absolute', left: 960, top: 560, zIndex: 6,
              width: 26, height: lerp(26, 200, stretch), borderRadius: 999,
              transform: `translate(-50%,-50%) scale(${dotIn * pump})`,
              opacity: dotIn * (1 - seg(t, markBorn + 0.03, markBorn + 0.15)),
              background: INK,
            }} />
          )}

          {/* the mark — color arrives */}
          {t >= markBorn && (
            <div style={{
              position: 'absolute', left: 960, top: my, zIndex: 6,
              transform: `translate(-50%,-50%) scale(${mScale})`,
            }}>
              <MarkS t={t} size={200} amp={amp} speed={8} born={markBorn} bornDur={0.36} />
            </div>
          )}

          {/* torrent lanes — clean white cards */}
          {streamIn > 0 && LANES.map((ln, li) => (
            <div key={li} style={{ position: 'absolute', left: 0, right: 0, top: ln.y, zIndex: 8, opacity: streamIn }}>
              {STREAM_TEXTS[li].map((tx, i) => {
                const base = i * SLOT + rnd(li * 7 + i) * 120;
                const travel = t * ln.sp * accel * ln.dir;
                const x = ((base - travel) % LOOPW + LOOPW) % LOOPW - 500;
                const isChip = typeof tx === 'object';
                return (
                  <div key={i} style={{
                    position: 'absolute', left: x, top: 0, transform: 'translateY(-50%)',
                    filter: `blur(${0.8 + (accel - 1.4) * 2.0}px)`,
                  }}>
                    <Pill label={isChip ? tx.l : tx} dot={isChip ? tx.d : null} />
                  </div>
                );
              })}
            </div>
          ))}

          {/* kinetic type */}
          <Slam at={2.3} y={512} size={134}>Thousands of questions.</Slam>
          <Rise at={2.85} y={655} size={52} weight={520} color={GRAY} ls="-0.02em">Every single day.</Rise>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE B (3.95–5.95) · Meet Kira
  // ════════════════════════════════════════════════════════════════
  function SceneB() {
    const t = useTime();
    const inP = seg(t, 3.98, 4.5, E.easeOutExpo);
    const outP = seg(t, 5.6, 5.95, E.easeInQuart);
    const push = 1 + seg(t, 4.2, 5.9, E.linear) * 0.045;
    return (
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outP }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 48%' }}>
          <div style={{
            position: 'absolute', left: 960, top: 512, zIndex: 6,
            transform: `translate(-50%,-50%) scale(${lerp(1.4, 1, inP)})`,
            opacity: inP,
          }}>
            <MarkS t={t} size={240} amp={0.16} speed={3.4} breathe={0.07} />
          </div>
          <Rise at={4.28} y={822} size={120} out={5.58}>Meet Kira.</Rise>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE C (5.95–8.35) · black waveform · barge-in
  // ════════════════════════════════════════════════════════════════
  const NB = 52;
  const T1 = ['Your', 'appointment’s', 'moved', 'to', 'Tuesday', 'at', '2:15.'];
  const T2 = ['Done', '—', 'Thursday.'];

  function SceneC({ wave }) {
    const t = useTime();
    const outP = seg(t, 8.0, 8.33, E.easeInQuart);

    const dip = seg(t, 7.06, 7.3, E.easeOutCubic) * (1 - seg(t, 7.5, 7.74, E.easeInOutCubic));
    const burst = 1 + seg(t, 7.58, 7.78, E.easeOutCubic) * 0.25 * (1 - seg(t, 7.95, 8.25));
    const amp = lerp(1, 0.09, dip) * burst;
    const speakStart = seg(t, 6.25, 6.6, E.easeOutCubic);

    const bubP = seg(t, 7.02, 7.5, E.easeOutBack);
    const bubO = bubP * (1 - seg(t, 7.9, 8.18, E.easeInCubic));
    const push = 1 + seg(t, 6.0, 8.3, E.linear) * 0.04;

    return (
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outP }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 50%' }}>
          {/* live label */}
          <div style={{
            position: 'absolute', left: 960, top: 292, transform: 'translate(-50%,-50%)', zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 13,
            opacity: seg(t, 6.1, 6.5, E.easeOutCubic) * (1 - seg(t, 7.95, 8.25)),
            fontSize: 20, fontWeight: 600, letterSpacing: '0.32em', color: GRAY,
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: 99, background: '#E5484D',
              opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 4)),
            }} />
            LIVE · VOICE
          </div>

          {/* the waveform — black, Apple-clean */}
          <div style={{
            position: 'absolute', left: 960, top: 545, transform: 'translate(-50%,-50%)',
            display: 'flex', alignItems: 'center', gap: 12, zIndex: 6,
          }}>
            {Array.from({ length: NB }).map((_, i) => {
              const c = Math.abs(i - (NB - 1) / 2) / ((NB - 1) / 2);
              const bornP = seg(t, 5.98 + c * 0.28, 6.26 + c * 0.28, E.easeOutBack);
              const env = 40 + 190 * Math.pow(Math.sin(Math.PI * i / (NB - 1)), 0.75);
              const talk = Math.abs(Math.sin(t * 8 + i * 0.5 + rnd(i) * 2.2)) * (0.72 + 0.28 * Math.sin(t * 2.7 + i * 0.13));
              const idle = 0.14 + 0.04 * Math.sin(t * 2.4 + i * 0.7);
              const mul = lerp(idle, 0.2 + 0.8 * talk, speakStart * amp);
              return (
                <div key={i} style={{
                  width: 10, height: Math.max(10, env * mul), borderRadius: 999,
                  background: wave === 'ink' ? INK : `linear-gradient(180deg, ${BARS[Math.floor(i / NB * 5) % 5].g[0]}, ${BARS[Math.floor(i / NB * 5) % 5].g[1]})`,
                  transform: `scaleY(${Math.max(0.0001, bornP)})`,
                }} />
              );
            })}
          </div>

          {/* transcripts */}
          <Words words={T1} at={6.4} y={800} hl={[4, 6]} out={7.3} dim={lerp(1, 0.3, dip)} />
          <Words words={T2} at={7.55} y={800} size={60} weight={640} gap={0.08} hl={[2]} out={8.0} />

          {/* the caller barges in — black bubble */}
          <div style={{
            position: 'absolute', left: lerp(1585, 1420, bubP), top: 330, zIndex: 12,
            transform: `translate(-50%,-50%) scale(${Math.max(0.001, bubP)}) rotate(${lerp(7, 2, bubP)}deg)`,
            opacity: bubO,
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                background: INK, color: '#FFFFFF', fontSize: 31, fontWeight: 600,
                letterSpacing: '-0.015em', padding: '18px 30px', borderRadius: 26, whiteSpace: 'nowrap',
                boxShadow: '0 24px 60px -18px rgba(29,29,31,0.5)',
              }}>Actually — Thursday?</div>
              <div style={{
                position: 'absolute', bottom: -7, right: 30, width: 18, height: 18,
                background: INK, transform: 'rotate(45deg)', borderRadius: 4,
              }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE D (8.35–10.85) · channels line up → enclosed → governed
  // ════════════════════════════════════════════════════════════════
  const CHANNELS = [
    { l: 'WhatsApp',  d: '#3ED27E' },
    { l: 'Voice',     d: '#EFA12E' },
    { l: 'SMS',       d: '#B79DE8' },
    { l: 'Teams',     d: '#7B83EB' },
    { l: 'Slack',     d: '#E2683E' },
    { l: 'Messenger', d: '#4E9BFF' },
    { l: 'Telegram',  d: '#37AEE2' },
    { l: 'Email',     d: '#D9605A' },
  ];
  const ROW_X = [-763, -556, -366, -204, 204, 372, 555, 752];

  const BADGES = [
    { src: 'rz/logos/hipaa.webp',     h: 84 },
    { src: 'rz/logos/aicpa-soc.webp', h: 92 },
    { src: 'rz/logos/iso-27001.webp', h: 92 },
  ];

  function SceneD() {
    const t = useTime();
    const inP = seg(t, 8.38, 8.8, E.easeOutExpo);
    const outP = seg(t, 10.55, 10.88, E.easeInQuart);

    const orbitIn = seg(t, 8.42, 8.9, E.easeOutCubic);
    const toRow = seg(t, 9.35, 9.95, E.easeInOutQuart);

    const drawP = seg(t, 9.85, 10.35, E.easeInOutQuart);
    const encO = seg(t, 9.85, 10.1, E.easeOutCubic) * (1 - outP);
    const RW = 1780, RH = 190, PERIM = 2 * (RW + RH) - 8 * 95 + 2 * Math.PI * 95;

    return (
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outP }}>
        {/* center mark */}
        <div style={{
          position: 'absolute', left: 960, top: 545, zIndex: 50,
          transform: `translate(-50%,-50%) scale(${lerp(0.7, 1, inP) * lerp(1, 0.62, toRow)})`,
          opacity: inP,
        }}>
          <MarkS t={t} size={200} amp={0.32} speed={5} breathe={0.05} />
        </div>

        {/* channels: orbit → clean row */}
        {CHANNELS.map((c, i) => {
          const th = t * 2.0 + (i / CHANNELS.length) * Math.PI * 2;
          const z = (Math.sin(th) + 1) / 2;
          const ox = 960 + Math.cos(th) * 620, oy = 545 + Math.sin(th) * 175 * 0.62 + z * 26;
          const x = lerp(ox, 960 + ROW_X[i] * 0.92, toRow);
          const y = lerp(oy, 545, toRow);
          const sc = lerp(lerp(0.6, 1.02, z), 0.82, toRow) * lerp(0.5, 1, orbitIn);
          return (
            <div key={i} style={{
              position: 'absolute', left: x, top: y, zIndex: Math.round(20 + z * 25),
              transform: `translate(-50%,-50%) scale(${sc})`,
              opacity: orbitIn * lerp(lerp(0.4, 1, z), 1, toRow),
              filter: `blur(${(1 - z) * 2.4 * (1 - toRow)}px)`,
            }}>
              <Pill label={c.l} dot={c.d} />
            </div>
          );
        })}

        {/* enclosure pill draws around the row */}
        {encO > 0 && (
          <svg width={RW} height={RH} viewBox={`0 0 ${RW} ${RH}`} style={{
            position: 'absolute', left: 960, top: 545, transform: 'translate(-50%,-50%)',
            zIndex: 40, opacity: encO, overflow: 'visible',
          }}>
            <rect x="3" y="3" width={RW - 6} height={RH - 6} rx={(RH - 6) / 2} fill="none"
              stroke={INK} strokeWidth="3"
              strokeDasharray={PERIM} strokeDashoffset={PERIM * (1 - drawP)} />
          </svg>
        )}

        {/* real compliance badges */}
        {BADGES.map((b, i) => {
          const p = seg(t, 10.05 + i * 0.1, 10.45 + i * 0.1, E.easeOutQuart);
          if (p <= 0) return null;
          return (
            <img key={i} src={b.src} alt="" style={{
              position: 'absolute', left: 960 + (i - 1) * 260, top: lerp(905, 878, p), zIndex: 45,
              height: b.h, transform: 'translate(-50%,-50%)',
              opacity: p * (1 - outP),
            }} />
          );
        })}

        <Rise at={8.55} y={880} size={94} out={9.4}>Ten channels. One Kira.</Rise>
        <Slam at={10.0} y={252} size={104} out={10.52}>Governed.</Slam>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCENE E (10.85–13.5) · wall of marks → wordmark
  // ════════════════════════════════════════════════════════════════
  const GROWS = 5, GCOLS = 9, GS = 210;

  function SceneE() {
    const t = useTime();
    const cam = zlerp([10.78, 11.9], [6.4, 1.0], E.easeInOutQuart)(t);
    const gridIn = seg(t, 10.75, 11.1, E.easeOutCubic);
    const gridOut = seg(t, 11.82, 12.22, E.easeInOutCubic);

    const wm = seg(t, 12.0, 12.35, E.easeOutCubic);
    const markSpring = seg(t, 12.05, 12.6, E.easeOutBack);

    const fadeOut = seg(t, 13.14, 13.5, E.easeInOutQuad);

    const letter = { display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' };
    const L = (ch, at, i) => {
      const p = seg(t, at, at + 0.45, E.easeOutQuart);
      return (
        <span key={i} style={letter}>
          <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 115}%)` }}>{ch}</span>
        </span>
      );
    };

    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* the wall — airy on white */}
        {gridOut < 1 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 5,
            transform: `scale(${cam})`, transformOrigin: '50% 50%',
            opacity: gridIn * (1 - gridOut),
            filter: gridOut > 0 ? `blur(${gridOut * 20}px)` : 'none',
          }}>
            {Array.from({ length: GROWS }).map((_, r) =>
              Array.from({ length: GCOLS }).map((_, c) => {
                const x = 960 + (c - (GCOLS - 1) / 2) * GS;
                const y = 545 + (r - (GROWS - 1) / 2) * GS;
                const ph = rnd(r * 13 + c * 29) * 6;
                const tw = 0.3 + 0.45 * Math.abs(Math.sin(t * 1.4 + ph));
                const center = r === 2 && c === 4;
                return (
                  <div key={r + '-' + c} style={{
                    position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)',
                    opacity: center ? 1 : tw,
                  }}>
                    <MarkS t={t} size={92} amp={0.55} speed={4.5} phase={ph} shadow={center ? 1 : 0} />
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* wordmark lockup — black */}
        {wm > 0 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, opacity: wm }}>
            <div style={{
              position: 'absolute', left: 960, top: 528, zIndex: 12, transform: 'translate(-50%,-50%)',
              display: 'flex', alignItems: 'center', gap: 26,
              fontSize: 208, fontWeight: 650, letterSpacing: '-0.05em', color: INK, lineHeight: 1,
            }}>
              <span style={{ whiteSpace: 'pre' }}>
                {['r', 'e', 'z'].map((ch, i) => L(ch, 12.12 + (2 - i) * 0.06, i))}
              </span>
              <div style={{ transform: `scale(${Math.max(0.001, markSpring)})` }}>
                <MarkS t={t} size={150} amp={t > 12.8 ? 0.8 : 0.18} speed={t > 12.8 ? 6.5 : 3} breathe={0.06} />
              </div>
              <span style={{ whiteSpace: 'pre' }}>
                {['n', 'a', 't', 'e'].map((ch, i) => L(ch, 12.32 + i * 0.06, i + 3))}
              </span>
            </div>
            <Rise at={12.66} y={738} size={50} weight={520} ls="-0.02em" color={GRAY}>
              Every conversation, handled.
            </Rise>
          </div>
        )}

        {/* fade to white for a seamless loop */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: '#FFFFFF', opacity: fadeOut, pointerEvents: 'none' }} />
      </div>
    );
  }

  // ── root ──────────────────────────────────────────────────────────
  function sceneName(t) {
    if (t < 3.95) return 'pulse → torrent';
    if (t < 5.95) return 'meet kira';
    if (t < 8.35) return 'live voice';
    if (t < 10.85) return 'channels → governed';
    return 'scale → wordmark';
  }

  function Film({ wave }) {
    const t = useTime();
    return (
      <div
        data-screen-label={`t=${Math.floor(t)}s · ${sceneName(t)}`}
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: '#FFFFFF',
          fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', system-ui, sans-serif",
        }}>
        <Sprite start={0} end={4.4}><SceneA /></Sprite>
        <Sprite start={3.95} end={6.0}><SceneB /></Sprite>
        <Sprite start={5.9} end={8.4}><SceneC wave={wave} /></Sprite>
        <Sprite start={8.3} end={10.9}><SceneD /></Sprite>
        <Sprite start={10.7} end={13.55}><SceneE /></Sprite>
      </div>
    );
  }

  function KiraBrandFilm({ wave = 'ink' }) {
    return (
      <Stage width={1920} height={1080} duration={13.5} background="#FFFFFF" persistKey="kirabrandfilm">
        <Film wave={wave} />
      </Stage>
    );
  }

  window.KiraBrandFilm = KiraBrandFilm;
})();
