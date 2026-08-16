import {
  reduced_motion,
  type ReducedMotionPreference,
} from '$lib/site/reduced-motion'

import { ORBIT_ANGULAR_SPEED, ORBIT_TRAIL_LAG } from './constants'
import { choose_pixel_ratio } from './motion'
import type { SkyMapEngine } from './types'
import { create_sky_map_renderer } from './webgl-resources'

export function create_sky_map_engine(
  target: HTMLCanvasElement,
  initial_dark = false,
  motion_preference: ReducedMotionPreference = reduced_motion,
): SkyMapEngine {
  const maybe_sky_map_renderer = create_sky_map_renderer(
    target,
    initial_dark,
  )
  if (!maybe_sky_map_renderer) {
    return {
      destroy: () => {},
      set_active: () => {},
      set_theme: () => {},
    }
  }
  const sky_map_renderer = maybe_sky_map_renderer

  let active = false
  let requested_active = false
  let disposed = false
  let frame = 0
  let orbit_angle = 0
  let previous_frame_at = 0
  let rendered_height = 0
  let rendered_pixel_ratio = 0
  let rendered_width = 0

  function render() {
    sky_map_renderer.set_orbit(orbit_angle, orbit_angle + ORBIT_TRAIL_LAG)
    sky_map_renderer.draw()
  }

  function stop_frame() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  function animate(now: number) {
    if (!active || disposed || motion_preference.current) return
    const delta =
      previous_frame_at > 0 ? Math.min(now - previous_frame_at, 50) : 16.667
    previous_frame_at = now
    orbit_angle =
      (orbit_angle - delta * ORBIT_ANGULAR_SPEED) % (Math.PI * 2)
    render()
    frame = requestAnimationFrame(animate)
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
      frame = requestAnimationFrame(animate)
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
    sky_map_renderer.resize(width, height, pixel_ratio)
    render()
  }

  const resize_observer = new ResizeObserver(resize)
  const unsubscribe_reduced_motion = motion_preference.subscribe(() => {
    sync_activity()
  })

  sky_map_renderer.set_theme(initial_dark)
  resize_observer.observe(target)
  resize()

  return {
    set_active(next_active) {
      requested_active = next_active
      sync_activity()
    },
    set_theme(next_dark) {
      sky_map_renderer.set_theme(next_dark)
      render()
    },
    destroy() {
      disposed = true
      stop_frame()
      resize_observer.disconnect()
      unsubscribe_reduced_motion()
      sky_map_renderer.dispose()
    },
  }
}
