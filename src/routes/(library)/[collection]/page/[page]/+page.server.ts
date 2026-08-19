import {
  collection_page,
  collection_page_entries,
} from '$lib/content/entries.server'
import { entry_collection_param } from '$lib/content/entry-route.server'
import { content_dependency } from '$lib/content/hmr'
import { page_number } from '$lib/content/query.server'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = collection_page_entries

export const load: PageServerLoad = async ({ depends, params }) => {
  const collection = entry_collection_param(params.collection)
  depends(content_dependency(collection))
  depends(content_dependency('constellations'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到内容页')

  const { document: index, entries } = await collection_page(
    collection,
    page,
  )
  if (!entries) throw error(404, '未找到内容页')
  return { collection, entries, index }
}
