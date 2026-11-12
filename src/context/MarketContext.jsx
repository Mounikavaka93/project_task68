import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STOCKS } from '../data/stocks.js'
import { useAuth } from './AuthContext.jsx'
import { FEE_RATE, OPENING_CASH, WATCH_KEY, bookKey } from '../lib/constants.js'
import { cents, money } from '../lib/format.js'
import { buildMarket } from '../lib/market.js'
import { loadJson } from '../lib/storage.js'

const MarketContext = createContext(null)

function emptyBook() {
  return { cash: OPENING_CASH, holdings: [], orders: [] }
}

function readBook(email) {
  if (!email) return emptyBook()
  const saved = loadJson(bookKey(email), null)
  if (!saved || typeof saved.cash !== 'number' || !Array.isArray(saved.holdings) || !Array.isArray(saved.orders)) {
    return emptyBook()
  }
  return {
    cash: saved.cash,
    holdings: saved.holdings.filter((holding) => holding && holding.symbol && holding.shares > 0),
    orders: saved.orders.filter((order) => order && order.id && order.symbol),
  }
}

export function MarketProvider({ children }) {
  const { user } = useAuth()
  const [stocks, setStocks] = useState(() => STOCKS.map((stock) => ({ ...stock, anchor: stock.price })))
  const [watchlist, setWatchlist] = useState(() => {
    const saved = loadJson(WATCH_KEY, [])
    return Array.isArray(saved) ? saved.filter((symbol) => typeof symbol === 'string') : []
  })
  const [ledger, setLedger] = useState(() => readBook(user?.email))
  const hydratedFor = useRef(user?.email ?? null)
  const ledgerRef = useRef(ledger)
  ledgerRef.current = ledger
  const [notice, setNotice] = useState(null)

  const market = useMemo(() => buildMarket(stocks), [stocks])

  useEffect(() => {
    const email = user?.email ?? null
    if (hydratedFor.current !== email) {
      hydratedFor.current = email
      const next = readBook(email)
      ledgerRef.current = next
      setLedger(next)
      return
    }
    if (email) localStorage.setItem(bookKey(email), JSON.stringify(ledger))
  }, [ledger, user])

  useEffect(() => {
    localStorage.setItem(WATCH_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), 3400)
    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const tick = () => {
      setStocks((prev) =>
        prev.map((stock) => {
          if (Math.random() > 0.62) return stock
          const noise = stock.anchor * (Math.random() - 0.5) * 0.0024
          const pull = (stock.anchor - stock.price) * 0.2
          const price = Math.max(0.5, Math.round((stock.price + pull + noise) * 100) / 100)
          if (price === stock.price) return stock
          return {
            ...stock,
            price,
            high: Math.max(stock.high, price),
            low: Math.min(stock.low, price),
            volume: stock.volume + Math.floor(Math.random() * 12000) + 500,
          }
        }),
      )
    }

    let timer = 0
    const stop = () => window.clearInterval(timer)
    const start = () => {
      stop()
      timer = window.setInterval(tick, 2800)
    }
    const onVisibility = () => {
      stop()
      if (document.visibilityState === 'visible') start()
    }
    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  function toggleWatch(symbol) {
    setWatchlist((prev) => (prev.includes(symbol) ? prev.filter((item) => item !== symbol) : [...prev, symbol]))
  }

  function placeOrder({ symbol, side, quantity, price }) {
    if (!user) return { ok: false, error: 'Log in to file a paper order.' }
    const stock = stocks.find((item) => item.symbol === symbol)
    if (!stock) return { ok: false, error: 'That name is not on the Haldenwick tape.' }
    if (side !== 'buy' && side !== 'sell') return { ok: false, error: 'Choose buy or sell.' }

    const qty = Number(String(quantity).trim())
    const px = Number(String(price).trim())
    if (!Number.isInteger(qty) || qty <= 0 || qty > 100000) {
      return { ok: false, error: 'Enter a whole number of shares, up to 100,000.' }
    }
    if (!Number.isFinite(px) || px <= 0 || px > 1000000) {
      return { ok: false, error: 'Enter a stock price above zero and under $1,000,000.' }
    }

    const notional = cents(qty * px)
    const fee = cents(notional * FEE_RATE)
    const book = ledgerRef.current
    let holdings = book.holdings.map((holding) => ({ ...holding }))
    let cash = book.cash
    let total

    if (side === 'buy') {
      total = cents(notional + fee)
      if (total > cash) {
        return {
          ok: false,
          error: `Not enough paper cash. This order needs ${money(total)} and the desk holds ${money(cash)}.`,
        }
      }
      cash = cents(cash - total)
      const existing = holdings.find((holding) => holding.symbol === symbol)
      if (!existing) {
        holdings = [...holdings, { symbol, shares: qty, avgCost: cents(total / qty) }]
      } else {
        const nextShares = existing.shares + qty
        holdings = holdings.map((holding) =>
          holding.symbol === symbol
            ? { ...holding, shares: nextShares, avgCost: cents((holding.shares * holding.avgCost + total) / nextShares) }
            : holding,
        )
      }
    } else {
      const existing = holdings.find((holding) => holding.symbol === symbol)
      const held = existing?.shares ?? 0
      if (qty > held) {
        return {
          ok: false,
          error: held === 0 ? `You do not hold ${symbol}.` : `You hold ${held} share${held === 1 ? '' : 's'} of ${symbol}.`,
        }
      }
      total = cents(notional - fee)
      cash = cents(cash + total)
      holdings =
        existing.shares === qty
          ? holdings.filter((holding) => holding.symbol !== symbol)
          : holdings.map((holding) => (holding.symbol === symbol ? { ...holding, shares: holding.shares - qty } : holding))
    }

    const order = {
      id: `HW-${Date.now().toString(36).toUpperCase()}`,
      time: Date.now(),
      symbol,
      name: stock.name,
      side,
      quantity: qty,
      price: cents(px),
      fee,
      total,
      status: 'Paper fill',
    }
    const next = { cash, holdings, orders: [order, ...book.orders].slice(0, 80) }
    ledgerRef.current = next
    setLedger(next)
    setNotice(`${side === 'buy' ? 'Bought' : 'Sold'} ${qty} ${symbol} at ${money(px)}. Paper fill only.`)
    return { ok: true, order }
  }

  function resetBook() {
    if (!user) return
    const next = emptyBook()
    ledgerRef.current = next
    setLedger(next)
    setNotice('Paper book reset. Cash is $100,000 again.')
  }

  const value = {
    market,
    watchlist,
    toggleWatch,
    ledger,
    placeOrder,
    resetBook,
    notice,
    dismissNotice: () => setNotice(null),
  }

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
}

export function useMarket() {
  const context = useContext(MarketContext)
  if (!context) throw new Error('useMarket must be used within MarketProvider')
  return context
}
