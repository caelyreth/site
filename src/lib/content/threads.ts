export const thread_id_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function thread_label(thread: string) {
  return thread
    .split('-')
    .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export interface ThreadSummary<Entry> {
  entries: Entry[]
  id: string
}
