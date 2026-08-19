import { entry_collections } from '$lib/content/entries'
import { all_entry_entries } from '$lib/content/entries.server'
import { content_dependency } from '$lib/content/hmr'
import { content_query, paginate } from '$lib/content/query.server'
import {
  constellation_index,
  entries_for_constellation,
  entry_index,
} from '$lib/content/relations'
import { constellation_frontmatter_schema } from '$lib/content/schema'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

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
  entry_collections.forEach((collection) => {
    depends(content_dependency(collection))
  })
  const [document, entry_entries, constellation_entries] =
    await Promise.all([
      constellations.document(params.constellation),
      all_entry_entries(),
      constellations.entries(),
    ])
  if (!document) throw error(404, '未找到星群')

  const indexed_entries = entry_index(entry_entries, constellation_entries)
  const constellation = constellation_index(
    constellation_entries,
    indexed_entries,
  ).find((entry) => entry.id === params.constellation)
  if (!constellation) throw error(404, '未找到星群')

  const entries = paginate(
    entries_for_constellation(indexed_entries, constellation.id),
    1,
  )
  if (!entries) throw error(404, '未找到星群')

  return {
    document: document.document,
    entries,
    constellation,
  }
}
