import type { Attachment } from 'svelte/attachments'

import { compact_viewport_query } from './viewport'

export interface StageSurfaceDeferralOptions {
  defer_after_mobile_cover?: boolean
  on_change: (deferred: boolean) => void
  settle_delay?: number
  visible_progress?: number
  hidden_progress?: number
}

function stage_element(capture: HTMLElement) {
  const element = capture.firstElementChild
  return element instanceof HTMLElement ? element : undefined
}

export function stage_scroll_span(capture: HTMLElement) {
  const stage = stage_element(capture)
  if (!stage) return 0
  return Math.max(capture.offsetHeight - stage.offsetHeight, 1)
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
 * Defers an expensive stage surface once it is no longer visible. Desktop
 * stages defer after their fade; mobile overlay stages defer after the
 * paper has covered the scene.
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
    let mobile_cover_at = 0
    let stage_start = 0
    let surface_exit = 0

    const compact_media_query = window.matchMedia(compact_viewport_query)

    const set_deferred = (next_deferred: boolean) => {
      if (deferred === next_deferred) return
      deferred = next_deferred
      options.on_change(deferred)
    }
    const refresh_stage_bounds = () => {
      stage_start = window.scrollY + capture.getBoundingClientRect().top
      const span = stage_scroll_span(capture)
      mobile_cover_at = stage_start + span
      surface_exit = stage_start + span * hidden_progress
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
    const update_desktop_deferral = (scroll_top: number) => {
      if (scroll_top <= stage_start + 2) {
        set_deferred(false)
      } else if (scroll_top >= surface_exit) {
        set_deferred(true)
      }
    }
    const update_mobile_deferral = (scroll_top: number) => {
      if (
        !options.defer_after_mobile_cover ||
        !compact_media_query.matches
      ) {
        return false
      }

      set_deferred(scroll_top > mobile_cover_at)
      cancel_settle()
      return true
    }
    const update_return_deferral = (returning: boolean) => {
      if (deferred && returning) {
        schedule_settle()
      } else {
        cancel_settle()
      }
    }
    const update = () => {
      const scroll_top = window.scrollY
      if (update_mobile_deferral(scroll_top)) {
        previous_scroll_top = scroll_top
        return
      }

      const returning = scroll_top < previous_scroll_top
      update_desktop_deferral(scroll_top)
      previous_scroll_top = scroll_top
      update_return_deferral(returning)
    }

    const handle_resize = () => {
      refresh_stage_bounds()
      update()
    }

    refresh_stage_bounds()
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', handle_resize)

    return () => {
      cancel_settle()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', handle_resize)
    }
  }
}
