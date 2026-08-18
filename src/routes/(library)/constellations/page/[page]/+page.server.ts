import { content_dependency } from '$lib/content/hmr'
import {
  content_query,
  page_count,
  page_number,
  paginate,
  read_content,
} from '$lib/content/query.server'
import { constellation_index, record_index } from '$lib/content/relations'
import {
  constellation_frontmatter_schema,
  constellation_index_frontmatter_schema,
  record_frontmatter_schema,
} from '$lib/content/schema'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = 'auto'

const records = content_query('records', record_frontmatter_schema)
const constellations = content_query(
  'constellations',
  constellation_frontmatter_schema,
)

export const entries: EntryGenerator = async () => {
  const [record_entries, constellation_entries] = await Promise.all([
    records.entries(),
    constellations.entries(),
  ])
  const total = constellation_index(
    constellation_entries,
    record_index(record_entries, constellation_entries),
  )
  return Array.from(
    { length: Math.max(0, page_count(total.length) - 1) },
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

  const [record_entries, constellation_entries, index] = await Promise.all([
    records.entries(),
    constellations.entries(),
    read_content('constellations', constellation_index_frontmatter_schema),
  ])
  const entries = paginate(
    constellation_index(
      constellation_entries,
      record_index(record_entries, constellation_entries),
    ),
    page,
  )
  if (!entries) throw error(404, '未找到星群页')
  if (!index) throw new Error('Missing content/constellations.md.')
  return { constellations: entries, index: index.document }
}
