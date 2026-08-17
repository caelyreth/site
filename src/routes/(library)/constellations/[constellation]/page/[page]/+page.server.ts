import { content_dependency } from '$lib/content/hmr'
import {
  content_query,
  page_count,
  page_number,
  paginate,
} from '$lib/content/query.server'
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

// A constellation gets this route only after it outgrows the first page.
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
  const indexed_records = record_index(
    record_entries,
    constellation_entries,
  )
  return constellation_index(
    constellation_entries,
    indexed_records,
  ).flatMap((constellation) =>
    Array.from(
      {
        length: Math.max(0, page_count(constellation.entry_count) - 1),
      },
      (_, index) => ({
        page: String(index + 2),
        constellation: constellation.id,
      }),
    ),
  )
}

async function constellation_data(id: string) {
  const [document, record_entries, constellation_entries] =
    await Promise.all([
      constellations.document(id),
      records.entries(),
      constellations.entries(),
    ])
  if (!document) return undefined

  const indexed_records = record_index(
    record_entries,
    constellation_entries,
  )
  const constellation = constellation_index(
    constellation_entries,
    indexed_records,
  ).find((entry) => entry.id === id)
  if (!constellation) return undefined

  return {
    constellation,
    document: document.document,
    records: records_for_constellation(indexed_records, constellation.id),
  }
}

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('constellations'))
  depends(content_dependency('records'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到星群页')

  const content = await constellation_data(params.constellation)
  if (!content) throw error(404, '未找到星群')

  const entries = paginate(content.records, page)
  if (!entries) throw error(404, '未找到星群页')

  return {
    document: content.document,
    entries,
    constellation: content.constellation,
  }
}
