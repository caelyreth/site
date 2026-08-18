import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import {
  constellation_index_frontmatter_schema,
  record_index_frontmatter_schema,
} from '$lib/content/schema'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ depends }) => {
  depends(content_dependency('records'))
  depends(content_dependency('constellations'))

  const [records, constellations] = await Promise.all([
    read_content('records', record_index_frontmatter_schema),
    read_content('constellations', constellation_index_frontmatter_schema),
  ])
  if (!records) throw new Error('Missing content/records.md.')
  if (!constellations) throw new Error('Missing content/constellations.md.')

  return {
    library: {
      constellations: constellations.document.frontmatter,
      records: records.document.frontmatter,
    },
  }
}
