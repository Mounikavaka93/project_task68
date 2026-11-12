import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo wordmark />
          <p className="mt-4 max-w-sm text-sm leading-6 text-mist">
            Haldenwick is a paper trading house. Quotes, charts, and orders are simulated for practice and never reach an exchange.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass">Desk</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="transition hover:text-brass" to="/markets">
                Stock market dashboard
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-brass" to="/trade">
                Buy & sell
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-brass" to="/signup">
                Sign up
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-brass" to="/login">
                Login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass">House</p>
          <p className="mt-3 text-sm leading-6 text-mist">
            9 Candle Court
            <br />
            Haldenwick
            <br />A harbor that does not exist.
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-mist sm:px-6">
          © {year} Haldenwick Paper Markets. Practice only. Not an offer to buy or sell any security.
        </p>
      </div>
    </footer>
  )
}
