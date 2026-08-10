/* oxlint-disable complexity, typescript/prefer-readonly-parameter-types -- WebGL setup and pulse state share one lifecycle. */
import { Quaternion, SRGBColorSpace, Vector3 } from 'three'
import type { BufferAttribute, InstancedBufferAttribute } from 'three'

import {
  BASE_VIEW_RADIUS,
  DESTINATION_CONSTELLATION_LEAD,
  LOCATOR_COLLAPSE_DURATION,
  LOCATOR_DOT_SCALE,
  LOCATOR_DURATION,
  LOCATOR_INITIAL_SCALE,
  ROUTE_HISTORY_LENGTH,
  ROUTE_MAX_CAMERA_ROTATION,
  ROUTE_TARGET_VISIBLE_OFFSET,
  SIGNAL_CONTINUATION_DISTANCE,
  SIGNAL_FADE_DISTANCE,
  TRAIL_MAX_LENGTH,
  TRAIL_RESPONSE,
  VIEW_STATUS_INTERVAL,
} from './constants'
import {
  camera_motion_progress,
  choose_pixel_ratio,
  critically_damped_progress,
  map_scale_for_view_radius,
  zoom_envelope,
} from './motion'
import { collect_route_candidates, select_route } from './route-selection'
import { SIGNAL_PALETTES } from './signal-colors'
import {
  create_pulse_timeline,
  pulse_frame_at,
  roller_motion_duration,
  type PulseTimeline,
} from './timeline'
import type {
  SkyMapEngine,
  SkyMapEngineCallbacks,
  SkyMapPayload,
} from './types'
import { create_sky_map_render_resources } from './webgl-resources'

