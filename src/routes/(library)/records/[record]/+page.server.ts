import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { content_query } from '$lib/content/query.server'
import { resolve_constellations } from '$lib/content/relations'
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

export const entries: EntryGenerator = () =>
  records.keys().map((record) => ({ record }))

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency(`records/${params.record}`))
  depends(content_dependency('constellations'))
  const [record, constellation_entries] = await Promise.all([
    records.document(params.record),
    constellations.entries(),
  ])
  if (!record) throw error(404, '未找到记录')

  return {
    constellations: resolve_constellations(
      record.document.frontmatter.constellations,
      record.path,
      constellation_entries,
    ),
    document: record.document,
    toc: extract_headings(record.document.nodes),
  }
}
