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

      // Raw Markdown is imported only by SvelteKit's SSR environment.
      if (this.environment.name !== 'ssr') return

      const update: ContentUpdate = {
        content_id: file.slice(content_root.length, -'.md'.length),
      }

      options.server.ws.send({
        data: update,
        event: content_update_event,
        type: 'custom',
      })

      // Leave Vite to invalidate the server module graph normally.
    },
  }
}
