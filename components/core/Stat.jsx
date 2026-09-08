export function Stat({ value, label, onDark = false, style }) {
  return (
    <div style={{ fontFamily: 'var(--sans)', ...style }}>
      <div style={{ fontSize: 'clamp(40px,3.4vw,56px)', fontWeight: 700, letterSpacing: '-.04em', lineHeight: 1,
        color: onDark ? '#fff' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ marginTop: 9, fontSize: 12.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase',
        color: onDark ? 'rgba(255,255,255,.72)' : 'var(--ink-3)' }}>{label}</div>
    </div>
  );
}