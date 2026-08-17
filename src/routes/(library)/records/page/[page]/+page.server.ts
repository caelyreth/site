import { content_dependency } from '$lib/content/hmr'
import {
  archive_page_size,
  page_number,
  paginate,
} from '$lib/content/pagination'
import { load_record_summaries } from '$lib/content/records.server'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () => {
  const records = await load_record_summaries()
  const page_count = Math.max(
    1,
    Math.ceil(records.length / archive_page_size),
  )
  return Array.from(
    { length: Math.max(0, page_count - 1) },
    (_, index) => ({
      page: String(index + 2),
    }),
  )
}

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('records'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到记录页')

  const summaries = await load_record_summaries()
  const records = paginate(summaries, page)
  if (!records) throw error(404, '未找到记录页')
  return { records }
}
