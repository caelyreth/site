import {
  load_constellation_entries,
  load_constellation_summaries,
} from '$lib/content/constellations.server'
import { content_dependency } from '$lib/content/hmr'
import {
  archive_page_size,
  page_number,
  paginate,
} from '$lib/content/pagination'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

// A constellation gets this route only after it outgrows the first page.
export const prerender = 'auto'

export const entries: EntryGenerator = async () => {
  const constellations = await load_constellation_summaries()
  const entries = await Promise.all(
    constellations.map(async (constellation) => {
      const result = await load_constellation_entries(constellation.id)
      const page_count = Math.max(
        1,
        Math.ceil((result?.entries.length ?? 0) / archive_page_size),
      )
      return Array.from(
        { length: Math.max(0, page_count - 1) },
        (_, index) => ({
          page: String(index + 2),
          constellation: constellation.id,
        }),
      )
    }),
  )
  return entries.flat()
}

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('constellations'))
  depends(content_dependency('records'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到星群页')

  const result = await load_constellation_entries(params.constellation)
  if (!result) throw error(404, '未找到星群')
  const entries = paginate(result.entries, page)
  if (!entries) throw error(404, '未找到星群页')

  return {
    document: result.document,
    entries,
    constellation: result.constellation,
  }
}
