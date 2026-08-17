const scroll_lock_class = 'page-scroll-locked'
const active_locks = new WeakMap<HTMLElement, number>()

export function lock_page_scroll(root = document.documentElement) {
  let count = active_locks.get(root) ?? 0
  if (count === 0) {
    root.classList.add(scroll_lock_class)
  }
  count += 1
  active_locks.set(root, count)

  let released = false
  return () => {
    if (released) return
    released = true
    const next_count = (active_locks.get(root) ?? 1) - 1
    if (next_count > 0) {
      active_locks.set(root, next_count)
      return
    }
    root.classList.remove(scroll_lock_class)
    active_locks.delete(root)
  }
}
