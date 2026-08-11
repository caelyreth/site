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
  FOCUS_CONTRACT_APEX_LEAD,
  FOCUS_CONTRACT_DELAY,
  FOCUS_CONTRACT_MAX_DURATION,
  FOCUS_CONTRACT_MIN_DURATION,
  FOCUS_RETURN_LAG,
  FOCUS_SETTLE_LAG,
  ROUTE_MOTION_MAX_DURATION,
  ROUTE_MOTION_MIN_DURATION,
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
  critically_damped_progress,
  inverse_impulse_progress,
  route_progress,
  signal_progress,
  trail_release_opacity,
} from './motion'

export type PulseTimeline = Readonly<{
  camera_duration: number
  camera_start_delay: number
  focus_contract_end: number
  focus_contract_start: number
  focus_return_end: number
  focus_return_start: number
  route_wide_view_radius: number
  signal_duration: number
  signal_fade_start_distance: number
  signal_travel_distance: number
  trail_release_duration: number
  trail_release_start: number
}>

export type PulseFrame = Readonly<{
  camera_progress: number
  fade_progress: number
  pulse_distance: number
  retire_progress: number
  route_pulse_distance: number
  source_release: number
  trail_opacity: number
}>

function clamp_progress(progress: number) {
  return Math.min(1, Math.max(0, progress))
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
  const rotation_ratio = clamp_progress(
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
  const camera_apex_time =
    camera_start_delay + camera_duration * CAMERA_VELOCITY_APEX
  const focus_contract_start = FOCUS_CONTRACT_DELAY
  const desired_contract_duration =
    camera_apex_time - focus_contract_start - FOCUS_CONTRACT_APEX_LEAD
  const contract_duration = Math.min(
    FOCUS_CONTRACT_MAX_DURATION,
    Math.max(FOCUS_CONTRACT_MIN_DURATION, desired_contract_duration),
  )
  const focus_contract_end = focus_contract_start + contract_duration
  const focus_return_start = camera_apex_time + FOCUS_RETURN_LAG
  const focus_return_end =
    camera_start_delay + camera_duration + FOCUS_SETTLE_LAG
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
    focus_contract_end,
    focus_contract_start,
    focus_return_end,
    focus_return_start,
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
  const camera_progress = clamp_progress(
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

export function route_motion_duration(camera_duration: number) {
  return Math.min(
    ROUTE_MOTION_MAX_DURATION,
    Math.max(ROUTE_MOTION_MIN_DURATION, camera_duration * 0.72),
  )
}
