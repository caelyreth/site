import { sveltekit } from '@sveltejs/kit/vite'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'

import { content_hmr } from './vite/plugins/content-hmr'

export default defineConfig({
  plugins: [content_hmr(), unocss(), sveltekit()],
})
