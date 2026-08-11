import type { PresentationSelection } from '$lib/presentation/contract'
import { select_presentation } from '$lib/presentation/registry.server'

import { parse_content } from './parse.server'
import {
  home_frontmatter_schema,
  type ContentDocument,
  type HomeFrontmatter,
} from './schema'

type HomePage = Readonly<{
  document: ContentDocument<HomeFrontmatter>
  presentation: PresentationSelection
}>

export async function load_home_page(): Promise<HomePage> {
  const document = await parse_content('home', home_frontmatter_schema)

  return {
    document,
    presentation: select_presentation(document.frontmatter),
  }
}
