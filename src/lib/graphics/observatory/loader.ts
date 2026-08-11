import type { RegionOptions } from '$lib/presentation/definitions'
import { define_observatory_graphic } from '$lib/presentation/definitions'

import Observatory from './scene.svelte'

function normalize_options(value: unknown): RegionOptions {
  if (value === undefined) return {}
  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as RegionOptions
  }
  throw new Error('Graphic "observatory" options must be a YAML object.')
}

export default define_observatory_graphic({
  id: 'observatory',
  region: 'observatory',
  component: Observatory,
  normalize_options,
})
