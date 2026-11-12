export default function PageHeader({ kicker, title, lede, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-brass">{kicker}</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{title}</h1>
        {lede ? <p className="mt-3 text-mist">{lede}</p> : null}
      </div>
      {children}
    </div>
  )
}
