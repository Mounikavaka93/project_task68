export default function Logo({ light = false, wordmark = false }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${light ? 'text-paper' : 'text-ink'}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="7" className={light ? 'fill-paper' : 'fill-ink'} />
        <path d="M8 23.5h16" stroke="#e0b07a" strokeWidth="1.7" strokeLinecap="round" />
        <path
          d="M16 23.5V12"
          className={light ? 'stroke-ink' : 'stroke-paper'}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path d="M16 7.2c.9 1.3 2.3 2.1 2.3 3.5a2.3 2.3 0 0 1-4.6 0c0-1.4 1.4-2.2 2.3-3.5Z" fill="#e0b07a" />
      </svg>
      <span className={`${wordmark ? 'block' : 'hidden sm:block'} leading-none`}>
        <span className="block font-display text-xl tracking-tight">Haldenwick</span>
        <span className={`block text-[10px] uppercase tracking-[0.18em] ${light ? 'text-paper/70' : 'text-mist'}`}>
          Paper markets
        </span>
      </span>
    </span>
  )
}
