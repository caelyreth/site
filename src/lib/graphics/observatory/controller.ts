/* oxlint-disable complexity, typescript/prefer-readonly-parameter-types -- WebGL setup and pulse state share one lifecycle. */
import { Quaternion, SRGBColorSpace, Vector3 } from 'three'
import type { BufferAttribute, InstancedBufferAttribute } from 'three'

import {
  BASE_VIEW_RADIUS,
  CAMERA_ANGULAR_SPEED,
  CAMERA_CAPTURE_LAG,
  CAMERA_MAX_ROUTE_LEAD,
  CAMERA_MAX_WIDENING,
  CAMERA_MIN_ROUTE_LEAD,
  CAMERA_MIN_WIDENING,
  CAMERA_VELOCITY_APEX,
  CONSTELLATION_RETIRE_DURATION,
  DESTINATION_CONSTELLATION_LEAD,
  FOREGROUND_CONTRACT_APEX_LEAD,
  FOREGROUND_CONTRACT_DELAY,
  FOREGROUND_CONTRACT_MAX_DURATION,
  FOREGROUND_CONTRACT_MIN_DURATION,
  FOREGROUND_RETURN_LAG,
  FOREGROUND_SETTLE_LAG,
  LOCATOR_COLLAPSE_DURATION,
  LOCATOR_DOT_SCALE,
  LOCATOR_DURATION,
  LOCATOR_INITIAL_SCALE,
  ROUTE_CANDIDATE_MAGNITUDE,
  ROUTE_CENTER_RADIUS,
  ROUTE_FINAL_SOURCE_MIN_DISTANCE,
  ROUTE_HISTORY_LENGTH,
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
  ROUTE_TERMINAL_VELOCITY,
  ROUTE_VELOCITY_APEX,
  ROLLER_MAX_DURATION,
  ROLLER_MIN_DURATION,
  SIGNAL_CONTINUATION_DISTANCE,
  SIGNAL_FADE_DISTANCE,
  SIGNAL_SPEED,
  SOURCE_RELEASE_DURATION,
  TRAIL_CAPTURE_LEAD,
  TRAIL_MAX_LENGTH,
  TRAIL_RELEASE_PROGRESS,
  TRAIL_RESPONSE,
  TAU,
  VIEW_STATUS_INTERVAL,
} from './constants'
import {
  camera_motion_progress,
  choose_pixel_ratio,
  critically_damped_progress,
  inverse_impulse_progress,
  map_scale_for_view_radius,
  route_progress,
  signal_progress,
  trail_release_opacity,
  zoom_envelope,
} from './motion'
import { create_sky_map_renderer } from './renderer'
import { SIGNAL_PALETTES } from './signal-colors'
import type {
  RouteCandidate,
  SkyMapController,
  SkyMapControllerCallbacks,
  SkyMapPayload,
} from './types'

