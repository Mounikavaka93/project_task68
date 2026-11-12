import { useId, useState } from 'react'
import { axisPrice, money } from '../lib/format.js'

const SPECS = {
  spark: { width: 320, height: 88, pad: { l: 4, r: 4, t: 8, b: 6 }, axis: false },
  feature: { width: 640, height: 220, pad: { l: 8, r: 8, t: 12, b: 10 }, axis: true },
  full: { width: 720, height: 300, pad: { l: 8, r: 8, t: 16, b: 12 }, axis: true },
}

export default function StockChart({ points, animateKey, variant = 'full' }) {
  const spec = SPECS[variant] || SPECS.full
  const gradientId = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [hover, setHover] = useState(null)

  if (!points || points.length < 2) return null

  const values = points.map((point) => point.value)
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) {
    min -= 1
    max += 1
  }
  const span = max - min
  min -= span * 0.08
  max += span * 0.08

  const innerW = spec.width - spec.pad.l - spec.pad.r
  const innerH = spec.height - spec.pad.t - spec.pad.b
  const coords = points.map((point, index) => ({
    x: spec.pad.l + (index / (points.length - 1)) * innerW,
    y: spec.pad.t + (1 - (point.value - min) / (max - min)) * innerH,
  }))
  const line = coords.map((coord, index) => `${index === 0 ? 'M' : 'L'}${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`).join(' ')
  const area = `${line} L${coords[coords.length - 1].x.toFixed(2)} ${(spec.pad.t + innerH).toFixed(2)} L${coords[0].x.toFixed(2)} ${(spec.pad.t + innerH).toFixed(2)} Z`
  const positive = points[points.length - 1].value >= points[0].value
  const stroke = positive ? '#0f6a40' : '#9d332c'
  const yLabels = [0, 1, 2, 3].map((step) => {
    const value = max - ((max - min) / 3) * step
    const y = spec.pad.t + (innerH / 3) * step
    return { value, y }
  })
  const xTicks = points
    .map((point, index) => ({ ...point, index, x: coords[index].x }))
    .filter((point) => point.axis)

  function move(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    const viewX = ratio * spec.width
    const indexRatio = (viewX - spec.pad.l) / innerW
    const index = Math.round(Math.min(1, Math.max(0, indexRatio)) * (points.length - 1))
    setHover(index)
  }

  const hovered = hover == null ? null : { ...coords[hover], point: points[hover], index: hover }
  const chart = (
    <svg
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      className={`block h-auto w-full ${spec.axis ? 'cursor-crosshair touch-none' : ''}`}
      role="img"
      aria-label={`Price chart ending at ${money(points[points.length - 1].value)}`}
      onPointerMove={spec.axis ? move : undefined}
      onPointerLeave={spec.axis ? () => setHover(null) : undefined}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {spec.axis
        ? yLabels.map((label) => (
            <line
              key={label.y}
              x1={spec.pad.l}
              x2={spec.width - spec.pad.r}
              y1={label.y}
              y2={label.y}
              stroke="#e6dfd0"
              strokeWidth="1"
            />
          ))
        : null}
      <g key={animateKey} className="chart-reveal">
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth={variant === 'spark' ? 2 : 2.4} strokeLinejoin="round" strokeLinecap="round" />
        <circle className="pulse-dot" cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r={variant === 'spark' ? 2.5 : 3.5} fill={stroke} />
      </g>
      {hovered && spec.axis ? (
        <g>
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={spec.pad.t}
            y2={spec.pad.t + innerH}
            stroke={stroke}
            strokeDasharray="3 3"
            strokeOpacity="0.75"
          />
          <circle cx={hovered.x} cy={hovered.y} r="4.5" fill="#f3efe6" stroke={stroke} strokeWidth="2" />
        </g>
      ) : null}
    </svg>
  )

  if (!spec.axis) return chart

  const percent = hovered ? (hovered.x / spec.width) * 100 : 0
  const shift = percent > 78 ? '-100%' : percent < 18 ? '0%' : '-50%'

  return (
    <div className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-2">
      <div className="relative h-full self-stretch">
        {yLabels.map((label) => (
          <span
            key={label.y}
            className="absolute right-0 -translate-y-1/2 text-[11px] tabular-nums text-mist"
            style={{ top: `${(label.y / spec.height) * 100}%` }}
          >
            {axisPrice(label.value)}
          </span>
        ))}
      </div>
      <div className="relative min-w-0">
        {chart}
        {hovered ? (
          <div
            className="pointer-events-none absolute top-2 z-10 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs text-ink shadow-sm"
            style={{ left: `${percent}%`, transform: `translateX(${shift})` }}
          >
            <div className="text-mist">{hovered.point.tip}</div>
            <div className="font-medium tabular-nums">{money(hovered.point.value)}</div>
          </div>
        ) : null}
      </div>
      <div className="relative col-start-2 mt-2 h-5">
        {xTicks.map((tick) => {
          const left = (tick.x / spec.width) * 100
          const shift = left > 88 ? '-100%' : left < 12 ? '0%' : '-50%'
          return (
            <span
              key={`${tick.tip}-${tick.index}`}
              className="absolute text-[11px] whitespace-nowrap text-mist"
              style={{ left: `${left}%`, transform: `translateX(${shift})` }}
            >
              {tick.axis}
            </span>
          )
        })}
      </div>
    </div>
  )
}
