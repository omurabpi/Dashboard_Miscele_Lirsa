import { useEffect, useState, useCallback } from 'react';
import { fetchStorico, fetchSuggerimenti } from '../api';
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
  width: '100%',
};

const fmtDate = (v) => {
  if (!v) return 'â€”';
  const s = String(v).replace(/\D/g, '');
  if (s.length === 8) return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
  return v;
};

const fmtNum = (v, dec = 3) =>
  v == null || v === '' ? 'â€”' : Number(v).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const TYPE_COLOR = { ADDITIVO: '#f59e0b', POLIMERO: '#4ade80', COLORANTE: '#60a5fa', CARICA: '#f87171' };

function TipoBadge({ tipo }) {
  const c = TYPE_COLOR[tipo] || 'rgba(255,255,255,0.4)';
  return (
    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
      style={{ background: `${c}20`, color: c, border: `1px solid ${c}40` }}>
      {tipo || 'â€”'}
    </span>
  );
}

export default function StoricoPage() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    miscela: '', articolo: '', macchina: '', componente: '', tipo: '', dateFrom: '', dateTo: '',
  });
  const [tipiList, setTipiList]     = useState([]);
  const [macchineList, setMacchineList] = useState([]);

  // Load dropdown options once
  useEffect(() => {
    fetchSuggerimenti('tipi').then(setTipiList).catch(() => {});
    fetchSuggerimenti('macchine').then(setMacchineList).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchStorico({ ...filters, page, pageSize: PAGE_SIZE })
      .then(d => { setRows(d.rows); setTotal(d.total); })
      .catch(() => { setRows([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const cols = [
    { key: 'Data_Da',              label: 'Data',          fmt: fmtDate,  color: 'rgba(255,255,255,0.5)' },
    { key: 'Lancio',               label: 'Lancio',        color: AMBER },
    { key: 'fp_cliente',           label: 'Cliente',       color: 'rgba(255,255,255,0.7)', maxW: 140 },
    { key: 'Miscela',              label: 'Miscela',       color: G },
    { key: 'Macchina',             label: 'Macchina',      color: 'rgba(255,255,255,0.55)' },
    { key: 'Articolo',             label: 'Articolo',      color: AMBER },
    { key: 'Componente',           label: 'Componente',    color: 'rgba(255,255,255,0.7)' },
    { key: 'Tipo',                 label: 'Tipo',          render: (v) => <TipoBadge tipo={v} /> },
    { key: 'Perc_Miscela_Unica',   label: '% Mix',         fmt: (v) => v != null ? fmtNum(v, 3) + ' %' : 'â€”', align: 'right' },
    { key: 'Quantita_Totale_Kg',   label: 'Kg',            fmt: (v) => fmtNum(v, 2), align: 'right' },
    { key: 'Costo_Uni_EuroKg',     label: 'â‚¬/kg',          fmt: (v) => fmtNum(v, 4), align: 'right', color: 'rgba(255,255,255,0.5)' },
    { key: 'Contributo_Costo_EuroKg', label: 'Contributo â‚¬/kg', fmt: (v) => fmtNum(v, 4), align: 'right', color: 'rgba(255,255,255,0.4)' },
    { key: 'N_Strati',             label: 'Strati',        align: 'right', color: 'rgba(255,255,255,0.4)' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#f0fdf4' }}>Storico Miscele</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          tab_base_storico_miscele JOIN tab_base_tracciabilita_lanci (su Lancio = fgl_prod)
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
        <input style={inp} placeholder="Miscelaâ€¦"    value={filters.miscela}    onChange={e => setF('miscela', e.target.value)} />
        <input style={inp} placeholder="Articoloâ€¦"   value={filters.articolo}   onChange={e => setF('articolo', e.target.value)} />
        <input style={inp} placeholder="Componenteâ€¦" value={filters.componente} onChange={e => setF('componente', e.target.value)} />
        <select style={inp} value={filters.macchina} onChange={e => setF('macchina', e.target.value)}>
          <option value="">Tutte le macchine</option>
          {macchineList.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select style={inp} value={filters.tipo} onChange={e => setF('tipo', e.target.value)}>
          <option value="">Tutti i tipi</option>
          {tipiList.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="date" style={inp} value={filters.dateFrom} onChange={e => setF('dateFrom', e.target.value)} title="Da data" />
        <input type="date" style={inp} value={filters.dateTo}   onChange={e => setF('dateTo', e.target.value)}   title="A data" />
      </div>

      {/* Count + reset */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {loading ? 'Caricamentoâ€¦' : <><strong style={{ color: G }}>{total.toLocaleString('it-IT')}</strong> righe trovate</>}
        </span>
        <button
          onClick={() => { setFilters({ miscela: '', articolo: '', macchina: '', componente: '', tipo: '', dateFrom: '', dateTo: '' }); setPage(1); }}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', border: `1px solid ${CARD_BORDER}` }}
          onMouseOver={e => e.currentTarget.style.color = G}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          Reset filtri
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ background: '#060f08', borderBottom: `1px solid ${CARD_BORDER}` }}>
                {cols.map(c => (
                  <th key={c.key} className="px-3 py-2.5 font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'rgba(255,255,255,0.35)', textAlign: c.align || 'left', fontSize: 10 }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={cols.length} className="py-8 text-center" style={{ color: G }}>
                  Caricamentoâ€¦
                </td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={cols.length} className="py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Nessun risultato
                </td></tr>
              )}
              {!loading && rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: `1px solid rgba(26,58,34,0.5)` }}
                  className="transition-colors"
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(74,222,128,0.04)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {cols.map(c => {
                    const raw = row[c.key];
                    const display = c.render
                      ? c.render(raw)
                      : <span style={{ color: c.color || 'rgba(255,255,255,0.65)' }}>
                          {c.fmt ? c.fmt(raw) : (raw ?? 'â€”')}
                          {c.maxW && raw && raw.length > 20
                            ? null
                            : null}
                        </span>;
                    return (
                      <td key={c.key} className="px-3 py-2 whitespace-nowrap"
                        style={{ textAlign: c.align || 'left', maxWidth: c.maxW || undefined, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
    </div>
  );
}
