import { formatPct } from '../lib/format.js'

export function ChangeText({ value, tone = 'light', className = '' }) {
  const up = value > 0.004
  const down = value < -0.004
  const color = up
    ? tone === 'dark'
      ? 'text-pine-bright'
      : 'text-pine'
    : down
      ? tone === 'dark'
        ? 'text-coral-bright'
        : 'text-coral'
      : tone === 'dark'
        ? 'text-paper/70'
        : 'text-mist'

  return (
    <span className={`tabular-nums ${color} ${className}`}>
      {up ? <span aria-hidden="true">▲ </span> : null}
      {down ? <span aria-hidden="true">▼ </span> : null}
      {formatPct(value)}
    </span>
  )
}

export function MoveBar({ value }) {
  const width = Math.min(100, Math.abs(value) * 8)
  return (
    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-paper-2" aria-hidden="true">
      <span
        className={`block h-full rounded-full transition-all duration-700 ${value >= 0 ? 'bg-pine' : 'bg-coral'}`}
        style={{ width: `${width}%` }}
      />
    </span>
  )
}
