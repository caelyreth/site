import { entry_collections } from '$lib/content/entries'
import { all_entry_entries } from '$lib/content/entries.server'
import { content_dependency } from '$lib/content/hmr'
import {
  content_query,
  paginate,
  read_content,
} from '$lib/content/query.server'
import { constellation_index, entry_index } from '$lib/content/relations'
import {
  constellation_frontmatter_schema,
  constellation_index_frontmatter_schema,
} from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

const constellations = content_query(
  'constellations',
  constellation_frontmatter_schema,
)

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('constellations'))
  entry_collections.forEach((collection) => {
    depends(content_dependency(collection))
  })
  const [entry_entries, constellation_entries, index] = await Promise.all([
    all_entry_entries(),
    constellations.entries(),
    read_content('constellations', constellation_index_frontmatter_schema),
  ])
  const page = paginate(
    constellation_index(
      constellation_entries,
      entry_index(entry_entries, constellation_entries),
    ),
    1,
  )
  if (!page) throw new Error('无法创建第一页星群。')
  if (!index) throw new Error('Missing content/constellations.md.')
  return { constellations: page, index: index.document }
}
