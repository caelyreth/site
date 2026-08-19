import { entry_collections } from '$lib/content/entries'
import { entry_source } from '$lib/content/entries.server'
import { entry_collection_param } from '$lib/content/entry-route.server'
import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { content_query } from '$lib/content/query.server'
import { resolve_constellations } from '$lib/content/relations'
import { constellation_frontmatter_schema } from '$lib/content/schema'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

const constellations = content_query(
  'constellations',
  constellation_frontmatter_schema,
)

export const entries: EntryGenerator = async () =>
  (
    await Promise.all(
      entry_collections.map(async (collection) =>
        entry_source(collection)
          .keys()
          .map((entry) => ({ collection, entry })),
      ),
    )
  ).flat()

export const load: PageServerLoad = async ({ depends, params }) => {
  const collection = entry_collection_param(params.collection)
  depends(content_dependency(`${collection}/${params.entry}`))
  depends(content_dependency('constellations'))
  const [entry, constellation_entries] = await Promise.all([
    entry_source(collection).document(params.entry),
    constellations.entries(),
  ])
  if (!entry) throw error(404, '未找到内容')

  return {
    collection,
    constellations: resolve_constellations(
      entry.document.frontmatter.constellations,
      entry.path,
      constellation_entries,
    ),
    document: entry.document,
    toc: extract_headings(entry.document.nodes),
  }
}
