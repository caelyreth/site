import { entry_collections, type EntryCollection } from './entries'
import { content_query } from './query.server'
import {
  constellation_frontmatter_schema,
  entry_frontmatter_schema,
} from './schema'

export const constellation_source = content_query(
  'constellations',
  constellation_frontmatter_schema,
)

const entry_sources = new Map(
  entry_collections.map(
    (collection) =>
      [
        collection,
        content_query(collection, entry_frontmatter_schema),
      ] as const,
  ),
)

export function entry_source(collection: EntryCollection) {
  const source = entry_sources.get(collection)
  if (!source) throw new Error(`Unknown entry collection "${collection}".`)
  return source
}
