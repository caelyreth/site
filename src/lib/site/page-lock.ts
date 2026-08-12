export interface PageScrollLockRoot {
  classList: Pick<DOMTokenList, 'add' | 'remove'>
  clientWidth: number
  style: Pick<CSSStyleDeclaration, 'paddingRight'>
}

export interface PageScrollLockViewport {
  innerWidth: number
}

interface LockState {
  count: number
  padding_right: string
}

const scroll_lock_class = 'page-scroll-locked'
const active_locks = new WeakMap<PageScrollLockRoot, LockState>()

/**
 * Locks document scrolling while preserving the layout width behind an
 * overlay.
 */
export function lock_page_scroll(
  root: PageScrollLockRoot = document.documentElement,
  viewport: PageScrollLockViewport = window,
) {
  let state = active_locks.get(root)
  if (!state) {
    state = {
      count: 0,
      padding_right: root.style.paddingRight,
    }
    const scrollbar_width = viewport.innerWidth - root.clientWidth
    if (scrollbar_width > 0) {
      root.style.paddingRight = `${scrollbar_width}px`
    }
    root.classList.add(scroll_lock_class)
    active_locks.set(root, state)
  }
  state.count += 1

  let released = false
  return () => {
    if (released) return
    released = true
    state.count -= 1
    if (state.count > 0) return
    root.classList.remove(scroll_lock_class)
    root.style.paddingRight = state.padding_right
    active_locks.delete(root)
  }
}
