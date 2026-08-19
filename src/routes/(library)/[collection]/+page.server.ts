import { entry_collections } from '$lib/content/entries'
import { collection_entries } from '$lib/content/entries.server'
import { entry_collection_param } from '$lib/content/entry-route.server'
import { content_dependency } from '$lib/content/hmr'
import {
  content_query,
  paginate,
  read_content,
} from '$lib/content/query.server'
import { entry_index } from '$lib/content/relations'
import {
  constellation_frontmatter_schema,
  entry_index_frontmatter_schema,
} from '$lib/content/schema'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

const constellations = content_query(
  'constellations',
  constellation_frontmatter_schema,
)

export const entries: EntryGenerator = () =>
  entry_collections.map((collection) => ({ collection }))

export const load: PageServerLoad = async ({ depends, params }) => {
  const collection = entry_collection_param(params.collection)
  depends(content_dependency(collection))
  depends(content_dependency('constellations'))
  const [entry_entries, constellation_entries, index] = await Promise.all([
    collection_entries(collection),
    constellations.entries(),
    read_content(collection, entry_index_frontmatter_schema),
  ])
  const page = paginate(
    entry_index(entry_entries, constellation_entries),
    1,
  )
  if (!page) throw new Error('无法创建首页。')
  if (!index) throw new Error(`Missing content/${collection}.md.`)
  return { collection, entries: page, index: index.document }
}
