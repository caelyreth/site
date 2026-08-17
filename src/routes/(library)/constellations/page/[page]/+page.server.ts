import { load_constellation_summaries } from '$lib/content/constellations.server'
import { content_dependency } from '$lib/content/hmr'
import {
  archive_page_size,
  page_number,
  paginate,
} from '$lib/content/pagination'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () => {
  const constellations = await load_constellation_summaries()
  const page_count = Math.max(
    1,
    Math.ceil(constellations.length / archive_page_size),
  )
  return Array.from(
    { length: Math.max(0, page_count - 1) },
    (_, index) => ({
      page: String(index + 2),
    }),
  )
}

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('constellations'))
  depends(content_dependency('records'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到星群页')

  const constellations = paginate(
    await load_constellation_summaries(),
    page,
  )
  if (!constellations) throw error(404, '未找到星群页')
  return { constellations }
}
