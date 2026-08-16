import type { Attachment } from 'svelte/attachments'

export interface ScrollActivityOptions {
  idle_delay?: number
  on_activity?: (scrolling: boolean) => void
  on_scroll?: () => void
}

/**
 * Observes page scroll activity without taking ownership of scrolling.
 */
export function scroll_activity(
  options: ScrollActivityOptions,
): Attachment<HTMLElement> {
  return () => {
    let idle_timer: ReturnType<typeof setTimeout> | undefined
    const idle_delay = options.idle_delay ?? 180

    const settle = () => {
      idle_timer = undefined
      options.on_activity?.(false)
    }
    const update = () => {
      options.on_scroll?.()
      options.on_activity?.(true)
      clearTimeout(idle_timer)
      idle_timer = setTimeout(settle, idle_delay)
    }
    const refresh = () => {
      options.on_scroll?.()
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', refresh)
    refresh()

    return () => {
      clearTimeout(idle_timer)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', refresh)
      options.on_activity?.(false)
    }
  }
}
