import { createMarkdownParser } from 'comark'
import toml from 'comark-toml'
import alert from 'comark/plugins/alert'
import attributes from 'comark/plugins/attributes'
import components from 'comark/plugins/components'
import footnotes from 'comark/plugins/footnotes'
import headings from 'comark/plugins/headings'
import punctuation from 'comark/plugins/punctuation'
import rangi from 'comark/plugins/rangi'
import security from 'comark/plugins/security'
import task_list from 'comark/plugins/task-list'
import toc from 'comark/plugins/toc'
import * as v from 'valibot'

import media from './media'
import { eclat } from './rangi-theme'
import type {
  ContentDocument,
  ContentSection,
  ContentSummary,
} from './schema'

const content_sources = import.meta.glob<string>(
  '../../../content/**/*.md',
  {
    import: 'default',
    query: '?raw',
  },
)
const content_source_prefix = '../../../content/'

const parse_markdown = createMarkdownParser({
  registerDefaultPlugins: false,
  plugins: [
    toml(),
    alert(),
    task_list(),
    components(),
    attributes(),
    footnotes({ hr: false }),
    headings(),
    toc({ depth: 3, searchDepth: 3 }),
    punctuation(),
    security({ allowDataImages: false }),
    media(),
    rangi({ preStyles: true, theme: eclat }),
  ],
})

function source_for(content_id: string) {
  const source_path = `content/${content_id}.md`
  const load_source = content_sources[`../../../${source_path}`]
  if (!load_source) {
    throw new Error(`Unknown content document "${source_path}".`)
  }

  return { source_path, load_source }
}

function content_id_from_source_key(source_key: string) {
  return source_key.slice(content_source_prefix.length, -'.md'.length)
}

function published_date(frontmatter: Record<string, unknown>) {
  return typeof frontmatter.published === 'string'
    ? frontmatter.published
    : ''
}

function parse_frontmatter<Frontmatter extends Record<string, unknown>>(
  value: unknown,
  source_path: string,
  schema: v.GenericSchema<unknown, Frontmatter>,
) {
  const result = v.safeParse(schema, value)
  if (result.success) return result.output
  throw new Error(`${source_path}: ${v.summarize(result.issues)}`)
}

export async function load_content<
  Frontmatter extends Record<string, unknown>,
>(
  content_id: string,
  frontmatter_schema: v.GenericSchema<unknown, Frontmatter>,
): Promise<ContentDocument<Frontmatter>> {
  const { source_path, load_source } = source_for(content_id)
  const document = await parse_markdown(await load_source())

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      frontmatter_schema,
    ),
  }
}

export function content_slugs(section: ContentSection) {
  const section_prefix = `${section}/`
  return Object.keys(content_sources)
    .map(content_id_from_source_key)
    .filter((content_id) => content_id.startsWith(section_prefix))
    .map((content_id) => content_id.slice(section_prefix.length))
    .filter((slug) => !slug.includes('/'))
    .sort()
}

export async function load_content_collection<
  Frontmatter extends Record<string, unknown>,
>(
  section: ContentSection,
  frontmatter_schema: v.GenericSchema<unknown, Frontmatter>,
): Promise<ContentSummary<Frontmatter>[]> {
  const entries = await Promise.all(
    content_slugs(section).map(async (slug) => {
      const content_id = `${section}/${slug}`
      const document = await load_content(content_id, frontmatter_schema)
      return {
        frontmatter: document.frontmatter,
        slug,
      }
    }),
  )

  return entries.sort((left, right) => {
    const left_date = published_date(left.frontmatter)
    const right_date = published_date(right.frontmatter)
    return (
      right_date.localeCompare(left_date) ||
      left.slug.localeCompare(right.slug)
    )
  })
}
