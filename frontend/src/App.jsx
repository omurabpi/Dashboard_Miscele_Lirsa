import { Routes, Route, NavLink } from 'react-router-dom';
import { useState } from 'react';
import OverviewPage from './pages/OverviewPage';
import LanciPage from './pages/LanciPage';
import StoricoPage from './pages/StoricoPage';
import RicettePage from './pages/RicettePage';

const G = '#4ade80';
const G_DIM = 'rgba(74,222,128,0.12)';
const BORDER = '#1a3a22';

const navItems = [
  {
    to: '/', label: 'Panoramica',
    icon: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6zm-10 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" /></svg>,
  },
  {
    to: '/lanci', label: 'Lanci',
    icon: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
  {
    to: '/storico', label: 'Storico Miscele',
    icon: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  },
  {
    to: '/ricette', label: 'Analisi Ricette',
    icon: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
];

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen font-sans" style={{ background: '#040d07' }}>

      {/* -- Sidebar -- */}
      <aside
        className="shrink-0 flex flex-col transition-all duration-300"
        style={{ width: collapsed ? 56 : 216, background: '#060f08', borderRight: `1px solid ${BORDER}` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <img
            src="/Dashboard/Ricette/lirsalogo.png"
            alt="Lirsa"
            className="shrink-0"
            style={{ height: collapsed ? 28 : 32, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          />
          {!collapsed && (
            <div className="overflow-hidden leading-tight">
              <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>MES · Ricette</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="ml-auto shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseOver={e => e.currentTarget.style.color = G}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'} />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'all 0.15s',
                background: isActive ? G_DIM : 'transparent',
                color: isActive ? G : 'rgba(255,255,255,0.4)',
                borderLeft: `2px solid ${isActive ? G : 'transparent'}`,
              })}
            >
              {item.icon}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.18)' }}>Database</div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Optimus_DSG</div>
            <div className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.18)' }}>10.0.0.23</div>
          </div>
        )}
      </aside>

      {/* -- Main -- */}
      <main className="flex-1 overflow-auto min-w-0">
        <Routes>
          <Route path="/"        element={<OverviewPage />} />
          <Route path="/lanci"   element={<LanciPage />} />
          <Route path="/storico" element={<StoricoPage />} />
          <Route path="/ricette" element={<RicettePage />} />
        </Routes>
      </main>
    </div>
  );
}

