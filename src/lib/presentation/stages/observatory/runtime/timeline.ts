import {
  BASE_VIEW_RADIUS,
  CAMERA_ANGULAR_SPEED,
  CAMERA_CAPTURE_LAG,
  CAMERA_MAX_ROUTE_LEAD,
  CAMERA_MAX_WIDENING,
  CAMERA_MIN_ROUTE_LEAD,
  CAMERA_MIN_WIDENING,
  CONSTELLATION_RETIRE_DURATION,
  ROUTE_MAX_CAMERA_ROTATION,
  ROUTE_MIN_CAMERA_ROTATION,
  ROUTE_TERMINAL_VELOCITY,
  ROUTE_VELOCITY_APEX,
  SIGNAL_FADE_DISTANCE,
  SIGNAL_SPEED,
  SOURCE_RELEASE_DURATION,
  TRAIL_CAPTURE_LEAD,
  TRAIL_RELEASE_PROGRESS,
} from './constants'
import {
  clamp_unit,
  critically_damped_progress,
  inverse_impulse_progress,
  route_progress,
  signal_progress,
  trail_release_opacity,
} from './motion'

export interface PulseTimeline {
  camera_duration: number
  camera_start_delay: number
  route_wide_view_radius: number
  signal_duration: number
  signal_fade_start_distance: number
  signal_travel_distance: number
  trail_release_duration: number
  trail_release_start: number
}

export interface PulseFrame {
  camera_progress: number
  fade_progress: number
  pulse_distance: number
  retire_progress: number
  route_pulse_distance: number
  source_release: number
  trail_opacity: number
}

export function create_pulse_timeline(
  target_distance: number,
  signal_fade_start_distance: number,
  signal_travel_distance: number,
  camera_rotation: number,
): PulseTimeline {
  const nominal_camera_duration = camera_rotation / CAMERA_ANGULAR_SPEED
  const rotation_range =
    ROUTE_MAX_CAMERA_ROTATION - ROUTE_MIN_CAMERA_ROTATION
  const rotation_ratio = clamp_unit(
    (camera_rotation - ROUTE_MIN_CAMERA_ROTATION) / rotation_range,
  )
  const route_wide_view_radius =
    BASE_VIEW_RADIUS +
    CAMERA_MIN_WIDENING +
    (CAMERA_MAX_WIDENING - CAMERA_MIN_WIDENING) * rotation_ratio
  const target_arrival_progress = inverse_impulse_progress(
    target_distance / signal_travel_distance,
    ROUTE_VELOCITY_APEX,
    ROUTE_TERMINAL_VELOCITY,
  )
  let signal_duration = signal_travel_distance / SIGNAL_SPEED
  let target_arrival_time = target_arrival_progress * signal_duration
  const minimum_target_arrival =
    CAMERA_MIN_ROUTE_LEAD + nominal_camera_duration - CAMERA_CAPTURE_LAG
  if (target_arrival_time < minimum_target_arrival) {
    signal_duration *= minimum_target_arrival / target_arrival_time
    target_arrival_time = minimum_target_arrival
  }
  const nominal_camera_start =
    target_arrival_time + CAMERA_CAPTURE_LAG - nominal_camera_duration
  const camera_start_delay = Math.min(
    CAMERA_MAX_ROUTE_LEAD,
    Math.max(CAMERA_MIN_ROUTE_LEAD, nominal_camera_start),
  )
  const camera_duration =
    target_arrival_time + CAMERA_CAPTURE_LAG - camera_start_delay
  const trail_release_start =
    camera_start_delay + camera_duration * TRAIL_RELEASE_PROGRESS
  const trail_release_duration = Math.max(
    1,
    camera_start_delay +
      camera_duration -
      TRAIL_CAPTURE_LEAD -
      trail_release_start,
  )

  return {
    camera_duration,
    camera_start_delay,
    route_wide_view_radius,
    signal_duration,
    signal_fade_start_distance,
    signal_travel_distance,
    trail_release_duration,
    trail_release_start,
  }
}

export function pulse_frame_at(
  timeline: PulseTimeline,
  elapsed: number,
): PulseFrame {
  const timeline_progress = elapsed / timeline.signal_duration
  const pulse_distance =
    timeline.signal_travel_distance * signal_progress(timeline_progress)
  const route_pulse_distance =
    timeline.signal_travel_distance * route_progress(timeline_progress)
  const camera_progress = clamp_unit(
    (elapsed - timeline.camera_start_delay) / timeline.camera_duration,
  )

  return {
    camera_progress,
    fade_progress: critically_damped_progress(
      (pulse_distance - timeline.signal_fade_start_distance) /
        SIGNAL_FADE_DISTANCE,
    ),
    pulse_distance,
    retire_progress: critically_damped_progress(
      elapsed / CONSTELLATION_RETIRE_DURATION,
    ),
    route_pulse_distance,
    source_release: critically_damped_progress(
      elapsed / SOURCE_RELEASE_DURATION,
    ),
    trail_opacity: trail_release_opacity(
      (elapsed - timeline.trail_release_start) /
        timeline.trail_release_duration,
    ),
  }
}
