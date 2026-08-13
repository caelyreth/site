import type { MarkdownDocument } from 'comark'
import * as v from 'valibot'

export const presentation_id_schema = v.pipe(
  v.string(),
  v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase kebab-case'),
)

const options_schema = v.record(v.string(), v.unknown())

const document_frontmatter_entries = {
  description: v.optional(v.string()),
  title: v.string(),
}

const presentation_frontmatter_entries = {
  footer: v.optional(presentation_id_schema),
  footer_options: v.optional(options_schema),
  stage: v.optional(presentation_id_schema),
  stage_options: v.optional(options_schema),
}

export const document_frontmatter_schema = v.object(
  document_frontmatter_entries,
)

export const presentation_frontmatter_schema = v.object(
  presentation_frontmatter_entries,
)

export const home_frontmatter_schema = v.strictObject({
  ...document_frontmatter_entries,
  ...presentation_frontmatter_entries,
})

export type PresentationFrontmatter = v.InferOutput<
  typeof presentation_frontmatter_schema
>
export type HomeFrontmatter = v.InferOutput<typeof home_frontmatter_schema>

export type ContentDocument<
  Frontmatter extends Record<string, unknown> = Record<string, unknown>,
> = MarkdownDocument<Record<string, unknown>, Frontmatter>
