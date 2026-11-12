export default function BreadthBar({ advancers, decliners, unchanged, total }) {
  const count = total || 1
  return (
    <div>
      <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
        <span className="text-pine">{advancers} advancing</span>
        {unchanged > 0 ? <span className="text-mist">{unchanged} flat</span> : null}
        <span className="text-coral">{decliners} declining</span>
      </div>
      <div
        className="flex h-2 overflow-hidden rounded-full bg-line"
        role="img"
        aria-label={`${advancers} advancing, ${unchanged} unchanged, ${decliners} declining`}
      >
        <span className="bg-pine transition-all duration-700" style={{ width: `${(advancers / count) * 100}%` }} />
        <span className="bg-paper-2 transition-all duration-700" style={{ width: `${(unchanged / count) * 100}%` }} />
        <span className="bg-coral transition-all duration-700" style={{ width: `${(decliners / count) * 100}%` }} />
      </div>
    </div>
  )
}
