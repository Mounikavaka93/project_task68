export function safeNext(from) {
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return '/markets'
  if (from.startsWith('/login') || from.startsWith('/signup')) return '/markets'
  return from
}
