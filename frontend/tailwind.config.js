/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        lirsa: {
          green:   '#5bb870',
          'green-dim': '#3a7a4a',
          'green-glow': 'rgba(91,184,112,0.15)',
          amber:   '#f5c842',
          'amber-dim': 'rgba(245,200,66,0.15)',
          bg:      '#020c04',
          card:    '#060f08',
          'card-2':'#0a1a0d',
          border:  '#0d2e15',
          'border-bright': '#1a4a25',
          muted:   'rgba(255,255,255,0.35)',
          faint:   'rgba(255,255,255,0.12)',
        },
      },
      boxShadow: {
        'lirsa-card': '0 0 0 1px #0d2e15, 0 4px 24px rgba(0,0,0,0.6)',
        'lirsa-glow': '0 0 20px rgba(91,184,112,0.2)',
      },
    },
  },
  plugins: [],
}
