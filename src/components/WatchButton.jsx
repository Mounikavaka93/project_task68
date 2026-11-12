export default function WatchButton({ symbol, active, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      onClick={() => onToggle(symbol)}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition duration-200 hover:-translate-y-0.5 ${
        active ? 'border-brass bg-brass/10 text-brass' : 'border-line bg-white text-mist hover:border-brass hover:text-brass'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          d="M12 3.6 14.1 8.2l5 .6-3.7 3.4.9 5L12 15.2 7.7 17.2l.9-5L4.9 8.8l5-.6L12 3.6Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
