import { extract_headings } from '$lib/content/headings'
import { content_dependency } from '$lib/content/hmr'
import { read_content } from '$lib/content/query.server'
import { friends_frontmatter_schema } from '$lib/content/schema'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('friends'))
  const friends = await read_content('friends', friends_frontmatter_schema)
  if (!friends) throw new Error('Missing content/friends.md.')

  return {
    document: friends.document,
    friends: friends.document.frontmatter.friends,
    toc: extract_headings(friends.document.nodes),
  }
}
