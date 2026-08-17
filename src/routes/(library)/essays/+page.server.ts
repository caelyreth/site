import { load_essay_summaries } from '$lib/content/essays.server'
import { content_dependency } from '$lib/content/hmr'
import { paginate } from '$lib/content/pagination'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('essays'))
  const essays = paginate(await load_essay_summaries(), 1)
  if (!essays) throw new Error('无法创建第一页随笔。')
  return { essays }
}
