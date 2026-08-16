import type { MarkdownDocument } from 'comark'
import * as v from 'valibot'

import type { ContentSection } from './sections'
import { thread_id_pattern } from './threads'
const document_frontmatter_entries = {
  description: v.optional(v.string()),
  title: v.string(),
}

const entry_frontmatter_entries = {
  description: v.optional(v.string()),
  published: v.optional(v.string()),
  summary: v.optional(v.string()),
  title: v.string(),
  threads: v.optional(
    v.array(v.pipe(v.string(), v.regex(thread_id_pattern))),
  ),
}

export const document_frontmatter_schema = v.strictObject(
  document_frontmatter_entries,
)

export type DocumentFrontmatter = v.InferOutput<
  typeof document_frontmatter_schema
>

export const entry_frontmatter_schema = v.strictObject(
  entry_frontmatter_entries,
)

export type EntryFrontmatter = v.InferOutput<
  typeof entry_frontmatter_schema
>

export interface ContentSummary<
  Frontmatter extends Record<string, unknown> = Record<string, unknown>,
> {
  frontmatter: Frontmatter
  section: ContentSection
  slug: string
}

export type ContentDocument<
  Frontmatter extends Record<string, unknown> = Record<string, unknown>,
> = MarkdownDocument<Record<string, unknown>, Frontmatter>
