import type { HeadingEntry } from '$lib/content/headings'

export function observe_active_heading(
  entries: readonly HeadingEntry[],
  on_active: (index: number) => void,
) {
  const targets = entries.flatMap((entry, index) => {
    const heading = document.getElementById(entry.id)
    return heading ? [{ heading, index }] : []
  })
  const indices = new Map(
    targets.map(({ heading, index }) => [heading, index]),
  )
  const visible = new Set<number>()
  const observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        const index = indices.get(record.target as HTMLElement)
        if (index === undefined) continue
        if (record.isIntersecting) visible.add(index)
        else visible.delete(index)
      }

      const current = Math.max(...visible)
      if (Number.isFinite(current)) on_active(current)
    },
    { rootMargin: '-18% 0px -68% 0px' },
  )

  for (const { heading } of targets) observer.observe(heading)

  const threshold = window.innerHeight * 0.3
  const initial = targets.reduce(
    (index, { heading }) =>
      heading.getBoundingClientRect().top <= threshold
        ? (indices.get(heading) ?? index)
        : index,
    0,
  )
  on_active(initial)

  return () => {
    observer.disconnect()
  }
}
