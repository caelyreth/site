/* oxlint-disable complexity, typescript/prefer-readonly-parameter-types -- route scoring evaluates all constraints in one selection pass. */
import {
  ROUTE_CANDIDATE_MAGNITUDE,
  ROUTE_CENTER_RADIUS,
  ROUTE_FINAL_SOURCE_MIN_DISTANCE,
  ROUTE_MAX_BACKTRACK_DOT,
  ROUTE_MAX_CAMERA_ROTATION,
  ROUTE_MAX_DISTANCE,
  ROUTE_MIN_CAMERA_ROTATION,
  ROUTE_MIN_DISTANCE,
  ROUTE_MIN_SECTOR_GAP,
  ROUTE_OUTBOUND_RADIUS,
  ROUTE_PREFERRED_CAMERA_ROTATION,
  ROUTE_SCORE_POOL_SIZE,
  ROUTE_SOURCE_MAX_RADIUS,
  ROUTE_TARGET_VISIBLE_OFFSET,
  TAU,
} from './constants'
import type { DecodedSkyMap, RouteCandidate } from './types'

type Direction = readonly [number, number, number]

export type SkyMapViewProjection = Readonly<{
  aspect: number
  forward: Direction
  map_scale: number
  right: Direction
  up: Direction
}>

type RouteSelectionOptions = Readonly<{
  candidates: readonly RouteCandidate[]
  fallback: readonly [number, number]
  forward: Direction
  previous_source_index: number
  random: () => number
  recent_constellation_groups: readonly number[]
  sky_map: Pick<DecodedSkyMap, 'directions' | 'node_groups'>
  target_index: number
}>

type RouteMetrics = Readonly<{
  backtrack_dot: number
  camera_rotation: number
  candidate: RouteCandidate
  distance: number
  final_source_distance: number
  target_group: number
}>

type ScoredRouteCandidate = Readonly<{
  backtrack_dot: number
  candidate: RouteCandidate
  score: number
  target_group: number
}>

function clamp_unit(value: number) {
  return Math.min(1, Math.max(-1, value))
}

function direction_for(
  directions: Float32Array,
  node_index: number,
): Direction {
  const offset = node_index * 3
  return [
    directions[offset],
    directions[offset + 1],
    directions[offset + 2],
  ]
}

function dot(first: Direction, second: Direction) {
  return first[0] * second[0] + first[1] * second[1] + first[2] * second[2]
}

function angular_distance(first: Direction, second: Direction) {
  return Math.acos(clamp_unit(dot(first, second)))
}

function normalize(direction: Direction): Direction {
  const length = Math.hypot(direction[0], direction[1], direction[2])
  if (length < 0.0001) return [0, 0, 0]
  return [
    direction[0] / length,
    direction[1] / length,
    direction[2] / length,
  ]
}

function tangent_from(source: Direction, direction: Direction) {
  const projection = dot(direction, source)
  return normalize([
    direction[0] - source[0] * projection,
    direction[1] - source[1] * projection,
    direction[2] - source[2] * projection,
  ])
}

function interpolate_direction(
  first: Direction,
  second: Direction,
  progress: number,
): Direction {
  const clamped_progress = Math.min(1, Math.max(0, progress))
  const angle = angular_distance(first, second)
  if (angle < 0.0001) return first
  const denominator = Math.sin(angle)
  if (Math.abs(denominator) < 0.0001) {
    return normalize([
      first[0] + (second[0] - first[0]) * clamped_progress,
      first[1] + (second[1] - first[1]) * clamped_progress,
      first[2] + (second[2] - first[2]) * clamped_progress,
    ])
  }
  return normalize([
    first[0] * (Math.sin((1 - clamped_progress) * angle) / denominator) +
      second[0] * (Math.sin(clamped_progress * angle) / denominator),
    first[1] * (Math.sin((1 - clamped_progress) * angle) / denominator) +
      second[1] * (Math.sin(clamped_progress * angle) / denominator),
    first[2] * (Math.sin((1 - clamped_progress) * angle) / denominator) +
      second[2] * (Math.sin(clamped_progress * angle) / denominator),
  ])
}

