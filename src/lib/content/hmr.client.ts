import { invalidate } from '$app/navigation'

import {
  content_dependency,
  content_update_event,
  type ContentUpdate,
} from './hmr'

export function listen_for_content_updates() {
  if (!import.meta.hot) return

  function invalidate_content({ content_id }: ContentUpdate) {
    void invalidate(content_dependency(content_id))

    const [collection] = content_id.split('/', 1)
    if (collection === 'essays' || collection === 'threads') {
      void invalidate(content_dependency('essays'))
      void invalidate(content_dependency('threads'))
    }
  }

  import.meta.hot.on(content_update_event, invalidate_content)
  return () => {
    import.meta.hot?.off(content_update_event, invalidate_content)
  }
}
