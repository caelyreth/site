import { all_entry_entries } from './entries.server'
import { page_count, paginate, read_content } from './query.server'
import {
  constellation_index,
  entries_for_constellation,
  entry_index,
} from './relations'
import { constellation_index_frontmatter_schema } from './schema'
import { constellation_source } from './sources.server'

async function constellation_document() {
  const document = await read_content(
    'constellations',
    constellation_index_frontmatter_schema,
  )
  if (!document) throw new Error('Missing content/constellations.md.')
  return document.document
}

async function indexed_constellations() {
  const [entries, constellations] = await Promise.all([
    all_entry_entries(),
    constellation_source.entries(),
  ])
  return constellation_index(
    constellations,
    entry_index(entries, constellations),
  )
}

export async function constellation_page(page: number) {
  const [constellations, document] = await Promise.all([
    indexed_constellations(),
    constellation_document(),
  ])
  return { constellations: paginate(constellations, page), document }
}

export async function constellation_page_entries() {
  const constellations = await indexed_constellations()
  return Array.from(
    { length: Math.max(0, page_count(constellations.length) - 1) },
    (_, index) => ({ page: String(index + 2) }),
  )
}

export function constellation_route_entries() {
  return constellation_source.keys().map((constellation) => ({
    constellation,
  }))
}

export async function constellation_entry_page(id: string, page: number) {
  const [document, entries, constellations] = await Promise.all([
    constellation_source.document(id),
    all_entry_entries(),
    constellation_source.entries(),
  ])
  if (!document) return undefined

  const index = entry_index(entries, constellations)
  const constellation = constellation_index(constellations, index).find(
    (entry) => entry.id === id,
  )
  if (!constellation) return undefined

  return {
    constellation,
    document: document.document,
    entries: paginate(entries_for_constellation(index, id), page),
  }
}

export async function constellation_entry_page_entries() {
  const constellations = await indexed_constellations()
  return constellations.flatMap((constellation) =>
    Array.from(
      { length: Math.max(0, page_count(constellation.entry_count) - 1) },
      (_, index) => ({
        constellation: constellation.id,
        page: String(index + 2),
      }),
    ),
  )
}
