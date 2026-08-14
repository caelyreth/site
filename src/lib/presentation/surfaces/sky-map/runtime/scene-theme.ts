export interface SkyMapSceneTheme {
  backdrop_alpha: number
  backdrop_ink: number
  backdrop_wash_alpha: number
  backdrop_wash_ink: number
  exposure_alpha: number
  exposure_ink: number
  ink: number
  signal_colors: string[]
  signal_inks: number[]
  star_alpha: number
  survey_mode: number
}

const sky_map_scene_themes = {
  dark: {
    backdrop_alpha: 2,
    backdrop_ink: 0xe6e6e6,
    backdrop_wash_alpha: 0,
    backdrop_wash_ink: 0x000000,
    exposure_alpha: 0.1,
    exposure_ink: 0x4a4b4c,
    ink: 0xe6e6e6,
    signal_colors: [
      'oklch(77% 0.105 37)',
      'oklch(80% 0.095 95)',
      'oklch(75% 0.085 150)',
      'oklch(76% 0.08 205)',
      'oklch(76% 0.09 252)',
      'oklch(76% 0.085 305)',
    ],
    signal_inks: [
      0xc2a097, 0xbdb187, 0x9caf9b, 0x8fb2b5, 0x96a8c4, 0xab9db8,
    ],
    star_alpha: 0.18,
    survey_mode: 0,
  },
  light: {
    backdrop_alpha: 0.88,
    backdrop_ink: 0x315b70,
    backdrop_wash_alpha: 0.1,
    backdrop_wash_ink: 0xefefef,
    exposure_alpha: 0.075,
    exposure_ink: 0xd2d2d0,
    ink: 0x183d53,
    signal_colors: [
      '#974942',
      '#876d2d',
      '#39755d',
      '#2b6f80',
      '#49699d',
      '#755386',
    ],
    signal_inks: [
      0x974942, 0x876d2d, 0x39755d, 0x2b6f80, 0x49699d, 0x755386,
    ],
    star_alpha: 0.38,
    survey_mode: 0.55,
  },
} satisfies Record<'dark' | 'light', SkyMapSceneTheme>

export function sky_map_scene_theme(dark: boolean) {
  return dark ? sky_map_scene_themes.dark : sky_map_scene_themes.light
}
