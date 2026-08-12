import {
  define_footer,
  type RegionOptions,
} from '$lib/presentation/contract'
import * as v from 'valibot'

import RelayStationFooter from './view.svelte'

const options = v.pipe(
  v.undefined(),
  v.transform((): RegionOptions => ({})),
)

export default define_footer({
  id: 'relay-station',
  component: RelayStationFooter,
  options,
})