function sector_gap(first: number, second: number) {
  const difference = Math.abs(first - second)
  return Math.min(difference, 8 - difference)
}

function random_item<T>(items: readonly T[], random: () => number) {
  if (items.length === 0) return undefined
  const index = Math.min(
    items.length - 1,
    Math.floor(random() * items.length),
  )
  return items[index]
}

function candidate_for(
  candidates: readonly RouteCandidate[],
  node_index: number,
) {
  return candidates.find((candidate) => candidate.index === node_index)
}

export function collect_route_candidates(
  sky_map: Pick<DecodedSkyMap, 'directions' | 'magnitudes' | 'node_groups'>,
  view: SkyMapViewProjection,
) {
  const candidates: RouteCandidate[] = []
  for (let index = 0; index < sky_map.magnitudes.length; index += 1) {
    if (sky_map.magnitudes[index] > ROUTE_CANDIDATE_MAGNITUDE) continue
    if (sky_map.node_groups[index] < 0) continue

    const direction = direction_for(sky_map.directions, index)
    const right = dot(direction, view.right)
    const up = dot(direction, view.up)
    const forward = dot(direction, view.forward)
    const denominator = Math.max(0.08, 1 + forward)
    const horizontal =
      (((2 * right) / denominator) * view.map_scale) / view.aspect
    const vertical = ((2 * up) / denominator) * view.map_scale
    const depth = (forward + 1) * 0.5
    const radius = Math.hypot(horizontal * view.aspect, vertical)
    if (depth < 0.12 || radius < ROUTE_CENTER_RADIUS) continue

    const angle = Math.atan2(-vertical, -horizontal * view.aspect)
    candidates.push({
      index,
      radius,
      sector: Math.floor((((angle + TAU) % TAU) / TAU) * 8),
      view_distance: Math.acos(clamp_unit(forward)),
    })
  }
  return candidates
}

