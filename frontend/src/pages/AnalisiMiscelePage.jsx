import { useEffect, useState, useCallback } from 'react'
import { fetchAnalisiMisceleFiltri, fetchAnalisiMiscele, fetchAnalisiDettaglio } from '../api'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'

const PAGE_SIZE_MISCELE  = 100
const PAGE_SIZE_DETTAGLIO = 50

// label mapping condiviso con DataTable
const LABELS = {
  Codice_Univoco_Ricetta: 'Ricetta', sma_articolo: 'Articolo', Categoria_Articolo: 'Categoria',
  Gruppo_Articolo: 'Gruppo', sma_macchina: 'Macchina', Numero_Strati: 'Strati',
  Data_Primo_Utilizzo: 'Prima utilizz.', Data_Ultimo_Utilizzo: 'Ultima utilizz.',
  Combinazione_Piu_Utilizzata: 'Comb. più usata', Componente_Pilota: 'Comp. pilota',
  Categoria_Pilota: 'Cat. pilota', Codice_Fornitore_Piu_Usato: 'Fornitore',
  Volte_Utilizzata: 'Utilizzi', Quantita_Totale_Kg: 'Kg totali',
  _Giorno_Riferimento: 'Giorno rif.', _Miscela_Riferimento: 'Miscela',
}
const NUM_COLS_ANALISI = new Set(['Volte_Utilizzata','Quantita_Totale_Kg','Numero_Strati'])

