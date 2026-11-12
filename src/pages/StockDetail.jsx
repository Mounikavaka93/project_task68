import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChangeText } from '../components/ChangeText.jsx'
import PriceFlash from '../components/PriceFlash.jsx'
import StockChart from '../components/StockChart.jsx'
import WatchButton from '../components/WatchButton.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import { compact, formatCap, formatSignedMoney, money } from '../lib/format.js'
import { buildSeries } from '../lib/series.js'
import { btnCoral, btnGhost, btnPine } from '../lib/styles.js'
import { usePageTitle } from '../lib/usePageTitle.js'

const RANGES = [
  { id: 'D', label: 'Daily' },
  { id: 'W', label: 'Weekly' },
  { id: 'M', label: 'Monthly' },
]

const RANGE_NOTE = {
  D: 'One session, from the open to the latest paper print.',
  W: 'Seven days of paper prices, five prints a day.',
  M: 'Thirty daily paper closes, ending today.',
}

export default function StockDetail() {
  const { symbol: symbolParam = '' } = useParams()
  const symbol = symbolParam.toUpperCase()
  const { market, watchlist, toggleWatch } = useMarket()
  const stock = market.quotes.find((quote) => quote.symbol === symbol)
  const [range, setRange] = useState('D')
  usePageTitle(stock ? stock.name : 'Stock not listed')

  const series = useMemo(() => {
    if (!stock) return []
    return buildSeries(stock, range)
  }, [stock, range])

  if (!stock) {
    return (
      <div className="py-12">
        <p className="text-xs uppercase tracking-[0.18em] text-brass">Missing name</p>
        <h1 className="mt-3 font-display text-4xl">That symbol is not on the tape.</h1>
        <Link to="/markets" className={`${btnGhost} mt-6`}>
          Back to the dashboard
        </Link>
      </div>
    )
  }

  const dollar = stock.price - stock.prevClose
  const span = Math.max(stock.high - stock.low, 0.01)
  const pos = Math.min(100, Math.max(0, ((stock.price - stock.low) / span) * 100))
  const peers = market.quotes.filter((quote) => quote.sector === stock.sector && quote.symbol !== stock.symbol).slice(0, 3)

  return (
    <div>
      <Link to="/markets" className="text-sm text-mist transition hover:text-brass">
        ← Stock market dashboard
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass">
            {stock.symbol} · {stock.sector}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{stock.name}</h1>
        </div>
        <WatchButton symbol={stock.symbol} active={watchlist.includes(stock.symbol)} onToggle={toggleWatch} />
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <PriceFlash value={stock.price} format={money} className="font-display text-5xl" />
          <p className="mt-2 flex flex-wrap items-center gap-3">
            <ChangeText value={stock.change} className="text-lg" />
            <span className={`tabular-nums ${dollar >= 0 ? 'text-pine' : 'text-coral'}`}>{formatSignedMoney(dollar)}</span>
            <span className="text-sm text-mist">vs previous close</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/trade/${stock.symbol}?side=buy`} className={btnPine}>
            Buy
          </Link>
          <Link to={`/trade/${stock.symbol}?side=sell`} className={btnCoral}>
            Sell
          </Link>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-line bg-white/80 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Price</h2>
          <div className="flex rounded-full bg-paper-2 p-1" role="group" aria-label="Price range">
            {RANGES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={range === item.id}
                onClick={() => setRange(item.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${range === item.id ? 'bg-ink text-paper' : 'text-mist hover:text-ink'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-sm text-mist">{RANGE_NOTE[range]} Hover the line to read a print.</p>
        <div className="mt-4 min-w-0">
          <StockChart points={series} animateKey={`${stock.symbol}-${range}`} variant="full" />
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-line bg-white/80 p-5 lg:col-span-2">
          <h2 className="font-display text-2xl">Session stats</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              ['Open', money(stock.open)],
              ['Prev close', money(stock.prevClose)],
              ['Session high', money(stock.high)],
              ['Session low', money(stock.low)],
              ['Volume', compact(stock.volume)],
              ['Market cap', formatCap(stock.marketCap)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-mist">{label}</dt>
                <dd className="mt-1 tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <p className="text-sm text-mist">Day range</p>
            <div className="relative mt-3 h-1.5 rounded-full bg-paper-2">
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-paper transition-all duration-700"
                style={{ left: `${pos}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs tabular-nums text-mist">
              <span>{money(stock.low)}</span>
              <span>{money(stock.high)}</span>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-white/80 p-5">
          <h2 className="font-display text-2xl">About</h2>
          <p className="mt-3 text-sm leading-6 text-mist">{stock.about}</p>
          {peers.length > 0 ? (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.16em] text-brass">Same sector</p>
              <ul className="mt-2 space-y-2">
                {peers.map((peer) => (
                  <li key={peer.symbol}>
                    <Link to={`/stock/${peer.symbol}`} className="flex items-center justify-between gap-3 text-sm hover:text-brass">
                      <span>{peer.symbol}</span>
                      <ChangeText value={peer.change} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
