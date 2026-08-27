import type { ElementNode, Node } from 'comark'

import {
  is_entry_collection,
  type CollectionEntry,
  type EntryCollection,
} from './entries'
import { content_key_pattern } from './schema'
import type { ConstellationFrontmatter, ContentDocument } from './schema'

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
  updated?: string
}

export interface ConstellationSummary {
  entry_count: number
  id: string
  latest: EntrySummary[]
  latest_published?: string
  summary: string
  title: string
}

type ConstellationDocuments = ContentDocument<ConstellationFrontmatter>[]

function compare_entries(left: EntrySummary, right: EntrySummary) {
  return (
    right.published.localeCompare(left.published) ||
    left.id.localeCompare(right.id)
  )
}

function latest_date(constellation: ConstellationSummary) {
  return constellation.latest_published ?? ''
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

function is_element(node: Node): node is ElementNode {
  return Array.isArray(node) && typeof node[0] === 'string'
}

function links_in(nodes: Node[]) {
  const links: string[] = []

  function visit(current_nodes: Node[]) {
    for (const node of current_nodes) {
      if (!is_element(node)) continue

      const [tag, attributes, ...children] = node
      if (tag === 'a' && typeof attributes.href === 'string') {
        links.push(attributes.href)
      }
      visit(children)
    }
  }

  visit(nodes)
  return links
}

function entry_key(collection: EntryCollection, id: string) {
  return `${collection}/${id}`
}

function linked_entry_key(href: string) {
  let url: URL
  try {
    url = new URL(href, 'https://content.invalid/constellations/page')
  } catch {
    return undefined
  }
  if (url.origin !== 'https://content.invalid') return undefined

  const [collection, id, ...rest] = url.pathname.split('/').filter(Boolean)
  if (
    rest.length ||
    !is_entry_collection(collection) ||
    !id ||
    !content_key_pattern.test(id)
  ) {
    return undefined
  }
  return entry_key(collection, id)
}

function linked_constellations(
  entries: CollectionEntry[],
  constellations: ConstellationDocuments,
) {
  const known_entries = new Map(
    entries.map((entry) => [entry_key(entry.collection, entry.id), entry]),
  )
  const related = new Map<string, ConstellationReference[]>()

  for (const constellation of constellations) {
    const linked = new Set(
      links_in(constellation.document.nodes)
        .map(linked_entry_key)
        .filter((key): key is string => key !== undefined),
    )

    for (const key of linked) {
      if (!known_entries.has(key)) {
        throw new Error(
          `${constellation.path}: linked entry "${key}" does not exist.`,
        )
      }
      const references = related.get(key) ?? []
      references.push({
        id: constellation.id,
        title: constellation.document.frontmatter.title,
      })
      related.set(key, references)
    }
  }

  return related
}

export function entry_index(
  entries: CollectionEntry[],
  constellations: ConstellationDocuments,
): EntrySummary[] {
  const related = linked_constellations(entries, constellations)
  return entries
    .map((entry) => ({
      collection: entry.collection,
      constellations:
        related.get(entry_key(entry.collection, entry.id)) ?? [],
      id: entry.id,
      published: entry.frontmatter.published,
      summary: entry.frontmatter.summary,
      title: entry.frontmatter.title,
      updated: entry.frontmatter.updated,
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
  entries: ConstellationDocuments,
  entry_summaries: EntrySummary[],
): ConstellationSummary[] {
  return entries
    .map((entry) => {
      const related = entries_for_constellation(entry_summaries, entry.id)
      return {
        entry_count: related.length,
        id: entry.id,
        latest: related.slice(0, 3),
        latest_published: related.at(0)?.published,
        summary: entry.document.frontmatter.summary,
        title: entry.document.frontmatter.title,
      }
    })
    .sort(compare_constellations)
}
