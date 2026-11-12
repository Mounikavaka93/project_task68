import { useEffect, useRef, useState } from 'react'

export default function PriceFlash({ value, format, className = '' }) {
  const previous = useRef(value)
  const [dir, setDir] = useState(null)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (value === previous.current) return undefined
    setDir(value > previous.current ? 'up' : 'down')
    setPulse((count) => count + 1)
    previous.current = value
    return undefined
  }, [value])

  return (
    <span
      key={pulse}
      className={`-mx-1 inline-block rounded-md px-1 tabular-nums ${dir === 'up' ? 'flash-up' : ''} ${dir === 'down' ? 'flash-down' : ''} ${className}`}
    >
      {format(value)}
    </span>
  )
}
