import { useState } from 'react'
import CheckNumbers from './components/CheckNumbers.jsx'
import PickNumbers from './components/PickNumbers.jsx'
import RunUntilWin from './components/RunUntilWin.jsx'

const TABS = [
  { id: 'check',  label: 'Check Numbers',  icon: '🔢', desc: 'Pick your 6 numbers and run a draw' },
  { id: 'pick',   label: 'Pick & Play',     icon: '🎲', desc: 'Quick Pick or System entry' },
  { id: 'until',  label: 'Run Until Win',   icon: '⏳', desc: 'Simulate until you win a prize' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('check')

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
            Toto<span style={{ color: 'var(--primary)' }}>Sim</span>
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Singapore Toto Simulator</p>
        </div>
        <span style={{
          fontSize: 11,
          background: 'var(--primary-dim)',
          color: 'var(--primary-hover)',
          padding: '4px 10px',
          borderRadius: 20,
          fontWeight: 600,
        }}>
          6/49
        </span>
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
          {activeTab === 'check' && <CheckNumbers />}
          {activeTab === 'pick'  && <PickNumbers />}
          {activeTab === 'until' && <RunUntilWin />}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          For entertainment only. Toto is operated by Singapore Pools.{' '}
          <a href="https://www.singaporepools.com.sg" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            singaporepools.com.sg
          </a>
        </p>
      </footer>
    </div>
  )
}
