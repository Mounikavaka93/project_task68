import { Link } from 'react-router-dom'
import { btnInk } from '../lib/styles.js'
import { usePageTitle } from '../lib/usePageTitle.js'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="py-16 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-brass">404</p>
      <h1 className="mt-3 font-display text-5xl">This page is off the tape.</h1>
      <p className="mx-auto mt-4 max-w-md text-mist">Haldenwick does not have a listing here.</p>
      <Link to="/" className={`${btnInk} mt-8`}>
        Back to the desk
      </Link>
    </div>
  )
}
