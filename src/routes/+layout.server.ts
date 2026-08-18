import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import { site_config_schema } from '$lib/content/schema'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ depends }) => {
  depends(content_dependency('site'))
  const site = await read_content('site', site_config_schema)
  if (!site) throw new Error('Missing content/site.md.')

  return { site: site.document.frontmatter }
}
