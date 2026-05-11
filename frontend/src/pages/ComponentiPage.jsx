import { useEffect, useState, useCallback } from 'react'
import { fetchComponenti } from '../api'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import ComboBox from '../components/ComboBox'

const PAGE_SIZE = 50

const inputStyle = {
  background: '#060f08', border: '1px solid #0d2e15', borderRadius: 8,
  padding: '8px 12px', color: 'rgba(255,255,255,0.85)', fontSize: 12,
  width: '100%', outline: 'none',
}
const cardStyle = {
  background: '#060f08', border: '1px solid #0d2e15', borderRadius: 12, padding: 20,
}

export default function ComponentiPage() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [codArt, setCodArt]     = useState('')
  const [applSearch, setApplSearch] = useState('')
  const [applCod, setApplCod]   = useState('')

  const load = useCallback(() => {
    setLoading(true); setError(null)
    fetchComponenti({ page, pageSize: PAGE_SIZE, search: applSearch, codArticolo: applCod })
      .then(r => { setData(r.data); setTotal(r.total) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, applSearch, applCod])

  useEffect(() => { load() }, [load])

  const apply = () => { setApplSearch(search); setApplCod(codArt); setPage(1) }
  const reset = () => {
    setSearch(''); setCodArt('')
    setApplSearch(''); setApplCod('')
    setPage(1)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#5bb870' }}>view_alyante_ana_articoli_filtri_componenti</p>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.92)' }}>Componenti Articoli</h1>
      </div>

      <div style={cardStyle}>
        <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Filtri</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <ComboBox
              label="Ricerca libera"
              placeholder="Articolo, componente, descrizione…"
              value={search}
              onChange={setSearch}
              fetchUrl="/api/suggerimenti/componenti-desc"
              onEnter={apply}
            />
          </div>
          <div>
            <ComboBox
              label="Codice Articolo (esatto)"
              placeholder="Filtra per cod_articolo…"
              value={codArt}
              onChange={setCodArt}
              fetchUrl="/api/suggerimenti/componenti-codart"
              onEnter={apply}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={apply} style={{ background: '#5bb870', color: '#020c04', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Cerca</button>
          <button onClick={reset} style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid #0d2e15', borderRadius: 8, padding: '8px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Reset</button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 12 }}>{error}</div>
      )}

      <div style={cardStyle}>
        <DataTable rows={data} loading={loading} />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>
    </div>
  )
}
