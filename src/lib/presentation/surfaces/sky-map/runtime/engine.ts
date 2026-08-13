import {
  reduced_motion,
  type ReducedMotionPreference,
} from '$lib/site/reduced-motion'
/* oxlint-disable complexity -- WebGL setup and pulse state share one lifecycle. */
import { Quaternion, Vector3 } from 'three'

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
  TRAIL_RESPONSE,
  VIEW_STATUS_INTERVAL,
} from './constants'
import { decode_sky_map } from './decoder'
import {
  camera_motion_progress,
  clamp_unit,
  choose_pixel_ratio,
  critically_damped_progress,
  map_scale_for_view_radius,
  zoom_envelope,
} from './motion'
import { collect_route_candidates, select_route } from './route-selection'
import { sky_map_scene_theme } from './scene-theme'
import {
  create_pulse_timeline,
  pulse_frame_at,
  type PulseTimeline,
} from './timeline'
import type {
  SkyMapEngine,
  SkyMapEngineCallbacks,
  SkyMapPayload,
} from './types'
import { create_sky_map_renderer } from './webgl-resources'

export function create_sky_map_engine(
  target: HTMLCanvasElement,
  sky_data: SkyMapPayload,
  initial_dark = false,
  callbacks: SkyMapEngineCallbacks = {},
  motion_preference: ReducedMotionPreference = reduced_motion,
): SkyMapEngine {
  const sky_map = decode_sky_map(sky_data)
  const { SKY_SOURCE_NODES, SKY_VIEW_BASIS } = sky_data
  const maybe_sky_map_renderer = create_sky_map_renderer(
    target,
    sky_map,
    SKY_VIEW_BASIS,
    initial_dark,
  )
  if (!maybe_sky_map_renderer) {
    return { destroy: () => {}, set_active: () => {}, set_theme: () => {} }
  }
  const sky_map_renderer = maybe_sky_map_renderer

  const base_right = new Vector3(
    SKY_VIEW_BASIS[0],
    SKY_VIEW_BASIS[1],
    SKY_VIEW_BASIS[2],
  ).normalize()
  const base_up = new Vector3(
    SKY_VIEW_BASIS[3],
    SKY_VIEW_BASIS[4],
    SKY_VIEW_BASIS[5],
  ).normalize()
  const base_forward = new Vector3(
    SKY_VIEW_BASIS[6],
    SKY_VIEW_BASIS[7],
    SKY_VIEW_BASIS[8],
  ).normalize()
  const view_orientation = new Quaternion()
  const trail_orientation = new Quaternion()
  const route_start_orientation = new Quaternion()
  const route_end_orientation = new Quaternion()
  const route_orientation_delta = new Quaternion()
  const route_view_start_forward = new Vector3()
  const route_view_end_forward = new Vector3()
  const route_target_direction = new Vector3()
  const view_right = base_right.clone()
  const view_up = base_up.clone()
  const view_forward = base_forward.clone()
  const trail_right = base_right.clone()
  const trail_up = base_up.clone()
  const trail_forward = base_forward.clone()

  let requested_active = false
  let active = false
  let disposed = false
  let frame = 0
  let idle_timer = 0
  let pulse_running = false
  let previous_render_time = 0
  let signal_phase: 'locating' | 'collapsing' | 'transmitting' = 'locating'
  let phase_started_at = 0
  let source_activation_at_signal = 0
  let source_index = -1
  let target_index = -1
  let previous_route_source_index = -1
  let signal_color_index = -1
  let dark_mode = initial_dark
  let signal_started_at = performance.now()
  let current_constellations_held = false
  let target_distance = Math.PI / 2
  let pulse_timeline: PulseTimeline | undefined
  let last_camera_progress = -1
  let signal_active = false
  let last_view_status_at = -Infinity
  let last_view_status_key = ''
  let view_aspect = 1
  let view_radius = BASE_VIEW_RADIUS
  let trail_view_radius = BASE_VIEW_RADIUS
  let trail_opacity = 0
  let rendered_height = 0
  let rendered_pixel_ratio = 0
  let rendered_width = 0

  const recent_constellation_groups: number[] = []

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
    const clamped_progress = clamp_unit(progress)
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
      aspect: view_aspect,
      forward: vector_components(view_forward),
      map_scale: map_scale_for_view_radius(view_radius),
      right: vector_components(view_right),
      up: vector_components(view_up),
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
      view_right,
      view_up,
      view_forward,
    )
    sky_map_renderer.set_view({
      forward: view_forward,
      right: view_right,
      up: view_up,
      view_radius,
    })
  }

  function apply_trail_state() {
    set_basis_from_orientation(
      trail_orientation,
      trail_right,
      trail_up,
      trail_forward,
    )
    sky_map_renderer.set_trail_view(
      {
        forward: trail_forward,
        right: trail_right,
        up: trail_up,
        view_radius: trail_view_radius,
      },
      trail_opacity,
    )
  }

  function sync_trail_view() {
    trail_orientation.copy(view_orientation)
    trail_view_radius = view_radius
    trail_opacity = 0
    apply_trail_state()
  }

  function update_trail_view(
    delta_milliseconds: number,
    release_opacity: number,
    camera_progress: number,
  ) {
    if (camera_progress <= 0) {
      trail_opacity = 0
      apply_trail_state()
      return
    }
    if (release_opacity <= 0) {
      if (trail_opacity > 0) sync_trail_view()
      return
    }
    const response =
      1 - Math.exp((-TRAIL_RESPONSE * delta_milliseconds) / 1000)
    trail_orientation.slerp(view_orientation, response)
    trail_view_radius += (view_radius - trail_view_radius) * response
    const angular_lag = trail_orientation.angleTo(view_orientation)
    const radius_lag = Math.abs(view_radius - trail_view_radius)
    trail_opacity =
      clamp_unit((angular_lag + radius_lag * 0.7) / 0.008) * release_opacity
    apply_trail_state()
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

  function set_route(source: number, route_target: number) {
    last_camera_progress = -1
    source_index = source
    target_index = route_target
    const {
      constellation_reveal_distance,
      target_constellation,
      target_constellation_radius,
      target_distance: next_target_distance,
    } = sky_map_renderer.set_route(source_index, target_index)
    target_distance = next_target_distance
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
    route_view_start_forward.copy(view_forward)
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
    sky_map_renderer.retire_previous_constellation(
      sky_map.node_groups[source_index],
      sky_map.node_groups[target_index],
    )
  }

  function hold_current_constellations() {
    sky_map_renderer.hold_current_constellations()
  }

  function publish_view_status() {
    if (!callbacks.on_event) return
    const now = performance.now()
    if (now - last_view_status_at < VIEW_STATUS_INTERVAL) return
    const forward = view_forward
    const right_ascension =
      ((Math.atan2(forward.z, forward.x) * 180) / Math.PI + 360) % 360
    const declination = (Math.asin(forward.y) * 180) / Math.PI
    const scale = map_scale_for_view_radius(view_radius)
    const status_key = `${right_ascension.toFixed(2)}:${declination.toFixed(2)}:${scale.toFixed(3)}`
    if (status_key === last_view_status_key) return
    last_view_status_at = now
    last_view_status_key = status_key
    callbacks.on_event({
      type: 'view_change',
      status: { declination, right_ascension, scale },
    })
  }

  function render() {
    publish_view_status()
    sky_map_renderer.draw()
  }

  function update_signal_color(select_new_color = false) {
    const palette = sky_map_scene_theme(dark_mode).signal_inks
    if (select_new_color || signal_color_index < 0) {
      let next = Math.floor(Math.random() * palette.length)
      if (next === signal_color_index && palette.length > 1) {
        next = (next + 1) % palette.length
      }
      signal_color_index = next
    }
    sky_map_renderer.set_signal_color(palette[signal_color_index])
  }

  function update_theme(dark: boolean) {
    dark_mode = dark
    sky_map_renderer.set_theme(dark)
    update_signal_color()
  }

  function resize() {
    const bounds = target.getBoundingClientRect()
    const width = Math.max(1, bounds.width)
    const height = Math.max(1, bounds.height)
    const pixel_ratio = choose_pixel_ratio(width, height)
    if (
      width === rendered_width &&
      height === rendered_height &&
      pixel_ratio === rendered_pixel_ratio
    ) {
      return
    }
    rendered_width = width
    rendered_height = height
    rendered_pixel_ratio = pixel_ratio
    view_aspect = width / height
    sky_map_renderer.resize(width, height, pixel_ratio)
    if (source_index < 0 || target_index < 0) {
      const [source, route_target] = choose_route()
      set_route(source, route_target)
    }
    render()
  }

  function stop_frame() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  function stop_timer() {
    if (idle_timer) window.clearTimeout(idle_timer)
    idle_timer = 0
  }

  function end_signal() {
    if (!signal_active) return
    signal_active = false
    callbacks.on_event?.({ type: 'signal_end' })
  }

  function stop() {
    stop_frame()
    stop_timer()
    pulse_running = false
    end_signal()
  }

  function enter_idle() {
    pulse_running = false
    stop_frame()
    if (!current_constellations_held) hold_current_constellations()
    current_constellations_held = true
    sky_map_renderer.reset_pulse(1)
    end_signal()
    if (target_index >= 0) update_route_view(1)
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
      sky_map_renderer.set_locator(
        locator_progress,
        LOCATOR_INITIAL_SCALE +
          (1 - LOCATOR_INITIAL_SCALE) * locator_progress,
      )
      render()
      if (phase_elapsed < LOCATOR_DURATION) {
        frame = requestAnimationFrame(animate)
        return
      }
      signal_phase = 'collapsing'
      phase_started_at = now
      sky_map_renderer.set_locator(1, 1)
      frame = requestAnimationFrame(animate)
      return
    }
    if (signal_phase === 'collapsing') {
      const collapse_progress = critically_damped_progress(
        phase_elapsed / LOCATOR_COLLAPSE_DURATION,
      )
      const locator_scale = 1 - collapse_progress
      sky_map_renderer.set_locator(1, locator_scale)
      sky_map_renderer.set_pulse(0, 0, 0, collapse_progress)
      render()
      if (locator_scale > LOCATOR_DOT_SCALE) {
        frame = requestAnimationFrame(animate)
        return
      }
      signal_phase = 'transmitting'
      phase_started_at = now
      signal_started_at = now
      source_activation_at_signal = collapse_progress
      sky_map_renderer.set_locator(0, 1)
      sky_map_renderer.set_pulse(1, 0, 0, source_activation_at_signal)
      signal_active = true
      callbacks.on_event?.({
        type: 'signal_start',
        status: { color_index: signal_color_index },
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
    sky_map_renderer.set_retire_progress(pulse_frame.retire_progress)
    if (
      !current_constellations_held &&
      pulse_frame.pulse_distance >=
        pulse_timeline.signal_fade_start_distance
    ) {
      hold_current_constellations()
      current_constellations_held = true
    }
    update_route_view(pulse_frame.camera_progress)
    update_trail_view(
      frame_delta,
      pulse_frame.trail_opacity,
      pulse_frame.camera_progress,
    )
    sky_map_renderer.set_pulse(
      1 - pulse_frame.fade_progress,
      pulse_frame.pulse_distance,
      pulse_frame.route_pulse_distance,
      source_activation_at_signal * (1 - pulse_frame.source_release),
    )
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
    source_activation_at_signal = 0
    current_constellations_held = false
    sky_map_renderer.reset_pulse(LOCATOR_INITIAL_SCALE)
    sync_trail_view()
    update_signal_color(true)
    const [source, route_target] = choose_route()
    set_route(source, route_target)
    retire_previous_constellation()
    stop_frame()
    frame = requestAnimationFrame(animate)
  }

  function sync_activity() {
    const next_active = requested_active && !motion_preference.current
    if (active === next_active) return
    stop()
    active = next_active
    if (next_active) {
      begin_pulse()
      return
    }
    sky_map_renderer.reset_pulse(1)
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
  apply_view_state()
  sync_trail_view()
  resize_observer.observe(target)
  const unsubscribe_reduced_motion = motion_preference.subscribe(
    handle_reduced_motion,
  )
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
      unsubscribe_reduced_motion()
      sky_map_renderer.dispose()
    },
  }
}
