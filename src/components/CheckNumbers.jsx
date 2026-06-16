import { useState } from 'react'
import { PICK_COUNT, playRound } from '../utils/toto.js'
import NumberGrid from './NumberGrid.jsx'
import DrawResult from './DrawResult.jsx'

export default function CheckNumbers() {
  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)
  const [resultKey, setResultKey] = useState(0)

  function toggle(n) {
    setSelected(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
    )
    setResult(null)
  }

  function runDraw() {
    const { draw, bestGroup, matchedEntry } = playRound(selected, 'ordinary')
    setResult({ draw, bestGroup, userEntry: matchedEntry || selected })
    setResultKey(k => k + 1)
  }

  function reset() {
    setSelected([])
    setResult(null)
  }

  const ready = selected.length === PICK_COUNT

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Select <strong style={{ color: 'var(--text)' }}>6 numbers</strong>
            {selected.length > 0 && (
              <span style={{ color: 'var(--primary)', marginLeft: 8 }}>({selected.length}/6 selected)</span>
            )}
          </p>
          {selected.length > 0 && (
            <button onClick={reset} style={ghostBtnStyle}>Clear</button>
          )}
        </div>
        <NumberGrid selected={selected} onToggle={toggle} max={PICK_COUNT} />
      </div>

      <button onClick={runDraw} disabled={!ready} style={ready ? primaryBtnStyle : disabledBtnStyle}>
        Draw Numbers
      </button>

      {result && (
        <DrawResult
          key={resultKey}
          draw={result.draw}
          userEntry={result.userEntry}
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
  transition: 'background 0.15s',
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
