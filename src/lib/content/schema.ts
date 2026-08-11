import { z } from 'zod'

export const presentation_id_schema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase kebab-case')

const options_schema = z.record(z.string(), z.unknown())

export const page_frontmatter_schema = z
  .object({
    description: z.string().optional(),
    footer: presentation_id_schema.optional(),
    footer_options: options_schema.optional(),
    graphics: presentation_id_schema.optional(),
    graphics_options: options_schema.optional(),
    title: z.string(),
  })
  .strict()

export type PageFrontmatter = z.infer<typeof page_frontmatter_schema>
