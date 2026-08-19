import type { ContentEntry, EntryFrontmatter } from './schema'

export const entry_collections = ['records', 'voidknot'] as const

export type EntryCollection = (typeof entry_collections)[number]

export type CollectionEntry = ContentEntry<EntryFrontmatter> & {
  collection: EntryCollection
}

export function is_entry_collection(
  value: string,
): value is EntryCollection {
  return entry_collections.includes(value as EntryCollection)
}

export function entry_path(collection: EntryCollection, id?: string) {
  return id ? `/${collection}/${id}` : `/${collection}`
}
