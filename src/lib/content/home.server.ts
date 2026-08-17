import * as v from 'valibot'

import home_source from '../../../content/home.md?raw'
import type { HomeDocument, HomeFrontmatter } from './home'
import { parse_frontmatter, parse_markdown } from './markdown.server'

const home_frontmatter_schema = v.strictObject({
  description: v.optional(v.string()),
  title: v.string(),
})

export async function load_home_document(): Promise<HomeDocument> {
  const document = await parse_markdown(home_source)
  const frontmatter = parse_frontmatter(
    document.frontmatter,
    'content/home.md',
    home_frontmatter_schema,
  )

  return {
    ...document,
    frontmatter: frontmatter as HomeFrontmatter,
  }
}
