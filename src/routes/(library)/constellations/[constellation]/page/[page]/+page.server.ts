import { entry_collections } from '$lib/content/entries'
import {
  constellation_entry_page,
  constellation_entry_page_entries,
} from '$lib/content/constellations.server'
import { content_dependency } from '$lib/content/hmr'
import { page_number } from '$lib/content/query.server'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = 'auto'

export const entries: EntryGenerator = constellation_entry_page_entries

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('constellations'))
  entry_collections.forEach((collection) => {
    depends(content_dependency(collection))
  })
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到星群页')

  const content = await constellation_entry_page(params.constellation, page)
  if (!content) throw error(404, '未找到星群')
  const { entries, ...detail } = content
  if (!entries) throw error(404, '未找到星群页')

  return {
    ...detail,
    entries,
  }
}
