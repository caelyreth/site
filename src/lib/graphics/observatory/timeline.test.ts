import { describe, expect, it } from 'vitest'

import {
  create_pulse_timeline,
  pulse_frame_at,
  roller_motion_duration,
} from './timeline'

describe('observatory pulse timeline', () => {
  it('keeps pulse, camera, and foreground events within one timeline', () => {
    const timeline = create_pulse_timeline(1.8, 1.2, 2.2, 0.82)
    const initial_frame = pulse_frame_at(timeline, 0)
    const final_frame = pulse_frame_at(timeline, timeline.signal_duration)

    expect(timeline.foreground_contract_start).toBeLessThan(
      timeline.foreground_contract_end,
    )
    expect(timeline.foreground_return_start).toBeLessThan(
      timeline.foreground_return_end,
    )
    expect(initial_frame.camera_progress).toBe(0)
    expect(final_frame.camera_progress).toBe(1)
    expect(final_frame.trail_opacity).toBeGreaterThanOrEqual(0)
  })

  it('bounds roller movement to a usable duration', () => {
    expect(roller_motion_duration(0)).toBe(860)
    expect(roller_motion_duration(10_000)).toBe(1400)
  })
})
