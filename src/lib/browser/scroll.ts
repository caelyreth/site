export function scroll_to_top() {
  window.scrollTo({ left: 0, top: 0, behavior: 'auto' })
}

/**
 * Resolves once the browser has reached the document top.
 */
export function scroll_to_top_and_wait() {
  scroll_to_top()
  if (window.scrollY <= 1) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const check_position = () => {
      if (window.scrollY <= 1) {
        resolve()
        return
      }

      requestAnimationFrame(check_position)
    }

    requestAnimationFrame(check_position)
  })
}
