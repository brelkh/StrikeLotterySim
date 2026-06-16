import { PRIZE_GROUPS } from '../utils/toto.js'
import NumberBall from './NumberBall.jsx'

export default function DrawResult({ draw, userEntry, bestGroup, animate = false }) {
  if (!draw) return null

  const winSet = new Set(draw.winning)
  const entrySet = new Set(userEntry || [])
  const won = bestGroup !== null
  const group = PRIZE_GROUPS.find(g => g.group === bestGroup)

  return (
    <div
      className={animate ? 'fade-in' : ''}
      style={{
        borderRadius: 'var(--radius)',
        border: `1px solid ${won ? 'var(--success)' : 'var(--border)'}`,
        background: won ? 'rgba(74,222,128,0.06)' : 'var(--surface)',
        padding: '20px 24px',
      }}
    >
      {/* Draw numbers */}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Winning Numbers
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
        {draw.winning.map(n => (
          <NumberBall key={n} number={n} state={entrySet.has(n) ? 'matched' : 'winning'} />
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+</span>
          <NumberBall
            number={draw.additional}
            state={entrySet.has(draw.additional) ? 'matched' : 'additional'}
          />
        </div>
      </div>

      {userEntry && (
        <>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Numbers
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {[...userEntry].sort((a, b) => a - b).map(n => (
              <NumberBall key={n} number={n} state={winSet.has(n) || n === draw.additional ? 'matched' : 'missed'} />
            ))}
          </div>
        </>
      )}

      {/* Result banner */}
      <div
        className={animate ? 'pop' : ''}
        style={{
          marginTop: 4,
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: won ? 'rgba(74,222,128,0.12)' : 'var(--surface2)',
          border: `1px solid ${won ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 22 }}>{won ? '🎉' : '😔'}</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: won ? 'var(--success)' : 'var(--text)' }}>
            {won ? group.label : 'No prize'}
          </p>
          {won && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{group.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
