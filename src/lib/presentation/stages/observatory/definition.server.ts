import {
  define_stage,
  type RegionOptions,
} from '$lib/presentation/contract'
import * as v from 'valibot'

import Observatory from './view.svelte'

const options = v.pipe(
  v.undefined(),
  v.transform((): RegionOptions => ({})),
)

export default define_stage({
  id: 'observatory',
  component: Observatory,
  options,
})
