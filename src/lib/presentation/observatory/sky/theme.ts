export interface SkyFieldTheme {
  ground_alpha: number
  ground_ink: number
  ground_light: number
  trail_alpha: number
  trail_inks: number[]
}

const sky_field_themes = {
  dark: {
    ground_alpha: 1,
    ground_ink: 0x242424,
    ground_light: 0x56666a,
    trail_alpha: 1,
    trail_inks: [
      0xe0a39d, 0xd9c77e, 0x9fc9a4, 0x94c4ce, 0xa8b9e6, 0xc0a3cd,
    ],
  },
  light: {
    ground_alpha: 0.52,
    ground_ink: 0x9a9a98,
    ground_light: 0x889da3,
    trail_alpha: 0.88,
    trail_inks: [
      0xa94e47, 0x8f7130, 0x397b60, 0x2f7588, 0x4d6fa6, 0x7d588f,
    ],
  },
} satisfies Record<'dark' | 'light', SkyFieldTheme>

export function sky_field_theme(dark: boolean) {
  return dark ? sky_field_themes.dark : sky_field_themes.light
}
