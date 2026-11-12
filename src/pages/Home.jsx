import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import BreadthBar from '../components/BreadthBar.jsx'
import { ChangeText } from '../components/ChangeText.jsx'
import MoversList from '../components/MoversList.jsx'
import PriceFlash from '../components/PriceFlash.jsx'
import Stat from '../components/Stat.jsx'
import StockChart from '../components/StockChart.jsx'
import WatchButton from '../components/WatchButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import { compact, formatIndex, money } from '../lib/format.js'
import { buildSeries } from '../lib/series.js'
import { btnGhost, btnInk } from '../lib/styles.js'
import { usePageTitle } from '../lib/usePageTitle.js'

function Spark({ stock }) {
  const points = useMemo(
    () => buildSeries(stock, 'D'),
    [stock.symbol, stock.price, stock.open, stock.prevClose],
  )
  return <StockChart points={points} animateKey={`${stock.symbol}-D`} variant="spark" />
}

export default function Home() {
  const { user } = useAuth()
  const { market, watchlist, toggleWatch } = useMarket()
  usePageTitle('Paper markets')

  const featured = market.trending[0]
  const rest = market.trending.slice(1, 5)
  const featuredSeries = useMemo(() => {
    if (!featured) return []
    return buildSeries(featured, 'D')
  }, [featured])

  return (
    <div className="space-y-16">
      <section className="grid items-stretch gap-8 lg:grid-cols-12">
        <div className="relative lg:col-span-7">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brass">Vol. 07 · Paper session</p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            The market, <span className="text-brass italic">printed</span> before it is spent.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-mist">
            Haldenwick is a practice desk. Follow a simulated tape of invented companies, pin a watchlist, and file buy or sell orders that never leave this browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/markets" className={btnInk}>
              Open the dashboard
            </Link>
            {user ? (
              <Link to="/trade" className={btnGhost}>
                File an order
              </Link>
            ) : (
              <Link to="/signup" className={btnGhost}>
                Sign up
              </Link>
            )}
          </div>
        </div>
        <aside className="rounded-3xl bg-ink p-6 text-paper shadow-[0_18px_50px_-28px_rgba(22,20,15,0.8)] lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.18em] text-brass-bright">Session brief</p>
          <p className="mt-6 text-sm text-paper/70">Haldenwick Fifteen</p>
          <p className="mt-1 font-display text-5xl">
            <PriceFlash value={market.composite} format={formatIndex} className="text-paper" />
          </p>
          <p className="mt-2">
            <ChangeText value={market.change} tone="dark" />
          </p>
          <ul className="mt-6 space-y-3 border-t border-white/10 pt-4">
            {market.sectors.slice(0, 5).map((sector) => (
              <li key={sector.sector} className="flex items-center justify-between gap-3 text-sm">
                <span>{sector.sector}</span>
                <ChangeText value={sector.change} tone="dark" />
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section aria-labelledby="overview-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass">Market overview</p>
            <h2 id="overview-heading" className="mt-2 font-display text-3xl sm:text-4xl">
              How the paper session is leaning
            </h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Advancers" value={market.advancers} detail={`of ${market.quotes.length} names`} />
          <Stat label="Decliners" value={market.decliners} detail="printed below the prior close" />
          <Stat label="Session volume" value={compact(market.volume)} detail="shares on the dummy tape" />
          <Stat label="Names" value={market.quotes.length} detail="invented companies, no live feed" />
        </div>
        <div className="mt-4 rounded-3xl border border-line bg-white/80 p-5">
          <BreadthBar
            advancers={market.advancers}
            decliners={market.decliners}
            unchanged={market.unchanged}
            total={market.quotes.length}
          />
        </div>
      </section>

      <section aria-labelledby="trending-heading">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass">Trending stocks</p>
          <h2 id="trending-heading" className="mt-2 font-display text-3xl sm:text-4xl">
            Names with the loudest paper move
          </h2>
        </div>
        {featured ? (
          <div className="grid gap-4 lg:grid-cols-5">
            <article className="rounded-3xl border border-line bg-white/80 p-5 sm:p-6 lg:col-span-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-mist">
                    {featured.symbol} · {featured.sector}
                  </p>
                  <h3 className="mt-2 font-display text-3xl">
                    <Link to={`/stock/${featured.symbol}`} className="transition hover:text-brass">
                      {featured.name}
                    </Link>
                  </h3>
                </div>
                <WatchButton symbol={featured.symbol} active={watchlist.includes(featured.symbol)} onToggle={toggleWatch} />
              </div>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <PriceFlash value={featured.price} format={money} className="font-display text-4xl" />
                <ChangeText value={featured.change} className="text-lg" />
              </div>
              <div className="mt-4">
                <StockChart points={featuredSeries} animateKey={`${featured.symbol}-home`} variant="feature" />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={`/stock/${featured.symbol}`} className={btnGhost}>
                  Stock details
                </Link>
                <Link to={`/trade/${featured.symbol}?side=buy`} className={btnInk}>
                  Buy
                </Link>
              </div>
            </article>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
              {rest.map((stock) => (
                <article key={stock.symbol} className="rounded-3xl border border-line bg-white/80 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brass">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/stock/${stock.symbol}`} className="block truncate font-medium hover:text-brass">
                        {stock.name}
                      </Link>
                      <p className="text-sm text-mist">
                        {stock.symbol} · {stock.sector}
                      </p>
                    </div>
                    <WatchButton symbol={stock.symbol} active={watchlist.includes(stock.symbol)} onToggle={toggleWatch} />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <span className="font-display text-2xl tabular-nums">{money(stock.price)}</span>
                    <ChangeText value={stock.change} />
                  </div>
                  <div className="mt-2">
                    <Spark stock={stock} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Leaders and laggards">
        <MoversList title="Top gainers" rows={market.gainers.slice(0, 4)} empty="No names are up on this print." />
        <MoversList title="Top losers" rows={market.losers.slice(0, 4)} empty="No names are down on this print." />
      </section>

      <section>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass">The desk</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">Three moves, then a paper fill</h2>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
          {[
            ['01', 'Read the tape', 'Fifteen invented companies reprint every few seconds. The move is simulated, so you can watch a quote breathe.'],
            ['02', 'Pin a watchlist', 'Star a name from the dashboard or a stock page. The list stays in this browser beside your book.'],
            ['03', 'File a paper order', 'Enter a quantity and a stock price. Haldenwick fills it against imaginary cash and writes it into the history.'],
          ].map(([number, title, body]) => (
            <li key={number} className="bg-paper p-6">
              <span className="font-display text-3xl text-brass">{number}</span>
              <h3 className="mt-3 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-mist">{body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
