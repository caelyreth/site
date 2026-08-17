import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { record_slugs, load_record } from '$lib/content/records.server'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = () =>
  record_slugs().map((slug) => ({ slug }))

export const load: PageServerLoad = async ({ depends, params }) => {
  if (!record_slugs().includes(params.slug)) {
    throw error(404, '未找到记录')
  }
  depends(content_dependency(`records/${params.slug}`))
  const document = await load_record(params.slug)

  return {
    document,
    toc: extract_headings(document.nodes),
  }
}