export function create_sky_map_engine(
  target: HTMLCanvasElement,
  sky_data: SkyMapPayload,
  initial_dark = false,
  callbacks: SkyMapEngineCallbacks = {},
): SkyMapEngine {
  // MARK: - setup

  const sky_map_resources = create_sky_map_render_resources(
    target,
    sky_data,
    initial_dark,
  )
  if (!sky_map_resources) {
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
  } = sky_map_resources
  const { SKY_SOURCE_NODES } = sky_data
  const node_distances = new Float32Array(sky_map.magnitudes.length)
  const reduced_motion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  )
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
  let pulse_timeline: PulseTimeline | undefined
  let roller_direction: -1 | 1 = 1
  let roller_motion_sequence = 0
  let destination_arrived = false
  let foreground_contract_started = false
  let foreground_return_started = false
  let roller_motion_started = false
  let last_camera_progress = -1
  let spreading = false
  let last_view_status_at = -Infinity
  let last_view_status_key = ''
  let view_radius = BASE_VIEW_RADIUS
  let trail_view_radius = BASE_VIEW_RADIUS

  // MARK: - route state

  const recent_constellation_groups: number[] = []

  function angular_distance_from_node(
    source_offset: number,
    node_index: number,
  ) {
    const node_offset = node_index * 3
    const cosine =
      sky_map.directions[source_offset] * sky_map.directions[node_offset] +
      sky_map.directions[source_offset + 1] *
        sky_map.directions[node_offset + 1] +
      sky_map.directions[source_offset + 2] *
        sky_map.directions[node_offset + 2]
    return Math.acos(Math.max(-1, Math.min(1, cosine)))
  }

  function angular_distance_between_directions(
    first: Vector3,
    second: Vector3,
  ) {
    return Math.acos(Math.max(-1, Math.min(1, first.dot(second))))
  }

  function set_node_direction(
    node_index: number,
    direction_target: Vector3,
  ) {
    const node_offset = node_index * 3
    direction_target.set(
      sky_map.directions[node_offset],
      sky_map.directions[node_offset + 1],
      sky_map.directions[node_offset + 2],
    )
    return direction_target.normalize()
  }

  function vector_components(vector: Vector3) {
    return [vector.x, vector.y, vector.z] as const
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
      return direction_target
        .copy(first)
        .lerp(second, clamped_progress)
        .normalize()
    }
    return direction_target
      .copy(first)
      .multiplyScalar(
        Math.sin((1 - clamped_progress) * angle) / denominator,
      )
      .addScaledVector(
        second,
        Math.sin(clamped_progress * angle) / denominator,
      )
      .normalize()
  }

  function choose_route() {
    const view = {
      aspect: uniforms.uAspect.value,
      forward: vector_components(uniforms.uForward.value),
      map_scale: uniforms.uMapScale.value,
      right: vector_components(uniforms.uRight.value),
      up: vector_components(uniforms.uUp.value),
    }
    return select_route({
      candidates: collect_route_candidates(sky_map, view),
      fallback: [SKY_SOURCE_NODES[0], SKY_SOURCE_NODES[1]],
      forward: view.forward,
      previous_source_index: previous_route_source_index,
      random: Math.random,
      recent_constellation_groups,
      sky_map,
      target_index,
    })
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
    uniforms.uTrailMapScale.value =
      map_scale_for_view_radius(trail_view_radius)
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
    const response =
      1 - Math.exp((-TRAIL_RESPONSE * delta_milliseconds) / 1000)
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
    if (!pulse_timeline) return
    last_camera_progress = progress
    view_orientation
      .copy(route_start_orientation)
      .slerp(route_end_orientation, camera_motion_progress(progress))
    view_radius =
      BASE_VIEW_RADIUS +
      (pulse_timeline.route_wide_view_radius - BASE_VIEW_RADIUS) *
        zoom_envelope(progress)
    apply_view_state()
  }

  function configure_roller_direction() {
    const vertical_pan = route_view_end_forward.dot(uniforms.uUp.value)
    roller_direction = vertical_pan >= 0 ? -1 : 1
  }

  function set_route(source: number, route_target: number) {
    last_camera_progress = -1
    const star_distance = star_geometry.getAttribute(
      'aDistance',
    ) as BufferAttribute
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
    const locator = star_geometry.getAttribute(
      'aLocator',
    ) as BufferAttribute
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
    const signal_fade_start_distance = Math.max(
      target_distance + SIGNAL_CONTINUATION_DISTANCE,
      constellation_reveal_distance + SIGNAL_CONTINUATION_DISTANCE,
      target_distance -
        DESTINATION_CONSTELLATION_LEAD +
        target_constellation_radius +
        SIGNAL_CONTINUATION_DISTANCE,
    )
    const signal_travel_distance =
      signal_fade_start_distance + SIGNAL_FADE_DISTANCE
    route_start_orientation.copy(view_orientation)
    route_view_start_forward.copy(uniforms.uForward.value)
    set_node_direction(target_index, route_target_direction)
    const target_view_distance = angular_distance_between_directions(
      route_view_start_forward,
      route_target_direction,
    )
    const camera_rotation = camera_rotation_for_target(target_view_distance)
    const target_view_progress =
      target_view_distance > 0.0001
        ? camera_rotation / target_view_distance
        : 0
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
    pulse_timeline = create_pulse_timeline(
      target_distance,
      signal_fade_start_distance,
      signal_travel_distance,
      camera_rotation,
    )
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
    uniforms.uHeldSourceConstellation.value =
      uniforms.uSourceConstellation.value
    uniforms.uHeldTargetConstellation.value =
      uniforms.uTargetConstellation.value
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
    uniforms.uSignalInk.value.setHex(
      palette[signal_color_index],
      SRGBColorSpace,
    )
  }

  function update_theme(dark: boolean) {
    dark_mode = dark
    uniforms.uInk.value.setHex(dark ? 0xe6e6e6 : 0x1b3851, SRGBColorSpace)
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
    uniforms.uResolution.value.set(
      width * pixel_ratio,
      height * pixel_ratio,
    )
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
      idle_timer = window.setTimeout(
        begin_pulse,
        2600 + Math.random() * 3000,
      )
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
        LOCATOR_INITIAL_SCALE +
        (1 - LOCATOR_INITIAL_SCALE) * locator_progress
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
    if (
      !pulse_timeline ||
      pulse_elapsed >= pulse_timeline.signal_duration
    ) {
      enter_idle()
      return
    }
    const pulse_frame = pulse_frame_at(pulse_timeline, pulse_elapsed)
    if (!roller_motion_started && pulse_frame.camera_progress > 0) {
      roller_motion_started = true
      roller_motion_sequence += 1
      callbacks.on_roller_motion?.({
        direction: roller_direction,
        duration: roller_motion_duration(pulse_timeline.camera_duration),
        sequence: roller_motion_sequence,
      })
    }
    uniforms.uRetireProgress.value = pulse_frame.retire_progress
    if (
      !current_constellations_held &&
      pulse_frame.pulse_distance >=
        pulse_timeline.signal_fade_start_distance
    ) {
      hold_current_constellations()
      current_constellations_held = true
    }
    if (
      !foreground_contract_started &&
      pulse_elapsed >= pulse_timeline.foreground_contract_start
    ) {
      foreground_contract_started = true
      callbacks.on_foreground_contract_start?.({
        duration: Math.max(
          0,
          pulse_timeline.foreground_contract_end - pulse_elapsed,
        ),
      })
    }
    if (
      !foreground_return_started &&
      pulse_elapsed >= pulse_timeline.foreground_return_start
    ) {
      foreground_return_started = true
      callbacks.on_foreground_return_start?.({
        duration: Math.max(
          0,
          pulse_timeline.foreground_return_end - pulse_elapsed,
        ),
      })
    }
    update_route_view(pulse_frame.camera_progress)
    if (!destination_arrived && pulse_frame.camera_progress >= 1) {
      destination_arrived = true
      callbacks.on_destination_arrival?.()
    }
    update_trail_view(
      frame_delta,
      pulse_frame.trail_opacity,
      pulse_frame.camera_progress,
    )
    uniforms.uPulseDistance.value = pulse_frame.pulse_distance
    uniforms.uRoutePulseDistance.value = pulse_frame.route_pulse_distance
    uniforms.uPulseActive.value = 1 - pulse_frame.fade_progress
    uniforms.uSourceActivation.value =
      source_activation_at_spread * (1 - pulse_frame.source_release)
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
