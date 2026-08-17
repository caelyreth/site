import {
  load_constellation_entries,
  load_constellation_summaries,
} from '$lib/content/constellations.server'
import { content_dependency } from '$lib/content/hmr'
import { paginate } from '$lib/content/pagination'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () =>
  (await load_constellation_summaries()).map(({ id }) => ({
    constellation: id,
  }))

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('constellations'))
  depends(content_dependency('records'))
  const result = await load_constellation_entries(params.constellation)
  if (!result) throw error(404, '未找到星群')

  const entries = paginate(result.entries, 1)
  if (!entries) throw error(404, '未找到星群')

  return {
    document: result.document,
    entries,
    constellation: result.constellation,
  }
}
