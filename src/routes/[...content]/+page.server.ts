import {
  content_ids,
  has_content,
  load_content,
} from '$lib/content/repository.server'
/* oxlint-disable typescript/prefer-readonly-parameter-types -- SvelteKit owns the mutable load event. */
import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const prerender = 'auto'

export function entries() {
  return content_ids()
    .filter((content) => content !== 'home')
    .map((content) => ({ content }))
}

export const load: PageServerLoad = async ({ params }) => {
  if (!has_content(params.content)) {
    error(404, 'Content document not found.')
  }

  return {
    document: await load_content(params.content),
  }
}
