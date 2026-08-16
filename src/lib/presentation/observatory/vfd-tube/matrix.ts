export const VFD_GLYPH_COLS = 5
export const VFD_GLYPH_ROWS = 7

export interface VfdLayout {
  idle_inset: number
  idle_radius: number
  idle_size: number
  letter_pitch: number
  line_pitch: number
  pixel_radius: number
  pixel_size: number
  line_y: number
}

export const VFD_LAYOUT: VfdLayout = {
  idle_inset: 0.13,
  idle_radius: 0.1,
  idle_size: 0.58,
  letter_pitch: 6.5,
  line_pitch: 8,
  pixel_radius: 0.13,
  pixel_size: 0.84,
  line_y: 3.88,
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

const PHOSPHOR_LEVELS = [
  'full',
  'normal',
  'normal',
  'dim',
  'normal',
  'normal',
  'normal',
  'normal',
  'full',
  'normal',
  'dim',
  'normal',
] as const

const cell_layouts = new Map<string, VfdCell[]>()

const VFD_GLYPHS: Record<string, readonly string[]> = {
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
  const glyphs = marks_of(value).map((mark) =>
    mark in VFD_GLYPHS ? mark : ' ',
  )
  if (glyphs.length > slots) return glyphs.slice(0, slots).join('')
  const pad = slots - glyphs.length
  const lead = Math.floor(pad / 2)
  return `${' '.repeat(lead)}${glyphs.join('')}${' '.repeat(pad - lead)}`
}

export interface VfdCell {
  d: string
  delay: number
  key: string
  opacity: number
}

export function get_vfd_cell_layout(
  line_count: number,
  slots: number,
  layout: VfdLayout = VFD_LAYOUT,
): VfdCell[] {
  const cache_key = [
    line_count,
    slots,
    layout.letter_pitch,
    layout.line_pitch,
    layout.pixel_radius,
    layout.pixel_size,
    layout.line_y,
  ].join(':')
  const cached_layout = cell_layouts.get(cache_key)
  if (cached_layout) return cached_layout

  const cells: VfdCell[] = []

  for (let line = 0; line < line_count; line += 1) {
    for (let slot = 0; slot < slots; slot += 1) {
      cells.push(...build_vfd_glyph_layout(line, slot, layout))
    }
  }

  cell_layouts.set(cache_key, cells)
  return cells
}

export function build_vfd_lit_mask(
  lines: readonly string[],
  slots: number,
): boolean[] {
  const cells: boolean[] = []

  for (let line = 0; line < lines.length; line += 1) {
    append_vfd_line_mask(cells, lines[line] ?? '', slots)
  }

  return cells
}

function append_vfd_line_mask(
  cells: boolean[],
  text: string,
  slots: number,
) {
  const marks = marks_of(text)
  for (let slot = 0; slot < slots; slot += 1) {
    append_vfd_glyph_mask(cells, VFD_GLYPHS[marks[slot] ?? ' '] ?? BLANK)
  }
}

function append_vfd_glyph_mask(cells: boolean[], glyph: readonly string[]) {
  for (const row of glyph) {
    for (const mark of row) cells.push(mark === '1')
  }
}

function build_vfd_glyph_layout(
  line: number,
  slot: number,
  layout: VfdLayout,
) {
  const cells: VfdCell[] = []

  for (let row = 0; row < VFD_GLYPH_ROWS; row += 1) {
    cells.push(...build_vfd_row_layout(line, slot, row, layout))
  }

  return cells
}

function build_vfd_row_layout(
  line: number,
  slot: number,
  row: number,
  layout: VfdLayout,
) {
  const cells: VfdCell[] = []

  for (let column = 0; column < VFD_GLYPH_COLS; column += 1) {
    const level = phosphor_level(slot, line, row, column)
    cells.push({
      d: cell_path(
        slot * layout.letter_pitch + column,
        layout.line_y + line * layout.line_pitch + row,
        layout.pixel_size,
        layout.pixel_radius,
      ),
      delay: cell_light_delay(slot, line, row, column),
      key: `${line}:${slot}:${row}:${column}`,
      opacity: phosphor_opacity(level),
    })
  }

  return cells
}

export function build_vfd_idle(
  slots: number,
  lines = 1,
  layout: VfdLayout = VFD_LAYOUT,
): { dim: string; matrix: string } {
  const idle = { dim: '', matrix: '' }
  for (let line = 0; line < lines; line += 1) {
    for (let slot = 0; slot < slots; slot += 1) {
      const next = slot_idle(slot, line, layout)
      idle.matrix += next.matrix
      idle.dim += next.dim
    }
  }
  return idle
}

function slot_idle(slot: number, line: number, layout: VfdLayout) {
  const idle = { dim: '', matrix: '' }
  for (let row = 0; row < VFD_GLYPH_ROWS; row += 1) {
    for (let column = 0; column < VFD_GLYPH_COLS; column += 1) {
      const cell = cell_path(
        slot * layout.letter_pitch + column + layout.idle_inset,
        layout.line_y + line * layout.line_pitch + row + layout.idle_inset,
        layout.idle_size,
        layout.idle_radius,
      )
      if (is_dim_idle_cell(slot, line, row, column)) idle.dim += cell
      else idle.matrix += cell
    }
  }
  return idle
}

function marks_of(value: string) {
  const marks: string[] = []
  for (let index = 0; index < value.length; index += 1) {
    marks.push(value[index] ?? ' ')
  }
  return marks
}

function is_dim_idle_cell(
  slot: number,
  line: number,
  row: number,
  column: number,
) {
  return (slot * 17 + line * 13 + row * 7 + column * 3) % 11 === 0
}

function phosphor_level(
  slot: number,
  line: number,
  row: number,
  column: number,
) {
  const pattern = (slot * 19 + line * 17 + row * 11 + column * 5) % 13
  return PHOSPHOR_LEVELS[pattern] ?? 'normal'
}

function phosphor_opacity(level: string) {
  if (level === 'full') return 1
  if (level === 'dim') return 0.6
  return 0.8
}

function cell_light_delay(
  slot: number,
  line: number,
  row: number,
  column: number,
) {
  return ((slot * 17 + line * 13 + row * 7 + column * 3) % 8) * 12
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
