import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'

import { content_updates } from './vite/plugins/content'

export default defineConfig({
  plugins: [content_updates(), unocss(), sveltekit()],
})
