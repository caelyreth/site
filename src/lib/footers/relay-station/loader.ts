import type { RegionOptions } from '$lib/presentation/definitions'
import { define_footer } from '$lib/presentation/definitions'

import RelayStationFooter from './footer.svelte'

function normalize_options(value: unknown): RegionOptions {
  if (value === undefined) return {}
  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as RegionOptions
  }
  throw new Error('Footer "relay-station" options must be a YAML object.')
}

export default define_footer({
  id: 'relay-station',
  component: RelayStationFooter,
  normalize_options,
})
