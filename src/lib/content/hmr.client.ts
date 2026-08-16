import { invalidate } from '$app/navigation'

import { content_update_event, home_content_dependency } from './hmr'

export function listen_for_content_updates() {
  if (!import.meta.hot) return

  function invalidate_home_content() {
    void invalidate(home_content_dependency)
  }

  import.meta.hot.on(content_update_event, invalidate_home_content)
  return () => {
    import.meta.hot?.off(content_update_event, invalidate_home_content)
  }
}
