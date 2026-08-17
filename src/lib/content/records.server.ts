import {
  record_frontmatter_schema,
  type RecordDocument,
  type RecordFrontmatter,
  type RecordSummary,
} from './library'
import { parse_frontmatter, parse_markdown } from './markdown.server'

const record_sources = import.meta.glob<string>(
  '../../../content/records/*.md',
  {
    import: 'default',
    query: '?raw',
  },
)
const source_prefix = '../../../content/records/'

function source_for(slug: string) {
  const source_path = `${source_prefix}${slug}.md`
  const source = record_sources[source_path]
  if (!source) throw new Error(`Unknown record "${slug}".`)
  return { source, source_path }
}

function summary_from(
  slug: string,
  frontmatter: RecordFrontmatter,
): RecordSummary {
  return {
    published: frontmatter.published,
    slug,
    summary: frontmatter.summary,
    constellations: [...new Set(frontmatter.constellations ?? [])],
    title: frontmatter.title,
  }
}

function sort_records(entries: RecordSummary[]) {
  return entries.sort(
    (left, right) =>
      right.published.localeCompare(left.published) ||
      left.slug.localeCompare(right.slug),
  )
}

export function record_slugs() {
  return Object.keys(record_sources)
    .map((source) => source.slice(source_prefix.length, -'.md'.length))
    .sort()
}

export async function load_record(slug: string): Promise<RecordDocument> {
  const { source, source_path } = source_for(slug)
  const document = await parse_markdown(await source())

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      record_frontmatter_schema,
    ),
  }
}

export async function load_record_summaries(): Promise<RecordSummary[]> {
  const entries = await Promise.all(
    record_slugs().map(async (slug) => {
      const document = await load_record(slug)
      return summary_from(slug, document.frontmatter)
    }),
  )

  return sort_records(entries)
}
