import { content_dependency } from '$lib/content/hmr'
import { load_thread_index } from '$lib/content/load.server'
import { entry_frontmatter_schema } from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('threads'))
  const threads = await load_thread_index(entry_frontmatter_schema)

  return { threads }
}
