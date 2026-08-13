export const SIGNAL_PALETTES = {
  light: [0x9e4d44, 0x8b7024, 0x39795c, 0x2b7685, 0x4c6eaa, 0x7b538f],
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
  light: ['#9e4d44', '#8b7024', '#39795c', '#2b7685', '#4c6eaa', '#7b538f'],
  dark: [
    'oklch(77% 0.105 37)',
    'oklch(80% 0.095 95)',
    'oklch(75% 0.085 150)',
    'oklch(76% 0.08 205)',
    'oklch(76% 0.09 252)',
    'oklch(76% 0.085 305)',
  ],
} as const
