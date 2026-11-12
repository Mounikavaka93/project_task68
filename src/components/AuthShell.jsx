import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function AuthShell({ title, lede, children, footer }) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line bg-white lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-ink p-10 text-paper lg:flex">
        <Link to="/" aria-label="Haldenwick home">
          <Logo light />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass-bright">House note</p>
          <blockquote className="mt-4 font-display text-4xl italic leading-tight">
            A price is a sentence. Read the whole line.
          </blockquote>
        </div>
        <p className="text-sm leading-6 text-paper/70">
          Demo only. A paper login stays in this browser. It is not a brokerage, and it cannot move real money.
        </p>
      </aside>
      <div className="p-6 sm:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass lg:hidden">Haldenwick</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{title}</h1>
        <p className="mt-2 text-mist">{lede}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-sm text-mist">{footer}</div>
      </div>
    </div>
  )
}
