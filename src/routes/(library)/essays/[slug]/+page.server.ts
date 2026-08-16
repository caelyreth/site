import { content_dependency } from '$lib/content/hmr'
import { content_slugs, load_content } from '$lib/content/load.server'
import { entry_frontmatter_schema } from '$lib/content/schema'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = () =>
  content_slugs('essays').map((slug) => ({ slug }))

export const load: PageServerLoad = async ({ depends, params }) => {
  if (!content_slugs('essays').includes(params.slug)) {
    throw error(404, 'Essay not found')
  }

  const content_id = `essays/${params.slug}`
  depends(content_dependency(content_id))
  const document = await load_content(content_id, entry_frontmatter_schema)

  return { document }
}
