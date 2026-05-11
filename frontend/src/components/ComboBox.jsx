import { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'

/**
 * ComboBox – input di testo + dropdown suggerimenti
 * Props:
 *   value, onChange(val)  — controlled
 *   fetchUrl              — endpoint ES: '/api/suggerimenti/storico-articoli'
 *                           risponde con string[] o {label,value}[]
 *   placeholder           — testo placeholder
 *   label                 — etichetta sopra
 *   onEnter               — callback quando si preme Invio
 */
export default function ComboBox({ value, onChange, fetchUrl, placeholder, label, onEnter }) {
  const [open, setOpen]         = useState(false)
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState(false)
  const debounceRef             = useRef(null)
  const wrapRef                 = useRef(null)

  // chiude cliccando fuori
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = useCallback((q) => {
    if (!fetchUrl) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await axios.get(fetchUrl, { params: { q } })
        const raw = res.data
        const normalized = raw.map(item =>
          typeof item === 'string'
            ? { label: item, value: item }
            : { label: item.label ?? item.value, value: item.value }
        )
        setItems(normalized)
        setOpen(normalized.length > 0)
      } catch { setItems([]) }
      setLoading(false)
    }, 250)
  }, [fetchUrl])

  const handleChange = (e) => {
    onChange(e.target.value)
    fetchSuggestions(e.target.value)
  }

  const handleSelect = (item) => {
    onChange(item.value)
    setOpen(false)
    setItems([])
  }

  const handleChevron = () => {
    if (open) { setOpen(false); return }
    fetchSuggestions(value)
  }

  const borderColor = focused ? '#5bb870' : '#0d2e15'

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {label && (
        <label className="block text-[9px] uppercase tracking-widest font-semibold mb-1.5"
          style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#060f08',
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        transition: 'border-color 0.15s',
      }}>
        <input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={() => { setFocused(true); if (value === '') fetchSuggestions('') }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => {
            if (e.key === 'Enter') { setOpen(false); onEnter?.() }
            if (e.key === 'Escape') setOpen(false)
          }}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: '8px 4px 8px 12px',
            color: 'rgba(255,255,255,0.85)', fontSize: 12,
          }}
        />
        <button
          onMouseDown={e => { e.preventDefault(); handleChevron() }}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '0 10px', color: 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center',
          }}
          tabIndex={-1}
          aria-label="Mostra suggerimenti"
        >
          {loading
            ? <span style={{ fontSize: 10, opacity: 0.5 }}>…</span>
            : <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: open ? 'rotate(180deg)' : 'none', transformOrigin: '5px 3px', transition: 'transform 0.15s' }} />
              </svg>
          }
        </button>
      </div>

      {open && items.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000,
          background: '#060f08',
          border: '1px solid #1a4a25',
          borderRadius: 8,
          maxHeight: 220,
          overflowY: 'auto',
          listStyle: 'none', margin: 0, padding: '4px 0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        }}>
          {items.map((item, i) => (
            <li key={i}
              onMouseDown={e => { e.preventDefault(); handleSelect(item) }}
              style={{
                padding: '7px 12px',
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,184,112,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
