export function Orb({ src = 'assets/orb-spray.webp', size = 104, dim = false, live = false, call = false, style }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size, flex: '0 0 auto', ...style }}>
      <style>{'@keyframes rzorbrip{0%{opacity:.5;transform:scale(.92)}70%{opacity:.12}100%{opacity:0;transform:scale(1.5)}}@keyframes rzorbbr{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}'}</style>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'url(' + src + ') center/cover',
        opacity: dim ? .45 : 1, filter: dim ? 'saturate(.9)' : 'none',
        boxShadow: dim ? 'none' : '0 30px 60px -38px rgba(20,16,12,.42)',
        animation: live ? 'rzorbbr 6s ease-in-out infinite' : 'none' }} />
      {live && [0, 1.45].map((d, i) => (
        <span key={i} style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '1.5px solid rgba(62,210,126,.5)',
          opacity: 0, animation: 'rzorbrip 2.9s ease-out ' + d + 's infinite', pointerEvents: 'none' }} />
      ))}
      {call && (
        <span style={{ position: 'absolute', left: '50%', bottom: -12, transform: 'translateX(-50%)', width: Math.min(size * 0.42, 50), height: Math.min(size * 0.42, 50),
          borderRadius: '50%', display: 'grid', placeItems: 'center', padding: 3, boxSizing: 'border-box',
          background: 'conic-gradient(from 0deg,#B79DE8,#D9605A,#E2683E,#EFA12E,#B79DE8)',
          boxShadow: live ? '0 0 22px 3px rgba(62,210,126,.5)' : '0 8px 20px -6px rgba(20,16,12,.55)' }}>
          <span style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'grid', placeItems: 'center',
            background: live ? 'radial-gradient(circle at 50% 36%,#25C873,#11934E)' : '#141210' }}>
            <svg width={Math.min(size * 0.2, 20)} height={Math.min(size * 0.2, 20)} viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>
          </span>
        </span>
      )}
    </span>
  );
}