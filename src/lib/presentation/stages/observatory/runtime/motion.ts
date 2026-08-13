import {
  CAMERA_VELOCITY_APEX,
  DAMPING_SETTLED_RESPONSE,
  DAMPING_STIFFNESS,
  ROUTE_TERMINAL_VELOCITY,
  ROUTE_VELOCITY_APEX,
  SIGNAL_TERMINAL_VELOCITY,
  SIGNAL_VELOCITY_APEX,
} from './constants'

export function clamp_unit(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function choose_pixel_ratio(width: number, height: number) {
  const native_ratio = Math.min(window.devicePixelRatio || 1, 2)
  const pixel_budget = 7_600_000
  const budget_ratio = Math.sqrt(pixel_budget / Math.max(1, width * height))
  return Math.max(1, Math.min(native_ratio, budget_ratio))
}

export function brightness_for_magnitude(magnitude: number) {
  const brightness_base = Math.min(
    1,
    Math.max(0.015, (6.25 - magnitude) / 7.75),
  )
  return Math.pow(brightness_base, 1.28)
}

export function critically_damped_progress(value: number) {
  const progress = clamp_unit(value)
  const response =
    1 -
    (1 + DAMPING_STIFFNESS * progress) *
      Math.exp(-DAMPING_STIFFNESS * progress)
  return Math.min(1, response / DAMPING_SETTLED_RESPONSE)
}

export function smootherstep_progress(value: number) {
  const progress = clamp_unit(value)
  return (
    progress * progress * progress * (progress * (6 * progress - 15) + 10)
  )
}

export function impulse_progress(
  value: number,
  apex: number,
  terminal_velocity = 0,
) {
  const progress = clamp_unit(value)
  const peak_velocity = 2 - terminal_velocity * (1 - apex)
  if (progress < apex) {
    return (0.5 * peak_velocity * progress * progress) / apex
  }
  const elapsed = progress - apex
  const deceleration = (terminal_velocity - peak_velocity) / (1 - apex)
  return (
    0.5 * peak_velocity * apex +
    peak_velocity * elapsed +
    0.5 * deceleration * elapsed * elapsed
  )
}

export function inverse_impulse_progress(
  value: number,
  apex: number,
  terminal_velocity = 0,
) {
  const target = clamp_unit(value)
  let lower = 0
  let upper = 1
  for (let iteration = 0; iteration < 18; iteration += 1) {
    const middle = (lower + upper) * 0.5
    if (impulse_progress(middle, apex, terminal_velocity) < target) {
      lower = middle
    } else {
      upper = middle
    }
  }
  return (lower + upper) * 0.5
}

export function signal_progress(value: number) {
  return impulse_progress(
    value,
    SIGNAL_VELOCITY_APEX,
    SIGNAL_TERMINAL_VELOCITY,
  )
}

export function route_progress(value: number) {
  return impulse_progress(
    value,
    ROUTE_VELOCITY_APEX,
    ROUTE_TERMINAL_VELOCITY,
  )
}

export function camera_motion_progress(value: number) {
  return impulse_progress(value, CAMERA_VELOCITY_APEX)
}

export function camera_velocity_envelope(value: number) {
  const progress = clamp_unit(value)
  if (progress < CAMERA_VELOCITY_APEX) {
    return progress / CAMERA_VELOCITY_APEX
  }
  return (1 - progress) / (1 - CAMERA_VELOCITY_APEX)
}

export function zoom_envelope(camera_progress: number) {
  return smootherstep_progress(camera_velocity_envelope(camera_progress))
}

export function trail_release_opacity(value: number) {
  const progress = clamp_unit(value)
  const remaining = 1 - progress
  return remaining * remaining * remaining
}

export function map_scale_for_view_radius(view_radius: number) {
  return 0.25 / Math.tan(view_radius * 0.5)
}
