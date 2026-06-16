import NumberBall from './NumberBall.jsx'

export default function NumberGrid({ selected, onToggle, max, disabled = false }) {
  const nums = Array.from({ length: 49 }, (_, i) => i + 1)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 6,
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
    }}>
      {nums.map(n => {
        const isSelected = selected.includes(n)
        const atMax = selected.length >= max
        return (
          <button
            key={n}
            onClick={() => onToggle(n)}
            disabled={!isSelected && atMax}
            style={{
              all: 'unset',
              cursor: (!isSelected && atMax) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NumberBall
              number={n}
              state={isSelected ? 'selected' : 'default'}
              small
            />
          </button>
        )
      })}
    </div>
  )
}
