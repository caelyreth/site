import { content_dependency } from '$lib/content/hmr'
import { paginate } from '$lib/content/pagination'
import {
  load_thread_entries,
  load_thread_summaries,
} from '$lib/content/threads.server'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () =>
  (await load_thread_summaries()).map(({ id }) => ({ thread: id }))

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('threads'))
  depends(content_dependency('essays'))
  const result = await load_thread_entries(params.thread)
  if (!result) throw error(404, '未找到线索')

  const entries = paginate(result.entries, 1)
  if (!entries) throw error(404, '未找到线索')

  return {
    document: result.document,
    entries,
    thread: result.thread,
  }
}
