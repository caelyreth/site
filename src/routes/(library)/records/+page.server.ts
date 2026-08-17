import { content_dependency } from '$lib/content/hmr'
import { paginate } from '$lib/content/pagination'
import { load_record_summaries } from '$lib/content/records.server'

import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = async ({ depends }) => {
  depends(content_dependency('records'))
  const summaries = await load_record_summaries()
  const records = paginate(summaries, 1)
  if (!records) throw new Error('无法创建第一页记录。')
  return { records }
}
