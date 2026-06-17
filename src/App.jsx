import { useState, useEffect } from 'react'
import PickNumbers from './components/PickNumbers.jsx'
import RunUntilWin from './components/RunUntilWin.jsx'

const TABS = [
  { id: 'pick',  label: 'Pick & Play',   icon: '🎲', desc: 'Quick Pick or System entry' },
  { id: 'until', label: 'Run Until Win', icon: '⏳', desc: 'Simulate until you win a prize' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('pick')
  const [showRules, setShowRules] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    if (!showRules) return
    function onKey(e) { if (e.key === 'Escape') setShowRules(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showRules])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            ⚡ Stri<span style={{ color: 'var(--primary)' }}>ke</span>
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Lottery Odds Simulator</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowRules(true)}
            title="How 6/49 works"
            aria-label="How the 6/49 lottery works"
            style={{
              fontSize: 11,
              background: 'var(--primary-dim)',
              color: 'var(--primary-hover)',
              padding: '4px 10px',
              borderRadius: 20,
              fontWeight: 600,
              border: '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            6/49
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '1px solid currentColor',
              fontSize: 9,
              fontWeight: 700,
              fontStyle: 'italic',
            }}>i</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '5px 12px',
              fontSize: 15,
              lineHeight: 1,
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: 100,
              padding: '14px 16px',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
              background: 'none',
              color: activeTab === tab.id ? 'var(--primary-hover)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: '24px 16px', maxWidth: 520, width: '100%', margin: '0 auto' }}>
        <div className="fade-in" key={activeTab}>
          {activeTab === 'pick'  && <PickNumbers />}
          {activeTab === 'until' && <RunUntilWin />}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'center',
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Educational probability simulator. No real money involved.
          Prize estimates are approximate and based on typical 2025 draws.
        </p>
        <a
          href="https://github.com/brelkh/StrikeLotterySim"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          View source on GitHub
        </a>
      </footer>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}

function RulesModal({ onClose }) {
  const rows = [
    ['Group 1 (Jackpot)', 'Match all 6'],
    ['Group 2', 'Match 5 + additional'],
    ['Group 3', 'Match 5'],
    ['Group 4', 'Match 4 + additional'],
    ['Group 5', 'Match 4'],
    ['Group 6', 'Match 3 + additional'],
    ['Group 7', 'Match 3'],
  ]
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="How 6/49 works"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          maxWidth: 420,
          width: '100%',
          maxHeight: '85dvh',
          overflowY: 'auto',
          padding: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>How 6/49 works</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              width: 28,
              height: 28,
              fontSize: 16,
              lineHeight: 1,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <ul style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, paddingLeft: 18, margin: '0 0 16px' }}>
          <li>Pick <strong>6 numbers</strong> from <strong>1 to 49</strong>.</li>
          <li>Each draw reveals <strong>6 winning numbers</strong> plus <strong>1 additional number</strong>.</li>
          <li>You win a prize when at least <strong>3</strong> of your numbers match. The additional number lifts certain tiers to the next group.</li>
        </ul>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Prize groups
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: 'var(--text)' }}>
          <tbody>
            {rows.map(([g, d]) => (
              <tr key={g} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 0', fontWeight: 600 }}>{g}</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-muted)' }}>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14 }}>
          A <strong>System entry</strong> (7–12 numbers) plays every possible 6-number
          combination of your picks — more coverage, higher cost.
        </p>
      </div>
    </div>
  )
}
