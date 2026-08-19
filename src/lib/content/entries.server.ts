import {
  entry_collections,
  type CollectionEntry,
  type EntryCollection,
} from './entries'
import { page_count, paginate, read_content } from './query.server'
import { entry_index, resolve_constellations } from './relations'
import { entry_index_frontmatter_schema } from './schema'
import { constellation_source, entry_source } from './sources.server'

export { entry_source } from './sources.server'

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

async function collection_document(collection: EntryCollection) {
  const document = await read_content(
    collection,
    entry_index_frontmatter_schema,
  )
  if (!document) throw new Error(`Missing content/${collection}.md.`)
  return document.document
}

export async function collection_page(
  collection: EntryCollection,
  page: number,
) {
  const [entries, constellations, document] = await Promise.all([
    collection_entries(collection),
    constellation_source.entries(),
    collection_document(collection),
  ])

  return {
    document,
    entries: paginate(entry_index(entries, constellations), page),
  }
}

export async function collection_page_entries() {
  const constellations = await constellation_source.entries()
  const pages = await Promise.all(
    entry_collections.map(async (collection) => {
      const total = entry_index(
        await collection_entries(collection),
        constellations,
      )
      return Array.from(
        { length: Math.max(0, page_count(total.length) - 1) },
        (_, index) => ({ collection, page: String(index + 2) }),
      )
    }),
  )

  return pages.flat()
}

export function entry_route_entries() {
  return entry_collections.flatMap((collection) =>
    entry_source(collection)
      .keys()
      .map((entry) => ({ collection, entry })),
  )
}

export async function entry_page(collection: EntryCollection, id: string) {
  const [entry, constellations] = await Promise.all([
    entry_source(collection).document(id),
    constellation_source.entries(),
  ])
  if (!entry) return undefined

  return {
    constellations: resolve_constellations(
      entry.document.frontmatter.constellations,
      entry.path,
      constellations,
    ),
    document: entry.document,
  }
}
