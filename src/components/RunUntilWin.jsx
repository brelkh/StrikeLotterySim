import { useState, useRef, useEffect } from 'react'
import { PRIZE_GROUPS, PRIZE_ODDS, SYSTEM_ENTRIES } from '../utils/toto.js'

export default function RunUntilWin() {
  const [targetGroup, setTargetGroup] = useState(7)
  const [entryType, setEntryType] = useState('ordinary')
  const [status, setStatus] = useState('idle') // idle | running | done
  const [displayCount, setDisplayCount] = useState(0)
  const [finalResult, setFinalResult] = useState(null)
  const workerRef = useRef(null)
  const animFrameRef = useRef(null)

  const config = SYSTEM_ENTRIES.find(e => e.type === entryType)
  const group = PRIZE_GROUPS.find(g => g.group === targetGroup)

  function startSim() {
    if (status === 'running') return
    setStatus('running')
    setDisplayCount(0)
    setFinalResult(null)

    // Clean up previous worker
    if (workerRef.current) workerRef.current.terminate()

    const worker = new Worker(
      new URL('../workers/totoSim.worker.js', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    worker.onmessage = ({ data }) => {
      const { tries, totalCost } = data
      animateCount(tries, totalCost)
      worker.terminate()
    }

    worker.onerror = (e) => {
      console.error('Worker error:', e)
      setStatus('idle')
    }

    worker.postMessage({ targetGroup, entryType, userNumbers: null })
  }

  function animateCount(finalTries, totalCost) {
    const duration = Math.min(2000, Math.max(600, finalTries * 0.5))
    const start = performance.now()
    let lastShown = 0

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * finalTries)

      if (current !== lastShown) {
        setDisplayCount(current)
        lastShown = current
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayCount(finalTries)
        setFinalResult({ tries: finalTries, totalCost })
        setStatus('done')
      }
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  const approxOdds = Math.round(PRIZE_ODDS[targetGroup] / config.combos)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Target group */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Win at least
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PRIZE_GROUPS.map(g => (
            <button
              key={g.group}
              onClick={() => { setTargetGroup(g.group); setFinalResult(null); setDisplayCount(0); setStatus('idle') }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${targetGroup === g.group ? 'var(--primary)' : 'var(--border)'}`,
                background: targetGroup === g.group ? 'var(--primary-dim)' : 'transparent',
                color: targetGroup === g.group ? 'var(--primary-hover)' : 'var(--text-dim)',
                fontSize: 13,
                fontWeight: targetGroup === g.group ? 600 : 400,
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <span>{g.label}</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>~1 in {PRIZE_ODDS[g.group].toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bet type (simplified) */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Bet type (per draw)
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SYSTEM_ENTRIES.map(e => (
            <button
              key={e.type}
              onClick={() => { setEntryType(e.type); setFinalResult(null); setDisplayCount(0); setStatus('idle') }}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: `1px solid ${entryType === e.type ? 'var(--primary)' : 'var(--border)'}`,
                background: entryType === e.type ? 'var(--primary-dim)' : 'transparent',
                color: entryType === e.type ? 'var(--primary-hover)' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: entryType === e.type ? 600 : 400,
              }}
            >
              {e.label} {e.cost > 1 ? `($${e.cost})` : '($1)'}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          Effective odds for {group.description}: ~1 in {approxOdds.toLocaleString()}
        </p>
      </div>

      {/* Run button */}
      <button
        onClick={startSim}
        disabled={status === 'running'}
        style={{
          background: status === 'running' ? 'var(--surface2)' : 'var(--primary)',
          color: status === 'running' ? 'var(--text-muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 24px',
          fontSize: 15,
          fontWeight: 600,
          cursor: status === 'running' ? 'not-allowed' : 'pointer',
          width: '100%',
          transition: 'background 0.15s',
        }}
      >
        {status === 'running' ? 'Simulating…' : 'Run Simulation'}
      </button>

      {/* Counter display */}
      {(status === 'running' || status === 'done') && (
        <div
          style={{
            borderRadius: 'var(--radius)',
            border: `1px solid ${status === 'done' ? 'var(--success)' : 'var(--border)'}`,
            background: status === 'done' ? 'rgba(74,222,128,0.06)' : 'var(--surface)',
            padding: '28px 24px',
            textAlign: 'center',
          }}
        >
          {status === 'running' && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, animation: 'pulse 1.2s ease infinite', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simulating draws…
            </p>
          )}

          <p style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: status === 'done' ? 'var(--success)' : 'var(--text)',
            animation: 'countUp 0.05s ease',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            marginBottom: 4,
          }}>
            {displayCount.toLocaleString()}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {status === 'running' ? 'draws so far' : 'draws to win'}
          </p>

          {finalResult && (
            <div className="fade-in" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
                <Stat label="Total spent" value={`$${finalResult.totalCost.toLocaleString()}`} />
                <Stat label="Prize group" value={group.label} />
                <Stat label="Odds" value={`1 in ${approxOdds.toLocaleString()}`} />
              </div>
              <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                🎉 You would have spent{' '}
                <strong style={{ color: 'var(--text)' }}>${finalResult.totalCost.toLocaleString()}</strong>{' '}
                to win {group.description.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{value}</p>
    </div>
  )
}
