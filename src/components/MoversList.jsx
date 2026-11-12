import { Link } from 'react-router-dom'
import { money } from '../lib/format.js'
import { ChangeText, MoveBar } from './ChangeText.jsx'

export default function MoversList({ title, rows, empty }) {
  return (
    <section className="rounded-3xl border border-line bg-white/80 p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-mist">{empty}</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <li key={row.symbol}>
              <Link to={`/stock/${row.symbol}`} className="group flex items-center gap-3 rounded-xl px-1 py-1 transition hover:bg-paper">
                <span className="w-5 text-sm text-mist">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium group-hover:text-brass">{row.symbol}</span>
                  <span className="block truncate text-sm text-mist">{row.name}</span>
                </span>
                <span className="w-28 shrink-0 text-right">
                  <span className="block tabular-nums">{money(row.price)}</span>
                  <ChangeText value={row.change} className="text-sm" />
                </span>
              </Link>
              <div className="pr-1 pl-8">
                <MoveBar value={row.change} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
