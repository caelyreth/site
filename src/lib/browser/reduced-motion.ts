import { createSubscriber } from 'svelte/reactivity'

const reduced_motion_query = '(prefers-reduced-motion: reduce)'

export type ReducedMotionMediaQuery = Pick<
  MediaQueryList,
  'addEventListener' | 'matches' | 'removeEventListener'
>

export interface ReducedMotionPreference {
  current: boolean
  subscribe: (listener: (matches: boolean) => void) => () => void
}

function browser_media_query() {
  if (typeof window === 'undefined') return undefined
  return window.matchMedia(reduced_motion_query)
}

export function create_reduced_motion_preference(
  media_query: ReducedMotionMediaQuery | undefined = browser_media_query(),
): ReducedMotionPreference {
  const subscribe_reactively = createSubscriber((update) => {
    if (!media_query) return
    media_query.addEventListener('change', update)
    return () => {
      media_query.removeEventListener('change', update)
    }
  })

  return {
    get current() {
      subscribe_reactively()
      return media_query?.matches ?? false
    },
    subscribe(listener) {
      listener(media_query?.matches ?? false)
      if (!media_query) return () => undefined
      const update = () => {
        listener(media_query.matches)
      }
      media_query.addEventListener('change', update)
      return () => {
        media_query.removeEventListener('change', update)
      }
    },
  }
}

export const reduced_motion = create_reduced_motion_preference()
