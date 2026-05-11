import { useEffect, useState, useCallback } from 'react'
import { fetchStorico } from '../api'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import ComboBox from '../components/ComboBox'

const PAGE_SIZE = 50

const inputStyle = {
  background: '#060f08',
  border: '1px solid #0d2e15',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'rgba(255,255,255,0.85)',
  fontSize: 12,
  width: '100%',
  outline: 'none',
}

const cardStyle = {
  background: '#060f08',
  border: '1px solid #0d2e15',
  borderRadius: 12,
  padding: 20,
}

export default function StoricoPage() {
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [filters, setFilters]     = useState({ search: '', dateFrom: '', dateTo: '', codice: '' })
  const [pending, setPending]     = useState({ search: '', dateFrom: '', dateTo: '', codice: '' })

  const load = useCallback(() => {
    setLoading(true); setError(null)
    fetchStorico({ page, pageSize: PAGE_SIZE, ...filters })
      .then(r => { setData(r.data); setTotal(r.total) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, filters])

  useEffect(() => { load() }, [load])

  const apply = () => { setFilters(pending); setPage(1) }
  const reset = () => {
    const e = { search: '', dateFrom: '', dateTo: '', codice: '' }
    setPending(e); setFilters(e); setPage(1)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#5bb870' }}>view_storico_miscele_applicate</p>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.92)' }}>Storico Miscele Applicate</h1>
      </div>

      {/* Filtri */}
      <div style={cardStyle}>
        <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Filtri</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <ComboBox
              label="Ricerca libera"
              placeholder="Articolo, miscela, descrizione…"
              value={pending.search}
              onChange={v => setPending(p => ({ ...p, search: v }))}
              fetchUrl="/api/suggerimenti/storico-articoli"
              onEnter={apply}
            />
          </div>
          <div>
            <ComboBox
              label="Codice Articolo"
              placeholder="Codice…"
              value={pending.codice}
              onChange={v => setPending(p => ({ ...p, codice: v }))}
              fetchUrl="/api/suggerimenti/storico-articoli"
              onEnter={apply}
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Data produzione da</label>
            <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={pending.dateFrom}
              onChange={e => setPending(p => ({ ...p, dateFrom: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#5bb870'}
              onBlur={e => e.target.style.borderColor = '#0d2e15'} />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Data produzione a</label>
            <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={pending.dateTo}
              onChange={e => setPending(p => ({ ...p, dateTo: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#5bb870'}
              onBlur={e => e.target.style.borderColor = '#0d2e15'} />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={apply} style={{ background: '#5bb870', color: '#020c04', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Applica
          </button>
          <button onClick={reset} style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid #0d2e15', borderRadius: 8, padding: '8px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 12 }}>
          {error}
        </div>
      )}

      <div style={cardStyle}>
        {!loading && total > 0 && (
          <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {total.toLocaleString('it-IT')} righe trovate
          </p>
        )}
        <DataTable rows={data} loading={loading} />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>
    </div>
  )
}
