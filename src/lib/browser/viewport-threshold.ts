/**
 * Returns whether an element's top edge has reached a viewport-relative
 * threshold. The DOM lookup stays here so controls can express only their
 * state policy.
 */
export function reaches_viewport_threshold(
  element_id: string,
  ratio: number,
) {
  const element = document.getElementById(element_id)
  return (
    element !== null &&
    element.getBoundingClientRect().top <= window.innerHeight * ratio
  )
}
