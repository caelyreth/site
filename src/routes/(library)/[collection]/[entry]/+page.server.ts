import { entry_page, entry_route_entries } from '$lib/content/entries.server'
import { entry_collection_param } from '$lib/content/entry-route.server'
import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = entry_route_entries

export const load: PageServerLoad = async ({ depends, params }) => {
  const collection = entry_collection_param(params.collection)
  depends(content_dependency(`${collection}/${params.entry}`))
  depends(content_dependency('constellations'))
  const entry = await entry_page(collection, params.entry)
  if (!entry) throw error(404, '未找到内容')

  return {
    collection,
    ...entry,
    toc: extract_headings(entry.document.nodes),
  }
}
