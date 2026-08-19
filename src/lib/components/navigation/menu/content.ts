interface Position {
  bottom?: string
  left?: string
  right?: string
  top?: string
}

interface EnteringLayout {
  enter_delay: string
  enter_x: string
  enter_y: string
}

type MenuPreviewLayout = Position & EnteringLayout & { rotation: string }

type DriftLayout = Position &
  Partial<EnteringLayout> & {
    blur: string
    rotation: string
    tone: number
  }

export const menu_preview_layouts: readonly MenuPreviewLayout[] = [
  {
    enter_delay: '80ms',
    enter_x: '-2rem',
    enter_y: '1rem',
    left: '27%',
    rotation: '6deg',
    top: '22%',
  },
  {
    enter_delay: '140ms',
    enter_x: '1.75rem',
    enter_y: '-1rem',
    left: '60%',
    rotation: '-2deg',
    top: '29%',
  },
  {
    enter_delay: '200ms',
    enter_x: '-1.5rem',
    enter_y: '1.25rem',
    left: '28%',
    rotation: '-7deg',
    top: '56%',
  },
  {
    bottom: '22%',
    enter_delay: '260ms',
    enter_x: '1.25rem',
    enter_y: '1rem',
    left: '58%',
    rotation: '6deg',
  },
]

export const drift_layouts: readonly DriftLayout[] = [
  {
    blur: '8px',
    enter_delay: '45ms',
    left: '55%',
    rotation: '-8deg',
    tone: 0.3,
    top: '6%',
  },
  {
    blur: '11px',
    enter_delay: '30ms',
    right: '14%',
    rotation: '-42deg',
    tone: 0.26,
    top: '12%',
  },
  {
    blur: '9px',
    left: '-3%',
    rotation: '34deg',
    tone: 0.3,
    top: '19%',
  },
  {
    blur: '12px',
    left: '16%',
    rotation: '-18deg',
    tone: 0.23,
    top: '10%',
  },
  {
    blur: '5px',
    enter_delay: '90ms',
    left: '61%',
    rotation: '11deg',
    tone: 0.38,
    top: '19%',
  },
  {
    blur: '12px',
    enter_delay: '135ms',
    left: '52%',
    rotation: '-21deg',
    tone: 0.22,
    top: '32%',
  },
  {
    blur: '5px',
    enter_delay: '100ms',
    right: '1%',
    rotation: '-38deg',
    tone: 0.36,
    top: '45%',
  },
  {
    blur: '4px',
    enter_delay: '190ms',
    left: '63%',
    rotation: '4deg',
    tone: 0.42,
    top: '43%',
  },
  {
    blur: '3px',
    bottom: '25%',
    left: '9%',
    rotation: '-55deg',
    tone: 0.42,
  },
  {
    blur: '13px',
    bottom: '11%',
    enter_delay: '160ms',
    left: '-2%',
    rotation: '14deg',
    tone: 0.35,
  },
  {
    blur: '4px',
    bottom: '17%',
    enter_delay: '220ms',
    left: '27%',
    rotation: '61deg',
    tone: 0.4,
  },
  {
    blur: '10px',
    bottom: '26%',
    right: '-1%',
    rotation: '27deg',
    tone: 0.25,
  },
  {
    blur: '9px',
    bottom: '8%',
    right: '7%',
    rotation: '-18deg',
    tone: 0.3,
  },
  {
    blur: '8px',
    left: '19%',
    rotation: '6deg',
    tone: 0.24,
    top: '38%',
  },
  {
    blur: '6px',
    left: '29%',
    rotation: '-10deg',
    tone: 0.29,
    top: '50%',
  },
  {
    blur: '10px',
    left: '42%',
    rotation: '8deg',
    tone: 0.2,
    top: '61%',
  },
]
