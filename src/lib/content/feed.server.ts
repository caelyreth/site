import { entry_path, type EntryCollection } from './entries'
import { all_entry_entries } from './entries.server'
import { read_content } from './query.server'
import { entry_index } from './relations'
import { site_config_schema } from './schema'
import { constellation_source } from './sources.server'

export const feed_limit = 20

export interface FeedEntry {
  collection: EntryCollection
  constellations: { id: string; title: string }[]
  id: string
  path: string
  published: string
  summary: string
  title: string
  updated: string
}

function entry_date(entry: { published: string; updated?: string }) {
  return entry.updated ?? entry.published
}

export async function feed_data() {
  const [site, entries, constellations] = await Promise.all([
    read_content('site', site_config_schema),
    all_entry_entries(),
    constellation_source.documents(),
  ])
  if (!site) throw new Error('Missing content/site.md.')

  const feed_entries: FeedEntry[] = entry_index(entries, constellations)
    .sort(
      (left, right) =>
        entry_date(right).localeCompare(entry_date(left)) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, feed_limit)
    .map((entry) => ({
      collection: entry.collection,
      constellations: entry.constellations,
      id: entry.id,
      path: entry_path(entry.collection, entry.id),
      published: entry.published,
      summary: entry.summary,
      title: entry.title,
      updated: entry_date(entry),
    }))

  return { entries: feed_entries, site: site.document.frontmatter }
}
