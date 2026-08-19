import {
  entry_collections,
  type CollectionEntry,
  type EntryCollection,
} from './entries'
import { content_query } from './query.server'
import { entry_frontmatter_schema } from './schema'

const sources = new Map(
  entry_collections.map(
    (collection) =>
      [
        collection,
        content_query(collection, entry_frontmatter_schema),
      ] as const,
  ),
)

export function entry_source(collection: EntryCollection) {
  const source = sources.get(collection)
  if (!source) throw new Error(`Unknown entry collection "${collection}".`)
  return source
}

export async function all_entry_entries(): Promise<CollectionEntry[]> {
  const groups = await Promise.all(
    entry_collections.map(async (collection) =>
      (await entry_source(collection).entries()).map((entry) => ({
        ...entry,
        collection,
      })),
    ),
  )

  return groups.flat()
}

export async function collection_entries(
  collection: EntryCollection,
): Promise<CollectionEntry[]> {
  return (await entry_source(collection).entries()).map((entry) => ({
    ...entry,
    collection,
  }))
}
