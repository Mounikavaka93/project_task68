export const OPENING_CASH = 100000
export const FEE_RATE = 0.0008
export const INDEX_BASE = 1486.2

export const USERS_KEY = 'haldenwick-accounts'
export const SESSION_KEY = 'haldenwick-session'
export const WATCH_KEY = 'haldenwick-watchlist'

export function bookKey(email) {
  return `haldenwick-ledger-${email}`
}
