import { entry_collections, entry_path } from './entries'
import { all_entry_entries } from './entries.server'
import { constellation_index, entry_index } from './relations'
import { constellation_source } from './sources.server'

export interface SitemapEntry {
  lastmod?: string
  path: string
}

function latest_date(entries: { published: string; updated?: string }[]) {
  return entries.reduce<string | undefined>((latest, entry) => {
    const date = entry.updated ?? entry.published
    return !latest || date > latest ? date : latest
  }, undefined)
}

/**
 * Public, canonical routes only. Pagination is intentionally excluded
 * because its first page already has a canonical collection or
 * constellation route.
 */
export async function sitemap_entries(): Promise<SitemapEntry[]> {
  const [entries, constellations] = await Promise.all([
    all_entry_entries(),
    constellation_source.documents(),
  ])
  const indexed_entries = entry_index(entries, constellations)
  const indexed_constellations = constellation_index(
    constellations,
    indexed_entries,
  )
  const collection_entries = new Map(
    entry_collections.map((collection) => [
      collection,
      indexed_entries.filter((entry) => entry.collection === collection),
    ]),
  )

  return [
    { lastmod: latest_date(indexed_entries), path: '/' },
    { path: '/about' },
    { path: '/friends' },
    { path: '/timeline' },
    ...entry_collections.map((collection) => ({
      lastmod: latest_date(collection_entries.get(collection) ?? []),
      path: entry_path(collection),
    })),
    {
      lastmod: latest_date(indexed_entries),
      path: '/constellations',
    },
    ...indexed_entries.map((entry) => ({
      lastmod: entry.updated ?? entry.published,
      path: entry_path(entry.collection, entry.id),
    })),
    ...indexed_constellations.map((constellation) => ({
      lastmod: latest_date(
        indexed_entries.filter((entry) =>
          entry.constellations.some(({ id }) => id === constellation.id),
        ),
      ),
      path: `/constellations/${constellation.id}`,
    })),
  ].sort((left, right) => left.path.localeCompare(right.path))
}
