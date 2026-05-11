import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { fetchStoricoStats, fetchHealth } from '../api'
import KpiCard from '../components/KpiCard'

const GREEN  = '#5bb870'
const AMBER  = '#f5c842'
const BLUE   = '#38bdf8'
const PURPLE = '#a855f7'
const COLORS = [GREEN, AMBER, BLUE, PURPLE, '#f87171', '#34d399', '#fb923c', '#818cf8', '#e879f9', '#2dd4bf']

const MONTHS_IT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']
const fmtMese = (s) => {
  const [y, m] = String(s).split('-')
  return `${MONTHS_IT[(parseInt(m) || 1) - 1]} '${y?.slice(2) ?? ''}`
}

const CHART_STYLE = {
  background: '#060f08',
  border: '1px solid #0d2e15',
  borderRadius: 12,
  padding: '20px 20px 12px',
}

const AXIS_STYLE = { fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Inter' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#040d07', border: '1px solid #0d2e15', borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || GREEN, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>
          {p.value?.toLocaleString('it-IT')}
        </p>
      ))}
    </div>
  )
}

export default function OverviewPage() {
  const [stats, setStats]     = useState(null)
  const [health, setHealth]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStoricoStats({}), fetchHealth()])
      .then(([s, h]) => { setStats(s); setHealth(h) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-xs uppercase tracking-widest font-semibold"
      style={{ color: 'rgba(255,255,255,0.3)' }}>
      Caricamento statistiche…
    </div>
  )
  if (error) return (
    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 20, color: '#f87171', fontSize: 13 }}>
      {error}
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: GREEN }}>
            Lirsa MES · Optimus_DSG
          </p>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.92)' }}>
            Overview Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
          background: health?.db === 'connected' ? 'rgba(91,184,112,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${health?.db === 'connected' ? '#0d2e15' : 'rgba(239,68,68,0.3)'}`,
        }}>
          <span className="w-2 h-2 rounded-full pulse-green"
            style={{ background: health?.db === 'connected' ? GREEN : '#f87171' }} />
          <span className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: health?.db === 'connected' ? GREEN : '#f87171' }}>
            DB {health?.db === 'connected' ? 'Online' : 'Errore'}
          </span>
        </div>
      </div>

      {/* ── KPI ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Applicazioni miscele totali" value={stats?.kpi?.total?.toLocaleString('it-IT')}    variant="green" icon="🔢" />
        <KpiCard label="Articoli distinti"           value={stats?.kpi?.articoli?.toLocaleString('it-IT')} variant="amber" icon="📦" />
        <KpiCard label="Miscele distinte"            value={stats?.kpi?.miscele?.toLocaleString('it-IT')}  variant="blue"  icon="🧪" />
      </div>

      {/* ── Area chart mensile ────────────────────────────────── */}
      {stats?.perMese?.length > 0 && (
        <div style={CHART_STYLE}>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Applicazioni miscele – ultimi 12 mesi
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.perMese} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={GREEN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="mese" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={fmtMese} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="conteggio" stroke={GREEN} strokeWidth={2}
                fill="url(#gradGreen)" dot={{ r: 3, fill: GREEN, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Top Articoli bar ─────────────────────────────────── */}
        {stats?.topArticoli?.length > 0 && (
          <div style={CHART_STYLE}>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Top 10 Articoli per applicazioni
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.topArticoli} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="cod_articolo" width={72}
                  tick={{ ...AXIS_STYLE, fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="conteggio" fill={GREEN} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Top Miscele donut ────────────────────────────────── */}
        {stats?.topMiscele?.length > 0 && (
          <div style={CHART_STYLE}>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Top 10 Miscele per occorrenze
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={stats.topMiscele} dataKey="conteggio" nameKey="cod_miscela"
                  cx="50%" cy="50%" outerRadius={95} innerRadius={45} paddingAngle={2}>
                  {stats.topMiscele.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#040d07', border: '1px solid #0d2e15', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase' }}
                  itemStyle={{ color: GREEN }}
                  formatter={(v) => v.toLocaleString('it-IT')}
                />
                <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
