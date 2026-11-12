function hashString(value) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed) {
  let state = seed >>> 0
  return function rand() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function dailyLabels(count) {
  const start = 9 * 60 + 30
  const end = 16 * 60
  const step = (end - start) / (count - 1)
  return Array.from({ length: count }, (_, index) => {
    const mins = Math.round(start + step * index)
    const hh = String(Math.floor(mins / 60)).padStart(2, '0')
    const mm = String(mins % 60).padStart(2, '0')
    const tip = `${hh}:${mm}`
    return { tip, axis: index % 12 === 0 || index === count - 1 ? tip : '' }
  })
}

function weeklyLabels(count) {
  const per = count / 7
  const start = new Date()
  start.setHours(12, 0, 0, 0)
  start.setDate(start.getDate() - 6)
  const slots = ['Open', 'Mid-morning', 'Midday', 'Afternoon', 'Close']
  return Array.from({ length: count }, (_, index) => {
    const dayIndex = Math.min(6, Math.floor(index / per))
    const date = new Date(start)
    date.setDate(start.getDate() + dayIndex)
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
    return {
      tip: `${weekday} · ${slots[index % slots.length]}`,
      axis: index % per === 0 ? weekday : '',
    }
  })
}

function monthlyLabels(count) {
  const start = new Date()
  start.setHours(12, 0, 0, 0)
  start.setDate(start.getDate() - (count - 1))
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const tip = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { tip, axis: index % 5 === 0 ? tip : '' }
  })
}

export function buildSeries(stock, range) {
  const count = range === 'D' ? 48 : range === 'W' ? 35 : 30
  const rand = mulberry32(hashString(`${stock.symbol}:${range}:haldenwick`))
  let startPrice = stock.open
  if (range !== 'D') {
    const width = range === 'W' ? 0.08 : 0.16
    startPrice = stock.prevClose * (1 + (rand() - 0.5) * width)
  }

  const vol = range === 'D' ? 0.0032 : range === 'W' ? 0.006 : 0.009
  const raw = []
  let noise = 0
  for (let i = 0; i < count; i += 1) {
    noise += (rand() - 0.5) * vol * stock.prevClose
    raw.push(noise)
  }

  const labels = range === 'D' ? dailyLabels(count) : range === 'W' ? weeklyLabels(count) : monthlyLabels(count)
  const points = raw.map((value, index) => {
    const t = index / (count - 1)
    const bridge = raw[0] + (raw[count - 1] - raw[0]) * t
    const price = startPrice + (stock.price - startPrice) * t + (value - bridge)
    return {
      value: Math.max(0.5, Math.round(price * 100) / 100),
      axis: labels[index].axis,
      tip: labels[index].tip,
    }
  })

  points[0] = { ...points[0], value: Math.round(startPrice * 100) / 100 }
  points[points.length - 1] = {
    ...points[points.length - 1],
    value: Math.round(stock.price * 100) / 100,
  }
  return points
}
