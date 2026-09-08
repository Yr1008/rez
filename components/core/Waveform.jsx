export function Waveform({ bars = 13, height = 44, animate = true, mono = false, style }) {
  const palette = mono ? ['rgba(255,255,255,.85)'] : ['#B79DE8', '#D9605A', '#E2683E', '#EFA12E', '#F4CE7A', 'rgba(255,255,255,.7)'];
  const hs = Array.from({ length: bars }, (_, i) => 30 + Math.abs(Math.sin(i * 2.4)) * 62);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height, ...style }}>
      <style>{'@keyframes rzwvb{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(1)}}'}</style>
      {hs.map((h, i) => (
        <span key={i} style={{ display: 'block', width: 6, height: h + '%', borderRadius: 99,
          background: palette[i % palette.length], transformOrigin: 'center',
          animation: animate ? 'rzwvb ' + (0.9 + (i % 5) * 0.18) + 's ease-in-out ' + (-i * 0.13) + 's infinite' : 'none' }} />
      ))}
    </span>
  );
}