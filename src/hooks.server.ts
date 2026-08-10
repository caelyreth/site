import {
  observatory_scroll_restoration,
  scroll_progress_bootstrap,
} from '$lib/scroll-restoration'
import type { Handle } from '@sveltejs/kit'

function scroll_progress_options(route_id: string | null) {
  if (route_id === '/') return observatory_scroll_restoration
}

type HandleInput = {
  readonly event: Parameters<Handle>[0]['event']
  readonly resolve: Parameters<Handle>[0]['resolve']
}
type PageChunk = Readonly<{ html: string; done: boolean }>

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- SvelteKit owns the mutable request event.
export const handle = (async (input: HandleInput) => {
  const { event, resolve } = input
  const options = scroll_progress_options(event.route.id)
  if (!options) return resolve(event)

  const bootstrap = scroll_progress_bootstrap(options)
  return resolve(event, {
    transformPageChunk: ({ html }: PageChunk) =>
      html.replace('<head>', `<head>${bootstrap}`),
  })
}) satisfies Handle
