import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare namespace svelteHTML {
  // extended for unocss attributify preset
  type HTMLAttributes = AttributifyAttributes
}
