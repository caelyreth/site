export const SIGNAL_PALETTES = {
  light: [0x765d56, 0x756c4f, 0x596f5d, 0x4f6f75, 0x596a87, 0x6b607b],
  dark: [0xc2a097, 0xbdb187, 0x9caf9b, 0x8fb2b5, 0x96a8c4, 0xab9db8],
} as const

export const SIGNAL_STATUS_LABELS = [
  'Origin lock',
  'Zenith bearing',
  'Horizon relay',
  'Tidal vector',
  'Orbital trace',
  'Archive echo',
] as const

// These retain the WebGL palette hues while giving the status readout clearer contrast.
export const TRANSMISSION_COLORS = {
  light: [
    'oklch(51% 0.1 37)',
    'oklch(52% 0.09 95)',
    'oklch(50% 0.08 150)',
    'oklch(50% 0.075 205)',
    'oklch(50% 0.085 252)',
    'oklch(51% 0.08 305)',
  ],
  dark: [
    'oklch(77% 0.105 37)',
    'oklch(80% 0.095 95)',
    'oklch(75% 0.085 150)',
    'oklch(76% 0.08 205)',
    'oklch(76% 0.09 252)',
    'oklch(76% 0.085 305)',
  ],
} as const
