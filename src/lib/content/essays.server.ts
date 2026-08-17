import {
  essay_frontmatter_schema,
  type EssayDocument,
  type EssayFrontmatter,
  type EssaySummary,
} from './archive'
import { parse_frontmatter, parse_markdown } from './markdown.server'

const essay_sources = import.meta.glob<string>(
  '../../../content/essays/*.md',
  {
    import: 'default',
    query: '?raw',
  },
)
const source_prefix = '../../../content/essays/'

function source_for(slug: string) {
  const source_path = `${source_prefix}${slug}.md`
  const source = essay_sources[source_path]
  if (!source) throw new Error(`Unknown essay "${slug}".`)
  return { source, source_path }
}

function summary_from(
  slug: string,
  frontmatter: EssayFrontmatter,
): EssaySummary {
  return {
    published: frontmatter.published,
    slug,
    summary: frontmatter.summary,
    threads: [...new Set(frontmatter.threads ?? [])],
    title: frontmatter.title,
  }
}

function sort_essays(entries: EssaySummary[]) {
  return entries.sort(
    (left, right) =>
      right.published.localeCompare(left.published) ||
      left.slug.localeCompare(right.slug),
  )
}

export function essay_slugs() {
  return Object.keys(essay_sources)
    .map((source) => source.slice(source_prefix.length, -'.md'.length))
    .sort()
}

export async function load_essay(slug: string): Promise<EssayDocument> {
  const { source, source_path } = source_for(slug)
  const document = await parse_markdown(await source())

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      essay_frontmatter_schema,
    ),
  }
}

export async function load_essay_summaries(): Promise<EssaySummary[]> {
  const entries = await Promise.all(
    essay_slugs().map(async (slug) => {
      const document = await load_essay(slug)
      return summary_from(slug, document.frontmatter)
    }),
  )

  return sort_essays(entries)
}
