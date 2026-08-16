export interface CircuitNode {
  kind: 'pad' | 'smd' | 'via'
  turn?: number
  x: number
  y: number
}

export interface CircuitTrace {
  d: string
  weight: 'pair' | 'power' | 'signal'
}

export const circuit_traces: readonly CircuitTrace[] = [
  { d: 'M1.6 0.92H29.8', weight: 'power' },
  { d: 'M1.6 1.22H17.4', weight: 'pair' },
  { d: 'M4.4 0.92V2.38', weight: 'signal' },
  { d: 'M10.6 0.92V2.38', weight: 'signal' },
  { d: 'M17.4 0.92V1.22', weight: 'pair' },
  { d: 'M23.8 0.92V2.12H27.1', weight: 'signal' },
  { d: 'M29.8 0.92V1.55H33.4', weight: 'power' },
  { d: 'M61.65 3.85V10.75', weight: 'power' },
  { d: 'M61.65 4.55H59.58', weight: 'signal' },
  { d: 'M61.65 6.95H59.58', weight: 'signal' },
  { d: 'M61.65 9.35H59.58', weight: 'signal' },
  { d: 'M61.65 5.55H62.55V6.45', weight: 'signal' },
  { d: 'M61.65 10.75H63.05', weight: 'pair' },
  { d: 'M33.8 20.92H56.8', weight: 'power' },
  { d: 'M40.2 20.64H51.4', weight: 'pair' },
  { d: 'M37.6 20.92V19.72', weight: 'signal' },
  { d: 'M45.1 20.92V19.72', weight: 'signal' },
  { d: 'M52.7 20.92V19.72', weight: 'signal' },
  { d: 'M56.8 20.92V20.35H58.4', weight: 'power' },
]

export const circuit_nodes: readonly CircuitNode[] = [
  { kind: 'via', x: 1.6, y: 0.92 },
  { kind: 'via', x: 4.4, y: 2.38 },
  { kind: 'pad', x: 10.6, y: 2.38 },
  { kind: 'via', x: 17.4, y: 1.22 },
  { kind: 'smd', x: 27.1, y: 2.12 },
  { kind: 'via', x: 29.8, y: 0.92 },
  { kind: 'pad', x: 33.4, y: 1.55 },
  { kind: 'via', x: 61.65, y: 3.85 },
  { kind: 'pad', x: 59.58, y: 4.55 },
  { kind: 'smd', turn: 90, x: 62.55, y: 6 },
  { kind: 'pad', x: 59.58, y: 6.95 },
  { kind: 'pad', x: 59.58, y: 9.35 },
  { kind: 'via', x: 61.65, y: 10.75 },
  { kind: 'via', x: 63.05, y: 10.75 },
  { kind: 'via', x: 33.8, y: 20.92 },
  { kind: 'pad', x: 37.6, y: 19.72 },
  { kind: 'smd', x: 45.1, y: 19.72 },
  { kind: 'pad', x: 52.7, y: 19.72 },
  { kind: 'via', x: 56.8, y: 20.92 },
  { kind: 'via', x: 58.4, y: 20.35 },
]
