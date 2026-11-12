import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import { OPENING_CASH } from '../lib/constants.js'

export default function ResetBookButton() {
  const { user } = useAuth()
  const { ledger, resetBook } = useMarket()
  const [armed, setArmed] = useState(false)
  const dirty = ledger.orders.length > 0 || ledger.holdings.length > 0 || ledger.cash !== OPENING_CASH

  if (!user || !dirty) return null

  if (!armed) {
    return (
      <button type="button" className="text-sm text-mist underline-offset-2 hover:text-coral hover:underline" onClick={() => setArmed(true)}>
        Reset paper book
      </button>
    )
  }

  return (
    <span className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-ink">Clear holdings and restore $100,000?</span>
      <button
        type="button"
        className="font-medium text-coral"
        onClick={() => {
          resetBook()
          setArmed(false)
        }}
      >
        Confirm
      </button>
      <button type="button" className="text-mist" onClick={() => setArmed(false)}>
        Cancel
      </button>
    </span>
  )
}
