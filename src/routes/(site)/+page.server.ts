import { content_dependency } from '$lib/content/dependency'
import { load_home_page } from '$lib/content/home.server'

import type { PageServerLoad } from './$types'

export const prerender = true

/* oxlint-disable typescript/prefer-readonly-parameter-types -- SvelteKit supplies the generated mutable load-event type. */
export const load: PageServerLoad = ({ depends }) => {
  depends(content_dependency('home'))
  return load_home_page()
}
