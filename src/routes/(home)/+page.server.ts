import { entry_collections } from '$lib/content/entries'
import { all_entry_entries } from '$lib/content/entries.server'
import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import {
  constellation_index,
  entry_index,
  recent_archive,
} from '$lib/content/relations'
import { home_frontmatter_schema } from '$lib/content/schema'
import { constellation_source } from '$lib/content/sources.server'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('home'))
  entry_collections.forEach((collection) => {
    depends(content_dependency(collection))
  })
  depends(content_dependency('constellations'))

  const [home, entries, constellations] = await Promise.all([
    read_content('home', home_frontmatter_schema),
    all_entry_entries(),
    constellation_source.documents(),
  ])
  if (!home) throw new Error('Missing content/home.md.')

  const indexed_entries = entry_index(entries, constellations)
  const indexed_constellations = constellation_index(
    constellations,
    indexed_entries,
  )

  return {
    document: home.document,
    recent: recent_archive(indexed_entries, indexed_constellations),
    toc: extract_headings(home.document.nodes),
  }
}
