import type { MarkdownDocument } from 'comark'
import { z } from 'zod'

export const presentation_id_schema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase kebab-case')

const options_schema = z.record(z.string(), z.unknown())

export const document_frontmatter_schema = z.object({
  description: z.string().optional(),
  title: z.string(),
})

export const presentation_frontmatter_schema = z.object({
  footer: presentation_id_schema.optional(),
  footer_options: options_schema.optional(),
  graphics: presentation_id_schema.optional(),
  graphics_options: options_schema.optional(),
})

export const home_frontmatter_schema = document_frontmatter_schema
  .extend(presentation_frontmatter_schema.shape)
  .strict()

export type PresentationFrontmatter = z.infer<
  typeof presentation_frontmatter_schema
>
export type HomeFrontmatter = z.infer<typeof home_frontmatter_schema>

export type ContentDocument<
  Frontmatter extends Record<string, unknown> = Record<string, unknown>,
> = MarkdownDocument<Record<string, unknown>, Frontmatter>
