import { createMarkdownParser } from 'comark'
import toml from 'comark-toml'
import alert from 'comark/plugins/alert'
import attributes from 'comark/plugins/attributes'
import components from 'comark/plugins/components'
import footnotes from 'comark/plugins/footnotes'
import headings from 'comark/plugins/headings'
import punctuation from 'comark/plugins/punctuation'
import rangi from 'comark/plugins/rangi'
import security from 'comark/plugins/security'
import task_list from 'comark/plugins/task-list'
import * as v from 'valibot'

import home_source from '../../../content/home.md?raw'
import type { HomeDocument, HomeFrontmatter } from './home'
import media from './media'
import { eclat } from './rangi-theme'

const home_frontmatter_schema = v.strictObject({
  description: v.optional(v.string()),
  title: v.string(),
})

const parse_home_markdown = createMarkdownParser({
  registerDefaultPlugins: false,
  plugins: [
    toml(),
    alert(),
    task_list(),
    components(),
    attributes(),
    footnotes(),
    headings(),
    punctuation(),
    security({ allowDataImages: false }),
    media(),
    rangi({ preStyles: true, theme: eclat }),
  ],
})

export async function load_home_document(): Promise<HomeDocument> {
  const document = await parse_home_markdown(home_source)
  const frontmatter = v.safeParse(
    home_frontmatter_schema,
    document.frontmatter,
  )

  if (!frontmatter.success) {
    throw new Error(`content/home.md: ${v.summarize(frontmatter.issues)}`)
  }

  return {
    ...document,
    frontmatter: frontmatter.output as HomeFrontmatter,
  }
}
