import {
  define_stage,
  type RegionOptions,
} from '$lib/presentation/contract'
import { z } from 'zod'

import Observatory from './view.svelte'

const options = z.undefined().transform((): RegionOptions => ({}))

export default define_stage({
  id: 'observatory',
  component: Observatory,
  options,
})
