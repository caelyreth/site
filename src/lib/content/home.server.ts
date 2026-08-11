import { select_presentation } from '$lib/presentation/registry.server'

import { parse_content } from './parse.server'
import { home_frontmatter_schema } from './schema'
import type { HomePage } from './types'

let home_page: Promise<HomePage> | undefined

async function create_home_page(): Promise<HomePage> {
  const document = await parse_content('home', home_frontmatter_schema)

  return {
    document,
    presentation: select_presentation(document.frontmatter),
  }
}

export function load_home_page(): Promise<HomePage> {
  home_page ??= create_home_page()

  return home_page
}
