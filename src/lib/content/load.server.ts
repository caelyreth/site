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
import toc from 'comark/plugins/toc'
import * as v from 'valibot'

import media from './media'
import { eclat_nocturne } from './rangi-theme'
import type { ContentDocument } from './schema'

const content_sources = import.meta.glob<string>(
  '../../../content/**/*.md',
  {
    import: 'default',
    query: '?raw',
  },
)

const parse_markdown = createMarkdownParser({
  registerDefaultPlugins: false,
  plugins: [
    toml(),
    alert(),
    task_list(),
    components(),
    attributes(),
    footnotes({ hr: false }),
    headings(),
    toc({ depth: 3, searchDepth: 3 }),
    punctuation(),
    security({ allowDataImages: false }),
    media(),
    rangi({ theme: eclat_nocturne }),
  ],
})

function source_for(content_id: string) {
  const source_path = `content/${content_id}.md`
  const load_source = content_sources[`../../../${source_path}`]
  if (!load_source) {
    throw new Error(`Unknown content document "${source_path}".`)
  }

  return { source_path, load_source }
}

function parse_frontmatter<Frontmatter extends Record<string, unknown>>(
  value: unknown,
  source_path: string,
  schema: v.GenericSchema<unknown, Frontmatter>,
) {
  const result = v.safeParse(schema, value)
  if (result.success) return result.output
  throw new Error(`${source_path}: ${v.summarize(result.issues)}`)
}

export async function load_content<
  Frontmatter extends Record<string, unknown>,
>(
  content_id: string,
  frontmatter_schema: v.GenericSchema<unknown, Frontmatter>,
): Promise<ContentDocument<Frontmatter>> {
  const { source_path, load_source } = source_for(content_id)
  const document = await parse_markdown(await load_source())

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      frontmatter_schema,
    ),
  }
}
