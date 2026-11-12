import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import ResetBookButton from '../components/ResetBookButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import { FEE_RATE } from '../lib/constants.js'
import { cents, formatTime, money } from '../lib/format.js'
import { btnCoral, btnInk, btnPine, inputClass } from '../lib/styles.js'
import { usePageTitle } from '../lib/usePageTitle.js'

function SummaryRow({ label, value, emphasize = false }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${emphasize ? 'border-t border-line pt-3' : ''}`}>
      <dt className={`shrink-0 ${emphasize ? 'font-medium text-ink' : 'text-mist'}`}>{label}</dt>
      <dd className={`min-w-0 text-right tabular-nums ${emphasize ? 'font-display text-2xl' : ''}`}>{value}</dd>
    </div>
  )
}

export default function Trade() {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { market, ledger, placeOrder } = useMarket()
  const symbol = (params.symbol || 'NRL').toUpperCase()
  const stock = market.quotes.find((quote) => quote.symbol === symbol)
  const side = searchParams.get('side') === 'sell' ? 'sell' : 'buy'
  const holding = ledger.holdings.find((item) => item.symbol === symbol)
  const held = holding?.shares ?? 0

  const [qty, setQty] = useState('10')
  const [priceText, setPriceText] = useState(() => (stock ? stock.price.toFixed(2) : ''))
  const [priceDirty, setPriceDirty] = useState(false)
  const [priceFocused, setPriceFocused] = useState(false)
  const [trackedSymbol, setTrackedSymbol] = useState(symbol)
  const [onlySymbol, setOnlySymbol] = useState(false)
  const [justFiled, setJustFiled] = useState(null)
  const [serverError, setServerError] = useState('')

  usePageTitle(stock ? `Buy & sell ${stock.symbol}` : 'Buy & sell')

  if (symbol !== trackedSymbol) {
    setTrackedSymbol(symbol)
    setServerError('')
    if (stock) {
      setPriceDirty(false)
      setPriceText(stock.price.toFixed(2))
      setQty('10')
    }
  }

  useEffect(() => {
    if (!params.symbol) navigate(`/trade/NRL${location.search}`, { replace: true })
  }, [params.symbol, location.search, navigate])

  useEffect(() => {
    if (!stock || priceDirty || priceFocused) return
    setPriceText(stock.price.toFixed(2))
  }, [stock, priceDirty, priceFocused])

  const quantity = Number(String(qty).trim())
  const price = Number(String(priceText).trim())
  const qtyOk = Number.isInteger(quantity) && quantity > 0 && quantity <= 100000
  const priceOk = Number.isFinite(price) && price > 0 && price <= 1000000
  const notional = qtyOk && priceOk ? cents(quantity * price) : null
  const fee = notional == null ? null : cents(notional * FEE_RATE)
  const total = notional == null || fee == null ? null : side === 'buy' ? cents(notional + fee) : cents(notional - fee)
  const cashAfter = user && total != null ? cents(side === 'buy' ? ledger.cash - total : ledger.cash + total) : null
  const sharesAfter = qtyOk ? (side === 'buy' ? held + quantity : held - quantity) : null

  let blocker = ''
  if (!qtyOk) blocker = 'Enter a whole number of shares, up to 100,000.'
  else if (!priceOk) blocker = 'Enter a stock price above zero and under $1,000,000.'
  else if (user && side === 'buy' && total > ledger.cash) blocker = 'Not enough paper cash for this order.'
  else if (user && side === 'sell' && quantity > held) {
    blocker = held === 0 ? `You do not hold ${symbol}.` : `You hold ${held} share${held === 1 ? '' : 's'} of ${symbol}.`
  }

  function setSide(next) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('side', next)
    setSearchParams(nextParams, { replace: true })
  }

  function onSubmit(event) {
    event.preventDefault()
    if (!stock) return
    const result = placeOrder({ symbol: stock.symbol, side, quantity: qty, price: priceText })
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    setServerError('')
    setJustFiled(result.order.id)
    setQty('10')
    setPriceDirty(false)
  }

  if (params.symbol && !stock) {
    return (
      <div className="py-12">
        <h1 className="font-display text-4xl">That symbol is not on the tape.</h1>
        <Link to="/markets" className={`${btnInk} mt-6`}>
          Browse the dashboard
        </Link>
      </div>
    )
  }

  if (!stock) return null

  const orders = (onlySymbol ? ledger.orders.filter((order) => order.symbol === stock.symbol) : ledger.orders)
  const message = serverError || blocker
  const showMoney = (value) => (value == null ? '—' : money(value))

  return (
    <div>
      <PageHeader
        kicker="Order ticket"
        title="Buy & sell"
        lede="Enter a quantity and a stock price. The fill is instant, the cash is imaginary, and the history stays in this browser."
      />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="rounded-3xl border border-line bg-white/80 p-5 sm:p-6 lg:col-span-3" noValidate>
          <div className="grid gap-5">
            <div>
              <label htmlFor="trade-symbol" className="mb-1.5 block text-sm font-medium">
                Stock
              </label>
              <select
                id="trade-symbol"
                className={inputClass}
                value={stock.symbol}
                onChange={(event) => navigate(`/trade/${event.target.value}?side=${side}`)}
              >
                {market.quotes.map((quote) => (
                  <option key={quote.symbol} value={quote.symbol}>
                    {quote.symbol} — {quote.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium">Side</p>
              <div className="grid grid-cols-2 gap-2 rounded-full bg-paper-2 p-1">
                <button type="button" aria-pressed={side === 'buy'} onClick={() => setSide('buy')} className={`rounded-full py-2 text-sm font-medium transition ${side === 'buy' ? 'bg-pine text-paper' : 'text-ink'}`}>
                  Buy
                </button>
                <button type="button" aria-pressed={side === 'sell'} onClick={() => setSide('sell')} className={`rounded-full py-2 text-sm font-medium transition ${side === 'sell' ? 'bg-coral text-paper' : 'text-ink'}`}>
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="trade-qty" className="mb-1.5 block text-sm font-medium">
                Quantity
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="h-11 w-11 shrink-0 rounded-xl border border-line bg-white text-lg"
                  aria-label="Decrease quantity"
                  onClick={() => setQty(String(Math.max(1, (Number.isInteger(quantity) ? quantity : 0) - 1)))}
                >
                  −
                </button>
                <input
                  id="trade-qty"
                  inputMode="numeric"
                  value={qty}
                  onChange={(event) => {
                    setQty(event.target.value)
                    setServerError('')
                  }}
                  className={inputClass}
                  aria-describedby="trade-position"
                />
                <button
                  type="button"
                  className="h-11 w-11 shrink-0 rounded-xl border border-line bg-white text-lg"
                  aria-label="Increase quantity"
                  onClick={() => setQty(String(Math.min(100000, (Number.isInteger(quantity) ? quantity : 0) + 1)))}
                >
                  +
                </button>
              </div>
              <p id="trade-position" className="mt-1.5 text-sm text-mist">
                You hold {held} share{held === 1 ? '' : 's'}
                {holding ? ` at an average ${money(holding.avgCost)}` : ''}.
                {user ? ` Paper cash ${money(ledger.cash)}.` : ''}
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="trade-price" className="text-sm font-medium">
                  Stock price
                </label>
                <button
                  type="button"
                  className="text-sm text-brass underline-offset-2 hover:underline"
                  onClick={() => {
                    setPriceDirty(false)
                    setPriceText(stock.price.toFixed(2))
                    setServerError('')
                  }}
                >
                  Match tape {money(stock.price)}
                </button>
              </div>
              <input
                id="trade-price"
                inputMode="decimal"
                value={priceText}
                onChange={(event) => {
                  setPriceDirty(true)
                  setPriceText(event.target.value)
                  setServerError('')
                }}
                onFocus={(event) => {
                  setPriceFocused(true)
                  event.target.select()
                }}
                onBlur={() => setPriceFocused(false)}
                className={inputClass}
              />
              <p className="mt-1.5 text-sm text-mist">Paper fill uses this price, even if the tape has moved.</p>
            </div>

            {!user ? (
              <p className="text-sm text-mist">
                <Link to="/login" state={{ from: `${location.pathname}${location.search}` }} className="font-medium text-brass underline-offset-2 hover:underline">
                  Login
                </Link>{' '}
                to file this paper order. You can still draft the ticket.
              </p>
            ) : message ? (
              <p role="alert" className="text-sm text-coral">
                {message}
              </p>
            ) : (
              <p className="text-sm text-pine">Ready to file a paper {side}.</p>
            )}

            <button type="submit" disabled={!user || Boolean(blocker)} className={side === 'buy' ? btnPine : btnCoral}>
              {side === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}
            </button>
          </div>
        </form>

        <aside className="overflow-hidden rounded-3xl border border-line bg-white lg:sticky lg:top-28 lg:col-span-2">
          <div className={`h-1.5 ${side === 'buy' ? 'bg-pine' : 'bg-coral'}`} />
          <div className="p-5">
            <h2 className="font-display text-2xl">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <SummaryRow label="Side" value={side === 'buy' ? 'Buy' : 'Sell'} />
              <SummaryRow label="Symbol" value={`${stock.symbol} · ${stock.name}`} />
              <SummaryRow label="Quantity" value={qtyOk ? String(quantity) : '—'} />
              <SummaryRow label="Stock price" value={priceOk ? money(price) : '—'} />
              <SummaryRow label="Notional" value={showMoney(notional)} />
              <SummaryRow label={`Desk fee ${(FEE_RATE * 100).toFixed(2)}%`} value={showMoney(fee)} />
              <SummaryRow label={side === 'buy' ? 'Estimated total' : 'Estimated proceeds'} value={showMoney(total)} emphasize />
              <SummaryRow label="Cash after" value={showMoney(cashAfter)} />
              <SummaryRow label="Shares after" value={sharesAfter == null ? '—' : String(sharesAfter)} />
            </dl>
            <p className="mt-4 text-xs leading-5 text-mist">Status: paper fill. No exchange, no bank, no real transaction.</p>
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-3xl border border-line bg-white/80 p-5 sm:p-6" id="history">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Transaction history</h2>
          <ResetBookButton />
        </div>
        {!user ? (
          <p className="mt-3 text-sm text-mist">History appears after you log in and file a paper order.</p>
        ) : orders.length === 0 ? (
          <p className="mt-3 text-sm text-mist">No paper orders yet. A buy or sell filed above will settle here instantly.</p>
        ) : (
          <>
            <label className="mt-4 flex items-center gap-2 text-sm text-mist">
              <input type="checkbox" checked={onlySymbol} onChange={(event) => setOnlySymbol(event.target.checked)} />
              Only {stock.symbol}
            </label>
            <ol className="mt-2 divide-y divide-line">
              {orders.map((order) => (
                <li key={order.id} className={order.id === justFiled ? 'flash-up rounded-xl' : ''}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                    <div>
                      <span className={`font-medium ${order.side === 'buy' ? 'text-pine' : 'text-coral'}`}>
                        {order.side === 'buy' ? 'Buy' : 'Sell'}
                      </span>
                      <Link to={`/stock/${order.symbol}`} className="ml-2 font-medium hover:text-brass">
                        {order.symbol}
                      </Link>
                      <span className="text-mist">
                        {' '}
                        · {order.quantity} @ {money(order.price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums">{money(order.total)}</p>
                      <p className="text-xs text-mist">
                        {formatTime(order.time)} · {order.status}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  )
}
