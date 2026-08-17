import {
  constellation_frontmatter_schema,
  type ConstellationDocument,
  type ConstellationSummary,
  type RecordSummary,
} from './library'
import { parse_frontmatter, parse_markdown } from './markdown.server'
import { load_record_summaries } from './records.server'

const constellation_sources = import.meta.glob<string>(
  '../../../content/constellations/*.md',
  {
    import: 'default',
    query: '?raw',
  },
)
const source_prefix = '../../../content/constellations/'

interface ConstellationSource {
  document: ConstellationDocument
  id: string
}

interface ConstellationIndex {
  constellations: ConstellationSummary[]
  records: RecordSummary[]
  sources: ConstellationSource[]
}

function source_for(id: string) {
  const source_path = `${source_prefix}${id}.md`
  const source = constellation_sources[source_path]
  if (!source) throw new Error(`Unknown constellation "${id}".`)
  return { source, source_path }
}

function latest_date(constellation: ConstellationSummary) {
  return constellation.latest[0]?.published ?? ''
}

function compare_constellations(
  left: ConstellationSummary,
  right: ConstellationSummary,
) {
  const date_order = latest_date(right).localeCompare(latest_date(left))
  if (date_order) return date_order
  return left.id.localeCompare(right.id)
}

function add_record(
  records_by_constellation: Map<string, RecordSummary[]>,
  id: string,
  record: RecordSummary,
) {
  const entries = records_by_constellation.get(id) ?? []
  entries.push(record)
  records_by_constellation.set(id, entries)
}

function collect_records(
  records: RecordSummary[],
  known_constellations: Map<string, ConstellationSource>,
) {
  const records_by_constellation = new Map<string, RecordSummary[]>()

  for (const record of records) {
    for (const id of record.constellations) {
      if (!known_constellations.has(id)) {
        throw new Error(
          `content/records/${record.slug}.md: unknown constellation "${id}".`,
        )
      }
      add_record(records_by_constellation, id, record)
    }
  }

  return records_by_constellation
}

function build_constellations(
  sources: ConstellationSource[],
  records: RecordSummary[],
) {
  const known_constellations = new Map(
    sources.map((source) => [source.id, source]),
  )
  const records_by_constellation = collect_records(
    records,
    known_constellations,
  )

  return sources
    .flatMap(({ document, id }) => {
      const entries = records_by_constellation.get(id) ?? []
      if (entries.length === 0) return []
      return [
        {
          entry_count: entries.length,
          id,
          latest: entries.slice(0, 3),
          summary: document.frontmatter.summary,
          title: document.frontmatter.title,
        },
      ]
    })
    .sort(compare_constellations)
}

export function constellation_ids() {
  return Object.keys(constellation_sources)
    .map((source) => source.slice(source_prefix.length, -'.md'.length))
    .sort()
}

export async function load_constellation(
  id: string,
): Promise<ConstellationDocument> {
  const { source, source_path } = source_for(id)
  const document = await parse_markdown(await source())

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      constellation_frontmatter_schema,
    ),
  }
}

async function load_constellation_sources() {
  return Promise.all(
    constellation_ids().map(async (id) => ({
      document: await load_constellation(id),
      id,
    })),
  )
}

async function load_constellation_index(): Promise<ConstellationIndex> {
  const [sources, records] = await Promise.all([
    load_constellation_sources(),
    load_record_summaries(),
  ])

  return {
    constellations: build_constellations(sources, records),
    records,
    sources,
  }
}

export async function load_constellation_summaries() {
  return (await load_constellation_index()).constellations
}

export async function load_constellation_entries(id: string) {
  const index = await load_constellation_index()
  const constellation = index.constellations.find(
    (entry) => entry.id === id,
  )
  const source = index.sources.find((entry) => entry.id === id)
  if (!constellation || !source) return undefined

  return {
    document: source.document,
    entries: index.records.filter((record) =>
      record.constellations.includes(id),
    ),
    constellation,
  }
}
