import type { MarkdownDocument } from 'comark'
import * as v from 'valibot'

export const thread_id_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const date_pattern = /^\d{4}-\d{2}-\d{2}$/

export const essay_frontmatter_schema = v.strictObject({
  description: v.optional(v.string()),
  published: v.pipe(v.string(), v.regex(date_pattern)),
  summary: v.string(),
  threads: v.optional(
    v.array(v.pipe(v.string(), v.regex(thread_id_pattern))),
  ),
  title: v.string(),
})

export const thread_frontmatter_schema = v.strictObject({
  summary: v.string(),
  title: v.string(),
})

export type EssayFrontmatter = v.InferOutput<
  typeof essay_frontmatter_schema
>
export type ThreadFrontmatter = v.InferOutput<
  typeof thread_frontmatter_schema
>

export type EssayDocument = MarkdownDocument<
  Record<string, unknown>,
  EssayFrontmatter
>
export type ThreadDocument = MarkdownDocument<
  Record<string, unknown>,
  ThreadFrontmatter
>

export interface EssaySummary {
  published: string
  slug: string
  summary: string
  threads: string[]
  title: string
}

export interface ThreadSummary {
  entry_count: number
  id: string
  latest: EssaySummary[]
  summary: string
  title: string
}
