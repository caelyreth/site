import {
  reduced_motion,
  type ReducedMotionPreference,
} from '$lib/browser/reduced-motion'

import {
  ORBIT_ANGULAR_SPEED,
  ORBIT_TRAIL_LAG,
  SKY_FIELD_FRAME_INTERVAL,
} from './config'
import { create_sky_field_renderer } from './renderer'
import { choose_pixel_ratio } from './resolution'

export interface SkyFieldEngine {
  destroy: () => void
  set_active: (active: boolean) => void
  set_theme: (dark: boolean) => void
}

export function create_sky_field_engine(
  target: HTMLCanvasElement,
  initial_dark = false,
  motion_preference: ReducedMotionPreference = reduced_motion,
): SkyFieldEngine {
  const maybe_sky_field_renderer = create_sky_field_renderer(
    target,
    initial_dark,
  )
  if (!maybe_sky_field_renderer) {
    return {
      destroy: () => {},
      set_active: () => {},
      set_theme: () => {},
    }
  }
  const sky_field_renderer = maybe_sky_field_renderer

  let active = false
  let requested_active = false
  let disposed = false
  let frame = 0
  let frame_timer: ReturnType<typeof setTimeout> | undefined
  let orbit_angle = 0
  let previous_frame_at = 0
  let rendered_height = 0
  let rendered_pixel_ratio = 0
  let rendered_width = 0

  function render() {
    sky_field_renderer.set_orbit(orbit_angle, orbit_angle + ORBIT_TRAIL_LAG)
    sky_field_renderer.draw()
  }

  function stop_frame() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    if (frame_timer !== undefined) clearTimeout(frame_timer)
    frame_timer = undefined
  }

  function schedule_frame() {
    frame_timer = setTimeout(() => {
      frame_timer = undefined
      frame = requestAnimationFrame(animate)
    }, SKY_FIELD_FRAME_INTERVAL)
  }

  function animate(now: number) {
    if (!active || disposed || motion_preference.current) return
    frame = 0
    const delta =
      previous_frame_at > 0
        ? Math.min(now - previous_frame_at, SKY_FIELD_FRAME_INTERVAL * 2)
        : SKY_FIELD_FRAME_INTERVAL
    previous_frame_at = now
    orbit_angle =
      (orbit_angle - delta * ORBIT_ANGULAR_SPEED) % (Math.PI * 2)
    render()
    schedule_frame()
  }

  function sync_activity() {
    if (disposed) return
    const next_active = requested_active && !motion_preference.current
    if (active === next_active) return
    active = next_active
    stop_frame()
    previous_frame_at = 0
    if (active) {
      render()
      schedule_frame()
    } else {
      render()
    }
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
    sky_field_renderer.resize(width, height, pixel_ratio)
    render()
  }

  const resize_observer = new ResizeObserver(resize)
  const unsubscribe_reduced_motion = motion_preference.subscribe(() => {
    sync_activity()
  })

  sky_field_renderer.set_theme(initial_dark)
  resize_observer.observe(target)
  resize()

  return {
    set_active(next_active) {
      requested_active = next_active
      sync_activity()
    },
    set_theme(next_dark) {
      sky_field_renderer.set_theme(next_dark)
      render()
    },
    destroy() {
      disposed = true
      stop_frame()
      resize_observer.disconnect()
      unsubscribe_reduced_motion()
      sky_field_renderer.dispose()
    },
  }
}
