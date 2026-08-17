import { load_essay_summaries } from '$lib/content/essays.server'
import { content_dependency } from '$lib/content/hmr'
import {
  archive_page_size,
  page_number,
  paginate,
} from '$lib/content/pagination'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () => {
  const essays = await load_essay_summaries()
  const page_count = Math.max(
    1,
    Math.ceil(essays.length / archive_page_size),
  )
  return Array.from(
    { length: Math.max(0, page_count - 1) },
    (_, index) => ({
      page: String(index + 2),
    }),
  )
}

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('essays'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到随笔页')

  const essays = paginate(await load_essay_summaries(), page)
  if (!essays) throw error(404, '未找到随笔页')
  return { essays }
}
