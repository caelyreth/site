import type { EntryLink } from '$lib/content/entries'

export function next_signal_entry(
  entries: readonly EntryLink[],
  displayed: ReadonlySet<string>,
) {
  const choices = entries.filter((entry) => !displayed.has(entry.id))
  return choices[Math.floor(Math.random() * choices.length)]
}
