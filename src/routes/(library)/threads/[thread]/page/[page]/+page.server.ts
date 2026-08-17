import { content_dependency } from '$lib/content/hmr'
import {
  archive_page_size,
  page_number,
  paginate,
} from '$lib/content/pagination'
import {
  load_thread_entries,
  load_thread_summaries,
} from '$lib/content/threads.server'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

// A thread gets this route only after it outgrows the first page.
export const prerender = 'auto'

export const entries: EntryGenerator = async () => {
  const threads = await load_thread_summaries()
  const entries = await Promise.all(
    threads.map(async (thread) => {
      const result = await load_thread_entries(thread.id)
      const page_count = Math.max(
        1,
        Math.ceil((result?.entries.length ?? 0) / archive_page_size),
      )
      return Array.from(
        { length: Math.max(0, page_count - 1) },
        (_, index) => ({ page: String(index + 2), thread: thread.id }),
      )
    }),
  )
  return entries.flat()
}

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('threads'))
  depends(content_dependency('essays'))
  const page = page_number(params.page)
  if (!page || page === 1) throw error(404, '未找到线索页')

  const result = await load_thread_entries(params.thread)
  if (!result) throw error(404, '未找到线索')
  const entries = paginate(result.entries, page)
  if (!entries) throw error(404, '未找到线索页')

  return {
    document: result.document,
    entries,
    thread: result.thread,
  }
}
