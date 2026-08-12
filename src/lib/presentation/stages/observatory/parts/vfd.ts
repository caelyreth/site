export const VFD_GLYPH_COLS = 5
export const VFD_GLYPH_ROWS = 7

export type VfdLayout = Readonly<{
  idle_inset: number
  idle_radius: number
  idle_size: number
  letter_pitch: number
  pixel_radius: number
  pixel_size: number
  word_y: number
}>

export type VfdPaths = Readonly<{
  idle: string
  matrix: string
  steady: string
}>

export const VFD_LAYOUT: VfdLayout = {
  idle_inset: 0.13,
  idle_radius: 0.1,
  idle_size: 0.58,
  letter_pitch: 6.5,
  pixel_radius: 0.13,
  pixel_size: 0.84,
  word_y: 3.88,
}

const BLANK = [
  '00000',
  '00000',
  '00000',
  '00000',
  '00000',
  '00000',
  '00000',
] as const

const VFD_GLYPHS: Readonly<Record<string, readonly string[]>> = {
  ' ': BLANK,
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '#': ['01010', '01010', '11111', '01010', '11111', '01010', '01010'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '(': ['00100', '01000', '10000', '10000', '10000', '01000', '00100'],
  ')': ['00100', '00010', '00001', '00001', '00001', '00010', '00100'],
  '*': ['00000', '10101', '01110', '00100', '01110', '10101', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  ',': ['00000', '00000', '00000', '00000', '00100', '00100', '01000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00100', '00100'],
  '/': ['00001', '00010', '00100', '01000', '10000', '00000', '00000'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['01110', '10001', '00001', '00110', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  ':': ['00000', '00100', '00100', '00000', '00100', '00100', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  'C': ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  'G': ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  'I': ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  'J': ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  'W': ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '_': ['00000', '00000', '00000', '00000', '00000', '00000', '11111'],
}

export function vfd_word_width(
  slots: number,
  layout: VfdLayout = VFD_LAYOUT,
) {
  return Math.max(slots - 1, 0) * layout.letter_pitch + VFD_GLYPH_COLS
}

export function fit_vfd_text(value: string, slots: number) {
  const glyphs = marks_of(value.toUpperCase()).map((mark) =>
    mark in VFD_GLYPHS ? mark : ' ',
  )
  if (glyphs.length > slots) return glyphs.slice(0, slots).join('')
  const pad = slots - glyphs.length
  const lead = Math.floor(pad / 2)
  return `${' '.repeat(lead)}${glyphs.join('')}${' '.repeat(pad - lead)}`
}

export function build_vfd_idle(
  slots: number,
  layout: VfdLayout = VFD_LAYOUT,
): string {
  let idle = ''
  for (let slot = 0; slot < slots; slot += 1) {
    idle += slot_idle(slot, layout)
  }
  return idle
}

export function build_vfd_lit(
  text: string,
  layout: VfdLayout = VFD_LAYOUT,
): Omit<VfdPaths, 'idle'> {
  const state = { matrix: '', steady: '' }
  const marks = marks_of(text)
  for (let slot = 0; slot < marks.length; slot += 1) {
    append_lit(state, VFD_GLYPHS[marks[slot]] ?? BLANK, slot, layout)
  }
  return state
}

function slot_idle(slot: number, layout: VfdLayout) {
  let idle = ''
  for (let row = 0; row < VFD_GLYPH_ROWS; row += 1) {
    for (let column = 0; column < VFD_GLYPH_COLS; column += 1) {
      idle += cell_path(
        slot * layout.letter_pitch + column + layout.idle_inset,
        layout.word_y + row + layout.idle_inset,
        layout.idle_size,
        layout.idle_radius,
      )
    }
  }
  return idle
}

function append_lit(
  state: { matrix: string; steady: string },
  glyph: readonly string[],
  slot: number,
  layout: VfdLayout,
) {
  for (let row = 0; row < glyph.length; row += 1) {
    const cells = glyph[row]
    for (let column = 0; column < cells.length; column += 1) {
      if (cells[column] !== '1') continue
      const path = cell_path(
        slot * layout.letter_pitch + column,
        layout.word_y + row,
        layout.pixel_size,
        layout.pixel_radius,
      )
      state.matrix += path
      if (is_steady_pixel(slot, row, column)) state.steady += path
    }
  }
}

function marks_of(value: string) {
  const marks: string[] = []
  for (let index = 0; index < value.length; index += 1) {
    marks.push(value[index] ?? ' ')
  }
  return marks
}

function is_steady_pixel(slot: number, row: number, column: number) {
  return (slot * 5 + row * 3 + column) % 7 === 0
}

function cell_path(x: number, y: number, size: number, radius: number) {
  const inner_size = size - radius * 2
  return [
    `M${x + radius} ${y}`,
    `h${inner_size}`,
    `q${radius} 0 ${radius} ${radius}`,
    `v${inner_size}`,
    `q0 ${radius} -${radius} ${radius}`,
    `h-${inner_size}`,
    `q-${radius} 0 -${radius} -${radius}`,
    `v-${inner_size}`,
    `q0 -${radius} ${radius} -${radius}`,
    'z',
  ].join('')
}
