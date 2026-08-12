import { invalidate } from '$app/navigation'

import {
  content_dependency,
  content_update_event,
  type ContentUpdate,
} from './hmr'

export function listen_for_content_updates() {
  const { hot } = import.meta
  if (!hot) return

  function invalidate_content({ content_id }: ContentUpdate) {
    void invalidate(content_dependency(content_id))
  }

  hot.on(content_update_event, invalidate_content)
  return () => {
    hot.off(content_update_event, invalidate_content)
  }
}
