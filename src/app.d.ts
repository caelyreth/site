import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare namespace svelteHTML {
  // extended for unocss attributify preset
  // suspect to have issue in svelte lsp upstream
  interface HTMLAttributes extends AttributifyAttributes {}
}
