export function Button({ variant = 'dark', size = 'md', children, arrow = false, href, onClick, style }) {
  const base = {
    position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 9, whiteSpace: 'nowrap', borderRadius: 999, fontFamily: 'var(--sans)', fontWeight: 600,
    textDecoration: 'none', cursor: 'pointer', border: 'none',
    transition: 'transform .5s var(--ease-btn), box-shadow .5s var(--ease-btn), background .35s ease',
    height: size === 'hero' ? 48 : size === 'sm' ? 36 : 44,
    minWidth: size === 'hero' ? 178 : 0,
    padding: size === 'sm' ? '0 16px' : '0 26px',
    fontSize: size === 'sm' ? 13.5 : 14.5, letterSpacing: '-.01em'
  };
  const variants = {
    dark:  { background: 'var(--ink)', color: '#fff' },
    white: { background: '#fff', color: 'var(--ink)', boxShadow: 'var(--shadow-btn)' },
    glass: { background: 'rgba(255,255,255,.14)', color: '#fff', border: '1px solid var(--line-d)', backdropFilter: 'blur(20px) saturate(160%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3)' },
    glow:  { color: '#fff', border: '1.5px solid transparent', background: 'linear-gradient(var(--ink),var(--ink)) padding-box, conic-gradient(from 140deg,#EFA12E,#E2683E,#D9605A,#B79DE8,#EFA12E) border-box', boxShadow: '0 8px 26px -14px rgba(240,140,60,.5)' }
  };
  const [hover, setHover] = React.useState(false);
  const hoverFx = hover ? (variant === 'white' ? { transform: 'translateY(-2px) scale(1.02)' } : variant === 'glass' ? { background: 'rgba(255,255,255,.22)' } : variant === 'dark' ? { background: '#2A2620' } : { boxShadow: '0 0 22px 2px rgba(176,106,217,.45), 0 12px 32px -10px rgba(240,140,60,.7)' }) : {};
  const Tag = href ? 'a' : 'button';
  return (
    <Tag href={href} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...hoverFx, ...style }}>
      {children}
      {arrow && <span style={{ transition: 'transform .25s', transform: hover ? 'translateX(4px)' : 'none' }}>→</span>}
    </Tag>
  );
}