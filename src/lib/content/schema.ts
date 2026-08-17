import type { MarkdownDocument } from 'comark'
import * as v from 'valibot'

export const content_fonts = ['sans', 'serif'] as const

const content_font_schema = v.optional(v.picklist(content_fonts), 'sans')

export const content_key_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const document_fields = {
  description: v.optional(v.string()),
  font: content_font_schema,
  title: v.string(),
}

const indexed_document_fields = {
  ...document_fields,
  summary: v.string(),
}

export const home_frontmatter_schema = v.strictObject(document_fields)

const constellation_id_schema = v.pipe(
  v.string(),
  v.regex(content_key_pattern),
)

export const record_frontmatter_schema = v.strictObject({
  ...indexed_document_fields,
  published: v.pipe(v.string(), v.isoDate()),
  constellations: v.optional(
    v.pipe(
      v.array(constellation_id_schema),
      v.transform((ids) => [...new Set(ids)]),
    ),
    [],
  ),
})

export const constellation_frontmatter_schema = v.strictObject(
  indexed_document_fields,
)

export type ContentFont = v.InferOutput<typeof content_font_schema>
export type HomeFrontmatter = v.InferOutput<typeof home_frontmatter_schema>
export type RecordFrontmatter = v.InferOutput<
  typeof record_frontmatter_schema
>
export type ConstellationFrontmatter = v.InferOutput<
  typeof constellation_frontmatter_schema
>

export type HomeDocument = MarkdownDocument<
  Record<string, unknown>,
  HomeFrontmatter
>

export type RecordDocument = MarkdownDocument<
  Record<string, unknown>,
  RecordFrontmatter
>

export type ConstellationDocument = MarkdownDocument<
  Record<string, unknown>,
  ConstellationFrontmatter
>

export interface ContentEntry<Frontmatter> {
  frontmatter: Frontmatter
  id: string
  path: string
}

export interface ContentDocument<Frontmatter> {
  document: MarkdownDocument<Record<string, unknown>, Frontmatter>
  id: string
  path: string
}

export interface ContentPage<T> {
  entries: T[]
  page: number
  page_count: number
  total: number
}
