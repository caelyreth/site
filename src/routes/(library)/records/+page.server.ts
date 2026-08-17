import { content_dependency } from '$lib/content/hmr'
import { content_query, paginate } from '$lib/content/query.server'
import { record_index } from '$lib/content/relations'
import {
  constellation_frontmatter_schema,
  record_frontmatter_schema,
} from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

const records = content_query('records', record_frontmatter_schema)
const constellations = content_query(
  'constellations',
  constellation_frontmatter_schema,
)

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('records'))
  depends(content_dependency('constellations'))
  const [record_entries, constellation_entries] = await Promise.all([
    records.entries(),
    constellations.entries(),
  ])
  const page = paginate(
    record_index(record_entries, constellation_entries),
    1,
  )
  if (!page) throw new Error('无法创建第一页记录。')
  return { records: page }
}
