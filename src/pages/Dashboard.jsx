import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BreadthBar from '../components/BreadthBar.jsx'
import { ChangeText } from '../components/ChangeText.jsx'
import MoversList from '../components/MoversList.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PriceFlash from '../components/PriceFlash.jsx'
import ResetBookButton from '../components/ResetBookButton.jsx'
import Stat from '../components/Stat.jsx'
import WatchButton from '../components/WatchButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import { compact, formatIndex, formatSignedMoney, money } from '../lib/format.js'
import { btnGhost, btnInk, inputClass } from '../lib/styles.js'
import { usePageTitle } from '../lib/usePageTitle.js'

function SortHeader({ label, sortKey, sort, onSort, align = 'left', className = '' }) {
  const active = sort.key === sortKey
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`px-4 align-middle ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex w-full items-center gap-1 py-3 font-medium ${align === 'right' ? 'justify-end' : 'justify-start'} ${active ? 'text-ink' : 'text-mist'} hover:text-brass`}
      >
        {label}
        <span aria-hidden="true">{active ? (sort.dir === 'asc' ? '↑' : '↓') : ''}</span>
      </button>
    </th>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { market, watchlist, toggleWatch, ledger } = useMarket()
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('All')
  const [sort, setSort] = useState({ key: 'listed', dir: 'asc' })
  usePageTitle('Stock market dashboard')

  const sectors = useMemo(() => ['All', ...new Set(market.quotes.map((quote) => quote.sector))], [market.quotes])
  const needle = query.trim().toLowerCase()
  const rows = useMemo(() => {
    const filtered = market.quotes.filter((quote) => {
      const sectorOk = sector === 'All' || quote.sector === sector
      const textOk = !needle || quote.symbol.toLowerCase().includes(needle) || quote.name.toLowerCase().includes(needle)
      return sectorOk && textOk
    })
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      if (sort.key === 'name') return a.name.localeCompare(b.name) * dir
      if (sort.key === 'symbol') return a.symbol.localeCompare(b.symbol) * dir
      if (sort.key === 'price') return (a.price - b.price) * dir
      if (sort.key === 'change') return (a.change - b.change) * dir
      if (sort.key === 'volume') return (a.volume - b.volume) * dir
      return (a.listed - b.listed) * dir
    })
  }, [market.quotes, needle, sector, sort])

  const watched = watchlist.map((symbol) => market.quotes.find((quote) => quote.symbol === symbol)).filter(Boolean)
  const positions = ledger.holdings.map((holding) => {
    const quote = market.quotes.find((item) => item.symbol === holding.symbol)
    const last = quote?.price ?? holding.avgCost
    const value = last * holding.shares
    const pnl = (last - holding.avgCost) * holding.shares
    return {
      ...holding,
      name: quote?.name || holding.symbol,
      last,
      value,
      pnl,
      pnlPct: holding.avgCost ? ((last - holding.avgCost) / holding.avgCost) * 100 : 0,
    }
  })
  const equity = ledger.cash + positions.reduce((sum, position) => sum + position.value, 0)
  const openPnl = positions.reduce((sum, position) => sum + position.pnl, 0)

  function onSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: key === 'name' || key === 'symbol' ? 'asc' : 'desc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div>
      <PageHeader
        kicker="The tape"
        title="Stock market dashboard"
        lede="Prices, percentage changes, and a paper book. Every name on this desk is invented, and every fill is imaginary."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Haldenwick Fifteen" value={formatIndex(market.composite)} detail="equal-weight paper index" />
        <Stat label="Advancers" value={market.advancers} detail={`${market.decliners} declining`} />
        <Stat label="Session volume" value={compact(market.volume)} detail="dummy shares" />
        <Stat label="Showing" value={rows.length} detail={sector === 'All' ? 'all sectors' : sector} />
      </div>
      <div className="mt-4 rounded-3xl border border-line bg-white/80 p-5">
        <BreadthBar advancers={market.advancers} decliners={market.decliners} unchanged={market.unchanged} total={market.quotes.length} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <label className="sr-only" htmlFor="tape-search">
          Search stocks
        </label>
        <input
          id="tape-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or symbol"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-2">
          {sectors.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={sector === name}
              onClick={() => setSector(name)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                sector === name ? 'bg-ink text-paper' : 'border border-line bg-white text-ink hover:border-brass'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-dashed border-line px-4 py-10 text-center text-sm text-mist">
          No names match that filter.
        </p>
      ) : (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {rows.map((quote) => (
              <article key={quote.symbol} className="rounded-2xl border border-line bg-white/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/stock/${quote.symbol}`} className="font-medium hover:text-brass">
                      {quote.symbol}
                    </Link>
                    <p className="text-sm text-mist">{quote.name}</p>
                  </div>
                  <WatchButton symbol={quote.symbol} active={watchlist.includes(quote.symbol)} onToggle={toggleWatch} />
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <PriceFlash value={quote.price} format={money} className="font-display text-2xl" />
                  <ChangeText value={quote.change} />
                </div>
                <Link to={`/trade/${quote.symbol}`} className={`${btnGhost} mt-4 w-full`}>
                  Trade
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-4 hidden overflow-x-auto rounded-3xl border border-line bg-white/80 md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Haldenwick stock tape with prices and percentage changes</caption>
              <thead>
                <tr className="border-b border-line">
                  <SortHeader label="Symbol" sortKey="symbol" sort={sort} onSort={onSort} />
                  <SortHeader label="Name" sortKey="name" sort={sort} onSort={onSort} />
                  <SortHeader label="Price" sortKey="price" sort={sort} onSort={onSort} align="right" />
                  <SortHeader label="Change" sortKey="change" sort={sort} onSort={onSort} align="right" />
                  <SortHeader label="Volume" sortKey="volume" sort={sort} onSort={onSort} align="right" />
                  <th scope="col" className="px-4 py-3 text-right align-middle font-medium text-mist">
                    Desk
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((quote) => (
                  <tr key={quote.symbol} className="border-t border-line transition hover:bg-paper">
                    <td className="px-4 py-3 align-middle font-medium">
                      <Link to={`/stock/${quote.symbol}`} className="hover:text-brass">
                        {quote.symbol}
                      </Link>
                    </td>
                    <td className="max-w-48 truncate px-4 py-3 align-middle text-mist">{quote.name}</td>
                    <td className="px-4 py-3 text-right align-middle">
                      <PriceFlash value={quote.price} format={money} />
                    </td>
                    <td className="px-4 py-3 text-right align-middle">
                      <ChangeText value={quote.change} />
                    </td>
                    <td className="px-4 py-3 text-right align-middle tabular-nums text-mist">{compact(quote.volume)}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <WatchButton symbol={quote.symbol} active={watchlist.includes(quote.symbol)} onToggle={toggleWatch} />
                        <Link to={`/trade/${quote.symbol}`} className="rounded-full border border-line px-3 py-1.5 text-sm transition hover:border-brass">
                          Trade
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <MoversList title="Top gainers" rows={market.gainers} empty="No names are printing higher." />
        <MoversList title="Top losers" rows={market.losers} empty="No names are printing lower." />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-white/80 p-5">
          <h2 className="font-display text-2xl">Watchlist</h2>
          {watched.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-mist">Pin names from the tape. Stars stay in this browser.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {watched.map((quote) => (
                <li key={quote.symbol} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link to={`/stock/${quote.symbol}`} className="font-medium hover:text-brass">
                      {quote.symbol}
                    </Link>
                    <p className="truncate text-sm text-mist">{quote.name}</p>
                  </div>
                  <div className="w-28 shrink-0 text-right">
                    <p className="tabular-nums">{money(quote.price)}</p>
                    <ChangeText value={quote.change} className="text-sm" />
                  </div>
                  <WatchButton symbol={quote.symbol} active onToggle={toggleWatch} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-line bg-white/80 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-display text-2xl">Portfolio</h2>
            <ResetBookButton />
          </div>
          {!user ? (
            <div className="mt-3">
              <p className="text-sm leading-6 text-mist">Sign in to keep paper cash, holdings, and fills on this desk.</p>
              <div className="mt-4 flex gap-2">
                <Link to="/login" className={btnGhost}>
                  Login
                </Link>
                <Link to="/signup" className={btnInk}>
                  Sign up
                </Link>
              </div>
            </div>
          ) : (
            <>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-mist">Cash</dt>
                  <dd className="mt-1 tabular-nums">{money(ledger.cash)}</dd>
                </div>
                <div>
                  <dt className="text-mist">Equity</dt>
                  <dd className="mt-1 tabular-nums">{money(equity)}</dd>
                </div>
                <div>
                  <dt className="text-mist">Open P/L</dt>
                  <dd className={`mt-1 tabular-nums ${openPnl >= 0 ? 'text-pine' : 'text-coral'}`}>{formatSignedMoney(openPnl)}</dd>
                </div>
              </dl>
              {positions.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-mist">
                  No positions yet. Your paper cash is {money(ledger.cash)}.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {positions.map((position) => (
                    <li key={position.symbol} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <Link to={`/stock/${position.symbol}`} className="font-medium hover:text-brass">
                          {position.symbol}
                        </Link>
                        <p className="text-sm text-mist">
                          {position.shares} shares · avg {money(position.avgCost)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="tabular-nums">{money(position.value)}</p>
                        <ChangeText value={position.pnlPct} className="text-sm" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/trade" className={`${btnInk} mt-4`}>
                Buy & sell
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
