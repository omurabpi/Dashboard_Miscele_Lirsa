import { Routes, Route, NavLink } from 'react-router-dom'
import { useState } from 'react'
import OverviewPage from './pages/OverviewPage'
import StoricoPage from './pages/StoricoPage'
import ArticoliPage from './pages/ArticoliPage'
import ComponentiPage from './pages/ComponentiPage'
import AnalisiMiscelePage from './pages/AnalisiMiscelePage'
import StoricoRicettePage from './pages/StoricoRicettePage'

const navItems = [
  { to: '/',           label: 'Overview',        iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/storico',          label: 'Storico Miscele',    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/storico-ricette',   label: 'Ricette per Articolo', iconPath: 'M4 6h16M4 10h16M4 14h10M4 18h6' },
  { to: '/analisi',    label: 'Analisi Miscele', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/articoli',   label: 'Articoli',        iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/componenti', label: 'Componenti',      iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
]

export default function App() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-lirsa-bg font-sans">

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside
        className="shrink-0 flex flex-col transition-all duration-300"
        style={{
          width: collapsed ? 56 : 220,
          background: '#040d07',
          borderRight: '1px solid #0d2e15',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid #0d2e15' }}
        >
          <div
            className="shrink-0 w-7 h-7 rounded flex items-center justify-center"
            style={{ background: '#5bb870', boxShadow: '0 0 12px rgba(91,184,112,0.5)' }}
          >
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold tracking-widest uppercase" style={{ color: '#5bb870' }}>LIRSA</div>
              <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>MES · Ricette</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="ml-auto shrink-0 rounded p-1 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseOver={e => e.currentTarget.style.color = '#5bb870'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'} />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.15s',
                background: isActive ? 'rgba(91,184,112,0.12)' : 'transparent',
                color: isActive ? '#5bb870' : 'rgba(255,255,255,0.45)',
                borderLeft: isActive ? '2px solid #5bb870' : '2px solid transparent',
              })}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
              </svg>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid #0d2e15' }}>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Database</div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Optimus_DSG</div>
            <div className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>10.0.0.23</div>
          </div>
        )}
      </aside>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-6 min-w-0">
        <Routes>
          <Route path="/"           element={<OverviewPage />} />
          <Route path="/storico"          element={<StoricoPage />} />
          <Route path="/storico-ricette"  element={<StoricoRicettePage />} />
          <Route path="/analisi"    element={<AnalisiMiscelePage />} />
          <Route path="/articoli"   element={<ArticoliPage />} />
          <Route path="/componenti" element={<ComponentiPage />} />
        </Routes>
      </main>
    </div>
  )
}
