import {
  empty_options_schema,
  type ForegroundDefinition,
} from '$lib/presentation/contract'

import VfdTube from './view.svelte'

export default {
  id: 'vfd-tube',
  component: VfdTube,
  options: empty_options_schema,
} satisfies ForegroundDefinition
