// ── Label mapping: colonna DB → etichetta leggibile ─────────────────────────
const LABELS = {
  // storico miscele applicate
  sma_id:                          'ID',
  sma_giorno:                      'Data',
  sma_miscela:                     'Miscela',
  sma_lancio_opt:                  'Lancio',
  sma_gruppo:                      'Gruppo',
  sma_articolo:                    'Articolo',
  sma_variante:                    'Variante',
  sma_ordine_rigo_key:             'Ordine/Rigo',
  sma_numreg_rigo_key:             'Num. Reg.',
  sma_macchina:                    'Macchina',
  sma_estrusore:                   'Estrusore',
  sma_fonte:                       'Fonte',
  sma_componente:                  'Componente',
  sma_quantita:                    'Quantità (kg)',
  sma_percentuale:                 '% comp.',
  sma_percentuale_estrusore:       '% estr.',
  sma_codice_componente_fornitore: 'Cod. Fornitore',
  sma_costo_uni:                   'Costo uni.',
  sma_costo_listino_attivo:        'Costo listino',
  // articoli
  MG66_CODART:                     'Codice',
  MG66_FAM_MG53:                   'Cod. Fam.',
  MG53_DESCRFAM:                   'Famiglia',
  MG66_SFAM_MG54:                  'Cod. Sottofam.',
  MG54_DESCRSFAM:                  'Sottofamiglia',
  MG66_GRUPPO_MG55:                'Cod. Gruppo',
  MG55_DESCRGRUPPO:                'Gruppo',
  MG66_SGRUPPO_MG56:               'Cod. Sottogr.',
  MG56_DESCRSGRUPPO:               'Sottogruppo',
  MG66_MARCA_MG64:                 'Marca',
  MG66_GRUSTAT1_MG74:              'GrStat1',
  MG74_DESGRUSTAT1:                'Stat1',
  MG66_GRUSTAT2_MG75:              'GrStat2',
  MG75_DESGRUSTAT2:                'Stat2',
  MG66_GRUSTAT3_MG76:              'GrStat3',
  MG76_DESGRUSTAT3:                'Stat3',
  MG66_GRUSTAT4_MG77:              'GrStat4',
  MG77_DESGRUSTAT4:                'Stat4',
  MG66_GUID:                       'GUID',
  // componenti
  MG87_DESCART:                    'Descrizione',
  combo:                           'Combinazione',
  cod_fam:                         'Cod. Famiglia',
  // analisi miscele
  Codice_Univoco_Ricetta:          'Ricetta',
  Categoria_Articolo:              'Categoria',
  Gruppo_Articolo:                 'Gruppo',
  Numero_Strati:                   'Strati',
  Data_Primo_Utilizzo:             'Prima utilizz.',
  Data_Ultimo_Utilizzo:            'Ultima utilizz.',
  Combinazione_Piu_Utilizzata:     'Comb. più usata',
  Componente_Pilota:               'Comp. pilota',
  Categoria_Pilota:                'Cat. pilota',
  Codice_Fornitore_Piu_Usato:      'Fornitore',
  Volte_Utilizzata:                'Utilizzi',
  Quantita_Totale_Kg:              'Kg totali',
  _Giorno_Riferimento:             'Giorno rif.',
  _Miscela_Riferimento:            'Miscela',
}

// Colonne con colore speciale per evidenziare i campi chiave
const COL_ACCENT = {
  sma_miscela:             '#5bb870',
  _Miscela_Riferimento:    '#5bb870',
  MG66_CODART:             '#5bb870',
  sma_articolo:            '#f5c842',
  Codice_Univoco_Ricetta:  '#5bb870',
  sma_componente:          '#f5c842',
  Componente_Pilota:       '#f5c842',
  MG87_DESCART:            'rgba(255,255,255,0.88)',
  combo:                   'rgba(255,255,255,0.88)',
}

// Colonne numeriche da formattare e allineare a destra
const NUM_COLS = new Set([
  'sma_quantita','sma_percentuale','sma_percentuale_estrusore',
  'sma_costo_uni','sma_costo_listino_attivo','Volte_Utilizzata','Quantita_Totale_Kg',
])
// Colonne data (valore YYYYMMDD)
const DATE_COLS = new Set(['sma_giorno','_Giorno_Riferimento'])

function fmtDate(v) {
  if (!v) return '—'
  const s = String(v).replace(/[^0-9]/g, '')
  if (s.length === 8) return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`
  return v
}

function fmtNum(v, col) {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  if (isNaN(n)) return String(v)
  const isPct = col?.includes('percentuale')
  const isCost = col?.includes('costo')
  if (isPct)  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %'
  if (isCost) return n.toLocaleString('it-IT', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function DataTable({ columns, rows, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-xs uppercase tracking-widest font-semibold">Caricamento…</span>
      </div>
    )
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-16 text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Nessun dato trovato
      </div>
    )
  }

  const cols = columns || Object.keys(rows[0])

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #0d2e15' }}>
      <table className="min-w-full text-xs">
        <thead>
          <tr style={{ background: '#040d07', borderBottom: '1px solid #0d2e15' }}>
            {cols.map(c => (
              <th
                key={c}
                className="px-4 py-3 font-bold uppercase tracking-widest whitespace-nowrap"
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 9,
                  textAlign: NUM_COLS.has(c) ? 'right' : 'left',
                }}
              >
                {LABELS[c] ?? c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ background: i % 2 === 0 ? '#060f08' : '#070e09', borderBottom: '1px solid #0a1c0d' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(91,184,112,0.06)'}
              onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? '#060f08' : '#070e09'}
            >
              {cols.map(c => {
                const raw = row[c]
                const isDate = DATE_COLS.has(c)
                const isNum  = NUM_COLS.has(c)
                const accent = COL_ACCENT[c]
                let display
                if (raw === null || raw === undefined) {
                  display = <span style={{ color: 'rgba(255,255,255,0.12)' }}>—</span>
                } else if (isDate) {
                  display = fmtDate(raw)
                } else if (isNum) {
                  display = fmtNum(raw, c)
                } else {
                  display = String(raw)
                }
                return (
                  <td
                    key={c}
                    className="px-4 py-2.5 whitespace-nowrap max-w-xs truncate font-mono"
                    style={{
                      color: accent ?? 'rgba(255,255,255,0.72)',
                      fontSize: 11,
                      fontWeight: accent ? 700 : 400,
                      textAlign: isNum ? 'right' : 'left',
                    }}
                    title={String(raw ?? '')}
                  >
                    {display}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
