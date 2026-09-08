export function Eyebrow({ children, onDark = false, kicker = false, style }) {
  if (kicker) return <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: onDark ? 'rgba(255,255,255,.42)' : 'var(--ink-3)', ...style }}>{children}</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
    color: onDark ? 'rgba(255,255,255,.7)' : 'var(--ink-2)',
    background: onDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.05)',
    padding: '7px 14px', borderRadius: 11, ...style }}>{children}</span>;
}