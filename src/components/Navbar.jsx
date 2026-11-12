import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import { money } from '../lib/format.js'
import { btnGhost, btnInk } from '../lib/styles.js'
import Logo from './Logo.jsx'

const LINKS = [
  { to: '/markets', label: 'Markets', match: (path) => path.startsWith('/markets') || path.startsWith('/stock') },
  { to: '/trade', label: 'Buy & Sell', match: (path) => path.startsWith('/trade') },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { ledger } = useMarket()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="shrink-0 justify-self-start" aria-label="Haldenwick home">
          <Logo />
        </Link>
        <nav className="hidden items-center justify-center gap-6 md:flex" aria-label="Primary">
          {LINKS.map((link) => {
            const active = link.match(pathname)
            return (
              <Link key={link.to} to={link.to} className={`text-sm transition hover:text-brass ${active ? 'font-medium text-ink' : 'text-mist'}`} aria-current={active ? 'page' : undefined}>
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center justify-end gap-2 justify-self-end">
          {user ? (
            <>
              <span className="hidden text-sm tabular-nums text-mist lg:inline">{money(ledger.cash)}</span>
              <span className="hidden max-w-36 truncate text-sm font-medium xl:inline">{user.name}</span>
              <button type="button" className={btnGhost} onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={btnGhost}>
                Login
              </Link>
              <Link to="/signup" className={btnInk}>
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="flex w-4 flex-col gap-1" aria-hidden="true">
              <span className="h-px bg-ink" />
              <span className="h-px bg-ink" />
              <span className="h-px bg-ink" />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-line px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {LINKS.map((link) => {
              const active = link.match(pathname)
              return (
                <Link key={link.to} to={link.to} className={`rounded-xl px-3 py-2 text-sm ${active ? 'bg-white font-medium' : 'text-mist'}`} aria-current={active ? 'page' : undefined}>
                  {link.label}
                </Link>
              )
            })}
            {user ? <p className="px-3 py-2 text-sm text-mist">{user.name}</p> : null}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
