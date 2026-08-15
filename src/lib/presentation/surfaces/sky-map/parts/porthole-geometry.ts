export const VIEW_SIZE = 1000
export const VIEW_CENTER = VIEW_SIZE / 2
export const RIM_RADIUS = VIEW_CENTER
export const SCALE_PAD = 12

export const GASKET_RADIUS = RIM_RADIUS + SCALE_PAD
export const INNER_TRACK_RADIUS = RIM_RADIUS - SCALE_PAD

// Outer gasket on the cabin-facing rim. Inner scale along the glass lip.
export const GASKET_ARCS = [
  { start: 170, end: 248 },
  { start: 282, end: 360 },
] as const

export const INNER_ARCS = [{ start: 0, end: 359 }] as const

const TICK_LENGTH = {
  major: 12,
  medium: 8,
  minor: 5,
  terminal: 14,
} as const

export interface ScaleTick {
  angle: number
  major: boolean
  medium: boolean
  terminal: boolean
  y1: number
  y2: number
}

type ScaleSide = 'inner' | 'outer'

function polar(angle_deg: number, radius: number) {
  const radians = (angle_deg * Math.PI) / 180
  return {
    x: VIEW_CENTER + radius * Math.sin(radians),
    y: VIEW_CENTER - radius * Math.cos(radians),
  }
}

function format_point(value: number) {
  return value.toFixed(2)
}

function spans_full_circle(start: number, end: number) {
  return end - start >= 359
}

function arc_path(start: number, end: number, radius: number) {
  const from = polar(start, radius)
  if (spans_full_circle(start, end)) {
    const midpoint = polar(start + 180, radius)
    return `M${format_point(from.x)} ${format_point(from.y)} A${radius} ${radius} 0 1 1 ${format_point(midpoint.x)} ${format_point(midpoint.y)} A${radius} ${radius} 0 1 1 ${format_point(from.x)} ${format_point(from.y)}`
  }
  const to = polar(end, radius)
  const large_arc = end - start > 180 ? 1 : 0
  return `M${format_point(from.x)} ${format_point(from.y)} A${radius} ${radius} 0 ${large_arc} 1 ${format_point(to.x)} ${format_point(to.y)}`
}

function tick_length(major: boolean, medium: boolean, terminal: boolean) {
  if (terminal) return TICK_LENGTH.terminal
  if (major) return TICK_LENGTH.major
  if (medium) return TICK_LENGTH.medium
  return TICK_LENGTH.minor
}

function scale_tick(
  angle: number,
  start: number,
  end: number,
  y1: number,
  sign: number,
  terminals: boolean,
): ScaleTick {
  const along = angle - start
  const major = along % 15 === 0
  const medium = along % 5 === 0 && !major
  const terminal = terminals && (angle === start || angle === end)

  return {
    angle,
    major,
    medium,
    terminal,
    y1,
    y2: y1 + sign * tick_length(major, medium, terminal),
  }
}

function build_scale_ticks(
  arcs: readonly { start: number; end: number }[],
  side: ScaleSide,
) {
  const ticks: ScaleTick[] = []
  const sign = side === 'outer' ? -1 : 1
  const y1 = sign * SCALE_PAD
  for (const arc of arcs) {
    const terminals = !spans_full_circle(arc.start, arc.end)
    for (let angle: number = arc.start; angle <= arc.end; angle += 1) {
      ticks.push(scale_tick(angle, arc.start, arc.end, y1, sign, terminals))
    }
  }
  return ticks
}

export const gasket_ticks = build_scale_ticks(GASKET_ARCS, 'outer')
export const gasket_tracks = GASKET_ARCS.map((arc) =>
  arc_path(arc.start, arc.end, GASKET_RADIUS),
)

export const inner_ticks = build_scale_ticks(INNER_ARCS, 'inner')
export const inner_tracks = INNER_ARCS.map((arc) =>
  arc_path(arc.start, arc.end, INNER_TRACK_RADIUS),
)
