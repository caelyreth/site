import { defineConfig, presetAttributify, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify(),
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
  ],
})
