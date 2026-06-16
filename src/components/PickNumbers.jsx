import { useState } from 'react'
import { SYSTEM_ENTRIES, quickPick, playRound } from '../utils/toto.js'
import NumberGrid from './NumberGrid.jsx'
import DrawResult from './DrawResult.jsx'
import NumberBall from './NumberBall.jsx'

export default function PickNumbers() {
  const [entryType, setEntryType] = useState('quickpick')
  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)
  const [resultKey, setResultKey] = useState(0)

  const config = SYSTEM_ENTRIES.find(e => e.type === entryType)
  const isQP = entryType === 'quickpick'
  const ready = isQP || selected.length === config.pick

  function handleEntryChange(type) {
    setEntryType(type)
    setSelected([])
    setResult(null)
  }

  function toggle(n) {
    setSelected(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
    )
    setResult(null)
  }

  function runDraw() {
    const numbers = isQP ? quickPick(6) : selected
    const type = isQP ? 'ordinary' : entryType
    const { draw, bestGroup, matchedEntry } = playRound(numbers, type)
    setResult({ draw, bestGroup, numbers, matchedEntry })
    setResultKey(k => k + 1)
  }

  function reset() {
    setSelected([])
    setResult(null)
  }

  function autoFill() {
    setSelected(quickPick(config.pick))
    setResult(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Entry type selector */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Bet type
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SYSTEM_ENTRIES.map(e => (
            <button
              key={e.type}
              onClick={() => handleEntryChange(e.type)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: `1px solid ${entryType === e.type ? 'var(--primary)' : 'var(--border)'}`,
                background: entryType === e.type ? 'var(--primary-dim)' : 'transparent',
                color: entryType === e.type ? 'var(--primary-hover)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: entryType === e.type ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {e.label}
              {e.cost > 1 && <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>${e.cost}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Number selection for system entries */}
      {!isQP && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Select <strong style={{ color: 'var(--text)' }}>{config.pick} numbers</strong>
              {selected.length > 0 && (
                <span style={{ color: 'var(--primary)', marginLeft: 8 }}>({selected.length}/{config.pick})</span>
              )}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={autoFill} style={ghostBtnStyle}>Random</button>
              {selected.length > 0 && (
                <button onClick={reset} style={ghostBtnStyle}>Clear</button>
              )}
            </div>
          </div>
          <NumberGrid selected={selected} onToggle={toggle} max={config.pick} />
        </div>
      )}

      {/* Quick Pick preview */}
      {isQP && result && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Quick Pick
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {result.numbers.map(n => (
              <NumberBall key={n} number={n} state="selected" />
            ))}
          </div>
        </div>
      )}

      <button onClick={runDraw} disabled={!ready} style={ready ? primaryBtnStyle : disabledBtnStyle}>
        {isQP ? 'Quick Pick & Draw' : 'Draw Numbers'}
        {config.combos > 1 && (
          <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>({config.combos} combos)</span>
        )}
      </button>

      {result && (
        <DrawResult
          key={resultKey}
          draw={result.draw}
          userEntry={result.matchedEntry || result.numbers}
          bestGroup={result.bestGroup}
          animate
        />
      )}
    </div>
  )
}

const primaryBtnStyle = {
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '14px 24px',
  fontSize: 15,
  fontWeight: 600,
  width: '100%',
}

const disabledBtnStyle = {
  ...primaryBtnStyle,
  background: 'var(--surface2)',
  color: 'var(--text-muted)',
  cursor: 'not-allowed',
}

const ghostBtnStyle = {
  background: 'none',
  border: '1px solid var(--border)',
  color: 'var(--text-muted)',
  borderRadius: 'var(--radius-sm)',
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 500,
}
