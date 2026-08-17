import type { Attachment } from 'svelte/attachments'

interface ViewportThresholdOptions {
  on_change: (active: boolean) => void
  ratio: number
}

/**
 * Observes when an element's top edge reaches a viewport-relative
 * threshold. IntersectionObserver lets the browser coalesce geometry work
 * with layout, instead of forcing a measurement from a scroll listener.
 */
export function observe_viewport_threshold(
  options: ViewportThresholdOptions,
) {
  return ((element) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const threshold =
          entry.rootBounds?.bottom ?? window.innerHeight * options.ratio
        options.on_change(entry.boundingClientRect.top <= threshold)
      },
      { rootMargin: `0px 0px -${(1 - options.ratio) * 100}%` },
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      options.on_change(false)
    }
  }) satisfies Attachment<HTMLElement>
}
