import type { Attachment } from 'svelte/attachments'

const compact_stage_query = '(max-width: 40rem)'

export interface StageSurfaceDeferralOptions {
  on_change: (deferred: boolean) => void
  settle_delay?: number
  visible_progress?: number
  hidden_progress?: number
}

function stage_element(capture: HTMLElement) {
  const element = capture.firstElementChild
  return element instanceof HTMLElement ? element : undefined
}

function compact_transition_span(stage: HTMLElement) {
  const root_font_size = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  )
  const minimum = 8 * root_font_size
  const maximum = 12 * root_font_size
  return Math.min(maximum, Math.max(minimum, stage.offsetHeight * 0.24))
}

export function stage_scroll_span(capture: HTMLElement) {
  const stage = stage_element(capture)
  if (!stage) return 0
  return window.matchMedia(compact_stage_query).matches
    ? compact_transition_span(stage)
    : Math.max(capture.offsetHeight - stage.offsetHeight, 1)
}

export function stage_scroll_progress(capture: HTMLElement) {
  const travel = stage_scroll_span(capture)
  if (!travel) return 0
  return Math.min(
    1,
    Math.max(0, -capture.getBoundingClientRect().top / travel),
  )
}

export function stage_scroll_elements(capture: HTMLElement) {
  const stage = stage_element(capture)
  return stage ? [stage] : []
}

/**
 * Defers an expensive stage surface once its visual fade has completed. It
 * restores only after a return scroll settles or the stage reaches its open
 * state, preventing a renderer restart during the expensive transition.
 */
export function defer_stage_surface_on_return(
  options: StageSurfaceDeferralOptions,
): Attachment<HTMLElement> {
  const settle_delay = options.settle_delay ?? 360
  const hidden_progress = options.hidden_progress ?? 0.84
  const visible_progress = options.visible_progress ?? 0.8

  return (capture) => {
    let deferred = false
    let settle_timer: ReturnType<typeof setTimeout> | undefined
    let previous_scroll_top = window.scrollY
    let stage_start = 0
    let surface_exit = 0

    const set_deferred = (next_deferred: boolean) => {
      if (deferred === next_deferred) return
      deferred = next_deferred
      options.on_change(deferred)
    }
    const refresh_stage_bounds = () => {
      stage_start = window.scrollY + capture.getBoundingClientRect().top
      surface_exit =
        stage_start + stage_scroll_span(capture) * hidden_progress
      previous_scroll_top = window.scrollY
    }
    const cancel_settle = () => {
      if (settle_timer === undefined) return
      clearTimeout(settle_timer)
      settle_timer = undefined
    }
    const settle = () => {
      settle_timer = undefined
      if (stage_scroll_progress(capture) < visible_progress) {
        set_deferred(false)
      }
    }
    const schedule_settle = () => {
      cancel_settle()
      settle_timer = setTimeout(settle, settle_delay)
    }
    const update = () => {
      const scroll_top = window.scrollY
      const returning = scroll_top < previous_scroll_top
      if (scroll_top <= stage_start + 2) {
        set_deferred(false)
      } else if (scroll_top >= surface_exit) {
        set_deferred(true)
      }
      previous_scroll_top = scroll_top
      if (deferred && returning) {
        schedule_settle()
      } else {
        cancel_settle()
      }
    }

    refresh_stage_bounds()
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', refresh_stage_bounds)

    return () => {
      cancel_settle()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', refresh_stage_bounds)
    }
  }
}
