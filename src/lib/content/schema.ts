import type { MarkdownDocument } from 'comark'
import * as v from 'valibot'

const document_frontmatter_entries = {
  description: v.optional(v.string()),
  title: v.string(),
}

export const document_frontmatter_schema = v.strictObject(
  document_frontmatter_entries,
)

export type DocumentFrontmatter = v.InferOutput<
  typeof document_frontmatter_schema
>

export type ContentDocument<
  Frontmatter extends Record<string, unknown> = Record<string, unknown>,
> = MarkdownDocument<Record<string, unknown>, Frontmatter>
