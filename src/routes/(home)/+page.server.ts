import { content_dependency } from '$lib/content/hmr'
import { load_content } from '$lib/content/load.server'
import { document_frontmatter_schema } from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('home'))
  const document = await load_content('home', document_frontmatter_schema)

  return { document }
}
