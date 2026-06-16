export default function NumberBall({ number, state = 'default', small = false }) {
  // state: 'default' | 'selected' | 'winning' | 'additional' | 'matched' | 'missed'
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: small ? 32 : 44,
    height: small ? 32 : 44,
    borderRadius: '50%',
    fontSize: small ? 12 : 15,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    flexShrink: 0,
    ...stateStyle(state),
  }

  return <span style={styles}>{number}</span>
}

function stateStyle(state) {
  switch (state) {
    case 'selected':
      return { background: 'var(--primary)', color: '#fff', boxShadow: '0 0 0 2px rgba(124,111,247,0.4)' }
    case 'winning':
      return { background: 'var(--accent)', color: '#0a0a0f' }
    case 'additional':
      return { background: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)' }
    case 'matched':
      return { background: 'var(--success)', color: '#0a0a0f' }
    case 'missed':
      return { background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
    default:
      return { background: 'var(--surface2)', color: 'var(--text-dim)', border: '1px solid var(--border)' }
  }
}
