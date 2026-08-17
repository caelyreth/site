import type { MarkdownDocument } from 'comark'
import * as v from 'valibot'

import { entry_frontmatter_fields } from './frontmatter'

export const constellation_id_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const date_pattern = /^\d{4}-\d{2}-\d{2}$/

export const record_frontmatter_schema = v.strictObject({
  ...entry_frontmatter_fields,
  published: v.pipe(v.string(), v.regex(date_pattern)),
  constellations: v.optional(
    v.array(v.pipe(v.string(), v.regex(constellation_id_pattern))),
  ),
})

export const constellation_frontmatter_schema = v.strictObject({
  ...entry_frontmatter_fields,
})

export type RecordFrontmatter = v.InferOutput<
  typeof record_frontmatter_schema
>
export type ConstellationFrontmatter = v.InferOutput<
  typeof constellation_frontmatter_schema
>

export type RecordDocument = MarkdownDocument<
  Record<string, unknown>,
  RecordFrontmatter
>
export type ConstellationDocument = MarkdownDocument<
  Record<string, unknown>,
  ConstellationFrontmatter
>

export interface RecordSummary {
  published: string
  slug: string
  summary: string
  constellations: string[]
  title: string
}

export interface ConstellationSummary {
  entry_count: number
  id: string
  latest: RecordSummary[]
  summary: string
  title: string
}
