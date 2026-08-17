import { load_constellation_summaries } from '$lib/content/constellations.server'
import { content_dependency } from '$lib/content/hmr'
import { paginate } from '$lib/content/pagination'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('constellations'))
  depends(content_dependency('records'))
  const constellations = paginate(await load_constellation_summaries(), 1)
  if (!constellations) throw new Error('无法创建第一页星群。')
  return { constellations }
}
