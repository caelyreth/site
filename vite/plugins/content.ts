import { normalizePath, type Plugin } from 'vite'

import { content_update_event } from '../../src/lib/content/hmr'

export function content_updates(): Plugin {
  let home_source = ''

  return {
    name: 'content-updates',
    apply: 'serve',
    configResolved(config) {
      home_source = normalizePath(`${config.root}/content/home.md`)
    },
    hotUpdate(options) {
      const file = normalizePath(options.file)
      if (file !== home_source) return

      // Raw Markdown is imported only by SvelteKit's SSR environment.
      if (this.environment.name !== 'ssr') return

      options.server.ws.send({
        data: null,
        event: content_update_event,
        type: 'custom',
      })

      // Leave Vite to invalidate the server module graph normally.
    },
  }
}
