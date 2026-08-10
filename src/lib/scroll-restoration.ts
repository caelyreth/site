export type ScrollRestorationOptions = Readonly<{
  storage_key: string
  progress_property: `--${string}`
}>

export const observatory_scroll_restoration = {
  storage_key: 'caelyreth:observatory-scroll-y',
  progress_property: '--observatory-initial-progress',
} as const satisfies ScrollRestorationOptions

function is_restoration_navigation() {
  const navigation = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  return (
    navigation?.type === 'reload' || navigation?.type === 'back_forward'
  )
}

function stored_scroll_position({ storage_key }: ScrollRestorationOptions) {
  try {
    const saved_scroll = sessionStorage.getItem(storage_key)
    const saved_scroll_y =
      saved_scroll === null ? Number.NaN : Number(saved_scroll)
    return Number.isFinite(saved_scroll_y)
      ? Math.max(0, saved_scroll_y)
      : undefined
  } catch {
    return
  }
}

export function persist_scroll_position({
  storage_key,
}: ScrollRestorationOptions) {
  try {
    sessionStorage.setItem(storage_key, String(window.scrollY))
  } catch {
    // The browser may disallow session storage; native restoration still applies.
  }
}

export function restore_scroll_position(options: ScrollRestorationOptions) {
  if (!is_restoration_navigation()) return
  if (window.scrollY !== 0) return

  const saved_scroll_y = stored_scroll_position(options)
  if (!saved_scroll_y) return

  window.scrollTo(0, saved_scroll_y)
}

function serialize_inline_options(options: ScrollRestorationOptions) {
  return JSON.stringify(options).replaceAll('<', '\\u003c')
}

export function scroll_progress_bootstrap(
  options: ScrollRestorationOptions,
) {
  const serialized_options = serialize_inline_options(options)

  return `<script>(() => {
  const options = ${serialized_options}
  const navigation_entry = performance.getEntriesByType('navigation')[0]
  const navigation_type = navigation_entry?.type
  if (navigation_type !== 'reload' && navigation_type !== 'back_forward') return

  let saved_scroll_y = 0
  try {
    const saved_scroll = sessionStorage.getItem(options.storage_key)
    if (saved_scroll !== null) {
      const parsed_scroll_y = Number(saved_scroll)
      if (Number.isFinite(parsed_scroll_y)) {
        saved_scroll_y = Math.max(0, parsed_scroll_y)
      }
    }
  } catch {}

  const restored_scroll_y = Math.max(window.scrollY, saved_scroll_y)
  if (restored_scroll_y === 0) return

  const initial_progress = Math.min(
    1,
    restored_scroll_y / Math.max(window.innerHeight, 1),
  )
  document.documentElement.style.setProperty(
    options.progress_property,
    String(initial_progress),
  )
})()</script>`
}
