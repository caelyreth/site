import {
  defineConfig,
  presetWind4,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      dark: 'class',
      preflights: {
        reset: true,
      },
    }),
    presetIcons(),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
})
