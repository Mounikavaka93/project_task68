import { Link } from 'react-router-dom'
import { useMarket } from '../context/MarketContext.jsx'
import { money } from '../lib/format.js'
import { ChangeText } from './ChangeText.jsx'

export default function TickerTape() {
  const { market } = useMarket()
  const copies = [0, 1]

  return (
    <div className="tape overflow-hidden border-y border-ink bg-ink text-paper">
      <div className="marquee-track flex w-max">
        {copies.map((copy) => (
          <div
            key={copy}
            className={`flex items-center gap-6 px-3 py-2 ${copy === 1 ? 'marquee-copy-dup' : ''}`}
            aria-hidden={copy === 1 || undefined}
            inert={copy === 1 ? true : undefined}
          >
            {market.quotes.map((stock) => (
              <Link
                key={`${copy}-${stock.symbol}`}
                to={`/stock/${stock.symbol}`}
                className="flex items-center gap-2 text-sm whitespace-nowrap transition hover:text-brass-bright"
              >
                <span className="font-medium">{stock.symbol}</span>
                <span className="tabular-nums text-paper/80">{money(stock.price)}</span>
                <ChangeText value={stock.change} tone="dark" />
                <span className="text-paper/30" aria-hidden="true">
                  /
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
