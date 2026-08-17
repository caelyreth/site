import { content_dependency } from '$lib/content/hmr'
import {
  archive_page_size,
  page_number,
  paginate,
} from '$lib/content/pagination'
import { load_thread_summaries } from '$lib/content/threads.server'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () => {
  const threads = await load_thread_summaries()
  const page_count = Math.max(
    1,
    Math.ceil(threads.length / archive_page_size),
  )
  return Array.from(
    { length: Math.max(0, page_count - 1) },
    (_, index) => ({
      page: String(index + 2),
    }),
  )
}

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('threads'))
  depends(content_dependency('essays'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, 'Thread page not found')

  const threads = paginate(await load_thread_summaries(), page)
  if (!threads) throw error(404, 'Thread page not found')
  return { threads }
}
