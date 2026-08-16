import type { MarkdownDocument } from 'comark'

export interface HomeFrontmatter {
  description?: string
  title: string
}

export type HomeDocument = MarkdownDocument<
  Record<string, unknown>,
  HomeFrontmatter
>
