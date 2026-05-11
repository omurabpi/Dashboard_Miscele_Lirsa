const VARIANTS = {
  green:  { border: '#0d2e15', topBorder: '#5bb870', label: 'rgba(255,255,255,0.4)', value: '#5bb870', glow: 'rgba(91,184,112,0.08)' },
  amber:  { border: '#2e2200', topBorder: '#f5c842', label: 'rgba(255,255,255,0.4)', value: '#f5c842', glow: 'rgba(245,200,66,0.08)' },
  blue:   { border: '#0d1f2e', topBorder: '#38bdf8', label: 'rgba(255,255,255,0.4)', value: '#38bdf8', glow: 'rgba(56,189,248,0.08)' },
  purple: { border: '#1e0d2e', topBorder: '#a855f7', label: 'rgba(255,255,255,0.4)', value: '#a855f7', glow: 'rgba(168,85,247,0.08)' },
}

export default function KpiCard({ label, value, variant = 'green', icon }) {
  const v = VARIANTS[variant] || VARIANTS.green
  return (
    <div
      style={{
        background: `linear-gradient(135deg, #060f08 0%, ${v.glow} 100%)`,
        border: `1px solid ${v.border}`,
        borderTop: `2px solid ${v.topBorder}`,
        borderRadius: 12,
        padding: '20px 22px',
      }}
      className="flex items-center gap-4"
    >
      {icon && (
        <div
          style={{ fontSize: 28, lineHeight: 1, filter: 'grayscale(0.2)' }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div
          className="text-3xl font-black font-mono leading-none tracking-tight"
          style={{ color: v.value }}
        >
          {value ?? '—'}
        </div>
        <div
          className="text-[10px] uppercase tracking-widest font-semibold mt-1.5 truncate"
          style={{ color: v.label }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
