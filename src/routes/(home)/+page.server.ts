import { extract_headings } from '$lib/content/headings'
import { home_content_dependency } from '$lib/content/hmr'
import { load_home_document } from '$lib/content/home.server'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(home_content_dependency)
  const document = await load_home_document()

  return {
    document,
    toc: extract_headings(document.nodes),
  }
}
