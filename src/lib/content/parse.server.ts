import media from '$lib/components/markdown/media'
import { eclat } from '$lib/components/markdown/rangi-theme'
import { ensure_heading_ids } from '$lib/content/headings'
import inline_components from '$lib/content/inline-components'
import markdown_normalization from '$lib/content/markdown-normalization'
import { createMarkdownParser } from 'comark'
import toml from 'comark-toml'
import alert from 'comark/plugins/alert'
import attributes from 'comark/plugins/attributes'
import components from 'comark/plugins/components'
import footnotes from 'comark/plugins/footnotes'
import headings from 'comark/plugins/headings'
import math from 'comark/plugins/math'
import punctuation from 'comark/plugins/punctuation'
import rangi from 'comark/plugins/rangi'
import security from 'comark/plugins/security'
import task_list from 'comark/plugins/task-list'

const markdown_parser = createMarkdownParser({
  registerDefaultPlugins: false,
  plugins: [
    toml(),
    alert(),
    task_list(),
    components(),
    inline_components(),
    markdown_normalization(),
    attributes(),
    footnotes({ label: '脚注' }),
    headings(),
    math(),
    punctuation(),
    security({ allowDataImages: false }),
    media(),
    rangi({ preStyles: true, theme: eclat }),
  ],
  headingIds: false,
})

export async function parse_markdown(source: string) {
  const document = await markdown_parser(source)
  ensure_heading_ids(document.nodes)
  return document
}
