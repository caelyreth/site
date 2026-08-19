import { entry_collections } from '$lib/content/entries'
import { collection_entries } from '$lib/content/entries.server'
import { entry_collection_param } from '$lib/content/entry-route.server'
import { content_dependency } from '$lib/content/hmr'
import {
  content_query,
  page_count,
  page_number,
  paginate,
  read_content,
} from '$lib/content/query.server'
import { entry_index } from '$lib/content/relations'
import {
  constellation_frontmatter_schema,
  entry_index_frontmatter_schema,
} from '$lib/content/schema'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

const constellations = content_query(
  'constellations',
  constellation_frontmatter_schema,
)

export const entries: EntryGenerator = async () => {
  const constellation_entries = await constellations.entries()
  const pages = await Promise.all(
    entry_collections.map(async (collection) => {
      const indexed = entry_index(
        await collection_entries(collection),
        constellation_entries,
      )
      return Array.from(
        { length: Math.max(0, page_count(indexed.length) - 1) },
        (_, index) => ({ collection, page: String(index + 2) }),
      )
    }),
  )
  return pages.flat()
}

export const load: PageServerLoad = async ({ depends, params }) => {
  const collection = entry_collection_param(params.collection)
  depends(content_dependency(collection))
  depends(content_dependency('constellations'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到内容页')

  const [entry_entries, constellation_entries, index] = await Promise.all([
    collection_entries(collection),
    constellations.entries(),
    read_content(collection, entry_index_frontmatter_schema),
  ])
  const entries = paginate(
    entry_index(entry_entries, constellation_entries),
    page,
  )
  if (!entries) throw error(404, '未找到内容页')
  if (!index) throw new Error(`Missing content/${collection}.md.`)
  return { collection, entries, index: index.document }
}
