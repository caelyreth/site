import type { PresentationSelection } from '$lib/presentation/contract'
import type { MarkdownDocument } from 'comark'

import type { PageFrontmatter } from './schema'

export type ContentDocument = MarkdownDocument<
  Record<string, unknown>,
  PageFrontmatter
>

export type ContentPage = Readonly<{
  document: ContentDocument
  presentation: PresentationSelection
}>
