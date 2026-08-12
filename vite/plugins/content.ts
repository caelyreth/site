import { normalizePath, type Plugin } from 'vite'

import {
  content_update_event,
  type ContentUpdate,
} from '../../src/lib/content/hmr'

export function content_updates(): Plugin {
  let content_root = ''

  return {
    name: 'content-updates',
    apply: 'serve',
    configResolved(config) {
      content_root = normalizePath(`${config.root}/content/`)
    },
    hotUpdate(options) {
      const file = normalizePath(options.file)
      if (!file.startsWith(content_root) || !file.endsWith('.md')) return

      const update: ContentUpdate = {
        content_id: file.slice(content_root.length, -'.md'.length),
      }

      // The SSR graph refreshes the raw source; the client invalidates its load.
      if (this.environment.name !== 'client') return
      this.environment.hot.send(content_update_event, update)
      return []
    },
  }
}
