import { entry_collections } from '$lib/content/entries'
import { collection_page } from '$lib/content/entries.server'
import { entry_collection_param } from '$lib/content/entry-route.server'
import { content_dependency } from '$lib/content/hmr'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = () =>
  entry_collections.map((collection) => ({ collection }))

export const load: PageServerLoad = async ({ depends, params }) => {
  const collection = entry_collection_param(params.collection)
  depends(content_dependency(collection))
  depends(content_dependency('constellations'))
  const { document: index, entries } = await collection_page(collection, 1)
  if (!entries) throw new Error('无法创建首页。')
  return { collection, entries, index }
}
