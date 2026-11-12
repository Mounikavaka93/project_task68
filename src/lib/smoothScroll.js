let target = 0
let current = 0
let frame = 0
let animating = false

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
}

function clamp(value) {
  return Math.max(0, Math.min(value, maxScroll()))
}

function setBehavior(value) {
  document.documentElement.style.scrollBehavior = value
}

function tick() {
  current += (target - current) * 0.22
  if (Math.abs(target - current) < 0.5) current = target
  window.scrollTo(0, current)
  if (current === target) {
    animating = false
    frame = 0
    setBehavior('')
    return
  }
  frame = requestAnimationFrame(tick)
}

function start() {
  if (!animating) {
    animating = true
    setBehavior('auto')
  }
  if (!frame) frame = requestAnimationFrame(tick)
}

export function scrollPageTo(y, { immediate = false } = {}) {
  const next = clamp(y)
  if (immediate || reducedMotion()) {
    target = current = next
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    animating = false
    setBehavior('auto')
    window.scrollTo(0, next)
    setBehavior('')
    return
  }
  target = next
  start()
}

export function bindSmoothScroll() {
  target = current = window.scrollY
  if (reducedMotion()) return () => {}

  const onWheel = (event) => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
    const pixelDelta =
      event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY
    event.preventDefault()
    target = clamp(target + pixelDelta)
    start()
  }

  const onScroll = () => {
    if (animating) return
    target = current = window.scrollY
  }

  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    animating = false
    setBehavior('')
  }
}
