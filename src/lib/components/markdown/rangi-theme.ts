import type { RangiTheme, RangiThemePair } from 'comark/plugins/rangi'

type ThemeMode = 'dark' | 'light'

function eclat_theme(name: string, scheme: ThemeMode): RangiTheme {
  const color = (tone: string) => `var(--color-eclat-${tone}-${scheme})`

  return {
    name,
    scheme,
    bg: color('surface'),
    fg: color('fg'),
    numbers: color('muted'),
    tokens: {
      kwd: color('keyword'),
      section: color('section'),
      class: color('type'),
      cmnt: color('muted'),
      bracket: color('bracket'),
      num: color('type'),
      bool: color('boolean'),
      str: color('string'),
      esc: color('bracket'),
      insert: color('insert'),
      deleted: color('keyword'),
      err: color('keyword'),
      var: color('fg'),
      type: color('type'),
      func: color('function'),
      oper: color('operator'),
    },
  }
}

// SSR emits both palettes; the app's theme class selects the active one.
export const eclat: RangiThemePair = {
  light: eclat_theme('eclat-dawn', 'light'),
  dark: eclat_theme('eclat-nocturne', 'dark'),
}
