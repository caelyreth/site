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

import media from './media'
import { eclat } from './rangi-theme'

export const parse_markdown = createMarkdownParser({
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

export function parse_frontmatter<
  Frontmatter extends Record<string, unknown>,
>(
  value: unknown,
  source_path: string,
  schema: v.GenericSchema<unknown, Frontmatter>,
) {
  const result = v.safeParse(schema, value)
  if (result.success) return result.output
  throw new Error(`${source_path}: ${v.summarize(result.issues)}`)
}
