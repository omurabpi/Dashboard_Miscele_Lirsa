import { useEffect, useState, useCallback } from 'react';
import { fetchLanci, fetchLancio } from '../api';
import Pagination from '../components/Pagination';

const G = '#4ade80';
const AMBER = '#f59e0b';
const CARD_BG = '#0a1c0f';
const CARD_BORDER = '#1a3a22';
const PAGE_SIZE = 50;

const inp = {
  background: '#060f08',
  border: '1px solid #1a3a22',
  color: '#f0fdf4',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 12,
  outline: 'none',
};

const fmtDt = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
};
const fmtDtFull = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const fmtDate8 = (v) => {
  if (!v) return '—';
  const s = String(v).replace(/\D/g, '');
  if (s.length === 8) return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
  return v;
};
const fmtN = (v, dec = 0) =>
  v == null ? '—' : Number(v).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const STATO_LABEL = { 10: 'Aperto', 20: 'In corso', 30: 'Completato', 40: 'Chiuso' };
const STATO_COLOR = { 10: '#60a5fa', 20: AMBER, 30: G, 40: 'rgba(255,255,255,0.3)' };

function StatoBadge({ stato }) {
  const c = STATO_COLOR[stato] || 'rgba(255,255,255,0.35)';
  const l = STATO_LABEL[stato] || stato;
  return (
    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
      style={{ background: `${c}20`, color: c, border: `1px solid ${c}40` }}>
      {l}
    </span>
  );
}

function DetailRow({ label, value, color }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid rgba(26,58,34,0.4)' }}>
      <span className="text-[10px] uppercase tracking-wider shrink-0" style={{ color: 'rgba(255,255,255,0.35)', minWidth: 120 }}>{label}</span>
      <span className="text-xs text-right break-words" style={{ color: color || 'rgba(255,255,255,0.75)' }}>{value ?? '—'}</span>
    </div>
  );
}

const TYPE_COLOR = { ADDITIVO: '#f59e0b', POLIMERO: '#4ade80', COLORANTE: '#60a5fa', CARICA: '#f87171' };

