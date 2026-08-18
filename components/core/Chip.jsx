export function Chip({ children, on = false, onClick, onDark = false, style }) {
  const [hover, setHover] = React.useState(false);
  const base = { display: 'inline-flex', alignItems: 'center', gap: 7, cursor: onClick ? 'pointer' : 'default',
    fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, borderRadius: 999, padding: '8px 15px',
    transition: 'all .25s ease', border: '1px solid' };
  const light = on ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }
    : { background: 'transparent', color: hover ? 'var(--ink)' : 'var(--ink-2)', borderColor: hover ? 'var(--ink)' : 'rgba(20,18,14,.18)' };
  const dark = on ? { background: '#fff', color: 'var(--ink)', borderColor: '#fff' }
    : { background: 'rgba(255,255,255,.14)', color: '#fff', borderColor: 'rgba(255,255,255,.26)' };
  return <span onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    style={{ ...base, ...(onDark ? dark : light), ...style }}>{children}</span>;
}