export default function AnalisiMiscelePage() {
  // ── Dropdown options ──────────────────────────────────────────────────────
  const [filtriOptions, setFiltriOptions] = useState({ articoli: [], macchine: [], varianti: [] })
  const [filtriLoading, setFiltriLoading] = useState(true)

  // ── Filtri attivi ─────────────────────────────────────────────────────────
  const [sel, setSel] = useState({ codArticolo: '', codMacchina: '', variante: '' })
  const [applied, setApplied] = useState({ codArticolo: '', codMacchina: '', variante: '' })

  // ── Tabella miscele ───────────────────────────────────────────────────────
  const [miscele, setMiscele] = useState([])
  const [misceleTotal, setMisceleTotal] = useState(0)
  const [miscelePage, setMiscelePage] = useState(1)
  const [misceleLoading, setMisceleLoading] = useState(false)
  const [misceleError, setMisceleError] = useState(null)

  // ── Dettaglio miscela selezionata ─────────────────────────────────────────
  const [selectedMiscela, setSelectedMiscela] = useState(null)
  const [dettaglio, setDettaglio] = useState([])
  const [dettaglioTotal, setDettaglioTotal] = useState(0)
  const [dettaglioPage, setDettaglioPage] = useState(1)
  const [dettaglioLoading, setDettaglioLoading] = useState(false)
  const [dettaglioError, setDettaglioError] = useState(null)

  // ── Carica opzioni dropdown ───────────────────────────────────────────────
  useEffect(() => {
    setFiltriLoading(true)
    fetchAnalisiMisceleFiltri()
      .then(d => setFiltriOptions(d))
      .catch(err => console.error(err))
      .finally(() => setFiltriLoading(false))
  }, [])

  // ── Carica tabella miscele ────────────────────────────────────────────────
  const loadMiscele = useCallback(() => {
    setMisceleLoading(true)
    setMisceleError(null)
    fetchAnalisiMiscele({ ...applied, page: miscelePage, pageSize: PAGE_SIZE_MISCELE })
      .then(r => { setMiscele(r.data); setMisceleTotal(r.total) })
      .catch(err => setMisceleError(err.message))
      .finally(() => setMisceleLoading(false))
  }, [applied, miscelePage])

  useEffect(() => { loadMiscele() }, [loadMiscele])

  // ── Carica dettaglio quando si seleziona una miscela ──────────────────────
  const loadDettaglio = useCallback((miscelaRif, page) => {
    setDettaglioLoading(true)
    setDettaglioError(null)
    fetchAnalisiDettaglio({ miscelaRif, page, pageSize: PAGE_SIZE_DETTAGLIO })
      .then(r => { setDettaglio(r.data); setDettaglioTotal(r.total) })
      .catch(err => setDettaglioError(err.message))
      .finally(() => setDettaglioLoading(false))
  }, [])

  useEffect(() => {
    if (selectedMiscela) loadDettaglio(selectedMiscela, dettaglioPage)
  }, [selectedMiscela, dettaglioPage, loadDettaglio])

  const applyFilters = () => {
    setApplied({ ...sel })
    setMiscelePage(1)
    setSelectedMiscela(null)
    setDettaglio([])
  }

  const resetFilters = () => {
    const empty = { codArticolo: '', codMacchina: '', variante: '' }
    setSel(empty)
    setApplied(empty)
    setMiscelePage(1)
    setSelectedMiscela(null)
    setDettaglio([])
  }

  const handleSelectMiscela = (miscelaRif) => {
    setSelectedMiscela(miscelaRif)
    setDettaglioPage(1)
  }

  // Colonne da mostrare nella tabella miscele (con clic su _Miscela_Riferimento)
  const renderMisceleTable = () => {
    if (misceleLoading) return <LoadingRow />
    if (misceleError) return <ErrorRow msg={misceleError} />
    if (!miscele.length) return <EmptyRow />

    const allCols = Object.keys(miscele[0])
    const miscelaCol = allCols.find(c => c === '_Miscela_Riferimento' || c === 'Miscela_Riferimento')
    const cols = miscelaCol
      ? [allCols[0], miscelaCol, ...allCols.slice(1).filter(c => c !== miscelaCol)]
      : allCols

    return (
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #0d2e15' }}>
        <table className="min-w-full text-xs">
          <thead>
            <tr style={{ background: '#040d07', borderBottom: '1px solid #0d2e15' }}>
              {cols.map(c => (
                <th key={c} className="px-4 py-3 font-bold uppercase whitespace-nowrap"
                  style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: '0.07em', textAlign: NUM_COLS_ANALISI.has(c) ? 'right' : 'left' }}>
                  {LABELS[c] ?? c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {miscele.map((row, i) => {
              const miscelaRif = row['_Miscela_Riferimento'] ?? row['Miscela_Riferimento'] ?? row['cod_miscela'] ?? null
              const isSelected = miscelaRif && selectedMiscela === String(miscelaRif)
              return (
                <tr
                  key={i}
                  onClick={() => miscelaRif && handleSelectMiscela(String(miscelaRif))}
                  style={{
                    background: isSelected ? 'rgba(91,184,112,0.12)' : i % 2 === 0 ? '#060f08' : '#070e09',
                    borderBottom: '1px solid #0a1c0d',
                    cursor: 'pointer',
                    outline: isSelected ? '1px solid #3a7a4a' : 'none',
                  }}
                  onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(91,184,112,0.06)' }}
                  onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? '#060f08' : '#070e09' }}
                >
                  {cols.map(c => {
                    const isMiscelaCol = c === '_Miscela_Riferimento' || c === 'Miscela_Riferimento'
                    const isArticoloCol = c === 'sma_articolo'
                    const isNum = NUM_COLS_ANALISI.has(c)
                    const raw = row[c]
                    let display
                    if (raw === null || raw === undefined) display = <span style={{ color: 'rgba(255,255,255,0.12)' }}>—</span>
                    else if (isNum) display = Number(raw).toLocaleString('it-IT', { minimumFractionDigits: c === 'Quantita_Totale_Kg' ? 1 : 0, maximumFractionDigits: c === 'Quantita_Totale_Kg' ? 1 : 0 })
                    else display = String(raw)
                    return (
                      <td key={c}
                        className="px-4 py-2.5 whitespace-nowrap max-w-xs truncate font-mono"
                        style={{
                          color: isMiscelaCol ? '#5bb870' : isArticoloCol ? '#f5c842' : 'rgba(255,255,255,0.75)',
                          fontSize: 11,
                          fontWeight: isMiscelaCol || isArticoloCol ? 700 : 400,
                          textDecoration: isMiscelaCol ? 'underline dotted' : 'none',
                          textAlign: isNum ? 'right' : 'left',
                        }}
                        title={String(raw ?? '')}
                      >
                        {display}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const selectStyle = {
    background: '#060f08', border: '1px solid #0d2e15', borderRadius: 8,
    padding: '8px 12px', color: 'rgba(255,255,255,0.85)', fontSize: 12,
    width: '100%', outline: 'none', appearance: 'none', cursor: 'pointer',
  }
  const cardStyle = {
    background: '#060f08', border: '1px solid #0d2e15', borderRadius: 12, padding: 20,
  }
  const btnPrimary = {
    background: '#5bb870', color: '#020c04', border: 'none', borderRadius: 8,
    padding: '8px 18px', fontSize: 11, fontWeight: 800,
    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
  }
  const btnSecondary = {
    background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid #0d2e15',
    borderRadius: 8, padding: '8px 18px', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#5bb870' }}>
          view_analisi_storico_miscele_materie_prime_piu_usate
        </p>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.92)' }}>Analisi Miscele</h1>
      </div>

      {/* Filtri */}
      <div style={cardStyle}>
        {filtriLoading ? (
          <div className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Caricamento filtri…</div>
        ) : (
          <>
            <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Filtri</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Articolo</label>
                <select style={selectStyle} value={sel.codArticolo}
                  onChange={e => setSel(p => ({ ...p, codArticolo: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#5bb870'}
                  onBlur={e => e.target.style.borderColor = '#0d2e15'}>
                  <option value="" style={{ background: '#060f08' }}>— Tutti —</option>
                  {filtriOptions.articoli.map(a => (
                    <option key={a.cod_articolo} value={a.cod_articolo} style={{ background: '#060f08' }}>
                      {a.cod_articolo}{a.des_articolo ? ` – ${a.des_articolo}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Macchina</label>
                <select style={selectStyle} value={sel.codMacchina}
                  onChange={e => setSel(p => ({ ...p, codMacchina: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#5bb870'}
                  onBlur={e => e.target.style.borderColor = '#0d2e15'}>
                  <option value="" style={{ background: '#060f08' }}>— Tutte —</option>
                  {filtriOptions.macchine.map(m => (
                    <option key={m.cod_macchina} value={m.cod_macchina} style={{ background: '#060f08' }}>{m.cod_macchina}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Variante</label>
                <select style={selectStyle} value={sel.variante}
                  onChange={e => setSel(p => ({ ...p, variante: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#5bb870'}
                  onBlur={e => e.target.style.borderColor = '#0d2e15'}>
                  <option value="" style={{ background: '#060f08' }}>— Tutte —</option>
                  {filtriOptions.varianti.map(v => (
                    <option key={v.variante} value={v.variante} style={{ background: '#060f08' }}>{v.variante}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={applyFilters} style={btnPrimary}>Applica filtri</button>
              <button onClick={resetFilters} style={btnSecondary}>Reset</button>
            </div>
          </>
        )}
      </div>

      {/* Tabella miscele */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>Risultati</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Miscele trovate
              {misceleTotal > 0 && (
                <span className="ml-2 font-mono" style={{ color: '#5bb870' }}>{misceleTotal.toLocaleString('it-IT')}</span>
              )}
            </p>
          </div>
          {selectedMiscela && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(91,184,112,0.12)', color: '#5bb870', border: '1px solid #0d2e15' }}>
              Selezionata: {selectedMiscela}
            </span>
          )}
        </div>
        <p className="text-[9px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
          ↑ Clicca su una riga per vedere il dettaglio storico
        </p>
        {renderMisceleTable()}
        <Pagination page={miscelePage} pageSize={PAGE_SIZE_MISCELE} total={misceleTotal} onChange={setMiscelePage} />
      </div>

      {/* Dettaglio storico */}
      {selectedMiscela && (
        <div style={{ ...cardStyle, borderColor: '#1a4a25', borderTop: '2px solid #5bb870' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: 3, height: 32, background: '#5bb870', borderRadius: 4, flexShrink: 0 }} />
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>view_storico_miscele_applicate</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Storico applicazioni – Miscela{' '}
                <span style={{ color: '#5bb870', fontFamily: 'monospace' }}>{selectedMiscela}</span>
              </p>
            </div>
            <button
              onClick={() => { setSelectedMiscela(null); setDettaglio([]) }}
              className="ml-auto"
              style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              onMouseOver={e => e.currentTarget.style.color = '#f87171'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {dettaglioError && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 12, marginBottom: 12 }}>
              {dettaglioError}
            </div>
          )}

          <DataTable rows={dettaglio} loading={dettaglioLoading} />
          <Pagination page={dettaglioPage} pageSize={PAGE_SIZE_DETTAGLIO} total={dettaglioTotal} onChange={setDettaglioPage} />
        </div>
      )}
    </div>
  )
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center py-16 text-xs uppercase tracking-widest font-semibold"
      style={{ color: 'rgba(255,255,255,0.3)' }}>
      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Caricamento…
    </div>
  )
}

function ErrorRow({ msg }) {
  return (
    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 12 }}>
      {msg}
    </div>
  )
}

function EmptyRow() {
  return (
    <div className="text-center py-16 text-xs uppercase tracking-widest font-semibold"
      style={{ color: 'rgba(255,255,255,0.2)' }}>
      Nessun dato. Applica i filtri e clicca &ldquo;Applica filtri&rdquo;.
    </div>
  )
}
