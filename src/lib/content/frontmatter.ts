import * as v from 'valibot'

export const content_fonts = ['sans', 'serif'] as const

const content_font_schema = v.optional(v.picklist(content_fonts), 'sans')

export const shared_frontmatter_fields = {
  description: v.optional(v.string()),
  font: content_font_schema,
  title: v.string(),
}

export const entry_frontmatter_fields = {
  ...shared_frontmatter_fields,
  summary: v.string(),
}

export const shared_frontmatter_schema = v.strictObject(
  shared_frontmatter_fields,
)

export type ContentFont = v.InferOutput<typeof content_font_schema>
export type SharedFrontmatter = v.InferOutput<
  typeof shared_frontmatter_schema
>
