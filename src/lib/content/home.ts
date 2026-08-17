import type { MarkdownDocument } from 'comark'

import type { SharedFrontmatter } from './frontmatter'

export type HomeFrontmatter = SharedFrontmatter

export type HomeDocument = MarkdownDocument<
  Record<string, unknown>,
  HomeFrontmatter
>
