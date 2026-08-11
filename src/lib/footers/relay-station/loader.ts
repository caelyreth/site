import {
  define_footer,
  type RegionOptions,
} from '$lib/presentation/contract'
import { z } from 'zod'

import RelayStationFooter from './footer.svelte'

const options = z.undefined().transform((): RegionOptions => ({}))

export default define_footer({
  id: 'relay-station',
  component: RelayStationFooter,
  options,
})
