export function cents(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100
}

export function money(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatSignedMoney(n) {
  const abs = money(Math.abs(n))
  if (n > 0.004) return `+${abs}`
  if (n < -0.004) return `−${abs}`
  return money(0)
}

export function formatPct(n) {
  const rounded = Math.round(n * 100) / 100
  const body = `${Math.abs(rounded).toFixed(2)}%`
  if (rounded > 0) return `+${body}`
  if (rounded < 0) return `−${body}`
  return body
}

export function formatIndex(n) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function compact(n) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

export function formatCap(n) {
  return `$${compact(n)}`
}

export function formatTime(ts) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(ts)
}

export function axisPrice(n) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
