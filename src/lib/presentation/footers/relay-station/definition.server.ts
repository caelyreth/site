import {
  empty_options_schema,
  type FooterDefinition,
} from '$lib/presentation/contract'

import RelayStationFooter from './view.svelte'

export default {
  id: 'relay-station',
  component: RelayStationFooter,
  options: empty_options_schema,
} satisfies FooterDefinition
