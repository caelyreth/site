import { entry_collections } from '$lib/content/entries'
import {
  constellation_entry_page,
  constellation_route_entries,
} from '$lib/content/constellations.server'
import { content_dependency } from '$lib/content/hmr'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = constellation_route_entries

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('constellations'))
  entry_collections.forEach((collection) => {
    depends(content_dependency(collection))
  })
  const content = await constellation_entry_page(params.constellation, 1)
  if (!content) throw error(404, '未找到星群')
  const { entries, ...detail } = content
  if (!entries) throw error(404, '未找到星群')

  return {
    ...detail,
    entries,
  }
}
