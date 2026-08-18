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

interface MenuPreview {
  code: string
  detail: string
  href?: string
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

export const menu_previews: readonly MenuPreview[] = [
  {
    code: '记录 / 001',
    detail: '留存文字',
    href: '/records',
    layout: {
      enter_delay: '80ms',
      enter_x: '-2rem',
      enter_y: '1rem',
      left: '27%',
      rotation: '6deg',
      top: '22%',
    },
    title: '记录',
  },
  {
    code: '星群 / 002',
    detail: '彼此回响',
    href: '/constellations',
    layout: {
      enter_delay: '140ms',
      enter_x: '1.75rem',
      enter_y: '-1rem',
      left: '60%',
      rotation: '-2deg',
      top: '29%',
    },
    title: '星群',
  },
  {
    code: '片段 / 003',
    detail: '短暂记录',
    layout: {
      enter_delay: '200ms',
      enter_x: '-1.5rem',
      enter_y: '1.25rem',
      left: '28%',
      rotation: '-7deg',
      top: '56%',
    },
    title: '片段',
  },
]

export const drifts: readonly Drift[] = [
  {
    layout: {
      blur: '8px',
      enter_delay: '45ms',
      left: '55%',
      rotation: '-8deg',
      tone: 0.3,
      top: '6%',
    },
    text: '档案 / 023',
  },
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
    text: '坐标 / 044',
  },
  {
    layout: {
      blur: '12px',
      left: '16%',
      rotation: '-18deg',
      tone: 0.23,
      top: '10%',
    },
    text: '记录 / 001',
  },
  {
    layout: {
      blur: '5px',
      enter_delay: '90ms',
      left: '61%',
      rotation: '11deg',
      tone: 0.38,
      top: '19%',
    },
    text: '等待 / 余波',
  },
  {
    layout: {
      blur: '12px',
      enter_delay: '135ms',
      left: '52%',
      rotation: '-21deg',
      tone: 0.22,
      top: '32%',
    },
    text: '未命名 / 片段',
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
      blur: '4px',
      enter_delay: '190ms',
      left: '63%',
      rotation: '4deg',
      tone: 0.42,
      top: '43%',
    },
    text: '静默 / 044',
  },
  {
    layout: {
      blur: '3px',
      bottom: '25%',
      left: '9%',
      rotation: '-55deg',
      tone: 0.42,
    },
    text: '轨道 / 001',
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
    text: '传输 / 回传 / 001',
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
    text: '信号 / 保留',
  },
  {
    layout: {
      blur: '10px',
      bottom: '26%',
      right: '-1%',
      rotation: '27deg',
      tone: 0.25,
    },
    text: '中继 / 在线',
  },
  {
    layout: {
      blur: '9px',
      bottom: '8%',
      right: '7%',
      rotation: '-18deg',
      tone: 0.3,
    },
    text: '档案 / 留存',
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
    text: '观测 / 存档',
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
    text: '观测面 / 01',
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
    text: 'CAELYRETH / 在轨',
  },
]

export const theme_slip_layout = {
  bottom: '20%',
  enter_delay: '240ms',
  enter_x: '1.5rem',
  enter_y: '1rem',
  right: '30%',
  rotation: '10deg',
} as const satisfies Position & EnteringLayout & { rotation: string }
