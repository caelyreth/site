import { content_dependency } from '$lib/content/hmr'
import { load_content_collection } from '$lib/content/load.server'
import { entry_frontmatter_schema } from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('maps'))
  const entries = await load_content_collection(
    'maps',
    entry_frontmatter_schema,
  )

  return { entries }
}