export function select_route(
  options: RouteSelectionOptions,
): readonly [number, number] {
  const { candidates, sky_map } = options
  if (candidates.length === 0) return options.fallback

  const visible_sources = candidates.filter(
    (candidate) => candidate.radius <= ROUTE_SOURCE_MAX_RADIUS,
  )
  const source_pool =
    visible_sources.length > 0 ? visible_sources : candidates
  let source = options.target_index
  const carried_constellation =
    source >= 0 ? sky_map.node_groups[source] : -1
  const carried_sources = source_pool.filter(
    (candidate) =>
      sky_map.node_groups[candidate.index] === carried_constellation &&
      candidate.index !== source,
  )
  const carried_pool =
    carried_sources.length > 0
      ? carried_sources
      : source_pool.filter(
          (candidate) =>
            sky_map.node_groups[candidate.index] === carried_constellation,
        )
  let source_candidate =
    random_item(carried_pool, options.random) ??
    (source >= 0 ? candidate_for(candidates, source) : undefined)
  if (
    !source_candidate ||
    source_candidate.radius > ROUTE_SOURCE_MAX_RADIUS
  ) {
    source_candidate = random_item(source_pool, options.random)
  }
  if (!source_candidate) return options.fallback
  source = source_candidate.index

  const source_direction = direction_for(sky_map.directions, source)
  const source_group = sky_map.node_groups[source]
  const previous_source_group =
    options.previous_source_index >= 0
      ? sky_map.node_groups[options.previous_source_index]
      : -1
  const has_incoming_direction =
    options.previous_source_index >= 0 &&
    options.previous_source_index !== source
  const backtrack_tangent = has_incoming_direction
    ? tangent_from(
        source_direction,
        direction_for(sky_map.directions, options.previous_source_index),
      )
    : undefined
  const measured_candidates: RouteMetrics[] = []

  for (const candidate of candidates) {
    if (candidate.index === source) continue
    const target_group = sky_map.node_groups[candidate.index]
    if (target_group === source_group) continue

    const distance = angular_distance(
      source_direction,
      direction_for(sky_map.directions, candidate.index),
    )
    const camera_rotation = Math.max(
      0,
      candidate.view_distance - ROUTE_TARGET_VISIBLE_OFFSET,
    )
    if (
      camera_rotation < ROUTE_MIN_CAMERA_ROTATION ||
      camera_rotation > ROUTE_MAX_CAMERA_ROTATION
    ) {
      continue
    }

    const target_direction = direction_for(
      sky_map.directions,
      candidate.index,
    )
    const outgoing_tangent = tangent_from(
      source_direction,
      target_direction,
    )
    const backtrack_dot = backtrack_tangent
      ? dot(outgoing_tangent, backtrack_tangent)
      : -1
    const final_forward = interpolate_direction(
      options.forward,
      target_direction,
      camera_rotation / candidate.view_distance,
    )
    measured_candidates.push({
      backtrack_dot,
      camera_rotation,
      candidate,
      distance,
      final_source_distance: angular_distance(
        source_direction,
        final_forward,
      ),
      target_group,
    })
  }

  const scored_candidates: ScoredRouteCandidate[] = []
  for (const metrics of measured_candidates) {
    const {
      backtrack_dot,
      camera_rotation,
      candidate,
      distance,
      final_source_distance,
      target_group,
    } = metrics
    if (
      distance < ROUTE_MIN_DISTANCE ||
      distance > ROUTE_MAX_DISTANCE ||
      final_source_distance < ROUTE_FINAL_SOURCE_MIN_DISTANCE
    ) {
      continue
    }
    const distance_score =
      (distance - ROUTE_MIN_DISTANCE) /
      (ROUTE_MAX_DISTANCE - ROUTE_MIN_DISTANCE)
    const rotation_score = Math.max(
      0,
      1 -
        Math.abs(camera_rotation - ROUTE_PREFERRED_CAMERA_ROTATION) /
          ROUTE_PREFERRED_CAMERA_ROTATION,
    )
    const direction_score =
      sector_gap(source_candidate.sector, candidate.sector) / 4
    const continuation_score = (1 - backtrack_dot) * 0.5
    const source_exit_score = Math.min(
      1,
      (final_source_distance - ROUTE_FINAL_SOURCE_MIN_DISTANCE) /
        (ROUTE_MAX_DISTANCE - ROUTE_FINAL_SOURCE_MIN_DISTANCE),
    )
    const outbound_score = Math.min(
      1,
      Math.max(
        0,
        (candidate.radius - ROUTE_SOURCE_MAX_RADIUS) /
          (ROUTE_OUTBOUND_RADIUS - ROUTE_SOURCE_MAX_RADIUS),
      ),
    )
    scored_candidates.push({
      backtrack_dot,
      candidate,
      score:
        distance_score * 2 +
        rotation_score * 0.7 +
        source_exit_score * 0.55 +
        direction_score * 0.35 +
        continuation_score * 0.6 +
        outbound_score * 0.1,
      target_group,
    })
  }

  const non_reversing_candidates = scored_candidates.filter(
    ({ backtrack_dot, target_group }) =>
      backtrack_dot <= ROUTE_MAX_BACKTRACK_DOT &&
      target_group !== previous_source_group,
  )
  const fresh_candidates = non_reversing_candidates.filter(
    ({ target_group }) =>
      !options.recent_constellation_groups.includes(target_group),
  )
  const diverse_candidates =
    fresh_candidates.length > 0
      ? fresh_candidates
      : non_reversing_candidates.length > 0
        ? non_reversing_candidates
        : scored_candidates
  const directionally_separated = diverse_candidates.filter(
    ({ candidate }) =>
      sector_gap(source_candidate.sector, candidate.sector) >=
      ROUTE_MIN_SECTOR_GAP,
  )
  const route_pool =
    directionally_separated.length > 0
      ? directionally_separated
      : diverse_candidates
  route_pool.sort((first, second) => second.score - first.score)
  const finalists = route_pool.slice(0, ROUTE_SCORE_POOL_SIZE)
  const [fallback] = measured_candidates
    .filter(
      ({ distance, final_source_distance }) =>
        distance >= ROUTE_MIN_DISTANCE &&
        final_source_distance >= ROUTE_FINAL_SOURCE_MIN_DISTANCE,
    )
    .sort((first, second) => second.distance - first.distance)
  const route_target =
    random_item(finalists, options.random)?.candidate ??
    fallback?.candidate ??
    source_candidate
  return [source, route_target.index]
}
