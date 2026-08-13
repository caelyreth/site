import {
  empty_options_schema,
  type StageDefinition,
} from '$lib/presentation/contract'

import Observatory from './view.svelte'

export default {
  id: 'observatory',
  component: Observatory,
  options: empty_options_schema,
} satisfies StageDefinition
