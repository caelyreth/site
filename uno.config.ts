import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
    // semantic tokens — values live in src/app.css (:root / .dark),
    // so dark mode needs no `dark:` utilities on semantic colors
    colors: {
      'paper': 'var(--color-paper)',
      'paper-2': 'var(--color-paper-2)',
      'ink': 'var(--color-ink)',
      'ink-2': 'var(--color-ink-2)',
      'muted': 'var(--color-muted)',
      'rule': 'var(--color-rule)',
      'accent': 'var(--color-accent)',
      'focus': 'var(--color-focus)',
    },
    font: {
      sans: 'var(--font-stack-sans)',
      serif: 'var(--font-stack-serif)',
    },
  },
  presets: [
    // base utilities + preflight reset (tailwind v4 compatible syntax)
    presetWind4({
      // class strategy: a manual toggle beats media-only for a personal site
      dark: 'class',
      preflights: {
        reset: true,
      },
    }),
    // primary authoring mode: atomic utilities as element attributes
    presetAttributify(),
    // iconify — remix icon collection, used via class: i-ri-sun-line
    presetIcons({
      collections: {
        ri: () =>
          import('@iconify-json/ri/icons.json').then((m) => m.default),
      },
    }),
    // web fonts — variable axes, one serif + one sans, nothing else
    presetWebFonts({
      provider: 'google',
      fonts: {
        serif: {
          name: 'Fraunces',
          variable: {
            opsz: { default: '14', min: '9', max: '144', step: '1' },
            wght: { default: '400', min: '300', max: '900', step: '100' },
          },
        },
        sans: {
          name: 'Space Grotesk',
          variable: {
            wght: { default: '400', min: '300', max: '700', step: '100' },
          },
        },
      },
    }),
  ],
  transformers: [
    // variant groups inside attributes: hover:(bg-x text-y)
    transformerVariantGroup(),
    // @apply / @screen / theme() inside <style> blocks
    transformerDirectives(),
  ],
})
