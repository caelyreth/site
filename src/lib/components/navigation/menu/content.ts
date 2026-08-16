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

export interface MenuItem {
  code: string
  detail: string
  id: 'directory' | 'observation' | 'transmission'
  layout: Position &
    EnteringLayout & {
      rotation: string
    }
  title: string
}

export interface Drift {
  layout: Position &
    Partial<EnteringLayout> & {
      blur: string
      compact?: Position
      rotation: string
      tone: number
    }
  text: string
}

export const menu_items: readonly MenuItem[] = [
  {
    code: 'OBS / 001',
    detail: 'Window retained',
    id: 'observation',
    layout: {
      enter_delay: '80ms',
      enter_x: '-2rem',
      enter_y: '1rem',
      left: '25%',
      rotation: '-13deg',
      top: '22%',
    },
    title: 'Observation',
  },
  {
    code: 'DIR / 044',
    detail: 'Archive pending',
    id: 'directory',
    layout: {
      enter_delay: '140ms',
      enter_x: '1.75rem',
      enter_y: '-1rem',
      left: '57%',
      rotation: '11deg',
      top: '29%',
    },
    title: 'Directory',
  },
  {
    code: 'SIG / 007',
    detail: 'Carrier available',
    id: 'transmission',
    layout: {
      enter_delay: '200ms',
      enter_x: '-1.5rem',
      enter_y: '1.25rem',
      left: '34%',
      rotation: '-7deg',
      top: '56%',
    },
    title: 'Transmission',
  },
]

export const drifts: readonly Drift[] = [
  {
    layout: {
      blur: '11px',
      enter_delay: '30ms',
      right: '14%',
      rotation: '-42deg',
      tone: 0.26,
      top: '12%',
    },
    text: 'RBK // 044',
  },
  {
    layout: {
      blur: '9px',
      left: '-3%',
      rotation: '34deg',
      tone: 0.3,
      top: '19%',
    },
    text: 'FIELD / 044',
  },
  {
    layout: {
      blur: '12px',
      left: '16%',
      rotation: '-18deg',
      tone: 0.23,
      top: '10%',
    },
    text: 'FIELD NOTES / 001',
  },
  {
    layout: {
      blur: '5px',
      enter_delay: '100ms',
      right: '1%',
      rotation: '-38deg',
      tone: 0.36,
      top: '45%',
    },
    text: 'CAELYRETH',
  },
  {
    layout: {
      blur: '3px',
      bottom: '25%',
      left: '9%',
      rotation: '-55deg',
      tone: 0.42,
    },
    text: 'ORBIT / 001',
  },
  {
    layout: {
      blur: '13px',
      bottom: '11%',
      enter_delay: '160ms',
      left: '-2%',
      rotation: '14deg',
      tone: 0.35,
    },
    text: 'TRANSMISSION / RETURN / 001',
  },
  {
    layout: {
      blur: '4px',
      bottom: '17%',
      enter_delay: '220ms',
      left: '27%',
      rotation: '61deg',
      tone: 0.4,
    },
    text: 'SIGNAL / HOLD',
  },
  {
    layout: {
      blur: '10px',
      bottom: '26%',
      right: '-1%',
      rotation: '27deg',
      tone: 0.25,
    },
    text: 'RELAY / ACTIVE',
  },
  {
    layout: {
      blur: '9px',
      bottom: '8%',
      right: '7%',
      rotation: '-18deg',
      tone: 0.3,
    },
    text: 'ARCHIVE / HELD',
  },
  {
    layout: {
      blur: '8px',
      compact: { left: '-11%', top: '35%' },
      left: '19%',
      rotation: '6deg',
      tone: 0.24,
      top: '38%',
    },
    text: 'OBSERVATION / RETAINED',
  },
  {
    layout: {
      blur: '6px',
      compact: { left: '8%', top: '50%' },
      left: '29%',
      rotation: '-10deg',
      tone: 0.29,
      top: '50%',
    },
    text: 'VIEWING PLANE / 01',
  },
  {
    layout: {
      blur: '10px',
      compact: { left: '0', top: '64%' },
      left: '42%',
      rotation: '8deg',
      tone: 0.2,
      top: '61%',
    },
    text: 'CAELYRETH / IN ORBIT',
  },
]

export const theme_slip_layout = {
  bottom: '15%',
  enter_delay: '240ms',
  enter_x: '1.5rem',
  enter_y: '1rem',
  right: '22%',
  rotation: '16deg',
} as const satisfies Position & EnteringLayout & { rotation: string }
