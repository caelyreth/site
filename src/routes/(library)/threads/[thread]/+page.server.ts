import { content_dependency } from '$lib/content/hmr'
import {
  load_thread_collection,
  load_thread_index,
} from '$lib/content/load.server'
import { entry_frontmatter_schema } from '$lib/content/schema'
import { error } from '@sveltejs/kit'

import type { EntryGenerator, PageServerLoad } from './$types'

export const prerender = true

export const entries: EntryGenerator = async () =>
  (await load_thread_index(entry_frontmatter_schema)).map(({ id }) => ({
    thread: id,
  }))

export const load: PageServerLoad = async ({ depends, params }) => {
  depends(content_dependency('threads'))
  const entries = await load_thread_collection(
    params.thread,
    entry_frontmatter_schema,
  )
  if (entries.length === 0) throw error(404, 'Thread not found')

  return { entries, thread: params.thread }
}
