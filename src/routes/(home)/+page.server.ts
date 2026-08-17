import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import { home_frontmatter_schema } from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('home'))
  const home = await read_content('home', home_frontmatter_schema)
  if (!home) throw new Error('Missing content/home.md.')

  return {
    document: home.document,
    toc: extract_headings(home.document.nodes),
  }
}
