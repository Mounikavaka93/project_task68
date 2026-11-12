export default function Stat({ label, value, detail }) {
  return (
    <div className="rounded-3xl border border-line bg-white/80 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-mist">{label}</p>
      <div className="mt-2 font-display text-3xl leading-none">{value}</div>
      {detail ? <p className="mt-2 text-sm text-mist">{detail}</p> : null}
    </div>
  )
}
