export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const delta = 2
  const pages = []
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i)
  }

  const btnBase = {
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid #0d2e15',
    background: 'transparent',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    transition: 'all 0.15s',
  }

  return (
    <div className="flex items-center gap-1.5 justify-end mt-4">
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '0.05em', marginRight: 8 }}>
        {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total).toLocaleString('it-IT')} / {total.toLocaleString('it-IT')}
      </span>

      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={{ ...btnBase, opacity: page === 1 ? 0.3 : 1 }}
        onMouseOver={e => { if (page !== 1) e.currentTarget.style.borderColor = '#5bb870'; e.currentTarget.style.color = '#5bb870' }}
        onMouseOut={e => { e.currentTarget.style.borderColor = '#0d2e15'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
      >
        ‹
      </button>

      {pages[0] > 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>…</span>}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            ...btnBase,
            background: p === page ? '#5bb870' : 'transparent',
            color: p === page ? '#020c04' : 'rgba(255,255,255,0.4)',
            borderColor: p === page ? '#5bb870' : '#0d2e15',
            fontWeight: p === page ? 800 : 600,
          }}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>…</span>}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        style={{ ...btnBase, opacity: page === totalPages ? 0.3 : 1 }}
        onMouseOver={e => { if (page !== totalPages) e.currentTarget.style.borderColor = '#5bb870'; e.currentTarget.style.color = '#5bb870' }}
        onMouseOut={e => { e.currentTarget.style.borderColor = '#0d2e15'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
      >
        ›
      </button>
    </div>
  )
}
