import { entry_links } from '$lib/content/entries.server'
import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import { site_config_schema } from '$lib/content/schema'
import { site_url } from '$lib/navigation/site-url.server'
import { create_footer_qr } from '$lib/presentation/relay-footer/qr.server'

import type { LayoutServerLoad } from './$types'

function footer_qr_target(url: URL) {
  return site_url(url.pathname, url)
}

export const load: LayoutServerLoad = async ({ depends, url }) => {
  depends(content_dependency('site'))
  const [site, footer_entries, footer_qr] = await Promise.all([
    read_content('site', site_config_schema),
    entry_links(),
    create_footer_qr(footer_qr_target(url)),
  ])
  if (!site) throw new Error('Missing content/site.md.')

  return { footer_entries, footer_qr, site: site.document.frontmatter }
}
