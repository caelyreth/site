const signal_glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function next_signal() {
  const code = Array.from(
    { length: 3 },
    () => signal_glyphs[Math.floor(Math.random() * signal_glyphs.length)],
  ).join('')
  const sequence = String(Math.floor(Math.random() * 10_000)).padStart(
    4,
    '0',
  )
  return `RX//${code}-ORBIT-${sequence}`
}
