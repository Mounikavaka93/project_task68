import { INDEX_BASE } from './constants.js'

export function percentChange(stock) {
  if (!stock?.prevClose) return 0
  return ((stock.price - stock.prevClose) / stock.prevClose) * 100
}

export function buildMarket(stocks) {
  const quotes = stocks.map((stock, listed) => ({
    ...stock,
    listed,
    change: percentChange(stock),
  }))

  const rel = quotes.reduce((sum, stock) => sum + stock.price / stock.prevClose, 0) / quotes.length
  const sorted = [...quotes].sort((a, b) => b.change - a.change)
  const buckets = new Map()

  for (const stock of quotes) {
    const bucket = buckets.get(stock.sector) || { sector: stock.sector, sum: 0, n: 0 }
    bucket.sum += stock.change
    bucket.n += 1
    buckets.set(stock.sector, bucket)
  }

  const advancers = quotes.filter((stock) => stock.change > 0.005).length
  const decliners = quotes.filter((stock) => stock.change < -0.005).length

  return {
    quotes,
    composite: INDEX_BASE * rel,
    change: (rel - 1) * 100,
    advancers,
    decliners,
    unchanged: quotes.length - advancers - decliners,
    volume: quotes.reduce((sum, stock) => sum + stock.volume, 0),
    sectors: [...buckets.values()]
      .map((bucket) => ({ sector: bucket.sector, change: bucket.sum / bucket.n }))
      .sort((a, b) => b.change - a.change),
    gainers: sorted.filter((stock) => stock.change > 0).slice(0, 5),
    losers: [...sorted].reverse().filter((stock) => stock.change < 0).slice(0, 5),
    trending: quotes
      .filter((stock) => stock.trending)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
  }
}
