import {
  entry_collections,
  entry_path,
  type CollectionEntry,
  type EntryCollection,
  type EntryLink,
} from './entries'
import { page_count, paginate, read_content } from './query.server'
import { entry_index } from './relations'
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

export async function entry_links(): Promise<EntryLink[]> {
  const groups = await Promise.all(
    entry_collections.map(async (collection) => {
      const [document, entries] = await Promise.all([
        collection_document(collection),
        collection_entries(collection),
      ])
      const label = document.frontmatter.title

      return entries.map((entry) => ({
        collection: label,
        href: entry_path(collection, entry.id),
        id: `${collection}/${entry.id}`,
        published: entry.frontmatter.published,
        title: entry.frontmatter.title,
      }))
    }),
  )

  return groups
    .flat()
    .sort(
      (left, right) =>
        right.published.localeCompare(left.published) ||
        left.id.localeCompare(right.id),
    )
    .map(({ published: _published, ...entry }) => entry)
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
    all_entry_entries(),
    constellation_source.documents(),
    collection_document(collection),
  ])

  return {
    document,
    entries: paginate(
      entry_index(entries, constellations).filter(
        (entry) => entry.collection === collection,
      ),
      page,
    ),
  }
}

export async function collection_page_entries() {
  const [entries, constellations] = await Promise.all([
    all_entry_entries(),
    constellation_source.documents(),
  ])
  const indexed = entry_index(entries, constellations)

  return entry_collections.flatMap((collection) =>
    Array.from(
      {
        length: Math.max(
          0,
          page_count(
            indexed.filter((entry) => entry.collection === collection)
              .length,
          ) - 1,
        ),
      },
      (_, index) => ({ collection, page: String(index + 2) }),
    ),
  )
}

export function entry_route_entries() {
  return entry_collections.flatMap((collection) =>
    entry_source(collection)
      .keys()
      .map((entry) => ({ collection, entry })),
  )
}

export async function entry_page(collection: EntryCollection, id: string) {
  const [entry, entries, constellations] = await Promise.all([
    entry_source(collection).document(id),
    all_entry_entries(),
    constellation_source.documents(),
  ])
  if (!entry) return undefined

  const summary = entry_index(entries, constellations).find(
    (current) => current.collection === collection && current.id === id,
  )
  if (!summary) return undefined

  return {
    constellations: summary.constellations,
    document: entry.document,
  }
}
