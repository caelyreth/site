export const CIRCUIT_SIDES = ['bottom', 'left', 'right', 'top'] as const

export type CircuitSide = (typeof CIRCUIT_SIDES)[number]

export type CircuitNode = Readonly<{
  delay: number
  kind: 'pad' | 'smd' | 'via'
  side: CircuitSide
  turn?: number
  x: number
  y: number
}>

export type CircuitTrace = Readonly<{
  d: string
  side: CircuitSide
  weight: 'pair' | 'power' | 'signal'
}>

export const circuit_traces: readonly CircuitTrace[] = [
  { d: 'M1.6 0.92H29.8', side: 'top', weight: 'power' },
  { d: 'M1.6 1.22H17.4', side: 'top', weight: 'pair' },
  { d: 'M4.4 0.92V2.38', side: 'top', weight: 'signal' },
  { d: 'M10.6 0.92V2.38', side: 'top', weight: 'signal' },
  { d: 'M17.4 0.92V1.22', side: 'top', weight: 'pair' },
  { d: 'M23.8 0.92V2.12H27.1', side: 'top', weight: 'signal' },
  { d: 'M29.8 0.92V1.55H33.4', side: 'top', weight: 'power' },
  { d: 'M61.65 3.85V10.75', side: 'right', weight: 'power' },
  { d: 'M61.65 4.55H59.58', side: 'right', weight: 'signal' },
  { d: 'M61.65 6.95H59.58', side: 'right', weight: 'signal' },
  { d: 'M61.65 9.35H59.58', side: 'right', weight: 'signal' },
  { d: 'M61.65 5.55H62.55V6.45', side: 'right', weight: 'signal' },
  { d: 'M61.65 10.75H63.05', side: 'right', weight: 'pair' },
  { d: 'M33.8 13.42H56.8', side: 'bottom', weight: 'power' },
  { d: 'M40.2 13.14H51.4', side: 'bottom', weight: 'pair' },
  { d: 'M37.6 13.42V12.22', side: 'bottom', weight: 'signal' },
  { d: 'M45.1 13.42V12.22', side: 'bottom', weight: 'signal' },
  { d: 'M52.7 13.42V12.22', side: 'bottom', weight: 'signal' },
  { d: 'M56.8 13.42V12.85H58.4', side: 'bottom', weight: 'power' },
  { d: 'M-3.62 3.95V10.45', side: 'left', weight: 'power' },
  { d: 'M-3.62 5.35H-2.32', side: 'left', weight: 'signal' },
  { d: 'M-3.62 8.15H-2.32', side: 'left', weight: 'signal' },
  { d: 'M-3.62 10.45H-4.35', side: 'left', weight: 'pair' },
]

export const circuit_nodes: readonly CircuitNode[] = [
  { delay: 0, kind: 'via', side: 'top', x: 1.6, y: 0.92 },
  { delay: 50, kind: 'via', side: 'top', x: 4.4, y: 2.38 },
  { delay: 100, kind: 'pad', side: 'top', x: 10.6, y: 2.38 },
  { delay: 140, kind: 'via', side: 'top', x: 17.4, y: 1.22 },
  { delay: 190, kind: 'smd', side: 'top', x: 27.1, y: 2.12 },
  { delay: 230, kind: 'via', side: 'top', x: 29.8, y: 0.92 },
  { delay: 280, kind: 'pad', side: 'top', x: 33.4, y: 1.55 },
  { delay: 0, kind: 'via', side: 'right', x: 61.65, y: 3.85 },
  { delay: 70, kind: 'pad', side: 'right', x: 59.58, y: 4.55 },
  { delay: 90, kind: 'smd', side: 'right', turn: 90, x: 62.55, y: 6 },
  { delay: 140, kind: 'pad', side: 'right', x: 59.58, y: 6.95 },
  { delay: 210, kind: 'pad', side: 'right', x: 59.58, y: 9.35 },
  { delay: 280, kind: 'via', side: 'right', x: 61.65, y: 10.75 },
  { delay: 320, kind: 'via', side: 'right', x: 63.05, y: 10.75 },
  { delay: 0, kind: 'via', side: 'bottom', x: 33.8, y: 13.42 },
  { delay: 60, kind: 'pad', side: 'bottom', x: 37.6, y: 12.22 },
  { delay: 110, kind: 'smd', side: 'bottom', x: 45.1, y: 12.22 },
  { delay: 170, kind: 'pad', side: 'bottom', x: 52.7, y: 12.22 },
  { delay: 230, kind: 'via', side: 'bottom', x: 56.8, y: 13.42 },
  { delay: 280, kind: 'via', side: 'bottom', x: 58.4, y: 12.85 },
  { delay: 0, kind: 'via', side: 'left', x: -3.62, y: 3.95 },
  { delay: 70, kind: 'pad', side: 'left', x: -2.32, y: 5.35 },
  { delay: 120, kind: 'smd', side: 'left', turn: 90, x: -3.62, y: 6.75 },
  { delay: 180, kind: 'pad', side: 'left', x: -2.32, y: 8.15 },
  { delay: 240, kind: 'via', side: 'left', x: -3.62, y: 10.45 },
  { delay: 290, kind: 'via', side: 'left', x: -4.35, y: 10.45 },
]

export function pick_circuit_side(): CircuitSide {
  return (
    CIRCUIT_SIDES[Math.floor(Math.random() * CIRCUIT_SIDES.length)] ??
    'right'
  )
}
