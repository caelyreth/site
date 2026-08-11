import { describe, expect, it } from 'vitest'

import { collect_route_candidates, select_route } from './route-selection'

describe('observatory route selection', () => {
  const sky_map = {
    directions: new Float32Array([0.5, 0, 0.866]),
    magnitudes: new Float32Array([2]),
    node_groups: new Int16Array([0]),
  }

  it('collects visible constellation candidates', () => {
    expect(
      collect_route_candidates(sky_map, {
        aspect: 1,
        forward: [0, 0, 1],
        map_scale: 1,
        right: [1, 0, 0],
        up: [0, 1, 0],
      }),
    ).toHaveLength(1)
  })

  it('uses the supplied fallback when no route is visible', () => {
    expect(
      select_route({
        candidates: [],
        fallback: [4, 9],
        forward: [0, 0, 1],
        previous_source_index: -1,
        random: () => 0,
        recent_constellation_groups: [],
        sky_map,
        target_index: -1,
      }),
    ).toEqual([4, 9])
  })
})
