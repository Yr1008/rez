export function GlassCard({ label, meta, children, width = 300, style }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '18px 20px', width,
      background: 'linear-gradient(160deg,rgba(9,9,12,.64),rgba(9,9,12,.48))',
      backdropFilter: 'blur(22px) saturate(140%)', WebkitBackdropFilter: 'blur(22px) saturate(140%)',
      border: '1px solid rgba(255,255,255,.09)', boxShadow: '0 30px 60px -30px rgba(0,0,0,.7)',
      fontFamily: 'var(--sans)', color: '#fff', ...style }}>
      {(label || meta) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
          {label && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase' }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--grad-text)', boxShadow: '0 0 0 4px rgba(217,96,90,.22)' }} />{label}</span>}
          {meta && <span style={{ fontSize: 11, color: 'rgba(255,255,255,.62)' }}>{meta}</span>}
        </div>
      )}
      {children}
    </div>
  );
}