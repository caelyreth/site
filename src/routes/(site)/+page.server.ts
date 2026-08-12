import { content_dependency } from '$lib/content/hmr'
import { load_content } from '$lib/content/load.server'
import { home_frontmatter_schema } from '$lib/content/schema'
import { select_presentation } from '$lib/presentation/registry.server'

import type { PageServerLoad } from './$types'

export const prerender = true

/* oxlint-disable typescript/prefer-readonly-parameter-types -- SvelteKit supplies the generated mutable load-event type. */
export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('home'))
  const document = await load_content('home', home_frontmatter_schema)

  return {
    document,
    presentation: select_presentation(document.frontmatter),
  }
}
