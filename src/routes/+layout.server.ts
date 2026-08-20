import { env } from '$env/dynamic/public'
import { entry_links } from '$lib/content/entries.server'
import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import { site_config_schema } from '$lib/content/schema'
import { create_footer_qr } from '$lib/presentation/relay-footer/qr.server'

import type { LayoutServerLoad } from './$types'

function footer_qr_target(url: URL) {
  const configured_origin = env.PUBLIC_SITE_ORIGIN?.trim()
  const origin = configured_origin ?? url.origin

  try {
    return new URL(url.pathname, origin).toString()
  } catch {
    return new URL(url.pathname, url.origin).toString()
  }
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
