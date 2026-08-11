/* oxlint-disable typescript/prefer-readonly-parameter-types -- Zod schemas are read-only inputs, but Zod does not expose a readonly schema type. */
import { validate_content_components } from '$lib/content/validate.server'
import { parseMarkdown } from 'comark'
import { z } from 'zod'

import type { ContentDocument } from './types'

const content_sources = import.meta.glob('../../../content/**/*.md', {
  import: 'default',
  query: '?raw',
}) as Record<string, () => Promise<string>>

async function source_for(content_id: string) {
  const source_path = `content/${content_id}.md`
  const load_source = content_sources[`../../../${source_path}`]
  if (load_source === undefined) {
    throw new Error(`Unknown content document "${source_path}".`)
  }

  return { source: await load_source(), source_path }
}

function parse_frontmatter<Frontmatter extends Record<string, unknown>>(
  value: unknown,
  source_path: string,
  schema: Readonly<z.ZodType<Frontmatter>>,
) {
  const result = schema.safeParse(value)
  if (result.success) return result.data
  throw new Error(`${source_path}: ${z.prettifyError(result.error)}`)
}

export async function parse_content<
  Frontmatter extends Record<string, unknown>,
>(
  content_id: string,
  frontmatter_schema: Readonly<z.ZodType<Frontmatter>>,
): Promise<ContentDocument<Frontmatter>> {
  const { source, source_path } = await source_for(content_id)
  const document = await parseMarkdown(source)
  validate_content_components(document.nodes, source_path)

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      frontmatter_schema,
    ),
  }
}