export function create_sky_map_controller(
  target: HTMLCanvasElement,
  sky_data: SkyMapPayload,
  initial_dark = false,
  callbacks: SkyMapControllerCallbacks = {},
): SkyMapController {
  // MARK: - setup

  const sky_map_renderer = create_sky_map_renderer(
    target,
    sky_data,
    initial_dark,
  )
  if (!sky_map_renderer) {
    return { destroy: () => {}, set_active: () => {}, set_theme: () => {} }
  }

  const {
    dispose,
    draw,
    edge_geometry,
    renderer,
    sky_map,
    star_geometry,
    uniforms,
  } = sky_map_renderer
  const { SKY_SOURCE_NODES } = sky_data
  const node_distances = new Float32Array(sky_map.magnitudes.length)
  const reduced_motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const base_right = uniforms.uRight.value.clone().normalize()
  const base_up = uniforms.uUp.value.clone().normalize()
  const base_forward = uniforms.uForward.value.clone().normalize()
  const view_orientation = new Quaternion()
  const trail_orientation = new Quaternion()
  const route_start_orientation = new Quaternion()
  const route_end_orientation = new Quaternion()
  const route_orientation_delta = new Quaternion()
  const route_view_start_forward = new Vector3()
  const route_view_end_forward = new Vector3()
  const route_target_direction = new Vector3()
  const scored_source_direction = new Vector3()
  const scored_target_direction = new Vector3()
  const scored_final_forward = new Vector3()
  const scored_previous_source_direction = new Vector3()
  const scored_backtrack_tangent = new Vector3()
  const scored_outgoing_tangent = new Vector3()

  let requested_active = false
  let active = false
  let disposed = false
  let frame = 0
  let idle_timer = 0
  let pulse_running = false
  let previous_render_time = 0
  let signal_phase: 'locating' | 'collapsing' | 'spreading' = 'locating'
  let phase_started_at = 0
  let source_activation_at_spread = 0
  let source_index = -1
  let target_index = -1
  let previous_route_source_index = -1
  let signal_color_index = -1
  let dark_mode = initial_dark
  let signal_started_at = performance.now()
  let current_constellations_held = false
  let target_distance = Math.PI / 2
  let signal_travel_distance = Math.PI / 2
  let signal_fade_start_distance = Math.PI / 2
  let signal_duration = signal_travel_distance / SIGNAL_SPEED
  let camera_duration = 5000
  let camera_start_delay = CAMERA_MIN_ROUTE_LEAD
  let route_wide_view_radius = BASE_VIEW_RADIUS + CAMERA_MIN_WIDENING
  let roller_direction: -1 | 1 = 1
  let roller_motion_sequence = 0
  let destination_arrived = false
  let foreground_contract_start = FOREGROUND_CONTRACT_DELAY
  let foreground_contract_end = FOREGROUND_CONTRACT_DELAY
  let foreground_return_start = 0
  let foreground_return_end = 0
  let foreground_contract_started = false
  let foreground_return_started = false
  let roller_motion_started = false
  let trail_release_start = 0
  let trail_release_duration = 1
  let last_camera_progress = -1
  let spreading = false
  let last_view_status_at = -Infinity
  let last_view_status_key = ''
  let view_radius = BASE_VIEW_RADIUS
  let trail_view_radius = BASE_VIEW_RADIUS

  // MARK: - route state

  const recent_constellation_groups: number[] = []

  function angular_distance_from_node(source_offset: number, node_index: number) {
    const node_offset = node_index * 3
    const cosine =
      sky_map.directions[source_offset] * sky_map.directions[node_offset] +
      sky_map.directions[source_offset + 1] *
        sky_map.directions[node_offset + 1] +
      sky_map.directions[source_offset + 2] *
        sky_map.directions[node_offset + 2]
    return Math.acos(Math.max(-1, Math.min(1, cosine)))
  }

  function angular_distance_between_nodes(
    first_index: number,
    second_index: number,
  ) {
    return angular_distance_from_node(first_index * 3, second_index)
  }

  function angular_distance_between_directions(first: Vector3, second: Vector3) {
    return Math.acos(Math.max(-1, Math.min(1, first.dot(second))))
  }

  function set_node_direction(node_index: number, direction_target: Vector3) {
    const node_offset = node_index * 3
    direction_target.set(
      sky_map.directions[node_offset],
      sky_map.directions[node_offset + 1],
      sky_map.directions[node_offset + 2],
    )
    return direction_target.normalize()
  }

  function project_node(node_index: number) {
    const node_offset = node_index * 3
    const right =
      sky_map.directions[node_offset] * uniforms.uRight.value.x +
      sky_map.directions[node_offset + 1] * uniforms.uRight.value.y +
      sky_map.directions[node_offset + 2] * uniforms.uRight.value.z
    const up =
      sky_map.directions[node_offset] * uniforms.uUp.value.x +
      sky_map.directions[node_offset + 1] * uniforms.uUp.value.y +
      sky_map.directions[node_offset + 2] * uniforms.uUp.value.z
    const forward =
      sky_map.directions[node_offset] * uniforms.uForward.value.x +
      sky_map.directions[node_offset + 1] * uniforms.uForward.value.y +
      sky_map.directions[node_offset + 2] * uniforms.uForward.value.z
    const denominator = Math.max(0.08, 1 + forward)
    const horizontal =
      (((2 * right) / denominator) * uniforms.uMapScale.value) /
      uniforms.uAspect.value
    const vertical = ((2 * up) / denominator) * uniforms.uMapScale.value
    return {
      depth: (forward + 1) * 0.5,
      radius: Math.hypot(horizontal * uniforms.uAspect.value, vertical),
      view_distance: Math.acos(Math.max(-1, Math.min(1, forward))),
      x: 0.5 - horizontal,
      y: 0.5 - vertical,
    }
  }

  function sector_gap(first: number, second: number) {
    const difference = Math.abs(first - second)
    return Math.min(difference, 8 - difference)
  }

  function route_candidate_for(node_index: number): RouteCandidate | undefined {
    if (sky_map.magnitudes[node_index] > ROUTE_CANDIDATE_MAGNITUDE) return
    if (sky_map.node_groups[node_index] < 0) return
    const projected = project_node(node_index)
    if (projected.depth < 0.12 || projected.radius < ROUTE_CENTER_RADIUS) return
    const angle = Math.atan2(
      projected.y - 0.5,
      (projected.x - 0.5) * uniforms.uAspect.value,
    )
    return {
      index: node_index,
      radius: projected.radius,
      sector: Math.floor((((angle + TAU) % TAU) / TAU) * 8),
      view_distance: projected.view_distance,
    }
  }

  function collect_route_candidates() {
    const candidates: RouteCandidate[] = []
    for (let index = 0; index < sky_map.magnitudes.length; index += 1) {
      const candidate = route_candidate_for(index)
      if (candidate) candidates.push(candidate)
    }
    return candidates
  }

  function interpolate_direction(
    first: Vector3,
    second: Vector3,
    progress: number,
    direction_target: Vector3,
  ) {
    const clamped_progress = Math.min(1, Math.max(0, progress))
    const angle = angular_distance_between_directions(first, second)
    if (angle < 0.0001) return direction_target.copy(first)
    const denominator = Math.sin(angle)
    if (Math.abs(denominator) < 0.0001) {
      return direction_target.copy(first).lerp(second, clamped_progress).normalize()
    }
    return direction_target
      .copy(first)
      .multiplyScalar(Math.sin((1 - clamped_progress) * angle) / denominator)
      .addScaledVector(second, Math.sin(clamped_progress * angle) / denominator)
      .normalize()
  }

  function choose_route() {
    const candidates = collect_route_candidates()
    if (candidates.length === 0) {
      return [SKY_SOURCE_NODES[0], SKY_SOURCE_NODES[1]] as const
    }
    const visible_sources = candidates.filter(
      (candidate) => candidate.radius <= ROUTE_SOURCE_MAX_RADIUS,
    )
    const source_pool = visible_sources.length > 0 ? visible_sources : candidates
    let source = target_index
    const carried_constellation = source >= 0 ? sky_map.node_groups[source] : -1
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
      carried_pool[Math.floor(Math.random() * carried_pool.length)] ??
      (source >= 0 ? route_candidate_for(source) : undefined)
    if (source_candidate) source = source_candidate.index
    if (!source_candidate || source_candidate.radius > ROUTE_SOURCE_MAX_RADIUS) {
      source_candidate = source_pool[Math.floor(Math.random() * source_pool.length)]
      source = source_candidate.index
    }

    set_node_direction(source, scored_source_direction)
    const source_group = sky_map.node_groups[source]
    const previous_source_group =
      previous_route_source_index >= 0
        ? sky_map.node_groups[previous_route_source_index]
        : -1
    const has_incoming_direction =
      previous_route_source_index >= 0 && previous_route_source_index !== source
    if (has_incoming_direction) {
      set_node_direction(
        previous_route_source_index,
        scored_previous_source_direction,
      )
      scored_backtrack_tangent
        .copy(scored_previous_source_direction)
        .addScaledVector(
          scored_source_direction,
          -scored_previous_source_direction.dot(scored_source_direction),
        )
        .normalize()
    }
    const measured_candidates = candidates.flatMap((candidate) => {
      if (candidate.index === source) return []
      const target_group = sky_map.node_groups[candidate.index]
      if (target_group === source_group) return []
      const distance = angular_distance_between_nodes(source, candidate.index)
      const camera_rotation = Math.max(
        0,
        candidate.view_distance - ROUTE_TARGET_VISIBLE_OFFSET,
      )
      if (
        camera_rotation < ROUTE_MIN_CAMERA_ROTATION ||
        camera_rotation > ROUTE_MAX_CAMERA_ROTATION
      ) {
        return []
      }
      set_node_direction(candidate.index, scored_target_direction)
      scored_outgoing_tangent
        .copy(scored_target_direction)
        .addScaledVector(
          scored_source_direction,
          -scored_target_direction.dot(scored_source_direction),
        )
        .normalize()
      const backtrack_dot = has_incoming_direction
        ? scored_outgoing_tangent.dot(scored_backtrack_tangent)
        : -1
      interpolate_direction(
        uniforms.uForward.value,
        scored_target_direction,
        camera_rotation / candidate.view_distance,
        scored_final_forward,
      )
      return [
        {
          backtrack_dot,
          camera_rotation,
          candidate,
          distance,
          final_source_distance: angular_distance_between_directions(
            scored_source_direction,
            scored_final_forward,
          ),
          target_group,
        },
      ]
    })
    const scored_candidates = measured_candidates.flatMap((metrics) => {
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
        return []
      }
      const distance_score =
        (distance - ROUTE_MIN_DISTANCE) / (ROUTE_MAX_DISTANCE - ROUTE_MIN_DISTANCE)
      const rotation_score = Math.max(
        0,
        1 -
          Math.abs(camera_rotation - ROUTE_PREFERRED_CAMERA_ROTATION) /
            ROUTE_PREFERRED_CAMERA_ROTATION,
      )
      const direction_score = sector_gap(source_candidate.sector, candidate.sector) / 4
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
      return [
        {
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
        },
      ]
    })
    const non_reversing_candidates = scored_candidates.filter(
      ({ backtrack_dot, target_group }) =>
        backtrack_dot <= ROUTE_MAX_BACKTRACK_DOT &&
        target_group !== previous_source_group,
    )
    const fresh_candidates = non_reversing_candidates.filter(
      ({ target_group }) => !recent_constellation_groups.includes(target_group),
    )
    const diverse_candidates =
      fresh_candidates.length > 0
        ? fresh_candidates
        : non_reversing_candidates.length > 0
          ? non_reversing_candidates
          : scored_candidates
    const directionally_separated = diverse_candidates.filter(
      ({ candidate }) =>
        sector_gap(source_candidate.sector, candidate.sector) >= ROUTE_MIN_SECTOR_GAP,
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
      finalists[Math.floor(Math.random() * finalists.length)]?.candidate ??
      fallback?.candidate ??
      source_candidate
    return [source, route_target.index] as const
  }

  function camera_rotation_for_target(view_distance: number) {
    return Math.min(
      ROUTE_MAX_CAMERA_ROTATION,
      Math.max(0, view_distance - ROUTE_TARGET_VISIBLE_OFFSET),
    )
  }

  function set_basis_from_orientation(
    orientation: Quaternion,
    right: Vector3,
    up: Vector3,
    forward: Vector3,
  ) {
    right.copy(base_right).applyQuaternion(orientation)
    up.copy(base_up).applyQuaternion(orientation)
    forward.copy(base_forward).applyQuaternion(orientation)
  }

  function apply_view_state() {
    set_basis_from_orientation(
      view_orientation,
      uniforms.uRight.value,
      uniforms.uUp.value,
      uniforms.uForward.value,
    )
    uniforms.uMapScale.value = map_scale_for_view_radius(view_radius)
  }

  function apply_trail_state() {
    set_basis_from_orientation(
      trail_orientation,
      uniforms.uTrailRight.value,
      uniforms.uTrailUp.value,
      uniforms.uTrailForward.value,
    )
    uniforms.uTrailMapScale.value = map_scale_for_view_radius(trail_view_radius)
  }

  function sync_trail_view() {
    trail_orientation.copy(view_orientation)
    trail_view_radius = view_radius
    apply_trail_state()
    uniforms.uTrailOpacity.value = 0
  }

  function update_trail_view(
    delta_milliseconds: number,
    release_opacity: number,
    camera_progress: number,
  ) {
    if (camera_progress <= 0) {
      uniforms.uTrailOpacity.value = 0
      return
    }
    if (release_opacity <= 0) {
      if (uniforms.uTrailOpacity.value > 0) sync_trail_view()
      return
    }
    const response = 1 - Math.exp((-TRAIL_RESPONSE * delta_milliseconds) / 1000)
    trail_orientation.slerp(view_orientation, response)
    trail_view_radius += (view_radius - trail_view_radius) * response
    apply_trail_state()
    const angular_lag = trail_orientation.angleTo(view_orientation)
    const radius_lag = Math.abs(view_radius - trail_view_radius)
    uniforms.uTrailOpacity.value =
      Math.min(1, Math.max(0, (angular_lag + radius_lag * 0.7) / 0.008)) *
      release_opacity
  }

  function update_route_view(progress: number) {
    if (progress === last_camera_progress) return
    last_camera_progress = progress
    view_orientation
      .copy(route_start_orientation)
      .slerp(route_end_orientation, camera_motion_progress(progress))
    view_radius =
      BASE_VIEW_RADIUS +
      (route_wide_view_radius - BASE_VIEW_RADIUS) * zoom_envelope(progress)
    apply_view_state()
  }

  function configure_route_timing(camera_rotation: number) {
    const nominal_camera_duration = camera_rotation / CAMERA_ANGULAR_SPEED
    const rotation_range = ROUTE_MAX_CAMERA_ROTATION - ROUTE_MIN_CAMERA_ROTATION
    const rotation_ratio = Math.min(
      1,
      Math.max(0, (camera_rotation - ROUTE_MIN_CAMERA_ROTATION) / rotation_range),
    )
    route_wide_view_radius =
      BASE_VIEW_RADIUS +
      CAMERA_MIN_WIDENING +
      (CAMERA_MAX_WIDENING - CAMERA_MIN_WIDENING) * rotation_ratio
    const target_arrival_progress = inverse_impulse_progress(
      target_distance / signal_travel_distance,
      ROUTE_VELOCITY_APEX,
      ROUTE_TERMINAL_VELOCITY,
    )
    signal_duration = signal_travel_distance / SIGNAL_SPEED
    let target_arrival_time = target_arrival_progress * signal_duration
    const minimum_target_arrival =
      CAMERA_MIN_ROUTE_LEAD + nominal_camera_duration - CAMERA_CAPTURE_LAG
    if (target_arrival_time < minimum_target_arrival) {
      signal_duration *= minimum_target_arrival / target_arrival_time
      target_arrival_time = minimum_target_arrival
    }
    const nominal_camera_start =
      target_arrival_time + CAMERA_CAPTURE_LAG - nominal_camera_duration
    camera_start_delay = Math.min(
      CAMERA_MAX_ROUTE_LEAD,
      Math.max(CAMERA_MIN_ROUTE_LEAD, nominal_camera_start),
    )
    camera_duration = target_arrival_time + CAMERA_CAPTURE_LAG - camera_start_delay
    const camera_apex_time =
      camera_start_delay + camera_duration * CAMERA_VELOCITY_APEX
    foreground_contract_start = FOREGROUND_CONTRACT_DELAY
    const desired_contract_duration =
      camera_apex_time - foreground_contract_start - FOREGROUND_CONTRACT_APEX_LEAD
    const contract_duration = Math.min(
      FOREGROUND_CONTRACT_MAX_DURATION,
      Math.max(FOREGROUND_CONTRACT_MIN_DURATION, desired_contract_duration),
    )
    foreground_contract_end = foreground_contract_start + contract_duration
    foreground_return_start = camera_apex_time + FOREGROUND_RETURN_LAG
    foreground_return_end =
      camera_start_delay + camera_duration + FOREGROUND_SETTLE_LAG
    trail_release_start = camera_start_delay + camera_duration * TRAIL_RELEASE_PROGRESS
    trail_release_duration = Math.max(
      1,
      camera_start_delay + camera_duration - TRAIL_CAPTURE_LEAD - trail_release_start,
    )
  }

  function configure_roller_direction() {
    const vertical_pan = route_view_end_forward.dot(uniforms.uUp.value)
    roller_direction = vertical_pan >= 0 ? -1 : 1
  }

  function set_route(source: number, route_target: number) {
    last_camera_progress = -1
    const star_distance = star_geometry.getAttribute('aDistance') as BufferAttribute
    const star_target_distance = star_geometry.getAttribute(
      'aTargetDistance',
    ) as BufferAttribute
    const edge_start_distance = edge_geometry.getAttribute(
      'aDistanceStart',
    ) as InstancedBufferAttribute
    const edge_end_distance = edge_geometry.getAttribute(
      'aDistanceEnd',
    ) as InstancedBufferAttribute
    const edge_target_start_distance = edge_geometry.getAttribute(
      'aTargetDistanceStart',
    ) as InstancedBufferAttribute
    const edge_target_end_distance = edge_geometry.getAttribute(
      'aTargetDistanceEnd',
    ) as InstancedBufferAttribute
    const locator = star_geometry.getAttribute('aLocator') as BufferAttribute
    const previous_source = source_index
    source_index = source
    target_index = route_target
    uniforms.uSourceConstellation.value = sky_map.node_groups[source_index]
    uniforms.uTargetConstellation.value = sky_map.node_groups[target_index]
    set_node_direction(source_index, uniforms.uRouteStart.value)
    set_node_direction(target_index, uniforms.uRouteEnd.value)
    uniforms.uRouteBend.value.crossVectors(
      uniforms.uRouteStart.value,
      uniforms.uRouteEnd.value,
    )
    if (uniforms.uRouteBend.value.lengthSq() < 0.0001) {
      uniforms.uRouteBend.value.copy(uniforms.uUp.value)
    } else {
      uniforms.uRouteBend.value.normalize()
      if (uniforms.uRouteBend.value.dot(uniforms.uUp.value) < 0) {
        uniforms.uRouteBend.value.multiplyScalar(-1)
      }
    }
    if (previous_source !== source_index) {
      if (previous_source >= 0) locator.setX(previous_source, 0)
      locator.setX(source_index, 1)
      locator.needsUpdate = true
    }
    const source_offset = source_index * 3
    const target_node_offset = target_index * 3
    const source_constellation = sky_map.node_groups[source_index]
    const target_constellation = sky_map.node_groups[target_index]
    let constellation_reveal_distance = 0
    let target_constellation_radius = 0
    for (let index = 0; index < sky_map.magnitudes.length; index += 1) {
      const distance = angular_distance_from_node(source_offset, index)
      const target_distance_for_node = angular_distance_from_node(
        target_node_offset,
        index,
      )
      node_distances[index] = distance
      star_distance.setX(index, distance)
      star_target_distance.setX(index, target_distance_for_node)
      if (
        sky_map.node_groups[index] === source_constellation ||
        sky_map.node_groups[index] === target_constellation
      ) {
        constellation_reveal_distance = Math.max(
          constellation_reveal_distance,
          distance,
        )
      }
      if (sky_map.node_groups[index] === target_constellation) {
        target_constellation_radius = Math.max(
          target_constellation_radius,
          target_distance_for_node,
        )
      }
    }
    const edge_count = sky_map.edge_nodes.length / 2
    for (let index = 0; index < edge_count; index += 1) {
      edge_start_distance.setX(
        index,
        node_distances[sky_map.edge_nodes[index * 2]],
      )
      edge_end_distance.setX(
        index,
        node_distances[sky_map.edge_nodes[index * 2 + 1]],
      )
      edge_target_start_distance.setX(
        index,
        star_target_distance.getX(sky_map.edge_nodes[index * 2]),
      )
      edge_target_end_distance.setX(
        index,
        star_target_distance.getX(sky_map.edge_nodes[index * 2 + 1]),
      )
    }
    star_distance.needsUpdate = true
    star_target_distance.needsUpdate = true
    edge_start_distance.needsUpdate = true
    edge_end_distance.needsUpdate = true
    edge_target_start_distance.needsUpdate = true
    edge_target_end_distance.needsUpdate = true
    target_distance = node_distances[target_index]
    uniforms.uTargetDistance.value = target_distance
    uniforms.uRouteLength.value = target_distance
    signal_fade_start_distance = Math.max(
      target_distance + SIGNAL_CONTINUATION_DISTANCE,
      constellation_reveal_distance + SIGNAL_CONTINUATION_DISTANCE,
      target_distance -
        DESTINATION_CONSTELLATION_LEAD +
        target_constellation_radius +
        SIGNAL_CONTINUATION_DISTANCE,
    )
    signal_travel_distance = signal_fade_start_distance + SIGNAL_FADE_DISTANCE
    route_start_orientation.copy(view_orientation)
    route_view_start_forward.copy(uniforms.uForward.value)
    set_node_direction(target_index, route_target_direction)
    const target_view_distance = angular_distance_between_directions(
      route_view_start_forward,
      route_target_direction,
    )
    const camera_rotation = camera_rotation_for_target(target_view_distance)
    const target_view_progress =
      target_view_distance > 0.0001 ? camera_rotation / target_view_distance : 0
    interpolate_direction(
      route_view_start_forward,
      route_target_direction,
      target_view_progress,
      route_view_end_forward,
    )
    route_orientation_delta.setFromUnitVectors(
      route_view_start_forward,
      route_view_end_forward,
    )
    route_end_orientation
      .copy(route_start_orientation)
      .premultiply(route_orientation_delta)
      .normalize()
    configure_route_timing(camera_rotation)
    configure_roller_direction()
    previous_route_source_index = source_index
    const existing_target_group = recent_constellation_groups.indexOf(
      target_constellation,
    )
    if (existing_target_group >= 0) {
      recent_constellation_groups.splice(existing_target_group, 1)
    }
    recent_constellation_groups.unshift(target_constellation)
    recent_constellation_groups.length = Math.min(
      recent_constellation_groups.length,
      ROUTE_HISTORY_LENGTH,
    )
  }

  function retire_previous_constellation() {
    const source_group = sky_map.node_groups[source_index]
    const target_group = sky_map.node_groups[target_index]
    const held_source_group = uniforms.uHeldSourceConstellation.value
    const held_target_group = uniforms.uHeldTargetConstellation.value
    const retiring_group =
      [held_source_group, held_target_group].find(
        (group) =>
          group >= 0 && group !== source_group && group !== target_group,
      ) ?? -1
    uniforms.uRetiringConstellation.value = retiring_group
    uniforms.uRetireProgress.value = retiring_group < 0 ? 1 : 0
  }

  function hold_current_constellations() {
    uniforms.uHeldSourceConstellation.value = uniforms.uSourceConstellation.value
    uniforms.uHeldTargetConstellation.value = uniforms.uTargetConstellation.value
  }

  // MARK: - rendering

  function publish_view_status() {
    if (!callbacks.on_view_change) return
    const now = performance.now()
    if (now - last_view_status_at < VIEW_STATUS_INTERVAL) return
    const forward = uniforms.uForward.value
    const right_ascension =
      ((Math.atan2(forward.z, forward.x) * 180) / Math.PI + 360) % 360
    const declination = (Math.asin(forward.y) * 180) / Math.PI
    const scale = uniforms.uMapScale.value
    const status_key = `${right_ascension.toFixed(2)}:${declination.toFixed(2)}:${scale.toFixed(3)}`
    if (status_key === last_view_status_key) return
    last_view_status_at = now
    last_view_status_key = status_key
    callbacks.on_view_change({ declination, right_ascension, scale })
  }

  function render() {
    publish_view_status()
    draw(publish_view_status)
  }

  function update_signal_color(select_new_color = false) {
    const palette = dark_mode ? SIGNAL_PALETTES.dark : SIGNAL_PALETTES.light
    if (select_new_color || signal_color_index < 0) {
      let next = Math.floor(Math.random() * palette.length)
      if (next === signal_color_index && palette.length > 1) {
        next = (next + 1) % palette.length
      }
      signal_color_index = next
    }
    uniforms.uSignalInk.value.setHex(palette[signal_color_index], SRGBColorSpace)
  }

  function update_theme(dark: boolean) {
    dark_mode = dark
    uniforms.uInk.value.setHex(
      dark ? 0xe6e6e6 : 0x1b3851,
      SRGBColorSpace,
    )
    uniforms.uBaseAlpha.value = dark ? 0.18 : 0.26
    uniforms.uBackgroundAlpha.value = dark ? 2 : 0.24
    uniforms.uBackgroundInk.value.setHex(
      dark ? 0xe6e6e6 : 0x294c67,
      SRGBColorSpace,
    )
    uniforms.uSurveyMode.value = dark ? 0 : 1
    update_signal_color()
  }

  function resize() {
    const bounds = target.getBoundingClientRect()
    const width = Math.max(1, bounds.width)
    const height = Math.max(1, bounds.height)
    const pixel_ratio = choose_pixel_ratio(width, height)
    renderer.setPixelRatio(pixel_ratio)
    renderer.setSize(width, height, false)
    uniforms.uResolution.value.set(width * pixel_ratio, height * pixel_ratio)
    uniforms.uPixelRatio.value = pixel_ratio
    uniforms.uAspect.value = width / height
    uniforms.uHalfWidth.value = 1.32 * pixel_ratio
    uniforms.uTrailMaxLength.value = TRAIL_MAX_LENGTH * pixel_ratio
    if (source_index < 0 || target_index < 0) {
      const [source, route_target] = choose_route()
      set_route(source, route_target)
    }
    render()
  }

  // MARK: - pulse lifecycle

  function stop_frame() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  function stop_timer() {
    if (idle_timer) window.clearTimeout(idle_timer)
    idle_timer = 0
  }

  function end_spread() {
    if (!spreading) return
    spreading = false
    callbacks.on_spread_end?.()
  }

  function stop() {
    stop_frame()
    stop_timer()
    pulse_running = false
    end_spread()
  }

  function enter_idle() {
    pulse_running = false
    stop_frame()
    if (!current_constellations_held) hold_current_constellations()
    current_constellations_held = true
    uniforms.uRetiringConstellation.value = -1
    uniforms.uRetireProgress.value = 1
    uniforms.uPulseActive.value = 0
    uniforms.uSourceActivation.value = 0
    uniforms.uPulseDistance.value = 0
    uniforms.uRoutePulseDistance.value = 0
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = 1
    uniforms.uTrailOpacity.value = 0
    end_spread()
    if (target_index >= 0) {
      update_route_view(1)
      if (!destination_arrived) {
        destination_arrived = true
        callbacks.on_destination_arrival?.()
      }
    }
    sync_trail_view()
    render()
    if (active && !disposed) {
      idle_timer = window.setTimeout(begin_pulse, 2600 + Math.random() * 3000)
    }
  }

  function animate(now: number) {
    if (!active || disposed || !pulse_running) return
    const minimum_frame_duration = 1000 / 60
    if (
      previous_render_time > 0 &&
      now - previous_render_time < minimum_frame_duration * 0.9
    ) {
      frame = requestAnimationFrame(animate)
      return
    }
    const frame_delta =
      previous_render_time > 0
        ? Math.min(50, now - previous_render_time)
        : minimum_frame_duration
    previous_render_time = now
    const phase_elapsed = now - phase_started_at
    if (signal_phase === 'locating') {
      const locator_progress = critically_damped_progress(
        phase_elapsed / LOCATOR_DURATION,
      )
      uniforms.uLocatorProgress.value = locator_progress
      uniforms.uLocatorScale.value =
        LOCATOR_INITIAL_SCALE + (1 - LOCATOR_INITIAL_SCALE) * locator_progress
      render()
      if (phase_elapsed < LOCATOR_DURATION) {
        frame = requestAnimationFrame(animate)
        return
      }
      signal_phase = 'collapsing'
      phase_started_at = now
      uniforms.uLocatorProgress.value = 1
      uniforms.uLocatorScale.value = 1
      frame = requestAnimationFrame(animate)
      return
    }
    if (signal_phase === 'collapsing') {
      const collapse_progress = critically_damped_progress(
        phase_elapsed / LOCATOR_COLLAPSE_DURATION,
      )
      const locator_scale = 1 - collapse_progress
      uniforms.uLocatorProgress.value = 1
      uniforms.uLocatorScale.value = locator_scale
      uniforms.uSourceActivation.value = collapse_progress
      render()
      if (locator_scale > LOCATOR_DOT_SCALE) {
        frame = requestAnimationFrame(animate)
        return
      }
      signal_phase = 'spreading'
      phase_started_at = now
      signal_started_at = now
      source_activation_at_spread = collapse_progress
      uniforms.uLocatorProgress.value = 0
      uniforms.uLocatorScale.value = 1
      uniforms.uPulseActive.value = 1
      spreading = true
        callbacks.on_spread_start?.({
          color_index: signal_color_index,
          roller_direction,
      })
      frame = requestAnimationFrame(animate)
      return
    }
    const pulse_elapsed = now - signal_started_at
    if (pulse_elapsed >= signal_duration) {
      enter_idle()
      return
    }
    const timeline_progress = pulse_elapsed / signal_duration
    const pulse_distance = signal_travel_distance * signal_progress(timeline_progress)
    const route_pulse_distance =
      signal_travel_distance * route_progress(timeline_progress)
    const source_release = critically_damped_progress(
      pulse_elapsed / SOURCE_RELEASE_DURATION,
    )
    const camera_progress = Math.min(
      1,
      Math.max(0, (pulse_elapsed - camera_start_delay) / camera_duration),
    )
    if (!roller_motion_started && camera_progress > 0) {
      roller_motion_started = true
      roller_motion_sequence += 1
      callbacks.on_roller_motion?.({
        direction: roller_direction,
        duration: Math.min(
          ROLLER_MAX_DURATION,
          Math.max(ROLLER_MIN_DURATION, camera_duration * 0.72),
        ),
        sequence: roller_motion_sequence,
      })
    }
    const trail_opacity = trail_release_opacity(
      (pulse_elapsed - trail_release_start) / trail_release_duration,
    )
    const fade_progress = critically_damped_progress(
      (pulse_distance - signal_fade_start_distance) / SIGNAL_FADE_DISTANCE,
    )
    uniforms.uRetireProgress.value = critically_damped_progress(
      pulse_elapsed / CONSTELLATION_RETIRE_DURATION,
    )
    if (!current_constellations_held && pulse_distance >= signal_fade_start_distance) {
      hold_current_constellations()
      current_constellations_held = true
    }
    if (!foreground_contract_started && pulse_elapsed >= foreground_contract_start) {
      foreground_contract_started = true
      callbacks.on_foreground_contract_start?.({
        duration: Math.max(0, foreground_contract_end - pulse_elapsed),
      })
    }
    if (!foreground_return_started && pulse_elapsed >= foreground_return_start) {
      foreground_return_started = true
      callbacks.on_foreground_return_start?.({
        duration: Math.max(0, foreground_return_end - pulse_elapsed),
      })
    }
    update_route_view(camera_progress)
    if (!destination_arrived && camera_progress >= 1) {
      destination_arrived = true
      callbacks.on_destination_arrival?.()
    }
    update_trail_view(frame_delta, trail_opacity, camera_progress)
    uniforms.uPulseDistance.value = pulse_distance
    uniforms.uRoutePulseDistance.value = route_pulse_distance
    uniforms.uPulseActive.value = 1 - fade_progress
    uniforms.uSourceActivation.value = source_activation_at_spread * (1 - source_release)
    render()
    frame = requestAnimationFrame(animate)
  }

  function begin_pulse() {
    if (!active || disposed) return
    stop_timer()
    pulse_running = true
    const now = performance.now()
    previous_render_time = 0
    signal_phase = 'locating'
    phase_started_at = now
    foreground_contract_started = false
    foreground_return_started = false
    roller_motion_started = false
    destination_arrived = false
    source_activation_at_spread = 0
    current_constellations_held = false
    uniforms.uPulseActive.value = 0
    uniforms.uSourceActivation.value = 0
    uniforms.uPulseDistance.value = 0
    uniforms.uRoutePulseDistance.value = 0
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = LOCATOR_INITIAL_SCALE
    sync_trail_view()
    update_signal_color(true)
    const [source, route_target] = choose_route()
    set_route(source, route_target)
    retire_previous_constellation()
    stop_frame()
    frame = requestAnimationFrame(animate)
  }

  function sync_activity() {
    const next_active = requested_active && !reduced_motion.matches
    if (active === next_active) return
    stop()
    active = next_active
    if (next_active) {
      begin_pulse()
      return
    }
    uniforms.uPulseActive.value = 0
    uniforms.uSourceActivation.value = 0
    uniforms.uPulseDistance.value = 0
    uniforms.uRoutePulseDistance.value = 0
    uniforms.uLocatorProgress.value = 0
    uniforms.uLocatorScale.value = 1
    view_radius = BASE_VIEW_RADIUS
    apply_view_state()
    sync_trail_view()
    render()
  }

  const resize_observer = new ResizeObserver(resize)
  function handle_reduced_motion() {
    sync_activity()
  }

  update_theme(initial_dark)
  resize_observer.observe(target)
  reduced_motion.addEventListener('change', handle_reduced_motion)
  resize()

  return {
    set_active(next_active) {
      requested_active = next_active
      sync_activity()
    },
    set_theme(next_dark) {
      if (dark_mode === next_dark) return
      update_theme(next_dark)
      render()
    },
    destroy() {
      disposed = true
      stop()
      resize_observer.disconnect()
      reduced_motion.removeEventListener('change', handle_reduced_motion)
      dispose()
    },
  }
}
