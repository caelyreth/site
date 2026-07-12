import auto from '@sveltejs/adapter-auto'
import type { Config } from '@sveltejs/kit'

const config = {
  kit: {
    adapter: auto(),
  },
} satisfies Config

export default config
