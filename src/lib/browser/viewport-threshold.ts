import type { Attachment } from 'svelte/attachments'

/**
 * Observes when an element's top edge reaches a viewport-relative
 * threshold. IntersectionObserver lets the browser coalesce geometry work
 * with layout, instead of forcing a measurement from a scroll listener.
 */
export function observe_viewport_threshold(
  element_id: string,
  ratio: number,
  on_change: (active: boolean) => void,
) {
  return (() => {
    const update = () => {
      const element = document.getElementById(element_id)
      on_change(
        element !== null &&
          element.getBoundingClientRect().top <= window.innerHeight * ratio,
      )
    }

    if (typeof IntersectionObserver === 'undefined') {
      window.addEventListener('scroll', update, { passive: true })
      window.addEventListener('resize', update)
      update()

      return () => {
        window.removeEventListener('scroll', update)
        window.removeEventListener('resize', update)
      }
    }

    let observed_element: HTMLElement | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const threshold =
          entry.rootBounds?.bottom ?? window.innerHeight * ratio
        on_change(entry.boundingClientRect.top <= threshold)
      },
      { rootMargin: `0px 0px -${(1 - ratio) * 100}%` },
    )
    const observe_target = () => {
      const next_element = document.getElementById(element_id) ?? undefined
      if (next_element === observed_element) return

      observer.disconnect()
      observed_element = next_element
      if (observed_element) observer.observe(observed_element)
      else on_change(false)
    }
    const mutation_observer = new MutationObserver(observe_target)

    mutation_observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    observe_target()

    return () => {
      mutation_observer.disconnect()
      observer.disconnect()
    }
  }) satisfies Attachment<HTMLElement>
}
