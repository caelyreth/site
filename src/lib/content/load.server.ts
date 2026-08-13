import { createMarkdownParser } from 'comark'
import toml from 'comark-toml'
import * as v from 'valibot'

import type { ContentDocument } from './schema'

const content_sources = import.meta.glob('../../../content/**/*.md', {
  import: 'default',
  query: '?raw',
}) as Record<string, () => Promise<string>>

const parse_markdown = createMarkdownParser({ plugins: [toml()] })

function source_for(content_id: string) {
  const source_path = `content/${content_id}.md`
  const load_source = content_sources[`../../../${source_path}`]
  if (!load_source) {
    throw new Error(`Unknown content document "${source_path}".`)
  }

  return { source_path, load_source }
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
