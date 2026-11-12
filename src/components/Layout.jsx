import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useMarket } from '../context/MarketContext.jsx'
import { bindSmoothScroll, scrollPageTo } from '../lib/smoothScroll.js'
import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'
import TickerTape from './TickerTape.jsx'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export default function Layout() {
  const { pathname } = useLocation()
  const { notice, dismissNotice } = useMarket()
  const now = useClock()
  const showTape = pathname !== '/login' && pathname !== '/signup'

  useEffect(() => bindSmoothScroll(), [])

  useEffect(() => {
    scrollPageTo(0, { immediate: true })
  }, [pathname])

  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40">
        <div className="bg-ink text-xs text-paper">
          <div className="mx-auto grid h-9 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6">
            <p className="justify-self-start font-display text-sm tracking-tight whitespace-nowrap">
              Haldenwick
              <span className="ml-2 hidden font-sans text-[10px] tracking-[0.18em] text-paper/60 uppercase sm:inline">Paper markets</span>
            </p>
            <p className="flex items-center justify-center gap-2 text-paper/80" aria-label="Paper session open">
              <span className="live-dot" aria-hidden="true" />
              <span className="hidden whitespace-nowrap sm:inline">Paper session open</span>
            </p>
            <p className="justify-self-end tabular-nums whitespace-nowrap text-paper/80">{time}</p>
          </div>
        </div>
        <Navbar />
      </header>
      {showTape ? <TickerTape /> : null}
      <main id="content" tabIndex={-1} className="flex-1 outline-none">
        <div key={pathname} className="rise mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Outlet />
        </div>
      </main>
      <Footer />
      {notice ? (
        <button
          type="button"
          onClick={dismissNotice}
          className="rise fixed right-4 bottom-4 z-50 max-w-sm rounded-2xl border border-line bg-ink px-4 py-3 text-left text-sm text-paper shadow-lg"
        >
          {notice}
        </button>
      ) : null}
    </div>
  )
}
