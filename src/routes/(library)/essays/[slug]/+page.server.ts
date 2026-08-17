import { essay_slugs, load_essay } from '$lib/content/essays.server'
import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = () =>
  essay_slugs().map((slug) => ({ slug }))

export const load: PageServerLoad = async ({ depends, params }) => {
  if (!essay_slugs().includes(params.slug)) {
    throw error(404, 'Essay not found')
  }
  depends(content_dependency(`essays/${params.slug}`))
  const document = await load_essay(params.slug)

  return {
    document,
    toc: extract_headings(document.nodes),
  }
}
