import { constellation_page } from '$lib/content/constellations.server'
import { entry_collections } from '$lib/content/entries'
import { content_dependency } from '$lib/content/hmr'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('constellations'))
  entry_collections.forEach((collection) => {
    depends(content_dependency(collection))
  })
  const { constellations, document: index } = await constellation_page(1)
  if (!constellations) throw new Error('无法创建第一页星群。')
  return { constellations, index }
}
