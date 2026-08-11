/* oxlint-disable typescript/prefer-readonly-parameter-types -- Vite hook parameters are mutable by contract. */
import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
import { defineConfig, normalizePath, type Plugin } from 'vite'

function reload_content(): Plugin {
  let content_root = ''

  return {
    name: 'reload-content',
    apply: 'serve',
    configResolved(config) {
      content_root = normalizePath(`${config.root}/content/`)
    },
    hotUpdate(options) {
      const file = normalizePath(options.file)
      if (!file.startsWith(content_root) || !file.endsWith('.md')) return

      // The SSR graph refreshes the raw source; the client needs a new load result.
      if (this.environment.name !== 'client') return
      this.environment.hot.send({ type: 'full-reload', path: '*' })
      return []
    },
  }
}

export default defineConfig({
  plugins: [reload_content(), unocss(), sveltekit()],
})
