import { useEffect, useState, useCallback } from 'react';
import { fetchRicette } from '../api';
import Pagination from '../components/Pagination';

const G = '#4ade80';
const AMBER = '#f59e0b';
const BLUE  = '#60a5fa';
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

const fmtN = (v, dec = 0) =>
  v == null ? '—' : Number(v).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** Parse "COMP1:12.5|COMP2:87.5" → [{name, perc}] sorted desc */
function parseComposizione(s) {
  if (!s) return [];
  return s.split('|')
    .map(part => {
      const [name, raw] = part.split(':');
      return { name: name?.trim(), perc: parseFloat(raw) || 0 };
    })
    .filter(x => x.name)
    .sort((a, b) => b.perc - a.perc);
}

const COMP_COLORS = [G, AMBER, BLUE, '#f87171', '#a78bfa', '#34d399', '#fb923c', '#e879f9', '#94a3b8'];

function CompositionBar({ composizione }) {
  const parts = parseComposizione(composizione);
  if (!parts.length) return <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>;
  const total = parts.reduce((s, p) => s + p.perc, 0);
  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div className="flex rounded-md overflow-hidden h-4">
        {parts.map((p, i) => (
          <div key={p.name} title={`${p.name}: ${p.perc.toFixed(3)}%`}
            style={{ width: `${(p.perc / total) * 100}%`, background: COMP_COLORS[i % COMP_COLORS.length] }} />
        ))}
      </div>
      {/* Legend */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {parts.map((p, i) => (
          <div key={p.name} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm shrink-0"
                style={{ background: COMP_COLORS[i % COMP_COLORS.length] }} />
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>{p.name}</span>
            </div>
            <span className="font-mono" style={{ color: COMP_COLORS[i % COMP_COLORS.length] }}>
              {p.perc.toLocaleString('it-IT', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}%
            </span>
          </div>
        ))}
      </div>
      <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Tot. controllato: {total.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
      </div>
    </div>
  );
}

export default function RicettePage() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ articolo: '', variante: '' });
  const [selected, setSelected] = useState(null);

  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const load = useCallback(() => {
    setLoading(true);
    fetchRicette({ ...filters, page, pageSize: PAGE_SIZE })
      .then(d => { setRows(d.rows); setTotal(d.total); })
      .catch(() => { setRows([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left: table ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-auto p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#f0fdf4' }}>Analisi Ricette</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            tab_miscele_piu_utilizzata — clicca una riga per vedere la composizione
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-xl p-4 grid grid-cols-2 gap-3"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, maxWidth: 480 }}>
          <input style={{ ...inp, width: '100%' }} placeholder="Articolo…"
            value={filters.articolo} onChange={e => setF('articolo', e.target.value)} />
          <input style={{ ...inp, width: '100%' }} placeholder="Variante…"
            value={filters.variante} onChange={e => setF('variante', e.target.value)} />
        </div>

        {/* Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {loading ? 'Caricamento…' : <><strong style={{ color: G }}>{total.toLocaleString('it-IT')}</strong> ricette trovate</>}
          </span>
          <button
            onClick={() => { setFilters({ articolo: '', variante: '' }); setPage(1); }}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.4)', border: `1px solid ${CARD_BORDER}` }}
            onMouseOver={e => e.currentTarget.style.color = G}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >Reset</button>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: '#060f08', borderBottom: `1px solid ${CARD_BORDER}` }}>
                  {[
                    ['Articolo', 'left'],
                    ['Variante', 'left'],
                    ['Descrizione', 'left'],
                    ['Miscela Prevalente', 'left'],
                    ['N Lanci', 'right'],
                    ['Kg Totali', 'right'],
                    ['Rank Lanci', 'right'],
                    ['Rank Kg', 'right'],
                  ].map(([label, align]) => (
                    <th key={label} className="px-3 py-2.5 font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'rgba(255,255,255,0.35)', textAlign: align, fontSize: 10 }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="py-8 text-center" style={{ color: G }}>Caricamento…</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Nessun risultato</td></tr>
                )}
                {!loading && rows.map((row, ri) => {
                  const isActive = selected?.Articolo === row.Articolo && selected?.Variante === row.Variante;
                  return (
                    <tr key={ri}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid rgba(26,58,34,0.4)', background: isActive ? 'rgba(74,222,128,0.08)' : 'transparent' }}
                      onClick={() => setSelected(isActive ? null : row)}
                      onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(74,222,128,0.04)'; }}
                      onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                      <td className="px-3 py-2 font-mono font-semibold whitespace-nowrap" style={{ color: AMBER }}>{row.Articolo}</td>
                      <td className="px-3 py-2 font-mono whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.55)' }}>{row.Variante}</td>
                      <td className="px-3 py-2 max-w-[160px] overflow-hidden text-ellipsis" style={{ color: 'rgba(255,255,255,0.6)' }} title={row.descr_articolo}>{row.descr_articolo || '—'}</td>
                      <td className="px-3 py-2 font-mono font-semibold whitespace-nowrap" style={{ color: G }}>{row.Miscela_Prevalente}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap" style={{ color: BLUE }}>{fmtN(row.N_Lanci)}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap font-semibold" style={{ color: G }}>
                        {fmtN(row.Kg_Totali, 1)} <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>kg</span>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>#{row.Rank_Per_N_Lanci}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>#{row.Rank_Per_Kg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>

      {/* ── Right: composition panel ── */}
      {selected && (
        <div className="flex flex-col shrink-0 overflow-y-auto"
          style={{ width: 360, background: '#060f08', borderLeft: `1px solid ${CARD_BORDER}` }}>
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
            style={{ background: '#060f08', borderBottom: `1px solid ${CARD_BORDER}` }}>
            <div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Composizione Ricetta</div>
              <div className="text-sm font-bold font-mono mt-0.5">
                <span style={{ color: AMBER }}>{selected.Articolo}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}> / </span>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{selected.Variante}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: 'rgba(255,255,255,0.4)', border: `1px solid ${CARD_BORDER}` }}
              onMouseOver={e => e.currentTarget.style.color = '#f87171'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Meta */}
            <div className="rounded-xl p-4 space-y-1" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Dati ricetta</div>
              {[
                ['Miscela prevalente', selected.Miscela_Prevalente, G],
                ['Lanci totali',       fmtN(selected.N_Lanci),      BLUE],
                ['Kg totali',          fmtN(selected.Kg_Totali, 1) + ' kg', G],
                ['Rank per lanci',     '#' + selected.Rank_Per_N_Lanci],
                ['Rank per kg',        '#' + selected.Rank_Per_Kg],
              ].map(([l, v, c]) => (
                <div key={l} className="flex items-center justify-between text-xs py-1"
                  style={{ borderBottom: '1px solid rgba(26,58,34,0.4)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</span>
                  <span className="font-semibold font-mono" style={{ color: c || 'rgba(255,255,255,0.7)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Composition */}
            <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Composizione percentuale
              </div>
              <CompositionBar composizione={selected.Ricetta_Composizione} />
            </div>

            {/* Hash */}
            {selected.Ricetta_Hash && (
              <div className="text-[9px] font-mono break-all" style={{ color: 'rgba(255,255,255,0.15)' }}>
                Hash: {selected.Ricetta_Hash}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
