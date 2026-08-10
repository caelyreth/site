import { describe, expect, it, vi } from 'vitest'

vi.mock('./decoder', () => ({
  decode_sky_map: vi.fn(),
}))

vi.mock('./webgl-resources', () => ({
  create_sky_map_renderer: vi.fn(() => undefined),
}))

import { create_sky_map_engine } from './engine'
import type { SkyMapPayload } from './types'

describe('sky map engine', () => {
  it('exposes an inert engine when WebGL resources are unavailable', () => {
    const sky_data = {
      SKY_SOURCE_NODES: new Uint16Array(),
      SKY_VIEW_BASIS: new Float32Array(9),
    } as unknown as SkyMapPayload
    const engine = create_sky_map_engine({} as HTMLCanvasElement, sky_data)

    expect(() => {
      engine.set_active(true)
      engine.set_theme(true)
      engine.destroy()
    }).not.toThrow()
  })
})
