import { entry_collections } from '$lib/content/entries'
import { content_dependency } from '$lib/content/hmr'
import type { LibraryConfig } from '$lib/content/library'
import { read_content } from '$lib/content/query.server'
import {
  constellation_index_frontmatter_schema,
  entry_index_frontmatter_schema,
} from '$lib/content/schema'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ depends }) => {
  entry_collections.forEach((collection) => {
    depends(content_dependency(collection))
  })
  depends(content_dependency('constellations'))

  const [entries, constellations] = await Promise.all([
    Promise.all(
      entry_collections.map(async (collection) => {
        const document = await read_content(
          collection,
          entry_index_frontmatter_schema,
        )
        if (!document) throw new Error(`Missing content/${collection}.md.`)
        return [collection, document.document.frontmatter] as const
      }),
    ),
    read_content('constellations', constellation_index_frontmatter_schema),
  ])
  if (!constellations) throw new Error('Missing content/constellations.md.')

  return {
    library: {
      constellations: constellations.document.frontmatter,
      entries: Object.fromEntries(entries) as LibraryConfig['entries'],
    },
  }
}
