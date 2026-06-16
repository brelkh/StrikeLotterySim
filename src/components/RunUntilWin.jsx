import { useState, useRef, useEffect } from 'react'
import { PRIZE_GROUPS, PRIZE_ODDS, SYSTEM_ENTRIES } from '../utils/toto.js'

// Group 7 (easiest) shown first; Group 1 (jackpot) at the bottom
const DISPLAY_GROUPS = [...PRIZE_GROUPS].reverse()

// Warn the user when a simulation is expected to take many seconds
const SLOW_GROUPS = new Set([1, 2, 3])

export default function RunUntilWin() {
  const [targetGroup, setTargetGroup] = useState(7)
  const [entryType, setEntryType] = useState('ordinary')
  const [status, setStatus] = useState('idle') // idle | running | done
  const [displayCount, setDisplayCount] = useState(0)
  const [finalResult, setFinalResult] = useState(null)
  const workerRef = useRef(null)
  const animFrameRef = useRef(null)
  const lastProgressRef = useRef(0)

  const config = SYSTEM_ENTRIES.find(e => e.type === entryType)
  const group = PRIZE_GROUPS.find(g => g.group === targetGroup)
  const approxOdds = Math.round(PRIZE_ODDS[targetGroup] / config.combos)
  const expectedTries = approxOdds
  const isSlow = SLOW_GROUPS.has(targetGroup)

  function resetSim() {
    setFinalResult(null)
    setDisplayCount(0)
    setStatus('idle')
    lastProgressRef.current = 0
  }

  function startSim() {
    if (status === 'running') return
    setStatus('running')
    setDisplayCount(0)
    setFinalResult(null)
    lastProgressRef.current = 0

    if (workerRef.current) workerRef.current.terminate()
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    const worker = new Worker(
      new URL('../workers/totoSim.worker.js', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') {
        lastProgressRef.current = data.tries
        setDisplayCount(data.tries)
      } else if (data.type === 'done') {
        const { tries, totalCost } = data
        worker.terminate()
        // Short ease-in to the final number from wherever the live counter is
        animateFinal(lastProgressRef.current, tries, totalCost)
      }
    }

    worker.onerror = () => setStatus('idle')
    worker.postMessage({ targetGroup, entryType, userNumbers: null })
  }

  function animateFinal(from, to, totalCost) {
    const gap = to - from
    // If live counter already got close, just snap; otherwise short ease
    if (gap < 5000) {
      setDisplayCount(to)
      setFinalResult({ tries: to, totalCost })
      setStatus('done')
      return
    }
    const duration = Math.min(1200, Math.max(400, gap * 0.2))
    const start = performance.now()
    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayCount(Math.round(from + eased * gap))
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayCount(to)
        setFinalResult({ tries: to, totalCost })
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

  const progressPct = expectedTries > 0
    ? Math.min((displayCount / expectedTries) * 100, 99)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Target group — Group 7 (easiest) at top */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Win at least
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DISPLAY_GROUPS.map(g => (
            <button
              key={g.group}
              onClick={() => { setTargetGroup(g.group); resetSim() }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', opacity: targetGroup === g.group ? 1 : 0.65 }}>
                  {g.prizeEst}
                </span>
                <span style={{ fontSize: 11, opacity: 0.5 }}>~1 in {PRIZE_ODDS[g.group].toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bet type */}
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Bet type (per draw)
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SYSTEM_ENTRIES.map(e => (
            <button
              key={e.type}
              onClick={() => { setEntryType(e.type); resetSim() }}
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

      {/* Slow-group warning */}
      {isSlow && status === 'idle' && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(247,201,111,0.08)',
          border: '1px solid rgba(247,201,111,0.25)',
          fontSize: 12,
          color: 'var(--text-muted)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span>⚠️</span>
          <span>
            {targetGroup === 1
              ? 'Group 1 requires ~14 million draws on average. Expect 5–15 seconds.'
              : targetGroup === 2
              ? 'Group 2 requires ~2.3 million draws on average. Expect a few seconds.'
              : 'Group 3 requires ~55,000 draws on average. May take a moment.'}
          </span>
        </div>
      )}

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
            <>
              <p style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 12,
                animation: 'pulse 1.2s ease infinite',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Simulating draws…
              </p>
              {/* Progress bar */}
              <div style={{
                height: 3,
                borderRadius: 99,
                background: 'var(--border)',
                marginBottom: 16,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'var(--primary)',
                  borderRadius: 99,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </>
          )}

          <p style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: status === 'done' ? 'var(--success)' : 'var(--text)',
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
              <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
                <Stat label="Total spent" value={`$${finalResult.totalCost.toLocaleString()}`} />
                <Stat label="Prize group" value={group.label} />
                <Stat label="Est. prize" value={group.prizeEst} note={group.prizeNote} />
                <Stat label="Odds" value={`1 in ${approxOdds.toLocaleString()}`} />
              </div>
              <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                🎉 You would have spent{' '}
                <strong style={{ color: 'var(--text)' }}>${finalResult.totalCost.toLocaleString()}</strong>{' '}
                to win {group.description.toLowerCase()} ({group.prizeEst}).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, note }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{value}</p>
      {note && <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, maxWidth: 80 }}>{note}</p>}
    </div>
  )
}
