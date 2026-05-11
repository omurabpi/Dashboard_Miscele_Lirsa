import { useEffect, useState, useCallback } from 'react'
import { fetchStoricoRicette, fetchStoricoRicetteDettaglio } from '../api'
import Pagination from '../components/Pagination'
import ComboBox from '../components/ComboBox'

const PAGE_SIZE       = 50
const PAGE_SIZE_DET   = 100

const cardStyle = { background: '#060f08', border: '1px solid #0d2e15', borderRadius: 12, padding: 20 }
const thStyle   = { color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: '0.07em', padding: '10px 14px', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }
const tdStyle   = { padding: '8px 14px', fontSize: 11, color: 'rgba(255,255,255,0.78)', whiteSpace: 'nowrap' }

function fmt(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length < 8) return yyyymmdd ?? '—'
  return `${yyyymmdd.slice(6, 8)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(0, 4)}`
}

/* ─── gruppatura righe dettaglio per (giorno + lancio) ─── */
function groupDettaglio(rows) {
  const map = new Map()
  for (const r of rows) {
    const key = `${r.sma_giorno}||${r.sma_lancio_opt ?? ''}||${r.sma_macchina ?? ''}||${r.sma_estrusore ?? ''}`
    if (!map.has(key)) map.set(key, { giorno: r.sma_giorno, lancio: r.sma_lancio_opt, macchina: r.sma_macchina, estrusore: r.sma_estrusore, componenti: [] })
    map.get(key).componenti.push(r)
  }
  return Array.from(map.values())
}

