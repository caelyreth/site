import type { Attachment } from 'svelte/attachments'

const scroll_timeline_feature = 'animation-timeline: scroll(root block)'

export interface ScrollProgressOptions {
  fallback_only?: boolean
  get_progress: (element: HTMLElement) => number
  observed_elements?: (element: HTMLElement) => Iterable<HTMLElement>
  on_progress: (progress: number) => void
}

export function supports_scroll_timelines() {
  return typeof CSS !== 'undefined' && CSS.supports(scroll_timeline_feature)
}

function clamp_progress(progress: number) {
  if (!Number.isFinite(progress)) return 0
  return Math.min(1, Math.max(0, progress))
}

function create_frame_scheduler(update: () => void) {
  let frame: number | undefined

  const cancel = () => {
    if (frame === undefined) return
    cancelAnimationFrame(frame)
  }
  const schedule = () => {
    if (frame !== undefined) return
    frame = requestAnimationFrame(() => {
      frame = undefined
      update()
    })
  }

  return {
    cancel,
    schedule,
  }
}

function observe_resize_targets(
  resize_observer: ResizeObserver,
  element: HTMLElement,
  observed_elements: ScrollProgressOptions['observed_elements'],
) {
  resize_observer.observe(element)
  for (const observed_element of observed_elements?.(element) ?? []) {
    resize_observer.observe(observed_element)
  }
}

/**
 * Observes visual scroll progress without taking ownership of page
 * scrolling.
 */
export function scroll_progress(
  options: ScrollProgressOptions,
): Attachment<HTMLElement> {
  return (element) => {
    if (options.fallback_only && supports_scroll_timelines()) return

    const update = () => {
      options.on_progress(clamp_progress(options.get_progress(element)))
    }
    const scheduler = create_frame_scheduler(update)
    const resize_observer = new ResizeObserver(scheduler.schedule)

    observe_resize_targets(
      resize_observer,
      element,
      options.observed_elements,
    )
    window.addEventListener('scroll', scheduler.schedule, { passive: true })
    update()

    return () => {
      scheduler.cancel()
      resize_observer.disconnect()
      window.removeEventListener('scroll', scheduler.schedule)
    }
  }
}
