import type { MarkdownDocument } from 'comark'

export type ContentOptions = Record<string, unknown>

export type PageFrontmatter = Readonly<{
  description?: string
  footer?: string
  footer_options?: ContentOptions
  graphics?: string
  graphics_options?: ContentOptions
  title: string
}>

export const page_frontmatter_fields = [
  'description',
  'footer',
  'footer_options',
  'graphics',
  'graphics_options',
  'title',
] as const satisfies readonly (keyof PageFrontmatter)[]

export type ContentDocument = MarkdownDocument<
  Record<string, unknown>,
  PageFrontmatter
>
