import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import { about_frontmatter_schema } from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('about'))
  const about = await read_content('about', about_frontmatter_schema)
  if (!about) throw new Error('Missing content/about.md.')

  return {
    document: about.document,
    toc: extract_headings(about.document.nodes),
  }
}