export default function LanciPage() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ q: '', cliente: '', articolo: '', dateFrom: '', dateTo: '' });
  const [selected, setSelected] = useState(null);   // lancio detail
  const [detail, setDetail]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const load = useCallback(() => {
    setLoading(true);
    fetchLanci({ ...filters, page, pageSize: PAGE_SIZE })
      .then(d => { setRows(d.rows); setTotal(d.total); })
      .catch(() => { setRows([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (lancio) => {
    setSelected(lancio);
    setDetail(null);
    setDetailLoading(true);
    fetchLancio(lancio)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Main table area ── */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-auto p-6 space-y-5 transition-all duration-300 ${selected ? 'pr-0' : ''}`}>
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#f0fdf4' }}>Lanci di Produzione</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            tab_base_tracciabilita_lanci — clicca una riga per il dettaglio miscele
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <input style={{ ...inp, width: '100%' }} placeholder="Cerca lancio / cliente / articolo…"
            value={filters.q} onChange={e => setF('q', e.target.value)} />
          <input style={{ ...inp, width: '100%' }} placeholder="Cliente…"
            value={filters.cliente} onChange={e => setF('cliente', e.target.value)} />
          <input style={{ ...inp, width: '100%' }} placeholder="Articolo…"
            value={filters.articolo} onChange={e => setF('articolo', e.target.value)} />
          <input type="date" style={{ ...inp, width: '100%' }} value={filters.dateFrom}
            onChange={e => setF('dateFrom', e.target.value)} title="Data inizio da" />
          <input type="date" style={{ ...inp, width: '100%' }} value={filters.dateTo}
            onChange={e => setF('dateTo', e.target.value)} title="Data inizio a" />
        </div>

        {/* Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {loading ? 'Caricamento…' : <><strong style={{ color: G }}>{total.toLocaleString('it-IT')}</strong> lanci trovati</>}
          </span>
          <button
            onClick={() => { setFilters({ q: '', cliente: '', articolo: '', dateFrom: '', dateTo: '' }); setPage(1); }}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.4)', border: `1px solid ${CARD_BORDER}` }}
            onMouseOver={e => e.currentTarget.style.color = G}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >Reset filtri</button>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: '#060f08', borderBottom: `1px solid ${CARD_BORDER}` }}>
                  {[
                    ['fgl_prod', 'Lancio', 'left'],
                    ['fp_cliente', 'Cliente', 'left'],
                    ['fp_codicearticolo', 'Articolo', 'left'],
                    ['fp_descr_articolo', 'Descrizione', 'left'],
                    ['qta_ordinata', 'Kg Ord.', 'right'],
                    ['T_qta_prodotta', 'Kg Prod.', 'right'],
                    ['T_num_bobine', 'Bobine', 'right'],
                    ['ini_gg_prod', 'Inizio', 'left'],
                    ['fine_gg_prod', 'Fine', 'left'],
                    ['fp_stato', 'Stato', 'left'],
                    ['num_miscele', 'Miscele', 'right'],
                  ].map(([, label, align]) => (
                    <th key={label} className="px-3 py-2.5 font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'rgba(255,255,255,0.35)', textAlign: align, fontSize: 10 }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={11} className="py-8 text-center" style={{ color: G }}>Caricamento…</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={11} className="py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Nessun risultato</td></tr>
                )}
                {!loading && rows.map((row, ri) => {
                  const isActive = selected === row.fgl_prod;
                  return (
                    <tr key={ri}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid rgba(26,58,34,0.4)', background: isActive ? 'rgba(74,222,128,0.08)' : 'transparent' }}
                      onClick={() => isActive ? setSelected(null) : openDetail(row.fgl_prod)}
                      onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(74,222,128,0.04)'; }}
                      onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                      <td className="px-3 py-2 font-mono font-semibold whitespace-nowrap" style={{ color: AMBER }}>{row.fgl_prod}</td>
                      <td className="px-3 py-2 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis" style={{ color: 'rgba(255,255,255,0.7)' }} title={row.fp_cliente}>{row.fp_cliente}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono" style={{ color: G }}>{row.fp_codicearticolo}</td>
                      <td className="px-3 py-2 max-w-[180px] overflow-hidden text-ellipsis" style={{ color: 'rgba(255,255,255,0.55)' }} title={row.fp_descr_articolo}>{row.fp_descr_articolo}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>{fmtN(row.qta_ordinata)}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap font-semibold" style={{ color: G }}>{fmtN(row.T_qta_prodotta)}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.4)' }}>{row.T_num_bobine ?? '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>{fmtDt(row.ini_gg_prod)}</td>
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>{fmtDt(row.fine_gg_prod)}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><StatoBadge stato={row.fp_stato} /></td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {row.num_miscele > 0
                          ? <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(74,222,128,0.15)', color: G }}>{row.num_miscele}</span>
                          : <span style={{ color: 'rgba(255,255,255,0.2)' }}>0</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>

      {/* ── Detail drawer ── */}
      {selected && (
        <div className="flex flex-col shrink-0 overflow-y-auto"
          style={{ width: 480, background: '#060f08', borderLeft: `1px solid ${CARD_BORDER}` }}>
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
            style={{ background: '#060f08', borderBottom: `1px solid ${CARD_BORDER}` }}>
            <div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Dettaglio Lancio</div>
              <div className="text-base font-bold font-mono mt-0.5" style={{ color: AMBER }}>{selected}</div>
            </div>
            <button onClick={() => setSelected(null)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)', border: `1px solid ${CARD_BORDER}` }}
              onMouseOver={e => e.currentTarget.style.color = '#f87171'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {detailLoading && (
            <div className="p-8 text-center" style={{ color: G }}>Caricamento dettaglio…</div>
          )}

          {!detailLoading && detail && (
            <div className="p-5 space-y-6">
              {/* Info header */}
              <div className="rounded-xl p-4 space-y-0" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <DetailRow label="Cliente"       value={detail.lancio.fp_cliente} color={AMBER} />
                <DetailRow label="Articolo"      value={detail.lancio.fp_codicearticolo} color={G} />
                <DetailRow label="Descrizione"   value={detail.lancio.fp_descr_articolo} />
                <DetailRow label="Ordine/Rigo"   value={detail.lancio.ordine_rigo_key} />
                <DetailRow label="Stato"         value={<StatoBadge stato={detail.lancio.fp_stato} />} />
                <DetailRow label="Kg ordinati"   value={fmtN(detail.lancio.qta_ordinata) + ' ' + (detail.lancio.fp_um_prod || '')} />
                <DetailRow label="Kg prodotti"   value={fmtN(detail.lancio.T_qta_prodotta) + ' kg'} color={G} />
                <DetailRow label="Bobine"        value={fmtN(detail.lancio.T_num_bobine)} />
                <DetailRow label="Inizio"        value={fmtDtFull(detail.lancio.ini_gg_prod)} />
                <DetailRow label="Fine"          value={fmtDtFull(detail.lancio.fine_gg_prod)} />
                <DetailRow label="Giorni prod."  value={detail.lancio.num_gg_prod} />
              </div>

              {/* Miscele table */}
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-3"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Miscele associate ({detail.miscele.length} righe)
                </div>
                {detail.miscele.length === 0 ? (
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Nessuna miscela registrata</div>
                ) : (
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr style={{ background: '#060f08', borderBottom: `1px solid ${CARD_BORDER}` }}>
                          {['Miscela', 'Componente', 'Tipo', '%Mix', 'Kg'].map(h => (
                            <th key={h} className="px-2 py-2 font-semibold uppercase tracking-wider"
                              style={{ color: 'rgba(255,255,255,0.3)', textAlign: h === '%Mix' || h === 'Kg' ? 'right' : 'left', fontSize: 9 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.miscele.map((m, i) => {
                          const tc = TYPE_COLOR[m.Tipo] || 'rgba(255,255,255,0.4)';
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(26,58,34,0.4)' }}>
                              <td className="px-2 py-1.5 font-mono font-semibold whitespace-nowrap" style={{ color: G }}>{m.Miscela}</td>
                              <td className="px-2 py-1.5 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.65)' }}>{m.Componente}</td>
                              <td className="px-2 py-1.5 whitespace-nowrap">
                                <span className="px-1 py-0.5 rounded text-[8px] font-bold uppercase"
                                  style={{ background: `${tc}20`, color: tc }}>{m.Tipo}</span>
                              </td>
                              <td className="px-2 py-1.5 text-right whitespace-nowrap" style={{ color: AMBER }}>
                                {m.Perc_Miscela_Unica != null ? Number(m.Perc_Miscela_Unica).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%' : '—'}
                              </td>
                              <td className="px-2 py-1.5 text-right whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {m.Quantita_Totale_Kg != null ? Number(m.Quantita_Totale_Kg).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