export default function StoricoRicettePage() {
  // ── Filtri ────────────────────────────────────────────────────────────────
  const [pend, setPend]     = useState({ miscela: '', articolo: '', variante: '' })
  const [appl, setAppl]     = useState({ miscela: '', articolo: '', variante: '' })

  // ── Tabella raggruppata ────────────────────────────────────────────────────
  const [rows, setRows]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // ── Dettaglio ─────────────────────────────────────────────────────────────
  const [selected, setSelected]   = useState(null)   // { miscela, articolo, variante }
  const [detRows, setDetRows]     = useState([])
  const [detTotal, setDetTotal]   = useState(0)
  const [detPage, setDetPage]     = useState(1)
  const [detLoading, setDetLoading] = useState(false)
  const [detError, setDetError]   = useState(null)
  const [expandedKeys, setExpandedKeys] = useState(new Set())

  // ── Carica tabella raggruppata ─────────────────────────────────────────────
  const loadRicette = useCallback(() => {
    setLoading(true); setError(null)
    fetchStoricoRicette({ page, pageSize: PAGE_SIZE, ...appl })
      .then(r => { setRows(r.data); setTotal(r.total) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, appl])

  useEffect(() => { loadRicette() }, [loadRicette])

  // ── Carica dettaglio ───────────────────────────────────────────────────────
  const loadDettaglio = useCallback((sel, pg) => {
    setDetLoading(true); setDetError(null)
    fetchStoricoRicetteDettaglio({ miscela: sel.miscela, articolo: sel.articolo, variante: sel.variante, page: pg, pageSize: PAGE_SIZE_DET })
      .then(r => { setDetRows(r.data); setDetTotal(r.total) })
      .catch(e => setDetError(e.message))
      .finally(() => setDetLoading(false))
  }, [])

  useEffect(() => {
    if (selected) { loadDettaglio(selected, detPage) }
  }, [selected, detPage, loadDettaglio])

  const handleSelect = (row) => {
    const key = `${row.sma_miscela}||${row.sma_articolo}||${row.sma_variante}`
    if (selected && `${selected.miscela}||${selected.articolo}||${selected.variante}` === key) {
      setSelected(null); setDetRows([])
    } else {
      setSelected({ miscela: row.sma_miscela, articolo: row.sma_articolo, variante: row.sma_variante })
      setDetPage(1)
      setExpandedKeys(new Set())
    }
  }

  const apply = () => { setAppl({ ...pend }); setPage(1); setSelected(null); setDetRows([]) }
  const reset = () => {
    const e = { miscela: '', articolo: '', variante: '' }
    setPend(e); setAppl(e); setPage(1); setSelected(null); setDetRows([])
  }

  const groups = groupDettaglio(detRows)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#5bb870' }}>view_storico_miscele_applicate</p>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.92)' }}>Storico Applicazioni per Ricetta</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Raggruppamento Miscela × Articolo × Variante — clicca una riga per vedere tutte le applicazioni con i componenti
        </p>
      </div>

      {/* ── Filtri ── */}
      <div style={cardStyle}>
        <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Filtri</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ComboBox label="Miscela" placeholder="Codice miscela…" value={pend.miscela}
            onChange={v => setPend(p => ({ ...p, miscela: v }))}
            fetchUrl="/api/suggerimenti/storico-miscele" onEnter={apply} />
          <ComboBox label="Articolo" placeholder="Codice articolo…" value={pend.articolo}
            onChange={v => setPend(p => ({ ...p, articolo: v }))}
            fetchUrl="/api/suggerimenti/storico-articoli" onEnter={apply} />
          <ComboBox label="Variante" placeholder="Variante…" value={pend.variante}
            onChange={v => setPend(p => ({ ...p, variante: v }))}
            fetchUrl="/api/suggerimenti/storico-varianti" onEnter={apply} />
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
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 12 }}>{error}</div>
      )}

      {/* ── Tabella raggruppata ── */}
      <div style={cardStyle}>
        <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {total > 0 ? `${total.toLocaleString('it-IT')} combinazioni Miscela × Articolo × Variante` : 'Risultati'}
        </p>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #0d2e15' }}>
          <table className="min-w-full text-xs">
            <thead>
              <tr style={{ background: '#040d07', borderBottom: '1px solid #0d2e15' }}>
                <th style={thStyle}>Miscela</th>
                <th style={thStyle}>Articolo</th>
                <th style={thStyle}>Variante</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Applicazioni</th>
                <th style={thStyle}>Prima data</th>
                <th style={thStyle}>Ultima data</th>
                <th style={thStyle}>Macchine</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.25)' }}>
                  <span className="pulse-green">Caricamento…</span>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.25)' }}>Nessun risultato</td></tr>
              ) : rows.map((row, i) => {
                const key = `${row.sma_miscela}||${row.sma_articolo}||${row.sma_variante}`
                const isSelected = selected && `${selected.miscela}||${selected.articolo}||${selected.variante}` === key
                return (
                  <tr key={i} onClick={() => handleSelect(row)}
                    style={{
                      background: isSelected ? 'rgba(91,184,112,0.12)' : i % 2 === 0 ? '#060f08' : '#070e09',
                      borderBottom: '1px solid #0a1c0d',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(91,184,112,0.06)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? '#060f08' : '#070e09' }}
                  >
                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#5bb870', fontWeight: 700 }}>{row.sma_miscela}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{row.sma_articolo}</td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)' }}>{row.sma_variante || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', color: '#f5c842' }}>{Number(row.n_applicazioni).toLocaleString('it-IT')}</td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)' }}>{fmt(row.prima_data)}</td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)' }}>{fmt(row.ultima_data)}</td>
                    <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.45)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.macchine || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={p => { setPage(p); setSelected(null); setDetRows([]) }} />
      </div>

      {/* ── Pannello dettaglio ── */}
      {selected && (
        <div style={{ ...cardStyle, borderColor: '#1a4a25', borderTopWidth: 3, borderTopColor: '#5bb870' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Dettaglio applicazioni</p>
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Miscela <span style={{ color: '#5bb870', fontFamily: 'monospace' }}>{selected.miscela}</span>
                {' → '} Articolo <span style={{ color: '#f5c842', fontFamily: 'monospace' }}>{selected.articolo}</span>
                {selected.variante && <> · Variante <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>{selected.variante}</span></>}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{detTotal.toLocaleString('it-IT')} righe componente</p>
            </div>
            <button onClick={() => { setSelected(null); setDetRows([]) }}
              style={{ background: 'transparent', border: '1px solid #0d2e15', borderRadius: 8, padding: '5px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 10, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Chiudi
            </button>
          </div>

          {detLoading && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }} className="pulse-green">Caricamento…</p>}
          {detError  && <p style={{ color: '#f87171', fontSize: 12 }}>{detError}</p>}

          {!detLoading && !detError && groups.map((g, gi) => {
            const gKey = `${g.giorno}||${g.lancio}||${g.macchina}||${g.estrusore}`
            const expanded = expandedKeys.has(gKey)
            return (
              <div key={gi} style={{ marginBottom: 8, border: '1px solid #0d2e15', borderRadius: 10, overflow: 'hidden' }}>
                {/* header gruppo */}
                <button onClick={() => setExpandedKeys(prev => {
                  const next = new Set(prev)
                  expanded ? next.delete(gKey) : next.add(gKey)
                  return next
                })}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: '#040d07', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                    <path d="M3 2L7 5L3 8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#5bb870', fontWeight: 700 }}>{fmt(g.giorno)}</span>
                  {g.lancio != null && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Lancio {g.lancio}</span>}
                  {g.macchina && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>· {g.macchina}</span>}
                  {g.estrusore && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Estr. {g.estrusore}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{g.componenti.length} comp.</span>
                </button>

                {/* tabella componenti */}
                {expanded && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr style={{ background: '#040d07', borderBottom: '1px solid #0d2e15' }}>
                          <th style={thStyle}>Componente</th>
                          <th style={thStyle}>Cod. Fornitore</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>Quantità (kg)</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>% comp.</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>% estr.</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>Costo uni.</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>Costo listino</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.componenti.map((c, ci) => (
                          <tr key={ci} style={{ background: ci % 2 === 0 ? '#060f08' : '#070e09', borderBottom: '1px solid #0a1c0d' }}>
                            <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#f5c842' }}>{c.sma_componente || '—'}</td>
                            <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.45)' }}>{c.sma_codice_componente_fornitore || '—'}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>{c.sma_quantita != null ? Number(c.sma_quantita).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', color: 'rgba(255,255,255,0.55)' }}>{c.sma_percentuale != null ? Number(c.sma_percentuale).toFixed(2) + '%' : '—'}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>{c.sma_percentuale_estrusore != null ? Number(c.sma_percentuale_estrusore).toFixed(2) + '%' : '—'}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>{c.sma_costo_uni != null ? Number(c.sma_costo_uni).toLocaleString('it-IT', { minimumFractionDigits: 4 }) : '—'}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>{c.sma_costo_listino_attivo != null ? Number(c.sma_costo_listino_attivo).toLocaleString('it-IT', { minimumFractionDigits: 4 }) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}

          {!detLoading && !detError && groups.length > 0 && (
            <Pagination page={detPage} pageSize={PAGE_SIZE_DET} total={detTotal} onChange={setDetPage} />
          )}
        </div>
      )}
    </div>
  )
}
