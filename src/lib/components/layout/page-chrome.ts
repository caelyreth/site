import type { HeadingEntry } from '$lib/content/headings'
import { createContext } from 'svelte'

export interface PageChrome {
  content_active: boolean
  stage_progress: number
  toc: readonly HeadingEntry[]
}

export const [get_page_chrome, set_page_chrome] =
  createContext<PageChrome>()
