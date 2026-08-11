import type { PresentationSelection } from '$lib/presentation/contract'
import type { MarkdownDocument } from 'comark'

import type { HomeFrontmatter } from './schema'

export type ContentDocument<
  Frontmatter extends Record<string, unknown> = Record<string, unknown>,
> = MarkdownDocument<Record<string, unknown>, Frontmatter>

export type HomeDocument = ContentDocument<HomeFrontmatter>

export type HomePage = Readonly<{
  document: HomeDocument
  presentation: PresentationSelection
}>
