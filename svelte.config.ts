import auto from '@sveltejs/adapter-auto'
import type { Config } from '@sveltejs/kit'

const config = {
  kit: {
    adapter: auto(),
    prerender: {
      handleUnseenRoutes({ routes }) {
        const library_templates = new Set([
          '/(library)/articles/[slug]',
          '/(library)/essays/[slug]',
          '/(library)/maps/[slug]',
          '/(library)/threads/[thread]',
        ])
        const unexpected_routes = routes.filter(
          (route) => !library_templates.has(route),
        )
        if (unexpected_routes.length > 0) {
          throw new Error(
            `Unexpected unseen prerender routes: ${unexpected_routes.join(', ')}`,
          )
        }
      },
    },
  },
} satisfies Config

export default config
