import { validate_content_components } from '$lib/content/validate.server'
import { parseMarkdown } from 'comark'
import { z } from 'zod'

import { page_frontmatter_schema } from './schema'
import type { ContentDocument } from './types'

function parse_frontmatter(value: unknown, source_path: string) {
  const result = page_frontmatter_schema.safeParse(value)
  if (result.success) return result.data
  throw new Error(`${source_path}: ${z.prettifyError(result.error)}`)
}

export async function parse_content(
  source: string,
  source_path: string,
): Promise<ContentDocument> {
  const document = await parseMarkdown(source)
  validate_content_components(document.nodes, source_path)

  return {
    ...document,
    frontmatter: parse_frontmatter(document.frontmatter, source_path),
  }
}
