import { content_dependency } from '$lib/content/hmr'
import { paginate } from '$lib/content/pagination'
import { load_thread_summaries } from '$lib/content/threads.server'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('threads'))
  depends(content_dependency('essays'))
  const threads = paginate(await load_thread_summaries(), 1)
  if (!threads) throw new Error('无法创建第一页线索。')
  return { threads }
}
