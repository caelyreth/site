import { content_dependency } from '$lib/content/hmr'
import { content_query, paginate } from '$lib/content/query.server'
import {
  constellation_index,
  record_index,
  records_for_constellation,
} from '$lib/content/relations'
import {
  constellation_frontmatter_schema,
  record_frontmatter_schema,
} from '$lib/content/schema'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

const records = content_query('records', record_frontmatter_schema)
const constellations = content_query(
  'constellations',
  constellation_frontmatter_schema,
)

export const entries: EntryGenerator = async () =>
  constellations.keys().map((id) => ({
    constellation: id,
  }))

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('constellations'))
  depends(content_dependency('records'))
  const [document, record_entries, constellation_entries] =
    await Promise.all([
      constellations.document(params.constellation),
      records.entries(),
      constellations.entries(),
    ])
  if (!document) throw error(404, '未找到星群')

  const indexed_records = record_index(
    record_entries,
    constellation_entries,
  )
  const constellation = constellation_index(
    constellation_entries,
    indexed_records,
  ).find((entry) => entry.id === params.constellation)
  if (!constellation) throw error(404, '未找到星群')

  const entries = paginate(
    records_for_constellation(indexed_records, constellation.id),
    1,
  )
  if (!entries) throw error(404, '未找到星群')

  return {
    document: document.document,
    entries,
    constellation,
  }
}
