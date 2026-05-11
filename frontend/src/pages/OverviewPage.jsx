import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { fetchOverview } from '../api';

const G     = '#4ade80';
const AMBER = '#f59e0b';
const BLUE  = '#60a5fa';
const ROSE  = '#f87171';
const PIE_COLORS = [G, AMBER, BLUE, ROSE, '#a78bfa', '#34d399', '#fb923c', '#e879f9'];
const CARD_BG   = '#0a1c0f';
const CARD_BORDER = '#1a3a22';

const MONTHS_IT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
const fmtMese = (v) => {
  if (!v || v.length < 6) return v;
  const y = v.slice(2, 4); const m = parseInt(v.slice(4, 6), 10);
  return `${MONTHS_IT[m - 1]} '${y}`;
};
const fmtKg = (v) => {
  if (v == null) return '-';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' Mt';
  if (v >= 1_000) return (v / 1_000).toFixed(1) + ' t';
  return v.toLocaleString('it-IT', { maximumFractionDigits: 0 }) + ' kg';
};
const fmtN = (v) => v == null ? '-' : Number(v).toLocaleString('it-IT');

function KPI({ label, value, sub, color = G, icon }) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-2"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-semibold"
          style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold tracking-tight" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#0f2a17', border: `1px solid ${CARD_BORDER}` }}>
      <div className="font-semibold mb-1" style={{ color: G }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function OverviewPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetchOverview()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ color: G }}>
      <svg className="animate-spin w-8 h-8 mr-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Caricamento...
    </div>
  );

  if (error) return (
    <div className="p-8 text-red-400">Errore: {error}</div>
  );

  const { kpi, trend, macchine, tipi } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#f0fdf4' }}>Panoramica</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Dati aggregati da tab_base_tracciabilita_lanci + tab_base_storico_miscele
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPI label="Lanci totali"  value={fmtN(kpi.total_lanci)}    icon="#" color={G} />
        <KPI label="Kg prodotti"   value={fmtKg(kpi.total_kg)}       icon="kg" color={AMBER} sub="totale storico" />
        <KPI label="Articoli"      value={fmtN(kpi.total_articoli)}  icon="[]" color={BLUE} />
        <KPI label="Miscele"       value={fmtN(kpi.total_miscele)}   icon="~" color={G} />
        <KPI label="Macchine"      value={fmtN(kpi.total_macchine)}  icon="*" color="rgba(255,255,255,0.7)" />
        <KPI label="Clienti"       value={fmtN(kpi.total_clienti)}   icon="@" color={AMBER} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Area chart â€“ monthly trend */}
        <div className="xl:col-span-3 rounded-xl p-5"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="text-xs uppercase tracking-widest font-semibold mb-4"
            style={{ color: 'rgba(255,255,255,0.4)' }}>Kg Prodotti per Mese (ultimi 13 mesi)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gradKg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={G} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={G} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mese" tickFormatter={fmtMese} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
              <YAxis tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'t' : v} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} width={40} />
              <Tooltip content={<CustomTooltip formatter={fmtKg} />}
                labelFormatter={fmtMese} />
              <Area type="monotone" dataKey="kg_prodotti" name="Kg prodotti"
                stroke={G} strokeWidth={2} fill="url(#gradKg)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span style={{ color: G }}>- Kg prodotti</span>
          </div>
        </div>

        {/* Donut â€“ tipi componenti */}
        <div className="xl:col-span-2 rounded-xl p-5"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="text-xs uppercase tracking-widest font-semibold mb-4"
            style={{ color: 'rgba(255,255,255,0.4)' }}>Distribuzione Tipi Componente</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={tipi} dataKey="kg_totali" nameKey="tipo"
                cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                paddingAngle={2} stroke="none">
                {tipi.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtKg(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1 overflow-y-auto max-h-28">
            {tipi.map((t, i) => (
              <div key={t.tipo} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>{t.tipo}</span>
                </div>
                <span style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{fmtKg(t.kg_totali)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart â€“ top macchine */}
      <div className="rounded-xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
        <div className="text-xs uppercase tracking-widest font-semibold mb-4"
          style={{ color: 'rgba(255,255,255,0.4)' }}>Top 10 Macchine per Kg</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[...macchine].reverse()} layout="vertical"
            margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+'t' : v}
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
            <YAxis type="category" dataKey="Macchina" width={100}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip formatter={fmtKg} />} />
            <Bar dataKey="kg_totali" name="Kg totali" fill={AMBER} radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
