/**
 * Bypass the document's smooth-scroll preference for explicit navigation
 * actions. Route changes must not animate across an outgoing page.
 */
export function scroll_to_top() {
  window.scrollTo({ left: 0, top: 0, behavior: 'instant' })
}
