import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import { page_frontmatter_schema } from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('timeline'))
  const timeline = await read_content('timeline', page_frontmatter_schema)
  if (!timeline) throw new Error('Missing content/timeline.md.')

  return {
    document: timeline.document,
    toc: extract_headings(timeline.document.nodes),
  }
}
