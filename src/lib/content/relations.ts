import type { CollectionEntry, EntryCollection } from './entries'
import type { ConstellationFrontmatter, ContentEntry } from './schema'

export interface ConstellationReference {
  id: string
  title: string
}

export interface EntrySummary {
  collection: EntryCollection
  constellations: ConstellationReference[]
  id: string
  published: string
  summary: string
  title: string
}

export interface ConstellationSummary {
  entry_count: number
  id: string
  latest: EntrySummary[]
  summary: string
  title: string
}

type ConstellationEntries = ContentEntry<ConstellationFrontmatter>[]

function compare_entries(left: EntrySummary, right: EntrySummary) {
  return (
    right.published.localeCompare(left.published) ||
    left.id.localeCompare(right.id)
  )
}

function latest_date(constellation: ConstellationSummary) {
  return constellation.latest.at(0)?.published ?? ''
}

function compare_constellations(
  left: ConstellationSummary,
  right: ConstellationSummary,
) {
  return (
    latest_date(right).localeCompare(latest_date(left)) ||
    left.id.localeCompare(right.id)
  )
}

function constellation_lookup(entries: ConstellationEntries) {
  return new Map(entries.map((entry) => [entry.id, entry]))
}

function resolve_constellation_ids(
  ids: string[],
  path: string,
  known: ReturnType<typeof constellation_lookup>,
): ConstellationReference[] {
  return ids.map((id) => {
    const constellation = known.get(id)
    if (!constellation) {
      throw new Error(`${path}: unknown constellation "${id}".`)
    }
    return { id, title: constellation.frontmatter.title }
  })
}

export function resolve_constellations(
  ids: string[],
  path: string,
  entries: ConstellationEntries,
): ConstellationReference[] {
  return resolve_constellation_ids(ids, path, constellation_lookup(entries))
}

export function entry_index(
  entries: CollectionEntry[],
  constellations: ConstellationEntries,
): EntrySummary[] {
  const known = constellation_lookup(constellations)
  return entries
    .map((entry) => ({
      collection: entry.collection,
      constellations: resolve_constellation_ids(
        entry.frontmatter.constellations,
        entry.path,
        known,
      ),
      id: entry.id,
      published: entry.frontmatter.published,
      summary: entry.frontmatter.summary,
      title: entry.frontmatter.title,
    }))
    .sort(compare_entries)
}

export function entries_for_constellation(
  entries: EntrySummary[],
  id: string,
) {
  return entries.filter((entry) =>
    entry.constellations.some((constellation) => constellation.id === id),
  )
}

export function constellation_index(
  entries: ConstellationEntries,
  entry_summaries: EntrySummary[],
): ConstellationSummary[] {
  return entries
    .map((entry) => {
      const related = entries_for_constellation(entry_summaries, entry.id)
      return {
        entry_count: related.length,
        id: entry.id,
        latest: related.slice(0, 3),
        summary: entry.frontmatter.summary,
        title: entry.frontmatter.title,
      }
    })
    .sort(compare_constellations)
}
